# Reviewer B, second pass: proof device-lane plan

Scope: `docs/plans/2026-10-02-proof-device-lane.md`, `docs/plans/topics/proof.md` and its decision log, checked read-only against shards 004 to 009 and the repository on `next` (working tree).

## First-pass critical findings: resolved or not

| First-pass critical | Status | Residual |
| --- | --- | --- |
| A1, B1, C1: the release gate cannot consume a local receipt | Resolved. Schema 2, the reporter and the gate work are cut. Phase 3 records the trust decision. | The topic intro still promises "receipts for raw devices". The doctrine list edits gate text that stays true (finding 11). |
| A2: the witness accepts CDP composition and CDP key events | Partial | `isTrusted`, calibrated signatures and the lane-touch rule were added. A CDP 229 keydown plus `insertText`, and `adb input keyevent`, still produce the same events as Gboard. The bypass proofs cannot fail for a broken signature check (finding 2). |
| A3: fixed `updateCount` | Resolved, moot after the receipt cut | none |
| A4: the reporter mints a receipt from a flaky case | Resolved, moot after the receipt cut | "Five runs, all passing at retry 0" still depends on nobody passing `--retries` or `--repeat-each` on the command line. |
| A5, B3, C2: 100-entry native trace ring | Resolved for the native trace through `seq`, no cap and a quiet-period window | The same length-on-a-ring correlation remains in the kernel trace, and it becomes load-bearing once the paste fallbacks are gone (finding 6). The plan also says "no cap" and "an overflow fails" in one step. |
| B2: suggestion-strip taps and `tapNative` break the no-UiAutomation rule | Mostly resolved: `tapNative` is gone, `tapStrip(slot)` was added, and a cache miss fails closed | The calibrate step records only "each key's event signature". Strip slots and the strip-tap signature are never calibrated or measured (finding 1). |
| C3: the audit rejects the cases it was written for | Partial | Touch steps may carry a composition commit. Keyboard steps still have to match a context-free per-key signature, so cases 1 and 3 fail by construction (finding 1). |
| C4: `repeatEach` creates a new worker per repeat | Resolved through one project per serial and a pid and target warmth witness | The macOS lane got no equivalent (finding 12). |

## Findings

### 1. [critical] Per-key calibrated signatures cannot describe IME output, so cases 1 and 3 fail by construction
**Location**: plan lines 189-195 ("Calibration writes the key map and each key's event signature, keyed by keyboard identity"), 206-214 (`judgeDeviceWitness`: "A keyboard step needs trusted events that match the calibrated signature for that keyboard identity, Enter and Backspace included. A touch step may carry a composition commit"), 224-232 (cases)
**Finding**: The judge matches each keyboard step against one signature per key. With a composing keyboard and autocorrect, the events a key produces depend on state, not on the key.
- Gboard Korean: the first jamo opens a composition (`compositionstart`). Later jamo send `compositionupdate`. A jamo that starts a new syllable sends `compositionend` and then `compositionstart` (shard 005 section 2, the PR 6096 trace: `ㅇ`, `아`, `안`, `안ㄴ`, `안녀`). Calibrating key `ㅇ` once records only one of those shapes.
- Case 1 ends with Enter after a Korean syllable. Enter then commits the composition and also splits the block. The plan lets only touch steps carry a composition commit, so a calibrated Enter signature taken outside a composition rejects this real Enter.
- Case 3 taps space after `cant`. The autocorrect replacement, whether `insertReplacementText` or a composition region, arrives in the space key's window and matches no calibrated space signature.
- Case 2's strip tap has "its own signature", but no step calibrates or measures it. The calibrate step covers keys only, the strip shows candidates only after a partial word, and shard 005 grades strip-tap delivery as a guess.

The judge therefore either fails honest runs of three of the six cases, or someone loosens it during implementation. That loosening is the ad hoc state the first pass warned about.
**Evidence**: Shard 009 recorded only English letters in a `<textarea>`, which is the one keyboard where per-key signatures are constant. No shard recorded Korean, autocorrect, Enter during composition or a strip tap.
**Suggestion**: Make the signature a small per-identity state machine keyed by input class (`letter`, `compose`, `commit`, `enter`, `backspace`, `strip`, `autocorrect`), recorded at calibration by typing a scripted word in each class. Let keyboard steps carry a composition commit as touch steps do. Add a calibration probe for Korean, autocorrect and the strip before writing `judgeDeviceWitness`, and make its traces the unit test's fixtures.

