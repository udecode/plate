---
date: 2026-04-04
topic: slate-browser-api-reference-deep-research
---

# Slate Browser API Reference Deep Research

> Specialist testing/proof doc. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).
>
> Proposed API research only. This file does not define the current shipped `slate-browser` surface.

## Purpose

This doc compares `slate-browser` against the local reference repos in
[editor-architecture-candidates.md](/Users/zbeyens/git/plate-2/docs/analysis/editor-architecture-candidates.md),
with the specific goal of improving the public testing API.

This is not a stack-ranking doc.

It is a focused API and test-lane design read:

- what helper shapes are better than ours
- what lane structures are better than ours
- what should stay out of the package

## Current Slate Browser Read

Current public `slate-browser` shape in `../slate-v2`:

- `slate-browser/core`
- `slate-browser/browser`
- `slate-browser/playwright`

Strengths:

- editor-first Playwright harness
- semantic selection normalization for zero-width markers
- real clipboard write plus real paste gesture
- explicit package split between pure, browser, and Playwright surfaces

Weak spots:

- Playwright harness still leans too hard on assertions and not enough on
  state-getting APIs
- HTML assertions are still one-shape-fits-all
- clipboard tests do not yet guard against cross-test clipboard contention
- `openExample(...)` is still too thin compared with the best reference setups

## Repo Findings

## Lexical

Files read:

- [/Users/zbeyens/git/lexical/packages/lexical-playground/**tests**/e2e/Composition.spec.mjs](/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs)
- [/Users/zbeyens/git/lexical/packages/lexical-playground/**tests**/utils/index.mjs](/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/utils/index.mjs)

Best steals:

1. `initialize(...)`
   - one place for page setup, collab mode, viewport, and readiness
2. `assertHTML(...)`
   - exact normalized HTML checks, not just fragment contains checks
3. `assertSelection(...)`
   - exact semantic selection assertions
   - optional offset ranges when browser variance is expected
4. `withExclusiveClipboardAccess(...)`
   - lockfile-based clipboard serialization for parallel browser tests

Important take:

- Lexical is the strongest source for browser-test API discipline
- the biggest improvement for `slate-browser` is **not** more helpers
- it is better setup orchestration, stricter HTML assertions, and clipboard
  isolation

## edix

Files read:

- [/Users/zbeyens/git/edix/vitest.config.ts](/Users/zbeyens/git/edix/vitest.config.ts)
- [/Users/zbeyens/git/edix/e2e/common.spec.ts](/Users/zbeyens/git/edix/e2e/common.spec.ts)
- [/Users/zbeyens/git/edix/e2e/utils.ts](/Users/zbeyens/git/edix/e2e/utils.ts)
- [/Users/zbeyens/git/edix/e2e/edix.ts](/Users/zbeyens/git/edix/e2e/edix.ts)

Best steals:

1. getter-style helpers:
   - `getEditable`
   - `getText`
   - `getSelection`
   - `getSelectedRect`
2. explicit structural expectations:
   - tests compare semantic text arrays and semantic selection snapshots
3. lane split:
   - fast unit lane
   - browser lane
   - e2e lane

Important take:

- `slate-browser` should grow a `get` namespace
- assertions alone are not enough
- edix is better than us at exposing editor state directly and compactly

## rich-textarea

Files read:

- [/Users/zbeyens/git/rich-textarea/src/selection.ts](/Users/zbeyens/git/rich-textarea/src/selection.ts)
- [/Users/zbeyens/git/rich-textarea/e2e/textarea.spec.ts](/Users/zbeyens/git/rich-textarea/e2e/textarea.spec.ts)

Best steals:

1. composition-aware selection compensation
2. simple getter helpers for:
   - value
   - selection
   - size
   - scroll position

Important take:

- if `slate-browser` ever expands into native text surfaces or deeper IME
  compensation, this is the right inspiration
- for current Slate contenteditable work, the main useful lift is:
  **getter APIs beat assertion-only APIs**

## Tiptap

Files read:

- [/Users/zbeyens/git/tiptap/packages/extensions/**tests**/placeholder.spec.ts](/Users/zbeyens/git/tiptap/packages/extensions/__tests__/placeholder.spec.ts)

Best steals:

1. focused option-level DOM assertions for placeholder behavior
2. small, direct extension tests instead of broad scenario sludge

Important take:

- this supports keeping `slate-browser/browser` crisp and narrow
- placeholder and zero-width helpers should stay explicit and configuration-led

## Premirror

Files read:

- [/Users/zbeyens/git/premirror/docs/testing-strategy.md](/Users/zbeyens/git/premirror/docs/testing-strategy.md)

Best steals:

1. clear lane taxonomy
2. semantic assertions over snapshots
3. measured performance targets instead of vibes

Important take:

- `slate-browser` should eventually have an explicit accuracy/perf lane
- but that belongs after API cleanup, not before

## Pretext

Files read:

- [/Users/zbeyens/git/pretext/package.json](/Users/zbeyens/git/pretext/package.json)

Best steals:

1. explicit script families:
   - `accuracy-check`
   - `benchmark-check`
   - corpus sweeps

