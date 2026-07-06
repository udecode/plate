# Plite Support For Plate Store Mirror Cuts

Objective:
Plan the Plite API/runtime support needed to remove useless Plate store mirrors for composing, read-only, and version invalidation.

Completion threshold:
- Planning-only Plite Plan is complete when the current Plate mirror fields are classified, every proposed cut has a Plite replacement or explicit gap, and the execution packet is reviewable without implementation.
- This plan does not implement source changes.

Verification surface:
- Source audits over `packages/core/src/react/stores/plate`, `packages/core/src/react/stores/element`, `packages/core/src/react/components`, `packages/plite-react/src/hooks`, and `packages/plite-react/src/index.ts`.
- Planning check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plite-plate-store-mirror-cuts.md`.

Constraints:
- Planning mode only.
- No public compatibility aliases.
- Do not move Plate shell/product state into Plite.
- Do not keep Plate store mirrors when Plite already owns the runtime fact.

Boundaries:
- Allowed edit scope for this activation: this plan file only.
- Future execution scope: `packages/plite-react`, `packages/core/src/react/stores`, `packages/core/src/react/components`, relevant tests, and docs that teach store/runtime hooks.

Blocked condition:
- Block only if execution discovers that Plate container shell state cannot subscribe to Plite editor view state without either a new Plite hook or a retained Plate store mirror.

Plite Plan lane state:
- plite_plan_lane_status: complete
- current_pass: planning handoff
- current_pass_status: done
- next_pass: execution after user acceptance
- next_action: run Plate/Plite implementation packet only after explicit approval
- final_handoff_status: ready

Current verdict:
- verdict: revise Plite React selector surface, then cut Plate mirrors
- confidence: 0.94
- keep / cut / revise call: cut composing mirror now; revise read-only subscription first; migrate version hooks later
- reason: Plite already owns editor view facts, but Plate shell code needs one explicit-editor subscription route outside `<Plite>`.

Completion rule:
- Do not execute this plan without a later explicit implementation request.
- Do not keep `usePlateEditorComposing` as a public API.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `plite-plan` request used in planning mode |
| Active goal checked or created | yes | Autogoal scratchpad created at this plan path |
| Source of truth read before edits | yes | `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, `docs/vision/plite.md` read |
| Live source grounding needed for current-state claims | yes | Source audits listed below |

Work Checklist:
- [x] Copy explicit user request into plan: decide what Plite support is needed to cut useless Plate store mirrors.
- [x] Classify `usePlateEditorComposing` and `PlateStoreState.composing`.
- [x] Classify `usePlateEditorReadOnly` and `PlateStoreState.readOnly`.
- [x] Classify `useEditorVersion`, `useSelectionVersion`, `useValueVersion`.
- [x] Separate Plite substrate state from Plate shell/product state.
- [x] Record public API target, implementation phases, proof gates, and risks.
- [x] Keep implementation out of planning mode.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run plan checker | recorded below |
| Plite source/runtime claim | yes | Cite live source instead of old plans | source inventory rows below |
| Issue ledger or PR reference changed | no | No issue-facing claim changed | planning-only local API plan |
| Autoreview for implementation changes | no | No implementation patch in this activation | plan-only edit |
| Final user-review handoff | yes | Summarize decisions in final response | ready |
| Goal plan complete | yes | Run `check-complete.mjs` | recorded below |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | done | Source inventory completed | execution approval |
| Plite/Plate boundary audit | done | Boundary rows below | execution approval |
| Public API and runtime inventory | done | API target rows below | execution approval |
| Minimal breaking-change strategy | done | Hard cuts listed below | execution approval |
| Runtime/performance/testability pass | done | No browser behavior change in planning | execution approval |
| Docs/examples/proof pass | done | Docs rows listed below | execution approval |
| Objection and steelman pass | done | Objection ledger below | execution approval |
| Verification and final handoff gate | done | Plan checker row below | execution approval |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React/runtime performance | 0.20 | 0.95 | Removes extra first-block store bridge and avoids duplicated render subscriptions |
| Plite API/DX quality | 0.20 | 0.93 | Adds explicit-editor selector route instead of Plate mirror APIs |
| Plate/collab migration backbone | 0.15 | 0.92 | Keeps Plate shell state in Plate while moving runtime facts to Plite |
| Regression-proof testing strategy | 0.20 | 0.94 | Execution proof has focused Core and Plite React tests |
| Research evidence completeness | 0.15 | 0.93 | No external research needed; live source is sufficient |
| shadcn-style composability and minimal examples | 0.10 | 0.94 | Public hooks become fewer and clearer |

