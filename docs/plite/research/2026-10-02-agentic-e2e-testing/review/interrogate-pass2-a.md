# Reviewer A, second pass: revised local proof-lane plan

Scope: `docs/plans/2026-10-02-proof-device-lane.md`, `docs/plans/topics/proof.md`, shards 001-009, the three first-pass reviews, and the repository read-only at the current `next` checkout. Line numbers are from the current files.

## First-pass criticals: resolution status

| First-pass critical | Status | Note |
| --- | --- | --- |
| Release gate cannot consume local receipts (A1, B1, C1) | Resolved | Schema 2, the reporter and the gate work are cut. Phase 3 holds the trust decision. |
| Witness accepts CDP composition and CDP key events; the bypass test checks neither (A2) | Partial | Bypass rows were added. The fixtures do not exist, and the test design cannot exercise the signature check. See finding 4. |
| `updateCount` contradicts real Gboard (A3) | Moot | Schema 2 is cut and schema 1 is untouched. |
| Reporter mints a receipt from a flaky case (A4) | Mostly resolved | The reporter is cut. Residual: nothing forbids `--retries=N` on the device config. `apps/plite/scripts/plite-browser-runner.mjs:69-81` already has `assertRetryFreeBrowserArgs`, and the device lane should go through it. |
| 100-entry ring buffer breaks correlation and the audit (A5, B3, C2) | Partial | `seq` was added. The step contradicts itself, and its proof cannot fail for this defect. See finding 7. |
| Strip taps and `tapNative` break the no-UiAutomation rule (B2) | Partial | `tapNative` is gone. `tapStrip(slot)` has no proven data source and no calibration step. See finding 8. |
| Audit rejects the first cases (C3) | Resolved in the rule text | The touch-carried commit and the strip signature are both specified. The strip signature is never calibrated (finding 8). |
| `repeatEach` makes a new worker per repeat (C4) | Mostly resolved | Each serial gets its own project, with a pid and target witness. Residual: per-project `workers` is not set. See finding 11. |

The first pass's own count is slightly off. The challenge delta (plan :278-279) says "every critical one raised by at least two reviewers". A3 (`updateCount`) came from one reviewer only. See finding 17.

## Findings

### 1. [critical] Deleting the `'browser-handle'` preference branches inverts the step's own goal, and its premise contradicts a pinned contract
**Location**: plan :155-159 (Phase 1, "Delete the `'browser-handle'` selection preference branches"); `packages/plitejs/src/react/editable/selection-controller.ts:631-636, 683-712`; `input-router.ts:1424-1434`; `browser-handle.ts:764-825`; `packages/plitejs/test/react/selection-controller-contract.ts:1995-2023, 2055+`
**Finding**: In today's code, the `'browser-handle'` reason makes text input more native than other model-owned reasons, not less:
- `setEditableModelSelectionPreference` resets `modelOwnedTextInputGuard` to 0 for `'browser-handle'` (`:631-636`). `'model-command'` gets no reset.
- At the deferred native repair, `input-router.ts:1424-1434` computes `browserHandleDOMInput`, and that branch keeps a native DOM insert native after a handle selection. Without it, `modelOwnsTextInput` becomes true and `restoreOwnedDOMText` reverts the native insert.
- A contract test pins this intent: "browser-handle text input can keep the native fast path" (`selection-controller-contract.ts:1995`).

If the branches are deleted, `selectRange` still passes `preferModelSelection: true` (`browser-handle.ts:770-775`), and the reason infers to `'model-command'` (`selection-controller.ts:674-676`). Under that reason, `isEditableModelSelectionPreferredForInput` still returns true for `insertText` (`:704-711`). The guard is no longer cleared, and the input-router exemption is gone. The literal instruction therefore makes typing after a handle selection more model-owned, which is the opposite of the stated outcome.

The alternative, `preferModelSelection: false`, turns off `selectRange`'s own microtask and timeout DOM export, because `syncDOMSelection` returns early unless the model selection is preferred (`browser-handle.ts:785`). Viewport-backed selections then lose their export retries.

