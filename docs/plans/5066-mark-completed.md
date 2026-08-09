# Mark Plate 5066 completed

Objective:
Add the `completed` label to `udecode/plate#5066`; done when live readback shows
the label and state OPEN.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5066-mark-completed.md

Template:
docs/plans/templates/maintainer.md

Primary template:
docs/plans/templates/maintainer.md

Applied packs:
- none

Maintainer source:
- mode: explicit issue mutation
- repo: `udecode/plate`
- queue slice: issue #5066 only
- prompt / item link: https://github.com/udecode/plate/issues/5066
- acceptance criteria: add exactly the `completed` label; read it back live;
  preserve OPEN state; make no other GitHub or git mutation
- standing orders: user explicitly authorized the label after the proven local fix
- heartbeat trigger: N/A; explicit single issue action
- queue snapshot command: N/A; no queue scan
- queue artifact: N/A; live issue state is authoritative
- run artifact: N/A; this micro plan is the complete audit record

First checkpoint:
- Copy every explicit prompt requirement into this plan as checkable rows:
  repo, queue slice, non-goals, authority boundaries, proof requirements,
  final handoff sections, and success criteria.
- Do not inspect broad queues or mutate anything until this is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Live `gh issue view` shows label `completed` and state `OPEN`, with no comment,
  close, assignment, milestone, commit, push, or PR mutation from this task.
- Closure is legal only when VISION fit, live-state read, duplicate/claim
  guard, intake completeness, owner route, proof surface, authority boundary,
  queue snapshot freshness, candidate matrix, rejected candidates, selected
  item, changed list, needs-attention rows, next heartbeat recommendation, run
  artifact decision, final handoff, and `check-complete` are closed with
  evidence.

Verification surface:
- Read the completed repair ledger at
  `docs/plans/5066-fix-homepage-typing-latency.md`.
- Read live issue state before mutation, apply `gh issue edit --add-label`, then
  read live labels/state after mutation.

Constraints:
- Only the `completed` label is authorized. Do not comment, close, reopen,
  assign, milestone, commit, push, create a PR, merge, or release.
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
- Source of truth: live `udecode/plate#5066` plus the completed local repair ledger
- Allowed edit scope: this plan only
- Public mutation authority: add `completed` to issue #5066 only
- Security scope: N/A; ordinary performance issue
- Browser surface: N/A; label state is verified through live GitHub
- Non-goals: issue closure, another comment, assignment, milestone, git or PR work

Output budget strategy:
- One bounded issue read, one label mutation, one bounded readback; no queue dump.

Blocked condition:
- Stop if GitHub auth fails, issue #5066 is no longer OPEN, or the `completed`
  label does not exist and creating a new label would expand the requested action.

Maintainer state:
- current_phase: final handoff
- current_phase_status: completed
- selected_item: udecode/plate#5066
- selected_owner: maintainer
- goal_status: complete

Current verdict:
- verdict: `completed` label applied and read back; issue remains OPEN
- confidence: high
- next owner: none
- reason: live GitHub shows the exact requested metadata state

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact label, issue, readback, OPEN-state invariant, and non-goals are recorded above |
| Active goal checked or created | yes | New matching micro goal uses this plan |
| Root VISION.md read | yes | Live GitHub truth and explicit authority govern issue metadata |
| Relevant docs/vision detail read | yes | `docs/vision/common.md` and `docs/vision/plate.md` preserve proof width and Plate ownership |
| Repo resolved | yes | `udecode/plate` from `/Users/zbeyens/git/plate-2` |
| Queue slice bounded | yes | Issue #5066 only |
| Queue snapshot plan recorded | N/A | Explicit item, not heartbeat or broad queue work |
| Live GitHub read plan recorded | yes | Read state/labels immediately before and after mutation |
| Archive/gitcrawl freshness plan recorded | N/A | No discovery or duplicate decision is needed |
| Public mutation boundary recorded | yes | Add `completed` only; preserve OPEN state and all other metadata |
| Public intake docs read when applicable | N/A | Repair/intake was already completed; this task is metadata-only follow-up |
| Local Codex model recorded | yes | Local maintainer micro run |
| Standing orders read | yes | Label is normally gated; latest user request explicitly authorizes it |
| Heartbeat runbook read | N/A | No heartbeat or queue scan |
| Output budget strategy recorded | yes | One pre-read, one mutation, one readback |

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
- [x] Public mutation authority is recorded as none, explicit, or blocked.
- [x] Execution owner is invoked, or a decision-ready brief is produced.
- [x] Changed list is recorded.
- [x] Needs-user-attention items are ranked.
- [x] Next heartbeat recommendation is recorded.
- [x] Run artifact is written under `docs/maintainer/runs/*` when it prevents
      duplicate future work, or N/A reason is recorded.
- [x] Agent-native/P2 autoreview decision is recorded when skills, prompts,
      commands, or local workflow files change.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove the completion threshold above | Live readback shows labels `bug`, `performance issue`, and `completed`; state remains OPEN |
