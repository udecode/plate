---
date: 2026-05-23
topic: slate-issues-gitcrawl-recluster-map
status: active
source:
  - .tmp/gitcrawl/2026-05-23T091840Z-clusters.json
  - docs/slate-issues/gitcrawl-clusters.md
---

# Plite Issues Gitcrawl Recluster Map

## Verdict

This is the human architecture overlay on top of gitcrawl's machine clusters.
Machine clusters are useful discovery seeds. They are not the Plite v2 issue
taxonomy.

Batch 0 creates the map skeleton. Later ClawSweeper batches should extend it by
adding singleton search results, neighbor evidence, issue dossier sections, and
claim decisions.

## Current Counts

| Metric                       | Count |
| ---------------------------- | ----: |
| Live open issues             |   631 |
| Live open PRs                |    33 |
| Live open threads            |   664 |
| Gitcrawl clusters            |   620 |
| Multi-member clusters        |    28 |
| Singleton clusters           |   592 |
| Multi-member covered threads |    72 |
| Largest multi-member cluster |     7 |

## 2026-05-23 Live Refresh Delta

- Previous live run: `2026-05-04T145301Z`.
- Current live run: `2026-05-23T091840Z`.
- Live issue delta: `630 -> 631`; new issue `#6061` needs ClawSweeper triage.
- No machine cluster is promoted to a v2 fix/improves claim by this refresh alone.

## Human Families

| Family ID                                 | Owner bucket               | Source clusters | Seed issues / PRs                                      | Decision | Next ClawSweeper owner                                    |
| ----------------------------------------- | -------------------------- | --------------- | ------------------------------------------------------ | -------- | --------------------------------------------------------- |
| dom-point-resolution-crashes              | v2-dom-selection           | 1               | #4564, #3723, #4789, #3836, #5711, #3834, #4984        | reviewed | Dossier sections appended; no exact closure claims        |
| inline-boundary-cursor-movement           | v2-dom-selection           | 5, 25           | #4074, #4618, #3429, #3148, #3150                      | reviewed | Dossier sections appended; no exact closure claims        |
| inline-void-and-void-selection            | v2-dom-selection           | 12, 17, 21      | #5183, #5391, #3991, #4301, #4802, #4806               | reviewed | Browser proof now fixes #4806; #4802 stays improves       |
| history-and-undo-selection-state          | v2-core-engine             | 6, 27           | #3705, #3756, #3921, #3534, #3551                      | reviewed | Dossier sections appended; no exact closure claims        |
| react-focus-subscription-runtime          | v2-react-runtime           | 3, 7            | #3478, #3497, #3634, #5537, #4961                      | split    | Clusters 3/7 reviewed; #3777 routed to input runtime      |
| android-ime-and-beforeinput               | v2-input-runtime           | 9, 11, 13, 18   | #6022, #6027, #5983, #6020, #4400, #5883, #4994, #5026 | reviewed | Dossier sections appended; no exact closure claims        |
| mobile-and-browser-selection-quirks       | v2-dom-selection           | 14, 19, 20, 22  | #5826, #5882, #5088, #5473, #4376, #5171, #5095, #5096 | reviewed | Dossier sections appended; no exact closure claims        |
| async-decoration-and-projection-stability | v2-react-runtime           | 10              | #5987, #6033                                           | keep     | Cluster 10 processed: `Fixes #5987`                      |
| input-event-boundary-semantics            | v2-input-runtime           | 16              | #5603, #5669                                           | reviewed | Dossier sections appended; no exact closure claims        |
| triple-click-and-block-selection          | v2-dom-selection           | 23              | #3871, #5847                                           | reviewed | Dossier sections appended; no exact closure claims        |
| docs-jsdoc-examples-api-ergonomics        | docs-examples              | 4, 15, 24       | #6045, #5350, #5520, #4956, #5172, #3780, #3781        | reviewed | Docs/examples only; no raw runtime claim                  |
| dependency-and-duplicate-pr-noise         | skip-maintainer-noise      | 2, 8            | #6032, #6049, #6025, #5869, #6026, #5861, #6054        | reviewed | PR-only dependency/export noise; no issue claim           |
| stale-legacy-browser-support              | skip-stale                 | 26, 28          | #3800, #4111, #3112, #3313                             | reviewed | Stale legacy browser/mobile support; needs current repro  |
| large-document-performance-virtualization | v2-performance-benchmark   | singleton sweep | #4056, #2051, #790, #5992, #5945                       | reviewed | Singleton candidates routed; benchmark proof still needed |
| clipboard-html-fragment-serialization     | v2-clipboard-serialization | singleton sweep | #4802, #4806, #4056, #5089                             | reviewed | #4806 fixed; #4802/#4056 remain improves                 |
| table-selection-and-arrow-navigation      | v2-dom-selection           | singleton sweep | #4658, #5355, #6034                                    | reviewed | Singleton candidates routed; exact browser proof needed   |

