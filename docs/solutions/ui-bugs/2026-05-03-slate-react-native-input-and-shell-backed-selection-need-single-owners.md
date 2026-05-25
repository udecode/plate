---
title: Slate React native input and shell-backed selection need single owners
date: 2026-05-03
category: docs/solutions/ui-bugs
module: slate-v2 slate-react browser editing
problem_type: ui_bug
component: tooling
symptoms:
  - DOM-present rendering-strategy typing inserted the same character twice after a browser click selection
  - Shell-backed select-all collapsed back to the first text node before copy or paste
  - Rendering-strategy browser rows failed while ordinary examples looked mostly healthy
root_cause: async_timing
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, native-input, selectionchange, shell-backed, rendering-strategy]
---

# Slate React native input and shell-backed selection need single owners

## Problem

The rendering-strategy runtime had two authority leaks: the native DOM `input`
listener and React `onInput` could both repair the same browser text insertion,
and a later `selectionchange` could import an empty browser selection over a
model-backed shell select-all.

## Symptoms

- `rendering-strategy-runtime` expected one typed `a`, but the model became
  `aa` after clicking at the end of DOM-present text and typing.
- Shell-backed `ControlOrMeta+A` set the root attribute to `shell-backed`, but
  the model selection collapsed to `[0, 0]` before paste/copy logic ran.
- Full example coverage showed mentions, images, iframe, tables, and rich text
  were broadly healthy after focused fixes, but shell-backed copy/paste rows
  still failed.

## What Didn't Work

- Looking only at final text hid the ownership bug. The useful proof was the
  kernel trace: one native `input` produced two `insert_text` operations.
- Treating shell-backed selection as only a visual state was not enough. The
  selection controller still saw a normal `selectionchange` and imported the
  browser's collapsed selection.
- Broadly ignoring `selectionchange` would be too blunt; toolbar, paste, and
  browser-drag rows need real DOM selection import.

## Solution

Mark DOM `input` events handled by the direct native listener and let React
`onInput` skip only its text-repair fallback for that same event:

```ts
const handledDOMInputEventsRef = useRef<WeakSet<Event>>(new WeakSet())

const markHandledDOMInput = useCallback((event: Event) => {
  handledDOMInputEventsRef.current.add(event)
}, [])

const skipNativeTextInputRepair = handledDOMInputEventsRef.current.has(
  event.nativeEvent
)
```

Then keep the rest of React `onInput` behavior intact: app `onInput`, deferred
operations, and history events still run. Only the duplicate native text repair
is skipped.

For shell-backed select-all, move selection ownership to the model explicitly:

```ts
setEditableModelSelectionPreference({
  inputController,
  preferModelSelection: true,
  selectionSource: 'shell-backed',
})
```

Finally, teach `selectionchange` import to respect that owner:

```ts
if (
  state.selectionSource === 'shell-backed' &&
  isEditableModelSelectionPreferred(inputController)
) {
  return
}
```

## Why This Works

The native DOM listener is the low-level owner for browser text repair once it
has accepted an `input` event. React still observes the event, but it must not
replay the same insertion into the model.

Shell-backed select-all is not a DOM selection waiting to be imported. It is a
model-backed selection over content that may not have complete mounted DOM.
Letting a follow-up browser `selectionchange` overwrite it with a collapsed
range destroys copy/paste before clipboard code can apply the shell policy.

The fix keeps the ownership split narrow:

- real native text insert is repaired once
- app `onInput` still runs
- shell-backed select-all remains model-owned
- ordinary DOM selection import remains available after user mouse/keyboard
  selection changes

## Prevention

- When both native DOM listeners and React synthetic handlers observe the same
  browser event, tag the event object and make exactly one path mutate model
  text.
- Shell-backed or model-backed selections must set both the visible state and
  `selectionSource`; a visual flag alone is not authority.
- Keep browser proof rows that assert operations, model selection, clipboard
  payload, and follow-up input. Model text alone is a weak proof.
- Rebuild `slate-react` and `slate-browser` before Playwright rows that import
  built packages from `dist`.
- Run full examples after focused green rows when changing selection/input
  ownership. The regression surface crosses voids, mentions, paste, tables,
  Shadow DOM, and rendering strategies.

## Related Issues

- [Slate React repair-induced selectionchange must stay model-owned](./2026-04-25-slate-react-repair-induced-selectionchange-must-stay-model-owned.md)
- [Slate React keydown must import DOM selection before model-owned navigation](./2026-04-22-slate-react-keydown-must-import-dom-selection-before-model-owned-navigation.md)
- [Slate React model-owned insert must repair the DOM caret](../logic-errors/2026-04-22-slate-react-model-owned-insert-must-repair-dom-caret.md)
- [Slate DOM-incomplete work should start with internal coverage boundaries](../developer-experience/2026-05-02-slate-dom-incomplete-work-should-start-with-internal-coverage-boundaries.md)
