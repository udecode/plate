# @platejs/test

Plate test utilities for headless, React, DOM, Playwright, and proof work.

`@platejs/test` is Plate's test-only distribution. Its root is safe in plain Node. React, browser DOM, Playwright, and release-proof code live behind explicit subpaths so one test environment does not load another.

## Install

```text
npm install platejs
npm install -D @platejs/test
```

Install the peers for the subpath you use:

```text
npm install -D react react-dom @testing-library/react
npm install -D @playwright/test
```

Use the matching command for pnpm, Yarn, or Bun when your project uses another package manager.

Import exactly the layer you need:

Runtime labels describe where the exported module executes. Node-hosted tools remain headless even when they drive a browser:

| Entrypoint                 | Runtime  |
| -------------------------- | -------- |
| `@platejs/test`            | headless |
| `@platejs/test/proof`      | headless |
| `@platejs/test/playwright` | headless |
| `@platejs/test/react`      | client   |
| `@platejs/test/browser`    | client   |

## Package Surface

- `@platejs/test`
  - Plate JSX fixtures: `jsx`, `jsxt`, and `hjsx`
  - fixture editor creation: `createEditorFromFixture`
  - selection projection: `projectTestSelectionRange`
  - minimal `DataTransfer` fixtures: `createDataTransfer`
- `@platejs/test/react`
  - `PlateTest` for rendering an existing Plate editor
  - `createPlateTestEditor` for Testing Library interaction tests
- `@platejs/test/proof`
  - pure selection helpers: `serializePoint`, `serializeRange`, `isCollapsed`
  - IME and placeholder proof classifiers: `evaluateImeInput`, `evaluatePlaceholderInput`
  - raw-mobile receipt validation: `assertPliteRawMobileProof`, `validatePliteRawMobileProof`, `PLITE_RAW_MOBILE_SCENARIOS`
  - first-party parity contracts: `assertPliteBrowserFirstPartyParityContracts`
  - feature proof contracts: `definePliteBrowserFeatureContract`, `createPliteBrowserFeatureContractRegistry`
  - debug snapshot parsers for agent-browser and Appium proof artifacts
- `@platejs/test/browser`
  - DOM selection snapshots: `takeDOMSelectionSnapshot`, `takeEditorSelectionSnapshot`
  - zero-width placeholder inspection: `inspectZeroWidthPlaceholder`
- `@platejs/test/playwright`
  - start here for browser proof work
  - editor-first Playwright harness
  - Chromium CDP IME helpers
  - real clipboard write + browser paste helpers
  - real clipboard read helpers
  - readiness contract for mounted examples
  - getter namespace for text/html/selection state
  - selected-text getter
  - displayed-selection getter for native and projected selection proof
  - screenshot attachment helper for visual proof artifacts
  - file-backed JSON attachment helper for replayable proof artifacts
  - native event trace helpers for `selectionchange`, `beforeinput`, `input`, composition, target ranges, DOM deltas, and anomaly labels
  - trusted typing timing and long-task capture through `measurePliteTrustedTyping(...)`
  - block-text getter and assertion helpers
  - snapshot helper for aggregated editor state
  - selection namespace for semantic selection actions and setup
  - DOM namespace for mounted text-path readiness and native caret setup
  - tolerant selection assertions
  - collapsed model/native DOM selection agreement assertions
  - double-highlight selection assertion
  - normalized html equality assertions
  - iframe and scoped-surface support
  - block/text locator helpers: `getPliteBrowserEditable`, `locatePliteBrowserBlock`, `locatePliteBrowserText`
  - replayable scenario steps, including direct DOM text mutation import for contenteditable repair proof
  - replayable selection-contract assertions for model, native selected text, DOM endpoints, visible selection, and double-highlight proof
  - helper types: `ReadyOptions`, `EditorSurfaceOptions`, selection and clipboard snapshot types, native event trace snapshot and anomaly types
  - `withExclusiveClipboardAccess(...)`

## Boundaries

- `@platejs/test` is public test infrastructure, not the editor runtime API.
- The root imports only `platejs` and `platejs/hyperscript`; it does not load React, browser globals, or Playwright.
- `@platejs/test/react` owns React and Testing Library helpers.
- `@platejs/test/playwright` owns browser tests. It may depend on Playwright types and test fixtures.
- `@platejs/test/proof` and `@platejs/test/browser` stay small enough for pure assertions, capability classifiers, and DOM snapshots.
- Raw-device identity belongs to the executable device runner. Automated device-browser input or IME proof closes only when that gate runs and records the resolved device, OS, and capability scope. Proxy browser evidence does not claim native mobile clipboard, human soft-keyboard, glide typing, or voice input proof.
- The public package validates raw receipt structure and exact build identity. Repository release profiles, aggregate lane policy, artifact acquisition, and filesystem digest readback stay in release tooling.

