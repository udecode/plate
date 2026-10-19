# Cross-judge verdict: device-proof lane

Totals: candidate-1 16/18, candidate-3 15/18, candidate-2 13/18. Base is candidate-1.

## candidate-1, Playwright-native (16)
1. Fidelity 3. Stock Chrome over `adb forward` avoids the roughly forty switches `_android.launchBrowser` writes to `/data/local/tmp/chrome-command-line` (verified, `coreBundle.js:38413`, `--allow-pre-commit-input` at `:34454`). Runs attach no UiAutomation, device kind comes from `getprop`, and it is the only candidate that requires the IME `keydown Unidentified` or composition signature, which a CDP `Input.insertText` lacks.
2. Depth 3. `DeviceEditor` is a `Pick` of the real harness with no Android harness change. It is the only candidate that overrides the built-in `page`, `context` and `browser` fixtures to throw, so a case cannot fall back to desktop Chromium.
3. Determinism 3. The layout is calibrated from the accessibility tree once per fingerprint and cached, and a stale layout fails closed. Taps are correlated by trace order, and a restore token makes preflight convergent. The Gboard settings step is manual.
4. Cost 3. No new dependency, since playwright-core is already there. It runs with no Appium server and no daemon, and timings are labeled guesses.
5. iOS 1. The candidate itself calls iOS its strongest risk. It needs a hand-built Web Inspector client, an XCUITest driver and the `RootEvaluator` refactor before a single iOS receipt can exist.
6. Receipt 3. Schema 2 makes the five runs a tuple and gives each platform and scenario a `physical | emulator | missing` coverage cell while `ok` stays as strict as today. `check-plite-release-proof.mjs:646-676` (verified duplicate `realDevice`/`directAppium` checks) moves onto the single validator.

## candidate-2, Appium-unified (13)
1. Fidelity 2. Measured `device.class` and a tap-inside-IME-window check are good. UiAutomator2 keeps UiAutomation attached for the whole run, which risks Chrome's accessibility mode, and chromedriver probably launches Chrome with its own flags (inferred). It addresses neither. Its keydown rule passes a stroke that has no keydown at all.
2. Depth 2. One `EditorRoot` port for both platforms is clean. But `setup.select` puts a handle writer in the public surface, and the keyboard is split between `device.keyboard.use` and `editor.keyboard.type`.
3. Determinism 2. Re-reading the tree after each page or shift tap is robust. Learned-word drift across the five runs is left open (`pm clear` is posed as a question), and every stroke costs two WebDriver round trips.
4. Cost 2. Appium 3.3.0, uiautomator2 7.1.2 and xcuitest 10.43.1 are in `~/.appium` on this host (verified). A fresh contributor still needs a server, two drivers, chromedriver autodownload, two insecure flags and WDA signing, and every oracle read takes a WebDriver hop.
5. iOS 3. iOS is a profile entry on a driver that is already installed. The April failure was the `element/value` input path, not the session (verified, `2026-04-11-browser-mobile-proof-batch.md:117`), and the design avoids that path.
6. Receipt 2. The `scope` validator is honest. `runs` is a plain array, not a five-tuple, and the gate's `environment.devices[].directAppium` check is left unaddressed.

