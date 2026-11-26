# Registry and Install Protocol Parity (`parity`)

Use when mirroring, cloning, or matching shadcn's registry or install protocol.

## Core Contract and Ownership

Treat `../shadcn` as the source of truth for external registry/install protocol (never "inspired by shadcn"): upstream schema, resolver behavior, file/layout patterns, and namespace semantics come first; diverge only for a real repo constraint and state exactly why. For Plate-owned component/editor public APIs, upstream is evidence rather than a ceiling (use `best-api` when a better local surface is plausible).

Plate does **not** fork the shadcn CLI; fix registry data or Plate build/delivery code instead.

- **Shadcn owns the contract:** `RegistryItem` schema, third-party namespace semantics (`@acme/button`), resolver behavior (plain items, namespaced items, URLs, local files), local-file add behavior, `components.json` registry semantics, and `/create` command, preset encoding, provider/style names, theme values, and registry directory resolution.
- **Plate owns content and delivery:** registry source (`apps/www/src/registry/*`), custom build (`apps/www/scripts/build-registry.mts`), generated output (`apps/www/public/r`, `apps/www/public/rd`), `@plate` namespace, provider/style policy and create config (`apps/www/src/lib/plate-registry-*.ts`, `apps/www/src/lib/plate-create.ts`), and dynamic delivery (`apps/www/src/lib/registry-response.ts` and routes).
- **Plate `/create`:** builds pickers from shadcn's exported preset lists and codec (never hand-copied designer UI, theme values, or option lists). Installs call shadcn's `/init` directly (never a Plate `/init` proxy). The `/create` preview reads theme variables from `/init` via a Plate server route that sends no `track` and serves only the preview. Prove direct Base/Nova and Radix/Luma `shadcn create` installs against freshly built local Plate artifacts before changing the public create flow; treat npm and deployed registry directory as post-release smoke surfaces, not implementation gates.

## Registry Rules

Keep items close to upstream `RegistryItem`: inspect `../shadcn` first, copy upstream file/layout/helper patterns when they fit, prefer upstream naming/dependency structure, and keep dynamic Plate logic in build/response tooling rather than a fake data model.

Dependency rules:

- Bare shadcn edges (e.g., `button`) derive from `@/components/ui/<name>` imports; author explicitly only for install policy absent from imports, using the bare upstream name.
- Prefer upstream namespace syntax over raw URLs for non-default registries when covered.
- `@plate/*` edges derive from copied imports; author explicitly only for install policy absent from imports.
- Public generated item JSON must rewrite Plate self-dependencies to same-base URLs (e.g., `https://platejs.org/r/*.json`) so direct URL installs resolve transitive Plate items from the same base.
- Accept legacy localhost, absolute Plate item URLs, and `@shadcn/*` as compatibility input only; never write `@shadcn/*` in Plate registry source or generated output, and never expand compat hacks into conventions.
- If upstream lacks a small standalone item, create a small Plate item instead of pulling a huge upstream dependency for one internal file.

## Scope Boundary and Current Divergences

Post-release template output is outside protocol parity: never inspect, modify, or gate parity on `templates/**`, template `components.json`, `tooling/scripts/update-template*.sh`, or local template mirror prep. `.github/workflows/release.yml` syncs templates after publish; audit upstream `components.json`/URL/local-file resolver semantics, not post-release template consumers, unless explicitly asked for that separate release/sync scope.

Existing divergences (constraints, not patterns to spread): Plate publishes its registry from `apps/www` rather than upstream shadcn infrastructure, and older generated output may still hold absolute Plate self-URLs (compat input only).
