# 2026-04-13 Input Rule Context Lazy Getters

## Goal

Reduce repeated `resolve()` boilerplate in input rules by extending the core
input-rule context with lazy cached selection/block getters, then migrate the
obvious block-start callers onto that API.

## Scope

1. Extend `packages/core` input-rule context types
2. Build lazy cached snapshot-based getters in `InputRulesPlugin`
3. Add focused core tests for the new context behavior
4. Migrate the obvious block-start rule families:
   - basic blockquote / heading / hr
   - code fence
   - list / list-classic
   - block math
   - paste autolink text-before-selection
5. Verify touched packages and the shipped app surface

## Constraints

- Keep `defineInputRule` thin
- Do not reintroduce a `createInputRule` DSL
- Prefer generic shared context over feature-specific helpers
- Keep getter semantics tied to the input-event snapshot, not mutable post-edit
  state

## Result

- Added lazy cached snapshot getters to input-rule contexts in core:
  - `getBlockEntry`
  - `getBlockStartRange`
  - `getBlockStartText`
  - `getTextBeforeSelection`
  - `getCharBefore`
  - `getCharAfter`
- Kept `defineInputRule` typed for authoring with target-specific overloads.
- Widened runtime storage/container typing instead of forcing the registry to
  preserve exact payload generics.
- Migrated the obvious block-start callers in:
  - `packages/basic-nodes`
  - `packages/code-block`
  - `packages/list`
  - `packages/list-classic`
  - `packages/math`
  - `packages/link`
- Added a new learning doc:
  - `docs/solutions/best-practices/input-rule-context-should-provide-lazy-snapshot-getters.md`

## Verification

- `bun test packages/core/src/react/utils/inputRules.spec.tsx packages/basic-nodes/src/lib/BaseBlockquoteInputRules.spec.tsx packages/basic-nodes/src/lib/BaseHeadingInputRules.spec.tsx packages/code-block/src/lib/BaseCodeBlockPlugin.inputRules.spec.tsx packages/list/src/lib/inputRules.spec.tsx packages/list-classic/src/lib/BaseListInputRules.spec.tsx packages/math/src/lib/inputRules.spec.tsx packages/link/src/lib/internal/inputRules.spec.tsx`
  - `33 pass, 0 fail`
- `pnpm turbo build --filter=./packages/core --filter=./packages/basic-nodes --filter=./packages/code-block --filter=./packages/link --filter=./packages/list --filter=./packages/list-classic --filter=./packages/math --filter=./apps/www`
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/basic-nodes --filter=./packages/code-block --filter=./packages/link --filter=./packages/list --filter=./packages/list-classic --filter=./packages/math --filter=./apps/www`
- `pnpm lint:fix`
