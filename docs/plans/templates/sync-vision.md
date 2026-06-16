# {{TITLE}}

Objective:
TODO: Write the short sync-vision objective, under 240 characters. Put the
full contract below.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Vision sync source:
- type: pending
- prompt / scope: pending
- mode: pending
- status source: `docs/sync/vision/status.json`
- base commit: pending
- target commit: pending
- run directory: pending

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- TODO: Define the exact sync done state.
- Closure is legal only when changed inputs are collected, candidate clusters
  are classified, root/detail vision docs are patched or reaffirmed when
  reusable doctrine exists, owner-routed items have concrete owners, baseline
  advancement semantics are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.

Verification surface:
- `node .agents/rules/sync-vision/scripts/collect-vision-diff.mjs --status`
- `node .agents/rules/sync-vision/scripts/collect-vision-diff.mjs`
- source audit of root `VISION.md`, `docs/vision/*.md`, and owner files for
  captured/reaffirmed rules
- JSON parse of `docs/sync/vision/status.json`
- `pnpm install` and mirror audit when `.agents/rules/**` changed
- final `check-complete.mjs`

Constraints:
- Latest-state doctrine only. No changelog prose in vision docs.
- Root `VISION.md` keeps mandatory essential doctrine. `docs/vision/*.md` gets
  owner detail that should not bloat the mandatory first read.
- Owner-specific execution details stay in owner skills/docs/templates.
- Generated `.agents/skills/**` mirrors are audit surfaces, not doctrine
  sources.

Boundaries:
- Allowed sync inputs: `VISION.md`, `docs/vision/**`, `.agents/AGENTS.md`,
  `.agents/rules/**`, `docs/plans/**`, `docs/sync/**`, `docs/research/**`,
  `docs/slate-v2/**`, `docs/editor-behavior/**`, `docs/solutions/**`,
  `content/docs/**`, and other changed Markdown-like root docs.
- Working-tree overlay includes relevant untracked files, so new doctrine docs,
  plans, or rule files must be visible in artifacts before commit.
- Allowed edits: `VISION.md`, `docs/vision/**`, `docs/sync/vision/**`, this
  plan, and owner `.agents/rules/**` only when a workflow miss is proven.
- Browser surface: N/A unless a changed decision depends on browser-visible
  proof.
- Non-goals: no runtime product patches, no commits, no PRs, no release claims.

Output budget strategy:
- Use the helper to write range artifacts. Read summaries, candidate TSVs, and
  selected owner files only. Do not stream full diffs or full plans into chat.

Blocked condition:
- Block only if the git baseline cannot be resolved, status JSON is corrupt,
  generated skill sync fails after source-rule changes, or the changed range
  contains a reusable taste conflict that cannot be inferred from current
  vision docs.

Sync state:
- current_phase: checkpoint-zero
- current_phase_status: in_progress
- next_phase: collect
- baseline_advance_policy: after committed range fully classified
- working_tree_overlay_policy: visible but not baselined
- goal_status: active

Current verdict:
- verdict: pending
- confidence: pending
- next owner: sync-vision
- reason: pending

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until the named verification
  evidence is recorded below and
  `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| `sync-vision` source rule read | pending | pending |
| `VISION.md` read | pending | pending |
| Active goal checked or created | pending | pending |
| `docs/sync/vision/status.json` read | pending | pending |
| Base and target commits resolved | pending | pending |
| Output budget strategy recorded | pending | pending |

Work Checklist:
- [ ] First checkpoint complete.
- [ ] Short objective, threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [ ] Status JSON parsed and base/target recorded.
- [ ] Diff collection artifacts exist under `docs/sync/vision/runs/**`.
- [ ] Candidate clusters are classified: captured, reaffirmed, rejected,
      run-specific, owner-routed, or deferred-with-question.
- [ ] Root `VISION.md` is patched or explicitly reaffirmed.
- [ ] Relevant `docs/vision/*.md` detail files are patched, reaffirmed, or
      marked N/A with reason.
- [ ] Owner-routed items name concrete owners.
- [ ] Baseline advancement decision is recorded.
- [ ] Generated mirrors are synced if `.agents/rules/**` changed.
- [ ] Output stayed artifact-backed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Diff collection | pending | Run sync-vision collector and record run directory | pending |
| Candidate classification | pending | Classify every candidate cluster | pending |
| Vision doctrine update | pending | Patch or reaffirm root `VISION.md` and relevant `docs/vision/*.md` files | pending |
| Owner routing | pending | Route non-vision items to owners or mark N/A | pending |
| Baseline advancement | pending | Advance or explicitly keep `lastSyncedCommit` | pending |
| Agent source / generated sync | pending | Run `pnpm install` when `.agents/rules/**` changed | pending |
| Status JSON parse | pending | Parse `docs/sync/vision/status.json` | pending |
| Final lint | pending | Run scoped lint/format or record N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | in_progress | created plan | collect |
| Collect changed inputs | pending | | classify |
| Classify candidates | pending | | patch/reaffirm |
| Patch or reaffirm vision docs | pending | | verify |
| Verify and advance baseline | pending | | closeout |
| Closeout | pending | | final response |

Candidate cluster ledger:
| Cluster | Source refs | Classification | Decision | Owner | Vision doc section / reason |
|---------|-------------|----------------|----------|-------|-----------------------------|
| pending | pending | pending | pending | pending | pending |

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
- Base -> target: pending
- Baseline advanced: pending
- Run artifacts: pending
- Vision doc changes: pending
- Reaffirmed: pending
- Rejected/noise: pending
- Owner-routed: pending
- Deferred questions: pending
- Commands: pending

Timeline:
- {{CREATED_AT}} Sync-vision goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Collect, classify, patch/reaffirm, verify, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
