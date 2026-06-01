# Fumadocs llms.txt

Objective:
Add Fumadocs-style LLM docs endpoints to the Plate docs app by upgrading the
docs Fumadocs packages, serving `/llms.txt` from the upstream `llms(source)`
helper, serving `/llms-full.txt` plus existing per-page `.md` routes from a
Plate-owned lightweight raw-MDX source, and recording the choice as a
`sync-shadcn` docs-engine fork.

Completion threshold:
Done when `apps/www` uses latest Fumadocs core/MDX packages, `/llms.txt`,
`/llms-full.txt`, English `.md`, and CN `.md` route tests pass, docs source
parity and registry source checks pass, TypeScript passes for the docs app, the
sync-shadcn dashboard records the forked docs-engine row, and live HTTP checks
return text for both LLM endpoints.

Verification surface:
- `bun test 'src/app/(app)/llms.txt/route.test.ts' 'src/app/(app)/llms-full.txt/route.test.ts' 'src/app/(app)/llm/[[...slug]]/route.test.ts' 'src/app/cn/llm/[[...slug]]/route.test.ts'`
- `pnpm --filter www typecheck`
- `pnpm exec biome check ... --fix`
- `pnpm sync-shadcn dashboard`
- `curl http://localhost:3010/llms.txt`
- `curl http://localhost:3010/llms-full.txt`

Constraints:
Keep Plate docs content, CN fallback, registry context, no-v0 policy, and docs
shell ownership. Do not broaden the change into a Zod v4 migration or full docs
route rewrite.

Boundaries:
- Source of truth: `apps/www` docs app plus `docs/sync/shadcn/deltas.json`.
- Allowed edit scope: Fumadocs deps, LLM route helpers/routes/tests, Fumadocs
  generated-source import compatibility, and sync-shadcn dashboard data.
- Browser surface: text routes only.
- Tracker sync: sync-shadcn dashboard row.
- Non-goals: Fumadocs UI adoption, shadcn docs content replacement, Zod v4 app
  migration, and processed-markdown generation across the full Plate corpus.

Blocked condition:
No blocker remains. If live Next dev route proof had kept hanging after cache
clear and lightweight source isolation, the work would have stopped for a
Turbopack/runtime investigation.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `sync-shadcn` and `autogoal` instructions read before mutable sync state and package work |
| Active goal checked | yes | Existing active goal reused because the implementation path changed but the LLM endpoint objective stayed valid |
| Source of truth read | yes | Fumadocs package docs, local package exports, shadcn decisions, status, and deltas read |
| Output budget strategy | yes | Searches were scoped to Fumadocs, LLM routes, sync-shadcn files, and docs app owners |
| Browser route identified | yes | `/llms.txt` and `/llms-full.txt` on docs dev server |

Work Checklist:
- [x] Objective, threshold, verification, constraints, boundaries, and blocked condition recorded.
- [x] Fumadocs latest package upgrade applied to `apps/www`.
- [x] Fumadocs v15 generated source entrypoint migration handled via `collections/server`.
- [x] `/llms.txt` implemented with upstream `llms(source).index('en')`.
- [x] `/llms-full.txt` and per-page `.md` routes use lightweight raw-MDX source to avoid compiling the docs corpus for text endpoints.
- [x] Zod v4 migration rejected as too broad for this slice; app remains on existing Zod pin.
- [x] Sync-shadcn docs-engine fork row recorded and dashboard regenerated.
- [x] Focused tests, typecheck, formatting, dashboard generation, and live HTTP route proof completed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused route tests and docs app typecheck | route tests and `pnpm --filter www typecheck` passed |
| TypeScript changed | yes | Run docs app typecheck | `pnpm --filter www typecheck` passed |
| Package manifests changed | yes | Install/update lockfile and run app checks | `pnpm --filter www add ...`; typecheck passed |
| Docs or content changed | yes | Regenerate sync dashboard | `pnpm sync-shadcn dashboard` passed |
| Browser surface changed | yes | Verify text routes over HTTP | curl checks for `/llms.txt` and `/llms-full.txt` returned `200 OK` text |
| Autoreview | no | Scope is narrow and covered by package/type/test/live route gates | recorded as not applicable for this small endpoint slice |
| Goal plan complete | yes | Run autogoal completion checker | checker passed before closeout |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Fumadocs docs, package exports, shadcn decisions read | implementation |
| Implementation | complete | Package upgrade, LLM source, routes, tests, sync row | verification |
| Verification | complete | tests, typecheck, biome, dashboard, curl | closeout |
| Closeout | complete | plan completed and goal ready to close | final response |

Verification evidence:
- `pnpm --filter www add fumadocs-core@16.9.3 fumadocs-mdx@15.0.10` completed; app Zod was returned to `3.25.61` to avoid broad registry/schema breakage.
- `bun test 'src/app/(app)/llms.txt/route.test.ts' 'src/app/(app)/llms-full.txt/route.test.ts' 'src/app/(app)/llm/[[...slug]]/route.test.ts' 'src/app/cn/llm/[[...slug]]/route.test.ts'` passed with 5 tests.
- `pnpm --filter www typecheck` passed, including docs source parity and registry source checks.
- `pnpm exec biome check ... --fix` passed with no fixes after final edits.
- `pnpm sync-shadcn dashboard` passed and opened `docs/sync/shadcn/dashboard.html`.
- `curl --max-time 30 http://localhost:3010/llms.txt` returned `200 OK` and the Fumadocs docs index.
- `curl --max-time 30 http://localhost:3010/llms-full.txt` returned `200 OK` and Plate full-page LLM markdown.

Reboot status:
Current implementation is complete. A clean docs dev server is running at
`http://localhost:3010` after clearing the stale `.next` cache.

Open risks:
Fumadocs 16 declares a Zod 4 peer while this app intentionally keeps Zod
3.25.61 because the wider app and registry schema types are not ready for a Zod
4 migration. This is recorded as a contained package-peer caveat, not a runtime
failure in the verified docs app checks.
