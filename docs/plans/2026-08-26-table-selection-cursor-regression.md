# table selection cursor regression

Objective:
Eliminate the table resize-cursor flash during a held cell-selection drag;
done when the capture-phase cursor oracle and exact replay pass 5/5.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-table-selection-cursor-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- agent-native
- browser

Regression source:
- target bug / surface / corpus: a held table cell-selection drag advertises
  column resize when it crosses an ignored resize handle
- lane and current source owner: Plate registry `table.tsx`; Plite selection
  model behavior from the prior attempt remains an affected constraint
- selected executable test cases:
  `table:ignore-resize-handle-hover-during-cell-selection-drag`
- tested ref or dirty-state boundary:
`dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb` plus issue-owned SHA-256
  fingerprints recorded before and after proof
- route / proof host and freshness method: fresh `apps/www` process and fresh
  Browser/Playwright page at `/blocks/table-demo`; restart after final source
  or generated-registry changes
- invocation mode / timebox: one-shot execution; no timebox

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
- Every completed pointer-feedback oracle records `interaction-trace: pass`,
  the actual target, delivered event, and button state from the same path.
- A no-flash pointer-feedback claim records `pre-handler-state: pass`; the
  expected cursor must already exist when the target's capture listener runs.
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
- The held-pointer cursor is already `text` at target capture, never briefly
  `col-resize` or `row-resize`, over an ignored resize handle in 5/5 retry-free
  runs; idle handle hover restores `col-resize`, and ordinary resize behavior
  remains usable.

Verification surface:
- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-26-table-selection-cursor-regression.md --complete`
- manual P1 review on `next`, where repository policy forbids `autoreview`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-table-selection-cursor-regression.md`
- focused Regression validator tests and source/generated mirror parity
- `apps/www/tests/browser/table-selection.spec.ts` on `/blocks/table-demo`
- in-app Browser replay of held drag, cursor, selection, idle hover, resize,
  and console state

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
- Preserve the prior attempt's correct model selection, selected-cell count,
  hidden resize preview, drag continuation, release behavior, and idle resizing.
- Do not add a public API, selection state owner, timer, or cross-layer flag for
  a table-local pointer affordance.
- Do not commit or push.

Boundaries:
- allowed source owners: `.agents/rules/regression.mdc`, its source reference,
  semantic validator/test, `docs/plans/templates/regression.md`, and
  `apps/www/src/registry/components/editor/table.tsx`
- allowed proof/test owners: Regression validator tests,
  `apps/www/tests/browser/table-selection.spec.ts`, this plan, the existing
  registry changelog entry, its generated JSON, and the existing changeset
- generated/source boundary: edit `.agents/rules/**` and changelog MDX only;
  use `pnpm install` for `.agents/skills/**` mirrors and the registry generator
  for changelog JSON
- browser/device claim width: Playwright Chromium plus in-app Browser on the
  exact local route; exact Chrome and raw-device proof are not claimed
- forbidden product/API/release/public mutations: no new public API or Plite
  selection owner, no generated registry template edits, no commit, push, PR,
  release, or public status mutation
- orchestration mode and writer ownership: single writer in this thread; no
  subagents or concurrent route host

Output budget strategy:
- Start from exact owner and test files. Use runner discovery/counts before
  printing broad corpora. Cap logs and exclude generated/build trees.
- Read only exact table, Regression, changelog, changeset, and plan owners;
  cap test output and never scan `node_modules`, `.next`, `.turbo`, or templates.

Blocked condition:
- Block only when exact current behavior cannot be observed, the authoritative
  host/device/credential is unavailable, unsafe scope needs user authority, or
  the same blocker leaves no safe alternate packet.
- Repair broken commands, stale servers, generated drift, and missing proof
  hosts before treating them as product blockers.

Regression state:
- current phase: attempt 4 completed locally
- current executable case:
  `table:ignore-resize-handle-hover-during-cell-selection-drag`
- current case status: completed locally with pre-entry and target-capture proof
- next owner: user/coordinator for commit, push, or broader integration proof
- goal status: complete locally; uncommitted and unpushed

Completion rule:
- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Latest requirement: no resize cursor during held cell-selection drag; preserve selection and idle resize behavior; fix locally without commit/push. |
| Regression methodology loaded | yes | Read `.agents/skills/regression/references/methodology.md` completely. |
| Active goal checked or created | yes | Goal created with this plan and a 5/5 cursor threshold. |
| Current source owner and tested ref recorded | yes | Plate registry `table.tsx`; `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb`; initial hashes in Findings. |
| Executable test cases discovered | yes | Existing Playwright case `table:ignore-resize-handle-hover-during-cell-selection-drag`. |
| Cumulative reporter evidence resolved | yes | Base request and latest reporter contradiction are both required below. |
| Reporter oracle matrix resolved | yes | Current seven observations are resolved below; Regression repair will add mandatory pointer feedback before Patch resumes. |
| Regression semantic validator ready | yes | Source validator and test owner identified; first probe must reject the cursor-omitting packet after repair. |
| Route/proof-host readiness plan recorded | yes | Fresh `apps/www` process and fresh `/blocks/table-demo` page after final source bytes. |
| Patch delegation boundary recorded | yes | Table component/test/changelog/changeset only; no further Plite selection API work. |
| Orchestrator writer ownership recorded | yes | N/A: no orchestrator or subagent; this thread is the sole writer. |
| Output budget strategy recorded | yes | Exact-file reads and capped focused commands; generated/build trees excluded. |
| Claim width and blocked rules recorded | yes | Local Chromium/Browser claim only; block if exact route cannot expose computed cursor. |
| Agent-native pack selected | yes | Materialized agent-native rows retained in this plan. |
| Agent-facing action surface identified | yes | Regression's reporter-oracle matrix and semantic validator. |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/regression/**` is source; `.agents/skills/regression/**` is generated by `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read `.agents/skills/agent-native-reviewer/SKILL.md` completely. |
| Browser pack selected | yes | Materialized browser rows retained in this plan. |
| Browser route / app surface identified | yes | `/blocks/table-demo`, table cells, column-end resize handle. |
| Browser tool decision recorded | yes | Playwright owns repeatable RED/GREEN; in-app Browser owns final route interaction proof. |
| Console/network caveat policy recorded | yes | Runtime errors must be empty; unrelated dev/HMR information is recorded, not hidden. |
| Observable browser case captured | yes | Case ID, route, setup/action/outcome, Chromium scope, bad ref, and fingerprint plan are recorded below. |

