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
  issue-5088:gutter-drag-marquee-paint
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
- current phase: completed
- current executable case: issue-5088:gutter-drag-marquee-paint
- current case status: completed on local dirty ref with exact Chrome receipt
- next owner: maintainer integration after the user commits and pushes
- goal status: completed locally; uncommitted and unpushed

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
- [x] Current source, exact ref/dirty boundary, test runner, route/proof host,
      export/build path, and freshness method are recorded.
- [x] Generated/source drift and host readiness are repaired or block the claim.
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
- [x] The smallest falsifying executable probe ran before scaling.
- [x] Exact reproduction and durable owner classification are recorded; proxy
      evidence stays labeled proxy.
- [x] The executable test is red before the fix, or the exact safe-red
      limitation and proof-host repair are explicit.
- [x] Regression delegated only one normalized case at a time to Patch.
- [x] Patch returned root cause, durable owner, changed files, exact red/green
      commands, final ref/dirty fingerprints, stability, architecture verdict,
      P1 review, and caveat.
- [x] Focused green proof and exact final fresh-host replay passed.
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
- [x] Every shared owner was replayed against its affected exact corpus after
      the final owner edit.
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
- [x] Output budget discipline was followed. One minified generated-CSS search
      accidentally emitted oversized output; all remaining reads are exact and capped.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
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
| Named completion threshold | completed | Close every selected executable case and methodology row | Exact Chrome receipt passes 5/5 with zero retries. |
| Current-source readiness | completed | Prove source owner and final tested ref/dirty boundary | Selection plus registry owners recorded on dirty `57c26226...`. |
| Route/proof-host readiness | completed | Prove the runner/host observes current source | Fresh PID 91728 served `/blocks/playground` after final runtime edits. |
| Executable regression coverage | completed | Record exact test file, red result, green result, and owning invariant | E2E failed on transparent fill, then passed the complete oracle. |
| Cumulative reporter evidence closure | completed | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | All base and contradiction rows pass below. |
| Reporter oracle closure | completed | Resolve positive and forbidden states for all seven observations and every applicable interaction phase per case | Exact model/native/focus/popup/paint/error/follow-up rows pass. |
| Failed-fix interrupt closure | completed | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | Attempts 1 and 2 remain invalidated; workflow tests pass 49/49. |
| Architecture pressure closure | completed | Prove every second failure or architecture trigger has Best API and layer-plan evidence | Accepted neutral portal hook plus registry classes implemented. |
| Proof receipt closure | completed | Validate generated final receipts against unchanged issue-owned inputs | Receipt `sha256:bd7d1c...4039d` validates 14 inputs. |
| Affected-corpus replay closure | completed | Replay all cases affected by the last shared-owner edit | One affected case plus package/registry tests and typechecks pass. |
| Started-gate failure closure | completed | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | Exact repaired commands pass; failures are classified below. |
| Smallest-probe closure | completed | Record first falsifying probe and any host repair | Nonzero transparent portal reproduced on current source. |
| Patch delegation closure | completed | Read back one-case root-cause/red/green/proof evidence | Root cause, owner, files, commands, fingerprints, and architecture verdict recorded. |
| Focused verification closure | completed | Run owning test and exact final-case replay | 74 package tests, 4 registry tests, and exact route pass. |
| Stability closure | completed | Record retry-free warm runs or evidence-backed N/A | Chrome 151 passes 5/5, retries 0. |
| Packet decision closure | completed | Keep/revert/quarantine/defer/block every selected case honestly | Keep the one selected case. |
| Local completion status | completed | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | Completed locally on dirty ref; uncommitted and unpushed. |
| No duplicate registry | completed | Prove no sidecar behavior manifest/database was created | Executable tests and plan only; no behavior ledger. |
| Generated/source and host repair | completed | Repair drift/host methodology or record blocked claim | `pnpm install`, resource parity, and fresh host pass. |
| Orchestrator writer closure | completed | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | N/A: no subagent; coordinated cleanup directive preserved. |
| Workflow slowdown closure | completed | Repair avoidable slow/stale/noisy proof paths or defer with owner | Localhost origin, exact route, and root-relative Bun command repaired. |
| Methodology delta closure | completed | Resolve repair-now/no-change/defer for every case | Regression `no-change`; Best API portal principle added. |
| Source/generated sync | completed | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | Install and `sync-resources --check` pass. |
| Agent-native review | completed | Run for changed agent workflows or record N/A | Existing Regression repair review passed; Best API routing/output unchanged, so N/A. |
| Final handoff contract | completed | Record tests, decisions, proof, sync, reviews, risks, and next owner | Final handoff section resolved below. |
| Autoreview | completed | Run P1 autoreview for non-trivial implementation changes or record N/A | N/A: user explicitly prohibited Autoreview. |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/5088-block-marquee-paint.md --complete` | completed: final exact rerun passes |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5088-block-marquee-paint.md` | completed: final exact rerun passes |
| Browser interaction proof | completed | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser diagnosed geometry; Chrome confirmed painted held marquee. |
| Browser console/network check | completed | Record console/network state or why it is not applicable | No new action-time errors; localhost removed the blocked cross-origin host. |
| Browser final proof artifact | completed | Record screenshot/trace/route/native proof or exact caveat | Chrome screenshot shows the brand marquee over paths 0 and 1. |
| Exact case replay | completed | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Exact Chrome executable case passes 5/5. |
| Final ref and fingerprints | completed | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Receipt digest and per-file hashes recorded below. |
| Clean final runtime | completed | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: candidate is intentionally uncommitted/unpushed; fresh local PID and dirty fingerprints recorded. |
| Retry-free stability | completed | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Chrome 151.0.7922.173: 5/5, retries 0. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | Requirements, scope, goal, and plan are concrete. | source/host readiness |
| Current source and proof-host readiness | completed | Fresh `apps/www` PID 91728 served final source at `localhost:3108`; Chrome 151 attested. | executable proof |
| Executable case discovery and selection | completed | One atomic real-gutter case and existing Playwright row selected. | cumulative evidence |
| Cumulative reporter evidence inventory | completed | Base issue plus both reporter contradictions retained. | reporter oracle expansion |
| Reporter oracle expansion | completed | Every observation and interaction phase mapped below. | semantic validation |
| Pre-implementation semantic validation | completed | Corrected packet passes `validate-regression-plan.mjs`. | smallest probe |
| Smallest high-value probe | completed | Exact Playground gutter geometry exposed a nonzero transparent body portal. | reproduce/classify |
| Reproduce, classify, and red test | completed | Current source failed only `fillPainted` on the cumulative executable case. | patch delegation |
| One-case Patch delegation | completed | Selection portal/API plus registry presentation repaired; no Plite change. | verification |
| Focused verification and stability | completed | 74 package tests, 4 registry tests, typechecks, exact route, and Chrome 5/5 pass. | packet decision |
| Keep/revert/quarantine | completed | Keep the package hook, registry classes, and cumulative browser case. | methodology delta |
| Methodology repair/no-change/defer | completed | `no-change`: Regression already enforced phase paint and failed-fix repair; Best API gained the reusable portal rule. | closure |
| Reviews and final handoff | completed | Autoreview N/A by user instruction; Best API source/mirror parity exact. | goal-plan check |
| Final goal-plan check | completed | Semantic validator and autogoal checker pass on the closed plan. | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|-------------------|---------------------|--------|------------|------------|
| issue-5088:gutter-drag-marquee-paint | Issue body and video; Felix comments `5314466483` and `5385439336` | Open `/blocks/playground`; start in the true gutter beside the first heading; hold pointer and drag across at least two blocks; release; issue a block-selection command | During drag, a visibly painted marquee tracks the drag and every crossed block becomes structurally selected; native selection stays empty, shadow input owns focus, floating toolbar stays absent; after release structural selection remains usable and the marquee disappears | exact-chrome: Google Chrome 151.0.7922.173 at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` | `tooling/e2e/block-selection.test.ts`; attested exact Chrome command in receipt | completed | dirty:57c26226c65d2ccdb962b6a99d42ef6a8f5c4cc1 | maintainer integration after push |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| issue-5088:gutter-drag-marquee-paint | base-acceptance | Issue body/video and acceptance criteria | during-action | Gutter drag selects every crossed selectable block as whole blocks and displays the visual block-selection rectangle; normal character selection and floating text toolbar do not appear | required | model@during-action, dom-native@during-action, focus@during-action, popup@during-action, geometry-paint@during-action, runtime-errors@after-action | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: exact crossed paths, painted marquee, empty native selection, focus, popup, and errors pass 5/5 |
| issue-5088:gutter-drag-marquee-paint | reporter-contradiction | Felix comment `5314466483` (2026-08-17) | during-action | Block styling alone is insufficient while native text selection and the floating toolbar coexist during the held drag | required | dom-native@during-action, focus@during-action, popup@during-action | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: held Chrome state has empty native selection, shadow focus, and zero floating toolbar |
| issue-5088:gutter-drag-marquee-paint | reporter-contradiction | Felix comment `5314466483` (2026-08-17) | after-release | Structural selection must remain exclusive after release; native text selection and the floating toolbar must not return | required | model@after-release, dom-native@after-release, focus@after-release, popup@after-release | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: exact paths remain, native selection stays empty, shadow focus and popup absence pass |
| issue-5088:gutter-drag-marquee-paint | latest-reporter-delta | Felix comment `5385439336` and recording (2026-08-23) | during-action | Selected block styling is insufficient; the held drag marquee itself must visibly paint | required | geometry-paint@during-action | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: Chrome computes brand fill and 1px brand border on a 100x54 held marquee |
| issue-5088:gutter-drag-marquee-paint | base-acceptance | Issue steps end with pointer release and selected blocks | after-release | Structural selection remains after release and the transient marquee does not linger | required | model@after-release, geometry-paint@after-release | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: exact paths remain while marquee display is none with zero geometry |
| issue-5088:gutter-drag-marquee-paint | base-acceptance | Issue impact: block copy/cut/delete/manipulation must begin from mouse selection | follow-up | Structural selection remains usable for a follow-up block command after pointer release | required | follow-up-input@follow-up | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: ArrowDown moves structural selection to exact following path without native selection |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| issue-5088:gutter-drag-marquee-paint | model | during-action | yes | Every crossed selectable block key is selected during the held drag | A subset, text-range-only selection, or unrelated block must not count | Browser plus model-facing DOM projection | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: selected paths equal crossed paths 0 and 1 |
| issue-5088:gutter-drag-marquee-paint | model | after-release | yes | The same crossed block set remains structurally selected after release | Cleared, partial, or extra structural selection must not survive | Browser plus model-facing DOM projection | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: selected paths equal paths 0 and 1 after release |
| issue-5088:gutter-drag-marquee-paint | dom-native | during-action | yes | Whole-block indicators render and `window.getSelection()` stays empty during drag | Character-level blue native selection or a native caret must not coexist | Browser and exact-chrome | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: whole-block indicators render and native selection is empty |
| issue-5088:gutter-drag-marquee-paint | dom-native | after-release | yes | Whole-block indicators remain and `window.getSelection()` stays empty after release | Character selection or native caret must not return | Browser and exact-chrome | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: indicators remain and native selection stays empty |
| issue-5088:gutter-drag-marquee-paint | focus | during-action | yes | `.plite-shadow-input` owns focus for structural selection | Editable or body focus must not reactivate native text selection | Browser and exact-chrome | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: shadow input owns focus during held drag |
| issue-5088:gutter-drag-marquee-paint | focus | after-release | yes | `.plite-shadow-input` still owns focus while structural selection remains | Editable or body focus must not take ownership after release | Browser and exact-chrome | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: shadow input retains focus in every executable replay |
| issue-5088:gutter-drag-marquee-paint | popup | during-action | yes | Floating text toolbar count stays zero during the drag | Floating toolbar must not appear beside block selection | Browser and exact-chrome | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: floating text toolbar count is zero during held drag |
| issue-5088:gutter-drag-marquee-paint | popup | after-release | yes | Floating text toolbar count stays zero after release | Floating toolbar must not return after the gesture | Browser and exact-chrome | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: floating text toolbar count remains zero after release |
| issue-5088:gutter-drag-marquee-paint | geometry-paint | during-action | yes | One marquee has nonzero live geometry and visible brand fill or border pixels throughout the held drag | Transparent, zero-area, occluded, stale, duplicate, or absent marquee must not pass | exact-chrome: computed style, live geometry, and visual screenshot; no blocking pixel classifier | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: one 100x54 marquee computes nontransparent brand fill and 1px brand border |
| issue-5088:gutter-drag-marquee-paint | geometry-paint | after-release | yes | Marquee is removed or hidden while block indicators remain | Stale marquee must not remain painted after pointer release | Browser and exact-chrome | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: portal display is none with zero geometry after release |
| issue-5088:gutter-drag-marquee-paint | runtime-errors | after-action | yes | No new console or page errors occur in the action window | Any new action-time error or overlay must not survive | Browser and exact-chrome error recorder | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: no action-time console or page errors in exact replay |
| issue-5088:gutter-drag-marquee-paint | follow-up-input | follow-up | yes | A non-destructive block-selection command executes and structural selection remains coherent | Lost selection, native-selection resurrection, or unusable editor must not pass | Browser plus model projection | test: `tooling/e2e/block-selection.test.ts#drags from the editor gutter to select whole blocks` | pass: ArrowDown selects exact following path and native selection remains empty |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| issue-5088:gutter-drag-marquee-paint | 3 | completed | "/usr/bin/env" "PLAYWRIGHT_BASE_URL=http://localhost:3108" "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "pnpm" "e2e" "tooling/e2e/block-selection.test.ts" "--project=chromium" "--workers=1" "--retries=0" "--repeat-each=5" | pass: exit 0 in 34975ms | dirty:57c26226c65d2ccdb962b6a99d42ef6a8f5c4cc1 | sha256:54aa7d14b90aa924537a51ac9686b58924f7aeaada184b4be5dc757a11a3fdd8 | 14 | apps/www/src/app/(blocks)/blocks/playground/page.tsx,apps/www/src/app/globals.css,apps/www/src/registry/components/editor/block-menu.tsx,apps/www/src/registry/components/editor/block-selection.spec.ts,apps/www/src/registry/components/editor/block-selection.tsx,apps/www/src/registry/components/editor/editor.tsx,apps/www/src/registry/examples/playground-demo.tsx,packages/selection/package.json,packages/selection/src/SelectionArea.ts,packages/selection/src/react/BlockSelection.internal.tsx,packages/selection/src/react/BlockSelectionPlugin.tsx,packages/selection/src/react/useBlockSelection.slow.tsx,tooling/config/playwright.config.ts,tooling/e2e/block-selection.test.ts | pid:91728;started:2026-08-24T11:50:55.000Z;base-url:http://localhost:3108;browser:exact-chrome:Google-Chrome-151.0.7922.173;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.173 | 2026-08-24T11:51:01.800Z | 2026-08-24T11:57:36.442Z | 2026-08-24T11:58:11.418Z | 0 | sha256:bd7d1c69900ceba852f91a6e8b5c63ef3a8fb17273083a6abd87d68564e4039d |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Selection portal plus registry presentation | issue-5088:gutter-drag-marquee-paint | red: exact route reached a 100x54 portal but `fillPainted` was false | 2026-08-24T11:51:01.800Z | 74 package tests; 4 registry tests; Selection and www typechecks; exact Chrome 5/5 | sha256:54aa7d14b90aa924537a51ac9686b58924f7aeaada184b4be5dc757a11a3fdd8 | pass: full affected corpus green |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Regression semantic plan | Initial pre-implementation validator rejected combined phases, prose oracle anchors, unresolved results, and failed-fix syntax | plan-format gate failure | Split phase rows; use `observation@phase`; record current red/pass evidence and exact failed-fix/architecture syntax | pass: corrected `validate-regression-plan.mjs` returned structurally valid |
| Fresh proof host | Existing Next lock and stale port 3000 route prevented the current source probe | proof-host failure | Started owned `apps/www` on localhost port 3108 and used the real `/blocks/playground` route | pass: fresh final PID 91728 served final bytes |
| Browser origin | `127.0.0.1` caused Next development resources to be blocked cross-origin | proof-host failure | Use the canonical `localhost` origin | pass: route and assets load without blocked resource errors |
| Bun focused path | Package-filtered Bun path did not resolve the slow test; package cwd missed the root preload | runner failure | Run the exact file from repo root so root `bunfig.toml` preloads globals | pass: 4/4 slow tests and 74/74 combined package tests |
| Chrome extension release | Low-level release and short extension drag produced automation-only selection/focus deltas | proof-helper failure | Use held Chrome state for paint inspection; use the attested exact-Chrome repo case for the blocking 5/5 receipt | pass: paint screenshot plus exact Chrome receipt; no product edit followed the helper failure |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| issue-5088:gutter-drag-marquee-paint | 1 | Claimed local fix still showed native selection and toolbar (Felix `5314466483`) | reporter-contradiction | yes: first local green and issue wording revoked | repair-now: `.agents/rules/regression.mdc`, methodology, template, and validator require cumulative phase-aware reporter oracles | pass: 49/49 focused Regression workflow tests on 2026-08-24 | no: first contradiction had no architecture trigger yet | N/A: first contradiction did not require best-api or a layer plan | reproduced: Felix's 2026-08-17 exact retest showed native selection and toolbar |
| issue-5088:gutter-drag-marquee-paint | 2 | Pushed `088a82c84c` selected blocks but never painted the marquee (Felix `5385439336`) | reporter-contradiction | yes: pushed-ref completion wording/receipt revoked; `completed` label is absent and issue remains open | repair-now: `.agents/rules/regression.mdc`, methodology, template, and validator require phase-specific paint, material state, exact Chrome, and controlled pixel oracles | pass: 49/49 focused Regression workflow tests; `pnpm install` and source/generated parity passed | yes: second-failed-fix, ui-repairs-substrate | best-api: `selectionAreaClassName`; plate-plan: `docs/plans/5085-5088-toolbar-marquee-ownership.md` accepted | reproduced: prior exact Chrome/current-source audit showed a nonzero transparent body portal and Felix's recording confirms missing paint |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| issue-5088:gutter-drag-marquee-paint | 2 | second-failed-fix, ui-repairs-substrate | escalate | required: best-api selects one neutral package `selectionAreaClassName`; application passes literal brand classes; hard-cut unused `rightSelectionAreaClassName` | plate-plan: `docs/plans/5085-5088-toolbar-marquee-ownership.md` | accepted: current source confirms body portal and unreachable descendant selectors; user invoked the prepared next packet |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| issue-5088:gutter-drag-marquee-paint | Plate Selection portal/API plus registry presentation | root Playwright on fresh `apps/www` `/blocks/playground`; Browser and exact installed Chrome | dirty ref plus 14-input digest; fresh PID 91728; Chrome 151.0.7922.173 attested | source registry/package plus generated changelog from its source entry; templates excluded | pass: current source and host ready |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| issue-5088:gutter-drag-marquee-paint | red: exact route failed `fillPainted` with nonzero transparent portal | Selection portal class API, registry literal classes/unreachable style removal, focused tests, changeset | package/registry tests; fresh route; exact Chrome 5/5; zero retries; receipt and corpus replay | body portal could not inherit descendant registry styles; neutral hook plus literal kit classes pass; dirty ref and hashes recorded; P1 N/A by user instruction | pass: kept |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| issue-5088:gutter-drag-marquee-paint | fresh PID 91728 plus Google Chrome 151.0.7922.173 | 5 | pass, pass, pass, pass, pass | 0 | completed locally |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| issue-5088:gutter-drag-marquee-paint | Exact red, focused tests/typechecks, painted Chrome screenshot, and attested receipt | keep | completed local candidate on dirty ref; uncommitted/unpushed, not integrated or shipped | Chrome extension cannot hold and release one gesture without extra focus semantics; blocking exact-binary case and reporter-confirmed native selection cover the case | maintainer after push |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| issue-5088:gutter-drag-marquee-paint | Earlier Regression proof accepted visible-but-transparent geometry and incomplete cumulative phases | repair-now | Regression owner: `.agents/rules/regression.mdc`, methodology, template, and validator enforce phase paint, exact Chrome, and controlled classifiers; Best API owns the reusable portal presentation law | pass: 49/49 Regression workflow tests; source/mirror parity exact | second failed fix repaired before attempt 3 |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| `.agents/rules/regression` source and generated method read | Regression | 0.6s tests plus 4.3s install | N/A: source already contains the needed failed-fix repair | Prevents another false green | pass: 49/49 workflow tests, `pnpm install`, and `sync-resources.mjs --check` exact |

