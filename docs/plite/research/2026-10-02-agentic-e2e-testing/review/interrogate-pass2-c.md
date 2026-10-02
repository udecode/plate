# Reviewer C, second pass: proof device-lane plan

Scope: `docs/plans/2026-10-02-proof-device-lane.md`, `docs/plans/topics/proof.md`, the decision log beside the plan, shards 001-009, and the repository on `next`, read-only. Line numbers are from the current worktree.

## First-pass critical findings: status

| First-pass critical | Status | Reason |
| --- | --- | --- |
| Release gate cannot consume local receipts (A1, B1, C1) | Resolved | Schema 2, the reporter and the gate rewiring are cut. Phase 3 records the trust decision. |
| Witness accepts CDP composition and key events, and the bypass test checks only its own examples (A2) | Partially resolved | The plan adds `isTrusted` and five bypass inputs. It does not adopt the structural check, which fails on any lane-issued CDP `Input.*`. A CDP `rawKeyDown` (key `Unidentified`, keyCode 229) followed by `Input.insertText` matches a Gboard tap in every field. The new bypass test can also pass through the lane-touch rule without exercising the signature check (finding 3). |
| Fixed `updateCount` contradicts Gboard (A3) | Moot | The matrix revision is cut. |
| Reporter mints receipts from flaky runs (A4) | Resolved | The reporter is deleted. Residual risk: `playwright.device.config.ts` gets no guard like `assertBrowserWorkerArgs` (`apps/plite/playwright.config.ts:9-17`) against CLI `--retries` or `--repeat-each` overrides. |
| 100-entry native-trace ring (A5, B3, C2) | Resolved in intent | `seq` and an uncapped per-run trace are added. The step text contradicts itself (finding 18). |
| Strip case and `tapNative` break the no-UiAutomation rule (B2) | Resolved structurally | `tapNative` is gone, and `tapStrip(slot)` uses calibrated slots. Nothing produces the strip signature, and the case can pass without any replacement (findings 9, 10). |
| Audit rejects the cases it was written for (C3) | Partially resolved | Touch-carried composition commits and strip taps now have rules. Autocorrect on space (case 3) is still rejected by construction (finding 9). |
| `repeatEach` makes a new worker per repeat (C4) | Partially resolved | One project per serial stops repeats from splitting across devices, and pid plus target is the warmth witness. Each repeat still rebuilds the worker fixture (`playwright@1.61.0/lib/common/index.js:2108`). "One target across five runs" holds only if every worker reattaches to the same existing tab, which the plan never specifies (finding 12). |

## Findings

### 1. [critical] Deleting the `'browser-handle'` preference does not put the next native input on the native path
**Location**: Phase 1, the step "Delete the `'browser-handle'` selection preference branches"; Main changes bullet 2; topic "Hard cuts". Code: `packages/plitejs/src/react/editable/selection-controller.ts:651-681, 683-712`; `runtime-before-input-events.ts:340-350, 868-880`; `browser-handle.ts:764-790`.

**Finding**: The step does not produce its stated outcome, "a handle-set selection leaves the next native `insertText` on the native path", and "no longer changes how the next native input is handled" is broader still. There are three separate problems.
- Delete the reason entirely, as the topic says ("The `'browser-handle'` selection preference is deleted"). `selectRange` still sets `preferModelSelection: true` with `selectionSource: 'model-owned'`. With no explicit reason, `inferModelSelectionPreferenceReason` returns `'model-command'` (`:676`). Lines `:704-711` list `'model-command'` among the reasons that force model-owned `insertText`. The behavior stays exactly as it is today.
- Take the narrow fix instead: drop `'browser-handle'` from the `:706` list only. That changes `insertText` and nothing else. `isEditableModelSelectionPreferredForInput` returns `true` for every other input type whenever model selection is preferred (`:690-696`). So after `editor.selection.select`, a native Backspace, Enter or word delete still skips the selectionchange flush (`shouldFlushSelectionChangeBeforeDOMBeforeInput`, `runtime-before-input-events.ts:340-350`) and runs model-owned. A real click sets `preferModelSelection: false` (`'native-selection'`), so the two paths still differ.
- Make the handle match a click instead (`preferModelSelection: false`). That turns off the handle's own deferred DOM export, because `syncDOMSelection` returns early unless model selection is preferred (`browser-handle.ts:785`). It also changes the setup behind the 454 `select` and `collapse` calls (shard 003).

