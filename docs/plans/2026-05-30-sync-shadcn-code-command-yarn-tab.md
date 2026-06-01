# sync shadcn code command yarn tab

Objective:
Apply the dashboard payload `mdx/code-command-yarn-tab: pending -> synced` by
adding shadcn-equivalent yarn support to Plate command code blocks, verifying
the app, updating `docs/sync/shadcn/deltas.json`, and regenerating the
dashboard.

Flow mode:
one-shot execution. The user explicitly accepted this dashboard row through
`$sync-shadcn apply`.

Goal plan:
docs/plans/2026-05-30-sync-shadcn-code-command-yarn-tab.md

Primary template:
docs/plans/templates/sync-shadcn.md

Completion threshold:
Complete when Plate command code blocks produce and render `yarn` alongside
`pnpm`, `npm`, and `bun`; focused app verification passes; the dashboard row is
marked `synced`; and `pnpm sync-shadcn dashboard` regenerates the dashboard.

Verification surface:
- Source audit:
  `apps/www/src/lib/rehype-npm-command.ts`,
  `apps/www/src/components/code-block-command.tsx`,
  `apps/www/src/components/typography.tsx`,
  `apps/www/src/components/copy-button.tsx`,
  `apps/www/src/types/unist.ts`,
  `apps/www/src/hooks/use-config.ts`,
  `apps/www/src/components/codeblock.tsx`,
  `apps/www/src/components/block-viewer.tsx`, and
  `apps/www/src/app/(app)/_components/installation-code.tsx`.
- Upstream reference:
  `../shadcn/apps/v4/components/code-block-command.tsx` and
  `../shadcn/apps/v4/lib/highlight-code.ts`.
- Commands:
  `pnpm --filter www typecheck`, `pnpm lint:fix`,
  `pnpm sync-shadcn dashboard`,
  `node --check .agents/rules/sync-shadcn/scripts/build-dashboard.mjs`, and
  JSON parse for `deltas.json` plus `dashboard.json`.

Constraints:
- Do not run `build:registry`.
- Do not advance `lastSyncedCommit`; this is one dashboard item, not full-range
  accounting.
- Do not mutate rows not listed in the copied dashboard payload.
- Keep Plate command prop names and copy analytics.
- Keep screenshots absent for this source-only row.

Boundaries:
- Edited Plate command block and copy-command sources only where yarn support
  is required.
- Edited `docs/sync/shadcn/deltas.json` only for
  `mdx/code-command-yarn-tab`.
- Regenerated `docs/sync/shadcn/dashboard.html` and
  `docs/sync/shadcn/dashboard.json`.
- Fixed two lint blockers surfaced by `pnpm lint:fix`:
  duplicate defaults and `delete` in the dashboard builder, plus a hot regex in
  command menu.

Output budget strategy:
Used focused file reads and capped command output. No broad upstream patch files
were written.

Blocked condition:
Blocked only if `www` typecheck, lint, dashboard generation, JSON parse, or
source audit failed after the focused repair.

Sync state:
- base commit:
  `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2` from
  `docs/sync/shadcn/status.json`.
- planned commit:
  `efdec3ca4523e5edd8a714f633002a7addc203a1` from
  `docs/sync/shadcn/status.json`.
- latest inspected upstream app commit:
  `e2fa0101e3f0e28a5e360b93f41d1685911dd9ff`.
- range kind: dashboard-row implementation.
- run directory: N/A; apply mode must not write new run artifacts.
- implementation status: done.
- baseline status: unchanged.

Current verdict:
- verdict: synced.
- confidence: high.
- recommended next owner: sync-shadcn dashboard.
- reason: yarn is implemented at generation, rendering, persistence, and copy
  surfaces.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `autogoal` loaded and active goal checked/created | yes | `create_goal` created active row-sync goal |
| `sync-shadcn` skill/rule read | yes | user supplied `sync-shadcn` skill; apply semantics followed |
| Output budget strategy recorded before broad upstream commands | yes | no broad upstream commands used |
| `docs/sync/shadcn/status.json` read | yes | baseline `4a4dc8e`, planned `efdec3c`, partial sync count 7 |
| `docs/sync/shadcn/decisions.md` read | yes | confirms Plate command/docs policy and no baseline advancement |
| Prior migration plans/solution notes checked | yes | memory and dashboard row evidence scoped this as shadcn docs parity work |
| `../shadcn` clone exists and was fetched/pulled intentionally | N/A | no fetch needed for accepted dashboard-row apply; local upstream files inspected |
| Base and target refs resolved to exact SHAs | N/A | row apply does not recompute range; status SHAs recorded above |
| Base ancestry or ref problem proven | N/A | not a range-planning run |
| Planning-only vs implementation mode decided | yes | implementation mode from `$sync-shadcn apply` `pending -> synced` |
| User-review boundary recorded | yes | user explicitly accepted the row |

Work Checklist:
- [x] Objective, threshold, verification surface, constraints, boundaries, and
      blocked condition are filled from the active goal.
