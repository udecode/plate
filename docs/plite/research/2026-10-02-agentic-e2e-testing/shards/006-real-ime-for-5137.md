# Real IME proof for PR 5137, locally and without Actions minutes

Shard scope: read-only research for `docs/plans/5137-ime-inline-caret.md`. Grades: A = source read or command run this session, B = detailed issue, PR or doc, C = general doc, D = claim or inference. Throughput checkpoint: n/a, read-only investigation.

## Verdict

Yes. This Mac can run a real OS Pinyin composition in headed exact Google Chrome, driven entirely from a Playwright spec, with no Actions minutes. The posting process chain (iTerm2) already holds Accessibility, event-post, event-listen and Screen Recording access (A, measured preflights). The one missing piece is the Pinyin input method itself: its mode row is enabled, but its parent input method is disabled, and `TISSelectInputSource` refuses a mode whose parent is disabled (A, SDK header plus TIS probe). The owner re-adds Pinyin – Simplified once, and the rest is scriptable: TIS select, pid-guarded CGEvent keys, OS screen capture, and a caret pixel classifier with controls.

The premise "headless does not paint the caret" is wrong for CDP screenshots. Headless Chromium 149 paints the composition caret, it blinks, and Playwright hides it by default (A, probe below). That default is why `homepage-ime.spec.ts:111` can never show a caret.

## 1. The exact claim 5137 must prove

Source: PR 5137 body and plan at head `5fb7c40b` (A), local plan `docs/plans/5137-ime-inline-caret.md` (A).

Every oracle row except one passes: five model, DOM, focus and follow-up rows through five CDP homepage replays, and the subscription row through the mounted decoration test. The open row is `geometry-paint during-action`: "OS Pinyin caret follows actual preedit without stale pixels", with five-run acceptance and the duplicate-caret control unexecuted (plan Proof table, A).

Claim to certify, on the final 5137 source:

- Environment: macOS 26.3.1, exact Google Chrome 154 (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, now 154.0.8037.97, not the .58 the plan recorded), homepage `/` on the source-mode www server, the full homepage fixture (A, `--version` read).
- Input: OS Simplified Chinese Pinyin (`com.apple.inputmethod.SCIM.ITABC`), keys `c e s h i`, then Space, then `2`.
- Anchors: the reporter's point, text host `1,0` offset 27 (`rich-te|xt`, before the link), plus the after-link host `1,2` that the CDP spec also covers (plan, A).
- During preedit, after each key: exactly one painted caret at the end of the live preedit (`ce shi`, DOM focus offset 33 for host `1,0`), within 2 px of the collapsed DOM selection rect. No caret at the pre-composition point. The composing Text node stays connected and identical, focus stays in the editor, the model selection stays at 27.
- After Space: `测试` inserted once at 27, model and DOM selection agree at 29. After `2`: text `测试2`, selection 30, and the caret paints after `2`.
- Repetition: five warm runs, no retries. The pixel classifier passes `positive-control`, `negative-control` and `duplicate-control` through the same capture path (verify law, regression-oracles.md:471-484, A).

What already exists: one native Pinyin probe proved commit and next-key placement at offset 27, but its single preedit frame showed the underline and no caret (A, viewed `native-pinyin-preedit-crop.png`). The four follow-up frames alternated caret absent, present, present, absent (A, `native-caret-pixel-inputs.json`). That pattern is caret blink, so a single unstabilized preedit frame cannot prove or disprove paint (D, inferred from the blink pattern and the Blink timer source below).

## 2. Candidate 1: macOS real input method in headed Chrome

### Machine state (A, all measured this session)

| Fact | Value |
| --- | --- |
| macOS | 26.3.1 (25D2128), arm64 |
| Swift | `xcrun --find swift` resolves; Apple Swift 6.3.3; helper sketch compiles in 2.4 s |
| Enabled input sources (TIS) | CharacterPaletteIM, U.S., PressAndHold |
| `AppleEnabledInputSources` | also lists an orphan `SCIM.ITABC` Input Mode row left by the earlier cleanup |
| `SCIM.ITABC` (mode) | enabled=1, selectCapable=1 |
| `com.apple.inputmethod.SCIM` (parent) | enabled=0, selectCapable=0 |
| Selected source | U.S. |
| `AXIsProcessTrusted`, `CGPreflightPostEventAccess`, `CGPreflightListenEventAccess`, `CGPreflightScreenCaptureAccess` | all true |
| Responsible app for TCC | iTerm2 (process chain: claude, zsh, herdr, login, iTermServer) |
| Secure keyboard input holder | none (`ioreg` shows no `kCGSSessionSecureInputPID`) |
| User's own Chrome | running, pid 685, same bundle as the exact Chrome under test |
| `screencapture` latency | 80 ms warm, 215 ms first call |
| `cliclick`, `macism`, `im-select`, `xdotool` | not installed |