### 2. [critical] The bypass proofs cannot fail for a broken signature check, and their fixtures do not exist
**Location**: plan lines 211-217 (unit test "over shard 009's recorded traces" that fails if the judge accepts five inputs; on-device test that replays them)
**Finding**:
- Shard 009 recorded three inputs: a real tap, `adb shell input text` and CDP `Input.insertText` (shard 009 table). It recorded no `input keyevent`, no `imeSetComposition` and no `dispatchKeyEvent`. The prototype also ran in a session scratchpad ("No repository file changed"), and `docs/plite/research/2026-10-02-agentic-e2e-testing/sources/` is empty. The unit test has no recorded traces for any of the five inputs. Hand-built traces would encode a guess at what Android Chrome emits, and the test would pass while the judge accepts the real bypass.
- Two of the five bypasses produce the same events as Gboard. CDP `dispatchKeyEvent` `rawKeyDown` with key `Unidentified` and `windowsVirtualKeyCode: 229`, followed by `insertText`, yields a trusted `keydown` (Unidentified, 229) and then a trusted `beforeinput insertText`, which is Gboard's letter signature. Shard 005 also says "Gboard sends Enter and Delete as key events, so a keycode exercises the same path", so `adb shell input keyevent KEYCODE_ENTER` matches Gboard's Enter. No signature can reject these.
- The on-device test replays the five inputs with no lane touch, so the lane-touch rule rejects every one of them before the signature check runs. If the signature matching were deleted, the test would still pass.

The only check that closes the CDP bypass is structural: the lane holds a CDP connection and could send `Input.*`. First-pass A2 proposed recording the lane's protocol traffic, and the plan does not adopt it.
**Suggestion**: Record real traces of all five inputs and commit them as a small test fixture. In the device test, inject each bypass inside a real lane-touch window, so the signature rule has to reject it. Record the lane's CDP traffic through a wrapped session or Playwright's protocol logger, and fail on any `Input.*` method. Write in the plan that the CDP 229 and `input keyevent` cases are closed structurally, not by signature.

### 3. [critical] Deleting the `'browser-handle'` preference rests on an unrun inference that the pinned contracts contradict
**Location**: plan lines 107 (table: "`selectRange` sets a `'browser-handle'` preference that makes the next native `insertText` model-owned"), 155-159; topic "Hard cuts"
**Finding**:
- The premise is shard 007's inference, labeled "inferred from source and was not run" (shard 007 line 96, Limits line 218). The repository contradicts it. `packages/plitejs/test/react/selection-controller-contract.ts:1995` is named "browser-handle text input can keep the native fast path" and asserts that `shouldForceModelOwnedTextInput` is false for that reason. `selection-controller.ts:714-731` forces model ownership only for `modelOwnedTextInputGuard` or `'repair-induced'`.
- What `isEditableModelSelectionPreferredForInput` (`:683-712`) controls is narrower. It stops the selectionchange flush and makes beforeinput use the model selection (`runtime-before-input-events.ts:340-349, 876-880`). Native ownership can stay on.
- That is plausibly correct after a handle write, because `runCommand` exports the DOM selection immediately, again on a microtask and again on a timeout (`browser-handle.ts:286-366`). Deleting the branch makes the first native key import a DOM selection that may still be pending.
- The six branches mean different things: `dom-input-runtime.ts:439-442` (native-allowed), `editing-kernel.ts:570-575` (programmatic origin), `input-router.ts:1425-1430` (`browserHandleDOMInput` stale-text detection) and `selection-controller.ts:631-633, 704-706, 834-838`. The plan names none of the behaviors they carry, which AGENTS Architecture decisions requires.
- Shard 007's own proposed mechanism is to route through `'model-command'` or `'programmatic-export'`. `'model-command'` returns true for `insertText` (`:707-708`), so that keeps the behavior the plan says it removes.
- The #5137 plan already recorded a compensating browser-handle transition that "failed the owning browser cases ... 12 failures and 18 passes in five repetitions". Proof that covers only the Plite Chromium suite cannot catch the Firefox and WebKit selection-export timing differences this branch may exist for.
**Suggestion**: Make shard 007's cheap probe the step's first box: read `getInputState().modelSelectionPreference` and the kernel trace ownership for the next typed character after `selection.select` and after a real click, on Chromium, Firefox and WebKit. Delete branches only where the probe shows a real divergence. Name the branches and the contract tests that change (`selection-controller-contract.ts:1561, 1927, 1995, 2055`). Run the full Plite suite on all four projects.

