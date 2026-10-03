## Findings

### 1. [critical] Cleanup deletes evidence of resources it failed to release

**Location**: [global-setup.ts:67](/Users/zbeyens/git/plate-2/apps/plite/tests/device/global-setup.ts:67), [android.ts:256](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:256)

**Finding**: Teardown treats attempted cleanup as successful cleanup.

**Evidence**: `closeRun()` swallows target-close failures. `removePorts()` swallows every adb failure. `releaseRunResources()` then removes those targets and ports from the restore journal anyway. If Chrome becomes unresponsive or adb disconnects, recovery loses the identifiers it needs while the resources remain.

**Suggestion**: Use one durable resource owner. Remove journal entries only after confirming removal. Preserve failed entries and report incomplete cleanup.

### 2. [critical] Partial setup can permanently lose original Gboard settings

**Location**: [android.ts:699](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:699), `flipSettings()`

**Finding**: Original settings are recorded after the entire mutation sequence finishes.

**Evidence**: `flipSettings()` taps each toggle and accumulates originals in memory. Only after it returns does `setupLockedDevice()` persist `changedSettings`. A missing later toggle, adb failure, or interruption after the first tap leaves changed settings with no recorded originals. `setupDevice()` merely releases the lock. Subsequent `restore` cannot undo those changes.

**Suggestion**: Persist each original value before changing that setting. Make recovery inspect and reconcile partially applied operations.

### 3. [critical] Normal teardown does not restore device settings

**Location**: [global-setup.ts:83](/Users/zbeyens/git/plate-2/apps/plite/tests/device/global-setup.ts:83)

**Finding**: A successful run leaves setup changes and keyboard state behind.

**Evidence**: Returned teardown calls `releaseRunResources()` and `releaseSerialLock()`. It never calls `restoreDevice()`. Gboard settings, added Korean, the selected subtype, and physical-device Do Not Disturb remain changed. The plan explicitly says global teardown runs restore; the deviations table does not authorize this omission.

**Suggestion**: Include device-state restoration in the owned run lifecycle, before releasing its lock.

### 4. [critical] The locks do not provide exclusive ownership

**Location**: [android.ts:127](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:127), [macos-ime.swift:117](/Users/zbeyens/git/plate-2/tooling/ime/macos-ime.swift:117)

**Finding**: Both lock implementations use a non-atomic check followed by a write.

**Evidence**: Two processes can both read “no lock,” pass the checks, and overwrite the lock file. Both then mutate the same device or host input source. Swift’s atomic file replacement makes the write atomic; it does not make acquisition exclusive. Android release also deletes the lock without checking its owner.

**Suggestion**: Acquire ownership with an atomic exclusive operation. Require the acquired ownership token for release.

### 5. [critical] Restore can dismantle another live session

**Location**: [android.ts:773](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:773), [macos-ime.swift:152](/Users/zbeyens/git/plate-2/tooling/ime/macos-ime.swift:152)

**Finding**: Neither restore path checks whether another live process owns the state being restored.

**Evidence**: Android restore closes recorded targets, removes mappings, changes settings, and deletes the serial lock without acquiring ownership. Swift restore likewise changes the input source and deletes the host lock unconditionally. The IME test always calls restore in `finally`, so a `selectInputSource()` rejection for another owner can be followed by deleting that owner’s lock.

**Suggestion**: Require matching ownership for normal teardown. Recovery must acquire exclusive ownership and refuse an existing live owner before touching resources.

### 6. [critical] Fixed adb ports can overwrite another session’s mappings

**Location**: [android.ts:212](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:212), [global-setup.ts:97](/Users/zbeyens/git/plate-2/apps/plite/tests/device/global-setup.ts:97), [android.mjs:25](/Users/zbeyens/git/plate-2/tooling/device/android.mjs:25)

**Finding**: Mapping creation assumes that fixed ports belong to this invocation.

**Evidence**: Each invocation starts its DevTools ports at `9500`; restoration uses `9599`. The adb calls allow rebinding and never inspect existing mappings. Runs on different serials hold different locks but share host forward ports. Existing reverse mappings are also overwritten. Teardown removes the mappings instead of restoring what existed before.

**Suggestion**: Allocate host forwards dynamically. Refuse occupied reverse mappings or record and restore their previous destinations.

### 7. [critical] Recovery force-stops all Chrome sessions

**Location**: [android.mjs:44](/Users/zbeyens/git/plate-2/tooling/device/android.mjs:44)

