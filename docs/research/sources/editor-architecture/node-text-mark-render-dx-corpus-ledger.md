---
title: Node text mark render DX corpus ledger
type: source
status: strong
updated: 2026-04-27
source_refs:
  - ../raw/prosemirror/README.md
  - ../raw/prosemirror/packages/model/src/schema.ts
  - ../raw/prosemirror/packages/schema-basic/src/schema-basic.ts
  - ../raw/prosemirror/packages/view/src/viewdesc.ts
  - ../raw/prosemirror/packages/view/src/index.ts
  - ../raw/prosemirror/packages/view/src/decoration.ts
  - ../raw/lexical/README.md
  - ../raw/lexical/repo/packages/lexical-website/docs/intro.md
  - ../raw/lexical/repo/packages/lexical-website/docs/concepts/nodes.mdx
  - ../raw/lexical/repo/packages/lexical-website/docs/concepts/node-state.md
  - ../raw/lexical/repo/packages/lexical-website/docs/concepts/node-replacement.md
  - ../raw/lexical/repo/packages/lexical-website/docs/react/faq.md
  - ../raw/lexical/repo/packages/lexical/src/LexicalNode.ts
  - ../raw/lexical/repo/packages/lexical/src/nodes/LexicalTextNode.ts
  - ../raw/lexical/repo/packages/lexical/src/LexicalUpdates.ts
  - ../raw/tiptap/README.md
  - ../raw/tiptap/repo/packages/core/src/Node.ts
  - ../raw/tiptap/repo/packages/core/src/Mark.ts
  - ../raw/tiptap/repo/packages/core/src/Extendable.ts
  - ../raw/tiptap/repo/packages/core/src/CommandManager.ts
  - ../raw/tiptap/repo/packages/core/src/NodeView.ts
  - ../raw/tiptap/repo/packages/react/src/useEditorState.ts
  - ../raw/tiptap/repo/packages/react/src/EditorContent.tsx
  - ../raw/tiptap/docs/src/content/editor/core-concepts/extensions.mdx
  - ../raw/tiptap/docs/src/content/editor/extensions/custom-extensions/node-views/index.mdx
  - ../raw/tiptap/docs/src/content/editor/extensions/custom-extensions/node-views/react.mdx
  - ../raw/tiptap/docs/src/content/guides/performance.mdx
  - ../raw/tiptap/docs/src/content/guides/faq.mdx
related:
  - docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md
  - docs/research/systems/editor-node-text-mark-dx-landscape.md
  - docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md
---

# Node text mark render DX corpus ledger

## Purpose

Record the full-mode corpus closure for editor node, text, mark, and render
DX across ProseMirror, Lexical, and Tiptap.

This pass answers a narrower question than the read/update runtime pass:

```txt
What should the public authoring API look like when Slate closeness is not a
constraint, React/shadcn flexibility is mandatory, and runtime performance must
not regress?
```

## Corpus Dispositions

### ProseMirror

- compiled pages inspected:
  - `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`
  - `docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md`
  - `docs/research/entities/prosemirror.md`
- raw paths inspected:
  - `../raw/prosemirror/README.md`
  - `../raw/prosemirror/packages/model/src`
  - `../raw/prosemirror/packages/schema-basic/src`
  - `../raw/prosemirror/packages/view/src`
- direct raw files read:
  - `../raw/prosemirror/packages/model/src/schema.ts`
  - `../raw/prosemirror/packages/schema-basic/src/schema-basic.ts`
  - `../raw/prosemirror/packages/view/src/viewdesc.ts`
  - `../raw/prosemirror/packages/view/src/index.ts`
  - `../raw/prosemirror/packages/view/src/decoration.ts`
- official source entrypoints checked:
  - `https://github.com/ProseMirror/prosemirror.git`
  - ProseMirror package remotes under
    `https://code.haverbeke.berlin/prosemirror/`
  - local official raw snapshot metadata in `../raw/prosemirror/README.md`
- strongest evidence found:
  - `NodeSpec` and `MarkSpec` are strong declarative schema contracts:
    content expressions, mark allow-lists, groups, inline/atom/selectable/
    draggable/code/defining/isolating flags, parse rules, and DOM serializers.
  - ProseMirror treats text as an intrinsic node type. Text specs should not
    override editor rendering, and text nodes do not carry arbitrary attrs.
  - `NodeView` exposes `dom`, optional `contentDOM`, `update`, selection
    hooks, event stopping, mutation ignoring, and destruction. It is powerful,
    but it gives app code direct responsibility for browser-editing boundaries.
  - `EditorProps.nodeViews` and `markViews` are the view escape hatches.
    Mark views are simpler and less dynamic than node views.
  - `DecorationSet` is a persistent, mapped view-data structure with widget,
    inline, and node decorations.
- disposition: `evidenced`
- take:
  - steal the schema vocabulary and mapped decoration model.
  - do not expose ProseMirror-style NodeViews as the normal React authoring
    API.

### Lexical

- compiled pages inspected:
  - `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`
  - `docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md`
  - `docs/research/entities/lexical.md`
- raw paths inspected:
  - `../raw/lexical/README.md`
  - `../raw/lexical/repo/packages/lexical-website/docs`
  - `../raw/lexical/repo/packages/lexical/src`