**Evidence**: The step's only new test types with `page.keyboard.type`, which is `insertText`, so it cannot fail for the Backspace or Enter contamination. The proof is "the full Plite Chromium suite", yet those setups run in five projects in CI (`plite-ci.yml:352, 438-450`), and selection import differs most on Firefox and WebKit. The pinned contract `packages/plitejs/test/react/selection-controller-contract.ts:1561` ("model-owned browser-handle selectionchange keeps its ownership guard") is not named as a caller.

**Suggestion**: State the mechanism: which reason and which `preferModelSelection` value a handle selection leaves behind, and how the DOM export still runs. Test one `insertText` and one `deleteContentBackward` after a handle selection, against the same steps after a real click. Run the full project matrix, not only Chromium.

### 2. [critical] Case 5 cannot close the autocomplete plan's Android gate
**Location**: Phase 2 case list ("the autocomplete plan's Android gate"); topic Native behavior row "Closes the autocomplete Android gate on an emulator"; frontmatter `review_scopes: autocomplete`.

**Finding**: The device cases live in `apps/plite`, which serves only Plite examples (`apps/plite/src/app/examples/plite/[example]`). Its mentions example, `apps/www/src/app/(app)/examples/plite/_examples/mentions.tsx`, imports only `plitejs`, `plitejs/history` and `plitejs/react`.

The gate belongs to Plate's combobox: `useCombobox`, `settleInput()` and the `onMouseDown` in `inline-combobox.tsx` (`docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md:329, 388, 409`; its decision log rows at `:33` and `:85`). It is G02, and G03, the only gate with a reproduced wrong result (shard 003). Both were observed on www's `/blocks/mention-demo`, the page shard 004 probed. A green case 5 in apps/plite runs none of that code.

**Suggestion**: Either run case 5 on www's mention demo, which means the lane needs a www serving path and a served-source identity, or narrow the claim to "Plite inline boundary plus a tap during composition" and leave G02 and G03 open. The cheapest way to tell an emulation artifact from a real bug is to run G03's exact repro on the emulator: type `ab`, compose `cd`, tap outside.

### 3. [critical] The bypass test passes because of the lane-touch rule, not because the signature check works
**Location**: Phase 2 steps "Write `judgeDeviceWitness`" and "Add the on-device bypass test"; Evidence section.

**Finding**: The judge rejects "any input with no matching lane touch". Replaying the five bypasses with no lane touch makes all five fail on that rule alone, so the test still passes if the signature comparison accepts everything. The bypass that matters happens inside a lane step: for example, a helper that "types" a key missing from the map with `adb shell input text`, or a CDP call during a keyboard step. Such an input satisfies the touch rule, and only the signature can catch it.

The unit test also rests on "shard 009's recorded traces", and none were committed. `docs/plite/research/2026-10-02-agentic-e2e-testing/sources/` is empty, and `git ls-files` shows no trace fixture. Shard 009 ran from the session scratchpad and kept only a three-row summary: a real tap, `adb shell input text` and CDP `insertText`. Nobody recorded `adb shell input keyevent`, `Input.imeSetComposition`, `Input.dispatchKeyEvent`, Korean, Enter or Backspace. Those fixtures would be invented, so the test would check the judge against its author's guesses.

**Evidence**: A CDP `rawKeyDown` (key `Unidentified`, `windowsVirtualKeyCode: 229`) followed by `Input.insertText` produces trusted `keydown`, `beforeinput` and `input` events that match the real-tap row of shard 009 field for field. No event-level signature can reject that pair.

**Suggestion**:
- Replay each bypass inside an open lane keyboard step, so the signature is the only thing that can fail it.
- Record real fixtures on the emulator first and commit them as test data.
- For the CDP pair, use first-pass A2's structural check: the Android module exposes only tap and motion gestures, and the lane's CDP session refuses any `Input.*` method.

### 4. [critical] Putting the private lane under `packages/test/src` triggers the full Plite browser CI matrix on every lane commit
**Location**: Scope ("a new private `packages/test/src/device`"); Defaults "Lanes run locally only"; `tooling/scripts/check-plite.mjs:182-193, 280-294, 623`; `.github/workflows/plite-ci.yml:38-49, 77-81, 183-184, 344-352, 428-450`.