**Finding**: Failure to close one owned target escalates to stopping the entire Chrome application.

**Evidence**: Any connection or target-close exception executes `adb shell am force-stop com.android.chrome`. That stops unrelated tabs and browsing sessions, not just the recorded target. A DevTools timeout does not establish ownership of every Chrome resource.

**Suggestion**: Preserve the unresolved target in the recovery journal and fail explicitly. Do not escalate target cleanup into application-wide termination.

### 8. [critical] The guard permits a second CDP channel that bypasses its filter

**Location**: [android.ts:993](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:993)

**Finding**: Blocking `Input.*` and `Target.sendMessageToTarget` leaves `Target.exposeDevToolsProtocol` unrestricted.

**Evidence**: A browser-session client can expose the protocol on the owned page, then use permitted `Runtime.evaluate` calls to invoke the injected binding. Commands sent through that binding reach an internal browser connection without passing through this relay’s filter. Chromium’s connector dispatches the binding payload directly to its browser agent host. [Chromium implementation](https://chromium.googlesource.com/chromium/src/%2B/c81dc1b550aa5e3ef392aedd34926d6f348271f1/content/browser/devtools/protocol/target_handler.cc)

This is a source-level bypass path; no device replay was run.

**Suggestion**: Refuse protocol-export commands and add this tunnel to the existing guarded-connection bypass proof.

### 9. [critical] An ignored paste can satisfy the paste oracle

**Location**: [dom-text-actions.ts:57](/Users/zbeyens/git/plate-2/packages/test/src/playwright/dom-text-actions.ts:57)

**Finding**: An `insert-data` trace entry proves an attempted command, not an applied paste.

**Evidence**: `applyEditableCommand()` returns whether clipboard insertion was handled. `applyEditablePaste()` discards that return value and still returns the command for tracing. `didPasteApplyText()` then immediately returns `true`, even if text and selection did not change.

A read-only execution of the actual predicate returned `true` for unchanged text, unchanged selection, and an `insert-data` trace containing an ignored payload.

**Suggestion**: Record and inspect the insertion outcome. Preserve identical-text detection through successful command acknowledgement rather than command presence.

### 10. [critical] Known failures accept unrelated regressions

**Location**: [lane.ts:608](/Users/zbeyens/git/plate-2/packages/test/src/device/lane.ts:608), [autocorrect-empty.device.ts:14](/Users/zbeyens/git/plate-2/apps/plite/tests/device/autocorrect-empty.device.ts:14)

**Finding**: `productAssertion({ expected: 'fail' })` accepts any thrown error as the named product failure.

**Evidence**: The documented autocorrect failure produces `BecuasegoBecause `. The case accepts every result other than `Because go`, including completely dropped input. Its remaining checks compare rendered text with whatever model text exists and require only a collapsed caret and visible keyboard. A new input-loss regression can therefore pass under the autocorrect annotation.

**Suggestion**: Assert the known failure’s observable signature separately. Accept that signature, fail when the desired behavior succeeds, and propagate every other failure.

### 11. [critical] The witness accepts distinguishable unpaired and wrong-key delivery

**Location**: [witness.ts:109](/Users/zbeyens/git/plate-2/packages/test/src/device/witness.ts:109)

**Finding**: Pairing applies only to `beforeinput`, and key validation ignores the recorded gesture’s key.

**Evidence**: The judge has no pairing branch for `input`. It also accepts Enter, Backspace, or Unidentified during any key step.

Read-only calls to the actual judge returned no violations for both:

- A trusted `input` with no preceding keydown or `beforeinput`.
- Enter plus `insertParagraph` inside a step labeled `h`.

These traces differ from the intended gesture. They are not the documented indistinguishable replay limit.

**Suggestion**: Pair delivered input with its preceding input sequence. Reject incompatible Enter and Backspace delivery when the recorded gesture identifies another key.

### 12. [warning] The serving fingerprint omits untracked file contents

**Location**: [serving-fingerprint.mjs:13](/Users/zbeyens/git/plate-2/tooling/scripts/serving-fingerprint.mjs:13)

**Finding**: Different source trees can receive the same proof fingerprint.

**Evidence**: The hash includes tracked diffs and untracked filenames, but no untracked contents. Editing an existing untracked `android.ts`, `lane.ts`, or installer leaves the fingerprint unchanged. Those files are central to this implementation, so the recorded identity cannot distinguish materially different versions.

**Suggestion**: Hash each untracked path and its contents using an unambiguous encoding.
