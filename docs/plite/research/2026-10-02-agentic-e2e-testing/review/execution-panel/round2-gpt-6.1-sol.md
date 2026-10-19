## Findings

Rechecked against the current files after concurrent fixes. Resolved findings are omitted.

### 1. [critical] A selection-only commit still counts as an applied paste

**Location**: [harness-input.ts:95](/Users/zbeyens/git/plate-2/packages/test/src/playwright/harness-input.ts:95), [with-dom.ts:219](/Users/zbeyens/git/plate-2/packages/plitejs/src/dom/plugin/with-dom.ts:219)

**Finding**: The new oracle accepts any new commit tagged `paste`, even when the handler inserts nothing.

**Evidence**: The DOM command wrapper adds `paste` to every non-false transaction result, including selection-only transactions. A headless probe registered an `insertData` handler that only moved the selection. The resulting commit had `changes.empty === true`, version `1`, and tags containing `paste`. The text remained `"abc"`, but the new predicate returned true. The empty-HTML regression test does not cover this path.

**Suggestion**: Track whether the transport committed an insertion. A tag and version change cannot establish that outcome.

### 2. [critical] Stale-lock rollback still allows simultaneous owners

**Location**: [android.ts:168](/Users/zbeyens/git/plate-2/packages/test/src/device/android.ts:168), [macos-ime.swift:86](/Users/zbeyens/git/plate-2/tooling/ime/macos-ime.swift:86)

**Finding**: Checking ownership after renaming the lock leaves an acquisition gap. Linking the live lock back cannot repair that gap.

**Evidence**: A and B read the same stale lock. A takes it and starts work. B then renames A’s live lock aside. Before B restores it, C exclusively creates the now-missing lock and starts work. B’s rollback link fails because C’s file exists; both implementations then unlink the aside file. A and C now act as owners concurrently.

An in-memory interleaving probe of the actual Android function reproduced successful acquisitions by both owners. Concurrent restore/setup operations can overwrite the shared journal and change another run’s settings.

**Suggestion**: Serialize stale inspection and takeover with a stable coordination lock. Never remove a live ownership marker while deciding whether reclamation was valid.

### 3. [critical] Input pairing accepts an unrelated insertion

**Location**: [witness.ts:166](/Users/zbeyens/git/plate-2/packages/test/src/device/witness.ts:166)

**Finding**: `pendingBeforeInputs` counts available events without checking whether a `beforeinput` belongs to the subsequent `input`.

**Evidence**: The judge accepts this trusted sequence inside one Backspace gesture:

1. `keydown`, key `Backspace`.
2. `beforeinput`, type `deleteContentBackward`.
3. `input`, type `insertText`.

A direct call returned no violations. A canceled native deletion followed by trusted `execCommand('insertText')` can produce this distinction. The insertion consumes the deletion’s pending credit, although their recorded operation types differ. This defeats the new rejection rule for distinguishable input bypasses.

**Suggestion**: Match compatible event records instead of consuming a counter, and account for canceled `beforeinput` events.
