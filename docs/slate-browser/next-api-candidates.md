---
date: 2026-04-04
topic: slate-browser-next-api-candidates
---

# Slate Browser Next API Candidates

> Specialist testing/proof doc. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).
>
> Proposed API research only. This file does not define the current shipped `slate-browser` surface.

## Purpose

This doc answers one narrower question than the system docs:

- what are the next candidate APIs `slate-browser` should add if the goal is
  the absolute best Slate-flavoured testing framework?

This is not a “more helpers is better” doc.

It is a ranking.

## Strong Take

The next best APIs are the ones that:

1. make tests more Slate-shaped
2. remove repeated low-signal Playwright glue
3. improve truthfulness, not abstraction count
4. stay honest about the current backend being Playwright-first

That means the next tranche should bias toward:

- readiness
- selection setup
- semantic text shape
- snapshot ergonomics

Not toward:

- generic driver abstractions
- fake fixture routing
- giant kitchen-sink helper bags

## Current Surface

Current public Playwright API in
[/Users/zbeyens/git/slate-v2/packages/slate-browser/src/playwright/index.ts](/Users/zbeyens/git/slate-v2/packages/slate-browser/src/playwright/index.ts)
already covers:

- `openExample(...)`
- `editor.focus()`, `click()`, `type()`, `press()`
- `editor.get.text()`, `html()`, `selection()`, `domSelection()`,
  `placeholderShape()`
- `editor.selection.selectAll()`, `get()`, `dom()`, `rect()`
- `editor.assert.text(...)`, `htmlContains(...)`, `htmlEquals(...)`,
  `selection(...)`, `domSelection(...)`, `placeholderShape(...)`,
  `placeholderVisible(...)`
- `editor.clipboard.copy()`, `copyPayload()`, `pasteText(...)`,
  `pasteHtml(...)`
- `editor.ime.compose(...)`

That is a real first tranche.

The missing pieces are no longer “do we have a package at all?”

The missing pieces are the next semantic seams.

## Reference Read

## Lexical

Best API imports:

- one setup orchestration seam:
  `initialize(...)`
- stricter HTML assertions with normalization hooks:
  `assertHTML(...)`
- semantic selection assertions with tolerated offset ranges:
  `assertSelection(...)`
- clipboard serialization:
  `withExclusiveClipboardAccess(...)`

Files:

- [index.mjs](/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/utils/index.mjs)
- [Composition.spec.mjs](/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs)

## edix

Best API imports:

- compact semantic getters:
  `getText`
  `getSelection`
  `getSelectedRect`
- small browser contract lane

Files:

- [utils.ts](/Users/zbeyens/git/edix/e2e/utils.ts)
- [edix.ts](/Users/zbeyens/git/edix/e2e/edix.ts)
- [common.spec.ts](/Users/zbeyens/git/edix/e2e/common.spec.ts)

## rich-textarea

Best API imports:

- selection compensation during composition
- simple browser getters:
  value
  selection
  size
  scroll position

Files:

- [selection.ts](/Users/zbeyens/git/rich-textarea/src/selection.ts)
- [textarea.spec.ts](/Users/zbeyens/git/rich-textarea/e2e/textarea.spec.ts)

## use-editable

Best API import:

- one-call imperative state snapshot:
  `getState()`

File:

- [useEditable.ts](/Users/zbeyens/git/use-editable/src/useEditable.ts)

## Slate’s Current Example Suite

The existing example tests still show repeated pain:

- raw `page.goto(...)`
- repeated `getByRole('textbox')`
- raw DOM selection surgery for inline edge cases
- repeated select-all / typing / placeholder boilerplate

Files:

- [inlines.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/inlines.test.ts)
- [plaintext.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/plaintext.test.ts)
- [richtext.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/richtext.test.ts)

That pain is where the next APIs should pay off.

## Ranked Candidate APIs

## 1. `ready` Contract

This is the strongest next API.

Candidate shape:

```ts
const editor = await openExample(page, "custom-placeholder", {
  ready: {
    editor: "visible",
    placeholder: "visible",
    text: /Type something/,
    selection: "settled",
    selector: "#document-outline",
  },
});
```

Optional harness form:

```ts
await editor.ready({
  selection: {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  },
});
```

Why it wins:

- strongest lift from Lexical
- directly supports the next zero-width / IME / empty-state gauntlet
- removes ad hoc wait soup without becoming `initialize(...)` bloat

Strong rule:

- prefer one `ready` object over more top-level `waitForX` booleans

## 2. `editor.selection.select(...)`

This is the strongest Slate-flavoured candidate.

Candidate shape:

```ts
await editor.selection.select({
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 5 },
});
```

Convenience:

```ts
await editor.selection.collapse({ path: [0, 0], offset: 0 });
```

