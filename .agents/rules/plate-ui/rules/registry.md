# Registry Wiring

## Contents

- Kits and UI items stay aligned
- Examples need explicit deps
- Examples preserve teaching intent
- Style deps are real deps

---

## Kits and UI items stay aligned

When you add a new component:

- add the UI file entry in the right registry file
- add the base/live kit entries if applicable
- make sure kit `registryDependencies` point at the real node/ui items

Do not leave the registry half-wired.

---

## Examples need explicit deps

An example should depend on:

- the kit(s) it uses
- any extra component it imports directly
- any style registry item it needs

**Example:** if the example relies on `--highlight`, add `highlight-style`.

---

## Examples preserve teaching intent

Registry examples are copied documentation and installation surfaces, not
optimized host-app presets.

Do not remove an explicit feature plugin, kit, renderer binding, or dependency
merely because the application editor installed by the `editor-kit` registry
item also includes it. Keep the explicit declaration when:

- the example's `registryDependencies` names that feature kit;
- the example exists to teach that feature's installation or component
  binding;
- removing it would hide which descriptor owns the visible feature.

Terminal configurations derived from the same authored plugin compose in source
order. When the aggregate already contains that plugin, append the explicit
configuration so earlier fields survive and its later defined values win:

```tsx
plugins: [...plugins, FeaturePlugin.configure({ component: FeatureElement })];
```

The example may import that host-owned plugin array only when its registry
metadata explicitly depends on `editor-kit`. Other independently installable
registry items stay generic: use core editor hooks and descriptor portals,
never host editor types, application-definition modules, or root plugin
namespaces. `editor-kit` is the registry item name, not an application runtime
API or application type owner.

`editor-kit` owns the copied plugin composition only. Do not colocate a fixed
persisted schema ID, migration chain, historical fingerprint, or default
`migrations` option with that reusable composition. Put lineage and upgrade
policy in the actual host persistence owner or a dedicated migration example.
Generated editor typing derives the current schema from the plugin tuple and
does not require named persisted identity.

Do not use this for unrelated plugins or divergent authoring branches that
merely share a name; Core rejects those collisions.

Before deduplicating example setup, compare the source with
`registry-examples.ts`, its feature kit, and the independently copied install
shape. Runtime duplication proves the aggregate needs filtering; it does not
prove the explicit teaching declaration is redundant.

---

## Style deps are real deps

If a component uses shared CSS vars or style-only registry items, declare them.

**Incorrect:**

```ts
registryDependencies: ["editor-kit"];
```

when the example also depends on a shared style token.

**Correct:**

```ts
registryDependencies: ["editor-kit", "highlight-style"];
```