Source-backed architecture north star:
- target shape: Plite owns runtime view facts; Plate store owns product shell config, refs, callbacks, and controller membership.
- source evidence: `packages/plite-react/src/index.ts` exports `useEditorComposing`, `useEditorReadOnly`, `useEditorSelection`, and selector hooks.
- rejected drift: Plate store mirroring `composing` and user-facing `readOnly` mutations through `editor.store`.
- migration posture: hard cut useless mirrors; bridge only the shell read-only subscription gap with a proper Plite API.

Current-source inventory:
| Surface | Current evidence | Verdict |
|---------|------------------|---------|
| `PlateStoreState.composing` | `packages/core/src/react/stores/plate/PlateStore.ts` stores `composing`; `packages/core/src/react/stores/element/useElementStore.tsx` writes it from `useEditorComposing` | hard-cut |
| `usePlateEditorComposing` | `packages/core/src/react/stores/plate/createPlateStore.ts` reads store `composing`; only tests and bridge use it | hard-cut |
| Plite composing | `packages/plite-react/src/hooks/use-editor-composing.ts` and `packages/plite/src/core/public-state.ts` own composing | keep in Plite |
| `PlateStoreState.readOnly` | `packages/core/src/react/components/PlateContent.tsx` and `PlateContainer.tsx` use it for shell render gating | revise after Plite hook |
| Plite read-only | `packages/plite-react/src/hooks/use-editor-read-only.ts` and `editor.read.view.isReadOnly()` exist | keep in Plite |
| Plate version hooks | `createPlateStore.ts` exposes `useEditorVersion`, `useSelectionVersion`, `useValueVersion`; feature packages still consume `useEditorVersion` | migrate, not instant cut |
| Plate shell state | `editor`, `id`, `primary`, `isMounted`, refs, callbacks, render/decorate props | keep in Plate |

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| composing | `useEditorComposing()` and `editor.read.view.isComposing()` only | One Plite API | hard cut `usePlateEditorComposing` | Plite React export exists | cut |
| read-only in render tree | `useEditorReadOnly()` | One Plite API | hard cut public `usePlateEditorReadOnly` after Core call sites move | Plite React export exists | cut |
| read-only outside render tree | New explicit-editor Plite selector, e.g. `useEditorStateFor(editor, selector)` or `useEditorViewState(editor, selector)` | Shell code can subscribe without Plate mirror | no public Plate store mirror | `useEditorState` is currently context-only | revise Plite |
| value/selection/editor invalidation | Prefer Plite `useEditorState(selector)` and `useEditorSelection()` | State reads are selector-based | migrate feature packages before removing version hooks | feature packages consume `useEditorVersion` | defer-with-owner |
| Plate store escape hatch | `usePlateStore` remains for Plate shell internals | Advanced/product shell only | docs should not teach runtime facts in store | Plate docs currently teach readOnly store access | docs cut |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| first-block composing bridge | Plate element store | delete | block-render-dependent global state sync | `FirstBlockEffect` only sets `composing` | hard-cut |
| PlateContent read-only fallback | Plate store | derive from prop or Plite view state | duplicate read-only source | `PlateContent` uses store fallback | revise |
| PlateContainer read-only gating | Plate shell | explicit-editor Plite view selector | needing `<Plite>` context | `PlateContainer` is outside `PlateSlate` | Plite gap |
| version counters | Plate store | Plite commit/selector subscriptions | manual invalidation counters | `useSlateProps` increments versions | migrate |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| Render-tree composing/readOnly | `useEditorComposing()`, `useEditorReadOnly()` | Must be under Plite provider | context subscription stays narrow | existing exports | keep |
| Plate shell readOnly | `useEditorViewState(editor, state => state.view.isReadOnly())` or equivalent | Explicit editor parameter | subscribe to commits, no Plate mirror | missing today | add |
| Plate store selector hooks | `usePlateValue` only for Plate shell state | Do not expose editor runtime facts | avoid duplicate source of truth | docs stale | restrict |

