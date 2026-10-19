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

Status: Completed

Objective:
Keep the native caret aligned with IME preedit text, preserve the composing
Text node, and commit text at the intended insertion point. Preserve decoration
updates in other paragraphs and composition in external text adapters.

Final checkpoint:
- `failed candidate`: blanket native composition ownership captured the forward
  range focus before canonical expanded-selection deletion. Authored commit and
  cancel received `An` instead of `AnD`; rich-text replacement received only
  `段` instead of `one 段 five`.
- `repair`: composition is native-owned only when a collapsed model selection
  has a connected native caret in the exact retained text-flow host and both
  resolve to the same model point. Expanded, synthetic, stale and missing-anchor
  composition stays model-owned.
- `result`: the retained Text node survives native Chromium preedit and
  follow-up input, while all three cross-paragraph failures pass without a
  public API, document schema or external-adapter ownership change.

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
- Mounted and real Chromium regression tests pass. Manual OS IME visual
  acceptance remains a release proof limit and is reported separately below.

Verification surface:
- Plite DOM input ownership, retained text rendering, selection synchronization,
  external text contracts and the React entrypoint typecheck.
- Real Chromium CDP IME composition plus the exact cross-paragraph reporter
  paths. Manual OS IME visual acceptance is retained as a separate limit.

Boundaries:
- Plite owns the input, DOM and selection changes. Reuse the composition epoch
  and DOM phase scheduler; preserve Android's manager-owned input.
- No registry component, public API or serialized document format change.

Work Checklist:

- [x] Native input ownership. Classify composition input as native-allowed only
  for a collapsed selection in a connected retained text-flow host.
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
- [x] Verification. Record mounted regression results, real Chromium CDP IME
  replay, exact cross-paragraph commit/cancel and the remaining visual limit.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Input authority | [DOM input runtime](../../packages/plitejs/src/dom/plugin/dom-input-runtime.ts) | A collapsed retained host owns intermediate native composition only when its DOM caret resolves to the same model point; all other composition stays model-owned | Treat every composition event as native-owned | Chromium retained-node, mismatched-caret and cross-paragraph replacement proof |
| Render identity | [Text blocks](../../packages/plitejs/src/react/components/editable-text-blocks.tsx) | Retain the composing Text host | Replace the host at compositionstart and repair selection afterward | Same-node assertion at compositionstart |
| Active-region updates | [Text flow](../../packages/plitejs/src/react/components/editable-text-flow.tsx), [editable runtime](../../packages/plitejs/src/react/editable/editable-dom-runtime.ts) | Reuse the epoch anchor and root scheduler to defer overlapping writes | Rebuild composing text during decoration refresh or commit | Decoration, cancellation, consecutive-input and teardown cases |
| Adapter ownership | [Controller](../../packages/plitejs/src/react/editable/selection-controller.ts), [reconciler](../../packages/plitejs/src/react/editable/selection-reconciler.ts) | Synchronize the external adapter before applying native DOM protection | Apply the native guard to every composing view | Proposal-mode external text contract |

Completion Gates:

Results below describe the verification checkpoint recorded on 2026-09-29.

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Plite package | yes | Package-owned tests | 21/21 tasks pass |
| Mounted behavior | yes | IME, complete DOM sync and external-text suites | 4 files / 89 tests pass on the final candidate |
| DOM input runtime | yes | DOM root-runtime suite | 13/13 tests pass |
| Types | yes | Plite package typecheck | 13/13 tasks pass |
| Native IME | yes | Chromium CDP preedit and follow-up input | retained Text identity and final model selection pass; manual OS visual caret replay remains unrun |
| Cross-paragraph safety | yes | Authored commit/cancel and rich-text composition | 2/2 authored cases and the 14-pass rich-text composition slice pass; 2 unrelated project-gated cases skip |
| Scale | yes | Strict retained-flow browser matrix | focused plain matrix passes at 0.62 of its budget; four full-matrix stress groups time out identically before candidate/control comparison |
| Formatting and ordinary lint | yes | Scoped Ultracite fix and whitespace check | pass |
| Ledger | yes | Bound execution record and ledger validation | draft complete; registration blocked by unrelated feature-inventory drift |
| Registry and API documentation | no | No affected registry or public API | N/A |

Verification evidence:

- The [final gate receipt](artifacts/2026-09-29-ime-caret-repair/gates.json)
  binds the red assertions, final commands, affected-tree diff and benchmark
  artifact fingerprints used by this outcome.
- The [execution draft](artifacts/2026-09-29-ime-caret-repair/execution.json)
  binds the three governing reviews, current source inventory and final receipt.
  Registration stops before writing a record because unrelated checkout work
  adds AI identities and removes `plitejs/core/document-view-read`.
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
- The real Chromium regression keeps one JavaScript handle to the original Text
  node through `n`, `ni` and `nihao`, commits `点点滴滴`, checks final model
  selection and then types `!`. Chromium does not expose its internal IME caret
  offset through `document.getSelection()`, so this proves host identity and
  placement but not the caret's pixels during preedit.
- The exact authored commit/cancel reporter path is red on the proposed PR
  candidate with `An` versus `AnD` and green 2/2 here. The synthetic rich-text
  cross-paragraph path is red with `段` versus `one 段 five` and green in the
  14-pass composition slice here.
- The strict focused plain browser matrix passes normal, large and stress cases
  at 0.62 of the configured budget. The full matrix is inconclusive for four
  groups because both production and legacy fallback exceed the shared
  40-second group timeout. No performance win is claimed from those rows.
- Earlier manual reporter acceptance covered the collapsed same-host visual
  symptom. The final candidate preserves that path and narrows native authority,
  but a manual OS IME visual replay was not captured after this repair.

Focused replay commands:

```sh
pnpm --filter plitejs exec vitest run --config ./vitest.config.mjs test/react/editable-complete-dom-and-text-sync.test.tsx test/react/ime-caret.test.tsx test/react/ime-decoration.test.tsx test/react/external-text-contract.test.tsx
pnpm --filter plitejs typecheck
pnpm exec bun test --preload ./config/plite-source-test-setup.ts ./packages/plitejs/test/dom/dom-root-runtime.test.ts
pnpm --filter plite test:plite-browser:chromium tests/plite-browser/authored-changes.spec.ts -g "keeps a Chromium composition replacement across paragraphs atomic"
pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/richtext.test.ts -g "composition"
```

Findings and remaining work:

- Manual OS IME visual caret replay remains unrun on the final candidate.
- The full retained-flow matrix cannot compare four stress groups because both
  implementations hit the shared timeout. The focused plain path is decisive
  and green; the timed-out rows are not treated as a pass or regression.
- The checkout contains unrelated Plate, Plite core, docs and probe changes.
  Some overlapping files also contain unrelated paste-result work; the receipt
  binds their complete affected-tree diff without attributing that work here.
- Ledger registration is pending the owner of the unrelated feature-inventory
  migration. This repair does not map or delete those identities.

Final handoff:

- Outcome: native composition preserves retained Text identity and intended
  insertion while expanded composition remains model-owned, so cross-paragraph
  content is not lost. Active-region updates defer safely and external adapters
  keep their existing authority.
- Proof: 89 focused React tests, 13 DOM runtime tests, 13 typecheck tasks, the
  21-task Plite package gate, 2-case authored Chromium reporter path and the
  14-pass Chromium composition slice pass on the final candidate.
- Limits: exact preedit caret pixels still need manual OS IME observation, and
  four full-matrix stress groups remain inconclusive because both comparison
  implementations time out. The bound execution draft remains unregistered
  until the unrelated feature-inventory migration is reconciled.

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