Work Checklist:
- [x] Latest reporter correction captured: event-handler cursor mutation is
      frame-late; the cursor must be correct before the pointer reaches the
      resize handle, including edge paths that expose a one-frame flash.
- [x] Attempt 3 proof, receipt, and completion wording are invalidated.
- [x] Regression requires a pre-handler oracle for no-flash pointer feedback,
      with an executable validator rejection test.
- [x] Best API and Plate Plan refresh the target after the third failed fix.
- [x] Product attempt 4 removes the frame-late cursor mutation and passes the
      target-capture RED/GREEN oracle 5/5 plus final Browser proof.
- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [x] Current source, exact ref/dirty boundary, test runner, route/proof host,
      export/build path, and freshness method are recorded.
- [x] Generated/source drift and host readiness are repaired or block the claim.
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
- [x] Every completed applicable `pointer-feedback` row records
      `interaction-trace: pass`, the actual pointer `target:`, delivered
      `event:`, and `buttons:` state from the same interaction path.
- [x] Every applicable oracle row has a positive assertion, a distinct forbidden
      state, an executable layer/anchor, and an exact result; every inapplicable
      row has N/A reasons.
- [x] The smallest falsifying executable probe ran before scaling.
- [x] Exact reproduction and durable owner classification are recorded; proxy
      evidence stays labeled proxy.
- [x] The executable test is red before the fix, or the exact safe-red
      limitation and proof-host repair are explicit.
- [x] Regression delegated only one normalized case at a time to Patch.
- [x] Patch returned root cause, durable owner, changed files, exact red/green
      commands, final ref/dirty fingerprints, stability, architecture verdict,
      P1 review, and caveat.
- [x] Focused green proof passed. Final Browser verification runs when repo or
      claim policy requires it; E2E replay is required only for
      `e2e-required:` or already-existing affected-corpus E2E coverage.
- [x] Final proof ran through `capture-proof-receipt.mjs`; its ref, input digest,
      host, timestamps, retry count, and receipt ID validate.
- [x] Required retry-free stability runs passed with no retry.
- [x] Any stability-only failure after an exact green run froze product edits,
      gained a phase-specific executable diagnostic, and restarted baselines
      after product-versus-proof classification.
- [x] Any compositor phase claim records computed style, live range geometry,
      model/DOM endpoints, and callback identity at the mutation boundary. If
      those are final while pixels stay red, timing is rejected as the cause.
- [x] Every blocking pixel classifier passes a known-positive and known-negative
      control through the same capture path; a failed control invalidates prior
      results and freezes product edits until the proof helper is repaired.
- [x] Every completed applicable `geometry-paint` row names actual pixel capture
      and classification in its proof layer and records `positive-control: pass`
      plus `negative-control: pass`; computed style, DOM state, selection text,
      callback traces, and unclassified screenshots are diagnostics only.
- [x] Every shared owner was replayed against its affected exact corpus after
      the final owner edit.
- [x] Every shared CSS selector, marker, class map, or style expansion has a
      pre-edit consumer inventory. The affected corpus includes explicit
      transparent, borderless, shadowless, and ringless overrides, each with a
      forbidden duplicate/inherited-paint geometry oracle.
- [x] Every already-executable affected case has a `pass:` or `red:` pre-edit
      baseline recorded before its shared owner changes.
- [x] Every requested or started package, browser, root, or CI gate that failed
      is recorded and passes an exact final rerun on the final bytes.
- [x] Every selected case is kept, reverted, quarantined, deferred, or blocked
      honestly; only kept cases can satisfy goal success.
- [x] No sidecar case registry, TSV, JSON manifest, or duplicate behavior
      database was created.
- [x] Orchestrator ownership and overlapping writer/host serialization passed
      or are N/A with reason.
- [x] Workflow slowdowns and avoidable proof-host/command mistakes were
      repaired or deferred with owner.
- [x] Every case records one methodology delta.
- [x] Every failed claimed fix revoked prior completion, automatically repaired
      Regression with executable workflow proof, and restarted at attempt N+1.
- [x] Every second failed fix or architecture trigger passed Best API and the
      owning Plite/Plate plan before another Patch attempt.
- [x] Claim wording matches local, pushed, integration, and release evidence.
- [x] Every kept case and the run are marked `completed` once all required local
      proof and plan gates pass; commit/push state is recorded separately.
- [x] Final handoff records executable tests, decisions, refs, proof, sync,
      reviews, risks, and next owner.
- [x] Output budget discipline was followed.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-visible and
      known-absent controls through the identical capture path. Computed style,
      DOM state, selection text, and an unclassified screenshot are diagnostics,
      not final paint proof.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close the selected case and methodology row | pass: attempt 4 completed and pre-entry replay passed 5/5 without retry |
