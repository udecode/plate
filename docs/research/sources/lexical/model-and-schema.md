# Lexical: model and schema

## Tabs

- **A tab is a `TabNode`.** Lexical stores a tab as a `TabNode` with its own serialization, type guard and selection-boundary normalization. Rich text's `INSERT_TAB_COMMAND` carries marks through TabNode format bits. The tests:
  - paste plain text with tabs and newlines, which gives one paragraph in plain-text mode and split paragraphs in rich text;
  - paste Google Docs HTML, whose tabs arrive as `<span class="Apple-tab-span" style="white-space:pre;">` around a tab character (fixture shape at `apps/plite/tests/plite-browser/donor/examples/paste-html.test.ts:16`);
  - keep a commented #4429 TODO;
  - type Tab at a block start, in the middle of text, and over a selection.

  Plite stores a tab as ordinary text. Source: `c70bacbd4a:docs/editor-test-harvester/lexical/plite-processing-ledger.md:709-716`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: not rerun.

## Inline entities

- **A Lexical mention is a segmented text node.** The playground's `MentionNode` sets text mode `segmented` (`facebook/lexical@dd5c41b1:packages/lexical-playground/src/nodes/MentionNode.ts:93`). Arrow keys move the caret one character at a time inside `Luke Skywalker`, but deletion removes a whole word segment. Backspace with the caret after `Luke` leaves the mention `Skywalker` (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:197`), Delete there leaves `Luke` (`:270`), and Backspace at the mention's end removes `Skywalker` and then `Luke` (`:343`). Pasting a mention's HTML over a selected mention and typing after it leaves a mention plus plain text, with no crash (`:914`). Source: `docs/editor-test-harvester/lexical/report.md:187-188`; bodies read at dd5c41b1 on 2026-10-08.

- **The playground mention is a text entity.** Lexical's playground `MentionNode` extends `TextNode` in segmented, directionless mode, marks itself a text entity, refuses text inserted directly before or after it and exports to HTML as `<span data-lexical-mention="true">` (`facebook/lexical@dd5c41b1:packages/lexical-playground/src/nodes/MentionNode.ts:28-94`), rather than an inline element with a void body. Read 2026-10-08.

## Line breaks

- **A soft line break is a `LineBreakNode`.** Lexical models a line break inside a paragraph as a `LineBreakNode` child rendered as `<br>`, with its own type, schema and type guard. The open-line regression shows the shape: Ctrl+O at the start of the second paragraph leaves that paragraph holding a `<br>` and then `bar`, with the caret on the paragraph element before the break (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/regression/399-open-line.spec.mjs:72-91`). Plite has no line-break node; its soft break inserts a newline character into the text (`packages/plitejs/src/editor/insert-soft-break.ts:8-18`). Source: `c70bacbd4a:docs/editor-test-harvester/lexical/plite-processing-ledger.md:899`. Limit: the #399 reading covers rich-text mode only.

## Serialized node model and versions

- Lexical's serialization guide warns that the flat per-node `version` field does not compose through node inheritance and recommends additive optional fields or a new node type instead (`facebook/lexical@dd5c41b1:packages/lexical-website/docs/serialization/serialization.md:490-567`, sections 'Versioning & Breaking Changes' and 'Dangers of a flat version property'), and the serialized base type calls `version` not generally recommended for use (`facebook/lexical@dd5c41b1:packages/lexical/src/LexicalNode.ts:91-95`). Source: `docs/plite/research/2026-08-17-document-schema-migrations/read-log.tsv:6`; `docs/plite/research/2026-08-17-editor-node-model-standards/README.md:146-148`, `read-log.tsv:7`; reread at the pinned commit on 2026-10-08.

- Lexical serializes typed nodes with flat fields: elements carry `children` plus `direction`, `format`, `indent` and optional text format and style (`facebook/lexical@dd5c41b1:packages/lexical/src/nodes/LexicalElementNode.ts:63-75`), text carries `text`, a numeric `format` bitmask and `style`, and every node has a per-node `version` (`facebook/lexical@dd5c41b1:packages/lexical/src/LexicalNode.ts:91-95`). It has one heading node type with an `h1` to `h6` `tag` field (`facebook/lexical@dd5c41b1:packages/lexical-rich-text/src/index.ts:141-146`, `:308-340`), and serialized table cells carry `colSpan`, `rowSpan`, `headerState`, `width`, `backgroundColor` and `verticalAlign` (`facebook/lexical@dd5c41b1:packages/lexical-table/src/LexicalTableCellNode.ts:43-52`). Source: `docs/plite/research/2026-08-17-editor-node-model-standards/README.md:98`, `read-log.tsv:7-10`.
