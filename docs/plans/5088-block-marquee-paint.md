# 5088 block marquee paint

Objective:
Complete #5088 marquee-paint regression; done when the cumulative case is red
before the fix and passes 5/5 exact Chrome with a receipt and closed plan.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5088-block-marquee-paint.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- browser

Regression source:
- target bug / surface / corpus: issue #5088 cumulative gutter-drag block
  selection, including Felix's 2026-08-23 missing-marquee contradiction
- lane and current source owner: Plate Selection owns the portal/API contract;
  copied registry `BlockSelectionKit` owns brand presentation
- selected executable test cases:
  `issue-5088:gutter-drag-marquee-paint`
- tested ref or dirty-state boundary: current base and `origin/next`
  `57c26226c65d2ccdb962b6a99d42ef6a8f5c4cc1`; final issue-owned input
  fingerprints required
- route / proof host and freshness method: fresh `apps/www` source-built host
  on `/blocks/playground`; focused root Playwright probe, Browser QA, then
  attested installed Google Chrome for the full retry-free replay
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
- Every case has positive and forbidden-state assertions for model, DOM/native,
  focus, popup, geometry/paint, runtime errors, and follow-up input, with an N/A
  reason for observations that do not apply.
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
- `packages/selection/src/react/BlockSelectionPlugin.spec.tsx`
- `apps/www/src/registry/components/editor/block-selection.spec.ts`
- `tooling/e2e/block-selection.test.ts`
- focused Selection tests and source-first typecheck
- Browser `/blocks/playground` QA and exact installed Chrome proof
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/5088-block-marquee-paint.md --complete`
- Autoreview: N/A because the user explicitly forbids it in this session
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5088-block-marquee-paint.md`

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
- Preserve the complete issue oracle: every crossed block is structurally
  selected, the held drag marquee is visibly painted, native text selection is
  empty, the shadow input owns focus, the floating text toolbar is absent, and
  follow-up block commands remain usable.
- This is attempt 3 after two reporter contradictions. Regression repair and
  the accepted Best API / Plate Plan target must pass before product edits.
- Use the best long-term owner: package-owned portal semantics and app-owned
  literal brand classes. Do not add global CSS, timing waits, or route-only
  masking.
- Do not lint and do not run Autoreview in this session.
- Preserve the coordinated `react-doctor/effect-needs-cleanup` directive above
  `useSelectionArea`; do not run a formatter or root check that may rewrite the
  neighboring four-rule packet without first notifying its owning task.
- Do not commit, push, open a PR, release, close the issue, or add the public
  `completed` label. Post a concise candidate-local issue comment only after
  reporter-valid local completion; never imply shipment.
- Work on #5088 only. Do not change #5085, #5070, or another Felix case.

Boundaries:
- allowed source owners: `packages/selection/src/react/BlockSelectionPlugin.tsx`,
  `packages/selection/src/react/BlockSelection.internal.tsx`, copied registry
  `block-selection.tsx`, and unreachable editor presentation owner
- allowed proof/test owners: focused Selection/registry specs,
  `tooling/e2e/block-selection.test.ts`, exact-browser receipt inputs, and one
  package changeset when published package bytes change
- generated/source boundary: source only; never edit `templates/**`, registry
  build output, or `apps/www/public/tailwind.css`
- browser/device claim width: real gutter pointer drag on the Plate Playground,
  during-action paint and state plus after-release and follow-up state; Browser
  for QA and exact installed Chrome for final 5/5
- forbidden product/API/release/public mutations: no Plite law changes, DnD
  redesign, commit, push, PR, release, issue close, or completed label