### 4. [critical] Case 5 cannot close the autocomplete Android gate it claims
**Location**: plan line 229-230 ("the autocomplete plan's Android gate"); topic line 105 ("Closes the autocomplete Android gate on an emulator"); `review_scopes: autocomplete`
**Finding**: The device config and its cases live only in `apps/plite`. That app serves Plite examples (`apps/plite/tsconfig.json` includes `../www/src/app/(app)/examples/plite/**`). Its `mentions.tsx` is Slate's mentions port and does not use Plate's `useCombobox`. The open gate belongs to Plate's combobox: `docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md:409` ("the settle mechanism has no emulated Android or WebKit proof") and `:452-453`, which name `settleInput()` through `useCombobox`. A green case 5 on `apps/plite` would mark that gate closed without running its code. That is the fake-green result this plan exists to remove. Shard 004's probe used www's `/blocks/mention-demo` for exactly this reason.
**Suggestion**: Run case 5 against a www page that mounts the Plate combobox, reached through `adb reverse` to a dedicated www server, or drop the gate claim from the plan, the topic and `review_scopes`.

### 5. [warning] The private lane has no import path, and adb plumbing gets two homes
**Location**: plan lines 196-201 (`packages/test/src/device`, private), 218 (`apps/plite/playwright.device.config.ts`), 189 (`tooling/device/android.mjs`), 215 ("the internal Android module")
**Finding**:
- `@platejs/test`'s `exports` has no `./device` entry.
- `apps/plite` consumes `packages/test/dist`: `apps/plite/scripts/build-browser-if-stale.mjs:17-24` freshness-checks `dist/playwright/index.js`.
- Source aliasing derives only from `exports` (`config/workspace-source-entries.mjs:28-71`).
- So `apps/plite` cannot import `src/device` by package name. Adding an export publishes the lane, which contradicts the Defaults and Out of scope. A cross-package relative import into `src` bypasses the dist build the runner freshness-checks.
- Separately, `tooling/device/android.mjs` (setup, calibrate, doctor) and "the internal Android module" in `packages/test` both need adb, forwarding and the key-map cache format. The plan names neither owner, so either a package imports from `tooling/` or the adb code exists twice.
**Suggestion**: Pick one home. Either put the lane, its config and the six cases inside `packages/test` (a private workspace folder with its own Playwright config that opens `apps/plite`'s served build), or add an unpublished entry excluded from `files` and `publishConfig`. Make `tooling/device/android.mjs` a thin CLI over the same module.

### 6. [warning] Once the fallbacks fail loudly, the paste oracle correlates by length on a 200-entry ring
**Location**: plan lines 148-154; `packages/test/src/playwright/dom-text-actions.ts:38-67`; `harness-input.ts:120-145, 162-193`; `packages/plitejs/src/react/editable/editing-kernel.ts:429` (`EDITABLE_KERNEL_TRACE_LIMIT = 200`)
**Finding**:
- `didPasteApplyText` first checks `afterTrace.slice(beforeTraceLength)` for a paste `insert-data` entry. The kernel trace is a 200-entry ring, so in a long test `beforeTraceLength` is 200, the slice is empty, and detection falls back to a text comparison. That is the same defect the plan fixed for the native trace with `seq`.
- Today a false "not applied" causes a silent second insert. After the cut, it fails the test. Whether a paste applied becomes a hard oracle, and nobody checked that oracle.
- The plan also makes "kernel trace retention its own switch" and leaves its default unspecified. With retention off, the trace check never fires.
- The proposed harness test ("a native paste that changes nothing fails") covers the true negative only.
**Suggestion**: Clear the kernel trace before each paste (`clearEditableKernelTrace` exists), or give kernel entries a `seq` and compare by `seq`. Add one test for the false-negative boundary: a paste that applied, inside a test whose kernel trace is already full.

### 7. [warning] The paste cut adds a mode flag beside verbs that already exist, and it misdescribes the fallbacks
**Location**: plan lines 148-154; topic "Public API" paste pair; `packages/test/src/playwright/types.ts:890, 1101, 1396-1403, 947-948`; `harness-input.ts:107-113, 168-201`; `clipboard.ts:143-164`
**Finding**:
- The harness already has explicit verbs: `pasteNativeText` (native, no fallback) and `pasteEventPayload` (synthetic event). Once the fallbacks are deleted, `pasteText` is `pasteNativeText` with a check. Adding `{ transport: 'handle' }` produces a third shape.
- `transport` already means `'native' | 'synthetic'` on `ime.compose` and the scenario step types. Paste would give the same key another vocabulary.
- The step calls the third fallback "the handle retry after a native paste changed nothing". For `pasteHtml` that branch dispatches a synthetic `ClipboardEvent` (`harness-input.ts:200`), not the handle.
- Branch (b) sends WebKit and mobile user agents through a synthetic paste event, which runs the DOM paste handler, including Plite's Android path under the Pixel 5 user agent. With only `'handle'` as the opt-in, those callers switch to `insertData` through the handle, which skips the DOM handler. That cuts the Android-code-path coverage the plan's Pixel 5 default keeps the project for.
- 79 matching paste lines across 10 `apps/plite` spec files run on the `firefox`, `mobile` and `webkit` projects. The proof names only "the Firefox and WebKit paste specs" and leaves out the `mobile` project.
- "Record the step's transport claim with the existing `BrowserTransportClaim`" has no recording surface. That type is scenario metadata produced by `classifyScenarioTransportClaim` (`scenario-replay.ts:1124-1154`), and a direct `editor.clipboard.pasteHtml` call has no step record. The scenario step kinds `pasteHtml` and `pasteText` (`types.ts:947-948`) also need the change, and the plan does not mention them.
**Suggestion**:
- Make `pasteText` and `pasteHtml` native-only.
- Keep `pasteEventPayload` as the named synthetic verb, and add one named handle verb if a caller needs it.
- Resolve "this engine cannot write the clipboard" once per project, through a capability gate on the project, instead of at 79 call sites.
- Derive the claim from the verb that ran.
- Prove on all four Plite projects.

### 8. [warning] The Pixel 5 relabel's proof cannot fail
**Location**: plan lines 233-235
**Finding**: `tooling/plite/donor/proof/mobile-device-proof.mjs`'s scoped branch (lines 104-147) checks `classifyBrowserMobileTransportProof('agent-browser-ios' | 'appium-android' | 'appium-ios')` and an empty schema-1 bundle. It never reads the Pixel 5 project's claim. That claim comes from `classifyScenarioTransportClaim` (`scenario-replay.ts:1128-1151`, which returns `playwright-mobile-viewport`, `playwright-mobile-keyboard` or `mobile-semantic-handle`). It is pinned by `packages/test/test/proof/scenario.test.ts:1638-1644` and `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:3522, 3843`. The named check passes whatever the label says, so the step's own risk, "over-claiming returns", has no guard. The relabel also changes the published `BrowserTransportClaim` union, and the plan has no best-api or changeset step for it.
**Suggestion**: Name the new union member and update `classifyScenarioTransportClaim`. Make `scenario.test.ts`'s mobile cases the proof, because they fail on a wrong label.

### 9. [warning] Served-source identity is missing in Phase 1 and wrong in Phase 2
**Location**: plan lines 141-147 (#5137 spec), 218-223 ("read the page's build id ... the build id matching `HEAD`"); `apps/www/playwright.config.ts:42-49`; `apps/plite/scripts/build-app-if-stale.mjs:46`
**Finding**:
- The #5137 spec runs under www's config, which has `reuseExistingServer: true` on `:3000`. The plan adds no identity check for it, though `verify.mdc:182-184` forbids reusing another checkout's server and closes a local fix only "with known serving-source identity". Shard 004's dev server already belonged to another session.
- In Phase 2, "build id matching `HEAD`" is wrong for this repository's normal state. The user owns commits, so proof runs on a dirty working tree, and `HEAD` describes none of the served bytes.
- `apps/plite` already writes a content fingerprint, `out/.editor-proof-build.json`, through `createBuildManifest` (`plite-proof-inputs.mjs:481-501`).
**Suggestion**: Read the served `.editor-proof-build.json` fingerprint through the reverse port, and compare it with `inspect` over the current inputs. For the #5137 lane, start a dedicated www server on a free port with `PLAYWRIGHT_BASE_URL`, as shard 006's command does, and record its checkout.

### 10. [warning] The bundle proof uses a script outside the repository, and benchmark readers fail silently
**Location**: plan lines 160-174
**Finding**:
- "The esbuild production bundle from shard 007's `measure/` script": shard 007 line 120 says the scripts are "`measure/build.mjs`, `measure/stub.mjs` and `measure/split.mjs` in this scratch directory". `git ls-files --cached --others` finds none of them. A teammate or a cross-reviewer cannot rerun the step's only proof.
- Several handle readers use optional chaining. For example, `benchmarks/slate-v2/donor/browser/react/huge-document-browser-trace.mjs:329, 494, 696-697` reads `root?.__pliteBrowserHandle ?? null` and `!!root?.__pliteBrowserHandle?.selectRange`. If an install is missed, those benchmarks measure a different path and do not fail.
- The step's proof, one Plite and one www run, runs no benchmark driver.
- Drivers that build their own pages (`react-text-flow-browser-matrix.mjs:719` `setContent`, `code-block-text-flow-browser.mjs:562` `route`, `huge-document-browser-trace.mjs:158` `createServer`) need the install in their page entry, not in the Node driver.
**Suggestion**: Commit the measurement as a small script under `tooling/` or `packages/plitejs/benchmarks/`, or use an existing bundle-size check. Make every handle reader fail with "handle not installed", and run each page-building driver once.

### 11. [warning] The doctrine repair list is wrong in both directions and sits in the wrong phase
**Location**: plan lines 236-242
**Finding**:
- It edits text whose promise the plan keeps. The gate is unchanged: schema 1 still requires `directAppium: true`, and `mobile-device-proof.mjs` still says "Run the Appium/device lane". `commands.md:199` ("requires actual Appium Android/iOS artifacts") and `packages/test/README.md:94-104` are therefore still true. Editing them would contradict the gate.
- It leaves out promises that Phase 1 changes:
  - `verify.mdc:264-266` ("`clipboard.pasteHtml` and `clipboard.pasteText` can fall back to synthetic events or editor handles")
  - the public docs that teach `openExample` from `@platejs/test/playwright` (`docs/plite/reference/public-docs/concepts/15-editing-behavior.mdx:154`, `16-selection-and-dom.mdx:242`), which break without `installBrowserHandle()`
  - `packages/plitejs/test/react/kernel-authority-audit-contract.ts:768, 817, 962-1124`, which pins `browser-handle` import edges
- The repair sits in Phase 2, so if Phase 2 is reverted or quarantined, Phase 1's changed promises are never repaired.
- Phase 1 changes published behavior: `plitejs` no longer attaches the handle on mount, `@platejs/test` changes paste semantics and gains `captureCaretPixels` and new trace fields, and the `BrowserTransportClaim` union changes. There is no changeset step and no Best API doctrine-repair step, which AGENTS requires for reusable public API changes.
**Suggestion**: Move doctrine, docs and changesets into the phase that changes each promise. Leave the gate-bound text alone until Phase 3.

### 12. [warning] The macOS lane has its own gaps
**Location**: plan lines 120-147; topic line 107
**Finding**:
- (a) A fresh `--user-data-dir` with "only" `--remote-debugging-port` shows Chrome's first-run UI. That window becomes the key window, so `CGEventPostToPid` and the HID tap both send keys to the dialog. `--no-first-run` and `--no-default-browser-check` do not change rendering.
- (b) Warmth is unspecified. If the spec launches Chrome in a worker fixture, `repeatEach` gives each repeat a new worker (first-pass C4), so each of the five "warm" runs cold-launches Chrome and repeats the IMK activation race (shard 006 section 2).
- (c) "One trusted keyCode-229 keydown per posted key" does not hold for the plan's own `2` after the commit. With no marked text, Chrome sends the real keyCode. The macOS rule also stays a second ad hoc judge beside `judgeDeviceWitness` (first-pass B14).
- (d) The topic's proof surface is "OS screenshots". The plan's `captureCaretPixels` uses a Playwright capture with `caret: 'initial'`. If the lane uses OS capture, as shard 006 chose for compositor fidelity, the new public helper has no caller. If it uses Playwright capture, the topic is wrong.
- (e) Android gets a lock per serial. TIS and HID get no host lock, so two sessions running the spec fight over the system input source.
- (f) "The spec log shows ... no Playwright launch switches" is the spec reporting its own argv. Read `ps -o args -p <pid>` instead. CDP `Browser.getBrowserCommandLine` answers only under `--enable-automation`.
- (g) `TISCopyInputSourceForLanguage("zh-Hans")` selects nothing and can return another zh-Hans source. The lane selects `com.apple.inputmethod.SCIM.ITABC` by id.
**Suggestion**: Launch Chrome once in `globalSetup` with `--no-first-run --no-default-browser-check` and record its pid as the warmth witness. Express per-key expectations as signature data (229 for preedit and the commit, the real keyCode for `2`). Pick one capture path and keep `captureCaretPixels` private to the spec until a second caller exists. Take a host lock for TIS and HID. Check `status` against the source id.

### 13. [warning] No step verifies that a content touch lands, and the trace records no touches
**Location**: plan lines 186-188 (mapping probe), 196-210
**Finding**: The CSS-to-screen probe runs once. No step builds the mapping or checks each content touch. The native trace records only `selectionchange`, `beforeinput`, `input`, the composition events and, after Phase 1, `keydown` (`native-event-trace.ts:47-54, 429-435`). It records no `touchstart` or `pointerdown`, so "any input with no matching lane touch fails" has no page-side witness for content taps. A toolbar tap that lands a toolbar-height off either fails as a product-looking assertion in cases 4 and 6 or hits a neighboring control. First-pass A9's per-touch `clientX`/`clientY` check was not adopted.
**Suggestion**: Add `pointerdown` with client coordinates to the trace, and fail a content touch that lands more than a few pixels from its intended CSS point.

### 14. [warning] "Files that bug" is an unauthorized outward message, and a red case's committed state is undefined
**Location**: plan lines 177-180, 231-232
**Finding**: Filing an issue is a message to other people. AGENTS "Messages and shared resources" requires explicit authorization for each one, and the Routing table sends issue drafts to `maintainer`'s issue-draft mode. The plan also does not say what a 5-of-5 red case becomes in the tree, whether `test.fail`, kept red or quarantined. A 3-of-5 result fits neither exit.
**Suggestion**: Write "drafts an issue through maintainer issue-draft mode for the owner". Mark known-bug cases with `test.fail()` and the issue link. Treat a split result as a lane defect until it is attributed.

### 15. [nit] Contradictions and loose ends in step wording
- Line 204 says "the per-run trace has no cap, and an overflow fails the run". Without a cap there is no overflow. State which buffer overflows, or drop one clause.
- Lines 182-185 describe three conditions (with a dump, without one, and after force-stopping Chrome) but name "two event traces" as proof. An events-only comparison can also miss an accessibility-mode effect that changes timing but not events. Add `dumpsys accessibility` and a page-side probe, as first-pass B6 proposed.
- The device cases need a `testDir` outside `apps/plite/tests/plite-browser`. Otherwise `plite-ci.yml`'s four Chromium shards collect them. The on-device bypass test inside `packages/test` needs a capability gate, because `bun test test/node test/proof` runs in `pnpm check` on CI. The plan specifies neither, and both matter for "no new GitHub Actions minutes".
- Line 134 adds `isTrusted` to `keydown` only. The judge requires trusted `beforeinput`, `input` and composition events too.

### 16. [nit] Stale or unsupported claims in the trail
- Decision log row 6 cites "scratchpad interrogate/reviewer-a.md, reviewer-b.md, reviewer-c.md" as evidence. Teammates cannot open those, and AGENTS Source authority limits citations to tracked paths.
- The status line, "interrogated twice", was written before this pass's findings existed.
- The topic intro still promises "receipts for raw devices".
- The topic's comparison table lists "real touches over adb (proven on an emulator)" as a current `@platejs/test` capability. It was one throwaway probe.
- `#6022` is Slate's issue (shard 005 row S4), but the plan and topic write it unprefixed, unlike the Slate numbers beside it.
- "7 open Android gates" names no check that could falsify the count.
