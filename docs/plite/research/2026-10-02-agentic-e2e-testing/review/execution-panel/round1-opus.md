## Findings

### 1. [critical] The native IME spec breaks `pnpm test`, so `pnpm check` fails on every machine
**Location**: `apps/www/tests/native/homepage-ime-native.spec.ts:36` (`const state = readNativeImeState()` at module scope); `tooling/config/test-suites.mjs:13-41`
**Finding**: `TEST_FILE_PATTERNS` includes `apps/**/*.spec.{ts,tsx}`. `TEST_IGNORE_PATTERNS` excludes only `**/tests/browser/**` and `**/tests/plite-browser/**`, not `**/tests/native/**`. The fast bun suite therefore picks up the Playwright IME spec.
**Evidence**: I replayed the fast-suite glob with the repo's own patterns and ignores, and it returns `apps/www/tests/native/homepage-ime-native.spec.ts`. Running `bun test` on that file gives `ENOENT ... test-results/native-ime/state.json at native-ime-state.ts:18`, with 0 pass and 1 fail (the repo tree was unchanged afterwards). `pnpm check` runs `pnpm test:all`, which runs `pnpm test`, which runs this suite. The lane is meant to be local-only, yet it now breaks the local gate that contributors are supposed to run. The same module-scope read also breaks `playwright test --list` for the IME config, because `--list` skips globalSetup.
**Suggestion**: Add `**/tests/native/**` to `TEST_IGNORE_PATTERNS`, or rename the file off `.spec.ts` the way the device lane uses `.device.ts`. Move `readNativeImeState()` into `beforeAll`.

### 2. [critical] `android.mjs restore` force-stops Chrome when the owned tab is already gone
**Location**: `tooling/device/android.mjs` `closeOwnedTargets`, the `catch` around `Target.closeTarget` (about lines 45-56)
**Finding**: Any error at all leads to `am force-stop com.android.chrome`. That includes CDP's "No target with given id found" for a stale `targetId`.
**Evidence**: `ownedTargets` goes stale in ordinary cases:
- `closeRun` closes the tab, and the run is then interrupted before `releaseRunResources` rewrites the restore file (a second Ctrl-C).
- The phone reboots or Chrome restarts and the user reopens it.
- The user closes the tab by hand.

In each case `restore`, which is the documented recovery for every stale lock, kills the user's whole Chrome session. On a physical phone that is not "leave the device as found". A kill by package name is also the kind of collateral kill the "nothing kills processes by pattern" invariant is meant to exclude.
**Suggestion**: Read `Target.getTargets` first and close only the ids that still exist. Treat "no such target" as success. Force-stop only after an explicit DevTools timeout, and only if the owned target is confirmed alive and unresponsive, or not at all.

### 3. [critical] Setup that fails halfway leaves the device either unrestorable or silently changed
**Location**: `packages/test/src/device/android.ts` `flipSettings` (~404-429), `setupLockedDevice` (~684-727), `addKorean` (~436-461), `restoreDevice` (~773-815)
**Finding**: The restore record and the mutations are not atomic, in both directions.
- **Under-recorded:** `flipSettings` collects `changed` locally, and `recordRestore({ changedSettings })` runs only after the whole loop returns. If one setting is missing (the `throw` at "not on its settings screen", for example a row below the fold in a single uiautomator dump), the toggles already tapped are never recorded. `restore` then reports success and leaves them flipped.
- **Over-recorded:** `addKorean` records `addedLanguages: ['ko']` before it taps "Add keyboard". If any later `clickText` fails, `restoreDevice` calls `removeKorean`, which throws "could not find 한국어, 두벌식". Restore then aborts before it restores the subtype or DND (`zen_mode`) and before it deletes `restore.json`. Every retry fails the same way, so on a physical phone DND stays on.
- **Doctor passes anyway:** `doctorDevice` treats any existing `restore.json` as "setup recorded", so it can pass on this half-set-up device.

