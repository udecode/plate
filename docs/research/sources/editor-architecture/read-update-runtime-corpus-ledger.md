---
title: Read/update runtime corpus ledger
type: source
status: accepted
updated: 2026-04-23
source_refs:
  - ../raw/lexical/README.md
  - ../raw/prosemirror/README.md
  - ../raw/tiptap/README.md
related:
  - docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md
  - docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md
  - docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md
---

# Read/update runtime corpus ledger

## Purpose

Record the full-mode corpus closure for the Lexical, ProseMirror, and Tiptap
architecture evidence used by the Slate v2 read/update runtime plan.

## Corpus Dispositions

### Lexical

- compiled pages inspected:
  - `docs/research/entities/lexical.md`
  - `docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md`
  - `docs/research/sources/lexical/markdown-package-and-shortcuts-doc-patterns.md`
- raw paths inspected:
  - `../raw/lexical/repo`
  - `../raw/lexical/catalog.md`
  - `../raw/lexical/README.md`
- direct raw files read:
  - `../raw/lexical/repo/packages/lexical-website/docs/intro.md`
  - `../raw/lexical/repo/packages/lexical-website/docs/concepts/editor-state.md`
  - `../raw/lexical/repo/packages/lexical-website/docs/concepts/updates.md`
  - `../raw/lexical/repo/packages/lexical-website/docs/concepts/commands.md`
  - `../raw/lexical/repo/packages/lexical-website/docs/concepts/transforms.md`
  - `../raw/lexical/repo/packages/lexical-website/docs/extensions/intro.md`
  - `../raw/lexical/repo/packages/lexical-website/docs/extensions/design.md`
  - `../raw/lexical/repo/packages/lexical/src/LexicalUpdateTags.ts`
- official source entrypoints checked:
  - `https://github.com/facebook/lexical.git`
  - local official clone origin in `../raw/lexical/repo`
- strongest evidence found:
  - `editor.update` / `editor.read` are the lifecycle boundary.
  - command listeners run inside update context.
  - update tags cover history, paste, collaboration, scroll, DOM selection, and
    composition policy.
  - dirty leaves/elements are tracked before DOM reconciliation.
  - extensions centralize configuration plus registration and dependencies.
- disposition: `evidenced`
- next action:
  - keep raw refreshed only when active architecture decisions depend on newer
    Lexical releases.

### ProseMirror

- compiled pages inspected:
  - `docs/research/entities/prosemirror.md`
  - `docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md`
  - `docs/research/sources/prosemirror/guide-reference-and-example-doc-patterns.md`
- raw paths inspected:
  - `../raw/prosemirror/repo`
  - `../raw/prosemirror/packages/*`
  - `../raw/prosemirror/catalog.md`
  - `../raw/prosemirror/README.md`
- direct raw files read:
  - `../raw/prosemirror/packages/model/src/README.md`
  - `../raw/prosemirror/packages/state/src/README.md`
  - `../raw/prosemirror/packages/state/src/transaction.ts`
  - `../raw/prosemirror/packages/state/src/selection.ts`
  - `../raw/prosemirror/packages/transform/src/README.md`
  - `../raw/prosemirror/packages/view/src/README.md`
  - `../raw/prosemirror/packages/view/src/input.ts`
  - `../raw/prosemirror/packages/view/src/selection.ts`
- official source entrypoints checked:
  - `https://github.com/ProseMirror/prosemirror.git`
  - ProseMirror package remotes under `https://code.haverbeke.berlin/prosemirror/`
  - local official clone origins in `../raw/prosemirror`
- strongest evidence found:
  - editor state is updated by applying transactions
  - transactions track document, selection, stored marks, and metadata
  - selection maps through transform mappings
  - selection bookmarks are document-independent durable anchors
  - input/view code has one DOM observer/selection import/export authority
  - decorations are first-class view data
- disposition: `evidenced`
- next action:
  - keep package raw clones in sync if architecture work moves deeper into
    ProseMirror commands, tables, or input rules.

### Tiptap

- compiled pages inspected:
  - `docs/research/entities/tiptap.md`
  - `docs/research/sources/editor-architecture/tiptap-comments-suggestions-and-node-range.md`
  - `docs/research/sources/tiptap/input-rules-and-extension-doc-patterns.md`
- raw paths inspected:
  - `../raw/tiptap/repo`
  - `../raw/tiptap/docs`
  - `../raw/tiptap/catalog.md`
- direct raw files read:
  - `../raw/tiptap/docs/src/content/editor/api/editor.mdx`
  - `../raw/tiptap/docs/src/content/editor/core-concepts/extensions.mdx`
  - `../raw/tiptap/docs/src/content/guides/performance.mdx`
  - `../raw/tiptap/docs/src/content/guides/react-composable-api.mdx`
  - `../raw/tiptap/docs/src/content/guides/create-mark.mdx`
  - `../raw/tiptap/repo/packages/core/src/CommandManager.ts`
- official source entrypoints checked:
  - `https://github.com/ueberdosis/tiptap.git`
  - `https://github.com/ueberdosis/tiptap-docs.git`
  - local official clone origins in `../raw/tiptap/repo` and
    `../raw/tiptap/docs`
- strongest evidence found:
  - Tiptap packages ProseMirror into extension-driven product DX.
  - extensions own nodes, marks, attributes, commands, events, and keyboard
    shortcuts.
  - command manager builds single and chained command APIs around one
    transaction.
  - React docs explicitly use selector subscriptions and render controls to
    avoid transaction-wide rerenders.
  - public examples commonly use `chain().focus().command().run()`.
- disposition: `evidenced`
- next action:
  - treat Tiptap as a DX/productization source, not the low-level runtime
    authority.

## Remaining Gaps

- no raw gap remains for this scoped architecture pass.
- no compile gap remains for the read/update architecture comparison after the
  companion source summaries are present.
- future work may need a separate full pass for table architecture, comments /
  suggestions, or AI/editor-agent tooling.
