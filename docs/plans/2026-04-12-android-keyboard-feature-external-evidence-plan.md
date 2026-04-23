---
date: 2026-04-12
topic: slate-v2-android-keyboard-feature-external-evidence-plan
---

# Android Keyboard-Feature External Evidence Plan

## Purpose

Close the last Android parity slice that local Appium + Chrome cannot prove:

- autocorrect
- glide typing
- voice input

## Current Local Ceiling

What the current local stack can prove:

- editor focus in Android Chrome
- `keyboardShown: true`
- `CHROMIUM` and `NATIVE_APP` context availability
- literal typing and the structural rows

What it still cannot prove:

- Gboard candidate visibility
- candidate acceptance
- glide path behavior
- voice-input commit behavior

Current blocker evidence:

- zero `com.google.android.inputmethod.latin` nodes through Appium native lookup
- zero suggestion/candidate nodes
- hardware keycodes only yield literal `cant `

Reference:

- [2026-04-12-appium-android-chrome-can-show-keyboard-state-without-exposing-gboard-candidates.md](/Users/zbeyens/git/plate-2/docs/solutions/integration-issues/2026-04-12-appium-android-chrome-can-show-keyboard-state-without-exposing-gboard-candidates.md)

## Goal

Produce honest evidence for the remaining Android keyboard-feature rows without
pretending hardware key injection is enough.

## Evidence Order

1. real Android phone with Gboard in Chrome
2. real-device browser farm that preserves keyboard UI and video
3. alternate Android automation substrate that can see or accept IME
   candidates
4. manual-device artifact lane if automation still cannot expose the keyboard
   feature surface

## Required Lanes

### Lane 1: Autocorrect

Flow:

1. open `/examples/placeholder?debug=1`
2. type a misspelled token such as `Cant`
3. accept the keyboard correction naturally
4. verify the corrected token committed
5. verify the cursor landed after the corrected token

Pass rule:

- the correction is accepted through the real keyboard suggestion path
- the committed text is corrected, not left as literal raw input
- the selection stays at the expected trailing position

### Lane 2: Glide Typing

Flow:

1. open `/examples/android-tests#insert`
2. use the glide-typing sentence lane
3. enter a short phrase through real swipe typing
4. capture the final text and cursor position

Pass rule:

- committed text is intelligible and matches the intended phrase closely enough
- no duplicated fragments, selection jumps, or block corruption appear

### Lane 3: Voice Input

Flow:

1. open `/examples/android-tests#insert`
2. use the voice-input sentence lane
3. trigger microphone input through the real keyboard or system sheet
4. dictate a short phrase
5. capture the final text and cursor position

Pass rule:

- dictated text commits into the editor without corruption
- the final selection lands after the inserted text

## Artifact Root

Use:

- [android-keyboard-features](/Users/zbeyens/git/plate-2/.omx/artifacts/ime-mobile-browser/android-keyboard-features/README.md)

One-command capture:

```sh
bash /Users/zbeyens/git/plate-2/.omx/artifacts/ime-mobile-browser/capture-bundle-assets.sh \
  android-emulator \
  android-keyboard-features \
  autocorrect \
  emulator-5554
```

## Required Bundle Per Run

- `notes.md`
- `selection.txt`
- `dom.txt`
- `actions.md`
- `screenshot-01.png`
- `screenshot-02.png`
- `video.mp4` when the keyboard suggestion strip or voice sheet is part of the
  proof

## Device Metadata

Always record:

- device model
- Android version
- Chrome version
- keyboard / IME exact version
- locale / language
- whether autocorrect was enabled
- whether glide typing was enabled
- whether voice typing was enabled

## Exit

This lane closes only when:

1. autocorrect has at least one honest artifact bundle
2. glide typing has at least one honest artifact bundle
3. voice input has at least one honest artifact bundle
4. the behavior ledger and proof ledger are updated from those artifacts
