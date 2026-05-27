# Registry Wiring

## Contents

- Kits and UI items stay aligned
- Examples need explicit deps
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