## Batch 1 Seeds

Start with these high-signal clusters:

1. cluster 1: DOM point resolution crashes - reviewed in Batch 1
2. cluster 5: inline boundary cursor movement - reviewed in Batch 1
3. cluster 6: history `set_selection` errors - reviewed in Batch 1
4. cluster 7: `ReactEditor.focus` after programmatic change - reviewed in Batch
   1
5. cluster 9: Android mark-toggle keyboard dismissal
6. cluster 10: async decoration caret jump
7. cluster 11: Android empty-node voice input duplication
8. cluster 12: mobile inline void selection keyboard
9. cluster 13: Android IME empty-node composition
10. cluster 14: refocus autoscroll

## Batch 2 Seeds

- Finish cluster 3 by triaging #3777.
- Split mobile/browser-specific proof owners from clusters 19, 20, 22, and 23.
- Keep PR-only clusters out of issue claims unless a PR changes a linked issue's
  status.

## Batch 1 Progress

### Cluster 1: DOM point resolution crashes

Status: processed.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-1-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-4564.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-3723.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-4789.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-3836.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-5711.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-3834.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-4984.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-dom-point.json`

Decision:

- #4564: `improves-claimed`
- #4789: `improves-claimed`
- #3723, #3836, #5711, #3834, #4984: `cluster-synced`

No `Fixes #...` claim is justified from this cluster. The owner is DOM bridge
point import/export and nested editor containment.

### Cluster 5: inline boundary cursor movement

Status: reviewed.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-5-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-4074.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-4618.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-3429.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-inline-boundary.json`

Decision:

- #4074, #4618, #3429: `cluster-synced`

No `Fixes #...` claim is justified from this cluster. The owner is inline
boundary cursor movement and DOM selection policy. Related cluster 25 remains
pending for inline DOM end selection.

### Cluster 6: history set_selection errors

Status: reviewed.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-6-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-3705.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-3756.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-3921.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-history-set-selection.json`

Decision:

- #3705, #3756, #3921: `cluster-synced`

No `Fixes #...` claim is justified from this cluster. The owner is
transaction-aware history and selection operation integrity. Related cluster 27
remains pending for broader undo selection corruption.

### Cluster 7: ReactEditor focus after programmatic change

Status: reviewed.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-7-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-3634.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-5537.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-4961.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-reacteditor-focus.json`

Decision:

- #3634, #5537, #4961: `cluster-synced`

No `Fixes #...` claim is justified from this cluster. The owner is React focus,
selection reconciliation, and multi-editor input ownership. Cluster 3 remains
the mixed cluster that needs #3777 triage in Batch 2.

### Cluster 9: Android mark-toggle keyboard dismissal

Status: reviewed.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-9-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-6022.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-6027.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-android-mark-toggle.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-threads-6022-6027.json`

Decision:

- #6022: `cluster-synced`
- #6027: linked upstream PR evidence only

No `Fixes #...` claim is justified from this cluster. #6027 describes a strong
root-cause path, but fork closure still needs matching Android/device proof.