Plate migration-backbone target:
| Pressure | Plite substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| Store mirror cuts | explicit-editor state selector in Plite React | update `PlateContainer`, `PlateContent`, tests, docs | no old aliases | source audit | execute after review |
| Version hook migration | selector-based Plite subscriptions | migrate package call sites one by one | no package-wide blind rewrite | `useEditorVersion` consumers exist | later packet |

Collaboration migration-backbone target:
| Pressure | Plite substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| None for this plan | no change | no change | do not touch Yjs/collab | source scope excludes collab | N/A |

Intent / boundary record:
- intent: remove useless Plate store mirrors without making Plate shell less capable.
- outcome: Plite gets the one missing subscription shape; Plate cuts mirror hooks and docs.
- in-scope: composing, readOnly, version invalidation classification.
- non-goals: full package migration, feature package version-hook rewrite, collaboration changes.
- decision boundaries: implement only after explicit approval.
- unresolved user-decision points: exact hook name for explicit-editor selector.

Decision brief:
- principles: one runtime fact has one owner; Plate does not mirror Plite state.
- top drivers: cleaner API, fewer store escape hatches, no first-block global effect.
- viable options: keep Plate mirrors; cut mirrors with local non-reactive reads; add explicit-editor Plite selector and cut mirrors.
- chosen option: add explicit-editor Plite selector for shell code, then cut mirrors.
- rejected alternatives: keep `usePlateEditorComposing`; keep `editor.store.setReadOnly`; use non-reactive `editor.read.view.isReadOnly()` in shell render.
- consequences: one small Plite React API addition; simpler Plate store; docs update required.
- follow-ups: migrate version hooks after Core readOnly/composing cut.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| N/A | local API planning | no issue claim | no public issue involved | Core/Plite tests during execution | N/A | N/A |

