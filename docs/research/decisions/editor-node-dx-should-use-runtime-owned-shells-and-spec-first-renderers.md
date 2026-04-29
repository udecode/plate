---
title: Editor node DX should use runtime owned shells and spec first renderers
type: decision
status: accepted
updated: 2026-04-28
source_refs:
  - docs/research/sources/editor-architecture/node-text-mark-render-dx-corpus-ledger.md
  - docs/research/systems/editor-node-text-mark-dx-landscape.md
related:
  - docs/research/decisions/slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md
  - docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md
  - docs/research/decisions/slate-v2-architecture-verdict-after-human-stress-sweep.md
---

# Editor node DX should use runtime owned shells and spec first renderers

## Decision

The editor should make spec-first extension definitions the normal way to
define elements, marks, text behavior, renderers, commands, and browser
contracts.

The runtime should own DOM shells, hidden anchors, editable content slots,
selection mapping, mutation filtering, and commit dirtiness.

App authors should render visible UI with normal React components. They should
not be responsible for void spacer placement, editable child wrappers, internal
data attributes, or DOM selection repair.

## Public Shape

### Element

```ts
const Callout = defineElement({
  type: 'callout',
  kind: 'block',
  content: blockPlus(),
  attrs: {
    tone: enumValue(['info', 'warning']),
  },
  render: CalloutView,
})
```

Container renderers receive a branded `Content` slot:

```tsx
function CalloutView({ Content, attrs }: ElementRenderProps<typeof Callout>) {
  return (
    <aside data-tone={attrs.tone}>
      <Content />
    </aside>
  )
}
```

### Atom/Void

```ts
const Image = defineElement({
  type: 'image',
  kind: 'block',
  content: none(),
  attrs: {
    src: url(),
  },
  behavior: {
    atom: true,
    selectable: true,
  },
  render: ImageView,
})
```

Atom renderers do not receive raw children. The hidden text anchor is automatic.

### Text

```ts
defineTextBehavior({
  mode: 'token',
  range: mentionRange(),
  render: MentionTokenView,
})
```

Text remains an intrinsic primitive. Custom text classes are not part of the
main API.

### Mark

```ts
const Link = defineMark({
  type: 'link',
  attrs: {
    href: url(),
  },
  behavior: {
    inclusive: false,
  },
  render: ({ attrs, children }) => <a href={attrs.href}>{children}</a>,
})
```

Marks own text formatting. Interactive mark controls should normally be
overlays tied to ranges, not DOM-heavy mark views.

### Extension

```ts
defineExtension({
  name: 'image',
  nodes: [Image],
  commands: {
    insertImage(editor, attrs) {
      editor.update((tx) => {
        tx.nodes.insert(Image.create(attrs))
      })
    },
  },
  browserContracts: [atomicBlockNavigation(Image)],
})
```

## 2026-04-28 Maintain Note

Use the `state` / `tx` decision as the current authority for public command
examples. Element and extension specs can define commands, but normal writes
inside those commands should go through `editor.update((tx) => tx.*)`.

Primitive `editor.*` writes are not the public example shape for this decision.

## Why This Wins

- ProseMirror proves schema flags, parse/serialize contracts, and mapped
  decorations are worth stealing.
- Lexical proves read/update, dirty leaves/elements, NodeState-like typed data,
  and text modes are worth stealing.
- Tiptap proves extension packaging, command discoverability, and selector
  hooks are worth stealing.
- None of them has the right default React node authoring API.

The correct split is:

```txt
runtime owns browser correctness
extension specs own behavior
React renderers own visible UI
commit dirtiness owns performance
```

## Rejections

- Do not make raw `{children}` the public void/atom contract.
- Do not require app authors to place hidden spacer nodes.
- Do not make ProseMirror NodeViews the default authoring API.
- Do not make Lexical node subclasses the default authoring API.
- Do not make Tiptap React NodeView wrappers the default authoring API.
- Do not let custom text renderers replace intrinsic text DOM mapping by
  default.
- Do not treat editor-wide React rerender isolation as the performance plan.

## Escape Hatch

There can be an advanced DOM-owner API:

```ts
renderShellUnsafe: CustomShell
```

It must require explicit browser contracts. A powerful escape hatch without
generated browser tests will reproduce the same selection and void layout
regressions at plugin scale.

## Plate/Yjs Path

Plate plugins can move feature by feature:

1. wrap existing renderers as spec renderers
2. move attrs and commands into extension specs
3. move void/content-shell responsibility into the runtime
4. add generated browser contracts per node family

Yjs should sync document content and typed node state. Runtime ids, shell DOM,
hidden anchors, and selection import/export remain local runtime facts.

## Status

Accepted for the next editor node API design pass.
