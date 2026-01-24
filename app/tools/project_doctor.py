# tools/project_doctor.py
# Purpose: Detect project type(s), run install/build/lint/test/typecheck, and emit a concise triage report.

from __future__ import annotations
import json, os, re, subprocess, sys, shutil, pathlib, platform
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple

ROOT = pathlib.Path(__file__).resolve().parents[1]
RUNS_ON = platform.platform()

@dataclass
class Cmd:
    name: str
    args: List[str]
    cwd: pathlib.Path = ROOT
    env: Dict[str, str] = field(default_factory=lambda: os.environ.copy())
    optional: bool = False

@dataclass
class SectionResult:
    title: str
    ok: bool
    logs: str = ""
    suggestion: str = ""

@dataclass
class ProjectProfile:
    label: str
    detectors: List[Tuple[str, re.Pattern]]
    install_cmds: List[Cmd]
    verify_cmds: List[Cmd]

def exists(*paths: str) -> bool:
    return any((ROOT / p).exists() for p in paths)

def read_json(path: pathlib.Path) -> Optional[dict]:
    try:
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None
    return None

def run(cmd: Cmd) -> Tuple[bool, str]:
    try:
        completed = subprocess.run(
            cmd.args,
            cwd=str(cmd.cwd),
            env=cmd.env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            check=False,
        )
        ok = completed.returncode == 0
        return ok, completed.stdout
    except FileNotFoundError as e:
        if cmd.optional:
            return True, f"SKIPPED (optional, missing binary): {e}"
        return False, f"Missing binary: {e}"
    except Exception as e:
        return False, f"Execution error: {e}"

def pnpm_or_yarn_or_npm() -> List[str]:
    for b in ("pnpm", "yarn", "npm"):
        if shutil.which(b):
            return [b]
    return ["npm"]

def has_script(pkg: dict, name: str) -> bool:
    return bool(pkg and "scripts" in pkg and name in pkg["scripts"])

def node_profile(label: str, pkg_path: pathlib.Path) -> ProjectProfile:
    pkg = read_json(pkg_path) or {}
    runner = pnpm_or_yarn_or_npm()[0]
    install = [Cmd("install", [runner, "install"])]
    verify: List[Cmd] = []
    if has_script(pkg, "build"): verify.append(Cmd("build", [runner, "run", "build"]))
    if has_script(pkg, "lint"): verify.append(Cmd("lint", [runner, "run", "lint"], optional=True))
    if has_script(pkg, "typecheck"): verify.append(Cmd("typecheck", [runner, "run", "typecheck"], optional=True))
    if has_script(pkg, "test"): verify.append(Cmd("test", [runner, "run", "test", "--", "--watch=false"], optional=True))
    return ProjectProfile(
        label=label,
        detectors=[("package.json", re.compile(r".*"))],
        install_cmds=install,
        verify_cmds=verify or [Cmd("noop", [runner, "--version"])]
    )

def python_profile(label: str, is_poetry: bool, req_path: Optional[pathlib.Path]) -> ProjectProfile:
    if is_poetry:
        install = [Cmd("poetry_install", ["poetry", "install"])]
        verify = [
            Cmd("pytest", ["poetry", "run", "pytest", "-q"], optional=True),
            Cmd("ruff", ["poetry", "run", "ruff", "check", "."], optional=True),
            Cmd("mypy", ["poetry", "run", "mypy", "."], optional=True),
        ]
    else:
        pip = shutil.which("pip") or "pip"
        install = [Cmd("pip_install", [pip, "install", "-r", str(req_path)])] if req_path else []
        verify = [
            Cmd("pytest", ["pytest", "-q"], optional=True),
            Cmd("ruff", ["ruff", "check", "."], optional=True),
            Cmd("mypy", ["mypy", "."], optional=True),
        ]
    return ProjectProfile(
        label=label,
        detectors=[("Python", re.compile(r".*"))],
        install_cmds=install,
        verify_cmds=verify or [Cmd("python", [sys.executable, "--version"])]
    )

def django_detect() -> bool:
    return exists("manage.py") and any((ROOT / d).exists() for d in ["settings.py", "project/settings.py", "app/settings.py"])

def fastapi_detect() -> bool:
    return any("FastAPI(" in (p.read_text(encoding="utf-8", errors="ignore") if p.is_file() else "")
               for p in ROOT.rglob("*.py"))

def flask_detect() -> bool:
    return any(re.search(r"Flask\(", p.read_text(encoding="utf-8", errors="ignore")) for p in ROOT.rglob("*.py"))