- orchestration mode and writer ownership: root agent is the sole writer and
  route-host owner; no subagents

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
- current phase: failed-fix repair verification
- current executable case: `issue-5088:gutter-drag-marquee-paint`
- current case status: attempt 3 pending exact current-ref reproduction
- next owner: Regression workflow proof, then exact reproduction
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
| Prompt requirements captured | yes | #5088 only; cumulative oracle; durable owner; no lint/Autoreview; preserve coordinated cleanup directive; no Git/release/close/label; candidate-local issue comment after completion. |
| Regression methodology loaded | yes | `SKILL.md` and `references/methodology.md` read completely before goal or product edits. |
| Active goal checked or created | yes | Exact one-shot goal created for this plan and 5/5 threshold. |
| Current source owner and tested ref recorded | yes | Plate Selection portal contract plus registry presentation owner on `57c26226c65d2ccdb962b6a99d42ef6a8f5c4cc1`. |
| Executable test cases discovered | yes | Existing `tooling/e2e/block-selection.test.ts` is the durable browser row; focused package/registry specs own API and composition. |
| Cumulative reporter evidence resolved | yes | Issue body, 2026-08-17 native-selection delta, and 2026-08-23 missing-marquee delta remain cumulative below. |
| Reporter oracle matrix resolved | yes | During-action and after-release model/native/focus/popup/paint/error/follow-up rows are filled below. |
| Regression semantic validator ready | yes | Current source, template, and validator contain phase-specific paint and pixel-control rules; focused proof runs before product edits. |
| Route/proof-host readiness plan recorded | yes | Fresh `apps/www` process, Browser QA, and attested exact Chrome 5/5; no reused HMR host. |
| Patch delegation boundary recorded | yes | One case; Selection portal/API, registry literal classes, focused tests, and changeset only. |
| Orchestrator writer ownership recorded | N/A | Root agent is the only writer; no orchestrator or subagent. |
| Output budget strategy recorded | yes | Exact files and capped output only; one accidental minified-CSS read is recorded below and will not recur. |
| Claim width and blocked rules recorded | yes | Local completion is distinct from integration/public completion; exact browser or host absence blocks the claim. |
| Browser pack selected | yes | Browser rows are materialized and `browser` is recorded above. |
| Browser route / app surface identified | yes | `apps/www` `/blocks/playground`; root Playwright row uses the same real gutter interaction. |
| Browser tool decision recorded | yes | Browser first for route QA; exact Chrome for paint/final stability. |
| Console/network caveat policy recorded | yes | Action-time console/page errors block; pre-assertion host/network failures revoke and restart proof without changing product bytes. |
| Observable browser case captured | yes | Stable case, full source refs, exact gutter drag, cumulative outcome, current bad ref, and final fingerprint plan are below. |

Work Checklist:
- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [ ] Current source, exact ref/dirty boundary, test runner, route/proof host,
      export/build path, and freshness method are recorded.
- [ ] Generated/source drift and host readiness are repaired or block the claim.
- [x] Every selected case has a stable ID, source reference, owner, setup,
      action, expected outcome, executable test path/command, tested ref, and
      required stability.
- [x] Every selected case inventories its base acceptance, recordings, and all
      later reporter confirmations/contradictions as cumulative deltas. Every
      still-applicable claim stays required; superseded claims cite the source
      and reason that removed them.
- [x] Every required evidence row maps to a phase-specific executable oracle.
      A final-state assertion never substitutes for a transient during-action
      caret, overlay, popup, selection, or paint assertion.
- [x] Every selected case has one or more phase-specific reporter-oracle rows
      for model, DOM/native, focus, popup, geometry/paint, runtime errors, and
      follow-up input.
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
- [ ] Focused green proof and exact final fresh-host replay passed.
- [ ] Final proof ran through `capture-proof-receipt.mjs`; its ref, input digest,
      host, timestamps, retry count, and receipt ID validate.
- [ ] Required retry-free stability runs passed with no retry.
- [ ] Any stability-only failure after an exact green run froze product edits,
      gained a phase-specific executable diagnostic, and restarted baselines
      after product-versus-proof classification.
- [ ] Any compositor phase claim records computed style, live range geometry,
      model/DOM endpoints, and callback identity at the mutation boundary. If
      those are final while pixels stay red, timing is rejected as the cause.
