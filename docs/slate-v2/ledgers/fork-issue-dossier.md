---
date: 2026-05-04
topic: slate-v2-fork-issue-dossier
status: active
source_ledgers:
  - docs/slate-issues/gitcrawl-live-open-ledger.md
  - docs/slate-issues/gitcrawl-clusters.md
---

# Slate v2 Fork Issue Dossier

This is the fork-local replacement for upstream GitHub issue comments.

OpenClaw-style triage writes public issue comments after maintainer curation.
Slate v2 should not comment on `ianstormtaylor/slate` issues from this fork.
Instead, every reviewed issue gets one self-contained section here. The PR
description can quote short claim text from this file, but this file owns the
full evidence and decision text.

Rules:

- Do not use `Fixes #...` unless the exact original repro is proven end to end.
- Use `Related #...` or `Improves #...` when the architecture absorbs the issue
  pressure but exact closure is not proven.
- Keep singleton live issues here even when they do not appear in gitcrawl
  multi-member clusters.
- Keep issue refs unescaped when auto-linking matters.

## Void Roots / ContentRoot API Execution Sync - 2026-05-25

Status: implementation-sync
Source plan:
`docs/plans/2026-05-25-slate-v2-void-roots-and-editable-islands.md`

Reviewed surface:
The first execution slice implements the public API/lifecycle baseline for the
closed void roots / editable islands plan. `.tmp/slate-v2` now exposes
`EditorElementSpec.contentRoot`, `tx.roots.create/replace/delete`, and
`useSlateContentRoot`; the editable-voids example uses `tx.roots.create` for
child-root creation.

Decision:
This is API substrate progress, not a fixed/improved issue claim. Default voids
remain atomic, `editable-island` remains the mixed native/app-control surface,
and editor-only rooted-flow keyboard/navigation is still unclaimed until
targeted core/browser proof exists.

Issue decisions:

| Issue | Decision text |
| --- | --- |
| #5212 | Related/planned example and DX candidate. Root creation DX improved, but the example is not fixed until the full accepted route teaches editor-only rooted-flow behavior with browser proof. |
| #2072 | Related architecture target strengthened. The content-root API baseline exists; no closure until keyboard/navigation and browser proof land. |
| #3482, #3367 | Related model-shape pressure. Default voids stay atomic; the implementation does not make normal void descendants traversable. |
| #3435, #3884, #4301 | Related navigation guardrails. No new arrow/Enter claim; existing #4301 fixed floor remains exact. |
| #3991, #3868, #5582, #5477, #4896, #4350, #4328, #5630 | Delete/selection guardrails. Root lifecycle helpers landed, but delete/select/remap closure still needs targeted proof. |
| #4984, #4842, #3909 | Nested/contenteditable guardrails. Same-runtime roots remain the answer; only existing #4984 fixed floor is preserved. |
| #4806, #4802, #4104, #3926, #4888, #4623 | Clipboard/drop/move guardrails. Root payload serialization and remap policy remain future proof gates. |

PR-description text:
No new fixed or improved issue claim. The PR reference should describe the
public API/lifecycle slice as implemented and keep keyboard/browser behavior
claims gated.

## Void Roots / Editor-only Rooted Flow Surface Review - 2026-05-25

Status: planning-sync
Source plan:
`docs/plans/2026-05-25-slate-v2-void-roots-and-editable-islands.md`

Reviewed surface:
The target is no longer "editable island solves everything." The long-term
shape is three surfaces: default voids remain atomic; `editable-island` handles
mixed native/app controls with optional same-runtime child roots; editor-only
rooted flow is a separate planned target expressed as object-only
`contentRoot: { slot: string }` schema metadata for elements whose only content
is a child editor/root and whose keyboard navigation should feel like sibling
document blocks.

Current live-source correction:
The 2026-05-24 dossier text says the canonical editable-voids example still
embedded an independent nested editor. That is stale for the current checkout:
the example now uses same-runtime child roots. The unresolved gaps are public
root creation DX and editor-only rooted-flow navigation proof.

Decision:
This is architecture and issue-accounting pressure, not a fixed/improved issue
claim. Do not make default voids traversable. Do not store rich content under
normal void element `children`. Do not overload mixed-control islands with the
pure editor-flow contract unless later passes prove one policy can handle both
without native-focus and keyboard-navigation footguns.

Issue decisions:

| Issue | Decision text |
| --- | --- |
| #5212 | Related/planned example and DX candidate. The example row remains in scope because same-runtime child roots exist but root creation is still noisy and editor-only rooted flow is not taught. No fixed or improved claim yet. |
| #2072 | Related architecture target strengthened. The old `<Island>` pressure should split into mixed island and planned object-only `contentRoot: { slot: string }` rooted-flow primitives; no closure until final API and navigation proof exist. |
| #3482, #3367 | Related model-shape pressure. Void children/arbitrary void text requests are answered by atomic default voids plus child roots/rooted elements, not by making normal void descendants navigable. |
| #3435, #3884, #4301 | Related arrow/Enter/void-selection guardrails. Editor-only rooted flow needs explicit cross-root arrow/Enter behavior while preserving selected-void behavior. |
| #3991, #3868, #5582, #5477, #4896, #4350, #4328, #5630 | Related delete/selection guardrails. Root-backed surfaces must preserve void delete, range delete, select-all paste/delete, and root restore semantics before any related status changes. |
| #4984, #4842, #3909 | Nested/contenteditable ownership guardrails. Same-runtime child roots preserve the direction for nested-editor split-brain, but only the existing #4984 fixed claim is preserved. Exact offset or CodeMirror/void-node closure is not claimed. |
| #4806, #4802, #4104, #3926, #4888, #4623 | Clipboard/drop/move guardrails. Root payload serialization and root remap policy are future proof gates; no clipboard, paste, or drag/drop closure is added here. |
| #5183, #5391, #5559, #4839, #5087, #5411, #3611 | Inline/mobile/spacer/cursor guardrails. Editor-only rooted flow must not widen mobile inline-void, shift-click, cursor, spacer, highlighting, or IME claims. |
| #1769, #3893 | External/native focus pressure. Mixed islands keep native-control focus ownership; editor-only rooted flow must not steal/import external selections. No exact focus issue closure. |

PR-description text:
No new fixed or improved issue claim. The PR reference may name
`contentRoot: { slot: string }` only as planned architecture until execution
proof changes claim scope.

## Editable Islands / Multi-root Child Root Surface Review - 2026-05-24

Status: planning-sync
Source plan:
`docs/plans/2026-05-24-slate-v2-editable-islands-multi-root-ralplan.md`

Reviewed surface:
The canonical editable-voids example still embeds an independent nested Slate
editor for rich content. With multi-root support, that is no longer the right
teaching architecture. The accepted target is `editable-island` for native/app
controls and same-runtime child roots for rich editable content inside the
island.

Decision:
This is public API/example architecture pressure, not a new fixed/improved
issue claim. Existing native-control and nested-editor crash rows stay useful
regression proof. New closure requires package-owned child-root lifecycle,
selection, history, clipboard, delete/undo, move, and browser proof.

Issue decisions:

| Issue | Decision text |
| --- | --- |
| #5212 | Related/planned example candidate. The current canonical editable-voids example still embeds an independent nested editor for rich content, so the issue is directly in scope for the example rewrite. No fixed or improved claim is allowed until a same-runtime child-root example and proof exist. |
| #2072 | Related architecture target strengthened. The `<Island>` request should become a library-owned island boundary plus optional same-runtime child roots; no closure claim until the example and proof exist. |
| #4984 | Preserve existing fixed claim. The child-root architecture must keep parent-selection-across-nested-editor DOM point crash proof green, but adds no broader claim. |
| #4842 | Preserve related status. Child roots reduce split-brain nested-editor offset pressure, but exact historical toSlatePoint offset closure is not claimed. |
| #3909 | Related target ownership pressure. Nested contenteditable should route through same-runtime root ownership, but exact CodeMirror/void-node closure is not claimed. |
| #4110 | Related native-control/browser-selection pressure. Inputs inside islands must keep Firefox caret/selection stable; no closure without browser proof. |
| #4623 | Related void drag/drop pressure. Island move/drop semantics need proof, but this planning pass does not claim the drag-to-start duplicate bug fixed. |
| #3858 | Related stale-descendant pressure. Child-root deletion/undo proof is required before changing this status. |
| #3482, #3367 | Related model-shape pressure. Void children and arbitrary void text requests are answered by atomic parent islands plus same-runtime child roots, not by putting rich content directly under void element children. |
| #5183, #5391 | Mobile inline-void pressure only. Child roots inside editable islands do not close Android/iOS inline-void keyboard or cursor-placement reports; keep raw device/browser proof as the gate. |
| #4806, #4802, #4104, #3926 | Clipboard/copy/paste guardrails. Child-root serialization policy must be explicit, but this planning sync does not broaden existing inline-void copy/paste/cut or Safari paste claims. |
| #4888, #4623 | Drop/drag lifecycle guardrails. Same-runtime child roots make wrong drop ownership more dangerous, so future implementation needs drop/move proof before any closure claim. |
| #5582, #5477, #4896, #4350, #4328, #3991, #4301, #3868 | Void delete/selection guardrails. Existing fixed claims stay fixed floors; child-root delete/undo proof is a new regression gate, not a new issue claim. |
| #5087, #5411, #3611, #3435, #3449, #4839 | Spacer/cursor/insert-break guardrails. The plan must not rely on spacer text hacks or widen inline-void cursor claims while introducing child roots. |
| #1769, #3893 | External/non-editable focus pressure. Islands and native controls need coherent focus ownership, but this plan makes no exact external-focus closure claim. |

PR-description text:
No new fixed or improved issue claim. The plan changes the canonical editable
void architecture target from nested independent editors to same-runtime child
roots.

## Library-Owned Multi-root History / Focus DX Surface Review - 2026-05-23

Status: planning-sync
Source plan:
`docs/plans/2026-05-23-slate-v2-library-owned-multi-root-history-dx-ralplan.md`

Reviewed surface:
The canonical multi-root example still carried app-owned `getHistoryShortcut`,
`getHistoryBatchCount`, `updateHistory`, `applyDocumentHistory`, and
`requestAnimationFrame` focus repair. The accepted target is package-owned
`useSlateHistory` and `useSlateRootChrome`.

Decision:
This is public API and browser-proof pressure, not a new fixed/improved issue
claim. The hook work should preserve existing history-selection fixes while
adding no broad Undo/Redo All, multi-editor focus, placeholder, or HTML button
closure claim.

Issue decisions:

| Issue | Decision text |
| --- | --- |
| #6016 | Keep triage-closed/non-fix. One editor/runtime with root-bound editable surfaces is the supported answer; shared node graphs across independent editors stay unsupported. |
| #5537 | Related focus/input pressure. Root chrome/focus proof helps the owner, but exact multi-editor programmatic focus closure is not claimed. |
| #5117 | Related example/browser pressure. Root-local DOM state remains required; placeholder measurement closure is not claimed. |
| #5515 | Related history-scope pressure. `useSlateHistory` is active-root history, not Undo/Redo All. |
| #3893 | Related external-control focus pressure. Exact HTML button focus closure is not claimed. |
| #3634, #4961 | Related programmatic focus pressure. Exact focus-after-programmatic-change closure still needs browser proof. |
| #3705, #3756, #3921 | Preserve existing history-selection/refocus classifications. No broader partial `set_selection` or refocus claim. |
| #3534, #3551, #4559, #3499 | Preserve existing fixed claims. Hook-level UI must keep these history guarantees green. |
| #3460 | API pressure only for toolbar/command access outside the editor subtree. No issue closure claim. |

PR-description text:
No new fixed or improved issue claim. The plan targets package-owned
`useSlateHistory` and `useSlateRootChrome` so examples do not teach app-owned
history/focus plumbing.

## Udecode Open Issues Phase 4 Target Ownership Sync - 2026-05-10

Status: fork-local synced
Source plan:
`docs/plans/2026-05-10-slate-v2-udecode-open-issues-reproduction-ralplan.md`

| Issue              | Status            | Evidence                                                                                                                                                                                                          | Decision text                                                                                                                                 |
| ------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `udecode/slate#5`  | fixes-claimed     | Local browser row reproduced the images `Cmd+A` bug as correct editor text model selection plus wrong selected-image chrome; final focused Chromium proof passed after image chrome became direct-selection-only. | `udecode/slate#5` is fork-lane fixed: editor text select-all no longer renders selected image chrome for broad text ranges.                   |
| `udecode/slate#8`  | fixes-claimed     | Local browser row reproduced editable-void undo leaving two inputs; final focused Chromium proof passed after internal-control `beforeinput historyUndo` routed through Slate history before native input undo.   | `udecode/slate#8` is fork-lane fixed: undo from a newly inserted editable void input removes the owning void block.                           |
| `udecode/slate#15` | already-accounted | Exact iframe parent-toolbar browser row is green on current code.                                                                                                                                                 | `udecode/slate#15` is already accounted: parent toolbar formatting does not incorrectly mutate selected iframe text in the current proof row. |

No upstream PR-facing matrix or PR description claim was changed here. These are
fork-local `udecode/slate` issue IDs, not upstream `ianstormtaylor/slate` issue
IDs.

## #3857 Cutting a block element does not remove it

Status: improves-claimed
Bucket: v2-clipboard-serialization
Confidence: medium

Issue summary:
The image example copied a selected block image on Ctrl+X but did not remove it
from the editor unless the user expanded the selection.

Evidence:

- live gitcrawl checked: open singleton issue, all-browser report.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/test/dom-coverage-native-bridge-contract.test.ts`.
- implementation:
  `.tmp/slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`.
- checkpoint:
  `.tmp/completion-checks/slate-v2-clawsweeper-v2-clipboard-structural-cut-delete-execution.md`.

Decision:
Keep this as `improves-claimed`, not `fixes-claimed`. Package proof shows a
selected block void cut writes the model fragment, removes the void block, and
requests model-owned DOM repair. Exact browser closure still needs the images
example replay.

PR-description text:
Improves #3857: selected block void cut writes model-backed clipboard data,
removes the void block, and repairs the caret from model state; no browser
auto-close claim.

## #3801 Cutting nodes containing a list can leave a list-item

Status: improves-claimed
Bucket: v2-clipboard-serialization
Confidence: medium

Issue summary:
Cutting a selection containing a list could leave the remaining block as a
`list-item` instead of a paragraph in the richtext example.

Evidence:

- live gitcrawl checked: open singleton issue.
- current v2 proof:
  `.tmp/slate-v2/packages/slate/test/clipboard-contract.ts`.
- checkpoint:
  `.tmp/completion-checks/slate-v2-clawsweeper-v2-clipboard-structural-cut-delete-execution.md`.

Decision:
Keep this as `improves-claimed`. Core deletion across a list between text blocks
does not leave an orphan `list-item`. Exact richtext browser cut and product
list-normalization behavior are not claimed.

PR-description text:
Improves #3801: core structural delete across a list removes the list structure
without leaving an orphan `list-item`; exact browser closure is not claimed.

## #3469 Cannot copy or delete whole list

Status: improves-claimed
Bucket: v2-clipboard-serialization
Confidence: medium

Issue summary:
Select-all copy of a list omitted the wrapping list element in external HTML,
and deleting a whole-list document left list structure behind.

Evidence:

- live gitcrawl checked: open singleton issue with current activity in 2025.
- current v2 proof:
  `.tmp/slate-v2/packages/slate/test/clipboard-contract.ts`.
- checkpoint:
  `.tmp/completion-checks/slate-v2-clawsweeper-v2-clipboard-structural-cut-delete-execution.md`.

Decision:
Keep this as `improves-claimed`. The model fragment for a selected whole list
keeps the wrapping list element. External HTML list serialization and the exact
whole-list browser delete policy remain outside this raw Slate proof.

PR-description text:
Improves #3469: model fragment extraction keeps the wrapping list element for a
whole selected list; external HTML and whole-list browser delete closure are not
claimed.

## #4716 Table copy error

Status: fixes-claimed
Bucket: v2-clipboard-serialization
Confidence: medium

Issue summary:
A table copy/paste case exposed confusion between Slate fragments and expected
HTML table/span payloads.

Evidence:

- live gitcrawl checked: open singleton discussion issue.
- current v2 proof: clipboard trust-boundary and insertion-shape tests, but no
  table-specific browser replay.
- plan owner:
  `docs/plans/2026-05-04-slate-v2-clawsweeper-v2-clipboard-serialization-ralplan.md`.

Decision:
Keep this as `related`. Table HTML serialization is app schema policy, not a raw
Slate default serializer. The v2 clipboard boundary is relevant, but exact table
closure is not claimed.

PR-description text:
Related #4716: table copy belongs to clipboard strategy and app schema
serialization; no table-specific auto-close claim.

## #2694 Shift-Delete does not cut to clipboard

Status: not-claimed
Bucket: v2-clipboard-serialization
Confidence: medium

Issue summary:
On Windows/Linux, Shift+Delete deleted selected text but did not copy it to the
clipboard like Ctrl+X.

Evidence:

- live gitcrawl checked: open singleton issue.
- current v2 proof: Slice 4 hardens `cut` event handling once a clipboard event
  with `clipboardData` reaches Slate.
- related runtime file:
  `.tmp/slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`.

Decision:
Keep this as `not-claimed`. Shift+Delete needs OS/browser shortcut dispatch and
clipboard transfer proof. The current slice does not synthesize system clipboard
cut semantics from a keydown event.

PR-description text:
Not claimed #2694: Shift+Delete clipboard transfer needs OS/browser shortcut
proof; this slice only hardens actual cut events with clipboard data.

## #6038 Perf: repeated tree updates need a batch-aware apply engine

Status: improves-claimed
Bucket: already-accounted
Confidence: high

Issue summary:
This is a performance issue about repeated exact-path tree updates needing a
batch-aware apply engine. The live issue is open, references PR #6039, and asks
for a benchmark-backed architecture improvement rather than a single UI bug fix.

Evidence:

- ledger row: `transactionality-and-batch-engine`, valid,
  `improves-claimed`.
- related issues: PR #6039 is referenced in the issue body; no duplicate issue
  was established in this pilot.
- duplicate/stale/invalid proof: none.
- live GitHub checked: yes, open.
- current v2 proof:
  `.tmp/slate-v2/scripts/benchmarks/core/current/transaction-execution.mjs`;
  `docs/slate-v2/slate-tranche-3-execution.md`;
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`.

Decision:
Keep this as `improves-claimed`, not `fixes-claimed`. Slate v2 has
transaction/applyOperations benchmark coverage for mixed structural snapshots,
but the current ledger does not define an accepted performance threshold that
would prove the full upstream benchmark claim.

PR-description text:
Improves #6038: Slate v2 adds transaction/applyOperations benchmark coverage for
batch-style repeated tree updates, but this PR does not auto-close the issue
because no accepted performance threshold proves the full upstream benchmark
claim.

## #6034 Cursor moves to wrong position when pressing down arrow at end of table that is last node

Status: improves-claimed
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
This is a DOM selection/navigation bug at a table boundary when the table is the
last node in the editor. The live issue is open and gives official table-example
repro steps for arrow-key movement at the end of the document.

Evidence:

- ledger row: `dom-selection-synchronization`, likely-valid, `cluster-synced`.
- related issues: no specific duplicate was established in this pilot; it
  belongs to the broader DOM selection, focus, hit-testing, zero-width, void,
  table, and boundary bridge cluster.
- duplicate/stale/invalid proof: none.
- live GitHub checked: yes, open, `bug` label.
- current v2 proof: `.tmp/slate-v2/packages/slate-dom/test/bridge.ts`;
  `.tmp/slate-v2/packages/slate-dom/test/dom-coverage.ts`;
  `.tmp/slate-v2/playwright/integration/examples/tables.test.ts`;
  `docs/plans/2026-05-04-slate-v2-full-issue-ledger-architecture-ralplan.md`;
  `docs/plans/2026-05-04-slate-v2-full-issue-ledger-architecture-ralplan-issue-matrix.md`.
- proof command:
  `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/tables.test.ts --project=chromium --grep "ArrowDown at the table end"`.

Decision:
Claim `Fixes #6034`. The exact table-edge browser reproduction is covered:
remove the trailing paragraph, place the caret at the last table cell, press
ArrowDown, type, and verify text lands only in the last cell with model
selection still on `[1,2,3,0]`.

PR-description text:
Fixes #6034: the tables example keeps the caret in the final table cell when
the table is the last node and ArrowDown is pressed before typing.

## #6022 [Android] Soft keyboard dismisses and cursor jumps when typing after toggling a mark on a collapsed selection

Status: related
Bucket: v2-input-runtime
Confidence: high

Issue summary:
This is an Android input/composition bug where toggling a mark on a collapsed
selection causes keyboard dismissal and selection jumps while typing.

Evidence:

- ledger row: live gitcrawl cluster 9,
  `android-mark-toggle-keyboard-dismissal`.
- related PR: #6027, which claims an upstream fix by avoiding a raw follow-up
  selection after marked Android insertion.
- related issues: search and neighbor evidence route this into the broader
  Android, IME, beforeinput, mark-placeholder, and selection runtime family
  with #5183, #4400, #5883, #5983, #6051, #5680, #5078, #5493, #4602, #5130,
  and #4994.
- duplicate/stale/invalid proof: not a duplicate; #6027 is linked upstream fix
  evidence, not fork proof.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-threads-6022-6027.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`,
  `.tmp/slate-v2/packages/slate-react/test/android-input-manager-contract.test.ts`,
  `.tmp/slate-v2/packages/slate-react/test/with-react-contract.tsx`, and
  `.tmp/slate-v2/packages/slate-browser/test/core/release-proof.test.ts`.
- 2026-05-23 no-Appium proof: package contract reproduced the stale selection
  sub-bug from the #6027 root-cause class. Before the fix, marked collapsed
  Android typing inserted the marked leaf correctly but restored selection to
  raw `[0,0]@2`; after the fix, selection normalizes to the inserted marked
  leaf at `[0,1]@1`.
- video evidence transcript: issue recording shows keyboard dismissal after the
  bold toolbar action and repeated refocus attempts on Android.

Decision:
Keep as `related`, not `fixes-claimed`. The current fork fixes the stale
selection owner for marked collapsed Android input, matching the #6027 root
cause class. The exact user-visible keyboard dismissal still needs Android
Chrome/WebView device proof before closure.

PR-description text:
Related #6022: Slate v2 input/composition runtime targets the Android
mark-toggle selection/keyboard class and now has package proof for the stale
selection sub-bug, but this PR does not auto-close without matching device
proof.

## #5987 Caret jumps to wrong position when decorate callback changes from async state update

Status: fixes-claimed
Bucket: v2-react-runtime
Confidence: high

Issue summary:
An async decoration callback update can restructure rendered text DOM and move
the caret to the wrong position.

Evidence:

- ledger row: live gitcrawl cluster 10,
  `async-decoration-and-projection-stability`.
- related PR: #6033, which describes decoration DOM restructuring as the root
  cause and claims an upstream fix for #5987.
- duplicate/stale/invalid proof: not a duplicate; same async decoration/caret
  owner as existing projection work.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-10-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`,
  `.tmp/slate-v2/site/examples/ts/decorations-async.tsx`,
  `.tmp/slate-v2/playwright/integration/examples/decorations-async.test.ts`,
  and
  `docs/plans/2026-05-23-slate-v2-async-decoration-caret-cluster-proof.md`.

Decision:
Promote to `fixes-claimed`. The browser proof mirrors the upstream repro: a
delayed async `Editable.decorate` callback identity change adds a highlight
after typing matching text at the document end, and both Slate selection and
the browser DOM caret stay at the typed end after the DOM is restructured.

PR-description text:
Fixes #5987: async `Editable.decorate` updates can restructure text DOM without
moving the browser caret away from the current Slate selection.

## #5983 When the content is empty, the first voice input on Android repeats

Status: related
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Android voice input can duplicate the first insertion when the editor starts
from an empty content state.

Evidence:

- ledger row: live gitcrawl cluster 11, `android-empty-voice-input`.
- related PR: #6020, which claims an upstream fix for Android IME first
  character duplication on empty nodes.
- related issues: same Android empty-node/IME family as #4400, #5883, #5989,
  #5493, and #6051.
- duplicate/stale/invalid proof: not a duplicate; voice input is the specific
  report shape.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch1-9-14.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/composition-state.ts`, and
  `.tmp/slate-v2/packages/slate-browser/test/core/release-proof.test.ts`.

Decision:
Keep as `cluster-synced`. The owner is Android empty-node IME insertion, but
voice-input device proof is required before closure.

PR-description text:
Related #5983: Android empty-node IME input family; no exact voice-input
closure.

## #5183 Selecting an inline void element in Android platform doesn't evoke the keyboard

Status: related
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Selecting an inline void on Android fails to open the soft keyboard.

Evidence:

- ledger row: live gitcrawl cluster 12, `android-inline-void-keyboard`.
- related issues: #5391 covers inline void selection and cursor placement on
  iOS; search also routes this through Android inline/void keyboard behavior.
- duplicate/stale/invalid proof: not a duplicate; Android keyboard activation
  is the specific behavior.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-12-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-browser/test/core/scenario.test.ts`,
  `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`, and
  `.tmp/slate-v2/packages/slate-react/src/rendering-strategy/segment-shell.tsx`.

Decision:
Keep as `cluster-synced`. Inline void boundary navigation is represented, but
Android keyboard activation needs device proof.

PR-description text:
Related #5183: inline void/mobile selection boundary family; no exact Android
keyboard closure.

## #5391 Inline void selection and cursor placement issues on iOS

Status: not-claimed
Bucket: ecosystem-boundary
Confidence: high

Issue summary:
iOS selection handles and cursor movement are unstable around inline void
elements.

Evidence:

- ledger row: live gitcrawl cluster 12, `android-inline-void-keyboard`.
- related issue: #5183 is the Android member of the same inline void mobile
  boundary family.
- duplicate/stale/invalid proof: related, not duplicate; iOS selection handles
  are a separate device proof owner.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-12-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-browser/test/core/scenario.test.ts`,
  `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`, and
  `.tmp/slate-v2/packages/slate-react/src/rendering-strategy/segment-shell.tsx`.

Decision:
Keep as `cluster-synced`. It strengthens the mobile inline-void boundary owner,
but iOS device proof is required before closure.

PR-description text:
Related #5391: inline void/mobile selection boundary family; no exact iOS
closure.

## #4400 [Android/Chrome] `AndroidEditable` interfering with IME

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Android Chrome IME composition can be interrupted by Slate's Android editing
path.

Evidence:

- ledger row: live gitcrawl cluster 13, `android-ime-empty-node-composition`.
- related issue: #5883 reports empty-text-node Android IME composition
  interruption.
- duplicate/stale/invalid proof: not a duplicate; #4400 is the broad Android
  editable/IME interference report.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-13-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/composition-state.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`,
  and `.tmp/slate-v2/packages/slate-react/test/editing-kernel-contract.ts`.

Decision:
Keep as `cluster-synced`. Composition ownership exists, but Android Chrome IME
device proof is required before closure.

PR-description text:
Related #4400: Android IME/composition runtime family; no exact closure.

## #5883 Composition interrupted in empty text nodes on Android IME

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Android IME composition ends early when typing in empty leaves or empty text
nodes.

Evidence:

- ledger row: live gitcrawl cluster 13, `android-ime-empty-node-composition`.
- related issue: #4400 covers broader AndroidEditable IME interference.
- duplicate/stale/invalid proof: related, not duplicate; empty-node
  composition is the specific report.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-13-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/composition-state.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`,
  and `.tmp/slate-v2/packages/slate-browser/test/core/release-proof.test.ts`.

Decision:
Keep as `cluster-synced`. It is the right input-runtime family, but exact empty
Android IME proof is not present.

PR-description text:
Related #5883: Android empty-node IME composition family; no exact closure.

## #5826 Unexpected auto-scrolling behavior when refocus the editor

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Refocusing a long editor can scroll unexpectedly to the previous selection.

Evidence:

- ledger row: live gitcrawl cluster 14, `refocus-autoscroll`.
- related PR: #5882, which claims an upstream fix for #5826.
- duplicate/stale/invalid proof: not a duplicate; scroll-on-refocus is the
  specific behavior.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch1-9-14.json`.
- current v2 proof:
  `.tmp/slate-v2/playwright/integration/examples/huge-document.test.ts`,
  `.tmp/slate-v2/packages/slate-react/test/app-owned-customization.tsx`,
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`, and
  `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`.

Decision:
Claim `Fixes #5826`. The huge-document browser row follows the reported flow:
click the top block, blur, scroll to the final block, click back into the
editor, and keep the clicked final-block selection visible instead of restoring
the stale top selection.

PR-description text:
Fixes #5826: long-editor refocus keeps the clicked final-block selection visible
instead of restoring the stale top selection.

## #6016 Displaying 2 Slate components with the same initialValue breaks the page

Status: triage-closed
Bucket: skip-invalid
Confidence: high

Issue summary:
This reports two Slate editors rendering the same value object reference and
breaking DOM/path resolution. The live issue is open, but maintainer discussion
clarifies that sharing the same Slate node objects across editor instances is
not a supported contract because editor DOM/path maps are keyed by node
identity.

Evidence:

- ledger row: `shared-node-identity-across-editors`, likely-invalid,
  `triage-closed`.
- related issues: no specific duplicate was established in this pilot.
- duplicate/stale/invalid proof: live maintainer discussion says shared Slate
  values across editors are unsupported; the practical workaround is deep
  cloning per editor instance, and the reporter acknowledged the usage was not
  aligned with Slate's model.
- live GitHub checked: yes, open, `bug` label.
- current v2 proof:
  `docs/plans/2026-05-04-slate-v2-full-issue-ledger-architecture-ralplan.md`;
  `docs/plans/2026-05-04-slate-v2-full-issue-ledger-architecture-ralplan-issue-matrix.md`.

Decision:
Do not claim this as a v2 fix. Raw Slate should not support the same node object
identity mounted in multiple editor runtimes as a normal contract. Reopen only
if a current minimal repro shows a supported usage failing.

PR-description text:
None; detailed ledger only. #6016 is classified as likely-invalid shared-node
identity misuse, not a Slate v2 closure claim.

## #6013 Improvement: Omit initialValue for pre-initialized editor instances

Status: fixes-claimed
Bucket: already-accounted
Confidence: high

Issue summary:
This is an API ergonomics issue asking React providers to accept an already
initialized editor without requiring a separate provider-level `initialValue`.
The live issue is open, and the current Slate v2 coverage matrix already carries
the exact fix claim.

Evidence:

- ledger row: `react-initialization-api-ergonomics`, valid, `fixes-claimed`.
- related issues: #5605 is the duplicate/related initialValue issue and is also
  covered in the issue coverage matrix.
- duplicate/stale/invalid proof: none.
- live GitHub checked: yes, open, `improvement` label.
- current v2 proof: `docs/slate-v2/ledgers/issue-coverage-matrix.md`;
  `docs/slate-v2/references/pr-description.md`;
  `.tmp/slate-v2/packages/slate/test/state-tx-public-api-contract.ts`.

Decision:
Keep the exact `Fixes #6013` claim. Slate v2 makes editor initialization own
the initial value, so the React provider can accept a pre-initialized editor
without requiring another `initialValue` prop.

PR-description text:
Fixes #6013: React providers accept pre-initialized editor instances without a
provider-level initialValue; editor state is seeded during editor creation.

## #6051 On Firefox for Android with the Samsung Keyboard, Slate fails to insert some characters

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: high

Issue summary:
Firefox for Android with Samsung Keyboard fails to insert the second character
on a new line. The reported runtime error is `can't access property
"hasAttribute", s is null`; the reporter points to Android `handleDOMBeforeInput`
and `toSlateRange` / `toSlatePoint` receiving DOM containers whose `parentNode`
is null.

