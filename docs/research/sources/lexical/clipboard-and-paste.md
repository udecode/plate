# Lexical: clipboard and paste

## Paste routing and payload priority

- Lexical routes paste through a command boundary kept apart from native beforeinput composition handling, and its clipboard package reads editor JSON first, then HTML, then plain text, with an iOS Safari guard for the case where the plain-text and HTML payloads are equal. Source: `docs/plite/research/2026-06-12-oss-clipboard-paste-architecture/README.md:24-25`. The historical source slices are recorded in `docs/plite/research/2026-06-12-oss-clipboard-paste-architecture/read-log.tsv:5-6`. Limit: unpinned local checkout read on 2026-06-12.

## Code blocks

- **Code-source HTML corpus.** Lexical core's unit test `CodeBlock.test.ts` is an HTML paste corpus, not a code-node test. It pastes code copied from VS Code, Quip, WebStorm, Postman, Slack, CodeHub and GitHub or Gist, single-line and multi-line `<code>`, `<code>` with nested `<br>`, mixed text formats, Google Docs titles, also wrapped in a paragraph, and subscript and superscript (`facebook/lexical@dd5c41b1:packages/lexical/src/__tests__/unit/CodeBlock.test.ts:45-118`). The source shapes include Quip's `<pre>`, VS Code's line `<div>`s with `white-space: pre` and GitHub's code tables, and an importer has to read each as one code block without the line-number gutter. Plate's importer side is in `docs/research/sources/plate-notes/clipboard-and-serialization.md`. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:118`. Limit: the case names were reread at dd5c41b1; the expected HTML was not.

## Horizontal rules

- **Horizontal rules in pasted HTML.** Lexical's `HTMLCopyAndPaste.spec.mjs` pastes a paragraph between two horizontal rules, and pastes a lone `<hr />` into the middle of `Hello world`, which splits the paragraph around the rule (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:135`, `:199`). These rows need a block-void rule and block-fragment insertion; a paste-parser change alone does not cover them. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:162-163`. Limit: not rerun.

## Google Docs HTML

