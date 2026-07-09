# plate-next suggestion package review

Objective:
Finish `packages/suggestion` Plate Next package review. Done when 49/49
Suggestion source/spec files score 100, stale Slate/Plate compatibility API
audits are clean, the required Plite substrate gap is covered by Plite tests,
and focused package proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-08-plate-next-suggestion-package-review.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Completion threshold:
- 49/49 `packages/suggestion/src` rows checked at score 100.
- Manifest parity with `origin/main`: 49 source files on both sides, no missing
  or extra rows.
- `SuggestionExtension.spec.tsx` deleted as a branch-only duplicate of
  `withSuggestion.spec.tsx`; no `origin/main` owner exists.
- No stale `platejs` facade import, `editor.tf`, `.getApi(`, root editor state
  access, old `SlateEditor`/`T*` type names, fake mocks, or tx-wrapper smell in
  `packages/suggestion/src`.
- Plite owns `tx.nodes.set(..., { marks: true })`, including caller `match`
  preservation.
- Focused Plite/Suggestion typecheck, tests, lint, build, and barrel proof pass.

Verification surface:
- `pnpm --filter @platejs/plite exec bun test ./test/transforms-contract.ts`
- `pnpm --filter @platejs/suggestion test`
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/diff --filter=./packages/suggestion`
- `pnpm --filter @platejs/suggestion lint`
- `pnpm --filter @platejs/suggestion build`
- `pnpm --filter @platejs/suggestion brl`
- source audits with `rg` for stale compatibility names and direct owner imports
- manifest parity with `git ls-tree -r --name-only origin/main packages/suggestion/src` and `rg --files packages/suggestion/src`

Constraints:
- Scope stayed in `packages/suggestion` plus the smallest Plite owner needed to
  restore a generic substrate transform behavior.
- No `apps/www`, docs, registry, browser proof, unrelated package rewrites, or
  broad Plate sweep.
- Preserve `origin/main` package owner/file layout unless a current branch file
  has no `origin/main` owner.
- No public compatibility aliases, old Slate shims, fake wrappers, or bridge
  dumps.
- Preserve type inference; explicit callback/local annotations were not used to
  hide weak owner types.
- Use active transaction helpers for transform-backed mutation.

Boundaries:
- Allowed files: `packages/suggestion`, `packages/plite`, package metadata,
  lock/install state, and this plan.
- `tooling/scripts/check-core.mjs` was read, not changed: Suggestion is a
  product feature package, not part of the shared Core/Plite daily gate.
- Broader package fallout remains outside this package review.

Output budget strategy:
- Use package manifests, focused searches, and command summaries instead of
  streaming full diffs.

Blocked condition:
- No blocker remains for the Suggestion package review.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Package mode, no next package until closure, score-100 per file, no compat sludge, no docs/www, proof commands, and Plite gap policy are recorded here. |
| `plate-next` skill read | yes | `.agents/skills/plate-next/SKILL.md` read during resume. |
| Active goal checked or created | yes | Goal recreated after compaction for this existing plan. |
| Package manifest initialized | yes | `origin/main` and current package manifests both contain 49 files. |
| Broad Core sweep | no | Package review mode only. |

Work Checklist:
- [x] First checkpoint captured scope, non-goals, stop rule, and proof surface.
- [x] Package mode stayed scoped to Suggestion plus the Plite substrate owner.
- [x] Best Plate v2 call recorded: keep Suggestion owners/files, migrate internals to Plite read/update and Plate plugin portal APIs.
- [x] Legacy/backcompat decision recorded: no old Slate/Plate compatibility aliases or wrappers kept.
- [x] Hack check recorded: no bridge dump, fake `any` API, or displaced product logic kept.
- [x] Plite gap fixed: `tx.nodes.set(..., { marks: true })` restored in Plite with caller `match` support.
- [x] Related scoped sweep closed: stale compatibility scan over `packages/suggestion/src` returned no matches.
- [x] Package manifest parity closed: 49 expected, 49 actual, 0 missing, 0 extra.
- [x] Extracted-file inventory closed: `git ls-files --others --exclude-standard packages/suggestion packages/plite` returned no rows.
- [x] Core gate decision closed: Suggestion stays outside `check:core` as a product feature package.
- [x] Direct one-shot API audit closed for the active scope.
- [x] Plugin export inference audit closed for the active scope.
- [x] Empty config inference audit closed for the active scope.
- [x] Plugin extension options audit closed for the active scope.
- [x] Active transaction audit closed for the active scope.
- [x] `pnpm --filter @platejs/suggestion brl` run after barrel-sensitive changes.
- [x] Package proof passed.
- [x] `packages/suggestion/src/index.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.spec.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/BaseSuggestionPlugin.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/diffToSuggestions.spec.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/diffToSuggestions.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/index.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/insertBreakSuggestion.spec.tsx` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/queries/findSuggestionNode.spec.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/queries/findSuggestionNode.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/queries/findSuggestionProps.spec.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/queries/findSuggestionProps.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/queries/index.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/acceptSuggestion.spec.tsx` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/acceptSuggestion.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/addMarkSuggestion.spec.tsx` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/addMarkSuggestion.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/deleteFragmentSuggestion.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/deleteSuggestion.spec.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/deleteSuggestion.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/getSuggestionProps.spec.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/getSuggestionProps.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/index.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/insertFragmentSuggestion.spec.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/insertFragmentSuggestion.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/insertTextSuggestion.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/rejectSuggestion.spec.tsx` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/rejectSuggestion.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/removeMarkSuggestion.spec.tsx` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/removeMarkSuggestion.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/removeNodesSuggestion.spec.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/removeNodesSuggestion.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/transforms/setSuggestionNodes.spec.ts` - score 100; verdict main-parity-cleanup; evidence package proof + Plite marks contract.
- [x] `packages/suggestion/src/lib/transforms/setSuggestionNodes.ts` - score 100; verdict main-parity-cleanup; evidence package proof + Plite marks contract.
- [x] `packages/suggestion/src/lib/types.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/utils/SkipSuggestionDeletes.spec.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/utils/SkipSuggestionDeletes.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/utils/getActiveSuggestionDescriptions.spec.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/utils/getActiveSuggestionDescriptions.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/utils/getSuggestionId.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/utils/getSuggestionKeys.spec.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/utils/getSuggestionKeys.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/utils/getSuggestionNodeEntries.spec.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/utils/getSuggestionNodeEntries.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/utils/getTransientSuggestionKey.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/utils/index.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/withSuggestion.spec.tsx` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/lib/withSuggestion.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/react/SuggestionPlugin.tsx` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.
- [x] `packages/suggestion/src/react/index.ts` - score 100; verdict main-parity-cleanup; evidence package proof + stale scan.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused proof commands | Plite transform contract 36 pass; Suggestion tests 101 pass; typecheck 15 tasks pass; lint/build/brl pass. |
| Broad Core drift ledger coverage | no | Record reason | Package review mode only; no broad Core sweep requested. |
| Score gate | yes | Prove package rows are score 100 | 49 checked package rows, 0 unchecked, 0 deferred. |
| Best Plate v2 recommendation | yes | Record current shape | Keep Suggestion package owners and migrate internals to Plite read/update plus Plate plugin portal APIs. |
| Plite/Plate gap ledger | yes | Record fixed blocker | Plite `NodeSetNodesOptions` gained `marks?: boolean`; `setNodes` now handles selected text marks and respects caller `match`. |
| Related scoped sweep after correction | yes | Run stale API scan in active scope | Strict `rg` scan over `packages/suggestion/src` returned no matches. |
| Package file checklist | yes | Record row counts | 49 expected, 49 actual, 49 score-100, 0 unchecked/deferred, 0 missing, 0 extra. |
| Package/API proof | yes | Run typecheck/test/lint/build/brl | Commands listed in Verification evidence passed. |
| Shared Core gate coverage | no | Record reason | Suggestion is a product feature package; `check:core` remains limited to Core/Plite and current core-adjacent packages. |
| Non-Core package error triage | yes | Classify failures | No out-of-scope package failures in final proof. |
| Source audit | yes | Run exact stale compatibility scan | No matches for old Slate/Plate names or stale tx wrappers. |
| Rename ledger | no | Record reason | No accepted rename pass; branch-only duplicate spec was deleted. |
| Extracted-file inventory | yes | Record untracked files | Inventory command returned no rows. |
| Autoreview / review | no | Record reason | Package review loop itself is the requested review; no pre-commit autoreview requested. |
| Final lint/check | yes | Run scoped lint/check | `pnpm --filter @platejs/suggestion lint` and focused typecheck passed. |
| Changed list / needs attention | yes | Fill handoff ledgers | Changed list and needs-attention rows recorded below. |
| Goal plan complete | yes | Run check-complete | Run after this plan update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Package review | complete | 49/49 rows score 100; final proof passed | Next Plate package can start after user review. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/suggestion` package | 0 | main-parity-cleanup | Suggestion package | 49/49 rows score 100; package proof passed. | Complete. |
| `tx.nodes.set(..., { marks: true })` | 0 | move-to-plite | Plite transforms | Plite contract tests cover split marks and caller match. | Complete. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason | User-review need |
|--------|-------------------|----------------------|--------|------------------|
| Suggestion package | Keep the package owners/files, expose behavior through the existing Suggestion plugin API, and implement mutation through Plite transactions. | Re-adding `editor.tf`, `getApi`, old Slate names, optional tx wrappers, bridge files, or moving helper algorithms into the plugin file. | It preserves product behavior while making Plite the substrate owner. | Low; only review the Plite `marks: true` substrate choice if you want to revisit safe mark-targeting API. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is wrong | Smallest owner | Proof | Decision |
|----------|--------------------|------------------------------|----------------|-------|----------|
| Plite gap | `tx.nodes.set(..., { marks: true })` for text selection marking while preserving caller `match`. | Suggestion should not hand-roll split/text-mark logic or bypass caller match in a product package. | `packages/plite/src/transforms-node/set-nodes.ts` | `pnpm --filter @platejs/plite exec bun test ./test/transforms-contract.ts` | Fixed. |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Old Slate/Plate API migration | `packages/suggestion/src` | `rg -n "from 'platejs'\|editor\\.tf\|\\.getApi\\(\|editor\\.api\\.\|SlateEditor\|TElement\|TNode\|TText\|mock\\(\|spyOn\\(" packages/suggestion/src -g'*.ts' -g'*.tsx'` | 0 | n/a | 0 | None in active scope. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| Plite substrate | `NodeSetNodesOptions` supports `marks?: boolean`; `setNodes` marks split text/markable void children and respects caller `match`. |
| Suggestion runtime/API | Package internals migrated to direct `@platejs/core`, `@platejs/plite`, `@platejs/utils`, and `@udecode/utils`; old Slate/Plate APIs removed from active scope. |
| Suggestion tests | Fake/mocked transform specs converted to real editor specs; branch-only duplicate `SuggestionExtension.spec.tsx` deleted. |
| Package metadata | Direct runtime dependencies added for the owner packages Suggestion imports. |
| Reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Plite `marks: true` on `nodes.set` | This revives generic mark-targeting behavior in Plite instead of keeping Suggestion-local splitting logic. | `packages/plite/src/transforms-node/set-nodes.ts` | Keep; product packages need this substrate behavior. |
| 2 | Suggestion outside `check:core` | Suggestion is product feature behavior, not a Core/Plite daily gate package. | `tooling/scripts/check-core.mjs` | Keep outside `check:core`; rely on package review proof. |

