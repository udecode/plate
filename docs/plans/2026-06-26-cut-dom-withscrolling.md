# Cut DOM WithScrolling

Objective:
Cut the stale DOM `withScrolling` API; done when live Core/docs use extension-owned `tx.dom.autoScroll`, no `withScrolling` surface remains, and `check:core` passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-26-cut-dom-withscrolling.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Completion threshold:
- Live Core source/current docs have no `withScrolling`, `WithAutoScrollOptions`, or standalone `withScrolling` helper surface.
- DOM scroll behavior is still extension-owned and transaction-scoped via `tx.dom.autoScroll(...)`.
- Focused DOM/Core tests pass.
- `pnpm check:core` passes.
- `check-complete.mjs` passes for this plan.

Verification surface:
- Source audit: `rg -n 'withScrolling|WithAutoScrollOptions|beginScrolling|isScrolling' packages/core/src content/docs -g '*.ts' -g '*.tsx' -g '*.mdx'`
- Focused tests: `bun test --path-ignore-patterns '' ./packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts ./packages/core/src/react/editor/createPlateRuntimeEditor.spec.ts`
- Barrel proof: `pnpm --filter @platejs/core brl`
- Focused package proof: `pnpm --filter @platejs/core typecheck`, `pnpm --filter @platejs/core lint`
- Closure proof: `pnpm check:core`
- Goal proof: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-cut-dom-withscrolling.md`

Constraints:
- No public compat alias from `withScrolling` to the new API.
- Do not move this into Plite; this is Plate/Core DOM extension behavior around Plite operations.
- Keep scroll behavior for AI streaming and DOM runtime operation scrolling.
- Do not touch release, PR, git staging, or package publishing.
- Browser proof is not required unless route behavior changes; this is API/source cleanup plus unit/runtime proof.

Boundaries:
- Allowed: `packages/core/src/lib/plugins/dom/**`, runtime bridge/editor tests that consume the DOM plugin, current docs snippets that mention `tx.dom.withScrolling`.
- Not allowed: broad Plate v2 runtime redesign, Plite core API changes, pagination, browser route rewrites, unrelated `with*` helpers outside this DOM API.
- Source of truth: live Core source and current docs, not historical plans or issue ledgers.

Output budget strategy:
- Use exact owner files and narrow `rg` roots.
- Avoid broad `with*` repo scans after the owner is known.
- Cap command output and use focused tests before `check:core`.

Blocked condition:
- Block only if preserving scroll behavior requires a public API fork that is not inferable from the accepted Plate/Plite boundary rule. Current recommendation is clear: `tx.dom.autoScroll`.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | User correction captured: `withScrolling` is stale because Plite no longer uses `with*`; editor extensions are the model. |
| Lane resolved | yes | Shared Core/Plate DOM extension cleanup, not Plite kernel work. |
| Active goal | yes | Active goal created for this plan before mutable source edits. |
| Output budget | yes | Narrow owner files and exact source audit listed above. |
| Git boundary | yes | No stage/commit/push requested. |

Work Checklist:
- [x] Replace `tx.dom.withScrolling(...)` with `tx.dom.autoScroll(...)`.
- [x] Remove standalone `withScrolling` helper and exported `withScrolling` surface.
- [x] Preserve temporary scroll option merge/restore behavior inside the DOM extension implementation.
- [x] Update Core runtime bridge tests and DOMPlugin tests.
- [x] Update current docs snippets.
- [x] Regenerate Core barrels.
- [x] Run focused tests/typecheck/lint.
- [x] Run source/docs audit for stale `withScrolling` surface.
- [x] Run `pnpm check:core`.
- [x] Fill changed list, needs-attention, stopping checkpoints, verification evidence, reboot status, and open risks.
- [x] Run autogoal `check-complete`.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Stale API audit | yes | Verify no live `withScrolling` API surface remains | `rg -n 'withScrolling\|WithAutoScrollOptions\|beginScrolling\|isScrolling' packages/core/src content/docs -g '*.ts' -g '*.tsx' -g '*.mdx'` returned no matches. |
| Behavior proof | yes | Focused tests prove scroll-on-operation behavior and restore behavior | `bun test --path-ignore-patterns '' ./packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts ./packages/core/src/react/editor/createPlateRuntimeEditor.spec.ts` passed: 103 tests. |
| Barrel proof | yes | Regenerate Core barrels after export deletion | `pnpm --filter @platejs/core brl` passed. |
| Core closure proof | yes | Run `pnpm check:core` | Passed: Core+Plite typecheck, type contracts, lint, Core test batches, and Plite tests. |
| Browser proof | no | Source/API cleanup only; no route/UI behavior changed | N/A: no rendered browser route touched. |
| Skill sync | no | No `.agents/rules/**` edits planned | N/A: no skill source touched. |
| Autoreview | no | Direct cleanup requested; broader review can run before commit | N/A: deterministic source/API cut with targeted proof. |
| Goal plan complete | yes | Run `check-complete.mjs` | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-cut-dom-withscrolling.md` passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement capture | complete | Prompt correction and accepted API shape recorded. | source edit |
| Source edit | complete | DOMPlugin now owns `autoScroll`; old helper file deleted. | tests |
| Tests/audit | complete | Focused tests/type/lint and stale-name audit passed. | closure |
| Closure | complete | `pnpm check:core` passed. | final |

Findings:
- `DOMPlugin` currently exposes `tx.dom.withScrolling`, root `editor.api.isScrolling`, and a standalone `withScrolling.ts` helper.
- Current AI docs show `tx.dom.withScrolling`, so the stale API leaked into user-facing docs.
- Runtime bridge reads the scrolling flag to decide whether to call `scrollIntoView` after enabled operations.

Decisions and tradeoffs:
- Keep the behavior as a DOM extension transaction helper because it controls side effects around a transaction.
- Rename to `tx.dom.autoScroll(...)` because it describes the behavior and avoids old `with*` enhancer vocabulary.
- Keep scroll options local to Core DOM plugin; Plite remains free of this behavior.

Changed list:
- code/runtime/API: `DOMPlugin` exposes `tx.dom.autoScroll(...)` and `editor.api.dom.isAutoScrolling()`; standalone `withScrolling.ts` deleted; runtime bridge reads the DOM API state.
- tests/oracles: DOMPlugin and runtime editor tests migrated to `autoScroll` and nested DOM API assertions; standalone helper tests deleted with the helper.
- examples/docs: AI docs snippets now use `tx.dom.autoScroll(...)`.
- barrels: Core DOM barrel regenerated and no longer exports `withScrolling`.
- reverted/quarantined packets: none.

Needs your attention:
- P1: Review the public naming `tx.dom.autoScroll(...)`. Recommendation: accept. It is short, transaction-scoped, and avoids old enhancer wording.

Stopping checkpoints:
- none.

Verification evidence:
- `rg -n 'withScrolling|WithAutoScrollOptions|beginScrolling|isScrolling' packages/core/src content/docs -g '*.ts' -g '*.tsx' -g '*.mdx'` returned no matches.
- `bun test --path-ignore-patterns '' ./packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts ./packages/core/src/react/editor/createPlateRuntimeEditor.spec.ts` passed: 103 tests.
- `pnpm --filter @platejs/core brl` passed.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/core lint` passed.
- `pnpm check:core` passed: Core+Plite typecheck, type contracts, Core lint, Plite lint, Core test batches, and Plite tests.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-cut-dom-withscrolling.md` passed.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Closed | Final response | No live `withScrolling` surface, behavior preserved, `check:core` green | `withScrolling` leaked into tests/docs | Source, tests, docs, barrels, audit, and check gate complete |

Open risks:
- None beyond focused API rename; broad Plate v2 runtime cleanup remains separate.
