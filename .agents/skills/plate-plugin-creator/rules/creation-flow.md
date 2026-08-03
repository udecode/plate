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
|  |   +- `defineBasePlugin`
|  |   +- static renderer? -> terminal `BasePlugin.configure`
|  |   +- real React job later? -> thin `toPlatePlugin` wrapper
|  |   +- no React job? -> keep base-only
|  |
|  +- no -> `src/react`
|      +- only groups complete plugins? -> app/registry kit array
|      +- genuinely hook/DOM/component-native? -> `definePlatePlugin`
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

Use `defineBasePlugin` for document semantics, parsers, normalizers, injected
rules, update groups, and shared behavior contracts.

The sole factory grammar is `defineBasePlugin(name, definition)` and
`definePlatePlugin(name, definition)`. Use the flat `PLUGINS` catalog for
first-party capability names. Element `type` and property `key` are separate
persisted identities that default to `name` when omitted and are immutable
after creation. Runtime AST work resolves the owning `.type`/`.key`; behavior
plugins expose neither.

Do not split those implementation kinds into their own files when the plugin is
their only production owner.

### Renderer binding

Base and Plate constructors accept root-level `component`; Base `.extend()`
does not. Static owners declare or terminally replace a server-safe component
without importing a Plate React entrypoint.

Use `toPlatePlugin` when the semantic base already exists and the remaining job
is publishing its reusable Plate-layer descriptor or adding genuine Plate-only
authoring such as a hook or live React callback. A terminal consumer never
inserts conversion merely to set `component`.

The wrapper must stay thin. Do not copy or re-declare base behavior.

### Direct Plate plugin

Use `definePlatePlugin` only when:

1. the plugin is fundamentally hook- or `useHooks`-driven;
2. the behavior exists only at a DOM/editor surface;
3. the behavior only exists through React node props or components.

Grouping already-authored complete plugins is not a plugin. Keep that product
choice in an app or registry kit array; packages export the descriptors.

### Plite extension

Plate constructors expose genuine editor-wide Plite substrate through flat
native fields such as `commands`, `corrections`, `contributions`, `on`, and
`readMiddleware`. Never hide those fields in a nested `extension` object.

Use `defineExtension` from `@platejs/plite` only for an independently
reusable standalone descriptor that composes as a dependency. If several Plate
plugins need the same generic primitive, that is evidence for a Plite owner,
not a shared Plate helper dump.

### Codec contribution

Keep a plugin's codec map in its semantic owner. Author it only through the
constructor's context-bound
`codecs: ({ defineCodecs }) => defineCodecs(map)` callback, or
`defineCodecs(TargetPlugin, map)` inside that callback when contributing to a
foreign descriptor. The context helper is the inference owner and injects
foreign targets; a codec map does not earn another file, builder stage, or
global helper. Keep it in `.extend()` only when it consumes a real capability
introduced by an earlier stage.

### Capability contribution

Use the canonical boundary from the parent skill before choosing a field:
`initialState` for defaults, `store` for live editor-local state, `selectors`
for pure store projections, `api` for non-snapshot plugin services, `read` for
pure supplied-state document queries, `update` for active-transaction document
mutation, flat native fields for genuine editor-wide Plite substrate, and
`codecs` for format declarations.

Put every independent contribution in the constructor. Use `.extend()` only
for imported/prebuilt adaptation, a shared factory unavailable to the
constructor, or a real earlier-capability type dependency. Keep `.configure()`
terminal and non-widening.

## File Owners

### Plugin owner

One plugin file may own:

- plugin declaration and real public contract types;
- initial state, selectors, and schema/parser/codec callbacks;
- API, read, and update builders;
- commands, corrections, decorators, normalizers, matchers, and prefixless
  `on` callbacks;
- plugin-only constants and implementation helpers.

File length is irrelevant. Extract only when another durable owner exists.

### Component family owner

One `<Family>.tsx` may own exported primitives plus family-only subcomponents,
variants, constants, and render helpers.

A sibling import within the same family is internal composition, not reuse.

### Hook or state owner

When a component family has hooks, keep every related public and private hook
in one `use<Family>.ts[x]` file, including subcomponent-only hooks. Create a
provider or store file only when it owns independent state or lifecycle.

### Test-family owner

Keep one `<FooPlugin>.<family>.spec.tsx` for one behavior family. Separate slow
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
