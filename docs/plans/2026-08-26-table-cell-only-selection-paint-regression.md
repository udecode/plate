# table cell-only selection paint regression

Objective:
Remove the duplicate table-wide selection layer while preserving per-cell
highlights, then prove the exact all-cell selection paint 5/5 in a real browser.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-table-cell-only-selection-paint-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- none

Regression source:
- target bug / surface / corpus: selecting table cells paints both the intended
  per-cell highlights and a forbidden table-wide node-selection overlay
- lane and current source owner: failed-fix proof repair in Regression's shared
  Browser/Patch paint rules first, then the copied registry table presentation
- selected executable test cases: `table:paint-only-selected-cells`
- tested ref or dirty-state boundary:
  `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb`; the prior
  `CASE-NS-002` completion claim and its table paint proof are invalidated
- route / proof host and freshness method: reproduce on the reporter-facing
  `/docs/examples/table` surface and prove on source-first `/blocks/table-demo`
  from a fresh www process; classify pixels in exact Chrome and replay with the
  in-app Browser
- invocation mode / timebox: failed-fix repair, one-shot, no requested duration

First checkpoint:
- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop
  condition, deliverable, verification surface, and final handoff requirement
  into the Work Checklist before mutable work.
- Load `.agents/skills/regression/references/methodology.md`.
- Fill the selected-case, reporter-oracle, failed-fix, and architecture tables,
  then run `validate-regression-plan.mjs` before implementation.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:
- Every selected observed regression has an executable test that fails on the
  violated invariant and passes after the fix.
- Every selected case records `unit-red: <test>` or
  `e2e-required: <lower-layer limitation>`. Unit/package RED stops new E2E test
  creation; Browser may remain final verification without permanent E2E coverage.
- Every case has positive and forbidden-state assertions for model, DOM/native,
  pointer feedback, focus, popup, geometry/paint, runtime errors, and follow-up
  input, with an N/A reason for observations that do not apply.
- Current source and every proof host are ready before behavior claims.
- Every kept case has exact reproduction, one-case Patch evidence, focused
  green proof, required retry-free stability, final ref/dirty-boundary proof,
  and no accepted P1 finding.
- Every kept case and the run are marked `completed` when those local gates
  pass. Commit and push are not local completion gates.
- Every case records `repair-now`, evidence-backed `no-change`, or
  evidence-backed `defer`.
- Every failed claimed fix invalidates its prior proof and automatically repairs
  Regression with an executable workflow test before the next product attempt.
- A second failed fix or architecture trigger has an accepted Best API and
  Plite/Plate layer plan before implementation resumes.
- Final proof has a generated receipt and affected-corpus replay after the last
  shared-owner edit.
- All canonical Work Checklist and Completion Gates rows resolve and
  both semantic validation and `check-complete.mjs` pass.

Verification surface:
- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-26-table-cell-only-selection-paint-regression.md --complete`
- P1 review policy closure; `autoreview` is forbidden on branch `next`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-table-cell-only-selection-paint-regression.md`

Constraints:
- Executable tests own durable regression behavior.
- GitHub owns issue provenance/status; exact refs and runtime/CI receipts own
  integration claims.
- Regression owns selection, proof width, stability, packet decision, claim
  width, and methodology delta.
- Patch owns one normalized local repair at a time.
- The goal plan is transient coordination, not a second behavior database.
- Baselines are evidence, not law. Proxy proof never upgrades the exact case.
- No parallel writers to shared source, tests, plans, generated output, builds,
  or route hosts.
- Generated output is not a source owner.
- Mark fully proved local work `completed` and record its local ref/dirty
  fingerprints plus uncommitted/unpushed state when true. Do not widen that
  status into integrated, shipped, released, or public issue completion without
  the owning evidence and authority.
- A failed fix means a claimed candidate/kept/completed repair that fails exact
  replay/final verification or receives a reporter contradiction. Expected TDD
  red is not a failed fix.
- A failed fix always enters automatic Regression `repair-now`; prose-only
  repair, `no-change`, and `defer` cannot resume the product attempt.
