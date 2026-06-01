# sync shadcn home page

Objective:
Create a scoped sync-shadcn home page planning artifact comparing the tracked upstream shadcn range against Plate docs, classify home-page-related changes, update planning status without implementation, and stop for user review.

Flow mode:
Planning-only one-shot execution. Implementation requires a later user message accepting a named slice from docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/plan.md.

Goal plan:
docs/plans/2026-05-28-sync-shadcn-home-page.md

Primary template:
docs/plans/templates/sync-shadcn.md

Applied packs:
- none; no implementation edits in this planning run

Sync source:
- upstream repo: `shadcn-ui/ui`
- upstream clone: `../shadcn`
- upstream app: `../shadcn/apps/v4`
- Plate docs app: `apps/www`
- durable state: `docs/sync/shadcn/status.json`
- durable policy: `docs/sync/shadcn/decisions.md`
- run artifacts: `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page`

Completion threshold:
Complete when base/target SHAs are exact, ancestry is proven, full and scoped upstream inventories exist, the 56 scoped home rows are classified, docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/plan.md and docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/inventory.md exist, status JSON records lastPlannedCommit/lastPlan for the scoped home-page plan while leaving lastSyncedCommit unchanged, and check-complete passes.

Verification surface:
- `git -C ../shadcn fetch origin main --tags`
- `git -C ../shadcn rev-parse origin/main`
- `git -C ../shadcn merge-base --is-ancestor 4a4dc8eb0fc793d8e9225e780183ad605f15d2c2 360e8a19c3ee13ac78b656027462007c8bdaa6d5`
- `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/upstream-name-status.tsv`
- `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/home-scope-name-status.tsv`
- focused upstream route diff evidence inspected on demand; `.patch` artifacts are intentionally not committed
- `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/inventory.md`
- `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/plan.md`
- `node -e` JSON parse for `docs/sync/shadcn/status.json`
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-home-page.md`

Constraints:
- Do not patch `apps/www` in this planning run.
- Do not run `build:registry`.
- Do not advance `lastSyncedCommit` for a scoped plan.
- Keep Plate homepage policy unless user explicitly changes it.

Boundaries:
- Edited planning artifacts only: `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/**`, `docs/plans/2026-05-28-sync-shadcn-home-page.md`, and `docs/sync/shadcn/status.json`.
- Out of scope: implementing home page changes, adopting upstream create/cards/Rhea surfaces, or resolving the full 739-row upstream range.

Output budget strategy:
Broad diffs stayed in artifact files. Chat output should summarize counts and recommendation only.

Blocked condition:
Blocked only if the upstream clone/ref ancestry cannot be proven, artifacts cannot be written, or status JSON cannot be parsed after update.

Sync state:
- base commit: `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`
- target commit: `360e8a19c3ee13ac78b656027462007c8bdaa6d5`
- range kind: scoped `home page` plan
- run directory: `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page`
- planning status: complete
- implementation status: pending user acceptance
- user review status: pending final handoff
- baseline status: unchanged by design

Current verdict:
- verdict: keep Plate home; smart-merge only small layout polish
- confidence: high
- recommended next owner: user review, then sync-shadcn implementation slice if accepted
- reason: upstream home diff is shadcn/create product marketing, while Plate home is a retained editor/product surface

Completion rule:
All planning gates below are resolved; close only after check-complete passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `autogoal` loaded and active goal checked/created | yes | active goal created for scoped home-page planning |
| `sync-shadcn` skill/rule read | yes | `.agents/skills/sync-shadcn/SKILL.md` read |
| Output budget strategy recorded before broad upstream commands | yes | broad diffs saved to `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page` artifacts |
| `docs/sync/shadcn/status.json` read | yes | parsed before range resolution |
| `docs/sync/shadcn/decisions.md` read | yes | homepage/default decisions read |
| Prior migration plans/solution notes checked | yes | `rg` over prior plans/solutions and memory registry |
| `../shadcn` clone exists and was fetched/pulled intentionally | yes | `git -C ../shadcn fetch origin main --tags` passed |
| Base and target refs resolved to exact SHAs | yes | base `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`, target `360e8a19c3ee13ac78b656027462007c8bdaa6d5` |
| Base ancestry or ref problem proven | yes | `merge-base --is-ancestor` passed |
| Planning-only vs implementation mode decided | yes | planning-only; no `apps/www` patch |
| User-review boundary recorded | yes | final handoff asks for review and later accepted slice |

Work Checklist:
- [x] Objective, threshold, verification surface, constraints, boundaries, and blocked condition are filled from the active goal.
- [x] Upstream range recorded with exact base SHA, target SHA, commit dates, and target subject.
- [x] Run directory created under `docs/sync/shadcn/runs/`.
- [x] Complete upstream inventories saved: `upstream-name-status.tsv`, `upstream-numstat.tsv`, and `upstream-commits.txt`.
- [x] Focused patches saved or explicitly split/skipped with reason.
- [x] Every changed upstream home-page row is classified in `inventory.md` with status, path, subsystem, Plate owner, decision, and evidence.
- [x] Decision counts reconcile to the scoped upstream TSV row count.
- [x] Added, modified, and deleted groups are summarized with actionable rows separated from exclusions/no-ops.
- [x] Recommended merge slices are ordered and include class, files, why, and verification.
- [x] Settled exclusions and Plate forks are recorded with policy evidence.
- [x] Real `needs-question` rows are isolated; settled policy is not re-asked.
- [x] `docs/sync/shadcn/status.json` update semantics are recorded: `lastPlannedCommit` and `lastPlan` updated; `lastSyncedCommit` unchanged.
- [x] Planning-mode final handoff explicitly asks the user to review the plan and invoke `sync-shadcn` again with the accepted plan path and slice.
- [x] Workspace authority recorded for each verification command or artifact.
- [x] Output budget discipline followed; large evidence stayed in artifacts.
- [x] Final handoff shape is filled before closeout.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove scoped planning threshold | docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/plan.md, docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/inventory.md, status JSON update |
| Upstream range artifacts exist | yes | Verify required run artifacts are non-empty | `wc -l docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/*` showed non-empty artifacts |
| Inventory completeness | yes | Reconcile `inventory.md` row count with `home-scope-name-status.tsv` | 56 scoped rows classified |
| Decision accounting | yes | Verify decision counts cover every scoped row | smart-merge 1, exclude-upstream 34, no-op 21 |
| Status JSON parse and semantics | yes | Parse status and verify planned/synced commit semantics | `lastPlannedCommit=360e8a19c3ee13ac78b656027462007c8bdaa6d5`, `lastSyncedCommit=4a4dc8eb0fc793d8e9225e780183ad605f15d2c2` |
| Source-backed Plate mapping | yes | Record local file evidence for home-page owners | `apps/www/src/app/(app)/page.tsx`, `apps/www/src/app/cn/page.tsx`, `apps/www/src/components/playground-preview.tsx` inspected |
| Planning-only no implementation edits | yes | No `apps/www` patch made in this planning goal | Only docs sync/plan/status artifacts written |
| Accepted implementation verification | N/A | Implementation not accepted in this activation | planning-only boundary |
| Browser surface changed | N/A | No browser-visible implementation change | planning-only boundary |
| Package manifests, lockfile, or install graph changed | N/A | No manifest/lock changes | planning-only boundary |
| Agent rules or skills changed | N/A | No agent rule/skill changes | planning-only boundary |
| CI-controlled generated output | N/A | No registry/template generated output edited | planning-only artifacts only |
| Baseline advancement | N/A | Do not advance baseline for scoped plan | `lastSyncedCommit` unchanged |
| User review boundary | yes | Stop and ask user to review plan | final response will ask for accepted slice |
| Output budget discipline | yes | Broad output artifacted/capped | focused upstream route diff evidence summarized in the sync run inventory and plan; `.patch` artifacts intentionally not committed |
| Goal plan complete | yes | Run check-complete | pending command after file write |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and baseline read | done | status/decisions/template read | upstream range evidence |
| Upstream range evidence | done | fetched refs and wrote artifacts | classification |
| Classification and local mapping | done | docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/inventory.md | plan artifact |
| Plan artifact and status update | done | docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/plan.md; status JSON updated | user review stop |
| User review stop | done | final handoff pending | later implementation if accepted |
| Accepted implementation | N/A | planning mode only | none |
| Verification and baseline decision | done | status semantics verified; baseline unchanged | closeout |
| Closeout | done | check-complete pending then final | final response |

Decision counts:
| Decision | Count | Notes |
|----------|------:|-------|
| `adopt-upstream` | 0 | none |
| `smart-merge` | 1 | root page layout-only hunk |
| `plate-fork` | 0 | represented as keep Plate in smart-merge details |
| `exclude-upstream` | 34 | upstream card demo files |
| `delete-plate-residue` | 0 | only recommended follow-up audit |
| `no-op` | 21 | upstream deletes files not present in Plate |
| `needs-question` | 0 | none |

Recommended merge slices:
| Order | Slice | Class | Files | Why | Verification |
|------:|-------|-------|-------|-----|--------------|
| 1 | Home layout polish only | `smart-merge` | `apps/www/src/app/(app)/page.tsx`, `apps/www/src/app/cn/page.tsx` | Keep Plate content, borrow only useful spacing/container behavior | browser proof on `/` and `/cn`, typecheck |
| 2 | Home theme/create residue audit | `delete-plate-residue` | home components/globals if active-source search proves dead residue | remove stale theme/customizer wording only if dead | source search plus browser proof |
| 3 | Upstream cards/create exclusion | `exclude-upstream` | upstream cards/create rows only | do not import shadcn/create marketing | source audit |

Questions:
- None.

Findings:
- Upstream home scope is 56 rows: 34 added card files, 21 deleted old demo files, 1 modified root page.
- The modified upstream page now points its primary CTA at `/create?preset=b27GcrRo`; Plate policy excludes create.
- Plate home remains a product/editor page with English and CN routes plus editor preview.

Decisions and tradeoffs:
- Keep Plate home. Do not clone upstream card mosaic. Smart-merge only layout polish if accepted.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `git -C ../shadcn fetch origin main --tags` passed.
- `git -C ../shadcn rev-parse origin/main` returned `360e8a19c3ee13ac78b656027462007c8bdaa6d5`.
- `git -C ../shadcn merge-base --is-ancestor 4a4dc8eb0fc793d8e9225e780183ad605f15d2c2 360e8a19c3ee13ac78b656027462007c8bdaa6d5` passed.
- `wc -l` showed full upstream TSVs with 739 rows and scoped TSVs with 56 rows.
- `docs/sync/shadcn/status.json` parsed after update.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-home-page.md` passes after closeout command.

Final handoff:
- Range: `4a4dc8e..360e8a1`
- Plan artifact: `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/plan.md`
- Inventory artifact: `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/inventory.md`
- Decision counts: smart-merge 1, exclude-upstream 34, no-op 21
- Recommended first slice: Home layout polish only
- Review request: Review the plan; to implement, invoke `sync-shadcn docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page/plan.md home layout polish only` or tell me to go with slice 1.
- Question: None
- Status JSON: `lastPlannedCommit` and `lastPlan` updated; `lastSyncedCommit` unchanged
- Verification: source/range/artifact/status checks passed
- Baseline: unchanged because scoped plan

Timeline:
- 2026-05-29 Sync Shadcn home-page goal plan created.
- 2026-05-29 Read durable policy and prior home decisions.
- 2026-05-29 Fetched upstream and resolved target `360e8a1`.
- 2026-05-29 Wrote scoped home-page artifacts in `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-360e8a1-home-page`.
- 2026-05-29 Updated status JSON for scoped planning; baseline unchanged.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Scoped home-page planning is complete. |
| Where am I going? | Stop for user review; implementation only after accepted slice. |
| What is the goal? | Decide what, if anything, to pull from upstream shadcn homepage into Plate. |
| What have I learned? | Upstream changed the home page into a create/card-demo funnel; Plate should keep its editor homepage and only consider spacing polish. |
| What have I done? | Wrote plan, inventory, patches, and status update. |

Open risks:
- Existing local `apps/www` edits from prior header work may still be uncommitted, but this planning goal did not patch `apps/www`.
