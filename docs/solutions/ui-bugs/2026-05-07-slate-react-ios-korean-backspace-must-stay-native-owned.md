---
title: Slate React iOS Korean Backspace must stay native-owned
date: 2026-05-07
category: docs/solutions/ui-bugs
module: Slate v2 slate-react keyboard input runtime
problem_type: ui_bug
component: testing_framework
symptoms:
  - Lexical carries an iOS Korean Backspace exception that lets native input own the key.
  - Slate's keydown strategy model-owned destructive Backspace before native beforeinput could own it.
  - A generic desktop/unit proof would be easy to over-claim as exact iOS keyboard closure.
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags: [slate-v2, slate-react, ios, korean, backspace, native-input]
---

# Slate React iOS Korean Backspace must stay native-owned

## Problem

Lexical explicitly lets native iOS Korean Backspace behavior run instead of
turning the keydown into an editor-owned delete command. Slate's keyboard
runtime did not have the same guard, so a Korean iOS Backspace could be claimed
by the model-owned keydown path before native input behavior had a chance to
apply.

## Symptoms

- Local Lexical source has matching guards in plain text and rich text command
  registration for `IS_IOS && navigator.language === 'ko-KR'`.
- Slate's `keyboard-input-strategy.ts` resolved Backspace to a destructive
  command and called `preventDefault()` before any platform/language exception.
- The fix needed to stay honest: this is a runtime contract proof, not exact
  raw-device Korean keyboard closure.

## What Didn't Work

- Treating the existing Android beforeinput unit rows as coverage. Android
  model-owned Backspace and iOS Korean native Backspace are opposite ownership
  decisions.
- Adding a broad mobile exception. The Lexical evidence is narrow: iOS plus
  `ko-KR` plus backward delete.
- Claiming a raw-device fix from a package unit test. The row protects the
  runtime decision; device closure still needs matching iOS evidence.

## Solution

Add a narrow keyboard runtime predicate and call it before destructive Backspace
becomes model-owned:

```ts
export const shouldDeferBackspaceToNativeInput = ({
  isIOS = IS_IOS,
  language = typeof navigator === "undefined" ? "" : navigator.language,
  nativeEvent,
}: {
  isIOS?: boolean;
  language?: string;
  nativeEvent: KeyboardEvent;
}) => isIOS && language === "ko-KR" && Hotkeys.isDeleteBackward(nativeEvent);
```

Then return `keyDownUnhandled()` for that case, letting the native browser input
path own the action.

The regression row lives in
`packages/slate-react/test/keyboard-input-strategy-contract.test.ts`
and asserts:

- iOS + `ko-KR` + Backspace defers to native input;
- iOS + non-Korean Backspace remains model-owned;
- iOS Korean non-Backspace keys remain model-owned.

## Why This Works

The bug is an ownership error, not a delete algorithm error. Korean iOS input is
one of the cases where native behavior carries IME-specific state that the
editor's generic Backspace command should not preempt. Keeping the predicate
narrow preserves normal model-owned Backspace behavior everywhere else.

## Prevention

- When stealing mobile/IME behavior from Lexical or ProseMirror, classify
  whether the reference system is choosing native ownership or editor ownership
  before writing the Slate row.
- Keep platform/language exceptions as predicates with focused contract tests,
  not inline comments buried in the event handler.
- Do not promote package-level platform predicates to exact iOS keyboard claims
  without raw-device or matching simulator/manual proof.

## Related Issues

- [Slate React beforeinput delete commands must refresh synced selection](./2026-04-30-slate-react-beforeinput-delete-commands-must-refresh-synced-selection.md)
- [Slate React Chrome composition fallback must cancel model-owned overlap](./2026-05-07-slate-react-chrome-composition-fallback-must-cancel-model-owned-overlap.md)
- [Appium iOS Safari loads local Slate routes but XCUITest value does not drive contenteditable](../integration-issues/2026-04-12-appium-ios-safari-loads-local-slate-routes-but-xcuitest-value-does-not-drive-contenteditable.md)