Evidence:

- ledger row: live gitcrawl singleton, `android-firefox-samsung-ime`, valid,
  `cluster-synced`.
- related issues: gitcrawl neighbors include #5130, #3313, #5643, #4400,
  #5603, #6022, #5171, #5183, and #4789.
- duplicate/stale/invalid proof: no exact duplicate found. The closest family
  is Android / Firefox / IME DOM point import, but Samsung Keyboard plus
  null-parent DOM containers is a distinct live repro.
- live GitHub checked: yes; issue is open and uses Slate `0.124.1` plus the
  public Rich Text example.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`;
  `.tmp/slate-v2/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts`;
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`.

Decision:
Route to the input runtime. Do not claim a fix without device proof. This is not
just a generic DOM point crash; the null-parent `beforeinput` shape makes it a
mobile input-runtime gate.

PR-description text:
None; detailed ledger only.

## #5709 useSlate hook holds old editor instance after recreating a new one

Status: fixes-claimed
Bucket: v2-react-runtime
Confidence: high

Issue summary:
`useSlate` kept returning the old editor object after `<Slate editor>` received
a newly created editor instance.

Evidence:

- local gitcrawl archive checked:
  `gitcrawl threads --numbers 5709,4680,4165,5404,5131,3656,4141,4210,2051,3430 --include-closed --json ianstormtaylor/slate`.
- neighbor evidence: #4680, #5181, #5211, #3497, and #4323 are adjacent
  React/runtime and focus pressure, not the same exact replacement proof.
- current matrix proof:
  `.tmp/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`.

Decision:
Keep the existing exact claim. This is the one issue in the pass-2 surface where
the current matrix already has a focused provider replacement proof.

PR-description text:
Fixes #5709: React provider hook consumers receive the replacement editor when
`<Slate editor>` changes.

## #4680 useSlate acts as useSlateStatic and returns the same editor even after a change in the editor

Status: related
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
The report observes `useSlate()` returning the same editor object after editor
changes, but it is framed around legacy context value semantics rather than the
new editor-replacement repro in #5709.

Evidence:

- local gitcrawl archive checked:
  `gitcrawl threads --numbers 5709,4680,4165,5404,5131,3656,4141,4210,2051,3430 --include-closed --json ianstormtaylor/slate`.
- neighbor evidence from #5709 lists #4680 as the closest adjacent issue.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`.

Decision:
Keep as related. The `#6053` pass confirms this is editor identity pressure
owned by the provider replacement lane, not selected-element self-removal.

PR-description text:
Related #4680: editor identity and hook update pressure is covered by provider
replacement contracts, but exact legacy `useSlate` state-change closure is not
separately claimed.

## #4165 rename useSlate to useEditor

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
The issue asks for clearer hook naming so editor identity access and stateful
subscription behavior are not confused.

Evidence:

- local gitcrawl archive checked:
  `gitcrawl threads --numbers 5709,4680,4165,5404,5131,3656,4141,4210,2051,3430 --include-closed --json ianstormtaylor/slate`.
- live ledger row classifies it under `react-hook-surface-and-subscriptions`.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor.tsx`,
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx`, and
  `.tmp/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`.

Decision:
Keep as cluster-synced. Hook naming and broad-vs-narrow subscription law are
real v2 API pressure, but this pass does not promote a naming issue to an exact
fix claim.

PR-description text:
Related #4165: hook naming and subscription-surface clarity belong to the v2
React hook contract; no exact legacy rename closure.

## #5131 useSlate triggers rerender when selection changes

Status: not-claimed
Bucket: v2-react-runtime
Confidence: high

Issue summary:
The issue asks whether `useSlate` should avoid rerendering on selection changes
and whether a non-rerendering editor hook should exist.

Evidence:

- local gitcrawl archive checked:
  `gitcrawl threads --numbers 5709,4680,4165,5404,5131,3656,4141,4210,2051,3430 --include-closed --json ianstormtaylor/slate`.
- local search:
  `gitcrawl search ianstormtaylor/slate --query "useSlate selection rerender" --mode hybrid --limit 20 --json`.
- current matrix proof owner:
  `.tmp/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx`.

Decision:
Keep the existing non-claim. Broad editor hooks may rerender by contract; the
v2 answer is narrower selector/block-slice subscriptions unless a later API pass
changes that law explicitly.

PR-description text:
Not claimed #5131: broad editor hooks remain broad by contract; v2 proves
narrow selector locality instead.

## #3656 Avoid unnecessary re rendering of leaves within a block element

Status: improves-claimed
Bucket: v2-performance-benchmark
Confidence: high

Issue summary:
Editing one leaf in a block should not rerender every sibling leaf and the
parent block.

Evidence:

- local gitcrawl archive checked:
  `gitcrawl threads --numbers 5709,4680,4165,5404,5131,3656,4141,4210,2051,3430 --include-closed --json ianstormtaylor/slate`.
- neighbor evidence from #4210 returns #3656 as the closest rerender-breadth
  sibling.
- current matrix proof owner:
  `.tmp/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx`.

Decision:
Keep as improves-claimed. The benchmark represents the leaf breadth pressure,
but exact app/browser closure remains benchmark-gated.

PR-description text:
Improves #3656: rerender-breadth proof keeps sibling leaves and the parent block
local during one leaf edit; no exact app closure.

## #4141 performance of nested blocks

Status: improves-claimed
Bucket: v2-performance-benchmark
Confidence: high

Issue summary:
Editing a deeply nested text node can rerender ancestors up to the editor root.

Evidence:

- local gitcrawl archive checked:
  `gitcrawl threads --numbers 5709,4680,4165,5404,5131,3656,4141,4210,2051,3430 --include-closed --json ianstormtaylor/slate`.
- neighbor evidence from #4210 returns #4141 as the same nested rerender family.
- current matrix proof owner:
  `.tmp/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx`.

Decision:
Keep as improves-claimed. Nested-block rerender breadth is benchmark-owned; no
browser closure claim is added here.

PR-description text:
Improves #4141: nested rerender-breadth proof keeps unaffected ancestors and
sibling branches local; no exact browser closure.

## #4210 Preventing re-renders

Status: cluster-synced
Bucket: v2-performance-benchmark
Confidence: medium

Issue summary:
Typing, Enter, and selection changes light up too much of the rendered tree in
React DevTools.

Evidence:

- local gitcrawl archive checked:
  `gitcrawl threads --numbers 5709,4680,4165,5404,5131,3656,4141,4210,2051,3430 --include-closed --json ianstormtaylor/slate`.
- neighbor evidence: #5274, #3656, #4141, #5433, #2051, #4225, and #5131.
- current v2 proof owner:
  `.tmp/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx`.

Decision:
Keep as cluster-synced until pass 3/6 defines the exact benchmark threshold and
whether this issue moves to `Improves`.

PR-description text:
Related #4210: whole-document render breadth belongs to benchmark-gated React
runtime proof; no exact closure yet.

## #3430 Unresponsive editor due to normalization on paragraph with lots of inline nodes

Status: not-claimed
Bucket: v2-performance-benchmark
Confidence: medium

Issue summary:
Typing and deleting inside a single paragraph with many inline nodes becomes
unresponsive.

Evidence:

- local gitcrawl archive checked:
  `gitcrawl threads --numbers 5709,4680,4165,5404,5131,3656,4141,4210,2051,3430 --include-closed --json ianstormtaylor/slate`.
- current matrix row already keeps #3430 out of exact claims.
- current v2 proof owner:
  `docs/slate-v2/references/architecture-contract.md` and future benchmark
  rows.

Decision:
Keep as not claimed. Rerender breadth is related, but the many-inline
normalization/freeze repro needs its own benchmark or browser proof.

PR-description text:
Not claimed #3430: rerender-breadth pressure is represented, but
single-paragraph many-inline freeze is not proven.

## #3162 decorate not work well with ime input method

Status: related
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
IME input inside decorated text can leave the browser DOM and Slate decoration
projection out of sync.

Evidence:

- local gitcrawl archive checked:
  `gitcrawl threads --numbers 4483,5987,4993,4997,4392,3382,3352,3383,3309,3162 --include-closed --json ianstormtaylor/slate`.
- local ledger classifies this as future proof pressure.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`
  and decoration projection tests.

Decision:
Keep as related to this plan but owned by the Mobile/IME lane for exact closure.
Decoration stores help, but IME proof must be device/browser-facing.

PR-description text:
Related #3162: decorated IME input belongs to composition/runtime plus
decoration projection proof; no exact IME closure.

## #4712 Creating decoration range with text field interferes with selection

Status: related
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
A decoration range carrying a replacement `text` field can visually change text
length and shift the insertion point.

Evidence:

- local gitcrawl archive checked:
  `gitcrawl threads --numbers 4712,4581,5398,5433,4750,4298,4225,2465,2564,4477,3478,3497,5509 --include-closed --json ianstormtaylor/slate`.
- local matrix currently keeps #4712 in future proof pressure.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/components/editable-text.tsx` and
  `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`.

Decision:
Keep as related. Projection slices must not lie about model text length unless a
future replacement-text API owns DOM point mapping explicitly.

PR-description text:
Related #4712: replacement-like decoration text belongs to projection and DOM
point mapping policy; no exact closure.

## #5398 Cursor move backward on re-render while composing Chinese

Status: related
Bucket: v2-input-runtime
Confidence: high

Issue summary:
External state updates while composing Chinese move the cursor backward.

Evidence:

- local gitcrawl archive checked:
  `gitcrawl threads --numbers 4712,4581,5398,5433,4750,4298,4225,2465,2564,4477,3478,3497,5509 --include-closed --json ianstormtaylor/slate`.
- neighbor evidence: #5433, #5524, #4466, #3943, #3497, #5181, and #5023.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`
  and Mobile/IME browser/device proof rows.

Decision:
Keep as related to React/decorations but owned by Mobile/IME for exact closure.
This cannot be fixed-claimed from desktop selector/projection tests.

PR-description text:
Related #5398: external rerender during Chinese composition belongs to the
input/composition runtime; no exact device/browser closure.

## #5433 editable re-render causes cursor movement during composition

Status: related
Bucket: v2-input-runtime
Confidence: high

Issue summary:
Decorate-triggered editable rerender moves the cursor during composition.

Evidence:

- local gitcrawl archive checked:
  `gitcrawl threads --numbers 4712,4581,5398,5433,4750,4298,4225,2465,2564,4477,3478,3497,5509 --include-closed --json ianstormtaylor/slate`.
- neighbor evidence from #5398 and #4210 ties it to both composition and
  rerender breadth.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`
  and decoration projection tests.

Decision:
Keep as related. It informs the combined architecture plan, but exact closure is
composition/browser proof, not a package-only React runtime claim.

PR-description text:
Related #5433: decorate rerender during composition belongs to input runtime and
decoration projection proof; no exact closure.

## #4750 Editor.marks returns only the first selected leaf marks

Status: cluster-synced
Bucket: v2-core-engine
Confidence: medium

Issue summary:
`Editor.marks(editor)` over a multi-leaf selection returns first-leaf marks
instead of reduced/common mark state.

Evidence:

- local gitcrawl archive checked:
  `gitcrawl threads --numbers 4712,4581,5398,5433,4750,4298,4225,2465,2564,4477,3478,3497,5509 --include-closed --json ianstormtaylor/slate`.
- neighbor evidence: #3433, #4225, #4298, #3671, #3383, #4317, and #3568.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate/src` mark query semantics and React selection
  proof rows.

Decision:
Keep as cluster-synced. This is core mark-query semantics plus browser
selection behavior; projection stores alone do not close it.

PR-description text:
Related #4750: multi-leaf active mark reduction belongs to core mark semantics
and selection proof; no exact closure.

## #2465 Proposal for better ergonomics when rendering marks

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Overlapping rendered marks split into repeated component islands, making
interactive wrappers such as links harder to express cleanly.

Evidence:

- local gitcrawl archive checked:
  `gitcrawl threads --numbers 4712,4581,5398,5433,4750,4298,4225,2465,2564,4477,3478,3497,5509 --include-closed --json ianstormtaylor/slate`.
- local search:
  `gitcrawl search ianstormtaylor/slate --query "render marks overlapping decorations" --mode hybrid --limit 20 --json`.
- neighbor evidence from #3383 lists #2465 as the closest mark/render sibling.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/components/editable-text.tsx`.

Decision:
Keep as cluster-synced. This is real render-DX pressure, but the plan must
decide whether v2 solves it with render policy, projection payloads, or docs.

PR-description text:
Related #2465: overlapping mark rendering belongs to render-leaf/text DX proof;
no accepted render API closure yet.

## #2564 Consider a more clear cut distinction between marks and inlines

Status: cluster-synced
Bucket: v2-api-dx
Confidence: medium

Issue summary:
The issue asks for a clearer conceptual boundary between editable text marks,
inline nodes, and decorations.

Evidence:

- local gitcrawl archive checked:
  `gitcrawl threads --numbers 4712,4581,5398,5433,4750,4298,4225,2465,2564,4477,3478,3497,5509 --include-closed --json ianstormtaylor/slate`.
- neighbor evidence from #4483 and #3383 ties #2564 to decoration and
  mark-render semantics.
- current v2 proof owner:
  public API law in this plan, plus `.tmp/slate-v2/packages/slate-react` render
  and projection contracts.

Decision:
Keep as cluster-synced. The combined lane must state clear mark/inline/
decoration boundaries, but no issue closure is justified from planning alone.

PR-description text:
Related #2564: mark, inline, and decoration boundary clarity belongs to the v2
API law; no exact closure.

## DOM Selection Focused Ledger Gap Sync - 2026-05-08

This is the focused ClawSweeper gap pass for
`docs/plans/2026-05-08-slate-v2-dom-selection-focus-bridge-ralplan.md` after
the full issue-ledger scan. It adds no fixed issue claims.

## #5690 Double-clicking a word before an inline element and deleting crashes Slate

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Windows/Chrome double-click selection before an inline element followed by
Backspace crashes with native DOM range offset drift.

Evidence:

- ledger row: live gitcrawl singleton, open issue.
- duplicate/stale/invalid proof: not duplicate; the Windows/Chrome inline
  boundary delete sequence is specific.
- live GitHub checked: yes, live-gitcrawl-only via
  `gitcrawl threads ianstormtaylor/slate --numbers 5690 --include-closed --json`.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-keyboard-events.ts`,
  and `.tmp/slate-v2/playwright/integration/examples/inlines.test.ts`.

Decision:
Keep as `cluster-synced`. The row belongs to inline-boundary DOM selection
repair, but exact Windows/Chrome browser closure is not claimed.

PR-description text:
Related #5690: inline-boundary double-click/delete selection belongs to DOM
selection repair; no exact Windows/Chrome closure.

## #5689 Triple-click the mouse to select upward, the selection disappears

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Triple-click plus upward selection loses the browser/editor selection in Chrome
or Safari.

Evidence:

- ledger row: live gitcrawl singleton, open issue.
- duplicate/stale/invalid proof: not duplicate; this is gesture directionality,
  adjacent to but not identical with #3871/#5847.
- live GitHub checked: yes, live-gitcrawl-only via
  `gitcrawl threads ianstormtaylor/slate --numbers 5689 --include-closed --json`.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`,
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`, and
  `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`.

Decision:
Keep as `cluster-synced`. Browser gesture-selection direction needs a focused
browser row before any exact claim.

PR-description text:
Related #5689: triple-click/upward gesture selection belongs to browser
selection import/export; no exact Chrome/Safari closure.

## #4995 scrollSelectionIntoView cannot completely customize auto-scrolling behavior

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
The app-provided `scrollSelectionIntoView` callback is not invoked for enough
cursor movement cases, so apps duplicate selection scrolling logic.

Evidence:

- ledger row: live gitcrawl singleton, open issue.
- related issues: #5088 and #5473 cover adjacent scroll-selection callback
  gaps.
- duplicate/stale/invalid proof: not duplicate; #4995 is the app-owned
  customization variant.
- live GitHub checked: yes, live-gitcrawl-only via
  `gitcrawl threads ianstormtaylor/slate --numbers 4995 --include-closed --json`.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`,
  `.tmp/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx`,
  and `.tmp/slate-v2/packages/slate-react/test/app-owned-customization.tsx`.

Decision:
Keep as `cluster-synced`. React selection-scroll policy owns the contract, but
the exact arrow/sticky-header repro is not proven.

PR-description text:
Related #4995: scroll selection customization belongs to React selection-scroll
policy; no exact arrow/sticky-header closure.

## #5632 cursor not as expected when delete a inline badge

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Deleting adjacent inline badges leaves the caret visually invalid and stops
predictable continued deletion.

Evidence:

- ledger row: live gitcrawl singleton, open issue.
- test candidate: `docs/slate-issues/test-candidate-map/5655-5559.md` marks
  adjacent inline badge delete caret as `ready-now`.
- duplicate/stale/invalid proof: not duplicate; this is adjacent inline badge
  delete-caret behavior.
- live GitHub checked: yes, live-gitcrawl-only via
  `gitcrawl threads ianstormtaylor/slate --numbers 5632 --include-closed --json`.
- current v2 proof owner:
  `.tmp/slate-v2/playwright/integration/examples/inlines.test.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`, and
  `.tmp/slate-v2/packages/slate/src/transforms-text/delete-text.ts`.

Decision:
Keep as `cluster-synced`. Inline/void delete-caret ownership is in scope, but
the exact badge repro is not closed.

PR-description text:
Related #5632: adjacent inline badge delete caret belongs to inline/void
selection ownership; no exact badge-browser closure.

## #5559 Shift-Click selection behavior

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Shift-click selection through a void element resets selection or highlights
inside the void incorrectly.

Evidence:

- ledger row: live gitcrawl singleton, open issue.
- test candidate: `docs/slate-issues/test-candidate-map/5655-5559.md` marks
  Shift-click through void selection as `ready-now`.
- duplicate/stale/invalid proof: not duplicate; this is the shift-click void
  selection variant.
- live GitHub checked: yes, live-gitcrawl-only via
  `gitcrawl threads ianstormtaylor/slate --numbers 5559 --include-closed --json`.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`,
  `.tmp/slate-v2/packages/slate-react/test/selection-controller-contract.ts`,
  and `.tmp/slate-v2/playwright/integration/examples/mentions.test.ts`.

Decision:
Keep as `cluster-synced`. Void selection import/export is the right owner, but
exact multi-browser shift-click closure is not claimed.

PR-description text:
Related #5559: Shift-click through void selection belongs to DOM selection
reconciliation; no exact multi-browser closure.

## #3909 Can't use nested content editable

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Nested `contenteditable` controls inside Slate are treated as Slate-owned
editable targets, so Slate hijacks events that should remain native/app-owned.

Evidence:

- ledger row: live gitcrawl singleton, open issue.
- dossier: `docs/slate-issues/open-issues-dossiers/3948-3881.md` keeps it as
  valid runtime-boundary debt.
- duplicate/stale/invalid proof: not duplicate; it is the nested
  `contenteditable` target-ownership issue.
- live GitHub checked: yes, live-gitcrawl-only via
  `gitcrawl threads ianstormtaylor/slate --numbers 3909 --include-closed --json`.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`, and
  `.tmp/slate-v2/playwright/integration/examples/editable-voids.test.ts`.

Decision:
Keep as `cluster-synced`. Nested target ownership is in scope, but exact
CodeMirror/void-node closure is not claimed.

PR-description text:
Related #3909: nested contenteditable target ownership belongs to the DOM
target bridge; no exact CodeMirror/void-node closure.

## #3893 Clicking an HTML button won't update editor's focus state

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Clicking a normal HTML button can leave Slate's focused state stale.

Evidence:

- ledger row: live gitcrawl singleton, open issue.
- dossier: `docs/slate-issues/open-issues-dossiers/3948-3881.md` keeps it as
  valid runtime-boundary debt.
- duplicate/stale/invalid proof: not duplicate; this is the plain button
  focus-state variant.
- live GitHub checked: yes, live-gitcrawl-only via
  `gitcrawl threads ianstormtaylor/slate --numbers 3893 --include-closed --json`.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`,
  `.tmp/slate-v2/playwright/integration/examples/check-lists.test.ts`, and
  `.tmp/slate-v2/packages/slate-react/test/selection-runtime-contract.test.ts`.

Decision:
Keep as `cluster-synced`. React focus timing owns the state update, but exact
HTML button closure is not claimed.

PR-description text:
Related #3893: HTML button focus state belongs to React focus timing; no exact
button-focus closure.

## #5550 Web Component selection boundary

Status: not-claimed
Bucket: ecosystem-boundary
Confidence: medium

Issue summary:
Dragging selection from inside a Web Component cannot extend out of the
encapsulated component.

Evidence:

- ledger row: live gitcrawl singleton, open issue.
- test candidate: `docs/slate-issues/test-candidate-map/5558-5480.md` marks it
  `not-a-test-candidate`.
- duplicate/stale/invalid proof: not invalid; it is outside the normal raw
  Slate DOM ownership model.
- live GitHub checked: yes, live-gitcrawl-only via
  `gitcrawl threads ianstormtaylor/slate --numbers 5550 --include-closed --json`.

Decision:
Do not claim #5550. Web Component encapsulation changes the DOM ownership model
itself; Slate v2 should not promise arbitrary encapsulated selection drag
unless a supported boundary model is designed.

PR-description text:
None; detailed ledger only.

## #5551 Inconsistent Firefox selection with rowspan in td element

Status: not-claimed
Bucket: ecosystem-boundary
Confidence: medium

Issue summary:
Firefox returns unexpected table selection anchor/focus nodes for a custom
table plugin using `rowspan`.

Evidence:

- ledger row: live gitcrawl singleton, open issue.
- test candidate: `docs/slate-issues/test-candidate-map/5558-5480.md` marks it
  `not-a-test-candidate`.
- related issues: #2558 asks for a full table selection model; #6034 and #4658
  cover narrower table boundary behavior.
- live GitHub checked: yes, live-gitcrawl-only via
  `gitcrawl threads ianstormtaylor/slate --numbers 5551 --include-closed --json`.

Decision:
Do not claim #5551. It depends on custom table plugin semantics and Firefox
native table selection; raw DOM bridge containment does not close table-range
selection modeling.

PR-description text:
None; detailed ledger only.

## #5524 Down arrow doesn't update selection even if cursor moves

Status: issue-reviewed
Bucket: v2-core-engine
Confidence: medium

Issue summary:
ArrowDown across soft breaks visually moves the caret, but the model selection
does not match the cursor's new visual line.

Evidence:

- ledger row: live gitcrawl singleton, open issue.
- test candidate: `docs/slate-issues/test-candidate-map/5558-5480.md` marks
  vertical navigation across soft breaks as `ready-with-minor-setup`.
- duplicate/stale/invalid proof: not duplicate; this is the soft-break vertical
  navigation variant.
- live GitHub checked: yes, live-gitcrawl-only via
  `gitcrawl threads ianstormtaylor/slate --numbers 5524 --include-closed --json`.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate/src/editor/positions.ts`.

Decision:
Route to core caret/navigation first. It is related to selection correctness,
but this DOM bridge plan should not claim it without proof that the failure is
DOM import/export rather than logical caret navigation.

PR-description text:
Related #5524: vertical navigation across soft breaks is selection pressure,
but exact closure belongs to core caret/navigation proof.

## #5924 Ability to exclude structural DOM elements from contentEditable context

Status: not-claimed
Bucket: ecosystem-boundary
Confidence: medium

Issue summary:
Advanced layout containers need structural DOM that should not receive cursor
placement while their children remain editable.

Evidence:

- ledger row: live gitcrawl singleton, open issue.
- test candidate: `docs/slate-issues/test-candidate-map/5994-5918.md` marks it
  `not-a-test-candidate` because the reporter could not isolate a clean repro.
- duplicate/stale/invalid proof: not invalid; it is an advanced layout boundary
  request, not a proven v2 bug.
- live GitHub checked: yes, live-gitcrawl-only via
  `gitcrawl threads ianstormtaylor/slate --numbers 5924 --include-closed --json`.

Decision:
Do not claim #5924. No public ignore-cursor API is added by this lane, and no
isolated repro exists for exact closure.

PR-description text:
None; detailed ledger only.

## #6053 useSelected error when remove myself

Status: improves-claimed
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
A component calls `useSelected()` and removes itself from the editor when it is
not selected. During that lifecycle, the hook can read a stale path and call
`Editor.range`, throwing `Cannot find a descendant at path [0,1] in node`.

Evidence:

- ledger row: live gitcrawl singleton, `stale-element-selection-hook`,
  likely-valid, `improves-claimed`.
- related issues: gitcrawl neighbors include #5771, #4031, #4323, #4984,
  #5402, #3858, #4643, #1769, #4111, #5181, #5075, #3921, #5938, #3585,
  #3412, #5034, #5131, #4317, #4842, and #4680.
- duplicate/stale/invalid proof: no exact duplicate found. Exact hybrid
  searches for the self-removal and `Cannot find a descendant` hook wording
  return only #6053. Neighbors split into stale path/tree validity, DOM
  selection bridge, React identity/subscription, input/IME false neighbors,
  stale IE11 support, maintainer-noise cleanup, and API typing rows.
- live GitHub checked: yes; issue is open with no comments.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/test/use-element-selected.test.tsx`
  covers a selected rendered element that removes itself and unmounts cleanly,
  plus an explicit `useElementSelected(path)` watcher that returns `false`
  after the watched path is removed. Existing path-shift coverage remains in
  the same file and `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`.
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-element-selected.ts` guards
  path validity before calling `Editor.range`.

Decision:
Claim `Fixes #6053`. The exact self-removal lifecycle is covered, explicit
stale watched paths fail closed to `false`, and related issue discovery found
no broader duplicate that should absorb the claim. Active plan:
`docs/plans/2026-05-08-slate-v2-use-element-selected-self-removal-ralplan.md`.

PR-description text:
None; detailed ledger only.

## #3858 Cannot find a descendant at path when emptying deeply nested editor value

Status: issue-reviewed
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
External value reset after a deeply nested selection can leave stale descendant
paths in selection or weak-map reads.

Evidence:

- ledger row: old corpus classifies this as external value / stale descendant
  path pressure.
- related issues: surfaced by `#6053` neighbor discovery.
- duplicate/stale/invalid proof: same stale path symptom family, different
  repro; not a duplicate of `#6053`.
- live GitHub checked: yes, live-gitcrawl-only.
- current v2 proof: exact `#6053` self-removal proof exists in
  `.tmp/slate-v2/packages/slate-react/test/use-element-selected.test.tsx`.

Decision:
Related only. The `#6053` hook closure is proved, but broader external value
reset belongs to React value and provider lifecycle lanes.

PR-description text:
None; detailed ledger only.

## #4081 Error: Cannot find a descendant at path [0] in node - CRA live-reload

Status: issue-reviewed
Bucket: v2-react-runtime
Confidence: low

Issue summary:
CRA live reload can leave stale editor/path state and throw a descendant-path
error.

Evidence:

- ledger row: old corpus routes this to React singleton lifecycle / fast
  refresh pressure.
- related issues: stale descendant path wording overlaps `#6053`.
- duplicate/stale/invalid proof: environment/live-reload repro differs from
  selected-element self-removal.
- live GitHub checked: no, local ledger only.
- current v2 proof: no exact fast-refresh proof in this lane.

Decision:
Related, not claimed. Keep out of `#6053` unless a current fast-refresh repro
shows the same hook path owner.

PR-description text:
None; detailed ledger only.

## #4323 Cannot resolve a DOM point from Slate point

Status: issue-reviewed
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
External history or value replacement can ask the DOM bridge to resolve stale
or unmapped Slate points.

Evidence:

- ledger row: old corpus routes this to external value sync / DOM selection
  pressure.
- related issues: surfaced by `#6053` neighbor discovery.
- duplicate/stale/invalid proof: DOM point import failure, not
  `useElementSelected` `Editor.range` self-removal.
- live GitHub checked: yes, live-gitcrawl-only.
- current v2 proof: DOM bridge rows own exact DOM point claims; this lane does
  not.

Decision:
Related only. Do not claim closure from the hook plan.

PR-description text:
None; detailed ledger only.

## #5181 Wrong onChange callback called after editor and onChange are changed

Status: issue-reviewed
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Replacing `editor` and `onChange` can leave stale callback/editor state in
React provider consumers.

Evidence:

- ledger row: gitcrawl neighbor of `#6053`.
- related issues: adjacent to `#5709` and `#4680` React provider identity
  pressure.
- duplicate/stale/invalid proof: stale callback/provider repro, not selected
  element self-removal.
- live GitHub checked: yes, live-gitcrawl-only.
- current v2 proof: provider identity exact claim remains `#5709`.

Decision:
Related only. Exact closure would need provider callback replacement proof.

PR-description text:
None; detailed ledger only.

## #5771 Exception between Select and Anchor Operations in Collaboration

Status: issue-reviewed
Bucket: v2-core-engine
Confidence: high

Issue summary:
High-frequency collaboration operations can preempt anchor/selection state and
make selection ownership unstable.

Evidence:

- ledger row: gitcrawl neighbor of `#6053`.
- related issues: stale path and selection rebase pressure overlap this lane.
- duplicate/stale/invalid proof: collaboration QPS repro, not React hook
  self-removal.
- live GitHub checked: yes, live-gitcrawl-only.
- current v2 proof: focused core proof now covers high-QPS remote inserts
  against collapsed local selection, same-offset contention, suffix inserts,
  split/merge, selected-node removal, local follow-up typing, remote-history
  skip, bookmark rebasing, canonical reconcile, and remote side-effect skip
  policy.

Decision:
Improves only. Slate v2 now proves the core collaboration-selection substrate,
but exact provider/browser closure remains unclaimed until a real adapter repro
passes.

PR-description text:
None; detailed ledger only.

## #1769 Selection is not lost when clicking a non-editable block in the editor

Status: issue-reviewed
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Clicking non-editable content can leave Slate focus/selection state stuck.

Evidence:

- ledger row: focus-state and external DOM ownership pressure.
- related issues: gitcrawl neighbor of `#6053`.
- duplicate/stale/invalid proof: focus and non-editable DOM ownership, not
  selected-element self-removal.
- live GitHub checked: yes, live-gitcrawl-only.
- current v2 proof: DOM/focus bridge lanes own this family.

Decision:
Related only. No `#6053` hook claim.

PR-description text:
None; detailed ledger only.

## #3585 Selection is occasionally not updated when clicking

Status: issue-reviewed
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Click handlers can observe a previous selection during pointer/click timing.

Evidence:

- ledger row: gitcrawl neighbor of `#6053`.
- related issues: selection timing and stale selection reads.
- duplicate/stale/invalid proof: click timing race, not hook self-removal.
- live GitHub checked: yes, live-gitcrawl-only.
- current v2 proof: no exact click-timing proof in this lane.

Decision:
Related only. Keep for DOM selection timing, not `useElementSelected` closure.

PR-description text:
None; detailed ledger only.

## #3412 Selection is null after editor loses focus

Status: issue-reviewed
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Toolbar/focus-out interactions can null or preserve selection in ways that make
formatting controls unreliable.

Evidence:

- ledger row: focus-loss selection retention pressure.
- related issues: gitcrawl neighbor of `#6053`.
- duplicate/stale/invalid proof: focus lifecycle issue, not selected-element
  self-removal.
- live GitHub checked: yes, live-gitcrawl-only.
- current v2 proof: no exact toolbar/focus proof in this lane.

Decision:
Related only. Route to focus/selection bridge, not `#6053`.

PR-description text:
None; detailed ledger only.

## #4317 onSelect called whenever renderLeaf changes

