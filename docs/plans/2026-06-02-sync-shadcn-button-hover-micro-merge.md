# sync shadcn button hover micro merge

Objective:
Apply the upstream shadcn Button secondary hover micro-overlap fix to Plate, record it in sync-shadcn plan/status, and verify with focused checks plus Browser.

Flow mode:
planning mode with micro-overlap direct merge exception. The Button row qualifies because it is one local copied primitive file, one class-token change, no route/data/dependency/generated output, and no product judgment.

Goal plan:
docs/plans/2026-06-02-sync-shadcn-button-hover-micro-merge.md

Primary template:
docs/plans/templates/sync-shadcn.md

Applied packs:
- browser: apps/www visible component changed

Sync source:
- upstream repo: `shadcn-ui/ui`
- upstream clone: `../shadcn`
- upstream app: `../shadcn/apps/v4`
- Plate docs app: `apps/www`
- durable state: `docs/sync/shadcn/status.json`
- durable policy: `docs/sync/shadcn/decisions.md`
- run artifacts: `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/`

Completion threshold:
Complete when `apps/www/src/components/ui/button.tsx` uses upstream's color-mix secondary hover class, the micro auto-merge is recorded in `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/plan.md`, `inventory.md`, `classification-summary.json`, and `status.json`, focused lint and typecheck pass, Browser proof runs on a visible route, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-sync-shadcn-button-hover-micro-merge.md` passes.

Verification surface:
- Upstream focused diff for `apps/v4/styles/*/ui/button.tsx`.
- Plate source audit of `apps/www/src/components/ui/button.tsx`.
- `pnpm --filter www exec eslint src/components/ui/button.tsx --fix`.
- `pnpm --filter www typecheck`.
- Browser proof against the local docs app.
- Status JSON parse and partial sync semantics.

Constraints:
- Do not run `build:registry`.
- Do not change package/lockfile.
- Do not advance `lastSyncedCommit`.
- Do not pull upstream style variants/generated output; only the shared Plate Button class fix.

Boundaries:
Allowed edits: `apps/www/src/components/ui/button.tsx`, `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/plan.md`, `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/inventory.md`, `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/classification-summary.json`, `docs/sync/shadcn/status.json`, and this goal plan.

Output budget strategy:
Use focused source/diff reads only. No patch artifacts.

Blocked condition:
No blocker.

Sync state:
- base commit: `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`
- previous planned commit: `efdec3ca4523e5edd8a714f633002a7addc203a1`
- target commit: `cd54e0927f3853a777f700a0bbf34507cf697b9c`
- range kind: micro-overlap partial sync
- run directory: `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09`
- planning status: micro-merge implemented
- implementation status: done for Button only
- user review status: remaining non-micro slices still need review
- baseline status: `lastSyncedCommit` unchanged

Current verdict:
- verdict: micro-overlap merge applied
- confidence: high
- recommended next owner: sync-shadcn for remaining non-micro slices
- reason: Button fix is one copied primitive class-token change; larger package/registry/docs slices remain review-gated

Completion rule:
Do not close until Browser proof and autogoal check pass.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `autogoal` loaded and active goal checked/created | yes | Active goal created for Button hover micro merge. |
| `sync-shadcn` skill/rule read | yes | Micro-overlap direct merge exception from repaired rule used. |
| Output budget strategy recorded before broad upstream commands | yes | Focused Button diff only; no broad patch. |
| `docs/sync/shadcn/status.json` read | yes | Existing baseline/plan/partial syncs inspected. |
| `docs/sync/shadcn/decisions.md` read | yes | Settled exclusions from prior run remain in force; no product surface changed. |
| Prior migration plans/solution notes checked | yes | Memory and existing latest plan used; not a new broad scan. |
| `../shadcn` clone exists and was fetched/pulled intentionally | yes | Existing latest run target `cd54e0927f3853a777f700a0bbf34507cf697b9c` used; no new upstream target required. |
| Base and target refs resolved to exact SHAs | yes | Base `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`; target `cd54e0927f3853a777f700a0bbf34507cf697b9c`. |
| Base ancestry or ref problem proven | yes | Proven in existing latest plan; this run uses that run artifact. |
| Planning-only vs implementation mode decided | yes | Planning with micro-overlap direct merge exception. |
| User-review boundary recorded | yes | Non-micro slices remain review-gated in `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/plan.md`. |

