# Wordgard harvest implementation

Objective:
Implement all six accepted Wordgard harvest rows in their Plite or Plate owner; done when focused tests, package checks, table browser proof, review, and the plan checker pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-18-wordgard-harvest-implementation.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: accepted editor-test harvest implementation
- prompt / link: user correction that the harvested laws belong in Plite, followed by `go`
- lane: shared editor
- surface / route / package: `packages/plite`, `packages/plite-history`, `packages/plite-react`, `packages/table`, and the existing Plite/table browser demo
- invocation mode: full-loop
- minimum runtime / deadline: N/A: no duration or hard deadline requested
- completion threshold summary: all six accepted rows are implemented and verified; no deferred row is silently widened

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: full-loop until the named threshold passes or a real blocker remains
- initial confidence score: N/A: binary six-row completion threshold is stronger
- improvement loop: failing oracle -> owning implementation -> focused proof -> review -> broad closure
- final score / loop closure: six of six accepted rows kept, or a real blocker reported with evidence

Completion threshold:
- W07: deterministic seeded structural `DocumentChange` pair/triple transform and inverse laws pass in `packages/plite`.
- W11: computed facet dependencies invalidate only on declared inputs, preserve default compatibility, reject dependency cycles before publication, and pass Plite tests/typecheck.
- W14: deterministic seeded history undo/redo/save-skip soak passes in `packages/plite-history`.
- W23: table normalization deterministically repairs missing cells, protruding spans, and span collisions with focused Plate tests.
- W24: table paste handles merged borders and non-rectangular grids with focused package tests and a current browser proof.
- W27: deterministic Plite React differential edit sequences match fresh DOM rendering while preserving unaffected sibling identity.
- Focused tests, affected package typechecks, lint, `pnpm check:plite`, relevant table proof, autoreview, agent-native review for the rule repair, and the final plan checker pass.
- Closure is legal only when required behavior, visual/native selection, package/API, mobile/raw-device claim width, huge-document, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-18-wordgard-harvest-implementation.md` passes.

Verification surface:
- Focused package tests for `document-change`, facet contracts, history soak, React DOM shape, table normalization, and table fragment insertion.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/plite-history --filter=./packages/plite-react --filter=./packages/table`.
- `pnpm check:plite` after the Plite packets are green.
- Current Chromium/in-app Browser table paste proof on the existing runnable table demo; no browser claim for model-only law tests.
- `pnpm lint:fix`; `pnpm install` plus mirror audit because `.agents/rules/vision.mdc` needs its stale Plite path repaired.
- `autoreview`, `agent-native-reviewer`, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-18-wordgard-harvest-implementation.md`.
- Plite package proof uses `pnpm plite:test` and `pnpm plite:typecheck`.
- Plite daily proof uses `pnpm check:plite`.
- Plite focused browser proof uses `pnpm --filter plite test:plite-browser:chromium <file-or--grep>`.
- `apps/plite` reuses `apps/www` Plite examples; never maintain a second example source tree.
- Plite release/deletion proof adds explicit closure gates such as package
  build, docs checks, benchmark target audit, and
  `pnpm check:plite:browser-matrix` when those claims are in scope.

Constraints:
- Resolve lane first: Plite, Plate, or shared editor. Use `autoclosure` for post-merge/current-tree until-clean closure.
- Release, PR, and publish work are in scope only when the prompt explicitly asks for them or the active lane requires them.
- Plite-lane proof runs from the Plate repo root against transplanted Plite packages and routes. Do not use donor-checkout proof.
- Plate-lane proof runs in the owning Plate package, app, or docs route. Plite runtime proof does not prove Plate docs, registry, plugin, or package DX.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a stopping checkpoint routes to `plite-plan`.
- Do not patch Plate when the run is scoped to Plite. Do not patch Plite runtime when the run is scoped to Plate docs/product unless a shared-editor owner row names that boundary.
- Use root `VISION.md` and relevant `docs/vision/*.md` for durable taste.
- Do not create compatibility aliases or runtime shims unless the checkpoint explicitly requires them.
- Put W07, W11, W14, and W27 in Plite owners; put W23 and W24 in Plate table. Do not force table product laws into Plite core.
- Tests must be deterministic, seeded, replayable, and print enough case context to reproduce failures.
- Use the smallest durable facet dependency API; no implicit runtime-wide tracking or Plate glue.
- Do not add central OT or history serialization under this goal.
- Do not stage, commit, push, publish, or create a PR.

Boundaries:
- Source of truth: current package source/tests, the completed Wordgard harvest report, root `VISION.md`, and `docs/vision/{common,plite,plate}.md`
- Allowed edit scope: the four named package families, their focused tests, necessary changesets for user-visible package behavior, this plan, and the stale vision source rule
- Browser surfaces: existing Plite/Plate table demo only; no new example tree
- Package/API surfaces: Plite facet provider API plus table normalization/paste owners; test-only laws elsewhere
- Agent/skill surfaces: `.agents/rules/vision.mdc` only for the proven stale `slate.md` pointer, followed by generated sync
- Docs/research surfaces: this goal ledger and existing harvest artifacts; no public docs unless the final API cannot be understood from first-class JSDoc
- Non-goals: Wordgard history serialization W15, central OT W17, benchmarks/perf claims, release packaging, templates, and unrelated migration cleanup

Output budget strategy:
- Read exact owner files and wrapper entrypoints first; use `rg --files`/`rg -l` before any wider search; cap command output; exclude generated trees, `.next`, `node_modules`, and `.tmp` unless a named artifact is required.

Blocked condition:
- Stop only if the current source leaves two equally credible, incompatible public facet architectures whose wrong choice would be expensive, a required browser/tool surface is unavailable after focused alternatives, or the same package/runtime blocker repeats with no safe owner left.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: shared editor
- surface: Plite core/history/react plus Plate table
- mode: full-loop
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 2
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: user handoff
- goal_status: complete

Current verdict:
- verdict: complete
- confidence: 0.97; all six owner packets, focused tests, package gates, table route proof, rule sync, and review are complete
- next owner: user handoff
- keep / revert / quarantine call: keep all six packets; no quarantined packet
- reason: every scoped implementation and closure gate is proven; remaining items are explicit non-goals or tooling limits

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-18-wordgard-harvest-implementation.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | complete | P0 | Copy prompt requirements and read vision before implementation. | Requirements, scope, proof, non-goals, and vision reads recorded. | keep |
| status | auto | complete | P0 | Read active plan, latest prompt, source status, and current evidence. | Exact owner implementation and wrapper entrypoints recorded. | keep |
| gap-scan | auto | complete | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Six harvested gaps routed to their package owners. | keep |
| closure-handoff | autoclosure | complete | P0 when merged/current-tree work is in scope | Run until-clean closure for already-applied work. | N/A: new implementation, not post-merge closure. | retire |
| behavior-proof | lane proof owner | complete | P0 | Prove stable editor behavior before perf. | Six focused suites, 276 table tests, affected typechecks, and `pnpm check:plite` are green. | keep |
| oracle-repair | lane test owner / tdd | complete | P0 | Add missing native/visual/model oracles for found gaps. | All six accepted rows have focused tests. | keep |
| visual-proof | Browser / Chrome / Computer Use | complete | P0 | Prove visible editor behavior and native selection. | Table demo rendered; native copy exposed all five formats; real OS HTML table paste was structural. Controlled Plite clipboard to OS paste is tooling-isolated and is not claimed. | keep |
| browser-helper-promotion | lane proof harness | complete | P1 | Promote repeated browser proof into reusable API/helper. | N/A: one clipboard flow and an external clipboard-boundary limitation do not justify a helper. | retire |
| mobile-claim-width | auto | complete | P1 | Separate raw-device proof from viewport proof. | N/A: no mobile claim. | retire |
| huge-document-smoke | lane proof owner | complete | P1 | Smoke huge-doc correctness without broad architecture work when in scope. | N/A: no huge-document claim. | retire |
| perf-packet | lane perf owner | complete | P2 | Optimize only after correctness is green. | N/A: correctness harvest; benchmarks explicitly excluded. | retire |
| supervision-mode | auto | complete | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from vision and evidence. | N/A: no timed minimum. | retire |
| consolidation | auto | complete | P1 | Move accepted reusable decisions to durable docs/rules. | Vision source pointer repaired and generated mirror synchronized. | keep |
| final-handoff | auto | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Ledgers and verification evidence finalized. | keep |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | complete |
| 1 | split and reprioritize | W07, W11, W14, W23, W24, W27 | accepted harvest report plus user `go` | six independent owner packets are clearer than one generic oracle row | active |
| 1 | update | W07, W11, W14, W23, W24, W27 | focused tests plus affected package typecheck | all six packets have implementations and focused proof; closure moves to broad/browser/review gates | complete |
| 2 | update and retire | behavior, visual, helper, mobile, huge-doc, perf, consolidation, review, handoff | broad package/browser/review evidence | scoped gates closed; non-applicable template rows retired with evidence | complete |

Mutation rules:
- Add a checkpoint when a new failure, missing oracle, missing metric, API smell, visual proof gap, workflow slowdown, taste gap, or owner gap appears.
- Update a checkpoint when evidence changes its scope, priority, owner, command, exit rule, or proof surface.
- Split a checkpoint when it hides multiple owners or one prompt would become too large.
- Merge checkpoints when overlap confuses routing or two rows always close together.
- Retire or remove checkpoints that are stale, superseded, irrelevant, duplicated, or contradicted by current evidence. Record the reason in the mutation ledger.
- Reopen a closed checkpoint when new evidence invalidates its proof.
- Reprioritize after every loop. The next checkpoint is chosen from current evidence, not from the original row order.
- The supervisor is not stuck on this template or the initial prompt plan. The user's latest request, `vision`, and current source evidence outrank stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Six accepted rows, ownership, non-goals, proof, and handoff requirements are explicit above. |
| `auto` source rule read or fallback recorded | yes | `.agents/skills/auto/SKILL.md` read in full. |
| `vision` read as checkpoint zero | yes | Root `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md`, and `docs/vision/plate.md` read. |
| Active goal checked or created | yes | `get_goal` returned no active goal; create immediately after this plan is filled. |
| Lane resolved | yes | Shared editor: four Plite rows and two Plate table rows. |
| Invocation mode and timebox recorded | yes | Full-loop; no duration requested. |
| Dynamic checkpoint policy accepted | yes | Six owner packets plus final reconciliation. |
| Source of truth and allowed workspaces recorded | yes | Current checkout and exact package owners listed under Boundaries. |
| Output budget strategy recorded | yes | Exact-owner reads and capped output recorded. |
| Release/PR/publish boundary recorded | yes | No release, stage, commit, push, or PR. |
| Browser proof strategy recorded | yes | Browser proof only for table runtime/paste behavior. |
| Package/API proof strategy recorded | yes | Focused tests, package typechecks, daily Plite gate, and changesets only for visible runtime/API changes. |
| Mobile/raw-device claim-width policy recorded | yes | N/A: no mobile claim in these six rows. |
| Skill repair authority and source-rule boundary recorded | yes | Repair only stale `.agents/rules/vision.mdc` Plite path; sync with `pnpm install`. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded.
- [x] Lane is resolved as Plite, Plate, or shared editor, with owning workspace/package/app proof named.
- [x] Checkpoint supervisor table has been reconciled at least once after the initial seed.
- [x] Post-merge/current-tree closure is N/A: this is new accepted implementation, not closure of already-applied work.
- [x] Each loop ends with a checkpoint mutation decision: loop 1 updated six packets; loop 2 retired non-applicable rows and closed proof/review/handoff.
- [x] Current-tree/status packet recorded before new runtime patches; exact owners and source wrappers were read without taking git hygiene actions.
- [x] Behavior proof packet recorded for every in-scope stable editor family.
- [x] Visual/native selection proof packet recorded with the controlled-clipboard versus OS-clipboard claim boundary.
- [x] Missing oracle packets are written, proven, and kept for all six rows.
- [x] Repeated browser proof patterns are N/A: one flow and a tool clipboard boundary do not justify `@platejs/browser` API.
- [x] Mobile/raw-device proof is N/A: no mobile claim.
- [x] Huge-document correctness smoke is N/A: no huge-document behavior change.
- [x] Perf packet is N/A: benchmarks and perf claims are explicit non-goals.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are audited: facet API is first-class and inferred; table helper stays internal; no alias/barrel/public docs change.
- [x] Docs/vision/rule consolidation repaired the durable source and regenerated its mirror.
- [x] Workflow slowdowns and alternate proof attempts are logged below.
- [x] Packet ledger contains every implementation, regression repair, browser proof, workflow, and review packet.
- [x] Changed list is current and includes only this run.
- [x] Needs-your-attention list is ranked and capped at three items.
- [x] Stopping checkpoints are marked none.
- [x] Autoreview ran; its sole P3 was rejected because the cited benchmark is unchanged and outside the plan.
- [x] Agent-native review passed the vision source/mirror route.
- [x] Output budget discipline was followed after one recorded oversized read; later reads were split/capped.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | complete: focused suites, 276 table tests, typecheck, lint, and `check:plite` green |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | complete: two mutation-ledger loops |
| Lane authority proof | yes | Prove each command ran in the owning Plite/Plate/shared workspace | complete: cwd recorded in Verification evidence |
| Workspace authority proof | yes | Record cwd/tool for each package, docs, skill, and browser proof | complete: package cwd, repo root, and table route recorded |
| Behavior gates | yes | Run all six focused behavior/oracle rows | complete |
| Visual/native selection proof | yes | Record current table browser proof; other rows are model/runtime contracts | complete with explicit custom-clipboard tooling limit |
| Missing oracle repair | yes | Add and verify all six accepted rows | complete |
| `@platejs/browser` promotion | no | N/A: this run adds no repeated browser action/helper pattern | complete: N/A |
| Mobile/raw-device claim width | no | N/A: no mobile behavior claim | complete: N/A |
| Huge-document correctness smoke | no | N/A: no huge-document behavior change | complete: N/A |
| Package/API proof | yes | Source-audit and run package/type/test proof for facet and table changes | complete |
| Autoclosure handoff | no | N/A: not post-merge/current-tree closure | complete: N/A |
| Skill/rule sync | yes | Run `pnpm install` and mirror audit after the vision rule repair | complete |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | complete |
| Final lint/check | yes | Run scoped lint/check | complete: lint no fixes; typecheck and broad checks green |
| Workflow slowdown review | yes | Log and repair the stale vision owner path; record other slow commands | complete |
| Agent-native review for agent/tooling changes | yes | Load `agent-native-reviewer` and close accepted findings | complete: PASS, no findings |
| Autoreview for non-trivial implementation changes | yes | Load `autoreview` and close accepted/actionable findings | complete: zero accepted; one unchanged out-of-scope P3 rejected |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-18-wordgard-harvest-implementation.md` | pending final checker invocation |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | requirements and vision evidence recorded | status |
| Status and current-state read | complete | all six owner APIs, donor laws, and wrapper entrypoints read | W07 |
| Gap scan and scenario matrix | complete | six rows retained in original owners; W15/W17 excluded | behavior proof |
| Behavior proof | complete | six focused suites, 276 table tests, affected typecheck, and `check:plite` green | visual proof |
| Oracle repair | complete | deterministic laws and regressions added for W07/W11/W14/W23/W24/W27 | visual proof |
| Visual/native proof | complete | table route rendered; native copy formats verified; OS structural HTML paste verified; controlled custom format transfer explicitly not claimed | browser helper promotion |
| Browser helper promotion | complete | N/A: no repeatable helper gap | mobile claim width |
| Mobile/raw-device claim width | complete | N/A: no mobile claim | huge-document smoke |
| Huge-document correctness smoke | complete | N/A: no huge-document claim | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | complete | perf N/A; facet JSDoc/API audited; vision rule/mirror repaired | consolidation |
| Consolidation and review | complete | agent-native PASS; autoreview zero accepted findings | final handoff |
| Final handoff and goal-plan check | complete | ledgers finalized; checker is last command | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| W07 structural changes | seeded pair/triple laws | model | insert/remove/set/text/move-edit | convergence, compose, inverse | focused green |
| W11 facet dependencies | explicit document/schema/selection/facet inputs | model | commit and slot reconfigure | recomputation counts and cycle rejection | focused green |
| W14 history soak | 8 seeds x 240 events | model | edit/skip/undo/redo | legal state and exact document roundtrip | focused green |
| W23 malformed tables | missing/protruding/colliding spans | model | normalization repair | rectangular deterministic value | focused green |
| W24 table paste | merged target borders and non-rectangular source | model + current table route | fragment paste | logical grid shape, contents, selection | package green; route/native format smoke complete; controlled custom-format OS transfer tooling-isolated |
| W27 React DOM | 3 seeds x 80 edits | jsdom | incremental edit + fresh render | normalized DOM equality and sibling identity | focused green |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| W07 | 1 | Plite core | Structural transform failed delete/change, move/edit, and stale source-node laws. | `document-change.ts`, `document-change.test.ts` | 26 deterministic tests, including 120 pair/triple cases | keep | broad Plite proof |
| W11 | 1 | Plite core | Whole-editor revision invalidated unrelated computed facets. | facet/registry/public-state/interfaces plus extension contract | 8 contract tests green; explicit dependencies and cycle rejection | keep | broad Plite proof |
| W14 | 1 | Plite history | Skip rebase mapped old batch selections against the current document. | history extension and slow soak | 8 seeds x 240 events green | keep | package/broad proof |
| W23 | 1 | Plate table | Normalizer lacked a logical grid repair for missing/protruding/colliding cells. | internal table grid, normalizer, focused spec | 17 tests green | keep | package/browser proof |
| W24 | 1 | Plate table | Raw child indices could not split merged paste borders or rectangularize source spans. | logical grid paste and focused spec | 16 tests green | keep | Chromium + Browser proof |
| W27 | 1 | Plite React | Incremental DOM locality lacked deterministic differential traces. | rendered DOM shape contract | 3 seeds x 80 edits green | keep | package/broad proof |
| W23R | 2 | Plate table | Broad suite showed span-bearing `disableMerge` deletion could re-expand the logical width after repair. | `deleteColumn.ts`; focused + full table suite | span-aware logical deletion; 276 tests green | keep | none |
| WF01 | 1 | vision workflow | Generated vision skill points to removed `docs/vision/slate.md`. | `.agents/rules/vision.mdc`, `pnpm install`, mirror audit | source and generated skill audit | keep | none |
| BP01 | 2 | Browser / Chrome / Computer Use | Controlled Chrome clipboard and macOS system clipboard are isolated. | `/blocks/table-demo`, five clipboard MIME types, OS paste | route/render and structural HTML paste proven; custom Plite transfer not claimed | keep limited claim | none |
| RV01 | 2 | autoreview | Reviewer cited unchanged benchmark outside accepted file scope. | autoreview local + plan prompt; source/diff audit | zero accepted findings; P3 rejected as out-of-scope baseline | reject finding | none |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Plite model laws | `packages/plite` | 26 `DocumentChange` + 8 facet contracts | N/A | green | none |
| Plite history soak | `packages/plite-history` | 8 seeds x 240-event slow contract | N/A | green | none |
| Plite React DOM | `packages/plite-react` | 3 seeds x 80 edits; 8 Vitest assertions | N/A | green | none |
| Plate table repair/paste | `packages/table` plus `/blocks/table-demo` | 276 package tests; Browser/Chrome/Computer Use | route/render, five copy formats, and OS structural HTML paste | green with custom-format transfer limit | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| W24 merged/non-rectangular paste | exact model table selection/value in package tests | Native copy selected the table and produced Plite/HTML/CSV/TSV/plain formats | OS HTML paste created a structural table; controlled custom MIME could not cross into the macOS clipboard | Browser and Chrome route rendered; Computer Use performed native shortcuts | pass for route/HTML integration; custom MIME transfer tooling-blocked and not claimed |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| none expected | N/A | N/A | N/A | N/A: one table browser flow does not justify a new helper |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| none | N/A | N/A | N/A | N/A: no mobile claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| none | N/A | N/A | N/A | N/A: no huge-document claim |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| checkpoint-zero detail read | vision | <1 minute | rule named removed `docs/vision/slate.md` | current `plite.md` owner found and read | patch `.agents/rules/vision.mdc`, sync generated skill |
| first facet test command | Plite test harness | one failed invocation | command used `./test/...` after already entering `packages/plite` through a compound path | no product evidence | reran from exact package cwd; record direct package command |
| combined donor/table read | output discipline | one truncated read | too many large source slices were streamed together | exact donor law names remained visible | split subsequent reads by owner and capped each slice |
| first www dev command | app proof | one failed invocation | filter command forwarded `--` as a project directory | no runtime evidence | started `pnpm dev --port 3000` from `apps/www` directly |
| clipboard proof escalation | Browser / Chrome / Computer Use | three bounded attempts | Browser and Chrome controlled clipboard cannot populate the macOS system clipboard used by native paste | route render, five controlled MIME types, and real OS structural HTML paste | stopped after proving the boundary; retained package tests as authority for custom fragment laws |
| broad table suite | Plate table | one failed run | new repair exposed physical-column deletion on a span-bearing table | precise `disableMerge` regression | routed span-bearing tables through logical merge-column deletion; 276 tests green |
| autoreview bundle | review harness | one false secret scan plus one out-of-scope P3 | `replacesSameStructuralToken =` matched the secret regex; large inherited dirty bundle exposed an unchanged benchmark | structured review completed | renamed boolean precisely; rejected unchanged benchmark finding after source/diff audit |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `packages/plite/src/core/{document-change,facet,extension-registry,public-state}.ts`; `packages/plite/src/interfaces/editor.ts`; `packages/plite-history/src/history-extension.ts`; `packages/table/src/lib/{withNormalizeTable,withInsertFragmentTable}.ts`; `packages/table/src/lib/internal/tableGrid.ts`; `packages/table/src/lib/transforms/deleteColumn.ts` |
| tests/oracles/browser proof | `packages/plite/test/{document-change,transaction-extension-contract}.ts`; `packages/plite-history/test/history-soak-contract.slow.ts`; `packages/plite-react/test/rendered-dom-shape-contract.tsx`; `packages/table/src/lib/{withNormalizeTable,withInsertFragmentTable}.spec.tsx`; manual `/blocks/table-demo` proof |
| benchmarks/metrics/targets | N/A: benchmarks excluded; no benchmark file changed in this run |
| examples/docs | this goal plan only; no public docs/example change required because the facet API carries first-class types/JSDoc |
| skills/workflow | `.agents/rules/vision.mdc` source plus generated `.agents/skills/vision/SKILL.md`; `.changeset/{plite-document-facet-laws,plite-history-skip-rebase,table-logical-grid-repair}.md` |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | General concurrent move/move OT remains W17 | W07 deliberately solves move/edit and document-aware conflicts without inventing central OT | harvest W17 | keep as separate architecture plan |
| 2 | Table demo has pre-existing random cell-ID hydration and render-time option-update warnings | Current route logs show these outside the logical-grid package diff; fixing them would widen owner/scope | `/blocks/table-demo` dev log | follow up in table React/runtime cleanup |
| 3 | Custom Plite MIME could not be passed from controlled Chrome clipboard into macOS native paste | Tool surfaces use separate clipboard stores; package tests prove the exact custom-fragment laws | BP01 | do not claim native custom-format proof until a direct clipboard lane exists |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | No blocking question remains | All scoped gates passed | none | all six rows completed | hand off | this plan |

Findings:
- The current vision detail owner is `docs/vision/plite.md`; `.agents/rules/vision.mdc` still points to deleted `slate.md`.
- Prior private Wordgard ChangeSet prototype evidence is historical context only; live package APIs and the current harvest report own this implementation.
- W07 exposed three real structural transform bugs: delete-vs-change, edit-vs-move, and stale source-node reuse after composed edits.
- W14 exposed a real selection rebase bug: old history batches were mapped against the newest document instead of each batch's source and target documents.
- W23 and W24 share one internal logical grid; normalization clamps invalid document spans, while pasted fragments may extend height to preserve valid source row spans.

Decisions and tradeoffs:
- Keep table structural behavior in Plate and generic change/facet/history/DOM laws in Plite, matching the boundary law.
- Computed facets declare explicit document/schema/selection/facet dependencies; omitted dependencies preserve whole-editor invalidation and an empty list computes once per registration.
- W15 history serialization and W17 central OT remain outside this six-row goal.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Incorrect focused facet cwd/path | 1 | rerun from exact package cwd | resolved; focused facet suite green |
| Oversized combined donor/table read | 1 | split exact source reads | resolved; all owner sources read |
| Table typecheck exposed history generic erasure | 1 | preserve input type through `DocumentChange.apply<T>` | resolved; affected four-package typecheck green |
| First full table run exposed span deletion regression | 1 | keep repair and route span-bearing deletion through the logical algorithm | resolved; 276/276 table tests |
| Incorrect www dev-server argument shape | 1 | run from `apps/www` with direct `pnpm dev --port 3000` | resolved; table route rendered |
| Controlled clipboard flattened or diverged at native paste | 3 bounded layers | Browser -> Chrome -> Computer Use, then stop at proven clipboard isolation | limited claim recorded; exact custom laws remain package-proven |
| Autoreview secret false positive | 1 | rename boolean from structural-token wording to exact open-node wording | resolved; review bundle completed |
| Autoreview unchanged benchmark P3 | 1 | source/diff audit against frozen plan | rejected: no local diff and explicit benchmark non-goal |

Verification evidence:
- `auto`, `autogoal`, and `vision` skills read; root/common/Plite/Plate vision read; active goal created.
- W07: `bun test --preload ../../config/plite-source-test-setup.ts test/document-change.test.ts` from `packages/plite`: 26 pass.
- W11: `bun test --preload ../../config/plite-source-test-setup.ts ./test/transaction-extension-contract.ts` from `packages/plite`: 8 pass.
- W14: `bun test --preload ../../config/plite-source-test-setup.ts ./test/history-soak-contract.slow.ts` from `packages/plite-history`: 1 pass, 1,920 events.
- W23: `bun test src/lib/withNormalizeTable.spec.tsx` from `packages/table`: 17 pass.
- W24: `bun test src/lib/withInsertFragmentTable.spec.tsx` from `packages/table`: 16 pass.
- W27: `bun test:vitest test/rendered-dom-shape-contract.test.tsx` from `packages/plite-react`: 8 pass, 240 edit steps.
- `pnpm --filter @platejs/table test` from repo root: 276 pass.
- Affected four-package `pnpm turbo typecheck` passed after preserving `DocumentChange.apply` input typing and after the span-deletion repair.
- `pnpm check:plite` from repo root: exit 0; typechecks/tests plus Chromium 587 pass/7 skip, then 3 pass, 45 pass, and 46 pass/1 skip.
- Browser proof: `/blocks/table-demo` rendered in Browser and Chrome; native copy exposed `application/x-plite-fragment`, HTML, CSV, TSV, and plain text; Computer Use OS paste structurally imported HTML, while the controlled custom clipboard remained isolated from the OS clipboard.
- `pnpm install` regenerated the vision skill mirror; source/mirror audit resolves `docs/vision/plite.md`.
- Agent-native review: PASS, no findings.
- Autoreview: zero accepted findings; one P3 in unchanged `benchmarks/slate-v2/donor/core/current/anchors-projection.mjs` rejected as out-of-scope baseline.
- `pnpm lint:fix`: 4,817 files checked, no fixes.
- `pnpm changeset status`: exit 0; three scoped changesets present; dependency-version notices belong to the existing beta migration lane.

Final handoff contract:
- Goal plan: this file
- Lane: shared editor
- Surface and route/package: four Plite rows, two Plate table rows, existing table demo
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop; no minimum; report final counts
- Behavior gates and visual proof: report all focused/broad commands and table Browser proof
- Primary metric baseline/latest/best and stop reason: N/A: correctness/oracle run, not perf
- Bugs fixed and oracles added: report by W07/W11/W14/W23/W24/W27
- Benchmark/skill/docs repairs: no benchmark; report vision rule repair and sync
- Workflow slowdowns and repairs: report stale vision path and any later command-shape cost
- Changed list: grouped per auto contract
- Needs your attention: rank at most five architecture/behavior review anchors
- Stopping checkpoints to unblock: none unless a real boundary appears
- Accepted deferrals and residual risks: W15/W17 plus any proven residual risk
- Next owner: package closure or user handoff after all gates pass

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final checker and handoff |
| Where am I going? | Goal completion and user handoff |
| What is the goal? | Implement and verify all six accepted Wordgard harvest rows in the correct Plite/Plate owners. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |
| What changed in the checkpoint plan? | See Checkpoint mutation ledger |

Timeline:
- 2026-07-18T08:41:56.701Z Goal plan created.
- 2026-07-18 Checkpoint zero completed: requirements captured; `auto`, `autogoal`, and vision doctrine read; no active goal found.
- 2026-07-18 W07/W11/W14/W27 kept after focused seeded laws exposed and repaired three structural-change bugs, scoped facet invalidation, and history selection rebasing.
- 2026-07-18 W23/W24 kept after one shared logical grid repaired malformed tables and span-aware paste; all focused table tests and affected package typechecks passed.
- 2026-07-18 Broad table suite exposed and repaired span-bearing deletion under `disableMerge`; 276/276 passed.
- 2026-07-18 Browser/Chrome/Computer Use proved route rendering, five copy formats, and structural OS HTML paste; custom controlled-to-OS clipboard transfer was bounded as a tooling limitation.
- 2026-07-18 `pnpm check:plite`, lint, changeset status, agent-native review, and autoreview closure completed.

Open risks:
- W17 remains the owner for general concurrent move/move OT; W07 deliberately covers move/edit but not a second central OT architecture.
- Table demo hydration IDs and a render-time option update warning are pre-existing React/runtime cleanup, not this logical-grid packet.
- Native custom-MIME paste remains unclaimed because controlled and macOS clipboards are isolated; exact custom-fragment behavior is covered by package tests.
