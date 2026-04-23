---
date: 2026-04-11
topic: appium-android-setup-proof
status: in_progress
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
---

# Appium Android Setup Proof

## Goal

Prove the smallest honest Android browser-mobile setup with local open-source
tools.

## What Was True Before

- no `adb`
- no `appium`
- no working Android browser transport proof
- Playwright `_android` could see the emulator only after setup, but
  `launchBrowser()` still hung

## What Landed

- installed `adb` through Homebrew `android-platform-tools`
- installed `appium`
- installed Appium `uiautomator2` driver
- used a connected emulator:
  - `emulator-5554`
  - Android 16
  - Chrome installed
- enabled Appium Chromedriver autodownload with:
  - `uiautomator2:chromedriver_autodownload`
- proved Android Chrome session creation and navigation to the local Slate
  placeholder example

## Exact Proof

The proof path now works with local open-source tooling:

1. start Appium with:
   - `ANDROID_HOME`
   - `ANDROID_SDK_ROOT`
   - `uiautomator2:chromedriver_autodownload`
2. create Chrome session on emulator
3. navigate to:
   - `http://10.0.2.2:3100/examples/placeholder?debug=1`
4. read back:
   - page title
   - page source excerpt

## Added Operator Surface

In `/Users/zbeyens/git/slate-v2`:

- `pnpm proof:appium:android:local`

Required local setup captured by the proof:

- Homebrew `android-platform-tools`
- global `appium`
- Appium `uiautomator2` driver
- exported `ANDROID_HOME` and `ANDROID_SDK_ROOT`
- Appium server flag:
  `uiautomator2:chromedriver_autodownload`

Additional packaged behavior probes now exist:

- `pnpm proof:appium:android:placeholder-input:local`
- `pnpm proof:appium:android:inline-edge-input:local`
- `pnpm proof:appium:android:void-edge-input:local`

## Current Take

This is enough to say:

- Android browser-mobile setup is real locally
- Appium is a viable Android browser transport here
- it is stronger than the old “manual only” story

It is not yet enough to say:

- full Android IME/browser parity is closed
- Appium assertions are integrated into `slate-browser`
- Playwright Android is the winner

## Comparative Read

- Playwright `_android` can see the emulator, which is good
- `launchBrowser()` still hangs here, which is bad
- Appium got to a real Chrome session and local Slate page

So the honest winner for this environment today is:

- Appium for Android browser-mobile setup proof

## Next Honest Step

Use this proof to decide whether the next Android tranche should:

1. build a narrow Appium-backed proof lane first
2. keep Playwright Android as a follow-up investigation

## Follow-On Finding

The first narrow Appium behavior spike is now possible and reveals a real
problem instead of just setup success:

- Appium can click the Slate textbox
- Appium can send text input
- Appium can read the debug overlay back through `execute/sync`
- but the placeholder path is unstable and not trustworthy yet:
  - one direct shell probe committed:
    `sushiType somethingSlate placeholder IME proof surface`
  - the packaged proof path later showed:
    - empty `blockTexts`
    - no event trail
    - no Slate selection
  - Appium `mobile: type` also left the debug overlay unchanged
  - `adb shell input text sushi` after focusing the textbox also left the debug
    overlay unchanged
  - targeting `[data-slate-zero-width="n"]` instead of the textbox still
    produced polluted placeholder text
  - the command now fails loudly on that condition

Rerunning the packaged proof against the current shared proof-core now gives a
clean placeholder commit/readback, and the same upgraded runner also closes the
next two edge rows:

- `blockTexts` is `sushi`
- `placeholderShape` is `null`
- `slateSelection` is `0.0:5|0.0:5`
- `beforeinput:insertText:*` events are present through the full `sushi` burst

That means Appium is now a green Android proof lane on the emulator Chrome row
for:

- placeholder input
- inline-edge input
- void-edge input

The reusable primitive that unlocked `inline-edge` and `void-edge` is:

- click the editor root
- execute a DOM-selection collapse onto the leading zero-width text leaf
- then send text input and read back the debug overlay

It does not yet close every broader Android composition/diff/flush concern that
the legacy Android manager handled.
