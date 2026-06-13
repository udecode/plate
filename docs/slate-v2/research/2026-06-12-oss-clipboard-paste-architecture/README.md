# OSS Clipboard And Paste Architecture Research

Question: which portable clipboard and paste invariants from mature editors
should Slate v2 promote into tests, benchmark proof, docs, or runtime owners?

Scope:
- source-inspected paste, clipboard, beforeinput, selection replacement,
  fragment metadata, hidden DOM, and browser fallback paths;
- local sibling repositories only for code-level claims;
- promote only Slate-native proof gaps.

Exclusions:
- no runtime patch copied from other editors;
- no external issue ledger work;
- no raw mobile claim;
- no broad table or pagination architecture.

Current verdict:
- ProseMirror has the strongest composition-specific paste signal: it refuses
  JS paste handling while composition is active outside Android, and keeps
  slice metadata for rich paste.
- CodeMirror contributes a runtime/harness lesson: flush pending DOM/native
  input state before paste and keep explicit linewise paste semantics.
- Lexical contributes API-ordering signal: rich paste prefers editor-native JSON,
  then HTML, then plain text, with iOS Safari plain text guards.
- Slate v2 already covers model-backed copy/paste, hidden and staged DOM
  boundaries, rich HTML paste, mentions, inline paste, markdown quote paste, and
  same-text native paste fallback guards.
- Missing exact invariant: native Chromium IME composition remains coherent when
  a real clipboard paste lands at the composition point. Promoted into
  `playwright/integration/examples/richtext.test.ts`.

Kept promotion:
- `richtext-native-ime-paste-at-composition-point`: Chromium native IME
  composition starts, text is written to the browser clipboard, the real paste
  shortcut runs while composition is open, composition commits, and model text
  plus selection land at the expected adjusted caret.
- `paste-html-prosemirror-table-row-slice`: ProseMirror `data-pm-slice` table
  row wrapper HTML imports as a table row without exposing slice metadata.
- `runtime-clipboard-flushes-pending-native-text-before-paste`: Slate runtime
  clipboard events flush pending native text repair before app paste callbacks
  or model clipboard commands observe state. The same runtime path is used for
  copy and cut.

Focused proof:

```bash
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "plain text is pasted at the composition point"
```

Result: 1 passed.

Adjacent proof:

```bash
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "(preserves native IME composition when model text changes before it|keeps native IME composition coherent when model delete starts at composition point|keeps native IME composition coherent when plain text is pasted at the composition point)"
```

Result: 3 passed.

Runtime flush proof:

```bash
cd .tmp/slate-v2/packages/slate-react
bun test:vitest test/input-router-contract.test.tsx
cd ../..
bun --filter ./packages/slate-react typecheck
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "plain text is pasted at the composition point"
```

Result: 39 package tests passed; slate-react typecheck passed; focused
Chromium route row passed.

Test-harness lesson:
- `Locator.evaluate` passes the locator element as the first argument. A first
  attempt wrote that element to `navigator.clipboard`, producing
  `[object HTMLDivElement]` in the document. The test was corrected to accept
  `(_element, text)`.

Follow-up proof:

```bash
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/paste-html.test.ts --project=chromium --project=firefox --project=webkit --grep "(pastes ProseMirror slice list items without runtime errors|pastes ProseMirror text slices without exposing slice metadata|pastes ProseMirror table row slices without exposing slice metadata)"
```

Result: 9 passed.