- Preserve the table-cell selection model, per-cell `bg-brand/5` highlights,
  native Range suppression during held drags, floating toolbar behavior, row
  drag-handle rules, resize behavior, and explicit node-selection ownership.
- The accepted paint has one layer per selected cell and no blue pixels in the
  table wrapper gutter or other area outside the union of selected cell boxes.
- Do not edit `templates/**`, change a public API, add selection state, commit,
  push, open a PR, release, or mutate public issue/tracker state.

Boundaries:
- allowed source owners: `.agents/rules/regression.mdc`, its methodology and
  executable contract test, `.agents/rules/patch.mdc`, the shared Browser plan
  pack, then `apps/www/src/registry/components/editor/table.tsx`
- allowed proof/test owners: Regression workflow tests and the existing
  `apps/www/tests/browser/table-selection.spec.ts` corpus only
- generated/source boundary: edit `.agents/rules/**` and plan-pack sources,
  run `pnpm install` for mirrors; edit registry source and run
  `pnpm --filter www build:registry`; never hand-edit generated registry output
- browser/device claim width: macOS exact Google Chrome pixel proof plus the
  in-app Browser on the two named local routes; no cross-browser claim
- forbidden product/API/release/public mutations: no Plite/Table selection-law
  change, no package API, no product templates, commit, push, PR, release, or
  public status mutation
- orchestration mode and writer ownership: one main-thread writer; no subagent,
  other-task messaging, or concurrent route/build owner

Output budget strategy:
- Start from exact owner and test files. Use runner discovery/counts before
  printing broad corpora. Cap logs and exclude generated/build trees.

Blocked condition:
- Block only when exact current behavior cannot be observed, the authoritative
  host/device/credential is unavailable, unsafe scope needs user authority, or
  the same blocker leaves no safe alternate packet.
- Repair broken commands, stale servers, generated drift, and missing proof
  hosts before treating them as product blockers.

Regression state:
- current phase: failed-fix workflow repair
- current executable case: `table:paint-only-selected-cells`
- current case status: attempt 1 invalidated; product attempt 2 frozen pending
  executable workflow repair and semantic validation
- next owner: Regression workflow proof, then one local Patch packet
- goal status: active

Completion rule:
- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Latest request and both attached screenshots require cell-only highlight paint; preserved behavior, no-product-template/API/public mutation, exact Browser proof, and local-only handoff are recorded. |
| Regression methodology loaded | yes | `.agents/skills/regression/SKILL.md` and `references/methodology.md` were read completely before task action. |
| Active goal checked or created | yes | No active goal existed; the active goal names this plan and exact paint invariant. |
| Current source owner and tested ref recorded | yes | Registry table, existing browser case, workflow owners, HEAD, and source fingerprints were recorded before edits. |
| Executable test cases discovered | yes | Existing `table-selection.spec.ts` owns the exact table route and real pointer selection; one new exact case title will extend that corpus. |
| Cumulative reporter evidence resolved | yes | Prior node-selection plan required table-owned cell presentation; latest screenshot rejects the extra table rectangle without relaxing any cell highlight. |
| Reporter oracle matrix resolved | yes | Eight phase-specific rows below require model, DOM, paint, focus, toolbar, errors, and follow-up selection behavior or give exact N/A reasons. |
| Regression semantic validator ready | yes | Validator already rejects missing duplicate controls; inconsistent Regression/Patch/Browser prose is the mandatory repair before the first validation run. |
| Route/proof-host readiness plan recorded | yes | Fresh source-first www process, reporter docs route, standalone table demo, exact Chrome classifier, and in-app Browser replay are named. |
| Patch delegation boundary recorded | yes | One local sequential packet may change only the table presentation and existing browser corpus after workflow repair. |
| Orchestrator writer ownership recorded | yes | N/A: no orchestrator or subagent; one local writer and serialized host/build work. |
| Output budget strategy recorded | yes | Owner-scoped reads, exact test titles, capped logs, no broad generated scans. |
| Claim width and blocked rules recorded | yes | Local macOS Chrome/Browser only; missing controlled pixel red or stale host blocks product edits. |