| Current-source readiness | yes | Prove source owner and final dirty boundary | pass: private table owner on `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb` |
| Route/proof-host readiness | yes | Prove the runner observes current source | pass: PID 3376, started 2026-08-26T13:37:11.000Z, served rebuilt registry on port 3001; fresh Browser tab opened after generation |
| Executable regression coverage | yes | Record RED, GREEN, and invariant | pass: exact pre-entry test was RED on `col-resize` and GREEN on `text` before the handle received pointer input |
| E2E escalation closure | yes | Record the lower-layer limitation | pass: Tailwind computed cursor and native pointer delivery require the existing browser test |
| Cumulative reporter evidence closure | yes | Map every reporter claim | pass: ignored selection state, wrong cursor, and one-frame flash deltas all have executable oracles |
| Reporter oracle closure | yes | Resolve all observations | pass: model, DOM, pointer, focus, errors, and follow-up passed; popup and pixels are reasoned N/A |
| Failed-fix interrupt closure | yes | Repair every failed-fix miss | pass: attempt 3 was revoked; pre-handler enforcement passed the 64/64 workflow and mirrors synced before product attempt 4 |
| Architecture pressure closure | yes | Refresh Best API and Plate plan after failure three | pass: cursor callback was cut; all public/core state and API options remain rejected; one scoped CSS owner survived |
| Proof receipt closure | yes | Validate final receipt | pass: receipt `sha256:d403d318ab8d840b4be876647b22d69d9c58d2e997392880ab305e0d714cc181` |
| Affected-corpus replay closure | yes | Replay after the last owner edit | pass: full table-selection spec 4/4, exact case 5/5, and canonical resize test 1/1 |
| Shared-style consumer closure | yes | Inventory the scoped selector consumers | pass: column-end, row-end, and column-start are the complete `data-table-resize-handle` inventory; canonical resize stayed green |
| Started-gate failure closure | yes | Record failures and final replacements | pass: all issue-owned product, browser, workflow, type, registry, and scoped hygiene gates are green |
| Smallest-probe closure | yes | Record first falsifying probe | pass: after two cells selected and before handle entry, computed cursor was `col-resize` |
| Patch delegation closure | yes | Read back one-case evidence | pass: root cause, owner, RED/GREEN, hashes, architecture, and risks recorded |
| Focused verification closure | yes | Run exact and affected tests | pass: 1/1 exact, 4/4 corpus, and 1/1 canonical resize |
| Stability closure | yes | Run retry-free warm proof | pass: 5/5, retries 0 |
| Packet decision closure | yes | Decide the selected case | pass: kept and completed locally |
| Local completion status | yes | Separate local from integration status | pass: completed on dirty ref; no commit, push, PR, release, or public status claim |
| No duplicate registry | yes | Avoid a sidecar behavior database | pass: executable test plus this transient plan only |
| Generated/source and host repair | yes | Repair source/mirror and registry drift | pass: `pnpm install`, sync exact, registry rebuilt, fresh Browser page clean |
| Orchestrator writer closure | no | N/A: no orchestrator or subagent used | N/A: one product writer; external checkout rewrite was serialized before final proof |
| Workflow slowdown closure | yes | Repair avoidable proof weaknesses | pass: completion can no longer rely on an event-time mutation for a no-flash claim |
| Methodology delta closure | yes | Resolve repair-now | pass: pointer feedback, same-path interaction traces, and pre-handler state are enforced mechanically |
| Source/generated sync | yes | Sync agent sources and mirrors | pass: `pnpm install`; `sync-resources.mjs --check` exact |
| Agent-native review | yes | Review changed workflow | pass: no P0-P3 finding |
| Final handoff contract | yes | Record proof, decisions, risks, and next owner | pass: Final handoff section is complete |
| Autoreview | no | N/A: repository rule forbids `autoreview` on `next` | N/A: manual P1 review found no actionable issue |
| Regression semantic plan | yes | Run the completion validator | pass: final command recorded below and rerun before goal close |
| Goal plan complete | yes | Run the goal checker | pass: final command recorded below and rerun before goal close |
| Agent source / generated sync | yes | Run `pnpm install` and verify mirrors | pass: install completed and source/generated resources are exact |
| Agent action discoverability | yes | Audit the worker route | pass: Regression and Patch source rules teach same-path traces and pre-handler proof for no-flash claims |
| Agent-native review | yes | Close accepted findings | pass: no accepted P0-P3 finding |
| Browser interaction proof | yes | Exercise the exact route with Browser | pass: fresh post-generation Browser CUA drag selected two cells, retained editor focus, started no resize, and restored idle `col-resize`; Playwright owns held pre-entry proof |
| Browser console/network check | yes | Inspect runtime errors | pass: fresh proof tab had zero console errors; route loaded from rebuilt registry |
| Browser final proof artifact | yes | Record route and interaction state | pass: fresh tab had 16 cells, all three handle kinds, two selected cells after drag, zero resize rows, focus retained, idle `col-resize`, and zero errors |
| Exact case replay | yes | Recheck action and end state | pass: pre-entry and target-capture cursor `text`, two selected cells, continuation to three, idle cursor `col-resize`, focus retained |
| Final ref and fingerprints | yes | Fingerprint all receipt inputs | pass: dirty ref and 13-input digest `sha256:13602f7249cbe7d439719c9c7341c429801fbeb534e8702cfda639eafcc2067b` |
| Clean final runtime | no | N/A: this is an uncommitted local candidate | N/A: no pushed-ref, integration, shipped, or released claim is made |
| Retry-free stability | yes | Run 5/5 in reported Chromium path | pass: 5/5 with retries 0 on the final issue-owned inputs |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | complete | requirements, packs, exact case, boundaries, and goal recorded | source/host readiness |
| Current source and proof-host readiness | complete | source owner/ref/hashes recorded; existing current-source 3001 host returned route 200; clean-final-host limitation retained | discover executable cases |
| Executable case discovery and selection | complete | existing exact Playwright case selected with E2E lower-layer limitation | smallest probe |
| Cumulative reporter evidence inventory | complete | base acceptance, latest cursor delta, and idle resize contract retained | reporter oracle expansion |
| Reporter oracle expansion | complete | all eight observations resolved; pointer feedback required during action and after release | semantic validation |
| Pre-implementation semantic validation | complete | active plan structurally valid after executable workflow repair | smallest probe |
| Smallest high-value probe | complete | no-flash semantic test was RED because eventual computed style passed; GREEN after pre-handler enforcement; workflow 64/64 | reproduce/classify |
| Reproduce, classify, and red test | complete | before entering the handle, exact browser RED expected `text` and received `col-resize`; selection state was already correct | patch delegation |
| One-case Patch delegation | complete | attempt 4 deletes cursor mutation/restoration and applies one scoped CSS interaction rule to all three resize directions | verification |
| Focused verification and stability | complete | pre-entry plus target-capture trace, full 4/4 corpus, exact 5/5 receipt, and canonical resize 1/1 passed | packet decision |
| Keep/revert/quarantine | complete | kept: exact reporter case and idle-resize compatibility are green | methodology delta |
| Methodology repair/no-change/defer | complete | repair-now added pointer-feedback law, validator enforcement, template row, Patch teaching, mirror sync, and agent-native PASS | product attempt 2 |
| Second failed-fix interrupt | complete | event-path validator RED then GREEN; workflow 60/60; source/generated exact; Best API and Plate ownership target accepted below | product attempt 3 |
| Product attempt 3 | invalidated | reporter observed a one-frame flash because the cursor changed only inside the handle event | third failed-fix interrupt |
| Third failed-fix interrupt | complete | pre-handler validator RED then GREEN; workflow 64/64; source/generated exact; Best API and Plate target refreshed | product attempt 4 |
| Product attempt 4 | complete | CSS state exists before handle entry; cursor callback and restore handlers are gone; no public API or selection-state change | final review |
| Reviews and final handoff | complete | manual P1 and agent-native reviews found no actionable issue; receipts and risks recorded | goal-plan check |
| Final goal-plan check | complete | semantic validator and Autogoal checker pass on the completed packet | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| table:ignore-resize-handle-hover-during-cell-selection-drag | User reports on 2026-08-26: base request `hovering resize handle while dragging should be ignored`; latest delta `i see edge cases where i still see it for a frame` | Open `/blocks/table-demo`; drag from cell 0 to cell 4; keep mouse down; read the column-end handle cursor before entering it; cross the handle; release; hover and resize while idle | Before handle entry and throughout the held selection drag the handle keeps the text-selection cursor, selection stays unchanged, no resize preview/action starts; after release the handle restores `col-resize`, and selection can continue or ordinary resize can start | reporter: latest delta requires no one-frame resize cursor; existing-contract: ignored root chrome must not advertise an action during a cell-selection drag | e2e-required: JSDOM/package tests do not compute Tailwind cursor CSS or exercise native held-pointer hover; extend the existing exact Playwright case only | browser: Playwright Chromium and in-app Browser on local `/blocks/table-demo` | `apps/www/tests/browser/table-selection.spec.ts`; `pnpm --filter www exec playwright test tests/browser/table-selection.spec.ts --project=chromium --grep table:ignore-resize-handle-hover-during-cell-selection-drag --repeat-each=5 --retries=0` | completed | dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb | user/coordinator for integration |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| table:ignore-resize-handle-hover-during-cell-selection-drag | base-acceptance | User 2026-08-26: `hovering resize handle while dragging should be ignored` plus prior selection/highlight reports | during-action | Crossing ignored resize chrome must preserve the held multi-cell selection, hide preview, avoid resize, and allow the drag to continue | required | model@during-action, dom-native@during-action, follow-up-input@follow-up | test: apps/www/tests/browser/table-selection.spec.ts#table:ignore-resize-handle-hover-during-cell-selection-drag | pass: two cells stayed selected, preview stayed hidden, resize state stayed absent, and the drag continued to three cells |
| table:ignore-resize-handle-hover-during-cell-selection-drag | latest-reporter-delta | User 2026-08-26: `i still see the hover cursor change, fix` | during-action | The held pointer must not switch to a resize cursor over ignored resize chrome | required | pointer-feedback@during-action | test: apps/www/tests/browser/table-selection.spec.ts#table:ignore-resize-handle-hover-during-cell-selection-drag | pass: real target handle received held `pointermove`; computed cursor was `text` in 5/5 runs |
| table:ignore-resize-handle-hover-during-cell-selection-drag | latest-reporter-delta | User 2026-08-26: `i see edge cases where i still see it for a frame` | during-action | The resize cursor must not exist even before the pointer enters the handle; eventual handler repair is insufficient | required | pointer-feedback@during-action | test: apps/www/tests/browser/table-selection.spec.ts#table:ignore-resize-handle-hover-during-cell-selection-drag | pass: pre-handler-state: pass; pre-entry handle cursor was `text` in 5/5 retry-free runs; attempt 3 receipt remains revoked |
| table:ignore-resize-handle-hover-during-cell-selection-drag | existing-contract | Current table resize handle and prior browser proof | after-release | Idle handle hover restores resize affordance and ordinary resizing remains usable | required | pointer-feedback@after-release, follow-up-input@follow-up | test: apps/www/tests/browser/table-selection.spec.ts#table:ignore-resize-handle-hover-during-cell-selection-drag | pass: idle cursor restored to `col-resize`, preview displayed, and canonical resize test changed width |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| table:ignore-resize-handle-hover-during-cell-selection-drag | model | during-action | yes | Editor selection equals the held two-cell selection while the pointer is over the handle | Selection expands, contracts, or moves to a handle-derived range | browser Playwright harness | test: apps/www/tests/browser/table-selection.spec.ts#table:ignore-resize-handle-hover-during-cell-selection-drag | pass: held editor selection remained equal while the real pointer targeted the handle |
| table:ignore-resize-handle-hover-during-cell-selection-drag | dom-native | during-action | yes | Two cells stay selected, no resizing row exists, and the preview stays hidden | Changed selected-cell count, preview, or resize state appears | browser Playwright DOM oracle | test: apps/www/tests/browser/table-selection.spec.ts#table:ignore-resize-handle-hover-during-cell-selection-drag | pass: selected count 2, preview `none`, and resizing rows 0 during the held move |
| table:ignore-resize-handle-hover-during-cell-selection-drag | pointer-feedback | during-action | yes | reporter-noun: resize handle; affordance-inventory: column-end, row-end, and column-start handles in `TableCellResizeControls`; every handle computes `text` before entry and during the active cell-selection gesture | Any ignored handle computes `col-resize` or `row-resize` before its event handler and advertises resizing for one frame | browser Playwright pre-entry and target-capture pointer oracle plus in-app Browser | test: apps/www/tests/browser/table-selection.spec.ts#table:ignore-resize-handle-hover-during-cell-selection-drag | pass: pre-handler-state: pass; interaction-trace: pass; target: resize-handle; event: pointermove; buttons: 1; pre-entry and target-capture cursor `text` in focused GREEN |
| table:ignore-resize-handle-hover-during-cell-selection-drag | pointer-feedback | after-release | yes | reporter-noun: resize handle; affordance-inventory: column-end, row-end, and column-start handles in `TableCellResizeControls`; idle column handle computes `col-resize` | The suppressed `text` cursor remains stuck after release | browser Playwright computed cursor oracle | test: apps/www/tests/browser/table-selection.spec.ts#table:ignore-resize-handle-hover-during-cell-selection-drag | pass: interaction-trace: pass; target: resize-handle; event: pointermove; buttons: 0; computed cursor `col-resize`; CSS active state ended |
| table:ignore-resize-handle-hover-during-cell-selection-drag | focus | after-release | yes | The editor root still contains the active element | Resize handle or external chrome owns focus | browser Playwright focus oracle | test: apps/www/tests/browser/table-selection.spec.ts#table:ignore-resize-handle-hover-during-cell-selection-drag | pass: editor root contained the active element after release and idle hover |
| table:ignore-resize-handle-hover-during-cell-selection-drag | popup | during-action | no | N/A: table selection and resize controls have no popup, toolbar, menu, or dialog | N/A: no popup surface exists in this case | N/A: no popup surface exists in this case | N/A: no popup surface exists in this case | N/A: no popup surface exists in this case |
| table:ignore-resize-handle-hover-during-cell-selection-drag | geometry-paint | during-action | no | N/A: the OS cursor is not page paint and page screenshots do not capture it; computed cursor owns this contract | N/A: no page-pixel claim is used to close the cursor contract | N/A: no page-pixel claim is used to close the cursor contract | N/A: no page-pixel claim is used to close the cursor contract | N/A: no page-pixel claim is used to close the cursor contract |
| table:ignore-resize-handle-hover-during-cell-selection-drag | runtime-errors | after-release | yes | No page error, console error, or unhandled rejection occurs | Any runtime error or dev overlay appears | browser Playwright runtime-error recorder | test: apps/www/tests/browser/table-selection.spec.ts#table:ignore-resize-handle-hover-during-cell-selection-drag | pass: Playwright recorder and fresh in-app Browser tab reported zero runtime errors |
| table:ignore-resize-handle-hover-during-cell-selection-drag | follow-up-input | follow-up | yes | The held drag can continue to a third cell, and an idle handle can still resize | Drag gets stuck at the handle or resize stays disabled after release | browser Playwright plus in-app Browser interaction | test: apps/www/tests/browser/table-selection.spec.ts#table:ignore-resize-handle-hover-during-cell-selection-drag | pass: selection continued from 2 to 3 cells; idle preview and `col-resize` returned; canonical resize test passed 1/1 |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| table:ignore-resize-handle-hover-during-cell-selection-drag | 4 | completed | "env" "PLAYWRIGHT_BASE_URL=http://localhost:3001" "pnpm" "--filter" "www" "exec" "playwright" "test" "tests/browser/table-selection.spec.ts" "--project=chromium" "--grep" "table:ignore-resize-handle-hover-during-cell-selection-drag" "--repeat-each=5" "--retries=0" | pass: exit 0 in 10097ms | dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb | sha256:13602f7249cbe7d439719c9c7341c429801fbeb534e8702cfda639eafcc2067b | 13 | apps/www/playwright.config.ts,apps/www/public/r/registry.json,apps/www/public/r/table.json,apps/www/src/__registry__/index.tsx,apps/www/src/registry/components/editor/table.tsx,apps/www/src/registry/examples/demo.tsx,apps/www/src/registry/examples/values/table-value.tsx,apps/www/src/registry/registry-examples.ts,apps/www/tests/browser/table-selection.spec.ts,packages/plite-react/src/editable/root-interaction-controller.ts,packages/plite-react/src/editable/root-interaction-resolver.ts,packages/plite-react/test/root-interaction-controller.test.tsx,packages/plite-react/test/root-interaction-resolver.test.ts | pid:3376;started:2026-08-26T13:37:11.000Z;base-url:http://localhost:3001;browser:playwright-chromium | 2026-08-26T13:48:21.419Z | 2026-08-26T13:50:16.144Z | 2026-08-26T13:50:26.242Z | 0 | sha256:d403d318ab8d840b4be876647b22d69d9c58d2e997392880ab305e0d714cc181 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| `table.tsx` plus exact table-selection browser owner | table:ignore-resize-handle-hover-during-cell-selection-drag | red: pre-entry handle cursor computed `col-resize` before attempt 4 | 2026-08-26T13:48:21.419Z | `PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm --filter www exec playwright test tests/browser/table-selection.spec.ts --project=chromium --grep table:ignore-resize-handle-hover-during-cell-selection-drag --repeat-each=5 --retries=0` | sha256:13602f7249cbe7d439719c9c7341c429801fbeb534e8702cfda639eafcc2067b | pass: pre-entry and target-capture cursor case passed 5/5 after the last owner/test edit |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Attempt 3 reporter contradiction | Event-handler mutation eventually produced `text`, but edge paths exposed `col-resize` for one frame | product defect plus insufficient pre-handler oracle | revoked attempt 3; repaired Regression; deleted cursor mutation/restoration in favor of pre-entry CSS state | pass: exact pre-entry oracle is GREEN 5/5 and target-capture trace records `text` |
| Attempt 2 final Browser verification | Real held `pointermove` reached the handle without `pointerenter`; cursor stayed `col-resize` | product defect plus insufficient event-path oracle | revoked attempt 2; repaired Regression; wired `pointermove` on all three handles | pass: fresh Browser trace computes `text` for target handle, event `pointermove`, buttons `1` |
| Shared checkout rewrite | HEAD advanced and nine conflicts temporarily split staged product bytes from the worktree | proof-source drift outside the atomic cursor edit | waited for conflict resolution, rebuilt registry, and invalidated every old final receipt | pass: HEAD `d282fd8a33affb40d2b60103b6c1ce370140d2eb`, zero unmerged paths, all proofs rerun |
| Stale Browser host output | Shared rewrite temporarily removed generated `registry.json`, producing module-not-found errors in the old tab | generated host drift | ran `pnpm --filter www build:registry` and opened a fresh Browser tab | pass: rebuilt 380 payloads and 15 overlays; fresh final tab has zero console errors |
| Browser CDP resize-release diagnostic | Raw CDP mouse release left the diagnostic row marker active although the width override moved | proof-harness limitation, not reporter cursor behavior | used the existing canonical Playwright resize path with real `page.mouse` release | pass: canonical `renders, selects, and resizes cells without runtime errors` passed 1/1 |
| Whole-checkout whitespace diagnostic | `git diff HEAD --check` reported unrelated generated preview-style whitespace in the shared 1,425-file checkout | out-of-scope shared-tree hygiene, not an issue-owned package/browser/root/CI gate | preserved unrelated bytes and ran the exact scoped check over all cursor/workflow owners | pass: scoped issue-owned `git diff HEAD --check -- <owners>` is clean |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| table:ignore-resize-handle-hover-during-cell-selection-drag | 1 | Reporter still sees the resize cursor during the held drag after candidate-local completion | reporter-contradiction | yes: prior green, receipt, goal completion, and completion wording revoked | repair-now: add explicit pointer-feedback coverage to `.agents/rules/regression.mdc`, methodology, template, and semantic validator | pass: focused validator RED 27/28 then GREEN 28/28; full workflow 58/58; sync-resources exact | no: first failed fix; table-local cursor affordance creates no architecture trigger | N/A: first failure and no public API or cross-layer compensation | reproduced: workflow repair passed; restart exact reporter case as attempt 2 after pre-edit baseline |
| table:ignore-resize-handle-hover-during-cell-selection-drag | 2 | Fresh final Browser replay targeted the real handle and emitted held `pointermove` with `buttons=1`, but no `pointerenter`; computed cursor remained `col-resize` | final-verification | yes: attempt 2 Playwright green and provisional 5/5 receipt revoked | repair-now: `.agents/rules/regression.mdc` and its validator require an executable interaction trace for applicable pointer-feedback completion | pass: focused validator RED because computed-cursor-only completion passed, then GREEN; full workflow 59/59; source/generated exact | yes: second-failed-fix | best-api: cut every public/core option; plate-plan: keep one private registry owner and adopt all three handles | reproduced: gates passed; restart exact event-path case as attempt 3 |
| table:ignore-resize-handle-hover-during-cell-selection-drag | 3 | Reporter observed edge paths with a one-frame resize-cursor flash after attempt 3 eventually changed the cursor to `text` | reporter-contradiction | yes: attempt 3 receipt, goal completion, and local-completion wording revoked | repair-now: `.agents/rules/regression.mdc`, methodology, validator, template, and Patch require target-capture or equivalent pre-handler proof for flash/flicker/frame claims | pass: new semantic test was RED because eventual computed style passed; GREEN 1/1 and full validator 32/32 after enforcement; `pnpm install` synced mirrors | yes: third failed fix retains architecture escalation | best-api: delete cursor mutation and new state; plate-plan: use pre-existing CSS interaction state in the registry table owner | reproduced: pre-entry browser oracle expected `text` and received `col-resize`; product attempt 4 resumed only after workflow and architecture refresh |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| table:ignore-resize-handle-hover-during-cell-selection-drag | 3 | second-failed-fix | escalate | required: best-api cuts the private cursor handler as well as every public API, plugin, selection state, timer, and Core cursor policy | plate-plan: Plate registry `table.tsx` owns one CSS interaction rule across right, bottom, and left handles; Plite keeps only generic model-ignore behavior | pass: the cursor is presentation, the wrapper already owns all handles, and CSS `:active` exists before handle entry while `:has(handle:active)` preserves actual resize |