## Raw Mobile Device Proof

Run the raw gate only in a direct-Appium lane connected to a real Android device running Chrome and a real iOS device running Safari:

```bash
bun test:mobile-device-proof:raw
```

The runner reads `test-results/release-proof/mobile-device-proof.json`. The schema requires one receipt for every scenario on both platforms: tap, double tap, long press, forward and backward selection handles, cross-inline and cross-block selection, selection auto-scroll, collapsed and expanded swipes, inline-void boundaries, Enter, Backspace, autocapitalization, composition/IME, and native clipboard.

Every receipt records real device, OS, browser, the exact expected source commit, replay steps, native and semantic selection, model and DOM text, semantic update count, event trace, screenshots, video, and SHA-256 digests. The command independently reads every artifact back and verifies its digest. An incomplete matrix, stale commit, viewport emulation, agent-browser proxy, or Appium descriptor without those artifacts fails closed and proves no raw-mobile claim.

## First Playwright Test

```ts
import { expect, test } from '@playwright/test';
import { openExample } from '@platejs/test/playwright';

test('types through the Plite browser path', async ({ page }) => {
  const editor = await openExample(page, 'plaintext', {
    ready: { editor: 'visible' },
  });

  await editor.focus();
  await editor.type('Hello from @platejs/test');

  await editor.assert.text('Hello from @platejs/test');
  await editor.assert.noDoubleSelectionHighlight();
  expect(await editor.get.selectedText()).toBe('');
});
```

## Proof Style

Use the `ready` contract for maintained callsites and examples. For editor surfaces, do not use Playwright `locator.fill()` as proof. Plite owns model input through `beforeinput`, selection import, and editor commands; `fill()` can bypass or mis-model that path, especially in Firefox. Use `editor.type(...)` or `page.keyboard.type(...)` when the claim is real keyboard behavior: typing, selected-text replacement, undoable key input, focus/caret routing, Enter follow-up text, or visual caret proof. Use `page.keyboard.insertText(...)` only when the row deliberately bypasses keydown: native `beforeinput` / `targetRange` traces, IME or CDP input, Unicode/layout insertion that Playwright cannot key-dispatch consistently, direct browser DOM mutation import, undo grouping as one text insertion, or model-latency probes. Every remaining `insertText` call in non-pagination example specs is classified by `packages/test/test/proof/keyboard-oracle-audit.test.ts`. Then assert model text, native selection, and native event trace when the behavior depends on browser input. Use `measurePliteTrustedTyping({ page, root, text })` after explicit editor readiness, selection, focus, and warmup when a route needs exact per-key DOM target/model readiness, a post-readiness paint boundary, trusted input, an unthrottled burst budget, and fail-closed long-task coverage. Pair it with an exact final model assertion for the whole measured text. Model-owned input binds to the runtime's recorded event selection; native input also requires its DOM target range to resolve to that same path and offset. Native event traces are browser contracts, not one-size-fits-all strings: Chromium/WebKit `insertText` may produce only `beforeinput`, while Firefox can report `insertCompositionText` and a trailing `input` event for the same Playwright call. Clipboard helpers prove delivery path and editor ownership, not feature semantics by themselves. `editor.clipboard.pasteHtml(...)` writes a rich clipboard payload and triggers the browser paste path; the route-specific test must still assert the expected parser behavior. Do not treat it as proof that a surface supports every rich HTML mark, element, sanitizer, or table policy. Use replayable scenario steps for generated stress. For direct browser DOM mutation/import proof, use `mutateTextDOM` so the artifact stays replayable; use `editor.scenario.runImperative(...)` for arbitrary browser work. Imperative scenario results are explicitly non-replayable, non-reducible, and ineligible for release proof. Generated stress artifacts carry reduction candidates. Replay the full artifact with `STRESS_REPLAY=<artifact> bun test:stress:replay:<project>`. Replay one candidate with `STRESS_REPLAY=<artifact> STRESS_REDUCTION=<label> bun test:stress:replay:<project>`. Reduced replays write a separate `.reduction-<label>.result.json` trace beside the full replay result. Decode imported JSON with `decodeScenarioReplay(...)`; never cast replay values into scenario steps. The decoder rejects unknown steps, stale metadata, non-JSON payloads, and assertion shapes that cannot prove anything.