Important take:

- if `slate-browser` gets a perf/accuracy lane later, Pretext is the best
  naming and command inspiration

## Slate

Files read:

- [/Users/zbeyens/git/slate-v2/package.json](/Users/zbeyens/git/slate-v2/package.json)
- the existing Playwright example suite in `playwright/integration/examples`

Best steals:

1. example-driven test surfaces
2. mounted examples as the user-facing truth

Important take:

- keep `openExample(...)` central
- do not replace the example harness with abstract fixtures too early

## use-editable

Files read:

- [/Users/zbeyens/git/use-editable/package.json](/Users/zbeyens/git/use-editable/package.json)
- [/Users/zbeyens/git/use-editable/README.md](/Users/zbeyens/git/use-editable/README.md)
- [/Users/zbeyens/git/use-editable/src/useEditable.ts](/Users/zbeyens/git/use-editable/src/useEditable.ts)

Best steals:

1. small imperative editing handle:
   - `update`
   - `insert`
   - `move`
   - `getState`
2. narrow paste behavior:
   - plain-text paste only

Important take:

- `slate-browser` could use a small imperative getter surface inspired by
  `getState`
- also a reminder: a public API is better when it does **less**, clearly

## markdown-editor

Files read:

- [/Users/zbeyens/git/markdown-editor/package.json](/Users/zbeyens/git/markdown-editor/package.json)

Take:

- little direct testing API signal here
- mostly useful as a reminder that markdown-first packages can stay small and
  controllable

## urql, TanStack DB, VS Code

Files read:

- [/Users/zbeyens/git/urql/package.json](/Users/zbeyens/git/urql/package.json)
- [/Users/zbeyens/git/db/package.json](/Users/zbeyens/git/db/package.json)
- [/Users/zbeyens/git/vscode/package.json](/Users/zbeyens/git/vscode/package.json)

Best steals:

1. explicit command families and lane naming
2. separate fast/default/test-all mental model
3. avoid one all-purpose test command pretending to cover everything well

Important take:

- `slate-browser` command naming is already moving the right way
- later it should likely gain:
  - `test:slate-browser:cross`
  - `test:slate-browser:perf`
  - maybe `test:slate-browser:accuracy`

## ProseMirror

Files read:

- [/Users/zbeyens/git/prosemirror/package.json](/Users/zbeyens/git/prosemirror/package.json)

Take:

- almost no API-shape help for this problem
- still useful as a discipline reference, not a testing DX reference

## What Slate Browser Should Improve Next

## 1. Add a getter namespace

Current gap:

- `slate-browser` is too assertion-heavy

Best next API:

```ts
await editor.get.text();
await editor.get.html();
await editor.get.selection();
await editor.get.domSelection();
```

Why:

- edix and rich-textarea both show this is the clean missing layer
- getters make advanced tests and debugging much easier

## 2. Split HTML assertions into exact vs contains

Current gap:

- `editor.assert.html(...)` is too ambiguous

Best next API:

```ts
await editor.assert.htmlContains("<code>");
await editor.assert.htmlEquals(expectedHtml);
```

Why:

- Lexical’s `assertHTML(...)` is stricter and better than our current
  “contains” default

## 3. Add clipboard assertion helpers

Current gap:

- clipboard has actions and one payload getter
- not enough assertion ergonomics

Best next API:

```ts
await editor.clipboard.assert.text("hello");
await editor.clipboard.assert.htmlContains("<p>");
await editor.clipboard.assert.types(["text/plain", "text/html"]);
```

## 4. Add clipboard isolation

Current gap:

- clipboard tests can still step on each other under parallel execution

Best next API/utility:

- Lexical-style `withExclusiveClipboardAccess(...)`

This is likely the single highest-value improvement from the research pass.

## 5. Make `openExample(...)` a little smarter

Current gap:

- `goto + immediate harness` is a bit thin

Best next shape:

```ts
const editor = await openExample(page, "placeholder", {
  waitForPlaceholder: true,
});
```

Not a giant initializer blob.
Just enough to guarantee readiness intentionally.

## 6. Add selection namespace

Current gap:

- `editor.selectAll()` is useful but lonely

Best next shape:

```ts
await editor.selection.selectAll();
await editor.selection.get();
await editor.selection.rect();
```

## What Slate Browser Should Not Copy

1. No giant `initialize(...)` kitchen sink.
   Lexical’s setup is powerful, but too broad to copy directly.

2. No fake fixture lane.
   Still not worth it.

3. No synthetic paste fallback as the public API.
   We now have a real browser path.

4. No cross-browser IME abstraction theater yet.
   Chromium-first is still the honest move.

## Bottom Line

After the deeper pass, the strongest improvements are:

1. clipboard isolation
2. getter namespace
3. exact-vs-contains HTML assertions
4. smarter `openExample(...)` readiness
5. richer selection namespace

The best parts of the reference field are:

- Lexical for browser-test rigor
- edix for semantic getters
- rich-textarea for composition-aware selection modeling
- Premirror/Pretext/VS Code for lane governance

Everything else is secondary.