Status: issue-reviewed
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Changing render callback identity can trigger selection events unnecessarily.

Evidence:

- ledger row: render callback churn and selection event pressure.
- related issues: gitcrawl neighbor of `#6053`.
- duplicate/stale/invalid proof: event churn, not hook stale path.
- live GitHub checked: yes, live-gitcrawl-only.
- current v2 proof: no exact onSelect churn proof in this lane.

Decision:
Related only. Keep as React runtime / event churn pressure.

PR-description text:
None; detailed ledger only.

## #4031 If you enter Japanese with all the text deleted and confirm it, an error will occur

Status: issue-reviewed
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Japanese IME confirmation in an empty editor can produce a DOM point error.

Evidence:

- ledger row: Mobile/IME macro proof-route pressure.
- related issues: gitcrawl neighbor of `#6053` because both mention stale DOM
  or point errors.
- duplicate/stale/invalid proof: IME/placeholder repro, not selected-element
  self-removal.
- live GitHub checked: yes, live-gitcrawl-only.
- current v2 proof: Mobile/IME plan owns device/browser proof.

Decision:
Related false neighbor for this lane. Do not claim closure.

PR-description text:
None; detailed ledger only.

## #5034 In an Android environment, if readOnly is set for Editable, Gets Editor. selection to null

Status: issue-reviewed
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Android readOnly state changes can clear or corrupt selection state.

Evidence:

- ledger row: Mobile/IME macro proof-route pressure.
- related issues: gitcrawl neighbor of `#6053`.
- duplicate/stale/invalid proof: Android runtime policy, not selected-element
  self-removal.
- live GitHub checked: yes, live-gitcrawl-only.
- current v2 proof: no raw-device Android proof in this lane.

Decision:
Related false neighbor for this lane. Keep under Mobile/IME.

PR-description text:
None; detailed ledger only.

## #4111 Editor selection is always null in Internet Explorer 11

Status: triage-closed
Bucket: skip-stale
Confidence: high

Issue summary:
IE11/polyfill selection behavior is stale browser-support debt.

Evidence:

- ledger row: legacy browser support / stale candidate.
- related issues: gitcrawl neighbor of `#6053`.
- duplicate/stale/invalid proof: old IE11 environment, not current supported
  browser proof.
- live GitHub checked: yes, live-gitcrawl-only.
- current v2 proof: none needed for `#6053`.

Decision:
Not claimed. Needs current supported-target repro before v2 work.

PR-description text:
None; detailed ledger only.

## #5402 slate.tsx component unused varialbe

Status: not-claimed
Bucket: skip-maintainer-noise
Confidence: high

Issue summary:
The issue requests cleanup of an unused variable in the React provider code.

Evidence:

- ledger row: gitcrawl neighbor of `#6053`.
- related issues: none meaningful for the selected hook stale-path repro.
- duplicate/stale/invalid proof: cleanup-only issue.
- live GitHub checked: yes, live-gitcrawl-only.
- current v2 proof: no behavior claim.

Decision:
Not claimed. No selected-element hook behavior.

PR-description text:
None; detailed ledger only.

## #5075 Formatting type 'string' can't be used to index type 'Node'

Status: improves-claimed
Bucket: v2-api-dx
Confidence: high

Issue summary:
The report is TypeScript formatting-key ergonomics around custom mark checks.

Evidence:

- ledger row: gitcrawl neighbor of `#6053`.
- related issues: none meaningful for selected-element path invalidation.
- duplicate/stale/invalid proof: TypeScript API/DX issue, not runtime stale
  path.
- live GitHub checked: yes, live-gitcrawl-only.
- current v2 proof:
  `.tmp/slate-v2/packages/slate/src/interfaces/text.ts`;
  `.tmp/slate-v2/packages/slate/test/generic-value-contract.ts`;
  `.tmp/slate-v2/site/examples/ts/custom-types.d.ts`;
  `.tmp/slate-v2/site/examples/ts/mark-utils.ts`;
  `docs/plans/2026-05-16-slate-v2-boolean-mark-key-type-helper-ralplan.md`.

Decision:
Improves. Slate v2 exposes type-only boolean mark key/object helpers and the
examples no longer copy local formatting-key mapped types. This is not a
`Fixes` claim until the exact original TypeScript repro is replayed.

PR-description text:
Improves #5075: Slate v2 exposes type-only boolean mark key/object helpers and
examples no longer copy local formatting-key mapped types. Exact closure still
needs original repro proof.

## #3478 Editor crashes with redux

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: high

Issue summary:
Feeding editor changes through Redux or another external store can crash or
freeze the editor under ordinary typing speed. The thread broadens this beyond
Redux: users hit the same class with GraphQL cache and delayed external state
loops.

Evidence:

- ledger row: `react-controlled-value-and-external-updates`, valid,
  `cluster-synced`.
- related issues: #3332 is the explicit predecessor and is closed after a
  maintainer could not reproduce on `0.57.1`; gitcrawl neighbors include #4001,
  #3834, #3497, #4081, #4495, #3777, #3656, and #3921.
- duplicate/stale/invalid proof: not a duplicate of #4001 or #3497; same
  runtime neighborhood, different failure mode.
- live GitHub checked: yes; issue remains open.
- current v2 proof: `useSlateEditor({ initialValue })`, selector hooks, and
  the snapshot-driven provider tests in
  `.tmp/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`.

Decision:
Keep as `cluster-synced` under `v2-react-runtime`. The owner is React runtime,
snapshot identity, and external-store update boundaries.

PR-description text:
None; already represented by React runtime plan.

## #3777 Adding an accented character as the first letter on a new line crashes the editor in Firefox

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Firefox can crash the editor when an accented character is inserted as the first
letter on a new line.

Evidence:

- ledger row: live gitcrawl cluster 3, mixed React focus/input placeholder
  cluster.
- related issues: #4001 covers first-character input with German keyboard and
  placeholder; #3478 and #3497 are related by external React/focus pressure, not
  by exact input method.
- duplicate/stale/invalid proof: not a duplicate; the Firefox accented
  first-character path is its own browser/input proof owner.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch2.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`,
  and `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`.

Decision:
Keep as `cluster-synced`. It belongs to input/composition and DOM point repair,
but exact Firefox accented-character proof is not claimed.

PR-description text:
Related #3777: Firefox first-character composition/input family; no exact
closure.

## #5088 scrollSelectionIntoView not working after an update

Status: related
Bucket: v2-dom-selection
Confidence: high

Issue summary:
`scrollSelectionIntoView` can stop suppressing or controlling scroll after an
editor update.

Evidence:

- ledger row: live gitcrawl cluster 19, scroll selection update family.
- related issue: #5473 reports `scrollSelectionIntoView` not firing when
  deleting empty paragraphs.
- duplicate/stale/invalid proof: related, not duplicate; this report is about
  scroll behavior after update.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-19-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/test/app-owned-customization.tsx` and
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`.

Decision:
Keep as `cluster-synced`. Scroll forwarding and selection reconciliation are
the owner, but the exact after-update browser repro is not closed.

PR-description text:
Related #5088: scrollSelectionIntoView update family; no exact closure.

## #5473 scrollSelectionIntoView is not triggered when deleting empty paragraphs

Status: fixes-claimed
Bucket: v2-dom-selection
Confidence: high

Issue summary:
Deleting empty paragraphs can move the cursor out of view without invoking
`scrollSelectionIntoView`.

Evidence:

- ledger row: live gitcrawl cluster 19, scroll selection update family.
- related issue: #5088 is the same scroll hook owner after editor updates.
- duplicate/stale/invalid proof: related, not duplicate; delete-empty-paragraph
  is the specific action.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-19-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/test/app-owned-customization.tsx` and
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`.

Decision:
Keep as `cluster-synced`. Exact closure needs delete-empty-paragraph browser
proof.

PR-description text:
Related #5473: scrollSelectionIntoView delete/update family; no exact closure.

## #4376 Safari: selection becomes null when editor blurs

Status: fixes-claimed
Bucket: v2-dom-selection
Confidence: high

Issue summary:
Safari clears editor selection on blur where other browsers preserve it.

Evidence:

- ledger row: live gitcrawl cluster 20, blur/focus selection divergence.
- related issue: #5171 covers Firefox invalid selection updates when editor
  content changes while unfocused.
- duplicate/stale/invalid proof: not a duplicate; Safari blur null-selection is
  the specific browser behavior.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-20-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/playwright/integration/examples/document-state.test.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts`,
  and `.tmp/slate-v2/packages/slate-react/test/selection-runtime-contract.test.ts`.

Decision:
Claim `Fixes #4376`. WebKit browser proof preserves the Slate model selection
when focus leaves the editor, keeps it through editor refocus, and inserts
follow-up text at the preserved point.

PR-description text:
Fixes #4376: WebKit blur/refocus keeps the Slate model selection and follow-up
typing lands at the preserved point.

## #5171 Firefox triggers an invalid selection update on editor change when it's not focused

Status: fixes-claimed
Bucket: v2-dom-selection
Confidence: high

Issue summary:
Firefox can emit an invalid DOM selection update when editor content changes
while the editor is not focused.

Evidence:

- ledger row: live gitcrawl cluster 20, blur/focus selection divergence.
- related issue: #4376 is the Safari blur-selection member of the same family.
- duplicate/stale/invalid proof: related, not duplicate; Firefox unfocused
  editor update is the specific behavior.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-20-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/playwright/integration/examples/document-state.test.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts`,
  and `.tmp/slate-v2/packages/slate-react/test/selection-runtime-contract.test.ts`.

Decision:
Claim `Fixes #5171`. Firefox browser proof changes editor content while the
editor is unfocused and an external input selection is active, without importing
that external selection into the editor model.

PR-description text:
Fixes #5171: Firefox unfocused editor updates preserve the inactive editor
selection instead of importing an external input selection.

## #5095 Spell check does not work correctly on iOS Safari with Cyrillic characters

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
iOS Safari spellcheck fails for most Cyrillic words after several words are
entered.

Evidence:

- ledger row: live gitcrawl cluster 22, Safari spellcheck/Cyrillic family.
- related issue: #5096 reports the same class on macOS Safari.
- duplicate/stale/invalid proof: related, not duplicate; iOS has separate
  keyboard/spellcheck proof requirements.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-22-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`, and
  `.tmp/slate-v2/packages/slate-browser/test/core/release-proof.test.ts`.

Decision:
Keep as `cluster-synced`. The owner is browser/native text input semantics, but
iOS Safari Cyrillic spellcheck proof is not claimed.

PR-description text:
Related #5095: Safari spellcheck/native input family; no exact closure.

## #5096 Spell check does not work correctly on MacOS Safari with Cyrillic characters

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
macOS Safari spellcheck stops working after several Cyrillic words are entered.

Evidence:

- ledger row: live gitcrawl cluster 22, Safari spellcheck/Cyrillic family.
- related issue: #5095 is the iOS member of the same native spellcheck family.
- duplicate/stale/invalid proof: related, not duplicate; macOS Safari proof is
  separate from iOS Safari proof.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-22-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`, and
  `.tmp/slate-v2/packages/slate-browser/test/core/release-proof.test.ts`.

Decision:
Keep as `cluster-synced`. The owner is browser/native text input semantics, but
macOS Safari Cyrillic spellcheck proof is not claimed.

PR-description text:
Related #5096: Safari spellcheck/native input family; no exact closure.

## #3871 Triple clicking selects parts of the block below

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Triple-clicking a block can include part of the following block in the native
selection.

Evidence:

- ledger row: live gitcrawl cluster 23, triple-click/block-selection family.
- related issue: #5847 covers triple-click plus Backspace/Cut removing only
  contents instead of the full block.
- duplicate/stale/invalid proof: related, not duplicate; this report is about
  selection extent.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-23-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`, and
  `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`.
- proof command:
  `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "selects the current block on browser triple click|removes the current block after browser triple click and Backspace"`.

Decision:
Claim `Fixes #3871`. The richtext browser row triple-clicks the first paragraph
and proves the imported model selection is exactly the clicked block range, with
no leak into the following block.

PR-description text:
Fixes #3871: the richtext example imports browser triple-click as the clicked
block only, without leaking selection into the following block.

## #5847 In Chrome and Safari, triple-click and backspace should remove the entire block, not just its contents

Status: fixes-claimed
Bucket: v2-dom-selection
Confidence: high

Issue summary:
Triple-click can create a hanging native range where Backspace/Cut removes only
the block contents instead of the whole block.

Evidence:

- ledger row: live gitcrawl cluster 23, triple-click/block-selection family.
- related issue: #3871 covers the underlying selection extent.
- duplicate/stale/invalid proof: related, not duplicate; deletion behavior
  after selection is the specific report.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-23-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/mutation-controller.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/editing-kernel.ts`, and
  `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`.
- proof command:
  `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "removes the current block after browser triple click and Backspace"`.

Decision:
Claim `Fixes #5847`. The browser proof reproduces triple-click plus Backspace
on the richtext paragraph and proves the selected block is removed, not left as
an empty paragraph. React command handling now recognizes full-block browser
selection ranges, including the hanging range that ends at the start of the next
block.

PR-description text:
Fixes #5847: browser triple-click plus Backspace removes the selected block
instead of emptying its contents.

## #5603 onInput not fired when typing at the start of a contenteditable

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Native `input` can be missing when typing at the start of a contenteditable.

Evidence:

- ledger row: live gitcrawl cluster 16, input event boundary semantics.
- related issue: #5669 covers missing `input` for delete/number typing in
  `<Editable>`.
- duplicate/stale/invalid proof: related, not duplicate; start-of-content input
  is the specific report.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-16-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-input-events.ts`, and
  `.tmp/slate-v2/packages/slate-react/test/model-input-strategy-contract.ts`.

Decision:
Keep as `cluster-synced`. The owner is model-owned beforeinput/input handling,
and the browser row proves start-of-content typing through `beforeinput`, but
native `input` parity is not claimed.

PR-description text:
Related #5603: input/beforeinput boundary family; native `input` parity is not
claimed.

## #5669 `input` event is not fired when deleting text or typing numbers in <Editable> component

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
`input` may not fire for delete or number typing paths.

Evidence:

- ledger row: live gitcrawl cluster 16, input event boundary semantics.
- related issue: #5603 covers start-of-content native input gaps.
- duplicate/stale/invalid proof: related, not duplicate; delete/number typing
  is the specific event shape.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-16-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-input-events.ts`, and
  `.tmp/slate-v2/packages/slate-react/test/model-input-strategy-contract.ts`.

Decision:
Keep as `cluster-synced`. Number typing is proven through `beforeinput`, and
Backspace is proven as a model-owned keydown delete command, but native
delete/number `input` parity is not claimed.

PR-description text:
Related #5669: input/beforeinput boundary family; native delete/number `input`
parity is not claimed.

## #3991 Improve void node delete behavior

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Void node deletion behavior is inconsistent and needs stronger boundary policy.

Evidence:

- ledger row: live gitcrawl cluster 17, void delete/selection behavior.
- related issue: #4301 covers broken void selection behavior after
  `slate-react@0.62.0`.
- duplicate/stale/invalid proof: related, not duplicate; deletion is the
  specific report.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-17-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/playwright/integration/examples/images.test.ts` and
  `.tmp/slate-v2/packages/slate-react/src/editable/mutation-controller.ts`.
- focused proof command:
  `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/images.test.ts --project=chromium --grep "removes an empty paragraph after an image before deleting the image|inserts a paragraph after a clicked selected image on Enter"`.

Decision:
Claim `Fixes #3991`. The exact browser row proves Backspace from an empty
paragraph immediately after a block void removes that paragraph and selects the
void instead of deleting the void.

PR-description text:
Fixes #3991: Backspace from an empty paragraph immediately after a selected
block void removes the paragraph and selects the void instead of deleting the
void.

## #4301 slate-react@0.62.0+ regression: broken void selection behavior

Status: fixes-claimed
Bucket: v2-dom-selection
Confidence: high

Issue summary:
Void selection behavior regressed after `slate-react@0.62.0`.

Evidence:

- ledger row: live gitcrawl cluster 17, void delete/selection behavior.
- related issue: #3991 covers delete behavior around voids.
- duplicate/stale/invalid proof: related, not duplicate; this is selection
  behavior around voids.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-17-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/playwright/integration/examples/images.test.ts` and
  `.tmp/slate-v2/packages/slate-react/src/editable/mutation-controller.ts`.
- focused proof command:
  `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/images.test.ts --project=chromium --grep "removes an empty paragraph after an image before deleting the image|inserts a paragraph after a clicked selected image on Enter"`.

Decision:
Claim `Fixes #4301`. The exact browser row proves a clicked selected block void
handles Enter by inserting an editable paragraph after the void, matching the
keyboard-selected void behavior.

PR-description text:
Fixes #4301: Enter on a clicked selected block void inserts an editable
paragraph after the void.

## #4994 AndroidEditable doesn't react on readOnly prop change

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
AndroidEditable can fail to respond when `readOnly` changes.

Evidence:

- ledger row: live gitcrawl cluster 18, Android readOnly/input state.
- related issue: #5026 covers missing Android text insert/remove operations
  when `readOnly` changes.
- duplicate/stale/invalid proof: related, not duplicate; readOnly state change
  is the specific trigger.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-18-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts`, and
  `.tmp/slate-v2/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts`.

Decision:
Keep as `cluster-synced`. The owner is Android input lifecycle and readOnly
state, but exact Android proof is not claimed.

PR-description text:
Related #4994: Android readOnly/input lifecycle family; no exact closure.

## #5026 Android: Text insert/remove operations not provided to onChange listener when readOnly prop changes

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Android text insert/remove operations can be lost around `readOnly` changes.

Evidence:

- ledger row: live gitcrawl cluster 18, Android readOnly/input state.
- related issue: #4994 is the readOnly state-change member of the same family.
- duplicate/stale/invalid proof: related, not duplicate; lost operations are
  the specific report.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-18-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts`, and
  `.tmp/slate-v2/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts`.

Decision:
Keep as `cluster-synced`. Exact Android readOnly operation proof is not
claimed.

PR-description text:
Related #5026: Android readOnly/input lifecycle family; no exact closure.

## #4802 Copy-pasting text with an inline void from Slate to other editors is not working as expected

Status: cluster-synced
Bucket: v2-clipboard-serialization
Confidence: medium

Issue summary:
Copying text that contains an inline void from Slate into other editors produces
bad clipboard output.

Evidence:

- ledger row: live gitcrawl cluster 21, inline void clipboard serialization.
- related issue: #4806 reports not being able to copy/paste inline voids.
- duplicate/stale/invalid proof: related, not duplicate; inter-editor copy is
  the specific report.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-21-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts` no
  longer assumes block-void `data-slate-spacer` DOM when exporting a selected
  inline void; `.tmp/slate-v2/packages/slate-dom/test/clipboard-boundary.ts`
  proves the Slate fragment payload is preserved and external text output does
  not leak FEFF or neighboring text. Browser proof in
  `.tmp/slate-v2/playwright/integration/examples/mentions.test.ts` selects a
  mention-shaped inline void, confirms deterministic native `text/html` and
  `text/plain`, decodes the embedded Slate fragment, and pastes visible content
  into an external contenteditable target.

Decision:
Keep as `improves-claimed`. Selected inline void export is covered at the DOM
clipboard boundary and through a real browser clipboard payload. Exact named
other-editor app behavior is still not claimed.

PR-description text:
Improves #4802: selected inline void export keeps deterministic browser
clipboard payloads without FEFF or neighboring text leakage; no exact named
other-editor closure.

## #4806 Not able to copy-paste inline void

Status: fixes-claimed
Bucket: v2-clipboard-serialization
Confidence: high

Issue summary:
Inline void content cannot be copied/pasted correctly.

Evidence:

- ledger row: live gitcrawl cluster 21, inline void clipboard serialization.
- related issue: #4802 covers Slate-to-other-editor inline void copy.
- duplicate/stale/invalid proof: related, not duplicate; generic inline void
  copy/paste is the specific report.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-21-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts` exports a
  selected inline void through a safe attach node when no block spacer exists;
  `.tmp/slate-v2/packages/slate-dom/test/clipboard-boundary.ts` proves copy,
  paste round-trip, and cut ordering for a selected mention-shaped inline void.
  `.tmp/slate-v2/playwright/integration/examples/mentions.test.ts` proves the
  same path through Chromium's native clipboard: copy exposes the selected
  inline void as deterministic HTML/text plus Slate fragment, paste inserts a
  second mention, and cut removes one mention node with model-owned caret
  repair.

Decision:
Move to `fixes-claimed`. Focused DOM clipboard proof and browser clipboard
proof cover the selected inline void copy/paste/cut repro shape.

PR-description text:
Fixes #4806: selected inline void copy/paste/cut works through the native
browser clipboard path and keeps model-owned caret repair.

## #3148 Chrome & Safari cannot select end of inline DOM elements

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Chrome and Safari cannot place selection at the end of inline DOM elements.

Evidence:

- ledger row: live gitcrawl cluster 25, inline DOM end selection.
- related issue: #3150 is an upstream-known-issues tracker for this selection
  class.
- duplicate/stale/invalid proof: related, not duplicate; end-of-inline
  selection is the specific browser behavior.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-25-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/playwright/integration/examples/inlines.test.ts`.
- focused proof command:
  `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/inlines.test.ts --project=chromium --grep "types inside an editable inline at its end|keeps the start of following text distinct from the end of an inline|places the caret outside a padded inline before typing"`.

Decision:
Claim `Fixes #3148`. The browser rows prove both sides of the inline boundary:
typing at the inline end stays in the inline, while typing at the following
text start stays outside the inline.

PR-description text:
Fixes #3148: inline edge selections keep the inline end and following text start
distinct before text insertion in Chromium and WebKit.

## #3150 Known upstream issues

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: low

Issue summary:
This is an upstream-known-issues tracker related to inline DOM end selection.

Evidence:

- ledger row: live gitcrawl cluster 25, inline DOM end selection.
- related issue: #3148 is the concrete browser-selection report.
- duplicate/stale/invalid proof: tracker-like issue; keep as related pressure,
  not an exact runtime claim.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-25-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-browser/test/core/scenario.test.ts` and
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`.

Decision:
Keep as `cluster-synced` but low confidence. Use #3148 for exact future proof,
not this tracker row.

PR-description text:
Related #3150: inline DOM end-selection tracker; no exact closure.

## #3534 Selection is broken after undoing

Status: improves-claimed
Bucket: v2-core-engine
Confidence: medium

Issue summary:
Undo can restore content while leaving selection in a broken state.

Evidence:

- ledger row: live gitcrawl cluster 27, undo selection corruption.
- related issue: #3551 reports wrong state after undoing `move_nodes`.
- duplicate/stale/invalid proof: related, not duplicate; selection after undo is
  the specific report.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-27-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate/src/core/apply.ts`,
  `.tmp/slate-v2/packages/slate/src/core/public-state.ts`, and
  `.tmp/slate-v2/packages/slate/test/state-tx-public-api-contract.ts`.
- focused proof:
  `.tmp/slate-v2/packages/slate-history/test/history-contract.ts` covers a
  multi-block expanded selection, `insertBreak`, undo, and exact selection
  restoration.

Decision:
Promote to `fixes-claimed`. The package proof matches the reported Enter/undo
selection flow without adding public API.

PR-description text:
Fixes #3534: undo after pressing Enter with a selection spanning multiple
blocks restores the original expanded selection.

## #3551 Undoing move_nodes results in wrong state

Status: fixes-claimed
Bucket: v2-core-engine
Confidence: high

Issue summary:
Undoing `move_nodes` can produce incorrect document or selection state.

Evidence:

- ledger row: live gitcrawl cluster 27, undo selection corruption.
- related issue: #3534 covers selection broken after undo.
- duplicate/stale/invalid proof: related, not duplicate; `move_nodes` undo is
  the specific transform path.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and
  `.tmp/gitcrawl/2026-05-04T145301Z-cluster-27-detail.json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate/src/core/apply.ts`,
  `.tmp/slate-v2/packages/slate/src/core/public-state.ts`, and
  `.tmp/slate-v2/packages/slate/test/state-tx-public-api-contract.ts`.
- focused proof:
  `.tmp/slate-v2/packages/slate-history/test/history-contract.ts` covers
  `moveNodes`, undo, and exact original tree plus selection restoration.

Decision:
Promote to `fixes-claimed`. The focused proof exercises the suspected
`moveNodes` undo path and restores both document and selection.

PR-description text:
Fixes #3551: undo after a `moveNodes` commit restores the original tree and
selection.

## #4564 Cannot resolve a DOM point from Slate point when programmatically removing content

Status: fixes-claimed
Bucket: v2-dom-selection
Confidence: high

Issue summary:
Programmatic content removal can leave Slate trying to resolve a model point
against DOM that no longer represents the current document.

Evidence:

- ledger row: live gitcrawl cluster 1, `dom-point-resolution-crashes`.
- related issues: #3723, #4789, #3836, #5711, #3834, #4984.
- duplicate/stale/invalid proof: none; this is a valid DOM bridge failure
  family.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh.
- current v2 proof:
  `.tmp/slate-v2/packages/slate/test/state-tx-public-api-contract.ts`,
  `docs/plans/2026-04-02-slate-dom-v2-bridge-proof-ralph.md`, and
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`.

Decision:
Keep as `improves-claimed`, not `fixes-claimed`. V2 materially improves the
replacement and DOM bridge ownership model, but this exact browser reproduction
has not been replayed as auto-close proof.

PR-description text:
Improves #4564 through transaction-owned replacement and boundary-aware DOM
bridge direction; not an exact closure claim.

## #3723 Cannot resolve a Slate point from DOM point

Status: fixes-claimed
Bucket: v2-dom-selection
Confidence: high

Issue summary:
Slate imports a browser DOM point that cannot be mapped back to the Slate model.

Evidence:

- ledger row: live gitcrawl cluster 1, `dom-point-resolution-crashes`.
- related issues: #4564, #4789, #3836, #5711, #3834, #4984.
- duplicate/stale/invalid proof: none; grouped by the same DOM point
  resolution failure.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh.
- current v2 proof: `docs/plans/2026-04-02-slate-dom-v2-bridge-proof-ralph.md`.

Decision:
Classify as `cluster-synced`. It belongs to the DOM bridge/import-export
architecture owner, but there is no exact current repro proof for closure.

PR-description text:
Related #3723: DOM point resolution crash family, covered by DOM bridge
architecture; no exact closure claim.

## #4789 Cannot resolve a Slate point from DOM point after selection starts outside editor

Status: improves-claimed
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Dragging or extending selection from outside Slate into the editor can feed an
outside-owned DOM point into Slate point import.

Evidence:

- ledger row: live gitcrawl cluster 1, `dom-point-resolution-crashes`.
- related issues: #4564, #3723, #3836, #5711, #3834, #4984.
- duplicate/stale/invalid proof: none; valid outside-editor DOM target
  failure.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh.
- current v2 proof:
  `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts`,
  `.tmp/slate-v2/packages/slate-dom/test/bridge.ts`,
  `docs/plans/2026-05-06-slate-v2-dom-selection-boundary-proof-ralplan.md`,
  and `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
- focused proof command:
  `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "ignores a native selection that starts outside the editor and ends inside it"`.

Decision:
Claim `Fixes #4789`. The browser row creates a native selection that starts
outside Slate and ends inside the editor, verifies no DOM point crash, and
proves the editor remains usable after normal refocus.

PR-description text:
Fixes #4789: a native selection that starts outside the editor and ends inside
the editor is ignored without a DOM point crash, and the editor remains usable
after refocus.

## #3836 Cannot resolve a Slate point from DOM point

Status: fixes-claimed
Bucket: v2-dom-selection
Confidence: high

Issue summary:
Another DOM point import failure in the same crash family as cluster 1.

Evidence:

- ledger row: live gitcrawl cluster 1, `dom-point-resolution-crashes`.
- related issues: #4564, #3723, #4789, #5711, #3834, #4984.
- duplicate/stale/invalid proof: no duplicate closure; same architecture owner.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh.
- current v2 proof: `docs/plans/2026-04-02-slate-dom-v2-bridge-proof-ralph.md`.

Decision:
Classify as `cluster-synced`. It supports the DOM bridge owner but has no exact
standalone v2 closure proof.

PR-description text:
Related #3836: DOM point resolution crash family, covered by DOM bridge
architecture; no exact closure claim.

## #5711 Cannot resolve a Slate point from DOM point

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
iOS Safari typing can surface the same DOM point import crash family.

Evidence:

- ledger row: live gitcrawl cluster 1, `dom-point-resolution-crashes`.
- related issues: #4564, #3723, #4789, #3836, #3834, #4984.
- duplicate/stale/invalid proof: no duplicate closure; browser-specific proof
  still required.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh.
- current v2 proof: `docs/plans/2026-04-02-slate-dom-v2-bridge-proof-ralph.md`.

Decision:
Classify as `cluster-synced`. It belongs to DOM point import/export, but iOS
Safari closure needs matching browser proof.

PR-description text:
Related #5711: DOM point resolution crash family, covered by DOM bridge
architecture; no exact iOS closure claim.

## #3834 Cannot resolve a Slate point from DOM point: [object Text],0

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Slate receives a text-node DOM point that cannot be converted to a Slate point.

Evidence:

- ledger row: live gitcrawl cluster 1, `dom-point-resolution-crashes`.
- related issues: #4564, #3723, #4789, #3836, #5711, #4984.
- duplicate/stale/invalid proof: no duplicate closure; same bridge failure
  class.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh.
- current v2 proof: `docs/plans/2026-04-02-slate-dom-v2-bridge-proof-ralph.md`.

Decision:
Classify as `cluster-synced`. It is evidence for central DOM point import
policy, not a standalone exact fix claim.

PR-description text:
Related #3834: DOM point resolution crash family, covered by DOM bridge
architecture; no exact closure claim.

## #4984 Selecting over nested editor throws Cannot resolve a DOM point from Slate point

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Selection across nested editor boundaries can ask the wrong editor to resolve a
DOM point.

Evidence:

- ledger row: live gitcrawl cluster 1, `dom-point-resolution-crashes`.
- related issues: #4564, #3723, #4789, #3836, #5711, #3834.
- duplicate/stale/invalid proof: no duplicate closure; nested-editor
  containment is the distinguishing owner.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh.
- current v2 proof:
  `.tmp/slate-v2/playwright/integration/examples/editable-voids.test.ts`,
  `docs/plans/2026-05-06-slate-v2-dom-selection-boundary-proof-ralplan.md`,
  and `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
- focused proof command:
  `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "ignores a parent selection that crosses into a nested editor"`.

Decision:
Claim `Fixes #4984`. The browser row creates a parent-editor native selection
that crosses into a nested editor, verifies no DOM point crash, and proves input
remains scoped to the editor that owns focus.

PR-description text:
Fixes #4984: a parent-editor selection that crosses into a nested editor is
ignored without a DOM point crash, and input remains owned by the parent or
nested editor that actually has focus.

## #4074 Writing inside inline elements

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Cursor movement and text entry around inline elements can put the caret in an
unexpected inline boundary position.

Evidence:

- ledger row: live gitcrawl cluster 5, `inline-boundary-cursor-movement`.
- related issues: #4618 and #3429; neighbor/search output also points toward
  inline void and DOM point families such as #4802, #5183, and #5087.
- duplicate/stale/invalid proof: no duplicate closure; the issue belongs to
  inline boundary selection policy.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh.
- current v2 proof:
  `.tmp/slate-v2/playwright/integration/examples/inlines.test.ts`.
- focused proof command:
  `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/inlines.test.ts --project=chromium --grep "types inside an editable inline at its end|keeps the start of following text distinct from the end of an inline|places the caret outside a padded inline before typing"`.

