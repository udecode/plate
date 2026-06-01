# sync shadcn highlight code cache

Objective:
Apply the dashboard payload `mdx/highlight-code-cache: pending -> synced` by
adding upstream-style bounded Shiki output caching to Plate `highlightCode`,
preserving Plate `highlightFiles`, verifying the app, updating
`docs/sync/shadcn/deltas.json`, and regenerating the dashboard.

Flow mode:
one-shot execution. The user explicitly accepted this dashboard row through
`$sync-shadcn apply`.

Goal plan:
docs/plans/2026-05-30-sync-shadcn-highlight-code-cache.md

Primary template:
docs/plans/templates/sync-shadcn.md

Completion threshold:
Complete when `highlightCode` uses a SHA-256 keyed LRU cache with a one-hour
TTL, `highlightFiles` still highlights registry files by path-derived language,
`lru-cache` is a direct `apps/www` dependency, focused verification passes, and
the dashboard row is marked `synced`.

Verification surface:
- Source audit:
  `apps/www/src/lib/highlight-code.ts`, `apps/www/package.json`,
  `docs/sync/shadcn/deltas.json`, and `docs/sync/shadcn/dashboard.json`.
- Upstream reference:
  `../shadcn/apps/v4/lib/highlight-code.ts`.
- Commands:
  `pnpm install`, `pnpm --filter www typecheck`, `pnpm lint:fix`,
  `bun test 'apps/www/src/app/api/registry-source/[name]/route.test.ts'`,
  `pnpm sync-shadcn dashboard`,
  `node --check .agents/rules/sync-shadcn/scripts/build-dashboard.mjs`, and
  JSON parse for `deltas.json` plus `dashboard.json`.

Constraints:
- Do not run `build:registry`.
- Do not advance `lastSyncedCommit`; this is one dashboard item, not full-range
  accounting.
- Do not mutate rows not listed in the copied dashboard payload.
- Keep Plate `highlightFiles` and registry/source preview behavior.
- Do not copy shadcn command metadata from upstream `highlight-code.ts`; Plate
  owns command metadata through `rehype-npm-command.ts`.

Boundaries:
- Edited `apps/www/src/lib/highlight-code.ts` to add cache behavior.
- Edited `apps/www/package.json` and lockfile through `pnpm install` because
  `lru-cache` is a runtime import.
- Edited `docs/sync/shadcn/deltas.json` only for
  `mdx/highlight-code-cache`.
- Regenerated `docs/sync/shadcn/dashboard.html` and
  `docs/sync/shadcn/dashboard.json`.

Output budget strategy:
Used focused source reads and capped command output. No upstream patch files or
new sync run artifacts were written.

Blocked condition:
Blocked only if install, typecheck, lint, registry-source test, dashboard
generation, JSON parse, or source audit failed after a focused repair attempt.

Sync state:
- base commit:
  `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2` from
  `docs/sync/shadcn/status.json`.
- planned commit:
  `efdec3ca4523e5edd8a714f633002a7addc203a1` from
  `docs/sync/shadcn/status.json`.
- range kind: dashboard-row implementation.
- run directory: N/A; apply mode must not write new run artifacts.
- implementation status: done.
- baseline status: unchanged.

Current verdict:
- verdict: synced.
- confidence: high.
- recommended next owner: sync-shadcn dashboard.
- reason: Plate now caches Shiki HTML output with a bounded LRU while keeping
  registry file highlighting.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `autogoal` loaded and active goal checked/created | yes | `create_goal` created active row-sync goal |
| `sync-shadcn` skill/rule read | yes | user supplied `sync-shadcn` skill; apply semantics followed |
| Output budget strategy recorded before broad upstream commands | yes | no broad upstream commands used |
| `docs/sync/shadcn/status.json` read | yes | baseline `4a4dc8e`, planned `efdec3c` |
| `docs/sync/shadcn/decisions.md` read | N/A | row behavior came from accepted dashboard payload and local source evidence |
| Prior migration plans/solution notes checked | yes | memory noted registry-source highlighting verification lane |
| `../shadcn` clone exists and was fetched/pulled intentionally | N/A | no fetch needed for accepted dashboard-row apply; local upstream file inspected |
| Base and target refs resolved to exact SHAs | N/A | row apply does not recompute range; status SHAs recorded above |
| Base ancestry or ref problem proven | N/A | not a range-planning run |
| Planning-only vs implementation mode decided | yes | implementation mode from `$sync-shadcn apply` `pending -> synced` |
| User-review boundary recorded | yes | user explicitly accepted the row |

Work Checklist:
- [x] Objective, threshold, verification surface, constraints, boundaries, and
      blocked condition are filled from the active goal.
- [x] Upstream range recorded with exact base SHA and target SHA; N/A for
      recomputed range because this is dashboard-row apply mode.
- [x] Run directory created under `docs/sync/shadcn/runs/`; N/A because apply
      mode must not write new run artifacts.
- [x] Complete upstream inventories saved; N/A because this is not range
      planning.
- [x] Focused upstream/Plate files inspected and summarized; no `.patch` files
      were written.
