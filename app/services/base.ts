// services/base.ts
// Base-aware URL builder for assets (works in dev and in /abundance-alchemy/).
export const BASE = (import.meta as any)?.env?.BASE_URL || "/";

export function href(path: string): string {
  if (!path) return BASE;
  return `${BASE}${String(path).replace(/^\/+/, "")}`;
}