Findings:
- Suggestion needed one real Plite substrate repair: selected text marking via
  `tx.nodes.set(..., { marks: true })`.
- `SuggestionExtension.spec.tsx` was a branch-only duplicate; deleting it
  restores manifest parity with `origin/main`.
- Running Suggestion build in parallel with a command that rebuilds Plite can
  race against Plite declaration output. Sequential artifact build is the
  correct package proof.

Decisions and tradeoffs:
- Moved generic text-marking semantics into Plite instead of duplicating the
  algorithm in Suggestion.
- Kept Suggestion file ownership aligned with `origin/main`; no rename pass.
- Did not add Suggestion to `check:core` because it is product-level package
  behavior.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `bun test test/transforms-contract.ts` treated the path as a filter | 1 | Use `bun test ./test/transforms-contract.ts` | Focused Plite test passed. |
| Suggestion build ran in parallel with Plite artifact rebuild | 1 | Run artifact build sequentially after typecheck/build owners settle | Sequential Suggestion build passed. |

Verification evidence:
- `pnpm install` -> pass.
- `pnpm --filter @platejs/plite exec bun test ./test/transforms-contract.ts -t "setNodes with marks"` -> 2 pass.
- `pnpm --filter @platejs/plite exec bun test ./test/transforms-contract.ts` -> 36 pass.
- `pnpm --filter @platejs/suggestion test` -> 101 pass, 0 fail, 242 assertions.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/diff --filter=./packages/suggestion` -> 15 tasks pass.
- `pnpm --filter @platejs/suggestion lint` -> pass, 52 files checked.
- `pnpm --filter @platejs/suggestion build` -> pass when run sequentially.
- `pnpm --filter @platejs/suggestion brl` -> pass.
- Manifest parity -> `origin/main` 49 files, current 49 files, no diff.
- Extracted file inventory -> no untracked files in `packages/suggestion` or
  `packages/plite`.
- Stale compatibility scan -> no matches in `packages/suggestion/src`.

Final handoff contract:
- target surface and mode: `packages/suggestion`, Plate Next package review.
- files/APIs reviewed: 49 package files plus Plite `setNodes` owner.
- package file checklist coverage: 49/49 score 100, 0 unchecked, 0 deferred.
- verdict summary: Suggestion package `main-parity-cleanup`; Plite `marks: true`
  behavior `move-to-plite`.
- Plite/Plate gaps: one Plite gap fixed; no remaining blocker.
- related scoped sweep: stale compatibility scan in Suggestion scope, 0 matches.
- out-of-scope matches discovered: none.
- next best Plate Next packet: continue with the next package only after user
  review.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Suggestion package review closure | Handoff for user review, then next package | 49/49 Suggestion rows score 100 with proof | Suggestion needed one real Plite mark-targeting repair | Package proof and plan closure complete |

Open risks:
- None for the active Suggestion package review.
