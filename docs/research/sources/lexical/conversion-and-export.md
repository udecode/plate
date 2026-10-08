# Lexical: conversion and export

## HTML export

- **`$generateHtmlFromNodes`.** The `lexical-html` test exports an empty editor as `<p><br></p>` (`facebook/lexical@dd5c41b1:packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:49`). It exports only the given selection when one is passed and the whole editor state when the selection is `undefined`, and a custom node's `exportDOM` may return a `DocumentFragment` (`:255`). Its import rows keep a paragraph's own alignment over its parent's, also when the parent's format is empty. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:271-276`. Limit: at dd5c41b1 the file also tests `<style>` class inlining, `dir` attribute import and slots (`:305-431`), which the 2026-05-09 ledger does not list.

## Markdown

- **Markdown package tests.** `LexicalMarkdown.test.ts` covers:
  - shortcuts that create headings, quotes and lists;
  - an import/export matrix: headings, quotes, lists, ordered start numbers, marks, links, code, escapes, whitespace, hard breaks, nested code fences and multi-line paragraphs;
  - custom and MDX HTML transformers, including a `replace` that returns `false`, and transformer order;
  - list-marker memory and checklist markers;
  - an Enter-key code-fence shortcut;
  - `normalizeMarkdown`, for line merging, tables, HTML-like tags, whitespace and MDX;
  - an import that leaves no selection.

  Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:473-479`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: row families only, not rerun.

- **Markdown link transformer.** `MarkdownTransformers.test.ts` checks three things. Plain or formatted text before a converted markdown link survives. The link pattern does not match greedily after an earlier match that was not converted. No markdown link is created inside an existing link. These are rules a markdown link plugin owns. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:494-497`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: not rerun.

- **Markdown e2e.** `Markdown.spec.mjs` covers:
  - ordered-list shortcuts with any start number: `25. ` gives `<ol start="25">`, which the note on Plate's `EDIT-PROFILE-AUTOFMT-BLOCK-003` also requires;
  - heading, quote and bullet shortcuts, and import/export cycles;
  - inline text transformers: nested bold, italic and strikethrough, intraword rules, links and emoji;
  - image and equation imports, and several text-match transformers on one line;
  - #7349: no text transformer runs inside code-formatted text;
  - the selection after a link text-match transform;
  - list-marker export and copy;
  - HR and code-fence shortcuts.

  Regression #3433 adds that a list typed with `- ` in the block just before an existing list joins that list, so the new item comes first (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/regression/3433-merge-markdown-lists.spec.mjs:19`). Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:664-673`, `:328`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: row families only, not rerun.