Shard 007 marks the leak as "inferred from source and was not run" (`007:96`) and proposes a cheap probe first. The plan skips the probe. The Tests rule requires the regression test to fail before the fix.
**Evidence**: The code paths cited above, and the contract test name. Shard 007's own recommendation 4 would route through `'programmatic-export'` or `'model-command'`, and both keep `insertText` model-preferred, so the shard and the plan disagree about the target behavior.
**Suggestion**: First, write the plan's proof test: select through the handle, type with `page.keyboard.type`, and assert `native` in the kernel trace. Run it on current code. If it passes, delete this step. If it fails, define the target state explicitly: after the handle's DOM export lands, the reason becomes `'native-selection'` with `preferModelSelection: false`, and `selectRange` keeps its own export retries under a local flag. Then update the pinned contract tests (`:1561-1582, :1927, :1995, :2055`) in place instead of adding a parallel test.

### 2. [critical] `{ transport: 'handle' }` is opted into per call site, but the need varies per engine, so the easy migration brings the silent stand-in back on Chromium
**Location**: plan :64-67, :148-154; topic :31-42; `packages/test/src/playwright/harness-input.ts:114-202`; `clipboard.ts:143-163`; `apps/plite/tests/plite-browser/donor/examples/inlines.test.ts:621-629`
**Finding**: Off Chromium, `navigator.clipboard.writeText` in `evaluate` throws, so every Firefox and WebKit `pasteText` or `pasteHtml` call goes through the handle silently today (`harness-input.ts:126-131, :173-178`). `verify.mdc:274-276` confirms that only Chromium exposes clipboard permissions. The call sites have no engine gate. `inlines.test.ts:621-629` runs on the chromium, firefox, mobile and webkit projects. About 84 call sites exist across `apps/plite`, `apps/www` and `harness-scenario.ts:718-723`.

Once the fallbacks are deleted, every one of those calls fails off Chromium. A caller then has two options:
- Branch on the engine at every call site, which is spaghetti.
- Add `{ transport: 'handle' }` unconditionally. Chromium then also skips native paste, so "a broken native paste can pass", the defect this step exists to remove, comes back on the one engine that could prove it.

The option also misnames two of the three deleted paths. `pasteHtml`'s WebKit or mobile route and its no-change route dispatch a synthetic `ClipboardEvent` (`pastePayloadThroughEvent`, `:168-170, :200`), not a handle write. The first pass flagged this (A14, B4) and it is unresolved.

"Record that step's transport claim with the existing `BrowserTransportClaim`" also has no sink. Claims exist only on scenario metadata, through `normalizeScenarioMetadata` (`harness-scenario.ts:813`). A bare harness paste records nothing, and nothing reads a per-step claim.

Deleting the fallback also turns `didPasteApplyText`, which runs after a fixed `waitForTimeout(50)` (`:133, :181`), into the hard pass/fail oracle. A paste slower than 50 ms becomes a flaky failure, where today it is a silent double path.
**Evidence**: Code above. The harness already has honest verbs: `pasteNativeText` (`:106-112`) and `pasteEventPayload` (`:99-105`).
**Suggestion**: Delete the fallbacks and the option. Make the engine decision once, where the project is known: for example, a project-level `use: { clipboardTransport }` that the harness reads. On Firefox and WebKit, route to the existing explicit `pasteEventPayload` or to a named handle verb, and record the claim in the run's attachments. Replace the fixed 50 ms wait with a poll until the model changes or a timeout.

### 3. [warning] The Pixel 5 relabel has no mechanism, touches a public union, and its proof cannot fail
**Location**: plan :59-63, :233-235; `tooling/plite/donor/proof/mobile-device-proof.mjs:105-145`; `packages/test/src/playwright/scenario-replay.ts:1124-1152`; `types.ts:733-745`; `index.ts:204`
**Finding**: The "Pixel 5 project's transport claim" is not stored anywhere. Claims come from per-scenario metadata through substring sniffing. With `platform === 'mobile'` they default to `'playwright-mobile-viewport'` or `'playwright-mobile-keyboard'`. Only a few specs pass `platform: testInfo.project.name` (for example `editable-voids.test.ts:342`), so most of the roughly 317 mobile rows carry no claim at all.

