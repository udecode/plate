# {{TITLE}}

Objective:
TODO: Write the short create_goal objective, under 240 characters. Put the full editor-harvest-plan contract in the sections below.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Completion threshold:
- TODO: Define the exact lane-plan done state.
- Lane-plan closure is legal only when score >= 0.92, no dimension is below
  0.85, harvest report path and license mode are recorded, inventory/test-index
  status is recorded, every harvest row is accounted for, no unresolved in-lane
  row remains, every in-lane row has owner coverage/action/target/proof or defer
  evidence, downstream lane skill gates are applied, accepted-plan handoff is
  present, behavior-only rows use fresh invariant wording only, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` passes.

Verification surface:
- TODO: Name the harvest report, inventory/test-index files, owner-coverage
  search commands, downstream lane skill, plan integrity grep, and final
  `check-complete.mjs` command.

Constraints:
- This is planning/routing work only. Do not patch implementation code, tests,
  examples, package files, or build config.
- Preserve harvest license mode. Behavior-only rows in versioned plans use
  fresh invariant language and source path provenance only.
- Do not count Plate/product rows as Slate substrate rows. Split mixed rows.
- Browser, clipboard, selection, mobile, and IME rows need honest proof routes.

Boundaries:
- Harvest report: TODO.
- Lane: TODO.
- Downstream skill: TODO.
- Allowed edit scope: `docs/plans/**` and this active goal plan.
- Non-goals: implementation, package/runtime edits, GitHub comments, commits,
  pushes, and PRs unless explicitly requested later.

Blocked condition:
- TODO: Name the missing harvest artifact, target checkout, browser/device proof
  route, or user lane decision that stops autonomous routing.

Lane state:
- harvest_report: pending
- lane: pending
- current_pass: harvest-grounding
- current_pass_status: in_progress
- current_pass_skill: .agents/skills/editor-harvest-plan/SKILL.md
- downstream_skill: pending
- next_pass: lane-filter
- goal_status: active

Current verdict:
- verdict: pending
- score: pending
- next owner: editor-harvest-plan
- reason: pending

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff is written, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | pending | pending |
| Active goal checked or created | pending | pending |
| Source of truth read before edits | pending | pending |

Work Checklist:
- [ ] Short objective plus lane outcome, completion threshold, verification
      surface, constraints, boundaries, and blocked condition are concrete.
- [ ] Harvest report path, status, score, license mode, output mode, inventory
      counts, matrix rows, skips, next slice, and pass-state ledger recorded.
- [ ] Inventory and test-index existence/missing reasons recorded.
- [ ] Lane aliases normalized and lane registry row selected.
- [ ] Every harvest row counted as in-lane, out-of-lane, split, duplicate, skip,
      or unresolved.
- [ ] Every split row has lane-owned and out-of-lane portions separated.
- [ ] Current owner coverage searched in the target workspace before claiming
      covered or missing.
- [ ] Every in-lane row has lane reason, current coverage, action, target, proof
      route, and verification command or defer reason.
- [ ] Behavior-only rows use `fresh-invariant`; no copied source wording or
      mechanical translation entered versioned output.
- [ ] Downstream lane gates applied and recorded.
- [ ] Issue/claim accounting recorded, including explicit no-claim text when no
      claim changes.
- [ ] Accepted-plan execution handoff complete.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Harvest artifacts current | pending | Verify harvest report, inventory, test-index, and row accounting evidence are current | pending |
| Downstream lane gates applied | pending | Record the selected downstream skill gates or why no downstream lane applies | pending |
| Issue or claim accounting changed | pending | Sync the relevant issue/claim accounting or record why no sync applies | pending |
| Accepted-plan handoff | pending | Emit accepted-plan execution handoff or keep the plan pending with the next pass | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Harvest grounding | in_progress | created plan | lane filter |
| Lane filter and row accounting | pending | | owner coverage |
| Current owner coverage mapping | pending | | execution queue |
| Execution queue and proof routing | pending | | downstream gates |
| Downstream lane gate application | pending | | issue accounting |
| Issue and claim accounting | pending | | handoff |
| Accepted-plan execution handoff | pending | | closure review |
| Closure review and final gates | pending | | final response |

Confidence score:
| Dimension | Weight | Score | Evidence | Cap hit |
|-----------|-------:|------:|----------|---------|
| Harvest source readiness | 0.15 | pending | | |
| Lane-filter completeness | 0.25 | pending | | |
| Current owner coverage mapping | 0.25 | pending | | |
| Actionability of execution queue | 0.20 | pending | | |
| License/provenance discipline | 0.15 | pending | | |

Harvest grounding:
| Field | Value |
|-------|-------|
| Harvest report | pending |
| License mode | pending |
| Output mode | pending |
| Inventory status | pending |
| Test-index status | pending |
| Matrix rows | pending |
| Skips | pending |
| Next slice | pending |

Lane contract:
| Field | Value |
|-------|-------|
| Lane | pending |
| Aliases | pending |
| Downstream skill | pending |
| Owner boundary | pending |
| Exclusions / split rules | pending |

Full harvest row accounting:
| Row | Source ref | Classification | Lane accounting | Reason |
|-----|------------|----------------|-----------------|--------|
| pending | pending | pending | pending | pending |

In-lane candidate matrix:
| Row | Source ref | Tag | Behavior invariant | Lane reason | Current coverage | Action | Target | Proof |
|-----|------------|-----|--------------------|-------------|------------------|--------|--------|-------|
| pending | pending | pending | pending | pending | pending | pending | pending | pending |

Split rows:
| Row | Source ref | Lane-owned part | Out-of-lane part | Owner / handoff |
|-----|------------|-----------------|------------------|-----------------|
| pending | pending | pending | pending | pending |

Excluded or out-of-lane rows:
| Row | Source ref | Reason | Owner |
|-----|------------|--------|-------|
| pending | pending | pending | pending |

Coverage dedupe:
| Candidate | Existing coverage | Decision | Evidence |
|-----------|-------------------|----------|----------|
| pending | pending | pending | pending |

Execution queue:
| ID | Action | Target | Proof kind | Focused verification | Notes |
|----|--------|--------|------------|----------------------|-------|
| pending | pending | pending | pending | pending | pending |

Issue and claim accounting:
- Fixed issues: pending.
- Improved issues: pending.
- Related issues: pending.
- PR reference: pending.

Downstream lane application:
| Gate | Status | Evidence |
|------|--------|----------|
| downstream skill read | pending | |
| lane-specific completion gates applied | pending | |
| implementation boundaries recorded | pending | |
| verification commands recorded | pending | |

Accepted-plan execution handoff:
- read-first plan path: pending
- requested lane: pending
- exact execution queue IDs: pending
- implementation boundaries: pending
- focused verification commands: pending
- broad final gate: pending
- issue/claim sync rule: pending
- stop rule: pending

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
| Where am I? | Harvest grounding |
| Where am I going? | Lane filter through handoff |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- {{CREATED_AT}} Goal plan created.

Open risks:
- Pending.
