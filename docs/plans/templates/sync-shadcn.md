# {{TITLE}}

Objective:
TODO: Write the exact active `sync-shadcn` objective after creating this file.

Flow mode:
planning mode by default: one-shot execution to write a reviewable range plan,
then stop for user review. Implementation mode starts only on a later user
instruction that accepts a named plan and slice. Use collaborative planning only
when the user asks to decide policy before any range plan is written.

Goal plan:
{{PLAN_PATH}}

Primary template:
docs/plans/templates/sync-shadcn.md

Applied packs:
- none by default
- add `docs` if docs/content pages are edited during an accepted implementation
- add `browser` if browser-visible docs UI is edited
- add `agent-native` if `.agents/**`, `.claude/**`, `.codex/**`, skills,
  commands, prompts, or user-action tooling are edited

Sync source:
- upstream repo: `shadcn-ui/ui`
- upstream clone: `../shadcn`
- upstream app: `../shadcn/apps/v4`
- Plate docs app: `apps/www`
- durable state: `docs/sync/shadcn/status.json`
- durable policy: `docs/sync/shadcn/decisions.md`
- run artifacts: `docs/sync/shadcn/runs/<date>-<base>-to-<target>/`

Completion threshold:
- Planning-only run: complete only when the upstream range has exact base and
  target SHAs, ancestry is proven or the ref problem is recorded, every
  upstream added/modified/deleted `apps/v4` file is classified in a durable
  inventory, decision counts reconcile to the upstream TSV, the plan lists
  recommended slices and real questions, `lastPlannedCommit` points at the
  target, `lastSyncedCommit` is unchanged, the final response asks the user to
  review the plan and invoke `sync-shadcn` again with the accepted plan/slice,
  and
  `node .agents/rules/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.
- Accepted implementation run: complete only when the accepted slice is
  implemented and verified, excluded/forked rows remain recorded, partial sync
  or baseline advancement semantics are updated in `status.json`, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.

Verification surface:
- `../shadcn` git commands for fetch/pull, base/target resolution, ancestry,
  upstream commit list, and `apps/v4` file status.
- Run artifacts: `upstream-name-status.tsv`, `upstream-numstat.tsv`,
  `upstream-commits.txt`, `inventory.md`, `plan.md`, and screenshots for
  visual scopes.
- Source audits in `apps/www`, `content/docs`, `docs/sync/shadcn`, and relevant
  `docs/solutions/**` notes.
- JSON parse and commit-semantics check for `docs/sync/shadcn/status.json`.
- For implementation slices only: focused typecheck/lint/test/browser proof
  owned by the touched Plate surface.

Constraints:
- Do not run `build:registry`.
- Do not edit generated registry output, template output, or generated skill
  mirrors by hand.
- Do not write `.patch` files into sync run directories. Inspect focused diffs
  on demand and summarize the relevant hunks in Markdown.
- Do not patch `apps/www` during planning-only runs.
- Do not advance `lastSyncedCommit` until every upstream row through the target
  is accounted for and the user accepts the final accounting.
- Preserve settled Plate policy unless the user explicitly changes it: discard
  v0/create/charts/colors/theme/customizer surfaces; keep Plate API MDX, CN
  docs, MCP, Plate Plus hooks, GA, home page, editor demos, registry content,
  lazy registry-source loading, and sidebar accordion/filter UX.

Boundaries:
- Allowed planning edits: `docs/sync/shadcn/**`, this goal plan, and generated
  run artifacts.
- Allowed implementation edits only in implementation mode, after later user
  acceptance of a named plan/slice: the files named by the accepted slice plus
  required lock/config/test/doc updates.
- Non-goals: broad shadcn mirroring, homepage/create/theme adoption, registry
  build output, and unrelated docs redesign.

Output budget strategy:
- Do not stream broad upstream diffs or full generated registry output into
  chat. Save complete TSVs under the run directory. Do not save `.patch`
  artifacts.
- Use counts and focused slices first: `git diff --name-status`,
  `git diff --numstat`, `git log --oneline`, `wc -l`, and narrow `sed`/`rg`
  reads.
- Cap command output for source reads. If output is still too large, write an
  artifact summary and inspect exact ranges.

Blocked condition:
- Block only when the upstream clone/ref state is invalid, the target range
  cannot be proven, a required user policy decision changes whether the plan is
  truthful, or verification tooling cannot instantiate/check the goal plan
  after a real repair attempt.

Sync state:
- base commit: pending
- target commit: pending
- range kind: pending
- run directory: pending
- planning status: active
- implementation status: pending user acceptance
- user review status: pending until final planning handoff asks for review
- baseline status: do not advance until completion gates prove it

Current verdict:
- verdict: pending
- confidence: pending
- recommended next owner: sync-shadcn
- reason: pending

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until the range plan or accepted
  implementation evidence is recorded below and
  `node .agents/rules/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes.
- Do not create hook state. This plan, `docs/sync/shadcn/status.json`, and the
  run artifact directory are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `autogoal` loaded and active goal checked/created | pending | pending |
| `sync-shadcn` skill/rule read | pending | pending |
| Output budget strategy recorded before broad upstream commands | pending | pending |
| `docs/sync/shadcn/status.json` read | pending | pending |
| `docs/sync/shadcn/decisions.md` read | pending | pending |
| Prior migration plans/solution notes checked | pending | pending |
| `../shadcn` clone exists and was fetched/pulled intentionally | pending | pending |
| Base and target refs resolved to exact SHAs | pending | pending |
| Base ancestry or ref problem proven | pending | pending |
| Planning-only vs implementation mode decided | pending | pending |
| User-review boundary recorded | pending | pending |

Work Checklist:
- [ ] Objective, threshold, verification surface, constraints, boundaries, and
      blocked condition are filled from the active goal.
- [ ] Upstream range recorded with exact base SHA, target SHA, commit dates,
      and target subject.
- [ ] Run directory created under `docs/sync/shadcn/runs/`.
- [ ] Complete upstream inventories saved: `upstream-name-status.tsv`,
      `upstream-numstat.tsv`, and `upstream-commits.txt`.
- [ ] Focused diffs inspected on demand and summarized; no `.patch` files were
      written into the repo.
- [ ] For visual scopes, upstream shadcn and Plate screenshots were captured at
      matching viewport(s), with visible deltas recorded in the plan.
- [ ] Every changed upstream `apps/v4` row is classified in `inventory.md` with
      status, path, subsystem, Plate owner, decision, and evidence.
- [ ] Decision counts reconcile to the upstream TSV row count.
- [ ] Added, modified, and deleted groups are summarized with actionable rows
      separated from exclusions/no-ops.
- [ ] Recommended merge slices are ordered and include class, files, why, and
      verification.
- [ ] Settled exclusions and Plate forks are recorded with policy evidence.
- [ ] Real `needs-question` rows are isolated; settled policy is not re-asked.
- [ ] `docs/sync/shadcn/status.json` update semantics are recorded:
      `lastPlannedCommit`, `lastPlan`, partial sync, or baseline advancement.
- [ ] Planning-mode final handoff explicitly asks the user to review the plan
      and invoke `sync-shadcn` again with the accepted plan path and slice.
- [ ] Workspace authority recorded for each verification command or artifact.
- [ ] Output budget discipline followed; large evidence stayed in artifacts.
- [ ] Final handoff shape is filled before closeout.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Prove the planning or accepted-implementation threshold named above | pending |
| Upstream range artifacts exist | pending | Verify required run artifacts are non-empty or record a target-only bootstrap exception | pending |
| Inventory completeness | pending | Reconcile `inventory.md` row count with `upstream-name-status.tsv` | pending |
| Decision accounting | pending | Verify decision counts cover every upstream row and no `needs-question` row is hidden | pending |
| Status JSON parse and semantics | pending | Parse `docs/sync/shadcn/status.json`; verify planned/synced commit semantics | pending |
| Source-backed Plate mapping | pending | Record local `rg`/file evidence for every actionable adoption, fork, exclusion, or question group | pending |
| Visual comparison screenshots | pending | For visual scopes, capture upstream shadcn and Plate screenshots at matching viewport(s), then record visible deltas; otherwise N/A | pending |
| Planning-only no implementation edits | pending | Verify no `apps/www` implementation patch was made, or record accepted implementation scope | pending |
| Accepted implementation verification | pending | If a slice was accepted, run its focused typecheck/test/lint/browser/source proof; otherwise N/A | pending |
| Browser surface changed | pending | Capture browser proof when accepted implementation touches visible docs UI or when visual planning needs parity evidence; otherwise N/A | pending |
| Package manifests, lockfile, or install graph changed | pending | Run `pnpm install` and relevant package checks when touched; otherwise N/A | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync when touched; otherwise N/A | pending |
| CI-controlled generated output | pending | Verify no generated registry/template output was manually edited, or record intentional owner | pending |
| Baseline advancement | pending | Advance `lastSyncedCommit` only if all rows through target are complete and accepted; otherwise record why unchanged | pending |
| User review boundary | pending | In planning mode, stop and ask the user to review the plan; in implementation mode, record the accepted plan/slice | pending |
| Output budget discipline | pending | Verify broad output was artifacted/capped, or record accidental output and recovery | pending |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and baseline read | in_progress | created plan | upstream range evidence |
| Upstream range evidence | pending | | classification |
| Classification and local mapping | pending | | plan artifact |
| Plan artifact and status update | pending | | user review stop |
| User review stop | pending | | final response or later implementation |
| Accepted implementation | pending | | verification or N/A; implementation mode only |
| Verification and baseline decision | pending | | closeout |
| Closeout | pending | | final response |

Decision counts:
| Decision | Count | Notes |
|----------|------:|-------|
| `adopt-upstream` | pending | pending |
| `smart-merge` | pending | pending |
| `plate-fork` | pending | pending |
| `exclude-upstream` | pending | pending |
| `delete-plate-residue` | pending | pending |
| `no-op` | pending | pending |
| `needs-question` | pending | pending |

Recommended merge slices:
| Order | Slice | Class | Files | Why | Verification |
|------:|-------|-------|-------|-----|--------------|
| pending | pending | pending | pending | pending | pending |

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
- Range: pending
- Plan artifact: pending
- Inventory artifact: pending
- Decision counts: pending
- Recommended first slice: pending
- Review request: pending
- Question: pending or N/A; must ask for review before implementation in
  planning mode
- Status JSON: pending
- Verification: pending
- Baseline: pending

Timeline:
- {{CREATED_AT}} Sync Shadcn goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and baseline read |
| Where am I going? | Upstream evidence, classification, plan artifact, status update, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