**Finding**: `plite-ci` runs on push to `next` and on PR open and synchronize for `packages/test/**`. Its `proof-plan` job runs `check-plite.mjs dev`. That script classifies any non-test file under `packages/test/src` as a runtime package input, sets `browserSmoke = true`, and writes `browser=true`. Browser-build then runs, followed by four Chromium shards, eight Firefox and mobile shards, and the WebKit jobs on `macos-latest`. No CI job can exercise device code, so every lane iteration pays for a full matrix run that proves nothing about the change. That contradicts "no new GitHub Actions minutes".

**Suggestion**: In Phase 2's first step, either teach `check-plite.mjs` that `packages/test/src/device/**` is not a browser input (with a case in `check-plite.test.mjs`), or put the lane where the planner already ignores it.

### 5. [warning] The Pixel 5 relabel's proof cannot fail, and the relabel changes a public type
**Location**: Phase 2 step "Relabel the Pixel 5 project's transport claim"; Defaults "The Pixel 5 project stays"; Scope row "Pixel 5 project".

**Finding**: The proof is "the claim check in `mobile-device-proof.mjs`'s scoped branch". That branch (`tooling/plite/donor/proof/mobile-device-proof.mjs:104-144`) classifies hard-coded ids (`'agent-browser-ios'`, `'appium-android'`, `'appium-ios'`) plus an empty receipt bundle. It reads no Pixel 5 label, so it passes before, during and after any relabel.

The label actually lives in `classifyScenarioTransportClaim` (`packages/test/src/playwright/scenario-replay.ts:1124-1150`). For platform `'mobile'` it returns `'playwright-mobile-viewport'`, `'playwright-mobile-keyboard'`, `'mobile-semantic-handle'` or `'mobile-synthetic-composition'`. These are members of the exported `BrowserTransportClaim` union (`types.ts:733-745`, `index.ts:204`), pinned by `packages/test/test/proof/scenario.test.ts:1638-1656` and by `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:3522, 3843`.

The `'mobile-semantic-handle'` rows are handle writes, so labeling them "desktop Blink events" over-claims in the other direction. The premise in the Scope table, "claims raw mobile in places", cites nothing, and the current labels already say `playwright-mobile`.

**Suggestion**: Name the sites that over-claim, or drop the step. If it stays, its proof is `scenario.test.ts`, and the union change goes through Best API and a changeset.

### 6. [warning] The doctrine repair targets the wrong lines and the wrong phase
**Location**: Phase 2 step "Repair the doctrine".

**Finding**:
- `verify.mdc:264-265` says `clipboard.pasteHtml` and `clipboard.pasteText` "can fall back to synthetic events or editor handles". That becomes false when Phase 1 deletes the fallbacks, and the line is not on the list.
- `.agents/rules/verify/references/commands.md:199` ("requires actual Appium Android/iOS artifacts") and `packages/test/README.md:91-104` stay true. Receipt schema 1 is unchanged here and still requires `directAppium: true` (`raw-mobile-proof.ts:68, 173`). Rewriting those lines contradicts the plan's own row "Raw-mobile receipts and release gate: unchanged here".
- `verify.mdc:261-262` neither promises Appium nor treats emulation as raw proof. It says the opposite.
- The repair sits in Phase 2, so Phase 1 can close with stale doctrine.
- The handle move changes public teaching that the list leaves out: `docs/plite/reference/public-docs/concepts/15-editing-behavior.mdx` and the README's `openExample` guidance.

**Suggestion**: Move the paste and handle-install doctrine fixes into Phase 1. Keep the Appium gate text until Phase 3 decides how releases trust local evidence. Rebuild the list with `git grep` for the old promises rather than reusing first-pass line numbers.

### 7. [warning] The paste cut weakens WebKit and the mobile project, leaves a fourth fallback, and pushes engine branches into specs
**Location**: Phase 1 paste step; Defaults "Silent paste fallbacks are deleted"; `packages/test/src/playwright/harness-input.ts:114-203`; `clipboard.ts:143-164, 331-392`.