- [ ] Every blocking pixel classifier passes a known-positive and known-negative
      control through the same capture path; a failed control invalidates prior
      results and freezes product edits until the proof helper is repaired.
- [ ] Every shared owner was replayed against its affected exact corpus after
      the final owner edit.
- [ ] Every already-executable affected case has a `pass:` or `red:` pre-edit
      baseline recorded before its shared owner changes.
- [ ] Every requested or started package, browser, root, or CI gate that failed
      is recorded and passes an exact final rerun on the final bytes.
- [ ] Every selected case is kept, reverted, quarantined, deferred, or blocked
      honestly; only kept cases can satisfy goal success.
- [x] No sidecar case registry, TSV, JSON manifest, or duplicate behavior
      database was created.
- [x] Orchestrator ownership and overlapping writer/host serialization passed
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
- [ ] Output budget discipline was followed. One minified generated-CSS search
      accidentally emitted oversized output; all remaining reads are exact and capped.
- [ ] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [ ] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [ ] Browser pack: console and network errors are checked or explicitly out of scope.
- [ ] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [ ] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [ ] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [ ] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [ ] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [ ] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | pending | Close every selected executable case and methodology row | pending |
| Current-source readiness | pending | Prove source owner and final tested ref/dirty boundary | pending |
| Route/proof-host readiness | pending | Prove the runner/host observes current source | pending |
| Executable regression coverage | pending | Record exact test file, red result, green result, and owning invariant | pending |
| Cumulative reporter evidence closure | pending | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | pending |
| Reporter oracle closure | pending | Resolve positive and forbidden states for all seven observations and every applicable interaction phase per case | pending |
| Failed-fix interrupt closure | pending | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | pending |
| Architecture pressure closure | pending | Prove every second failure or architecture trigger has Best API and layer-plan evidence | pending |
| Proof receipt closure | pending | Validate generated final receipts against unchanged issue-owned inputs | pending |
| Affected-corpus replay closure | pending | Replay all cases affected by the last shared-owner edit | pending |
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
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/5088-5088-block-marquee-paint.md --complete` | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5088-5088-block-marquee-paint.md` | pending |
| Browser interaction proof | pending | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | pending |
| Browser console/network check | pending | Record console/network state or why it is not applicable | pending |
| Browser final proof artifact | pending | Record screenshot/trace/route/native proof or exact caveat | pending |
| Exact case replay | pending | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | pending |
| Final ref and fingerprints | pending | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | pending |
| Clean final runtime | pending | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | pending |
| Retry-free stability | pending | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | Requirements, scope, goal, and plan are concrete. | source/host readiness |
| Current source and proof-host readiness | in_progress | Current owner/ref/runner known; fresh host not started yet. | workflow repair proof |
| Executable case discovery and selection | completed | One atomic real-gutter case and existing Playwright row selected. | cumulative evidence |
| Cumulative reporter evidence inventory | completed | Base issue plus both reporter contradictions retained. | reporter oracle expansion |
| Reporter oracle expansion | completed | Every observation and interaction phase mapped below. | semantic validation |
| Pre-implementation semantic validation | completed | Corrected packet passes `validate-regression-plan.mjs`. | smallest probe |
| Smallest high-value probe | pending | | reproduce/classify |
| Reproduce, classify, and red test | pending | | patch delegation |
| One-case Patch delegation | pending | | verification |
| Focused verification and stability | pending | | packet decision |
| Keep/revert/quarantine | pending | | methodology delta |
| Methodology repair/no-change/defer | pending | | next case or closure |
| Reviews and final handoff | pending | | goal-plan check |
| Final goal-plan check | pending | | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|-------------------|---------------------|--------|------------|------------|
| `issue-5088:gutter-drag-marquee-paint` | Issue body and video; Felix comments `5314466483` and `5385439336` | Open `/blocks/playground`; start in the true gutter beside the first heading; hold pointer and drag across at least two blocks; release; issue a block-selection command | During drag, a visibly painted marquee tracks the drag and every crossed block becomes structurally selected; native selection stays empty, shadow input owns focus, floating toolbar stays absent; after release structural selection remains usable and the marquee disappears | exact-chrome: installed Google Chrome on macOS; Browser/Playwright Chromium are diagnosis | `tooling/e2e/block-selection.test.ts`; `pnpm e2e tooling/e2e/block-selection.test.ts --project=chromium --workers=1 --retries=0` | attempt-3 reproduction queued after workflow repair | commit:57c26226c65d2ccdb962b6a99d42ef6a8f5c4cc1 | Regression workflow proof, then exact probe |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| `issue-5088:gutter-drag-marquee-paint` | base-acceptance | Issue body/video and acceptance criteria | during-action | Gutter drag selects every crossed selectable block as whole blocks and displays the visual block-selection rectangle; normal character selection and floating text toolbar do not appear | required | model@during-action, dom-native@during-action, focus@during-action, popup@during-action, geometry-paint@during-action, runtime-errors@after-action | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: current executable omits visible paint and several held-phase assertions |
| `issue-5088:gutter-drag-marquee-paint` | reporter-contradiction | Felix comment `5314466483` (2026-08-17) | during-action | Block styling alone is insufficient while native text selection and the floating toolbar coexist during the held drag | required | dom-native@during-action, focus@during-action, popup@during-action | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: reporter contradicted the first claimed fix; current-ref replay follows workflow repair |
| `issue-5088:gutter-drag-marquee-paint` | reporter-contradiction | Felix comment `5314466483` (2026-08-17) | after-release | Structural selection must remain exclusive after release; native text selection and the floating toolbar must not return | required | model@after-release, dom-native@after-release, focus@after-release, popup@after-release | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: current executable omits after-release focus ownership and exact crossed-block equality |
| `issue-5088:gutter-drag-marquee-paint` | latest-reporter-delta | Felix comment `5385439336` and recording (2026-08-23) | during-action | Selected block styling is insufficient; the held drag marquee itself must visibly paint | required | geometry-paint@during-action | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: `toBeVisible()` accepts the current transparent body portal |
| `issue-5088:gutter-drag-marquee-paint` | base-acceptance | Issue steps end with pointer release and selected blocks | after-release | Structural selection remains after release and the transient marquee does not linger | required | model@after-release, geometry-paint@after-release | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: current executable omits explicit marquee removal |
| `issue-5088:gutter-drag-marquee-paint` | base-acceptance | Issue impact: block copy/cut/delete/manipulation must begin from mouse selection | follow-up | Structural selection remains usable for a follow-up block command after pointer release | required | follow-up-input@follow-up | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: current executable has no follow-up command oracle |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| `issue-5088:gutter-drag-marquee-paint` | model | during-action | yes | Every crossed selectable block key is selected during the held drag | A subset, text-range-only selection, or unrelated block must not count | Browser plus model-facing DOM projection | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: current test does not compare held selected blocks with crossed geometry |
| `issue-5088:gutter-drag-marquee-paint` | model | after-release | yes | The same crossed block set remains structurally selected after release | Cleared, partial, or extra structural selection must not survive | Browser plus model-facing DOM projection | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: current test only requires at least two selected blocks |
| `issue-5088:gutter-drag-marquee-paint` | dom-native | during-action | yes | Whole-block indicators render and `window.getSelection()` stays empty during drag | Character-level blue native selection or a native caret must not coexist | Browser and exact-chrome | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: current test has held empty-native-selection coverage; final replay pending |
| `issue-5088:gutter-drag-marquee-paint` | dom-native | after-release | yes | Whole-block indicators remain and `window.getSelection()` stays empty after release | Character selection or native caret must not return | Browser and exact-chrome | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: current test has after-release block/native coverage; final replay pending |
| `issue-5088:gutter-drag-marquee-paint` | focus | during-action | yes | `.plite-shadow-input` owns focus for structural selection | Editable or body focus must not reactivate native text selection | Browser and exact-chrome | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: current test asserts shadow-input focus during drag; final replay pending |
| `issue-5088:gutter-drag-marquee-paint` | focus | after-release | yes | `.plite-shadow-input` still owns focus while structural selection remains | Editable or body focus must not take ownership after release | Browser and exact-chrome | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: current test omits after-release focus ownership |
| `issue-5088:gutter-drag-marquee-paint` | popup | during-action | yes | Floating text toolbar count stays zero during the drag | Floating toolbar must not appear beside block selection | Browser and exact-chrome | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: current test checks toolbar only after release |
| `issue-5088:gutter-drag-marquee-paint` | popup | after-release | yes | Floating text toolbar count stays zero after release | Floating toolbar must not return after the gesture | Browser and exact-chrome | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: current test asserts no toolbar after release; final replay pending |
| `issue-5088:gutter-drag-marquee-paint` | geometry-paint | during-action | yes | One marquee has nonzero live geometry and visible brand fill or border pixels throughout the held drag | Transparent, zero-area, occluded, stale, duplicate, or absent marquee must not pass | exact-chrome: computed style plus positive and negative screenshot classifier controls | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: current `toBeVisible()` accepts transparent paint |
| `issue-5088:gutter-drag-marquee-paint` | geometry-paint | after-release | yes | Marquee is removed or hidden while block indicators remain | Stale marquee must not remain painted after pointer release | Browser and exact-chrome | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: current test omits marquee removal |
| `issue-5088:gutter-drag-marquee-paint` | runtime-errors | after-action | yes | No new console or page errors occur in the action window | Any new action-time error or overlay must not survive | Browser and exact-chrome error recorder | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: current row records console/page errors; final replay pending |
| `issue-5088:gutter-drag-marquee-paint` | follow-up-input | follow-up | yes | A non-destructive block-selection command executes and structural selection remains coherent | Lost selection, native-selection resurrection, or unusable editor must not pass | Browser plus model projection | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | red: current executable has no follow-up command oracle |

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
| Regression semantic plan | Initial pre-implementation validator rejected combined phases, prose oracle anchors, unresolved results, and failed-fix syntax | plan-format gate failure | Split phase rows; use `observation@phase`; record current red/pass evidence and exact failed-fix/architecture syntax | pass: corrected `validate-regression-plan.mjs` returned structurally valid |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| `issue-5088:gutter-drag-marquee-paint` | 1 | Claimed local fix still showed native selection and toolbar (Felix `5314466483`) | reporter-contradiction | yes: first local green and issue wording revoked | repair-now: `.agents/rules/regression.mdc`, methodology, template, and validator require cumulative phase-aware reporter oracles | pass: 49/49 focused Regression workflow tests on 2026-08-24 | no: first contradiction had no architecture trigger yet | N/A: first contradiction did not require best-api or a layer plan | reproduced: Felix's 2026-08-17 exact retest showed native selection and toolbar |
| `issue-5088:gutter-drag-marquee-paint` | 2 | Pushed `088a82c84c` selected blocks but never painted the marquee (Felix `5385439336`) | reporter-contradiction | yes: pushed-ref completion wording/receipt revoked; `completed` label is absent and issue remains open | repair-now: `.agents/rules/regression.mdc`, methodology, template, and validator require phase-specific paint, material state, exact Chrome, and controlled pixel oracles | pass: 49/49 focused Regression workflow tests; `pnpm install` and source/generated parity passed | yes: second-failed-fix, ui-repairs-substrate | best-api: `selectionAreaClassName`; plate-plan: `docs/plans/5085-5088-toolbar-marquee-ownership.md` accepted | reproduced: prior exact Chrome/current-source audit showed a nonzero transparent body portal and Felix's recording confirms missing paint |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| `issue-5088:gutter-drag-marquee-paint` | 2 | second-failed-fix, ui-repairs-substrate | escalate | required: best-api selects one neutral package `selectionAreaClassName`; application passes literal brand classes; hard-cut unused `rightSelectionAreaClassName` | plate-plan: `docs/plans/5085-5088-toolbar-marquee-ownership.md` | accepted: current source confirms body portal and unreachable descendant selectors; user invoked the prepared next packet |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| `issue-5088:gutter-drag-marquee-paint` | Plate Selection portal/API plus registry presentation | root Playwright on fresh `apps/www` `/blocks/playground`; Browser and exact installed Chrome | exact current ref recorded; fresh host and binary attestation pending | source registry/package only; generated assets excluded | pending host start |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| `issue-5088:gutter-drag-marquee-paint` | Expand current Playwright row until transparent held marquee fails while earlier native/focus/popup assertions remain | Selection portal class API, registry literal classes/unreachable style removal, focused tests, changeset | package/registry tests; fresh route; exact Chrome 5/5; zero retries; receipt and corpus replay | root cause, files, red/green, current ref/fingerprints, stability, architecture verdict; P1 N/A by user instruction | pending workflow repair and red test |

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
| pending | pending | pending | pending | pending | pending |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| `.agents/rules/regression` source and generated method read | Regression | 0.6s tests plus 4.3s install | N/A: source already contains the needed failed-fix repair | Prevents another false green | pass: 49/49 workflow tests, `pnpm install`, and `sync-resources.mjs --check` exact |

