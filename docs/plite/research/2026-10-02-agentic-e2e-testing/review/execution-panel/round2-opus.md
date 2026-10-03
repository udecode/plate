## Findings

Several files changed after `round2.diff` was cut: global-setup.ts, android.ts, guard.ts, witness.ts, harness-input.ts, device-witness.test.ts, macos-ime.swift and record-witness-fixtures.mjs. I checked each finding against the current tree and say where a later edit already fixes it.

### 1. [critical] Teardown removes the reverse that `--no-rebind` just refused (fixed after the snapshot)
**Location**: `apps/plite/tests/device/global-setup.ts` prepareSerial (diff version); `android.ts` calibrateKeyboard `finally`; `record-witness-fixtures.mjs` `owned` init
**Finding**: In the diff, `run.reverses.push('tcp:<port>')` runs before `reversePort()`. If another session already holds that device port, `--no-rebind` throws. Global setup then calls teardown, and `closeRun` passes `releaseRunResources` to `adb reverse --remove` on the other session's mapping. `calibrateKeyboard` removed `tcp:${port}` unconditionally, and the recorder pre-seeded `reverses`.
**Evidence**: The path is reversePort throw → catch → `teardown()` → `closeRun` → `removePorts`. That defeats the round-1 fix. The www port, typically 3000, is the one a developer is most likely to have reversed by hand.
**Suggestion**: The current tree already pushes after the call in all three writers and adds the `reversed` flag in calibrate. That edit is correct.

### 2. [warning] Input pairing still lets a same-type trusted `input` fill a canceled `beforeinput`
**Location**: `packages/test/src/device/witness.ts:167-187` (current); `apps/plite/tests/device/bypass.device.ts:126-146`
**Finding**: A beforeinput the editor cancels produces no `input`. Its inputType stays pending, so an `execCommand('insertText')` input in that window pairs with it. The witness passes.
**Evidence**: In the 30 current `device-witness.json` traces, 50 of 228 real steps have a beforeinput with no input. All are richtext model-owned typing: bold-toggle a/b/c, strip-replace h/e/l/o/Space and its strip tap. I injected a trusted `input` (insertText, no beforeinput) into bold-toggle's real `a` step and `judgeDeviceWitness` returned `[]`, on the post-snapshot type-matching code too. The bypass test runs its execCommand probe only on `plaintext`, where taps emit their own input events, so it cannot see this. The new "another type" unit test closes only cross-type injection.
**Suggestion**: Record `defaultPrevented` per beforeinput after dispatch, either with a window bubble-phase listener or by reading the event in a `setTimeout(0)`. Pair an input only with an uncanceled beforeinput. Run the execCommand probe on `richtext`.

