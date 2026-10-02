# Reviewer C findings: local proof lanes synthesis

Scope: `arena/synthesis.md`, candidate-1 (`usage.md`, `sketch.ts`, `rationale.md`, `notes.md`), `judge.md`, shards 003-007 and 009, checked read-only against the repository on `next`.

## Findings

### 1. [critical] Schema 2 and the receipt reporter feed a release gate that local evidence cannot reach
**Location**: synthesis item 2; sketch `device/reporter.ts`, `validateRawMobileProof`; `tooling/scripts/check-plite-release-proof.mjs:22-38,434-700,800-890`
**Finding**: The design says schema 2 serves "the raw-mobile release gate" and that `check-plite-release-proof.mjs` "calls the validator". That gate's `release-ready` profile accepts only a `manifest.json` inside an artifact named `plite-release-proof`, produced by a `workflow_dispatch` run of `.github/workflows/plite-ci.yml` in `udecode/plate`. It checks `producer.runId`, `runAttempt`, `workflowPath` and `event` against the GitHub API (`:88-160`, `:378-432`, `:560-596`). The `raw-mobile` lane is one entry in that manifest, and the gate reads only `environment.devices[]` (`:646-676`). It never reads `mobile-device-proof.json`.
**Evidence**:
- No workflow uploads a `plite-release-proof` artifact. `grep "release-proof" .github/workflows/plite-ci.yml` finds nothing, so the `release-ready` profile has no producer for any lane.
- A locally produced bundle can reach that manifest only through an Actions run, which the owner constraint forbids.
- Committing the bundle is circular. The receipt must carry `build.commit === expectedCommit` (`raw-mobile-proof.ts:210`), and the commit that holds the bundle is never the commit it proves.
- AGENTS.md also says run artifacts are never committed, and receipts carry videos and screenshots.
- The 2026-08-22 binding plan's law is that "a caller-provided `passed: true`, transport label, or nonempty commit is not release evidence". A local JSON receipt is exactly that kind of evidence.
- As written, phase 2 builds `reporter.ts`, schema 2, coverage cells, the `stableStringify` move and the gate rewrite for a consumer that cannot accept their output.
**Suggestion**: Decide the trust model before touching the gate. One option is a local attestation the gate verifies. Another is to keep raw-mobile as a `verify`-scoped claim and leave `release-ready` alone. The cheapest move is to cut all of the gate work from phase 2. Device cases stay ordinary Playwright tests with per-run attachments, and `verify` reads the Playwright JSON report for "five warm runs on identity X". That deletes the reporter, schema 2, the coverage cells and the gate edits until a gate can consume them.

### 2. [critical] Correlating taps by trace length breaks once the native trace ring buffer fills
**Location**: sketch `createDeviceKeyboard` ("n0 = trace length; ... poll trace until an event past n0"), `audit`; `packages/test/src/playwright/native-event-trace.ts:25,377-383`
**Finding**: The design reuses the existing native event trace "rather than duplicated". That trace is a ring buffer: `maxEntries` defaults to 100, and `pushEntry` calls `entries.splice(0, entries.length - innerMaxEntries)`. Once it is full, its length stays at 100, so "an event past n0" never appears.
**Evidence**: Each Gboard letter produces at least `keydown`, `beforeinput`, `input` and `selectionchange`, and composition adds three more event types. Add `pointerdown` and the per-step entries, and a twelve-tap case nears 100 entries. Korean composition cases cross it. After that, every tap times out after 1500 ms as `keyboard-not-delivered`, a false red blamed on the keyboard. The teardown `audit` ("every page input traces to a lane action") then judges a front-truncated trace, so it cannot prove what it claims.
**Suggestion**: Give each entry a monotonic `seq` and correlate by `seq > lastSeq`. In device runs, overflow must fail the run (`trace-overflow`), never drop entries silently.

