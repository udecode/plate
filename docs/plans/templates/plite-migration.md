# {{TITLE}}

This is a project-owned file template under Task. Apply the project's standing Autogoal request for long-running work unless the user opts out. Apply `.agents/rules/task/references/workflow.md` to timing, publication and review rows. Relevant domain and executable-validator gates remain required; mark unrequested publication/review N/A.

Objective:
TODO: Write the short slate-migration objective, under 240 characters. Put the
full migration contract in the sections below.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Migration source:
- type: pending
- prompt / link: pending
- migration surface: pending
- source owner: pending
- target owner: pending
- invocation mode: pending
- completion threshold summary: pending

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable rows: scope, owners, non-goals,
  timing, stop conditions, deliverables, migration-guide expectations,
  changeset expectations, verification surfaces, and final handoff sections.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- TODO: Define the exact migration done state.
- Migration closure is legal only when inventory, API map, stale-symbol audit,
  source/docs/examples/tests, migration guide decisions, changeset decisions,
  packet ledger, changed list, review-attention rows, stopping checkpoints, and
  final verification evidence are complete or explicitly deferred with owner,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.

Verification surface:
- TODO: Name the source audits, package tests, typechecks, Browser/Playwright
  proofs, docs link checks, changeset audits, skill syncs, and final plan check.

Constraints:
- Current transplanted Plite source in this Plate checkout beats memory and old
  plans.
- Patch source owners, not generated mirrors or caller glue, unless the caller
  is the owner.
- Remove stale aliases and fake compat paths instead of preserving bad API
  shape.
- Repair migration guide and changesets during the loop when gaps appear.
- Do not create commits, PRs, or pushes unless explicitly requested.

Boundaries:
- Source of truth: pending
- Allowed edit scope: pending
- Migration guide owner: pending
- Changeset owner: pending
- Package/API owners: pending
- Browser/example surfaces: pending
- Non-goals: pending

Output budget strategy:
- TODO: Record how searches will be scoped, counted, or written to artifacts.

Blocked condition:
- TODO: Name the missing source, unsafe API fork, release decision, authority,
  or user taste gap that stops autonomous migration.

Migration state:
- surface: pending
- mode: pending
- time_budget_or_deadline: pending
- explicit_minimum_runtime: N/A unless requested
- current_loop: 0
- current_checkpoint: checkpoint-zero
- current_checkpoint_status: in_progress
- next_checkpoint: inventory
- plan_status: active
- native_goal: N/A unless explicitly requested

Current verdict:
- verdict: pending
- confidence: pending
- next owner: slate-migration
- keep / revert / quarantine call: pending
- reason: pending

Completion rule:
- Mark this Task plan complete only after every required checklist item and
  completion threshold is satisfied. For an inapplicable item, record
  `N/A: <reason>` rather than pretending it ran.