### Cluster 10: async decoration caret jumps

Status: reviewed.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-10-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-5987.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-6033.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-async-decoration-caret.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch1-9-14.json`

Decision:

- #5987: `fixes-claimed`
- #6033: linked upstream PR evidence plus matching fork proof

`Fixes #5987` is justified by the exact async `Editable.decorate` browser
proof. The fork reproduces the delayed decoration callback identity change,
types matching text at the document end, waits for the delayed highlight to
restructure the DOM, and verifies both Plite selection and browser DOM caret
remain at the typed end.

Proof:

- `packages/plite-react/src/components/editable-text-blocks.tsx`
- `apps/www/src/app/(app)/examples/slate/_examples/decorations-async.tsx`
- `apps/www/tests/plite-browser/donor/examples/decorations-async.test.ts`
- `docs/plans/2026-05-23-plite-async-decoration-caret-cluster-proof.md`

### Cluster 11: Android empty-node voice input duplication

Status: reviewed.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-11-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-5983.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-6020.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-android-empty-voice.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch1-9-14.json`

Decision:

- #5983: `cluster-synced`
- #6020: linked upstream PR evidence only

No `Fixes #...` claim is justified from this cluster. The owner is Android
empty-node IME insertion, and voice-input closure needs device proof.

### Cluster 12: mobile inline void keyboard and caret

Status: reviewed.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-12-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-5183.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-5391.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-android-inline-void-keyboard.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch1-9-14.json`

Decision:

- #5183, #5391: `cluster-synced`

No `Fixes #...` claim is justified from this cluster. The owner is inline void
boundary selection, but Android/iOS keyboard and handle behavior need device
proof.

### Cluster 13: Android IME empty-node composition

Status: reviewed.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-13-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-4400.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-5883.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-android-ime-empty-node.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch1-9-14.json`

Decision:

- #4400, #5883: `cluster-synced`

No `Fixes #...` claim is justified from this cluster. The owner is Android
composition/IME runtime, and exact Chrome/Gboard proof is still required.

### Cluster 14: refocus autoscroll

Status: reviewed.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-14-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-5826.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-5882.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-refocus-autoscroll.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch1-9-14.json`

Decision:

- #5826: `cluster-synced`
- #5882: linked upstream PR evidence only

No `Fixes #...` claim is justified from this cluster. The owner is selection
repair and scroll-on-refocus behavior.

## Batch 2 Progress

### Cluster 3: mixed React focus and first-character input

Status: reviewed and split.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-3-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-3478.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-4001.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-3497.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-3777.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-placeholder-composition-dom-point.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch2.json`

Decision:

- #3478, #3497: `cluster-synced` under React focus/subscription runtime
- #4001, #3777: `cluster-synced` under input/composition runtime

Cluster 3 stays split. No `Fixes #...` claim is justified.

### Cluster 19: scrollSelectionIntoView update gaps

Status: reviewed.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-19-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-5088.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-5473.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-mobile-browser-selection-quirks.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch2.json`

Decision:

- #5088, #5473: `cluster-synced`

No `Fixes #...` claim is justified. The owner is selection reconciliation and
scroll forwarding.

### Cluster 20: blur and unfocused selection updates

Status: reviewed.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-20-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-4376.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-5171.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-mobile-browser-selection-quirks.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch2.json`

Decision:

- #4376, #5171: `cluster-synced`

No `Fixes #...` claim is justified. The owner is cross-browser selection import
when focus is absent or changing.

### Cluster 22: Safari Cyrillic spellcheck

Status: reviewed.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-22-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-5095.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-5096.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-mobile-browser-selection-quirks.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch2.json`

Decision:

- #5095, #5096: `cluster-synced`

No `Fixes #...` claim is justified. The owner is native text input/spellcheck
policy with Safari-specific proof.

### Cluster 23: triple-click block selection

