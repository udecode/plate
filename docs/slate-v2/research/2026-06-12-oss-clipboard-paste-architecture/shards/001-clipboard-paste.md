# Clipboard And Paste Shard

Sources sampled:
- ProseMirror view clipboard and input event internals.
- CodeMirror view input and clipboard fallback internals.
- Lexical clipboard package and paste event routing.
- Slate v2 clipboard strategy, browser harness, richtext IME rows, and hidden
  DOM/staged paste package coverage.

Top lead:
- Paste during active composition is a known hard edge. ProseMirror explicitly
  avoids JS paste handling while composition is active outside Android. Slate v2
  had rich paste coverage and rich IME coverage, but not their intersection.

Promoted proof:
- Added `keeps native IME composition coherent when plain text is pasted at the
  composition point` to `playwright/integration/examples/richtext.test.ts`.
- The row uses native Chromium IME, writes real browser clipboard text, presses
  the real paste shortcut while composition is open, commits composition, and
  asserts model text plus selection.

Result:
- Focused paste-composition row passed.
- Adjacent native IME conflict trio passed.

Rejected or deferred:
- The ProseMirror table wrapper lead was reopened and promoted into a focused
  table-row `data-pm-slice` oracle. It passed on Chromium, Firefox, and WebKit.
- Do not promote synthetic paste-composition only. It is weaker than native
  browser proof for this class.

Workflow lesson:
- First browser row falsely wrote `[object HTMLDivElement]` to the clipboard
  because `Locator.evaluate` passes the element first. The test was corrected to
  `(_element, text)`. This belongs in the workflow slowdown ledger, not runtime
  code.