**Finding**:
- On WebKit and on the mobile project, `pasteHtml` currently sends a synthetic `ClipboardEvent`. That event runs the editor's paste handler and its `DataTransfer` parsing. The plan offers only one opt-in, `{ transport: 'handle' }`, which calls `insertData` and skips the paste handler. The honest replacement proves less than the stand-in it removes.
- `pastePayloadThroughEvent` has its own silent `handle.insertData` retry (`clipboard.ts:372-391`). It backs `pasteEventPayload`, which has 9 app call sites, and the cut paths call it too. The plan scopes the cut to `harness-input.ts`, so this retry survives.
- 77 Plite call sites run in five projects, and only Chromium grants clipboard permission (`verify.mdc:275-277`). Per-call opt-ins therefore turn into `browserName === 'chromium' ? … : …` branches scattered across the specs.
- The proof names Chromium, Firefox and WebKit, but not the `mobile` project, which also loses its synthetic path.
- "Records that step's transport claim with `BrowserTransportClaim`" has no recorder. Claims exist only on scenario metadata (`normalizeScenarioMetadata`), not on direct `editor.clipboard.*` calls.
- The option name `transport` already means `'native' | 'synthetic'` on the IME options (`types.ts:890, 1101, 1420`; `ime.ts:292`).
- The governing review selected more than paste (review JSON line 34). It also covers constructed shortcut events and the IME semantic fallback (`ime.ts:212-240`). The plan drops both without a decision row.

**Suggestion**: The code-judo move is to make clipboard transport a per-project fixture option in `use` (`'native' | 'event' | 'handle'`). The harness reads it once, fails when the chosen transport changed nothing, and stamps the claim. Specs keep a single call shape, and the config states each engine's weaker transport in one place. Delete the `clipboard.ts:372-391` retry in the same cut. Log the shortcut and IME items as kept or deferred.

### 8. [warning] Putting the handle behind `plitejs/testing` pulls the React editable runtime into the headless test entry, and misses pinned callers
**Location**: Phase 1 step "Invert the handle dependency"; Defaults "The page handle is installed by test apps"; topic Public API.

**Finding**:
- `plitejs/testing` is headless: jsx, hyperscript and editor operations (`packages/plitejs/src/testing/index.ts`).
- `platejs/testing` is `export * from 'plitejs/testing'`, and the root entry of `@platejs/test` imports `platejs/testing` (`packages/test/src/index.ts:2, 15`). That root entry is imported by about 138 files, mostly bun unit tests.
- `browser-handle.ts` imports React modules (`../hooks/use-plite-node-ref`, `../plugin/react-editor`), and `react` is an optional peer of `plitejs`. Every headless consumer would load the React editable graph, and a consumer without React would fail at import.
- Callers the plan does not name:
  - `packages/plitejs/test/react/kernel-authority-audit-contract.ts` pins `browser-handle.ts` by path and by import pattern (`:768, :817, :962, :986, :1013, :1124`).
  - Three Plite specs import `PliteBrowserHandle` from the source path (`authored-changes.spec.ts:11`, `authored-mounted-performance.spec.ts:13`, `authored-performance.spec.ts:13`).
  - `browser-handle-contract.test.ts` imports the module directly.
- A missing install shows up as a generic poll timeout in `waitForReady` (`packages/test/src/playwright/ready.ts:24-29`), not as "handle not installed".
- The plan has no changeset, Best API pass or docs line for `installBrowserHandle`, `captureCaretPixels`, `{ transport }`, or the break for external `@platejs/test` users. Shard 007 listed those as adoption costs.

**Suggestion**: Export the installer from `plitejs/react`. Because the package declares `sideEffects: false` and the hook reads a registry, an app that never calls it tree-shakes it away. A React-layer testing subpath also works, but not the headless entry. Add the ready-gate error, the audit-contract update, the changeset and the docs line to the step.

### 9. [warning] Calibrated per-key signatures cannot both accept the planned cases and reject forgeries
**Location**: Defaults "Key map from the accessibility tree"; Phase 2 steps `calibrate`, `judgeDeviceWitness` and the six cases.

**Finding**:
- Calibration records "each key's event signature". A Gboard Korean key produces different events depending on composition state: a jamo update, or a syllable commit followed by a new composition (shard 005 §2). One signature per key either over-constrains real taps or shrinks to "keydown 229, then anything", which the CDP pair in finding 3 satisfies.
- Case 3, autocorrect on space, delivers a replacement inside the space key's window. That replacement does not match the space key's calibrated signature, and the judge has no autocorrect exception, so case 3 fails by construction. This is the first pass's C3 problem again.
- "A strip tap has its own signature", but calibration covers keys only, so nothing produces that signature.
- Shard 005 asks for an English event census before any English case is trusted. Cases 2, 3, 4 and 5 are English, and the census is not a step.