Example:

```ts
import {
  attachPliteBrowserJsonArtifact,
  attachPageScreenshot,
  openExample,
  startPliteBrowserNativeEventTrace,
  stopPliteBrowserNativeEventTrace,
  takePliteBrowserNativeEventTrace,
} from '@platejs/test/playwright';

const editor = await openExample(page, 'placeholder', {
  ready: {
    editor: 'visible',
    placeholder: 'visible',
  },
});

await editor.focus();
await editor.type('Hello Plite Browser');
await editor.selection.select({
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 5 },
});
await editor.dom.waitForTextPath([0, 0]);
await editor.dom.collapseAtTextPath({ path: [0, 0], offset: 5 });

await editor.assert.text('Hello Plite Browser');
await editor.assert.blockTexts(['Hello Plite Browser']);
expect(await editor.get.selectedText()).toBe('Hello');
expect((await editor.selection.displayed()).source).toBe('native');
await editor.assert.noDoubleSelectionHighlight();
await attachPageScreenshot(page, testInfo, 'selection-proof.png');

await startPliteBrowserNativeEventTrace(editor.root);
await editor.type('!');
const nativeTrace = await takePliteBrowserNativeEventTrace(editor.root);
expect(nativeTrace.entries.some((entry) => entry.type === 'beforeinput')).toBe(
  true
);
await stopPliteBrowserNativeEventTrace(editor.root);

await editor.assert.htmlContains('data-plite-string="true"');
await editor.assert.selection({
  anchor: { path: [0, 0], offset: [0, 1] },
  focus: { path: [0, 0], offset: [4, 5] },
});
await editor.assert.collapsedModelDOMSelection({
  offset: [4, 5],
  path: [0, 0],
  text: 'Hello Plite Browser',
});
await editor.assert.htmlEquals(
  '<div data-plite-node="element"><span data-plite-node="text"><span data-plite-leaf="true"><span data-plite-string="true">Hello Plite Browser</span></span></span></div>',
  { ignoreClasses: true, ignoreInlineStyles: true, ignoreDir: true }
);

const snapshot = await editor.snapshot();
expect(snapshot.selection).not.toBeNull();
await attachPliteBrowserJsonArtifact(
  testInfo,
  'editor-snapshot-proof',
  snapshot
);

const secondBlock = editor.locator.block([1]);
await secondBlock.click({ clickCount: 3 });
await editor.selection.doubleClickDragTextRange({
  doubleClickOffset: 'This is edit'.length,
  endOffset: 'This is editable plain'.length,
  text: 'This is editable plain text, just like a <textarea>!',
});
await editor.selection.dragTextRange({
  endOffset: 5,
  endText: ' text, ',
  startOffset: 8,
  text: 'This is editable ',
});
await editor.selection.dragTextRange({
  direction: 'backward',
  endOffset: 'hyperlink'.length,
  startOffset: 0,
  text: 'hyperlink',
});
await editor.scenario.run([
  {
    expectation: {
      domSelection: {
        anchorNodeText: 'This is editable ',
        anchorOffset: 8,
        focusNodeText: ' text, ',
        focusOffset: 5,
      },
      noDoubleSelectionHighlight: true,
      selectedText: 'editable rich text',
    },
    kind: 'assertSelectionContract',
  },
]);

await editor.clipboard.pasteText('more');
await editor.clipboard.copy();
expect(await editor.clipboard.readText()).toContain('more');
```

For Tab-away or blur proof, use `editor.assert.noVisibleCaretInRoot()` after focus leaves the editor. It asserts the editor no longer owns a paintable focused caret even if the browser keeps a stale DOM range.

Package commands:

- `pnpm --filter @platejs/test build`
- `pnpm --filter @platejs/test test`
- `pnpm --filter @platejs/test test:node`
- `pnpm --filter @platejs/test test:react`
- `pnpm --filter @platejs/test test:proof`
- `pnpm --filter @platejs/test test:dom`
- `pnpm --filter @platejs/test test:selection`

The package-local `test` script covers:

- `test:node`
- `test:react`
- `test:dom`

Run `test:selection` for the focused browser-selection lane.