Decision:
Claim `Fixes #4074`. The Chromium browser row proves text can be inserted at an
editable inline edge without being pushed outside the inline.

PR-description text:
Fixes #4074: the inlines example can type inside an editable inline at the
inline edge in Chromium.

## #4618 Feature request: normalizePoint method to customize cursor movement

Status: not-claimed
Bucket: v2-dom-selection
Confidence: high

Issue summary:
The request asks for an extension point to normalize cursor movement around
custom inline/boundary behavior.

Evidence:

- ledger row: live gitcrawl cluster 5, `inline-boundary-cursor-movement`.
- related issues: #4074 and #3429.
- duplicate/stale/invalid proof: not a duplicate; it is the API/DX expression
  of the same inline boundary problem.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh.
- current v2 proof: `docs/plans/2026-04-02-slate-dom-v2-bridge-proof-ralph.md`.

Decision:
Keep as `not-claimed`. The inline-boundary behavior is covered by internal
bridge/browser proof, but this slice intentionally rejects a public
`normalizePoint` API.

PR-description text:
Not claimed #4618: no public `normalizePoint` API; inline-boundary behavior is
owned by the internal DOM selection bridge.

## #3429 Inlines with padding cause cursor to appear inside node

Status: fixes-claimed
Bucket: v2-dom-selection
Confidence: high

Issue summary:
Inline styling/padding can make the visual caret appear inside an inline node
instead of at a deterministic boundary.

Evidence:

- ledger row: live gitcrawl cluster 5, `inline-boundary-cursor-movement`.
- related issues: #4074 and #4618; neighbors overlap with DOM point and inline
  void boundary families.
- duplicate/stale/invalid proof: no duplicate closure; this is the styling/DOM
  geometry expression of inline boundary behavior.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh.
- current v2 proof:
  `.tmp/slate-v2/playwright/integration/examples/inlines.test.ts`.
- focused proof command:
  `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/inlines.test.ts --project=chromium --grep "types inside an editable inline at its end|keeps the start of following text distinct from the end of an inline|places the caret outside a padded inline before typing"`.

Decision:
Claim `Fixes #3429`. The browser row proves the caret target before the padded
editable inline stays anchored in the preceding text and outside the padded
inline.

PR-description text:
Fixes #3429: the caret target before a padded inline stays outside the padded
inline in Chromium.

## #3705 Slate history error: Cannot apply an incomplete set_selection operation properties

Status: fixes-claimed
Bucket: v2-core-engine
Confidence: high

Issue summary:
History replay can produce or apply an incomplete `set_selection` operation,
breaking undo/redo selection state.

Evidence:

- ledger row: live gitcrawl cluster 6, `history-set-selection-errors`.
- related issues: #3756 and #3921; search also returns #4559 and #2051 as
  nearby history/selection rows.
- duplicate/stale/invalid proof: no duplicate closure; valid history and
  selection operation failure family.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh.
- current v2 proof:
  `.tmp/slate-v2/packages/slate/test/operations-contract.ts`,
  `.tmp/slate-v2/packages/slate-history/test/history-contract.ts`, and
  `.tmp/slate-v2/packages/slate-history/test/integrity-contract.ts`.
- focused proof:
  `.tmp/slate-v2/packages/slate-history/test/history-contract.ts` covers history
  undo after a partial `set_selection` patch and a cleared selection.

Decision:
Promote to `improves-claimed`. The model-level incomplete `set_selection`
family is covered, but the upstream issue is ignored-template/needs-info and
does not have a complete exact browser repro to auto-close.

PR-description text:
Improves #3705: partial `set_selection` history undo is covered; no exact
ignored-template closure.

## #3756 slate-history does not correctly undo selection movement

Status: cluster-synced
Bucket: v2-core-engine
Confidence: medium

Issue summary:
Selection movement can be saved or replayed incorrectly by the history stack.

Evidence:

- ledger row: live gitcrawl cluster 6, `history-set-selection-errors`.
- related issues: #3705 and #3921.
- duplicate/stale/invalid proof: no duplicate closure; same history selection
  owner.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-history/test/history-contract.ts`,
  `.tmp/slate-v2/packages/slate-history/test/integrity-contract.ts`, and
  `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts`.
- current related plan:
  `docs/plans/2026-05-07-slate-v2-marked-enter-undo-caret-ralplan.md`.

Decision:
Classify as `cluster-synced`. It belongs to transaction-aware history and
selection movement policy. It is a related guard for #3499, but exact closure
requires replaying the original multi-block delete/selection scenario.

PR-description text:
Related #3756: history selection movement family; no exact closure claim.

## #3921 Slate history refocusing causes incomplete set_selection operation error

Status: cluster-synced
Bucket: v2-core-engine
Confidence: medium

Issue summary:
Refocus plus history replay can surface an incomplete `set_selection` operation
error.

Evidence:

- ledger row: live gitcrawl cluster 6, `history-set-selection-errors`.
- related issues: #3705 and #3756.
- duplicate/stale/invalid proof: no duplicate closure; same history/refocus
  selection operation owner.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh.
- current v2 proof:
  `.tmp/slate-v2/packages/slate/test/operations-contract.ts`,
  `.tmp/slate-v2/packages/slate-history/test/history-contract.ts`, and
  `.tmp/slate-v2/packages/slate-history/test/integrity-contract.ts`.
- focused proof:
  `.tmp/slate-v2/packages/slate-history/test/history-contract.ts` covers the
  cleared-selection model failure that makes partial selection replay risky.

Decision:
Promote to `improves-claimed`. The core model failure family is covered, but
exact refocus closure still needs browser/focus proof.

PR-description text:
Improves #3921: partial `set_selection` history undo is covered; exact refocus
closure still needs browser proof.

## #3634 Input after ReactEditor.focus doesn't work

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Programmatic `ReactEditor.focus(editor)` can report or request focus without
restoring a usable input path.

Evidence:

- ledger row: live gitcrawl cluster 7,
  `react-editor-focus-after-programmatic-change`.
- related issues: #5537, #4961, and search hit #3497.
- duplicate/stale/invalid proof: not a duplicate closure; same React focus and
  selection runtime owner.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx`,
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`, and
  `.tmp/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`.

Decision:
Classify as `cluster-synced`. The issue belongs to focus/selection ownership
under React runtime pressure, but the exact focus reproduction is not
auto-closed.

PR-description text:
Related #3634: React focus/input runtime family; no exact closure claim.

## #5537 Programmatic focus with multiple editors does not accept input

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
When multiple editors exist, programmatic focus can leave the target editor
visibly focused but unable to accept input.

Evidence:

- ledger row: live gitcrawl cluster 7,
  `react-editor-focus-after-programmatic-change`.
- related issues: #3634, #4961, and #3497.
- duplicate/stale/invalid proof: not a duplicate closure; multi-editor focus is
  the distinguishing condition.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx`,
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`, and
  `.tmp/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`.

Decision:
Classify as `cluster-synced`. It strengthens the multi-editor focus owner but
needs exact browser proof before closure.

PR-description text:
Related #5537: multi-editor programmatic focus runtime family; no exact closure
claim.

## #5117 Placeholder height is added to wrong editor as min-height when multiple editors are present

Status: related
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Placeholder min-height from one editor leaks onto another when multiple editors
are mounted, which implies placeholder measurement or DOM state is keyed too
broadly.

Evidence:

- live row:
  `docs/slate-issues/gitcrawl-live-open-ledger.md`.
- source dossier:
  `docs/slate-issues/open-issues-dossiers/5129-5066.md`.
- current reopened architecture plan:
  `docs/plans/2026-05-20-slate-v2-non-node-editor-state-architecture-ralplan.md`.

Decision:
Keep this as related/example pressure only. The accepted multi-root React
provider must prove view-local DOM measurement and placeholder state, but no
exact browser closure exists yet.

PR-description text:
Related #5117: multi-editor placeholder measurement belongs to view-local React
runtime proof; no exact closure claim.

## #4961 ReactEditor.focus does not work after inserting a new node

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
After inserting a node, calling `ReactEditor.focus` can fail to restore a
usable caret/input state.

Evidence:

- ledger row: live gitcrawl cluster 7,
  `react-editor-focus-after-programmatic-change`.
- related issues: #3634, #5537, and #3497.
- duplicate/stale/invalid proof: no duplicate closure; same focus after
  programmatic document mutation family.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx`,
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`, and
  `.tmp/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`.

Decision:
Classify as `cluster-synced`. It belongs to React focus and selection repair
after model changes; exact closure requires replaying the insert-and-focus
scenario.

PR-description text:
Related #4961: React focus after programmatic node insertion; no exact closure
claim.

## #4001 German Keyboard backtick isn't recognized in onChange event; crashes editor when using placeholder

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: high

Issue summary:
With a German keyboard and an empty editor placeholder, the first backtick input
does not fire the expected change path; the next character desynchronizes Slate
and DOM points and throws `Cannot resolve a Slate point from DOM point`.

Evidence:

- ledger row: `placeholder-and-ime-empty-editor`, valid, `cluster-synced`.
- related issues: linked comment points to #3437, a merged PR around
  element/text memoization and placeholder re-rendering; gitcrawl neighbors
  include #3478, #3834, #3777, #3943, #3568, #4074, #3586, #4789, and #3497.
- duplicate/stale/invalid proof: related to #3777 and other
  placeholder/composition DOM point failures, but not the same as external-store
  #3478.
- live GitHub checked: yes; issue remains open.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/editable/root-selector-sources.ts`;
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`;
  composition tests.

Decision:
Keep as `cluster-synced` under `v2-input-runtime`. It is a real placeholder +
input-method DOM bridge issue, not a React external-store bug.

PR-description text:
None; already represented by input runtime plan.

## #3497 Editor loses focus if parent component triggers unrelated state change

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: high

Issue summary:
An unrelated parent state update can steal focus immediately after
`ReactEditor.focus(editor)`. Later comments broaden the issue to multiple
editors and rerendered sibling editors where `ReactEditor.isFocused` may still
return true even though the visible caret/input path is gone.

Evidence:

- ledger row: `focus-state-and-external-dom-ownership`, valid,
  `cluster-synced`.
- related issues: same family as #3634 and #5537, but not enough to close as
  duplicate; gitcrawl neighbors include #4495, #3478, #3634, #3834, #5537,
  #3656, #3921, #3696, #3821, #5211, and #4001.
- duplicate/stale/invalid proof: parent-state focus churn is the specific
  behavior here.
- live GitHub checked: yes; issue remains open and was bumped in 2024.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx`;
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`;
  provider hook tests.

Decision:
Keep as `cluster-synced` under `v2-react-runtime`. The owner is focus/selection
state under React rerender pressure.

PR-description text:
None; already represented by React runtime plan.

## #5989 [Chrome, Android] The Hangul composition breaks on the first character when the placeholder is visible

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
[Chrome, Android] The Hangul composition breaks on the first character when the placeholder is visible.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-placeholder-composition.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`.

Decision:
Android Hangul placeholder composition belongs to first-character composition and placeholder input ownership. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #5989: Android Hangul placeholder composition belongs to first-character composition and placeholder input ownership; no exact closure.

## #5984 Android Chinese Input Issue: Backspace requires two presses to trigger one onChange event

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Android Chinese Input Issue: Backspace requires two presses to trigger one onChange event.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-samsung-firefox-android.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`.

Decision:
Android Chinese IME backspace belongs to Android IME deletion/input ownership. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #5984: Android Chinese IME backspace belongs to Android IME deletion/input ownership; no exact closure.

## #5931 Windows text suggestions append instead of replace in Slate editor

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Windows text suggestions append the accepted completion after the typed prefix
instead of replacing the active word segment.

Evidence:

- ledger row: live gitcrawl singleton row in `docs/slate-issues/gitcrawl-live-open-ledger.md`.
- old dossier evidence:
  `docs/slate-issues/open-issues-dossiers/5994-5918.md`.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`;
  `.tmp/slate-v2/packages/slate-react/src/editable/native-input-strategy.ts`.

Decision:
Windows suggestion acceptance belongs to input/composition replacement-range
ownership. No exact `Fixes #...` claim is justified without a focused Windows
suggestion-bar repro matching this issue.

PR-description text:
Related #5931: Windows text suggestion acceptance belongs to
input/composition replacement-range ownership; no exact closure.

## #5830 `onBlur` not called while composing (Japanese or Korean)

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Blur is not reported while Japanese or Korean composition is active.

Evidence:

- ledger row: live gitcrawl singleton row in `docs/slate-issues/gitcrawl-live-open-ledger.md`.
- old dossier evidence:
  `docs/slate-issues/open-issues-dossiers/5912-5771.md`.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`;
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`.

Decision:
Blur during Japanese/Korean composition belongs to composition and focus
lifecycle ownership. No exact `Fixes #...` claim is justified without a focused
composition-blur repro matching this issue.

PR-description text:
Related #5830: Blur during Japanese/Korean composition belongs to composition
and focus lifecycle ownership; no exact closure.

## #5912 How can we use this library on browsers that don't support composition events?

Status: not-claimed
Bucket: ecosystem-boundary
Confidence: medium

Issue summary:
How can we use this library on browsers that don't support composition events?.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-placeholder-composition.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `docs/slate-issues/gitcrawl-recluster-map.md`; current app-specific repro still required.

Decision:
Browser environments without composition events need capability policy; exact support depends on current target browser proof. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #5912: Browser environments without composition events need capability policy; exact support depends on current target browser proof; no exact closure.

## #5874 Inserting the same node more than once causes strange desyncing behavior

Status: triage-closed
Bucket: skip-invalid
Confidence: medium

Issue summary:
Inserting the same node more than once causes strange desyncing behavior.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-node-dom-node.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `docs/slate-issues/gitcrawl-recluster-map.md`; raw Slate node identity contract.

Decision:
Reusing the same Slate node object violates node identity ownership; future work should make the failure explicit, not support shared object reuse. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #5874: Reusing the same Slate node object violates node identity ownership; future work should make the failure explicit, not support shared object reuse; no exact closure.

## #5749 Shadow DOM - Drag-and-drop text throws error

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Shadow DOM - Drag-and-drop text throws error.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-node-dom-node.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-dom/test/bridge.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`; `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`.

Decision:
Shadow DOM drag/drop DOM point import belongs to the shadow DOM bridge family. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #5749: Shadow DOM drag/drop DOM point import belongs to the shadow DOM bridge family; no exact closure.

## #5643 On some android device with some keyboard autocomplete is broken

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
On some android device with some keyboard autocomplete is broken.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-samsung-firefox-android.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`.

Decision:
Android autocomplete leftovers belong to mobile input and composition cleanup. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #5643: Android autocomplete leftovers belong to mobile input and composition cleanup; no exact closure.

## #5509 use with mobx-react-lite error

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
use with mobx-react-lite error.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx`; `.tmp/slate-v2/packages/slate-react/src/decoration-source.ts`; `.tmp/slate-v2/packages/slate-react/test/app-owned-customization.tsx`.

Decision:
MobX observer pressure belongs to external reactive rendering and React runtime ownership. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #5509: MobX observer pressure belongs to external reactive rendering and React runtime ownership; no exact closure.

## #5355 Slate crashes when arrowing into or out of table with colgroup/col nodes

Status: not-claimed
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Slate crashes when arrowing into or out of table with colgroup/col nodes.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-node-dom-node.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner:
  `docs/plans/2026-05-06-slate-v2-dom-selection-boundary-proof-ralplan.md`.

Decision:
Do not claim this as fixed by the DOM-selection slice. The exact repro relies
on app-rendered `colgroup` / `col` shapes that omit editable Slate descendants,
which the v2 plan intentionally does not support as raw missing DOM. A future
Slate-owned DOM coverage boundary can support intentional missing DOM, but
unregistered app omissions stay unsupported.

PR-description text:
Not claimed #5355: `colgroup` / `col` renderers that omit editable descendants
need a Slate-owned DOM coverage boundary; raw app-rendered missing DOM is not a
supported closure target.

## #5281 make slate a controlled input

Status: not-claimed
Bucket: v2-api-dx
Confidence: medium

Issue summary:
make slate a controlled input.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate/test/state-tx-public-api-contract.ts`; `docs/plans/2026-05-04-slate-v2-react-editor-initialization-value-ralplan.md`.

Decision:
Controlled React value remains outside the v2 public contract; external replacement uses explicit editor APIs. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #5281: Controlled React value remains outside the v2 public contract; external replacement uses explicit editor APIs; no exact closure.

## #5130 Android Predictive typing broken - Firefox

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Android Predictive typing broken - Firefox.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-placeholder-composition.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`.

Decision:
Firefox Android predictive typing belongs to mobile input runtime proof. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #5130: Firefox Android predictive typing belongs to mobile input runtime proof; no exact closure.

## #5107 findEventRange in shadow-DOM: "Cannot resolve a Slate point from DOM point", in Chrome

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
findEventRange in shadow-DOM: "Cannot resolve a Slate point from DOM point", in Chrome.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-point-dom-point.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-dom/test/bridge.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`; `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`.

Decision:
Shadow DOM findEventRange belongs to event-to-range DOM bridge ownership. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #5107: Shadow DOM findEventRange belongs to event-to-range DOM bridge ownership; no exact closure.

## #5087 data-slate-spacer span is visible when void inline-elements are selected

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
data-slate-spacer span is visible when void inline-elements are selected.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-inline-void-selection-keyboard.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-dom/test/bridge.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`; `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`.

Decision:
Visible inline void spacer belongs to inline void selection/rendering boundary policy. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #5087: Visible inline void spacer belongs to inline void selection/rendering boundary policy; no exact closure.

## #5050 a `beforeInsertText` function to accept/reject text insertion

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
a `beforeInsertText` function to accept/reject text insertion.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-android-composition-beforeinput.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`.

Decision:
Text insertion accept/reject belongs to beforeinput/input command policy, not a separate uncontrolled hook. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #5050: Text insertion accept/reject belongs to beforeinput/input command policy, not a separate uncontrolled hook; no exact closure.

## #5014 CJK will output duplicated and crash on Firefox.(same on slatejs.org)

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
CJK will output duplicated and crash on Firefox.(same on slatejs.org).

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`.

Decision:
Firefox CJK duplication/crash belongs to IME/composition runtime proof. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #5014: Firefox CJK duplication/crash belongs to IME/composition runtime proof; no exact closure.

## #4851 Error thrown with Katex library: Cannot resolve a DOM point

Status: needs-repro
Bucket: ecosystem-boundary
Confidence: medium

Issue summary:
Error thrown with Katex library: Cannot resolve a DOM point.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-point-dom-point.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `docs/slate-issues/gitcrawl-recluster-map.md`; current app-specific repro still required.

Decision:
KaTeX DOM point crashes need app-rendered DOM bridge proof; external DOM is not automatically supported. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #4851: KaTeX DOM point crashes need app-rendered DOM bridge proof; external DOM is not automatically supported; no exact closure.

## #4842 toSlatePoint has incorrect offset with nested editors

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
toSlatePoint has incorrect offset with nested editors.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-node-dom-node.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-dom/test/bridge.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`; `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`.

Decision:
Nested editor toSlatePoint offset belongs to nested editor DOM containment. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #4842: Nested editor toSlatePoint offset belongs to nested editor DOM containment; no exact closure.

## #4658 Custom table node allows entering text outside the table which leaves slate in a broken state

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Custom table node allows entering text outside the table which leaves slate in a broken state.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-node-dom-node.json`, `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-point-dom-point.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-dom/test/bridge.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`; `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`.

Decision:
Custom table text outside table belongs to table boundary and invalid DOM import policy. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #4658: Custom table text outside table belongs to table boundary and invalid DOM import policy; no exact closure.

## #4643 Invalid selection leads to uncatchable error: "Cannot resolve a DOM point from Slate point"

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Invalid selection leads to uncatchable error: "Cannot resolve a DOM point from Slate point".

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-point-dom-point.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-dom/test/bridge.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`; `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`.

Decision:
Invalid selection throwing belongs to fail-closed DOM selection repair. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #4643: Invalid selection throwing belongs to fail-closed DOM selection repair; no exact closure.

## #4612 Bug: Cannot update slate state externally

Status: improves-claimed
Bucket: v2-api-dx
Confidence: medium

Issue summary:
Bug: Cannot update slate state externally.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-node-dom-node.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate/test/state-tx-public-api-contract.ts`; `docs/plans/2026-05-04-slate-v2-react-editor-initialization-value-ralplan.md`.

Decision:
External state updates route through explicit editor initialization/replacement APIs rather than controlled value. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #4612: External state updates route through explicit editor initialization/replacement APIs rather than controlled value; no exact closure.

## #4581 Deleting a void element or text decoration on FireFox and inserting text throws an error

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Deleting a void element or text decoration on FireFox and inserting text throws an error.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-node-dom-node.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-dom/test/bridge.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`; `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`.

Decision:
Firefox void/decorated deletion then insert belongs to void/decorated DOM selection repair. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #4581: Firefox void/decorated deletion then insert belongs to void/decorated DOM selection repair; no exact closure.

## #4559 deleteFragment undo should select re-inserted fragment

Status: cluster-synced
Bucket: v2-core-engine
Confidence: medium

Issue summary:
deleteFragment undo should select re-inserted fragment.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-history-set-selection-undo.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate/src/core/apply.ts`; `.tmp/slate-v2/packages/slate/src/core/public-state.ts`; `.tmp/slate-v2/packages/slate/test/state-tx-public-api-contract.ts`.
- focused proof: `.tmp/slate-v2/packages/slate-history/test/history-contract.ts`
  deletes a selected text fragment, undoes, and reselects the restored fragment.

Decision:
Promote to `fixes-claimed`. The package proof matches the reported
deleteFragment undo selection behavior.

PR-description text:
Fixes #4559: undo after `deleteFragment` reselects the restored fragment.

## #4348 Backspace Key on Android

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Backspace Key on Android.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-samsung-firefox-android.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`.

Decision:
Android backspace behavior belongs to mobile delete/input runtime proof. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #4348: Android backspace behavior belongs to mobile delete/input runtime proof; no exact closure.

## #4337 Image example in shadow dom: Cannot resolve a Slate point from DOM point

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Image example in shadow dom: Cannot resolve a Slate point from DOM point.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-dom/test/bridge.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`; `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`.

Decision:
Shadow DOM image drag/drop belongs to shadow DOM and media/void DOM bridge ownership. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #4337: Shadow DOM image drag/drop belongs to shadow DOM and media/void DOM bridge ownership; no exact closure.

## #4223 Proposal: Alternate hook-based implementation of Android support

Status: not-claimed
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Proposal: Alternate hook-based implementation of Android support.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-android-composition-beforeinput.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`.

Decision:
Alternate Android hook design is product/API direction evidence, not an issue closure. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #4223: Alternate Android hook design is product/API direction evidence, not an issue closure; no exact closure.

## #4088 Mention example range logic throws Cannot resolve a DOM point from Slate point

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Mention example range logic throws Cannot resolve a DOM point from Slate point.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-point-dom-point.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-dom/test/bridge.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`; `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`.

Decision:
Mention range DOM point failure belongs to mention/inline DOM range bridge ownership. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #4088: Mention range DOM point failure belongs to mention/inline DOM range bridge ownership; no exact closure.

## #4067 Input composition characters, Error !

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Input composition characters, Error !.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-placeholder-composition.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`.

Decision:
Composition after select-all belongs to composition/input event runtime ownership. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #4067: Composition after select-all belongs to composition/input event runtime ownership; no exact closure.

## #4056 Copy pasting (really) large text no longer seems to work?

Status: improves-claimed
Bucket: v2-performance-benchmark
Confidence: high

Issue summary:
Copy pasting (really) large text no longer seems to work?.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-large-document-paste-cut-performance.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/scripts/benchmarks/core/current/clipboard-large-payload.mjs`; `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`; `.tmp/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`.

Decision:
Current v2 improves the populated-editor large paste/copy workload with a dedicated issue-size benchmark. Exact `Fixes #...` closure is still not justified without the historical full-book/browser repro.

Slice 6 benchmark, refreshed 2026-05-23:
`.tmp/slate-v2/tmp/slate-clipboard-large-payload-benchmark.json` records a
populated-editor benchmark lane. The latest issue-size run reports
`49.35ms` for copying 10,000 populated blocks and `235.22ms` for pasting
10,000 plaintext lines into a 10,000-block populated editor, with one
logical operation. The DOM plaintext fallback now builds a model
fragment for populated text-block paste, and core fits top-level multi
text-block fragments as one replacement while preserving surrounding target
text and selection. Exact full-book browser closure remains unclaimed.

PR-description text:
Improves #4056: populated-editor large copy and large middle paste have issue-size benchmark proof; exact browser repro closure remains open.

## #5945 Slow Pasting of Large Text Content in Slate.js

Status: improves-claimed
Bucket: v2-performance-benchmark
Confidence: high

Issue summary:
Pasting generated plain text with 10,000 newline-separated rows into the
plaintext example reportedly takes about seven seconds in Slate versus about one
second in Tiptap.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 4056,5945,5992 --include-closed --json`.
- benchmark candidate map: `ready-now`, large plaintext paste benchmark.
- coverage matrix row: Improves after issue-size 10,000-line plaintext paste
  benchmark proof; exact browser repro closure remains open.
- current v2 proof owner:
  `docs/plans/2026-05-04-slate-v2-clawsweeper-v2-clipboard-serialization-ralplan.md`;
  source owner `.tmp/slate-v2/scripts/benchmarks/core/current/clipboard-large-payload.mjs`.

Decision:
This is the primary Slice 6 benchmark target. Current v2 now improves the
issue-size plaintext paste workload by replacing the per-line
`splitNodes + insertText` path with one logical `replace_fragment` operation
for the high-pressure empty-editor paste case. Do not use `Fixes #5945` until a
10,000-line browser artifact matches the reported plaintext example workflow.

Slice 6 benchmark:
The bounded baseline showed the old 2,000-line plain-text insert averaging
`3545.36ms` with `5998` operations, while split/encode/decode/copy were cheap.
The current issue-size command `bun run bench:slate:5945:issue` covers the
10,000-line plaintext workload and records one operation through
`replace_fragment`; the latest run reported `34.72ms` for 10,000 inserted
blocks. Focused package proof also covers trusted Slate fragment insertion into
empty, compatible, marked, inline-child, and full-document text-block targets
plus whole top-level structural block replacement as one logical operation with
undoable history. Collaboration proof replays the resulting `replace_fragment`
operation through `tx.operations.replay(...)`; CRDT/Yjs-style lowering remains
an adapter-boundary concern.

PR-description text:
Improves #5945: 10,000-line plaintext paste uses one logical
`replace_fragment` operation in the issue-size benchmark; exact browser repro
closure still needs a 10,000-line browser artifact.

## #5992 In the case of large documents, using the cut function took a lot of time.

Status: improves-claimed
Bucket: v2-performance-benchmark
Confidence: high

Issue summary:
Cutting two selected nodes in a 50,000-block huge document reportedly spends too
much time, with the issue specifically calling out expensive array destructuring.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 4056,5945,5992 --include-closed --json`.
- benchmark candidate map: `ready-with-minor-setup`, huge-document cut
  benchmark.
- live issue ledger routes it to `large-document-edit-performance` and
  `v2-performance-benchmark`.
- current issue-size run:
  `SLATE_CLIPBOARD_BENCH_HUGE_CUT_BLOCKS=50000 SLATE_CLIPBOARD_BENCH_ISSUE_TARGETS=1 bun ./scripts/benchmarks/slate/5945-large-plaintext-paste.mjs`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate/src/interfaces/node.ts` and
  `.tmp/slate-v2/packages/slate/test/clipboard-contract.ts`.
- current v2 proof owner:
  `docs/plans/2026-05-06-slate-v2-range-delete-replace-children-ralplan.md`;
  source owner `.tmp/slate-v2/scripts/benchmarks/core/current/clipboard-large-payload.mjs`.

Decision:
Keep this as `improves-claimed`, not `fixes-claimed`. The issue-size benchmark
now meets the accepted warm interaction target through one `replace_children`
operation, and the cold snapshot row is reported separately instead of being
hidden inside the edit metric. Browser stress covers a 5,000-block huge-document
cut row. Exact closure still needs maintainer acceptance that the benchmark plus
browser stress matches the reported user path.

Slice 6 baseline:
The issue-size benchmark measures a 50,000-block two-node cut at warm edit p50
`9.95ms`, warm copy-plus-delete p50 `8.62ms`, and operation count `1`. The
separate cold edit row remains p50 `171.91ms`, showing the remaining snapshot
allocation cost without blocking the warmed editor interaction target. The
previous slice measured `621.26ms` copy-plus-delete and `511.47ms` edit-only at
`3` operations after bounded fragment extraction, and the prior local issue-size
run before bounded fragment extraction measured about `4002.02ms` for
copy-plus-delete.

PR-description text:
Improves #5992: huge-document two-node cut lowers exact whole-child range delete
to one `replace_children` operation, meets the accepted warm benchmark target,
and has a browser huge-document cut stress row; exact auto-close remains a
maintainer acceptance decision.

## #5328 Error when pasting HTML containing `data-slate-fragment` text

Status: cluster-synced
Bucket: v2-clipboard-serialization
Confidence: high

Issue summary:
Pasted HTML that contains text matching `data-slate-fragment="..."` can be
mistaken for an internal Slate payload and block paste.

Evidence:

- ledger row: `v2-clipboard-serialization`, clipboard-and-external-html-parsing.
- related issue: #4857 reports foreign HTML select-all paste errors.
- duplicate/stale/invalid proof: valid, not duplicate; this is a trust-boundary
  import failure.
- live GitHub checked: yes, via
  `gitcrawl --json threads ianstormtaylor/slate --numbers 5328 --include-closed`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts` owns
  fragment import; `.tmp/slate-v2/packages/slate-dom/test/clipboard-boundary.ts`
  owns the focused DOM clipboard contract.

Decision:
Keep as `improves-claimed`. Malformed MIME payloads, malformed embedded HTML
`data-slate-fragment`, invalid JSON, URI-decode failures, and non-array JSON
now fail closed in the focused DOM clipboard contract. Exact browser repro
closure is still not claimed.

PR-description text:
Improves #5328: clipboard fragment trust-boundary family; no exact closure yet.

## #4857 Select all and paste HTML error all the time

Status: improves-claimed
Bucket: v2-clipboard-serialization
Confidence: medium

Issue summary:
Selecting all in Slate and pasting foreign HTML can throw while still partially
inserting content.

Evidence:

- ledger row: `v2-clipboard-serialization`, paste-html-fragment-boundary-errors.
- related issue: #5328 is the sharper embedded-fragment false-positive report.
- duplicate/stale/invalid proof: related, not duplicate; this report includes a
  browser demo and foreign HTML source.
- live GitHub checked: yes, via
  `gitcrawl --json threads ianstormtaylor/slate --numbers 4857 --include-closed`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts` and
  `.tmp/slate-v2/packages/slate-dom/test/clipboard-boundary.ts`.

Decision:
Keep as `improves-claimed`. The fail-closed internal fragment import family is
covered by focused DOM clipboard tests. Exact NYTimes/richtext browser repro
closure is not claimed.

PR-description text:
Improves #4857: foreign HTML clipboard import boundary; no exact closure.

## #5233 Allow customization of clipboard fragment format name

Status: cluster-synced
Bucket: v2-clipboard-serialization
Confidence: high

Issue summary:
Slate editors with different schemas can collide on
`application/x-slate-fragment`; the receiving editor needs a configurable
fragment MIME key.

Evidence:

- ledger row: `v2-clipboard-serialization`, clipboard-schema-isolation.
- related issue: #3486 asks for the same custom `setData` id capability.
- duplicate/stale/invalid proof: valid schema-isolation pressure.
- live GitHub checked: yes, via
  `gitcrawl --json threads ianstormtaylor/slate --numbers 5233 --include-closed`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/plugin/with-react.ts` and
  `.tmp/slate-v2/packages/slate-dom/src/plugin/with-dom.ts` accept
  `{ clipboardFormatKey }`; `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`
  writes keyed MIME payloads and keyed embedded HTML fallback fragments; and
  `.tmp/slate-v2/packages/slate-dom/test/clipboard-boundary.ts` proves custom-key
  editors accept matching embedded HTML while default-key editors reject
  custom-key embedded HTML and fall back to plain text.

Decision:
Move to `fixes-claimed`. The exact cross-schema isolation request is covered by
options-object custom keys, keyed MIME payloads, keyed embedded HTML fallback,
and mismatched fallback rejection proof.

PR-description text:
Fixes #5233: custom fragment format keys isolate MIME payloads and embedded
HTML fallback fragments.

## #3486 Allow to customize setData id

Status: fixes-claimed
Bucket: v2-clipboard-serialization
Confidence: high

Issue summary:
The clipboard `setData` id should be customizable so two Slate schemas do not
blindly import each other's internal fragments.

Evidence:

- ledger row: `v2-clipboard-serialization`, clipboard-and-transferdata-customization.
- related issue: #5233 is the newer, clearer version of the same schema
  isolation request.
- duplicate/stale/invalid proof: related custom-key family, but keep the row
  explicit because it is an older open feature request.
- live GitHub checked: yes, via
  `gitcrawl --json threads ianstormtaylor/slate --numbers 3486 --include-closed`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/src/plugin/with-react.ts` and
  `.tmp/slate-v2/packages/slate-dom/src/plugin/with-dom.ts` expose
  `{ clipboardFormatKey }`; `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`
  writes and reads the configured internal key; and
  `.tmp/slate-v2/packages/slate-dom/test/clipboard-boundary.ts` proves matching
  custom-key HTML import plus default-key rejection of custom-key embedded HTML.

Decision:
Move to `fixes-claimed` with #5233. The older custom `setData` id request is
the same schema-isolation requirement and now has focused proof.

PR-description text:
Fixes #3486: custom clipboard format keys isolate internal fragment transport.

## #1024 Discussion: MIME-typing the Document / Document Fragment?

Status: improves-claimed
Bucket: v2-clipboard-serialization
Confidence: high

Issue summary:
Slate fragments need an identity marker so editors with incompatible schemas do
not blindly import each other's internal JSON.

Evidence:

- ledger row: `v2-clipboard-serialization`, clipboard-schema-isolation.
- related issues: #5233 and #3486 are the concrete custom key versions.
- live GitHub checked: yes, via
  `gitcrawl threads ianstormtaylor/slate --numbers 1024 --include-closed --json`.
- current v2 proof:
  custom MIME support and keyed embedded HTML fallback exist in
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`, with
  focused acceptance/rejection proof in
  `.tmp/slate-v2/packages/slate-dom/test/clipboard-boundary.ts`.

Decision:
Move to `improves-claimed`. Fragment identity is stronger, but no full document
MIME system is claimed.

PR-description text:
Improves #1024: fragment MIME identity family; no full document MIME system.

## #4613 A more extensible insertData

Status: improves-claimed
Bucket: v2-clipboard-serialization
Confidence: high

Issue summary:
Apps need to reuse Slate clipboard behavior while adding custom paste handling
instead of copying internal `insertData` logic.

Evidence:

- ledger row: `v2-clipboard-serialization`, clipboard-extension-surface.
- live GitHub checked: yes, via
  `gitcrawl threads ianstormtaylor/slate --numbers 4613 --include-closed --json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts` runs
  `dom.clipboard.insertData` capability handlers before default fragment/text
  fallback, `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts` exports
  `DOMClipboardInsertDataHandler`, and the images, paste-html, and
  rendering-strategy-runtime examples use the public handler type.

Decision:
Move to `improves-claimed`. The extension hook is public and typed, but the
broader legacy "reuse insertData internals" request remains broader than this
clipboard slice.

PR-description text:
Improves #4613: extensible insertData capability with public handler typing.

## #4569 Add the "insertData" behavior in the documentation

Status: fixes-claimed
Bucket: v2-clipboard-serialization
Confidence: high

Issue summary:
Docs should describe how `insertData` works.

Evidence:

- ledger row: `v2-clipboard-serialization`, clipboard-extension-surface.
- live GitHub checked: yes, via
  `gitcrawl threads ianstormtaylor/slate --numbers 4569 --include-closed --json`.
- current v2 docs:
  `.tmp/slate-v2/docs/libraries/slate-react/react-editor.md` documents
  `editor.dom.clipboard.insertData`, capability order, handler return
  semantics, internal fragment fallback, and extension-owned rich HTML policy.
  `.tmp/slate-v2/docs/libraries/slate-react/with-react.md` documents
  `clipboardFormatKey`.

Decision:
Move to `fixes-claimed`. The requested `insertData` behavior docs exist in the
v2 docs surface.

PR-description text:
Fixes #4569: `insertData` docs state capability order, return semantics, and
fallback behavior.

## #4440 Allow overriding getPlainText (and HTML?)

Status: cluster-synced
Bucket: v2-clipboard-serialization
Confidence: medium

Issue summary:
Apps want custom outgoing plain-text/HTML clipboard serialization without
rewriting all of Slate's copy/cut internals.

Evidence:

- ledger row: `v2-clipboard-serialization`, clipboard-output-customization.
- live GitHub checked: yes, via
  `gitcrawl threads ianstormtaylor/slate --numbers 4440 --include-closed --json`.
- current v2 proof:
  Slice 5 owns input customization and fragment format isolation, not output
  serializer customization.

Decision:
Keep as `Related`, not fixed. A later output serializer capability may address
this cleanly. Do not cram it into the `insertData` input path.

PR-description text:
Related #4440: output clipboard customization; not claimed by Slice 5.

## #3557 Unable to overrde editor.insertNode and editor.insertFragment

Status: cluster-synced
Bucket: v2-api-dx
Confidence: medium

Issue summary:
Apps expect extension points around insert operations instead of brittle direct
method replacement.

Evidence:

- ledger row: API/extension override pressure.
- live GitHub checked: yes, via
  `gitcrawl threads ianstormtaylor/slate --numbers 3557 --include-closed --json`.
- current v2 direction:
  transform registries and extension capabilities are the v2 answer, but this
  clipboard slice only touches `dom.clipboard.insertData`.

Decision:
Keep as `Related`, not fixed. Do not claim a broad method override issue from a
clipboard-specific capability pass.

PR-description text:
Related #3557: broader extension-method override pressure; not fixed by this
clipboard slice.

## #4542 Pasting into an empty block inserts the entire fragment as-is

Status: cluster-synced
Bucket: v2-clipboard-serialization
Confidence: medium

Issue summary:
Pasting selected text from nested content into an empty block imports unwanted
wrapper context instead of the selected content shape.

Evidence:

- ledger row: `v2-clipboard-serialization`, clipboard-strategy-and-fragment-semantics.
- related issues: #5151, #5429, #5089, and #3155 are neighboring fragment
  insertion and selection-placement rows.
- duplicate/stale/invalid proof: valid, but broader than the first trust-boundary
  slice.
- live GitHub checked: yes, via
  `gitcrawl --json threads ianstormtaylor/slate --numbers 4542 --include-closed`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate/test/clipboard-contract.ts` and
  `.tmp/slate-v2/packages/slate-dom/test/clipboard-boundary.ts`.

Decision:
Keep as `cluster-synced`. The fixed `#5089` proof covers middle-paragraph
multi-block insertion, but `#4542` is broader: selected nested content pasted
into an empty block must drop unwanted wrapper context. That exact behavior
still needs DOM/browser paste proof.

PR-description text:
Related #4542: fragment insertion shape family; no exact closure.

## #3155 add fragment non-merging logic

Status: related
Bucket: v2-clipboard-serialization
Confidence: medium

Issue summary:
Fragment insertion should avoid blindly merging structural blocks at both ends,
especially for lists, tables, and fragments whose copied range spans multiple
block contexts.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 3155 --include-closed --json`.
- test candidate:
  `docs/slate-issues/test-candidate-map/3313-2733.md`.
- open issue dossier:
  `docs/slate-issues/open-issues-dossiers/3313-2733.md`.
- active plan:
  `docs/plans/2026-05-07-slate-v2-multiblock-fragment-middle-insert-ralplan.md`.
- current v2 owner:
  `.tmp/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`.

Decision:
Keep as `related`, not `fixes-claimed`. The fixed `#5089` proof targets one
exact middle-paragraph multi-block insertion bug. `#3155` is a broader fragment
policy and API-shape request; closing it needs wider structural fragment proof
than this lane should claim.

PR-description text:
Related #3155: fragment non-merging policy pressure; no broad policy closure.

## #5151 Pasting into empty or fully selected node changes its type

Status: improves-claimed
Bucket: v2-clipboard-serialization
Confidence: medium

Issue summary:
Replacing a fully selected block with a copied fragment can change the target
node type instead of preserving the receiving block policy.

Evidence:

- ledger row: `v2-clipboard-serialization`, paste-fragment-and-node-type-preservation.
- related issue: #4542 covers unwanted wrapper context during paste.
- duplicate/stale/invalid proof: valid, but exact behavior depends on the v2
  fragment insertion policy for rich fragments.
- live GitHub checked: yes, via
  `gitcrawl --json threads ianstormtaylor/slate --numbers 5151 --include-closed`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts` preserves
  the target text-block wrapper when a single text-block fragment replaces
  selected target text; `.tmp/slate-v2/packages/slate/test/clipboard-contract.ts`
  proves the core transaction path; `.tmp/slate-v2/packages/slate-dom/test/clipboard-boundary.ts`
  proves the rich clipboard round-trip path.

Decision:
Move to `improves-claimed`. Rich fragment target-block preservation is covered
for the selected single text-block case. Exact closure still needs browser
replay of the original issue shape.

PR-description text:
Improves #5151: rich Slate fragment insertion preserves the receiving text-block
type for the selected single-block replacement case; no exact closure.

## #3918 Slate does not react on delete button on page refresh - it just moves cursor backwards or throws error `Cannot resolve a DOM point from Slate point` on letter insert

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Slate does not react on delete button on page refresh - it just moves cursor backwards or throws error `Cannot resolve a DOM point from Slate point` on letter insert.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-point-dom-point.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-dom/test/bridge.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`; `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`.

Decision:
Page-refresh delete/insert DOM point crash belongs to DOM selection import/export repair. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #3918: Page-refresh delete/insert DOM point crash belongs to DOM selection import/export repair; no exact closure.

## #3641 Slate throws exceptions too liberally in relation to selection failures

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Slate throws exceptions too liberally in relation to selection failures.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-node-dom-node.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-dom/test/bridge.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`; `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`.

Decision:
Selection failure error strictness belongs to fail-closed DOM bridge policy. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #3641: Selection failure error strictness belongs to fail-closed DOM bridge policy; no exact closure.

## #3568 Calling addMark in onDOMBeforeInput crashes Slate when selection is not collapsed

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Calling addMark in onDOMBeforeInput crashes Slate when selection is not collapsed.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-node-dom-node.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`.

Decision:
addMark during onDOMBeforeInput belongs to input command and selection synchronization. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #3568: addMark during onDOMBeforeInput belongs to input command and selection synchronization; no exact closure.

## #3470 Selecting text and moving the cursor is completely broken on Android

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: medium

Issue summary:
Selecting text and moving the cursor is completely broken on Android.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-android-composition-beforeinput.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`.

Decision:
Android text selection/cursor movement belongs to mobile selection/input runtime proof. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #3470: Android text selection/cursor movement belongs to mobile selection/input runtime proof; no exact closure.

## #3309 decorated text cannot be selected (#3118 re-open)

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
decorated text cannot be selected (#3118 re-open).

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-point-dom-point.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx`; `.tmp/slate-v2/packages/slate-react/src/decoration-source.ts`; `.tmp/slate-v2/packages/slate-react/test/app-owned-customization.tsx`.

Decision:
Decorated text selection belongs to projection/decoration DOM stability. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #3309: Decorated text selection belongs to projection/decoration DOM stability; no exact closure.

## #2051 try to prevent re-rendering at the Leaf level

Status: improves-claimed
Bucket: v2-performance-benchmark
Confidence: medium

Issue summary:
try to prevent re-rendering at the Leaf level.

Evidence:

- ledger row: live gitcrawl singleton search candidate from Batch 3.
- raw search evidence: `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-android-composition-beforeinput.json`, `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-history-set-selection-undo.json`.
- live GitHub checked: yes, via Batch 0 gitcrawl refresh and `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`.
- current v2 proof owner: `.tmp/slate-v2/scripts/benchmarks`; `docs/plans/2026-05-03-slate-v2-dom-present-large-doc-phase-6-plan.md`.

Decision:
Leaf rerender pressure is represented by v2 render/runtime performance gates. No exact `Fixes #...` claim is justified without a focused repro matching this issue.

PR-description text:
Related #2051: Leaf rerender pressure is represented by v2 render/runtime performance gates; no exact closure.

## #5806 Selection is empty when sliding to select a custom inline element such as a button

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Mouse/gesture selection over a custom inline element returns an empty selection
where app code expects the selected inline element.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `custom-inline-selection-behavior`, likely-valid,
  `v2-react-runtime`, `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`;
  `.tmp/slate-v2/packages/slate-react/test/selection-controller-contract.ts`;
  `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`.

Decision:
Keep as `cluster-synced`. The owner is React selection import/reconciliation
around custom inline boundaries, but the exact slide-selection browser repro is
not proven.

PR-description text:
Related #5806: custom inline selection belongs to React selection
reconciliation; no exact gesture-selection closure.

## #5690 Double-clicking a word before an inline element and deleting crashes Slate

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Windows/Chrome double-click selection before an inline element followed by
Backspace crashes when the browser DOM range no longer matches Slate's expected
inline boundary.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `inline-boundary-selection`, likely-valid,
  `v2-react-runtime`, `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`;
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-keyboard-events.ts`;
  `.tmp/slate-v2/packages/slate-react/test/selection-controller-contract.ts`.

Decision:
Keep as `cluster-synced`. This needs a Windows/Chrome inline-boundary browser
repro before an exact fix claim.

PR-description text:
Related #5690: inline-boundary double-click/delete selection belongs to React
selection reconciliation; no exact Windows/Chrome closure.

## #5689 Triple-click the mouse to select upward, the selection disappears

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Triple-click and upward drag selection can lose the selection in Chrome/Safari.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `selection-gesture-directionality`, likely-valid,
  `v2-react-runtime`, `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts`;
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`;
  `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`.

Decision:
Keep as `cluster-synced`. This is a browser gesture-selection proof target, not
a pure hook/runtime unit claim.

PR-description text:
Related #5689: triple-click/upward selection belongs to browser selection
gesture proof; no exact closure.

## #5404 Incorrect return type for useSlateStatic

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Legacy docs and code disagreed on whether `useSlateStatic` returns `Editor` or
`ReactEditor`.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `react-hook-return-types`, valid, `v2-react-runtime`,
  `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor.tsx`;
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-editor.ts`;
  `.tmp/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`.

Decision:
Keep as `cluster-synced`. V2 hook naming and typing are cleaner, but the legacy
`useSlateStatic` API is not an exact closure claim.

PR-description text:
Related #5404: React hook return typing is covered by v2 hook contracts; no
legacy `useSlateStatic` auto-close.

## #3383 Impossible to create overlapping marks/decorations with same semantic meaning but different metadata

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Overlapping mark/decoration payloads with the same semantic key but different
metadata are hard to represent through the legacy merged-leaf data model.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `marks-and-decorations-data-model`, valid,
  `v2-react-runtime`, `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`;
  `.tmp/slate-v2/packages/slate-react/src/projection-store.ts`.

Decision:
Keep as `cluster-synced`. V2 projection slices can carry overlapping payloads,
but full mark/decoration semantic policy is not auto-closed by this planning
pass.

PR-description text:
Related #3383: overlapping mark/decoration metadata belongs to projection data
model proof; no exact closure.

## #4995 scrollSelectionIntoView cannot completely customize auto-scrolling behavior

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
The `scrollSelectionIntoView` callback is not called for enough selection
movement cases, so app custom scrolling logic cannot fully replace Slate's
default behavior.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `scroll-selection-customization-regressions`, valid,
  `v2-react-runtime`, `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`;
  `.tmp/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx`;
  `.tmp/slate-v2/packages/slate-react/test/app-owned-customization.tsx`.

Decision:
Keep as `cluster-synced`. The React runtime owns the scroll/selection callback
policy, but the exact arrow/sticky-header repro is not proven.

PR-description text:
Related #4995: scroll selection customization belongs to React selection-scroll
policy; no exact closure.

## #4590 Custom boundary for scroll-into-view-if-needed

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Apps need control over the scroll boundary when the scrolling container sits
above the editor.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `scroll-selection-customization-regressions`, valid,
  `v2-react-runtime`, `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`;
  `.tmp/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx`.

Decision:
Keep as `cluster-synced`. This is valid API pressure, but no public scroll
boundary shape is accepted by this pass.

PR-description text:
Related #4590: scroll boundary customization belongs to React selection-scroll
policy; no accepted API or exact closure yet.

## #4366 Slate React uses too generalized types in main component

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
The main React component typing is too broad for accurate app usage.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `react-component-typing-surface`, valid,
  `v2-react-runtime`, `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx`;
  `.tmp/slate-v2/packages/slate-react/test/generic-react-editor-contract.tsx`;
  `.tmp/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`.

Decision:
Keep as `cluster-synced`. V2 generic React editor contracts address the
pressure, but the exact legacy type complaint is not auto-closed.

PR-description text:
Related #4366: React component typing belongs to v2 generic React editor
contracts; no exact legacy type closure.

## #4315 Exports PLACEHOLDER_SYMBOL variable

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: low

Issue summary:
Placeholder customization depended on internal exported symbols.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `placeholder-customization-internals`, valid,
  `v2-react-runtime`, `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/components/slate-placeholder.tsx`;
  `.tmp/slate-v2/packages/slate-react/test/rendered-dom-shape-contract.tsx`.

Decision:
Keep as `cluster-synced`, not a closure claim. Placeholder API shape still
needs a focused API/docs proof pass before exact issue accounting changes.

PR-description text:
Related #4315: placeholder internals belong to React placeholder API proof; no
exact closure.

## #4311 tidy DOM for readonly

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Readonly rendering should avoid unnecessary editable DOM and runtime weight.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `readonly-static-renderer`, valid, `v2-react-runtime`,
  `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx`;
  `.tmp/slate-v2/packages/slate-react/test/rendered-dom-shape-contract.tsx`;
  `.tmp/slate-v2/packages/slate-react/test/render-profiler-contract.test.tsx`.

Decision:
Keep as `cluster-synced`. Readonly/static rendering is a valid React runtime
surface, but no exact DOM-shape closure is claimed by this pass.

PR-description text:
Related #4311: readonly DOM weight belongs to static/readOnly render proof; no
exact closure.

## #4298 Firefox Editor.marks incorrectly identifies active marks

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Firefox selection can make active mark queries disagree with user-visible
selection state.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `marks-query-and-browser-selection-drift`, valid,
  `v2-react-runtime`, `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`;
  `.tmp/slate-v2/packages/slate-react/test/selection-runtime-contract.test.ts`.

Decision:
Keep as `cluster-synced`. This needs Firefox mark-query browser proof before
claim promotion.

PR-description text:
Related #4298: Firefox mark query drift belongs to selection/mark proof; no
exact closure.

## #4225 Slate should render editor mark

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: low

Issue summary:
Apps want editor mark state exposed through rendering.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `react-hook-surface-and-rendered-editor-state`, valid,
  `v2-react-runtime`, `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx`;
  `.tmp/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`.

Decision:
Keep as `cluster-synced`. V2 selectors can expose editor state, but no special
render-editor-mark API is accepted here.

PR-description text:
Related #4225: rendered editor mark state belongs to selector/hook proof; no
accepted API or exact closure.

## #4221 Firefox placeholder highlighted via cmd/ctrl+a

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Firefox can visually select the placeholder on select-all in an empty editor.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `placeholder-and-empty-editor-selection`, valid,
  `v2-react-runtime`, `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/components/slate-placeholder.tsx`;
  `.tmp/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx`;
  `.tmp/slate-v2/playwright/integration/examples/placeholder.test.ts`.

Decision:
Keep as `cluster-synced`. Placeholder selection rendering needs exact Firefox
select-all proof before closure.

PR-description text:
Related #4221: Firefox placeholder select-all belongs to placeholder/selection
browser proof; no exact closure.

## #4025 static renderer

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Apps want a read-only/static renderer with less editing runtime weight.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `read-only-and-static-rendering`, valid,
  `v2-react-runtime`, `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx`;
  `.tmp/slate-v2/packages/slate-react/test/rendered-dom-shape-contract.tsx`;
  `.tmp/slate-v2/packages/slate-react/test/render-profiler-contract.test.tsx`.

Decision:
Keep as `cluster-synced`. Static rendering is valid architecture pressure, but
no static-renderer public API is claimed here.

PR-description text:
Related #4025: static renderer pressure belongs to readonly/static render proof;
no accepted public static renderer closure.

## #3924 readonly uses disabled semantics

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Readonly should preserve focus/click semantics closer to browser readonly
controls instead of behaving like disabled content.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `read-only-and-static-rendering`, valid,
  `v2-react-runtime`, `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx`;
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-focus-mouse-events.ts`;
  `.tmp/slate-v2/packages/slate-react/test/editable-behavior.tsx`.

Decision:
Keep as `cluster-synced`. Readonly focus/click semantics need their own browser
proof before exact closure.

PR-description text:
Related #3924: readonly focus/click semantics belong to React readonly runtime
proof; no exact closure.

## #3892 Advice Request: Custom editor surface and layout engine

Status: not-claimed
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
This asks whether Slate React can support a custom rendering/layout engine that
replaces normal contenteditable behavior.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `custom-surface-and-layout-engine-pressure`, valid,
  `v2-react-runtime`, `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx`;
  `.tmp/slate-v2/packages/slate-react/src/rendering-strategy`.

Decision:
Do not claim this as fixed. Slate v2 can expose clearer rendering strategy and
DOM coverage primitives, but a full custom layout engine is product/ecosystem
territory unless a specific raw Slate primitive gap is proven.

PR-description text:
Not claimed #3892: custom layout engine support is ecosystem/product territory;
v2 only addresses substrate rendering strategy pressure.

## #2608 Center/Right-aligned placeholder text does not display properly

Status: cluster-synced
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
Placeholder rendering does not follow centered or right-aligned text layout.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `placeholder-rendering-internals`, valid,
  `v2-react-runtime`, `cluster-synced`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof owner:
  `.tmp/slate-v2/packages/slate-react/src/components/slate-placeholder.tsx`;
  `.tmp/slate-v2/packages/slate-react/test/rendered-dom-shape-contract.tsx`;
  `.tmp/slate-v2/playwright/integration/examples/placeholder.test.ts`.

Decision:
Keep as `cluster-synced`. Placeholder layout has a clear owner, but centered
and right-aligned placeholder rendering need exact visual/browser proof.

PR-description text:
Related #2608: placeholder alignment belongs to placeholder rendering proof; no
exact visual closure.

## #4483 More flexible / performant dynamic decorations via small API change

Status: improves-claimed
Bucket: already-accounted
Confidence: high

Issue summary:
Global `decorate` recomputation makes dynamic decorations expensive; the issue
asks for a more local decoration API.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `react-decoration-subscription-performance`,
  already-accounted, `improves-claimed`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof:
  `.tmp/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx`;
  `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`.

Decision:
Keep as `improves-claimed`. V2 projection stores and local subscriptions reduce
dynamic decoration pressure, but the exact legacy `renderChildren` proposal is
not the accepted public API.

PR-description text:
Improves #4483: projection stores and local subscriptions address dynamic
decoration pressure; no exact legacy API closure.

## #4477 Being able to leave comments for collaborative writing

Status: improves-claimed
Bucket: already-accounted
Confidence: medium

Issue summary:
The issue asks for collaborative comments anchored to text selections.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `collaboration-annotations-and-comments`,
  already-accounted, `improves-claimed`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/test/annotation-store-contract.tsx`;
  `.tmp/slate-v2/packages/slate-react/test/widget-layer-contract.tsx`.

Decision:
Keep as `improves-claimed`. Annotation and widget lanes cover the substrate for
selection-anchored overlays; product collaborative comments are not raw Slate.

PR-description text:
Improves #4477: annotation and widget lanes support selection-anchored overlay
substrates; product comments are not auto-closed.

## #4392 Cross-node decorate

Status: improves-claimed
Bucket: already-accounted
Confidence: high

Issue summary:
Decorations should work across node boundaries rather than being constrained to
the current text node.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `decoration-cross-node-and-void-access`,
  already-accounted, `improves-claimed`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`.

Decision:
Keep as `improves-claimed`. Runtime range projection represents cross-node
decoration pressure, but full legacy decorator API parity is not claimed.

PR-description text:
Improves #4392: runtime range projection represents cross-node decoration
pressure; no full legacy decorator API closure.

## #3382 Text.decorations assumes ranges are for current node

Status: improves-claimed
Bucket: already-accounted
Confidence: high

Issue summary:
Legacy decoration cutting applies ranges relative to the current text node even
when ranges point elsewhere.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `react-decoration-and-selection-stability`,
  already-accounted, `improves-claimed`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`.

Decision:
Keep as `improves-claimed`. Projection slices are keyed by runtime text ranges;
the exact legacy `Text.decorations` API is not the v2 public contract.

PR-description text:
Improves #3382: projection slices are keyed by runtime text ranges; no legacy
`Text.decorations` API closure.

## #3352 Cannot decorate siblings in decorator callback

Status: improves-claimed
Bucket: already-accounted
Confidence: high

Issue summary:
Decorators cannot return ranges spanning sibling text nodes cleanly.

Evidence:

- live gitcrawl row: singleton open issue.
- full matrix row: `react-decoration-and-selection-stability`,
  already-accounted, `improves-claimed`.
- live GitHub checked: yes, via gitcrawl thread batch on 2026-05-04.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`.

Decision:
Keep as `improves-claimed`. Cross-node projection is represented by
range-to-text-slice projection; decorator callback API parity is not claimed.

PR-description text:
Improves #3352: range-to-text-slice projection represents sibling decoration
pressure; no legacy decorator callback closure.

## #2288 Make some operations take a range as input

Status: fixes-claimed
Bucket: v2-core-engine
Confidence: high

Issue summary:
Slate's single-node operation model can explode into many operations for
large-range changes such as `selectAll` + delete, making the operation stream
harder to follow and more expensive to replay.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 2288 --include-closed --json`.
- current range-delete plan:
  `docs/plans/2026-05-06-slate-v2-range-delete-replace-children-ralplan.md`.
- current v2 source lowers exact whole top-level child ranges to one
  `replace_children` operation in
  `.tmp/slate-v2/packages/slate/src/transforms-text/delete-text.ts`.
- operation proof covers apply/inverse, path refs, point refs, history undo, and
  collaboration replay in
  `.tmp/slate-v2/packages/slate/test/operations-contract.ts` and
  `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts`.

Decision:
Keep as `improves-claimed`, not `fixes-claimed`. `replace_children` is exactly
the range-operation primitive this issue asked for, but public operation
exposure and arbitrary range-operation API closure are separate decisions.

PR-description text:
Improves #2288: `replace_children` adds a range-capable child-window operation
with core apply/inverse/ref/history/collab proof; no public range-operation API
closure yet.

## #1770 Support for combining or merging operations

Status: fixed
Bucket: v2-core-engine
Confidence: high

Issue summary:
Sequential low-level operations create collaboration/server overhead; the issue
asks for operation composition or merging utilities.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 1770 --include-closed --json`.
- current range-delete plan:
  `docs/plans/2026-05-06-slate-v2-range-delete-replace-children-ralplan.md`.

Decision:
Keep as `related`. `replace_children` reduces one important class of operation
chatter, but it is not a general operation-merging utility.

PR-description text:
Related #1770: range replacement reduces op chatter; no general op-composition
closure.

## #3741 The move_node operation should include moved node to support collaborative editors

Status: fixes-claimed
Bucket: v2-core-engine
Confidence: medium

Issue summary:
`move_node` operations do not carry the moved node payload, which makes some
operational-transform and undo/redo integrations harder to reason about.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 3741 --include-closed --json`.
- current core history plan:
  `docs/plans/2026-05-06-slate-v2-core-history-selection-undo-ralplan.md`.
- current v2 collaboration proof keeps runtime ids local and tests remote
  move/remove rebase behavior in
  `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts`.

Decision:
Keep as `related`. The next history slice should test `move_node` undo state,
but that does not imply a serialized operation payload redesign. Exact OT
closure would need a collaboration transport proof and a public operation-shape
decision.

PR-description text:
Related #3741: `move_node` collaboration metadata pressure; no moved-node
payload closure.

## #3752 slate-history causes memory leaks

Status: improves-claimed
Bucket: v2-performance-benchmark
Confidence: high

Issue summary:
`slate-history` can retain old editor objects or DOM-related state strongly
enough to create memory leaks.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 3752 --include-closed --json`.
- current core history plan:
  `docs/plans/2026-05-06-slate-v2-core-history-selection-undo-ralplan.md`.
- performance candidate map keeps memory/retention issues separate from
  correctness-only undo tests.
- current v2 retained-memory benchmark:
  `.tmp/slate-v2/scripts/benchmarks/core/current/history-retained-memory.mjs`.
- benchmark artifact:
  `.tmp/slate-v2/tmp/slate-history-retained-memory.json`.

Decision:
Keep as `improves-claimed`, not `fixes-claimed`. Slate v2 now has a
current-only retained-memory benchmark for history payload pressure, including
history entry count, operation count, retained payload tags, retained JSON
bytes, and heap samples. Exact closure still needs an accepted leak threshold or
detached DOM/node retention proof that matches the original report.

PR-description text:
Improves #3752: Slate v2 adds retained-memory benchmark coverage for history
payload pressure, but exact memory-leak closure still needs accepted
heap/detached-retention proof.

## #2500 Rich Text select-all delete leaves list structure

Status: related
Bucket: v2-core-engine
Confidence: medium

Issue summary:
Selecting all in the rich text example and pressing delete can leave behind an
empty list wrapper/list-item instead of clearing the editor content.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 2500 --include-closed --json`.
- current range-delete plan:
  `docs/plans/2026-05-06-slate-v2-range-delete-replace-children-ralplan.md`.
- focused core proof:
  `.tmp/slate-v2/packages/slate/test/delete-contract.ts`.
- execution checkpoint:
  `.tmp/completion-checks/slate-v2-core-structural-delete-normalization-execution.md`.

Decision:
Claim `Fixes #2500`. The core package proof deletes a full-document selection
spanning list-heavy content and leaves one empty editable paragraph, not an
orphan list shell.

PR-description text:
Fixes #2500: Core full-document delete over list-heavy content resets to one
empty editable paragraph instead of preserving an orphan list shell.

## #2195 Skip text nodes in dirty tracking

Status: related
Bucket: v2-performance-benchmark
Confidence: medium

