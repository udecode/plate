---
date: 2026-04-03
topic: slate-browser-testing-api-design
---

# Slate Browser Testing API Design

> Specialist testing/proof doc. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Purpose

This doc proposes the API/DX shape for the future editor testing framework.

Strong take:

- the API should feel close to **Slate concepts**
- not like generic Playwright glue with random helper names

If the framework is for editor work, its nouns should be:

- editor
- selection
- range
- point
- fragment
- composition
- placeholder
- clipboard

Not:

- “click the 3rd div and hope”

## Design Principles

1. **Slate-shaped nouns**
2. **Deterministic first**
3. **Browser truth where needed**
4. **Agent-ready, not agent-led**
5. **One mental model across runners**

## Current Public Shape

```ts
import { openExample } from "slate-browser/playwright";

const editor = await openExample(page, "placeholder");

await editor.focus();
await editor.assert.selection({
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 0 },
});

await editor.ime.compose({
  text: "가",
});

await editor.assert.text("가");
expect(await editor.get.selection()).not.toBeNull();
```

The exact syntax is not the point. The point is:

- editor-first
- selection-first
- IME is a first-class primitive

## Proposed API Modules

Concrete inspirations:

- Lexical utils:
  - `initialize(...)`
  - `assertHTML(...)`
  - `assertSelection(...)`
- edix helpers:
  - `storyUrl(...)`
  - `getEditable(...)`
  - `getText(...)`
  - `getSelection(...)`

The right API should steal their **shape discipline**, not their exact names.

## 1. Example Harness

```ts
import { openExample } from "slate-browser/playwright";

const editor = await openExample(page, "placeholder");
```

Responsibilities:

- open the right example/app surface
- return a typed editor harness

Why:

- Slate already organizes much behavior by example
- example identity should be a first-class input
- `openFixture(...)` is intentionally omitted until there is a real fixture lane

Current options:

```ts
const editor = await openExample(page, "custom-placeholder", {
  surface: {
    frame: "iframe",
    scope: '[data-cy="outer-shadow-root"] > div',
  },
  ready: {
    editor: "visible",
    placeholder: "visible",
  },
});
```

## 2. Editor Harness

```ts
await editor.selection.select({
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 5 },
});
await editor.selection.collapse({ path: [0, 0], offset: 5 });
const bookmark = await editor.selection.capture({ affinity: "inward" });
await editor.selection.restore(bookmark);
await editor.selection.unref(bookmark);
await editor.selection.selectAll();
const selection = await editor.selection.get();
const domSelection = await editor.selection.dom();
const rect = await editor.selection.rect();

await editor.focus();
await editor.click();
await editor.type("hello");
await editor.press("Enter");
```

Responsibilities:

- focus and basic interaction
- expose the main editable root

This should wrap runner details.

It should not leak:

- random selectors
- repeated boilerplate `page.getByRole('textbox')`

The package now exposes a selection namespace because editor tests keep needing
selection as both an action surface and a readable state surface.

## 3. Assertions

```ts
const text = await editor.get.text();
const blockTexts = await editor.get.blockTexts();
const selectedText = await editor.get.selectedText();
const html = await editor.get.html();
const selection = await editor.get.selection();
const domSelection = await editor.get.domSelection();
const snapshot = await editor.snapshot();

await editor.assert.text("hello");
await editor.assert.blockTexts(["hello"]);
await editor.assert.htmlContains("<p>...</p>");
await editor.assert.htmlEquals("<p>...</p>", {
  ignoreClasses: true,
  ignoreInlineStyles: true,
  ignoreDir: true,
});
await editor.assert.selection(expectedSelection);
await editor.assert.domSelection(expectedDomSelection);
await editor.assert.placeholderShape(expectedShape);
await editor.assert.placeholderVisible(true);
```

Why:

- Lexical’s selection assertions are the right model
- editor tests need selection assertions as first-class citizens

Recommended assertion data shapes:

```ts
type EditorSelectionSnapshot = {
  anchor: { path: number[]; offset: number | [number, number] };
  focus: { path: number[]; offset: number | [number, number] };
};

type DOMSelectionSnapshot = {
  anchorNodeText?: string;
  anchorOffset: number | [number, number];
  focusNodeText?: string;
  focusOffset: number | [number, number];
};
```

The framework should prefer:

- stable semantic assertions first
- DOM assertions second
- raw HTML only when needed

Current public surface:

- `editor.get.text()`
- `editor.get.blockTexts()`
- `editor.get.selectedText()`
- `editor.get.html()`
- `editor.get.selection()`
- `editor.get.domSelection()`
- `editor.snapshot()`
- `editor.selection.select(...)`
- `editor.selection.collapse(...)`
- `editor.selection.capture(...)`
- `editor.selection.bookmark(...)`
- `editor.selection.resolve(...)`
- `editor.selection.restore(...)`
- `editor.selection.unref(...)`
- `editor.locator.block(...)`
- `editor.locator.text(...)`
- `editor.assert.blockTexts(...)`
- `editor.assert.htmlContains(...)`
- `editor.assert.htmlEquals(..., options?)`

## 4. IME Module

```ts
await editor.ime.compose({
  text: "すし",
  steps: ["s", "す", "すし"],
});
```

Why:

- IME testing is not a keyboard helper
- it is its own domain

This layer should hide:

- CDP session setup
- `Input.imeSetComposition`
- browser-specific ceremony

Current public surface:

- `editor.ime.enableKeyEvents()`
- `editor.ime.compose(...)`

## 5. Clipboard Module

```ts
await editor.clipboard.copy();
const payload = await editor.clipboard.copyPayload();
await editor.clipboard.pasteText("hello");
await editor.clipboard.pasteHtml("<p>hello</p>");
```

Why:

- clipboard is another editor-native primitive
- browser clipboard APIs should not leak everywhere

Current public position:

- `copy()` and `copyPayload()` are in
- `pasteText()` and `pasteHtml()` are in through real clipboard write plus real
  paste gesture
- fixture-scale clipboard DOM assertions still belong to the pure/browser lane,
  not the Playwright harness

Current public surface:

- `editor.clipboard.copy()`
- `editor.clipboard.copyPayload()`
- `editor.clipboard.pasteText(text)`
- `editor.clipboard.pasteHtml(html, plainText?)`
- `editor.clipboard.assert.textContains(text)`
- `editor.clipboard.assert.htmlContains(fragment)`
- `editor.clipboard.assert.htmlEquals(html)`
- `editor.clipboard.assert.types(types)`

Clipboard actions are serialized with exclusive clipboard access inside the
Playwright harness, so parallel tests do not casually stomp each other.

## 6. Placeholder / Zero-Width Module

```ts
import { inspectZeroWidthPlaceholder } from "slate-browser/browser";

await editor.assert.placeholderShape({
  kind: "line-break",
  hasBr: true,
  hasFEFF: true,
});
```

Why:

- zero-width and placeholder policy is subtle enough to deserve explicit helpers

Current package split:

- `slate-browser`
- `slate-browser/core`
- `slate-browser/browser`
- `slate-browser/playwright`

## 7. Future Extension Seam

```ts
const extended = editor.withExtension(agentDriver);
```

Why:

- agent-native support should layer on top of the same editor-native primitives
- the core API should not force agent concerns into every test today

If/when added later, this extension seam should wrap:

- focus
- selection
- clipboard
- IME
- assertion artifacts

It should not replace them.

## Runner Mapping

The API should stay stable while the backend changes by lane.

## Bun-backed

- pure helpers
- core assertions
- benchmark scripting

## Vitest browser-backed

- DOM contract harnesses
- small browser-backed assertions

## Playwright-backed

- example integration
- IME
- clipboard
- selection gestures

## Future agent-backed

- multi-step adaptive browser action flows

## Proposed File/Module Layout

```text
slate-browser/
  index.ts
  core/
    index.ts
    selection.ts
  browser/
    index.ts
    selection.ts
    zero-width.ts
  playwright/
    index.ts
    ime.ts
```

## DX Rules

1. **No raw selectors in most tests**
2. **No ad hoc selection assertions**
3. **No hand-written CDP boilerplate in test files**
4. **No test helpers named after browsers when the intent is editor behavior**
5. **No future extension should bypass the core editor-native assertions**

Bad:

```ts
await page.locator("div[contenteditable=true]").click();
await page.keyboard.type("hello");
```

Better:

```ts
await editor.focus();
await editor.type("hello");
```

## What Not To Abstract Yet

Do not build:

- one mega `EditorDriver` that tries to hide every lane
- workflow APIs that bury assertions inside helpers
- fake cross-browser IME abstraction before the first Chromium lane exists

## Routing Decision

The package does **not** expose `openFixture(...)` yet.

That distinction was attractive in theory and fake in practice.

Current public rule:

- `openExample(...)` is the only routing entrypoint
- fixture-scale DOM contracts live in the pure/browser helpers and Vitest lane
- a public fixture harness can come later only if it has a real backing surface

## Deferred

These are intentionally **not** part of the current public API:

- `openFixture(...)`
- `editor.driver()`

If any of these come back later, they need a real backing seam first.

## Build Contract

Repo-local Playwright tests import `slate-browser/playwright` through the public
package exports.

That means the package must be built before those tests run.

Current repo contract:

- `yarn build:slate-browser:playwright`
- then `yarn test:slate-browser:e2e`
- `yarn test:slate-browser:ime`
- `yarn test:slate-browser:anchors`

The root commands already do this.

Repo-local browser tests import the built public package entrypoints directly.
That is intentional. The package shape is the contract now.

## API Naming Rules

1. Prefer editor nouns over browser verbs.
2. Prefer assertions that describe outcomes, not mechanics.
3. Keep helper names lane-neutral where possible.
4. Put browser-specific details in options, not in every function name.

Bad:

- `playwrightFocusEditor`
- `browserAssertRange`
- `cdpImeInsertText`

Better:

- `focusEditor`
- `assertSelection`
- `editor.ime.compose`

## Locked First-Tranche Surface

1. `openExample(name)`
2. `editor.focus()`
3. `editor.assert.selection(...)`
4. `editor.assert.text(...)`
5. `editor.ime.compose(...)`
6. `editor.get.selection()`
7. `editor.selection.selectAll()`
8. `editor.clipboard.copyPayload()`
9. `editor.clipboard.pasteText(...)`
10. `editor.clipboard.pasteHtml(...)`
11. `editor.assert.placeholderShape(...)`
12. `editor.withExtension(extension)`

## Bottom Line

The best API is not “Playwright but renamed.”

It is:

- Slate-shaped nouns
- selection-first assertions
- IME as a real module
- no fake fixture lane
- real clipboard write plus real paste gesture for public paste helpers
- an extension seam that can accept agent-native later without contaminating the
  core API now