Best API decision:
- Verdict: adding an editor selection-drag API, hook, plugin, or Core cursor
  policy would be architectural garbage. It would turn one copied component's
  transient presentation into a second selection authority.
- Ideal public call site: none. No caller should query editor state to style
  this handle.
- Surviving cursor call shape: none. The frame-late inline cursor mutation and
  its restore handlers are deleted. `showResizePreview(...)` remains private
  and owns only the idle preview.
- Canonical owners: Plite owns model selection and the generic ignored-root-
  chrome contract; Plate registry `table.tsx` owns resize-handle cursor and
  preview presentation.
- Delete/reject counterfactuals: no `BlockSelectionPlugin`, no selection-drag
  field, no public hook, no cursor namespace, no timer, no component cursor
  handler, and no CSS policy in Plite. The existing editor authority needs no
  new state.
- Evidence: `TableCellResizeControls` has one terminal registry owner;
  `data-plite-root-chrome-ignore` already preserves the model selection; only
  the table handle carries `cursor-col-resize` and preview callbacks.

Plate layer plan:
- Current -> target: delete cursor work from the preview callback. The table
  wrapper's CSS sets every resize handle to `text` while the wrapper is active,
  except when a resize handle itself is active. The state exists before handle
  entry; idle preview events remain separate.
