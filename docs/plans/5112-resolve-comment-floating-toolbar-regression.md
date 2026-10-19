# Resolve comment floating toolbar regression

Objective:
Repair the submitted-comment resolve lifecycle so resolving removes the comment mark without poisoning editor selection/focus, and the floating toolbar opens and works on the next valid text selection.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5112-resolve-comment-floating-toolbar-regression.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- none

Regression source:

- target bug / surface / corpus: issue #5112 follow-up: resolving a submitted comment prevents the floating toolbar from reopening; affected corpus is `apps/www/tests/browser/comment.spec.ts`
- lane and current source owner: Plate registry comment resolve lifecycle in `apps/www/src/registry/components/editor/comment.tsx`, discussion popover ownership in `block-discussion.tsx`, and generic toolbar state in `floating-toolbar.tsx`
- selected executable test cases: `issue-5112-resolve-comment-toolbar-recovery` in `apps/www/tests/browser/comment.spec.ts`
- tested ref or dirty-state boundary: `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb`; pre-edit fingerprints are recorded below and final fingerprints will be refreshed
- route / proof host and freshness method: fresh PLITE-mode `apps/www` source server on `/`; Browser-first inspection, exact installed Chrome plus Playwright Chromium proof; restart after owner edits
- invocation mode / timebox: user-invoked one-shot Regression run; no commit, push, PR, GitHub issue update, or release mutation

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
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/5112-resolve-comment-floating-toolbar-regression.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5112-resolve-comment-floating-toolbar-regression.md`

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

- allowed source owners: comment resolve/popover/floating-toolbar lifecycle owners under `apps/www/src/registry/components/editor/`; no unrelated editor behavior
- allowed proof/test owners: `apps/www/tests/browser/comment.spec.ts`, focused existing component tests only if the root cause belongs to the generic toolbar
- generated/source boundary: registry component and browser test files are source; changelog generated output changes only through its existing source entry and generator
- browser/device claim width: local current-source Browser inspection plus exact installed Chrome/Playwright Chromium; no mobile, integration, shipped, or released claim
- forbidden product/API/release/public mutations: no commit, push, PR, issue comment/label/close, release, public API expansion, or unrelated cleanup
- orchestration mode and writer ownership: main thread only; one writer and one route host; no subagent or parallel writer

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
- current executable case: `issue-5112-resolve-comment-toolbar-recovery`
- current case status: completed with exact Chrome receipt and zero-retry stability
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
| Prompt requirements captured | yes | Resolve removes the submitted comment mark; the floating toolbar must display and work on the next valid selection; earlier cancel/live-caret behavior remains intact; use Regression; do not commit or push. |
| Regression methodology loaded | yes | `.agents/skills/regression/references/methodology.md` was read completely in this logical run. |
| Active goal checked or created | yes | Active goal requires exact red/green coverage, fresh receipt, stability, P1 review, and this plan's closure. |
| Current source owner and tested ref recorded | yes | Comment, discussion, toolbar owners and `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb` recorded above. |
| Executable test cases discovered | yes | Existing comment browser corpus has anchor and abandoned-draft cases; the resolve follow-up becomes one new atomic case in that file. |
| Cumulative reporter evidence resolved | yes | Earlier anchor, draft cleanup, overlap, and live-caret claims remain affected-corpus requirements; this report adds submitted-comment resolve recovery. |
| Reporter oracle matrix resolved | yes | Matrix below covers resolve-time model/DOM/focus/popup and next-selection toolbar geometry/action/runtime. |
| Regression semantic validator ready | yes | Existing Regression validator enforces follow-up input and same-phase DOM/focus coverage for popup lifecycle cases. |
| Route/proof-host readiness plan recorded | yes | Fresh PLITE-mode source server, Browser-first inspection, and exact installed Chrome replay required before final claim. |
| Patch delegation boundary recorded | yes | One normalized resolve lifecycle case; only exact owners and `comment.spec.ts`; no API/public/release work. |
| Orchestrator writer ownership recorded | yes | N/A: orchestrator inactive; main thread is the only writer and host owner. |
| Output budget strategy recorded | yes | Exact owner/test files and focused commands only; broad build/generated output excluded. |
| Claim width and blocked rules recorded | yes | Local uncommitted/unpushed claim only; blocked only if fresh exact browser cannot observe current source. |

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
- [x] Every applicable popup/toolbar oracle after an action or release has an
      applicable `follow-up-input@follow-up` oracle proving the next owning-
      surface interaction still works.
- [x] Every applicable popup close oracle at `after-action` or `after-release`
      accounts for `dom-native` and `focus` at the same phase; later follow-up
      input never substitutes for close-time selection/caret preservation.
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
| Named completion threshold | yes | Close every selected executable case and methodology row | pass: one resolve-recovery case completed locally with no-change methodology decision. |
| Current-source readiness | yes | Prove source owner and final tested ref/dirty boundary | pass: receipt records dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb and eight unchanged proof inputs. |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | pass: fresh PID 44926 served PLITE-mode source on localhost:3015; Chrome 151 executable attested. |
| Executable regression coverage | yes | Record exact test file, red result, green result, and owning invariant | pass: new browser case failed on inactive local focus/missing toolbar, then passed with resolve, repaint, and Bold assertions. |
| Cumulative reporter evidence closure | yes | Map every still-applicable base acceptance and later reporter delta to a phase-specific executable oracle | pass: prior anchor/draft/caret behavior and latest resolve recovery all replayed in the final three-test corpus. |
| Reporter oracle closure | yes | Resolve positive and forbidden states for all seven observations and every applicable interaction phase per case | pass: all oracle rows below have final exact browser evidence. |
| Failed-fix interrupt closure | yes | Prove every claimed-fix failure invalidated prior proof and completed automatic Regression repair | N/A: no candidate/kept/completed resolve-specific fix failed; exploratory reds were never claimed. |
| Architecture pressure closure | yes | Prove every second failure or architecture trigger has Best API and layer-plan evidence | pass: duplicated-live-identity trigger hard-cuts global focus from toolbar and reuses scoped focus; registry-only Plate plan accepted. |
| Proof receipt closure | yes | Validate generated final receipts against unchanged issue-owned inputs | pass: completed receipt sha256:0fc5f5de20133527290648b5acd45ceaaf85640cfe067b5619691d64538013ac. |
| Affected-corpus replay closure | yes | Replay all cases affected by the last shared-owner edit | pass: exact Chrome full corpus 15/15 over five runs, digest sha256:0f3ef5a2571f2b66b658a5af4953b580d1cf75eac627eea85d06101b37c13f8e. |
| Started-gate failure closure | yes | Rerun every requested or started gate that failed; completion requires the exact gate to pass on final bytes | pass: proof-host/test-harness failures repaired; final focused, corpus, typecheck, changelog, and review scope gates resolved below. |
| Smallest-probe closure | yes | Record first falsifying probe and any host repair | pass: exact browser probe isolated connected selection plus inactive editor and missing toolbar; temporary state probe proved local/global focus divergence. |
| Patch delegation closure | yes | Read back one-case root-cause/red/green/proof evidence | pass: one normalized case returned root cause, smallest owner changes, exact red/green, stability, ref, receipt, and review. |
| Focused verification closure | yes | Run owning test and exact final-case replay | pass: focused browser 1/1 and toolbar component 3/3. |
| Stability closure | yes | Record retry-free warm runs or evidence-backed N/A | pass: exact Chrome 15/15, retries 0. |
| Packet decision closure | yes | Keep/revert/quarantine/defer/block every selected case honestly | pass: case completed locally. |
| Local completion status | yes | Mark every fully proved kept case and the run `completed`; record local ref/fingerprints and uncommitted/unpushed state separately | pass: completed locally; uncommitted/unpushed; no public mutation. |
| No duplicate registry | yes | Prove no sidecar behavior manifest/database was created | pass: executable tests and this transient plan only. |
| Generated/source and host repair | yes | Repair drift/host methodology or record blocked claim | pass: localhost host fixed 127.0.0.1 CORS mismatch; changelog regenerated from MDX and checks 82/82. |
| Orchestrator writer closure | yes | Prove one shared-state writer and serialized overlapping owners/hosts, or N/A | N/A: orchestrator inactive; main thread was the only writer and host controller. |
| Workflow slowdown closure | yes | Repair avoidable slow/stale/noisy proof paths or defer with owner | pass: wrong proof host origin, non-owner comment setup, unstable full-editor text oracle, and active-server review drift were all repaired. |
| Methodology delta closure | yes | Resolve repair-now/no-change/defer for every case | pass: no-change; current Regression already requires same-phase focus and follow-up input. |
| Source/generated sync | yes | Run `pnpm install` and parity audit when agent sources changed, otherwise N/A | N/A: no agent workflow source changed in this resolve-specific run; prior Regression source/mirrors stayed untouched. |
| Agent-native review | yes | Run for changed agent workflows or record N/A | N/A: no agent workflow or user/agent capability surface changed. |
| Final handoff contract | yes | Record tests, decisions, proof, sync, reviews, risks, and next owner | pass: Final handoff section below is complete. |
| Autoreview | yes | Run P1 autoreview for non-trivial implementation changes or record N/A | pass: reviewer judged editor lifecycle changes consistent; its sole P1 targeted unrelated pre-existing github-issue-reporter work and was rejected as out of scope. |
| Regression semantic plan | yes | Run `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/5112-resolve-comment-floating-toolbar-regression.md --complete` | pass: final command required after this update. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5112-resolve-comment-floating-toolbar-regression.md` | pass: final command required after semantic validation. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | exact request, no-commit/push boundary, goal, and case copied into plan | source/host readiness |
| Current source and proof-host readiness | completed | fresh localhost PLITE source host and pre-edit shared corpus 2/2 | discover executable cases |
| Executable case discovery and selection | completed | one atomic resolve-recovery case added to existing browser owner | smallest probe |
| Cumulative reporter evidence inventory | completed | prior cancel/caret acceptance retained; resolve delta added | reporter oracle expansion |
| Reporter oracle expansion | completed | setup, after-action, and follow-up cover all seven classes | semantic validation |
| Pre-implementation semantic validation | completed | structural validator passed before product changes | smallest probe |
| Smallest high-value probe | completed | exact red isolated inactive focus and missing next toolbar | reproduce/classify |
| Reproduce, classify, and red test | completed | submitted own comment -> resolve -> select text -> toolbar red | patch delegation |
| One-case Patch delegation | completed | local focus restored; toolbar switched from duplicate global focus to scoped focus | verification |
| Focused verification and stability | completed | focused 1/1; component 3/3; corpus 3/3; exact Chrome 15/15 | packet decision |
| Keep/revert/quarantine | completed | completed locally | methodology delta |
| Methodology repair/no-change/defer | completed | no-change with current workflow evidence | next case or closure |
| Reviews and final handoff | completed | P1 has no accepted in-scope finding; exact verification and boundaries recorded | goal-plan check |
| Final goal-plan check | completed | semantic validator and check-complete run after final plan bytes | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|-------------------|---------------------|--------|------------|------------|
| issue-5112-resolve-comment-toolbar-recovery | User follow-up on 2026-08-27 plus issue #5112 current local candidate | Create and submit a comment, resolve it, then select ordinary editor text and use the floating toolbar | Resolve removes only the target comment mark/discussion UI; editor selection remains native-valid; next expanded selection opens one correctly sized toolbar and Bold changes the selected text | exact-chrome: Google Chrome 151.0.7922.174 against fresh PID 44926 PLITE-mode apps/www source server; retries 0 | `apps/www/tests/browser/comment.spec.ts`; focused grep, full file, and exact Chrome `--repeat-each=5` | completed | dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb | user handoff; no git/public mutation |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| issue-5112-resolve-comment-toolbar-recovery | base-acceptance | Original screenshot and prior local lifecycle case | setup | Existing submitted comment opens its discussion popover; abandoned drafts clean marks and preserve live caret | required | popup@setup, dom-native@setup, focus@setup | test: apps/www/tests/browser/comment.spec.ts#comment: closing an unsubmitted composer cleans only its draft mark | pass: pre-edit shared corpus 2/2 on fresh localhost host |
| issue-5112-resolve-comment-toolbar-recovery | latest-reporter-delta | User message 2026-08-27 | follow-up | After resolving a submitted comment, the floating toolbar must display again for a new valid selection | required | model@after-action, dom-native@after-action, focus@after-action, popup@after-action, geometry-paint@follow-up, runtime-errors@follow-up, follow-up-input@follow-up | test: apps/www/tests/browser/comment.spec.ts#comment: resolving a submitted comment preserves floating toolbar recovery | pass: exact Chrome 5/5 resolve cases and 15/15 affected corpus; toolbar reopened and Bold applied |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| issue-5112-resolve-comment-toolbar-recovery | popup | setup | yes | submitted own comment opens its discussion popover before resolve | popover never opens or wrong discussion renders | browser: Playwright DOM | test: apps/www/tests/browser/comment.spec.ts#comment: resolving a submitted comment preserves floating toolbar recovery | pass: exact Chrome opened Alice's submitted discussion before resolve in 5/5 runs |
| issue-5112-resolve-comment-toolbar-recovery | dom-native | setup | yes | prior abandoned-draft case leaves the live caret connected inside the editor | cancel restores the old marked range or detaches the native selection | browser: DOM Selection/Range | test: apps/www/tests/browser/comment.spec.ts#comment: closing an unsubmitted composer cleans only its draft mark | pass: pre-edit shared corpus 2/2 |
| issue-5112-resolve-comment-toolbar-recovery | focus | setup | yes | prior abandoned-draft case leaves the editor focused and usable | focus remains in the removed draft popover or detached button | browser: DOM focus | test: apps/www/tests/browser/comment.spec.ts#comment: closing an unsubmitted composer cleans only its draft mark | pass: pre-edit shared corpus 2/2 |
| issue-5112-resolve-comment-toolbar-recovery | model | after-action | yes | target discussion is resolved and its comment mark key is absent while document text is unchanged | unresolved target mark/discussion remains, unrelated text/marks change, or selection points at a removed path | browser: Plate model/runtime probe | test: apps/www/tests/browser/comment.spec.ts#comment: resolving a submitted comment preserves floating toolbar recovery | pass: exact Chrome removed only the submitted `modern` mark and preserved target text in 5/5 runs |
| issue-5112-resolve-comment-toolbar-recovery | dom-native | after-action | yes | native selection is valid and maps inside the editor after resolve | selection is empty/stale/outside editor or references detached DOM | dom: Selection/Range | test: apps/www/tests/browser/comment.spec.ts#comment: resolving a submitted comment preserves floating toolbar recovery | pass: exact Chrome kept connected native selection endpoints inside the main editor in 5/5 runs |
| issue-5112-resolve-comment-toolbar-recovery | focus | after-action | yes | focus ownership returns to the document editor after the resolve button unmounts | focus remains on detached resolve button/body or a stale global editor identity blocks local focus | dom: active element plus browser selection recovery | test: apps/www/tests/browser/comment.spec.ts#comment: resolving a submitted comment preserves floating toolbar recovery | pass: main editor was focused after resolve and toolbar consumed scoped focus in 5/5 exact Chrome runs |
| issue-5112-resolve-comment-toolbar-recovery | popup | after-action | yes | discussion popover closes after resolve and stays closed | resolved popover remains visible/reopens or leaves an overlay owner latched | browser: popover DOM/state | test: apps/www/tests/browser/comment.spec.ts#comment: resolving a submitted comment preserves floating toolbar recovery | pass: resolve popover closed and submitted mark count became zero in 5/5 runs |
| issue-5112-resolve-comment-toolbar-recovery | geometry-paint | follow-up | yes | next expanded selection paints one non-zero floating toolbar adjacent to its selection range | toolbar is missing, duplicate, zero-sized, offscreen, or anchored to the removed comment | browser: exact-chrome paint and geometry | test: apps/www/tests/browser/comment.spec.ts#comment: resolving a submitted comment preserves floating toolbar recovery | pass: one visible toolbar had positive width/height after selecting `text` in 5/5 exact Chrome runs |
| issue-5112-resolve-comment-toolbar-recovery | runtime-errors | follow-up | yes | no page error or filtered console/runtime error occurs through resolve and toolbar action | any runtime error appears | browser: runtime error recorder | test: apps/www/tests/browser/comment.spec.ts#comment: resolving a submitted comment preserves floating toolbar recovery | pass: runtime recorder stayed clean across 5/5 exact Chrome cases |
| issue-5112-resolve-comment-toolbar-recovery | follow-up-input | follow-up | yes | clicking Bold in the reopened toolbar applies bold to the new selection and keeps editor usable | toolbar cannot be clicked, action targets stale comment selection, or formatting does not change | browser: toolbar action plus rendered DOM | test: apps/www/tests/browser/comment.spec.ts#comment: resolving a submitted comment preserves floating toolbar recovery | pass: Bold rendered the selected `text` as strong in 5/5 exact Chrome runs |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| issue-5112-resolve-comment-toolbar-recovery | 1 | completed | "env" "PLAYWRIGHT_BASE_URL=http://localhost:3015" "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "PLAYWRIGHT_WORKERS=1" "pnpm" "--filter" "www" "exec" "playwright" "test" "tests/browser/comment.spec.ts" "--config" "playwright.config.ts" "--project" "chromium" "--repeat-each=5" "--workers=1" | pass: exit 0 in 46086ms | dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb | sha256:0f3ef5a2571f2b66b658a5af4953b580d1cf75eac627eea85d06101b37c13f8e | 8 | apps/www/playwright.config.ts,apps/www/src/registry/changelog/2026-08-26-fix-comment-popover-position.json,apps/www/src/registry/changelog/entries/2026-08-26-fix-comment-popover-position.mdx,apps/www/src/registry/components/editor/block-discussion.tsx,apps/www/src/registry/components/editor/comment.tsx,apps/www/src/registry/components/editor/floating-toolbar.spec.tsx,apps/www/src/registry/components/editor/floating-toolbar.tsx,apps/www/tests/browser/comment.spec.ts | pid:56092;started:2026-08-26T16:54:13.000Z;base-url:http://localhost:3015;browser:exact-chrome:macos;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 151.0.7922.174 | 2026-08-26T16:40:45.131Z | 2026-08-26T16:55:58.311Z | 2026-08-26T16:56:44.398Z | 0 | sha256:0fc5f5de20133527290648b5acd45ceaaf85640cfe067b5619691d64538013ac |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| Plate registry comment/floating-toolbar lifecycle | issue-5112-resolve-comment-toolbar-recovery | pass: existing two-case corpus 2/2 before resolve test/product edits; new resolve case exact red | 2026-08-26T16:40:45.131Z | exact Chrome full `comment.spec.ts --repeat-each=5 --workers=1`; includes prior anchor/cancel cases | sha256:0f3ef5a2571f2b66b658a5af4953b580d1cf75eac627eea85d06101b37c13f8e | pass: 15/15 after final owner edit, retries 0 |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| initial browser host | `127.0.0.1:3015` page shell loaded but Next blocked cross-origin dev chunks, so no editor rendered | proof-host origin mismatch before product assertion | use `http://localhost:3015`, matching the server origin | pass: pre-edit corpus 2/2 and all final browser runs use localhost |
| resolve test setup | fixture comments belong to Charlie/Bob, so current user Alice had no resolve button | test-harness setup, not product behavior | create and submit Alice's own comment, reopen it, then resolve | pass: exact focused green and 5/5 exact Chrome runs |
| document-text oracle | full editor `toHaveText` normalized dynamic Mermaid/whitespace differently | unstable over-broad test oracle | assert unchanged target paragraph text and target mark count only | pass: focused and exact Chrome final runs |
| focus-only candidate | explicit DOM focus passed but next toolbar stayed missing | incomplete owner classification; local/global focus identities diverged | state probe proved global event focus `null`; Best API hard-cut toolbar to scoped `useEditorFocused()` | pass: component 3/3 and exact browser behavior green |
| first P1 autoreview | helper detected source drift after bundling while dev host was active and rejected the result | review-host freshness guard | stop the source server and rerun against a static tree | pass: second review completed; editor packet consistent, sole unrelated P1 rejected out of scope |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| none | 0 | N/A: no claimed candidate has failed | N/A: expected pre-fix red only | N/A: no prior resolve-specific green claim | N/A: no failed-fix repair triggered | N/A: no workflow repair required | N/A: no architecture trigger yet | N/A: no escalation required | N/A: start from exact reproduction |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| issue-5112-resolve-comment-toolbar-recovery | 0 | duplicated-live-identity | escalate | required: best-api hard-cuts global `EventEditorStore.focus` from the toolbar and keeps the existing scoped `useEditorFocused()` API; no reset API or comment flag | plate-plan: registry resolve returns DOM focus without writing selection; registry toolbar reads its own Plate/Plite focus context; no substrate/public API/docs/changeset | accepted: temporary state probe showed DOM editor focused while global event focus stayed `null`; exact red remained until the duplicate authority was removed |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| issue-5112-resolve-comment-toolbar-recovery | comment/discussion/floating-toolbar registry source | PID 44926; `PLATE_WWW_PLITE=1 PLATE_WWW_DEV_SOURCE=1 pnpm --filter www exec next dev -p 3015`; `/` | receipt attests start time, localhost URL, Chrome executable/version, dirty ref, and eight-input digest after final owner edit | source components load directly; changelog JSON generated from MDX; no registry build | pass: fresh exact Chrome receipt; host stopped after proof |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| issue-5112-resolve-comment-toolbar-recovery | exact own-comment submit -> resolve -> new selection -> toolbar -> Bold case | `comment.tsx`, `floating-toolbar.tsx`, `floating-toolbar.spec.tsx`, `comment.spec.ts`; `block-discussion.tsx` remains affected-corpus input but unchanged by final patch | focused green, full comment corpus, five retry-free repeats, fresh receipt, www typecheck, P1 review | root cause: resolve did not restore local focus and toolbar trusted stale global focus; changed files, exact red/green, receipt, architecture verdict, and local-only caveat recorded | pass: packet completed locally with no accepted in-scope P1 |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| issue-5112-resolve-comment-toolbar-recovery | exact installed Chrome 151 on fresh PLITE-mode source host | 5 full-corpus repetitions | pass: 15/15 total; resolve case 5/5 and prior two cases 10/10 | 0 | completed locally |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| issue-5112-resolve-comment-toolbar-recovery | exact red, focused green, component 3/3, corpus 3/3, Chrome 15/15, www tsc, changelog checks, receipt, and P1 scope review | completed | current checkout only; uncommitted and unpushed; not integrated, shipped, released, or publicly completed | unrelated github-issue-reporter P1 exists elsewhere in the dirty tree; it is outside this case and was not changed | user; no git/public action authorized |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| issue-5112-resolve-comment-toolbar-recovery | Whether Regression already forces resolve-time focus plus next-toolbar action coverage | no-change | executable browser test is the behavior owner; current Regression already requires same-phase DOM/focus and follow-up-input | pass: plan was structurally valid before implementation and final semantic validator passes after proof | trigger/result: new behavior case plus duplicated focus architecture trigger; no claimed-fix failure or workflow miss |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| initial Playwright baseline | proof host | 18s / expected under 10s | used 127.0.0.1 against localhost Next dev origin; editor never rendered | none for product | switched to localhost; same corpus passed 2/2 in 6.6s |
| first exact test setups | browser test | two setup reds before behavior assertion | fixture ownership and over-broad full-editor text oracle | clarified exact reporter path | created current-user comment and narrowed unchanged-text assertion |
| first autoreview | review host | 3m / expected healthy | dev source host caused tree-freshness rejection | no review verdict | stopped host; second review completed and produced explicit editor verdict |

