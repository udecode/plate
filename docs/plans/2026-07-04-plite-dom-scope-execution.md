# plite dom scope execution

Objective:
Execute Plite DOM scope ownership plan; done when root/editable/scroll APIs
replace Plate generic container ids and focused Plite/Core proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-04-plite-dom-scope-execution.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Accepted plan:
docs/plans/2026-07-04-plite-dom-scope-ownership.md

Completion threshold:
- Implement all accepted packets:
  1. Plite DOM owns root/editable/scroll DOM scope.
  2. Plite React exposes hooks for root/editable/scroll element access.
  3. Plate stops using generic `containerId` as the RTE DOM-scope API.
  4. Plate generic container/scroll consumers move to Plite primitives.
  5. Docs stop teaching `containerId` for generic editor scope.
- Focused Plite DOM/React/Core tests pass.
- Typecheck for Plite DOM, Plite React, and Core passes.
- `pnpm --filter www check:docs` passes for docs edits.
- Source audits show no `runtime.uid` and no generic public `useEditorContainerId`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plite-dom-scope-execution.md` passes.

Verification surface:
- Source proof: `rg` audits for `containerId`, `useEditorContainerId`,
  `runtime.uid`, and Plite DOM scope exports.
- Package proof:
  - `pnpm --filter @platejs/plite-dom test`
  - `pnpm --filter @platejs/plite-react test`
  - focused `@platejs/core` tests for Plate store/container.
  - `pnpm turbo typecheck --filter=./packages/plite-dom --filter=./packages/plite-react --filter=./packages/core`
  - `pnpm check:core`
- Docs proof: `pnpm --filter www check:docs`.
- Browser proof: N/A for this pass unless route/runtime proof becomes
  necessary; Plite browser proof is the later closure gate named by the plan.

Constraints:
- No Plite `containerId` API.
- No `runtime.uid`.
- No public compatibility alias.
- Do not move Plate product wrapper/plugin chrome into Plite.
- Preserve app ability to pass a normal HTML `id` prop to wrappers.
- Type inference remains mandatory; do not annotate callback params to hide API
  generic failures.

Boundaries:
- Allowed implementation scope:
  - `packages/plite-dom/**`
  - `packages/plite-react/**`
  - `packages/core/**`
  - `content/docs/**`
  - this plan
- Out of scope: broad Plate package migration, browser matrix, unrelated docs
  app compile drift, changesets.

Output budget strategy:
- Use targeted `rg`/`sed` reads.
- Avoid broad streamed package output; run focused tests first.
- Save decisions in this plan instead of long chat logs.

Blocked condition:
- Stop only if Plite cannot expose root/editable/scroll without a deeper React
  runtime redesign, or if Core cannot migrate without breaking product wrapper
  behavior. Otherwise keep patching.

Plite Plan lane state:
- plite_plan_lane_status: complete
- current_pass: implementation
- current_pass_status: complete
- next_pass: handoff
- next_action: user review
- final_handoff_status: ready

Current verdict:
- verdict: accepted plan implemented
- confidence: 0.96 after proof
- keep / cut / revise call: keep
- reason: Plite now owns generic root/editable/scroll DOM scope, Plate no
  longer exposes generic container id/ref APIs for editor DOM scope, and
  Core/Plite proof is green.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `plite-plan` and `autogoal` read. |
| Active goal checked or created | yes | No active goal; execution goal created. |
| Source of truth read before edits | yes | Accepted plan and relevant Plite/Core source read. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Checked in planning pass; no superseding DOM-scope solution. |
| Live `Plate repo root` grounding needed for current-state claims | yes | Current source reads recorded in accepted plan and this plan. |

Work Checklist:
- [x] First checkpoint copied every explicit latest requirement: `go all`,
      accepted Plite DOM-scope plan, implement all packets, prove with focused
      Plite/Core/docs checks, no `containerId` substrate, no `runtime.uid`.
- [x] One-shot execution mode selected.
- [x] Live source grounding recorded for current implementation owners.
- [x] Issue ledger / ClawSweeper skipped: no issue claim.
- [x] Ecosystem synthesis reused from accepted planning artifact.
- [x] Intent/boundary record and decision brief reused from accepted plan.
- [x] Plite DOM scope API implemented.
- [x] Plite React hooks implemented.
- [x] Plate generic container id API removed or reduced to product-only
      wrapper behavior.
- [x] Docs updated away from generic `containerId`.
- [x] Focused tests added or updated.
- [x] Package/type/docs proof run.
- [x] Source audits run.
- [x] Final handoff filled.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run commands listed above | `pnpm check:core`, Plite DOM/React focused tests, docs check, and audits passed. |
| Plite source/runtime/browser/package/public API claim | yes | Record package proof | Public/import surface contracts and runtime tests passed. |
| Issue ledger or PR reference changed | no | N/A | No issue/PR claim. |
| Autoreview for uncommitted implementation changes | no | N/A unless user asks review/commit | This is an implementation packet, not commit closeout. |
| Final user-review handoff | yes | Emit concise changed/proof/attention list | This plan and final response. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plite-dom-scope-execution.md` | Passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Plan intake | pass | Accepted plan and source owners read. | done |
| Plite DOM scope | pass | `editor.api.dom.root/editable/scroll` implemented in `packages/plite-dom`. | done |
| Plite React hooks | pass | Root/editable/scroll hooks implemented in `packages/plite-react`. | done |
| Plate migration | pass | Core store/container id APIs removed; selection/toc callers moved to Plite scroll element hooks. | done |
| Docs/tests | pass | Core/Plite/docs updated and focused tests added. | done |
| Verification | pass | Commands and audits recorded below. | done |
| Closure | pass | Plan closed after checker pass. | done |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React runtime performance | 0.20 | 0.95 | Hook implementation uses `useSyncExternalStore`; no broad render polling or string-id lookup. |
| Plite API/DX quality | 0.20 | 0.96 | `editor.api.dom.root/editable/scroll` plus explicit React hooks; no `containerId`. |
| Plate migration backbone | 0.15 | 0.93 | Core store/container no longer exposes generic DOM scope; product wrapper ref stays Plate-owned. |
| Regression-proof testing strategy | 0.20 | 0.95 | Plite React DOM-scope contract, Plite DOM surface contract, Core store/content tests, focused selection/toc tests. |
| Source evidence and proof completeness | 0.15 | 0.96 | `check:core`, docs check, symbol audits, and exact export contracts passed. |
| composability/minimalism | 0.10 | 0.95 | Plite owns generic element scope; raw setters are internal-only. |

Implementation ledger:
| Packet | Status | Files | Evidence | Decision |
|--------|--------|-------|----------|----------|
| Plite DOM scope registry | kept | `packages/plite-dom/src/plugin/dom-editor.ts`, `packages/plite-dom/src/utils/weak-maps.ts`, `packages/plite-dom/src/internal/index.ts`, `packages/plite-dom/src/index.ts` | Plite DOM tests and public surface contracts passed. | Plite owns generic root/editable/scroll element reads; setters stay internal. |
| Plite React hooks | kept | `packages/plite-react/src/hooks/use-editor-dom-scope.ts`, `packages/plite-react/src/editable/input-router.ts`, `packages/plite-react/src/index.ts`, `packages/plite-react/test/react-editor-contract.tsx`, `packages/plite-react/test/surface-contract.tsx` | `pnpm --filter @platejs/plite-react test` passed. | Public hook API is root/editable/scroll/ref. |
| Plate migration | kept | `packages/core/src/react/components/Plate.tsx`, `packages/core/src/react/components/PlateContainer.tsx`, `packages/core/src/react/components/PlateContent.spec.tsx`, `packages/core/src/react/stores/plate/*`, `packages/core/src/react/slate-react.ts`, `packages/selection/src/react/hooks/*`, `packages/toc/src/react/hooks/*` | `pnpm check:core` and focused selection/toc tests passed. | Plate wrapper refs remain product shell only; generic scope moved to Plite. |
| Docs cleanup | kept | `content/docs/api/core*.mdx`, `content/docs/api/core/plate-store*.mdx`, `content/docs/(plugins)/**/block-selection*.mdx`, `content/docs/(plugins)/**/toc*.mdx`, `content/docs/migration/v48.mdx`, `content/docs/plite/libraries/plite-react/react-editor.mdx` | `pnpm --filter www check:docs` passed. | Docs no longer teach `containerId` as editor DOM scope. |
| Tests/proof | kept | `packages/plite/test/public-package-import-smoke.test.ts`, `packages/plite-dom/test/public-surface-contract.ts`, `packages/plite-react/test/*`, Core store/content specs, selection/toc focused specs | Commands below. | Exact surfaces updated; old-symbol audit clean. |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Evidence | Follow-up |
|--------------|---------------------|-----|----------|-----------|
| `runtime.uid` | cut | Wrong owner. | Source audit required. | none |
| Plite `containerId` | reject | String id is app markup, not editor runtime scope. | Accepted plan. | none |
| Plate `useEditorContainerId` as generic API | cut | It teaches the wrong RTE scope abstraction. | Source audit required. | replace docs/callers |
| Plate product wrapper ref | keep if needed | Product chrome/render slots can still need a wrapper. | PlateContainer source. | keep product-only |

Verification evidence:
- `pnpm --filter @platejs/plite-dom exec bun test` passed: 134 tests.
- `pnpm --filter @platejs/plite-dom exec bun test test/public-surface-contract.test.ts` passed: 16 tests.
- `pnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/react-editor-contract.test.tsx` passed: 9 tests.
- `pnpm --filter @platejs/plite-react test` passed: 61 files, 839 tests.
- `pnpm --filter @platejs/core exec bun test src/react/stores/plate/createPlateStore.spec.tsx src/react/components/plate-nodes.spec.tsx` passed: 8 tests.
- `pnpm --filter @platejs/core exec bun test src/react/components/PlateContent.spec.tsx` passed: 6 tests.
- `pnpm --filter @platejs/selection exec bun test --preload ../../config/plite-source-test-setup.ts src/react/hooks/useCursorOverlay.spec.tsx` passed: 2 tests.
- `pnpm --filter @platejs/toc exec bun test --preload ../../config/plite-source-test-setup.ts src/react/hooks/useTocElement.spec.tsx src/react/hooks/useTocSideBar.spec.tsx` passed: 2 tests.
- `pnpm turbo typecheck --filter=./packages/plite-dom --filter=./packages/plite-react --filter=./packages/core` passed.
- `pnpm --filter @platejs/plite exec bun test test/public-package-import-smoke.test.ts` passed: 18 tests.
- `pnpm check:core` passed: Core/Plite source and test typecheck, lint, Core tests 701 pass, Plite tests 1900 pass / 85 skipped.
- `pnpm --filter www check:docs` passed.
- Removed-symbol audit passed with no matches:
  `rg -n "useEditorContainerId|containerId|runtime\\.uid|useEditorContainerRef|useEditorScrollRef|useScrollRef" packages/core/src packages/selection packages/toc packages/plite packages/plite-dom packages/plite-react content/docs -g '*.ts' -g '*.tsx' -g '*.mdx'`.
- Internal setter audit passed:
  `setEditorDOM*` and `subscribeEditorDOMScope` appear only in `packages/plite-dom/src/internal/index.ts`, Plite React input registration, and Plite React hooks.

Findings:
- `containerId` was the wrong abstraction for editor DOM scope. Element refs are the correct Plite-owned runtime primitive.
- Raw DOM-scope setters are necessary but must remain internal. The public surface is read hooks plus a ref callback for custom scroll containers.
- Broad `@platejs/selection` / `@platejs/toc` package typecheck and full package tests still hit unrelated Plate migration debt (`SlateEditor`, `TElement`, `editor.tf`, and dist facade issues). This packet only claims focused hook proof for those packages.

Decisions and tradeoffs:
- Accepted plan controls: Plite owns element/ref DOM scope; Plate owns product
  wrapper.
- Rejected Plite string ids and `runtime.uid`.
- Kept Plate `containerRef` as a product-shell ref, not an editor DOM scope API.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Plite React exact export contract missed new hooks | 1 | Add hooks to package-local surface contract | Passed `pnpm --filter @platejs/plite-react test`. |
| Core PlateContent test still expected generated container id | 1 | Assert shell containment instead of generated id | Passed focused Core spec and `pnpm check:core`. |
| Plite cross-package import ledger missed new hooks/internal setters | 1 | Update second exact export ledger | Passed package smoke and `pnpm check:core`. |
| Broad selection/toc typecheck hit unrelated migration debt | 1 | Keep this packet scoped to focused changed hook tests | Focused hook tests passed; broader debt recorded as next owner. |

Final handoff contract:
- changed list: Plite DOM scope registry/API; Plite React root/editable/scroll hooks; Core store/container cleanup; selection/toc scroll consumers; docs and exact export contracts.
- public API target: `editor.api.dom.root()`, `editor.api.dom.editable(root?)`, `editor.api.dom.scroll()`, `useEditorRootElement(editor)`, `useEditorEditableElement(editor, root?)`, `useEditorScrollElement(editor)`, `useEditorScrollElementRef(editor)`.
- hard cuts: `runtime.uid`, generic `containerId`, `useEditorContainerId`, `useEditorContainerRef`, `useEditorScrollRef`, `useScrollRef`.
- tests/proof: see verification evidence.
- source audits: old-symbol audit clean; internal setter audit scoped.
- browser proof status: N/A for this package/API packet; no changed route required runtime browser proof.
- needs attention: broad selection/toc package migration remains outside this packet.
- next owner: `plate-next` / `auto` for the broader selection/toc Plate migration cleanup.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| all packets implemented or explicitly deferred | implementation ledger closed | pass |
| proof commands pass | verification evidence recorded | pass |
| source audits pass | audit commands recorded | pass |
| no unresolved plan placeholders | `rg "pending|TODO|\\[ \\]"` clean except deliberate prose | pass |
| `check-complete` passes | autogoal checker | pass |

Timeline:
- 2026-07-04T17:10Z Execution plan created and goal started.
- 2026-07-04T17:35Z Focused Plite React and Core stale contract failures repaired.
- 2026-07-04T17:42Z `pnpm check:core` and docs/source audits passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closed implementation packet |
| Where am I going? | User handoff |
| What is the goal? | Execute accepted Plite DOM scope plan |
| What have I learned? | Element refs are the durable Plite primitive; string container ids were Plate product-shell leakage. |
| What have I done? | Implemented, tested, audited, and documented Plite DOM scope ownership. |

Open risks:
- Broad selection/toc package migration remains open and is not claimed by this
  packet.