Issue summary:
Dirty tracking should avoid marking text nodes that cannot be normalized,
because that work adds performance cost without useful normalization output.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 2195 --include-closed --json`.
- current range-delete plan:
  `docs/plans/2026-05-06-slate-v2-range-delete-replace-children-ralplan.md`.

Decision:
Keep as `related`. The `replace_children` plan explicitly requires dirty-window
metadata so #5992 is not fixed by moving cost into dirty tracking. It does not
close the broader dirty-text-node issue.

PR-description text:
Related #2195: dirty-window proof gate; no dirty-tracking closure.

## #2405 Command-scoped schema rule evaluation

Status: related
Bucket: v2-performance-benchmark
Confidence: medium

Issue summary:
Schema/normalization rules should not all run for every command when many rules
cannot be invalidated by a given edit.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 2405 --include-closed --json`.
- current range-delete plan:
  `docs/plans/2026-05-06-slate-v2-range-delete-replace-children-ralplan.md`.

Decision:
Keep as `related`. `replace_children` must carry enough dirty-window metadata
for bounded normalization, but one operation does not solve the full
command-scoped normalization policy.

PR-description text:
Related #2405: bounded normalization pressure; no schema-rule closure.

## #2355 Allow normalizing the selection

Status: related
Bucket: v2-core-engine
Confidence: medium

Issue summary:
Slate lacks a first-class selection normalization boundary equivalent to node
normalization, causing valid selection ownership to be handled indirectly.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 2355 --include-closed --json`.
- current range-delete plan:
  `docs/plans/2026-05-06-slate-v2-range-delete-replace-children-ralplan.md`.

Decision:
Keep as `related`. `replace_children` must own `newSelection` and ref mapping
for its own edit, but it should not introduce a broad public selection
normalizer.

PR-description text:
Related #2355: selection mapping proof for range replacement; no selection
normalizer closure.

## #4104 Cannot copy/cut inline void alone

Status: related
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Selecting an inline void alone can fail to trigger copy/cut because of
`contentEditable={false}` and DOM event ownership around void content.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 4104 --include-closed --json`.
- current range-delete plan:
  `docs/plans/2026-05-06-slate-v2-range-delete-replace-children-ralplan.md`.

Decision:
Keep as `related`. Inline-void cut belongs to DOM/void selection handling. The
range-delete implementation must not regress it, but `replace_children` is not
the direct fix.

PR-description text:
Related #4104: inline-void cut regression row; no exact closure.

## #5089 Incorrect behavior inserting a fragment across multiple blocks

Status: fixes-claimed
Bucket: v2-clipboard-serialization
Confidence: high

Issue summary:
Pasting a multi-block fragment into the middle of a paragraph can flatten the
fragment into the current paragraph instead of preserving block separation.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 5089 --include-closed --json`.
- test candidate:
  `docs/slate-issues/test-candidate-map/5129-5066.md`.
- open issue dossier:
  `docs/slate-issues/open-issues-dossiers/5129-5066.md`.
- active plan:
  `docs/plans/2026-05-07-slate-v2-multiblock-fragment-middle-insert-ralplan.md`.
- current v2 owner:
  `.tmp/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`;
  `.tmp/slate-v2/packages/slate/test/clipboard-contract.ts`;
  `.tmp/slate-v2/packages/slate-dom/test/clipboard-boundary.ts`.
- execution checkpoint:
  `.tmp/completion-checks/slate-v2-multiblock-fragment-middle-insert-execution.md`.

Decision:
Claim `Fixes #5089`. Core package proof and DOM clipboard boundary proof show
a rich multi-block fragment inserted at a collapsed middle text position keeps
block separation: the first fragment block merges with the destination prefix,
the final fragment block merges with the destination suffix, and the fragment
does not flatten into one paragraph.

PR-description text:
Fixes #5089: Rich multi-block fragment paste into the middle of a paragraph
preserves block separation instead of flattening into the current paragraph.

## #5412 insertFragment at a specified location regression

Status: fixes-claimed
Bucket: v2-core-engine
Confidence: high

Issue summary:
`insertFragment(..., { at })` can ignore the explicit target and route through
current editor selection instead.

Evidence:

- open issue dossier:
  `docs/slate-issues/open-issues-dossiers/5479-5403.md`.
- test candidate:
  `docs/slate-issues/test-candidate-map/5479-5403.md`.
- selected next plan:
  `docs/plans/2026-05-07-slate-v2-insert-fragment-at-location-ralplan.md`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate/test/clipboard-contract.ts`.
- checkpoint:
  `.tmp/completion-checks/slate-v2-insert-fragment-at-location-execution.md`.
- implementation owner:
  `.tmp/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`;
  `.tmp/slate-v2/packages/slate/src/core/public-state.ts`.

Decision:
Claim `Fixes #5412`. Package proof shows `insertFragment(..., { at })` writes
at the supplied target even when the editor selection points elsewhere.

PR-description text:
Fixes #5412: `insertFragment(..., { at })` writes at the supplied target instead
of ambient selection.

## #5429 Cursor inconsistently placed on insertion

Status: fixes-claimed
Bucket: v2-core-engine
Confidence: high

Issue summary:
Inserting a fragment into an empty node can leave the caret before inserted
content instead of after it.

Evidence:

- open issue dossier:
  `docs/slate-issues/open-issues-dossiers/5479-5403.md`.
- test candidate:
  `docs/slate-issues/test-candidate-map/5479-5403.md`.
- selected next plan:
  `docs/plans/2026-05-07-slate-v2-insert-fragment-at-location-ralplan.md`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate/test/clipboard-contract.ts`.
- checkpoint:
  `.tmp/completion-checks/slate-v2-insert-fragment-at-location-execution.md`.
- implementation owner:
  `.tmp/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`.

Decision:
Claim `Fixes #5429`. Package proof shows `insertFragment` into an empty text
block leaves selection after the inserted content.

PR-description text:
Fixes #5429: `insertFragment` into an empty text block leaves selection after
the inserted content.

## #5630 Select-all paste/delete leaves trailing block element

Status: related
Bucket: v2-clipboard-serialization
Confidence: medium

Issue summary:
Select-all paste/delete around a trailing image or block element can fail to
delete the block because unhang/delete range ownership misses the void tail.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 5630 --include-closed --json`.
- current range-delete plan:
  `docs/plans/2026-05-06-slate-v2-range-delete-replace-children-ralplan.md`.

Decision:
Keep as `related`. This is delete-range pressure and should be a regression row
if range deletion changes. Exact unhang/void-tail browser closure needs its own
focused proof.

PR-description text:
Related #5630: select-all paste/delete void-tail pressure; no exact closure.

## #4121 Selecting text and deleting it will delete all preceding text under specific conditions

Status: fixed
Bucket: v2-core-engine
Confidence: high

Issue summary:
An expanded selection that starts before one formatted leaf and ends exactly at
the start of another formatted leaf can delete text before the selected window.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads --numbers 4121 --include-closed --json ianstormtaylor/slate`.
- neighbor sweep connects this to select-all/delete and delete-range issues:
  `gitcrawl neighbors --number 4121 --limit 20 --json ianstormtaylor/slate`.
- next plan:
  `docs/plans/2026-05-07-slate-v2-core-structural-delete-normalization-ralplan.md`.
- focused core proof:
  `.tmp/slate-v2/packages/slate/test/delete-contract.ts`.
- execution checkpoint:
  `.tmp/completion-checks/slate-v2-core-structural-delete-normalization-execution.md`.

Decision:
Claim `Fixes #4121`. The package proof deletes from plain text through a
formatted leaf and stops at the next formatted leaf boundary without removing
unselected prefix/suffix text.

PR-description text:
Fixes #4121: Core expanded delete over a formatted leaf window removes only the
selected content and collapses at the selection start.

## #3965 Deletion bug

Status: fixed
Bucket: v2-core-engine
Confidence: high

Issue summary:
Deleting across an empty marked text node can remove both neighboring marked
texts where the expected behavior is text merge.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads --numbers 3965 --include-closed --json ianstormtaylor/slate`.
- live v2 source already has adjacent text merge helpers in
  `.tmp/slate-v2/packages/slate/src/transforms-text/delete-text.ts`.
- next plan:
  `docs/plans/2026-05-07-slate-v2-core-structural-delete-normalization-ralplan.md`.
- focused core proof:
  `.tmp/slate-v2/packages/slate/test/delete-contract.ts`.
- execution checkpoint:
  `.tmp/completion-checks/slate-v2-core-structural-delete-normalization-execution.md`.

Decision:
Claim `Fixes #3965`. The package proof Backspaces from an empty same-mark text
at the start of the second block and merges the block boundary without deleting
both neighboring text runs.

PR-description text:
Fixes #3965: Backspace across an empty marked block start merges same-mark text
without deleting both sides.

## #5811 Could not completely normalize the editor after 3150 iterations

Status: improved
Bucket: v2-core-engine
Confidence: high

Issue summary:
Custom normalization can wrap while built-in normalization unwraps, causing an
infinite loop or an unhelpful iteration-budget failure.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads --numbers 5811 --include-closed --json ianstormtaylor/slate`.
- neighbor sweep connects #5811 to #3950 and normalization rerun pressure:
  `gitcrawl neighbors --number 5811 --limit 20 --json ianstormtaylor/slate`.
- live v2 normalization owns dirty passes and loop detection in
  `.tmp/slate-v2/packages/slate/src/editor/normalize.ts`.
- next plan:
  `docs/plans/2026-05-07-slate-v2-core-structural-delete-normalization-ralplan.md`.
- focused core proof:
  `.tmp/slate-v2/packages/slate/test/normalization-contract.ts`.
- execution checkpoint:
  `.tmp/completion-checks/slate-v2-core-structural-delete-normalization-execution.md`.

Decision:
Claim `Improves #5811`. The package proof detects a custom normalization
oscillation with the deterministic fixpoint error instead of exhausting a huge
iteration budget. Conflicting app normalizers still need app/schema correction.

PR-description text:
Improves #5811: Custom normalization oscillation fails deterministically with a
fixpoint diagnostic instead of an unbounded normalization budget.

## #3950 Re-normalizing of transformed node

Status: fixed
Bucket: v2-core-engine
Confidence: high

Issue summary:
When normalization transforms a node, later normalizers can be skipped unless the
changed entry is reconsidered.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads --numbers 3950 --include-closed --json ianstormtaylor/slate`.
- live v2 normalization tracks mutation versions during passes in
  `.tmp/slate-v2/packages/slate/src/editor/normalize.ts`.
- next plan:
  `docs/plans/2026-05-07-slate-v2-core-structural-delete-normalization-ralplan.md`.
- focused core proof:
  `.tmp/slate-v2/packages/slate/test/normalization-contract.ts`.
- execution checkpoint:
  `.tmp/completion-checks/slate-v2-core-structural-delete-normalization-execution.md`.

Decision:
Claim `Fixes #3950`. The package proof transforms a node during custom
normalization, then rechecks it so a later normalizer can finish the normalized
state.

PR-description text:
Fixes #3950: Custom normalization rechecks a transformed node until later
normalizers reach fixpoint.

## #1654 Blocks should express that mergeBlock or splitBlock cannot cross their children and outside blocks

Status: improved
Bucket: v2-core-engine
Confidence: high

Issue summary:
Tables, title blocks, and similar containers need a generic way to stop
merge/split/delete from crossing a structural boundary.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads --numbers 1654 --include-closed --json ianstormtaylor/slate`.
- live v2 merge currently delegates a standalone merge-removal policy from
  `.tmp/slate-v2/packages/slate/src/transforms-node/merge-nodes.ts`.
- next plan:
  `docs/plans/2026-05-07-slate-v2-core-structural-delete-normalization-ralplan.md`.
- focused core proof:
  `.tmp/slate-v2/packages/slate/test/delete-contract.ts` and
  `.tmp/slate-v2/packages/slate/test/transforms-contract.ts`.
- implementation:
  `.tmp/slate-v2/packages/slate/src/transforms-text/delete-text.ts` and
  `.tmp/slate-v2/packages/slate/src/transforms-node/merge-nodes.ts`.
- execution checkpoint:
  `.tmp/completion-checks/slate-v2-core-structural-delete-normalization-execution.md`.

Decision:
Claim `Improves #1654`. Existing schema `isIsolating` is now honored by
collapsed Backspace and direct `mergeNodes`. Split-specific closure is still
unclaimed.

PR-description text:
Improves #1654: existing `isIsolating` policy blocks collapsed Backspace and
direct `mergeNodes` across protected containers; split-specific closure remains
unclaimed.

## #2643 Rejecting a change that violates schema

Status: related; not claimed
Bucket: v2-core-engine
Confidence: medium

Issue summary:
The request asks for a way to reject schema-invalid edits before normalization
changes the document.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads --numbers 2643 --include-closed --json ianstormtaylor/slate`.
- next plan:
  `docs/plans/2026-05-07-slate-v2-core-structural-delete-normalization-ralplan.md`.

Decision:
Do not add a public schema-veto API in this lane. First make core transforms and
normalization deterministic. A validation hook can be evaluated later with
transaction metadata and dry-run semantics.

PR-description text:
Related #2643: transaction validation pressure; no schema-veto API claim.

## #5972 In the inlines mode, deleting an input element also deletes preceding text

Status: fixes-claimed
Bucket: v2-core-engine
Confidence: high

Issue summary:
Deleting an editable inline input can also delete the preceding character.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads --numbers 5972 --include-closed --json ianstormtaylor/slate`.
- execution plan:
  `docs/plans/2026-05-07-slate-v2-inline-delete-boundary-repro-ralplan.md`.
- implementation:
  `.tmp/slate-v2/packages/slate/src/transforms-text/delete-text.ts`.
- core proof:
  `.tmp/slate-v2/packages/slate/test/delete-contract.ts`.
- browser proof:
  `.tmp/slate-v2/playwright/integration/examples/inlines.test.ts`.

Decision:
Claim `Fixes #5972`. The red browser row reproduced the issue: after clearing
the editable inline, Backspace deleted the preceding space and left the empty
inline boundary wrong. The model selection before Backspace was already inside
the empty inline, so the owner was core delete target planning. The fix routes
Backspace at the start of an empty editable inline to a path delete of that
inline, with selection falling back to the adjacent text point.

PR-description text:
Fixes #5972: Backspace from an empty editable inline in the inlines example
removes the inline without deleting the preceding character.

## #5977 IsOperation method does not handle custom operations

Status: fixes-claimed
Bucket: v2-api-dx
Confidence: high

Issue summary:
Custom operations can make editor validation fail when operation predicates only
accept built-in operation shapes.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads --numbers 5977 --include-closed --json ianstormtaylor/slate`.
- active plan:
  `docs/plans/2026-05-07-slate-v2-operation-extensibility-validation-ralplan.md`.
- live source:
  `.tmp/slate-v2/packages/slate/src/editor/is-editor.ts` now checks internal
  editor state rather than operation-list validity.
- implementation:
  `.tmp/slate-v2/packages/slate/src/core/public-state.ts` rejects unknown replay
  operation types before they enter the operation log.
- core proof:
  `.tmp/slate-v2/packages/slate/test/interfaces-contract.ts` proves
  `Editor.isEditor` and core path/string reads keep working when user code
  attaches a custom `operations` property, and
  `.tmp/slate-v2/packages/slate/test/operations-contract.ts` proves unknown
  operation replay fails closed.
- DOM proof:
  `.tmp/slate-v2/packages/slate-dom/test/bridge.ts` proves `DOMEditor.findPath`
  still resolves a Slate node when user code attaches a custom `operations`
  property to the editor.

Decision:
Claim `Fixes #5977`. v2 editor detection is internal-state based, so user
operation-list shape cannot make a real editor stop being an editor. Replay now
rejects unknown operation records before they can pollute history, refs,
collaboration, or DOM repair. The fix deliberately does not accept arbitrary
custom operations; app metadata belongs in update tags/commit metadata.

PR-description text:
Fixes #5977: Custom operation-like records no longer break editor detection or
DOM path lookup, and unknown operation replay fails before the record enters the
operation log.

## #5558 I think we will need Operation.isInsertNodeOperation, Operation.isMergeNodeOperation,...etc

Status: improves-claimed
Bucket: v2-api-dx
Confidence: high

Issue summary:
Slate users wanted concrete operation subtype guards instead of manually
switching on operation `type` or writing local casts.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads --numbers 5558 --include-closed --json ianstormtaylor/slate`.
- implementation:
  `.tmp/slate-v2/packages/slate/src/interfaces/operation.ts`.
- runtime proof:
  `.tmp/slate-v2/packages/slate/test/interfaces-contract.ts`.
- TypeScript proof:
  `.tmp/slate-v2/packages/slate/test/generic-operation-contract.ts`.

Decision:
Claim `Improves #5558`. v2 adds concrete built-in operation subtype guards for
all current operation kinds, including `replace_children` and
`replace_fragment`. This is not a custom-operation extension API and does not
make unknown operations valid.

PR-description text:
Improves #5558: `Operation` exposes concrete built-in operation subtype guards
with runtime and TypeScript narrowing proof.

## #3964 insertBreak bug

Status: fixes-claimed
Bucket: v2-core-engine
Confidence: high

Issue summary:
Pressing Enter at the end of a marked segment can leave the caret on the
original line instead of moving it to the new line.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads --numbers 3964 --include-closed --json ianstormtaylor/slate`.
- selected next plan:
  `docs/plans/2026-05-07-slate-v2-core-caret-movement-word-insert-break-ralplan.md`.
- package proof:
  `.tmp/slate-v2/packages/slate/test/snapshot-contract.ts` adds
  `insertBreak after marked text moves selection into the new block`.
- ready-now test candidate:
  `docs/slate-issues/test-candidate-map/4067-3949.md`.
- current owner:
  `.tmp/slate-v2/packages/slate/src/editor/insert-break.ts`;
  `.tmp/slate-v2/packages/slate/test/snapshot-contract.ts`.

Decision:
Claim `Fixes #3964`. The package proof splits at the end of marked text and
publishes selection in the created block.

PR-description text:
Fixes #3964: marked `insertBreak` creates the next block and places the
collapsed selection inside it.

## #3973 Transforms.move with word unit does not work

Status: fixes-claimed
Bucket: v2-core-engine
Confidence: high

Issue summary:
Word-unit movement can fail when the document starts with multiple leaves and no
preceding spaces.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads --numbers 3973 --include-closed --json ianstormtaylor/slate`.
- selected next plan:
  `docs/plans/2026-05-07-slate-v2-core-caret-movement-word-insert-break-ralplan.md`.
- package proof:
  `.tmp/slate-v2/packages/slate/test/transaction-contract.ts` adds
  `moves word selection across initial sibling text leaves`.
- ready-now test candidate:
  `docs/slate-issues/test-candidate-map/4067-3949.md`.
- current owner:
  `.tmp/slate-v2/packages/slate/src/editor/positions.ts`;
  `.tmp/slate-v2/packages/slate/src/transforms-selection/move.ts`;
  `.tmp/slate-v2/packages/slate/test/transforms/move/both/unit-word.tsx`.

Decision:
Claim `Fixes #3973`. The package proof moves by word across sibling text leaves
when the first word has no preceding space.

PR-description text:
Fixes #3973: word movement advances across initial sibling text leaves.

## #3499 Setting marks on selected word and moving it to new line has bugs

Status: fixes-claimed
Bucket: v2-core-engine
Confidence: high

Issue summary:
Moving marked text onto a new line and undoing must preserve mark and caret
state. Package proof now covers both halves: Enter moves the bold word into the
new paragraph with selection at the moved word start, and undo restores the
original marked paragraph plus selection.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 3499 --include-closed --json`.
- related neighbors checked:
  `gitcrawl neighbors ianstormtaylor/slate --number 3499 --limit 20 --json`.
- test candidate:
  `docs/slate-issues/test-candidate-map/3558-3435.md`.
- previous caret plan:
  `docs/plans/2026-05-07-slate-v2-core-caret-movement-word-insert-break-ralplan.md`.
- active history plan:
  `docs/plans/2026-05-07-slate-v2-marked-enter-undo-caret-ralplan.md`.
- completion checkpoint:
  `.tmp/completion-checks/slate-v2-marked-enter-undo-caret-ralplan.md`.
- package proof owner:
  `.tmp/slate-v2/packages/slate-history/test/history-contract.ts`;
  `.tmp/slate-v2/packages/slate/src/transforms-node/split-nodes.ts`;
  `.tmp/slate-v2/packages/slate/test/snapshot-contract.ts`.
- verification:
  `bun test ./packages/slate-history/test/history-contract.ts -t "marked Enter undo"`;
  `bun test ./packages/slate-history/test/history-contract.ts`;
  `bun test ./packages/slate/test/snapshot-contract.ts`;
  `bun --filter slate-history typecheck`;
  `bun --filter slate typecheck`;
  `bun lint:fix`.

Decision:
Claim `Fixes #3499`. The exact package proof covers marked Enter caret
placement and undo mark restoration. `#3756` remains only a broader related
history-selection guard.

PR-description text:
Fixes #3499: marked Enter before a bold word moves the word to the new block
and undo restores the marked paragraph and selection.

## #4357 When caret is at end of a mark and pressed enter, Slate adds new block but doesn't focuses on the new block

Status: fixes-claimed
Bucket: v2-core-engine
Confidence: high

Issue summary:
Pressing Enter at the end of marked text creates a block but fails to focus the
created block.

Evidence:

- related through `#3964` neighbors:
  `gitcrawl neighbors ianstormtaylor/slate --number 3964 --limit 15 --json`.
- test candidate:
  `docs/slate-issues/test-candidate-map/4390-4269.md`.
- selected caret plan:
  `docs/plans/2026-05-07-slate-v2-core-caret-movement-word-insert-break-ralplan.md`.
- package proof:
  `.tmp/slate-v2/packages/slate/test/snapshot-contract.ts` adds
  `insertBreak after marked text moves selection into the new block`.

Decision:
Claim `Fixes #4357`. The exact marked-end Enter repro is proven by the same
package test as #3964.

PR-description text:
Fixes #4357: Enter at the end of a marked leaf focuses the created block.

## #4195 Inconsistent cursor position after return key pressed

Status: related
Bucket: v2-core-engine
Confidence: medium

Issue summary:
Return key near marked leaf edges can leave the caret in an inconsistent
position.

Evidence:

- related through `#3964` neighbors:
  `gitcrawl neighbors ianstormtaylor/slate --number 3964 --limit 15 --json`.
- test candidate:
  `docs/slate-issues/test-candidate-map/4268-4162.md`.
- selected caret plan:
  `docs/plans/2026-05-07-slate-v2-core-caret-movement-word-insert-break-ralplan.md`.

Decision:
Keep related. It belongs to the same return-key caret family, but exact closure
depends on matching repro proof.

PR-description text:
Related #4195: return-key caret placement pressure; no fixed claim without exact
repro proof.

## #3841 Transforms.move in insertBreak override not moving forward in Firefox

Status: related
Bucket: v2-core-engine
Confidence: medium

Issue summary:
A custom `insertBreak` override calls movement logic and fails to move forward
in Firefox.

Evidence:

- related through `#3973` and `#3964` neighbors:
  `gitcrawl neighbors ianstormtaylor/slate --number 3973 --limit 15 --json`;
  `gitcrawl neighbors ianstormtaylor/slate --number 3964 --limit 15 --json`.
- test candidate:
  `docs/slate-issues/test-candidate-map/3878-3798.md`.
- browser word movement proof currently skips Firefox:
  `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts`.

Decision:
Keep related. Package movement proof can improve the model path, but a
Firefox-specific claim needs Firefox browser proof.

PR-description text:
Related #3841: custom `insertBreak` and word movement overlap; Firefox closure
is not claimed without browser proof.

## #5629 Cursor navigation issue

Status: related
Bucket: v2-core-engine
Confidence: medium

Issue summary:
Word navigation around punctuation and bracket-like text can move to surprising
positions.

Evidence:

- related through `#3973` neighbors:
  `gitcrawl neighbors ianstormtaylor/slate --number 3973 --limit 15 --json`.
- test candidate:
  `docs/slate-issues/test-candidate-map/5655-5559.md`.
- selected caret plan:
  `docs/plans/2026-05-07-slate-v2-core-caret-movement-word-insert-break-ralplan.md`.

Decision:
Keep related. This is adjacent word-navigation pressure, but punctuation policy
is not the same as `#3973` multi-leaf projection.

PR-description text:
Related #5629: word navigation pressure; no punctuation-policy closure in the
multi-leaf movement lane.

## #4648 Editor.before word unit counts `$` as a word character

Status: not claimed
Bucket: v2-core-engine
Confidence: medium

Issue summary:
Users expect different word-boundary behavior around punctuation.

Evidence:

- related through `#3973` neighbors:
  `gitcrawl neighbors ianstormtaylor/slate --number 3973 --limit 15 --json`.
- local triage marks it not a direct test candidate:
  `docs/slate-issues/test-candidate-map/4741-4643.md`.
- selected caret plan:
  `docs/plans/2026-05-07-slate-v2-core-caret-movement-word-insert-break-ralplan.md`.

Decision:
Do not claim. The current lane fixes projection across leaves, not a new
punctuation classifier policy.

PR-description text:
Not claimed #4648: punctuation policy remains outside the multi-leaf word
movement fix.

## #3891 Removing multiple nodes at the same time

Status: related
Bucket: v2-core-engine
Confidence: medium

Issue summary:
Users want to remove a range of top-level nodes without manually adjusting paths
after every remove.

Evidence:

- live gitcrawl checked:
  `gitcrawl threads --numbers 3891 --include-closed --json ianstormtaylor/slate`.
- current range-delete plan already proves child-window replacement as a model
  primitive:
  `docs/plans/2026-05-06-slate-v2-range-delete-replace-children-ralplan.md`.
- next plan:
  `docs/plans/2026-05-07-slate-v2-core-structural-delete-normalization-ralplan.md`.

Decision:
Keep related. `replace_children` is the right substrate, but public
remove-range helper semantics need their own proof and API decision.

PR-description text:
Related #3891: multi-node remove-range pressure; no helper API claim.

## #5080 Editor.nodes reverse true only partially reverses output

Status: fixes-claimed
Bucket: v2-core-engine
Confidence: high

Issue summary:
`Editor.nodes(..., { reverse: true })` returns a mixed traversal order when
nested matches are present. It reverses sibling order but still yields parents
before nested matched descendants.

Evidence:

- live GitHub checked:
  `gh issue view 5080 --repo ianstormtaylor/slate --comments --json number,title,state,body,comments,labels,url,updatedAt`.
- gitcrawl thread checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 5080 --include-closed --json`.
- current v2 source:
  `.tmp/slate-v2/packages/slate/src/editor/nodes.ts`;
  `.tmp/slate-v2/packages/slate/src/interfaces/node.ts`;
  `.tmp/slate-v2/packages/slate/src/core/public-state.ts`.
- live v2 probe in the active plan:
  `docs/plans/2026-05-07-slate-v2-editor-nodes-reverse-order-ralplan.md`.

Decision:
Claim `Fixes #5080`. The current v2 read API now proves that
`state.nodes.entries({ reverse: true })` returns the exact reverse of the forward
matched entry list for nested matching entries.

PR-description text:
Fixes #5080: `state.nodes.entries({ reverse: true })` returns the exact reverse
of the forward matched entry order for nested matching entries.

## #5684 SlateEditor.nodes match issue

Status: related
Bucket: needs-repro
Confidence: low

Issue summary:
The report gestures at `SlateEditor.nodes` and match traversal but does not give
a concrete document shape, match predicate, or expected yielded path.

Evidence:

- live GitHub checked:
  `gh issue view 5684 --repo ianstormtaylor/slate --comments --json number,title,state,body,comments,labels,url,updatedAt`.
- gitcrawl thread and neighbors checked:
  `gitcrawl threads ianstormtaylor/slate --numbers 5080,5684 --include-closed --json`;
  `gitcrawl neighbors ianstormtaylor/slate --number 5684 --limit 20 --json`.
- local dossier says the row is too vague to trust:
  `docs/slate-issues/open-issues-dossiers/5760-5666.md`.
- local test candidate map marks it `blocked-on-repro`:
  `docs/slate-issues/test-candidate-map/5760-5666.md`.

Decision:
Keep related, not fixed. It belongs to the same broad query traversal API
family, but `#5080` has a precise reverse-order contract while `#5684` still
needs a repro.

PR-description text:
Related #5684: `SlateEditor.nodes` match traversal ambiguity remains
repro-first; no fixed claim from the reverse-order lane.

## #5028 EditorNodesOptions need pass args

Status: related
Bucket: v2-api-dx
Confidence: medium

Issue summary:
The issue asks for a `pass` predicate so callers can skip subtrees during node
traversal.

Evidence:

- local dossier marks the issue valid but not a direct test candidate:
  `docs/slate-issues/open-issues-dossiers/5064-4971.md`;
  `docs/slate-issues/test-candidate-map/5064-4971.md`.
- current v2 source already exposes `pass` on traversal options:
  `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`;
  `.tmp/slate-v2/packages/slate/src/interfaces/node.ts`;
  `.tmp/slate-v2/packages/slate/src/editor/nodes.ts`.

Decision:
Keep related. The current v2 shape already carries the `pass` predicate, but
the `#5080` plan owns reverse traversal order only. Do not turn this lane into a
pass-filtering docs or API claim.

PR-description text:
Related #5028: traversal `pass` predicate pressure is represented in current
v2 options, but the #5080 lane only owns reverse traversal order.

## #3885 Docs: Editor.nodes relates to the current selection

Status: not-claimed
Bucket: docs-examples
Confidence: medium

Issue summary:
The issue asks docs to make `Editor.nodes` selection-relative behavior clearer.

Evidence:

- local dossier marks the docs issue valid:
  `docs/slate-issues/open-issues-dossiers/3948-3881.md`.
- local test candidate map marks it docs-only:
  `docs/slate-issues/test-candidate-map/3948-3881.md`.
- current #5080 plan targets traversal order, not docs/examples:
  `docs/plans/2026-05-07-slate-v2-editor-nodes-reverse-order-ralplan.md`.

Decision:
Do not claim. The reverse-order lane can use clear test names, but it is not a
docs/examples fix for selection-relative API wording.

PR-description text:
Not claimed #3885: selection-relative `Editor.nodes` docs remain outside the
reverse traversal fix.

## Mobile/IME macro sync - 2026-05-07 Slate Ralplan

Status: macro-routed
Bucket: v2-input-runtime
Confidence: medium-high

Scope:
This section records the fork-local accounting sync for the Mobile/IME macro
Ralplan, not an upstream issue comment and not a closure claim. The active plan
is `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md`.

Issue summary:
The reviewed surface is the frozen R7 input/composition/IME runtime set:
`149` rows, all already `cluster-synced` in the source issue corpus. The plan
routes that set through Slate v2's shared input runtime, `slate-dom` bridge,
composition state, Android manager, selection import/export, repair, and
browser/device proof gates.

Evidence:

- active plan routing table:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md`.
- issue coverage matrix sync:
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
- live gitcrawl mirror and cluster overlay:
  `docs/slate-issues/gitcrawl-live-open-ledger.md` and
  `docs/slate-issues/gitcrawl-clusters.md`.
- PR-body source:
  `docs/slate-v2/references/pr-description.md`.

Decision:
Keep this as `macro-routed`. No new `Fixes #...` or `Improves #...` claim is
legal from this planning pass. The matrix backfills `#5711`, `#3634`, and
`#4961` as related rows. The stale dossier statuses for `#6022`, `#5983`,
`#5183`, and `#5088` are aligned down to `related` because the current Mobile
IME plan does not carry exact matching device/browser proof for those rows.

The `44` long-form rows remain proof-route backlog, not PR auto-close text:
`#5891`, `#5836`, `#5805`, `#5680`, `#5666`, `#5653`, `#5493`, `#5375`,
`#5371`, `#5291`, `#5175`, `#5173`, `#5167`, `#3873`, `#3695`, `#3611`,
`#3587`, `#5099`, `#5083`, `#5078`, `#5034`, `#5023`, `#4959`, `#4861`,
`#4770`, `#4719`, `#4693`, `#4640`, `#4602`, `#4543`, `#4531`, `#4521`,
`#4372`, `#4354`, `#4353`, `#4269`, `#4232`, `#4136`, `#4085`, `#4031`,
`#4030`, `#3943`, `#3942`, and `#3882`.