Findings:
- The pre-fix `tooling/e2e/block-selection.test.ts` only called `toBeVisible()` on
  the held marquee. A transparent body-portal rectangle satisfies that oracle.
- `BlockSelectionAfterEditable` portals `.plite-selection-area` to
  `document.body`; registry brand classes are descendant selectors on
  `EditorContainer`, so they cannot match the portal.
- `rightSelectionAreaClassName` was unused. The hard cut replaces it with
  truthful `selectionAreaClassName`, applies it
  to the portal, and keeps brand presentation in `BlockSelectionKit`.

Timeline:
- 2026-08-24: issue body and all comments re-read; latest reporter delta is a
  missing held marquee, while earlier structural/native/focus/popup claims stay required.
- 2026-08-24: current ref, source owner, old weak oracle, accepted Best API,
  and Plate Plan confirmed before product edits.
- 2026-08-24: cumulative E2E failed on `fillPainted` with correct 100x54
  geometry, then passed after the portal/registry ownership fix.
- 2026-08-24: fresh Chrome 151 receipt passed 5/5 with zero retries.

Decisions and tradeoffs:
- Keep the Selection package responsible for portal lifecycle and a generic
  class hook; keep literal colors in copied registry configuration.
- Reject global CSS and moving the portal into editor-owned DOM. Both hide the
  ownership bug or risk model-DOM interference.

