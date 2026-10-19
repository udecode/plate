# Sync Shadcn Latest 4a4dc8e..cd54e09

## Range

- Upstream repo: `shadcn-ui/ui`
- Upstream app: `../shadcn/apps/v4`
- Base: `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2` (tracked `lastSyncedCommit`)
- Previous planned target: `efdec3ca4523e5edd8a714f633002a7addc203a1`
- Target: `cd54e0927f3853a777f700a0bbf34507cf697b9c` (2026-06-01, `registry: updated shadcnstudio registry url with style support (#10847)`)
- Plate app: `apps/www`
- Plate docs content: `content/docs`
- Status source: `docs/sync/shadcn/status.json`
- Artifact directory: `docs/sync/shadcn/runs/2026-06-02-4a4dc8e-to-cd54e09`
- Full upstream rows in range: 790
- Commits in `apps/v4` from base to target: 21
- Latest-only rows from previous plan to target: 56

## Summary

Recommendation: this range is complete and the sync baseline can advance to `cd54e0927f3853a777f700a0bbf34507cf697b9c`. The full range is dominated by upstream product/style churn: Rhea, generated style registries, create/theme surfaces, shadcn home cards, and shadcn release/docs content. Plate policy rejects or forks those surfaces.

The useful current work is smaller:

- micro-auto-merged the upstream `Button` secondary hover class into Plate
- accepted the `/r/registries.json` route concept with Plate-owned directory data only
- adopted `shadcn@4.10.0` after registry source checks, package tests, typecheck, and Browser/API proof
- reviewed GitHub registry support as a registry/docs concept and chose not to add Plate docs because the useful version-pinned registry workflow is already covered

Advance `lastSyncedCommit` to `cd54e0927f3853a777f700a0bbf34507cf697b9c`. All rows are now adopted, smart-merged, forked, excluded, or no-op with zero open questions.

## Status Counts

### Full Range Status Counts

| Key | Count |
| --- | ---: |
| `A` | 566 |
| `D` | 22 |
| `M` | 202 |

### Full Range Subsystem Counts

| Key | Count |
| --- | ---: |
| `assets` | 4 |
| `deps-config` | 1 |
| `docs-content` | 13 |
| `docs-engine` | 7 |
| `generated-registry-output` | 525 |
| `homepage` | 2 |
| `other` | 2 |
| `product-page` | 65 |
| `registry-build` | 5 |
| `registry-content` | 23 |
| `registry-contract` | 1 |
| `registry-directory` | 1 |
| `registry-route` | 1 |
| `shell-nav-sidebar` | 4 |
| `theme-style` | 136 |

### Full Range Decision Counts

| Key | Count |
| --- | ---: |
| `adopt-upstream` | 1 |
| `exclude-upstream` | 616 |
| `needs-question` | 0 |
| `no-op` | 126 |
| `plate-fork` | 14 |
| `smart-merge` | 33 |

### Latest-Only Subsystem Counts

| Key | Count |
| --- | ---: |
| `assets` | 2 |
| `deps-config` | 1 |
| `docs-content` | 12 |
| `docs-engine` | 1 |
| `generated-registry-output` | 14 |
| `homepage` | 2 |
| `registry-directory` | 1 |
| `theme-style` | 23 |

### Latest-Only Decision Counts

| Key | Count |
| --- | ---: |
| `adopt-upstream` | 1 |
| `exclude-upstream` | 4 |
| `needs-question` | 0 |
| `no-op` | 21 |
| `plate-fork` | 13 |
| `smart-merge` | 17 |

## Complete Upstream Inventory

Full inventory with every changed upstream path: [`inventory.md`](./inventory.md).

Source artifacts:

- [`upstream-name-status.tsv`](./upstream-name-status.tsv)
- [`upstream-numstat.tsv`](./upstream-numstat.tsv)
- [`upstream-commits.txt`](./upstream-commits.txt)
- [`upstream-latest-name-status.tsv`](./upstream-latest-name-status.tsv)

No patch artifacts were written. Inspect focused upstream diffs on demand with capped `git -C ../shadcn diff ...` commands.

## Added Files

- 566 added rows.
- Most added rows are Rhea/generated style output and shadcn product surfaces, all excluded from Plate by current policy.
- Accounted rows:
  - `apps/v4/app/r/registries.json/route.ts`: accepted as `apps/www/src/app/r/registries.json/route.ts` with Plate-owned directory data.
  - `apps/v4/content/docs/registry/github.mdx`: reference-only upstream docs for GitHub registries; Plate should not copy it unless a Plate registry docs slice is accepted.
  - `apps/v4/public/images/full-dark.png` and `apps/v4/public/images/full-light.png`: shadcn home mobile fallback images, excluded for Plate home.

## Modified Files

- 202 modified rows.
- Micro auto-merged row group:
  - `apps/v4/styles/{base,radix}-*/ui/button.tsx`: upstream replaced `hover:bg-secondary/80` with `hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]`; Plate applied the same fix to `apps/www/src/components/ui/button.tsx`.
- Accounted rows:
  - `apps/v4/package.json`: adopted `shadcn@4.10.0` in `apps/www/package.json` and `pnpm-lock.yaml`.
  - `apps/v4/registry/directory.json`: directory concept accepted through Plate-owned `@plate` metadata in `apps/www/src/lib/plate-registry-config.ts`; upstream external registry content is not copied.
  - `apps/v4/public/schema.json`: registry contract signal; validate through `shadcn/schema` and source checks rather than copying generated schema output.
  - `apps/v4/scripts/build-registry.mts`, `apps/v4/scripts/validate-registries.mts`, `apps/v4/registry/config.ts`, `apps/v4/registry/__index__.tsx`, `apps/v4/registry/styles.tsx`: registry build/validation patterns to audit without running local `build:registry`.