The named proof is "the claim check in `mobile-device-proof.mjs`'s scoped branch passes with the new label". That branch only classifies the fixed ids `'agent-browser-ios'`, `'appium-android'` and `'appium-ios'`, and validates an empty bundle. It never reads a project, a label or a scenario claim. It passes whether or not the relabel happens. A new label also means a new member in the exported `BrowserTransportClaim` union, a public `@platejs/test/playwright` change, and the plan does not list it.
**Suggestion**: State the mechanism, for example a new claim member returned by the classifier's mobile branch. Name the public type change. Make the proof something that fails without the change, for example a `scenario.test.ts` case asserting that a `platform: 'mobile'` scenario normalizes to the new claim, if no existing test already covers the classifier. Otherwise drop the step and keep the label in prose.

### 4. [warning] The witness bypass proof has no fixtures, comes before the step that would record them, and cannot exercise the signature check
**Location**: plan :206-217; shard 009 (its table lists three inputs; "No repository file changed"); research `sources/` (empty)
**Finding**: Three problems remain.
- **The fixtures do not exist.** The unit test runs "over shard 009's recorded traces". Shard 009 recorded only a summary table for three inputs (real touch, `input text`, CDP `insertText`), on a scratchpad page that is not in the repository. `adb shell input keyevent`, `Input.imeSetComposition` and `Input.dispatchKeyEvent` were never recorded, and neither were Enter and Backspace signatures. The unit test (:211-214) would have to use hand-written traces, which is the "the rule matches its own examples" problem from A2. The on-device bypass step (:215-217), which could record real traces, comes after it.
- **One bypass is invisible to the page.** A CDP `rawKeyDown` with key `Unidentified` and `windowsVirtualKeyCode: 229` produces the same trusted DOM `keydown` that Chrome's ImeAdapter sends for a Gboard tap: key `Unidentified`, keyCode 229, empty `code`, `isTrusted` true. No calibrated signature can tell them apart. Only the lane-touch window and event multiplicity can.
- **The signature check is never exercised.** If the five bypasses are replayed with no lane touch, which is the obvious way to write the test, the lane-touch rule rejects all five. A broken signature matcher, for example one that accepts any trusted event, still passes the test.

A2's structural suggestion was to record the lane's CDP traffic and fail on any `Input.*` method. That is the one unforgeable check, and the plan did not adopt it.
**Suggestion**: Reorder. First, the on-device bypass run records real traces and commits them as fixtures. Then the unit test runs over those fixtures. Replay each bypass both outside a touch window and inside a real key-tap window, so the signature rule and the multiplicity rule each have a case that only they reject. Add a protocol guard on the lane's CDP session: wrap `newCDPSession`, or fail on `Input.*` methods in Playwright's protocol log.

### 5. [warning] The served-source identity names an id that does not exist, which is wrong on a dirty tree, and duplicates an existing owner
**Location**: plan :220-223 ("read the page's build id ... the build id matching `HEAD`"); `apps/plite/scripts/plite-proof-inputs.mjs:474-540`; `apps/plite/scripts/build-app-if-stale.mjs:46, 59, 110`; `apps/plite/out/.editor-proof-build.json`
**Finding**: The Plite pages expose no build id, and `next.config.ts` has no `generateBuildId`. Equality with `HEAD` says nothing about uncommitted source, and this checkout routinely carries a large staged diff. apps/plite already writes `out/.editor-proof-build.json`, with an `inputDigest` over the source inputs and an output fingerprint, and checks freshness with `isBuildManifestFresh`. That is the canonical served-source identity, and the plan reinvents a weaker one.
**Suggestion**: Use the existing manifest. Check `isBuildManifestFresh` for the served `out/`. Fetch `/.editor-proof-build.json` through the reversed port and compare its fingerprint, so the run proves that the phone loaded those bytes. `plite-static-server.mjs:33` snapshots every entry, so the dotfile is likely served; confirm that.

