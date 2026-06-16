# {{TITLE}}

Objective:
TODO: Write the short maintainer objective, under 240 characters. Put the full
queue contract in the sections below.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Maintainer source:
- mode: pending
- repo: pending
- queue slice: pending
- prompt / item link: pending
- acceptance criteria: pending
- standing orders: pending
- heartbeat trigger: pending
- queue snapshot command: pending
- queue artifact: pending
- run artifact: pending

First checkpoint:
- Copy every explicit prompt requirement into this plan as checkable rows:
  repo, queue slice, non-goals, authority boundaries, proof requirements,
  final handoff sections, and success criteria.
- Do not inspect broad queues or mutate anything until this is complete or
  explicitly marked N/A with reason.

Completion threshold:
- TODO: Define the exact done state: item routed, executed, briefed, skipped,
  deferred, or blocked with evidence.
- Closure is legal only when VISION fit, live-state read, duplicate/claim
  guard, intake completeness, owner route, proof surface, authority boundary,
  queue snapshot freshness, candidate matrix, rejected candidates, selected
  item, changed list, needs-attention rows, next heartbeat recommendation, run
  artifact decision, final handoff, and `check-complete` are closed with
  evidence.

Verification surface:
- TODO: Name exact `gh`, `gitcrawl`, source-audit, owner-skill, proof command,
  review, browser, or artifact checks.

Constraints:
- No GitHub comments, labels, closes, PRs, reviews, pushes, merges, releases,
  or public mutations unless explicitly authorized.
- Live GitHub state outranks archives and generated ledgers.
- VISION fit outranks queue pressure.
- Route to narrower owners for execution.
- Do not use internal Slate automation as a dodge when a public queue blocker
  remains.
- Maintainer Codex runs are local checkout runs. Do not assume hosted/API
  workers, crabbox, or private agent state can recover missing issue/PR context.
- Standing orders authorize one local heartbeat activation, not a daemon. Pick
  at most one autonomous item, then verify and report.

Boundaries:
- Source of truth: pending
- Allowed edit scope: pending
- Public mutation authority: pending
- Security scope: pending
- Browser surface: pending
- Non-goals: pending

Output budget strategy:
- pending

Blocked condition:
- TODO: Name the missing auth, live state, proof path, owner decision, or user
  authority that blocks progress.

Maintainer state:
- current_phase: intake
- current_phase_status: in_progress
- selected_item: pending
- selected_owner: pending
- goal_status: active

Current verdict:
- verdict: pending
- confidence: pending
- next owner: maintainer
- reason: pending

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| Active goal checked or created | pending | pending |
| Root VISION.md read | pending | pending |
| Relevant docs/vision detail read | pending | pending |
| Repo resolved | pending | pending |
| Queue slice bounded | pending | pending |
| Queue snapshot plan recorded | pending | pending |
| Live GitHub read plan recorded | pending | pending |
| Archive/gitcrawl freshness plan recorded | pending | pending |
| Public mutation boundary recorded | pending | pending |
| Public intake docs read when applicable | pending | pending |
| Local Codex model recorded | pending | pending |
| Standing orders read | pending | pending |
| Heartbeat runbook read | pending | pending |
| Output budget strategy recorded | pending | pending |

Work Checklist:
- [ ] First checkpoint complete.
- [ ] Mode and repo are concrete.
- [ ] Root VISION.md and relevant detail file are read.
- [ ] Standing orders are read and the current invocation is classified against
      allowed actions, approval gates, and escalation rules.
- [ ] Heartbeat runbook is read for `heartbeat`, `queue`, broad maintenance, or
      future scheduled-local-Codex invocations.
- [ ] Queue snapshot command is run for heartbeat/broad queue work, or exact
      `gh` auth/network blocker is recorded.
- [ ] `docs/maintainer/queue.md` freshness is recorded before selecting an
      item, or stale-use caveat is explicit.
- [ ] Live GitHub state is read or exact auth blocker recorded.
- [ ] Public issue/PR/security intake is complete enough for a local Codex run,
      or the missing public evidence is named.
- [ ] gitcrawl/archive data is used only for discovery or marked N/A.
- [ ] Candidate matrix records every item considered.
- [ ] Candidate matrix includes a compact score or rank reason for every
      considered item.
- [ ] Rejected/skipped candidates are recorded with concrete reasons.
- [ ] Duplicate/claim guard is run for selected item or marked N/A.
- [ ] VISION fit is recorded for selected item.
- [ ] Selected item is at most one autonomous item unless the user explicitly
      requested a broader batch.
- [ ] Owner route is selected with reason.
- [ ] Proof path or proof blocker is recorded.
- [ ] Public mutation authority is recorded as none, explicit, or blocked.
- [ ] Execution owner is invoked, or a decision-ready brief is produced.
- [ ] Changed list is recorded.
- [ ] Needs-user-attention items are ranked.
- [ ] Next heartbeat recommendation is recorded.
- [ ] Run artifact is written under `docs/maintainer/runs/*` when it prevents
      duplicate future work, or N/A reason is recorded.
- [ ] Agent-native/autoreview decision is recorded when skills, prompts,
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
| Public mutation boundary | pending | Confirm none, or record explicit user authority and result | pending |
| Public intake completeness | pending | Read relevant issue/PR/security template and classify whether the item is agent-ready | pending |
| Rejected candidates | pending | Record skipped/rejected candidates with concrete reasons | pending |
| Next heartbeat | pending | Name the next useful heartbeat slice or say none safe | pending |
| Run artifact | pending | Write or explicitly skip `docs/maintainer/runs/*` | pending |
| Agent-native review | pending | Run/review when agent workflow files changed, else N/A | pending |
| Autoreview | pending | Run for non-trivial implementation diffs, else N/A | pending |
| Final handoff contract | pending | Report repo/mode/matrix/owner/proof/mutations/changed/attention/next heartbeat | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Candidate matrix:
| Rank | Item | Source | Live state | Category | VISION fit | Intake | Duplicate/claim guard | Owner | Proof | Authority | Decision |
|------|------|--------|------------|----------|------------|--------|-----------------------|-------|-------|-----------|----------|
| pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |

Rejected / skipped candidates:
| Item | Reason | Next possible owner |
|------|--------|---------------------|
| pending | pending | pending |

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
- None yet.

Timeline:
- pending

Decisions and tradeoffs:
- pending

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