- Adoption surface: the right, bottom, and optional left handle in
  `TableCellResizeControls`; no package export, plugin kit, editor API, schema,
  persisted data, or Plite selection change.
- Vertical slice: make the existing browser case RED by reading the handle
  cursor before pointer entry; delete inline cursor mutation/restoration; mark
  all three handle directions for the scoped CSS rule; regenerate the registry;
  replay exact case, full table corpus, 5/5, and fresh Browser pre-entry plus
  target/event/button trace; verify idle cursor and real resize.
- Governing invariant: ignored UI may not advertise resize during another held
  interaction, while the handle must advertise and perform resize when idle or
  actively resizing.
- Risks and falsification: `col-resize` before handle entry, a suppressed idle
  preview, or `text` during an active resize rejects the packet. Actual width
  change, focus, selection, release, and console remain gates.
- Accepted target: this is the smallest source-backed owner that fulfills the
  user's explicit fix request; implementation difficulty and compatibility add
  no surviving API requirement.

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| table:ignore-resize-handle-hover-during-cell-selection-drag | `apps/www/src/registry/components/editor/table.tsx` | Playwright and in-app Browser at `/blocks/table-demo`; PID 3376 on port 3001 | registry rebuilt after final source edit; receipt and a new Browser tab started after generation | registry source is live owner; changelog and public JSON are generator-owned; no package export change | pass: route loaded current source; 5/5 receipt and fresh Browser state use final issue-owned inputs |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| table:ignore-resize-handle-hover-during-cell-selection-drag | exact browser RED: expected `text`, received `col-resize` while selection/preview remained correct | `table.tsx`, exact browser spec, existing changelog entry/generated JSON, existing changeset, and plan only | exact RED/GREEN, full affected table spec, 5/5 retry-free, Browser route, idle resize compatibility, typecheck/format/diff checks | root cause, final hashes/ref, exact commands, Browser/console proof, architecture verdict, changelog/changeset, manual P1 review | pass: private owner proven; exact 1/1, corpus 4/4, stability 5/5, resize 1/1, Browser trace, typecheck, registry, and review passed |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| table:ignore-resize-handle-hover-during-cell-selection-drag | final PID 3376 Playwright Chromium plus fresh in-app Browser tab | 5 retry-free exact runs | pass: 5/5 pre-entry exact; full corpus 4/4; target-capture trace and Browser final route state green | 0 | completed locally |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| table:ignore-resize-handle-hover-during-cell-selection-drag | RED before handle entry; GREEN 1/1; full table corpus 4/4; exact receipt 5/5; canonical resize 1/1; fresh Browser route | keep | local completed candidate on `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb`; uncommitted and unpushed | OS cursor pixels are not captured; pre-entry computed cursor plus target-capture trace owns the no-flash contract | user/coordinator for commit, push, or integration proof |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| table:ignore-resize-handle-hover-during-cell-selection-drag | Old oracle treated ignored selection/model/preview state as sufficient and never asked whether the pointer still advertised resize | repair-now | `.agents/rules/regression.mdc`, methodology, template, and semantic validator add mandatory pointer-feedback coverage; generated Patch/Regression mirrors synced | pass: focused validator RED 27/28 then GREEN 28/28; minimum workflow 58/58; sync-resources exact; source/mirror `rg` parity | repair-now complete; agent-native review PASS with no finding; product attempt 2 resumed |
| table:ignore-resize-handle-hover-during-cell-selection-drag | Attempt 2 asserted computed cursor after an automation path that could dispatch `pointerenter`; it did not prove the reporter-equivalent delivered event | repair-now | `.agents/rules/regression.mdc`, methodology, template, semantic validator, and Patch require `interaction-trace: pass` plus target, event, and buttons for pointer-feedback completion | pass: new validator test was RED because computed-cursor-only evidence produced no error, then GREEN; final workflow 60/60; `pnpm install`; sync-resources exact; source/mirror parity | second failed-fix interrupt complete; agent-native review PASS with no P0-P3 finding; Best API and Plate layer plan accepted before attempt 3 |
| table:ignore-resize-handle-hover-during-cell-selection-drag | Attempt 3 changed cursor inside the event path, so eventual computed style could pass while the reporter still saw a one-frame resize cursor | repair-now | `.agents/rules/regression.mdc`, methodology, template, semantic validator, and Patch require a target-capture or equivalent pre-handler oracle plus `pre-handler-state: pass` | pass: focused workflow test RED then GREEN; full workflow 64/64; `pnpm install`; source/generated exact | third failed-fix interrupt complete; agent-native review PASS; refreshed Best API and Plate plan cut the cursor handler before attempt 4 |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| `pnpm --filter www dev -- --port 3001` | host command | immediate / immediate | extra `--` was passed to Next as a project directory | none; host never started | corrected command shape to `pnpm --filter www dev --port <port>` |
| fresh normal and Plite dev host attempts | Next dev lock | immediate / startup | existing repo servers own `.next` on 3000 and `.next-plite` on 3001 | diagnosed live host ownership without killing shared processes | used current-source 3001 host for local candidate proof; clean pushed-ref host remains outside this dirty local claim |
| shared checkout rewrite | external coordinator | one invalidated proof cycle | HEAD and generated registry changed while the local packet was proving | proved why immutable input receipts matter | waited for zero conflicts, rebuilt registry, opened fresh pages, and reran every issue-owned gate on `d282fd8a` |
| synthetic pointer priming in the first attempt-3 test | exact browser oracle | one review cycle | test dispatched `pointermove` before moving the held mouse, weakening reporter equivalence | caught by manual P1 review before close | deleted the synthetic dispatch; final test trace comes only from `page.mouse.move` and still passes 5/5 |

