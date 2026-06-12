# Shard 001: Testing Oracles

## Scope

Read one focused batch: Slate v2 `slate-browser`, ProseMirror view tests, and
Tiptap Cypress paste support.

## Sources Sampled

- `.tmp/slate-v2/packages/slate-browser/src/core/first-party-browser-contracts.ts`
- `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`
- `.tmp/slate-v2/packages/slate-browser/src/playwright/ime.ts`
- `.tmp/slate-v2/packages/slate-browser/test/core/scenario.test.ts`
- `.tmp/slate-v2/playwright/integration/examples/huge-document.test.ts`
- `../prosemirror/view/test/webtest-composition.ts`
- `../prosemirror/view/test/webtest-selection.ts`
- `../prosemirror/view/test/webtest-domchange.ts`
- `../prosemirror/view/test/webtest-clipboard.ts`
- `../tiptap/tests/cypress/support/commands.js`

## Top Leads

1. Name the huge-doc repeated vertical-selection proof as a first-party
   `slate-browser` operation family.
2. Name existing richtext formatted-boundary IME proof as a first-party
   `slate-browser` operation family.
3. Add a Slate-native rapid/cross-paragraph IME row with native Chromium proof
   and synthetic-helper regression proof, then keep overlap/decorator
   composition as separate future work.
4. Mark geometry/coords pressure as covered-existing by `slate-browser`
   selection browser tests and `slate-dom` bridge tests.
5. Name existing plaintext beforeinput target-range repair as a first-party
   `slate-browser` operation family, backed by browser replacement/undo rows
   plus slate-react pending native text repair contracts.
6. Name external clipboard slice-context import as a first-party `slate-browser`
   operation family, backed by existing paste-html ProseMirror slice,
   comment-bounded fragment, and table HTML import rows.
7. Add a stepwise synthetic IME helper and async-decoration proof for
   decoration refresh during active composition.

## Rejected

Tiptap paste helper is weaker duplicate support.

## Next Query

After the contract row lands, pick between:

- implement a small Slate-native IME overlap-cancellation scenario from the
  ProseMirror corpus;
- continue huge-doc correctness smoke with the stronger contract vocabulary;
- add a deeper DOM-change repair oracle only if a new runtime gap appears beyond
  the current beforeinput target-range contract.
- execute the table-fragment rectangle-algebra plan after the queued review
  boundary accepts selected-cell insertion semantics.