### Mechanism

1. Select the input source with `TISSelectInputSource`. The header requires the source to be enabled and select-capable, and an input mode's parent must be enabled (A, `TextInputSources.h`). Here the parent is disabled, so selection fails until the owner re-adds Pinyin. `TISEnableInputSource` can enable it programmatically (A, header), but that changes system settings and this shard did not try it.
2. Defeat the CJKV activation race. Out-of-process `TISSelectInputSource` changes the menu-bar icon, but CJKV input often does not take effect until the app is deactivated and reactivated. macism works around it with a temporary key window and a 150 ms wait on macOS 26 (A, macism README and `InputSourceManager.swift`). Squirrel issue #1162 reports the same macOS 26 failure for switching in: the IMK controller is not activated and keys pass through as ASCII, and switching apps and back fixes it (B). The test needs no extra window. It selects Pinyin while Chrome is in the background, activates Chrome, waits 150 ms or more, then runs a probe key and requires a trusted `compositionstart`.
3. Make Chrome the real key window. Playwright enables `Emulation.setFocusEmulationEnabled` for every main frame (A, `coreBundle.js:37049`), so `document.hasFocus()` is true even when Chrome is behind another app. It proves nothing about OS focus. Activation from a CLI is not guaranteed under cooperative activation (A, Apple `NSApplication.activate()` and `NSRunningApplication.activate(from:options:)` docs). Chrome's own window show path calls `activateIgnoringOtherApps:` (A, `native_widget_ns_window_bridge.mm:1066-1069`), so `page.bringToFront()` is worth trying first. A CGEvent click on the test window's title bar is the dependable fallback, because it activates like a user click without moving the page selection (D).
4. Post keys with `CGEventPost(kCGHIDEventTap, …)`. This posts into the window-server event stream at the HID entry point (A, `CGEvent.h`, Apple `cghidEventTap` doc). The frontmost app receives the keys as if typed, and AppKit's `interpretKeyEvents` routes them through the active input method (D for the routing, with indirect support: the earlier session's injected keys produced IME-segmented preedit `ce shi` and committed `测试`, B, `native-pinyin-probe.json`). Posting needs "event synthesizing access" (A, `CGPreflightPostEventAccess` in `CGEvent.h`). System Settings shows that as Accessibility (D). HID posting goes to whatever app is frontmost, so the helper checks `NSWorkspace.frontmostApplication.processIdentifier == chromePid` before every key and aborts otherwise (sketch below). That turns the earlier "Chrome switched to another page" stop into a detected setup failure instead of keystrokes typed into the wrong app.
5. Find the right Chrome. The user's Chrome (pid 685) shares the bundle id with the exact Chrome under test. Activation by app name or `open -a` can hit the wrong instance (D, inferred, and a plausible cause of the earlier stop). Target by pid: the spec sets a unique `document.title` nonce, and `CGWindowListCopyWindowInfo` maps it to owner pid, window number and bounds. Reading window titles needs Screen Recording, which is granted (A).

### Prior art

No editor project found that drives a real OS IME in CI or locally.

- Lexical e2e uses CDP `Input.imeSetComposition` and `Input.insertText` (A, `__tests__/utils/index.mjs` `imeCompose`).
- ProseMirror and CodeMirror use synthetic `CompositionEvent` plus direct `nodeValue` edits (A, `test/webtest-composition.ts` in both).
- VS Code replays recorded real IME event sequences in unit tests (A, `src/vs/editor/test/browser/controller/imeRecordedTypes.ts`).
- Chromium's own tests call `setMarkedText` on the Cocoa view, or `SetCompositionText` on the Aura view, against mock widget hosts. They never use an OS IME (A, `render_widget_host_view_mac_unittest.mm:98`, `render_widget_host_view_aura_unittest.cc:1388`).
- bromure bridges real macOS IME into a VM browser. A hidden `NSTextInputClient` receives the composition and forwards it over CDP `imeSetComposition` and `insertText` (A, `CJKInputBridge.swift`). That is CDP again on the browser side.
- GitHub code search for `TISSelectInputSource` together with `CGEventPost` in test tooling returned nothing relevant (A, `gh search code`, empty). The method is unusual, not unprecedented in desktop automation (D).

