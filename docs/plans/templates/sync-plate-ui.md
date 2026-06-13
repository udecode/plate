# {{TITLE}}

Objective:
TODO: Write the exact active `sync-plate-ui` objective after creating this file.

Flow mode:
Planning mode by default: one-shot execution to write a reviewable downstream
Plate UI sync plan and stop for user acceptance. Apply mode starts only on a
later user instruction that accepts a named plan, dashboard payload, component,
or row. Collaborative planning applies only when the user is deciding target
fork policy.

Goal plan:
{{PLAN_PATH}}

Primary template:
docs/plans/templates/sync-plate-ui.md

Applied packs:
- none by default
- add `agent-native` if `.agents/**`, `.claude/**`, `.codex/**`, skills,
  commands, prompts, or user-action tooling are edited
- add `browser` if accepted target implementation changes a visible route
- add `package-api` if target package/API boundaries are changed

Sync source:
- Plate repo: `/Users/zbeyens/git/plate`
- Plate registry source: `apps/www/src/registry/**`
- Component changelog source: generated public JSON from
  `apps/www/src/registry/changelog/{index,components,<event-id>}.json`
  or `/registry/changelog/{index,components,<event-id>}.json`
- Target repo: pending
- Target sync state: `<target>/.plate-ui-sync/status.json`
- Target run artifacts: `<target>/.plate-ui-sync/runs/<date>-<scope>/`

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into source mapping or apply work until this extraction is
  complete or explicitly marked N/A with reason.

Completion threshold:
- Planning-only run: complete only when target repo/config/source is mapped,
  Plate source and component changelog evidence are recorded, every scoped
  component/file row has hunk-level classification or an explicit blocker, each
  row has a decision, dashboard artifacts are written when requested, and the
  final response asks the user to accept rows before apply.
- Apply run: complete only when accepted rows are revalidated, target
  source/status/fork ledgers are updated only for accepted rows, target-owned
  verification runs or is blocked with evidence, and open decisions are
  recorded.
