# Lexical: model and schema

## Tabs

- **A tab is a `TabNode`.** Lexical stores a tab as a `TabNode` with its own serialization, type guard and selection-boundary normalization. Rich text's `INSERT_TAB_COMMAND` carries marks through TabNode format bits. The tests:
  - paste plain text with tabs and newlines, which gives one paragraph in plain-text mode and split paragraphs in rich text;
  - paste Google Docs HTML, whose tabs arrive as `<span class="Apple-tab-span" style="white-space:pre;">` around a tab character (fixture shape at `apps/plite/tests/plite-browser/donor/examples/paste-html.test.ts:16`);
  - keep a commented #4429 TODO;
  - type Tab at a block start, in the middle of text, and over a selection.

  Plite stores a tab as ordinary text. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:709-716`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: not rerun.

## Inline entities

- **A Lexical mention is editable text.** In Lexical's playground, a mention's text can be edited character by character: `Mentions.spec.mjs` deletes characters inside a mention. Plate's mention is an inline void atom that Backspace and Delete remove whole (`EDIT-MENTION-BS-START-001`, `EDIT-MENTION-DEL-END-001`). Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:805`. Limit: not rerun.

## Line breaks

- **A soft line break is a `LineBreakNode`.** Lexical models a line break inside a paragraph as a `LineBreakNode` child rendered as `<br>`, with its own type, schema and type guard. The open-line regression shows the shape: Ctrl+O at the start of the second paragraph leaves that paragraph holding a `<br>` and then `bar`, with the caret on the paragraph element before the break (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/regression/399-open-line.spec.mjs:72-91`). Plite has no line-break node; its soft break inserts a newline character into the text (`packages/plitejs/src/editor/insert-soft-break.ts:8-18`). Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:899`. Limit: the #399 reading covers rich-text mode only.
