# Reject unfinished transaction authors

Objective:
Reject thenable authors consistently across Plite extension updates and pure or
extended command specs. Preserve rollback, synchronous return values, read
behavior and exact editor/view ownership.

Goal plan:
docs/plans/2026-09-11-synchronous-transaction-authors.md

Template:
docs/plans/templates/task.md

Flow mode:
One local Patch implementation with focused package proof.

Task source:
- User: `$patch Reject thenable transaction authors consistently across Plite
  extension updates and pure/extended command specs.`
- [Accepted review](../research/decisions/transactions-synchronous-boundary.md).
- [Source-bound reproduction](artifacts/transactions-api-review/proof-receipt.json).

Completion threshold:
Durable tests fail on the reproduced partial-commit behavior, then pass after
the owning fix. Focused package tests, source-first types and scoped lint pass.
Current teaching, changeset disposition and local proof fingerprints are
recorded. Reconcile the original method obligations and pass the plan checker.

Verification surface:
Public Plite update, extension portal, active transaction and command/spec APIs;
existing update-policy, command-spec, read/view and extension contracts.
The report is a package/API defect: no browser, native selection, paint or
device claim is made.

Constraints:
One synchronous commit authority; no async transaction API, new scheduler,
document store or wrapper family. Preserve normal synchronous results,
fallthrough, prefixes, selection/metadata rollback, view/root identity,
transaction retirement and independent read/API contracts. Keep public call
shapes and inference. Branch `next`; no Autoreview, Git publication, other
checkout, registry/template edit or unrelated strict-check repair.

Boundaries:
Plite transaction author guards and spec construction in core, their existing
package tests, narrowly affected teaching and package changeset. Keep immutable
review evidence intact. The earlier invalidation task's broad closure is not
part of this patch.

Timing:
No requested deadline or minimum duration.

Blocked condition:
An exact reproduction or required in-scope proof cannot be completed after
available safe work is exhausted. Unrelated checkout failures are reported
without expanding this repair. Native goal status follows its repeated-blocker
rule; difficulty or elapsed time is not a blocker.

Case:
- case_id: `transactions:thenable-author-partial-commit`
- class: Plite model/runtime transaction atomicity.
- surface: public package API, raw editor and named-root view.
- setup: paragraph `one`, an author that inserts `!`, waits on a controlled
  Promise, and attempts to insert `?` after release.
- action: invoke an extension update or a command built with a pure/extended
  spec callback, then release the Promise.
- actual: first write publishes `one!` at version 1; later write fails with
  `editor transaction is no longer active`.
- expected: reject synchronously, publish no partial document/selection/state
  or notifications, retire escaped writes and permit a following valid update.
- source_refs: accepted review, public probe and update callback teaching in
  `content/docs/plite/api/nodes/editor.mdx`.
- observed source: current `next` checkout; review receipt records 41 file
  hashes, one consumer-directory hash and 11 scope-group hashes. Record fresh
  bad-ref and red-test fingerprints before product mutation.
- applicable claims: text/model, selection and metadata, version/notifications,
  thrown error, escaped continuation, subsequent synchronous update.
- browser/DOM/native fields: N/A; the reported operation is headless package API.

Task state:
- current_phase: complete
- next: local handoff; no publication authorized
- status: complete

Work Checklist:
- [x] Capture scope, authority, accepted owner comparison and exact case.
  Sources: Patch Reproduce/Classify; Task workflow; Best API Review decision.
- [x] Record fresh current-source reproduction and durable red proof for direct,
  configured, portal, active-extension, pure and extended-spec paths, including
  delayed failure and recovery. Sources: Patch Red Proof; Poteto Bug fix.
- [x] Repair the canonical author boundary without changing independent reads;
  cover nested methods, tx-only controls and view/root projection where affected.
  Sources: Patch Durable Owner; accepted review; Plite Vision.
- [x] Apply architecture pressure and supported-domain review: preserve existing
  signatures and owners; reject unnecessary runtime machinery. Source: Patch.
- [x] Run focused exact replay and adjacent package contracts, source-first
  Plite typecheck, and scoped lint. Preserve before/after fingerprints and logs.
  Sources: Verify Plate/Testing; Task effective-input rule; root AGENTS.md.
- [x] Update narrowly affected teaching through Plate Docs and inspect release
  delta against main before the changeset decision. Sources: Patch, Changeset.
- [x] Reconcile review/adoption evidence without editing immutable records;
  verify affected local links and generated review ledger if changed.
  Source: Task Best API Review adapter.
