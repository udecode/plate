# sync shadcn 4.10 package contract

Objective:
Implement the accepted sync-shadcn `shadcn@4.10.0` package/registry contract audit slice: update Plate only if the upstream package bump validates against Plate registry source checks, record the slice in sync-shadcn artifacts/status, and verify with install, registry checks, typecheck, package tests, and Browser/API proof.

Flow mode:
accepted implementation slice.

Goal plan:
docs/plans/2026-06-02-sync-shadcn-4-10-package-contract.md

Primary template:
docs/plans/templates/sync-shadcn.md

Applied packs:
- browser: `apps/www` package-facing registry routes verified
- package-api: `shadcn/schema` package contract changed

Sync source:
- upstream repo: `shadcn-ui/ui`
- upstream clone: `../shadcn`
- upstream app: `../shadcn/apps/v4`
- target commit: `cd54e0927f3853a777f700a0bbf34507cf697b9c`
- Plate docs app: `apps/www`
- durable state: `docs/sync/shadcn/status.json`
- run artifacts: `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/`

Completion threshold:
Complete when `apps/www` depends on `shadcn@4.10.0`, the lockfile resolves `shadcn@4.10.0`, Plate registry source checks and focused package tests pass, `pnpm --filter www typecheck` passes, Browser/API proof confirms `/r/registries.json` and `/init`, sync-shadcn artifacts record the package slice, the range baseline advances to `cd54e0927f3853a777f700a0bbf34507cf697b9c`, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-sync-shadcn-4-10-package-contract.md` passes.

Verification surface:
- Upstream focused diff for `apps/v4/package.json`.
- Plate source audit of `apps/www/package.json` and `pnpm-lock.yaml`.
- `pnpm --filter www exec shadcn --version`.
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts`.
- Focused Bun tests for registry install/init/dependency route behavior.
- `pnpm --filter www typecheck`.
- Browser proof against `/r/registries.json` and `/init` on a fresh dev server.
- Status JSON parse and baseline semantics.

Constraints:
- Do not run `build:registry`.
- Do not copy generated registry output.
- Do not add Plate docs unless the package audit proves a real Plate user workflow gap.
- Do not adopt upstream Rhea/create/theme/style registry/homepage/generated surfaces.

Boundaries:
Allowed edits: `apps/www/package.json`, `pnpm-lock.yaml`, `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/plan.md`, `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/inventory.md`, `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/classification-summary.json`, `docs/sync/shadcn/status.json`, and this goal plan.

Output budget strategy:
Use focused source reads and endpoint proof only. No broad patch artifacts.

Blocked condition:
No blocker.

Sync state:
- base commit: `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`
- target commit: `cd54e0927f3853a777f700a0bbf34507cf697b9c`
- range kind: accepted implementation and full range closeout
- run directory: `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09`
- planning status: accepted package slice implemented
- implementation status: done
- baseline status: `lastSyncedCommit` advanced to target

Current verdict:
- verdict: accepted package sync implemented; full range accounted
- confidence: high
- recommended next owner: sync-shadcn only after upstream moves beyond `cd54e09`
- reason: package bump validates; docs note not needed; remaining upstream rows are fork/exclude/no-op.

Completion rule:
Close after status parse and autogoal check pass.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `autogoal` loaded and active goal checked/created | yes | Active goal created for `shadcn@4.10.0` package contract slice. |
| `sync-shadcn` skill/rule read | yes | Accepted implementation slice follows latest run plan. |
| Output budget strategy recorded before broad upstream commands | yes | Focused package/registry source only. |
| `docs/sync/shadcn/status.json` read | yes | Existing baseline and partial syncs inspected. |
| Base and target refs resolved to exact SHAs | yes | Base `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`; target `cd54e0927f3853a777f700a0bbf34507cf697b9c`. |
| Planning-only vs implementation mode decided | yes | User accepted the package/registry contract audit with "ok go". |
| User-review boundary recorded | yes | No non-accounted rows remain after this slice. |

