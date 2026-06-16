# {{TITLE}}

Objective:
TODO: Write the short ClawSweeper objective, under 240 characters. Put the full
ledger/provenance/claim contract in the sections below.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

First checkpoint:
- Copy every explicit prompt requirement into this plan as checkable rows:
  issue refs, ledger scope, claim boundary, non-goals, proof requirements,
  final handoff sections, and success criteria.
- If the request is public issue/PR/security queue orchestration, stop and route
  to `maintainer` instead of continuing in ClawSweeper.
- Do not mutate ledgers, PR text, GitHub state, or implementation until this is
  complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: pending
- semantics: pending
- initial confidence score: pending
- improvement loop: pending
- final score / loop closure: pending

Completion threshold:
- TODO: Define the exact ledger/provenance/claim done state.
- Closure is legal only when every in-scope issue/ref/cluster has a ledger
  decision or N/A reason, duplicate/stale/invalid proof is recorded when used,
  exact claim level is recorded, fork dossier / coverage matrix / PR text sync
  is updated or marked N/A, maintainer/owner handoff is written when work leaves
  ClawSweeper, no public GitHub mutation occurred without explicit authority,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.

Verification surface:
- TODO: Name the ledger files, gitcrawl/gh/source-audit commands, claim sync
  audit, dossier/PR text audit, and final `check-complete` command.

Constraints:
- ClawSweeper owns Slate issue-ledger provenance, duplicate/stale/invalid
  classification, exact claim hygiene, fork dossier accounting, gitcrawl
  archive refresh, and subordinate external issue provenance.
- `maintainer` owns public issue/PR/security queue orchestration.
- `resolve-slate-issue`, `slate-patch`, `slate-auto`, `issue-harvester`, or
  `security-triage` own execution when the decision leaves ledger hygiene.
- No GitHub comments, labels, closes, reopens, reviews, commits, pushes, PRs,
  releases, or public mutations unless explicitly authorized.
- No implementation patching from this template. Produce a handoff when code
  work is needed.

Boundaries:
- Source of truth: pending
- Allowed edit scope: pending
- Public mutation authority: pending
- Implementation authority: none from ClawSweeper; route to owner
- Security scope: quarantine and route to `security-triage`
- Non-goals: generic queue scan, public maintainer heartbeat, runtime fix,
  product/API decision, release/publish work

Output budget strategy:
- pending

Blocked condition:
- TODO: Name the missing ledger, live state, duplicate evidence, proof route,
  owner decision, security boundary, or user authority that blocks progress.

ClawSweeper state:
- mode: ledger|duplicate|claim-sync|fork-dossier|external-provenance|gitcrawl-update
- target_repo: pending
- issue_refs: pending
- ledger_paths: pending
- current_phase: intake
- current_phase_status: in_progress
- next_phase: source-read
- goal_status: active

Current verdict:
- verdict: pending
- confidence: pending
- next owner: clawsweeper
- reason: pending

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until the named verification
  evidence is recorded below and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.
- Do not create hook state. This file plus the active goal are the durable
  state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| Timed checkpoint parsed | pending | pending |
| Maintainer boundary checked | pending | pending |
| Active goal checked or created | pending | pending |
| Source ledgers read before edits | pending | pending |
| Live-state requirement decided | pending | pending |
| Archive/gitcrawl freshness decided | pending | pending |
| Public mutation boundary recorded | pending | pending |
| Implementation handoff boundary recorded | pending | pending |
| Output budget strategy recorded | pending | pending |

Work Checklist:
- [ ] First checkpoint complete.
- [ ] Mode, target repo, issue refs, and ledger paths are concrete.
- [ ] Source ledgers are read before edits, or missing reason recorded.
- [ ] Live GitHub or gitcrawl freshness is checked when current state matters,
      or marked N/A with reason.
- [ ] Every in-scope issue/ref/cluster has a decision row.
- [ ] Duplicate/stale/invalid decisions cite concrete proof; no title-only
      duplicate claims.
- [ ] Claim level is one of `fixes-claimed`, `improves-claimed`,
      `cluster-synced`, `issue-reviewed`, `not-claimed`, `triage-closed`,
      `needs-repro`, or `needs-human`.
- [ ] No `Fixes #...` text is written unless exact original repro proof is
      recorded.
- [ ] Fork dossier, issue coverage matrix, PR text, and sync ledger updates are
      applied or marked N/A with reason.
- [ ] External editor provenance stays subordinate to `editor-test-harvester`
      or `issue-harvester`; no Slate claim is made from external closure alone.
- [ ] Security-shaped items are quarantined and routed to `security-triage`.
- [ ] Any implementation, queue, or public maintainer work is routed to the
      correct owner instead of executed here.
- [ ] Changed list is recorded.
- [ ] Needs-user-attention items are ranked.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Prove the completion threshold above | pending |
| Maintainer boundary | pending | Confirm this is ledger/provenance/claim hygiene or route to `maintainer` | pending |
| Ledger/source truth | pending | Read or update the in-scope ledger files | pending |
| Live/archive proof | pending | Run gitcrawl/gh/source audit when current state matters, else N/A | pending |
| Claim hygiene | pending | Audit claim levels, issue refs, PR text, and no false `Fixes #...` | pending |
| Dossier/matrix sync | pending | Update or mark N/A for fork dossier, issue coverage matrix, sync ledger, and PR text | pending |
| Owner handoff | pending | Route execution/security/queue work to owner or record N/A | pending |
| Public mutation boundary | pending | Confirm none, or record explicit user authority and result | pending |
| Autoreview | pending | Run for non-trivial ledger/provenance edits, else N/A with reason | pending |
| Final handoff contract | pending | Report decisions, changed list, proof, routed owners, needs-user-attention, and open risks | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and boundary | in_progress | created plan | source-read |
| Source-read | pending | | decision matrix |
| Decision matrix | pending | | sync or handoff |
| Sync or handoff | pending | | verification |
| Verification | pending | | closeout |
| Closeout | pending | | final response |

Issue decision matrix:
| Ref | Title / cluster | Source state | Proof read | Decision | Claim level | Ledger action | Owner handoff |
|-----|-----------------|--------------|------------|----------|-------------|---------------|---------------|
| pending | pending | pending | pending | pending | pending | pending | pending |

Claim sync:
| Artifact | Path | Action | Evidence |
|----------|------|--------|----------|
| v2 sync ledger | pending | pending | pending |
| issue coverage matrix | pending | pending | pending |
| fork issue dossier | pending | pending | pending |
| PR/release text | pending | pending | pending |

Owner handoff:
| Work | Owner | Reason | Handoff proof |
|------|-------|--------|---------------|
| pending | pending | pending | pending |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and boundary |
| Where am I going? | Source-read through closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- {{CREATED_AT}} ClawSweeper goal plan created.

Open risks:
- Pending.
