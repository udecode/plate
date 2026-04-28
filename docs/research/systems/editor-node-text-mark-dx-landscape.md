---
title: Editor node text mark DX landscape
type: system
status: strong
updated: 2026-04-27
related:
  - docs/research/sources/editor-architecture/node-text-mark-render-dx-corpus-ledger.md
  - docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md
  - docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md
  - docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md
  - docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md
---

# Editor node text mark DX landscape

## Bottom Line

The best public node API is not Slate `renderElement`, ProseMirror `NodeView`,
Lexical node subclasses, or Tiptap React NodeViews.

The best API is:

```txt
spec-first nodes/marks/text behavior
+ runtime-owned DOM shells
+ app-owned visible React renderers
+ dirty-commit-backed selector subscriptions
```

The runtime owns the browser contract. App authors own the UI.

## Comparison

| Corpus | Best part | Bad default to avoid |
| --- | --- | --- |
| ProseMirror | Declarative node/mark schema, atom/selectable/isolating flags, mapped decorations | Imperative NodeViews as normal React authoring surface |
| Lexical | Read/update lifecycle, dirty leaves/elements, text modes, NodeState | Public node classes, subclass replacement, fast-refresh full-refresh pressure |
| Tiptap | Extension packaging, commands, attrs, React selectors, product docs | React NodeView wrapper/contentDOM handoff as the normal node renderer |

## Target Model

### 1. Elements

Elements should be declared through typed specs:

```ts
const Image = defineElement({
  type: 'image',
  kind: 'block',
  content: none(),
  attrs: {
    alt: string().optional(),
    src: url(),
  },
  behavior: {
    atom: true,
    draggable: true,
    selectable: true,
  },
  parse: html('img[src]', dom => ({
    alt: dom.getAttribute('alt') ?? undefined,
    src: dom.getAttribute('src')!,
  })),
  serialize: html(({ attrs }) => ['img', attrs]),
  render: ImageView,
})
```

`render` receives typed props and returns visible UI only:

```tsx
function ImageView({
  actions,
  attrs,
  selected,
}: ElementRenderProps<typeof Image>) {
  return (
    <figure data-selected={selected}>
      <img alt={attrs.alt ?? ''} src={attrs.src} />
      <button onClick={() => actions.remove()}>Remove</button>
    </figure>
  )
}
```

For containers, the runtime provides a branded content slot:

```tsx
function CalloutView({ Content, attrs }: ElementRenderProps<typeof Callout>) {
  return (
    <aside data-tone={attrs.tone}>
      <Content />
    </aside>
  )
}
```

The slot is not raw `{children}`. It is the runtime's owned editable content
mount. Omitting it in a node with editable content is a development error.

### 2. Text

Text should remain an intrinsic primitive. Authors should not define text node
classes.

The API should expose typed text behavior and annotation layers:

```ts
const MentionToken = defineTextBehavior({
  match: mentionRange(),
  mode: 'token',
  render: MentionTokenView,
})
```

Steal Lexical's text modes as declarative behavior:

- `normal`
- `token`
- `segmented`
- `unmergeable`
- `directionless`

Do not let custom text renderers replace the text DOM mapping by default.
Formatting belongs to marks, annotations, and decorations.

### 3. Marks

Marks should be typed specs with attrs, parse/serialize, exclusion rules, and
pure inline renderers:

```ts
const Link = defineMark({
  type: 'link',
  attrs: {
    href: url(),
    title: string().optional(),
  },
  behavior: {
    inclusive: false,
  },
  parse: html('a[href]', dom => ({
    href: dom.getAttribute('href')!,
    title: dom.getAttribute('title') ?? undefined,
  })),
  render: ({ attrs, children }) => (
    <a href={attrs.href} title={attrs.title}>
      {children}
    </a>
  ),
})
```

Interactive mark UI should prefer overlays tied to mark ranges. Mark wrappers
should stay light enough that text DOM mapping remains predictable.

### 4. Runtime-Owned Shells

The runtime should always own:

- editor data attributes
- element and text DOM lookup refs
- contenteditable boundaries
- hidden text anchors for atoms/voids
- selection import/export
- drag/select/focus attributes
- mutation filtering
- decoration projection

The app renderer should not place hidden spacer children, `data-slate-*`
attributes, DOM refs, or selection plumbing manually.

### 5. Extension Package Shape

Feature packages should own the whole feature:

```ts
const ImageExtension = defineExtension({
  name: 'image',
  nodes: [Image],
  commands: {
    insertImage(editor, input) {
      editor.update(() => {
        editor.insertNode(Image.create(input))
      })
    },
  },
  shortcuts: {},
  pasteRules: [imageUrlPasteRule()],
  ui: {
    ToolbarButton: ImageToolbarButton,
  },
  browserContracts: [
    atomicBlockNavigation(Image),
    noVisibleSpacerLayout(Image),
  ],
})
```

This steals Tiptap's packaging, but not its required
`chain().focus().run()` ceremony.

### 6. React Runtime

React integration should be based on explicit selector subscriptions and commit
facts:

```ts
const selected = useEditorSelector(editor, commit => {
  return commit.selection.intersectsNode(nodeId)
})
```

The editor body should not rerender for every transaction. Node renderers should
rerender only when one of these changes:

- that node's attrs or children identity
- selection state relevant to that node
- decoration/annotation projection relevant to that node
- editor read-only/composition state relevant to that node

This goes beyond Tiptap's selector posture by using dirty commit data instead
of asking React components to derive everything from broad editor snapshots.

## Escape Hatches

Advanced integrations can exist, but they should look dangerous:

```ts
defineElement({
  type: 'custom-dom-owner',
  renderShellUnsafe: CustomShell,
  browserContracts: [customShellSelectionContract()],
})
```

Escape hatches must require browser-contract tests. Otherwise the API will
slowly recreate the same void, selection, and NodeView bugs under nicer names.

## Testing Implication

Every node/mark/text behavior spec should be able to generate contract tests:

- atomic block navigation
- inline atom navigation from both sides
- text token delete behavior
- mark boundary insertion
- paste/import/export round trip
- no visible hidden-anchor layout
- app internal controls keep native ownership
- selection and DOM selection agree after keyboard movement

The fast CI lane can run a curated subset. `test:stress` should replay the full
generated browser matrix.