There is also a stale-coordinate risk: `flipSettings` taps every title using positions from one dump taken before the first tap. If a toggle reflows the screen, later taps land on the wrong row.
**Suggestion**:
- Record each setting immediately before its tap.
- Record `ko` only after the language list confirms it was added.
- Make each restore step idempotent: check presence before removing, and keep going past one failed step while recording which steps remain.
- Re-dump after each toggle.

### 4. [critical] A known product failure is invisible with the device lane's configured reporter
**Location**: `apps/plite/playwright.device.config.ts:28` (`reporter: 'list'`); `lane.ts` `productAssertion` (~598-621); `bypass.device.ts` `witness-limit` annotation
**Finding**: `productAssertion` makes failures visible only through `testInfo.annotations`. Playwright 1.61's `TerminalReporter`, which is the base of the list reporter, never reads annotations: I found no `annotations` reference anywhere in it. No JSON or HTML reporter is configured, and the witness attachment does not include annotations.
**Evidence**: A run in which both Korean assertions and the autocorrect assertion hit their known failures prints only passing tests, five times over. That breaks "a known product failure stays visible", and it is the green-proxy pattern AGENTS.md forbids.
**Suggestion**: Add a `json` reporter (or `html`, with `open: 'never'`) to the device config, or print each known failure to stderr when it is recorded. Better still, write the known failures into the `device-witness.json` attachment.

### 5. [warning] `productAssertion({ expected: 'fail' })` accepts any failure, so a worse regression stays green
**Location**: `lane.ts` `productAssertion`; `autocorrect-empty.device.ts`; `korean-placeholder.device.ts`
**Finding**: Any thrown error counts as the known failure. The issue draft pins the observed failure as `BecuasegoBecause `. If Plite instead drops every keystroke, `modelText` is `''`, the poll fails, and the result is recorded as "known". The follow-up checks then pass on the empty editor: `renderedBlockText(0, typed)`, a collapsed caret and a shown keyboard all hold.
**Evidence**: "Fails if the failure stops reproducing" only covers the case where the failure turns into the pass value. It does not catch the failure changing shape. A timeout, a lane error such as "Nothing visible", or a broken editor all hide behind the known failure.
**Suggestion**: Require the observed failure in the options, either as a value or a predicate (for example `observed: 'BecuasegoBecause '`), and fail when the actual result differs from both the expected and the observed value. Make `issue` required when `expected: 'fail'` by using a discriminated union.

### 6. [warning] The snapshot witness accepts replay classes that the doc neither catches nor documents as its limit
**Location**: `packages/test/src/device/witness.ts` lines ~37, 97, 109-130
**Finding**: Four gaps in the reviewed snapshot:
- **Keys not tied to steps:** `wrong-key` checks only membership in `{Backspace, Enter, Unidentified}`, not the key the step tapped. Content steps may contain keydowns too. `adb shell input keyevent KEYCODE_ENTER`, or `KEYCODE_DEL` inside any letter-tap or toolbar-tap window, produces a trusted `Enter` keydown plus a paired `insertParagraph`, and passes. That replay class is neither in the fixtures nor named as a limit. Only the Unidentified CDP replay is documented.
- **Unpaired `input`:** `input` events are never paired with a `beforeinput`. The `execCommand('insertText')` path delivers a trusted `input` with no `beforeinput` and passes inside any window.
- **Vacuous pass:** key steps need no events at all. If the trace is lost (root remounted, locator resolving to a fresh element), the witness gets zero events and passes. Only content steps fail closed, through `missing-pointer`.
- **Unchecked exemption:** an untrusted `compositionend` is exempt with no check on its `data`.

**Evidence**: The fixture matrix rejects only `KEYCODE_A`, which `wrong-key` catches. Note that `witness.ts` on disk changed at 23:21, after this package was built, and appears to add per-step keys and `input` pairing. Against that on-disk version the snapshot fixture test fails 5 of 16 cases, because the fixture steps have no `key`. The snapshot itself passes 16/16 in my scratch copy.
**Suggestion**:
- Keep the per-step expected key and the `input` pairing, and re-record the fixtures.
- Require at least one `keydown` per key step and at least one `beforeinput` per strip step.
- Exempt an untrusted `compositionend` only when its `data` matches the last trusted `compositionupdate`.

