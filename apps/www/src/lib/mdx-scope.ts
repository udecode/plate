/**
 * Type names in MDX API docs (e.g. { x: boolean }) are parsed as JS expressions.
 * Only valid param names can be passed to useMDXComponent (void/null/true/false break new Function).
 * void is injected to globalThis only; null/undefined/true/false already exist in JS.
 */
const SAFE_SCOPE = {
  boolean: 'boolean',
  string: 'string',
  number: 'number',
  any: 'any',
} as const;

if (typeof globalThis !== 'undefined') {
  const g = globalThis as unknown as Record<string, string>;
  Object.assign(g, SAFE_SCOPE);
  g.void = 'void'; // reserved word, can't be Function param
}

export const MDX_SCOPE_FOR_HOOK = SAFE_SCOPE;