## 3. Candidate 2: CDP `Input.imeSetComposition` against a real IME

Both paths enter the renderer through the same call. CDP calls `widget_host->GetWidgetInputHandler()->ImeSetComposition(...)` (A, `input_handler.cc:1306-1359`). Cocoa's `setMarkedText` path calls `_host->ImeSetComposition(...)`, which `RenderWidgetHostViewMac` forwards to the same widget host (A, `render_widget_host_view_cocoa.mm:1683-1692`, `render_widget_host_view_mac.mm:2271-2281`). Commit is `ImeCommitText` in both (A, `input_handler.cc:1281-1304`, cocoa `:1676-1678`). Blink therefore paints the caret and the composition from the same renderer state. The differences:

| Difference | Real Cocoa IME | CDP | Matters for 5137? |
| --- | --- | --- | --- |
| Key events | trusted keydown with keyCode 229 (`VKEY_PROCESSKEY`, `skip_if_unhandled`) before each composition update and before commit (A, cocoa `:1645-1661`) | none; the repo helper dispatches one untrusted keydown with keyCode 220 at `compositionstart` (A, `ime.ts:21-35`) | Possibly. A per-key trusted keydown can trigger editor work between updates. This is the main behavioral gap (D) |
| Underline spans | from the IME's attributed string, thick or thin (A, cocoa `:155-190`) | empty vector, Blink default (A) | Paint only. It does not move the caret |
| Focus | requires the real key window | calls `widget_host->Focus()` on every call (A, `input_handler.cc:1300,1353`), plus Playwright focus emulation | Yes for proof honesty: CDP can compose into a window the user could not type into |
| Preedit content | IME-shaped (`ce shi` with segment space), possibly non-monotonic, with replacement ranges | whatever strings the test sends | Possibly (D) |
| Candidate window | IMK queries `firstRectForCharacterRange`; an OS window appears | none | Not for page paint; useful evidence that the real IME ran |

Flags: `--disable-blink-features=CaretBlinking` exists on Chromium main ("Allows automated test runners to keep focused carets visible", A, `runtime_enabled_features.json5:1162-1166`), but it is absent from the Chrome 154 branch 8037 (A, grep count 0). CSS `caret-animation: manual` is stable on 154 (A, branch 8037 `:1536-1540`). It sets `SetBlinkingDisabled(true)`, which starts the caret with a zero blink interval and leaves position untouched (A, `frame_caret.cc:136-158`, `:171-190`). It is the stabilizer to use.

Headless probe (A, `caret-headless-probe.cjs`, Chromium 149.0.7827.55, CDP composition `ni` at offset 3, six samples 230 ms apart in a 12 px clip):

| Mode | `caret-animation` | screenshot `caret` | dark px per sample |
| --- | --- | --- | --- |
| new headless | auto | initial | 52 52 37 37 52 52 (blinks) |
| new headless | manual | initial | 52 52 52 52 52 52 |
| headless shell | auto | initial | 52 52 37 37 52 52 |
| headless shell | manual | initial | 52 52 52 52 52 52 |
| new headless | manual | hide | 37 37 37 37 37 37 |

The 15 px delta is the caret column. Playwright's default `caret: 'hide'` sets `caret-color: transparent !important` (A, Playwright 1.61.0 types and `coreBundle.js:20719-20727`). Every existing repo pixel classifier passes `caret: 'hide'` (A, `code-block-selection.spec.ts:23`, `comment.spec.ts:401`, `link-floating-toolbar.spec.ts:29`), and `homepage-ime.spec.ts:111` takes the default.

## 4. Candidate 3: Android Gboard

A Play image AVD exists (`Pixel_9_API_36_Play`, A, `emulator -list-avds`), and `adb` is installed (A). Gboard on it composes for real through `InputConnection.setComposingText`, and real touches over `adb` drive it (D). Plite routes Android hosts through a separate input owner: `isAndroidDOMHost` branches in `composition-state.ts:829,841,1017` and `android-input-manager.ts` (A). Chrome Android enters through `ImeAdapter`, not Cocoa (D). That proof covers the Android class only and cannot close the desktop paragraph claim. The plan already keeps "Android and external adapters retain their own authority" as a separate boundary (A).

## 5. Candidate 4: Linux, only as a note