### 3. [critical] The audit rule rejects the first cases it was written for
**Location**: synthesis item 3 (pending Korean word plus toolbar tap; Korean query tapped mid-composition; suggestion-strip tap); sketch `audit` ("every insertText/insertCompositionText beforeinput falls in a keys or key step's window ... anything else -> 'unattributed-input'")
**Finding**: Committing a composition by touch is the defect class of S6 and S7, and the case list names it on purpose. The commit's `compositionend`, plus `insertText` or `insertCompositionText`, then arrives inside a `touch` step, not a keyboard step. The audit as specified marks it `unattributed-input`.
**Evidence**:
- Case 6 composes a Korean word and then taps a toolbar block-type button. The commit lands in the touch window.
- Case 5's Korean branch taps a combobox option mid-composition, with the same result.
- The suggestion-strip case inserts text from a tap on the IME strip. That tap is not a planned key (`classifyTap` has no strip key), and it is not a page touch, so no `pointerdown` reaches the page.
- Three of the six phase-2 keep cases therefore fail the audit by construction, or the audit gets loosened ad hoc.
**Suggestion**: Model touch-caused deliveries in the witness data: a `touch` step may carry `composition-commit` events when the run had an open composition. Add a `strip-tap` step kind with its own expected signature. Put both in the shared `judgeDeviceWitness` table, not in special cases.

### 4. [critical] `repeatEach: 5` creates a new worker per repeat, so "warm" and the device mapping are both wrong
**Location**: synthesis item 1 ("`repeatEach: 5`, `retries: 0`, one worker per device"); rationale decision 5 ("A run is warm because it reuses the worker's Chrome, tab and calibrated layout"); sketch `openDeviceSession` ("serial = sortedSerials[workerInfo.parallelIndex]"); `defineDeviceConfig` (workers = attached device count)
**Finding**: Playwright 1.61 folds the repeat index into the worker hash: ``test._workerHash = `${project.id}-${test._poolDigest}-${repeatEachIndex}` `` (`node_modules/.pnpm/playwright@1.61.0/.../lib/common/index.js:2108`). It also groups tests by that hash (`lib/runner/index.js:2251-2300`). Each repeat is therefore a separate group that needs its own worker.
**Evidence**:
- With one device, the worker-scoped `deviceSession` (CDP attach, preflight and restore, identity probe, warm-up navigation) is torn down and rebuilt five times per file. The "reuses the worker's tab" warmth claim is false. Only the device-side Chrome process persists, and nothing records that.
- With an emulator and a phone attached, `workers = 2`. Repeats of one test then run concurrently on both devices, so neither identity collects five passes. The reporter, keyed by identity, writes no receipt even though every test passed.
- A second platform project (iOS) would also index the same Android serial list by `parallelIndex`.
**Suggestion**: Use one Playwright project per device serial (`use: { deviceSerial }`) and pin the device from `testInfo.project.use`. Record the Chrome pid (`pidof com.android.chrome`) and the CDP target id per run as the warmth witness, and fail the receipt when they differ across the five runs.