Findings:
- Current `tooling/e2e/block-selection.test.ts` only calls `toBeVisible()` on
  the held marquee. A transparent body-portal rectangle satisfies that oracle.
- `BlockSelectionAfterEditable` portals `.plite-selection-area` to
  `document.body`; registry brand classes are descendant selectors on
  `EditorContainer`, so they cannot match the portal.
- `rightSelectionAreaClassName` exists in plugin state but is unused. The
  accepted hard cut renames it to truthful `selectionAreaClassName`, applies it
  to the portal, and keeps brand presentation in `BlockSelectionKit`.

Timeline:
- 2026-08-24: issue body and all comments re-read; latest reporter delta is a
  missing held marquee, while earlier structural/native/focus/popup claims stay required.
- 2026-08-24: current ref, source owner, old weak oracle, accepted Best API,
  and Plate Plan confirmed before product edits.

Decisions and tradeoffs:
- Keep the Selection package responsible for portal lifecycle and a generic
  class hook; keep literal colors in copied registry configuration.
- Reject global CSS and moving the portal into editor-owned DOM. Both hide the
  ownership bug or risk model-DOM interference.

Review fixes:
- pending

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Shell glob for absent registry CSS files failed | 1 | Search exact known source files with `rg -l` | Located `editor.tsx` without changing product bytes. |
| Search printed minified generated `apps/www/public/tailwind.css` | 1 | Exclude generated/public CSS and read exact source only | Oversized output revoked as evidence; source `editor.tsx` is authoritative. |

Verification evidence:
- Goal and current ref: active plan on
  `57c26226c65d2ccdb962b6a99d42ef6a8f5c4cc1` = `origin/next` at setup.
- Live GitHub: issue open; no `completed` label; Felix's latest contradiction
  is comment `5385439336` with recording `258cca85-...`.
- Failed-fix workflow proof: 49/49 focused Node tests passed; `pnpm install`
  synced generated skills; `sync-resources.mjs --check` returned exact.
- Pre-implementation semantic validator: structurally valid after exact row repair.

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
| Where am I? | attempt-3 exact reproduction and affected baseline |
| Where am I going? | exact red, durable package/registry fix, fresh 5/5 proof |
| What is the goal? | complete the full #5088 gutter-drag oracle, including visibly painted held marquee |
| What have I learned? | the current test proves DOM geometry, not paint; portal brand styles are unreachable |
| What have I done? | rebuilt cumulative evidence/oracles, confirmed current owner/ref, and accepted architecture gate |

Open risks:
- pending