- direct raw files read:
  - `../raw/lexical/repo/packages/lexical-website/docs/intro.md`
  - `../raw/lexical/repo/packages/lexical-website/docs/concepts/nodes.mdx`
  - `../raw/lexical/repo/packages/lexical-website/docs/concepts/node-state.md`
  - `../raw/lexical/repo/packages/lexical-website/docs/concepts/node-replacement.md`
  - `../raw/lexical/repo/packages/lexical-website/docs/concepts/serialization.md`
  - `../raw/lexical/repo/packages/lexical-website/docs/react/faq.md`
  - `../raw/lexical/repo/packages/lexical/src/LexicalNode.ts`
  - `../raw/lexical/repo/packages/lexical/src/nodes/LexicalTextNode.ts`
  - `../raw/lexical/repo/packages/lexical/src/LexicalUpdates.ts`
- official source entrypoints checked:
  - `https://github.com/facebook/lexical.git`
  - local official raw snapshot metadata in `../raw/lexical/README.md`
- strongest evidence found:
  - Lexical's immutable editor states, read/update closures, dirty leaves,
    dirty elements, transform loop, and DOM reconciler form the strongest
    runtime discipline in the corpus.
  - Lexical defines five base nodes: root, line break, element, text, and
    decorator. Element/Text/Decorator are subclass extension points.
  - `TextNode` has built-in format bits, style, detail bits, and modes:
    normal, token, and segmented. Token and segmented behavior is worth
    adapting as declarative text behavior.
  - `DecoratorNode` can render framework output through a `decorate()` return
    value, but authors still implement node classes, DOM creation, and DOM
    update methods.
  - `NodeState` is the best Lexical authoring improvement: ad-hoc typed state
    can be attached to any node, copied copy-on-write, serialized, and synced
    through Yjs. The docs also state it can remove many subclassing use cases.
  - Lexical's React FAQ acknowledges that files creating editors or
    `LexicalNode` subclasses can need full refresh during fast refresh.
- disposition: `evidenced`
- take:
  - steal read/update, dirty-node runtime facts, text modes, and NodeState-like
    typed node state.
  - reject class-based public node authoring and subclass replacement as the
    default DX.

### Tiptap

- compiled pages inspected:
  - `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`
  - `docs/research/sources/editor-architecture/tiptap-comments-suggestions-and-node-range.md`
  - `docs/research/entities/tiptap.md`
- raw paths inspected:
  - `../raw/tiptap/README.md`
  - `../raw/tiptap/repo/packages/core/src`
  - `../raw/tiptap/repo/packages/react/src`
  - `../raw/tiptap/docs/src/content`
- direct raw files read:
  - `../raw/tiptap/repo/packages/core/src/Node.ts`
  - `../raw/tiptap/repo/packages/core/src/Mark.ts`
  - `../raw/tiptap/repo/packages/core/src/Extendable.ts`
  - `../raw/tiptap/repo/packages/core/src/CommandManager.ts`
  - `../raw/tiptap/repo/packages/core/src/NodeView.ts`
  - `../raw/tiptap/repo/packages/react/src/useEditorState.ts`
  - `../raw/tiptap/repo/packages/react/src/EditorContent.tsx`
  - `../raw/tiptap/docs/src/content/editor/core-concepts/extensions.mdx`
  - `../raw/tiptap/docs/src/content/editor/extensions/custom-extensions/node-views/index.mdx`
  - `../raw/tiptap/docs/src/content/editor/extensions/custom-extensions/node-views/react.mdx`
  - `../raw/tiptap/docs/src/content/guides/performance.mdx`
  - `../raw/tiptap/docs/src/content/guides/faq.mdx`
  - `../raw/tiptap/docs/src/content/guides/react-composable-api.mdx`
- official source entrypoints checked:
  - `https://github.com/ueberdosis/tiptap.git`
  - `https://github.com/ueberdosis/tiptap-docs.git`
  - local official raw snapshot metadata in `../raw/tiptap/README.md`
- strongest evidence found:
  - Tiptap's extension config is the best product-DX package shape in the
    corpus: nodes, marks, attrs, global attrs, commands, shortcuts, input rules,
    paste rules, ProseMirror plugins, paste transforms, nested extensions,
    Markdown parse/render, and schema extension hooks live together.
  - Node and mark configs lift ProseMirror schema fields into author-facing
    objects with options, storage, parent extension access, and editor context.
  - `CommandManager` exposes single commands, chained commands, and `can()`
    around one transaction.
  - React NodeViews provide `ReactNodeViewRenderer`, `NodeViewWrapper`,
    `NodeViewContent`, `updateAttributes`, `deleteNode`, selection props, and
    drag handles.
  - Tiptap's own docs warn that React node views are synchronous, create new
    elements, and can be expensive when many instances exist.
  - Tiptap's FAQ explains extra wrapper elements as a handoff between
    ProseMirror's synchronous NodeView contract and React rendering.
  - React state integration uses `useSyncExternalStoreWithSelector`,
    `useEditorState`, selector equality, `shouldRerenderOnTransaction`, and
    portal rendering for node views.
- disposition: `evidenced`
- take:
  - steal extension packaging, commands, attrs, React selectors, and
    author-facing examples.
  - do not copy NodeView/React wrapper mechanics as the primary rendering API.

## Cross-Corpus Result

No raw gap remains for this scoped pass.

No corpus provides the full target alone:

- ProseMirror has the strongest structural schema and decoration discipline,
  but its NodeView API is too imperative for the default React/shadcn DX.
- Lexical has the strongest runtime and dirty reconciliation discipline, but
  class nodes and fast-refresh constraints are too heavy for the default public
  node API.
- Tiptap has the strongest extension/product DX, but its React NodeView layer is
  a workaround over ProseMirror's synchronous view contract.

The best architecture is a spec-first extension API with runtime-owned DOM
shells and app-owned visible React renderers.