Findings:
- Final root cause: attempt 3 declared `cursor-col-resize` in CSS and repaired
  it only from a React pointer handler. The handle therefore had the wrong
  material state until event processing, which permits the reported frame.
  Selection and ignored-root-chrome behavior were already correct.
- Initial issue-owned hashes: `table.tsx`
  `sha256:6ea565952deb939443137b48da7a817157c7a01b68b3ba3dc719510a883643cd`;
  browser spec
  `sha256:fd9c69c83efeb14b82730fc9f10662063eb0628bca4f49c07fdd2809ae87c77a`;
  root controller
  `sha256:21ac459197eac8096c93b4a463e1f6da08d14b3ca910f1776df9f911764eedfe`;
  root controller test
  `sha256:5e007107dd5b1ca000faa3eef44e71aeb870adfea98edcf30ac231b6f5401aa0`.
- The exact browser case proves selection, preview, resize state, focus,
  continuation, pre-entry cursor state, and the target-capture event trace.
- Agent-native review: PASS. Regression is the discoverable route;
  `.agents/rules/regression/**` and `docs/plans/templates/regression.md` are
  durable owners; `.agents/skills/regression/**` and Patch mirrors synced;
  focused validator and mirror checks are repeatable proof. No P0-P3 finding.
- Product RED for attempt 4: after two cells were selected but before entering
  the resize handle, exact Playwright expected `text` and received
  `col-resize`.
