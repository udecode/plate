# Registry kits, installation and command presentation

Page: https://claude.ai/artifact/1EhfrCFMuTzLAoZHoRiZSF

How Plate's copied registry UI installs into an app and who owns kit membership, install metadata and menu and toolbar policy. The ledger asks for the smallest copied composition contract that keeps kit membership, installation metadata and toolbar policy explicit. The 2026-09-18 Pursue landed: the registry's `transforms.ts` is gone, Base and Radix dropdown items carry item-scoped `finalFocus`, and feature plugins own typed insert and upsert through one private `blockInsertion` policy. Its slash-ui-actions proof ran then and is historical now. The 2026-10-04 review (`2026-10-04-ui-audit-2`) found one gap left: the build derives package dependencies from each copied file's imports, but for registry-item edges it only checks that the author already listed the edge the import needs, so authored `registryDependencies` mix import facts with install intent. Its law is `docs/vision/plate.md`, the registry install bullet that starts "Derive required package and registry-item dependencies", and `docs/research/decisions/registry-ui-ownership.md`.

## Public API

A registry author declares each copied item in `registry-features.ts`, listing the registry items it installs beside it.

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
  registryDependencies: ['@plate/inline-combobox'],
  type: 'registry:component',
```

## Main changes

- `apps/www/src/registry/registry-*.ts` hold the authored registry items: files, `dependencies`, `registryDependencies`, targets, styles and docs metadata.
- `apps/www/scripts/registry-package-dependencies.mts` parses each copied file's imports. It derives npm package requirements and Plate and Plite entrypoint peers from the package DAG. For a relative or `@/` import it resolves the unique registry item that owns the target and throws `missing direct registry dependency` unless the author listed that item; for `@/components/ui/*` it throws unless the shadcn item is listed. `apps/www/scripts/build-registry.mts` runs it and writes the one generated metadata snapshot that build, preview, docs and installers read.
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
