# Comment popover lifecycle regression

Objective:
Repair the abandoned-comment popover lifecycle so closing removes only draft comment marks and preserves the live user selection/caret, including `rich-t|ext` from the reporter video.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5112-comment-popover-lifecycle-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- none

Regression source:
- target bug / surface / corpus: issue #5112 comment popover lifecycle, including the latest floating-toolbar contradiction
- lane and current source owner: Plate registry UI in `apps/www/src/registry/components/editor/block-discussion.tsx` and `floating-toolbar.tsx`
- selected executable test cases: `issue-5112-abandoned-comment-lifecycle` in `apps/www/tests/browser/comment.spec.ts`
- tested ref or dirty-state boundary: `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb`; issue-owner fingerprints are recorded in Failed fix history and refreshed after the final edit
- route / proof host and freshness method: fresh `apps/www` source server on `/`; exact installed Chrome attestation plus Playwright browser proof; restart after owner edits
- invocation mode / timebox: user-invoked one-shot Regression run; no commit, push, PR, issue update, or release mutation

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
- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/5112-comment-popover-lifecycle-regression.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5112-comment-popover-lifecycle-regression.md`

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

Boundaries:
- allowed source owners: comment popover/floating-toolbar lifecycle owners under `apps/www/src/registry/components/editor/`; Regression rule, validator, template, and generated mirror for the mandatory failed-fix repair
- allowed proof/test owners: `apps/www/tests/browser/comment.spec.ts` and focused Regression workflow tests
- generated/source boundary: `.agents/rules/regression.mdc`, its validator, and `docs/plans/templates/regression.md` are source; `pnpm install` alone syncs `.agents/skills/regression/**`; registry generated changelog files stay source-generated from the existing entry
- browser/device claim width: local current-source exact Chrome plus Playwright Chromium; no mobile or shipped-state claim
- forbidden product/API/release/public mutations: no commit, push, PR, GitHub issue update, label, release, or unrelated editor behavior change
- orchestration mode and writer ownership: main thread only; one writer; no subagent or concurrent route host

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
- current phase: completed local closeout
- current executable case: `issue-5112-abandoned-comment-lifecycle`
- current case status: attempt 3 completed with exact Chrome receipt and zero-retry stability
- next owner: user; commit/push/public issue state remain untouched
- goal status: completed

Completion rule:
- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Close removes comment marks only; live selection/caret must stay at `rich-t|ext`, never revert to `modern`; do not commit or push. |
| Regression methodology loaded | yes | `.agents/skills/regression/references/methodology.md` read completely. |
| Active goal checked or created | yes | Active goal points at this plan and requires cumulative oracle, receipt, stability, and P1 review. |
| Current source owner and tested ref recorded | yes | Registry owners and `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb` recorded above. |
| Executable test cases discovered | yes | Existing `apps/www/tests/browser/comment.spec.ts` owns anchor and abandoned-draft coverage; follow-up oracle will extend that file. |
| Cumulative reporter evidence resolved | yes | Original anchor/cleanup/overlap claims remain required; forced selection restoration is superseded by the video-backed live-caret clarification. |
| Reporter oracle matrix resolved | yes | The table below adds same-phase close selection/focus plus follow-up typing at the preserved caret. |
| Regression semantic validator ready | yes | Second failed-fix repair requires popup close plans to account for same-phase DOM-native selection and focus; workflow proof passes 39/39. |
| Route/proof-host readiness plan recorded | yes | Fresh local source server and exact Chrome attestation required before final claims. |
| Patch delegation boundary recorded | yes | One lifecycle case; only comment/floating-toolbar owners and `comment.spec.ts`; no public/API/release mutation. |
| Orchestrator writer ownership recorded | yes | N/A: orchestrator inactive; main thread is the only writer and host owner. |
| Output budget strategy recorded | yes | Focused files and exact tests only; broad generated/build output excluded. |
| Claim width and blocked rules recorded | yes | Local uncommitted/unpushed claim only; blocked if fresh exact Chrome cannot observe current source. |

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
- [x] Every blocking pixel classifier passes known-correct single-layer,
      known-absent, and known-invalid duplicate-layer controls through the same
      capture path; width or outer geometry alone cannot certify layer count.
      A failed control invalidates prior results and freezes product edits until
      the proof helper is repaired.
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
- [x] Output budget discipline was followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close every selected executable case and methodology row | pass: one selected case completed with repair-now and exact proof. |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: receipt records `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb` and 16 input hashes. |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: PID 14385 serves current PLITE-mode source at `http://localhost:3015`; Chrome 151 executable attested. |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | pass: `comment.spec.ts` failed when saved `modern` replaced `rich-t\|ext`, then passed after the hard cut. |
| Cumulative reporter evidence closure | yes | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | pass: anchor, draft cleanup, overlap preservation, superseded toolbar restoration, and latest live-caret clarification map below. |
| Reporter oracle closure | yes | Resolve positive and forbidden states for all seven observations and every applicable interaction phase per case | pass: every row below has exact Chrome or browser evidence and a distinct forbidden state. |
| Failed-fix interrupt closure | yes | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | pass: attempt 2 receipt/completion revoked; same-phase selection/focus validator repair passes 39/39 with source/mirror sync. |
| Architecture pressure closure | yes | Prove every second failure or architecture trigger has Best API and layer-plan evidence | pass: second-failed-fix Best API/Plate Plan hard-cut selection authority before attempt 3. |
| Proof receipt closure | yes | Validate generated final receipts against unchanged issue-owned inputs | pass: attempt-3 receipt `sha256:617aa568e06019aa3071a2bed8a5f34271dc5467a5d8da4256986a1af2b2d596`. |
| Affected-corpus replay closure | yes | Replay all cases affected by the last shared-owner edit | pass: exact Chrome 2/2 after final owner edit, digest `sha256:fe7b1007a1e418694f18efe88a3214a2e8f6cb6bc9f45fa3a49ed3115a6cfdc1`. |
| Started-gate failure closure | yes | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | pass: reinstall proved source drift; six stale app AI consumers were synchronized from registry source; exact `www` tsc rerun exits 0. |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | pass: video frames plus exact red isolated saved-range restoration as the wrong selection authority. |
| Patch delegation closure | yes | Read back one-case root-cause/red/green/proof evidence | pass: one normalized case owns the red, lifecycle fix, receipt, stability, and review. |
| Focused verification closure | yes | Run owning test and exact final-case replay | pass: focused case 1/1; IAB and installed Chrome manual replay both green. |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | pass: attempt-3 full corpus 10/10 across five runs, retries 0. |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | pass: attempt-3 case completed locally. |
| Local completion status | yes | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | pass: completed locally, uncommitted and unpushed; no public status mutation. |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | pass: executable test and this transient plan only. |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | pass: `pnpm install` synced skills; changelog generator check passed; correct PLITE host replaced stale host. |
| Orchestrator writer closure | yes | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | N/A: orchestrator inactive; main thread was the only writer and proof-host controller. |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | pass: host command and exact-Chrome config repaired in the same run. |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | pass: repair-now added an executable popup lifecycle follow-up gate. |
| Source/generated sync | yes | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | pass: `pnpm install`; source/generated Regression contract 39/39. |
| Agent-native review | yes | Run for changed agent workflows or record N/A | pass: route/source/mirror/proof/authority map has no gap. |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | pass: Final handoff section below is complete. |
| Autoreview | yes | Run P1 autoreview for non-trivial implementation changes or record N/A | pass: final Codex P1 clean after resolving the accepted saved-selection finding. |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/5112-comment-popover-lifecycle-regression.md --complete` | pass: attempt-3 semantically complete. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5112-comment-popover-lifecycle-regression.md` | pass: canonical plan mechanically complete. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | explicit requirements and active goal copied into this plan | source/host readiness |
| Current source and proof-host readiness | completed | fresh PID 14385 host and exact Chrome 151 receipt | discover executable cases |
| Executable case discovery and selection | completed | one cumulative lifecycle case selected in existing browser file | smallest probe |
| Cumulative reporter evidence inventory | completed | base anchor, cleanup/overlap delta, and latest toolbar contradiction retained | reporter oracle expansion |
| Reporter oracle expansion | completed | close and follow-up phases cover seven observation classes | semantic validation |
| Pre-implementation semantic validation | completed | Regression structural validator passed before product attempt 2 | architecture gate, then validator |
| Smallest high-value probe | completed | Browser proved close leaves BODY focus, empty selection, and no toolbar while a new drag still works | reproduce/classify |
| Reproduce, classify, and red test | completed | video and executable test prove `rich-t\|ext` was overwritten by `modern` | patch delegation |
| One-case Patch delegation | completed | deleted saved selection/focus/clear/flush machinery; mark/store cleanup only | verification |
| Focused verification and stability | completed | focused 1/1, corpus 2/2, repeat 10/10, exact Chrome receipt | packet decision |
| Keep/revert/quarantine | completed | attempt-3 case completed locally | methodology delta |
| Methodology repair/no-change/defer | completed | second repair-now validator/source/mirror proof 39/39 | next case or closure |
| Reviews and final handoff | completed | agent-native PASS; final P1 clean | goal-plan check |
| Final goal-plan check | completed | semantic Regression and Autogoal checks pass | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|-------------------|---------------------|--------|------------|------------|
| issue-5112-abandoned-comment-lifecycle | issue #5112 screenshot; 2026-08-26/27 reporter deltas; CleanShot video | Select `modern`; open the comment composer; while it is open click between `rich-t` and `ext` to dismiss; type `X` at the surviving caret; separately cancel over an existing comment | Composer stays anchored; cancel removes only draft comment marks; existing comments survive; the live collapsed caret remains `rich-t\|ext` rather than restoring `modern`; floating toolbar stays hidden for the collapsed caret; follow-up typing yields `rich-tXext` | exact-chrome: Google Chrome 151.0.7922.174 on fresh PID 14385 source host; Playwright Chromium supplies deterministic stability replay | `apps/www/tests/browser/comment.spec.ts`; `pnpm --filter www exec playwright test tests/browser/comment.spec.ts --project=chromium --grep "comment:"` | completed | dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb | User handoff |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| issue-5112-abandoned-comment-lifecycle | base-acceptance | issue #5112 screenshot `/var/folders/zk/h7279l1s6ps280dtf1l1tjpr0000gn/T/codex-clipboard-69b3ec10-68dc-4a2a-8a45-ac317db92e46.png` | during-action | The first comment composer is adjacent to the selected comment mark, not at the viewport origin | required | popup@after-action, geometry-paint@during-action | test: apps/www/tests/browser/comment.spec.ts#comment: first composer stays anchored to the selected text | pass: exact Chrome corpus kept the composer adjacent and away from viewport origin |
| issue-5112-abandoned-comment-lifecycle | reporter-delta | user follow-up on 2026-08-26: close without submitting removes the comment mark | after-action | Closing an unsubmitted composer removes only its pure draft state and keeps any pre-existing overlapping comment | required | model@after-action, popup@after-action | test: apps/www/tests/browser/comment.spec.ts#comment: closing an unsubmitted composer cleans only its draft mark | pass: pure draft mark count returned to zero and overlapping existing comment count remained one |
| issue-5112-abandoned-comment-lifecycle | reporter-delta | 2026-08-26 request to recover floating toolbar | follow-up | Restore the old expanded `modern` range and toolbar after cancel | superseded: 2026-08-27 reporter clarification says cancel must not change the live caret and the correct point is `rich-t\|ext` | N/A: superseded acceptance | N/A: superseded acceptance | N/A: superseded acceptance |
| issue-5112-abandoned-comment-lifecycle | latest-reporter-delta | user clarification plus `/Users/felixfeng/Library/Application Support/CleanShot/media/media_fsk82CYcaM/CleanShot 2026-08-26 at 23.57.35.mp4`; transcript/frames show attempt-2 close restores `modern` | after-action | Cancel removes comment marks only and preserves the live collapsed caret at `rich-t\|ext`; restoring/highlighting `modern` is forbidden | required | model@after-action, dom-native@after-action, focus@after-action, popup@after-action, geometry-paint@after-action, runtime-errors@after-action, follow-up-input@follow-up | test: apps/www/tests/browser/comment.spec.ts#comment: closing an unsubmitted composer cleans only its draft mark | pass: exact Chrome test preserves collapsed `rich-t\|ext`, hides toolbar, removes draft mark, and typing produces `rich-tXext` |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| issue-5112-abandoned-comment-lifecycle | model | after-action | yes | Draft/base comment marks are removed only from pure draft leaves; existing comments remain; model selection stays collapsed at the pointer-created `rich-t\|ext` point | Cancel writes a saved selection, leaves a draft mark, or deletes an existing comment | browser DOM/model bridge | test: apps/www/tests/browser/comment.spec.ts#comment: closing an unsubmitted composer cleans only its draft mark | pass: saved selection state and all selection writes were removed; pure draft removed and overlapping submitted comment preserved |
| issue-5112-abandoned-comment-lifecycle | dom-native | after-action | yes | Window selection is collapsed with anchor/focus at the text boundary `rich-t\|ext` after close | `modern` is highlighted/restored, the caret moves, or selection becomes detached | exact-chrome DOM selection | test: apps/www/tests/browser/comment.spec.ts#comment: closing an unsubmitted composer cleans only its draft mark | pass: exact Chrome assertion matched `before=rich-t`, `after=ext`, collapsed selection |
| issue-5112-abandoned-comment-lifecycle | focus | after-action | yes | The outer editor remains the focus owner selected by the outside pointer action | Reply editor, BODY, or forced focus restoration overrides the pointer target | exact-chrome focus and editor focus event | test: apps/www/tests/browser/comment.spec.ts#comment: closing an unsubmitted composer cleans only its draft mark | pass: outer editor remained focused without a forced focus call |
| issue-5112-abandoned-comment-lifecycle | popup | after-action | yes | Reply popover is hidden and floating toolbar is hidden for the collapsed caret | Composer survives, or stale `modern` range reopens the floating toolbar | exact-chrome DOM | test: apps/www/tests/browser/comment.spec.ts#comment: closing an unsubmitted composer cleans only its draft mark | pass: popover and floating toolbar hidden after pointer close |
| issue-5112-abandoned-comment-lifecycle | popup | follow-up | yes | Comment popover and floating toolbar remain hidden while typing at the collapsed caret | Typing reopens stale comment/toolbar UI | browser DOM | test: apps/www/tests/browser/comment.spec.ts#comment: closing an unsubmitted composer cleans only its draft mark | pass: both remain hidden after follow-up typing |
| issue-5112-abandoned-comment-lifecycle | geometry-paint | during-action | yes | The first composer wrapper is adjacent to the selected comment mark and more than 12px from the viewport origin | The composer paints at the viewport top-left or away from its selected mark | exact-chrome geometry | test: apps/www/tests/browser/comment.spec.ts#comment: first composer stays anchored to the selected text | pass: exact Chrome corpus passed anchor geometry |
| issue-5112-abandoned-comment-lifecycle | geometry-paint | after-action | yes | Collapsed caret rect is at the `rich-t\|ext` boundary and no selection highlight/toolbar paints over `modern` | Caret/selection paints at `modern` or a toolbar paints for a collapsed caret | exact-chrome geometry | test: apps/www/tests/browser/comment.spec.ts#comment: closing an unsubmitted composer cleans only its draft mark | pass: native collapsed caret boundary is asserted and stale toolbar/selection are absent |
| issue-5112-abandoned-comment-lifecycle | runtime-errors | after-action | yes | Console, page, and unhandled runtime error collectors remain empty through close | Any runtime error occurs while close preserves the caret and removes marks | browser runtime collector | test: apps/www/tests/browser/comment.spec.ts#comment: closing an unsubmitted composer cleans only its draft mark | pass: runtime collector empty through close and typing |
| issue-5112-abandoned-comment-lifecycle | follow-up-input | follow-up | yes | Typing `X` without another click produces `rich-tXext` at the preserved caret | Text inserts at `modern`, is dropped, or requires reselection | exact-chrome DOM/model bridge | test: apps/www/tests/browser/comment.spec.ts#comment: closing an unsubmitted composer cleans only its draft mark | pass: exact Chrome follow-up produced `rich-tXext` |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| issue-5112-abandoned-comment-lifecycle | 3 | completed | "env" "PLAYWRIGHT_BASE_URL=http://localhost:3015" "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "pnpm" "--filter" "www" "exec" "playwright" "test" "tests/browser/comment.spec.ts" "--project=chromium" "--grep" "comment:" | pass: exit 0 in 7595ms | dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb | sha256:fe7b1007a1e418694f18efe88a3214a2e8f6cb6bc9f45fa3a49ed3115a6cfdc1 | 16 | .agents/rules/regression.mdc,.agents/rules/regression/scripts/validate-regression-plan.mjs,.agents/rules/regression/scripts/validate-regression-plan.test.mjs,.agents/skills/regression/SKILL.md,.agents/skills/regression/scripts/validate-regression-plan.mjs,.agents/skills/regression/scripts/validate-regression-plan.test.mjs,apps/www/playwright.config.ts,apps/www/src/registry/changelog/2026-08-26-fix-comment-popover-position.json,apps/www/src/registry/changelog/components.json,apps/www/src/registry/changelog/entries/2026-08-26-fix-comment-popover-position.mdx,apps/www/src/registry/changelog/index.json,apps/www/src/registry/components/editor/block-discussion.tsx,apps/www/src/registry/components/editor/comment.tsx,apps/www/src/registry/components/editor/floating-toolbar.tsx,apps/www/tests/browser/comment.spec.ts,docs/plans/templates/regression.md | pid:14385;started:2026-08-26T16:07:39.000Z;base-url:http://localhost:3015;browser:exact-chrome:151.0.7922.174;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.174 | 2026-08-26T16:11:30.838Z | 2026-08-26T16:15:56.348Z | 2026-08-26T16:16:03.944Z | 0 | sha256:617aa568e06019aa3071a2bed8a5f34271dc5467a5d8da4256986a1af2b2d596 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plate registry comment/floating-toolbar lifecycle | issue-5112-abandoned-comment-lifecycle | pass: current 2-test `comment.spec.ts` corpus passed before attempt-3 test/product edits; video/manual exact case was red | 2026-08-26T16:11:30.838Z | exact Chrome attempt-3 receipt command above | sha256:fe7b1007a1e418694f18efe88a3214a2e8f6cb6bc9f45fa3a49ed3115a6cfdc1 | pass: 2/2 exact Chrome corpus after final owner edit |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| local proof host command | `pnpm --filter www dev -- -p 3015` passed `-p` as a project directory and exited before serving | proof-host command shape | use the direct workspace executable with explicit env and `next dev -p 3015` | pass: corrected PLITE-mode source host reached Ready on 3015 and baseline tests passed 2/2 |
| stale non-PLITE host | old port 3001 `/view/editor-ai` failed on generated `editor-base-kit.tsx`; no reporter assertion ran | stale/wrong proof host, not a product failure | terminate the same-repo dev process and start fresh `PLATE_WWW_PLITE=1 PLATE_WWW_DEV_SOURCE=1` host on 3015 | pass: current source route contains one outer editor, no Build Error, and baseline tests passed 2/2 |
| `www` TypeScript gate | exact `pnpm --filter www exec tsc --noEmit --pretty false` exited 2 after reinstall, proving six stale app AI consumers rather than dependency damage | bounded app/registry copy drift in `src/app/api/ai/command/**` | synchronize route/utils/four prompts from current `src/registry/app/api/ai/command/**`; verify zero diff and run AI prompt/Markdown tests | pass: exact tsc exits 0; synchronized files match registry source; relevant AI tests 9/9 |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| issue-5112-abandoned-comment-lifecycle | 1 | Reporter says the floating toolbar is disabled after closing the locally claimed fixed composer | reporter-contradiction | yes: revoke candidate-local wording and the prior 10/10 Playwright plus 5/5 Browser receipt; production sha256 `04c56d997cd2e38c1f819e121242f890b41c96f06a0dd066719475d483c7c290`, test sha256 `1a28b2b1a12f93d78455d07b7a67caf5313a5c2dd3d12a10e839128d8db18826` | repair-now: `.agents/rules/regression/scripts/validate-regression-plan.mjs`, `.agents/rules/regression.mdc`, and `docs/plans/templates/regression.md` require popup lifecycle proof to include `follow-up-input@follow-up` | pass: `node --test .agents/rules/regression/scripts/validate-regression-plan.test.mjs .agents/rules/regression/scripts/test-first-contract.test.mjs` 38/38 after `pnpm install` source/mirror sync | yes: timer-focus-correctness because the contradiction is a post-popover editor-focus and toolbar-lifecycle failure | best-api: accepted no-new-API target using existing selection/focus operations; plate-plan: accepted registry close-lifecycle owner with no Plite or floating-toolbar comment coupling | reproduced: Browser attempt 2 proves close loses the draft range and outer focus immediately; fresh reselection works, so Patch resumes at draft-range restoration |
| issue-5112-abandoned-comment-lifecycle | 2 | Reporter video/clarification shows attempt-2 cancel overwrites live `rich-t\|ext` caret with restored `modern` selection/toolbar | reporter-contradiction | yes: revoke attempt-2 completed receipt `sha256:634bcfe407437bc98f7d010edf3d6998789fa5e6698e7c4642d385fe20bd104d`, local completion, and all selection-restoration claims | repair-now: `.agents/rules/regression/scripts/validate-regression-plan.mjs`, `.agents/rules/regression.mdc`, and `docs/plans/templates/regression.md` require same-phase DOM-native and focus accounting for popup close | pass: focused workflow tests 39/39 after `pnpm install` source/mirror sync | yes: second-failed-fix and timer-focus-correctness | best-api: accepted hard cut of saved selection/clone/restore, forced focus, selection clear, and flush machinery; plate-plan: accepted two-stage registry close that only unsets marks/store after pointer caret settles, with no Plite/floating-toolbar change | reproduced: architecture accepted; current source/video and P1 finding prove exact red, executable red test next |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| issue-5112-abandoned-comment-lifecycle | 2 | second-failed-fix, timer-focus-correctness | escalate | required: best-api accepted the maximum cut—delete `draftSelection`, Range imports/capture/clear, selection clone/restore, forced editor focus, `tx.selection.clear()`, and `flushSync`; cancel owns no selection authority | plate-plan: accepted two-phase `BlockCommentDetails` close so the pointer-created caret settles before registry UI unsets draft/base marks and clears comment store; keep `FloatingToolbar` and Plite unchanged | accepted: video frames and P1 finding prove the saved-range machinery is the sole wrong authority; attempt 3 may edit only comment/block-discussion/test/changelog owners |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| issue-5112-abandoned-comment-lifecycle | `block-discussion.tsx`, `comment.tsx`, `floating-toolbar.tsx`, `comment.spec.ts`, and `playwright.config.ts` | PID 14385 fresh `apps/www` PLITE-mode source server on `/`; Playwright Chromium plus installed Google Chrome 151 | exact Chrome receipt attests PID/start/base/executable/version; Browser route rendered but exact pointer replay hit Browser selector/CUA limits | registry changelog generated from MDX source; exact-Chrome path is an explicit proof-host option | pass: current source host and installed Chrome verified |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| issue-5112-abandoned-comment-lifecycle | Replaced forced-restoration assertions with exact pointer-created caret preservation at `rich-t\|ext`, hidden toolbar, and follow-up typing `rich-tXext` | `block-discussion.tsx`, `comment.tsx`, `comment.spec.ts`, changelog source/generated files; no Plite or floating-toolbar behavior change | exact red; focused green; full corpus; 5 retry-free runs; exact Chrome; attempt-3 receipt; P1 review | root cause: saved selection/forced focus/clear/flush machinery took selection authority from pointer dismissal; hard cut removes all of it while two-phase close only cleans marks/store | pass: focused 1/1, corpus 2/2, stability 10/10, receipt valid, final P1 clean |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| issue-5112-abandoned-comment-lifecycle | exact pointer-close caret case plus full `comment.spec.ts` corpus | 5 fresh retry-free runs after attempt-3 focused green | pass: 10/10 tests across five full corpus repetitions | 0 | kept; lifecycle stable |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| issue-5112-abandoned-comment-lifecycle | video/manual red; focused green 1/1; corpus 2/2; stability 10/10; exact Chrome receipt; workflow 39/39; final P1 clean | completed | local current checkout only; uncommitted and unpushed; not integrated, shipped, released, or publicly completed | Browser in-app exact double-click replay was tool-blocked; installed Chrome executable test is authoritative | user handoff; no commit/push/public mutation |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| issue-5112-abandoned-comment-lifecycle | Attempt 2 proved later toolbar use but never asserted the pointer-created caret at the close phase, permitting forced selection restoration | repair-now | `.agents/rules/regression.mdc`, validator/test, `docs/plans/templates/regression.md`, and generated Regression mirrors require same-phase DOM-native/focus accounting for popup close | pass: focused workflow tests 39/39 and source/mirror parity after `pnpm install` | second reporter contradiction invalidated attempt 2; attempt 3 completed after architecture, exact red/green, stability, receipt, and P1 |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Regression workflow test after each repair | generated skill mirror | first run red until sync | source rule changed before required mirror sync | correctly caught stale generated doctrine | `pnpm install` synced the mirror; second repair exact rerun passed 39/39 |

Findings:
- Attempt 1 was a false green because proof stopped after popover hidden and draft-mark cleanup.
- Attempt 2 was a second false green: it restored the old expanded `modern` range and toolbar, while the reporter had already placed a live caret at `rich-t\|ext` during pointer dismissal.
- The video transcript describes the incorrect final `modern` state; extracted frames plus the user's clarification establish `rich-t\|ext` as the correct oracle.
- Root cause was wrong selection ownership: `draftSelection`, forced focus, selection clear/restore, and `flushSync` overrode the pointer-created caret.
- The final two-stage close keeps the draft owner alive only until `onCloseAutoFocus`, then removes draft/base marks and clears comment store without any selection or focus write.
- `www` tsc source drift was closed by synchronizing six stale app AI command consumers from the already-current registry source; no compatibility alias or shim was added.

Timeline:
- Invalidated attempt-1 candidate and repaired Regression's popup follow-up gate.
- Passed structural Regression validation, Best API, Plate Plan, and agent-native review before product attempt 2.
- Invalidated attempt-2 completion/receipt after the reporter video, repaired Regression's same-phase close oracle, and passed second-failure Best API/Plate Plan.
- Recorded pre-edit corpus 2/2, exact attempt-3 red, focused green 1/1, corpus green 2/2, and stability 10/10.
- Passed installed Chrome 151 executable replay, generated attempt-3 receipt, regenerated changelog outputs, and passed final P1 autoreview.

Decisions and tradeoffs:
- Best API: hard-cut `draftSelection`, Range capture, selection clone/restore, forced editor focus, `tx.selection.clear()`, and `flushSync`; cancel owns no selection authority.
- Plate Plan: the copied registry popover owns mark/store cleanup only. `FloatingToolbar`, EventEditor, and Plite remain unchanged.
- Preserve reply-editor autofocus and two-stage close so the outside pointer caret settles before draft leaves merge.
- Exact proof covers `modern` selection, pointer dismissal at `rich-t\|ext`, collapsed caret preservation, hidden toolbar, mark cleanup, overlap preservation, and follow-up typing `rich-tXext`.

Review fixes:
- Agent-native review PASS for the Regression workflow repair: `regression` is discoverable; `.agents/rules/regression.mdc` and the validator/template are durable source; `pnpm install` synced `.agents/skills/regression/SKILL.md`; the focused Node workflow test proves rejection and mirror parity; no hidden human-only context or public authority was added.
- Workflow-repair P1 accepted one product finding at `block-discussion.tsx`: saved `draftSelection` overwrote the live pointer-created caret. Attempt 3 removed that machinery; final P1 is clean.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Wrong `pnpm --filter www dev -- -p 3015` argument forwarding | 1 | run explicit workspace `next dev -p 3015` | corrected host command |
| Stale non-PLITE server on port 3001 | 1 | replace with fresh PLITE-mode host | PID 77577 on port 3015 |
| Focus/range restoration hypotheses before full state trace | 5 | freeze product edits and trace model selection plus every floating-toolbar open condition | attempt 2 converged but was invalidated by the reporter video; attempt 3 hard-cut all restoration machinery |
| Final Bold oracle referenced Node constant inside page scope | 1 | pass selector as evaluate input | corrected test; focused green passed |
| Attempt-3 test patch initially changed the anchor test and left the cancel drag path | 1 | restore anchor case and scope `modern` double-click to cancel case | exact red reached reporter assertion |
| Browser exact pointer replay | 3 | try locator DOM, page DOM, then verified CUA coordinates | tool blocked by fixed selector deadlines/missing DOM Range APIs; exact installed-Chrome Playwright remains authoritative |

Verification evidence:
- `node --test .agents/rules/regression/scripts/validate-regression-plan.test.mjs .agents/rules/regression/scripts/test-first-contract.test.mjs` -> 39/39.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check` -> 82/82 events checked.
- Focused Chromium case -> 1/1; full corpus -> 2/2; `--repeat-each=5` -> 10/10, retries 0.
- Installed Chrome 151 final replay -> caret `rich-t\|ext`, toolbar hidden, typing `X` produces `rich-tXext`; receipt `sha256:617aa568e06019aa3071a2bed8a5f34271dc5467a5d8da4256986a1af2b2d596`.
- Browser in-app route rendered current source, but exact pointer replay was tool-blocked; no behavior claim relies on that failed automation.
- Final P1 autoreview -> clean, no accepted/actionable P0/P1 findings.
- `pnpm --filter www exec tsc --noEmit --pretty false` -> pass after reinstall and bounded app/registry source sync.
- `pnpm --filter @platejs/ai test src/react/AIChatPlugin.prompt.spec.ts src/react/AIChatPlugin.markdown.spec.tsx` -> 9/9.

Final handoff:
- executable cases: `comment.spec.ts` owns anchor plus abandoned-draft mark/selection/focus/toolbar/typing/overlap behavior.
- cumulative reporter evidence, phase-specific oracles, and forbidden states: base anchor/cleanup/overlap stay required; forced toolbar restoration is superseded; live `rich-t\|ext` caret claim passes exact Chrome.
- failed-fix invalidation and automatic repair: attempt 1 and attempt 2 revoked; Regression now requires usable follow-up input and same-phase DOM-native/focus accounting for popup close.
- proof receipts and affected-corpus replay: attempt-3 exact Chrome receipt above covers 16 source/generated/proof inputs; final corpus 2/2, stability 10/10.
- started-gate failure closure: all issue gates and exact `www` tsc pass; stale app AI command consumers match registry source and relevant tests pass 9/9.
- changed files: comment/block-discussion lifecycle, browser test/config, registry changelog source/generated files, Regression source/validator/test/template/generated mirrors, six synchronized app AI command consumers, and this plan.
- design decisions: keep `FloatingToolbar` generic; no timer; no Plite change; no saved comment selection; two-stage close only delays mark cleanup until pointer selection settles.
- tests and proof: workflow 39/39; focused 1/1; corpus 2/2; stability 10/10; exact Chrome green; changelog check green.
- source/generated sync: `pnpm install` and changelog generator completed; Regression source/mirror parity passed.
- P1 and agent-native findings: both clean; final P1 rerun after AI sync reports no actionable P0/P1 defects.
- residual risks and next owner: no selected local gate remains; user owns any later commit/push/public issue action.
- local completion status and integration/public-status boundary: completed locally, uncommitted and unpushed; no issue/PR/label/release status changed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | all selected behavior, receipt, stability, review, and started gates complete |
| Where am I going? | mechanical completion and user handoff |
| What is the goal? | close selected regressions through executable tests and fresh proof |
| What have I learned? | popup cancel owns mark cleanup, not selection; the live pointer-created caret is authoritative and must be asserted at close phase |
| What have I done? | hard-cut selection restoration, repaired Regression twice, and proved attempt-3 local bytes in Chromium and Chrome 151 |

Open risks:
- No commit, push, public issue update, integration, or release proof exists by user request.