Docker Desktop is installed (A). Xvfb plus `ibus-daemon` and `ibus-libpinyin`, with Chrome using the GTK IM module and `xdotool key` sending XTEST events, should compose for real (D, no working recipe found; `gh search code` returned only dotfiles). On arm64 there is no Google Chrome Linux build, so it cannot satisfy the exact-Chrome rule (D). It is a possible future CI lane for Chromium, not the 5137 closure.

## 6. Observation design

Oracles per phase, all inside one Playwright spec. Verify forbids a parallel raw CDP or standalone driver for interactive QA (A, `verify.mdc:259-261`).

- DOM and model, read over CDP while the OS IME composes. Reuse the existing `capture` and `readNativeState` from `homepage-ime.spec.ts`: same Text node, connected, focused, preedit text, model selection still 27.
- Native-path proof. `startBrowserNativeEventTrace` must show trusted keydown events with keyCode 229 and `isComposing` true between composition events. CDP cannot produce those, so their presence is the executable proof that the OS IME delivered the composition (D for the exact trace fields; the Cocoa source guarantees keyCode 229, A).
- Caret rect. The collapsed `Range.getClientRects()[0]` of `document.getSelection()` at each preedit state gives the expected caret x. The stale x comes from the setup rect at offset 27.
- Pixels. Inject `caret-animation: manual` on the editor root for the capture window only. Capture with OS `screencapture -x -R<window content rect>`; it shows the real compositor output and the OS candidate window. Map CSS px to image px with two injected calibration markers rather than guessing chrome offsets. The classifier counts caret-colored vertical runs of at least 60% of line height within the text band, excluding underline rows, as in the earlier `native-caret-pixels.mjs` column-group method (A). Pass: exactly one run within 2 px of expected x, zero runs at the stale x.
- Controls through the same capture path, every run, on the same route (the earlier duplicate control failed only because it used a blocked `file:` fixture, A):
  - positive: collapsed caret at a known offset before composition, so exactly one run;
  - negative: the same state with `caret-color: transparent` on the root, so zero runs;
  - duplicate: the positive state plus an injected 1 px caret-colored element at another x on the same line, which the classifier must reject as two runs.
- Confirmatory run without the stabilizer: one run takes a burst of five 80 ms OS captures over 1.1 s per preedit state. The union must show the caret at the expected x and never at the stale x. That shows `caret-animation: manual` hides nothing.
- Inspect one legible crop per anchor, as verify requires for visual claims (A, `verify.mdc:340-352`).

## 7. Recommendation

### Path

A gated native lane in the existing www runner: `apps/www/tests/browser/homepage-native-ime.spec.ts`, or a native project inside `homepage-ime.spec.ts`. It calls a small Swift helper that the spec compiles on demand into a cache dir (2.4 s measured). The helper sketch is `macos-ime-helper.swift` in this scratch dir. It compiles, and only its read-only `status` and `window` subcommands were run. It needs four commands:

- `status`: TIS state, parent enabled, preflights, frontmost pid.
- `window <title nonce>`: pid, window number and bounds.
- `select <sourceID>`: TIS select, then read back the current source.
- `type <pid> <keys> [delayMs]`: HID-tap key down and up per character, with a frontmost-pid guard before each key.

Restoring U.S. is `select com.apple.keylayout.US` in a `finally`.

Spec flow per anchor:

1. Launch headed exact Chrome.
2. Set the title nonce, `editor.ready`, collapse at the anchor, focus.
3. Run the controls.
4. `select` Pinyin, activate Chrome (bringToFront, then title-bar click fallback), wait 150 ms, check frontmost.
5. Type `c`, then capture DOM, model, trace and pixels; repeat for `e s h i`.
6. Space, then commit assertions. Type `2`, then follow-up assertions and an after-key caret capture.
7. Restore U.S., attach artifacts.

A setup failure (Pinyin not composing, frontmost changed, the probe key inserting ASCII) fails as host/setup and never counts as a product result (verify Completion boundary, A).

### One-time owner setup

- Re-add Pinyin – Simplified: System Settings, Keyboard, Text Input, Edit, +, Chinese (Simplified), Pinyin – Simplified. Leave it enabled; the lane only switches selection and restores U.S. Alternatively, approve the helper calling `TISEnableInputSource` and `TISDisableInputSource` around each session (D, untested here).
- Permissions: none new while runs start from iTerm2, because all four preflights are already true (A). A run from another host app (Codex.app, Terminal, Ghostty) needs Accessibility and Screen Recording granted to that app.
- Keep hands off the keyboard and mouse for the run. Keep "Automatically switch to a document's input source" off; `AppleGlobalTextInputProperties` is absent, which means the default, off (A).

