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
|  +- React behavior passes through a package wrapper?
|  |   +- trace to terminal product consumers
|  |       +- all copied registry UI + UI/product policy -> registry family/kit
|  |       +- independent owners or durable headless subsystem -> package
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

Grouping already-authored complete plugins is not a plugin. Package roots must
not export named plugin-array `*Kit` presets, including from facade packages.
Keep that product choice in an app or registry kit array; packages export or
reexport the individual descriptors. Encode truly inseparable structure through
one honest descriptor's `dependencies`, not a package array.

### Plite extension

Plate constructors expose genuine editor-wide Plite substrate through flat
native fields such as `commands`, `corrections`, `contributions`, `on`, and
`readMiddleware`. Never hide those fields in a nested `extension` object.

Use `defineExtension` from `plitejs` only for an independently
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

For a custom Plate-owned MDX element tag, destructure `schema: { type }` from
the codec context and use it for `from`, the decoded element `type`, and the
encoded MDX `name`. Keep external MDAST, HTML, and MDX syntax literal. Migrate
old persisted tags before codec dispatch instead of accepting two identities.
Resolve every other synthesized Plate wrapper or fallback through the installed
application schema; use literals only for external format nodes or when the
corresponding Plate plugin is genuinely absent.
Key one-operation decode overrides by the invariant plugin capability name and
encode overrides by persisted schema identity. Apply the same codec identity
checks to constructor and justified staged contributions.
Keep configurable custom MDX codecs on their schema-owning plugin; a foreign
target codec cannot bind the target's final application identity.
Enforce the available identity legs on decode-only and encode-only codecs. For
phrasing-only wrappers, decode external paragraph children directly instead of
unwrapping a decoded Plate element.
Keep fixed external source/name literals without weakening decoded Plate
identity. Spread parsed attributes before structural `children` and `type`.

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

Write the complete chain at its public export. Before keeping any private
plugin constant, inspect its production references. `typeof`, `ElementOf`,
`DefinitionOf`, and one downstream `.extend()` / `.configure()` chain are one
owner, not reuse. Derive public types after the final export. If the final type
is needed by a later capability, use a direct `.extend(({ plugin }) => ...)`
stage, derive the local node shape from that stage, and keep exact option
generics private. Export the schema-derived public node/options aliases only
after the final descriptor. Schema-contributed property capabilities use
`ElementWith` / `TextWith`; malformed or open-world algorithms keep broad nodes
and narrow consumed properties at runtime. If declaration emit still recurses
through package helpers or hooks, repair the generic or declaration boundary
instead of creating a structural AST mirror, shadow plugin descriptor, or
widened public type. A generic factory constrained to a required schema
must receive required flat `schema.type` / `schema.key`; optional handles are a
Plate foundation `PluginAuthorSchemaView` bug, not permission for an assertion or guard.
For a context-bound reusable factory, keep the installed-plugin editor in the
authoring callback only and project its public factory/result to a portable
contract. Fix an internal-editor declaration leak at the Plate foundation return boundary,
not with package-level editor aliases, reconstructed rule types, annotations,
or casts.

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
variants, constants, render helpers, and direct component-local hook calls.

A sibling import within the same family is internal composition, not reuse.

### Hook or state owner

Use `plate-ui` as the source of truth. A family gets zero or one
`use<Family>.ts[x]` semantic controller, only when multiple family members or
surfaces share real lifecycle. Do not create subcomponent hooks,
state-hook/prop-hook pipelines, or public prop bags. Create a provider/store
file only for independent lifecycle or cross-family reuse; otherwise keep one
private family context.

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

For React behavior, an intermediate package component, adapter, barrel, or
reexport is not a production owner. Trace terminal product consumers. If all of
them are copied registry UI and the behavior is UI/product composition, move
the complete hook/store/provider/hotkey/plugin-extension owner to `plate-ui`.

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
6. Which path grows with nodes, plugins, subscribers, listeners, renders,
   queries, DOM units, or another repeated unit?
7. Where is the passing pre-acceptance Benchmark receipt for that path, or the
   live-source proof that runtime scale is N/A?
