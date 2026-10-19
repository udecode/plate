# legacy list model v2 api

Objective:
Define the clean Plate v2 API and migration boundary for `platejs`; done when every Plate Plan pass, conflict row, adoption answer, and proof gate closes.

Goal plan:
docs/plans/2026-07-12-legacy-list-model-v2-api.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Completion threshold:
- Decide the package-wide transaction/read API, middleware and normalizer ownership, public break set, caller/docs adoption order, and proof matrix for all 84 package rows.
- Plate Plan closure is legal only when score >= 0.92, no dimension is below
  0.85, every pass row is complete or intentionally skipped with evidence,
  every required API conflict row has a verdict, Plite/Plate boundary rows are
  closed, proof gates are named, final handoff is emitted, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-legacy-list-model-v2-api.md`
  passes.

Verification surface:
- Planning: 84-file manifest, direct import/API/cast audits, package export and caller inventory, current package test/typecheck evidence, and source-backed conflict rows.
- Execution: package-scoped Biome, source-first typecheck, package tests/build, `pnpm brl` when exports change, caller typechecks, and focused browser proof for legacy-list-model editing behavior.
- Planning-only claims need live source pointers. Execution claims need Plate
  repo root commands for the owning package/app/docs surface.

Constraints:
- Plate v2 may make breaking changes for best architecture, DX, performance,
  testability, and agent-maintainability.
- Minimal breaking change means the smallest public break set that removes the
  real Plite/Plate conflict. It does not mean keeping aliases or shims.
- Plite APIs win when Plate APIs overlap with the Plite substrate.
- No public compatibility aliases, public runtime shims, or docs for old API
  names.
- Private temporary bridges are allowed only with an owner, deletion gate, proof
  route, and no public export.
- Planning mode edits planning/research/behavior-law/reference artifacts only.
  Implementation starts after user acceptance in a separate execution goal.

Boundaries:
- Source of truth: latest user request, root `VISION.md`, relevant
  `docs/vision/**`, `.agents/rules/plate-plan.mdc`, current Plite package APIs,
  and current Plate source/docs/tests.
- Allowed planning edit scope: `docs/plans/**`, `docs/research/**`,
  `docs/vision/**`, `docs/editor-behavior/**` when behavior law changes,
  `docs/plite/**` references when Plite migration evidence is required.
- Allowed execution edit scope: accepted-plan package/app/docs/tests/examples
  owners.
- Browser surface: legacy list model insert/break/delete/tab/paste/toggle behavior after an accepted implementation plan.
- Tracker sync: N/A; local architecture plan.
- Non-goals: compatibility aliases, a `platejs` bridge, partial per-file mutation migration, modern `@platejs/list` redesign, or implementation before user acceptance.

Blocked condition:
- Implementation is blocked until this planning lane reaches review-ready state and the user explicitly accepts the plan in a later `plate-plan` invocation.
- Do not use blocked while any source audit, score-hardening, conflict-ledger,
  proof-row, or plan-hardening move remains runnable.

Plate Plan lane state:
- plate_plan_lane_status: pending
- current_pass: current-state-read
- current_pass_status: completed
- next_pass: intent-boundary
- next_action: run intent, scope, boundary, and non-goals pass
- final_handoff_status: pending

Current verdict:
- verdict: package-wide architecture plan required; no safe partial implementation packet
- confidence: 0.46 initial
- keep / cut / revise call: revise the legacy-list-model Plate product API; cut legacy substrate access
- reason: 43/50 production files and 28/28 specs depend on removed Slate/Plate mutation APIs, while public commands, normalizers, delete/break/paste/tab middleware, React hooks, and package callers form one coupled contract

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion gate below
  is satisfied and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-legacy-list-model-v2-api.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Parent Plate Next plan requests exactly layout, link, and legacy-list-model in order |
| Active goal checked or created | yes | Active Plate Next goal owns this routed subplan; implementation needs a later accepted-plan execution goal |
| Source of truth read before edits | yes | VISION and Plate doctrine read; live package manifest/source/tests/package metadata audited |
| Plite/Plate boundary surface identified | yes | Plite owns read/update/transactions; legacy-list-model owns product commands and classic node behavior |
| API conflict ledger needed | yes | Current public `editor.tf.toggle.*` and 43 production legacy consumers conflict with Plite |
| Planning vs execution mode decided | yes | Planning only; no legacy-list-model implementation edits |
| Browser proof needed | yes, execution | Tab/delete/break/paste behavior is browser-visible editor behavior |
| External research needed | no for current pass | Live Plate/Plite source is sufficient for current-state inventory |

Work Checklist:
- [ ] Short objective plus lane outcome, completion threshold, verification
      surface, constraints, boundaries, and blocked condition are concrete.
- [ ] Planning vs execution mode is explicit.
- [ ] Live source grounding recorded for every current implementation/API/docs
      claim.
- [ ] Plite/Plate boundary map is complete.
- [ ] API conflict ledger is source-discovered and includes every public or
      exported Plate runtime accessor, product command surface, transform
      namespace, plugin extension point, Plite transaction/read/update
      interaction point, runtime/default-route bridge, package export,
      declaration, docs/example API, and legacy substrate bridge that may
      overlap with Plite.
- [ ] Minimal breaking-change matrix is complete.
- [ ] Private bridges, if any, have owner, deletion gate, and proof route.
- [ ] Public API target is concrete.
- [ ] Runtime/default-route target is concrete or N/A with reason.
- [ ] Plugin/feature package target is concrete.
- [ ] Docs/examples/registry target is concrete.
- [ ] Proof matrix names focused package/app/docs commands.
- [ ] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [ ] Objection ledger complete for every public API, package-boundary,
      runtime, docs, or behavior change.
- [ ] Scorecard recorded with evidence; total score >= 0.92 and no dimension
      below 0.85 before closure.
- [ ] Final handoff outline lists every accepted decision, not only highlights.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Plite/Plate boundary rows closed | pending | Every mixed owner split, moved, or explicitly deferred with evidence | pending |
| API conflict ledger closed | pending | Every required row has verdict and proof/adoption answer | pending |
| Breaking changes accepted | pending | Every breaking change has objection row, adoption answer, docs/example answer, and proof route | pending |
| Private bridges controlled | pending | Owner, deletion gate, and no public export/docs | pending |
| Package/source execution changed | pending | Run focused owner typecheck/test/build and `pnpm brl` if exports changed | pending |
| Docs/content changed | pending | Run docs checks and browser proof when route changed | pending |
| Browser behavior claim | pending | Run Plite/browser or accepted Plate app proof command | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Autoreview for implementation changes | pending | Load `.agents/skills/autoreview/SKILL.md` and close accepted/actionable findings, or record N/A for planning-only | pending |
| Final user-review handoff | pending | Emit final handoff or keep the plan pending with next pass | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-legacy-list-model-v2-api.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | completed | 84 rows; 50 production files; 43 production and all 28 specs carry legacy API drift; baseline 5 pass/27 fail | intent-boundary |
| Intent, scope, boundary, non-goals | pending | | Plite/Plate boundary audit |
| Plite/Plate boundary audit | pending | | API conflict inventory |
| API conflict inventory | pending | | minimal breaking-change strategy |
| Minimal breaking-change strategy | pending | | runtime/performance/testability |
| Runtime, performance, testability pass | pending | | docs/examples/registry |
| Docs, examples, registry pass | pending | | research/ecosystem |
| Research/ecosystem/live-source pass | pending | | objection ledger |
| Objection and steelman pass | pending | | high-risk pass |
| High-risk deliberate pass | pending | | revision |
| Revision pass | pending | | verification/final handoff |
| Verification and final handoff gate | pending | | final response |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| Plite/Plate boundary correctness | 0.20 | 0.45 | owner split known; target rows not decided |
| Plate API/DX quality | 0.20 | 0.35 | current `editor.tf.toggle.*` is removed-runtime drift; target namespace pending |
| Runtime, performance, and testability | 0.20 | 0.40 | behavior inventory exists; middleware/normalizer transaction design pending |
| Minimal breaking-change strategy | 0.15 | 0.30 | package-wide coupled break identified; adoption matrix pending |
| Product/plugin/docs/examples coherence | 0.15 | 0.35 | package and caller inventory started; docs/registry pass pending |
| Research, source evidence, and proof completeness | 0.10 | 0.70 | live manifest, import counts, diffs, and baseline tests recorded |

Plite/Plate boundary map:
| Surface | Current owner | Target owner | Keep / move / cut / bridge / defer | Evidence | Verdict |
|---------|---------------|--------------|------------------------------------|----------|---------|
| editor read/update/transaction substrate | legacy `platejs` aliases in 43 production files | Plite | move | `packages/platejs/src/features/list/src/lib/**`; direct audit count 43 | pending target API |
| legacy list model node model and product workflows | `platejs` | Plate feature package | keep | package exports and apps/www dependency | keep product owner |
| React hooks and floating/product controls | `platejs/react` umbrella | Plate/Core React direct owners | move | four React production files plus plugin adapters | pending React pass |

API conflict ledger:
| Surface | Current shape | Conflict | Target shape | Verdict | Adoption/docs/proof answer |
|---------|---------------|----------|--------------|---------|---------------------------|
| runtime accessors | `editor.api.*`, `editor.tf.*`, `editor.selection` throughout package | overlaps Plite read/update substrate | direct reads and active tx methods | pending | 43 production files; exact target pass pending |
| product command surfaces | `editor.tf.toggle.{list,bulletedList,numberedList,taskList}` | removed transform namespace and helper-first mutation | one typed Plate product tx group | pending | `BaseListPlugin.ts`; naming/adoption pending |
| transform namespaces | child plugins expose local `toggle`, root exposes `toggle.*` | duplicate command owners | one root product owner | pending | Base plugin source |
| plugin extension points | `overrideEditor` merges seven cast extension objects | casts hide incompatible middleware contracts | typed `extendExtension` chain | pending | `withList.ts` and six middleware owners |
| Plite transaction/read/update interaction points | mutating helpers receive only editor | cannot use active middleware transaction safely | helpers receive `tx`; queries receive editor/read view | pending | transforms/normalizers graph |
| runtime/default-route bridges | umbrella `platejs` supplies removed APIs | public compatibility dependency | none | hard-cut candidate | package.json dev/peer plus 71 source/spec drift files |
| package exports and declarations | 84-file published package, two exports | migration touches most exported helpers | retain package entrypoints; decide helper signatures | pending | package.json and barrels |
| docs/examples teaching public API | apps/www and legacy-list-model docs consume package | target API not defined | update after accepted target | pending | caller search recorded in parent plan evidence |
| legacy substrate bridges | no private bridge; direct umbrella imports | entire package is the bridge dependency | remove dependency, no replacement bridge | hard-cut candidate | source audit |

Minimal breaking-change matrix:
| Break | Why required | Smaller option rejected | User impact | Migration route | Proof |
|-------|--------------|-------------------------|-------------|-----------------|-------|
| pending | pending | pending | pending | pending | pending |

Public API target:
| Surface | Proposed shape | User-facing DX | Boundary owner | Evidence | Verdict |
|---------|----------------|----------------|----------------|----------|---------|
| pending | pending | pending | pending | pending | pending |

Private bridge and deletion gates:
| Bridge | Owner | Why temporary | Public exposure check | Deletion gate | Proof |
|--------|-------|---------------|-----------------------|---------------|-------|
| pending | pending | pending | pending | pending | pending |

Runtime / default-route target:
| Layer | Current shape | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| pending | pending | pending | pending | pending | pending |

Plugin / feature package target:
| Package / feature | Current API | Target API | Break level | Proof command | Verdict |
|-------------------|-------------|------------|-------------|---------------|---------|
| pending | pending | pending | pending | pending | pending |

Docs / examples / registry target:
| Surface | Current docs/example | Target docs/example | Check command | Status |
|---------|----------------------|---------------------|---------------|--------|
| pending | pending | pending | pending | pending |

Proof matrix:
| Claim | Cwd | Command / proof | Expected signal | Status |
|-------|-----|-----------------|-----------------|--------|
| pending | pending | pending | pending | pending |

Research / ecosystem synthesis:
| System | Source | Mechanism | Steal | Reject | Plate target | Verdict |
|--------|--------|-----------|-------|--------|--------------|---------|
| pending | pending | pending | pending | pending | pending | pending |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| architecture-cleanup | pending | pending | | |
| performance | pending | pending | | |
| tdd | pending | pending | | |
| docs-creator | pending | pending | | |
| react | pending | pending | | |
| react-useeffect | pending | pending | | |
| components / plate-ui | pending | pending | | |
| autoreview | pending | pending | | |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| pending | pending | pending | pending | pending | pending |

Objection ledger:
| Change | Who feels pain | Objection | Tradeoff | Evidence | Adoption/docs/proof answer | Verdict |
|--------|----------------|-----------|----------|----------|----------------------------|---------|
| pending | pending | pending | pending | pending | pending | pending |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| pending | pending | pending | pending | pending | pending |

Plan deltas from review:
- None yet.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| pending | pending | pending | pending | pending |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| pending | plate-plan execution mode | pending | pending | pending | pending |

Final user-review handoff outline:
- accepted boundary decisions: pending
- accepted API conflict verdicts: pending
- breaking changes: pending
- private bridges and deletion gates: pending
- docs/examples/registry changes: pending
- proof gates: pending
- next execution owners: pending
- needs user attention: pending

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | pending |
| all pass rows complete or skipped with evidence | phase/pass table closed | pending |
| Plite/Plate boundary closed | boundary map closed | pending |
| API conflict ledger closed | ledger rows have verdicts | pending |
| live source grounding complete | source-backed rows cite current owners | pending |
| workspace verification recorded | proof matrix closed | pending |
| autoreview clean or N/A | `.agents/skills/autoreview/SKILL.md` loaded and clean for implementation changes, or N/A with reason | pending |
| final handoff emitted or lane remains pending | final response / next pass recorded | pending |
| `check-complete` passes | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-legacy-list-model-v2-api.md` | pending |

Findings:
- `platejs` is a coupled migration, not a file cleanup: 84 manifest rows, 50 production files, 43 production legacy matches, 28 specs and 28/28 legacy test matches.
- Baseline package proof is red: 5 tests pass, 27 fail, including 26 module-load errors caused by removed `platejs` exports.
- The only uncommitted package diff was formatter-only drift in `toggleList.ts`; it was restored exactly, leaving no current uncommitted legacy-list-model source diff.
- Current public ownership is split across five plugin exports, root `toggle.*`, child `toggle`, seven override/middleware owners, and standalone mutating helpers. A one-file conversion would create a public fork.

Decisions and tradeoffs:
- Do not implement legacy-list-model under the Plate Next goal. Plate Plan planning mode owns the public command, helper transaction, middleware, caller, and proof decisions first.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Baseline package test | 1 | classify failure graph before edits | 5 pass, 27 fail, 26 removed-export module errors |

Verification evidence:
- Manifest: 84 tracked/untracked rows, zero untracked extracted files at checkpoint zero.
- Source audit: 71/84 package files match legacy imports/APIs/casts; 43/50 production files and 28/28 specs.
- Current diff audit: `git diff -- packages/platejs/src/features/list/src/lib/transforms/toggleList.ts` is empty after restoring formatter-only drift.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Current-state read and initial score |
| Where am I going? | Run the next incomplete Plate Plan pass |
| What is the goal? | Define an execution-grade legacy-list-model Plate v2 migration plan |
| What have I learned? | The package is one coupled public API and behavior migration |
| What have I done? | Completed current-state pass and initial score |

Timeline:
- 2026-07-12T02:39:48.698Z Plate Plan goal plan created.
- 2026-07-12 Current-state pass: 84 rows, 43/50 production drift, 28/28 spec drift, baseline 5 pass/27 fail; implementation deferred pending accepted plan.