- Attempt 2 owner: `table.tsx` temporarily sets the hovered handle cursor to
  `text` when pointer buttons are held, then removes the override on normal
  hover, pointer leave/up/cancel, and resize start.
- Attempt 2 is invalid: the implementation runs only from `onPointerEnter`, but
  a real held selection can move onto the handle through `pointermove` without
  dispatching `pointerenter`. The fresh Browser trace recorded the real handle
  as the hit target, `pointermove` with `buttons=1`, no enter event, and a
  computed `col-resize` cursor.
- Final issue-owned hashes: `table.tsx`
  `sha256:3f2253f72c3cb40faef739d8d0f18ce519907081353ee11eab7d301e4f727b5f`;
  browser spec
  `sha256:792f34e2b881a268992e5e86946c0c2c270048873c5c908fc3e2282904c63f8a`;
  changelog source
  `sha256:b8b87509530582abdfce9a8ea5a153d3fac249281009d22a05fcb8bb4922ddaa`;
  generated table payload
  `sha256:2ed3b81e8b5c0caee0842521fc67714426b1543f8f5c33c45922972cb2ede3ea`.
- Attempt 3 is invalid: it uses a private callback from `pointerenter` and
  `pointermove`, so the cursor becomes correct only after component event work.
- Attempt 4 deletes cursor mutation and restoration. One wrapper CSS rule uses
  existing `:active` state before handle entry and excludes an active resize
  handle; the preview callback owns preview only.

Timeline:
- 2026-08-26 user contradiction invalidated attempt 1 and triggered automatic
  Regression repair.
- 2026-08-26 loaded Regression methodology, Patch, Autogoal, Browser,
  registry-changelog, and agent-native-reviewer contracts; created goal/plan.
- 2026-08-26 validator workflow test reproduced the miss: 27/28 with the new
  pointer case accepted by the old validator; repair made it 28/28.
- 2026-08-26 `pnpm install`, minimum workflow proof 58/58,
  `sync-resources.mjs --check`, source/mirror audit, and agent-native review
  passed. Product bytes remained frozen.
- 2026-08-26 pre-edit affected browser corpus passed 3/3 on the current-source
  3001 host.
- 2026-08-26 exact product oracle was RED (`text` expected, `col-resize`
  received), then GREEN 1/1 after the table-local repair.
