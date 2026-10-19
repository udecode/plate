## Findings

### 1. [critical] The guard permits another DevTools transport

**Location**: [android.ts:993](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:993)

**Finding**: `Target.exposeDevToolsProtocol` bypasses the command filter.

**Evidence**: This command installs `window[bindingName].send(json)`, a direct channel to the browser target. A client can invoke it, then use allowed `Runtime.evaluate` to attach a session and send `Input.*` through that binding. Those commands never cross the relay. An `Unidentified` replay inside a real tap can then pass the documented witness limitation.

The installed Playwright protocol definitions document this channel, and installed `chromium-bidi` uses it. This path was not exercised on Android.

**Suggestion**: Refuse `Target.exposeDevToolsProtocol` and include it in the bypass proof.

### 2. [critical] A canceled paste can count as applied

**Location**: [dom-text-actions.ts:57](/Users/zbeyens/git/plate-2/packages/test/src/playwright/dom-text-actions.ts:57)

**Finding**: The paste oracle treats a planned insertion as a completed insertion.

**Evidence**: `runtime-before-input-events.ts:443` records the `insert-data` decision before invoking `onDOMBeforeInput`. That handler can cancel the event and return handled at lines 798–817 without changing the document. `didPasteApplyText()` still returns `true` from the trace alone. The page-error listener cannot catch cancellation because it throws nothing.

**Suggestion**: Record successful command completion or inspect document effects. A prepared command is insufficient proof, including for identical-text pastes.

### 3. [critical] Android locks do not enforce exclusive ownership

**Location**: [android.ts:127](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:127), [android.ts:773](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:773)

**Finding**: Two processes can acquire the same serial, and restoration can dismantle a live owner’s resources.

**Evidence**: Acquisition separately reads and overwrites `lock.json`. Two processes can both observe no lock and proceed. `releaseSerialLock()` deletes the file without checking ownership. `restoreDevice()` neither acquires the lock nor refuses a live owner before changing settings, closing recorded targets, removing ports, and deleting the lock.

**Suggestion**: Use atomic acquisition and an ownership token. Require matching ownership for release, with explicit stale-owner recovery.

### 4. [critical] Losing the macOS lock restores the winning session’s input source

**Location**: [macos-ime.swift:152](/Users/zbeyens/git/plate-2/tooling/ime/macos-ime.swift:152), [homepage-ime-native.spec.ts:455](/Users/zbeyens/git/plate-2/apps/www/tests/native/homepage-ime-native.spec.ts:455)

**Finding**: A test restores global input state even when it never acquired ownership.

**Evidence**: Two runs can pass setup’s status check before either selects Pinyin. After one acquires the lock, the other’s `selectInputSource()` fails. The losing test still executes `restoreInputSource()` in `finally`. Swift’s `restore` accepts no owner and unconditionally restores the saved source and removes the winning run’s lock. Acquisition itself also uses a nonexclusive check followed by replacement.

**Suggestion**: Acquire one atomic lock per run and require its token for restoration.

### 5. [critical] Partial setup loses the original Gboard settings

**Location**: [android.ts:421](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:421), [android.ts:699](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:699)

**Finding**: Settings are changed before their original values are persisted.

**Evidence**: `flipSettings()` taps each toggle and accumulates originals only in memory. `setupLockedDevice()` records them after the entire function returns. If a later toggle is missing, adb fails, or the process stops during the intervening waits, earlier changes remain but `restore.json` does not contain their originals. Running setup again sees the already-changed values and cannot recover them.

**Suggestion**: Persist each original value before its first mutation.

### 6. [critical] Fixed adb ports overwrite resources belonging to other runs

**Location**: [android.ts:212](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:212), [global-setup.ts:97](/Users/zbeyens/git/plate-2/apps/plite/tests/device/global-setup.ts:97)

**Finding**: Forwarding claims existing mappings and later deletes them.

**Evidence**: Every invocation starts host forwarding at port `9500`. Two runs targeting different serials therefore collide despite holding different serial locks. The helpers omit adb’s `--no-rebind`, then record the mapping as owned. Reverse mappings have the same problem. Cleanup removes the overwritten mapping rather than restoring its predecessor. The restore CLI similarly assumes ownership of fixed port `9599`.

