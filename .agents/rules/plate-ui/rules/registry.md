# Registry Wiring

## Contents

- Kits and UI items stay aligned
- Examples preserve teaching intent
- Style deps are real deps

`VISION.md` owns the registry direction. Metadata lives in
`apps/www/src/registry/registry-*.ts`.

Declare npm `dependencies` and `registryDependencies` for the files each item
installs. Compare metadata with imports, shared styles, kits and companion
components. Use `@plate/<item>` for Plate items and existing shadcn dependency
names for upstream components.

`apps/www/scripts/registry-dependencies.mts` normalizes dependency specifiers
and public URLs. It does not derive missing edges from imports. Update authored
metadata when imports or installation policy change.

## Kits and UI items stay aligned

When you add a new component:

- add the UI file entry in the right registry file
- add the base/live kit entries if applicable.

Do not leave the registry half-wired.

When a migration changes feature ownership, audit retained source files and
registry items before final wiring. Count terminal production consumers from
the migrated graph; tests, docs, exports, generated metadata, changelog history,
and the old item name do not count. A renderer or helper with one feature owner
moves into that feature file, and its obsolete registry item and dependency are
deleted. Keep a sibling item only when it still has an independently installable
main component or another durable owner with its own consumers and proof.

## Examples preserve teaching intent

Registry examples are copied documentation and installation surfaces, not
optimized host-app presets.

Do not remove an explicit feature plugin, kit, renderer binding, or dependency
merely because the application editor installed by the `editor-kit` registry
item also includes it. Keep the explicit declaration when:

- the example's `registryDependencies` names that feature kit, or the example
  imports files that require the kit when copied;
- the example exists to teach that feature's installation or component
  binding;
- removing it would hide which plugin owns the visible feature.

```tsx
plugins: [...plugins, FeaturePlugin.withComponent(FeatureElement)];
```

An example importing the host-owned plugin array declares `@plate/editor-kit`
in its registry metadata. Independently installable items use public Plate
editor hooks and plugin contracts. Avoid coupling them to host editor types
or application-owned composition.

Before deduplicating example setup, compare the source with
`registry-examples.ts`, its feature kit, and the independently copied install
shape. Runtime duplication proves the aggregate needs filtering; it does not
prove the explicit teaching declaration is redundant.

The generated registry index `apps/www/src/__registry__/index.tsx` is runtime UI: only `apps/www/src/lib/registry-component.tsx` and client preview components import it, never `source.config.ts`, a route handler or a registry JSON builder. A registry item that this index puts in the server graph is server-safe or opens with `'use client'`; never add `'use client'` to a package entrypoint, or move it into package modules, to silence that build error.

---

## Style deps are real deps

If a component uses shared CSS vars or style-only registry items, declare them.
No import shows a style dependency, so it stays authored.

**Incorrect:**

```ts
registryDependencies: ["@plate/editor-kit"];
```

when the example also depends on a shared style token.

**Correct:**

```ts
registryDependencies: ["@plate/editor-kit", "@plate/highlight-style"];
```