def next_detect(pkg: dict) -> bool:
    deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
    return "next" in deps

def expo_detect(pkg: dict) -> bool:
    deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
    return "expo" in deps

def vite_detect(pkg: dict) -> bool:
    deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
    return "vite" in deps

def monorepo_detect() -> bool:
    return any((ROOT / f).exists() for f in ("pnpm-workspace.yaml", "yarn.workspaces", "turbo.json"))

def find_package_jsons() -> List[pathlib.Path]:
    results = []
    for p in ROOT.rglob("package.json"):
        if "node_modules" in p.parts:
            continue
        results.append(p)
    results.sort(key=lambda p: (0 if p.parent == ROOT else 1, str(p)))
    return results

def find_python_reqs() -> Tuple[Optional[pathlib.Path], bool]:
    poetry = (ROOT / "pyproject.toml").exists() and "poetry" in (ROOT / "pyproject.toml").read_text(encoding="utf-8", errors="ignore")
    req = None
    for name in ("requirements.txt", "requirements-dev.txt"):
        cand = ROOT / name
        if cand.exists():
            req = cand; break
    return req, poetry

def collect_profiles() -> List[ProjectProfile]:
    profiles: List[ProjectProfile] = []
    pkg_files = find_package_jsons()
    if pkg_files:
        for p in pkg_files:
            pkg = read_json(p) or {}
            label = "Next.js" if next_detect(pkg) else "Expo" if expo_detect(pkg) else "Vite/React" if vite_detect(pkg) else "Node.js"
            profiles.append(node_profile(label, p))
    req, poetry = find_python_reqs()
    if req or poetry or django_detect() or fastapi_detect() or flask_detect():
        label = "Django" if django_detect() else "FastAPI" if fastapi_detect() else "Flask" if flask_detect() else "Python"
        profiles.append(python_profile(label, poetry, req))
    return profiles

def header(title: str) -> str:
    return f"\n=== {title} ===\n"

def main() -> int:
    print(header("Project Doctor"))
    print(f"root: {ROOT}")
    print(f"runs_on: {RUNS_ON}")

    profiles = collect_profiles()
    if not profiles:
        print("No supported stack detected yet. Provide lockfiles or config.")
        return 2

    overall_ok = True
    report: List[SectionResult] = []

    for prof in profiles:
        print(header(f"Profile: {prof.label}"))
        for cmd in prof.install_cmds:
            ok, logs = run(cmd)
            report.append(SectionResult(title=f"{prof.label} › install ({' '.join(cmd.args)})", ok=ok, logs=logs))
            overall_ok &= ok
        for cmd in prof.verify_cmds:
            ok, logs = run(cmd)
            suggestion = ""
            if not ok:
                if "Cannot find module" in logs or "Module not found" in logs:
                    suggestion = "Check import path aliases/tsconfig.paths or missing dep; try fresh install and verify tsconfig/webpack/vite config."
                elif "ERR_OSSL" in logs or "digital envelope routines" in logs:
                    suggestion = "Node OpenSSL issue; pin Node LTS or set NODE_OPTIONS=--openssl-legacy-provider for Webpack 4 era builds."
                elif re.search(r"peer dep|peerDependency", logs, re.I):
                    suggestion = "Resolve peer deps by aligning versions or add explicit install with compatible ranges."
                elif "SyntaxError: Cannot use import statement outside a module" in logs:
                    suggestion = "ESM/CJS mismatch; set type: module or adjust tsconfig/module/transform."
            report.append(SectionResult(title=f"{prof.label} › {' '.join(cmd.args)}", ok=ok, logs=logs, suggestion=suggestion))
            overall_ok &= ok

    print(header("Summary"))
    for r in report:
        status = "OK" if r.ok else "FAIL"
        print(f"- [{status}] {r.title}")
        if r.suggestion:
            print(f"  ▸ Hint: {r.suggestion}")

    print(header("Next Steps"))
    if not overall_ok:
        print("Fix failures above. Commit minimal changes; rerun doctor until GREEN.")
    else:
        print("All checks passed. Proceed to perf/a11y audits and release pipeline.")

    try:
        (ROOT / "doctor-report.json").write_text(
            json.dumps([r.__dict__ for r in report], indent=2),
            encoding="utf-8"
        )
        print("Wrote doctor-report.json")
    except Exception as e:
        print(f"Could not write report: {e}")

    return 0 if overall_ok else 1

if __name__ == "__main__":
    sys.exit(main())