Review fixes:
- Autoreview: N/A by explicit user instruction.
- Best API repair: reusable portal presentation rule added; source and generated
  mirror match; affected workers contain zero stale class-name teaching.
- Agent-native review: N/A for the Best API edit because routing, trigger,
  rubric, and output did not change; the earlier Regression repair review passed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Shell glob for absent registry CSS files failed | 1 | Search exact known source files with `rg -l` | Located `editor.tsx` without changing product bytes. |
| Search printed minified generated `apps/www/public/tailwind.css` | 1 | Exclude generated/public CSS and read exact source only | Oversized output revoked as evidence; source `editor.tsx` is authoritative. |

Verification evidence:
- Goal and current ref: completed local candidate on dirty
  `57c26226c65d2ccdb962b6a99d42ef6a8f5c4cc1` = `origin/next` at setup.
- Live GitHub: issue open; no `completed` label; Felix's latest contradiction
  is comment `5385439336` with recording `258cca85-...`.
- Candidate-local status comment posted as `5394944534`; it states
  uncommitted/unpushed/not shipped and leaves the issue open and unlabeled.
- Failed-fix workflow proof: 49/49 focused Node tests passed; `pnpm install`
  synced generated skills; `sync-resources.mjs --check` returned exact.
- Pre-implementation semantic validator: structurally valid after exact row repair.
- Red: exact Playground case failed only because `fillPainted` was false.
- Focused proof: 74/74 Selection tests; 4/4 registry tests; Selection Turbo
  typecheck; www `tsc --noEmit`; exact Chromium route green.
