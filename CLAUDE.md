# Claude Project Context

## Stack & Languages

- **Primary:** JavaScript / TypeScript, PHP
- **Frontend:** React, Next.js
- **Backend:** Node.js, Express, PHP
- **DevOps:** Shell scripts, CI/CD tooling

## Code Style Preferences

- **Paradigm:** Functional style — prefer pure functions, immutability, and composition over classes where practical
- **Comments:** Minimal — code should be self-documenting; only comment non-obvious logic or intent
- **TypeScript:** Use strict typing; avoid `any`
- **PHP:** Follow PSR-12 conventions

## JavaScript / TypeScript Guidelines

- Prefer `const` over `let`; avoid `var`
- Use arrow functions for callbacks and short functions
- Prefer `async/await` over `.then()` chains
- Destructure objects and arrays where it improves clarity
- Use optional chaining (`?.`) and nullish coalescing (`??`) over verbose null checks
- Keep functions small and single-purpose

## React / Next.js Guidelines

- Functional components only — no class components
- Prefer hooks over HOCs
- Co-locate component logic, styles, and tests where possible
- Use Next.js App Router conventions unless project uses Pages Router

## Node.js / Express Guidelines

- Structure routes, controllers, and services in separate layers
- Use middleware for cross-cutting concerns (auth, logging, error handling)
- Prefer named exports over default exports for utilities and services

## PHP Guidelines

- Use modern PHP (8.x features welcome — enums, match, named args, fibers)
- Prefer typed properties and return types
- Avoid procedural PHP; use classes/namespaces for organization

## General Preferences

- Prefer explicit over implicit
- Avoid over-engineering — solve the problem at hand
- When refactoring, preserve existing behavior unless told otherwise
- When suggesting changes, show diffs or targeted edits rather than rewriting entire files
- Flag potential security issues (XSS, injection, auth) proactively

## Sacred Immutable Elements

These design elements are **permanent** and must **never** be changed or removed unless explicitly targeted:

1. **Button Sound** - The sacred bell plays on all interactive elements (buttons, links, controls)
2. **Breathing Orb** - The living visual anchor used in practice sessions

When modifying any component, ensure both elements are preserved by default. New components should also implement the button sound pattern.