- [x] Upstream range recorded with exact base SHA, target SHA, commit dates,
      and target subject; N/A for recomputed range because this is dashboard-row
      apply mode.
- [x] Run directory created under `docs/sync/shadcn/runs/`; N/A because apply
      mode must not write new run artifacts.
- [x] Complete upstream inventories saved; N/A because this is not range
      planning.
- [x] Focused diffs inspected on demand and summarized; no `.patch` files were
      written.
- [x] Visual screenshots captured; N/A because the row is source-only command
      behavior.
- [x] Every changed upstream `apps/v4` row classified; N/A because existing
      dashboard row supplied the classification.
- [x] Decision counts reconcile to upstream TSV; N/A for dashboard-row apply.
- [x] Added, modified, and deleted groups summarized; N/A for dashboard-row
      apply.
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
| Named verification threshold | yes | Prove yarn generation/render/copy support and synced dashboard state | source audit, `rg`, typecheck, lint, dashboard generation |
| Upstream range artifacts exist | N/A | Apply mode must not create range artifacts | no run artifact needed |
| Inventory completeness | N/A | Existing dashboard row is the mutation unit | row `mdx/code-command-yarn-tab` updated only |
| Decision accounting | yes | Mark accepted row synced after implementation | `deltas.json` row state is `synced` |
| Status JSON parse and semantics | yes | Keep baseline unchanged | status read; no status write |
| Source-backed Plate mapping | yes | Record local source evidence | files listed above include `__yarnCommand__` and `yarn` config |
| Visual comparison screenshots | N/A | Source-only MDX command row | no screenshots needed |
| Planning-only no implementation edits | N/A | Accepted implementation mode | user applied `pending -> synced` |
| Accepted implementation verification | yes | Run focused verification | `pnpm --filter www typecheck`, `pnpm lint:fix` |
| Browser surface changed | N/A | Source behavior only; no browser proof required by row | source and typecheck proof |
| Package manifests, lockfile, or install graph changed | N/A | No package files changed | no install needed |
| Agent rules or skills changed | N/A | No `.mdc` or generated skill edited | dashboard script only |
| CI-controlled generated output | yes | Avoid registry/template output | no `build:registry`; only dashboard regenerated |
| Baseline advancement | yes | Do not advance baseline | `status.json` unchanged |
| User review boundary | yes | Accepted dashboard row implemented | `$sync-shadcn apply` payload |
| Output budget discipline | yes | Keep evidence capped | no broad patch artifacts |
| Goal plan complete | yes | Run autogoal check | command recorded below |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and baseline read | done | status and decisions read | complete |
| Upstream row evidence | done | upstream `CodeBlockCommand` and `highlight-code` inspected | complete |
| Implementation | done | yarn props, tabs, config, copy helpers added | complete |
| Dashboard state | done | `deltas.json` row synced and dashboard regenerated | complete |
| Verification | done | typecheck, lint, dashboard, JSON parse, source audit | complete |
| Closeout | done | final handoff ready | complete |

Decision counts:
| Decision | Count | Notes |
|----------|------:|-------|
| `synced` | 1 | `mdx/code-command-yarn-tab` |
| `no-op` | 0 | no extra rows touched |

Recommended merge slices:
| Order | Slice | Class | Files | Why | Verification |
|------:|-------|-------|-------|-----|--------------|
| 1 | Add yarn support to command code blocks | synced | command transform, MDX pre, command UI, copy helpers | match upstream command-manager coverage | `pnpm --filter www typecheck`; `pnpm lint:fix`; dashboard regeneration |

Questions:
- None.

Findings:
- Plate already had command tabs and copy helpers; they only lacked yarn at the
  prop-generation and UI surfaces.
- `pnpm lint:fix` exposed existing lint blockers in dashboard builder and
  command menu; fixed them so verification is green.

Decisions and tradeoffs:
- Used upstream package-manager coverage while preserving Plate prop names:
  `__yarnCommand__` instead of upstream `__yarn__`.
- Kept the row as `synced` because behavior is equivalent even though Plate's
  local names differ.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm lint:fix` failed on duplicate object keys, `delete`, and hot regex | 1 | Patch lint blockers directly | passed on rerun |

Verification evidence:
- `pnpm --filter www typecheck`: passed.
- `pnpm lint:fix`: passed after focused lint repairs.
- `pnpm sync-shadcn dashboard`: passed and regenerated dashboard artifacts.
- `node --check .agents/rules/sync-shadcn/scripts/build-dashboard.mjs`:
  passed.
- JSON parse for `docs/sync/shadcn/deltas.json` and
  `docs/sync/shadcn/dashboard.json`: passed.
- `rg` source audit found `__yarnCommand__` in transform, command UI, MDX
  pre, copy helpers, installation snippets, block viewer, type definitions, and
  dashboard JSON.

Reboot status:
No reboot needed. The task finished in the current thread with source,
dashboard, and verification evidence.

Open risks:
None for the accepted row. This does not settle the other pending MDX rows.

Final handoff:
- Row: `mdx/code-command-yarn-tab`.
- State: `synced`.
- Baseline: unchanged.