- Exact Chrome: Google Chrome 151.0.7922.173, fresh PID 91728, 5/5, zero
  retries, receipt `sha256:bd7d1c69900ceba852f91a6e8b5c63ef3a8fb17273083a6abd87d68564e4039d`.
- Receipt inputs: 14 files, digest
  `sha256:54aa7d14b90aa924537a51ac9686b58924f7aeaada184b4be5dc757a11a3fdd8`.
- Changed proof hashes: plugin state `85e6a259...6ccc`, portal
  `171d3e00...4121`, portal spec `294b0ab0...3bf`, kit
  `03f449cb...bb2`, kit spec `b349ea33...1dc`, editor
  `c4c478ec...c837`, E2E `b0b059e1...1fec`, config
  `433e87ff...af1`.
- Registry release artifacts: source entry plus generated JSON pass
  `generate-ui-changelog-entries.mjs --check`; package major changeset records
  the public state-key rename from `origin/main`.

Final handoff:
- executable cases: one kept cumulative case, completed 5/5.
- cumulative reporter evidence, phase-specific oracles, and forbidden states:
  all base, contradiction, held, release, and follow-up rows pass.
- failed-fix invalidation and automatic repair: attempts 1 and 2 remain
  invalidated; 49/49 workflow tests and accepted architecture gate pass.