### 7. [warning] Cases can still reach a CDP connection, including an unguarded one
**Location**: `lane.ts` `test` export (~761), `refusal` fixtures (~690-753); `global-setup.ts` `devtoolsPort = 9500 + index` (~98); `apps/plite/tests/device/lane.types.ts`
**Finding**: Three paths stay open:
- **Unrefused fixture:** only `page`, `context` and `browser` are refused. Playwright's built-in `playwright` worker fixture is still typed and available. `async ({ device, playwright }) => playwright.chromium.connectOverCDP(...)` type-checks.
- **Unguarded raw port:** the upstream `adb forward` sits on a fixed host port (9500 + index) that any process can connect to. The guard covers only connections made through the guard.
- **Hiding is type-only:** the `as unknown as TestType<…>` cast hides `deviceConnection` from types alone. No lint rule stops a `*.device.ts` file from importing `chromium` or `node:child_process` (the bypass test does exactly that).

**Evidence**: `witness.ts` says "the guarded DevTools connection is what blocks it". The block therefore depends on convention, not structure.
**Suggestion**:
- Refuse `playwright` (and `request`) the same way, and extend `lane.types.ts` to cover them.
- Add an oxlint `no-restricted-imports` override for `apps/plite/tests/device/*.device.ts` that bans `node:child_process`, value imports from `@playwright/test` and `packages/test/src/device/*` internals, with an exact-file exception for `bypass.device.ts`.
- Use an unguessable upstream: `adb forward tcp:0 …` returns the allocated port.

### 8. [warning] Fixed host ports collide across sessions and can attach a lane to another session's browser
**Location**: device `global-setup.ts` (`9500 + index`), `tooling/device/android.mjs` (`9599`), `record-witness-fixtures.mjs` (`9590`), `tooling/ime/native-chrome.mjs` `waitForEndpoint(port)`
**Finding**: `adb forward` without `--no-rebind` silently repoints a host port that another session already owns. Two runs on different phones both use 9500, because the index is per run, and the per-serial lock explicitly allows concurrent runs on different serials. After the second run rebinds the port, the first run's guard relays new worker connections to the second phone's Chrome. The first run's teardown then removes the forward the second run is using.
For the IME lane, `native-chrome.mjs` never checks that the DevTools endpoint on 9412 belongs to the Chrome it spawned. If the port is taken, the new Chrome starts without DevTools and the lane drives whichever browser holds the port.
**Suggestion**: Use `adb forward tcp:0` and record the port it returns. Launch Chrome with `--remote-debugging-port=0` and read `DevToolsActivePort` from its own profile directory.

### 9. [warning] Lock discipline is advisory: `restore` ignores live locks in both lanes, and the IME lock is not held for the run
**Location**: `android.ts` `acquireSerialLock`/`releaseSerialLock` (~127-142), `restoreDevice`; `tooling/ime/macos-ime.swift` `restore` case (~153); `homepage-ime-native.spec.ts` per-test `finally { restoreInputSource() }`; `apps/www/tests/native/global-setup.ts:33`
**Finding**: Four defects:
- **Non-atomic acquire:** `acquireSerialLock` reads and then writes; it should create the file exclusively (`wx`).
- **Unchecked release:** `releaseSerialLock` and `restoreDevice` delete the lock without checking the owner. `android.mjs restore` run during a live run reverts Gboard settings, removes Korean, closes the live run's tab (or force-stops Chrome), removes its forwards and deletes its lock.
- **IME restore ignores ownership:** Swift `restore` deletes `lock.json` and restores whichever restore file exists, with no `--owner` check.
- **IME lock is per test:** the spec calls `restore` at the end of every test, so the "host lock" exists only inside a test. A second session passes its globalSetup check between tests and selects Pinyin. The first session's next test is then refused, and that test's `finally` restores the other session's input source and deletes its lock.