### 6. [warning] Case 5 cannot close the autocomplete plan's Android gate from `apps/plite`
**Location**: plan :228-230 ("the autocomplete plan's Android gate"); topic :105; frontmatter `review_scopes: autocomplete`; `apps/www/src/app/(app)/examples/plite/_examples/mentions.tsx:295`; `packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts`; `docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md:329, 409, 452-453`
**Finding**: The gate is about Plate's `useCombobox` option activation calling Plite's `settleInput()` during composition. That path exists only in `platejs` (`comboboxOwner.internal.ts`), and shard 004 exercised it on www's `/blocks/mention-demo`. The Plite examples that `apps/plite` serves come from `apps/www/.../examples/plite/_examples/`. Their `mentions.tsx` uses a plain `onClick` (`:295`) with no `settleInput`. So case 5 in `apps/plite` exercises the wrong component, while the topic claims it "Closes the autocomplete Android gate on an emulator".
**Suggestion**: Open the www mention demo for case 5. The device config then also has to serve www, with its own source identity; see finding 10 for the `reuseExistingServer` problem. Otherwise remove the closure claim and the `autocomplete` scope.

### 7. [warning] The correlation step contradicts itself, and its proof cannot fail for the defect it targets
**Location**: plan :202-205; `packages/test/src/playwright/native-event-trace.ts:25-28, 45, 377-381`
**Finding**: Four problems.
- "The per-run trace has no cap, and an overflow fails the run" cannot both hold.
- `startBrowserNativeEventTrace` rejects any non-integer `maxEntries`, so "no cap" also needs an API change that the step does not name.
- The step's proof is "the witness unit test below". That test exercises a pure judge over short recorded traces. It never runs live windowing: the quiet period, events after the next tap starts, or buffer overflow. A regression to length-based correlation, or a 100-entry cap left in place, passes it. Shard 009's traces have far fewer than 100 entries.
- The step never says which event types count. Plite's scheduled selection exports run on timeouts (for example `browser-handle.ts:807-818`) and fire `selectionchange` late. "Events must not arrive after the next tap starts" then fails on Plite's own housekeeping.
**Suggestion**: Pick one rule: a bounded buffer with a fail-on-overflow counter, or the trace drained after every step. Move windowing into the pure judge, with each step carrying its `[seqStart, seqEnd)` range, so the unit test covers attribution. Add one on-device case with more than 100 events. Exclude `selectionchange` from delivery matching.

### 8. [warning] `device.tapStrip(slot)` rests on a data source the repository's own evidence says is missing
**Location**: plan :197-198, :206-211, :225-226; Defaults :36-40; `docs/plans/2026-04-12-android-legacy-case-classification.md:35`; shard 009 (letter keys only); shard 005 S2 and S3
**Finding**: Calibration writes "the key map and each key's event signature". It never captures the suggestion strip. Strip candidates exist only while a partial word is typed, so `calibrate` would have to type one first.

Tracked evidence says direct probes "expose zero Gboard candidate nodes" (`gboardElementCount: 0`, `suggestionElementCount: 0`). That was Appium's single-window source, and shard 009 showed that `--windows` reveals the letter keys. It never checked the candidate strip. The plan's evidence summary (:268-269) says the dump "lists every Gboard key". The shard says every letter key. "A strip tap has its own signature" also has no recorded instance. Shard 005 grades the event shape of suggestion taps "Unknown".
**Suggestion**: Add a Phase 2 entry probe. Type `hel`, run `uiautomator dump --windows`, and record whether candidate nodes and bounds appear, and what events one strip tap produces. If the nodes are absent, cut case 2 from the first slice.

