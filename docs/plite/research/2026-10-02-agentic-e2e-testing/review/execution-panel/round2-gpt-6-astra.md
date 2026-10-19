## Findings

### 1. [critical] Failed port acquisition removes another session’s reverse

**Location**: [global-setup.ts:109](/Users/zbeyens/git/plate-2/apps/plite/tests/device/global-setup.ts:109), [android.ts:734](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:734)

**Finding**: The `--no-rebind` fix protects acquisition but cleanup deletes the mapping it refused to acquire.

**Evidence**: `prepareSerial` adds the reverse to `run.reverses` before calling `reversePort`. If another session owns that port, acquisition throws. Global setup then calls `closeRun`, which passes the recorded port to `releaseRunResources` and removes the other session’s mapping. Calibration has the same defect because its `finally` always removes the reverse. The recorder also initializes its reverse ownership before acquisition.

**Suggestion**: Record ownership only after successful acquisition. Apply this to all three callers.

### 2. [critical] Stale-lock takeover can evict a fresh owner

**Location**: [android.ts:148](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:148), [macos-ime.swift:81](/Users/zbeyens/git/plate-2/tooling/ime/macos-ime.swift:81)

**Finding**: Exclusive creation does not make the subsequent stale-lock takeover exclusive.

**Evidence**: Two contenders can read the same dead owner. Contender A renames the stale file and creates its fresh lock. Contender B then executes its delayed rename against A’s fresh lock, deletes it, and creates its own. Both return successfully and can mutate shared device or input-source state.

An in-memory probe executing the actual Android acquisition function with that interleaving returned successful acquisition for both owners. Swift uses the same read-check-rename sequence.

**Suggestion**: Serialize stale reclamation with acquisition. An unconditional rename of the current pathname cannot establish that the file being removed is the stale file previously inspected.

### 3. [critical] macOS restore still runs without acquiring ownership

**Location**: [macos-ime.swift:171](/Users/zbeyens/git/plate-2/tooling/ime/macos-ime.swift:171)

**Finding**: The new live-owner check leaves a race between restoration and a new run.

**Evidence**: `restore` checks `lockOwner()` once, then reads the journal, selects the previous source, and deletes both files without acquiring a lock. If restoration starts while no lock exists, a new run can acquire ownership after that check. Restoration can then consume the new run’s journal, switch its input source, and delete its live lock.

There is also a window between `select` creating the lock file and writing its owner. During that window, `lockOwner()` returns `nil`, allowing restoration to delete the newly acquired lock.

**Suggestion**: Require restore to acquire exclusive ownership before reading or changing the journal and input source. Treat an unreadable existing lock as occupied.

### 4. [warning] Malformed protocol messages still crash the relay

**Location**: [guard.ts:192](/Users/zbeyens/git/plate-2/packages/test/src/device/guard.ts:192)

**Finding**: The new catch handles invalid JSON syntax, but valid JSON with an invalid message shape throws outside it.

**Evidence**: An in-memory probe of the actual callback produced:

- `{` closes the client.
- `null` throws when accessing `message.method`.
- `{"id":1,"method":42}` throws when calling `startsWith`.

Neither latter input closes the client through the intended rejection path. The exception escapes the socket’s event handler and can terminate the process hosting global setup, leaving resources for recovery.

**Suggestion**: Validate the parsed message’s object shape and field types before accessing them.

Verification used source inspection and in-memory probes only. No device, browser, server, or repository writes were used.
