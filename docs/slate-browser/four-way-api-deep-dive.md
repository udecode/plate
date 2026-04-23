---
date: 2026-04-04
topic: slate-browser-four-way-api-deep-dive
---

# Slate Browser Four-Way API Deep Dive

> Specialist testing/proof doc. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Purpose

This is the focused follow-up on exactly four candidates:

- `Lexical`
- `ProseMirror`
- `Tiptap`
- `edix`

The question is not “which editor is best?”

It is:

- which of these repos still has meaningful API ideas left for
  `slate-browser`
- which ideas should be adopted now
- which should be deferred
- which should be rejected

## Bottom Line First

If the goal is the absolute best Slate-flavoured testing framework:

- `Lexical` is still the strongest helper-API source
- `ProseMirror` is the strongest seam/invariant source
- `edix` still has a few high-value semantic getter ideas
- `Tiptap` is mostly a DX and productization validator, not a helper-API mine

That means:

- dig deeper into `Lexical` and `ProseMirror`
- keep `edix` targeted
- stop expecting `Tiptap` to hand us the core next API tranche

## Lexical

## What It Still Teaches

Files:

- [index.mjs](/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/utils/index.mjs)
- [Selection.spec.mjs](/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs)
- [Placeholder.spec.mjs](/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/e2e/Placeholder.spec.mjs)
- [HTMLCopyAndPaste.spec.mjs](/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs)
- [Composition.spec.mjs](/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs)

Still-high-value imports:

1. one readiness/setup seam:
   `initialize(...)`
2. HTML assertions with normalization controls:
   `ignoreClasses`, `ignoreInlineStyles`, `ignoreDir`
3. tolerated selection assertions:
   offsets may be exact or ranges
4. clipboard serialization discipline:
   `withExclusiveClipboardAccess(...)`
5. helper split between:
   - setup
   - generic DOM actions
   - semantic assertions
6. human-readable expected selection builder:
   `createHumanReadableSelection(...)`

## Adopt Now

- `ready` contract
- tolerant selection assertions
- HTML normalization options

## Adopt Later

- human-readable expected selection helper

Why later:

- this is excellent test-authoring sugar
- but it is not as important as semantic setup and state APIs

Candidate shape:

```ts
const expected = selection({
  anchor: {
    path: [
      [1, "table row"],
      [0, "first cell"],
    ],
    offset: [0, "start of cell"],
  },
  focus: {
    path: [
      [2, "last paragraph"],
      [0, "first span"],
      [0, "text node"],
    ],
    offset: [9, "full text length"],
  },
});
```

This should be a docs/test-authoring helper first, not the first new public
runtime API.

## Reject

- Lexical’s full `initialize(...)` breadth
- synthetic public paste path
- generic selector/action helpers as the main surface

## Take

`Lexical` is still where the next tranche gets its spine.

## ProseMirror

## What It Still Teaches

Files:

- [selection.ts](/Users/zbeyens/git/prosemirror/state/src/selection.ts)
- [clipboard.ts](/Users/zbeyens/git/prosemirror/view/src/clipboard.ts)
- [test-selection.ts](/Users/zbeyens/git/prosemirror/state/test/test-selection.ts)
- [webtest-selection.ts](/Users/zbeyens/git/prosemirror/view/test/webtest-selection.ts)

Still-high-value imports:

1. selection is a real subsystem, not just anchor/focus data
2. selection bookmarks are first-class:
   `getBookmark()`
3. clipboard is explicitly:
   - serialize for clipboard
   - parse from clipboard
   - browser/view owned
4. browser coordinate invariants are tested as invariants, not vibes:
   `coordsAtPos`, `posAtCoords`

## Adopt Now

- nothing as a direct public helper API ahead of the Lexical/edix tranche

That is not a knock.
It means ProseMirror is feeding invariants and later APIs, not next-week sugar.

## Adopt Later

### 1. Selection Bookmark API

This is the most interesting new idea from the deeper pass.

Candidate shape:

```ts
const bookmark = await editor.selection.bookmark();

// later in the same test
await editor.assert.selection(bookmark);
```

Or:

```ts
const bookmark = await editor.selection.capture();
```

What it should mean:

- persistent semantic reference to a selection-like position
- good for:
  - history tests
  - annotation anchor tests
  - range-ref tests
  - selection survival across transforms

Why later:

- this must be backed by a real Slate-side bookmark/range-ref seam
- faking it in Playwright would be garbage

### 2. Coordinate Assertions

Candidate shape:

```ts
const caret = await editor.selection.coords();
await editor.assert.selectionCoords({ top: [100, 104] });
```

Why later:

- ProseMirror proves these invariants matter
- but `selection.rect()` already covers the first cheap version

## Reject

- copying ProseMirror’s raw test helper style as public DX
- exposing browser/view parser/serializer internals directly through the
  Playwright harness

## Take

`ProseMirror` is not giving the nicest API.
It is giving the best invariants and one serious later API:
selection bookmarks.

## Tiptap

## What It Still Teaches

Files:

- [dispatchTransaction.spec.ts](/Users/zbeyens/git/tiptap/packages/core/__tests__/dispatchTransaction.spec.ts)
- [placeholder.spec.ts](/Users/zbeyens/git/tiptap/packages/extensions/__tests__/placeholder.spec.ts)
- [Editor.ts](/Users/zbeyens/git/tiptap/packages/core/src/Editor.ts)
- [NodeRangeSelection.ts](/Users/zbeyens/git/tiptap/packages/extension-node-range/src/helpers/NodeRangeSelection.ts)

Still-high-value imports:

1. focused option-level tests are good
2. dispatch/middleware priority should be explicit if a hook pipeline ever grows
3. specialized selection types can exist when the problem earns them

## Adopt Now

- nothing ahead of Lexical/edix

## Adopt Later

### 1. Option-Focused Assertions

Small candidate:

```ts
await editor.assert.placeholder({
  visible: true,
  text: "Type something",
});
```

Why later:

- it is nice
- but lower value than `ready`, `selection.select`, `blockTexts`, and
  `snapshot()`

### 2. Explicit Hook Ordering Rules

If `withExtension(...)` ever grows into a real hook surface, Tiptap’s
`dispatchTransaction` tests are the warning:

- ordering must be explicit
- blocking behavior must be explicit
- “forgot to call next” should not be mysterious

This is future design pressure, not a next API.

### 3. Specialized Selection Types

`NodeRangeSelection` is interesting, but not a `slate-browser` API yet.

It only becomes interesting if Slate itself grows a real block/node-range
selection seam worth proving through the browser harness.

## Reject

- Tiptap as the main source of next helper APIs
- wrapping public APIs around ProseMirror internals just because Tiptap does
  product packaging well

## Take

`Tiptap` is good for:

- product feeling
- focused extension tests
- future hook-ordering discipline

It is not where the next core `slate-browser` API tranche comes from.

## edix

## What It Still Teaches

Files:

- [edix.ts](/Users/zbeyens/git/edix/e2e/edix.ts)
- [utils.ts](/Users/zbeyens/git/edix/e2e/utils.ts)
- [common.spec.ts](/Users/zbeyens/git/edix/e2e/common.spec.ts)
- [structured.spec.ts](/Users/zbeyens/git/edix/e2e/structured.spec.ts)
- [dom/index.ts](/Users/zbeyens/git/edix/src/dom/index.ts)
- [copy/internal.ts](/Users/zbeyens/git/edix/src/extensions/copy/internal.ts)
- [paste/internal.ts](/Users/zbeyens/git/edix/src/extensions/paste/internal.ts)

Still-high-value imports:

1. semantic getters:
   - `getText`
   - `getSelection`
   - `getSelectedRect`
   - `getSeletedText`
2. explicit internal clipboard boundary
3. direct structured tests for non-editable/void-ish nodes

## Adopt Now

- `blockTexts`
- maybe `selectedText`

## Adopt Later

### 1. Structured Non-Editable Assertions

Candidate shape:

```ts
await editor.assert.caretAroundVoid({
  path: [0],
  beforeOffset: 3,
  afterOffset: 4,
});
```

Why later:

- useful for inline-void and non-editable edge cases
- but too niche for the first tranche

### 2. Internal Clipboard Payload Helpers

Good for pure/browser lanes.
Not good as a first-class Playwright public API.

## Reject

- spending another broad round on edix hoping for a whole new tranche

We already got the main value:

- semantic getters
- clean browser contract lane

Returns are diminishing now.

## Cross-Repo Final Read

## Adopt Now

1. `ready` contract
   - Lexical
2. `editor.selection.select(...)`
   - current Slate pain, ProseMirror-grade semantics pressure
3. `editor.get.blockTexts()` / `assert.blockTexts(...)`
   - edix
4. `editor.snapshot()`
   - use-editable style state capture

## Adopt After Tranche 1

1. tolerant selection assertions
   - Lexical
2. HTML normalization options
   - Lexical
3. maybe `editor.get.selectedText()`
   - edix
4. maybe human-readable expected selection builder
   - Lexical

## Later Only

1. selection bookmark / capture API
   - ProseMirror
2. alternate-surface scoping
   - current Slate iframe/shadow DOM pressure
3. path-oriented locators
   - current Slate suite pressure
4. coordinate assertions beyond `rect()`
   - ProseMirror
5. option-focused placeholder assertions
   - Tiptap

## Reject

1. `openFixture(...)`
2. `editor.driver()`
3. synthetic public paste helpers
4. one mega generic driver abstraction
5. expecting Tiptap to define the next helper tranche
6. doing another broad edix sweep instead of implementing the obvious wins

## Final Take

After the deeper four-way pass:

- `Lexical` still wins the next-helper question
- `ProseMirror` contributes one serious later API:
  selection bookmarks
- `Tiptap` is mostly a packaging and focused-test validator
- `edix` still matters, but mainly for semantic getters

So yes, digging deeper was worth it.

But it did not overthrow the ranking.

It made it sharper.
