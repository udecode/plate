# Fix first comment popover position

Objective:
Fix Plate Beta #5112 first-comment composer positioning; done when exact repro
is green in 5 browser runs, focused tests and P1 autoreview pass; no commit,
push, or public mutation.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5112-fix-first-comment-popover-position.md

Template:
docs/plans/templates/maintainer.md

Primary template:
docs/plans/templates/maintainer.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Maintainer source:
- mode: exact public issue, local-only repair
- repo: `udecode/plate`
- queue slice: issue [#5112](https://github.com/udecode/plate/issues/5112) only
- prompt / item link: user asked to fix #5112 after filing it from the supplied screenshot
- acceptance criteria: first-comment composer stays anchored beside the selected text; never renders at viewport origin; existing-comment positioning stays correct
- standing orders: read before source mutation
- heartbeat trigger: N/A: user selected one exact issue; this is not heartbeat or broad queue work
- queue snapshot command: N/A: exact selected issue does not require a broad queue refresh
- queue artifact: N/A: no queue ranking is needed
- run artifact: N/A unless later evidence would otherwise be rediscovered

Reporter-valid behavior case:
- applies: yes
- case ID: `issue-5112:first-comment-popover-viewport-origin`
- source refs: issue #5112 and native screenshot attachment `fd17def9-699b-44e2-ae4f-8701df17cbc9`
- exact route / surface: Plate Playground homepage `/` on the current `next`/Beta surface; local owner is `apps/www`
- setup / target / action / expected end state: select previously uncommented Playground text, click Comment, and verify the focused `Reply...` composer opens beside that selected-text anchor instead of at viewport `(0, 0)`
- browser / OS-device / branch-channel / observed bad ref: browser and OS `NOT_ENOUGH_INFO`; Plate `next`/Beta; exact bad commit `NOT_ENOUGH_INFO`
- claim fields: popup geometry/paint, visible anchor relationship, focused reply input, rendered DOM, runtime console errors
- exact red proof: browser test fails on baseline at `apps/www/tests/browser/comment.spec.ts:73` with `popoverBox.x = 0` (expected `> 12`)
- final replay ref and production/test/fixture/harness fingerprints: `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb`; production `b4b09a42838d07d5ec708e771d2ab63ee9b34f1859f882db875f09d5accb4730`; browser test/harness `db36a6229947d5ef942d566d5fa647c590e11cd72d02cbd2eab5f5f157cf2993`; fixture N/A
- retry-free warm result and required Chrome/device spot check: Playwright Chromium 5/5 and in-app Browser 5/5; reported browser/device is `NOT_ENOUGH_INFO`, so exact Chrome/device claim is not made
- current status: `candidate-local` (`needs-repro`, `candidate-local`, `fixed-pushed-ref`, or
  N/A with reason)

First checkpoint:
- Copy every explicit prompt requirement into this plan as checkable rows:
  repo, queue slice, non-goals, authority boundaries, proof requirements,
  final handoff sections, and success criteria.
- Do not inspect broad queues or mutate anything until this is complete or
  explicitly marked N/A with reason.

Completion threshold:
- The reporter-valid case fails before the fix and passes 5/5 retry-free warm browser runs after the fix from a fresh local app process and fresh page.
- Focused owning tests pass, relevant type/lint proof passes, and P1 autoreview has no accepted actionable P1 finding.
- The final state is reported as `candidate-local`; no commit, push, PR, or GitHub issue mutation occurs.
- Closure is legal only when VISION fit, live-state read, duplicate/claim
  guard, intake completeness, owner route, proof surface, authority boundary,
  queue snapshot freshness, candidate matrix, rejected candidates, selected
  item, changed list, needs-attention rows, next heartbeat recommendation, run
  artifact decision, final handoff, and `check-complete` are closed with
  evidence.

Verification surface:
- Live GitHub readback of issue #5112 and duplicate/claim check.
- Focused component or browser regression test at the durable `apps/www` registry owner.
- Browser replay on the local Playground homepage with geometry, focus, and console checks.
- P1 `autoreview --max-priority P1` on the current local diff.

Constraints:
- Do not commit or push.
- Do not update, comment on, label, close, or otherwise mutate GitHub issue #5112.
- No GitHub comments, labels, closes, PRs, reviews, pushes, merges, releases,
  or public mutations unless explicitly authorized.
- Live GitHub state outranks archives and generated ledgers.
- VISION fit outranks queue pressure.
- Route to narrower owners for execution.
- Do not use internal Plite automation as a dodge when a public queue blocker
  remains.
- Maintainer Codex runs are local checkout runs. Do not assume hosted/API
  workers, crabbox, or private agent state can recover missing issue/PR context.
- Standing orders authorize one local heartbeat activation, not a daemon. Pick
  at most one autonomous item, then verify and report.

Boundaries:
- Source of truth: live issue #5112, reporter screenshot, current registry source, exact local browser reproduction
- Allowed edit scope: `apps/www` comment/discussion owner and focused tests, this goal plan, generated barrel only if required
- Public mutation authority: none for this repair turn
- Security scope: N/A: ordinary UI positioning regression
- Browser surface: Plate Playground homepage `/`; prefer Browser for normal app QA
- Non-goals: no package/public API change, no broad comment redesign, no commit, no push, no PR, no issue comment

Output budget strategy:
- Read exact owner/test files and capped `rg` matches only; exclude generated registry JSON, `templates/**`, `.next`, `node_modules`, `.turbo`, logs, and broad queue output unless a named failure requires them.

Blocked condition:
- Stop only if the exact local route cannot reproduce from a fresh process after three distinct setup attempts, or Browser cannot inspect the required geometry/focus after its documented recovery path.

Maintainer state:
- current_phase: handoff
- current_phase_status: completed
- selected_item: issue #5112
- selected_owner: `patch` for the local `apps/www` behavior repair
- goal_status: active

Current verdict:
- verdict: `candidate-local`
- confidence: high for the scoped local Chromium/browser claim; no pushed-ref or reporter-environment claim
- next owner: user-selected integration workflow if commit/push is later desired
- reason: exact baseline geometry failed at `x = 0`; final local code passed two independent 5/5 browser lanes and P1 autoreview

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact issue, expected/actual behavior, local-only scope, no commit, no push, and no public mutation are recorded above |
| Active goal checked or created | yes | Active goal created for this plan |
| Root VISION.md read | yes | Bug fixes/stability and real-browser proof are explicit priorities; Plate owns opinionated registry UX |
| Relevant docs/vision detail read | yes | `docs/vision/common.md` and `docs/vision/plate.md` read; registry component is the correct product owner unless reproduction proves a substrate gap |
| Repo resolved | yes | `udecode/plate` |
| Queue slice bounded | yes | Issue #5112 only |
| Queue snapshot plan recorded | no | N/A: exact issue mode, not heartbeat/broad queue |
| Live GitHub read plan recorded | yes | Read current issue #5112 before reproduction |
| Archive/gitcrawl freshness plan recorded | no | N/A: live issue search is sufficient for this one-item duplicate check |
| Public mutation boundary recorded | yes | No public mutation; user explicitly prohibited commit/push and requested only a local fix |
| Public intake docs read when applicable | yes | `CONTRIBUTING.md` and `.github/ISSUE_TEMPLATE/bug.yml` read; issue supplies summary, steps, expected/actual, screenshot, impact, and explicit unknowns |
| Local Codex model recorded | yes | Current shared checkout; no hosted worker or worktree assumption |
| Standing orders read | yes | Local source/test repair is allowed; commit, push, and GitHub mutation remain gated and are explicitly excluded |
| Heartbeat runbook read | no | N/A: exact selected issue, not heartbeat/queue mode |
| Output budget strategy recorded | yes | Exact-owner reads with explicit generated/build exclusions |
| Reporter-valid case contract recorded | yes | `issue-5112:first-comment-popover-viewport-origin` fields and final local evidence are complete above |
| Browser pack selected | yes | `docs/plans/templates/packs/browser.md` materialized |
| Browser route / app surface identified | yes | `apps/www` homepage `/` Playground editor |
| Browser tool decision recorded | yes | Use Browser for ordinary route/DOM/geometry/focus verification |
| Console/network caveat policy recorded | yes | Check console errors; network is out of scope unless route loading or assets affect the case |
| Observable browser case captured | yes | Exact route/setup/target/action/outcome and claim fields recorded above |

Work Checklist:
- [x] First checkpoint complete.
- [x] Mode and repo are concrete.
- [x] Root VISION.md and relevant detail file are read.
- [x] Standing orders are read and the current invocation is classified against
      allowed actions, approval gates, and escalation rules.
- [x] Heartbeat runbook is read for `heartbeat`, `queue`, broad maintenance, or
      future scheduled-local-Codex invocations.
- [x] Queue snapshot command is run for heartbeat/broad queue work, or exact
      `gh` auth/network blocker is recorded.
- [x] `docs/maintainer/queue.md` freshness is recorded before selecting an
      item, or stale-use caveat is explicit.
- [x] Live GitHub state is read or exact auth blocker recorded.
- [x] Public issue/PR/security intake is complete enough for a local Codex run,
      or the missing public evidence is named.
- [x] gitcrawl/archive data is used only for discovery or marked N/A.
- [x] Candidate matrix records every item considered.
- [x] Candidate matrix includes a compact score or rank reason for every
      considered item.
- [x] Rejected/skipped candidates are recorded with concrete reasons.
- [x] Duplicate/claim guard is run for selected item or marked N/A.
- [x] VISION fit is recorded for selected item.
- [x] Selected item is at most one autonomous item unless the user explicitly
      requested a broader batch.
- [x] Owner route is selected with reason.
- [x] Proof path or proof blocker is recorded.
- [x] Public behavior proof uses the exact reporter case. Proxy routes, easier
      targets, partial end states, and temporary/unshipped scaffolding stay
      `needs-repro` and cannot support fixed/completed wording.
- [x] The final replay records every applicable model/DOM/selection/caret/focus/
      popup/toolbar/paint/error/follow-up-input field after the interaction,
      the final ref and fingerprints, and 5/5 retry-free warm runs for native
      selection/paint, focus, DnD, compositor, or React DOM lifecycle cases.
- [x] Local-only or unpushed work is classified `candidate-local`.
      Fixed/completed wording and a `completed` label require replay on the
      final pushed ref.
- [x] Fresh reporter contradictions invalidate earlier green proof and move the
      item to `needs-repro`; residual symptoms are split or explicitly kept open.
- [x] Public mutation authority is recorded as none, explicit, or blocked.
- [x] Execution owner is invoked, or a decision-ready brief is produced.
- [x] Changed list is recorded.
- [x] Needs-user-attention items are ranked.
- [x] Next heartbeat recommendation is recorded.
- [x] Run artifact is written under `docs/maintainer/runs/*` when it prevents
      duplicate future work, or N/A reason is recorded.
- [x] Agent-native/P1 autoreview decision is recorded when skills, prompts,
      commands, or local workflow files change.
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
| Named verification threshold | yes | Prove the completion threshold above | Baseline red; focused test green; Playwright 5/5; Browser 5/5; P1 autoreview clean |
| VISION fit | yes | Read root and detail doctrine, then classify fit | Root/common/Plate doctrine read; registry UI owns this product positioning behavior |
| Standing-order fit | yes | Confirm the selected action is allowed, gated, or escalated by standing orders | Local patch/test/changelog allowed; no commit, push, or public mutation performed |
| Live GitHub truth | yes | Read issue/PR/advisory current state or record auth blocker | Final readback: #5112 open, no assignee, no comments, `bug` label |
| Queue snapshot | no | Run `.agents/rules/maintainer/scripts/queue-snapshot.mjs` or record exact blocker | N/A: exact user-selected issue, not queue/heartbeat mode |
| Duplicate/claim guard | yes | Check related PRs/branches/assignees/recent claims for selected item | No exact duplicate or active PR; historical PR #4073 has a different trigger |
| Owner route | yes | Name selected owner skill/package/docs surface and why | `maintainer` coordinated `patch`; durable owner is registry `block-discussion` |
| Proof path | yes | Run proof, name command, or record proof blocker | Exact browser test, focused unit test, Browser replay, lint, changelog check, P1 review |
| Reporter-valid exact replay | yes | For public behavior reports, prove the exact case and all applicable final-state claim fields; otherwise N/A with reason | `/` Playground, real drag selection, fixed comment toolbar, popup geometry/focus/placeholder/errors checked |
| Final-ref truth gate | no | From a fresh process in a clean checkout or immutable CI artifact, record the final pushed ref, zero tracked/untracked issue-owned runtime-input differences, matching file fingerprints, and the retry-free warm ledger in the exact reported browser/device; local-only or unpushed packets remain candidates | N/A: user prohibited commit/push; status remains `candidate-local`, never fixed/completed |
| Reporter contradiction check | yes | Re-read current comments; invalidate prior proof and stale completed status when the reporter still reproduces, or record no contradiction | Final live readback has zero comments and no contradiction |
| Public mutation boundary | yes | Confirm none, or record explicit user authority and result | None; no GitHub mutation after the repair request |
| Public intake completeness | yes | Read relevant issue/PR/security template and classify whether the item is agent-ready | Bug template and CONTRIBUTING read; #5112 was agent-ready |
| Rejected candidates | yes | Record skipped/rejected candidates with concrete reasons | None; exact user-selected issue only |
| Next heartbeat | no | Name the next useful heartbeat slice or say none safe | N/A: no heartbeat requested; next action is user-owned integration if desired |
| Run artifact | no | Write or explicitly skip `docs/maintainer/runs/*` | N/A: active issue-backed goal plan holds all reusable run evidence |
| Agent-native review | no | Run/review when agent workflow files changed, else N/A | N/A: no skill, prompt, command, or workflow source changed |
| P1 autoreview | yes | Run with `--max-priority P1` for non-trivial implementation diffs; P2/P3 are opt-in only, else N/A | `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P1` exited 0 with no actionable findings |
| Final handoff contract | yes | Report repo/mode/matrix/owner/proof/mutations/changed/attention/next heartbeat | Recorded in Heartbeat handoff and final response contract |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5112-fix-first-comment-popover-position.md` | Passed after final ledger closure |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | In-app Browser fresh session passed 5/5 with exact geometry and focus checks |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Browser error count 0 in all five runs; route loaded normally; network detail otherwise out of scope |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Final in-app Browser screenshot emitted; it visibly shows the composer adjacent to selected text |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Baseline `x = 0`; final `x = 209`, horizontal center delta `0.484375`, vertical gap `4.390625`, focused reply editor, placeholder present |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb`; hashes recorded in reporter case above |
| Clean final runtime | no | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: fresh local source process proves only `candidate-local`; no pushed ref exists by user request |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Playwright Chromium 5/5 and in-app Browser 5/5; reporter browser/device is unknown, so no exact-device claim |

Candidate matrix:
| Rank | Item | Source | Live state | Category | VISION fit | Intake | Duplicate/claim guard | Owner | Proof | Authority | Decision |
|------|------|--------|------------|----------|------------|--------|-----------------------|-------|-------|-----------|----------|
| 1 | #5112 first-comment composer opens at viewport top-left | user-selected public issue | open; no assignee; no comments; updated 2026-08-26 | Plate registry UI regression | yes: current Plate priority is bug fixes/stability and registry confidence | agent-ready; exact browser/OS/build remain explicitly unknown | no exact duplicate or active PR found; PR #4073 is older link-toolbar behavior with a different trigger | `maintainer` -> `patch` | fresh local Playground replay plus focused regression test | local edits only; no public mutation | route: only selected item |

Rejected / skipped candidates:
| Item | Reason | Next possible owner |
|------|--------|---------------------|
| none | N/A: the user selected one exact issue; no other candidate was considered | N/A |

Heartbeat handoff:
- selected item: issue #5112
- selected owner: `patch`
- selected proof path: exact local browser replay, focused regression test, P1 autoreview
- queue snapshot: N/A: exact issue mode
- run artifact: N/A unless later evidence would prevent rediscovery
- public mutations: none
- changed files: `block-discussion.tsx`; `comment.spec.ts`; registry changelog MDX/JSON/index/components; this goal plan
- needs user attention: none; full `www` typecheck has unrelated pre-existing AI/markdown/source errors and no requested integration action remains
- next heartbeat recommendation: N/A for this user-selected local repair

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and routing | complete | Live issue/template/doctrine read; duplicate and claim guard passed | N/A |
| Red reproduction | complete | Baseline browser test failed at `popoverBox.x = 0` | N/A |
| Durable repair | complete | Registry virtual anchor resolves live geometry at measurement time | N/A |
| Verification and review | complete | Focused checks, Playwright 5/5, Browser 5/5, fingerprints, P1 autoreview clean | Final handoff |

Findings:
- Public issue intake identifies one browser-visible popover geometry regression; durable owner and root cause still require reproduction.
- Live issue #5112 is open with no assignee or comments. Search found no exact duplicate or active claiming PR; historical PR #4073 concerns link-toolbar focus and is not the same case.
- Vision fit is yes: this is a current Plate registry UX regression, not evidence of a Plite substrate defect.
- Root cause: the first draft comment exists in the model before its live leaf DOM can be resolved during render. Radix receives no measurable anchor and places the composer wrapper at viewport `x = 0`.
- Durable owner: registry `block-discussion` supplies a virtual anchor that resolves the live node rect when Radix measures it, with the current block rect as a non-origin fallback. No Plite API or package change is needed.

Timeline:
- 2026-08-26: user requested local fix and explicitly prohibited commit and push; active goal and exact reporter-valid case created.
- 2026-08-26: read root/common/Plate doctrine, standing orders, public intake docs, and live issue state; duplicate/claim guard passed.
- 2026-08-26: exact browser test reproduced the baseline at `popoverBox.x = 0`; restored virtual-anchor implementation passed the same test.
- 2026-08-26: generated and verified registry changelog entry `2026-08-26-fix-comment-popover-position`; package changeset is N/A because all package experiments were removed.

Decisions and tradeoffs:
- Keep public status unchanged -> user requested only local repair and no push/commit -> final wording must remain `candidate-local`.
- Use a Radix virtual anchor instead of effect/ref state -> measurement happens after the DOM commit without another editor subtree render -> avoids both viewport-origin placement and DOM reconciliation conflicts.
- Re-read the live node by saved path inside `getBoundingClientRect` -> snapshot entries are valid lookup evidence but are not guaranteed DOM bridge inputs -> keeps Plite contracts unchanged.

Review fixes:
- P1 autoreview reported no accepted/actionable findings; no review-triggered code change.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm --filter www dev -- --port 3100` passed `--port` as a directory | 1 | Use `PORT=3100` | Server command corrected |
| Existing `apps/www` dev server held the Next lock | 1 | Use it for initial red, then stop the exact process and start a fresh source-mode server | Fresh `PLATE_WWW_DEV_SOURCE=1` server running on 3100 |
| Initial AI paragraph target triggered an unrelated list correction cycle | 1 | Use the plain introductory paragraph from the same Playground route | Exact popover case reproduced without runtime error |
| Test used native `placeholder` semantics for a Plite contenteditable | 1 | Inspect rendered DOM and target the reply editor plus `data-plite-placeholder` | False visibility failure removed; baseline now fails on geometry |
| Effect/ref anchor handoffs added an extra editor subtree render | 2 | Let Radix measure a virtual anchor that resolves live DOM on demand | Removed; virtual anchor passes the focused browser test |

Verification evidence:
- external-source: live GitHub issue #5112 -> open, no assignee/comments, screenshot evidence present.
- external-source: GitHub issue/PR searches -> no exact duplicate or active claiming PR.
- source-audit: `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, `docs/maintainer/standing-orders.md`, `CONTRIBUTING.md`, `.github/ISSUE_TEMPLATE/bug.yml` -> local registry repair is in scope; public mutation is not.
- browser-test red: `PLAYWRIGHT_BASE_URL=http://localhost:3100 pnpm --filter www test:www-browser:chromium tests/browser/comment.spec.ts` -> failed at `popoverBox.x = 0` on baseline.
- browser-test green: same command -> 1 passed after virtual-anchor restoration.
- command: `pnpm test apps/www/src/registry/lib/block-discussion-index.spec.tsx` -> 11 passed.
- command: `pnpm exec ultracite check apps/www/src/registry/components/editor/block-discussion.tsx apps/www/tests/browser/comment.spec.ts` -> pass.
- artifact: registry changelog `--write` and `--check` -> 82/82 events valid.
- command: `PLAYWRIGHT_BASE_URL=http://localhost:3100 pnpm --filter www test:www-browser:chromium tests/browser/comment.spec.ts --repeat-each=5` -> 5/5 passed from a fresh source-mode server.
- browser: in-app Browser exact replay -> 5/5; every run `popover x=209`, `y=563`, horizontal center delta `0.484375`, vertical gap `4.390625`, reply focused, placeholder `Reply...`, zero console errors.
- review: `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P1` -> clean, no accepted/actionable findings.
- command caveat: `pnpm --filter www exec tsc --noEmit -p tsconfig.json` -> failed only in existing `src/app/api/ai/**` and `src/lib/source.ts` API/source drift; no issue-owned file appeared in diagnostics.
- fingerprints: production `b4b09a42838d07d5ec708e771d2ab63ee9b34f1859f882db875f09d5accb4730`; test `db36a6229947d5ef942d566d5fa647c590e11cd72d02cbd2eab5f5f157cf2993`; changelog source `31547530658cd03ea95c0e804ec0931dc44f372f60f3e08f0d8e857ac3aa2148`; generated event `13b22ce89c89d4c70d5813bc1eeda0bc8b7fabe8e1c26ebd6672017300427249`.
- command: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5112-fix-first-comment-popover-position.md` -> complete.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Handoff ledger complete | Run goal-plan checker, stop local server, report candidate-local | Local candidate for #5112 with no commit/push/public mutation | Virtual measurement fixes `x = 0`; full typecheck blocker is unrelated | Exact red/green, 10 retry-free browser runs, lint/unit/changelog checks, fingerprints, P1 review complete |

Open risks:
- Exact reporter browser/OS and bad Beta commit remain unknown; proof is scoped to local Chromium/in-app Browser.
- Full `www` typecheck remains red on unrelated existing AI/markdown/source drift; focused issue-owned checks are green.
- No pushed ref exists by explicit user request, so #5112 is not claimed fixed/completed publicly.
