---
review_scopes:
  - native
  - selection
  - external-text
review_basis: []
work_kind: implementation
---

# IME caret repair

Status: Completed

Objective:
Keep the native caret aligned with IME preedit text, preserve the composing
Text node, and commit text at the intended insertion point. Preserve decoration
updates in other paragraphs and composition in external text adapters.

Goal plan:
docs/plans/2026-09-29-ime-caret-diagnosis.md

Template:
docs/plans/templates/task.md

Task source:
- Homepage editor reproduction: the caret remained at the initial insertion
  point during preedit and moved to the composed text's end on commit.
- Regression reproduction: preedit appeared at the start of
  `Rich Content Editing`, while committed `点点滴滴` returned to the intended
  insertion point.
- Related coverage: decoration refreshes, cancellation, consecutive composition,
  teardown and proposal-mode input through an external text adapter.

Completion threshold:
- The active Text node and native selection remain stable during composition;
  committed text appears at the intended position.
- Deferred decorations resolve after composition, adjacent paragraphs remain
  live, and external text adapters retain their synchronization behavior.
- Mounted regression tests pass and native IME behavior receives manual visual
  acceptance. Repository-wide checks are reported separately below.

Verification surface:
- Plite DOM input ownership, retained text rendering, selection synchronization,
  external text contracts and the React entrypoint typecheck.
- Manual native IME acceptance on the homepage editor, recorded on 2026-09-29.

Boundaries:
- Plite owns the input, DOM and selection changes. Reuse the composition epoch
  and DOM phase scheduler; preserve Android's manager-owned input.
- No registry component, public API or serialized document format change.

Work Checklist:

- [x] Native input ownership. Classify composition input as native-allowed so
  preedit does not trigger export of a stale model selection.
- [x] Text identity. Keep the retained text renderer during composition instead
  of switching to React text children. Guard the Text node and caret before
  the first simulated browser mutation.
- [x] Selection synchronization. Protect both native export paths, including
  queued exports, while allowing final selection synchronization during repair.
- [x] Decoration updates. Defer reconciliation in the composing region, retain
  the latest update and keep unrelated paragraphs live. Apply pending work on
  commit or cancel and release it on teardown.
- [x] Consecutive composition. Recheck ownership before executing deferred work
  so an earlier composition cannot replace the next composition's Text node.
- [x] External adapters. Run adapter synchronization before native composition
  protection; verify proposal-mode input, accepted content and history.
- [x] Verification. Record mounted regression results and reporter-confirmed
  manual native IME acceptance on 2026-09-29.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Input authority | [DOM input runtime](../../packages/plitejs/src/dom/plugin/dom-input-runtime.ts) | Native composition owns intermediate DOM selection | Export model selection after every preedit event | Caret and DOM root contracts |
| Render identity | [Text blocks](../../packages/plitejs/src/react/components/editable-text-blocks.tsx) | Retain the composing Text host | Replace the host at compositionstart and repair selection afterward | Same-node assertion at compositionstart |
| Active-region updates | [Text flow](../../packages/plitejs/src/react/components/editable-text-flow.tsx), [editable runtime](../../packages/plitejs/src/react/editable/editable-dom-runtime.ts) | Reuse the epoch anchor and root scheduler to defer overlapping writes | Rebuild composing text during decoration refresh or commit | Decoration, cancellation, consecutive-input and teardown cases |
| Adapter ownership | [Controller](../../packages/plitejs/src/react/editable/selection-controller.ts), [reconciler](../../packages/plitejs/src/react/editable/selection-reconciler.ts) | Synchronize the external adapter before applying native DOM protection | Apply the native guard to every composing view | Proposal-mode external text contract |

Completion Gates:

Results below describe the verification checkpoint recorded on 2026-09-29.

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Mounted behavior | yes | IME and adjacent-feature suites | 19 suites / 390 tests pass |
| DOM input runtime | yes | DOM root-runtime suite | 13/13 tests pass |
| Types | yes | React entrypoint typecheck | passes |
| Native IME | yes | Manual visual acceptance on the original surface | reporter-confirmed on 2026-09-29; no automated native replay |
| Formatting and ordinary lint | yes | Scoped formatter and repository lint | pass; whitespace check passes |
| Repository checks | yes | `pnpm check` | blocked at type-aware lint: 400 diagnostics across 130 files, outside modified lines; subsequent full typecheck and test stages did not run |
| Ledger | yes | Execution record and ledger validation | pending inventory reconciliation |
| Registry and API documentation | no | No affected registry or public API | N/A |

Verification evidence:

- [IME caret regression](../../packages/plitejs/test/react/ime-caret.test.tsx)
  mounts `EditorRoot` and `Editable`. Fixtures cover `abcdef` at offset 2 and
  `Rich Content Editing` at offset 16 with `点点滴滴`. Assertions check Text
  identity immediately after compositionstart, preedit growth, an internal
  preedit caret position, React rerenders and final placement. Browser text
  mutations use the same Text node; the input kernel and exporter are not
  substituted.
- [IME decoration regression](../../packages/plitejs/test/react/ime-decoration.test.tsx)
  covers repeated decoration-boundary refreshes, sibling text and decoration
  updates, commit, cancel, immediate next composition and unmount. Final model
  text and selection are checked. All five cases passed after the last cleanup.
- [External text contract](../../packages/plitejs/test/react/external-text-contract.test.tsx)
  rejects the adapter regression: the first proposal-mode composition dispatch
  returned `stale` instead of `applied`. Restoring the pre-change selection
  handlers made the same case pass; ordering adapter synchronization before
  native protection resolved the failure.
- The final 390-test run covers Android input management, history, read-only
  transitions, clipboard and runtime teardown as well as the IME cases. The
  original repair run covered 385 tests (137 focused and 248 adjacent cases);
  the final run includes five additional adjacent-feature cases.
- Native visual acceptance is based on manual testing confirmed by the issue
  reporter. Automated OS IME replay and a captured final pixel sequence are
  not available. The earlier successful page render and absence of console
  errors are supplementary observations, not native input proof.
- Ordinary lint passed. Type-aware lint initially reported 401 diagnostics;
  one unnecessary assertion in the new IME test was corrected. The final
  recheck reported 400 diagnostics across 130 files, all outside modified
  lines. React entrypoint types, the DOM root suite, document links and
  `git diff --check` passed.

Focused replay commands:

```sh
pnpm --filter plitejs exec vitest run --config ./vitest.config.mjs test/react/ime-caret.test.tsx test/react/ime-decoration.test.tsx test/react/external-text-contract.test.tsx
pnpm --filter plitejs typecheck:entrypoint:react
pnpm exec bun test --preload ./config/plite-source-test-setup.ts ./packages/plitejs/test/dom/dom-root-runtime.test.ts
```

Findings and remaining work:

- Full repository verification remains incomplete because type-aware lint
  stops `pnpm check` before its full typecheck and test stages. Focused passing
  checks do not replace those stages.
- Ledger validation reports inventory additions `application/ai-command` and
  `application/ai-copilot`, preventing execution-record registration. Reconcile
  that inventory before registering the outcome.
- Complete source and runner bindings for the historical runs were not
  retained. Historical execution records must use `historical-unbound` and
  unknown proof; the recorded test counts do not certify later revisions.

Final handoff:

- Outcome: native composition preserves text identity and caret position;
  active-region updates are deferred safely and external adapters synchronize
  through their existing owner.
- Proof: 390 React tests, 13 DOM runtime tests and the React entrypoint
  typecheck pass at the recorded checkpoint; native IME acceptance is manual.
- Limits: repository-wide checks and execution-record registration remain
  unresolved. Functional acceptance is complete.

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