| VISION fit | yes | Read root and detail doctrine, then classify fit | Fit: proven fixed issue metadata, explicit human authority, and live verification |
| Standing-order fit | yes | Confirm the selected action is allowed, gated, or escalated by standing orders | User explicitly authorized the normally gated label mutation |
| Live GitHub truth | yes | Read issue/PR/advisory current state or record auth blocker | Before: OPEN with labels `bug`, `performance issue`; after: OPEN with `completed` added |
| Queue snapshot | N/A | Run `.agents/rules/maintainer/scripts/queue-snapshot.mjs` or record exact blocker | Explicit single item; no queue scan |
| Duplicate/claim guard | N/A | Check related PRs/branches/assignees/recent claims for selected item | Metadata follow-up to the already completed selected issue; no ownership decision |
| Owner route | yes | Name selected owner skill/package/docs surface and why | Maintainer owns explicit public issue metadata mutation |
| Proof path | yes | Run proof, name command, or record proof blocker | Completed repair ledger plus pre/post live GitHub reads |
| Public mutation boundary | yes | Confirm none, or record explicit user authority and result | Added `completed` only; comment count stayed 1, assignees stayed empty, milestone stayed null, state stayed OPEN |
| Public intake completeness | N/A | Read relevant issue/PR/security template and classify whether the item is agent-ready | Intake and repair are already complete; no new implementation judgment |
| Rejected candidates | N/A | Record skipped/rejected candidates with concrete reasons | No other candidate was considered |
| Next heartbeat | yes | Name the next useful heartbeat slice or say none safe | Re-read #5070 only if the user asks to continue |
| Run artifact | N/A | Write or explicitly skip `docs/maintainer/runs/*` | Micro metadata action is fully recorded in this plan |
| Agent-native review | N/A | Run/review when agent workflow files changed, else N/A | No agent workflow files changed |
| P2 autoreview | N/A | Run with `--max-priority P2` for non-trivial implementation diffs; P3 is opt-in only, else N/A | No implementation diff; existing repair already passed scoped P2 review |
| Final handoff contract | yes | Report repo/mode/matrix/owner/proof/mutations/changed/attention/next heartbeat | Repo `udecode/plate`; explicit issue mode; #5066 only; maintainer owner; live pre/post proof; one label mutation; this plan added; no attention item; #5070 only on request |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5066-mark-completed.md` | All audit rows are closed; mechanical check is the final local gate |

Candidate matrix:
| Rank | Item | Source | Live state | Category | VISION fit | Intake | Duplicate/claim guard | Owner | Proof | Authority | Decision |
|------|------|--------|------------|----------|------------|--------|-----------------------|-------|-------|-----------|----------|
| 1 | udecode/plate#5066 | explicit user request | OPEN; `completed` present | Plate performance issue metadata | yes | repair already proved | N/A: no ownership decision | maintainer | live label/state readback | explicitly authorized label only | completed |

Rejected / skipped candidates:
| Item | Reason | Next possible owner |
|------|--------|---------------------|
| N/A | No other candidate was considered | N/A |

Heartbeat handoff:
- selected item: udecode/plate#5066
- selected owner: maintainer
- selected proof path: completed repair ledger plus live pre/post label read
- queue snapshot: N/A; explicit single item
- run artifact: N/A; this micro plan is sufficient
- public mutations: `completed` label only
- public mutation result: `completed` added; issue remains OPEN
- changed files: this plan only
- needs user attention: none if readback succeeds
- next heartbeat recommendation: #5070 only on a new user request

Findings:
- The prior #5066 repair ledger is complete and records passing browser,
  benchmark, focused test/typecheck, lint, changelog, and P2 review proof.
- Live pre-read showed OPEN with labels `bug` and `performance issue`; the
  repository already defined a `completed` label.
- Live post-read shows OPEN with `completed` added, one existing comment, no
  assignee, and no milestone.

Timeline:
- 2026-08-06: user explicitly authorized adding the `completed` label.
- 2026-08-06: created the bounded goal and recorded mutation/non-goal boundaries.
- 2026-08-06: read live state, added `completed`, and verified the exact post-state.

Decisions and tradeoffs:
- Preserve issue state OPEN because label authority does not authorize closure.
- Do not post another comment; the verified local-fix comment already exists.

Review fixes:
- N/A; no code or agent workflow change.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `docs/plans/5066-fix-homepage-typing-latency.md` passes its completion audit
  and records the proven local fix plus verified issue comment.
- `gh issue view 5066 --repo udecode/plate`: OPEN with `completed`; one comment,
  no assignee, and no milestone after mutation.

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Scope and authority | completed | User authorized `completed` label only | live read |
| Live pre-read | completed | OPEN; `completed` absent; label exists in repo | mutation |
| Mutation | completed | `gh issue edit 5066 --add-label completed` succeeded | readback |
| Readback | completed | OPEN; `completed` present; other observed metadata unchanged | closeout |
| Closeout | completed | Plan audit and final handoff recorded | final response |

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Final closeout | Report the verified metadata state | Show `completed` on #5066 while state stays OPEN | Label exists and exact post-state is live | Label applied and read back |

Open risks:
- None for the requested metadata action. The underlying fix is still local and
  has no commit or PR.
