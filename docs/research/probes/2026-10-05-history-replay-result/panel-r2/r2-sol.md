## Findings

All locations refer to frozen commit `ed996682`.

### 1. [critical] Protecting `publish` leaves another false-refusal path

**Location**: Plan:144,204; `BaseCommentsPlugin.ts:433–439,710–724,902–910`.

**Finding**: The Comments fix does not remove the round-1 defect for attachment subscribers. A listener can still throw after the thread changes, leaving History blocked on an already-applied removal.

**Evidence**: Register a throwing `subscribeAttachments` listener after creating an attached thread. Undo deletes the thread and anchor, then calls `annotations.refresh` at lines 712–714, before reaching `publish`. The attachment listener runs through `observeView` at line 439. `annotations/store.ts:306–307` invokes change listeners without an error boundary. The exception reaches `replayCreation`’s catch, which discards it and returns `comments-mutation-failed`. History retains B; retry sees the missing thread and refuses again. The proposed thread-subscriber test exercises a different notification channel.

**Suggestion**: Isolate attachment listeners and decoration refreshers too. Prove the failure through the public `subscribeAttachments` API.

### 2. [warning] Dropping an applied redo loses its undo record

**Location**: Plan:140,189,201–203; TaskHub-22 plan:176–177.

**Finding**: The split failure default fixes the stuck head by consuming the entry. On redo, that leaves the restored effect without an undo record. This requires an explicit exception to TaskHub-22 AC5.

**Evidence**: Redo B restores the external effect. If constructing or publishing its settlement fails before branch movement, B remains on the redo branch. The new rule drops B. No inverse reaches the undo branch because successful settlement is what creates that inverse (`history-state.ts:818–843`). Later undo therefore skips the restored B.

The supplied P7 probe tests only undo followed by a new edit. Its poisoned owner merely returns `applied`; it does not mutate external state (`settle-failure.probe.ts:43–51`). That receipt cannot prove the new recovery policy preserves actual effects.

**Suggestion**: Specify recovery for applied redo, or explicitly narrow the preservation guarantee. Add assertions for the external effect and both branches.

### 3. [warning] Comments storage errors still bypass the failure owner

**Location**: Plan:189,203–204,241; `BaseCommentsPlugin.ts:760–773,902–910`.

**Finding**: The new throwing-owner rule does not cover exceptions from the only production async owner’s persistence adapter.

**Evidence**: If Comments’ `mutate` throws or rejects, `replayCreation` catches the exception, discards its cause, and returns `blocked`. History receives a fulfilled refusal, so neither the lifecycle sink nor its new `reportError` fallback observes the exception. Protecting `publish` does not change this path. The existing Comments test explicitly expects `comments-mutation-failed` for a storage throw (`BaseCommentsPlugin.spec.ts:1061–1090`), without checking error delivery.

**Suggestion**: Keep the entry-preserving outcome if required, but report the caught exception once. Include a real Comments adapter failure in the reporting proof.

### 4. [warning] The no-sink fallback omits runtimes without `reportError`

**Location**: Plan:114,142,190,202.

**Finding**: The fallback contract is incomplete for headless use. The planned typecheck cannot prove that reporting remains safe or observable.

**Evidence**: A read-only check in this environment returned `typeof globalThis.reportError === 'undefined'`. The incumbent mounted dispatcher checks availability and otherwise schedules a throw (`editable-dom-runtime.ts:1134–1149`). The plan names only `reportError`. Calling it unguarded would introduce a reporting exception; silently reverting to console would weaken the claimed visibility. The existing mounted reporting test installs a `reportError` stub, so it cannot catch either defect.

**Suggestion**: Specify the unavailable-platform fallback and prove it with neither an editor sink nor `reportError` installed. Reporting must not reject `settled`.

### 5. [warning] “One microtask” does not preserve callback timing

**Location**: Plan:143,178,193,205.

**Finding**: The timing correction describes repair and callbacks as sharing the incumbent one-microtask timing. They currently run in separate Promise reactions.

**Evidence**: `replayHistory` awaits at `editable-dom-runtime.ts:1082`, then repairs presentation. `dispatchHistory` delivers callbacks through the returned Promise’s `.then` at lines 1126–1131. A caller’s immediately queued microtask therefore runs between repair and callbacks. An in-memory check of these two reactions produced `repair, caller microtask, callback`.

Combining repair and callbacks after one deferral changes that ordering, including the browser-handle continuation’s rendering and focus work. The two proposed mounted tests check focus eligibility, not callback ordering.

**Suggestion**: Preserve the separate callback reaction and correct the timing description, or explicitly adopt and prove the ordering change.

Not run because they require writes: regression suites, package typecheck runners, mounted/browser tests, and probe regeneration.
