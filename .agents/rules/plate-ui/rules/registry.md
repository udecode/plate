# Registry Wiring

## Contents

- Kits and UI items stay aligned
- Examples preserve teaching intent
- Style deps are real deps

`docs/vision/plate.md` holds the registry dependency law: dependencies derive
from source, and authored metadata covers only installation policy that source
cannot express.

`apps/www/scripts/registry-package-dependencies.mts` derives every registry
edge a copied import needs: `@plate/<item>` from a relative or other `@/`
import of another item's file, and the shadcn name from
`@/components/ui/<name>`. It also derives each npm package and the version
range the package DAG gives it. Never list a registry edge an import already
gives, or a bare package name whose derived version has a range; the build
rejects both and names the import. Author `registryDependencies` only for what
no import shows: a style or CSS item, a companion such as a feature's toolbar
button, a bundle, a provider, or the one owner to pick when two published items
install the same imported file and no other import already installs one of
them.

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

- the example's `registryDependencies` names that feature kit, or the build
  derives that edge from the example's import;
- the example exists to teach that feature's installation or component
  binding;
- removing it would hide which descriptor owns the visible feature.

```tsx
plugins: [...plugins, FeaturePlugin.configure({ component: FeatureElement })];
```

The example may import that host-owned plugin array only when its registry
metadata explicitly depends on `editor-kit`. Other independently installable
registry items stay generic: use core editor hooks and descriptor portals,
never host editor types, application-definition modules, or root plugin
namespaces. `editor-kit` is the registry item name, not an application runtime
API or application type owner.

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
registryDependencies: ["editor-kit"];
```

when the example also depends on a shared style token.

**Correct:**

```ts
registryDependencies: ["editor-kit", "highlight-style"];
```