- [x] Inspect final diff, reconcile every original checklist and applicability,
  finish evidence/handoff and run check-complete before closing the native goal.
  Sources: Autogoal checklist retention; Task/Patch handoff.

Decisions and tradeoffs:
- Reuse the accepted transaction-owner comparison. Prepared specs have current
  non-publishing composition jobs; the inconsistency is unchecked author
  completion, not evidence for a new transaction architecture.
- The existing transaction proxy wraps merged read/write groups. Writer checks
  must preserve read results and method markers rather than indiscriminately
  rejecting every Promise returned by that shared proxy.
- Browser, native-paint controls, warm browser replays, broad strict Plite and
  the full browser matrix are N/A for this scoped package/API claim.
- No public API/exports/new exported files are selected. If that changes,
  return to Best API and apply doctrine/barrel obligations. Registry generation,
  templates, dependency reinstall and app launch are presently N/A.
- Autoreview is N/A on `next`; inspect and fix verified in-scope defects directly.
- No publication is authorized. A changeset remains a local release artifact.

Verification evidence:
- Prior review: 94 existing cases pass; 14 boundary rows reproduce nine unchecked
  paths; three delayed cases distinguish rollback from the partial commit.
- Fresh current-source reproduction: [before.json](artifacts/synchronous-transaction-authors/before.json).
- Initial durable red proof: [red.log](artifacts/synchronous-transaction-authors/red.log)
  and [red receipt](artifacts/synchronous-transaction-authors/red-receipt.json):
  2 passing controls, 27 failures, all missing expected synchronous rejection.
  Named-root view update/spec wrappers also discard author results.
- Final focused proof: 187 tests pass across 10 files, including 31 regressions;
  12 source-first typecheck tasks and scoped lint pass. The
  [receipt](artifacts/synchronous-transaction-authors/proof-receipt.json) records
  exact commands, logs, dirty ref and 48 matching before/after input hashes.
- The final matrix adds callable-method and ignored spec-extension controls to
  the initial red matrix. Object and function thenables also reject.
- Current docs updated in the editor API, command concepts and extension
  concepts. No new public signature, callback annotation, export or teaching
  example is needed. Direct text/link verification applies to these small edits.
- Release baseline: `git show main:packages/plitejs/package.json` proves Plite
  is absent on main. Update the existing `plite-canonical-architecture` major
  changeset with its final synchronous-author contract; do not describe a beta
  bug or removal as a previously released Plite API.
- Review adoption recorded in the current decision and transactions scope;
  original review/probe artifacts remain unchanged. Ledger refresh, render and
  check pass (see `artifacts/synchronous-transaction-authors/ledger-*.log`).
  The scope remains proof-partial for broader architecture/browser/performance
  questions; the bounded implementation is adopted locally.

Open risks:
- None within the scoped package/API repair. Browser/native behavior,
  performance, whole-checkout closure and publication are not certified.

Final handoff:
- Outcome and owning fix: synchronous-author result checks cover extension
  writers and pure/extended spec callbacks. Named-root view wrappers forward
  results to the same guard. Existing rollback and transaction retirement own
  failures. No facade-specific guard or new transaction family is added.
- Architecture pressure: KEEP. The write tree identifies which existing
  transaction methods author writes; read paths and explicit txRead markers keep
  their contracts. Cache variants preserve aliases appearing on both read and
  write paths. Work stays bounded by accessed method-tree depth with constant
  result inspection; no new traversal on each write or performance claim.
- Supported domain: installed extension method trees, nested/callable methods,
  tx-only/tx-read markers, named-root projections and real prepared command
  builders. Tests use the public package API and controlled continuations.
- Doctrine repair disposition: existing Plite Vision already requires
  synchronous public updates and one active transaction. No public shape or
  durable taste changes; affected public teaching was aligned. Source-rule
  edits, doctrine versioning, mirror regeneration and barrel generation are
  not applicable to this invariant repair.
- Proof and limits: focused package/API proof passes. Browser/native/paint,
  full-checkout/strict Plite proof and performance are outside this headless
  repair. Autoreview is not applicable on next.
- Local / integrated / published state: local only; nothing published.
- Checklist reconciliation: Patch reproduction, classification, red proof,
  owner repair, architecture pressure, supported-domain gate, verification and
  handoff are satisfied. Task authority/proof/review, Poteto Bug fix, Verify
  Plate/Testing, Plate Docs/Technical Writing, Changeset and Autogoal
  obligations are reconciled above; no independent workflow change was made.
- Next action: the local patch is ready for user review. Publication remains a
  separate request.