The remaining routed rows stay matrix-only until a later execution batch gives
them exact repro mapping and proof. Device-specific closure still requires
matching raw Android, iOS, Firefox Android, Samsung Keyboard, voice input, or
Windows IME artifacts.

PR-description text:
Mobile/IME macro accounting: `149` frozen R7 input-runtime rows reviewed; no
new exact fixed or improved claim; exact mobile/IME closure remains gated on
matching browser or raw-device proof.

## All-Harvest PM-10/PM-09 Input Runtime Sync - 2026-05-10

Status: macro-routed
Bucket: v2-input-runtime
Confidence: medium-high

Scope:
This is the ClawSweeper related-issue pass for the first ProseMirror rows in
`docs/plans/2026-05-10-slate-v2-all-editor-harvest-test-processing-ralplan.md`.
It covers PM-10 composition lifecycle and PM-09 DOM-change disambiguation. It
does not add an upstream issue comment, PR claim, fixed count, or improved
count.

Archive evidence:

- `gitcrawl doctor --json` reported gitcrawl `0.2.1`, local archive data
  present, no GitHub token, and last sync at `2026-05-04T14:58:11.123944Z`.
- Archive searches for composition, IME, beforeinput, Android input, DOM
  change, and selection found the existing input-runtime pressure set.
- Thread reads covered `#6051`, `#6022`, `#5989`, `#5984`, `#5983`, `#5931`,
  `#5918`, `#5974`, `#4400`, `#5883`, `#4466`, `#3309`, `#4223`, `#3470`,
  and `#2051`.

Decision:
Keep this pass as related issue accounting only. The PM-10 and PM-09 harvest
rows justify the next implementation owner, not issue promotion. Existing
related or non-claim statuses remain correct for `#6051`, `#6022`, `#5989`,
`#5984`, `#5983`, `#5931`, `#5830`, `#5643`, `#5883`, `#4400`, `#5603`,
`#5669`, `#4223`, `#3470`, and `#2051`.

`#4466`, `#5493`, `#5974`, and `#5918` remain proof-needed or future-proof
pressure until a matching browser, keyboard-layout, or IME reproduction lands.
`#3309` is not part of the PM-10/PM-09 closure path; route it to the PM-12/PM-13
projection and browser-selection slices.

The next legal execution move is PM-10 composition proof in current
`.tmp/slate-v2` source. Exact Android, Firefox Android, Samsung Keyboard, voice
input, Windows suggestion, Hangul, Chinese, Vietnamese, or Japanese/Korean IME
closure still needs matching browser or raw-device artifacts.

PR-description text:
All-harvest PM-10/PM-09 accounting: related input-runtime and DOM-change issues
reviewed; no new exact fixed or improved claim; implementation starts with
composition lifecycle proof.

## DOM Selection / Focus Bridge Planning Sync - 2026-05-08

This is ClawSweeper issue discovery for
`docs/plans/2026-05-08-slate-v2-dom-selection-focus-bridge-ralplan.md`. It adds
no fixed issue claims. It exists to stop the DOM selection lane from redoing the
closed #4789/#4984 proof and to route the remaining issue surface correctly.

### Revision Issue-Sync Accounting - 2026-05-08

No new `Fixes #...` or `Improves #...` PR claim is legal from the DOM
selection/focus revision pass. The concrete implementation phases in
`docs/plans/2026-05-08-slate-v2-dom-selection-focus-bridge-ralplan.md` keep the
same issue policy:

- existing fixed floor: #4789 and #4984 stay fixed by the closed
  2026-05-06 boundary proof, not by this second lane;
- improves: #5947 stays improves-only until exact parent/child editor proof
  lands;
- related: #5867, #5538, #5568, #5711, #3634, #4961, #5806, #5690, #5689,
  #4995, #5632, #5559, #3909, #3893, #5524, #5749, #5107, #4337, #4088,
  #3918, and #4643 stay related until the matching phase proof exists;
- not claimed: #2558, #5550, #5551, #5924, and #4851 stay outside exact PR
  closure for this lane.

`docs/slate-issues/gitcrawl-live-open-ledger.md` is a generated live-field
mirror, so this pass does not edit it. `docs/slate-v2/references/pr-description.md`
also stays unchanged because the fixed issue count does not change.

## #5947 `DOMEditor.toSlatePoint` could find a point in a parent editor

Status: improves-claimed
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Nested or read-only editor DOM can make `DOMEditor.toSlatePoint` walk into a
parent editor and resolve a point through global DOM/node maps.

Evidence:

- ledger row: live gitcrawl singleton, open issue.
- related issues: #4842 and #4984 cover nested editor DOM ownership; cluster 1
  covers broader DOM point resolution crashes.
- duplicate/stale/invalid proof: not a duplicate; the parent-editor bleed is
  the specific issue.
- live GitHub checked: yes, live-gitcrawl-only via
  `gitcrawl threads ianstormtaylor/slate --numbers 5947 --include-closed --json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-dom/test/bridge.ts`,
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`, and
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`.

Decision:
Keep `Improves #5947`. Current v2 bridge ownership rejects foreign
path-tagged nodes and uses mounted path/runtime metadata, but this plan must add
an exact parent/child browser or unit repro before it can promote to
`fixes-claimed`.

PR-description text:
Improves #5947: nested editor DOM ownership is represented by the DOM bridge,
but exact parent-editor point bleed closure still needs focused proof.

## #5867 Calling DOMEditor.focus(editor) when a mention is selected causes the selection to be lost.

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Calling `DOMEditor.focus(editor)` while a mention or other inline void is
selected can collapse selection back to the start.

Evidence:

- ledger row: live gitcrawl singleton, open issue.
- related issues: #5826 and #5538 cover focus/scroll restoration; #5806 covers
  custom inline selection import.
- duplicate/stale/invalid proof: not a duplicate; selected-inline focus restore
  is the specific behavior.
- live GitHub checked: yes, live-gitcrawl-only via
  `gitcrawl threads ianstormtaylor/slate --numbers 5867 --include-closed --json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`,
  `.tmp/slate-v2/playwright/integration/examples/mentions.test.ts`, and
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-controller.ts`.

Decision:
Keep as `cluster-synced`. It is a DOM focus/selection bridge issue with a clear
future proof route, but no exact selected-mention focus row is claimed yet.

PR-description text:
Related #5867: selected inline mention focus restore belongs to the DOM
focus/selection bridge; no exact closure.

## #5538 Slate editor scrolls on focus.

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Programmatic focus plus selecting the end of the editor can scroll an embedded
or whiteboard-like editor unexpectedly.

Evidence:

- ledger row: live gitcrawl singleton, open issue.
- related issues: #5826 is the long-editor refocus autoscroll member; #5882 is
  an upstream PR claiming a #5826 fix.
- duplicate/stale/invalid proof: related, not duplicate; #5538 is the
  programmatic select-on-focus variant.
- live GitHub checked: yes, live-gitcrawl-only via
  `gitcrawl threads ianstormtaylor/slate --numbers 5538 --include-closed --json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`,
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`, and
  `.tmp/slate-v2/packages/slate-react/test/app-owned-customization.tsx`.

Decision:
Keep as `cluster-synced`. Focus/scroll behavior is the right runtime owner, but
the whiteboard/readOnly toggle repro is not closed without a browser row.

PR-description text:
Related #5538: focus scroll restoration belongs to DOM focus and
scroll-selection ownership; no exact closure.

## #5568 Regression in ReactEditor.focus since 0.101.0

Status: issue-reviewed
Bucket: v2-react-runtime
Confidence: medium

Issue summary:
`ReactEditor.focus(editor)` after external value initialization can blank or
destabilize the editor in the historical React runtime path.

Evidence:

- ledger row: live gitcrawl singleton, open issue.
- related issues: #3497, #5537, #4961, and #3634 cover adjacent React focus
  timing and programmatic focus behavior.
- duplicate/stale/invalid proof: not a duplicate; empty-initial-value focus is
  the specific report.
- live GitHub checked: yes, live-gitcrawl-only via
  `gitcrawl threads ianstormtaylor/slate --numbers 5568 --include-closed --json`.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/test/react-editor-contract.tsx` and
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`.

Decision:
Keep as `issue-reviewed`. It belongs more to React runtime initialization than
pure DOM selection. The DOM selection plan should keep it as adjacent pressure
unless the focus implementation changes the exact behavior.

PR-description text:
Related #5568: React focus initialization has current contracts, but exact
empty-initial-value focus closure is not claimed.

## #2558 Unable to select multiple cells of the table

Status: not-claimed
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
The issue asks for multi-cell table selection behavior, not merely for DOM point
containment or no-crash table selection imports.

Evidence:

- ledger row: live gitcrawl singleton, open issue.
- related issues: #6034, #5355, and #4658 cover table boundary/DOM selection
  pressure, but not a full table selection model.
- duplicate/stale/invalid proof: not invalid; it is outside the current raw
  Slate DOM bridge closure target.
- live GitHub checked: yes, live-gitcrawl-only via
  `gitcrawl threads ianstormtaylor/slate --numbers 2558 --include-closed --json`.
- current v2 proof:
  `.tmp/slate-v2/playwright/integration/examples/tables.test.ts` and
  `docs/editor-test-harvester/lexical/report.md`.

Decision:
Do not claim #2558 from this lane. Existing and planned DOM selection rows can
prove containment and no-crash behavior, but multi-cell selection requires an
explicit table selection model decision.

PR-description text:
None; detailed ledger only.

## #5894 Inconsistent link exit behavior with space key when link is within elements (paragraph, heading, etc.), not at the end

Status: not-claimed
Bucket: ecosystem-boundary
Confidence: medium

Issue summary:
The thread describes link exit behavior when pressing space inside nested
block/link contexts. The frozen corpus routes it as plugin/presentation policy,
not a current raw core regression.

Evidence:

- ledger row: `docs/slate-issues/open-issues-ledger.md`, stale-candidate,
  `triage-closed`, ecosystem/current-API owner.
- test candidate map: `docs/slate-issues/test-candidate-map/5912-5771.md`
  marks it `not-a-test-candidate`.
- Lexical pressure:
  `docs/editor-test-harvester/lexical/slate-processing-ledger.md` routes link
  and autolink rows as source-drilling candidates for raw inline behavior only.
- current v2 proof: none for this exact link-exit policy.

Decision:
Keep as `not-claimed`. A later Lexical Links apply slice may add raw inline
boundary proof, but it must not smuggle product-level link-exit policy into raw
Slate.

PR-description text:
None; detailed ledger only.

## #4730 select all and backspace for image at the end selection

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Select-all then Backspace in the images example with a trailing image should
not leave invalid selection or deletion state.

Evidence:

- ledger row: `docs/slate-issues/open-issues-ledger.md`, likely-valid,
  `cluster-synced`, selection/model owner.
- test candidate map: `docs/slate-issues/test-candidate-map/4741-4643.md`
  marks it `ready-now`.
- related existing proof: #3991 and #4301 cover selected block void keyboard
  behavior, while #2500 covers list-heavy full-document delete.
- Lexical pressure:
  `docs/editor-test-harvester/lexical/slate-processing-ledger.md` routes image
  void, selection, and delete rows as refactor-existing candidates.

Decision:
Keep as `cluster-synced`. The issue is adjacent to structural delete and
void-tail handling, but the exact images-example select-all repro is not
replayed here.

PR-description text:
Related #4730: select-all delete around trailing image/void content is related
selection and structural-delete pressure; no exact closure.

## #3387 cross-browser differences when selecting a paragraph and trying to type

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Triple-click paragraph selection followed by typing should replace the selected
paragraph consistently across browsers.

Evidence:

- ledger row: `docs/slate-issues/open-issues-ledger.md`, likely-valid,
  `cluster-synced`, browser-input/DOM bridge owner.
- test candidate map: `docs/slate-issues/test-candidate-map/3433-3317.md`
  marks it `ready-with-minor-setup`.
- related existing proof: #3871 and #5847 cover triple-click import and
  selected-block Backspace, but not paragraph-selection-then-typing
  replacement.
- Lexical pressure:
  `docs/editor-test-harvester/lexical/slate-processing-ledger.md` routes
  Selection rows as refactor-existing candidates.

Decision:
Keep as `cluster-synced`. It is a real browser behavior row, but exact closure
needs a focused typing replacement proof, not only selection import proof.

PR-description text:
Related #3387: triple-click selection followed by typing belongs to DOM
selection/browser-input ownership; no exact closure.

## #3872 Triple clicking a paragraph that includes an inline element does not select the whole paragraph

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
Triple-clicking a paragraph with inline children should select the full
paragraph rather than stopping at inline boundaries.

Evidence:

- ledger row: `docs/slate-issues/open-issues-ledger.md`, valid,
  `cluster-synced`, DOM selection bridge owner.
- test candidate map: `docs/slate-issues/test-candidate-map/3878-3798.md`
  marks it `ready-with-minor-setup`.
- related existing proof: #3871 covers clicked-block import without leaking
  into the following block, but this issue is the inline-child full-paragraph
  selection variant.
- Lexical pressure:
  `docs/editor-test-harvester/lexical/slate-processing-ledger.md` routes
  selection and inline rows as refactor-existing candidates.

Decision:
Keep as `cluster-synced`. It should become a browser proof row only if the
implementation slice explicitly targets triple-click inline-child selection.

PR-description text:
Related #3872: triple-click selection with inline children belongs to DOM
selection bridge proof; no exact closure.

## Performance/Scalability Macro Planning Sync - 2026-05-08

This is planning/accounting sync for
`docs/plans/2026-05-08-slate-v2-performance-scalability-slate-issues-ralplan.md`.
It adds no fixed issue claims and no new improved issue claims. Exact
performance closure still needs the matching benchmark, browser, retained-memory,
or maintainer-equivalence proof named in the plan.

| Route                               | Count | Issues                                                                                                              | Claim policy                                                                                              |
| ----------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Existing dossier and matrix rows    |    13 | `#6038`, `#3656`, `#4141`, `#5131`, `#3430`, `#5945`, `#4056`, `#5992`, `#3752`, `#2195`, `#2405`, `#4483`, `#2051` | Preserve current `Improves`, `Related`, and `Not claimed` statuses; no promotion from this planning pass. |
| Existing macro/future-proof rows    |     7 | `#5433`, `#5420`, `#5274`, `#4317`, `#3354`, `#3926`, `#5697`                                                       | Keep as future proof pressure or guard rows; no PR auto-close text.                                       |
| Performance proof-route backlog     |    10 | `#2733`, `#2669`, `#790`, `#5216`, `#5592`, `#4202`, `#4210`, `#3748`, `#5349`, `#4025`                             | Related, proof-needed, or needs-repro until a later execution slice adds exact proof.                     |
| Policy/API/accessibility non-claims |     4 | `#2465`, `#2564`, `#3892`, `#2572`                                                                                  | Keep out of fixed/improved performance language; these are DX, ecosystem, or release-guard pressure only. |
| PR prose sync                       |     3 | `#5945`, `#4056`, `#5992`                                                                                           | Existing PR text remains exact. No new PR performance text is added by this planning pass.                |

## All-Harvest PM-08 Collaboration Convergence Sync - 2026-05-10

This is planning/accounting sync for
`docs/plans/2026-05-10-slate-v2-all-editor-harvest-test-processing-ralplan.md`.
It reviews the ProseMirror PM-08 collaboration pressure against current Slate v2
proof and adds no PR-facing fixed or improved issue claim.

Evidence:

- ProseMirror harvest row:
  `docs/editor-test-harvester/prosemirror/report.md`, PM-08.
- current v2 proof:
  `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts` now
  includes three-peer replay convergence for text, mark, range-delete, and move
  commits, with remote collaboration metadata skipping local undo history.
- verification:
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun test ./packages/slate/test/collab-history-runtime-contract.ts`.
- type/lint proof:
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun turbo typecheck --filter=./packages/slate`;
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bunx biome check packages/slate/test/collab-history-runtime-contract.ts --fix`.

| Issue | Status after PM-08  | Decision                                                                                                                                                                                                |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #5771 | Related             | The new PM-08 row proves core package replay convergence, but not the issue's high-QPS remote `insert_text` versus local selection repro. Keep exact closure for a later collaboration-selection proof. |
| #5533 | Related             | Operation replay is a better primitive than a Yjs-only story, but Slate still does not ship a first-party OT/Yjs-free collaboration protocol.                                                           |
| #2288 | Improves, unchanged | Range-delete replay now has explicit three-peer package proof, but public range-operation exposure remains a separate API decision.                                                                     |
| #1770 | Related             | Replay convergence reduces operation-transport pressure, but it is not a general operation-composition utility.                                                                                         |
| #3741 | Related             | Remote `move_node` replay convergence is covered, but Slate still does not add moved-node payloads to serialized `move_node` operations.                                                                |

Decision:
Keep PM-08 as core package proof only. Do not claim slate-yjs browser behavior,
OT transform closure, simultaneous typing rebasing, or high-QPS selection
stability from this row.

PR-description text:
None; no PR-facing claim count changes.

## #3802 Explain a quirk with reference to node objects

Status: planning-reviewed
Bucket: v2-api-dx
Confidence: medium

Issue summary:
The issue is API and documentation pressure around object identity, node
references, and why duplicating or reusing node objects can produce surprising
behavior.

Evidence:

- live gitcrawl row: singleton open issue, `path-identity-and-node-reference-rules`.
- current manual row:
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`.
- issue coverage row:
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
- current R11 requirement:
  `docs/slate-issues/requirements-from-issues.md#r11-tighten-the-public-api-and-type-surface`.
- active planning owner:
  `docs/plans/2026-05-16-slate-v2-unified-extension-composition-ralplan.md`.
- future proof owner:
  `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`.

Decision:
Keep as `Related`, not fixed or improved. The unified extension composition
plan directly targets public API/type/extension DX by removing public wrapper
composition, `withEditor`, and public author-facing `editor.extend` from the
taught author path. That is the right architectural direction for #3802-style
DX pressure, but exact closure needs implementation proof: stale public wrapper
surfaces gone, creation-time extension types inferred, and public-surface
contracts passing.

PR-description text:
Synced during the issue/reference pass. The PR reference now points authors to
creation-time `extensions`, replayable `state` / `tx`, and installed
`editor.api` handles, with no new fixed or improved issue claim.

## Render Element Extension DX Ralplan - 2026-05-16

Plan:

- `docs/plans/2026-05-16-slate-v2-render-element-extension-dx-ralplan.md`

Touched surface:

- `Editable` raw render props
- `editableRenderers(...)` extension capability
- first-party example renderer ownership
- `RenderElementProps` and example renderer typing

Evidence:

- `.tmp/slate-v2/packages/slate-react/src/editable/editable-renderers.ts`
- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`
- `.tmp/slate-v2/docs/libraries/slate-react/editable.md`
- `.tmp/slate-v2/docs/concepts/09-rendering.md`
- `.tmp/slate-v2/site/examples/ts/check-lists.tsx`
- `.tmp/slate-v2/site/examples/ts/images.tsx`
- `.tmp/slate-v2/site/examples/ts/embeds.tsx`
- `.tmp/slate-v2/site/examples/ts/inlines.tsx`

| Issue   | Status after pass          | Decision                                                                                                                                                         |
| ------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#3177` | Related, planning-reviewed | Registered renderers answer the plugin-layer composition direction, but current first-party examples still need cleanup before any closure or improvement claim. |
| `#5349` | Related, blocked-on-repro  | Renderer consistency does not prove the empty-editor render churn report. Keep repro-first.                                                                      |
| `#4317` | Related, unchanged         | Registered renderers reduce callback identity pressure, but the exact `onSelect` render-callback repro still needs browser proof.                                |

Decision:
No new `Fixes` or `Improves` issue claims. Keep PR fixed and improved issue
counts unchanged.

## Native Beforeinput Semantic Command Handler - 2026-05-14

Plan:

- `docs/plans/2026-05-14-slate-v2-callback-memoization-dx-ralplan.md`

Touched surface:

- `Editable.onDOMBeforeInput` raw native escape hatch
- `Editable.onCommand` semantic command handler
- native `format*` beforeinput and format-hotkey command classification
- native input listener callback stability

Evidence:

- `.tmp/slate-v2/packages/slate-react/test/editing-kernel-contract.ts`
- `.tmp/slate-v2/packages/slate-react/test/editable-behavior.tsx`
- `.tmp/slate-v2/packages/slate-react/test/input-router-contract.test.tsx`
- `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`
- `.tmp/slate-v2/playwright/integration/examples/hovering-toolbar.test.ts`
- `.tmp/slate-v2/docs/libraries/slate-react/editable.md`
- `bun --filter slate-react typecheck`
- `bun --filter slate-react test`
- `bun check`

| Issue   | Status after pass            | Decision                                                                                                                                                                                           |
| ------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#3568` | Related, materially improved | App formatting still has a runtime-owned native-format path, but raw Slate no longer exposes public `onCommand` / `EditableCommand*`. No exact closure until the original crash repro is replayed. |
| `#3586` | Related, materially improved | Native format handling stays runtime-owned after the public `onCommand` cut. No exact DOMPoint crash closure until the original repro is replayed.                                                 |
| `#4681` | Related, unchanged           | Raw `onDOMBeforeInput` remains an escape hatch, but paste-specific `onDOMBeforeInput` behavior is not claimed.                                                                                     |
| `#5181` | Related, materially improved | Native input listeners read latest handlers without reattaching on prop changes, but the exact stale `onChange` / editor replacement callback bug is not closed.                                   |
| `#4317` | Related, unchanged           | Render callback selection churn is adjacent callback identity pressure; this lane only proves native input listener stability.                                                                     |

Decision:
No new `Fixes` issue claims. Keep PR fixed issue count unchanged.

## Example Memoization Hard-Cut Sync - 2026-05-14

Plan:

- `docs/plans/2026-05-14-slate-v2-example-memoization-hard-cut-ralplan.md`

Touched surface:

- registered `Editable` renderers through `editableRenderers(...)`
- extension key commands through `editableKeyCommands(...)`
- command/rule examples that previously needed callback or array memoization
- rendering-strategy option normalization
- annotation/widget projector overloads
- lazy initial-state docs for localStorage-backed content

Evidence:

- `.tmp/slate-v2/packages/slate-react/test/surface-contract.test.tsx`
- `.tmp/slate-v2/packages/slate-react/test/keyboard-input-strategy-contract.test.ts`
- `.tmp/slate-v2/packages/slate-react/test/annotation-store-contract.test.tsx`
- `.tmp/slate-v2/packages/slate-react/test/widget-layer-contract.test.tsx`
- `.tmp/slate-v2/docs/libraries/slate-react/editable.md`
- `.tmp/slate-v2/docs/concepts/09-rendering.md`
- `.tmp/slate-v2/site/examples/ts/code-highlighting.tsx`
- `.tmp/slate-v2/site/examples/ts/iframe.tsx`
- `.tmp/slate-v2/site/examples/ts/images.tsx`
- `.tmp/slate-v2/site/examples/ts/markdown-shortcuts.tsx`
- `.tmp/slate-v2/site/examples/ts/richtext.tsx`
- `.tmp/slate-v2/site/examples/ts/tables.tsx`

| Issue   | Status after pass               | Decision                                                                                                                                                                   |
| ------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#4317` | Related, improved pressure only | Registered renderers remove beginner render-callback identity pressure, but the exact `onSelect` render-callback repro still needs browser proof before any closure claim. |
| `#5181` | Related, unchanged              | Projector overloads and key-command registration reduce memoization ceremony, but they do not replay the stale `onChange` / editor replacement callback bug.               |

Decision:
No new `Fixes` or `Improves` issue claims. Keep PR fixed issue count and
improved issue count unchanged.

## udecode/slate#9 History Selection Precondition Regression Refresh

Date: 2026-05-13

Bucket: `v2-dom-selection` plus `slate-history`

Planning source:
`docs/plans/2026-05-13-slate-v2-history-selection-precondition-ralplan.md`.

Implemented finding:

- The existing Chromium plaintext row still passes for simple middle-line typing
  undo.
- A package-level mixed commit repro failed before the fix: one commit that
  imports selection with `set_selection(start -> middle)` and then applies
  `insert_text` stored the stale commit-wide `selectionBefore`; undo restored
  `[0,0]@0` instead of the edit point `[0,0]@3`.
- `slate-history` now builds each batch from the first saveable operation,
  applies leading selection-only operations to `batch.selectionBefore`, and
  trims those leading precondition operations from `batch.operations`.
- Selection operations after the first saveable operation remain in the batch;
  redo keeps explicit post-edit selection.
- The scroll-into-view browser row now covers the user-visible follow-up:
  type at the final block, manually scroll away, type again, undo, wait for the
  delayed native selection update, scroll away again, and type a third time.
  The third insertion stays at the restored final-block edit point instead of
  jumping to offset `0`.

Decision:

Treat `udecode/slate#9` as fork-local `improves-implemented`. The exact
mixed-commit history hole and the scroll-into-view caret replay are fixed in
Slate v2, but this stays out of upstream PR fixed-issue counts until a
maintainer accepts broader #9 claim wording.

Proof:

- `.tmp/slate-v2/packages/slate-history/test/history-contract.ts` mixed
  `set_selection` plus `insert_text` red/green: `26 pass`.
- `.tmp/slate-v2/packages/slate/test/commit-metadata-contract.ts` plus
  `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts`:
  `14 pass`.
- `bun --filter slate-history typecheck`, `bun --filter slate typecheck`, and
  `bun --filter slate-react typecheck`: all exited `0`.
- Chromium scroll-into-view rows with rebuilt static output: `2 passed`.
- Chromium scroll-into-view strict row against `http://localhost:3100`:
  `1 passed`.
- Chromium plaintext and richtext undo rows with retries disabled: `4 passed`,
  including the Mac keyboard undo repair row.
- `bun --filter slate-react build`: exited `0`.
- `bun --filter slate-react test:vitest -- selection-side-effect-policy-contract`:
  `2 passed`.
- `bun lint:fix`: exited `0`.

PR-description text:
None. This is fork-local issue accounting and should not change upstream PR
fixed-issue counts until a maintainer-facing claim is accepted.

## Udecode Open Issues Phase 3 IME Cancellation Sync - 2026-05-10

This is execution/accounting sync for
`docs/plans/2026-05-10-slate-v2-udecode-open-issues-reproduction-ralplan.md`.
It processes the automated IME cancellation row for `udecode/slate#6`.

Evidence:

- live GitHub CLI source:
  `gh issue view 6 -R udecode/slate --json number,title,body,url,comments`
- browser proof:
  `.tmp/slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`
- verification:
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_BASE_URL=http://localhost:3100 bun run playwright playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "keeps canceled IME caret anchored for the next typed character"`;
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_BASE_URL=http://localhost:3100 bun run playwright playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "does not push canceled IME composition onto history|keeps text stable after type-delete-cancel IME composition|keeps canceled IME caret anchored for the next typed character"`;
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`;
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun check`.

| Issue             | Status after Phase 3 | Decision                                                                                                                                                                                                                                           |
| ----------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `udecode/slate#6` | `already-accounted`  | Current Chromium CDP cancellation proof keeps text, selection, and the next typed character anchored at the original caret. No runtime code changed. Do not promote this to a manual Chinese IME `Fixes` claim without real OS/input-method proof. |

Decision:
Record automated browser coverage for the cancellation/next-character oracle,
but keep exact manual Chinese IME closure unclaimed.

PR-description text:
None; this is fork-local `udecode/slate` accounting and does not change upstream
`ianstormtaylor/slate` fixed/improved counts.

## Udecode Open Issues Phase 2 Clipboard/Void Sync - 2026-05-10

This is execution/accounting sync for
`docs/plans/2026-05-10-slate-v2-udecode-open-issues-reproduction-ralplan.md`.
It processes the clipboard/void cluster for `udecode/slate#7`, `#10`, and
`#13`.

Evidence:

- live GitHub CLI source:
  `gh issue view 7 -R udecode/slate --json number,title,body,url,comments`;
  `gh issue view 10 -R udecode/slate --json number,title,body,url,comments`;
  `gh issue view 13 -R udecode/slate --json number,title,body,url,comments`
- `#7` local red probe:
  selected image copy from `http://localhost:3100/examples/images` produced
  `text/html` without `<img>` and plain text with only newlines.
- `#7` live reference probe:
  selected image copy from `https://www.slatejs.org/examples/images` produced
  `text/html` containing `<img>`.
- code owner:
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`
- package proof:
  `.tmp/slate-v2/packages/slate-dom/test/clipboard-boundary.ts`
- browser proof:
  `.tmp/slate-v2/playwright/integration/examples/images.test.ts`;
  `.tmp/slate-v2/playwright/integration/examples/mentions.test.ts`;
  `.tmp/slate-v2/playwright/integration/examples/paste-html.test.ts`
- verification:
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun test ./packages/slate-dom/test/clipboard-boundary.ts`;
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_BASE_URL=http://localhost:3100 bun run playwright playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/paste-html.test.ts --project=chromium --grep "copies selected image with visible external HTML payload|copies and pastes a selected mention without crashing|cuts a selected mention without crashing|pastes copied rendered Slate content as an internal fragment before HTML import"`;
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter slate-dom typecheck`;
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter slate-browser typecheck`;
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`

| Issue              | Status after Phase 2 | Decision                                                                                                                                                                                                                    |
| ------------------ | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `udecode/slate#7`  | `fixes-claimed`      | Current local red showed selected block image copy omitted visible `<img>` HTML. `dom-clipboard-runtime` now clones the full void DOM range for spacer-anchored void selections, and package plus Chromium proof are green. |
| `udecode/slate#10` | `already-accounted`  | Exact selected mention copy/paste and cut browser rows are green. Prior inline-void clipboard export work owns the reported null-attach crash class, so this slice records proof rather than a new code fix claim.          |
| `udecode/slate#13` | `already-accounted`  | The attached video was translated into a rendered-content self-copy row in `paste-html`; current code preserves block structure and has no runtime error.                                                                   |

Decision:
Only `udecode/slate#7` becomes a new same-slice fork fix claim. `#10` and
`#13` are guarded as already accounted because their exact browser rows were
green on current code.

PR-description text:
None; these are fork-local `udecode/slate` accounting rows, not upstream
`ianstormtaylor/slate` auto-close claims.

## Udecode Open Issues Phase 1 History/Undo Sync - 2026-05-10

This is execution/accounting sync for
`docs/plans/2026-05-10-slate-v2-udecode-open-issues-reproduction-ralplan.md`.
It covers Phase 1 only: `udecode/slate#9`, `#11`, `#12`, and `#14`.

Evidence:

- live GitHub CLI source:
  `gh issue view 9 -R udecode/slate --json number,title,body,url`,
  `gh issue view 11 -R udecode/slate --json number,title,body,url`,
  `gh issue view 12 -R udecode/slate --json number,title,body,url`,
  `gh issue view 14 -R udecode/slate --json number,title,body,url`.
- current v2 source changes:
  `.tmp/slate-v2/packages/slate/src/transforms-text/insert-text.ts`.
- package proof:
  `.tmp/slate-v2/packages/slate-history/test/history-contract.ts`.
- browser proof:
  `.tmp/slate-v2/playwright/integration/examples/plaintext.test.ts`,
  `.tmp/slate-v2/playwright/integration/examples/mentions.test.ts`,
  `.tmp/slate-v2/playwright/integration/examples/hovering-toolbar.test.ts`.
