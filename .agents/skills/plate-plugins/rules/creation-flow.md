# Creation Flow

Choose semantic ownership before file topology. `docs/vision/plate.md` (Plugin
and component doctrine) holds the ownership and format-mapping law this flow
applies.

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
|  |   +- `definePlugin`
|  |   +- static renderer? -> terminal `BasePlugin.configure`
|  |   +- real React job later? -> thin `toReactPlugin` wrapper
|  |   +- no React job? -> keep base-only
|  |
|  +- no -> `src/react`
|      +- only groups complete plugins? -> app/registry kit array
|      +- genuinely hook/DOM/component-native? -> `definePlugin`
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

Use `definePlugin` for document semantics, parsers, normalizers, injected
rules, update groups, and shared behavior contracts.

### Mapping contribution

Keep a plugin's semantic format map in its owner, authored through the
constructor's context-bound `formats: ({ defineFormats }) => defineFormats(map)`
callback.

Select each Markdown mapping's source with one of `node` (a standard MDAST
kind, which types the decoded `node`) or `tag` (a registered tag, plus
`nestedTags` for tags read only inside it). For a custom Plate-owned element
tag, destructure `schema: { type }` from the mapping context and use it for
`tag`, the decoded element `type`, and the encoded tag `name`. Keep external
MDAST kinds and HTML tag names literal.

Start with a declaration: `markdown: { tag: type }` lets the runtime build the
element, convert its non-metadata properties as attributes (own properties
first, list properties never) and traverse children by the content model;
`attributes: { url: 'src' }` renames owned properties on the wire. Write
`decode`/`encode` only for a real format difference, such as Image's
representation choice or Date's normalization. A custom encoder writes node
attributes with `encodeNodeAttributes()`, or chosen values with
`encodeAttributes()`, which claims each property whose attribute the returned
output keeps; it claims anything else its output carries with
`preserve(...ownedKeys)`. Unclaimed content properties report
`markdown-property-omitted`. HTML follows the same claim law: an element
encoder, including `createsElement`, or an encoder that receives `values`
claims what it writes with `preserve(...ownedKeys)`; a mark or property
mapping that receives one `value` claims it by returning output that writes
it. A decoder claims the Plate attributes its result represents with
`preserve(...names)`. A `createsElement` mapping writes around the HTML of
its other targets. Unclaimed content properties and unclaimed Plate
attributes report `html-unsupported-content` with `kind: 'attribute'`. Read custom tag attributes with
`readTagAttributes().properties`; the runtime codec follows the schema property
kind, so features never parse or coerce attribute strings. Return
`refuse(message)` for input the mapping cannot represent; throw only for
programmer or configuration faults. A plugin whose schema declares a `mark`
maps a mark, with no flag: `{ node: 'strong' }`, `{ tag: 'kbd' }`,
`{ tag: 'sub', value: 'sub' }` or `{ tag: 'span', style: 'color' }`. The first
declaration whose `value` matches writes the mark; `wrap` and a value-returning
`decode` remain for real exceptions. The runtime composes every mark on the
selector and decodes the children once. Decode contexts call inherited
persisted text properties `marks`; reserve `decoration` for transient render
state. Apply the same mapping identity checks to
constructor and justified staged contributions.

## File Owners

### Plugin owner

One plugin file may own:

- plugin declaration and real public contract types;
- initial state, selectors, and schema/parser/mapping callbacks;
- API, read, and update builders;
- commands, corrections, decorators, normalizers, matchers, and prefixless
  `on` callbacks;
- plugin-only constants and implementation helpers.

File length is irrelevant. Extract only when another durable owner exists.

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