Why it wins:

- today the harness can assert a Slate selection but cannot set one
- current tests still fall back to raw DOM range surgery
- this is the most obvious missing “Slate noun” in the API

Strong rule:

- selection setup should be semantic first
- mouse gestures stay for interaction tests, not basic setup

## 3. `editor.get.blockTexts()` and `editor.assert.blockTexts(...)`

This is the best semantic getter missing today.

Candidate shape:

```ts
expect(await editor.get.blockTexts()).toEqual(["alpha", "beta"]);

await editor.assert.blockTexts(["alpha", "beta"]);
```

Optional narrow getter:

```ts
expect(await editor.get.textAt([1])).toBe("beta");
```

Why it wins:

- best steal from edix’s `getText(...)`
- flat `get.text()` is too lossy for many Slate tests
- block-level text is more Slate-shaped than raw HTML and more stable than DOM
  trivia

Strong rule:

- prefer block-text semantics before adding any fake DOM-to-Slate JSON parser

## 4. `editor.snapshot()`

This is the highest-value debugging API.

Candidate shape:

```ts
const snapshot = await editor.snapshot();

expect(snapshot).toEqual({
  text: "Hello",
  blockTexts: ["Hello"],
  selection: {
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 5 },
  },
  domSelection: {
    anchorNodeText: "Hello",
    anchorOffset: 5,
    focusNodeText: "Hello",
    focusOffset: 5,
  },
});
```

Why it wins:

- best lift from `use-editable`’s `getState()`
- one-call snapshots make failures easier to debug
- also good fuel for future agent-native artifact capture

Strong rule:

- snapshot should aggregate existing truths
- it should not invent new hidden state

## 5. Tolerant Selection Assertions

This is a precision upgrade, not a brand new domain.

Candidate shape:

```ts
await editor.assert.selection({
  anchor: { path: [0, 0], offset: [0, 1] },
  focus: { path: [0, 0], offset: [0, 1] },
});
```

And for DOM:

```ts
await editor.assert.domSelection({
  anchorOffset: [0, 1],
  focusOffset: [0, 1],
});
```

Why it wins:

- direct steal from Lexical
- gives us honest cross-browser tolerance later
- especially useful for line-break / placeholder / zero-width weirdness

Strong rule:

- tolerant expectations should be explicit
- do not silently weaken exact assertions

## 6. HTML Assertion Normalization Options

Current `htmlEquals(...)` is too literal for some browser-sensitive paths.

Candidate shape:

```ts
await editor.assert.htmlEquals(expectedHtml, {
  ignoreClasses: true,
  ignoreInlineStyles: true,
  ignoreDir: true,
});
```

Why it wins:

- direct Lexical lesson
- keeps HTML assertions useful without forcing brittle exactness everywhere

Strong rule:

- options belong on `htmlEquals`, not as a new pile of near-duplicate methods

## 7. Real Clipboard Read Helpers

Current surface has:

- real write for paste
- synthetic payload capture for copy contracts

The next candidate is:

```ts
await editor.clipboard.copy();
expect(await editor.clipboard.readText()).toContain("Hello");
expect(await editor.clipboard.readHtml()).toContain("<p");
```

Why it matters:

- edix already proves `navigator.clipboard.read()` is useful in browser tests
- this would let us prove the real clipboard path, not only the synthetic copy
  event path

Why it is not higher:

- browser permission and stability issues make it weaker than the top four

## 8. Path-Oriented Locators

This is the strongest later candidate.

Candidate shape:

```ts
const block = editor.path([1]);
await block.click({ clickCount: 3 });
```

Or:

```ts
const textNode = editor.textNode([0, 0]);
```

Why it matters:

- the suite still falls back to raw locators and DOM surgery for some
  selection-sensitive tests
- this is the most Slate-specific locator idea available

Why it is later:

- path-to-DOM mapping needs to be correct first
- `selection.select(...)` is higher value than locator sugar

## Best Immediate Tranche

If the goal is the best next API slice, do these first:

1. `ready` contract
2. `editor.selection.select(...)`
3. `editor.get.blockTexts()` / `assert.blockTexts(...)`
4. `editor.snapshot()`

That is the smallest tranche that materially changes the framework from
“helpful Playwright wrapper” to “real Slate-shaped test harness.”

## APIs To Reject

Do not add these next:

- `openFixture(...)`
- `editor.driver()`
- fake synthetic public paste helpers
- one mega `EditorDriver` abstraction
- cross-browser IME abstraction theater

## Bottom Line

The next candidate APIs are not random convenience sugar.

They are the missing Slate-shaped seams:

- readiness
- semantic selection setup
- block-text semantics
- one-call state snapshot

Everything else is secondary until those land.
