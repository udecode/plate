---
title: InsertTranspose beforeinput needs a model-owned command
date: 2026-05-09
category: docs/solutions/logic-errors
module: Plite React input runtime
problem_type: logic_error
component: frontend_react
symptoms:
  - Lexical's portable Control+T transpose row had no Plite equivalent.
  - Plite prevented `insertTranspose` beforeinput without applying a model command.
  - Repeated transpose from `abc` at offset `1` left the text unchanged.
root_cause: missing_command
resolution_type: code_fix
severity: medium
tags: [plite, beforeinput, keyboard, transpose, input-runtime]
---

# InsertTranspose beforeinput needs a model-owned command

## Problem

Mac Control+T can emit `beforeinput` with `inputType: "insertTranspose"`.
Plite classified that as model-owned text input, prevented native DOM mutation,
then had no command to apply.

## Symptoms

- A package proof for `insertTranspose` left `abc` unchanged.
- The browser route also needed a stable synthetic beforeinput row because the
  real hotkey is Mac/browser-specific.

## Solution

Represent transpose as a first-class input command:

- parse `insertTranspose` to `transpose-character` in the editing kernel
- apply it in `model-input-strategy.ts`
- swap adjacent characters around a collapsed selection in
  `mutation-controller.ts`
- keep a no-beforeinput keyboard fallback for Ctrl+T
- prove both the package command path and the plaintext browser event path

The command swaps the character before the cursor with the character after it.
At the end of a text node, it swaps the previous two characters. Selection lands
after the swapped pair.

## Why This Works

`insertTranspose` is not ordinary inserted text; it carries the edit intent in
`inputType`, not in `data`. Treating every `insert*` event as data-backed text
means Plite can correctly prevent native mutation but still silently drop the
edit.

The clean owner is the editing kernel plus model-input strategy, not a
Playground shortcut handler. That keeps browser input behavior centralized with
the rest of beforeinput handling.

## Prevention

- When harvesting editor keyboard tests, check for `inputType` rows with no
  `data` payload.
- Add one package proof for command parsing/application and one browser proof
  for the event route when the behavior is browser-visible.
- Do not treat OS labels or browser skip tags as Plite behavior. Port the
  invariant, not the upstream harness.

## Related Issues

- [Beforeinput substitutions must flush native text before replacement](./2026-05-09-beforeinput-substitutions-must-flush-native-text-before-replacement.md)
- [Plite hotkey dependency hard cuts need owned matchers and layout contracts](../developer-experience/2026-05-03-slate-hotkey-dependency-hard-cuts-need-owned-matchers-and-layout-contracts.md)
