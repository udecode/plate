## Findings

### 1. [critical] Retained Comments catch hides errors after publication

**Location**: Plan Defaults, line 185, and arena grafts, line 231; `BaseCommentsPlugin.ts:454-476,666-724,809,902-911`.

**Finding**: Keeping Comments unchanged violates truthful outcomes and observed errors. A successful mutation can be reported as `blocked` after the thread has changed.

**Evidence**: `commitMutation` calls `setThread`, which modifies records and anchors before invoking subscribers. Subscribers run without an error boundary. If one throws, `replayCreation` discards the error and returns `comments-mutation-failed`. History receives a refusal, so the new lifecycle sink never sees the cause. On redo, the catch also releases the restored anchor after Comments has installed it. This is not limited to malformed owner values or settlement guards.

**Suggestion**: Isolate postpublication subscriber errors, report them, and retain the applied outcome. Preserve expected refusals separately. Prove this through a real Comments subscriber-throw case.

### 2. [critical] `HistorySettlement` excludes successful settlement

**Location**: [Plan:84-94](/Users/zbeyens/git/plate-2/docs/plans/2026-10-05-history-sync-replay-result.md:84).

**Finding**: The proposed completion type cannot return `{ status: 'applied' }`.

**Evidence**: `Extract` filters whole union members. `{ status: 'applied' | 'empty' | 'busy' }` is not assignable to `{ status: 'applied' | 'failed' }`, so that entire member disappears. `HistorySettlement` contains only `failed` and reason-bearing `blocked`. Consequently, the successful asynchronous completion shown in the adoption examples contradicts the public type.

**Suggestion**: Give `applied` its own union member, as candidate A did, or define settlement first and derive the wider outcome.

### 3. [critical] Reading the version after return loses intervening commits

**Location**: Plan lines 159 and 201; `arena/label-A.md:134,142-145`.

**Finding**: The chosen base records `lastCommit` after receiving `pending` and treats it as the claim version. Those versions need not match.

**Evidence**: History publishes the claim before invoking the owner (`history-plugin.ts:974-985`). The owner can synchronously publish another editor update before returning its Promise. Claim subscribers can also publish updates because transaction depth is cleared before observers (`public-state.ts:9488,9573`). With claim version N, intervening selection update N+1, and settlement N+2, the proposed capture records N+1. The `claimVersion + 1` check then passes and permits presentation repair despite the intervening update. Existing pre-call version arithmetic rejects that sequence.

**Suggestion**: Record the actual claim commit version in request-owned metadata before observers or owner code run. Add a case whose intervening update happens before `undo()` returns.

### 4. [warning] The timing proofs would pass the incumbent behavior

**Location**: Plan Steps, lines 194 and 201-202; `editable-dom-runtime-contract.test.tsx:104-134,189-213`.

**Finding**: The named proofs do not establish synchronous repair or consistently deferred callbacks.

**Evidence**: The existing mounted test awaits `dispatchHistory` before asserting focus. It passes when repair occurs after a microtask, which is precisely the behavior Phase 2 proposes changing. The focus-interaction test also waits for eventual delivery. Repeated Chromium runs establish stability, not same-call timing. Moreover, Phase 1’s instruction to await only `pending` already changes document-path timing, before Phase 2’s browser gate.

**Suggestion**: Add a focused timing assertion that checks repair before dispatch returns and callbacks after return. Place native acceptance before any independently keepable phase changes that timing.

### 5. [warning] Adoption omits active Plite teaching

**Location**: Plan migration list, line 151, and documentation step, line 197.

**Finding**: Updating the listed Plate docs leaves Plite reference docs teaching the incompatible awaited contract.

**Evidence**: The frozen tree contains `Promise<HistoryResult>` signatures in `docs/plite/reference/public-docs/libraries/plite-history/history-editor.mdx:35,39` and `history.mdx:128,132`. The latter contains `await undo()` at line 20, and `libraries/plite-react/hooks.mdx:178` teaches the same pattern. These paths are absent from the adoption list. The subject page’s current API examples also need a scheduled update.

**Suggestion**: Include those documentation owners and verify their current examples against the proposed completion contract.

### 6. [warning] The migration grep cannot reach its promised zero

**Location**: [Plan:195](/Users/zbeyens/git/plate-2/docs/plans/2026-10-05-history-sync-replay-result.md:195).

**Finding**: The repository-wide zero-match criterion includes intentional historical examples.

**Evidence**: Running the specified pattern against the frozen plan matches its own before examples at lines 42 and 56. It also matches the subject page. Only `docs/research/probes/` is excluded. A correct implementation can therefore fail this gate without having a stale executable caller.

**Suggestion**: Bound the check to executable consumers and current teaching. Validate migrated completion-sensitive callers behaviorally; preserve historical evidence.

### 7. [warning] Both decisive probe logs are missing from the frozen packet

**Location**: Plan Evidence, lines 219-220; decision-log rows 2-3.

**Finding**: The reported probe results cannot be independently verified under the required frozen-review boundary.

**Evidence**: Both `git show eca7f8e9:docs/research/probes/2026-10-05-history-replay-result/history-timing.log` and the corresponding `settle-failure.log` lookup fail because neither path exists in that commit. The scripts are present, but scripts do not establish successful execution, control output, or the reported rejection count.

**Suggestion**: Supply immutable log contents, including invocation and exit status, in the review packet.

### 8. [warning] The survey overstates synchronous-editor precedent

**Location**: Plan lines 18 and 223-225; `survey.md:14,45-46`; subject page line 50.

**Finding**: “No surveyed editor undo returns a Promise” contradicts the survey’s own Monaco entry.

**Evidence**: `survey.tsv:9` lists Monaco’s `undo(): void | Promise<void>`. At the cited VS Code revision `df2411c`, `src/vs/monaco.d.ts:2385` exposes exactly that signature, and `textModel.ts:1604-1605` forwards to the undo service. The service can await confirmation before undo (`undoRedoService.ts:1099-1129`), so its asynchronous behavior is not confined to file and notebook effect implementations.

**Suggestion**: Narrow the precedent claim to ordinary text replay. Judge the discriminated result on its concrete caller and failure benefits.

Not run because they write: proposed regression tests, partition/typecheck runners, and Chromium acceptance proofs.
