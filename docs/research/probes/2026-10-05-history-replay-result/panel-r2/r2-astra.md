## Findings

### 1. [critical] The Comments fix misses attachment notifications before `publish`

**Location**: Plan:204; `BaseCommentsPlugin.ts:433–439,710–720,902–910,1354–1363`.

**Finding**: Isolating listeners inside `publish` does not fully remove round 1’s false-refusal defect. A throwing attachment subscriber still makes an applied comment deletion report `blocked`, hides the error, and leaves history stuck at that entry.

**Evidence**: Register a throwing `subscribeAttachments` listener, then undo a range comment’s creation. `setThread` deletes the thread and anchor before calling `annotations.refresh` at line 713. The annotation store invokes change listeners without a boundary (`packages/plitejs/src/annotations/store.ts:306–307`), reaching Comments’ unprotected listener loop at line 439. This happens **before** the proposed `publish` boundary. `replayCreation` catches the exception and returns `comments-mutation-failed`; retry then returns `comments-thread-changed` because the thread is already absent.

**Suggestion**: Extend isolation to the attachment notification path. Prove this through the public `subscribeAttachments` API, checking the applied outcome, error delivery, continued notification, and subsequent history progress.

### 2. [warning] Synchronous failures have two incompatible contracts

**Location**: Plan:114,189,203.

**Finding**: The new error rule says an error found inside the call throws. The Replay failure default instead says a throwing owner or failed settlement returns `failed`. Both rules govern synchronous replay owners.

**Evidence**: With `replay: () => { throw error; }`, the error occurs inside `undo()`, after its claim. A synchronous owner returning an uncloneable applied value likewise causes settlement to fail inside the call. Line 114 requires throwing; lines 189 and 203 require a failed settlement. The supplied owner-error probe only covers an asynchronous owner (`history-timing.probe.ts:27–29`), so it cannot resolve this contradiction.

**Suggestion**: State whether all claimed-owner failures use `failed` and the sink, or whether delivery depends on when the failure occurs. Distinguish pre-claim document/transaction errors explicitly, and prove the synchronous case.

### 3. [warning] “Unchanged” callback timing does not match the incumbent

**Location**: Plan:177,193,205; `editable-dom-runtime.ts:1082,1113–1118,1126–1131`.

**Finding**: The plan says repair and callbacks remain one microtask after the call. Today they run in separate Promise continuations. Combining them after one deferred continuation changes observable ordering.

**Evidence**: For a document replay, `await resultPromise` resumes and repairs focus. Only after `replayHistory` resolves does the dispatcher’s `.then` invoke `onHistoryReplay` and `onFulfilled`. A microtask queued immediately after dispatch can therefore run between repair and callbacks. A combined continuation runs both before that microtask. The two newly specified mounted tests check focus eligibility, not this ordering.

**Suggestion**: Preserve the separate callback continuation explicitly. Otherwise acknowledge the timing change and add an assertion that distinguishes it from the incumbent.

### 4. [warning] The new drop-entry recovery lacks a matching acceptance proof

**Location**: Plan:189,201,203; `settle-failure.probe.ts`, P7.

**Finding**: Round 2 adds destructive branch recovery, but its named regression still targets only stuck `pending` and a subsequent `busy` result. That does not establish that the correct entry is removed, newer edits survive, older history remains reachable, or no unusable redo entry is created.

**Evidence**: P7 inserts a new document edit after settlement fails, then tries one undo. Merely clearing `pending` while retaining the poisoned session entry lets that newer edit undo successfully; the original stuck-head defect appears on the following undo. The probe’s poisoned owner also returns `applied` without changing an external value, so it does not demonstrate recovery from the actual external/history mismatch.

The default additionally needs an explicit acceptance exception: TaskHub-22 AC5 (`2026-09-19-taskhub-22-comment-creation-undo-redo-regression.md:176–177`) says a thrown replay does not consume its entry, whereas this recovery deliberately consumes one after a settlement throw.

**Suggestion**: Define that exception precisely. Extend the settlement-failure proof with a real external transition, claimed-entry removal, preserved newer history, subsequent access to the older edit, and the intended redo contents.

Not run because they require writes: regression tests, package typechecks, probe reruns, and Chromium acceptance tests.
