---
review_scopes:
  - native
  - selection
  - external-text
review_basis:
  - 2026-09-12-native-input-authority
  - 2026-09-12-selection-distinct-lifetimes
  - 2026-09-15-external-text-ordered-feedback
work_kind: implementation
---

# IME caret repair

Status: In progress

Objective:
Keep the native caret aligned with IME preedit text and commit at the intended
position across retained text, ordinary text beside inline elements, and custom
text renderers. Preserve cross-paragraph replacement and external input owners.

Task source:
- Homepage paragraphs reproduce a stationary caret during preedit, followed by
  a jump on confirmation. Headings and link contents behave correctly.
- Native recording confirms that retained hosts preserve their caret. Ordinary
  text beside links uses a separate React renderer and is excluded by the
  retained-flow-only anchor check.
- Mounted mixed-inline and custom-renderer cases reproduce the same offset
  failure. Immediate consecutive composition also exposes a pending React
  remount from the preceding commit.

Completion threshold:
- Nonempty editable text with matching collapsed DOM and model positions owns
  native composition regardless of its renderer.
- The composing subtree survives model publication, parent rerenders and
  decoration refreshes. Latest custom-renderer output is applied on completion.
- Confirmation, cancellation and consecutive composition preserve final text
  and selection. Other paragraphs remain live during composition.
- Expanded, mismatched, empty-placeholder and void input retain their existing
  model-owned paths. Android and external adapters retain their own authority.
- Relevant package checks and the original homepage OS IME interaction pass.

Boundaries:
- Plite owns input admission, ordinary text rendering and DOM text remounts.
- Reuse the composition epoch and its existing deferred DOM-write scheduler.
- No public API, document schema, registry UI or input-adapter contract change.

Work Checklist:
- [x] Reproduce ordinary text before and after inline links and custom renderers.
- [x] Admit connected editable text hosts using canonical target and point checks.
- [x] Preserve the active React text subtree and defer its latest rendered output.
- [x] Prevent an active native text host from being destroyed by a remount revision.
- [x] Verify cancellation, consecutive composition, decoration refreshes and teardown.
- [x] Verify void, empty and noneditable boundaries and adjacent input contracts.
- [x] Run focused tests, source types, formatting and final source inspection.
- [ ] Replay OS IME input in the original homepage paragraphs on final source.
- [ ] Bind the execution outcome after native acceptance and ledger validation.

Decisions:

| Owner | Decision | Reason |
| --- | --- | --- |
| [Composition state](../../packages/plitejs/src/react/editable/composition-state.ts) | Resolve a canonical text host and validate its editable target, root and model point | Renderer optimization markers do not define input authority |
| [Text renderer](../../packages/plitejs/src/react/components/editable-text.tsx) | Hold the composing subtree at the React reconciliation boundary and resume through the existing scheduler | Custom renderers and decoration subscriptions can update independently of model text synchronization |
| [Node bindings](../../packages/plitejs/src/react/hooks/use-plite-node-ref.tsx) | Defer remount revisions while a mounted host is protected | A changed React key would bypass subtree protection and interrupt consecutive input |
| [Editable runtime](../../packages/plitejs/src/react/editable/editable-dom-runtime.ts) | Share the existing composition protection predicate with both render paths | One epoch defines the protected region and its lifetime |

Verification evidence (2026-09-30):

| Check | Result |
| --- | --- |
| Unchanged-source mixed-inline and custom-renderer tests | Preedit offset assertions fail: expected 3, received 2 |
| Focused React regression set | 15 files, 376 tests pass |
| DOM input runtime | 13 tests pass |
| React entrypoint source types | Pass |
| Scoped Ultracite formatting and lint | Pass |
| Original homepage OS IME interaction | Pending final-source replay |
| Review ledger validation | Blocked by unrelated AI feature inventory entries |

The [caret cases](../../packages/plitejs/test/react/ime-caret.test.tsx) cover
retained text, text before and after links, link contents, custom leaf/text
renderers, parent rerenders, cancellation, consecutive input and input ownership
at empty, void and noneditable boundaries. Text identity is asserted throughout
preedit; final model and DOM positions are checked after completion. Custom
text-dependent attributes must also reflect the final committed text.

The [decoration cases](../../packages/plitejs/test/react/ime-decoration.test.tsx)
cover retained and custom leaf rendering through commit, cancellation,
immediate next composition and teardown. The composing Text remains connected,
other paragraphs update, and the latest decoration is applied after completion.