### Commands (shape, not yet runnable: the spec and helper do not exist in the repo)

```sh
PLATE_WWW_DEV_SOURCE=1 pnpm --filter www dev --port 3297
PLATE_NATIVE_IME=macos-pinyin \
PLAYWRIGHT_BASE_URL=http://localhost:3297 \
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
pnpm --filter www test:www-browser:chromium tests/browser/homepage-native-ime.spec.ts --headed --repeat-each=5
```

The server line is verify's recipe (A, `verify.mdc:188-193`). If another server holds `.next/dev/lock`, use a separate output dir. The env and project wiring exist (A, `playwright.config.ts`: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`, `retries: 0`, `workers: 1`). Record `exact-chrome:` with the binary path and its `--version` (A, regression-oracles.md:418-424).

### Minutes

Inferred from measured parts (80 ms capture, 2.4 s compile) and the earlier runs' shape. Each run takes about 10 to 20 s for two anchors: navigate and ready, controls, five keys with captures, commit, follow-up. Five runs take about 1 to 2 minutes of hands-off time. A cold dev-server compile of the homepage adds an estimated 1 to 3 minutes, so the total is about 3 to 6 minutes. CI minutes used: zero.

### What it proves

- Real macOS Pinyin, via IMK and AppKit `setMarkedText`, composes in exact Chrome on the reporter's paragraph point and the after-link host.
- The visible caret pixels sit at the preedit end with no stale or duplicate caret, through classified controls.
- Model and DOM continuity, commit, and next key hold under the real event sequence, including the trusted keyCode 229 keydowns that CDP never sends.

### What it cannot prove

- Other IMEs (Japanese Kotoeri, Squirrel, Sogou), other macOS versions, Safari or Firefox.
- Hardware-keyboard timing beyond the posted cadence.
- Candidate selection other than the first candidate, and mouse candidate clicks.
- Android or iOS.
- The publication state of PR 5137, which still lacks the local repairs (plan, A).
- The stabilizer run proves caret position, not blink cadence. The burst run covers blink only loosely.

### Fallback when the owner declines the OS change or hands-off time

Strengthen the CDP lane and label it CDP-scoped:

- screenshots with `caret: 'initial'` and `caret-animation: manual` (A, probe);
- the same three-control caret classifier;
- before each `imeSetComposition`, a CDP `Input.dispatchKeyEvent` rawKeyDown with `windowsVirtualKeyCode: 229`, mirroring the Cocoa order (A, source; whether CDP's synthetic 229 reaches Plite identically is D).

It runs headless, in five warm runs, in seconds, and can run in CI later. It proves renderer caret paint at the composition point for browser-delivered composition. It cannot close "OS IME", so `geometry-paint during-action` stays open as CDP-only. The other option is the owner asking the reporter to replay the native lane. That is a message to another person, so it needs the owner's explicit go-ahead.

### Tradeoffs

| Path | Real IME | Exact Chrome | Paint proof | Owner setup | Automation | Closes 5137 paint row |
| --- | --- | --- | --- | --- | --- | --- |
| macOS TIS + CGEvent lane (recommended) | yes | yes | OS capture + classifier | re-add Pinyin once, hands off ~2 min | full | yes |
| CDP + keyCode 229 replay + caret classifier | no | yes | CDP capture + classifier | none | full, headless | no, CDP-scoped |
| Android Gboard on AVD | yes (Android) | Chrome Android | `screencap` | Gboard Chinese pack | full | no, other class |
| Linux IBus in Docker | yes (IBus) | no on arm64 | Xvfb capture | image build | full | no, Linux Chromium |
| Computer Use, manual | yes | yes | single frames, blink-prone | per-run approval | partial | it failed before |

## Gotchas

- `caret: 'hide'` is Playwright's default. Every repo classifier and the homepage spec hide the caret (A).
- Caret blink alternates about every 500 ms (A, probe sample period 230 ms with 2-on, 2-off). Use the stabilizer or a burst.
- `document.hasFocus()` lies under Playwright focus emulation (A).
- The user's own Chrome shares the bundle id. Target by pid (A for pid 685; D for the collision being the earlier cause).
- On macOS 26, a TIS switch can show Pinyin selected while keys still pass through as ASCII. Require a trusted `compositionstart` on a probe key before counting a run (B, Squirrel #1162, macism README).
- Pinyin adapts candidate order. `测试` as the first candidate for `ceshi` held in the earlier probe (A); assert the committed text, never the candidate index.
- CDP replacement offsets are relative to the editable's whole text, not the leaf (A, docs/solutions 2026-05-07 note).
- Exact Chrome changed from 154.0.8037.58 to .97 since the plan's runs. Record the new identity (A).

## Citations

| Grade | Source | Lines or id |
| --- | --- | --- |
| A | PR 5137 metadata, body, comments; `gh api …/pulls/5137/comments` (empty); PR 5136 thread | udecode/plate#5137, #5136 |
| A | PR head plan `docs/plans/2026-09-29-ime-caret-diagnosis.md@fix/ime-caret-inline-text` | full |
| A | `docs/plans/5137-ime-inline-caret.md`, `.decisions.tsv` | full |
| A | `docs/plans/artifacts/5137-ime-inline-caret/native-pinyin-probe.json`, `native-caret-pixels.mjs`, `native-caret-pixel-inputs.json`, `native-pinyin-preedit-crop.png` (ignored local artifacts, not citable as tracked paths) | full |
| A | `packages/test/src/playwright/ime.ts` | 9-38, 284-326 |
| A | `packages/test/src/playwright/caret-visibility.ts` | full |
| A | `apps/www/tests/browser/homepage-ime.spec.ts` | 14, 93-133 |
| A | `apps/www/playwright.config.ts` | full |
| A | `.agents/rules/verify.mdc` | 25-60, 184-193, 248-261, 314-315, 340-352 |
| A | `.agents/rules/verify/references/regression-oracles.md` | 418-484 |
| A | `docs/plite/research/2026-06-13-native-ime-device-proof-methods/README.md` | full |
| A | `packages/plitejs/src/react/editable/composition-state.ts` | 829, 841, 1017 |
| A | Chromium `content/browser/devtools/protocol/input_handler.cc` (main) | 1281-1359 |
| A | Chromium `content/app_shim_remote_cocoa/render_widget_host_view_cocoa.mm` (main) | 155-190, 1640-1700 |
| A | Chromium `content/browser/renderer_host/render_widget_host_view_mac.mm` (main) | 2271-2290 |
| A | Blink `frame_caret.cc` (main) | 116-190 |
| A | Blink `runtime_enabled_features.json5` main 1162-1166, 1633; branch-heads/8037 1536-1540, no CaretBlinking | as listed |
| A | Blink `css_properties.json5` (main) | 3029-3039 |
| A | Chromium `native_widget_ns_window_bridge.mm` (main) | 1064-1069 |
| A | Chromium `render_widget_host_view_mac_unittest.mm`, `render_widget_host_view_aura_unittest.cc` | 98; 1388-1440 |
| A | Playwright 1.61.0 `types.d.ts` caret option; `coreBundle.js` | 12185-12189; 20719-20727, 37049 |
| A | macOS SDK `CGEvent.h`, `TextInputSources.h` | 347-354, 398-408; TISSelectInputSource block |
| A | Local probes: TIS listing, preflights, `defaults read com.apple.HIToolbox`, `ioreg`, `screencapture` timing, headless caret probe | this session |
| A | laishulu/macism README, `InputSourceManager.swift` | master |
| A | facebook/lexical `__tests__/utils/index.mjs`, `Composition.spec.mjs` | 1539-1549; 182-382 |
| A | ProseMirror/prosemirror-view and codemirror/view `test/webtest-composition.ts` | 7-25; 9-23 |
| A | microsoft/vscode `imeRecordedTypes.ts` | 1-40 |
| A | rderaison/bromure `CJKInputBridge.swift` | 1-60 |
| B | rime/squirrel#1162 (macOS 26 programmatic switch-in leaves IMK inactive) | issue body |
| C | Apple docs: `CGEvent.post(tap:)`, `cghidEventTap`, `NSApplication.activate()`, `NSRunningApplication.activate(from:options:)`, `yieldActivation(to:)` | developer.apple.com JSON |
| D | CGEvent HID keys route through the active IMK input method in the frontmost app (indirect support from the earlier probe) | inference |
| D | System Settings labels post-event access as Accessibility | inference |
| D | Linux IBus + Xvfb + xdotool composes in Chrome | inference |
| D | Run-time minutes | estimate from measured parts |