### 5. [warning] `connectOverCDP` still turns on Playwright's focus emulation
**Location**: sketch `android.attachChrome` ("chromium.connectOverCDP. Stock Chrome, no flags."); rationale decision 1
**Finding**: The fidelity argument against `_android.launchBrowser` is that Playwright must not alter the user's Chrome. Even so, `connectOverCDP` without `noDefaults: true` sends `Emulation.setFocusEmulationEnabled` to every main frame of the default context (`playwright-core/lib/coreBundle.js:37045-37050`). Its own type docs say `noDefaults: true` disables focus and media emulation "when attaching to a user's daily-driver browser" (`types/types.d.ts:23410-23426`).
**Evidence**: D20 (#6022) is a focus and keyboard-dismissal defect, and the bug case asserts `focusOwner('editor')`. Under focus emulation, the page keeps window focus that the OS may have taken away. The cost of the fix is one option the design does not pass.
**Suggestion**: Pass `connectOverCDP(url, { noDefaults: true })`, and record that option in the receipt's identity.

### 6. [warning] Events from one tap leak into the next tap's window
**Location**: sketch `createDeviceKeyboard` ("poll trace until an event past n0 or 1500 ms; classifyTap")
**Finding**: The poll stops at the first new event, and `classifyTap` runs on what has arrived by then. Events that arrive later for the same tap, such as `input` after `beforeinput`, Gboard's autocorrect replacement on space, or a trailing `compositionend`, fall into the next tap's window.
**Evidence**: `isSoftKeyboardDelivery` requires a `beforeinput` or `input` plus the IME signature. A poll that wakes on the `keydown` alone classifies the tap as `keyboard-not-delivered`. A late replacement attributed to the next letter fails as `keyboard-plan-diverged`. Both are lane flakes that look like editor faults, which is the confusion `DeviceLaneError` exists to prevent.
**Suggestion**: Close a tap's window on a settle rule, such as a quiet period after the last event or an `input` matching each `beforeinput`. Then check, with the `seq` numbers from finding 2, that nothing arrived before the next tap starts.

### 7. [warning] The witness rule turns one emulator observation into validator law for every platform
**Location**: synthesis item 1 witness ("a `keydown` with key `Unidentified` followed by `beforeinput`, or a composition event"), "one pure `judgeDeviceWitness` ... called ... again by the release validator"; item 10 iOS
**Finding**: The discriminator comes from one Gboard build on one API 36 emulator (shard 009, Limits). On iOS Safari, a real soft-keyboard tap fires `keydown` with the literal key, which is the same shape shard 009 lists for the `adb shell input text` bypass. Samsung Keyboard and SwiftKey are unverified (rationale, open questions). Shared unchanged by the lane and the validator, the rule either fails real iOS taps or has to grow platform branches inside the validator.
**Suggestion**: Make the expected signature data, keyed by keyboard identity, recorded at calibration from real taps, and digested into the receipt. The bypass test then proves that, for that profile, the calibrated signature and the bypass signatures differ. The validator checks "matches the signature recorded for this identity", and iOS adds a profile without touching the judge.

### 8. [warning] Item 9's "pre-PR local check" either spends Actions minutes or tests the wrong server
**Location**: synthesis item 9; `package.json:38,41`; `.github/workflows/ci.yml:136-142`; `apps/www/playwright.config.ts:42-50`; `apps/www/package.json:19,35-37`
**Finding**:
- No "pre-PR local check" exists. The only shared check is `pnpm check`, and CI runs it as `bun check` on PRs and `bun run check:push` on pushes. Putting the www browser suite there runs 295 tests per project with `workers: 1`, plus `pnpm build:registry && next dev`, on every Actions run. That breaks "no new GitHub Actions minutes".
- "Gets a local command" is already true: `test:www-browser:chromium|firefox|webkit` exist.
- The www config has `reuseExistingServer: true` on port 3000, so a local gate silently tests whatever server holds that port. Shard 004 already ran against "a dev server [that] belonged to another session".
**Suggestion**: Name a new script, for example `check:local`, that CI never calls. It should start its own server on a free port with `reuseExistingServer: false`, record the serving checkout's HEAD, and state a measured duration budget before it becomes a gate.

### 9. [warning] Item 4 labels the symptom; the handle setter still changes the native path that follows it
**Location**: synthesis item 4; `packages/plitejs/src/react/editable/selection-controller.ts:683-712`; `packages/test/src/playwright/harness-input.ts:114-202`
**Finding**:
- Labeling handle setters in the trace leaves their behavioral side effect in place. `selectRange` sets the preference reason to `'browser-handle'`, and `isEditableModelSelectionPreferredForInput` returns true for `insertText` under that reason (`:704`). After `selection.select(...)`, the next real `page.keyboard.type` runs as model-owned input, unlike a user's click, which sets `'native-selection'` (`:659`). The labeled step is honest, but the native step that follows is the one that gets contaminated. (Inferred from source, as shard 007 says. Not run.)
- "Proof assertions reject labeled steps" is undefined. There are 454 `select` and `collapse` setups and about 342 synthetic `press` calls (shard 003). If every `assert.*` rejects them, the suites break. If only some assertions do, the design does not say which ones or how a spec marks its proof boundary.
- Paste has three silent stand-ins, not one: `writeClipboard*` throws and falls back to the handle (`:126-129`, `:173-177`); the WebKit and mobile-emulation user agent takes a synthetic paste event (`:168-171`, `clipboard.ts:143-156`); and a native paste that changed nothing falls back to the handle (`:139-153`, `:187-201`). Item 4 addresses only the third.
**Suggestion**:
- Fix the root cause. Delete the `'browser-handle'` origin and preference reason, as shard 007 recommendation 4 proposes, so a handle setup cannot change later native input.
- Define the proof boundary as an explicit harness call, `editor.proof.begin()`, after which labeled steps fail.
- Apply fail-loud to all three paste fallbacks.
- Phase 1's keep criterion of "one Plite and one www browser run" cannot detect this blast radius across 767 and 295 tests on four engines. Require the full Chromium suite plus Firefox and WebKit for the paste call sites.

### 10. [warning] Item 5 is a convention, not a helper, and it drops the pixel controls
**Location**: synthesis item 5; `apps/www/tests/browser/{code-block-selection,comment,link-floating-toolbar,suggestion,table-selection}.spec.ts`; `.agents/rules/verify/references/regression-oracles.md:471-484`
**Finding**:
- `@platejs/test` has no shared pixel or caret screenshot helper. The harness caret assertions (`caret-visibility.ts`) read DOM geometry, and each spec has its own `capturePixels`. "Pixel and caret assertions pass `caret: 'initial'`" is a rule for authors to remember.
- The existing `caret: 'hide'` classifiers measure selection highlight on purpose, so flipping them adds caret pixels to their thresholds.
- `caret-animation: manual` is a Chromium property, so on the Firefox and WebKit projects the caret still blinks and any visible-caret pixel check flakes.
- Verify requires positive, negative and duplicate sentinels through the same capture path. Shard 006 adds a burst run without the stabilizer to show `caret-animation: manual` hides nothing. Items 5 and 7 drop both.
**Suggestion**: Add one helper, for example `captureCaretPixels(editor, clip)` in `caret-visibility.ts`. It sets the stabilizer, captures with `caret: 'initial'`, runs the three sentinels and refuses non-Chromium engines. Item 7's macOS lane should call the same classifier.

### 11. [warning] The macOS IME lane runs exact Chrome with the switches the design rejects on Android
**Location**: synthesis item 7 ("posts keys ... to headed exact Google Chrome"); shard 006 command (`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ... --headed`); judge fidelity reasoning
**Finding**: The judge disqualifies `_android.launchBrowser` because it writes about forty automation switches, including `--allow-pre-commit-input`. Desktop `chromium.launch` applies the same `chromiumSwitches()` list (`coreBundle.js:34433-34470`, used at `:42529`). That list includes `--disable-field-trial-config`, `--allow-pre-commit-input` and `--disable-features=...PaintHolding,...RenderDocument`. The #5137 claim concerns caret paint during preedit in "exact Chrome", and that lane runs with paint holding and field trials turned off. iOS has the same gap: WDA keeps an XCTest client attached throughout, which is the condition the Android design forbids for UiAutomation.
**Suggestion**: Apply one fidelity rule to all lanes. For macOS, launch the exact Chrome binary yourself with only `--remote-debugging-port` and a temporary `--user-data-dir`, then `connectOverCDP(..., { noDefaults: true })`. For iOS, state the attached-client gap as a recorded limit.

### 12. [warning] Item 8 removes the only automated browser coverage of Plite's Android input path
**Location**: synthesis item 8; `apps/plite/playwright.config.ts:56-65`; `packages/plitejs/src/dom/utils/environment.ts:83-90,116`
**Finding**: The Pixel 5 descriptor's user agent contains "Android", so Plite resolves `platform: 'android'` and runs the Android input manager and its quirks in the emulated `mobile` project. That project's roughly 317 passing rows are the only browser-level regression coverage of `android-input-manager.ts` that runs at scale. "Narrow to viewport cases" deletes it, and the replacement is six hand-run device cases.
**Evidence**: The emulated rows do over-claim (G03, shard 004). The fix for over-claiming is a scope label, not deletion. AGENTS.md cuts tests only when they duplicate others or carry less signal, and nothing else covers this code path.
**Suggestion**: Keep the rows, relabeled as `android-code-path (desktop Blink events)` in the transport claim. Move only raw-input claims to the device lane, and list any rows actually deleted with a reason for each.

### 13. [warning] The phase order puts the cheapest open gate last
**Location**: synthesis Phases (item 7 in phase 3)
**Finding**: #5137's paint row (G01) is the cheapest gate to close (shard 003, Judgment), and its PR is waiting. Item 7 needs only the `keydown` trace extension and the caret classifier. It needs no device lane, no schema 2 and no Android work, yet it is scheduled after all of phase 2.
**Suggestion**: Move item 7 and the `keydown` trace extension into phase 1, next to item 5, and give it its own keep criterion: the #5137 five-run receipt.

### 14. [warning] The no-UiAutomation invariant contradicts `tapNative`, the strip case and cache-miss calibration
**Location**: synthesis item 1 ("never dumped during a measured run because the dump attaches UiAutomation") versus `device.tapNative(label)` (sketch: "uiautomator dump ... Setup, calibration and tapNative only"); item 3's suggestion-strip case; sketch `openDeviceSession` ("layout = cache hit on fingerprint or calibrate"); notes P5
**Finding**:
- `tapNative` dumps during a measured run.
- The strip case needs runtime candidate positions, either from a dump or from screenshots, which the design rejects as not repeatable.
- A cache miss calibrates inside the worker, so measured runs follow a UiAutomation session in the same Chrome process. If P5 holds and Chrome's renderer accessibility mode turns on, it stays on for those runs.
**Suggestion**: Calibrate only in `plate-device setup`, and have a worker fail closed on a cache miss. Force-stop Chrome after any dump. Record each dump as a step that disqualifies the run from receipt scope, or prove P5 false before allowing it.

### 15. [warning] Physical-phone runs record personal data and drive the owner's daily Chrome
**Location**: synthesis item 1 (stock Chrome over CDP, per-run video); sketch `android.record`, `attachChrome`, `RawMobileRun.video`
**Finding**: `screenrecord` and `screencap` on a personal phone capture notification banners: messages, OTP codes and senders. They land in receipts as digested artifacts. `connectOverCDP` attaches to the owner's real Chrome profile with its tabs, cookies and sessions, and the P2 fallback `am start -d <url>` can take over the owner's current tab. The restore token covers rotation and animation scales, not Do Not Disturb or Chrome state.
**Suggestion**: Turn on Do Not Disturb in preflight (`cmd notification set_dnd priority`), record the original value and restore it. Create and own one tab. Refuse a physical run when it can only reuse an existing tab. State that receipts and videos stay local, consistent with AGENTS.md's ban on committing run artifacts.

### 16. [warning] A receipt names the runner's commit, not the bytes the phone loaded
**Location**: sketch `RawMobileReceipt.build` ("Written only from a clean tree"); reporter `onEnd` ("a clean tree at HEAD")
**Finding**: `build.commit` comes from the runner's checkout. The phone loads whatever answers on the reversed port. For www, that is `next dev` with `reuseExistingServer: true`, possibly from another checkout or session. A clean tree at reporter time says nothing about the served source. Verify's law preserves serving-source identity.
**Suggestion**: Read a build identity from the page over CDP (an injected commit or build id) and record it per run. The validator then requires it to equal `build.commit`.

### 17. [warning] Item 6's installer leaves timing, bundle size and benchmark honesty unspecified
**Location**: synthesis item 6; `packages/plitejs/src/react/editable/runtime-browser-handle-events.ts:8,42-74`; `runtime-event-engine.ts:193-206`
**Finding**:
- Bytes. `useRuntimeBrowserHandle` statically imports `attachPliteBrowserHandle`. A runtime flag leaves all of `browser-handle.ts` in every bundle. Shard 007's saving of about 3 KB gzip appears only if the dependency inverts: the hook reads a registered function, and `browser-handle.ts` moves behind `plitejs/testing`. The synthesis does not say this.
- Timing. The hook attaches only inside a layout effect keyed on 12 dependencies. An installer that runs after the first `Editable` mounts, for example from a parent effect, which runs after child layout effects, never attaches to that editor. The ready gate then times out. The design must require a client module side effect that runs before mount, or make the hook subscribe.
- Benchmarks. Seven non-test consumers read the handle, including `benchmarks/editor/benchmarks/plite-external-text-entry.mjs`, `packages/plitejs/benchmarks/react-text-flow-browser-matrix.mjs` and `apps/www/scripts/run-homepage-input-perf.mts`. Those pages will install it and pay the 200-entry trace ring, with its O(200) `splice(0, 1)` per event, which production no longer pays. Benchmark numbers then stop representing production.
**Suggestion**: Specify the inversion and the install-before-mount rule. Add a www handle-presence check like `plite-examples.spec.ts:45-58`. Separate "handle installed" from "trace retention on", so perf lanes can read the handle without the buffer, or record which mode they measured.

### 18. [warning] The scenario matrix collides with the Tests rule and double-counts rows
**Location**: synthesis item 2 ("keep 7, merge 6, split `composition-ime` into three, drop the two swipe rows, and add rows for marks, suggestion taps, autocorrect, triggers and pending input"); `RAW_MOBILE_SCENARIOS`; `tooling/plite/donor/proof/mobile-device-scenarios.json`
**Finding**:
- Shard 005 splits `composition-ime` into S1, S6 and S7. "Add rows for ... triggers and pending input" adds S6 and S7 a second time.
- `tap` stays as a row, although shard 005 calls it "the precondition for every case". That is not a named defect, and the AGENTS.md Tests rule bans tests without one.
- The new rows are Android pain (Gboard strip, Slate's Android manager), yet `RAW_MOBILE_SCENARIOS` is shared, so the physical-only `ok` demands an iOS Safari receipt for a Gboard suggestion-strip scenario.
- `mobile-device-scenarios.json` is an orphan second copy of the 16 rows. `git grep` finds no code reader, and the design does not mention it.
**Suggestion**: Make each scenario a data row with `platforms`, `requires` and the named defect or issue it guards. Delete the JSON in the same wave. Consider deriving the gate's required set from the open device gates (D20, G02, G03 and others) rather than from a fixed matrix.

### 19. [warning] The public entry and bin ship before the probes that decide its shape
**Location**: synthesis item 1 (`@platejs/test/device`, `plate-device` bin); notes P1-P5
**Finding**: `@platejs/test` is published (`54.0.0-beta.0`), and public docs teach it. The design adds a public entry and a bin whose layout source (P1), tab model (P2), overlay calibration (P3), latency (P4) and fidelity premise (P5) are all unprobed. AGENTS.md routes any reusable public API through Best API's doctrine repair. That cost recurs every time a probe changes the shape.
**Suggestion**: Build the lane unexported under `packages/test/src/device`, driven from `apps/plite`, and promote it to a public entry only after phase 2's keep decision.

### 20. [warning] macOS key injection is time-of-check versus time-of-use
**Location**: synthesis item 7 ("checks it is frontmost before every key, and posts keys with CGEvent")
**Finding**: A frontmost check followed by `CGEventPost(kCGHIDEventTap, ...)` races: HID posts go to whichever app is frontmost at delivery. A notification or a click between the check and the post sends keys to another app. The page witness never sees keys that went elsewhere, so the run fails late or not at all.
**Suggestion**: Probe `CGEventPostToPid` first. In either mode, require one trusted page `keydown` per posted key before posting the next, and abort on a miss.

### 21. [warning] The iOS phase cannot reach the physical-only gate, and it reintroduces the dependency candidate-1 avoided
**Location**: synthesis item 10
**Finding**:
- `connectHardwareKeyboard: false` is a simulator capability, so iOS receipts come out `kind: 'simulator'` and can never satisfy `ok`. Physical iOS needs WDA code signing with an Apple developer team, and Open risks does not list it.
- Appium is installed only in the owner's `~/.appium`, outside the lockfile, so other contributors cannot reproduce the lane.
- The judge scored candidate-1's cost at 3 for having "no Appium server and no daemon". That score does not survive the graft.
**Suggestion**: List physical iOS signing and the host-local Appium install as phase-3 entry conditions, and re-score the cost.

### 22. [warning] No doctrine or teaching repair is planned
**Location**: synthesis (none listed)
**Finding**: Schema 2 drops Appium and adds an emulator claim class. Several sources state the old promise and none is scheduled for repair:
- `.agents/rules/verify/references/commands.md:199` ("requires actual Appium Android/iOS artifacts")
- `editor-proof.md:91-96`
- `verify.mdc:261-262,315`
- `docs/vision/common.md:84`
- `packages/test/README.md:48`
- `packages/platejs/test/public-package-import-smoke.slow.ts:169-185`
- `packages/test/test/proof/{proof,package-scripts}.test.ts`
- `mobile-device-proof.mjs:105-129`, whose scoped branch calls `classifyBrowserMobileTransportProof('agent-browser-ios' | 'appium-*')`, ids the design deletes.
AGENTS.md requires searching for the old promise when an operation changes what it promises.
**Suggestion**: Add one migration item that names these callers and adds an `emulator` row to verify's claim-width table.

### 23. [nit] The bypass test needs the back channel the API removes, and its location is unspecified
**Location**: synthesis item 3 ("the witness must fail an `adb shell input text` step and a CDP `Input.insertText` step")
**Finding**: `DeviceEditor` has no `page`, and the `page` fixture throws, so the test needs privileged access to adb text input and CDP. If that access lives on the public fixture, any case can misuse it.
**Suggestion**: Put the bypass test inside `packages/test`, importing the internal `android` module and session directly.

### 24. [nit] `bootId` proves no reboot happened, not that the runs were warm
**Location**: synthesis item 1 ("`bootId` proves the runs were warm")
**Suggestion**: Use the Chrome pid and CDP target id, per finding 4.

### 25. [nit] The synthesis and the sketch disagree on names
**Location**: synthesis item 1 versus sketch
**Finding**: The synthesis requires "the `touchstart` must land in the target rect", but the trace extension adds only `pointerdown` (sketch `BrowserNativeEventTraceTypeAdded`). The synthesis failure list has `bypass-detected`, while the sketch has `unattributed-input`, `keyboard-layout-stale`, `device-preflight` and `native-target-missing`. "One bundle file per platform" also conflicts with the gate's single `test-results/release-proof/mobile-device-proof.json` (`mobile-device-proof.mjs:12-16`) unless the design specifies a merge.

### 26. [nit] Drags through separate `adb shell input motionevent` calls have uncontrolled timing
**Location**: sketch `android.touch` ("input motionevent DOWN/MOVE/UP")
**Finding**: Each call is its own adb shell and JVM start, which the rationale guesses at 100 to 300 ms. DOWN to MOVE to UP spacing is therefore whatever the host scheduler gives, and there are no intermediate moves. Handle drags and autoscroll rows will not replay a human gesture.
**Suggestion**: Probe one `adb shell` session that runs the whole gesture script before second-slice cases depend on it.