Work Checklist:
- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [x] Current source, exact ref/dirty boundary, test runner, route/proof host,
      export/build path, and freshness method are recorded.
- [ ] Generated/source drift and host readiness are repaired or block the claim.
- [x] Every selected case has a stable ID, source reference, owner, setup,
      action, expected outcome, expected-outcome authority, executable test
      path/command, tested ref, and required stability. A negative report does
      not authorize an invented positive behavior.
- [x] Every selected case records its `Red-test escalation`. Try the exact
      owner-level unit/package test first. `unit-red:` forbids a new E2E test;
      `e2e-required:` names why no exact unit/package RED is possible. Browser
      verification alone does not become permanent E2E coverage.
- [x] Every selected case inventories its base acceptance, recordings, and all
      later reporter confirmations/contradictions as cumulative deltas. Every
      still-applicable claim stays required; superseded claims cite the source
      and reason that removed them.
- [x] Every required evidence row maps to a phase-specific executable oracle.
      A final-state assertion never substitutes for a transient during-action
      caret, overlay, popup, selection, pointer affordance, or paint assertion.
- [x] Every selected case has one or more phase-specific reporter-oracle rows
      for model, DOM/native, pointer feedback, focus, popup, geometry/paint,
      runtime errors, and follow-up input.
- [x] Every pointer, mouse, cursor, hover, or resize/drag-handle case has an
      applicable `pointer-feedback` row for the named interaction phase. Cursor
      and hover/active/tooltip/drag affordances are proved independently from
      model state, DOM selection, preview state, and eventual action.
- [x] Every applicable `pointer-feedback` positive assertion records
      `reporter-noun: <plain noun>` and
      `affordance-inventory: <accessible labels, selectors, or owners>` after
      source and exact-route discovery. Any excluded matching affordance cites
      explicit reporter or accepted-product authority.
- [ ] Every completed applicable `pointer-feedback` row records
      `interaction-trace: pass`, the actual pointer `target:`, delivered
      `event:`, and `buttons:` state from the same interaction path.
- [ ] Every flash, flicker, or one-frame pointer-feedback claim uses a target-
      capture or equivalent pre-handler oracle and records
      `pre-handler-state: pass`; eventual post-handler style is insufficient.
- [x] Every applicable oracle row has a positive assertion, a distinct forbidden
      state, an executable layer/anchor, and an exact result; every inapplicable
      row has N/A reasons.
- [ ] The smallest falsifying executable probe ran before scaling.
- [ ] Exact reproduction and durable owner classification are recorded; proxy
      evidence stays labeled proxy.
- [ ] The executable test is red before the fix, or the exact safe-red
      limitation and proof-host repair are explicit.
- [ ] Regression delegated only one normalized case at a time to Patch.
- [ ] Patch returned root cause, durable owner, changed files, exact red/green
      commands, final ref/dirty fingerprints, stability, architecture verdict,
      P1 review, and caveat.
- [ ] Focused green proof passed. Final Browser verification runs when repo or
      claim policy requires it; E2E replay is required only for
      `e2e-required:` or already-existing affected-corpus E2E coverage.
- [ ] Final proof ran through `capture-proof-receipt.mjs`; its ref, input digest,
      host, timestamps, retry count, and receipt ID validate.
- [ ] Required retry-free stability runs passed with no retry.
- [ ] Any stability-only failure after an exact green run froze product edits,
      gained a phase-specific executable diagnostic, and restarted baselines
      after product-versus-proof classification.
- [ ] Any compositor phase claim records computed style, live range geometry,
      model/DOM endpoints, and callback identity at the mutation boundary. If
      those are final while pixels stay red, timing is rejected as the cause.
- [ ] Every blocking pixel classifier passes known-correct single-layer,
      known-absent, and known-invalid duplicate-layer controls through the same
      capture path; width or outer geometry alone cannot certify layer count.
      A failed control invalidates prior results and freezes product edits until
      the proof helper is repaired.
