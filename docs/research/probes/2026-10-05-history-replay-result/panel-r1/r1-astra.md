## Findings

### 1. [critical] Keeping Comments unchanged preserves false refusals and lost errors

**Location**: Plan Defaults, “Comments local publication timing”; Evidence, rejection of removing Comments’ catch-all.

**Finding**: The proposed failure owner does not cover the only production async owner. Comments can delete a thread, swallow an exception, and report `blocked`. This violates both truthful outcomes and the no-fork guarantee.

**Evidence**: In `BaseCommentsPlugin.ts`, `commitMutation` calls `setThread` at line 809. `setThread` deletes the thread at 677, then invokes observers through `publish` at 720. Those observers are unprotected at 454–476. A throwing `subscribeThreads` listener therefore reaches the catch at 902–910, which discards the cause and returns `comments-mutation-failed`. History preserves B; retry finds the thread absent and returns `comments-thread-changed` at 829–839. Neither the proposed `failed` result nor lifecycle sink sees the exception.

Separately, successful Comments publication followed by failed History settlement leaves the same mismatch. Clearing `pending` does not repair it.

**Suggestion**: Isolate post-publication observer failures so they cannot turn an applied mutation into a refusal. Define and prove recovery after settlement failure before claiming every TaskHub-22 law survives. This does not automatically require candidate C’s entire storage rewrite.

### 2. [critical] `HistorySettlement` excludes successful settlement

**Location**: `docs/plans/2026-10-05-history-sync-replay-result.md:84–94`.

**Finding**: The proposed type cannot represent `{ status: 'applied' }` on `pending.settled`.

**Evidence**: `Extract` distributes over union members, not individual values inside a property union. The member `{ status: 'applied' | 'empty' | 'busy' }` is not assignable to `{ status: 'applied' | 'failed' }`, so it is discarded entirely. `HistorySettlement` contains only `failed` and reason-bearing `blocked`.

**Suggestion**: Give `applied` its own union member, or define settlement first and extend it with immediate-only outcomes. Verify that an applied settlement is assignable and that `busy` and `empty` are rejected.

### 3. [warning] Reading the version after return can miss an intervening update

**Location**: Plan’s removed-version-arithmetic row and Phase 2; `arena/label-A.md`, pending replay flow.

**Finding**: The proposed replacement does not establish that the captured version belongs to the claim.

**Evidence**: History publishes the claim before calling the owner (`history-plugin.ts:973–986`). An owner can synchronously publish a selection update and then return a pending Promise. If claim version is 11, selection version is 12, and settlement version is 13, sampling after `undo()` returns captures 12. The proposed `claimVersion + 1` check accepts 13 and repairs presentation despite the intervening selection update. No `focusin` or `pointerdown` event is required. The current pre-call version check rejects this sequence.

**Suggestion**: Capture the actual claim commit version inside History and convey it through private request metadata. Add this exact mounted interleaving to the proof.

### 4. [warning] Phase 1 already performs Phase 2’s timing change

**Location**: Plan Steps, Phase 1 adapter step and Phase 2 exit.

**Finding**: The phases are not independently reversible as written.

**Evidence**: Current `replayHistory` awaits at `editable-dom-runtime.ts:1082` before selection and focus repair at 1113–1117. Changing it to await only `pending` makes settled-result repair synchronous immediately, even if the function remains declared `async`. That is Phase 2’s principal behavior change. Reverting to the described Phase 1 adapter would retain it, while Phase 1 has no Chromium acceptance gate.

**Suggestion**: Either preserve deferred repair explicitly in Phase 1, or combine the timing change and browser proof into that phase. State what distinct benefit remains for Phase 2.

### 5. [warning] The migration omits current Plite reference documentation

**Location**: Plan “Hard cuts and app migration” and Phase 1 documentation step.

**Finding**: The named documentation changes leave public reference pages teaching the removed contract.

**Evidence**: Under `c70bacbd4a:docs/plite/reference/public-docs/libraries/`, `plite-history/history-editor.mdx:35–61` declares Promise returns and rejection semantics. `plite-history/history.mdx:128–132` repeats the signatures; `plite-react/hooks.mdx:175–197` teaches awaiting the call and browser-channel rejection reporting. These paths are absent from the migration list. The proposed grep catches call expressions, but does not catch stale signatures or rejection prose.

**Suggestion**: Include these owners and search separately for return signatures, completion semantics, error ownership, and call expressions.

### 6. [warning] The frozen packet cannot substantiate its probe receipts

**Location**: Plan Evidence, lines 219–220; decision log’s `proven` settlement-failure row.

**Finding**: Both decisive execution logs are missing from the supplied frozen commit.

**Evidence**: `git show eca7f8e9:docs/research/probes/2026-10-05-history-replay-result/history-timing.log` and the corresponding `settle-failure.log` command both fail because the paths are absent from that commit. The directory tree contains the probe sources. Those sources support inspection of the experiment, but cannot verify the reported output, execution identity, or exit status.

**Suggestion**: Supply immutable copies of both receipts. Until then, distinguish source-supported behavior from execution claims unavailable to this panel.

### 7. [warning] The survey contradicts its headline conclusion

**Location**: `survey.md:1,14,45–46`; subject page “What other editors do”; plan Brief.

**Finding**: “No surveyed editor returns a Promise from undo” overstates the evidence.

**Evidence**: The survey’s Monaco row explicitly records `undo(): void | Promise<void>`. Its conclusions then exclude that counterexample and declare VS Code’s workbench the only async precedent. The evidence supports a narrower distinction between ordinary synchronous text replay and APIs that permit asynchronous completion.

**Suggestion**: Correct the survey and dependent claims. Judge the proposed discriminated result against that narrower precedent rather than claiming unanimity.

Not run because they require writes: regression tests, package typechecks, Chromium tests, and probe-log regeneration.
