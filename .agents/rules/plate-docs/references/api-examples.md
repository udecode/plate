# Public API examples

When a React view derives conditional presentation of canonical editor state
from its DOM lifecycle, teach the literal input marker and neutral output hooks
as the reusable API. Teach copied `Editor` markers and styles as product
composition. Never invent a controlled prop for derivable focus state, describe
the paint as another selection model, accept a copied Range in examples, or
require a plugin/kit whose only job is toggling that view.

Teach copied feature styling through `decorate.attributes`: a safe object or
pure inferred-context callback with `entry` and `decoration`; `null` clears
inherited presentation. Existing sources retain their reader and observer.
Keep optional feature selectors out of generic Editor skins.

For Plate plugin-authored paint, teach `decorate: { read, observe?, attributes? }` for
inline ranges and `render.useViewElementAttributes` for sparse attributes on
whole element hosts. The latter is one hook host per enabled plugin per mounted
view and returns `{ key, attributes }[]`. Never teach hooks inside per-node
`render.attributes` or `inject.nodeProps.transformProps`, or expose Plate's
private keyed store, provider, publisher, source IDs, or precedence machinery.


## Code Example Rules

- Repo-backed examples only. If a kit does what you're teaching, cite the exact kit file.
- Include real imports. Show `platejs`, `platejs/react`, and optional
  `platejs/<feature>` paths explicitly.
- Use `// ...otherPlugins,` only when the omission is obvious.
- No placeholder comments (`// your logic here`, `// Your validation logic`).
- In Plite schema examples, never repeat derived structural membership:
  non-inline elements belong to `block`, while inline elements do not. In Plate
  examples, use `blockContent: false` for structural internals and
  `plugins.blockContent()` for normal-flow container content.
- Use direct `root`/named-root content, omitted closed defaults,
  `schema.element.textBlock()` for ordinary editable blocks,
  validator-backed narrow `property.json()`, placement-owned
  `role: "metadata"`, app-owned schema `id`/`version`, and runtime
  `create`/`assertDocument`/`assertFragment`/`isMarkableVoid`. Plate callers
  pass plugin descriptors directly to schema APIs; only raw Plite schemas use
  `schema.handle.*`.
- In Plate examples, use plugin `name` only for capability identity. Read final
  persisted identity from an exact element portal's `plugin.schema.type` or an
  exact primary-mark portal's `plugin.schema.key`. Behavior and
  aggregate-property portals omit `schema`; normal consumers use semantic
  plugin methods or typed nodes. Never teach universal plugin `.type` / `.key`,
  consumer `schema.properties`, optional identity access, or name fallbacks.
- In Plite examples, transient inline paint uses one
  `PliteDecorationSource` passed to `<Plite decorations>`. The source returns
  keyed ranges with render-safe attributes; `Editable` needs no paint callback.
  Annotation readers use `PliteAnnotationProvider`. In Plate examples, put the
  same inline paint on the owning plugin's
  `decorate: { read, observe?, attributes? }` descriptor. Put sparse whole-element
  attributes in `render.useViewElementAttributes`; it receives the mounted
  `view` and returns `{ key, attributes }[]`. Keep per-node render and injection
  callbacks hook-free, and do not expose Plate's private publication runtime or
  pass raw decoration inputs through Plate components.
- Ordinary application examples export one human-named readonly plugin kit,
  usually `EditorKit`, and, when needed, one human-named schema, usually
  `EditorSchema`; map them directly to the `plugins` and `schema` editor
  options. On advanced compiler pages, teach that `plate generate` discovers
  their validated runtime shapes rather than fixed export identifiers.
  Property keys and value laws remain feature-owned; persisted renames require
  a new field and an explicit migration.
- Teach persisted document upgrades as one app-owned `{ document, schema }`
  envelope plus `defineDocumentMigrations` target-version steps and exact
  generated `sourceFingerprints` for historical envelopes. Raw documents need
  an explicit `unversioned` floor. Import the builder, runner, and Plate release
  steps from `platejs/migrations`. Teach `prepareDocument` only as
  installed-plugin current-schema preparation after host migration and before
  schema fitting. Never teach migration plugins, normalizers for historical
  shapes, per-node versions, or CLI-only runtime policy.
- `showLineNumbers` + `{n-m}` highlights on snippets longer than ~15 lines.
- `title="filename.tsx"` when file context matters.

Inline code hygiene:

- CommonMark matches inline-code delimiters by backtick-run length. Literal `` ` ``` ` `` inline breaks rendering.
- To show triple backticks, rephrase ("a triple-backtick fence") or use a fenced block.