Findings:

- Exact red: resolve removes the target mark, preserves target text and connected native selection, and closes the popover, but leaves the main editor inactive; the next native `text` selection cannot open the floating toolbar.
- Root cause: resolve unmounts a virtual-anchor popover after its button takes focus. The action returns DOM focus to the main editor, but `FloatingToolbar` reads a second global focus identity whose value remains `null`; a valid local focus and expanded selection are therefore rejected.
- Best API hard cut: delete the toolbar's global `useEventEditorValue('focus')` dependency and reuse its existing scoped `useEditorFocused()` owner. Do not add comment flags, store resets, timers, or a second selection API.
- Plate plan: `Comment` resolves and returns DOM focus without writing selection; `FloatingToolbar` gates on its own editor's focus context; component and exact browser tests own the behavior. No Plite substrate, public API, docs, changeset, or generated registry edit applies.

Timeline:

- 2026-08-27: user reports the resolve-specific floating-toolbar failure and explicitly invokes Regression.
- 2026-08-27: active goal and atomic resolve-recovery case created; pre-edit source/test fingerprints recorded.
- 2026-08-27: pre-edit existing comment corpus passed 2/2; new resolve case reproduced missing toolbar and inactive focus.
- 2026-08-27: state probe proved DOM/local focus and global `EventEditorStore.focus` diverged; Best API and Plate registry plan accepted the scoped-focus hard cut.
- 2026-08-27: focused case passed 1/1, toolbar component passed 3/3, full browser corpus passed 3/3, and www TypeScript passed.
- 2026-08-27: fresh installed Chrome 151 receipt passed 15/15 with zero retries; P1 review found no in-scope editor issue.

