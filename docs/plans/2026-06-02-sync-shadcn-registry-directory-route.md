# sync shadcn registry directory route

Objective:
Implement the accepted sync-shadcn registry directory route slice: add a Plate-owned `/r/registries.json` endpoint, record the slice in sync-shadcn artifacts/status without advancing the full baseline, and verify with focused checks plus Browser/API proof.

Flow mode:
accepted implementation slice.

Goal plan:
docs/plans/2026-06-02-sync-shadcn-registry-directory-route.md

Primary template:
docs/plans/templates/sync-shadcn.md

Applied packs:
- browser: `apps/www` route surface changed

Sync source:
- upstream repo: `shadcn-ui/ui`
- upstream clone: `../shadcn`
- upstream app: `../shadcn/apps/v4`
- Plate docs app: `apps/www`
- durable state: `docs/sync/shadcn/status.json`
- durable policy: `docs/sync/shadcn/decisions.md`
- run artifacts: `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/`

Completion threshold:
Complete when `/r/registries.json` serves a static JSON array with exactly one Plate-owned `@plate` entry, sync-shadcn plan/inventory/summary/status record the accepted route slice, focused route tests pass, focused Biome passes, `pnpm --filter www typecheck` passes, Browser/API proof confirms the endpoint, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-sync-shadcn-registry-directory-route.md` passes.

Verification surface:
- Upstream focused route shape: `../shadcn/apps/v4/app/r/registries.json/route.ts`.
- Plate source audit: `apps/www/src/lib/plate-registry-config.ts` and `apps/www/src/app/r/registries.json/route.ts`.
- Focused route tests.
- Focused Biome.
- `pnpm --filter www typecheck`.
- Curl and Browser endpoint proof.
- Status JSON parse and partial sync semantics.

Constraints:
- Do not run `build:registry`.
- Do not copy upstream external registry directory content.
- Do not change package/lockfile.
- Do not advance `lastSyncedCommit`.
- Keep Plate registry metadata source-owned.

Boundaries:
Allowed edits: `apps/www/src/lib/plate-registry-config.ts`, `apps/www/src/app/r/registries.json/route.ts`, `apps/www/src/app/r/registries.json/route.test.ts`, `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/plan.md`, `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/inventory.md`, `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/classification-summary.json`, `docs/sync/shadcn/status.json`, and this goal plan.

Output budget strategy:
Use focused source reads and endpoint proof only. No patch artifacts.

Blocked condition:
No blocker.

Sync state:
- base commit: `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`
- target commit: `cd54e0927f3853a777f700a0bbf34507cf697b9c`
- range kind: accepted partial sync
- run directory: `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09`
- planning status: accepted route slice implemented
- implementation status: done
- baseline status: `lastSyncedCommit` unchanged

Current verdict:
- verdict: accepted partial sync implemented
- confidence: high
- recommended next owner: sync-shadcn for remaining package/registry contract audit
- reason: upstream route contract is useful, but upstream external registry directory data is shadcn product content; Plate serves only `@plate`.

Completion rule:
Close after status parse and autogoal check pass.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `autogoal` loaded and active goal checked/created | yes | Active goal created for registry directory route slice. |
| `sync-shadcn` skill/rule read | yes | Accepted implementation slice follows existing latest run plan. |
| Output budget strategy recorded before broad upstream commands | yes | Focused route/directory source only. |
| `docs/sync/shadcn/status.json` read | yes | Existing baseline/partial syncs inspected. |
| Prior migration plans/solution notes checked | yes | Latest sync run plan used. |
| Base and target refs resolved to exact SHAs | yes | Base `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`; target `cd54e0927f3853a777f700a0bbf34507cf697b9c`. |
| Planning-only vs implementation mode decided | yes | User accepted route slice with "ok go". |
| User-review boundary recorded | yes | Non-route slices remain review-gated in the run plan. |

Work Checklist:
- [x] Objective, threshold, verification surface, constraints, boundaries, and blocked condition are filled from the active goal.
- [x] Upstream range recorded with exact base SHA and target SHA.
- [x] Upstream route source inspected.
- [x] Plate registry constants inspected.
- [x] Plate-owned registry directory metadata added.
- [x] `/r/registries.json` route added.
- [x] Route test added.
- [x] Inventory decisions updated from `needs-question` to `smart-merge` for route and directory concept rows.
- [x] Decision counts reconcile to the upstream TSV row count.
- [x] Status JSON records a partial sync and keeps baseline unchanged.
- [x] Focused tests pass.
- [x] Focused Biome passes.
- [x] `pnpm --filter www typecheck` passes.
- [x] Curl endpoint proof passes.
- [x] Browser endpoint proof passes.
- [x] Final handoff shape is filled before closeout.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove route output, sync artifacts, tests, Biome, typecheck, Browser/API | All passed. |
| Upstream range artifacts exist | yes | Verify existing run artifacts remain present | Existing latest run artifacts remain present. |
| Inventory completeness | yes | Reconcile decision counts with upstream row count | Updated counts total 790. |
| Decision accounting | yes | Verify route and directory rows are no longer questions | `needs-question` is 0; `smart-merge` is 33. |
| Status JSON parse and semantics | yes | Parse status and verify synced baseline unchanged | Final parse command verifies JSON and baseline semantics. |
| Source-backed Plate mapping | yes | Record upstream route/directory rows and Plate owner paths | `apps/v4/app/r/registries.json/route.ts` -> `apps/www/src/app/r/registries.json/route.ts`; `apps/v4/registry/directory.json` -> `apps/www/src/lib/plate-registry-config.ts`. |
| Visual comparison screenshots | no | JSON endpoint has no visual surface | N/A. |
| Accepted implementation verification | yes | Run focused checks for touched Plate surface | Tests, Biome, typecheck, curl, and Browser passed. |
| Browser surface changed | yes | Capture Browser proof on endpoint route | Browser proof on `http://localhost:3003/r/registries.json`: one `@plate` entry, no console warnings/errors. |
| Package manifests, lockfile, or install graph changed | no | No package/lock touched | N/A. |
| CI-controlled generated output | yes | Verify generated registry output was not manually edited | No generated registry output touched. |
| Baseline advancement | yes | Keep synced baseline unchanged | `lastSyncedCommit` unchanged; partial sync updated. |
| User review boundary | yes | Keep remaining non-route slices review-gated | Plan still recommends package/registry contract audit and docs concept review. |
| Output budget discipline | yes | Broad output artifacted/capped | Focused reads and proof only. |
| Goal plan complete | yes | Run completion checker | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-sync-shadcn-registry-directory-route.md` passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and baseline read | done | latest plan/status read | complete |
| Upstream route evidence | done | upstream route/directory source inspected | complete |
| Implementation | done | route, constants, and test added | complete |
| Artifact and status update | done | plan/inventory/summary/status updated | complete |
| Verification and baseline decision | done | tests, Biome, typecheck, curl, Browser passed | complete |
| Closeout | done | final response after checker | complete |

Decision counts:
| Decision | Count | Notes |
|----------|------:|-------|
| `adopt-upstream` | 1 | shadcn package bump audit remains review-gated. |
| `smart-merge` | 33 | Includes Button source rows plus registry route/directory concept rows. |
| `plate-fork` | 14 | Plate-owned docs/home/sidebar surfaces. |
| `exclude-upstream` | 616 | Rhea/create/theme/home cards/generated adds/shadcn release content. |
| `delete-plate-residue` | 0 | No deletion slice. |
| `no-op` | 126 | Generated/upstream-only style output not manually synced. |
| `needs-question` | 0 | Registry route question accepted as Plate-owned metadata. |

Recommended merge slices:
| Order | Slice | Class | Files | Why | Verification |
|------:|-------|-------|-------|-----|--------------|
| 1 | shadcn 4.10.0 package/registry contract audit | `adopt-upstream` | `apps/www/package.json`, lockfile, registry schema/import consumers if needed | Remaining low-risk technical slice. | Future accepted run. |
| 2 | GitHub registry docs/concept review | `plate-fork` / selective `smart-merge` | Plate registry docs only if accepted | Upstream prose should not be copied directly. | Future accepted run. |

Questions:
- N/A. The `/r/registries.json` route decision is accepted as Plate-owned metadata only.

Findings:
- Upstream route shape is tiny and static.
- Upstream directory content is a large external registry product directory, so Plate should not copy it.
- Plate already had canonical `@plate` namespace and URL constants.

Decisions and tradeoffs:
- Serve one Plate entry from source constants.
- Keep `https://platejs.org` production URLs in the directory even in development.
- Do not create `public/r/registries.json`; the route owns the endpoint.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Direct ESLint and `www lint:fix` are unusable in this checkout | 2 | Use repo-standard focused Biome plus typecheck | Biome passed; `www lint:fix` failed across unrelated existing TS parsing, not this route. |