- [ ] Every completed applicable `geometry-paint` row names actual pixel capture
      and classification in its proof layer and records `positive-control: pass`
      plus `negative-control: pass` and `duplicate-control: pass`; computed style,
      DOM state, selection text, callback traces, and unclassified screenshots
      are diagnostics only.
- [ ] Every shared owner was replayed against its affected exact corpus after
      the final owner edit.
- [ ] Every shared CSS selector, marker, class map, or style expansion has a
      pre-edit consumer inventory. The affected corpus includes explicit
      transparent, borderless, shadowless, and ringless overrides, each with a
      forbidden duplicate/inherited-paint geometry oracle.
- [ ] Every already-executable affected case has a `pass:` or `red:` pre-edit
      baseline recorded before its shared owner changes.
- [ ] Every requested or started package, browser, root, or CI gate that failed
      is recorded and passes an exact final rerun on the final bytes.
- [ ] Every selected case is kept, reverted, quarantined, deferred, or blocked
      honestly; only kept cases can satisfy goal success.
- [ ] No sidecar case registry, TSV, JSON manifest, or duplicate behavior
      database was created.
- [ ] Orchestrator ownership and overlapping writer/host serialization passed
      or are N/A with reason.
- [ ] Workflow slowdowns and avoidable proof-host/command mistakes were
      repaired or deferred with owner.
- [ ] Every case records one methodology delta.
- [ ] Every failed claimed fix revoked prior completion, automatically repaired
      Regression with executable workflow proof, and restarted at attempt N+1.
- [ ] Every second failed fix or architecture trigger passed Best API and the
      owning Plite/Plate plan before another Patch attempt.
- [ ] Claim wording matches local, pushed, integration, and release evidence.
- [ ] Every kept case and the run are marked `completed` once all required local
      proof and plan gates pass; commit/push state is recorded separately.
- [ ] Final handoff records executable tests, decisions, refs, proof, sync,
      reviews, risks, and next owner.