- 2026-08-26 fresh in-app Browser final verification invalidated attempt 2:
  target identity and held-pointer trace passed, but the cursor stayed
  `col-resize` because no `pointerenter` event fired. Product writes froze for
  Regression repair plus second-failure Best API and Plate-plan gates.
- 2026-08-26 attempt 3 wired the real `pointermove` path on all resize edges.
  The durable test was tightened so only real held mouse movement produces its
  target/event/buttons trace.
- 2026-08-26 reporter contradiction invalidated attempt 3. The workflow test
  proved eventual style was insufficient, then pre-handler enforcement passed
  64/64 with exact generated mirrors.
- 2026-08-26 attempt 4 cut cursor handlers and moved the transient affordance to
  pre-entry CSS state. Final proof passed: exact 1/1, table corpus 4/4,
  stability 5/5, canonical resize 1/1, www typecheck, registry build,
  Regression workflow 64/64, Next compilation/errors clean, and fresh Browser
  route state with zero errors.

Decisions and tradeoffs:
- Repair the oracle before product bytes -> prevents another cursor-blind green.
- Keep the product repair table-local -> cursor affordance belongs to the
  resize handle; no new editor selection state or public API is justified.
- Delete event-time cursor repair -> CSS `:active` state exists before the
  pointer reaches a handle; excluding `handle:active` preserves real resizing.
- Use existing Playwright case -> exact computed Tailwind cursor needs a real
  browser; JSDOM cannot supply an honest RED.

Review fixes:
- Agent-native review PASS: action route, source owner, generated mirrors,
  discoverability, proof command, and authority boundary are complete; no
  accepted finding.
- Manual P1 review PASS: no remaining P0-P3 finding in the scoped `:active`
  rule, all-edge marker inventory, active-resize exclusion, preview-only
  callback, or pre-entry oracle. `autoreview` is forbidden on `next`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Dev command passed an extra `--`, so Next treated `--port` as a directory | 1 | Pass `--port` directly through the pnpm script | Corrected command shape; no product bytes changed |
| Fresh ports could not own `.next` or `.next-plite` because existing repo servers hold their locks | 2 | Preserve shared servers; use current-source 3001 for candidate-local proof and record clean-host limit | Route 3001 returned 200 and pre-edit corpus passed 3/3; no process killed |

Verification evidence:
- Exact RED: after two cells were selected and before the pointer entered the
  handle, the reporter-equivalent path expected `text` and received
  `col-resize` before attempt 4.
- Exact GREEN: focused case 1/1; full table-selection browser corpus 4/4;
  receipt-backed stability 5/5 with retries 0.
- Exact held Playwright: pre-entry and target-capture cursor `text`, target
  `resize-handle`, event `pointermove`, buttons `1`, preview `none`, two
  selected cells, zero resizing rows, and continuation to three cells.
- Fresh in-app Browser after registry generation: 16 cells and all three handle
  kinds rendered; CUA drag selected two cells, created zero resize rows,
  retained editor focus, restored idle `col-resize`, and logged zero errors.
- Next dev runtime: `get_compilation_issues` returned `issues: []` and
  `get_errors` returned empty config/session errors.
- Compatibility: canonical registry table resize/select test passed 1/1.
- Build/contracts: `pnpm --filter www build:registry` materialized 380 payloads
  and 15 overlays; www TypeScript passed; scoped Ultracite passed; changelog
  source/generated check passed 87/87; Regression workflow passed 64/64;
  `sync-resources.mjs --check` reported exact.
- Receipt: input digest
  `sha256:13602f7249cbe7d439719c9c7341c429801fbeb534e8702cfda639eafcc2067b`;
  receipt ID
  `sha256:d403d318ab8d840b4be876647b22d69d9c58d2e997392880ab305e0d714cc181`.

Final handoff:
- executable cases: one selected case, completed on attempt 4.
- cumulative reporter evidence, phase-specific oracles, and forbidden states:
  selection/model, preview, cursor, focus, errors, continuation, release, and
  idle resize are closed above.
- failed-fix invalidation and automatic repair: all three invalidated attempts
  and executable Regression repairs are recorded; final workflow is 64/64.
- proof receipts and affected-corpus replay: final 13-input receipt and 4/4 plus
  5/5 replays are recorded above.
- started-gate failure closure: checkout drift, stale generated host, manual CDP
  resize diagnostic, and shared-tree whitespace diagnostic are classified with
  passing issue-owned replacements.
- changed files: private table component, exact browser test, existing registry
  changelog source/generated output, Regression/Patch workflow sources and
  generated mirrors, template, and this plan. Registry generator output was
  rebuilt; no package API or export was added.
- design decisions: one scoped table CSS owner; no cursor handler, selection
  plugin, state, hook, timer, Core cursor policy, or public API.
- tests and proof: exact 1/1, corpus 4/4, stability 5/5, resize 1/1, typecheck,
  registry/changelog generation, workflow 64/64, fresh Browser and Next MCP,
  zero errors.
- source/generated sync: `pnpm install`, source/mirror parity, registry build,
  and changelog check all pass.
- P1 and agent-native findings: no open P0-P3 finding.
- residual risks and next owner: OS cursor pixels are not screenshot-capturable;
  pre-entry computed cursor plus real target/event/button trace is the
  executable law.
  User/coordinator owns any commit, push, CI, or integration proof.
- local completion status and integration/public-status boundary: completed on
  `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb`; uncommitted and unpushed; no
  shipped, released, or public-status claim.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | attempt 4 is completed locally with final receipt and Browser proof |
| Where am I going? | freeze repo writes and hand the local candidate to the user/coordinator |
| What is the goal? | keep the text-selection cursor stable over ignored resize handles without breaking selection or idle resizing |
| What have I learned? | any cursor change performed by the handle event is frame-late for a no-flash contract; the correct state must exist before entry |
| What have I done? | repaired the pre-handler oracle, cut cursor mutation/restoration and every public API option, applied one scoped CSS law to all handle directions, and passed final proof |

Open risks:
- Native cursor pixels are not present in page screenshots. Real-mouse
  Playwright reads computed cursor before handle entry and at target capture;
  Browser owns fresh-route drag/release, focus, DOM state, and error proof.
- Shared checkout can change outside this case; the recorded receipt is valid
  only while its 13 issue-owned inputs retain digest
  `sha256:13602f7249cbe7d439719c9c7341c429801fbeb534e8702cfda639eafcc2067b`.