### 9. [warning] The doctrine repair list targets lines that stay true, misses lines that become false, and runs a phase late
**Location**: plan :236-242; `.agents/rules/verify.mdc:260-262, 264-267, 314-315`; `.agents/rules/verify/references/commands.md:199`; `.agents/rules/benchmark/references/methodology.md:126-129`; `docs/plite/reference/public-docs/concepts/15-editing-behavior.mdx:154`
**Finding**:
- **Lines that stay true.** `verify.mdc:261-262` ("Browser emulation does not prove raw Android/iOS input") and `:314-315` remain true. `commands.md:199` ("`bun test:mobile-device-proof:raw` requires actual Appium Android/iOS artifacts") also stays true, because the plan leaves the raw gate unchanged (:46-51, :96). Editing it would make the doctrine misdescribe the gate.
- **Lines that become false and are missing.** `verify.mdc:264-267` ("`clipboard.pasteHtml` and `clipboard.pasteText` can fall back to synthetic events or editor handles") becomes false in Phase 1. The benchmark methodology's injected-handle rule becomes false too. The public docs that teach `@platejs/test/playwright` (`15-editing-behavior.mdx:154`) lose their ready gate unless the docs say to install the handle. First-pass B16 and C22 named the paste line.
- **No changeset.** Phase 1 changes the published `plitejs`, `platejs` and `@platejs/test`: the handle is no longer attached on mount, the fallbacks are deleted, and new exports are added. No changeset step appears. Shard 007's adoption list (`007:205-211`) has one, and the plan dropped it.
- **Phase timing.** The doctrine step is in Phase 2, while Phase 1 is "kept, reverted or quarantined on its own" (:117-118). If Phase 2 never runs, Phase 1 ships with stale doctrine.
**Suggestion**: Split the repair:
- Phase 1 repairs `verify.mdc:264-267`, the methodology line and `15-editing-behavior.mdx`, and adds the changeset.
- Phase 2 repairs `editor-proof.md:91-96`, adds an emulator row to `docs/vision/common.md:84`, and adds to `commands.md` a sentence that device-lane evidence is verify-scoped and does not satisfy the raw gate.

### 10. [warning] The macOS lane has no warmth witness, no source identity and no activation-race guard, and its Chrome launch likely opens first-run UI
**Location**: plan :123-147; shard 006 §2 and §7 (activation race, probe key, setup-failure class, dedicated server); `apps/www/playwright.config.ts:12, 42-50`
**Finding**:
- **First-run UI.** Launching exact Chrome with only `--remote-debugging-port` and a fresh temporary `--user-data-dir` most likely opens Chrome's first-run or sign-in UI, because `--no-first-run` is omitted. That window can take the key window and break the frontmost check and IME activation. This is inferred; verify it on the first launch.
- **No warmth.** www runs `workers: 1` and `fullyParallel: false`. With `--repeat-each=5`, each repeat gets a new worker (C4). A worker-scoped launch with a temporary profile therefore makes every run a cold Chrome with a new profile. The Android lane got a pid and target witness; this lane got none.
- **No served-source identity.** www's webServer reuses whatever answers on :3000 (`reuseExistingServer: true`). Shard 006's recipe uses a dedicated `PLATE_WWW_DEV_SOURCE=1` server on :3297, and the plan drops it.
- **The activation race is unhandled.** Shard 006 requires selecting Pinyin with Chrome in the background, activating Chrome, waiting at least 150 ms, and requiring a trusted `compositionstart` on a probe key. A miss counts as a setup failure, never a product result. Without that, the macOS 26 race (keys arriving as ASCII) fails as a product failure inside a no-retry five-run gate.
- **No host lock.** Nothing locks TIS or HID per host (A11, unresolved).
**Suggestion**:
- Launch Chrome once per run set in `globalSetup`, with a persistent dedicated profile seeded with a `First Run` sentinel file. That needs no extra switch.
- Record the browser pid per run and fail when it changes.
- Pin a dedicated port with `reuseExistingServer: false`.
- Add the probe-key gate and a host lock file.

### 11. [warning] One project per serial still lets two repeats of the same serial run at once
**Location**: plan :218-221; `node_modules/.pnpm/playwright@1.61.0/node_modules/playwright/types/test.d.ts:735-751` (per-project `workers`)
**Finding**: Each repeat has its own worker hash (C4). With the global `workers` set to the number of attached serials, Playwright can schedule repeat 0 and repeat 1 of project `emulator-5554` on two workers concurrently. The per-serial lock then either fails one of them, which breaks the 5-of-5 rule, or blocks it until the test timeout. Playwright 1.61 supports per-project `workers`.
**Suggestion**: Set `workers: 1` on each serial project. Keep the lock file for cross-process exclusion only.

