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

- **Text inserted at an inline element's edge lands outside it.** In 'Inserting text either side of inline elements' (`facebook/lexical@dd5c41b1:packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:102`), a link sits at the start, middle or end of a paragraph. With the caret on the link's start edge (`link.select(0, 0)`) or end edge (`link.select(1, 1)`), or on the edge of the neighbouring text node, both `insertText('x')` and `insertNodes` of a one-paragraph fragment put `x` outside the link, in or beside the adjacent text node. The test comments call these the calls Lexical's clipboard makes for plain and rich inline paste. Source: `docs/editor-test-harvester/lexical/report.md:189`; body read at dd5c41b1 on 2026-10-08.

## Blurred selection

- **Selection painted while blurred.** The playground can keep painting a selection after the editor blurs, through a fake-selection overlay whose highlight must line up with the text within a tolerance (`SelectionAlwaysOnDisplay.spec.mjs`). The only portable part is that the model selection survives blur. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:808`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: not rerun.

## Caret API

- **Caret API.** Lexical has a caret object API with its own tests, `LexicalCaret.test.ts` and `docs-traversals.test.ts`, covering traversal and order, destructive range deletion, and the token and segmented modes. The portable rows are point order, sibling and descendant traversal, and the rule that deleting an expanded range trims both edges before collapsing at the anchor, across sibling leaves and across blocks. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:818`, `:896`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: not rerun.

## Element points

- **A selection may end on an element.** A Lexical range point can sit on an element, and `$normalizeSelection` moves an element-backed endpoint down to a text point where one exists. An endpoint next to an empty element stays an element point inside that element, and one after a decorator stays an element point on the paragraph. The tests run each case forward and reversed: paragraph to text nodes, text plus element, text plus decorator, text plus text, and an element holding two texts (`facebook/lexical@dd5c41b1:packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx:25-173`). Despite the file name, the file tests selection normalization, not tree repair. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:890`.

- **The selection in an empty editor.** With focus in an empty Lexical editor, the selection is the element point `[0]` offset 0, which is the empty paragraph itself (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/Placeholder.spec.mjs:47`). Plite addresses the text leaf inside the paragraph instead: `[0, 0]` offset 0 (`apps/plite/tests/plite-browser/donor/examples/placeholder.test.ts:29-45`). The placeholder text differs between the playground's rich-text, plain-text and collaboration modes. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:910-912`.

## Caret visibility

- 'Auto scroll while typing' (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs:18`) caps either the contenteditable or its parent at 200 px with `overflow: auto`, types 15 lines of `Hello` with Enter, and after each line checks that a marker inserted at the caret lies inside the scroll container. Its soft-line-break variants are skipped. Source: `docs/editor-test-harvester/lexical/report.md:193`; body read at dd5c41b1 on 2026-10-08.

## selectionchange handling

- Lexical attaches one shared `selectionchange` listener per document. The listener is reference-counted across every editor registered on that document and gives each event to an editor by its shadow-aware anchor, not by `Selection.anchorNode` (`facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/lexical/src/LexicalEvents.ts:198-223`). Chrome on Android shifts the selection rightward when deleting across paragraphs. So after a model delete there, Lexical saves the correct collapsed selection, restores it during the next selectionchange, and clears the saved value in a `setTimeout` in case selectionchange never fires (`LexicalEvents.ts:961-974`). Source: `docs/plite/research/2026-06-12-browser-longtask-selection-oracles/read-log.tsv:6-7`, read 2026-06-12 at lines 723-735 and 1393-1404. The line numbers here were rechecked at `dd5c41b`.

## Triple-click and DOM range normalization

- Lexical corrects a browser triple-click in its model: a triple-click selects from a block's start to the start of the next block, and Lexical moves the over-selected focus back. At dd5c41b1 this lives in `facebook/lexical@dd5c41b1:packages/lexical-extension/src/NormalizeTripleClickSelectionExtension.ts`, which expects the selection change at most `thresholdMsec` (default 100 ms) after the triple click (`:162`, `:181`). Lexical's changelog records the move there from `LexicalEvents.ts`, where the 2026-06-14 read found it (#8520, `facebook/lexical@dd5c41b1:CHANGELOG.md:218`), and fixes for selection after a triple-click (#4512), triple-click around inline links (#7055), a triple-clicked table cell selecting the whole document (#6542), selection of the adjacent cell on triple-click (#7213) and over-selection in `setBlocksType` (#8517) (`CHANGELOG.md:2160`, `:1075`, `:1354`, `:985`, `:217`). `applyDOMRange` normalizes a DOM-applied selection because Firefox can report an element point where a text point is meant (`facebook/lexical@dd5c41b1:packages/lexical/src/LexicalSelection.ts:787`, `:813-815`), and link transforms normalize the restored selection with `$normalizeSelection__EXPERIMENTAL` (`facebook/lexical@dd5c41b1:packages/lexical-link/src/LexicalLinkNode.ts:360`, `:631`). Source: `docs/plite/research/2026-06-14-selection-triple-click-inline-normalization/README.md:19-25`, `read-log.tsv:2-5`.

## Selection restore

- **Restoring a selection after a browser quirk.** When Lexical deletes across paragraphs itself on Android Chrome, Chrome then shifts the selection rightwards, so Lexical saves the collapsed selection it computed (`postDeleteSelectionToRestore`) and restores it in the next `selectionchange`, clearing it on a timeout in case none fires (`facebook/lexical@dd5c41b1:packages/lexical/src/LexicalEvents.ts:962-974`, `:367-386`); it does not import whatever selection the browser reports after the delete. Read 2026-10-08; the June run read it unpinned at `:726-734`.