Work Checklist:
- [x] Objective, threshold, verification surface, constraints, boundaries, and blocked condition are filled from the active goal.
- [x] Upstream range recorded with exact base SHA, target SHA, commit dates, and target subject.
- [x] Run directory reused under `docs/sync/shadcn/runs/`.
- [x] Complete upstream inventories already saved: `upstream-name-status.tsv`, `upstream-numstat.tsv`, and `upstream-commits.txt`.
- [x] Focused Button diff inspected and summarized; no `.patch` files were written into the repo.
- [x] Visual screenshots are N/A for pre-plan comparison; Browser route proof is used for touched visible component.
- [x] Every changed upstream `apps/v4` row remains classified in `inventory.md`; Button source rows updated to `smart-merge`.
- [x] Decision counts reconcile to the upstream TSV row count.
- [x] Added, modified, and deleted groups are summarized with actionable rows separated from exclusions/no-ops.
- [x] Recommended merge slices are ordered and include class, files, why, and verification.
- [x] Micro-overlap direct merge is recorded with upstream file, Plate file, change, why direct, and verification.
- [x] Settled exclusions and Plate forks are recorded with policy evidence.
- [x] Real `needs-question` rows remain isolated; settled policy is not re-asked.
- [x] `docs/sync/shadcn/status.json` update semantics are recorded: partial sync added, `lastSyncedCommit` unchanged.
- [x] Planning-mode final handoff will list the micro auto-merge and keep remaining slices review-gated.
- [x] Workspace authority recorded for each verification command or artifact.
- [x] Output budget discipline followed; large evidence stayed in artifacts.
- [x] Final handoff shape is filled before closeout.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove Button class, sync artifacts, lint/typecheck/browser | Source updated; lint/typecheck passed; Browser proof passed on `http://localhost:3003/docs/installation/plate-ui`. |
| Upstream range artifacts exist | yes | Verify existing run artifacts are non-empty | Existing latest run artifacts remain present; row count checked in prior plan. |
| Inventory completeness | yes | Reconcile inventory row count with upstream TSV | Summary remains 790 rows; decision counts total 790. |
| Decision accounting | yes | Verify decision counts cover every upstream row | Updated counts: adopt 1, smart-merge 31, plate-fork 14, exclude 616, no-op 126, needs-question 2. |
| Status JSON parse and semantics | yes | Parse status and verify synced baseline unchanged | Final parse command verifies `lastSyncedCommit` is unchanged and latest `partialSyncs` entry records Browser proof. |
| Source-backed Plate mapping | yes | Record upstream Button source rows and Plate owner path | `apps/v4/styles/*/ui/button.tsx` -> `apps/www/src/components/ui/button.tsx`. |
| Visual comparison screenshots | no | Full visual comparison not needed for one hover class | N/A: browser smoke proof is enough. |
| Planning-only no implementation edits | yes | Record qualifying micro-overlap direct merge | Button hover class is recorded as micro auto-merge. |
| Accepted implementation verification | yes | Run focused checks for touched Plate surface | eslint and typecheck passed; browser pending. |
| Browser surface changed | yes | Capture browser proof on visible route | Browser proof: 14 rendered Button slots, 5 secondary variants with the new `color-mix` hover class, and no console warnings/errors on `http://localhost:3003/docs/installation/plate-ui`. |
| Package manifests, lockfile, or install graph changed | no | No package/lock touched | N/A. |
| Agent rules or skills changed | no | No agent files touched in this run | N/A. |
| CI-controlled generated output | yes | Verify no generated registry/template output manually edited | No generated registry/template output touched. |
| Baseline advancement | yes | Keep synced baseline unchanged | `lastSyncedCommit` unchanged; partial sync added. |
| User review boundary | yes | Keep remaining non-micro slices review-gated | Plan still recommends larger slices for review. |
| Output budget discipline | yes | Broad output artifacted/capped | No patch artifacts; focused reads only. |
| Goal plan complete | yes | Run completion checker | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-sync-shadcn-button-hover-micro-merge.md` passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and baseline read | done | latest plan/status read | complete |
| Upstream range evidence | done | existing latest run artifacts reused | complete |
| Classification and local mapping | done | Button rows mapped to Plate Button | complete |
| Plan artifact and status update | done | plan/inventory/summary/status updated | complete |
| User review stop | done | remaining slices review-gated | complete |
| Accepted implementation | done | micro direct merge implemented | complete |
| Verification and baseline decision | done | eslint/typecheck passed; Browser proof passed; status parse/checker passed | complete |
| Closeout | done | final response after checker | complete |

Decision counts:
| Decision | Count | Notes |
|----------|------:|-------|
| `adopt-upstream` | 1 | shadcn package bump audit remains pending. |
| `smart-merge` | 31 | Includes 16 Button source style rows micro-merged into Plate Button. |
| `plate-fork` | 14 | Plate-owned docs/home/sidebar surfaces. |
| `exclude-upstream` | 616 | Rhea/create/theme/home cards/generated adds/shadcn release content. |
| `delete-plate-residue` | 0 | No deletion slice. |
| `no-op` | 126 | Generated/upstream-only style output not manually synced. |
| `needs-question` | 2 | `/r/registries.json` route and directory content. |

Recommended merge slices:
| Order | Slice | Class | Files | Why | Verification |
|------:|-------|-------|-------|-----|--------------|
| 1 | Button secondary hover micro-merge | `smart-merge` | `apps/www/src/components/ui/button.tsx` | One copied primitive class-token fix from upstream. | eslint, typecheck, browser proof. |
| 2 | shadcn 4.10.0 package/registry contract audit | `adopt-upstream` | `apps/www/package.json`, lockfile | Bigger non-micro slice remains review-gated. | Future accepted run. |

Questions:
- N/A for Button. Existing registry-directory question remains in the latest plan.

Findings:
- The upstream Button source style rows were misclassified as no-op in the first latest plan; they overlap Plate's copied Button primitive and now classify as smart-merge.

Decisions and tradeoffs:
- Pull the color-mix hover class only. Do not pull upstream style variants or generated registry JSON.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Script quoting failed while updating artifacts | 1 | Use line-based rewrite instead of regex-with-backticks | Fixed; artifacts written. |

Verification evidence:
- `pnpm --filter www exec eslint src/components/ui/button.tsx --fix` passed.
- `pnpm --filter www typecheck` passed, including docs source parity and registry source checks.
- Browser proof on `http://localhost:3003/docs/installation/plate-ui` passed: 14 rendered Button slots, 5 secondary variants with the new `color-mix` hover class, and no console warnings/errors.

Final handoff:
- Range: `4a4dc8e..cd54e09`
- Plan artifact: `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/plan.md`
- Inventory artifact: `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/inventory.md`
- Decision counts: updated, total 790
- Micro auto-merges: Button secondary hover class
- Recommended first slice: remaining non-micro slice is `shadcn@4.10.0` package/registry contract audit
- Review request: remaining slices still need review before implementation
- Question: N/A for Button
- Status JSON: partial sync added, baseline unchanged
- Verification: eslint/typecheck/Browser/status parse/check-complete
- Baseline: unchanged

Timeline:
- 2026-06-02 Created micro-merge goal plan and applied Button hover class.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Button micro-merge implemented and verified. |
| Where am I going? | Closeout. |
| What is the goal? | Apply and verify Button secondary hover micro-overlap fix. |

Open risks:
None for the Button micro-merge; larger non-micro shadcn slices remain review-gated.