### 12. [warning] The caret helper can hide the stale-caret defect, and the topic and the plan disagree on the capture path
**Location**: plan :137-140, :141-147; topic :107 ("OS screenshots"); shard 006 §6 (stabilizer "for the capture window only", plus a confirmatory burst without the stabilizer)
**Finding**:
- **The stabilizer can mask the bug.** The #5137 claim includes "no stale pixels". `captureCaretPixels` sets `caret-animation: manual` before capturing. A style change on the root invalidates paint and can repaint away a stale caret. Shard 006 pairs the stabilizer with a burst capture without it, to show that the stabilizer hides nothing. The plan drops the burst (C10, unresolved).
- **The controls can disturb the composition.** The helper "runs the positive, negative and duplicate sentinels". If those run on every capture, the duplicate control injects an element during an active composition, which can end it or trigger Plite's DOM repair.
- **The proof misses the duplicate case.** The step's proof is "fails when the caret is hidden". It never tests that a duplicate caret is rejected, and "none at the old point" depends on exactly that.
- **The capture paths disagree.** The topic says OS screenshots. The helper is a Playwright CDP capture with `caret: 'initial'`.
**Suggestion**: Run the controls once per run, before the composition, through the same capture path. Keep one burst run without the stabilizer per anchor. Add a duplicate-control assertion to the helper's test. Pick one capture path and make the topic and the plan agree.

### 13. [warning] The handle inversion is split into two non-atomic steps, its proof script is missing, and three contracts are unstated
**Location**: plan :160-174; shard 007 §3 Method ("`measure/build.mjs` ... in this scratch directory"); `packages/plitejs/test/react/kernel-authority-audit-contract.ts:768, 817, 962, 986, 1124`; `packages/test/src/playwright/harness-input.ts:120, 135` (paste detection reads `kernelTrace`)
**Finding**:
- **The proof script is missing.** The step's proof is "shard 007's `measure/` script". That script lives in a past session's scratchpad. `git ls-files --cached --others --exclude-standard` returns no `measure/build.mjs`.
- **The steps are not atomic.** "Invert" (:160) and "install" (:167) are separate boxes. Between them, every suite fails the ready gate, while the inversion's own proof (bundle bytes) passes.
- **The retention default is unstated.** "Kernel trace retention becomes its own switch" does not say what it defaults to once the handle is installed. The harness reads `get.kernelTrace()` for paste detection and selection snapshots. A default of off silently changes harness behavior.
- **The pinned audit paths are unlisted.** Moving `browser-handle.ts` "behind `plitejs/testing`" breaks the kernel authority audit, which pins that file's path in several inventories.
- **There is no clear error.** Shard 007 asked for a "handle not installed" ready-gate error. The plan accepts "an install after mount never attaches" as a risk and fails with a generic readiness timeout.
**Suggestion**: Merge the two steps into one. Commit a small measurement script under `tooling/` and cite it. Make `installBrowserHandle()` turn retention on, with a benchmark option to turn it off. Keep `browser-handle.ts` at its current path and export only the installer through `testing`, so the audit holds. Have `waitForReady` throw "browser handle not installed" when the root mounts without one.

### 14. [warning] Device tests and cases have no named location outside CI's collection
**Location**: plan :215-217 ("the on-device bypass test inside `packages/test`"), :218-232 (cases "in `apps/plite`"); `apps/plite/playwright.config.ts` (`testDir: './tests/plite-browser'`); `package.json:38` (`check` runs `test:all`); `.github/workflows/plite-ci.yml:166-179, 291` (Chromium Plite browser run on PRs via `check-plite.mjs`)
**Finding**: `pnpm check` runs the `packages/test` suites in CI. An on-device test placed under `packages/test/test/` runs there with no adb and fails. If device cases land under `apps/plite/tests/plite-browser`, the main config and the PR Chromium job collect them, and `page` throws. That breaks CI and spends minutes the intent rules out. The plan names neither a test directory nor a capability gate.
**Suggestion**: Put the device cases in `apps/plite/tests/device/`, which only `playwright.device.config.ts` reads. Put the on-device bypass test behind that config, or behind a runtime capability gate that skips when `adb devices` lists nothing. AGENTS.md permits capability gates.