- **Google Docs marks and its `<b>` wrapper.** Lexical's `TextFormatHTMLCopyAndPaste.spec.mjs` pastes Google Docs spans that set bold, italic and underline as inline styles at `font-size: 11pt`, and has a `<mark>` highlight row. Google Docs wraps its whole clipboard payload in `<b style="font-weight:normal;" id="docs-internal-guid-…">`, and that `<b>` must not import as bold. The spec's own fixture carries the wrapper (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TextFormatHTMLCopyAndPaste.spec.mjs:24`), as does Lexical's core paste corpus (`facebook/lexical@dd5c41b1:packages/lexical/src/__tests__/unit/HTMLCopyAndPaste.test.ts:90`). Plate's bold decoder refuses an element when it or any element inside it is styled `font-weight: normal` (`packages/platejs/src/features/basic-nodes/lib/BaseMarkPlugins.ts:157`, through `someHtmlElement` in `packages/platejs/src/lib/plugins/html/htmlDom.ts:160`). Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:164-165`. Limit: the wrapper shape comes from captured fixtures, not from a fresh copy out of Google Docs.

- **Checklist HTML from other apps.** Lexical's core paste test imports checklists copied from Google Docs, GitHub and Joplin. Google Docs writes each item as `<li role="checkbox" aria-checked>` holding a checkbox `<img alt="checked">` (or `alt="unchecked"`) and an inline-block `<p>`, all inside its `docs-internal-guid` `<b>` wrapper (`facebook/lexical@dd5c41b1:packages/lexical/src/__tests__/unit/HTMLCopyAndPaste.test.ts:90`). Importing them needs a checklist schema and checkbox normalization. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:210`. Limit: the GitHub and Joplin shapes were not reread.

## Links

- **Link paste rows.** `LinksHTMLCopyAndPaste.spec.mjs` (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs`) imports an anchor, pastes before or after a link, copies part of a link, and pastes an empty link inside a list (#3193). A URL pasted over a selected word links that word (`:213`), as Plate's default does (`### Link` in `docs/editor-behavior/markdown-editing-spec.md`). Paste at a collapsed caret inside a link splits the link around the pasted content: plain text, formatted text and a pasted link each land between two halves of the old link, so no link is nested, and two pasted paragraphs split the link across both blocks (`:247-405`). Regression #3136 replaces selected plain text just before or just after an inline link with rich content, and the link neither grows nor disappears (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs:26-67`). Plate notes cover paste over selected text inside a link (`docs/research/sources/plate-notes/clipboard-and-serialization.md`), but Plate's spec has no rule for a collapsed paste inside an existing link. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:166-174`, `:873`. Limit: the anchor, boundary and partial-copy rows were not reread.

## Lists

- **List paste rows.** `ListsHTMLCopyAndPaste.spec.mjs` pastes:
  - a basic `<ul>`;
  - nested-list variants: a nested item, a `ul` directly inside a `ul`, and `li` text followed by a child `ul`;
  - nested `<div>`s inside list items, which must keep their paragraph boundaries;
  - a top-level element pasted into the middle of a list, which splits the list around it;
  - a checklist marked with Lexical's private `__lexicallisttype="check"` attribute and checkbox ARIA.

  Its toolbar indent and outdent assertions are product shell. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:175-179`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: row topics only, not rerun.

- **Strict list indentation on import.** `registerListStrictIndentTransform` rewrites malformed nested lists into strict nesting, for example a `ul` placed directly inside a `ul`, or `li` text followed by a child `ul`. Its test asserts the normalized HTML, `value` attributes included, through `$generateHtmlFromNodes`. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:458-460`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: not rerun.

## Core paste cases

- **Core HTML paste cases.** Lexical core's `HTMLCopyAndPaste.test.ts` is table-driven. Its cases are a bare DOM text node, a malformed `<p>Hello!<p>`, a single `<div>`, nested spans and divs, a span inside a div, and a div inside a span. The malformed paragraph comes out as the visible paragraph plus an empty paragraph for the second `<p>`, which the HTML parser creates, so the expected result keeps a parser artifact (`facebook/lexical@dd5c41b1:packages/lexical/src/__tests__/unit/HTMLCopyAndPaste.test.ts:40-42`). Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:204-205`. Limit: at dd5c41b1 the table also has 'div with display:inline should not insert linebreaks' and a Ghostty terminal paste (`:110-117`), which the 2026-05-09 ledger does not list.

## iOS predictions

- **iOS word predictions arrive as a paste.** An iOS Safari autocorrect or word prediction reaches the editor as a paste whose `text/plain` and `text/html` hold the same string. Lexical treats that payload as plain text, so the selection's formatting applies to it. The test is 'iOS fix: Word predictions should be handled as plain text to maintain selection formatting' (`facebook/lexical@dd5c41b1:packages/lexical/src/__tests__/unit/HTMLCopyAndPaste.test.ts:146-171`). Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:212`. Limit: the test builds the payload with a DataTransfer, so it is not proof on a device.

## Block types on paste

- **A heading pasted into an empty paragraph stays a heading.** In 'Copy and paste heading' (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:215`), Lexical pastes a copied heading into an empty paragraph as a heading. Plite later adopted the same rule: over an empty target the copied block type wins (`docs/research/sources/plate-notes/clipboard-and-serialization.md`). That reverses the target-owned rule this ledger recorded on 2026-05-09. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:231`. Limit: the Lexical row was not rerun.

- **Multi-line plain text into a heading.** When multi-line plain text is pasted into a heading, Lexical keeps the first line in the heading and makes each following line a paragraph ('Copy + paste multi-line plain text into rich text produces separate paragraphs', `facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:746`). Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:234`. Limit: not rerun.

- **Paragraphs pasted into an empty quote.** When two copied paragraphs are pasted into an empty quote, the first paragraph's text stays in the quote and the second follows it as a paragraph ('Copy and paste paragraph into quote', `facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:825`). A Lexical quote holds text directly, not block children. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:236`. Limit: not rerun.