- [x] Visual screenshots captured; N/A because this row is source-only cache
      behavior.
- [x] Changed upstream row classified; existing dashboard row supplied the
      classification.
- [x] Decision counts reconcile to upstream TSV; N/A for dashboard-row apply.
- [x] Recommended merge slice accepted by user through copied dashboard row.
- [x] Settled exclusions and Plate forks preserved.
- [x] No user question remained for this row.
- [x] `docs/sync/shadcn/status.json` update semantics recorded: unchanged.
- [x] Workspace authority recorded for each verification command or artifact.
- [x] Output budget discipline followed.
- [x] Final handoff shape filled before closeout.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove cache, dependency, dashboard state, and preserved `highlightFiles` | source audit, typecheck, lint, registry-source test, dashboard generation |
| Upstream range artifacts exist | N/A | Apply mode must not create range artifacts | no run artifact needed |
| Inventory completeness | N/A | Existing dashboard row is the mutation unit | row `mdx/highlight-code-cache` updated only |
| Decision accounting | yes | Mark accepted row synced after implementation | `deltas.json` row state is `synced` |
| Status JSON parse and semantics | yes | Keep baseline unchanged | status read; no status write |
| Source-backed Plate mapping | yes | Record local source evidence | cache and `highlightFiles` present in `apps/www/src/lib/highlight-code.ts` |
| Visual comparison screenshots | N/A | Source-only cache row | no screenshots needed |
| Planning-only no implementation edits | N/A | Accepted implementation mode | user applied `pending -> synced` |
| Accepted implementation verification | yes | Run focused verification | `pnpm --filter www typecheck`, `pnpm lint:fix`, registry-source route test |
| Browser surface changed | N/A | Server-side source behavior only | source and test proof |
| Package manifests, lockfile, or install graph changed | yes | Run install and relevant checks | `pnpm install`; typecheck/lint passed |
| Agent rules or skills changed | N/A | No `.mdc` or generated skill edited | dashboard script only executed |
| CI-controlled generated output | yes | Avoid registry/template output | no `build:registry`; only dashboard regenerated |
| Baseline advancement | yes | Do not advance baseline | `status.json` unchanged |
| User review boundary | yes | Accepted dashboard row implemented | `$sync-shadcn apply` payload |
| Output budget discipline | yes | Keep evidence capped | no broad patch artifacts |
| Goal plan complete | yes | Run autogoal check | command recorded below |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and baseline read | done | status and accepted dashboard row read | complete |
| Upstream row evidence | done | upstream `highlight-code.ts` inspected | complete |
| Implementation | done | SHA-256 LRU cache added and `highlightFiles` preserved | complete |
| Dashboard state | done | `deltas.json` row synced and dashboard regenerated | complete |
| Verification | done | install, typecheck, lint, route test, dashboard, JSON parse, source audit | complete |
| Closeout | done | final handoff ready | complete |

Decision counts:
| Decision | Count | Notes |
|----------|------:|-------|
| `synced` | 1 | `mdx/highlight-code-cache` |
| `no-op` | 0 | no extra rows touched |

Recommended merge slices:
| Order | Slice | Class | Files | Why | Verification |
|------:|-------|-------|-------|-----|--------------|
| 1 | Add bounded cache to `highlightCode` | synced | `highlight-code.ts`, `apps/www/package.json`, dashboard state | reduce repeated Shiki CPU work while preserving Plate registry highlighting | install, typecheck, lint, route test, dashboard generation |

Questions:
- None.

Findings:
- Plate had no direct cache and reran Shiki for repeated identical snippets.
- `lru-cache` was only transitive in Plate; importing it required a direct
  `apps/www` dependency.
- Plate `highlightFiles` remains the registry/source preview owner.

Decisions and tradeoffs:
- Used upstream cache shape: SHA-256 key, max 500 entries, one-hour TTL.
- Did not copy upstream command metadata transformer because Plate already owns
  command props in `rehype-npm-command.ts`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | | |

Verification evidence:
- `pnpm install`: passed; direct `lru-cache` dependency installed.
- `pnpm --filter www typecheck`: passed.
- `pnpm lint:fix`: passed; fixed one formatted file.
- `bun test 'apps/www/src/app/api/registry-source/[name]/route.test.ts'`:
  passed, 2 tests.
- `pnpm sync-shadcn dashboard`: passed and regenerated dashboard artifacts.
- `node --check .agents/rules/sync-shadcn/scripts/build-dashboard.mjs`:
  passed.
- JSON parse for `docs/sync/shadcn/deltas.json` and
  `docs/sync/shadcn/dashboard.json`: passed.
- `rg` source audit found `createHash`, `LRUCache`, `highlightCache.get`,
  `highlightCache.set`, direct `lru-cache` dependency, and preserved
  `highlightFiles`.

Reboot status:
No reboot needed. The task finished in the current thread with source,
dashboard, and verification evidence.

Open risks:
None for the accepted row. This does not settle the other pending MDX rows.

Final handoff:
- Row: `mdx/highlight-code-cache`.
- State: `synced`.
- Baseline: unchanged.