- verification:
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter slate typecheck`;
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter slate-history typecheck`;
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`;
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun test ./packages/slate-history/test/history-contract.ts`;
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_BASE_URL=http://localhost:3100 bun run playwright playwright/integration/examples/plaintext.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/hovering-toolbar.test.ts --project=chromium --grep "keyboard undo restores caret after middle-line typing|keyboard undo restores partial selected text replacement|keyboard undo restores select-all replacement content|typing English over selected formatted text does not crash"`.

| Issue              | Phase 1 status     | Decision                                                                                                                                                                                                                                                             |
| ------------------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `udecode/slate#9`  | Already accounted  | Plaintext middle-line typing undo restores the original text and caret at the edit point. Broader cross-example scope is not closed by this one row.                                                                                                                 |
| `udecode/slate#11` | Improves           | Mentions select-all replacement undo restores the original document, and the package history contract records full-document replacement as one `replace_children` undo batch. Keep out of PR-facing `Fixes` wording until a clean pre-fix red artifact is preserved. |
| `udecode/slate#12` | Already accounted  | Plaintext partial-selection replacement undo restores the original selected text/range. Inlines, styling, and code-highlighting scope remains unclaimed until matching rows run.                                                                                     |
| `udecode/slate#14` | Fixes in fork lane | Hovering-toolbar English replacement over the selected formatted word reproduced the crash locally and passes after the insert target fix.                                                                                                                           |

Decision:
Do not update the upstream PR fixed-issue matrix from these udecode fork issue
numbers. Keep the PR description unchanged. Continue with Phase 2 clipboard and
void serialization for `udecode/slate#7`, `#10`, and `#13`.

PR-description text:
None; no PR-facing claim count changes.

## ProseMirror Runtime Proof Revalidation - 2026-05-10

This audits `docs/plans/2026-05-10-slate-v2-prosemirror-runtime-proof-slices-ralplan.md`.
It revalidates PM-08, PM-09, PM-10, PM-12, and PM-13 against current
`.tmp/slate-v2` owner tests and keeps all existing issue claim statuses unchanged.

Evidence:

- `gitcrawl doctor --json` reports gitcrawl `0.2.1`, local archive data, no
  GitHub token, and last sync at `2026-05-04T14:58:11.123944Z`.
- PM-10/PM-09 input and DOM-change proof exists in
  `.tmp/slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts`,
  `.tmp/slate-v2/packages/slate-react/test/editing-kernel-contract.ts`,
  `.tmp/slate-v2/packages/slate-react/test/selection-reconciler-contract.ts`,
  `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts`, and
  `.tmp/slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- PM-08 raw convergence proof exists in
  `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts`.
- PM-12 projection/widget proof exists in
  `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`,
  `.tmp/slate-v2/packages/slate-react/test/annotation-store-contract.tsx`, and
  `.tmp/slate-v2/packages/slate-react/test/widget-layer-contract.tsx`.
- PM-13 geometry/RTL proof exists in
  `.tmp/slate-v2/packages/slate-browser/test/browser/selection.browser.test.ts`.

Fresh verification:

- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun test ./packages/slate-react/test/model-input-strategy-contract.test.ts ./packages/slate-react/test/selection-reconciler-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts`
  passed: 20 tests.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun test ./packages/slate/test/collab-history-runtime-contract.ts`
  passed: 9 tests.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest -- projections-and-selection-contract annotation-store-contract widget-layer-contract`
  passed: 3 files, 28 tests.
- `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter slate-browser test:selection`
  passed: 1 file, 4 tests.

| Row                     | Revalidation decision                                                                    | Issue policy                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| PM-10 composition       | Covered by current package and browser composition rows.                                 | Keep input/runtime issues related or proof-needed; no Android/raw-device promotion.                          |
| PM-09 DOM-change        | Covered by current beforeinput, repair-target, command-routing, and browser stress rows. | Keep DOM-change/native-event issues related until exact browser event proof exists.                          |
| PM-08 collaboration     | Covered for raw package convergence and history rebase.                                  | Keep #5771/#5533/#1770/#3741 related and #2288 improves unchanged; no OT/Yjs/browser collaboration closure.  |
| PM-12 projection/widget | Covered for raw projection, annotation, and widget mapping.                              | Keep #4477 improves unchanged and #3309 related unchanged; no NodeView/MarkView/PluginView API parity claim. |
| PM-13 geometry/RTL      | Covered for RTL geometry and wrapped-line rectangles.                                    | Keep browser-selection rows related; no atom/table/mobile closure.                                           |

PR-description text:
None; no PR-facing claim count changes.

## All-Harvest PM-13 Geometry And RTL Browser Selection Sync - 2026-05-10

This is planning/accounting sync for
`docs/plans/2026-05-10-slate-v2-all-editor-harvest-test-processing-ralplan.md`.
It reviews the ProseMirror PM-13 selection geometry pressure against current
Slate v2 browser proof and adds no PR-facing fixed or improved issue claim.

Evidence:

- ProseMirror harvest row:
  `docs/editor-test-harvester/prosemirror/report.md`, PM-13.
- ProseMirror source rows:
  `docs/editor-test-harvester/prosemirror/test-index.md`, `webtest-selection`
  RTL coordinate and wrapped-line coordinate rows.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-browser/test/browser/selection.browser.test.ts`
  now includes browser rows for RTL DOM selection offset mapping, RTL visual
  geometry direction, and wrapped-line selection rectangles.
- verification:
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter slate-browser test:selection`.
- type/lint proof:
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun turbo typecheck --filter=./packages/slate-browser`;
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bunx biome check packages/slate-browser/test/browser/selection.browser.test.ts --fix`.

| Issue | Status after PM-13 | Decision                                                                                                                                                                   |
| ----- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #1498 | Related, unchanged | PM-13 proves browser RTL selection offset mapping and visual geometry direction, plus wrapped-line rectangles. It does not close the exact RTL Enter/new-line caret repro. |

Decision:
Keep PM-13 as browser selection-geometry proof only. Do not claim full RTL input
closure, mobile Persian scroll behavior, list-direction behavior, atom arrow
motion, or decorated-selection closure from this row.

PR-description text:
None; no PR-facing claim count changes.

## All-Harvest PM-12 Projection And Widget Mapping Sync - 2026-05-10

This is planning/accounting sync for
`docs/plans/2026-05-10-slate-v2-all-editor-harvest-test-processing-ralplan.md`.
It reviews the ProseMirror PM-12 projection/widget pressure against current
Slate v2 package proof and adds no PR-facing fixed or improved issue claim.

Evidence:

- ProseMirror harvest row:
  `docs/editor-test-harvester/prosemirror/report.md`, PM-12.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`
  now includes nested moved-node projection runtime-bucket mapping.
- current v2 proof:
  `.tmp/slate-v2/packages/slate-react/test/widget-layer-contract.tsx` now
  includes runtime-id node-widget move/remove mapping.
- verification:
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest -- projections-and-selection-contract annotation-store-contract widget-layer-contract`.
- type/lint proof:
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun turbo typecheck --filter=./packages/slate-react`;
  `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bunx biome check packages/slate-react/test/projections-and-selection-contract.tsx packages/slate-react/test/widget-layer-contract.tsx --fix`.

| Issue | Status after PM-12  | Decision                                                                                                                                              |
| ----- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| #4483 | Improves, unchanged | PM-12 strengthens local projection runtime-bucket mapping, but the legacy dynamic-decoration API proposal remains unclaimed.                          |
| #4477 | Improves, unchanged | Runtime-id node widgets now have structural move/remove proof, but product collaborative comments remain outside raw Slate closure.                   |
| #5987 | Fixes, upgraded     | Exact async `Editable.decorate` browser proof keeps Slate selection and the DOM caret at the typed end after delayed decoration restructuring.        |
| #4392 | Improves, unchanged | Nested moved-node projection mapping strengthens cross-node decoration pressure, but full legacy decorate API parity is not claimed.                  |
| #3382 | Improves, unchanged | Projection slices stay keyed to runtime text ranges through structural moves; legacy `Text.decorations` API behavior remains outside the v2 contract. |
| #3352 | Improves, unchanged | Cross-node projection is still represented by range-to-text-slice projection; decorator callback API parity is not claimed.                           |
| #3309 | Related, unchanged  | PM-12 is package mapping proof only. Exact decorated-text selection closure still needs matching browser proof, likely in PM-13.                      |

Decision:
Keep PM-12 as package-level projection/widget mapping proof only. Do not claim
NodeView/MarkView parity, PM widget side-position semantics, async decoration
caret closure, product comment closure, or decorated-selection browser closure.

PR-description text:
None; no PR-facing claim count changes.

## Udecode Open Issues Intake - 2026-05-10

This is the original planning/accounting intake snapshot for
`docs/plans/2026-05-10-slate-v2-udecode-open-issues-reproduction-ralplan.md`.
It reviewed all open issues from `gh issue list -R udecode/slate --state open
--limit 1000` before execution and added no fixed, improved, or PR-facing claim.
Use the newer Udecode sync sections above for current claim state.

Evidence:

- live GitHub CLI source: `gh issue list -R udecode/slate --state open --limit
1000 --json number,title,body,labels,url,updatedAt,createdAt,author`
- current count: `11` open issues
- current local examples target from issue bodies:
  `http://localhost:3100`, served by `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun
serve`
- current plan:
  `docs/plans/2026-05-10-slate-v2-udecode-open-issues-reproduction-ralplan.md`

| Issue              | Bucket                       | Intake status | Decision                                                                                                               |
| ------------------ | ---------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `udecode/slate#5`  | `v2-dom-selection`           | `needs-repro` | Images `Cmd+A` behavior needs local/live browser proof before changing select-all or void selection rendering.         |
| `udecode/slate#6`  | `v2-input-runtime`           | `needs-repro` | Chinese IME cancellation needs real Chrome/dev-browser proof; synthetic composition rows are supporting evidence only. |
| `udecode/slate#7`  | `v2-clipboard-serialization` | `needs-repro` | External image void paste requires actual clipboard payload proof.                                                     |
| `udecode/slate#8`  | `v2-react-runtime`           | `needs-repro` | Editable void native input undo needs local/live comparison before deciding whether Slate should intercept that undo.  |
| `udecode/slate#9`  | `v2-dom-selection`           | `needs-repro` | Caret jump after text undo is likely history/selection restore, but needs exact cross-example repro rows.              |
| `udecode/slate#10` | `v2-clipboard-serialization` | `needs-repro` | Selected mention copy/paste and cut crash needs local reproduction before fixing inline void clipboard paths.          |
| `udecode/slate#11` | `v2-core-engine`             | `needs-repro` | Full `Cmd+A` replacement undo needs package and browser proof before a history claim.                                  |
| `udecode/slate#12` | `v2-core-engine`             | `needs-repro` | Partial-selection replacement undo needs the listed examples reproduced before history batching changes.               |
| `udecode/slate#13` | `v2-clipboard-serialization` | `needs-repro` | Paste-html issue body lacks exact steps; derive input from video before implementation.                                |
| `udecode/slate#14` | `v2-input-runtime`           | `needs-repro` | Hovering-toolbar crash needs local runtime trace before beforeinput replacement changes.                               |
| `udecode/slate#15` | `v2-dom-selection`           | `needs-repro` | Iframe toolbar behavior needs cross-window selection target proof before target bridge changes.                        |

Decision:
Keep all `udecode/slate` open issues out of PR closure claims until exact local
red proof exists. Group execution by shared runtime owner: history, clipboard,
composition, and target ownership.

## Helper Namespace Global Collision - 2026-05-13

Issue:

- `ianstormtaylor/slate#5400`

Decision:

Claim `Fixes #5400`. Public helper value namespaces now use `*Api` names such
as `NodeApi`, `ElementApi`, `PathApi`, and `RangeApi`, while model type names
stay `Node`, `Element`, `Path`, and `Range`. Public docs/examples no longer
import bare helper values that shadow DOM globals.

Proof:

- `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`
- `.tmp/slate-v2/packages/slate/test/interfaces-contract.ts`
- `docs/plans/2026-05-13-slate-v2-api-helper-namespace-rename-ralplan.md`
- `docs/slate-issues/open-issues-dossiers/5402-5250.md`

PR-description text:

- Fixes #5400: Public helper value namespaces use `*Api`, so importing Slate
  helpers no longer shadows DOM globals such as `Node`.

PR-description text:
None; no PR-facing claim count changes.

## Editable Capabilities DX Ralplan - 2026-05-17

Plan:

- `docs/plans/2026-05-17-slate-v2-editable-capabilities-dx-ralplan.md`

Touched surface:

- `EditorExtension.capabilities` as internal registry substrate
- `editableKeyCommands(...)` public helper DX
- `editableRenderers(...)` public helper DX
- `clipboard.insertData` public authoring shape
- typed package extension facets such as `editable` and `clipboard`

Evidence:

- `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`
- `.tmp/slate-v2/packages/slate/src/core/editor-extension.ts`
- `.tmp/slate-v2/packages/slate/src/core/extension-registry.ts`
- `.tmp/slate-v2/packages/slate/src/create-editor.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/editable-key-commands.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/editable-renderers.ts`
- `.tmp/slate-v2/site/examples/ts/iframe.tsx`
- `.tmp/slate-v2/site/examples/ts/richtext.tsx`
- `docs/research/sources/editor-architecture/node-text-mark-render-dx-corpus-ledger.md`

| Issue   | Status after pass          | Decision                                                                                                                                                                                                                             |
| ------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `#3177` | Related, planning-reviewed | Extension-owned rendering/behavior composition remains the right direction, but public capability helper spreads are no longer accepted final DX. No fix/improve claim until examples, docs, type contracts, and runtime proof land. |
| `#5961` | Related, not claimed       | The plan reduces public raw key-callback authoring pressure, but the DevTools `onKeyDown` render-warning report remains stale and unreproduced.                                                                                      |
| `#4613` | Improves, unchanged        | Existing clipboard capability improve claim stays scoped to typed `insertData` handlers. The proposed `clipboard` facet is an authoring-DX refinement and adds no new behavior claim.                                                |

Decision:
No new `Fixes` or `Improves` issue claims. Keep PR fixed/improved issue counts
unchanged.

## Plate-fit API Hard Cuts Ralplan - 2026-05-17

Plan:

- `docs/plans/2026-05-17-slate-v2-plate-fit-api-hard-cuts-ralplan.md`

Touched surface:

- raw Slate React renderer/key-command helper APIs
- public `EditorExtension.capabilities` authoring
- public `Editable onCommand` / `EditableCommand*`
- package-owned `clipboard.insertData` authoring vocabulary
- Plate boundary for shortcuts, keymaps, input rules, paste rules, and renderer
  registries

Evidence:

- `docs/slate-issues/gitcrawl-live-open-ledger.md:592`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md:594`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:208`
- `docs/slate-issues/open-issues-dossiers/3313-2733.md:757`
- `docs/slate-issues/test-candidate-map/3313-2733.md:181`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md:39`
- `docs/slate-issues/open-issues-dossiers/5994-5918.md:468`
- `docs/slate-v2/ledgers/fork-issue-dossier.md:3953`

| Issue             | Status after pass          | Decision                                                                                                                                                                                                                                                                            |
| ----------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#3177`           | Related, planning-reviewed | Renderer composition pressure is real, but raw Slate should not own a renderer registry. Target raw Slate shape is `Editable render*` escape hatches plus reusable model middleware; Plate owns renderer/plugin composition. Execution proof landed; no fix/improve claim is added. |
| `#5961`           | Related, not claimed       | DevTools `onKeyDown` warning remains stale/triage-closed. Removing raw key-command registry DX does not reproduce or fix the original warning.                                                                                                                                      |
| `#4613`           | Improves, unchanged        | Existing clipboard improve claim stays scoped to typed `insertData` handlers. This plan refines authoring vocabulary away from public `capabilities`; it does not broaden clipboard behavior claims.                                                                                |
| input-rule family | Already cut, unchanged     | Public raw Slate input-rule helpers stay out. Plate owns semantic input-rule families; raw Slate keeps transform middleware.                                                                                                                                                        |

Decision:
No new `Fixes` or `Improves` issue claims. Later issue-sync accounting updated
the manual ledger, coverage matrix, and PR reference where they still described
renderer registries as the accepted raw Slate target.

## Plate-fit API Hard Cuts Broader Issue Pass - 2026-05-17

Plan:

- `docs/plans/2026-05-17-slate-v2-plate-fit-api-hard-cuts-ralplan.md`

Additional issue pressure reviewed:

- `#3222`, `#3802`, `#3557`, `#4089`
- `#5050`, `#5010`, `#4795`
- `#3586`, `#3568`, `#4681`
- `#5233`, `#4569`, `#4440`, `#4888`
- `#4956`, `#5172`

Decision:

- Public plugin-composition pressure is real, but raw Slate should not answer it
  with renderer/keymap/input-rule registries. Raw Slate keeps extension
  substrate, transform/input middleware, and render/event escape hatches.
- Public input interception pressure is real. It reinforces transform/input
  middleware and DOM/model synchronization proof, not Plate-shaped keymap or
  renderer APIs.
- Native format/beforeinput rows constrain the `onCommand` cut: public
  `onCommand` / `EditableCommand*` are cut, and Slate-owned native-format
  behavior stays internal/runtime-owned after removal.
- Clipboard rows constrain the `capabilities` cut: `clipboard.insertData` input
  ingress stays, custom fragment-key fixes stay, and output serializers remain
  outside this plan.
- Docs/example packaging rows stay non-claims. They support moving polished
  feature packaging to Plate, not raw Slate API growth.

Claim result:

- No new `Fixes` or `Improves` issue claims.
- Issue-sync accounting updated stale manual/coverage/PR wording for #3177,
  renderer registries, `capabilities`, and the public `onCommand` cut.

## Plate-fit API Hard Cuts Issue Sync Accounting - 2026-05-17

Plan:

- `docs/plans/2026-05-17-slate-v2-plate-fit-api-hard-cuts-ralplan.md`

Synced artifacts:

- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/references/pr-description.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`

Synced decisions:

| Issue   | Accounting result                                                                                                                                                                                           |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#3177` | Stays `Related` / `planning-reviewed`. Raw Slate should not own a renderer registry; target is raw `Editable render*` plus model/runtime extensions, with Plate owning product renderer/plugin composition. |
| `#5961` | Stays not claimed. Raw key-command registry removal does not reproduce or fix the stale DevTools `onKeyDown` warning; raw Slate keeps `Editable onKeyDown`.                                                 |
| `#4613` | Existing clipboard improve claim stays scoped to typed `insertData` input ingress. No broader method override, paste-rule, or output serializer claim.                                                      |
| `#4569` | Existing docs fix claim stays, with wording shifted from public string `capabilities` to typed clipboard ingress.                                                                                           |
| `#5233` | Existing custom fragment-key fix claim stays unchanged and must remain green when clipboard authoring vocabulary changes.                                                                                   |

Claim result:

- New fixed claims: `0`.
- New improved claims: `0`.

## TanStack Virtual iOS / Performance Refresh - 2026-05-23

Planning source:

- `docs/plans/2026-05-23-slate-v2-tanstack-virtual-ios-perf-ralplan.md`

Reviewed surface:

- TanStack blog `https://tanstack.com/blog/tanstack-virtual-perf-and-ios`
- TanStack Virtual latest API docs
- `.tmp/slate-v2/packages/slate-react/package.json`
- `.tmp/slate-v2/bun.lock`
- `.tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts`
- `.tmp/slate-v2/docs/libraries/slate-react/experimental-virtualized-rendering.md`
- `docs/research/sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md`

Decision:

Adopt the latest TanStack Virtual release as an internal viewport/range engine
upgrade for experimental virtualized mode, keep the Slate public API unchanged,
and route internal layout-backed virtualized scroll writes through TanStack
where practical. This is not an issue closure slice.

Issue accounting:

| Issue | Classification | Reason |
| --- | --- | --- |
| `#790` | Related, proof-route backlog | Latest TanStack Virtual improves the internal path, but Slate still needs mount/edit/scroll benchmark and browser proof before claiming dynamic rendering. |
| `#5826` | Fixes | Exact huge-document browser proof covers the long-editor refocus autoscroll report. |
| `#5538`, `#4995`, `#5088`, `#5473` | Related, unchanged | Upstream iOS momentum scroll deferral supports the scroll-routing implementation route, but exact Slate focus/selection scroll issues still need targeted repro proof. |
| `#5391`, `#5095`, `#4751`, `#4354`, `#3760` | Related/non-claimed, unchanged | TanStack's iOS scroll fix is not proof for Slate iOS selection, IME, spellcheck, or toolbar behavior. |

Claim result:

- New fixed claims: `0`.
- New improved claims: `0`.
- Fixed/improved counts remain unchanged.

## Table Transform Boundary Ralplan - 2026-05-18

Planning source:

- `docs/plans/2026-05-18-slate-v2-table-transform-boundary-ralplan.md`

Reviewed surface:

- `.tmp/slate-v2/site/examples/ts/tables.tsx`
- `.tmp/slate-v2/site/examples/ts/markdown-shortcuts.tsx`
- `.tmp/slate-v2/site/examples/ts/richtext.tsx`
- `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`
- `.tmp/slate-v2/packages/slate/src/create-editor.ts`
- `docs/slate-v2/references/pr-description.md`

Decision:

Backspace/Delete/Enter table-cell boundary behavior is model transform behavior,
not raw keyboard UI behavior. The target authoring shape is an example-local
`table()` extension using `transforms.deleteBackward`, `deleteForward`, and
`insertBreak`. Markdown Enter/Backspace and richtext exit-on-Enter follow the
same rule. UI-only hotkeys and widget navigation stay in `Editable onKeyDown`.

Issue accounting:

| Issue                     | Classification                 | Reason                                                                                                                                                                                                                   |
| ------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `#6034`                   | Existing `Fixes` row unchanged | The current fixed claim is ArrowDown at the last table cell. This plan changes authoring ownership for Backspace/Delete/Enter and does not broaden the ArrowDown proof.                                                  |
| `#4658`                   | Related, unchanged             | Custom table text outside table belongs to table boundary and invalid DOM import policy. A local table transform extension can reduce escape routes, but no exact repro or browser proof is added by this planning pass. |
| `#5355`                   | Not claimed, unchanged         | `colgroup` / `col` crash behavior depends on app-rendered DOM shapes that omit editable descendants, not table-cell Backspace/Delete/Enter transform ownership.                                                          |
| `#2558`                   | Not claimed, unchanged         | Multi-cell table selection requires an explicit table selection model; this plan does not add one.                                                                                                                       |
| `#3408`                   | Related, unchanged             | Delete-backward table/list replacement pressure stays in the structural delete family; this plan only routes example policy through transform middleware.                                                                |
| `#5961`                   | Related, not claimed           | Raw Slate still keeps `Editable onKeyDown` for UI shortcuts; moving transform-equivalent behavior out of `onKeyDown` does not reproduce or fix the stale DevTools render-warning report.                                 |
| `#3568`, `#3586`, `#4681` | Related, unchanged             | The public `onCommand` hard cut and native input boundary remain as previously classified. This plan narrows example guidance but does not add native-format or paste proof.                                             |

Claim result:

- New fixed claims: `0`.
- New improved claims: `0`.
- Fixed/improved counts remain unchanged.

PR sync:

- `docs/slate-v2/references/pr-description.md` records the table transform
  boundary and links this plan.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` keeps existing rows; no new
  `Fixes`, `Improves`, `Related`, or `Not claimed` row is required because all
  reviewed issue classifications already exist.

## Android Markdown Shortcut Flush Ralplan - 2026-05-18

Planning source:

- `docs/plans/2026-05-18-slate-v2-android-markdown-shortcut-flush-dx-ralplan.md`

Reviewed surface:

- `.tmp/slate-v2/site/examples/ts/markdown-shortcuts.tsx`
- `.tmp/slate-v2/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`
- `.tmp/slate-v2/packages/slate/src/core/transform-middleware.ts`
- `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`

Decision:

The app-side `scheduleAndroidMarkdownShortcutFlush(editor)` helper is not the
right canonical DX. Markdown shortcut policy should stay in
`extension.transforms.insertText`, while Slate React owns Android pending-diff
flush timing. Raw Slate should not add a product markdown shortcut API or
revive public `Editable inputRules` for this case.

Issue accounting:

| Issue                                                                  | Classification                   | Reason                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#4532`                                                                | Related, implementation-reviewed | The implementation removes the example-side Android flush helper, routes stored Android text diffs through registered `insertText` transform middleware, and passes local regression proof. Candidate `Improves #4532` still requires raw Android browser/device proof. |
| `#4531`, `#4543`, `#6022`, `#5983`, `#4400`, `#5883`, `#5130`, `#5050` | Related, unchanged               | These share Android, IME, beforeinput, or input-policy ownership, but the Android markdown shortcut flush plan does not prove their exact repros.                                                                                                                       |

Claim result:

- New fixed claims: `0`.
- New improved claims: `0`.
- Related issue matrix rows: `+1` for `#4532`.
- Implementation proof added: focused Android input manager unit proof,
  transform-middleware detection proof, markdown example surface proof,
  markdown-shortcuts chromium/mobile Playwright proof, slate/slate-react
  typecheck, site typecheck, and lint.

## Extension Slot Naming Ralplan - 2026-05-18

Planning source:

- `docs/plans/2026-05-18-slate-v2-extension-slots-ralplan.md`

Reviewed surface:

- `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`
- `.tmp/slate-v2/packages/slate/src/core/editor-extension.ts`
- `.tmp/slate-v2/packages/slate/src/core/public-state.ts`
- `.tmp/slate-v2/packages/slate-history/src/history-extension.ts`
- `.tmp/slate-v2/packages/slate-dom/src/plugin/with-dom.ts`
- `.tmp/slate-v2/packages/slate-react/src/plugin/with-react.ts`

Decision:

Keep the mechanisms, but do not keep registry-shaped names as the normal
extension author API. Target `operations.apply` for low-level operation hooks,
`onCommit` for post-transaction observers, and `setup` for extension-local
runtime installation. Keep internal registry storage names if they are useful
inside the runtime.

Issue accounting:

| Issue                              | Classification                               | Reason                                                                                                                                                                                                                                |
| ---------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#3557`                            | Related, planning-reviewed                   | Broad method override pressure must keep full extension middleware coverage across transforms, queries, normalizers, operation apply hooks, and commit observers. Slot naming does not close the exact legacy insert override report. |
| `#1770`, `#2288`, `#3741`, `#3874` | Related, unchanged                           | Operation and commit lifecycles preserve the transaction/op/collab pressure already represented in the core-operation rows. The naming review adds no operation-composition, range-operation, or moved-node payload claim.            |
| `#1024`, `#5233`, `#4569`          | Existing clipboard classifications unchanged | Clipboard ingress still belongs to typed clipboard APIs and extension-owned `insertData`; the extension slot naming review does not broaden clipboard fix claims.                                                                     |
| `#3222`, `#4089`, `#3177`          | Related, unchanged                           | Plugin/extension API pressure supports better extension authoring vocabulary, but raw Slate still should not own Plate-style product plugin bundles or renderer registries.                                                           |

Claim result:

- New fixed claims: `0`.
- New improved claims: `0`.
- Existing `Related`, `Fixes`, and `Improves` rows remain at their current
  classification.

## Pretext Layout / DOM Strategy Architecture Sync - 2026-05-22

Planning source:

- `docs/plans/2026-05-22-slate-v2-pretext-layout-rendering-architecture-ralplan.md`

Reviewed surface:

- `.tmp/slate-v2/packages/slate-layout/src/index.ts`
- `.tmp/slate-v2/packages/slate-layout/src/react.tsx`
- `.tmp/slate-v2/packages/slate-layout-pretext/src/index.ts`
- `.tmp/slate-v2/packages/slate-react/src/rendering-strategy/create-segment-plan.ts`
- `.tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts`
- `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/references/pr-description.md`

Decision:

The right architecture is a generic `slate-layout` derived layout service,
Pretext as the default layout-aware engine, `domStrategy` as the Slate React DOM
materialization policy, and layout-driven virtualization. This is not an issue
closure slice. It is a boundary rewrite plan for later implementation proof.

Issue accounting:

| Issue | Classification | Reason |
| --- | --- | --- |
| `#790` | Related, proof-route backlog | Layout-driven virtualization directly targets dynamic rendering pressure, but needs benchmark and browser proof before any claim. |
| `#4141` | Existing `Improves` unchanged | Layout subscriptions must preserve current rerender-breadth wins; no new proof is added here. |
| `#5944` | Related, issue-reviewed | Stable per-line pagination is in scope for the layout target, but needs current page-boundary browser proof. |
| `#5924` | Not claimed, unchanged | Structural DOM should use DOM coverage and mount-plan policy; this plan does not add a public ignore-cursor API. |
| `#3892` | Policy non-claim, unchanged | Generic layout substrate helps custom surfaces, but product custom editor surfaces remain outside raw Slate closure. |
| `#2572` | Policy non-claim, unchanged | Accessibility is a release gate for missing-DOM modes, not an architecture-doc issue fix. |
| `#5131`, `#2051` | Guardrail rows, unchanged | Future layout snapshot consumers must prove narrow invalidation and avoid broad editor subscriptions. |

Claim result:

- New fixed claims: `0`.
- New improved claims: `0`.
- PR prose sync: architecture target and open gates updated, with no claim-count
  change.

## Pretext Pagination / Page Virtualization Feedback Planning Sync - 2026-05-25

Source plan:

- `docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md`

Decision:

Pretext remains the default layout engine target, but the plan explicitly refuses
to claim cross-client/server page-break determinism while `prepare()` still
depends on canvas measurement. Final planning wording keeps `measurementProfile`
as snapshot metadata, groups page display settings under `pageView`, cuts public
`pageVirtualization`, virtualizes pages/spreads internally behind virtualized
`domStrategy`, keeps `pageBreaks` opt-in for strict collaboration/export
fidelity, and routes table/media/BFC pagination through generic provider/split
protocols. Default editing stays locally derived layout.

Issue accounting:

| Issue | Classification | Reason |
| --- | --- | --- |
| `#5944` | Related, issue-reviewed | Stable per-line pagination is the direct issue, but needs current browser proof for page-boundary flicker, caret mapping, and page-break stability before any claim. |
| `#790` | Related, proof-route backlog | Internal page/spread virtualization directly targets dynamic rendering pressure, but needs mount/edit/scroll benchmark, mounted-count proof, DOM coverage, and browser native-behavior proof before any claim. |
| `#5924` | Not claimed, unchanged | Page frames, table structure, and debug DOM should route through DOM coverage, mount policy, and provider/split protocols; this plan does not add a public ignore-cursor API. |
| `#4141` | Existing `Improves` unchanged | Layout/page subscriptions must preserve nested rerender-breadth proof and avoid widening affected ranges. |
| `#5131`, `#2051` | Guardrail rows, unchanged | Layout snapshot consumers and page virtualization must prove narrow subscriptions and rerender breadth. |
| `#2793` | Release guard, unchanged | Missing-DOM/page-virtualized modes cannot claim native screen-reader equivalence without assistive-tech proof or explicit degradation docs. |
| `#2572` | Policy non-claim, unchanged | Accessibility remains a release guard, not a planning-doc issue fix. |
| `#3892` | Policy non-claim, unchanged | Generic layout substrate helps custom surfaces, but product custom layout engines stay outside raw Slate closure. |
| `#5945`, `#4056`, `#5992` | Existing `Improves` unchanged | Large-document operation/clipboard benchmark claims remain owned by their existing proof rows; this pagination plan does not promote them. |

Claim result:

- New fixed claims: `0`.
- New improved claims: `0`.
- PR prose sync: planning target wording synced; fixed/improved claim counts
  remain unchanged.
