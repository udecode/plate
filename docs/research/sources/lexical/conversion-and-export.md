# Lexical: conversion and export

## HTML export

- **`$generateHtmlFromNodes`.** The `lexical-html` test exports an empty editor as `<p><br></p>` (`facebook/lexical@dd5c41b1:packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:49`). It exports only the given selection when one is passed and the whole editor state when the selection is `undefined`, and a custom node's `exportDOM` may return a `DocumentFragment` (`:255`). Its import rows keep a paragraph's own alignment over its parent's, also when the parent's format is empty. Source: `c70bacbd4a:docs/editor-test-harvester/lexical/plite-processing-ledger.md:271-276`. Limit: at dd5c41b1 the file also tests `<style>` class inlining, `dir` attribute import and slots (`:305-431`), which the 2026-05-09 ledger does not list.

## Markdown

- **Markdown package tests.** `LexicalMarkdown.test.ts` covers:
  - shortcuts that create headings, quotes and lists;
  - an import/export matrix: headings, quotes, lists, ordered start numbers, marks, links, code, escapes, whitespace, hard breaks, nested code fences and multi-line paragraphs;
  - custom and MDX HTML transformers, including a `replace` that returns `false`, and transformer order;
  - list-marker memory and checklist markers;
  - an Enter-key code-fence shortcut;
  - `normalizeMarkdown`, for line merging, tables, HTML-like tags, whitespace and MDX;
  - an import that leaves no selection.

  Source: `c70bacbd4a:docs/editor-test-harvester/lexical/plite-processing-ledger.md:473-479`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: row families only, not rerun.

- **Markdown link transformer.** `MarkdownTransformers.test.ts` checks three things. Plain or formatted text before a converted markdown link survives. The link pattern does not match greedily after an earlier match that was not converted. No markdown link is created inside an existing link. These are rules a markdown link plugin owns. Source: `c70bacbd4a:docs/editor-test-harvester/lexical/plite-processing-ledger.md:494-497`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: not rerun.

- **Markdown e2e.** `Markdown.spec.mjs` covers:
  - ordered-list shortcuts with any start number: `25. ` gives `<ol start="25">`, which the note on Plate's `EDIT-PROFILE-AUTOFMT-BLOCK-003` also requires;
  - heading, quote and bullet shortcuts, and import/export cycles;
  - inline text transformers: nested bold, italic and strikethrough, intraword rules, links and emoji;
  - image and equation imports, and several text-match transformers on one line;
  - #7349: no text transformer runs inside code-formatted text;
  - the selection after a link text-match transform;
  - list-marker export and copy;
  - HR and code-fence shortcuts.

  Regression #3433 adds that a list typed with `- ` in the block just before an existing list joins that list, so the new item comes first (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/regression/3433-merge-markdown-lists.spec.mjs:19`). Source: `c70bacbd4a:docs/editor-test-harvester/lexical/plite-processing-ledger.md:664-673`, `:328`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: row families only, not rerun.

## HTML and Markdown export

- Lexical 0.48.0 (`facebook/lexical@dd5c41b1`, MIT) captures a document as `EditorState`, whose JSON recursion validates node type, element children and named slots (`facebook/lexical@dd5c41b1:packages/lexical/src/LexicalEditorState.ts:28-33`, `:62-120`). HTML export takes an editor and an optional selection inside an active state, needs a DOM, and uses each node's configured `exportDOM` and an after hook (`facebook/lexical@dd5c41b1:packages/lexical-html/src/index.ts:249-360`). Markdown export runs ordered transformers in which `null` declines, an unmatched element flattens its children and text is rendered, with no general loss report (`facebook/lexical@dd5c41b1:packages/lexical-markdown/src/MarkdownExport.ts:39-92`, `:342-474`). Source: `docs/plite/research/2026-09-24-export-architecture/read-log.tsv` rows 58 and 65-67 (2026-09-24; source read, nothing executed).

- Lexical's default `exportDOM` calls `createDOM` with the editor config, the default `exportJSON` writes `type`, `version` and NodeState JSON, and the base `getTextContent` delegates to slot text (`facebook/lexical@dd5c41b1:packages/lexical/src/LexicalNode.ts:605-625`, `:1440-1454`, `:1515-1549`). HTML export's after hook can replace the exported element, and an excluded or unselected wrapper appends its children's fragment instead of itself (`facebook/lexical@dd5c41b1:packages/lexical-html/src/index.ts:347-372`). Source: `docs/plite/research/2026-09-24-export-architecture/read-log.tsv` rows 98-99 (2026-09-24; source read, nothing executed).

## Headless conversion and read scopes

- In Lexical, headless does not mean DOM-free or lifecycle-free. The headless editor marks itself headless and disables DOM, root-element and selection event methods but installs no DOM (`facebook/lexical@dd5c41b1:packages/lexical-headless/src/index.ts`), and `withDOM` installs HappyDOM globals for a synchronous callback and restores them in `finally`, so async work inside the callback is unsafe (`facebook/lexical@dd5c41b1:packages/lexical-headless/src/dom.ts:28-51`). `getEditorState` returns the committed state; a default read force-commits pending work and a `latest` read does not (`facebook/lexical@dd5c41b1:packages/lexical/src/LexicalEditor.ts`). `readEditorState` installs a synchronous active editor, state and read-only scope and restores it in `finally`, and commit seals pending state behind development guards (`facebook/lexical@dd5c41b1:packages/lexical/src/LexicalUpdates.ts:523-565`, `:652-681`); a read-only clone shares the node map and `toJSON` emits only the root (`facebook/lexical@dd5c41b1:packages/lexical/src/LexicalEditorState.ts:130-188`). Parsing routes exceptions to `onError`, which is not a conversion-loss report (`LexicalUpdates.ts:482-512`). Whole-document and selection Markdown export are separate functions with per-call transformers (`facebook/lexical@dd5c41b1:packages/lexical-markdown/src/index.ts:105-139`), clipboard copy writes a namespace-plus-nodes payload through MIME-specific providers with an async transport separate from serialization (`facebook/lexical@dd5c41b1:packages/lexical-clipboard/src/clipboard.ts`), and element text joins slot and child text with a blank line between blocks (`facebook/lexical@dd5c41b1:packages/lexical/src/nodes/LexicalElementNode.ts:495-513`). The 2026-09-25 codec read adds that HTML import (`$generateNodesFromDOM`) also needs editor context and an ambient DOM. Source: `docs/plite/research/2026-09-24-export-architecture/read-log.tsv` rows 76-83 and 91, `docs/plite/research/2026-09-25-document-codec-architecture/read-log.tsv` row 25 (source read, nothing executed; `withDOM` reread at that commit 2026-10-08).
