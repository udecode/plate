# ship native selection autoscroll fix

Objective:
Ship Plate #5113; done when the authorized fix is pushed to `origin/next`, the exact pushed ref passes Chrome 5/5, a verified issue comment is posted, and #5113 is closed.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5113-ship-native-selection-autoscroll-fix.md

Template:
docs/plans/templates/maintainer.md

Primary template:
docs/plans/templates/maintainer.md

Applied packs:
- none

Maintainer source:
- mode: exact public issue ship/close
- repo: `udecode/plate`
- queue slice: issue #5113 only; no broad queue scan
- prompt / item link: user-selected [#5113](https://github.com/udecode/plate/issues/5113)
- acceptance criteria: commit the authorized current repair, push to `origin/next`, prove remote SHA equality and clean matching issue-owned bytes, run fresh exact Chrome 5/5 on the pushed ref, post one concise evidence comment, close as completed, and re-read live state
- standing orders: exact issue mutation is explicitly authorized; fixed/completed wording only after pushed-ref replay
- heartbeat trigger: N/A: user-selected issue workflow, not heartbeat/queue mode
- queue snapshot command: N/A: exact issue selected; live issue/related PR/remote refs are the queue truth
- queue artifact: N/A: no broad queue snapshot
- run artifact: N/A planned: ticket goal plan is the durable run ledger; add no duplicate maintainer note unless new queue state emerges

Reporter-valid behavior case:
- applies: yes
- case ID: `outside-editor:selection-autoscroll-continues`
- source refs: #5113 issue/video; reporter corrections that the button stayed held, scroll stalled/varied, and 18:04:46 retest never visibly scrolled; accepted browser-native ownership
- exact route / surface: homepage `/`, first `[data-plite-editor="true"][contenteditable="true"]`, actual ancestor `.overflow-y-auto`
- setup / target / action / expected end state: start native text selection, keep primary button held, leave the lower and upper editor/browser boundaries in separate gestures; actual origin owner and stable content anchor move both directions, native/model selection follow, focus remains, release/return stops, next click/key works
- browser / OS-device / branch-channel / observed bad ref: macOS, exact Google Chrome 151.0.7922.174, branch `next`; pre-fix Plate owner remained `scrollTop=0` while same-page native control scrolled
- claim fields: actual scroll-owner offset/content geometry, native selection, model selection, pointer buttons/events, focus, release/return cleanup, runtime errors, follow-up input
- exact red proof: completed attempt5 plan records same-page native control pass and Plate owner zero before fix
- final replay ref and production/test/fixture/harness fingerprints: local receipt `sha256:66c1f18c...` on dirty base `219d1a...`; final pushed SHA and matching fingerprints required after commit/push
- retry-free warm result and required Chrome/device spot check: candidate exact Chrome 5/5 plus manual Chrome down/up; repeat 5/5 after pushed-ref clean replay
- current status: `candidate-local`

First checkpoint:
- Copy every explicit prompt requirement into this plan as checkable rows:
  repo, queue slice, non-goals, authority boundaries, proof requirements,
  final handoff sections, and success criteria.
- Do not inspect broad queues or mutate anything until this is complete or
  explicitly marked N/A with reason.

Completion threshold:
- One issue-owned commit exists on `origin/next`; local HEAD, `origin/next`, and `git ls-remote` agree.
- A fresh process from the pushed ref with zero issue-owned tracked/untracked differences passes the exact Google Chrome reporter case 5/5, zero retries, with matching production/test/harness fingerprints.
- One comment states the root cause, pushed SHA, exact Chrome evidence, and integration boundary; live #5113 then reads `CLOSED` with completed reason. No release/npm claim.
- Closure is legal only when VISION fit, live-state read, duplicate/claim
  guard, intake completeness, owner route, proof surface, authority boundary,
  queue snapshot freshness, candidate matrix, rejected candidates, selected
  item, changed list, needs-attention rows, next heartbeat recommendation, run
  artifact decision, final handoff, and `check-complete` are closed with
  evidence.

Verification surface:
- `gh issue view 5113 --repo udecode/plate` before comment and immediately before/after close
- current diff/cached diff review, `git diff --check`, commit and `git push origin HEAD:next`
- local/remote SHA equality through `git rev-parse`, `git ls-remote`, and `git fetch origin next`
- clean pushed-ref issue-owned fingerprint comparison and fresh localhost exact Google Chrome E2E 5/5
- final issue comment/close REST or `gh` readback

Constraints:
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
- Source of truth: current issue-owned checkout diff, completed attempt5 regression plan/receipt, live GitHub #5113, exact pushed SHA, fresh exact Chrome replay
- Allowed edit scope: no new product changes unless pushed-ref replay exposes a real regression; commit only issue-owned #5113 repair/workflow/proof artifacts and preserve unrelated state
- Public mutation authority: explicit user authority for commit, necessary push to `next`, one issue comment, and closing #5113
- Security scope: N/A: public editor behavior bug, no security signal
- Browser surface: fresh local homepage from exact pushed ref, Google Chrome 151, five serial runs, retries 0
- Non-goals: no PR, merge, release, publish, npm/latest claim, unrelated issue/label/comment, or cleanup outside #5113

Output budget strategy:
- Read exact issue, related PR/branch refs, current diff, and named proof files only. Cap `gh`, diff, and test logs; exclude builds/generated trees except named generated Regression mirrors.

Blocked condition:
- Block only if GitHub auth/branch protection prevents the authorized push/comment/close, remote `next` changed incompatibly, or the exact pushed-ref Chrome replay fails after safe host repair. Never close on a local-only candidate.

Maintainer state:
- current_phase: commit and rebase onto current origin/next
- current_phase_status: in_progress
- selected_item: udecode/plate#5113
- selected_owner: maintainer shipping the completed Regression/Patch packet
- goal_status: active

Current verdict:
- verdict: candidate-local; live/diff/claim guard passed
- confidence: high local evidence, zero pushed-ref authority yet
- next owner: maintainer commit, rebase, push, final-ref replay
- reason: issue is OPEN with no comments/assignee/related PR; origin/next is two commits ahead and must be integrated before push

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact issue, commit/push necessity, comment/close, pushed-ref 5/5, no release claim, and final readback recorded above. |
| Active goal checked or created | yes | Prior Regression goal was complete; dedicated #5113 shipping goal created. |
| Root VISION.md read | yes | Native behavior, live proof, Maintainer ownership, and issue closure evidence law read. |
| Relevant docs/vision detail read | yes | `docs/vision/common.md` and `docs/vision/plite.md` read; native selection/browser proof and public closure fit. |
| Repo resolved | yes | `udecode/plate`. |
| Queue slice bounded | yes | #5113 only. |
| Queue snapshot plan recorded | no | N/A: exact user-selected issue; live item/refs replace broad queue snapshot. |
| Live GitHub read plan recorded | yes | Read issue before mutation, before close, and after close. |
| Archive/gitcrawl freshness plan recorded | no | N/A: live exact issue plus related PR/branch search is sufficient; no broad duplicate corpus requested. |
| Public mutation boundary recorded | yes | Commit, necessary push to `next`, one comment, and close explicitly authorized; no PR/release/other mutation. |
| Public intake docs read when applicable | yes | `.agents/AGENTS.md`, `CONTRIBUTING.md`, and bug issue template read; issue contains reproducible route/video/acceptance and explicit unknowns. |
| Local Codex model recorded | yes | Local checkout execution; no hosted worker/private state assumed. |
| Standing orders read | yes | Exact commit/push/comment/close are approval gates now explicitly authorized. |
| Heartbeat runbook read | no | N/A: exact issue workflow, not heartbeat/broad queue. |
| Output budget strategy recorded | yes | Exact issue/diff/ref/proof commands only; logs capped. |
| Reporter-valid case contract recorded | yes | Full case fields above retain every reporter correction and exact Chrome final-ref requirement. |

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
- [ ] Public behavior proof uses the exact reporter case. Proxy routes, easier
      targets, partial end states, and temporary/unshipped scaffolding stay
      `needs-repro` and cannot support fixed/completed wording.
- [ ] The final replay records every applicable model/DOM/selection/caret/focus/
      popup/toolbar/paint/error/follow-up-input field after the interaction,
      the final ref and fingerprints, and 5/5 retry-free warm runs for native
      selection/paint, focus, DnD, compositor, or React DOM lifecycle cases.
- [ ] Local-only or unpushed work is classified `candidate-local`.
      Fixed/completed wording and a `completed` label require replay on the
      final pushed ref.
- [ ] Fresh reporter contradictions invalidate earlier green proof and move the
      item to `needs-repro`; residual symptoms are split or explicitly kept open.
- [ ] Public mutation authority is recorded as none, explicit, or blocked.
- [ ] Execution owner is invoked, or a decision-ready brief is produced.
- [ ] Changed list is recorded.
- [ ] Needs-user-attention items are ranked.
- [ ] Next heartbeat recommendation is recorded.
- [ ] Run artifact is written under `docs/maintainer/runs/*` when it prevents
      duplicate future work, or N/A reason is recorded.
- [ ] Agent-native/P1 autoreview decision is recorded when skills, prompts,
      commands, or local workflow files change.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Prove the completion threshold above | pending |
| VISION fit | pending | Read root and detail doctrine, then classify fit | pending |
| Standing-order fit | pending | Confirm the selected action is allowed, gated, or escalated by standing orders | pending |
| Live GitHub truth | pending | Read issue/PR/advisory current state or record auth blocker | pending |
| Queue snapshot | pending | Run `.agents/rules/maintainer/scripts/queue-snapshot.mjs` or record exact blocker | pending |
| Duplicate/claim guard | pending | Check related PRs/branches/assignees/recent claims for selected item | pending |
| Owner route | pending | Name selected owner skill/package/docs surface and why | pending |
| Proof path | pending | Run proof, name command, or record proof blocker | pending |
| Reporter-valid exact replay | pending | For public behavior reports, prove the exact case and all applicable final-state claim fields; otherwise N/A with reason | pending |
| Final-ref truth gate | pending | From a fresh process in a clean checkout or immutable CI artifact, record the final pushed ref, zero tracked/untracked issue-owned runtime-input differences, matching file fingerprints, and the retry-free warm ledger in the exact reported browser/device; local-only or unpushed packets remain candidates | pending |
| Reporter contradiction check | pending | Re-read current comments; invalidate prior proof and stale completed status when the reporter still reproduces, or record no contradiction | pending |
| Public mutation boundary | pending | Confirm none, or record explicit user authority and result | pending |
| Public intake completeness | pending | Read relevant issue/PR/security template and classify whether the item is agent-ready | pending |
| Rejected candidates | pending | Record skipped/rejected candidates with concrete reasons | pending |
| Next heartbeat | pending | Name the next useful heartbeat slice or say none safe | pending |
| Run artifact | pending | Write or explicitly skip `docs/maintainer/runs/*` | pending |
| Agent-native review | pending | Run/review when agent workflow files changed, else N/A | pending |
| P1 autoreview | pending | Run with `--max-priority P1` for non-trivial implementation diffs; P2/P3 are opt-in only, else N/A | pending |
| Final handoff contract | pending | Report repo/mode/matrix/owner/proof/mutations/changed/attention/next heartbeat | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5113-ship-native-selection-autoscroll-fix.md` | pending |

Candidate matrix:
| Rank | Item | Source | Live state | Category | VISION fit | Intake | Duplicate/claim guard | Owner | Proof | Authority | Decision |
|------|------|--------|------------|----------|------------|--------|-----------------------|-------|-------|-----------|----------|
| 1 | udecode/plate#5113 | user-selected public issue and completed Regression packet | OPEN; `bug`; no comments/assignees; updated 2026-08-26 | Plite native selection regression | yes: native/browser path and exact proof doctrine | reporter-complete with video/follow-ups/acceptance; unknown versions explicit | pass: no matching PR, branch, assignee, comment, or open search result | Maintainer shipping Patch result | pushed-ref exact Chrome5 | explicit commit/push/comment/close | execute |

Rejected / skipped candidates:
| Item | Reason | Next possible owner |
|------|--------|---------------------|
| Broad issue/PR queue | User selected one exact issue; scanning more would widen scope | next maintainer heartbeat if requested |

Heartbeat handoff:
- selected item: udecode/plate#5113
- selected owner: Maintainer shipping completed Regression/Patch packet
- selected proof path: commit/push `next`, verify remote SHA, clean pushed-ref exact Chrome5, then live comment/close/readback
- queue snapshot: N/A exact issue
- run artifact: N/A planned; this ticket plan is sufficient
- public mutations: authorized but not yet performed
- changed files: current issue-owned diff audit next
- needs user attention: none unless branch protection/auth/final replay blocks
- next heartbeat recommendation: none for this issue after verified closure

Findings:
- Local attempt5 is evidence-complete but remains `candidate-local` until pushed-ref replay.
- Live #5113 is OPEN with `bug` only, no comments or assignee; related PR/branch/search guard is empty.
- Local `next` at `219d1a...` is two commits behind `origin/next` `083e54b...`; commit then rebase before push.
- Current dirty/untracked set is entirely #5113 product, proof, Regression workflow, changeset, and ticket plans; no unrelated file found.

Timeline:
- 2026-08-28: user authorized commit, comment, and close; dedicated Maintainer shipping goal created.
- 2026-08-28: VISION/intake/standing orders and live GitHub read passed; duplicate/claim guard empty; origin/next freshness checked.

Decisions and tradeoffs:
- Push is necessary before closure because fixed/completed wording requires exact final-ref proof; `next` integration is not an npm/latest release.

Review fixes:
- pending

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Local attempt5 receipt `sha256:66c1f18c...`, exact Chrome 151 5/5, Node22 full Plite dev gate, and semantic goal closure are inputs, not pushed-ref proof.
- `gh issue view` -> OPEN, bug, no comments/assignees; PR/search/branch guard -> empty.
- `git fetch origin next` -> remote `083e54b...`, local `219d1a...`, two remote commits require rebase.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Commit/rebase | Stage exact issue-owned diff, commit, rebase onto `083e54b...` | Ship and close #5113 truthfully | Local candidate complete; live/claim guard passed; remote replay required | Intake docs, live issue, diff and remote freshness audited |

Open risks:
- Remote `origin/next` may have advanced since local proof; fetch and reconcile before push without mixing unrelated changes.
- Commit identity changes every proved ref, so all issue-owned bytes must be replayed on the final pushed SHA before comment/close.
