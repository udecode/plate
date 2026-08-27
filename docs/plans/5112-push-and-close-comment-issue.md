# Push and close comment issue

Objective:
Commit and push the complete current checkout, prove issue #5112 on the final pushed `next` ref, then post a factual status comment and close the issue.

Goal plan:
docs/plans/5112-push-and-close-comment-issue.md

Template:
docs/plans/templates/maintainer.md

Primary template:
docs/plans/templates/maintainer.md

Applied packs:
- none

Maintainer source:
- mode: exact public issue finalization with explicit commit, push, comment, and close authority
- repo: `udecode/plate`
- queue slice: issue #5112 only
- prompt / item link: user request `提交并push 关闭issue`; https://github.com/udecode/plate/issues/5112
- acceptance criteria: commit every modified/untracked checkout file, integrate current `origin/next`, push without force, replay the full reporter-valid case on the final pushed SHA, comment with exact evidence, close #5112, and verify remote state
- standing orders: `.agents/skills/maintainer/SKILL.md`, root VISION, common/Plate detail, `.agents/AGENTS.md`, CONTRIBUTING, issue templates, PR template, and SECURITY read
- heartbeat trigger: N/A: user selected one exact issue; this is not a heartbeat or broad queue scan
- queue snapshot command: N/A: exact issue mode reads live GitHub directly
- queue artifact: N/A: no broad queue ranking or stale ledger used
- run artifact: N/A: this issue-specific plan records the finalization evidence; a second maintainer run note would duplicate it

Reporter-valid behavior case:
- applies: yes
- case ID: `issue-5112-comment-lifecycle`
- source refs: issue #5112 screenshot/body, reporter follow-ups in this task, `apps/www/tests/browser/comment.spec.ts`, and completed Regression plans under `docs/plans/5112-*`
- exact route / surface: `/` Plate Playground, registry comment/discussion/floating-toolbar UI
- setup / target / action / expected end state: select unmarked text and open the first comment; cancel a draft after placing a new caret; create/resolve a submitted comment and select text again; popover stays anchored, cancel removes only the draft mark without moving the live caret, resolve removes its mark, and the next floating toolbar opens and applies Bold
- browser / OS-device / branch-channel / observed bad ref: Google Chrome 151 on macOS, Plate `next`/Beta; original deployed bad ref unknown; current local base `d282fd8a33affb40d2b60103b6c1ce370140d2eb`
- claim fields: model mark cleanup, native DOM selection/caret, editor focus, popover open/close, toolbar geometry/paint, runtime errors, and follow-up typing/formatting
- exact red proof: completed Regression plans record anchor, cancel/caret, and resolve/toolbar reds before the local fixes
- final replay ref and production/test/fixture/harness fingerprints: pending final commit, push verification, clean matching checkout, and post-push receipt
- retry-free warm result and required Chrome/device spot check: local candidate passed three comment cases 15/15 with zero retries on exact installed Chrome; final pushed-ref 5/5 replay pending
- current status: `candidate-local`

First checkpoint:
- Copy every explicit prompt requirement into this plan as checkable rows:
  repo, queue slice, non-goals, authority boundaries, proof requirements,
  final handoff sections, and success criteria.
- Do not inspect broad queues or mutate anything until this is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Complete only after all checkout changes are committed, rebased onto current `origin/next`, pushed without force, exact Chrome passes five retry-free full-corpus runs from a clean checkout at the remote SHA with zero issue-owned differences, one concise evidence comment is published, #5112 is closed, live GitHub verifies the comment/state, and this plan passes `check-complete`.
- Closure is legal only when VISION fit, live-state read, duplicate/claim
  guard, intake completeness, owner route, proof surface, authority boundary,
  queue snapshot freshness, candidate matrix, rejected candidates, selected
  item, changed list, needs-attention rows, next heartbeat recommendation, run
  artifact decision, final handoff, and `check-complete` are closed with
  evidence.

