# Input Rule Factory Entrypoint Cleanup

## Goal

Remove the remaining handwritten rule entrypoints in `@platejs/math` and
`@platejs/link` so `createRuleFactory(...)` stays the only public constructor
authority for package-owned input rules.

## Scope

- `packages/math/src/lib/MathRules.ts`
- `packages/link/src/lib/LinkRules.ts`
- affected tests and docs only if the public surface changes

## Constraints

- Keep current user-facing ergonomics where possible.
- Do not reintroduce manual option wrapper types that drift from factory
  runtime fields like `enabled` and `priority`.
- Preserve feature ownership. Core should not absorb link/math semantics.

## Plan

1. Refactor `MathRules` to remove the handwritten union wrapper.
2. Refactor `LinkRules.autolink` to remove the handwritten variant wrapper.
3. Update affected tests/docs if the public API shape changes.
4. Verify with build, typecheck, focused tests, and lint.

## Relevant Learnings

- `docs/solutions/best-practices/input-rules-should-register-explicit-rule-instances-while-packages-export-markdown-families.md`
- `docs/solutions/best-practices/input-rule-context-should-provide-lazy-snapshot-getters.md`
- `docs/solutions/best-practices/block-fence-input-rules-should-split-fence-matching-from-feature-apply.md`