The adjacent checks cover external text adapters, both selection exporters,
composition state, input routing, Android, read-only transitions, history,
React DOM commits and editable runtime lifecycle. These focused results do not
constitute a full repository check or a performance measurement.

Focused replay:

```sh
pnpm --filter plitejs exec vitest run --config ./vitest.config.mjs test/react/ime-caret.test.tsx test/react/ime-decoration.test.tsx test/react/editable-complete-dom-and-text-sync.test.tsx test/react/external-text-contract.test.tsx test/react/decoration-rendering-contract.test.tsx test/react/selection-controller-contract.test.ts test/react/selection-reconciler-contract.test.tsx test/react/composition-state-contract.test.ts test/react/input-router-contract.test.tsx test/react/android-input-manager-contract.test.ts test/react/runtime-android-engine-contract.test.tsx test/react/editable-read-only-transition.test.tsx test/react/use-plite-history.test.tsx test/react/editable-text-flow-react-commit-contract.test.tsx test/react/editable-dom-runtime-contract.test.tsx
pnpm --filter plitejs typecheck:entrypoint:react
pnpm exec bun test --preload ./config/plite-source-test-setup.ts ./packages/plitejs/test/dom/dom-root-runtime.test.ts
```

Remaining acceptance:
The original homepage paragraphs require OS IME visual replay on final source.
Earlier heading-only acceptance does not establish paragraph behavior. The
execution record remains pending this replay. Ledger validation reports the
unregistered `application/ai-command` and `application/ai-copilot` identities;
reconciling those unrelated feature entries is outside this repair.

## Regression history

### Renderer replacement

Failure kind: reporter-contradiction. The first candidate suppressed stale
selection exports but still replaced the Text host at compositionstart. This
moved selection to the containing element at offset 0. The test reset selection
before each input and concealed the failure; an assertion before the first
browser mutation exposed it. The final fallback retained the model target,
explaining why committed text returned to the intended position.

Diagnostic caret offsets for `n` / `ni` / `nihao` were initially 2 / 2 / 2,
then 4 after committing `你好`. Correcting input classification produced
2 / 4 / 7; guarding selection export produced 3 / 4 / 7. Preserving Text identity
was also necessary to satisfy the original visual behavior.

The original candidate passed 291 distinct tests: 185 React cases plus 95
additional cases with two overlaps, and 13 DOM cases. Its source/dependent
check passed 96 tasks but failed on six TS2322 errors in unchanged
`authored-fragment-provider.test.tsx`; the aggregate task also failed. App
typechecking, formatting and whitespace checks passed. Those results did not
establish native correctness. The retained-host repair subsequently passed
11 suites / 255 tests and React entrypoint types.

### Decoration reconciliation

Decoration refreshes could still disconnect the active Text. Deferring
reconciliation only until commit was insufficient: immediate consecutive
composition exposed another detached caret. Protection now lasts until
completion, and deferred callbacks recheck the active session. This checkpoint
passed 12 React suites / 260 tests and 13 DOM root cases. The text-sync contract
also verifies that model projection resumes after composition ends.

### External adapter synchronization

Failure kind: final-verification. Native composition protection ran before
`externalText.focusSelection()`, skipping the external adapter's existing
synchronization. The proposal-mode contract failed both independently and in
the adjacent-feature suite. A test-loader comparison with the pre-change
implementation isolated the selection handlers; the existing test passed after
the handler order was corrected. No additional adapter state or timing
workaround was introduced.

### Cross-paragraph ownership

Failure kind: final-verification. The proposed PR granted native ownership to
every composition before deleting an expanded model selection. Its captured
forward focus node no longer represented the surviving model target, so commit
and cancel lost suffix content. Native ownership now requires a collapsed model
selection and a connected caret in the retained text-flow host. Expanded and
synthetic composition use the existing model-owned transaction path.

### Ordinary React text hosts

Failure kind: reporter-contradiction. Retained headings and link contents passed,
while ordinary text siblings were rejected by the text-flow-only anchor check.
Admitting ordinary hosts corrected preedit movement, but a same-turn next
composition could still be interrupted by the preceding commit's React remount.

A text-equality shortcut was insufficient for custom renderers, whose output may
depend on the committed text. Ordinary text now retains its rendered subtree
while native composition owns it and renders the latest props after release.
The existing remount path preserves active hosts so it cannot bypass that
render boundary. No renderer capability is inferred or broadened.
