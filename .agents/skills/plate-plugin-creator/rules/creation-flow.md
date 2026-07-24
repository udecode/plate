# Creation Flow

Choose semantic ownership before file topology.

## Contents

- Decision tree
- Semantic owners
- File owners
- False ownership evidence
- File placement
- Layer check

```text
Need a plugin or plugin refactor?
|
+- Does the behavior matter without React?
|  |
|  +- yes -> `src/lib`
|  |   +- `createBasePlugin`
|  |   +- real React job later? -> thin `toPlatePlugin` wrapper
|  |   +- no React job? -> keep base-only
|  |
|  +- no -> `src/react`
|      +- only groups complete plugins? -> app/registry kit array
|      +- genuinely hook/DOM/component-native? -> `createPlatePlugin`
|
+- For every proposed source file:
|  |
|  +- exactly one production owner?
|  |   +- yes -> inline in that plugin/component/test-family owner
|  |
|  +- multiple callers can reuse the scoped plugin API?
|  |   +- yes -> keep implementation inline; callers use the portal
|  |
|  +- real cross-plugin, cross-layer, standalone, or proof owner?
|      +- yes -> separate file with that owner
|      +- no  -> inline
|
+- Public call shape or capability identity changes?
|  +- yes -> `best-api`
|
+- Missing generic substrate?
   +- Plite gap -> patch/plan Plite owner
   +- Plate composition gap -> patch/plan Plate owner
```

## Semantic Owners

### Semantic base plugin

Use `createBasePlugin` for document semantics, parsers, normalizers, injected
rules, update groups, and shared behavior contracts.

Do not split those implementation kinds into their own files when the plugin is
their only production owner.

### Plate/React wrapper

Use `toPlatePlugin` when the semantic base already exists and the remaining job
is component binding, hooks, node props, or Plate-only integration.

The wrapper must stay thin. Do not copy or re-declare base behavior.

### Direct Plate plugin

Use `createPlatePlugin` only when:

1. the plugin is fundamentally hook- or `useHooks`-driven;
2. the behavior exists only at a DOM/editor surface;
3. the behavior only exists through React node props or components.

Grouping already-authored complete plugins is not a plugin. Keep that product
choice in an app or registry kit array; packages export the descriptors.

### Plite extension

Use `extendExtension` when the behavior is generic editor substrate. Install the
narrow command, normalizer, middleware, state, or extension primitive. Do not
wrap the editor root or hide substrate behavior in Plate event glue.

If several Plate plugins need the same generic primitive, that is evidence for
a Plite owner, not a shared Plate helper dump.

## File Owners

### Plugin owner

One plugin file may own:

- plugin declaration and real public contract types;
- options and schema/parser callbacks;
- API and tx builders;
- commands, corrections, decorators, normalizers, matchers, and handlers;
- plugin-only constants and implementation helpers.

File length is irrelevant. Extract only when another durable owner exists.

### Component family owner

One `<Family>.tsx` may own exported primitives plus family-only subcomponents,
hooks, state, stores, controllers, variants, constants, and render helpers.

A sibling import within the same family is internal composition, not reuse.

### Hook or state owner

Create `use<Family>.ts`, provider, or store files only when the lifecycle has a
standalone public job or is independently consumed by multiple durable
component families.

### Test-family owner

Keep one `<PluginName>.<family>.spec.tsx` for one behavior family. Separate slow
or integration proof only when measured runtime or an independent proof
boundary justifies it.

## False Ownership Evidence

None of these justify another source file:

- public export or direct import;
- documentation entry;
- old filename or barrel;
- tests;
- line count or readability preference;
- implementation kind such as query, transform, hook, or utility;
- multiple callers that can use the owning scoped API;
- hypothetical future reuse.

## File Placement

- Keep feature `src/react` roots flat unless a directory is a durable subsystem
  with several cross-family owners.
- Do not create `internal/` merely because code is private. Privacy is not
  ownership.
- Do not create taxonomy folders merely to shorten a large owner file.
- Delete obsolete helper files and regenerate barrels after colocation.

## Layer Check

Before writing code, answer:

1. Which behavior is generic Plite substrate?
2. Which behavior is Plate plugin/product composition?
3. Which one file owns each single-owner behavior?
4. Which proposed extraction has a real independent consumer graph?
5. Which public shape needs a `best-api` verdict?
