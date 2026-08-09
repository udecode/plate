# close Samarth1306w PRs in udecode plate

Objective:
Close every currently open PR authored by `Samarth1306w` in `udecode/plate`,
then verify that the matching open-PR count is zero.

Goal plan:
docs/plans/2026-08-05-close-samarth1306w-prs-in-udecode-plate.md

Template:
docs/plans/templates/maintainer.md

Primary template:
docs/plans/templates/maintainer.md

Applied packs:
- none

Maintainer source:
- mode: author-bounded PR batch closure
- repo: `udecode/plate`
- queue slice: all currently open PRs authored by `Samarth1306w`
- prompt / item link: user linked `https://github.com/Samarth1306w`
- acceptance criteria: every live matching open PR is closed and a fresh query returns zero
- standing orders: public close mutation is explicitly authorized; no other mutation is authorized
- heartbeat trigger: N/A: this is an exact author-bounded batch, not a recurring heartbeat
- queue snapshot command: required by maintainer for broad PR queue work; record the standard command before selection
- queue artifact: `docs/maintainer/queue.md` and `.tmp/maintainer/queue-snapshot.json`
- run artifact: N/A unless the live batch is large or ambiguous enough to prevent rediscovery

First checkpoint:
- Copy every explicit prompt requirement into this plan as checkable rows:
  repo, queue slice, non-goals, authority boundaries, proof requirements,
  final handoff sections, and success criteria.
- Do not inspect broad queues or mutate anything until this is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Every PR returned by a pre-mutation live GitHub query for open PRs authored by
  `Samarth1306w` in `udecode/plate` is closed, and the same live query returns
  zero after mutation.
- Closure is legal only when VISION fit, live-state read, duplicate/claim
  guard, intake completeness, owner route, proof surface, authority boundary,
  queue snapshot freshness, candidate matrix, rejected candidates, selected
  item, changed list, needs-attention rows, next heartbeat recommendation, run
  artifact decision, final handoff, and `check-complete` are closed with
  evidence.

Verification surface:
- `gh pr list --repo udecode/plate --state open --author Samarth1306w` before and after closure.
- `gh pr view` for exact live state/author before each close when needed.
- `gh pr close --repo udecode/plate <number>` for the authorized mutation.

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
- Source of truth: live GitHub state through authenticated `gh`.
- Allowed edit scope: this goal ledger and maintainer queue artifact only; no product code.
- Public mutation authority: explicit authority to close all matching PRs only.
- Security scope: N/A: ordinary PR queue work; stop if any item is security-sensitive.
- Browser surface: N/A: GitHub CLI state is the owning surface.
- Non-goals: no comments, labels, reviews, merges, pushes, branches, commits,
  releases, issue closure, or PRs from other authors/repositories.

Output budget strategy:
- Keep the final handoff to closed PR numbers/titles, zero-open verification,
  mutations, changed local artifacts, and any blocker.

Blocked condition:
- Stop if GitHub authentication/network prevents current-state reads or closes,
  if repository identity differs from `udecode/plate`, or if a matching item is
  security-sensitive and needs private maintainer handling.

Maintainer state:
- current_phase: complete
- current_phase_status: completed
- selected_item: PRs #5082, #5081, #5080, #5079, #5078, #5077, #5076, #5075, #5074, #5073, #5072, #5063, and #5062
- selected_owner: maintainer
- goal_status: complete after mechanical checker and goal-tool close