Decisions and tradeoffs:

- Treat this as a new resolve-specific case, not attempt 4 of the abandoned-draft case: prior proof never claimed submitted-comment resolution recovery.
- Do not add comment-aware exceptions to the generic floating toolbar without proving the generic owner is wrong.

Review fixes:

- No in-scope review fix. The P1 helper explicitly judged the editor lifecycle packet consistent with its regression coverage.
- The sole P1 concerns an unrelated untracked `github-issue-reporter` upload script already present in the dirty checkout; it was classified out of scope and left untouched.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Let Radix default `onCloseAutoFocus` run for submitted comments | 1 | Inspect anchor ownership; avoid claiming the unchanged red as a fix | Virtual anchor has no focusable trigger; reverted and moved focus restoration to the resolve action owner. |
| Track blocked selection identity in the generic toolbar | 1 | Instrument every open condition instead of changing another guard | Probe showed selection/range guards were not the final blocker; stale global focus was. Speculative change was reverted. |

Verification evidence:

- Red: resolve removed its mark and closed the popover, but main editor focus/next toolbar oracle failed.
- Focused green: resolve recovery browser case 1/1.
- Component: `bun test apps/www/src/registry/components/editor/floating-toolbar.spec.tsx` -> 3/3.
- Affected corpus: `comment.spec.ts` -> 3/3; exact Chrome repeat -> 15/15, retry 0.
- TypeScript: `pnpm --filter www exec tsc --noEmit --pretty false` -> exit 0.
- Changelog: generator check 82/82; generator tests 18/18.
- Completed receipt: `sha256:0fc5f5de20133527290648b5acd45ceaaf85640cfe067b5619691d64538013ac`.
- P1: no accepted in-scope finding; unrelated issue-reporter finding left untouched.