Verification evidence:
- `pnpm --filter www exec bun test src/app/r/registries.json/route.test.ts src/lib/plate-init.test.ts` passed: 4 tests, 14 assertions.
- `pnpm exec biome check apps/www/src/lib/plate-registry-config.ts apps/www/src/app/r/registries.json/route.ts apps/www/src/app/r/registries.json/route.test.ts --write` passed with no fixes.
- `pnpm --filter www typecheck` passed, including docs source parity and registry source checks.
- Curl proof on `http://localhost:3003/r/registries.json` returned exactly one `@plate` entry with homepage `https://platejs.org` and URL `https://platejs.org/r/{name}.json`.
- Browser proof on `http://localhost:3003/r/registries.json` returned the same one-entry JSON and no console warnings/errors.

Final handoff:
- Range: `4a4dc8e..cd54e09`
- Plan artifact: `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/plan.md`
- Inventory artifact: `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09/inventory.md`
- Decision counts: updated, total 790
- Accepted partial sync: `/r/registries.json` Plate-owned directory route
- Recommended next slice: `shadcn@4.10.0` package/registry contract audit
- Review request: remaining slices still need review before implementation
- Question: none for this run
- Status JSON: partial sync updated, baseline unchanged
- Verification: tests/Biome/typecheck/curl/Browser/check-complete
- Baseline: unchanged

Timeline:
- 2026-06-02 Accepted route decision and implemented Plate-owned `/r/registries.json`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Registry directory route implemented and verified. |
| Where am I going? | Closeout. |
| What is the goal? | Add and verify Plate-owned `/r/registries.json` without advancing the full shadcn baseline. |

Open risks:
None for the route slice; larger non-route shadcn slices remain review-gated.
