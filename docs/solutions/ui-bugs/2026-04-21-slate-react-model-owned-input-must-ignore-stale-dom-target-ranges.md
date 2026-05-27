---
title: Slate React model-owned input must ignore stale DOM target ranges
date: 2026-04-21
last_updated: 2026-05-23
category: docs/solutions/ui-bugs
module: slate-v2 slate-react
problem_type: ui_bug
component: tooling
symptoms:
  - Mac keyboard typing scattered characters across a richtext document after pressing Home
  - visible DOM text and Slate model text could diverge during browser input
  - code that used custom leaves or projections bypassed the plain text fast path unsafely
  - delayed native placeholder typing followed by Enter duplicated the last character into the new paragraph
root_cause: async_timing
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, beforeinput, selection, dom-selection, editable]
---

# Slate React model-owned input must ignore stale DOM target ranges

## Problem

When `slate-react` owns a text insertion or keyboard navigation event, stale
browser target ranges and delayed `selectionchange` events can overwrite the
correct Slate selection. That makes later keystrokes land in old DOM positions
even though the first model write was correct.

## Symptoms

- `/examples/richtext` showed `Undo Me` scattered across unrelated text after
  `page.keyboard.type('Undo Me')` under a Mac Chrome user agent.
- `page.keyboard.insertText('Undo Me')` passed because it inserted the whole
  string in one event, hiding the stale-caret follow-up bug.
- The DOM could visibly include inserted text while the browser handle model
  text did not, proving DOM-only assertions were fake green.
- `/examples/custom-placeholder` could type `a`, then `b`, then `Enter` and
  produce model blocks `["ab", "b"]` instead of `["ab", ""]`.

## What Didn't Work

- Rebuilding and rerunning Playwright without inspecting model text only proved
  the visible DOM path.
- Fixing history undo did not fix the real owner; the red row failed before
  undo because typing itself was already mispositioned.
- Letting legacy `beforeinput` target-range repair run on every plain
  `insertText` event stole the caret back from stale DOM selection.
- Preserving the model selection only while `selectionChangeOrigin` was still
  `repair-induced` or `programmatic-export` was too fragile. Delayed native
  typing can clear that transient flag before the next structural keydown.

## Solution

Treat plain text input as model-owned after Slate handles text insertion or
keyboard navigation. While that mode is active:

- skip stale DOM target-range correction for `insertText`
- ignore stale `selectionchange` writes back into Slate
- reset the mode on explicit mouse/click selection
- fail closed from native DOM text sync unless the text node declares the
  explicit `data-slate-dom-sync="true"` capability
- preserve model selection for structural keydown commands when the controller
  still marks the model selection as authoritative

Also keep the DOM bridge maps current for text nodes, not just element nodes,
so DOM-to-Slate resolution has a valid path when fallback repair is needed.

The keydown guard belongs on selection provenance, not only transient event
origin:

```ts
const hasAuthoritativeModelSelection = ({ inputController }) =>
  inputController.state.selectionSource === 'model-owned' &&
  (inputController.preferModelSelectionForInputRef.current ||
    hasProgrammaticSelectionOrigin(inputController.state.selectionChangeOrigin))
```

## Why This Works

The browser can report a target range from the old DOM caret after Slate has
already moved the model caret. If Slate then trusts that target range, the next
character is inserted at the old DOM position. Once Slate owns the input lane,
the model selection is the source of truth until the user explicitly selects
elsewhere.

Structural keys such as Enter used to force a DOM selection import even when
text repair had already made Slate's model selection authoritative. That
reopened a stale collapsed DOM caret at offset `1`, so splitting `ab` moved the
last character into the second block. Reading the controller's selection source
keeps real native selection import working while blocking stale repair fallout.

The capability gate keeps the fast DOM-owned plain text lane strict: custom
leaf/text/segment rendering, projections, placeholders, zero-width nodes, and
composition paths fall back to React/model-owned updates.

## Prevention

- For browser editing regressions, assert both visible DOM text and Slate model
  text through the browser handle.
- Test both `keyboard.insertText(...)` and `keyboard.type(...)`; the first can
  hide per-character caret drift.
- Rebuild `slate-react` before static Playwright rows, because examples consume
  built package output.
- Keep model-owned selection and DOM-owned selection as explicit modes. Do not
  let compatibility target-range repair run after Slate has intentionally
  handled the user input.
- Add delayed per-character browser rows before structural commands, not only
  immediate `type('ab')` rows. The timeout exposes selection origin cleanup.
- Assert block text after Enter on placeholder/custom-renderer examples so
  duplicated split text cannot hide behind correct pre-Enter model text.

## Related Issues

- [Slate React history hotkeys must repair DOM after model undo](./2026-04-21-slate-react-history-hotkeys-must-repair-dom-after-model-undo.md)
- [Slate React keydown must import DOM selection before model-owned navigation](./2026-04-22-slate-react-keydown-must-import-dom-selection-before-model-owned-navigation.md)
- [Slate React repair-induced selectionchange must stay model-owned](./2026-04-25-slate-react-repair-induced-selectionchange-must-stay-model-owned.md)
- [Projected segment focus should not clobber DOM caret](../logic-errors/2026-04-15-projected-segment-focus-should-not-clobber-dom-caret.md)
- [Slate React focus restore must fail closed on transient DOM point gaps](../logic-errors/2026-04-09-slate-react-focus-restore-must-fail-closed-on-transient-dom-point-gaps.md)
