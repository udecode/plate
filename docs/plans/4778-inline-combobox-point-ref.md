# Issue 4778 Inline Combobox Point Ref

## Task

- Source: GitHub issue `#4778`
- Title: `Redundant code in \`inline-combobox.tsx\``
- Type: bug
- Goal: stop `inline-combobox` from snapshotting a live `PointRef` into a stale plain `Point`
- Acceptance:
  - canceling the inline combobox inserts text at the live tracked point
  - the component keeps `PointRef` semantics instead of copying `pointRef.current`
  - registry-only follow-up uses the repo's component changelog path if needed

## Plan

1. Confirm the current component behavior and relevant ref semantics.
2. Add a targeted regression spec around cancel insertion using a live-updating `PointRef`.
3. Fix `inline-combobox` at the component seam.
4. Update registry changelog entry if required for this repo layout.
5. Run targeted test, required app verification, and lint.
6. Decide whether PR/comment sync is warranted from the active task workflow.

## Findings

- `apps/www/src/registry/ui/inline-combobox.tsx` stores `pointRef.current` in a plain React ref, which throws away the live-updating part of `PointRef`.
- Existing `PointRef` usage in repo code reads `pointRef.current` at action time, not once at setup time.
- The skill text mentions `docs/components/changelog.mdx`, but this repo uses `content/components/changelog.mdx`.
- No relevant institutional learning turned up for combobox/location-ref behavior.

## Progress

- 2026-04-01: Fetched issue `#4778`, comments, and local task rules.
- 2026-04-01: Confirmed the reported problem is real, not just cosmetic.
- 2026-04-01: Found a clean local spec seam in `apps/www/src/registry/ui`.
- 2026-04-01: Added `apps/www/src/registry/ui/inline-combobox.spec.tsx` to reproduce the stale snapshot bug by mutating the live `PointRef` before canceling input.
- 2026-04-01: Updated `apps/www/src/registry/ui/inline-combobox.tsx` to store the live `PointRef`, clear old refs safely, and read `pointRef.current` at cancel time.
- 2026-04-01: Updated `content/components/changelog.mdx` and regenerated `apps/www/public/r/inline-combobox.json` plus `apps/www/public/r/components-changelog-docs.json`.
- 2026-04-01: Verified `bun test apps/www/src/registry/ui/inline-combobox.spec.tsx`, `pnpm install`, `pnpm --filter www build:registry`, `pnpm --filter www typecheck`, and `pnpm lint:fix`.
- 2026-04-01: `pnpm check` initially failed on local-only invalid-hook-call tests in `packages/selection`, `packages/table`, and `packages/toc`.
- 2026-04-01: Root cause was mixed install state: package-local `node_modules/react-dom` symlinks into `node_modules/.bun/...` while the rest of the repo resolved React through `.pnpm`, which created duplicate React runtimes.
- 2026-04-01: `pnpm run reinstall` cleared the stale workspace `node_modules` trees and removed the broken `.bun` mirror.
- 2026-04-01: Re-verified the formerly failing hook specs directly, then reran `pnpm check` successfully.
