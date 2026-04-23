---
date: 2026-04-11
topic: browser-mobile-proof-batch
status: in_progress
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/agent-browser
  - /Users/zbeyens/git/agent-device
---

# Browser-Mobile Proof Batch

## Goal

Finish as much local open-source browser-mobile proof as is honestly possible
before broader architecture planning.

Current batch scope:

1. harden `agent-browser` iOS Simulator post-input capture if possible
2. set up Android transport prerequisites properly

## Ground Truth Entering The Batch

- iOS Simulator Safari setup + initial snapshot is already proved
- iOS post-input capture is still flaky
- Android tooling is not installed:
  - no `adb`
  - no `appium`
  - no `emulator`
  - `sdkmanager` exists but fails because Java is missing

## Decision Rule

- keep only proofs that are actually repeatable
- do not pretend a flaky transport is a proof lane
- setup work counts only if it materially improves the next proof step

## Planned Steps

### Phase 1: iOS Post-Input Proof

- test the smallest post-input capture surfaces:
  - `get text body`
  - `get html body`
  - debug overlay capture
  - screenshot
- keep only the path that proves reliably enough

### Phase 2: Android Setup

- install Android platform tools (`adb`)
- install Appium
- install Java if needed for SDK tools
- reassess emulator viability after the toolchain is present

### Phase 3: Re-verify

- rerun iOS proof command(s)
- verify Android prerequisites are callable
- document exact green/red status

## Progress Notes

- 2026-04-11: confirmed `agent-browser` iOS Simulator can open local Slate
  example and return initial snapshot
- 2026-04-11: confirmed Android setup is currently blocked on missing `adb`,
  missing `appium`, missing `emulator`, and missing Java for `sdkmanager`
- 2026-04-11: installed `adb` and `appium`, found a running Android emulator,
  confirmed Playwright `_android` can see it, but `launchBrowser()` still hangs
- 2026-04-11: installed Appium `uiautomator2` driver, fixed Android SDK env,
  enabled Chromedriver autodownload, and proved Android Chrome can open the
  local placeholder example through Appium
- 2026-04-11: re-checked the iOS post-input path and confirmed the honest read
  still stands:
  open + initial snapshot are good, but post-input capture is not stable enough
  to call a reliable proof lane yet
- 2026-04-11: advanced Android from setup-only to real browser proof:
  Appium can now create a Chrome session on the running emulator and navigate
  to the local Slate example through `10.0.2.2`
- 2026-04-11: the first packaged Android behavior proof is now explicitly red:
  `pnpm proof:appium:android:placeholder-input:local` fails because no
  trustworthy input commit is detected on the placeholder path
- 2026-04-11: the first packaged iOS behavior proof is now explicitly red:
  `pnpm proof:agent-browser:ios:placeholder-input:local` fails because the
  placeholder row still pollutes editor text after typing
- 2026-04-11: rerunning the packaged placeholder-input lanes against the
  current shared proof-core flipped both mobile rows green:
  - `pnpm proof:agent-browser:ios:placeholder-input:local` now returns clean
    debug JSON with `blockTexts: "sushi"`, `placeholderShape: null`, and
    `slateSelection: "0.0:5|0.0:5"`
  - `pnpm proof:appium:android:placeholder-input:local` now returns the same
    clean placeholder commit/readback on Android Chrome emulator
- 2026-04-11: the next two IME rows also went green on both mobile transports
  once the proof runner learned how to collapse DOM selection onto the leading
  zero-width text leaf before typing:
  - `pnpm proof:agent-browser:ios:inline-edge-input:local`
  - `pnpm proof:agent-browser:ios:void-edge-input:local`
  - `pnpm proof:appium:android:inline-edge-input:local`
  - `pnpm proof:appium:android:void-edge-input:local`
  all return clean `blockTexts: "sushi"`, `placeholderShape: null`, and
  `slateSelection: "0.0:5|0.0:5"`
- 2026-04-12: the no-FEFF delayed plain-typing bug was fixed on the actual
  editor path:
  - Chromium slow per-key typing on `placeholder-no-feff?debug=1` is now green
  - Android direct no-FEFF typing proof is now green too
  - the current iOS `agent-browser` lane is not giving row truth right now
    because the route renders only the Next shell and never exposes the editor
    node, even after a long wait
- 2026-04-12: direct Appium iOS Safari setup is green and beats the current
  `agent-browser` route-loading story:
  - `pnpm proof:appium:ios:local` can see the real editor HTML on the local
    placeholder route
  - direct Appium iOS typing is still red on both FEFF and no-FEFF placeholder
    rows:
    - XCUITest `element/value` emits repeated `input:undefined:[null]`
    - `blockTexts` stays empty
    - `slateSelection` stays `0.0:0|0.0:0`
  - that means iOS is now `setup-green / behavior-red` through Appium instead
    of `route-shell-broken` through `agent-browser`
  - the corresponding `agent-browser` local route-loading issue is tracked in
    [vercel-labs/agent-browser#1221](https://github.com/vercel-labs/agent-browser/issues/1221)
- 2026-04-12: the next browser-side tranche should stop being generic Firefox
  poking and use the row-driven follow-up in
  [2026-04-12-firefox-browser-weirdness-tranche-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-12-firefox-browser-weirdness-tranche-plan.md)