- [ ] Output budget discipline was followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | pending | Close every selected executable case and methodology row | pending |
| Current-source readiness | pending | Prove source owner and final tested ref/dirty boundary | pending |
| Route/proof-host readiness | pending | Prove the runner/host observes current source | pending |
| Executable regression coverage | pending | Record exact test file, red result, green result, and owning invariant | pending |
| E2E escalation closure | pending | Prove each case uses `unit-red:` without a new E2E or records `e2e-required:` with the exact unit/package limitation | pending |
| Cumulative reporter evidence closure | pending | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | pending |
| Reporter oracle closure | pending | Resolve positive and forbidden states for all eight observations and every applicable interaction phase per case | pending |
| Failed-fix interrupt closure | pending | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | pending |
| Architecture pressure closure | pending | Prove every second failure or architecture trigger has Best API and layer-plan evidence | pending |
| Proof receipt closure | pending | Validate generated final receipts against unchanged issue-owned inputs | pending |
| Affected-corpus replay closure | pending | Replay all cases affected by the last shared-owner edit | pending |
| Shared-style consumer closure | pending | Inventory every shared selector/class consumer and prove explicit paint neutralizers do not inherit or duplicate the shared surface | pending |
| Started-gate failure closure | pending | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | pending |
| Smallest-probe closure | pending | Record first falsifying probe and any host repair | pending |
| Patch delegation closure | pending | Read back one-case root-cause/red/green/proof evidence | pending |
| Focused verification closure | pending | Run owning test and exact final-case replay | pending |
| Stability closure | pending | Record retry-free warm runs or evidence-backed N/A | pending |
| Packet decision closure | pending | Keep/revert/quarantine/defer/block every selected case honestly | pending |
| Local completion status | pending | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | pending |
| No duplicate registry | pending | Prove no sidecar behavior manifest/database was created | pending |
| Generated/source and host repair | pending | Repair drift/host methodology or record blocked claim | pending |
| Orchestrator writer closure | pending | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | pending |
| Workflow slowdown closure | pending | Repair avoidable slow/stale/noisy proof paths or defer with owner | pending |
| Methodology delta closure | pending | Resolve repair-now/no-change/defer for every case | pending |
| Source/generated sync | pending | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | pending |
| Agent-native review | pending | Run for changed agent workflows or record N/A | pending |
| Final handoff contract | pending | Record tests, decisions, proof, sync, reviews, risks, and next owner | pending |
| Autoreview | pending | Run P1 autoreview for non-trivial implementation changes or record N/A | pending |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-26-table-cell-only-selection-paint-regression.md --complete` | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-table-cell-only-selection-paint-regression.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | Active goal and exact constraints recorded. | workflow repair |
| Current source and proof-host readiness | in_progress | Owners, HEAD, routes, and freshness method identified; host not started. | workflow repair |
| Executable case discovery and selection | completed | Existing table Browser corpus selected for one new exact paint case. | workflow repair |
| Cumulative reporter evidence inventory | completed | Base table-owned cell presentation and latest contradiction retained. | workflow repair |
| Reporter oracle expansion | completed | Eight rows below cover the interaction lifecycle. | workflow repair |
| Pre-implementation semantic validation | in_progress | Failed-fix workflow repair passed 64/64 with exact mirrors. | semantic validator |
| Smallest high-value probe | pending | | reproduce/classify |
| Reproduce, classify, and red test | pending | | patch delegation |
| One-case Patch delegation | pending | | verification |
| Focused verification and stability | pending | | packet decision |
| Keep/revert/quarantine | pending | | methodology delta |
| Methodology repair/no-change/defer | pending | | next case or closure |
| Reviews and final handoff | pending | | goal-plan check |
| Final goal-plan check | pending | | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| table:paint-only-selected-cells | Latest screenshot `/var/folders/md/2qpw448d4tx0dgncw_kqdpk80000gn/T/codex-clipboard-70aae6dd-2cc5-4800-a91a-8d29290de744.png` plus prior accepted table-owned cell presentation | On `/blocks/table-demo`, create an expanded selection covering the full table and inspect during held drag and after release | Every selected cell has one intended highlight; the wrapper/gutter outside cell boxes has zero table-wide selection layer | reporter: “we were showing only cell highlights, not the table one” and attached current/desired screenshots | e2e-required: only a real browser can combine table selection projection, nested node selection, stacking, transparency, and exact painted pixels | exact-chrome: installed macOS Google Chrome on a fresh source-first www host; in-app Browser replay on `/docs/examples/table` and `/blocks/table-demo` | `apps/www/tests/browser/table-selection.spec.ts`; exact Playwright grep for `table:paint-only-selected-cells` | repairing | dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb | Regression workflow repair, then Patch |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| table:paint-only-selected-cells | base-acceptance | `docs/plans/2026-08-26-extract-node-selection-primitives.md` CASE-NS-002 and the desired screenshot `/Users/zbeyens/Library/Application Support/CleanShot/media/media_AEjpcACYl9/2026-08-26 at 18.35.08.png` | after-release | Table selection remains table-owned through its cell presentation, with no generic/global highlight | required | dom-native@after-release, geometry-paint@after-release | test: apps/www/tests/browser/table-selection.spec.ts#table:hide-native-highlight-during-multi-cell-drag | red: prior paint harness counted native highlight but did not reject a component-owned table overlay; exact case will extend this owner |
| table:paint-only-selected-cells | latest-reporter-delta | Latest screenshot `/var/folders/md/2qpw448d4tx0dgncw_kqdpk80000gn/T/codex-clipboard-70aae6dd-2cc5-4800-a91a-8d29290de744.png` and “only cell highlights, not the table one” | after-release | Selected cells paint individually; the blue table rectangle and left gutter are forbidden | required | geometry-paint@after-release, popup@after-release | test: apps/www/tests/browser/table-selection.spec.ts#table:hide-native-highlight-during-multi-cell-drag | red: screenshot shows the duplicate table-wide layer; exact case will extend the existing paint harness |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| table:paint-only-selected-cells | model | after-release | yes | The table selection view contains every expected selected cell | Selection collapses, omits cells, or selects unrelated editor nodes | exact-chrome browser model and DOM projection | test: apps/www/tests/browser/table-selection.spec.ts#table:hide-native-highlight-during-multi-cell-drag | red: reporter screenshot establishes selected cells; exact case pending in the existing owner |
| table:paint-only-selected-cells | dom-native | after-release | yes | Selected cells expose `data-table-cell-selected=true`; no table-level `data-slot=node-selection-highlight` exists inside the table wrapper | A component-owned table highlight coexists with selected-cell projection | exact-chrome browser DOM layer inventory | test: apps/www/tests/browser/table-selection.spec.ts#table:hide-native-highlight-during-multi-cell-drag | red: source renders the forbidden table-level slot when the table node is selected |
| table:paint-only-selected-cells | pointer-feedback | during-action | yes | reporter-noun: cell selection; affordance-inventory: selected cell overlays, table wrapper overlay, row and block drag handles; the real pointer drag keeps the expected cell selection with no extra overlay | The interaction selects the table wrapper, loses cells, or exposes a forbidden drag affordance | exact-chrome browser pointer trace and DOM inventory | test: apps/www/tests/browser/table-selection.spec.ts#table:hide-native-highlight-during-multi-cell-drag | red: interaction-trace pending exact executable case; target: table cell; event: pointermove; buttons: 1 |
| table:paint-only-selected-cells | focus | after-release | yes | The editor root contains the active element after selection | The toolbar or page body steals focus | exact-chrome browser focus | test: apps/www/tests/browser/table-selection.spec.ts#table:hide-native-highlight-during-multi-cell-drag | red: exact case pending in the existing owner |
| table:paint-only-selected-cells | popup | after-release | yes | Exactly one expanded-selection table toolbar remains visible | Toolbar disappears or duplicates while removing the paint layer | exact-chrome browser popup count | test: apps/www/tests/browser/table-selection.spec.ts#table:hide-native-highlight-during-multi-cell-drag | red: screenshot shows one toolbar; exact case pending in the existing owner |
| table:paint-only-selected-cells | geometry-paint | after-release | yes | Pixel classifier finds intended brand paint only inside selected cell rectangles | Any brand selection pixels appear in the left gutter or wrapper-only region, or a second layer darkens selected cells | exact-chrome browser pixel capture/classifier with allowed-cell and forbidden-wrapper masks | test: apps/www/tests/browser/table-selection.spec.ts#table:hide-native-highlight-during-multi-cell-drag | red: reporter screenshot and source expose a table-wide duplicate; controlled classifier pending |
| table:paint-only-selected-cells | runtime-errors | follow-up | yes | Selection, paint capture, and toolbar interaction record zero page/console errors | Any task-owned runtime error or dev overlay occurs | exact-chrome browser runtime-error recorder | test: apps/www/tests/browser/table-selection.spec.ts#table:hide-native-highlight-during-multi-cell-drag | red: exact case pending in the existing owner |
| table:paint-only-selected-cells | follow-up-input | follow-up | yes | A subsequent single-cell click collapses the expanded selection and leaves ordinary editing usable | Table-wide paint persists or the editor cannot resume single-cell interaction | exact-chrome browser follow-up interaction | test: apps/www/tests/browser/table-selection.spec.ts#table:hide-native-highlight-during-multi-cell-drag | red: exact case pending in the existing owner |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| pending | pending | pending | pending | pending | pending | pending |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Regression workflow mirror | Source/mirror equality failed before regeneration | expected source/generated drift | `pnpm install` regenerated Regression and Patch skills | pass: 64/64 workflow tests and `sync-resources.mjs --check` |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| table:paint-only-selected-cells | 1 | The completed node-selection extraction claimed table-owned selection proof, but the latest screenshot shows a component-owned full-table overlay on top of cell highlights | reporter-contradiction | yes: CASE-NS-002 Browser proof, local completion, and table-paint claim are revoked | repair-now: align `.agents/rules/regression.mdc`, Regression methodology, Patch, and the shared Browser pack on mandatory duplicate-layer controls | pass: 64/64 workflow tests, `pnpm install`, exact resource parity, and agent-native PASS | no: first failed fix and the product owner remains one copied table presentation | N/A: first failed fix does not trigger Best API or plate-plan | reproduced: reporter screenshot and source identify the duplicate outer layer; controlled executable RED is next |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| table:paint-only-selected-cells | 1 | none: no cross-layer compensation, duplicated live identity, hot-path, timer/focus, substrate, or second-failure trigger | patch | N/A: no public API or reusable call-shape decision | N/A: no Plite/Plate ownership change | pass: first failure stays in copied table presentation after workflow repair |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| table:paint-only-selected-cells | Registry `table.tsx` plus existing browser corpus | Fresh source-first www process; `/docs/examples/table`; `/blocks/table-demo`; exact Chrome and in-app Browser | pending fresh PID, route load, source hash, and selected-cell/table-layer inventory | Registry source owns change; `build:registry` owns generated payload | pending workflow repair before host start |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| table:paint-only-selected-cells | Exact Chrome classifier must reject current table-wide overlay while accepting cell-only and absent controls | After workflow repair, only `table.tsx`, existing `table-selection.spec.ts`, registry generation, and required registry changelog source if user-visible | Pixel red/green, correct/absent/duplicate controls, affected file replay, fresh Browser, 5/5 zero retry, receipt | pending | blocked pending workflow repair |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| pending | pending | pending | pending | pending | pending |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| pending | pending | pending | pending | pending | pending |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| table:paint-only-selected-cells | Shared Browser/Patch paint proof required known-visible and known-absent controls but omitted the Regression validator's known-invalid duplicate-layer control | repair-now | Align `.agents/rules/regression.mdc` and its methodology with Patch and the Browser plan pack; extend the Regression executable contract test | pass: 64/64 workflow tests, `pnpm install`, exact mirrors, resource parity, and agent-native PASS | reporter contradiction invalidated a false “zero generic highlights” proof that ignored the self-owned duplicate |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| pending | pending | pending | pending | pending | pending |

Findings:
- The table opts out of the generic `NodeSelectionHighlight` portal but renders
  both a table-level `TABLE_SELECTION_OVERLAY_CLASS` and cell-level overlays.
- Prior CASE-NS-002 counted only generic portals. It never classified the
  component-owned table rectangle or the layer count, so its green was false.

Timeline:
- 2026-08-26: node-selection extraction claimed table-owned paint preservation.
- 2026-08-26: reporter screenshot contradicted that claim; attempt 1 and its
  paint proof were invalidated and product edits froze.

Decisions and tradeoffs:
- Preserve the table opt-out marker so the global portal stays suppressed.
- Remove only the redundant table-wide paint after exact red proves ownership;
  keep per-cell overlays and all selection behavior unchanged.

Review fixes:
- Agent-native review: PASS. User action routes through Regression to Patch;
  `.agents/rules/**` and the shared Browser pack own the durable contract;
  generated Regression/Patch mirrors match; 64/64 tests and resource parity
  make the three-control proof discoverable and executable.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | N/A | N/A |

Verification evidence:
- pending

Final handoff:
- executable cases: pending
- cumulative reporter evidence, phase-specific oracles, and forbidden states: pending
- failed-fix invalidation and automatic repair: pending
- proof receipts and affected-corpus replay: pending
- started-gate failure closure: pending
- changed files: pending
- design decisions: pending
- tests and proof: pending
- source/generated sync: pending
- P1 and agent-native findings: pending
- residual risks and next owner: pending
- local completion status and integration/public-status boundary: pending

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | requirement extraction |
| Where am I going? | source/host readiness, executable cases, patch, verification, closeout |
| What is the goal? | close selected regressions through executable tests and fresh proof |
| What have I learned? | pending |
| What have I done? | template created |

Open risks:
- The exact gesture that selects the whole table must be reconstructed from the
  live route; a programmatic node-selection shortcut is a control, not reporter
  proof.
- Cell background colors can resemble selection paint, so the classifier needs
  brand-color masks and explicit wrapper-only sampling regions.