Status: reviewed.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-23-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-3871.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-5847.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-triple-click-block-selection.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch2.json`

Decision:

- #3871, #5847: `cluster-synced`

No `Fixes #...` claim is justified. The owner is browser gesture selection and
destructive editing policy for hanging triple-click ranges.

## Remaining Multi-Member Cluster Sweep

Status: reviewed.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-2-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-4-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-8-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-15-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-16-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-17-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-18-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-21-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-24-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-25-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-26-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-27-detail.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-cluster-28-detail.json`
- matching `.tmp/gitcrawl/2026-05-04T145301Z-neighbors-*.json` files for each
  member issue/PR.

Decision:

- clusters 16, 17, 18, 21, 25, and 27: `cluster-synced` issue families with
  dossier sections and matrix rows.
- clusters 4, 15, and 24: docs/examples/API ergonomics only; no raw runtime
  claim.
- clusters 2 and 8: PR-only dependency/export maintenance noise; no issue
  claim.
- clusters 26 and 28: stale legacy browser/mobile support; require current
  repro before any v2 claim.

All 28 multi-member clusters now have a human-family decision. No additional
`Fixes #...` claim is justified from the multi-member pass.

## Batch 3 Singleton Search Phrases

- `Cannot resolve a Plite point from DOM point`
- `Cannot resolve a Plite node from DOM node`
- `Android composition beforeinput`
- `Samsung keyboard Firefox Android`
- `inline void selection keyboard`
- `placeholder composition`
- `ReactEditor focus parent state`
- `useSelected stale path`
- `decorate async caret jump`
- `history set_selection undo`
- `copy paste inline void`
- `large document paste cut performance`

## Batch 3 Singleton Progress

Status: reviewed.

Raw evidence:

- `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-point-dom-point.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-slate-node-dom-node.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-android-composition-beforeinput.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-samsung-firefox-android.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-inline-void-selection-keyboard.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-placeholder-composition.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-reacteditor-focus-parent-state.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-useselected-stale-path.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-decorate-async-caret-jump.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-history-set-selection-undo.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-copy-paste-inline-void.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-search-singleton-large-document-paste-cut-performance.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-threads-batch3-singletons.json`
- `.tmp/gitcrawl/2026-05-04T145301Z-batch3-singleton-decisions.json`

Decision:

- `34` high-signal singleton candidates reviewed.
- Bucket routing: `12` input-runtime, `12` DOM-selection, `2` React-runtime,
  `2` API-DX, `2` performance, `1` core-engine, `2` ecosystem-boundary, and
  `1` invalid-contract row.
- Status routing: `26` cluster-synced, `3` needs-repro, `2` not-claimed, `2`
  improves-claimed, and `1` triage-closed.
- Dossier sections exist for every reviewed singleton candidate.

No `Fixes #...` claim is justified from the singleton sweep. Exact closure
requires focused repro proof per issue.

## Rules

- Do not write `Fixes #...` from this map alone.
- Every reviewed issue still needs a fork dossier section.
- Every exact closure needs current repro proof.
- Browser, IME, mobile, and performance claims need matching browser/device or
  benchmark proof.
- Do not pull in non-live evidence unless the user explicitly asks for it.

## Batch 4 Docs, Stale, And Noise Sweep

Status: reviewed.

Decision:

- docs/examples/API ergonomics clusters 4, 15, and 24 stay in `docs-examples`.
- dependency/export PR-only clusters 2 and 8 stay in `skip-maintainer-noise`.
- stale legacy browser/mobile clusters 26 and 28 stay in `skip-stale` unless a
  current repro exists.
- none of these rows become raw Plite runtime architecture claims.

## Batch 5 Exact Claim Audit

Status: reviewed.

Decision:

- exact fixed claims remain limited to #6013, #5605, and #5709 in the issue
  coverage matrix and PR description.
- all Batch 1, Batch 2, Batch 3, and remaining multi-member rows stay
  `improves-claimed`, `cluster-synced`, `not-claimed`, `needs-repro`,
  `triage-closed`, or skipped.
- no upstream GitHub issue comments, labels, closes, or PR mutations were made.