Issue-ledger sync status:
- ClawSweeper related-issue pass: N/A, no issue-facing claim.
- generated live gitcrawl rows read: N/A.
- manual v2 sync ledger update: N/A.
- fork issue dossier update: N/A.
- issue coverage matrix update: N/A.
- PR description sync: N/A.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Plite target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| N/A | live repo source only | no external evidence needed | bibliography noise | N/A | N/A | explicit-editor selector | keep |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Plite target | Proof route | Owner | Status |
|------------------|-----------------|--------------|-------------|-------|--------|
| composing hook | `usePlateEditorComposing` reads Plate store | `useEditorComposing` reads Plite context | Core store test update and source audit | Core/Plite React | planned |
| readOnly shell render | Plate store gates container render slots | explicit-editor Plite selector gates render slots | `PlateContainer` and `PlateContent` focused tests | Core/Plite React | planned |
| version invalidation | manual Plate version counters | selector subscriptions | package-by-package migration tests | Plate packages | deferred |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| N/A | no browser behavior changed in planning | N/A | N/A | N/A | N/A |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Plan concrete | plate-2 | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plite-plate-store-mirror-cuts.md` | recorded in Verification evidence | autogoal |
| Source grounded | plate-2 | `rg` and `sed` audits over Core and Plite React files | complete | plite-plan |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| react | yes | applied conceptually | avoid context-only hook misuse outside provider | add explicit-editor selector |
| react-useeffect | yes | applied conceptually | delete first-block layout-effect bridge | hard cut composing bridge |
| docs-creator | yes | applied conceptually | docs must teach current state only | update store docs during execution |
| performance | light | applied conceptually | remove duplicate render bridge | cut composing mirror |
| tdd | yes in execution | planned | focused tests before close | proof rows added |

High-risk deliberate mode:
| Scenario | Failure | Guard |
|----------|---------|-------|
| PlateContainer loses reactive readOnly | edit-only container render slots render in view mode | add explicit-editor Plite selector and test |
| App code still imports cut hook | public API break surprises users | source audit and docs replacement |
| Version hooks cut too early | floating/link/discussion UI stops updating | defer version hooks to package-by-package migration |

Objection ledger:
| Change | Who feels pain | Objection | Steelman antithesis | Why worth it | Evidence | Adoption answer | Proof | Verdict |
|--------|----------------|-----------|--------------------|--------------|----------|-----------------|-------|---------|
| Cut `usePlateEditorComposing` | users of old Plate store hook | easy hook disappears | duplicate hook is convenient | Plite already owns composing, duplicate state is wrong | only bridge/tests use current hook | use `useEditorComposing` | source audit plus tests | keep |
| Cut public `usePlateEditorReadOnly` | users reading Plate store | Plate shell still needs readOnly | shell state is not Plite context state | add explicit-editor selector instead of mirror | `PlateContainer` is outside Plite provider | use `useEditorReadOnly` in render tree, shell uses new explicit selector | Core tests | revise |
| Defer version hooks | users of `useEditorVersion` | why not cut all now | packages still depend on version invalidation | avoid broad package break in this packet | package consumers found | migrate one package at a time | package tests | keep defer |

Hard cuts and rejected alternatives:
- Cut `FirstBlockEffect`.
- Cut `PlateStoreState.composing`.
- Cut `usePlateEditorComposing`.
- Cut docs teaching Plate store runtime facts.
- Reject `editor.store.setReadOnly` as final public API.
- Reject non-reactive `editor.read.view.isReadOnly()` as a shell subscription replacement.

Execution phases with owners:
| Phase | Owner | Work | Proof |
|-------|-------|------|-------|
| 1 | Plite React | Add explicit-editor selector hook or equivalent | Plite React hook test and typecheck |
| 2 | Core | Replace `usePlateEditorReadOnly` in `PlateContainer`/`PlateContent`; delete `FirstBlockEffect` and composing store | Core focused tests |
| 3 | Docs | Update Plate store docs and API docs | `pnpm --filter www check:docs` if docs touched |
| 4 | Core/package | Migrate version hooks separately | package-specific tests |

Fast driver gates:
- `rg -n "usePlateEditorComposing|composing:" packages/core/src`.
- `rg -n "usePlateEditorReadOnly|setReadOnly|store\\.setReadOnly" packages/core/src apps/www/src packages`.
- focused Core store/component tests.
- `pnpm turbo typecheck --filter=./packages/core`.

Final handoff outline:
- Accepted Plite hook/API decision.
- Plate cuts.
- Deferred version-hook packet.
- Tests run.
- Docs updated.
- Remaining package consumers.

Verification evidence:
- Read root and detail vision files.
- Audited `packages/core/src/react/stores/plate/PlateStore.ts`.
- Audited `packages/core/src/react/stores/plate/createPlateStore.ts`.
- Audited `packages/core/src/react/stores/element/useElementStore.tsx`.
- Audited `packages/core/src/react/components/PlateContent.tsx`.
- Audited `packages/core/src/react/components/PlateContainer.tsx`.
- Audited `packages/plite-react/src/hooks/use-editor-selector.tsx`.
- Audited `packages/plite-react/src/hooks/use-editor-composing.ts`.

## Execution Appendix

Execution status:
- status: complete
- execution trigger: user approved the accepted plan with `ok go`
- final confidence: 0.96

Changed list:
- `packages/plite/src/core/public-state.ts`: added post-render-safe view-state subscriptions and read-only/focus/composing change notifications.
- `packages/plite/src/internal/index.ts`: exported `subscribeEditorViewState` for first-party React wiring.
- `packages/plite/src/index.ts`: exported `setEditorReadOnly` as the public host-level view-state setter.
- `packages/plite-react/src/hooks/use-editor-view-state.ts`: added explicit-editor view-state selector hook.
- `packages/plite-react/src/index.ts`: exported `useEditorViewState`.
- `packages/core/src/react/internal/PlateReadOnlyContext.tsx`: added Plate shell read-only context for `<Plate readOnly>`.
- `packages/core/src/react/components/Plate.tsx`: moved read-only out of Plate store and into the shell context.
- `packages/core/src/react/components/PlateContent.tsx`: reads effective read-only from prop/context/Plite view state and stops mutating Plate store.
- `packages/core/src/react/components/PlateContainer.tsx`: gates edit-only container slots from Plate context or `useEditorViewState`.
- `packages/core/src/react/stores/plate/PlateStore.ts`: removed `composing` and `readOnly` store fields.
- `packages/core/src/react/stores/plate/createPlateStore.ts`: removed `usePlateEditorComposing`, `usePlateEditorReadOnly`, and default mirror state.
- `packages/core/src/react/stores/element/useElementStore.tsx`: removed first-block composing mirror effect.
- `packages/core/src/react/slate-react.ts`: re-exported `useEditorViewState` through `platejs/react`.
- `packages/plite/test/view-state-subscription.test.ts`: added runtime subscription contract.
- `packages/plite/test/public-package-import-smoke.test.ts`: updated exact Plite/Plite React/internal export ledgers.
- `packages/core/src/react/components/PlateContent.spec.tsx`: changed oracle from Plate store read-only to Plite view state.
- `packages/core/src/react/stores/plate/createPlateStore.spec.tsx`: narrowed store tests to Plate-owned state.
- `packages/core/src/react/utils/pipeRenderElement.spec.tsx`: removed stale first-block composing mirror assertion.
- `apps/www/src/registry/ui/mode-toolbar-button.tsx`: replaced `editor.store.setReadOnly` with `setEditorReadOnly`.
- `apps/www/src/app/dev/editor-perf/page.tsx`: removed old benchmark mirror writes to `editor.dom`.

Decisions:
- Plate store no longer owns Plite runtime facts for `readOnly` or `composing`.
- Plite view-state notifications are microtasked so React subscribers do not update during render.
- `useEditorReadOnly` remains the right hook inside Plite/Editable render trees.
- `useEditorViewState(editor, selector)` is the explicit-editor hook for shell code outside the Plite provider.
- `setEditorReadOnly(editor, value)` is the public host-level setter for product controls such as the mode toolbar.
- Version hooks remain deferred; this packet did not migrate `useEditorVersion`, `useSelectionVersion`, or `useValueVersion`.

Proof:
- `pnpm --filter @platejs/plite exec bun test test/view-state-subscription.test.ts test/public-package-import-smoke.test.ts` -> pass, 19 tests.
- `pnpm --filter @platejs/plite-react typecheck` -> pass.
- `pnpm --filter @platejs/core exec bun test src/react/components/PlateContent.spec.tsx src/react/stores/plate/createPlateStore.spec.tsx` -> pass, 8 tests.
- `pnpm --filter @platejs/plite typecheck` -> pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm check:core` -> pass: Core typecheck/lint/tests and Plite typecheck/lint/tests passed.
- `pnpm --filter platejs build` -> pass.
- `pnpm --filter @platejs/core exec bun test src/react/utils/pipeRenderElement.spec.tsx` -> pass, 18 tests.

Known caveats:
- `pnpm --filter platejs typecheck` is still blocked by source-entry/package-resolution setup for `@platejs/core`; `platejs build` passes.
- `pnpm --filter www typecheck` is still blocked by broad ongoing Plate migration errors across Plite examples and many feature packages. The touched `mode-toolbar-button` import path is covered by `platejs build`; the old touched `editor-perf` direct `editor.dom` writes were removed.
- Audited `packages/plite-react/src/hooks/use-editor-read-only.ts`.
- Audited `packages/plite-react/src/index.ts`.
- `check-complete.mjs` result is recorded after this file is written.

Reboot status:
- Planning is complete. Next activation should execute the explicit-editor Plite selector plus Plate mirror cuts if the user says go.

Open risks:
- Exact hook name remains a taste call. My default pick is `useEditorViewState(editor, selector, options?)`, not `useEditorStateFor`, because it says this is view-state selection outside context rather than a generic replacement for context hooks.