### 15. [warning] Restore files have no never-overwrite rule, so a crash followed by a rerun restores test values
**Location**: plan :125-128 (macOS helper "restore file"), :190-193 (Android setup "restoring all of it from a restore file"); first-pass A10
**Finding**: After a crash between `select` and `restore`, a rerun of `select` (or `setup`) records the current state as the "previous" value. That state is Pinyin, or Do Not Disturb, animation scale 0 and the Gboard settings. A later `restore` returns the machine to test values. Neither proof covers this: "a unit run of `status` and `restore`" for macOS, and `doctor` printing identities for Android. Printing a fingerprint is not a check.
**Suggestion**: Write the restore file only when none exists, and delete it only after a successful restore. Have `doctor` and `status` report a stale restore file and refuse to start. Prove it with one kill-then-rerun case per helper.

### 16. [warning] "Files that bug" pre-authorizes a public message
**Location**: plan :179-180 (Phase 2 exit), :231-232 ("or a filed product bug with its trace")
**Finding**: Filing an issue in a tracker is a message to other people. AGENTS.md "Messages and shared resources" requires explicit authorization for each message, and a plan approval does not carry that authority. As written, an executor following the plan would open public issues.
**Suggestion**: Change it to "records the bug locally with its trace and drafts the issue (Maintainer issue-draft mode) for the owner".

### 17. [nit] The decision trail cites unreadable paths and claims a second pass that is not recorded
**Location**: plan :13 ("interrogated twice"), :278-279, :299; `docs/plans/2026-10-02-proof-device-lane.decisions.tsv` row 6
**Finding**:
- The review row's evidence is `scratchpad interrogate/reviewer-a.md, ...`, which is session-local. Teammates cannot open it, and AGENTS.md's Source authority rule requires cited paths to be ones `git ls-files` returns.
- The log has no second-pass row, yet the status says "interrogated twice" and :299 says the second pass is recorded.
- "Every critical one raised by at least two reviewers" is false for A3.

### 18. [nit] Smaller precision gaps
- **Wrong input source (:120-122).** `TISCopyInputSourceForLanguage("zh-Hans")` can return another zh-Hans source, such as Shuangpin, Wubi or handwriting. Check the exact id `com.apple.inputmethod.SCIM.ITABC`, and confirm its parent is enabled and select-capable (shard 006 §2).
- **Issue label (:228).** "#6022" is a Slate issue, but it is unprefixed while its neighbors say "Slate #".
- **Proof that cannot fail for ordering (:134-136).** The `seq` proof "finds its `seq`". It cannot fail for a sequence that is not monotonic, or one assigned when the trace is read rather than when the entry is pushed. The existing trace tests run in happy-dom, where `isTrusted` is always false, so this test needs a real-Chromium runner that the plan does not name.
- **Inconsistent publication rule (topic :26).** `captureCaretPixels` becomes a public `@platejs/test/playwright` export for one Chromium-only caller. The plan keeps the device lane private "until it earns a public entry", and the same rule fits here.
- **Unproven job (:58-59).** "www keeps the handle on platejs.org" cites a reporter-reproduction job. Shard 007 found no recorded probe that ever read the handle on platejs.org (`007:66`). The AGENTS.md redesign rule asks for a proven current job.
- **No import path (:196).** The private `packages/test/src/device` has no export, and the plan never says how `apps/plite` imports it. A tsconfig path alias like `apps/www/tsconfig.json:21-24` is the existing pattern.
- **Calibration format split (:189-195).** `tooling/device/android.mjs` writes the key map and signatures, and the TS lane reads them, so the format is owned in two places. The calibration surface is also unnamed. Calibrating on the build under test lets the witness learn a regression as normal. Calibrate on the neutral textarea and bare contenteditable page from shard 009.
- **Census still dropped (A17).** Shard 005 asked for an English event census before any English case is trusted. Cases 2 to 5 are English and the census is still missing.
