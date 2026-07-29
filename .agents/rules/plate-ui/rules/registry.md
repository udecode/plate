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
merely because an aggregate `EditorKit` also includes it. Keep the explicit
declaration when:

- the example's `registryDependencies` names that feature kit;
- the example exists to teach that feature's installation or component
  binding;
- removing it would hide which descriptor owns the visible feature.

Transparency is source-level, not duplicate runtime membership. When the
aggregate already contains the same descriptor, filter it out by descriptor
key and then explicitly add/configure it once:

```tsx
plugins: [
  ...EditorKit.filter((plugin) => plugin.key !== FeaturePlugin.key),
  FeaturePlugin.configure({ component: FeatureElement }),
]
```

Before deduplicating example setup, compare the source with
`registry-examples.ts`, its feature kit, and the independently copied install
shape. Runtime duplication proves the aggregate needs filtering; it does not
prove the explicit teaching declaration is redundant.

---

## Style deps are real deps

If a component uses shared CSS vars or style-only registry items, declare them.

**Incorrect:**

```ts
registryDependencies: ['editor-kit']
```

when the example also depends on a shared style token.

**Correct:**

```ts
registryDependencies: ['editor-kit', 'highlight-style']
```