**Suggestion**: Allocate host forwards with `tcp:0`; refuse reverse collisions with `--no-rebind`. Record ownership only after successful acquisition.

### 7. [critical] Target cleanup failure force-stops unrelated Chrome work

**Location**: [android.mjs:44](/Users/zbeyens/git/plate-2/tooling/device/android.mjs:44)

**Finding**: Recovery escalates an owned-target failure into stopping the entire Chrome application.

**Evidence**: Any connection or `Target.closeTarget` error runs `adb shell am force-stop com.android.chrome`. A timeout while recovering one recorded tab therefore interrupts every Chrome tab and session on that device. Owning one target does not authorize stopping the browser.

**Suggestion**: Preserve the unresolved target in recovery state and report the failure. Remove the application-wide fallback.

### 8. [critical] Korean restoration cannot recover from partial setup or interrupted cleanup

**Location**: [android.ts:441](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:441), [android.ts:796](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:796)

**Finding**: Restoration assumes Korean exists whenever the journal mentions it.

**Evidence**: `addKorean()` records the language before navigating through the add flow. A failure before `Done` leaves a record for a language that was never installed. `restoreDevice()` then unconditionally calls `removeKorean()`, which throws when its label is absent. The same failure occurs after successful removal if cleanup stops before deleting `restore.json`. Subsequent restores cannot finish restoring the subtype, DND state, or lock.

**Suggestion**: Reconcile against actual installed languages and treat an already-absent owned language as restored.

### 9. [warning] Failed target cleanup erases the recovery information

**Location**: [global-setup.ts:67](/Users/zbeyens/git/plate-2/apps/plite/tests/device/global-setup.ts:67), [android.ts:270](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:270)

**Finding**: Cleanup forgets targets even when closing them fails.

**Evidence**: `closeRun()` swallows `Target.closeTarget` errors, then passes the target to `releaseRunResources()`. That function unconditionally removes its ID from `restore.json`. A later recovery invocation has no target ID to retry.

**Suggestion**: Remove journal entries only after successful cleanup or confirmation that the resource is already absent.

### 10. [warning] The witness accepts orphan input delivery

**Location**: [witness.ts:118](/Users/zbeyens/git/plate-2/packages/test/src/device/witness.ts:118)

**Finding**: Pairing checks apply only to `beforeinput`. Trusted `input` and `compositionupdate` events need no predecessor.

**Evidence**: A read-only invocation of the actual judge, using one trusted event and the same key-step window, returned:

```text
input                []
compositionupdate    []
beforeinput          ["unpaired-input"]
```

These incomplete traces are distinguishable from the documented equivalent replay. The judge simply does not validate their lifecycle.

**Suggestion**: Track permitted event sequences and reject orphan delivery events while preserving observed composition ordering.

### 11. [warning] Handle pastes reject successful non-text insertions

**Location**: [dom-text-actions.ts:57](/Users/zbeyens/git/plate-2/packages/test/src/playwright/dom-text-actions.ts:57)

**Finding**: The success oracle cannot recognize a handle insertion that changes structure without changing plain text.

**Evidence**: `browser-handle.insertData()` records its command under event family `repair`. The oracle recognizes only `paste` and `beforeinput`; its remaining branches require changed text or a previously expanded selection. Pasting an image into an empty editor can succeed while satisfying none of those branches, causing “paste did not apply.”

**Suggestion**: Share a completed-insertion signal across transports instead of inferring completion from text and event-family names.

### 12. [warning] Source fingerprints ignore untracked file contents

**Location**: [serving-fingerprint.mjs:13](/Users/zbeyens/git/plate-2/tooling/scripts/serving-fingerprint.mjs:13)

**Finding**: The fingerprint does not identify every uncommitted change as claimed.

**Evidence**: It hashes `git diff HEAD` and the names returned by `git ls-files --others`. Editing an existing untracked file changes neither input. Changes to this task’s untracked providers, device implementation, or configuration can therefore produce identical fingerprints despite different executable code.

**Suggestion**: Hash untracked file contents with their paths.

Review remained read-only. Browser, Android, and macOS integration scenarios were not run.