Verification surface:
- `gh issue view 5112`, `gh pr list --search 5112`, and final `gh api` readback
- `git fetch`, ancestry/divergence checks, non-force rebase/push, and remote SHA verification
- issue-reporter self-test, Regression workflow tests, source/mirror parity, `www` typecheck, registry changelog checks, and P1 autoreview for the complete commit scope
- fresh clean-checkout PLITE-mode source host and installed-Chrome `comment.spec.ts --repeat-each=5 --workers=1`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5112-push-and-close-comment-issue.md`

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
- Source of truth: live GitHub issue state, current checkout, fetched `origin/next`, executable tests, and final pushed SHA
- Allowed edit scope: repository rules require committing every current modified/untracked file; fix verified P1 blockers in that complete commit scope and resolve rebase conflicts without changing unrelated intent
- Public mutation authority: explicit user authority for commit, push, one issue status comment, and close #5112; no PR, merge, release, labels, or other issue mutations
- Security scope: #5112 is non-security; known issue-reporter orphan-upload P1 must be fixed because the entire dirty checkout enters the commit, without remote deletion or secret output
- Browser surface: local exact installed Chrome against a clean checkout of the final pushed `next` ref
- Non-goals: no force push, PR, release, package publish, label changes, other issue closure, or broad queue scan

Output budget strategy:
- Read exact issue/commit/conflict owners, cap logs, and run focused gates before the final broad commit-scope review.

Blocked condition:
- Block only if GitHub auth/push authority fails, the giant `origin/next` integration cannot preserve the current checkout safely, a commit-scope P1 remains, final clean-checkout Chrome replay fails, or live issue state contradicts closure.

Maintainer state:
- current_phase: commit-scope repair and integration readiness
- current_phase_status: in_progress
- selected_item: udecode/plate#5112
- selected_owner: maintainer coordinating existing Regression/Patch packet plus skill-creator repair for the commit-scope reporter P1
- goal_status: active

Current verdict:
- verdict: candidate-local; not yet legal to close
- confidence: high in local #5112 behavior, pending current-next integration and final pushed-ref replay
- next owner: skill-creator repair, then maintainer integration/push/final proof
- reason: live issue is open and unclaimed; local packet is green, but current branch is one large commit behind `origin/next` and the complete checkout contains one known P1

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Commit all current checkout changes, push current `next` without force, prove final pushed SHA, comment, and close #5112. |
| Active goal checked or created | yes | Active goal requires complete-checkout commit/push, final-ref replay, status comment, and verified close. |
| Root VISION.md read | yes | Root maintainer and evidence doctrine read. |
| Relevant docs/vision detail read | yes | `docs/vision/common.md` and `docs/vision/plate.md` read. |
| Repo resolved | yes | `udecode/plate`, current branch `next`, origin verified. |
| Queue slice bounded | yes | Exact issue #5112 only. |
| Queue snapshot plan recorded | yes | N/A: exact-item mode; no broad queue selection. |
| Live GitHub read plan recorded | yes | Initial and pre-mutation/final readbacks through `gh`; issue currently OPEN with no comments/assignee. |
| Archive/gitcrawl freshness plan recorded | yes | N/A: live issue and live PR search are sufficient; no duplicate/claim candidate exists. |
| Public mutation boundary recorded | yes | User explicitly authorized commit, push, issue comment, and close only. |
| Public intake docs read when applicable | yes | CONTRIBUTING, issue templates, PR template, and SECURITY read. |
| Local Codex model recorded | yes | Local maintainer checkout; no hosted worker or private state assumed. |
| Standing orders read | yes | Maintainer standing orders and authority gates read. |
| Heartbeat runbook read | yes | N/A: exact issue, not heartbeat/queue mode. |
| Output budget strategy recorded | yes | Exact files and focused logs before complete-scope gates. |
| Reporter-valid case contract recorded | yes | Case fields above include route, actions, claim fields, browser/channel, reds, local stability, and final-ref requirements. |

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
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5112-push-and-close-comment-issue.md` | pending |

Candidate matrix:
| Rank | Item | Source | Live state | Category | VISION fit | Intake | Duplicate/claim guard | Owner | Proof | Authority | Decision |
|------|------|--------|------------|----------|------------|--------|-----------------------|-------|-------|-----------|----------|
| 1 | #5112 first comment composer / comment lifecycle | user-selected live issue | OPEN; no comments, assignee, or related PR; updated 2026-08-26 | Plate registry browser regression | yes: precise local focus/selection and source-owned registry behavior | agent-ready after cumulative reporter deltas in this task | pass: no related PR, assignee, or public claim | maintainer coordinates completed Regression/Patch packet and final-ref proof | clean final-SHA Chrome full corpus 5/5 plus exact fingerprints | explicit commit/push/comment/close | execute after complete-scope P1 repair and current-next integration |

Rejected / skipped candidates:
| Item | Reason | Next possible owner |
|------|--------|---------------------|
| Broad issue/PR queue | User selected one exact issue; scanning would add noise and no authority | next maintainer heartbeat, not this run |

Heartbeat handoff:
- selected item: pending
- selected owner: pending
- selected proof path: pending
- queue snapshot: pending
- run artifact: pending
- public mutations: pending
- changed files: pending
- needs user attention: pending
- next heartbeat recommendation: pending

Findings:
- #5112 is live OPEN with no comments, assignee, linked PR, duplicate, or competing claim.
- Local `next` HEAD `d282fd8a` is one giant `v2` commit behind `origin/next` `98184323`; non-force integration is required before push.
- Repository rules make every current modified/untracked file part of the commit. The prior P1 review found one blocker in the new issue-reporter publisher: partial multi-video uploads can become public orphans without their URLs being reported.

Timeline:
- 2026-08-27: user explicitly authorized commit, push, and closing #5112.
- 2026-08-27: live issue/PR search, VISION/intake rules, checkout scope, and origin divergence read.

Decisions and tradeoffs:
- Do not force push or close from dirty/local proof.
- Fix the commit-scope reporter P1 before committing because repository rules require including that skill in the push.
- Commit first, then rebase onto the one newer `origin/next` commit; final public proof must run after the rebase on the pushed SHA.

Review fixes:
- pending

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- pending

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| pending | pending | pending | pending | pending |

Open risks:
- pending
