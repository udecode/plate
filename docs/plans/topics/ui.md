# Registry kits, installation and command presentation

Page: https://claude.ai/artifact/WEzA582D2wBjBdtc7jZgRT

How Plate's copied registry UI installs into an app and who owns kit membership, install metadata and menu and toolbar policy. The ledger asks for the smallest copied composition contract that keeps kit membership, installation metadata and toolbar policy explicit. The 2026-09-18 Pursue landed. The registry's `transforms.ts` is gone, Base and Radix dropdown items carry item-scoped `finalFocus`, and feature plugins own typed insert and upsert through one private `blockInsertion` policy. Its slash-ui-actions proof ran then and is historical now. The 2026-10-04 review (`2026-10-04-ui-audit-2`) found one gap left, authored `registryDependencies` that mixed import facts with install intent, and `docs/plans/2026-10-08-ui-review.md` closed it. The build now derives every registry edge and package version that copied imports need, and authored lists hold only install policy: styles, companions, bundles, providers and owner picks. Its proof is shadcn's own resolver run over every published item in all 16 styles, with no new app built, because a separate `dnd.tsx` tooltip error stopped the first one. Its law is `docs/vision/plate.md`, the registry install bullet that starts "Derive required package and registry-item dependencies", and `docs/research/decisions/registry-ui-ownership.md`.

## Public API

A registry author declares each copied item in `registry-features.ts`; the build derives `@plate/inline-combobox` from `slash.tsx`'s `./inline-combobox` import.

```ts
// apps/www/src/registry/registry-features.ts
{
  dependencies: ['platejs'],
  files: [
    {
      path: 'components/editor/slash.tsx',
      type: 'registry:component',
    },
  ],
  name: 'slash',
  type: 'registry:component',
```

## Main changes

- `apps/www/src/registry/registry-*.ts` hold the authored registry items: files, `dependencies`, targets, styles, docs metadata and the install policy in `registryDependencies` that no import shows. Docs-only items (`meta.registry: false`) keep full hand-written lists.
- `deriveRegistryDependencies` in `apps/www/scripts/registry-package-dependencies.mts` parses each published item's copied imports. It derives npm package requirements with the version ranges the package DAG gives, and every `@plate/*` and shadcn registry edge, emitted after the authored policy edges. It rejects an authored edge that the item's own import already gives, and an authored bare package name whose derived version has a range. A shared imported file settles through an owner another import derives, or needs exactly one authored pick. `apps/www/scripts/build-registry.mts` runs it and writes the one generated metadata snapshot that build, preview, docs and installers read.
- `apps/www/src/lib/rehype-utils.ts` reads a bare dependency edge as a shadcn item, and `apps/www/scripts/check-registry-source.mts` rejects a bare edge that names no shadcn item. Docs install commands quote any package request that holds shell syntax (`toShellPackageArguments` in `apps/www/src/lib/registry-install.ts`).
- `apps/www/src/registry/components/editor/plugins.ts` and `plugins-static.ts` own live and static kit membership as app source.
- `apps/www/src/registry/bases/{base,radix}/dropdown-menu.tsx` own the menu focus lifecycle through item-scoped `finalFocus`.
- `packages/platejs/src/internal/plugin/blockInsertion.ts` is the one private policy behind each feature plugin's typed insert and upsert; there is no universal command catalog.

## What other editors do

Read from source at shadcn `ee628d75d` and ReUI `0daf79df`; neither was run. A search of Tiptap (`91c51be53`) and BlockNote (`1e26f1c`) for `registryDependencies` finds nothing, so neither appears to ship a copied-source registry (inferred). Lexical was not searched.

| Registry | npm dependencies | Registry-item edges |
| --- | --- | --- |
| shadcn | `shadcn build` reads each file's imports and adds the npm packages (`shadcn-ui/ui@ee628d75d:packages/shadcn/src/registry/utils.ts:62`) | Authored by hand in `_registry.ts` (`shadcn-ui/ui@ee628d75d:apps/v4/registry/new-york-v4/ui/_registry.ts:29`); local imports are copied into the item as files, not turned into edges |
| ReUI | Derived from imports at build | Derived from `@/registry/*` and `@/registry-reui/*` imports and unioned with the authored list (`keenthemes/reui@0daf79df:scripts/build-components.mts:213`, `keenthemes/reui@0daf79df:scripts/build-registry.mts:421`), so a stale authored edge still installs |
| Plate | Derived from imports and the package DAG | Authored; the build only rejects a missing edge |

## Open work

- Docs-only items (`meta.registry: false`) keep hand-written lists, so `registryDependencies` means a full list there and policy elsewhere. owner: zbeyens. stop: a review of the `ui` scope decides whether docs items get their own field, or 2026-11-08. Tracked here from `docs/plans/2026-10-08-ui-review.md`.
- Ambiguity picks are authored edges, which both bases share, so the two bases cannot pick different owners. No import needs an external-owner choice today (census). owner: zbeyens. stop: the analyzer reports an ambiguous import, or 2026-11-08. Tracked here from `docs/plans/2026-10-08-ui-review.md`.
- No standing check stops a later edge change from making an install depend on edge order, such as two items in one closure whose CSS rules both match an element, or `files-sdk@2.6.0` and `files-sdk@^2.6.0` meeting in a new closure. owner: zbeyens. stop: the owner asks for a standing `resolve-diff.mts` step in `pnpm check`, or 2026-11-08. Tracked here from `docs/plans/2026-10-08-ui-review.md`.
- 174 authored bare package names per base repeat a bare name the source derives (round-3 Opus seat). They change no install, but they are hand-listed facts the law says to derive. owner: zbeyens. stop: the owner says "reject bare duplicates", or 2026-11-08. Tracked here from `docs/plans/2026-10-08-ui-review.md`.
- `files-sdk@2.6.0`, an authored pin on `upload`, and the derived `files-sdk@^2.6.0` meet in some closures, where the first request wins; an offline check for two explicit specs of one package in one closure would guard it. owner: zbeyens. stop: the owner asks for that check, or 2026-11-08. Tracked here from `docs/plans/2026-10-08-ui-review.md`.
- The 58 kept policy edges (15 redundant, 43 component, file or lib) have no check that they are still wanted. owner: zbeyens. stop: the owner asks for a per-edge review, or 2026-11-08. Tracked here from `docs/plans/2026-10-08-ui-review.md`.
- The first new app build, `editor-basic` on base-nova, failed on the `hideWhenDetached` tooltip prop in `dnd.tsx`, which the Base UI tooltip lacks, and the other builds did not run (`docs/plans/artifacts/2026-10-08-ui-review/create-install-a1.log`). owner: zbeyens. stop: the spawned task "Fix dnd tooltip prop that breaks base installs" lands and `pnpm --filter www test:create-install editor-basic editor-ai` passes. Tracked here from `docs/plans/2026-10-08-ui-review.md`.
- `pnpm check knowledge` and `pnpm check www` fail on another session's uncommitted emoji work. owner: zbeyens. stop: that work commits, or 2026-10-15. Tracked here from `docs/plans/2026-10-08-ui-review.md`.