Work Checklist:
- [x] Objective, threshold, verification surface, constraints, boundaries, and blocked condition are filled from the active goal.
- [x] Upstream target package version inspected from the saved target commit.
- [x] Plate package version inspected before update.
- [x] Package update applied with `pnpm --filter www add shadcn@4.10.0`.
- [x] Lockfile resolved `shadcn@4.10.0`.
- [x] Upstream registry/schema rows audited without copying generated output.
- [x] Decided no Plate docs note is needed for GitHub registry docs in this range.
- [x] Registry source check passed.
- [x] Focused package tests passed.
- [x] CLI version check passed.
- [x] `pnpm --filter www typecheck` passed.
- [x] Fresh dev server started on `http://localhost:3003`.
- [x] Browser proof passed for `/r/registries.json` and `/init`.
- [x] Sync-shadcn plan, inventory, summary, and status updated.
- [x] Baseline advanced to target with zero open questions.
- [x] Final handoff shape is filled before closeout.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove package, lockfile, registry checks, tests, typecheck, Browser/API, artifacts | All passed. |
| Upstream range artifacts exist | yes | Verify existing run artifacts remain present | Existing latest run artifacts remain present. |
| Inventory completeness | yes | Reconcile decision counts with upstream row count | Counts total 790. |
| Decision accounting | yes | Verify no question rows remain | `needs-question` is 0. |
| Status JSON parse and semantics | yes | Parse status and verify synced baseline advanced to target | Final parse command verifies baseline target and latest entry `baselineAdvanced: true`. |
| Source-backed Plate mapping | yes | Record upstream package row and Plate owner paths | `apps/v4/package.json` -> `apps/www/package.json`, `pnpm-lock.yaml`. |
| Visual comparison screenshots | no | Package/API route proof has no visual parity surface | N/A. |
| Accepted implementation verification | yes | Run focused checks for touched Plate surface | Registry source, focused tests, CLI version, typecheck, Browser/API passed. |
| Browser surface changed | yes | Capture Browser proof on package-facing routes | Browser proof on `/r/registries.json` and `/init`: valid registry JSON, no console warnings/errors. |
| Package manifests, lockfile, or install graph changed | yes | Verify package and lockfile resolve expected version | `apps/www/package.json` and `pnpm-lock.yaml` use `shadcn@4.10.0`. |
| CI-controlled generated output | yes | Verify generated registry output was not manually edited | No generated registry output touched. |
| Baseline advancement | yes | Advance synced baseline only after all rows are accounted | `lastSyncedCommit` advanced to `cd54e0927f3853a777f700a0bbf34507cf697b9c`. |
| User review boundary | yes | Keep future upstream changes out of this run | Next sync waits for upstream beyond `cd54e09`. |
| Output budget discipline | yes | Broad output artifacted/capped | Focused reads and proof only. |
| Goal plan complete | yes | Run completion checker | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-sync-shadcn-4-10-package-contract.md` passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and baseline read | done | latest plan/status read | complete |
| Upstream package evidence | done | target package diff inspected | complete |
| Implementation | done | package and lockfile updated | complete |
| Artifact and status update | done | plan/inventory/summary/status updated | complete |
| Verification and baseline decision | done | registry checks, tests, typecheck, Browser/API passed; baseline advanced | complete |
| Closeout | done | final response after checker | complete |

Decision counts:
| Decision | Count | Notes |
|----------|------:|-------|
| `adopt-upstream` | 1 | `shadcn@4.10.0` adopted. |
| `smart-merge` | 33 | Button rows plus registry route/directory concept rows. |
| `plate-fork` | 14 | Plate-owned docs/home/sidebar surfaces, including GitHub registry prose. |
| `exclude-upstream` | 616 | Rhea/create/theme/home cards/generated adds/shadcn release content. |
| `delete-plate-residue` | 0 | No deletion slice. |
| `no-op` | 126 | Generated/upstream-only style output not manually synced. |
| `needs-question` | 0 | No open product questions in the range. |

Recommended merge slices:
| Order | Slice | Class | Files | Why | Verification |
|------:|-------|-------|-------|-----|--------------|
| 1 | None for this range | `N/A` | N/A | Tracked range is accounted and baseline advanced. | Future `sync-shadcn` run after upstream moves. |

Questions:
- N/A. The GitHub registry docs concept was reviewed; no docs change is needed in this range.

Findings:
- The saved target commit has `shadcn@4.10.0` even though the current `../shadcn` checkout is older.
- Plate did not need upstream `@base-ui/react` for this slice.
- `shadcn@4.10.0` keeps Plate registry schema/import checks green.

Decisions and tradeoffs:
- Adopt only the `shadcn` package bump and lockfile resolution.
- Do not copy upstream registry build output or Rhea schema/style surfaces.
- Do not add a Plate docs note because version-pinned GitHub registry URLs are already covered in Local Docs.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Browser proof variable collision from previous session | 1 | Retry with fresh variable names | Browser proof passed. |

Verification evidence:
- `pnpm --filter www add shadcn@4.10.0` passed.
- `pnpm --filter www exec shadcn --version` returned `4.10.0`.
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts` passed.
- `pnpm --filter www exec bun test src/lib/plate-init.test.ts src/lib/registry-install.test.ts src/app/r/registries.json/route.test.ts scripts/registry-dependencies.test.mts` passed: 11 tests, 31 assertions.
- `pnpm exec biome check apps/www/package.json pnpm-lock.yaml` passed with package JSON checked; lockfile version was verified by `pnpm install` output and semantic assertions.
- `pnpm --filter www typecheck` passed, including docs source parity and registry source checks.
- Browser proof on `http://localhost:3003/r/registries.json` returned one `@plate` entry and no console warnings/errors.
- Browser proof on `http://localhost:3003/init` returned `registry:base`, `@plate/editor-basic`, and `https://platejs.org/r/{name}.json` with no console warnings/errors.

Final handoff:
- Range: `4a4dc8e..cd54e09`
- Plan artifact: `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/plan.md`
- Inventory artifact: `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/inventory.md`
- Decision counts: total 790, `needs-question` 0
- Accepted sync: `shadcn@4.10.0` package/registry contract
- Recommended next slice: none for this range
- Review request: none for this range
- Question: none
- Status JSON: baseline advanced to `cd54e0927f3853a777f700a0bbf34507cf697b9c`
- Verification: install/CLI version/registry source/tests/Biome/typecheck/Browser/check-complete
- Baseline: advanced

Timeline:
- 2026-06-02 Adopted `shadcn@4.10.0` and closed the tracked range.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Package contract slice implemented and verified. |
| Where am I going? | Closeout. |
| What is the goal? | Adopt `shadcn@4.10.0` safely and advance the shadcn sync baseline after full range accounting. |

Open risks:
None for this range.
