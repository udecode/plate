---
date: 2026-04-04
topic: slate-browser-next-api-candidates-matrix
---

# Slate Browser Next API Candidates Matrix

> Specialist testing/proof doc. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).
>
> Proposed API research only. This file does not define the current shipped `slate-browser` surface.

## Purpose

This is the deeper follow-up to
[next-api-candidates.md](/Users/zbeyens/git/plate-2/docs/slate-browser/next-api-candidates.md).

It answers:

- which candidate APIs are actually worth shipping
- which current Slate test pain each API would remove
- which repo proved the idea
- which ideas should stay out

## Current Test Pain

Across Slate’s current Playwright example suite in
[/Users/zbeyens/git/slate-v2/playwright/integration/examples](/Users/zbeyens/git/slate-v2/playwright/integration/examples):

- raw `page.goto(...)`: `23`
- raw `getByRole('textbox')`: `41`
- raw `selectText()`: `7`
- raw DOM selection surgery:
  `document.createRange` / `window.getSelection()` / `addRange(...)`: `5`
- raw `boundingBox()` assertions: `2`

This matters because the best next APIs should erase repeated high-noise setup,
not just add another cute helper name.

## Evaluation Rules

Ship an API only if it:

1. removes real repeated pain from the current suite
2. makes tests more Slate-shaped
3. stays honest about browser truth
4. does not smuggle in a fake backend abstraction

## Deep Matrix

## 1. `ready` Contract

Status:

- `ship now`

Candidate:

```ts
const editor = await openExample(page, "custom-placeholder", {
  ready: {
    editor: "visible",
    text: /Hello/,
    placeholder: "visible",
    selection: "settled",
    selector: "#document-outline",
  },
});
```

Primary evidence:

- Lexical `initialize(...)`:
  [index.mjs](/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/utils/index.mjs)

Current pain it removes:

- ad hoc `page.goto(...)`
- one-off waits for placeholder, text, or extra selectors
- hidden selection-settle timing

Why it is strong:

- highest-leverage setup seam
- directly supports the next zero-width / IME / empty-state gauntlet
- gives later cross-browser lanes a sane base

Risk:

- turning into a kitchen sink

Rule:

- keep it narrow and readiness-only

## 2. `editor.selection.select(...)`

Status:

- `ship now`

Candidate:

```ts
await editor.selection.select({
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 5 },
});
```

Companions:

```ts
await editor.selection.collapse({ path: [0, 0], offset: 0 });
await editor.selection.selectBlock([1]);
```

Primary evidence:

- current suite still uses raw DOM range surgery in
  [inlines.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/inlines.test.ts)
- edix snapshot-based selection setup/inspection:
  [edix.ts](/Users/zbeyens/git/edix/e2e/edix.ts)

Current pain it removes:

- direct DOM range manipulation
- fragile node-text-anchor assumptions

Why it is strong:

- today the harness can assert semantic selection but cannot create one
- that is backwards

Risk:

- path mapping bugs if implemented sloppily

Rule:

- semantic selection setup first
- gesture APIs later

## 3. `editor.get.blockTexts()` / `editor.assert.blockTexts(...)`

Status:

- `ship now`

Candidate:

```ts
expect(await editor.get.blockTexts()).toEqual(["alpha", "beta"]);
await editor.assert.blockTexts(["alpha", "beta"]);
```

Companions:

```ts
expect(await editor.get.selectedText()).toBe("alpha");
expect(await editor.get.textAt([1])).toBe("beta");
```

Primary evidence:

- edix `getText(...)` and `getSeletedText(...)`:
  [edix.ts](/Users/zbeyens/git/edix/e2e/edix.ts)

Current pain it removes:

- overreliance on raw HTML assertions
- lossy flat `get.text()`

Why it is strong:

- block text is much closer to Slate semantics than DOM strings
- also easy to read in failures

Risk:

- overreaching into full Slate JSON reconstruction

Rule:

- stop at block-text semantics
- do not add fake document deserialization here

## 4. `editor.snapshot()`

Status:

- `ship now`

Candidate:

```ts
const snapshot = await editor.snapshot();
```

Likely payload:

- text
- blockTexts
- selectedText
- selection
- domSelection
- placeholderShape

Primary evidence:

- `use-editable` `getState()`:
  [useEditable.ts](/Users/zbeyens/git/use-editable/src/useEditable.ts)

Current pain it removes:

- multi-call debugging boilerplate
- weak failure artifacts

Why it is strong:

- one-call truth dump is the best debugging upgrade per line of API

Risk:

- bloated snapshot shape

Rule:

- aggregate existing truths only
- do not hide extra behavior in snapshot generation

## 5. Tolerant Selection Assertions

Status:

- `ship after tranche 1`

Candidate:

```ts
await editor.assert.selection({
  anchor: { path: [0, 0], offset: [0, 1] },
  focus: { path: [0, 0], offset: [0, 1] },
});
```

Primary evidence:

- Lexical tolerated offset assertions:
  [index.mjs](/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/utils/index.mjs)

Current pain it removes:

- future cross-browser selection variance
- some zero-width / line-break normalization fuzz

Why it is not tranche 1:

- exact selection APIs matter more than tolerant ones right now

Rule:

- tolerant expectations must be explicit

## 6. HTML Normalization Options

Status:

- `ship after tranche 1`

Candidate:

```ts
await editor.assert.htmlEquals(expected, {
  ignoreClasses: true,
  ignoreInlineStyles: true,
  ignoreDir: true,
});
```

Primary evidence:

- Lexical `assertHTML(...)` options:
  [index.mjs](/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/utils/index.mjs)

Current pain it removes:

- brittle browser-sensitive HTML exactness

Why it is not tranche 1:

- better semantic getters beat better HTML massaging

## 7. `editor.get.selectedText()`

Status:

- `strong maybe`

Candidate:

```ts
expect(await editor.get.selectedText()).toBe("wise quote");
```

Primary evidence:

- edix `getSeletedText(...)`:
  [edix.ts](/Users/zbeyens/git/edix/e2e/edix.ts)

Current pain it removes:

- awkward text-selection assertions via HTML or DOM

Why it matters:

- especially useful for copy/selection seams

Why it is not higher:

- `blockTexts` and full `snapshot()` cover more surface first

## 8. Real Clipboard Read Helpers

Status:

- `strong maybe`

Candidate:

```ts
expect(await editor.clipboard.readText()).toContain("Hello");
expect(await editor.clipboard.readHtml()).toContain("<p");
```

Primary evidence:

- edix `readClipboard(...)`:
  [utils.ts](/Users/zbeyens/git/edix/e2e/utils.ts)

Current pain it removes:

- inability to prove the real post-copy clipboard state directly

Why it matters:

- this is the most honest copy-path proof after real paste helpers

Why it is not higher:

- permission and stability questions are still worse than the top tranche

## 9. Alternate-Surface Scoping

Status:

- `later`

Problem:

- the current harness assumes one simple editable root via `getByRole('textbox')`
- Slate’s suite already has iframe and shadow DOM examples

Candidate directions:

```ts
const editor = await openExample(page, "iframe", {
  surface: "iframe",
});
```

or:

```ts
const editor = await openExample(page, 'shadow-dom', {
  resolveRoot: page => ...,
})
```

Current evidence:

- [iframe.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/iframe.test.ts)
- [shadow-dom.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/shadow-dom.test.ts)

Why it matters:

- absolute-best framework eventually needs to handle non-trivial surfaces

Why it is later:

- this can leak Playwright-specific locator details fast
- the core editor semantics need to harden first

## 10. Path-Oriented Locators

Status:

- `later`

Candidate:

```ts
await editor.path([1]).click({ clickCount: 3 });
await editor.textNode([0, 0]).click();
```

Current pain it removes:

- raw locators plus `.nth(...)`
- block-selection setup by DOM position instead of Slate position

Primary evidence:

- current suite patterns in:
  [select.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/select.test.ts)

Why it matters:

- this is the most Slate-specific locator idea available

Why it is later:

- path mapping correctness comes first
- `selection.select(...)` buys more value first

## 11. Placeholder Content Assertions

Status:

- `low priority`

Candidate:

```ts
await editor.assert.placeholderText("Type something");
```

Current evidence:

- placeholder tests in
  [placeholder.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/placeholder.test.ts)
- Tiptap’s focused placeholder option tests:
  [placeholder.spec.ts](/Users/zbeyens/git/tiptap/packages/extensions/__tests__/placeholder.spec.ts)

Why it matters:

- nicer than raw locators for placeholder tests

Why it is low priority:

- current frequency is low
- `ready`, `selection.select`, and `blockTexts` buy much more

## Rejected

## `openFixture(...)`

Reject.

Why:

- no real fixture lane exists
- example-mounted truth is still the right seam

## `editor.driver()`

Reject.

Why:

- generic-driver escape hatch destroys the point of a Slate-shaped API

## Synthetic Public Paste Helpers

Reject.

Why:

- real browser clipboard write plus real paste gesture already exists

## One Mega Driver Abstraction

Reject.

Why:

- current backend is Playwright-first
- pretending otherwise now is abstraction cosplay

## Recommended Phasing

## Phase 1

Ship:

1. `ready` contract
2. `editor.selection.select(...)`
3. `editor.get.blockTexts()` / `assert.blockTexts(...)`
4. `editor.snapshot()`

## Phase 2

Ship:

1. tolerant selection assertions
2. HTML normalization options
3. maybe `editor.get.selectedText()`

## Phase 3

Evaluate:

1. real clipboard read helpers
2. alternate-surface scoping
3. path-oriented locators

## Bottom Line

After the deeper pass, the next tranche is still the same.

That is a good sign.

The absolute-best next APIs are:

- readiness
- semantic selection setup
- semantic block-text state
- one-call snapshots

Everything else is either follow-on work or bait.