- All runs require
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`.

Verification surface:
- Source audits in Plate registry/changelog files and target registry files.
- Target config reads: `components.json`, `package.json`, lockfile/package
  manager, aliases, and existing sync scripts.
- Run artifacts: `plan.md`, `inventory.json`, `inventory.md`,
  `component-diffs.md`, `target-files.txt`, `decision-counts.json`.
- Dashboard artifacts when requested: `.plate-ui-sync/dashboard.json` and
  `.plate-ui-sync/dashboard.md`.
- Apply-mode only: target-owned focused typecheck/lint/test/browser proof.

Constraints:
- Do not mutate target source during planning mode.
- Do not overwrite whole target files unless every local hunk still matches
  base after transforms and an accepted apply row names that component/file.
- Do not treat prose-only changelog evidence as enough to apply.
- Do not create upstream Plate changelog entries; `sync-plate-ui` is
  downstream-consumer tooling only.
- Do not run Plate `build:registry`.
- Do not write `.patch` files into target sync artifacts.
- Do not create PRs, comments, commits, or pushes unless the user explicitly
  asks.

Boundaries:
- Allowed planning edits: this goal plan and target `.plate-ui-sync/**`
  artifacts.
- Allowed apply edits: accepted target rows, target sync state, target fork
  ledgers, and required target package/config/test files named by the accepted
  plan.
- Non-goals: broad downstream app refactors, unaccepted package upgrades,
  hidden target policy changes, and unrelated Plate docs work.

Output budget strategy:
- Use counts, file lists, and focused hunks before printing source. Cap target
  and Plate reads. Save broad inventories as artifacts under `.plate-ui-sync`.
  Do not stream full registry trees or broad diffs into chat.

Blocked condition:
- Block only when the target path/config cannot be resolved, the base source is
  unknown in apply mode without an accepted bootstrap baseline, component source
  cannot be mapped, bootstrap evidence cannot be written, or target
  verification cannot run after a concrete repair attempt. Unknown base in
  planning mode starts bootstrap planning; it does not block artifact creation.

Sync state:
- target repo: pending
- component scope: pending
- mode: planning
- Plate source ref: pending
- target package manager: pending
- run directory: pending
- dashboard: pending
- baseline status: pending

Current verdict:
- verdict: pending
- confidence: pending
- recommended next owner: sync-plate-ui
- reason: pending

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until planning or apply evidence
  is recorded below and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| `autogoal` loaded and active goal checked/created | pending | pending |
| `sync-plate-ui` rule read | pending | pending |
| Output budget strategy recorded | pending | pending |
| Target repo path resolved | pending | pending |
| Target `components.json` read | pending | pending |
| Target package manager and aliases read | pending | pending |
| Target `.plate-ui-sync/status.json` read or bootstrap mode recorded | pending | pending |
| Plate registry item/source mapped | pending | pending |
| Component changelog evidence read or fallback weakness recorded | pending | pending |
| Target component files mapped | pending | pending |
| Planning versus apply mode decided | pending | pending |
| User-review boundary recorded | pending | pending |

Work Checklist:
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before source mapping or apply work.
- [ ] Objective, threshold, verification surface, constraints, boundaries, and
      blocked condition are filled from the active goal.
- [ ] Target repo config recorded with package manager, aliases, registry paths,
      and existing sync scripts.
- [ ] Plate source ref or current checkout state recorded.
- [ ] Component changelog entries or fallback evidence recorded.
- [ ] Target run directory created under `.plate-ui-sync/runs/**`.
- [ ] Complete scoped inventory saved as JSON and Markdown.
- [ ] Base/upstream/local evidence recorded for every component/file row.
- [ ] Hunk-level classifications recorded, not just file-level labels.
- [ ] Fork ledger rows recorded for target-owned hunks.
- [ ] Apply rows separated from question-only rows.
- [ ] Dashboard artifacts written when requested.
- [ ] Planning-mode final handoff asks the user to accept rows before apply.
- [ ] Apply-mode rows are revalidated immediately before mutation.
- [ ] Target verification commands are run in the target cwd or blocked with
      evidence.
- [ ] Workspace authority recorded for every command.
- [ ] Output budget discipline followed; large evidence stayed in artifacts.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Prove the planning or apply threshold named above | pending |
| Target config mapped | pending | Record target package manager, aliases, registry paths, and trusted/untrusted sync scripts | pending |
| Component source mapped | pending | Record Plate registry item, Plate files, target files, and changelog evidence | pending |
| Inventory completeness | pending | Reconcile inventory row count with scoped component/file set | pending |
| Hunk classification | pending | Record base/upstream/local class for every changed hunk or explicit unknown-base blocker | pending |
| Decision accounting | pending | Verify every row has a decision and real questions are isolated | pending |
| Planning-only no target source edits | pending | Verify planning did not mutate target source, or record accepted apply mode | pending |
| Dashboard artifacts | pending | Write dashboard JSON/Markdown when requested, otherwise N/A | pending |
| Apply revalidation | pending | In apply mode, recompute accepted rows before mutation; otherwise N/A | pending |
| Target verification | pending | In apply mode, run target-owned focused checks; otherwise N/A | pending |
| Browser surface changed | pending | Capture browser proof for visible target changes; otherwise N/A | pending |
| Package manifests, lockfile, or install graph changed | pending | Run target package-manager install/checks when touched; otherwise N/A | pending |
| User review boundary | pending | In planning mode, stop and ask the user to accept rows; in apply mode, record accepted payload | pending |
| Output budget discipline | pending | Verify broad output was artifacted/capped, or record accidental output and recovery | pending |
| Autoreview | pending | For non-trivial apply runs, load `.agents/skills/autoreview/SKILL.md` and close accepted/actionable findings; for planning-only or no-local-patch runs, record N/A with reason | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and target read | in_progress | created plan | source mapping |
| Source mapping | pending | | classification |
| Classification and fork ledger | pending | | plan artifact |
| Dashboard / user review artifact | pending | | user review stop |
| Accepted apply | pending | | verification or N/A |
| Verification and status update | pending | | closeout |
| Closeout | pending | | final response |

Decision counts:
| Decision | Count | Notes |
|----------|------:|-------|
| `pull-upstream` | pending | pending |
| `keep-fork` | pending | pending |
| `smart-merge` | pending | pending |
| `reject-upstream` | pending | pending |
| `delete-target-residue` | pending | pending |
| `package-only` | pending | pending |
| `needs-question` | pending | pending |
| `no-op` | pending | pending |

Apply rows:
| Row | Action | Files | Why | Verification |
|-----|--------|-------|-----|--------------|
| pending | pending | pending | pending | pending |

Questions:
- Pending.

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

Final handoff:
- Target: pending
- Scope: pending
- Plan artifact: pending
- Dashboard: pending or N/A
- Decision counts: pending
- Apply rows: pending
- Kept forks: pending
- Questions: pending or N/A
- Verification: pending
- Next: pending

Timeline:
- {{CREATED_AT}} Sync Plate UI goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and target read |
| Where am I going? | Source mapping, classification, artifact, review/apply, verification |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