### 3. [warning] A case can reach adb or DevTools without any import that lint sees
**Location**: `lane.ts:45-54,227` (`DeviceLane.state: DeviceRunState`); `oxlint.config.ts:212-237`; `apps/plite/tests/device/lane.types.ts`
**Finding**: Cases receive `device.state.endpoint` (the guarded DevTools URL), `targetId` and `serial`. Node 22 provides `fetch`, `WebSocket` and `process.getBuiltinModule('node:child_process')` as globals, with no import. The override glob `*.device.ts` does not cover sibling helpers such as `device-reads.ts`, which cases already import. The regex also misses `playwright`, `playwright-core` and `node:module`.
**Evidence**: Two concrete bypass paths exist:
- `process.getBuiltinModule('node:child_process').execFileSync('adb', ['-s', device.state.serial, 'shell', 'input', 'text', 'x'])`, timed inside `device.keyboard.tap` (bypass.device.ts's own pattern), is sometimes an "equivalent" trace.
- A WebSocket to `device.state.endpoint`, then `Runtime.evaluate` running execCommand in a richtext step (finding 2), passes every time.

The lane.types.ts claim "A case cannot open its own DevTools connection" holds only for the `playwright` fixture.
**Suggestion**: The only field any case reads is `wwwURL` (mention-taps). Expose that, for example as `device.www`, and keep the run state lane-internal. Widen the override to `apps/plite/tests/device/**`, excluding bypass.device.ts and global-setup.ts. Add `no-restricted-globals` for `process`, `fetch`, `WebSocket`, `require` and `globalThis`. Add `playwright(-core)` and `node:(module|net|http)` to the regex.

### 4. [warning] Restore counts tabs as closed that Chrome will bring back
**Location**: `tooling/device/android.mjs:18-20, 33, 55-58, 59-70`
**Finding**: Restore treats a tab as closed in three cases: Chrome is not running, the old target id is no longer listed, or `--force-stop-chrome` ran. It then deletes the journal entry. Chrome on Android saves its tabs across process death and `am force-stop`, and restores them with new target ids on the next launch. So "Force-stopping Chrome closes every tab on the device" is wrong, and the `localhost:3410` tab comes back after the record is gone.
**Evidence**: The decision row "a journaled tab id Chrome no longer lists was skipped and restore deleted the journal" matches this. A Chrome restart is the usual reason an id disappears. I have not checked this on the emulator; a one-off check there would settle it.
**Suggestion**: Tag every lane navigation with a run fragment such as `#plate-device-run=<id>`. Journal that tag, and close tabs by URL through `/json/list`, the way the new `closeTabsAt` does.

### 5. [warning] calibrateKeyboard's new `finally` can skip its own cleanup (post-snapshot edit)
**Location**: `packages/test/src/device/android.ts:780-789`
**Finding**: `await closeTabsAt(...)` runs first in `finally`. If it throws (adb forward fails, or Chrome is frozen, stopped or never opened, for example `openUrl` failed after `reversed = true`), then `server.close`, `releaseRunResources` and `releaseSerialLock` are skipped. The fetch error also replaces the original error.
**Evidence**: The result is a leaked reverse and a stale lock that forces a `restore`, plus a misleading error message.
**Suggestion**: Catch inside `closeTabsAt`, or move it after the lock release and keep the original error.

### 6. [warning] Paste oracle accepted selection-only paste commits (mostly fixed after the snapshot)
**Location**: `packages/test/src/playwright/harness-input.ts:93-137`
**Finding**: The diff checked only the tag and the version. The plan's deviation row says "carries the `paste` tag and changes the document". `with-dom.ts:219-227` tags any insertData result that is not `false`, and `mutation-controller.ts:401-409` commits a paste-tagged no-change rebase when the insertion is empty. The current `changedRoots?.length` check closes this. Three things remain:
- It reads only the last commit, so any follow-up commit before the poll reads makes an applied paste report "did not apply".
- Every 100 ms poll serializes the full `change: commit.changes.toJSON()`.
- The `unknown` cast is duplicated in `harness-scenario.ts:502,516`.

No decision row shows the 87 harness paste calls rerun under the new oracle.
**Suggestion**: Type the handle's commit projection, export it, and expose `get.lastCommitSummary()` returning `{version, tags, changedRoots}` instead of `unknown`. Rerun the paste suites before closing.

### 7. [warning] The diff's guard still crashed on valid JSON that was not a command (fixed after the snapshot)
**Location**: `packages/test/src/device/guard.ts` relay `onMessage` (diff version)
**Finding**: Two frames threw inside the socket `data` listener: `JSON.parse('null')`, which fails at `message.method`, and `{"id":1,"method":5}`, which fails because `startsWith` is not a function. Either one kills the Playwright runner, so teardown never runs.
**Suggestion**: The current `parseCommand` fixes this.

### 8. [nit] Stale-lock takeover still has a race window
**Location**: `android.ts` acquireSerialLock; `macos-ime.swift` acquireLock
**Finding**: In the diff, two stale takers could both win. The post-snapshot link-back narrows that, but a third acquirer can create the lock between the rename and `linkSync`. The `EEXIST` escapes as a raw error, and the `finally rmSync(aside)` deletes the moved fresh lock. Swift ignores `link`'s result the same way.
**Suggestion**: Never leave the path absent. Serialize takeovers with a `lock.json.takeover` mutex created with `wx`, re-read the stale owner under it, then `rename(tmp, path)` over the stale file in place.

### 9. [nit] knownFailure decides on the first match, not on a settled value
**Location**: `lane.ts:624-658`
**Finding**: The loop exits as soon as `read()` equals either `observed` or `desired`. If `observed` is also an intermediate state of the fixed flow, for example `''` or a prefix for a dropped-input bug, a slow fix reads as still failing and the case stays green.
**Suggestion**: Poll until the value has not changed for about 500 ms (or the deadline passes), then classify.

### 10. [nit] The Backspace key class is stated as universal
**Location**: `lane.ts:96-103`
**Finding**: The recorded traces show `Backspace/8` only outside a composition (mention-taps). A delete key pressed while Gboard composes is IME-driven, either an English word with suggestions on or Korean jamo, so Chrome reports it as `Unidentified`/229. A future `type('helo\b')` would then fail as `wrong-key`.
**Suggestion**: Accept Backspace or Unidentified for delete keys until a trace with Backspace inside a composition is recorded.

### 11. [nit] The www identity check compares proxies
**Location**: `global-setup.ts:189-202`; `tooling/scripts/serving-fingerprint.mjs`
**Finding**: The check compares two whole-repo hashes taken at different moments. In this checkout other sessions edit files, so a write between the two calls fails setup with "serves <same cwd>, not this checkout". Two smaller gaps: `lstatSync` throws ENOENT if an untracked file disappears between `ls-files` and the read, and `git diff HEAD` without `--binary` ignores what changed inside tracked binary files.
**Suggestion**: First compare `git rev-parse --show-toplevel` of the server's cwd with the local one. Compare fingerprints only for a different checkout, and skip ENOENT entries.

### 12. [nit] Leftovers
**Location**: `lane.ts:190`; `oxlint.config.ts:212-237`; `witness.ts` `scriptEnd`
**Finding**:
- A stale "A product assertion…" JSDoc sits above `DeviceKnownFailure`'s.
- The override copies the base plitejs pattern text; extract a shared `plitejsImportPattern`.
- No unit case pins the narrowed `compositionend` exemption. A regression to "exempt every untrusted compositionend" would pass unnoticed.