- Plate-owned forks:
  - `apps/v4/content/docs/**` registry/changelog docs stay reference-only.
  - `apps/v4/app/(app)/(root)/page.tsx`, `components/announcement.tsx`, and `lib/docs.ts` stay Plate-owned home/announcement/dot metadata.
  - `apps/v4/components/docs-sidebar.tsx` stays a Plate sidebar fork.

## Deleted Files

- 22 deleted rows.
- 21 deleted rows are old upstream home demo components replaced by Rhea cards; Plate does not import them.
- `apps/v4/public/r/registries.json` deletion is covered by the accepted static route: Plate serves `/r/registries.json` from the app route instead of generated public JSON.

## Recommended Merge Slices

| Order | Slice | Class | Files | Why | Verification |
| ---: | --- | --- | --- | --- | --- |
| 1 | None for this range | `N/A` | N/A | The tracked range is accounted and baseline advances. | Run the next default `sync-shadcn` planning lane only after upstream moves past `cd54e09`. |

## Micro Auto-Merges

| Upstream file | Plate file | Change | Why direct | Verification |
| --- | --- | --- | --- | --- |
| `apps/v4/styles/{base,radix}-*/ui/button.tsx` | `apps/www/src/components/ui/button.tsx` | `secondary` hover class now uses `color-mix(in oklch, var(--secondary), var(--foreground) 5%)` instead of `secondary/80` | One-file overlapping primitive fix; no new file, dependency, route, generated output, or product judgment | `pnpm --filter www exec eslint src/components/ui/button.tsx --fix`; `pnpm --filter www typecheck`; Browser proof on `http://localhost:3003/docs/installation/plate-ui`: 14 rendered Button slots, 5 secondary variants with the new `color-mix` hover class, and no console warnings/errors |

## Accepted Partial Syncs

| Upstream file | Plate file | Change | Why selective | Verification |
| --- | --- | --- | --- | --- |
| `apps/v4/app/r/registries.json/route.ts` + `apps/v4/registry/directory.json` | `apps/www/src/app/r/registries.json/route.ts`, `apps/www/src/lib/plate-registry-config.ts` | Serve `/r/registries.json` as a static JSON directory containing only Plate's `@plate` registry metadata | Upstream route contract is useful; upstream external registry directory content is shadcn product data and stays excluded | `pnpm exec biome check apps/www/src/lib/plate-registry-config.ts apps/www/src/app/r/registries.json/route.ts apps/www/src/app/r/registries.json/route.test.ts --write`; `pnpm --filter www exec bun test src/app/r/registries.json/route.test.ts src/lib/plate-init.test.ts`; `pnpm --filter www typecheck`; curl and Browser proof on `http://localhost:3003/r/registries.json`: one `@plate` entry, no console warnings/errors |
| `apps/v4/package.json` | `apps/www/package.json`, `pnpm-lock.yaml` | Adopt `shadcn@4.10.0` | Upstream CLI/schema package bump validates against Plate registry source without pulling generated registry output or upstream product surfaces | `pnpm --filter www add shadcn@4.10.0`; `pnpm --filter www exec shadcn --version`; `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts`; `pnpm --filter www exec bun test src/lib/plate-init.test.ts src/lib/registry-install.test.ts src/app/r/registries.json/route.test.ts scripts/registry-dependencies.test.mts`; `pnpm --filter www typecheck`; Browser proof on `/r/registries.json` and `/init` |

## Explicit Exclusions

- Rhea, style registry, generated `base-rhea`/`radix-rhea`, create/theme, and old theme/customizer surfaces.
- Upstream homepage cards, dashboard fallback images, and announcement copy.
- Upstream shadcn changelog entries and registry prose as direct Plate docs content.
- Upstream generated public registry style output; Plate generated registry output remains source/CI-owned.
- Upstream external registry directory entries as Plate content; Plate serves only its own `@plate` registry entry.
- v0/create/charts/colors surfaces remain excluded by settled policy.

## Plate Forks To Preserve

- Plate home page, editor preview, Pro/Potion path, and product copy.
- Plate docs content, API MDX, CN docs, release data, and docs dot metadata.
- Plate sidebar accordion/filter UX.
- Plate registry content under `apps/www/src/registry/**` and `@plate/*` install command model.
- Lazy `/api/registry-source/[name]` code-view payload route.
- MCP, GA, Plate Plus/Pro hooks, package integration tests, and workspace source aliases.

## Smart Merge Details

- Package bump: adopted upstream shadcn CLI package level after registry source validation. Generated registry output was not pulled.
- Registry route: Plate serves a tiny static directory route with Plate-owned `@plate` metadata, not upstream external registry directory data.
- Registry docs: upstream is a concept reference only. No Plate docs note is needed in this range because current Plate docs already cover version-pinned GitHub registry URLs for local docs.
- Shell/doc primitives: continue existing partial-sync policy: smart-merge primitives, keep Plate product links, locale behavior, command-menu grouping, and sidebar scale behavior.

## Questions

No current product questions remain in this run. The `/r/registries.json` route is accepted as Plate-owned metadata only.

## Status Update Rule

Update `lastSyncedCommit`, `lastPlannedCommit`, `lastSyncPlan`, and `lastPlan` to `cd54e0927f3853a777f700a0bbf34507cf697b9c` / this plan. Mark the latest partial sync entry `baselineAdvanced: true` because all rows in the range are accounted.

## Suggested Next Step

No remaining slice in this range. Next action is a fresh `sync-shadcn` planning run only after upstream shadcn moves beyond `cd54e0927f3853a777f700a0bbf34507cf697b9c`.
