# 2026-04-13 Any Cleanup

## Goal

Update `plate-plugin-creator.mdc` to forbid `any` in source files except
non-type tests, then remove the current `any`-typed leaks from the unstaged
source files in this worktree.

## Scope

1. Update `.agents/rules/plate-plugin-creator.mdc`
2. Sync generated skill output with `bun install`
3. Audit current unstaged source files for:
   - `editor: any`
   - helper signatures using `any`
   - avoidable `as any`
4. Fix only the current unstaged offenders
5. Verify touched surfaces

## Relevant Learnings

- `docs/solutions/best-practices/autoformat-insert-input-rules-should-resolve-once-and-pass-payload.md`
  - Keep payload logic in rule-local code; do not distort the shared runtime.
- `docs/solutions/best-practices/link-automd-should-use-autoformat-as-a-host-while-link-owns-semantics.md`
  - Keep ownership local to the feature package; avoid smearing semantics into
    the wrong abstraction layer.

## Notes

- The `critical-patterns.md` path in the `learnings-researcher` skill appears
  stale; no matching file exists under `docs/solutions/`.
- Generated barrels must not be hand-edited after `pnpm brl`.

## Result

- `plate-plugin-creator.mdc` now forbids `any` in source files except
  intentional non-type test code.
- Current unstaged files are clean for:
  - `editor: any`
  - `: any`
  - `as any`

## Verification

- `bun install`
- `pnpm install`
- `pnpm turbo build --filter=./packages/basic-nodes --filter=./packages/code-block --filter=./packages/link --filter=./packages/list --filter=./packages/list-classic --filter=./packages/math --filter=./apps/www`
- `pnpm turbo typecheck --filter=./packages/basic-nodes --filter=./packages/code-block --filter=./packages/link --filter=./packages/list --filter=./packages/list-classic --filter=./packages/math --filter=./apps/www`
- `bun test packages/basic-nodes/src/lib/BaseBlockquoteInputRules.spec.tsx packages/basic-nodes/src/lib/BaseHeadingInputRules.spec.tsx packages/basic-nodes/src/lib/BaseMarkInputRules.spec.tsx packages/code-block/src/lib/BaseCodeBlockPlugin.inputRules.spec.tsx packages/list/src/lib/inputRules.spec.tsx packages/list-classic/src/lib/BaseListInputRules.spec.tsx packages/math/src/lib/inputRules.spec.tsx packages/link/src/lib/withLink.spec.tsx packages/link/src/lib/internal/inputRules.spec.tsx apps/www/src/__tests__/package-integration/autoformat/current-kit.slow.tsx apps/www/src/__tests__/package-integration/link/link-automd.slow.tsx`
- `pnpm lint:fix`
