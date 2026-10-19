# Shard 004: Android device probe with Playwright and Gboard

A throwaway probe on 2026-10-02 checked whether Plate's existing proof stack
can drive Chrome for Android with the real Gboard keyboard and still read the
editor model. It ran from the session scratchpad; no repository file changed.

## Setup

- Emulator: the local AVD `Pixel_9_API_36_Play` (Play image, Chrome
  146.0.7680.177, Gboard as the default input method), booted headless with
  `emulator -no-window -no-audio -no-snapshot-save`.
- Page: `http://localhost:3000/blocks/mention-demo` from this checkout's www
  dev server, reached through `adb reverse tcp:3000 tcp:3000`.
- Attach: `adb forward tcp:9333 localabstract:chrome_devtools_remote`, then
  `chromium.connectOverCDP('http://localhost:9333')` from the repository's
  `playwright-core@1.61.0`. No Chrome flag, root or Appium was needed.
- Input: `adb shell input tap x y` on Gboard key positions read from a device
  screenshot. These are real touches into the Gboard window, so Gboard decides
  what reaches Chrome.
- Oracle: Plite's `__pliteBrowserHandle` on the editor root, the same handle
  `@platejs/test`'s harness reads, plus capture-phase listeners for
  `keydown`, `beforeinput`, `input` and the three composition events.

## Results

| Step | Model | DOM selection | Events |
| --- | --- | --- | --- |
| Tap before `Mention` | caret `[0,0]` offset 0, editor focused, keyboard shown | offset 0 | none |
| Type `@biggs` on Gboard | `@biggsMention`, caret offset 6, popup shows `Biggs Darklighter` | offset 6 | per letter: `keydown` `Unidentified`, then `beforeinput` and `input` with `insertText`; no composition event |
| Type ` hello` after `. ` | `. Hello`, caret `[2,4]` offset 7 | offset 7 | Gboard auto-capitalized `H`; still `insertText` per letter, no composition |
| Type ` @bi`, tap `Biggs Darklighter` | mention inserted, caret `[2,6]` offset 0, editor focused, popup closed | matches | real touch on the option |

## What it shows

- The existing harness oracle works unchanged on a real Chrome for Android
  page. A device lane needs a new way to open the page and a soft-keyboard
  typing helper, not a new oracle.
- Real Gboard behaved differently from both emulations the repository uses. It
  sent every letter as a committed `insertText` with no composition, while the
  Pixel 5 project on desktop Chromium and CDP `Input.imeSetComposition` model
  word composition. The emulated caret fault recorded on 2026-10-01 (caret at
  offset 11 instead of 6) did not occur.
- Gboard's suggestion strip was on and showed word candidates, so the missing
  composition is not explained by disabled suggestions. Whether physical
  devices or other Gboard settings compose against Plite's editor is unknown.
- The tap on an autocomplete option completed correctly, which is the
  autocomplete plan's open "Android taps" gate on an emulator. A physical
  device and a composing keyboard remain unproven.

## Limits

One run per step, not the five warm runs `verify` requires for native input.
Emulator, not a physical phone. Gboard key coordinates came from a screenshot,
so a helper would need to read the keyboard layout or use the accessibility
tree. The dev server belonged to another session.
