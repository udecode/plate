# Lexical: selection and caret

## Selection state

- Lexical tracks selection changes explicitly: the editor state carries a dirty-selection signal, `$setSelection` marks the selection dirty and clears cached selected nodes, and `$selectAll` selects the root element in the model instead of relying on a native DOM range across the document. For a partial-DOM editor this means select-all, delete and undo should be measured as model and projection work, separate from native selected-text length. Source: `docs/plite/research/2026-06-12-huge-doc-native-selection/README.md:44-49`. The historical source slices are recorded in `docs/plite/research/2026-06-12-huge-doc-native-selection/sources/lexical-selection-summary.md:3-6` and `docs/plite/research/2026-06-12-huge-doc-native-selection/read-log.tsv:17-19`. Limit: unpinned local checkout read on 2026-06-12.

## Focus

- **Focus e2e.** `Focus.spec.mjs` checks two things: the selection stays in editor state when a click lands outside the editor ('selection remains internally when clicking outside the editor'), and Tab moves focus out of the editor in plain-text mode ('can tab out of the editor'). See `facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/Focus.spec.mjs:20-34`. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:725`. Limit: not rerun.

## Navigation

- **Navigation e2e.** `Navigation.spec.mjs` expects different word-movement results per browser and OS (Chromium, Firefox and WebKit, on Windows and macOS). Porting it needs a browser test of keyboard navigation; a model query test cannot check it. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:806`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: not rerun.

## Selection tests

- **Selection e2e.** `Selection.spec.mjs` covers:
  - no focus on load, and keeping a blurred editor's selection;
  - triple-click block selection;
  - line and unit deletion, and insertion at inline boundaries;
  - table containment and triple-click in tables, and whole-table range expansion;
  - RTL navigation around decorators;
  - collapsible and date-time nodes;
  - text-format persistence.

  Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:807`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: row families only, not rerun.

- **Core selection unit tests.** Lexical core's `LexicalSelection.test.ts` covers inserting text on either side of inline elements, select-all and extraction, point order, the token and segmented text modes, decorator text content, and resetting formats on DOM import. Token and segmented are Lexical text-node modes with no counterpart in a plain text-leaf model. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:817`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: not rerun.

## Blurred selection

- **Selection painted while blurred.** The playground can keep painting a selection after the editor blurs, through a fake-selection overlay whose highlight must line up with the text within a tolerance (`SelectionAlwaysOnDisplay.spec.mjs`). The only portable part is that the model selection survives blur. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:808`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: not rerun.

## Caret API

- **Caret API.** Lexical has a caret object API with its own tests, `LexicalCaret.test.ts` and `docs-traversals.test.ts`, covering traversal and order, destructive range deletion, and the token and segmented modes. The portable rows are point order, sibling and descendant traversal, and the rule that deleting an expanded range trims both edges before collapsing at the anchor, across sibling leaves and across blocks. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:818`, `:896`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: not rerun.

## Element points

- **A selection may end on an element.** A Lexical range point can sit on an element, and `$normalizeSelection` moves an element-backed endpoint down to a text point where one exists. An endpoint next to an empty element stays an element point inside that element, and one after a decorator stays an element point on the paragraph. The tests run each case forward and reversed: paragraph to text nodes, text plus element, text plus decorator, text plus text, and an element holding two texts (`facebook/lexical@dd5c41b1:packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx:25-173`). Despite the file name, the file tests selection normalization, not tree repair. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:890`.

- **The selection in an empty editor.** With focus in an empty Lexical editor, the selection is the element point `[0]` offset 0, which is the empty paragraph itself (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/Placeholder.spec.mjs:47`). Plite addresses the text leaf inside the paragraph instead: `[0, 0]` offset 0 (`apps/plite/tests/plite-browser/donor/examples/placeholder.test.ts:29-45`). The placeholder text differs between the playground's rich-text, plain-text and collaboration modes. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:910-912`.