Current verdict:
- verdict: close all 13 matching PRs
- confidence: high
- next owner: maintainer
- reason: live reads prove all 13 are open, authored by the exact requested login, and contain no security-shaped report; the user explicitly authorized the broader batch.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Scope is `udecode/plate`; close every open PR by `Samarth1306w`; verify zero; no unrelated mutation. |
| Active goal checked or created | yes | `get_goal` returned no active goal; creation follows this checkpoint. |
| Root VISION.md read | yes | Read `VISION.md`; public PR maintenance belongs to `maintainer` and closure claims require live proof. |
| Relevant docs/vision detail read | yes | Read `docs/vision/common.md`; live-state-first and authority-bound closure apply. |
| Repo resolved | yes | Explicit working repo and default maintainer repo: `udecode/plate`. |
| Queue slice bounded | yes | Open PRs where author login is exactly `Samarth1306w`. |
| Queue snapshot plan recorded | yes | Run the standard snapshot command before mutation. |
| Live GitHub read plan recorded | yes | Pre/post `gh pr list`; exact `gh pr view` where needed. |
| Archive/gitcrawl freshness plan recorded | N/A | Live GitHub is sufficient; archive similarity is irrelevant to author-batch closure. |
| Public mutation boundary recorded | yes | Close matching PRs only; no comment, label, review, merge, or other mutation. |
| Public intake docs read when applicable | yes | Read `CONTRIBUTING.md` and `.github/PULL_REQUEST_TEMPLATE.md`; closure readiness here rests on exact author/state and explicit authority, not implementation quality. |
| Local Codex model recorded | yes | Local Codex checkout using authenticated `gh`; no hosted worker assumed. |
| Standing orders read | yes | Close is an approval gate satisfied by the user's explicit instruction. |
| Heartbeat runbook read | yes | Read because this is a broad PR batch; the user explicitly overrides the one-item selection limit with `all`. |
| Output budget strategy recorded | yes | Concise numbered closure list plus zero-open proof. |

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
- [x] Public mutation authority is recorded as explicit for matching PR closes only.
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
| Named verification threshold | yes | Prove the completion threshold above | Fresh exact-author open-PR query returned `[]`. |
| VISION fit | yes | Read root and detail doctrine, then classify fit | Public PR queue cleanup fits `maintainer`. |
| Standing-order fit | yes | Confirm the selected action is allowed, gated, or escalated by standing orders | Close gate satisfied by explicit user authority. |
| Live GitHub truth | yes | Read issue/PR/advisory current state or record auth blocker | All 13 were re-read before closure; final query is empty. |
| Queue snapshot | yes | Run `.agents/rules/maintainer/scripts/queue-snapshot.mjs` or record exact blocker | Refreshed before and after; final ledger has 6 PRs and zero warnings. |
| Duplicate/claim guard | N/A | Check related PRs/branches/assignees/recent claims for selected item | Explicit author-batch closure revokes these PR claims; no takeover is attempted. |
| Owner route | yes | Name selected owner skill/package/docs surface and why | `maintainer` owns authorized public PR closure. |
| Proof path | yes | Run proof, name command, or record proof blocker | Exact `gh pr list` author/state query returned `[]`. |
| Public mutation boundary | yes | Confirm none, or record explicit user authority and result | Closed 13 matching PRs only; no comments, labels, reviews, or merges. |
| Public intake completeness | yes | Read relevant issue/PR/security template and classify whether the item is agent-ready | Bodies/files read; no security disclosure; implementation readiness is irrelevant to explicit closure. |
| Rejected candidates | yes | Record skipped/rejected candidates with concrete reasons | All PRs outside the exact repo/author/open filter were excluded. |
| Next heartbeat | yes | Name the next useful heartbeat slice or say none safe | Resume ordinary ranking from the refreshed 6-PR ledger. |
| Run artifact | yes | Write or explicitly skip `docs/maintainer/runs/*` | `docs/maintainer/runs/2026-08-05-close-samarth1306w-prs.md`. |
| Agent-native review | N/A | Run/review when agent workflow files changed, else N/A | No skill, prompt, command, or workflow source changed. |
| P2 autoreview | N/A | Run with `--max-priority P2` for non-trivial implementation diffs; P3 is opt-in only, else N/A | No implementation diff. |
| Final handoff contract | yes | Report repo/mode/matrix/owner/proof/mutations/changed/attention/next heartbeat | Final response will name the 13 closures, zero-open proof, local artifacts, no attention items, and next queue action. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-05-close-samarth1306w-prs-in-udecode-plate.md` | Final mechanical gate queued after this ledger update. |

Candidate matrix:
| Rank | Item | Source | Live state | Category | VISION fit | Intake | Duplicate/claim guard | Owner | Proof | Authority | Decision |
|------|------|--------|------------|----------|------------|--------|-----------------------|-------|-------|-----------|----------|
| 1 | #5082 drag-handle cursor | user author filter | open, exact author | PR maintenance | yes | closure-ready | N/A: explicit author-batch revokes this claim | maintainer | close plus zero-open requery | explicit close-only | close |
| 2 | #5081 maxLength empty children | user author filter | open, exact author | PR maintenance | yes | closure-ready | N/A: explicit author-batch revokes this claim | maintainer | close plus zero-open requery | explicit close-only | close |
| 3 | #5080 playground typing latency | user author filter | open, exact author | PR maintenance | yes | closure-ready | N/A: explicit author-batch revokes this claim | maintainer | close plus zero-open requery | explicit close-only | close |
| 4 | #5079 color dropdown width | user author filter | open, exact author | PR maintenance | yes | closure-ready | N/A: explicit author-batch revokes this claim | maintainer | close plus zero-open requery | explicit close-only | close |
| 5 | #5078 marked v18 range | user author filter | open, exact author | PR maintenance | yes | closure-ready, non-security | N/A: explicit author-batch revokes this claim | maintainer | close plus zero-open requery | explicit close-only | close |
| 6 | #5077 shebang autolink | user author filter | open, exact author | PR maintenance | yes | closure-ready, non-security | N/A: explicit author-batch revokes this claim | maintainer | close plus zero-open requery | explicit close-only | close |
| 7 | #5076 table tab navigation | user author filter | open, exact author | PR maintenance | yes | closure-ready, non-security | N/A: explicit author-batch revokes this claim | maintainer | close plus zero-open requery | explicit close-only | close |
| 8 | #5075 HTML inline roots | user author filter | open, exact author | PR maintenance | yes | closure-ready, non-security | N/A: explicit author-batch revokes this claim | maintainer | close plus zero-open requery | explicit close-only | close |
| 9 | #5074 DnD removeChild | user author filter | open, exact author | PR maintenance | yes | closure-ready | N/A: explicit author-batch revokes this claim | maintainer | close plus zero-open requery | explicit close-only | close |
| 10 | #5073 equation ArrowLeft | user author filter | open, exact author | PR maintenance | yes | closure-ready | N/A: explicit author-batch revokes this claim | maintainer | close plus zero-open requery | explicit close-only | close |
| 11 | #5072 table Enter crash | user author filter | open, exact author | PR maintenance | yes | closure-ready | N/A: explicit author-batch revokes this claim | maintainer | close plus zero-open requery | explicit close-only | close |
| 12 | #5063 table selection desync | user author filter | open, exact author | PR maintenance | yes | closure-ready | N/A: explicit author-batch revokes this claim | maintainer | close plus zero-open requery | explicit close-only | close |
| 13 | #5062 Slate callbacks | user author filter | open, exact author | PR maintenance | yes | closure-ready | N/A: explicit author-batch revokes this claim | maintainer | close plus zero-open requery | explicit close-only | close |

Rejected / skipped candidates:
| Item | Reason | Next possible owner |
|------|--------|---------------------|
| PRs outside exact repo/author/open-state filter | Out of explicit scope | N/A |

Heartbeat handoff:
- selected item: all 13 matching PRs listed in the candidate matrix
- selected owner: `maintainer`
- selected proof path: exact-author open-PR live query returns `[]`
- queue snapshot: refreshed after closure; 6 PRs, 15 issues, 9 advisories, zero warnings
- run artifact: `docs/maintainer/runs/2026-08-05-close-samarth1306w-prs.md`
- public mutations: closed #5082, #5081, #5080, #5079, #5078, #5077, #5076, #5075, #5074, #5073, #5072, #5063, and #5062 only
- changed files: `docs/maintainer/queue.md`, this goal plan, and the run artifact; `.tmp/maintainer/queue-snapshot.json` refreshed as ignored local proof
- needs user attention: none
- next heartbeat recommendation: resume ordinary ranking from the remaining 6 open PRs

Findings:
- Thirteen matching open PRs existed; all were same-day submissions from the exact requested author and none was security-shaped.

Timeline:
- 2026-08-05: Captured exact author/repo/open-state scope and mutation boundary before live queue inspection.
- 2026-08-05: Refreshed the queue, verified all 13 live PRs, closed each after an immediate state/author re-read, and proved zero remain.

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | Prompt scope, doctrine, intake docs, and authority captured. | done |
| Live audit | complete | Queue snapshot plus 13 exact per-PR reads. | done |
| Execution | complete | All 13 authorized closes succeeded. | done |
| Verification | complete | Exact-author open-PR query returned `[]`; final queue snapshot has zero warnings. | done |
| Closeout | complete | Goal ledger and maintainer run note completed. | mechanical checker |

Decisions and tradeoffs:
- Treat `all PRs` as all currently open PRs in the current repository, not all repositories owned by GitHub.
- Do not add closure comments: the user authorized closure, not extra public messaging.

Review fixes:
- N/A: no implementation or reusable agent workflow changed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Mechanical checker reported a missing phase/pass table | 1 | Add the required concrete phase table and rerun | Resolved by the table above. |

Verification evidence:
- command: queue snapshot completed with 19 open PR rows in the broad ledger and zero warnings.
- external-source: exact live author filter returned 13 open PRs: #5082, #5081, #5080, #5079, #5078, #5077, #5076, #5075, #5074, #5073, #5072, #5063, #5062.
- external-source: per-PR live reads confirmed `OPEN`, exact author `Samarth1306w`, file lists, bodies, comments/reviews, and no security-shaped disclosure.
- external-source: all 13 `gh pr close` operations succeeded.
- command: final exact-author open-PR query returned `[]`.
- command: final queue snapshot reported 6 open PRs and zero warnings.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Closeout | Run the mechanical checker and complete the goal | Close all open `Samarth1306w` PRs in `udecode/plate` and prove zero remain | All 13 closes succeeded and the final live query is empty | Queue refreshed, batch closed, proof rerun, run note written |

Open risks:
- None in the completed batch. A future PR by the same author would be new work, not a failure of this verified snapshot.
