---
date: 2026-05-04
topic: plite-issue-dossier-pilot-5
status: pilot
source_ledger: docs/plite-issues/open-issues-ledger.md
issue_refs: [6038, 6034, 6022, 6016, 6013]
live_github_checked: true
gitcrawl_checked: false
---

# Plite Issue Dossier Pilot: First 5 Rows

This is a five-issue pilot for the compiled issue dossier workflow. It uses the
frozen issue ledger, targeted live GitHub reads, and current local Plite proof
references. No GitHub comments, labels, or closure actions were written.

`gitcrawl` was unavailable in this environment, so related-thread discovery falls
back to the frozen ledger, local issue corpus, and targeted live GitHub reads.

## #6038 Perf: repeated tree updates need a batch-aware apply engine

Status: improves-claimed
Bucket: already-accounted
Confidence: high

Issue summary:
This is a performance issue about repeated exact-path tree updates needing a
batch-aware apply engine. The live issue is open, references PR #6039, and asks
for a benchmark-backed architecture improvement rather than a single UI bug fix.

Evidence:

- ledger row: `transactionality-and-batch-engine`, valid, severe,
  `improves-claimed`.
- related issues: PR #6039 is referenced in the issue body; no duplicate issue
  was established in this pilot.
- duplicate/stale/invalid proof: none.
- live GitHub checked: yes, open.
- current v2 proof:
  `benchmarks/plite/donor/core/current/transaction-execution.mjs`;
  `docs/plite/slate-tranche-3-execution.md`;
  `docs/plite/ledgers/issue-coverage-matrix.md`.

Decision:
Keep this as `improves-claimed`, not `fixes-claimed`. Plite has
transaction/applyOperations benchmark coverage for mixed structural snapshots,
but the current ledger does not define an accepted performance threshold that
would prove the full upstream benchmark claim.

PR-description text:
Improves #6038: Plite adds transaction/applyOperations benchmark coverage for
batch-style repeated tree updates, but this PR does not auto-close the issue
because no accepted performance threshold proves the full upstream benchmark
claim.

## #6034 Cursor moves to wrong position when pressing down arrow at end of table that is last node

Status: cluster-synced
Bucket: v2-dom-selection
Confidence: medium

Issue summary:
This is a DOM selection/navigation bug at a table boundary when the table is the
last node in the editor. The live issue is open and gives official table-example
repro steps for arrow-key movement at the end of the document.

Evidence:

- ledger row: `dom-selection-synchronization`, likely-valid, `cluster-synced`.
- related issues: no specific duplicate was established in this pilot; it belongs
  to the broader DOM selection, focus, hit-testing, zero-width, void, table, and
  boundary bridge cluster.
- duplicate/stale/invalid proof: none.
- live GitHub checked: yes, open, `bug` label.
- current v2 proof: `packages/plite-dom/test/bridge.ts`;
  `packages/plite-dom/test/dom-coverage.ts`;
  `docs/plans/2026-05-04-plite-full-issue-ledger-architecture-ralplan.md`;
  `docs/plans/2026-05-04-plite-full-issue-ledger-architecture-ralplan-issue-matrix.md`.

Decision:
Keep this as `cluster-synced`. The architecture owner is the DOM
selection/focus bridge, but the exact table-edge browser reproduction is not
proved end to end yet. Do not auto-close.

PR-description text:
Related #6034: covered as DOM selection/focus bridge pressure; exact table-edge
browser repro is not auto-closed.

## #6022 [Android] Soft keyboard dismisses and cursor jumps when typing after toggling a mark on a collapsed selection

Status: cluster-synced
Bucket: v2-input-runtime
Confidence: high

Issue summary:
This is an Android input/composition bug where toggling a mark on a collapsed
selection causes keyboard dismissal and selection jumps while typing. The live
issue is open, has `bug` and cross-platform labels, and includes reporter
comments with Android WebView context and operation logs.

Evidence:

- ledger row: `mobile-ime-and-selection-sync`, valid, `cluster-synced`.
- related issues: no duplicate was established in this pilot; it belongs to the
  mobile IME, beforeinput, composition, placeholder, and keyboard-layout runtime
  cluster.
- duplicate/stale/invalid proof: none.
- live GitHub checked: yes, open, labels `bug` and `cross platform`; comments
  include operation logs.
- current v2 proof:
  `docs/plans/2026-05-04-plite-full-issue-ledger-architecture-ralplan.md`;
  `docs/plans/2026-05-04-plite-full-issue-ledger-architecture-ralplan-issue-matrix.md`;
  `docs/plite-issues/requirements-from-issues.md#r7-make-input-composition-and-ime-semantics-first-class`.

Decision:
Keep this as `cluster-synced`. Plite should route it through the shared
input/composition/mobile runtime, but exact closure requires Android/device proof
for the mark-toggle collapsed-selection repro.

PR-description text:
Related #6022: Plite input/composition runtime targets the Android mark-toggle
selection/keyboard class, but this PR does not auto-close without matching device
proof.

## #6016 Displaying 2 Plite components with the same initialValue breaks the page

Status: triage-closed
Bucket: skip-invalid
Confidence: high

Issue summary:
This reports two Plite editors rendering the same value object reference and
breaking DOM/path resolution. The live issue is open, but maintainer discussion
clarifies that sharing the same Plite node objects across editor instances is not
a supported contract because editor DOM/path maps are keyed by node identity.

Evidence:

- ledger row: `shared-node-identity-across-editors`, likely-invalid,
  `triage-closed`.
- related issues: no specific duplicate was established in this pilot.
- duplicate/stale/invalid proof: live maintainer discussion says shared Plite
  values across editors are unsupported; the practical workaround is deep
  cloning per editor instance, and the reporter acknowledged the usage was not
  aligned with Plite's model.
- live GitHub checked: yes, open, `bug` label.
- current v2 proof:
  `docs/plans/2026-05-04-plite-full-issue-ledger-architecture-ralplan.md`;
  `docs/plans/2026-05-04-plite-full-issue-ledger-architecture-ralplan-issue-matrix.md`.

Decision:
Do not claim this as a v2 fix. Raw Plite should not support the same node object
identity mounted in multiple editor runtimes as a normal contract. Reopen only if
a current minimal repro shows a supported usage failing.

PR-description text:
None; detailed ledger only. #6016 is classified as likely-invalid shared-node
identity misuse, not a Plite closure claim.

## #6013 Improvement: Omit initialValue for pre-initialized editor instances

Status: fixes-claimed
Bucket: already-accounted
Confidence: high

Issue summary:
This is an API ergonomics issue asking React providers to accept an already
initialized editor without requiring a separate provider-level `initialValue`.
The live issue is open, and the current Plite coverage matrix already carries
the exact fix claim.

Evidence:

- ledger row: `react-initialization-api-ergonomics`, valid, `fixes-claimed`.
- related issues: #5605 is the duplicate/related initialValue issue and is also
  covered in the issue coverage matrix.
- duplicate/stale/invalid proof: none.
- live GitHub checked: yes, open, `improvement` label.
- current v2 proof: `docs/plite/ledgers/issue-coverage-matrix.md`;
  `docs/plite/references/pr-description.md`;
  `packages/plite/test/state-tx-public-api-contract.ts`.

Decision:
Keep the exact `Fixes #6013` claim. Plite makes editor initialization own the
initial value, so the React provider can accept a pre-initialized editor without
requiring another `initialValue` prop.

PR-description text:
Fixes #6013: React providers accept pre-initialized editor instances without a
provider-level initialValue; editor state is seeded during editor creation.
