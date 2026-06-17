# sync shadcn latest

Objective:
Create a planning-only sync-shadcn artifact for latest upstream shadcn `apps/v4` at `cd54e0927f3853a777f700a0bbf34507cf697b9c` against Plate baseline `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`, with exact refs, full upstream inventory, reconciled decisions, status update, and completion check. Do not patch `apps/www` implementation.

Flow mode:
Planning mode. Implementation starts only after a later user instruction accepts a named plan and slice.

Goal plan:
`docs/plans/2026-06-02-sync-shadcn-latest.md`

Primary template:
`docs/plans/templates/sync-shadcn.md`

Applied packs:
N/A: planning-only sync artifacts; no app/content/package implementation was edited.

Sync source:
- upstream repo: `shadcn-ui/ui`
- upstream clone: `../shadcn`
- upstream app: `../shadcn/apps/v4`
- Plate docs app: `apps/www`
- durable state: `docs/sync/shadcn/status.json`
- durable policy: `docs/sync/shadcn/decisions.md`
- run artifacts: `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/`

Completion threshold:
Planning is complete when exact base/target SHAs are recorded, ancestry is proven, every upstream added/modified/deleted `apps/v4` row is classified in `inventory.md`, decision counts reconcile to the upstream TSV, recommended slices/questions are recorded in `plan.md`, `lastPlannedCommit` points at the target, `lastSyncedCommit` remains unchanged, no `apps/www` implementation patch is made by this run, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-sync-shadcn-latest.md` passes.

Verification surface:
- `../shadcn` git fetch/log/diff/name-status/numstat evidence.
- `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/upstream-name-status.tsv`, `upstream-numstat.tsv`, `upstream-commits.txt`, `upstream-latest-name-status.tsv`, `inventory.md`, `classification-summary.json`, and `plan.md`.
- `docs/sync/shadcn/status.json` parse and planned/synced commit semantics.
- Local source mapping through `apps/www/package.json`, `apps/www/src/lib/registry-install.ts`, `apps/www/src/lib/plate-init.ts`, registry scripts, and prior sync policy docs.
- Planning-only no-implementation check for `apps/www`/`content/docs`.

Constraints:
- Do not run `build:registry`.
- Do not patch `apps/www` during planning.
- Do not edit generated registry output, template output, or generated skill mirrors by hand.
- Do not write broad patch artifacts into the repo.
- Do not advance `lastSyncedCommit`.
- Preserve settled Plate policy: discard v0/create/charts/colors/theme/customizer product surfaces; keep Plate API MDX, CN docs, MCP, Plate Plus/Pro hooks, GA, home page, editor demos, registry content, lazy registry-source loading, and sidebar accordion/filter UX.

Boundaries:
Allowed edits for this run are `docs/sync/shadcn/**` planning artifacts and this goal plan. Implementation files under `apps/www`, `content/docs`, or `packages` are outside this planning-only run.

Output budget strategy:
Large upstream evidence stays in TSV/Markdown artifacts. Chat and command output use counts, summaries, and focused source reads instead of broad patches.

Blocked condition:
No blocker. Upstream clone/ref state is valid, target ancestry is proven, all rows are classified, and the only unresolved product decision is isolated as an explicit review question.

Sync state:
- base commit: `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`
- previous planned commit: `efdec3ca4523e5edd8a714f633002a7addc203a1`
- target commit: `cd54e0927f3853a777f700a0bbf34507cf697b9c`
- range kind: latest full-range plan from tracked baseline, with latest-only delta recorded from previous plan
- run directory: `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09`
- planning status: done
- implementation status: N/A for this run; requires later user acceptance
- user review status: final handoff points at `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/plan.md`
- baseline status: `lastSyncedCommit` unchanged

Current verdict:
- verdict: planning complete; do not implement all latest rows as one sweep
- confidence: high for accounting, medium for the registry-directory product choice because it needs user acceptance
- recommended next owner: sync-shadcn implementation slice
- reason: latest actionable work is a small registry/package audit, while most upstream rows are excluded/forked product/style churn

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `autogoal` loaded and active goal checked/created | yes | Active goal objective created for planning-only latest sync; `get_goal` returned active goal `019e6e58-ab5c-7c40-8e3e-6313bf4298a3`. |
| `sync-shadcn` skill/rule read | yes | Skill used for planning-mode semantics: exact refs, inventory, status update, no implementation until accepted slice. |
| Output budget strategy recorded before broad upstream commands | yes | Strategy recorded in this plan; broad upstream evidence saved under `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09` as TSV/Markdown artifacts. |
| `docs/sync/shadcn/status.json` read | yes | Baseline `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`, previous planned `efdec3ca4523e5edd8a714f633002a7addc203a1`, and existing partial syncs read before planning. |
| `docs/sync/shadcn/decisions.md` read | yes | Settled policy used for exclusions/forks: Plate content, registry content, create/theme/v0, sidebar, home, CN, MCP. |
| Prior migration plans/solution notes checked | yes | Read prior sync plans and solution notes for registry namespace/schema/search/source behavior before classification. |
| `../shadcn` clone exists and was fetched/pulled intentionally | yes | `git -C ../shadcn fetch origin main --tags` succeeded; clone remote is `shadcn-ui/ui`. |
| Base and target refs resolved to exact SHAs | yes | Base `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`; target `cd54e0927f3853a777f700a0bbf34507cf697b9c` from upstream `origin/main`. |
| Base ancestry or ref problem proven | yes | Base and previous planned commits are ancestors of target; no ref problem recorded. |
| Planning-only vs implementation mode decided | yes | Planning-only. No app implementation files are part of this run. |
| User-review boundary recorded | yes | `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/plan.md` asks review and recommends the first accepted slice. |

Work Checklist:
- [x] Objective, threshold, verification surface, constraints, boundaries, and blocked condition are filled from the active goal.
- [x] Upstream range recorded with exact base SHA, previous planned SHA, target SHA, target date, and target subject.
- [x] Run directory created under `docs/sync/shadcn/runs/`.
- [x] Complete upstream inventories saved: `upstream-name-status.tsv`, `upstream-numstat.tsv`, and `upstream-commits.txt`.
- [x] Latest-only upstream inventory saved as `upstream-latest-name-status.tsv`.
- [x] Focused diffs inspected on demand and summarized; no `.patch` files were written into the repo.
- [x] Visual screenshots are N/A because this is a full-range source planning pass with no visual implementation.
- [x] Every changed upstream `apps/v4` row is classified in `inventory.md` with status, path, subsystem, Plate owner, decision, and evidence.
- [x] Decision counts reconcile to the upstream TSV row count.
- [x] Added, modified, and deleted groups are summarized with actionable rows separated from exclusions/no-ops.
- [x] Recommended merge slices are ordered and include class, files, why, and verification.
- [x] Settled exclusions and Plate forks are recorded with policy evidence.
- [x] Real `needs-question` rows are isolated: the registry directory route/content decision.
- [x] `docs/sync/shadcn/status.json` update semantics are recorded: `lastPlannedCommit`, `lastPlan`, `lastFullPlan`, and unchanged `lastSyncedCommit`.
- [x] Planning-mode final handoff explicitly asks the user to review the plan and invoke `sync-shadcn` again with the accepted plan path and slice.
- [x] Workspace authority recorded for each verification command or artifact.
- [x] Output budget discipline followed; large evidence stayed in artifacts.
- [x] Final handoff shape is filled before closeout.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove planning threshold named above | Exact refs, inventory, status update, and artifact checks recorded in this plan. |
| Upstream range artifacts exist | yes | Verify required run artifacts are non-empty | `upstream-name-status.tsv` 790 rows, `upstream-numstat.tsv` 790 rows, `upstream-commits.txt` 21 commits, `upstream-latest-name-status.tsv` 56 rows. |
| Inventory completeness | yes | Reconcile `inventory.md` row count with `upstream-name-status.tsv` | `classification-summary.json` reports 790 classified rows matching 790 upstream name-status rows. |
| Decision accounting | yes | Verify decision counts cover every upstream row and no question row is hidden | Counts: adopt 1, smart-merge 15, plate-fork 14, exclude 616, no-op 142, needs-question 2; total 790. |
| Status JSON parse and semantics | yes | Parse status; verify planned/synced commit semantics | `status.json` parses; `lastPlannedCommit` is `cd54e0927f3853a777f700a0bbf34507cf697b9c`; `lastSyncedCommit` remains `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`. |
| Source-backed Plate mapping | yes | Record local file evidence for actionable adoption/fork/exclusion groups | Local reads found `apps/www/package.json` shadcn 4.8.2, `shadcn/schema` usage, `@plate` registry install helpers/tests, and no Plate `/r/registries.json` route. |
| Visual comparison screenshots | no | For visual scopes only | N/A: full-range source planning only; no visual implementation. |
| Planning-only no implementation edits | yes | Verify no `apps/www`/`content/docs` implementation patch was made by this run | Later verification command checks no diff under implementation paths for this run scope. |
| Accepted implementation verification | no | Run focused checks only after accepted slice | N/A: no accepted implementation slice in this run. |
| Browser surface changed | no | Browser proof only when visible docs UI changes | N/A: no visible app/content implementation edit. |
| Package manifests, lockfile, or install graph changed | no | Run install/checks only if package files touched | N/A: package bump is recommended slice, not implemented. |
| Agent rules or skills changed | no | Run sync only if agent files touched | N/A: no agent rules or skills edited. |
| CI-controlled generated output | yes | Verify no generated registry/template output was manually edited | Planning artifacts only; no registry/template output edited. |
| Baseline advancement | yes | Keep synced baseline unchanged | `lastSyncedCommit` unchanged because implementation and unresolved registry-directory choice remain. |
| User review boundary | yes | Stop and ask user to review plan | Final response points to `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/plan.md` and names recommended slice 1. |
| Output budget discipline | yes | Verify broad output was artifacted/capped | Broad inventory/diffs are in artifacts; no patch files written. |
| Goal plan complete | yes | Run completion checker | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-sync-shadcn-latest.md` is run before `update_goal`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and baseline read | done | status, decisions, prior plans, and solution notes read | complete |
| Upstream range evidence | done | fetched upstream and recorded exact range artifacts | complete |
| Classification and local mapping | done | 790-row inventory and local Plate mapping completed | complete |
| Plan artifact and status update | done | `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/plan.md` written; status updated to target planned commit | complete |
| User review stop | done | final handoff will request review/accepted slice | complete |
| Accepted implementation | n/a | no slice accepted in this planning run | future run |
| Verification and baseline decision | done | artifact/status/checker verification recorded; synced baseline unchanged | complete |
| Closeout | done | ready for final response after checker/update_goal | complete |

Decision counts:
| Decision | Count | Notes |
|----------|------:|-------|
| `adopt-upstream` | 1 | shadcn package bump audit to 4.10.0. |
| `smart-merge` | 15 | registry contract/build plus retained shell/doc primitives. |
| `plate-fork` | 14 | Plate-owned docs/home/sidebar surfaces. |
| `exclude-upstream` | 616 | Rhea/create/theme/home cards/generated adds/shadcn release content. |
| `delete-plate-residue` | 0 | No deletion slice in planning. |
| `no-op` | 142 | Generated/upstream-only style output with no manual sync. |
| `needs-question` | 2 | `/r/registries.json` route and directory content. |

Recommended merge slices:
| Order | Slice | Class | Files | Why | Verification |
|------:|-------|-------|-------|-----|--------------|
| 1 | shadcn 4.10.0 package/registry contract audit | `adopt-upstream` | `apps/www/package.json`, lockfile, registry schema/import consumers if needed | Lowest product risk; carries current CLI/schema behavior. | `pnpm install`, source-only registry validation, `pnpm --filter www typecheck`; no `build:registry`. |
| 2 | Registry directory route decision | `needs-question` to `smart-merge` or `exclude-upstream` | possible `apps/www/src/app/r/registries.json/route.ts` and Plate-owned directory source | Route is clean but product ownership matters. | If accepted: API smoke and source validation; if rejected: status decision only. |
| 3 | GitHub registry docs/concept review | `plate-fork` / selective `smart-merge` | Plate registry docs only if accepted | Upstream docs are reference-only; Plate docs should stay Plate-specific. | Docs/browser proof only if content changes. |
| 4 | Retained shell follow-up audit | `smart-merge` | header/mobile/search/docs shell files if a focused hunk maps | Existing partial syncs are mostly done; do not sweep. | Focused source diff, eslint/typecheck/browser only if files change. |

Verification evidence:
- Created/updated `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/upstream-name-status.tsv`, `upstream-numstat.tsv`, `upstream-commits.txt`, `upstream-latest-name-status.tsv`, `inventory.md`, `classification-summary.json`, and `plan.md`.
- Row evidence: 790 full-range upstream rows, 56 latest-only rows, 21 upstream `apps/v4` commits.
- Decision reconciliation: 1 + 15 + 14 + 616 + 142 + 2 = 790; no hidden decision bucket.
- Status semantics: `lastPlannedCommit` and `lastFullPlan` updated to target plan; `lastSyncedCommit` unchanged at `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`.
- Local source mapping verified Plate currently pins `shadcn` 4.8.2, uses `shadcn/schema`, centralizes `@plate` install commands, and has no current public `/r/registries.json` route.
- No `build:registry` command was run.

Reboot status:
Current as of 2026-06-02: planning artifacts are written, status is updated to latest planned target, implementation is intentionally not started, and the next run should accept a plan slice before touching app/content/package files.

Open risks:
One deliberate open product decision remains: whether Plate should expose `/r/registries.json`. My recommendation is to defer route implementation until a registry review slice is accepted, because serving upstream external directory content would be wrong for Plate.