- Record final evidence and run
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`.
  That checks the file structure, not native goal status or runtime behavior.
- For a native goal requested directly or by standing instruction, update its
  status only after the full objective is achieved under Autogoal's tool contract.
- This file is the durable task state; do not create parallel hook state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-migration | in_progress | P0 | Copy prompt requirements before implementation. | Requirement rows complete. | seed |
| inventory | slate-migration | pending | P0 | List packages, docs, examples, tests, changesets, and symbols in scope. | Inventory ledger filled. | seed |
| api-map | slate-migration / plite-plan | pending | P0 | Map old APIs to current Plite public APIs. | API map rows source-backed. | seed |
| stale-symbol-audit | slate-migration | pending | P0 | Find stale Plite/Plate migration symbols. | Audit command and result recorded. | seed |
| migration-packet | slate-migration / plite-patch | pending | P0 | Migrate one owner or prove already migrated. | Proof command passes or packet quarantined. | seed |
| guide-repair | Plate Docs / slate-migration | pending | P1 | Repair migration guide when a user-facing step is missing; use Plate Docs for public MDX/API claims and Technical Writing for general prose. | Guide decision recorded. | seed |
| changeset-repair | changeset / slate-migration | pending | P1 | Repair release-facing migration notes when package users need them. | Changeset decision recorded. | seed |
| proof | slate-migration | pending | P0 | Run focused type/test/browser/docs proof for the packet. | Command result recorded with cwd. | seed |
| self-repair | slate-migration | pending | P1 | Patch workflow skill/template when the loop misses a recurring expectation. | Source/mirror sync recorded or N/A. | seed |
| final-handoff | slate-migration | pending | P0 | Emit changed list, review attention, queued checkpoints, residual risks. | Handoff rows complete. | seed |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | pending |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| `slate-migration` source rule read | pending | pending |
| `VISION.md` read | pending | pending |
| Task plan reused; standing Autogoal request or explicit opt-out resolved | pending | pending |
| Invocation mode recorded | pending | pending |
| Source and target owners recorded | pending | pending |
| Output budget strategy recorded | pending | pending |
| Migration guide owner decision recorded | pending | pending |
| Changeset owner decision recorded | pending | pending |
| Package/API proof strategy recorded | pending | pending |
| Browser/example proof strategy recorded | pending | pending |
| Self-repair authority and source-rule boundary recorded | pending | pending |

Work Checklist:
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [ ] Objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [ ] Inventory ledger records every in-scope package/docs/example/test/
      changeset owner or marks it N/A with reason.
- [ ] API map is source-backed against current Plite public exports/docs.
- [ ] Stale-symbol audit is run and every hit is fixed, accepted, quarantined,
      or deferred with owner.
- [ ] Each migration packet has keep/revert/quarantine decision and proof.
- [ ] Migration guide is updated for missing user-facing steps or marked
      not-needed with reason.
- [ ] Changesets are created/updated when package users need migration info, or
      marked not-needed with reason.
- [ ] Package/type/test/browser/docs proof is run from the owning workspace.
- [ ] Docs/API/current-state docs are kept latest-state; migration docs may use
      before/after examples.
- [ ] Workflow slowdown rows are logged when command shape or skill gaps waste
      time.
- [ ] Self-repair is applied when the migration loop misses a recurring
      expectation, or marked N/A.
- [ ] Changed list is current and grouped by code, tests, docs, changesets,
      skills/workflow, and reverted/quarantined packets.
- [ ] Needs-your-attention list is ranked and capped at five items.
- [ ] Stopping checkpoints are queued or marked none.
- [ ] Task review applicability and existing result are recorded; only an
      explicit review request or actual PR closure uses the shared P1 budget,
      never on `next`. Otherwise record N/A with reason.
- [ ] Output budget discipline is followed: broad scans are capped or written
      to artifacts instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the proof commands/artifacts named in this plan | pending |
| Inventory complete | pending | Fill inventory ledger and mark every owner checked/N/A | pending |
| API map source-backed | pending | Source-audit current Plite target APIs | pending |
| Stale-symbol audit | pending | Run scoped stale-symbol audit and resolve hits | pending |
| Migration packet proof | pending | Run focused proof for every kept packet | pending |
| Migration guide decision | pending | Update guide or record not-needed/deferred reason | pending |
| Changeset decision | pending | Create/update changesets or record not-needed/deferred reason | pending |
| Package/API proof | pending | Run type/test/export proof when package/API changed, otherwise N/A | pending |
| Browser/example proof | pending | Run Browser/Playwright proof when examples/editor UI changed, otherwise N/A | pending |
| Skill/rule sync | pending | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | pending |
| Changed list / review attention / stopping checkpoints | pending | Fill final handoff ledgers from packet evidence | pending |
| Workflow slowdown review | pending | Log slow steps and repair avoidable repeats, otherwise N/A | pending |
| Task-owned review when explicitly requested or closing a PR | pending | Reuse Task's review result; run P1 only for explicit review or actual PR closure, within three total helper invocations for this scope; never on `next`. Record N/A when unrequested or prohibited; do not add a final review | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | in_progress | created plan | inventory |
| Inventory | pending | | API map |
| API map | pending | | stale-symbol audit |
| Stale-symbol audit | pending | | migration packets |
| Migration packets | pending | | guide and changeset repair |
| Guide and changeset repair | pending | | proof |
| Proof and review | pending | | final handoff |
| Final handoff and goal-plan check | pending | | final response |

Inventory ledger:
| Owner | Kind | In scope | Current state | Needed action | Proof |
|-------|------|----------|---------------|---------------|-------|
| pending | pending | pending | pending | pending | pending |

API map ledger:
| Old API / pattern | Plite target | Owner | Evidence | Status |
|-------------------|-----------------|-------|----------|--------|
| pending | pending | pending | pending | pending |

Packet ledger:
| Packet | Loop | Owner | Gap signature | Files / commands | Guide decision | Changeset decision | Proof | Decision | Next |
|--------|------|-------|---------------|------------------|----------------|--------------------|-------|----------|------|
| pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |

Changed list:
- code/runtime/API: pending
- tests/oracles/browser proof: pending
- docs/migration guide: pending
- changesets: pending
- skills/workflow: pending
- reverted/quarantined packets: pending

Needs your attention:
- pending

Stopping checkpoints to unblock:
- pending

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence | Repair decision |
|----------------|-------|--------------------|----------|----------|-----------------|
| pending | pending | pending | pending | pending | pending |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Final handoff contract:
- Goal plan: pending
- Migration surface: pending
- API map summary: pending
- Guide updates: pending
- Changesets: pending
- Proof commands: pending
- Changed list: pending
- Needs your attention: pending
- Stopping checkpoints: pending
- Residual risk: pending

Timeline:
- {{CREATED_AT}} Plite migration plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Inventory, API map, packets, guide/changeset repair, proof |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