**Suggestion**: The code-judo move is to delete per-key signature calibration and keep only the key map. Make the claim structural:
- `doctor` checks that the selected IME is Gboard at the recorded version (`settings get secure default_input_method`).
- The Android module can issue only taps and motion events.
- Every delivery is trusted and falls inside a lane gesture window.

Event shapes then become recorded evidence rather than judge input. If signatures stay, run the shard 005 census first and add replacement inputs to the judge's data.

### 10. [warning] The strip-tap case can pass without exercising candidate replacement
**Location**: Phase 2 case 2; `device.tapStrip(slot)`.

**Finding**: Without a runtime dump, the lane cannot know which word sits in a slot, and Gboard often shows the literal typed word in one slot. A tap on that slot commits `hel` unchanged, and the check "no duplicated prefix" passes. The defect class, a duplicated prefix when a partial word is replaced (Slate #5643, #5130), never runs.

**Suggestion**: Require proof that a replacement happened: the committed word differs from the typed prefix, and the window contains a replacement or composition-commit event. Otherwise fail the case as a setup failure.

### 11. [warning] "Build id matching `HEAD`" names the wrong bytes and has no producer
**Location**: Phase 2 step `playwright.device.config.ts`; the #5137 spec step.

**Finding**: Next build ids are random, and neither `apps/plite/next.config.ts` nor www's config sets `generateBuildId` or a commit variable, so the page has no build id to read today. The owner keeps work uncommitted (AGENTS Delivery), so the served bytes are normally `HEAD` plus a dirty tree. A `HEAD` match then either always fails or certifies bytes that never ran.

apps/plite already fingerprints its proof inputs by content: `apps/plite/scripts/plite-proof-inputs.mjs` (`hashEntries`, `appBuildEntries`), used by `build-app-if-stale`.

The #5137 spec runs in www's runner, which has `reuseExistingServer: true` on port 3000 (`apps/www/playwright.config.ts:46`). It names no serving-source identity, which `verify.mdc:58` requires.

**Suggestion**: Stamp the existing input digest into the export and read it from the page. Give the #5137 lane its own port and record which checkout serves it.

### 12. [warning] Warmth holds only if every repeat reattaches to the same tab, and the macOS lane has no warmth witness
**Location**: Phase 2 step `playwright.device.config.ts`; Phase 1 steps "Launch exact Google Chrome" and the #5137 spec.

**Finding**: Each `repeatEach` index gets its own worker hash, so the worker fixture is torn down and rebuilt for every run. The target id survives five workers only if each one attaches to the same tab that already exists. If the fixture opens and owns its tab, which is the safe choice on a physical phone, the step's proof fails by construction. The plan picks neither.

The macOS lane has the same worker churn. "Only `--remote-debugging-port` and a temporary `--user-data-dir`" means a fresh profile on each launch. Such a profile probably shows first-run and default-browser UI, which can take the key window away from the page under test. `--no-first-run` and `--no-default-browser-check` do not touch input or paint.

**Suggestion**: Launch and attach once per invocation, in global setup or through a persistent tab scoped to the serial, and state which. Allow the two first-run switches, or pre-seed the profile.

### 13. [warning] Trace retention "becomes its own switch" with no stated default, and either default breaks something
**Location**: Phase 1 steps "Invert the handle dependency" and "Install the handle"; Scope row "Page handle".

**Finding**:
- **Install leaves retention off.** The kernel trace stays empty. `assertNoIllegalKernelTransitions` (`scenario-kernel-trace.ts:31-35`) then passes vacuously, the trace branch of `didPasteApplyText` (`dom-text-actions.ts:59-67`) never fires, and selection diagnostics come back blank.
- **Install turns retention on.** Benchmarks cannot measure the production configuration while the handle is installed, because `interaction-performance.ts:143, 191` needs the kernel trace for `insertionIsExact`.
- **Recording the mode.** "Benchmarks record whether trace retention was on" records the problem without solving it.
- **Fresh build.** `benchmark/references/methodology.md:126-129` requires a fresh build when injected handle code changes, and no step does that.

**Suggestion**: Have install turn retention on. State that perf lanes measure the installed configuration, and either rebaseline or keep one production-config benchmark that reads only DOM state.

### 14. [warning] `captureCaretPixels` runs its sentinels inside the composition it measures
**Location**: Phase 1 step `captureCaretPixels` and the #5137 spec step; topic "Native behavior and proof" row.

**Finding**: The helper "runs the positive, negative and duplicate sentinels" on every capture. The duplicate sentinel injects a caret-colored element on the same line, and the negative sentinel flips `caret-color`. During a live OS preedit, inserting DOM next to the composing Text node can trigger Plite's mutation and RestoreDOM handling or end the IME session. The spec would then measure the sentinel's side effect. Shard 006 runs the controls before composition starts.

The topic file says the #5137 proof uses "OS screenshots", while the plan uses a Playwright capture. The stale-pixel claim is about compositor output, and shard 006 chose OS capture to observe exactly that.

**Suggestion**: Run the sentinels once per anchor before `select`, from an overlay outside the contenteditable. Make the plan and the topic name the same capture path.

### 15. [warning] "Files that bug" is an outward message the plan has no authority to send
**Location**: Phase 2 exit; the six-case proof ("or a filed product bug with its trace").

**Finding**: Filing a GitHub issue is a message to other people. Under the AGENTS Messages rule it needs explicit authorization for that message. Under the Plan pages rule, an outward call goes under `## Open questions`, and the plan has no such section.

**Suggestion**: Have the lane draft the issue through Maintainer's issue-draft mode and record it under `owner:` in the decision log. The owner decides whether to file it.

### 16. [warning] The UiAutomation probe measures the wrong variable
**Location**: Phase 2 step "Probe whether a UiAutomation dump changes Chrome's events".

**Finding**: The premise is that a dump turns on Chrome's renderer accessibility. That changes performance and the accessibility tree, not the event shapes the probe compares, so the traces can match while accessibility mode stays on. The step names three conditions (with a dump, without one, and after force-stop) but promises "two event traces", from one run each.

**Suggestion**: Alongside the traces, compare `dumpsys accessibility` with a page-side signal such as a timing probe, and run each condition more than once.

### 17. [warning] Two owners wrap adb, joined by an untyped cache format
**Location**: Phase 2 steps `tooling/device/android.mjs`, the private lane, and the bypass test's "internal Android module".

**Finding**: `tooling/device/android.mjs` (`setup`, `calibrate`, `doctor`) and the internal Android module in `packages/test/src/device` each wrap adb: forward, tap, `getprop`, pid. A `.mjs` tool writes the calibration cache and TypeScript lane code reads it, and no type owns its format.

**Suggestion**: Keep one Android module in `packages/test/src/device` that exports the typed cache schema, and make the tooling script a thin CLI over it.

### 18. [nit] Smaller defects
- **Trace cap.** Phase 2 says the per-run trace "has no cap, and an overflow fails the run". Pick one.
- **Late-event rule.** "Events must not arrive after the next tap starts" cannot be checked by `seq` alone. After the snapshot, a late event from tap N looks the same as an early event from tap N+1. Name a detectable rule instead, such as an `input` with no `beforeinput` in its window.
- **keyCode 229 on `2`.** The #5137 spec "requires one trusted keyCode-229 `keydown` per posted key". With no composition open, Pinyin probably passes the follow-up `2` through with its real keyCode (inferred, not run), which would fail the follow-up step on every run. Limit the rule to composing keys.
- **macOS restore and locking.** `select` should refuse, or restore first, when a stale restore file exists, and should never overwrite one. A host lock should stop two sessions from posting keys into each other's Chrome. First-pass A10 and A11 are only partly resolved.
- **Bundle proof script.** The bundle proof cites "shard 007's `measure/` script", which is not in the repository (`git ls-files` finds no `measure/build.mjs`).
- **Redundant www check.** The new www handle-presence check duplicates the ready gate in 12 www specs, which already fail without the handle. The claim nothing proves is "platejs.org keeps the handle", which needs a check against a production build.
- **Status and decision log claims.** The Status line says "interrogated twice", and the Challenge delta says the second pass "is recorded in the decision log", before this pass returned. The decision-log row's claim that "every critical one came from at least two reviewers" is false: A3 (`updateCount`) came only from A, and only A rated A2 critical. That row cites scratchpad paths that `git ls-files` cannot return. The plan has no `Page:` line.
- **Topic intro.** The intro of `docs/plans/topics/proof.md` still promises "receipts for raw devices" after the receipt cut.