## candidate-3, agent-device (15)
1. Fidelity 2. It has the best witness model: a `REAL_SOFT_KEYBOARDS` allowlist, `touchstart` inside the target rect, and one `judgeRawMobileWitness` that both the lane and the gate call. But device kind comes from the config table `DEVICE_TARGETS`, not from a probe, so an emulator serial under `android-physical` would mint a `physical-device` claim. It also accepts strokes with no keydown.
2. Depth 3. It has one `TouchTarget` union, refusal reasons as a typed union, and no `Page`. Only `driver.ts` imports agent-device. It does not override the built-in `page` fixture.
3. Determinism 3. Settings are automated with readback, IME, locale and focus owner are checked before and after each step, each content touch takes a fresh capture, and `bootId` proves warmth.
4. Cost 2. It adds a pre-1.0 dependency with a daemon, about 1.5 s per content touch, and an emulator test IME that turns itself on (verified, `known-limitations.md`, `text-input.ts:45-67`), so the fence has to hold forever.
5. iOS 2. agent-device's XCTest handles touches and key lookup, but the Safari oracle is still an unproven WebKit inspector, which is the same gap candidate-1 has.
6. Receipt 3. `requires` sits as data on `RAW_MOBILE_SCENARIOS`, there is one bundle file per platform, and the requirement object holds the claim, platforms and scenarios. Deleting `mobile-transport-proof.ts` would also have to update the public import smoke test and `proof.test.ts` (verified), and the candidate does not list them.

## Base: candidate-1
It has the cleanest boundary and the smallest dependency footprint, with no harness change for Android. It is also the only design that closes both the desktop-fixture fallback and the CDP `insertText` bypass. Its one weak score, iOS, is a phase-3 driver choice that the grafts below cover without touching the public surface.

## Grafts
- From candidate-3. Move `isSoftKeyboardDelivery` into a `judgeRawMobileWitness`-style module that adds the `REAL_SOFT_KEYBOARDS` allowlist and the `touchstart`-in-rect touch witness. Replace candidate-1's hard-coded `composition-ime` special case with `requires` as data on `RAW_MOBILE_SCENARIOS`.
- From candidate-3. Automate Gboard settings with an accessibility readback in place of candidate-1's manual step. Check IME, locale and focus owner after every keyboard step, record `bootId` per run, and write one bundle file per platform.
- From candidate-2. For phase 3, use the Appium XCUITest profile already installed here (`connectHardwareKeyboard: false`, WDA autocorrection and prediction recorded in the receipt, `calibrateWebToRealCoordinatesTranslation` as a cross-check) and the `executeAsync` adapter with an `undefined` sentinel as the `RootEvaluator` implementation.
- From candidate-2. Split `resolveTextOffsetPoint` out of `clickTextOffset`, so desktop clicks and device taps share one owner of "where is model point P".

## What every candidate got wrong
- None of them proves on a device that the witness rejects a real bypass, such as one `adb shell input text` step or one CDP `Input.insertText` step. The lane's claim rests on that check, and it is the one test the AGENTS.md Tests rule clearly earns. candidate-3's checks are synthetic validator JSON, and candidate-2's focus-outside case tests a different defect.
- All three hang determinism on Gboard key nodes being in the UIAutomator tree on the API 36 Play image. The only support is agent-device README prose and a hand-built unit fixture (`packages/capture-kit/src/snapshot-chrome.test.ts`, a `Keyboard$Key` labeled `q`). All three list it as a probe, but none makes it the gate before any package code.
- Each one misreads a rival once. candidate-2 says candidate-1's cases hold a real `Page`, which is false because candidate-1 throws on `page`. candidate-1 calls candidate-2's port "a second oracle". candidate-3 says candidate-1 rebuilds device boot, which it does not do inside tests.

## Convergence
All three tap Gboard keys at rectangles read from the IME window's accessibility nodes and reject screenshots and static tables. They narrow `DeviceEditor` to the harness's `get`, `assert` and `snapshot`, have `type()` tap keys without promising text, and require a trusted `beforeinput` or composition event within about 1500 ms with no retries. They route `composition-ime` to a composing keyboard profile because English Gboard commits per letter. They replace schema 1 outright, drop `directAppium`, and fail the gate on emulator receipts. They use `repeatEach: 5` with a worker-scoped session, brand screen and CSS points apart, and add `keydown` to the native trace (verified absent, `types.ts:118-124`). For iOS, all three plan an evaluate-only root port that `Locator` satisfies, which rewrites the same Locator-only assertions (verified, `harness-assertions.ts:44,151,165,169`).