**Suggestion**:
- Make `restore` acquire the lock, taking over only a dead owner.
- Give the Swift `restore` an `--owner` check.
- Take the IME lock in globalSetup and release it in teardown. Each test should only reselect the source and return to the original source; it should not delete the lock.

### 10. [warning] `android.ts` is a new file of about 1,040 lines that mixes six concerns, constrained by a single-file rule that is not actually required
**Location**: `packages/test/src/device/android.ts` (header comment: "no relative imports")
**Finding**: One file holds adb primitives, the lock, the restore-state file, Gboard settings UI automation, keyboard calibration, the CLI commands, and a hand-rolled RFC 6455 server with frame parser (`encodeFrame`/`relayClient`, about 150 lines). The guarded relay has nothing to do with Android. Node 22's type stripping does support relative imports when they carry an explicit `.ts` extension, and `allowImportingTsExtensions` is already on in the www base tsconfig.
**Evidence**: The relay calls `JSON.parse` inside the socket `data` handler. A malformed client frame throws an uncaught exception in the Playwright runner process, which also hosts globalSetup. That crashes the run and skips teardown.
**Suggestion**: Split the file into `adb.ts`, `gboard-setup.ts`, `restore-state.ts` and `cdp-guard.ts`, imported with `.ts` extensions. Put the relay on `ws` (`WebSocketServer` plus a client), which is already in the dependency graph, as a direct devDependency. Wrap the JSON parse and refuse malformed frames. An allowlist of CDP domains would also cover `Target.exposeDevToolsProtocol`, which tunnels CDP from page script around this relay.

### 11. [warning] The fixture recorder reimplements the lane, so the witness unit test validates windows the lane never produces
**Location**: `tooling/device/record-witness-fixtures.mjs` (~88-160)
**Finding**: The recorder re-copies `findOwnedPage` (the 50-attempt loop), calibration (ignoring `visualViewport.scale`) and gesture windows (`settle`: 500 ms quiet, no 4 s deadline, `seqStart` read before `act`). The lane's `gesture` uses a 400 ms quiet period and a 4 s deadline.
**Evidence**: `device-witness.test.ts` asserts "accepts real soft-keyboard typing" against windows built by this other algorithm. It does not show that the lane's own windows accept real typing.
**Suggestion**: `createDeviceLane({ page, state })` accepts any page. Build it over the recorder's unguarded page and record through `lane.keyboard.tap`/`lane.steps()`/`lane.trace()`, as `bypass.device.ts` already does. Import `findOwnedPage` instead of copying it.

### 12. [warning] Setup originals and per-run resources share one restore file, so every interrupted run costs a full setup undo and redo
**Location**: `android.ts` `recordRestore`/`releaseRunResources`/`doctorDevice`
**Finding**: A stale lock tells the user to run `restore`. `restore` removes Korean, reverts the Gboard settings and DND, and deletes the state. The user then has to run setup again, and possibly calibrate again if the Korean subtype id changes. Separately, `calibrateKeyboard` and the recorder create `restore.json` as a side effect of `reversePort`. That is part of why "restore exists" is an unreliable "setup recorded" signal in finding 3.
**Suggestion**: Split the state into `setup.json` (originals, undone only by `restore`) and per-run files keyed by owner pid (forwards, reverses, targets). A cheap `release <serial>` then reclaims a dead owner's run resources and lock without undoing setup.

### 13. [warning] `servingFingerprint` ignores the content of untracked files
**Location**: `tooling/scripts/serving-fingerprint.mjs:17`
**Finding**: `git ls-files --others --exclude-standard` returns file names only. Editing an untracked file does not change `dirtyFingerprint`.
**Evidence**: This task's core files are untracked (`providers.tsx`, which installs the handle, plus `android.ts`, `lane.ts` and `witness.ts`). That contradicts the comment "names exactly what it exercised". The www server identity is also recorded in `run.json` but never compared with anything, so a mention case served from another checkout passes.
**Suggestion**: Hash each untracked file's contents (for example with `git hash-object` per path) and use `git diff HEAD --binary`. Fail the www lane on an identity mismatch, as the Plite build fingerprint already does.

