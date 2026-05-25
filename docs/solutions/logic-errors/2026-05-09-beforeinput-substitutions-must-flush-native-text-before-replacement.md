---
title: Beforeinput substitutions must flush native text before replacement
date: 2026-05-09
category: docs/solutions/logic-errors
module: Slate v2 React input runtime
problem_type: logic_error
component: frontend_react
symptoms:
  - Mac-style autocapitalization produced only the replacement character instead of preserving the following native character.
  - Double-space period replacement after emoji inserted after the space instead of replacing it.
  - Expanded beforeinput target ranges were ignored for insertText when model selection was preferred.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, beforeinput, target-ranges, autocorrect, input-runtime]
---

# Beforeinput substitutions must flush native text before replacement

## Problem

Browser text substitutions can send a native `insertText` beforeinput, mutate
the DOM, then send a model-owned replacement before the matching `input` event
imports the native text.

If Slate applies the replacement first, the native DOM text is lost or the
replacement lands at the wrong current selection.

## Symptoms

- Autocapitalization flow `i` + native `S` + replacement `I` rendered `I`
  instead of `IS`.
- Flushing native text without preserving the replacement target rendered `iSI`.
- Double-space period replacement after `🙂 ` rendered `🙂 . ` instead of
  `🙂. `.

## Solution

The runtime now treats native text beforeinput as pending model work until the
matching `input` event or the next model-owned beforeinput:

- `runtime-before-input-events.ts` queues native text repair when Slate allows
  native `insertText`.
- The next beforeinput flushes queued native repair before applying the
  model-owned replacement.
- `mutation-controller.ts` applies provided replacement target ranges directly
  instead of relying on the current selection.
- `selection-reconciler.ts` honors expanded `insertText` target ranges even
  when model selection is preferred.

## Why This Works

Mac autocorrect and punctuation substitution are ordered around browser-owned
DOM text. Slate must import the browser-owned text before applying the later
model-owned replacement, but the replacement still has to use the event's
target range rather than whatever selection the repair leaves behind.

Expanded `insertText` target ranges are replacement instructions. Collapsed
`insertText` ranges can still prefer the current model selection.

## Prevention

- Browser beforeinput substitution tests should dispatch `getTargetRanges()`
  and include both native DOM mutation and follow-up model-owned replacement.
- Unit tests should lock the two smaller owners: expanded `insertText` target
  range import, and replacement text using the provided selection.
- Do not convert OS labels, emoji product rendering, theme spans, or raw mobile
  claims into generic Slate behavior unless a separate owner accepts them.

## Related Issues

- [Slate browser IME proof rows need honest DOM composition boundaries](../developer-experience/2026-05-07-slate-browser-ime-proof-rows-need-honest-dom-composition.md)
- [Slate React model-owned input must ignore stale DOM target ranges](../ui-bugs/2026-04-21-slate-react-model-owned-input-must-ignore-stale-dom-target-ranges.md)
- [Slate React runtime owner cuts need static inventories and browser proof](../developer-experience/2026-04-27-slate-react-runtime-owner-cuts-need-static-inventories-and-browser-proof.md)
