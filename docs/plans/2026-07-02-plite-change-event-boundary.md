# Plite Change Event Boundary

Objective:
Plan Plite/Core change-event boundary; done when SlateExtensionPlugin node/text/redecorate ownership is source-scored with target API and proof gates.

Goal plan:
docs/plans/2026-07-02-plite-change-event-boundary.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Completion threshold:
- Planning-only Plite Plan closes when every explicit user concern is answered: `hasOptionListener`, `notifyNodeChange`, `notifyTextChange`, `redecorate`, `onNodeChange`, `onTextChange`, Plite gap, Core ownership, target API, proof gates, and review points.
- Score must be >= 0.92 with no dimension below 0.85.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plite-change-event-boundary.md` must pass.

Verification surface:
- Source audit only; no implementation was requested.
- Evidence: live reads of `packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.ts`, `packages/core/src/lib/utils/pipeOnNodeChange.ts`, `packages/core/src/lib/utils/pipeOnTextChange.ts`, `packages/core/src/react/components/ContentVisibilityChunk.tsx`, `packages/core/src/react/components/EditorMethodsEffect.ts`, `packages/plite/src/core/public-state.ts`, `packages/plite/src/core/listener-state.ts`, `packages/plite/src/core/extension-registry.ts`, `packages/plite/src/interfaces/editor.ts`, and `packages/plite/test/extension-methods-contract.ts`.

Constraints:
- Planning only.
- Do not implement Plite/Core changes in this pass.
- Keep current names as review anchors; no rename proposal except where needed for target API clarity.
- Core should not hide Plite primitive gaps in Plate glue.
- Plate product handlers may stay Plate-owned; substrate change detection should be Plite-owned.

Boundaries:
- Allowed edit: `docs/plans/2026-07-02-plite-change-event-boundary.md`.
- Reviewed source: `packages/core/src/**`, `packages/plite/src/**`, `packages/plite-react/src/**`.
- No issue ledger, browser proof, or package test run is required until accepted-plan execution.

Blocked condition:
- Block only if source cannot answer whether node/text/redecorate belong in Plite or Core. Source did answer it, so this pass is not blocked.

Plite Plan lane state:
- plite_plan_lane_status: complete
- current_pass: source-grounded boundary plan
- current_pass_status: complete
- next_pass: accepted-plan execution if user approves
- next_action: move Plite change-event substrate first, then simplify Core
- final_handoff_status: ready

Current verdict:
- verdict: revise
- confidence: 0.94
- keep / cut / revise call: cut `hasOptionListener`; move node/text change detection into Plite; keep Plate product handler dispatch in Core; do not put `redecorate` in Plite core.
- reason: Core is reconstructing substrate change events from committed operations because Plite exposes `onCommit` but not first-class node/text change events. That is a real Plite gap. Plate-specific plugin dispatch and read-only/handled semantics are still Core/Plate concerns.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `plite-plan` and `autogoal` skill instructions loaded before planning edit |
| Active goal checked or created | yes | Active goal created for Plite/Core change-event boundary |
| Source of truth read before edits | yes | `VISION.md`, Plite/Plate vision docs, and live Core/Plite source audited |
| `docs/solutions` checked for non-trivial existing-code work | yes | `docs/solutions/developer-experience/*plite*` list checked; no exact prior SlateExtension/change-event owner doc found |
| Live `Plate repo root` grounding needed for current-state claims | yes | All current-state claims cite current local files under `/Users/zbeyens/git/plate-2` |

Work Checklist:
- [x] First checkpoint copied every explicit user concern: `hasOptionListener`, `notifyNodeChange`, `notifyTextChange`, `redecorate`, `onNodeChange`, `onTextChange`, Plite gap, Core gap, and expose-if-missing.
- [x] Short objective plus lane outcome, pass schedule, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] One-pass-per-activation policy respected: this is one planning pass.
- [x] Live source grounding recorded for every current implementation claim.
- [x] Issue ledger / ClawSweeper pass skipped with concrete reason: no GitHub issue or external claim is being resolved.
- [x] Research and ecosystem synthesis skipped with concrete reason: this is an internal source-boundary plan, not external architecture research.
- [x] Intent/boundary record and decision brief complete.
- [x] Scorecard recorded with evidence; total score is 0.94 and no dimension is below 0.85.
- [x] Applicable implementation-skill review matrix applied or skipped with concrete reason.
- [x] Plite maintainer objection ledger complete for the breaking/paradigm change.
- [x] Verification workspace gate recorded for planning and accepted execution.
- [x] TDD marked N/A for planning-only pass; execution plan names required tests first.
- [x] Browser proof marked N/A for planning-only pass; execution plan names browser/API proof only if redecorate behavior changes.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Complete source-backed plan and run autogoal checker | This plan plus final `check-complete` command |
| Plite source, runtime, browser, package, public API, or issue-fix claim | yes | Record as planning-only and name accepted execution commands | No runtime code changed; proof gates listed below |
| Issue ledger or PR reference changed | no | No ledger/reference artifact changed | N/A: internal boundary plan only |
| Autoreview for uncommitted implementation changes | no | No implementation patch in this pass | N/A: only `docs/plans/**` changed |
| Final user-review handoff | yes | Emit concise handoff with decisions, proof gates, and review points | Final response |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plite-change-event-boundary.md` | Pending final command below |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | Live source reads listed in Verification surface | boundary decision |
| Related issue discovery | skipped | No issue/PR target in user request | source plan |
| Issue-ledger pass | skipped | No external issue claim | source plan |
| Intent/boundary and decision brief | complete | Intent and decision brief sections below | score |
| Research, ecosystem strategy, live-source refresh | skipped | No external system used as evidence | score |
| Performance/DX/migration/regression/simplicity pressure passes | complete | Scorecard and risk ledger below | objection ledger |
| Plite maintainer objection ledger | complete | Objection ledger below | execution handoff |
| High-risk deliberate mode | complete | Risks and mitigations below | execution handoff |
| Ecosystem maintainer pass | skipped | No external ecosystem dependency | execution handoff |
| Revision pass | complete | Chosen plan revises owner boundaries without renames | closure |
| Issue sync accounting | skipped | No issue ledger edited | closure |
| Closure score and final gates | complete | Score 0.94; command gate remains | final handoff |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.93 | Plan keeps lazy event derivation and avoids unconditional previous snapshot work |
| Plite-close unopinionated DX | 0.20 | 0.95 | Substrate change events move to Plite; Plate handler context stays Plate |
| Plate and collaboration migration backbone | 0.15 | 0.93 | Events become root-aware commit substrate usable by Plate and collaboration later |
| Regression-proof testing strategy | 0.20 | 0.95 | Execution gates require Plite hook tests plus Core handler compatibility tests |
| Research evidence completeness | 0.15 | 0.92 | Internal source evidence is enough; external research intentionally not used |
| shadcn-style composability and minimalism | 0.10 | 0.94 | Deletes `hasOptionListener` and avoids a new Plate wrapper surface |

Source-backed architecture north star:
- target shape: Plite owns commit-derived node/text change events; Plate owns plugin handler dispatch, plugin context, read-only policy, and handled/stop semantics.
- source evidence: `SlateExtensionPlugin.ts` reconstructs previous/current values; `pipeOnNodeChange.ts` and `pipeOnTextChange.ts` are Plate plugin pipelines; `public-state.ts` already owns commit listeners, previous snapshot/index capture, and root-aware commit construction.
- rejected drift: do not keep `hasOptionListener`, do not move Plate plugin context into Plite, do not put a generic `redecorate()` in Plite core.
- migration posture: first add Plite substrate events, then route Core handlers through one Plate-installed extension, then delete `SlateExtensionPlugin` event/options glue.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| Plite extension node changes | `defineEditorExtension({ onNodeChange(ctx) {} })` or setup output equivalent | Raw editor extensions can observe node-level committed changes without reverse-engineering operations | Breaking additive API; no compat alias needed | Plite already exposes `onCommit`; Core currently reconstructs node changes | accept |
| Plite extension text changes | `defineEditorExtension({ onTextChange(ctx) {} })` or setup output equivalent | Raw extensions can observe text diff with current and previous text | Additive API; should not stop propagation | Core currently computes `prevText` manually from text operations | accept |
| Plate plugin handlers | Keep `handlers.onNodeChange` and `handlers.onTextChange` as Plate plugin handlers | Product plugins keep Plate context and handled semantics | Internals reroute through Plite events | `pipeOn*Change` depends on `getEditorPlugin`, read-only policy, and handler return value | keep |
| Plate controlled callbacks | Store callbacks should be wired into the same Plate dispatcher, not `SlateExtensionPlugin` options | `<Plate onNodeChange onTextChange>` still works | No public API change required | `ContentVisibilityChunk.tsx` syncs callbacks into plugin options today | revise |
| Redecorate | Do not add to Plite core; if needed, expose a Plite React decoration/projection refresh API and let Plate adapt | Decoration refresh is React/projection host behavior, not raw document substrate | Decide later whether Plate keeps `editor.api.redecorate()` or moves to `editor.api.decorations.refresh()` | `EditorMethodsEffect.ts` already installs mounted `redecorate`; Plite test proves latest callable API override | revise |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Change detection | `SlateExtensionPlugin.notifyCommitChanges` | Plite commit event layer derived from previous and current snapshots/indexes | Operation-specific reverse reconstruction in Core | `notifyCommitChanges` handles insert/remove/set/text manually | move-to-plite |
| Listener need detection | Plite listener state | Include extension node/text listeners in the previous snapshot/index need gate | Missing previous state when only extension listeners exist | `hasListeners()` does not count extension commit listeners | fix-plite-gap |
| Handler dispatch | Core utilities | One Plate-installed extension calls `pipeOnNodeChange`/`pipeOnTextChange` and controlled callbacks | Plate plugin context leaking into Plite | `pipeOn*` uses `editor.runtime.pluginCache` and `getEditorPlugin` | keep-in-core |
| `hasOptionListener` | Core plugin option workaround | Delete by routing controlled callbacks through Plate dispatcher state | Two listener owners | `ContentVisibilityChunk` writes `SlateExtensionPlugin` options | hard-cut |
| `isElementStateEmpty` | `SlateExtensionPlugin` | Keep in Core under a metadata/plugin owner, not Plite | Plite depending on Plate plugin metadata | Uses `editor.runtime.pluginCache.node.isMetadataProp` | move-within-core |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| `ContentVisibilityChunk` callbacks | Subscribe/update Plate dispatcher, not plugin options | Store callbacks are product callbacks | No per-render extension churn if callbacks are null | Current layout effect writes plugin options | revise |
| `EditorMethodsEffect` redecorate | Mounted host extension remains latest-wins | Runtime host method should be mounted by React layer | No-op default should die after call-sites are safe | Plite callable API override contract exists | keep-but-clean |
| Plite React decorations | Optional future `decorations.refresh()`/projection refresh | React package owns render invalidation | No raw Plite core dependency on React projections | `redecorate` comes from Plate store/render layer | route-to-plite-react |

Plate migration-backbone target:
| Pressure | Plite substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| Node/text changes | Plite emits typed committed change contexts | Core maps contexts to plugin handlers and store callbacks | Do not make Plite know Plate plugin keys | `BasePlugin.handlers` is Plate-specific | accept |
| Redecoration | Plite React exposes render/projection refresh if needed | Plate may keep or rename its API in Plate v2 review | Do not put no-op redecorate into raw Plite | Current no-op is in `SlateExtensionPlugin` | revise |
| `SlateExtensionPlugin` | No substrate behavior remains | Split/delete after migration | Do not rename first; keep review anchors until code is clean | Pre-renaming review policy | accept |

Collaboration migration-backbone target:
| Pressure | Plite substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Remote/local change classification | Commit metadata and typed change events | Yjs/collab adapters can use `commit.metadata` plus event contexts later | Do not design Yjs here | Commit metadata exists in Plite | defer |

Intent / boundary record:
- intent: Remove SlateExtensionPlugin as a substrate-change owner and expose the missing Plite primitive.
- outcome: Plite owns committed node/text change derivation; Core owns Plate plugin dispatch.
- in-scope: `hasOptionListener`, `notifyNodeChange`, `notifyTextChange`, `onNodeChange`, `onTextChange`, `redecorate` ownership.
- non-goals: Full Plate v2 API rename, public docs rewrite, implementation in this pass, Yjs/collab event design.
- decision boundaries: Plite may add raw event hooks; Plate must not wrap Plite editor APIs under Plate names; React decoration refresh belongs to Plite React or Plate React, not Plite core.
- unresolved user-decision points: Whether Plate keeps `editor.api.redecorate()` as product API for now or hard-renames it during Plate v2 cleanup.

Decision brief:
- principles: substrate change detection belongs to Plite; product handler policy belongs to Plate; no fake compat aliases.
- top drivers: delete dirty Core reconstruction, make events reusable outside Plate, keep Plate plugin context out of Plite.
- viable options: keep current Core glue; add Plite diff helpers only; add Plite extension node/text hooks; move all SlateExtensionPlugin into Plite.
- chosen option: add Plite extension node/text hooks backed by commit/snapshot/index data, then route Plate handlers through one Core dispatcher.
- rejected alternatives: keep `hasOptionListener`; move `pipeOn*Change` to Plite; add raw `editor.api.redecorate()` to Plite core.
- consequences: Plite runtime gets a real event primitive; Core loses a dirty plugin; execution must be test-first because previous/current diff semantics are easy to get wrong.
- follow-ups: Plate v2 review should decide final public decoration refresh name.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| internal Core/Plite boundary | architecture | `SlateExtensionPlugin` should not own substrate change detection | No public GitHub issue target | local plan and later tests | N/A | N/A |

Issue-ledger sync status:
- ClawSweeper related-issue pass: skipped; no issue target.
- generated live gitcrawl rows read: skipped; no public issue/PR target.
- manual v2 sync ledger update: skipped; this is planning only.
- fork issue dossier update: skipped; no external issue claim.
- issue coverage matrix update: skipped; no external issue claim.
- PR description sync: skipped; no PR work in this pass.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Plite target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| Plite current source | local source | commit listeners and snapshots | external overfitting | previous/current event derivation | Core operation reconstruction | node/text extension hooks | accept |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Plite target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| Node handler fires | Plate plugin `handlers.onNodeChange` fires after node operations | Plite event triggers Core dispatch | migrate existing `SlateExtensionPlugin.spec.tsx` assertions | Core | planned |
| Text handler fires | Plate plugin `handlers.onTextChange` sees current and previous text | Plite event triggers Core dispatch | migrate existing text handler spec | Core + Plite | planned |
| Controlled callbacks | `<Plate onNodeChange onTextChange>` reaches callback | Store callbacks route through dispatcher | update `PlateContent.spec.tsx` | Core React | planned |
| Redecorate | Mounted editor API exists when React editor is mounted | Host extension or decoration refresh owner | `EditorMethodsEffect.spec.tsx` and navigation feedback spec | Core React / Plite React | planned |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| Decoration refresh | navigation feedback highlight invalidates decorations | Chromium focused if API changes | focused browser row only if redecorate semantics change | no stale decoration | planned |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Planning artifact complete | plate-2 | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plite-change-event-boundary.md` | pending until run | plite-plan |
| Plite event hooks work | plate-2 | `pnpm --filter @platejs/plite test -- change-events` or focused Bun/node test names created in execution | future execution | auto/plite-plan |
| Core handler parity | plate-2 | `pnpm --filter @platejs/core exec bun test src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx src/react/components/PlateContent.spec.tsx` after migration | future execution | auto/plate-next |
| Core package types | plate-2 | `pnpm check:core` after execution | future execution | auto/plate-next |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | no | skipped | Not a React implementation pass | N/A |
| performance | yes | complete | Avoid unconditional previous snapshot capture; only derive change events when listeners exist | Add listener need gate |
| tdd | yes | complete | Execution must add Plite event tests before Core cleanup | Test-first gate |
| shadcn | no | skipped | No UI/component surface | N/A |
| react-useeffect | yes | complete | `ContentVisibilityChunk` currently uses layout effects for callback sync; execution should avoid new render churn | Dispatcher must be stable |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| Wrong previous node/text | deriving from current operation only | handler sees bogus prev value after normalization or replace | derive from previous snapshot/index when needed | Plite set/insert/remove/text tests | planned |
| Extra perf cost | always snapshot for extension listeners | large-doc commit regression | include node/text listeners in exact need gate, not all extensions | focused perf check if hot path touched | planned |
| Plate context leaks into Plite | moving `pipeOn*Change` wholesale | raw Plite depends on Plate plugin cache | Plite emits raw contexts; Core dispatches Plate handlers | source review | planned |
| Redecorate wrong owner | putting no-op `redecorate` in Plite core | raw editor exposes React/projection concept | route to Plite React/Plate React owner | API review | planned |

Plite maintainer objection ledger:
| Change | Objection | Tradeoff | Evidence | Migration/docs/proof answer | Verdict |
|--------|-----------|----------|----------|-----------------------------|---------|
| Add node/text event hooks | Could bloat Plite extension surface | It removes Core reverse reconstruction and helps all hosts | Core currently has `notifyCommitChanges` | Keep hooks raw and non-Plate-specific | accept |
| Delete `hasOptionListener` | Store callbacks need a route | A single Plate dispatcher is cleaner than plugin options | `ContentVisibilityChunk` writes options today | Preserve callback API through dispatcher tests | accept |
| Do not move `redecorate` to Plite core | Agents wanted SlateExtension behavior in Plite | Redecorate is render/projection, not document substrate | `EditorMethodsEffect` mounts React callback | Put refresh in Plite React/Plate React owner | accept |
| Keep `isElementStateEmpty` out of Plite | It feels like element substrate | It uses Plate plugin metadata policy | Depends on `editor.runtime.pluginCache.node.isMetadataProp` | Move within Core or leave until plugin owner cleanup | accept |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| `hasOptionListener` | cut | two listener owners and plugin-option callback smuggling | low after dispatcher exists | current source lines in `SlateExtensionPlugin.ts` and `ContentVisibilityChunk.tsx` | execution |
| Core `notifyCommitChanges` reconstruction | cut | substrate change derivation belongs in Plite | medium; needs Plite tests | current source handles op cases manually | execution |
| Plite `redecorate()` core API | reject | render/projection host concept, not raw document API | low | mounted by React effect today | Plate v2 decoration API review |
| Move `pipeOnNodeChange`/`pipeOnTextChange` to Plite | reject | Plate plugin context and handled semantics | high and wrong | utilities use `getEditorPlugin` and plugin cache | keep Core |

Plan deltas from review:
- None yet.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Keep `editor.api.redecorate()` or rename to decoration refresh in Plate v2? | Public Plate API shape | user/API review after Core cleanup | plate-next | open-but-not-blocking |
| Should Plite event hooks be top-level `onNodeChange` or nested under `onCommit` output? | Public Plite extension shape | implementation type spike | plite-plan execution | open-but-plan-recommended |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| 1 | plite-plan execution | Add typed Plite node/text change contexts and listener gating | User accepts plan | Plite event tests pass | focused Plite tests |
| 2 | plate-next | Route Core plugin handlers and store callbacks through one Plate dispatcher | Phase 1 green | `hasOptionListener` deleted | Core focused tests |
| 3 | plate-next | Split/delete `SlateExtensionPlugin` leftovers | Phase 2 green | Event/options glue gone; only true Core metadata helper remains or plugin dies | `pnpm check:core` |
| 4 | plate-next/plite-plan | Decide redecorate final owner/name | Phase 2 green | no no-op raw substrate method | focused React/browser proof if behavior touched |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | plate-2 | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plite-change-event-boundary.md` | plan/template integrity | pending |
| Plite behavior check | plate-2 | focused Plite change-event tests after implementation | runtime event behavior | future |
| Core parity check | plate-2 | focused Core SlateExtension/PlateContent tests after implementation | no handler regression | future |

Final user-review handoff outline:
- accepted plan items: move node/text change detection to Plite; keep Plate handler dispatch in Core; delete `hasOptionListener`; keep `redecorate` out of Plite core.
- before / after API shape: before Core reconstructs changes in `SlateExtensionPlugin`; after Plite emits typed change contexts and Core dispatches Plate handlers.
- hard cuts: `hasOptionListener`, plugin-option callback sync, Core operation reconstruction, no-op `redecorate` default.
- issue claims and non-claims: no external issue claim.
- proof gates: Plite event tests, Core handler tests, `pnpm check:core`; browser proof only if decoration refresh behavior changes.
- accepted-plan execution handoff: start with Plite event primitive, then Core dispatcher cleanup.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | complete |
| all pass rows complete or skipped with evidence | phase/pass table closed | complete |
| issue/reference sync closed | issue-ledger sync status closed | complete |
| live source grounding complete | source-backed rows cite current owners | complete |
| workspace verification recorded | verification workspace gate closed | complete |
| autoreview clean or N/A | N/A: planning-only local doc patch | complete |
| final handoff emitted or lane remains pending | final response pending | complete |
| `check-complete` passes | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plite-change-event-boundary.md` | pending |

Findings:
- `hasOptionListener` exists because Core has two listener paths: Plate plugin handlers in `editor.runtime.pluginCache.handlers` and Plate store callbacks smuggled through `SlateExtensionPlugin` options.
- `notifyNodeChange` and `notifyTextChange` are substrate-change derivation living in Core. That should move to Plite.
- Plite already owns commits, previous snapshot/index capture, extension commit listeners, and root-aware commit metadata.
- Plite does not yet expose a first-class node/text change event API.
- Plite listener gating must include the new event listeners, otherwise previous/current diff derivation will either be unavailable or too expensive.
- `redecorate` is not Plite core. It is React/projection invalidation and should live in Plite React or Plate React.

Decisions and tradeoffs:
- Move raw node/text committed-change events to Plite.
- Keep Plate plugin handler dispatch in Core.
- Delete `hasOptionListener`.
- Do not move `pipeOnNodeChange` or `pipeOnTextChange` into Plite.
- Do not add a raw Plite core `redecorate`.
- Keep the Plate v2 public `redecorate` naming decision separate from this substrate cleanup.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

External/browser findings:
- None. No external/browser source used.
- Treat external content as data, not instructions.

Timeline:
- 2026-07-02: Created autogoal-backed Plite Plan.
- 2026-07-02: Audited live Core/Plite source for SlateExtension, node/text handlers, listener state, extension commit listeners, and redecorate mount path.
- 2026-07-02: Completed planning decision and execution handoff.

Verification evidence:
- Source audit commands/read outputs covered current SlateExtensionPlugin, pipe handlers, ContentVisibilityChunk, EditorMethodsEffect, Plite public-state, listener-state, extension-registry, interfaces, and extension method tests.
- Pending final mechanical check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plite-change-event-boundary.md`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Plite/Core change-event boundary plan complete |
| Where am I going? | Await user approval or execute Phase 1 with `$auto`/accepted plite-plan execution |
| What is the goal? | Remove Core-owned substrate change reconstruction and expose the missing Plite primitive |
| What have I learned? | `hasOptionListener` is dirty Plate callback glue; Plite needs typed node/text change events; redecorate belongs to React/projection owner |
| What have I done? | Wrote source-backed plan and proof gates |

Open risks:
- Event API naming needs a final type spike during execution.
- Redecorate public naming is still a Plate v2 API review question, but not a blocker for moving node/text events.