### 14. [warning] "Production `plitejs/react` carries no handle" has no automated gate, and the only check is permanently red
**Location**: `tooling/scripts/measure-browser-handle.mjs`; `packages/plitejs/test/react/vitest-setup.ts`; `kernel-authority-audit-contract.ts`
**Finding**: The measure script is wired into no check. It also always exits 1, because the Plate surface still carries the handle (deviation row, `owner: zbeyens`), so a Plite regression is lost in a failure everyone already expects. `vitest-setup.ts` installs the handle for every plitejs React test, so the default path (`kernelTraceRetention = false`, no attach) is never exercised. The new authority inventories count `registerBrowserHandle(` and `enableKernelTraceRetention(` calls by source text. They would not catch a static `import { attachPliteBrowserHandle }` reappearing in the runtime path, which is the regression that actually puts the handle back in bundles. AGENTS.md also bans tests of source text.
**Suggestion**: Wire the `plite` half into `check:plite`, either as a flag that runs only that surface or by marking Plate as known-open, so it fails only on a Plite regression. Install the handle in only the trace-contract test files rather than globally.

### 15. [warning] "Detects an identical-text paste after the kernel trace fills" passes even with the old defect
**Location**: `apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts` (~479); `dom-text-actions.ts` `didPasteApplyText`
**Finding**: The selection fallback returns true on its own: the selection was expanded before, it changes when the paste collapses it, and `beforeSelectedText` includes the pasted text. With the pre-change `afterTrace.slice(beforeTraceLength)` empty at the cap, or with the trace check removed entirely, the test still passes.
**Evidence**: I traced it by hand. Selecting `[0,0]` offsets 0 to 4 and pasting the same four characters collapses the caret to offset 4, so `selectionsEqual` is false and the fallback fires. The test cannot fail for its named defect.
**Suggestion**: Delete the test, or rebuild it so the paste leaves the selection snapshot unchanged. The two whole-trace reads already cover the cleared-trace contract.

### 16. [nit] The witness unit test is a matrix with repeated failure modes
**Location**: `packages/test/test/node/device-witness.test.ts:45-71`
**Finding**: Six `*-outside` rows all exercise the same `!step` branch, and three rows exercise `wrong-key`. The "equivalent" test fails only if the witness gets better, which is not a defect.
**Suggestion**: Keep one row per rule and drop the equivalent case. `real-typing` already pins the accept path.

### 17. [nit] A normal run does not leave the keyboard as it found it
**Location**: device `global-setup.ts` `closeRun`
**Finding**: Cases switch Gboard to Korean and teardown never switches back. Only `calibrateKeyboard` returns to `en`. Separately, `listSerials()` enrolls every attached device, so a phone plugged in only to charge makes doctor fail the whole run.
**Suggestion**: Call `switchKeyboardLanguage(serial, 'en')` in `closeRun`. Require `PLATE_DEVICE_SERIALS`, or skip devices with no setup recorded.

### 18. [nit] `tapStrip` matches letter keys on a Korean keyboard
**Location**: `lane.ts` `tapStrip` (~626-630)
**Finding**: Korean key labels have more than one character, so `letterTop` is `Math.min()` over nothing, which is `Infinity`, and every key counts as a strip node.
**Suggestion**: Throw when no letter row is found.

### 19. [nit] Minor coupling and dead options
**Finding**: Four small items:
- Device `global-setup.ts` imports `playwright.device.config.ts` only to read the port. That re-runs `adb devices` and the argv assertions.
- The `'handle'` clipboard transport is configured on no project.
- `seq` JSDoc says "never resets", but every `startBrowserNativeEventTrace` resets it.
- `check:plite:dev` plans nothing for `apps/plite/tests/device/*` edits, so `lane.types.ts` runs only under the full `pnpm typecheck`.