- proof receipts and affected-corpus replay: receipt and Selection/registry
  corpus pass on unchanged issue-owned inputs.
- started-gate failure closure: plan format, host/origin, Bun path, and Chrome
  helper failures are classified and their exact final lanes pass.
- changed files: Selection plugin/internal/spec; registry kit/spec/editor;
  E2E/config; package changeset; registry changelog source/generated artifacts;
  Best API source/mirror; this plan.
- design decisions: package owns portal semantics and one neutral class hook;
  copied registry owns literal brand presentation; no global CSS or Plite change.
- tests and proof: 74 package, 4 registry, two typechecks, route QA, painted
  Chrome screenshot, and attested exact Chrome 5/5.
- source/generated sync: `pnpm install`, Best API mirror parity, resource check,
  and registry changelog check pass.
- P1 and agent-native findings: Autoreview N/A by user instruction; Best API
  agent-native rerun N/A because its workflow contract did not change.
- residual risks and next owner: no known product risk; maintainer must replay
  the exact case on the pushed ref before public `completed` labeling.
- local completion status and integration/public-status boundary: completed
  locally, uncommitted and unpushed; comment `5394944534` posted; not
  integrated, shipped, or released.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | attempt 3 completed locally with an attested exact Chrome receipt |
| Where am I going? | maintainer integration after commit and push |
| What is the goal? | complete the full #5088 gutter-drag oracle, including visibly painted held marquee |
| What have I learned? | descendant styles cannot reach a body portal; visibility without material paint is a false oracle |
| What have I done? | added the neutral portal hook, moved brand classes to the kit, strengthened the cumulative case, and passed Chrome 5/5 |

Open risks:
- No known product risk on the local candidate. Integration and shipment remain
  unproved until these exact bytes are pushed and replayed on that ref.