Final handoff:

- executable cases: `comment: resolving a submitted comment preserves floating toolbar recovery` plus prior anchor and abandoned-draft cases.
- cumulative reporter evidence, phase-specific oracles, and forbidden states: all setup/after-action/follow-up rows pass on exact Chrome; earlier live-caret case remains green.
- failed-fix invalidation and automatic repair: N/A; no resolve-specific candidate was claimed before exact green.
- proof receipts and affected-corpus replay: completed receipt `sha256:0fc5f5de...`; eight-input digest `sha256:0f3ef5...`; final corpus 15/15.
- started-gate failure closure: origin, fixture-owner, text-oracle, focus-owner, and review-freshness failures are resolved above.
- changed files: `comment.tsx`, `floating-toolbar.tsx`, `floating-toolbar.spec.tsx`, `comment.spec.ts`, changelog MDX/generated JSON/indexes, and this transient plan. `block-discussion.tsx` remains unchanged by this case.
- design decisions: resolve restores DOM focus without selecting or moving text; toolbar trusts its scoped editor focus, not the stale global event-editor ID.
- tests and proof: focused 1/1; component 3/3; corpus 3/3; exact Chrome 15/15; www tsc; changelog 82/82 and 18/18.
- source/generated sync: changelog regenerated from MDX; no agent source changed, so skill sync is N/A.
- P1 and agent-native findings: no in-scope P1; unrelated issue-reporter P1 rejected out of scope; agent-native N/A.
- residual risks and next owner: no known local behavior risk; user owns any later commit/push/public issue action.
- local completion status and integration/public-status boundary: completed locally on dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb; uncommitted/unpushed; not integrated, shipped, released, or publicly completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | completed local closeout |
| Where am I going? | user handoff; no git/public mutation |
| What is the goal? | close selected regressions through executable tests and fresh proof |
| What have I learned? | DOM/local editor focus and global EventEditor focus can diverge after a nested comment editor closes; local UI must trust its scoped focus owner. |
| What have I done? | Reproduced red, added the exact case, fixed resolve/local focus ownership, replayed the corpus, captured exact Chrome proof, and completed P1 scope review. |

Open risks:

- No known risk in the selected local behavior; earlier abandoned-draft live-caret behavior remains green in the exact corpus.
- Integration, shipment, and public issue status remain unverified because the user explicitly prohibited commit and push.
