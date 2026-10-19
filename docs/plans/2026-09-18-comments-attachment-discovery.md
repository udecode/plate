---
review_scopes:
  - comments
review_basis:
  - 2026-09-18-comments-attachment-and-discovery
  - 2026-09-18-comments-attachment-design-gate
work_kind: implementation
---

# Comments attachment correctness and document-level discovery

Status: Completed — native attachment identity, ordinary replacement mapping,
document-level discovery, copied UI adoption and production proof are implemented.

Objective:

Implement the native range law and copied Comments/Discussion presentation needed
to retain conversations after deleting their text, without stale block badges
or attachment to unrelated later typing. Task owns the implementation and proof.

Completion threshold:

The work is complete when the selected native and UI owners are implemented,
the copied registry and docs teach the installed behavior, exact browser flows
pass, and production correctness and scale stay inside the frozen gates.

Constraints:

- Source: the user's September 18 `$task design plan` request and the
  [attachment/discovery review](../research/review-records/2026-09-18-comments-attachment-and-discovery.json).
- Published messages, replies and resolution survive document edits and undo.
- Current attachment determines live placement in the exact mounted view.
- Delete then type is distinct from atomic replacement and exact undo.
- Preserve the per-block Floating Discussion workflow and optional-plugin
  independence. Do not restore the removed sidebar or mode switch.
- Keep neutral unavailable wording unless deletion can actually be proved.
- The [completed persistence plan](2026-09-16-comments-history-api.md) and its
  historical receipts remain intact; their stale-placement assertions cannot
  prove this corrected contract.

Boundaries:

Implementation may change the selected Plite, copied UI, registry, docs and
proof owners and may write evidence under
`artifacts/comments-attachment-discovery/`. It does not publish or mutate the
supplied Google document. Real-time collaboration transport,
non-text comment targets, persisted browser undo and a comment activity log
are outside this repair.

Verification surface:

Native retained anchors and history; Plate Comments data and mounted-view
attachment; copied Discussion/comment cards and toolbar installation; comment
browser scenarios; existing serialization and render budgets. Design probes
exercise source APIs and disposable candidate code. They do not certify the
final browser implementation.

Blocked condition:

A native candidate that cannot distinguish unrelated later insertion from
intentional replacement while preserving exact history leaves the plan
provisional. An inconclusive scale comparison cannot be marked ready; record
the failing receipt and the smallest remaining observation.

## Design

Keep the conversation when its text disappears. Remove its inline paint and
block count immediately. Make it reachable through **All comments**, with its
original excerpt and **Target unavailable in this view**. Exact document undo
can restore the target; typing unrelated text into the gap cannot.

The repair belongs in two existing owners. Plite owns retained document
identity and history. Copied Comments UI owns discovery and placement. The
Comments package keeps its current semantic records and attachment APIs.

### Source diagnosis

`discussion.tsx`'s `useDiscussionController.locate` preserves a previous
`store.getComment(id)` when attachment disappears and clamps its block indices
to the document's last block. This can move a thread to unrelated text.
`DiscussionPopover` also keeps `fallbackBlockIndex`. The after-editor
unavailable list then excludes comments retained in that index, so it cannot
correct the stale badge.

The second defect is below Comments. With Authored installed, retained range
endpoints still resolve through surviving outside neighbors after their
content is deleted. Later text between those neighbors becomes an expanded
range. Ordinary anchors stay collapsed in the reproduced case. Endpoints
alone are therefore insufficient evidence of retained content.

Current tests preserve both good and bad contracts. The browser's
`a fully deleted comment stays reachable and exact through repeated history`
asserts the obsolete block count. Its atomic `SWAP` replacement test protects
a valid separate behavior. Rewrite the former and preserve the latter.

### Maximum-value cuts and retained owners

| Decision | Reason |
| --- | --- |
| Cut remembered/clamped block placement and the unavailable list below the editor | Neither represents current document location; discovery has one explicit entry point. |
| Cut the persistence demo's separate resolved/history lists | They duplicate the same document-level discovery job. |
| Cut `CommentThreadCard.targetUnavailable` and its implicit range-only location subscription | A conversation card cannot infer location independently of the caller's mounted view. A private discovery row owns target presentation. |
| Keep Comments separate from Authored/document history | Replies, resolution and explicit conversation deletion have an independent durable lifetime; comments also work without suggestions. |
| Keep the native retained target, with correct identity resolution | Another tombstone, last-block field, activity log or copied anchor adds competing authority. |
| Keep the private live Discussion index | Keyed block counts, mixed comment/change grouping and contextual Floating review remain current jobs. Remove only historical location authority. |
| Keep existing Comments APIs and registry item IDs | `getSnapshot`, keyed records, `attachment` and subscriptions suffice; no provider, controller API or discovery plugin is justified. |
| Reject universal `deletion: 'drop'` | It loses ordinary exact-undo recovery and intentional replacement behavior. |
| Reject a sidebar/mode switch and generic Editor coupling | Both violate explicit user constraints. Feature-owned copied toolbar composition supplies discovery. |

### Native target law

An expanded retained range needs live content identity: captured original
content or content that inherited it through a specific authored edit.
Surviving endpoint neighbors alone do not establish ownership.

The selected design extends the existing private `AuthoredIndex`; it does not
add a range runtime. Each immutable authored edit contributes a successor fact
from removed content to inserted content. A replacement may span one or both
old boundaries. A pure insertion uses the existing association law: inward
requires both boundary identities, outward either boundary, forward the left
boundary and backward the right. Delete and insert steps pair only inside the
same authored operation, so history grouping cannot turn later typing into a
replacement.

`RetainedRange.content` stays the serialized birth identity. The authored index
maps that identity through reachable successor facts. A second weak index maps
live origin intervals to offsets in the exact accepted, proposed or markup
positions root. Resolution intersects those indexes; it never scans unrelated
operations or all document content. Identical queries in one immutable
projection share their closure and bounds. A new authored state or positions
root cannot reuse stale results.

Public revert must preserve information that already exists before capture.
`prepareAuthoredRevert` computes semantic positions for the inverse projection;
return the selected positions with its numeric change and pass them through the
authored transaction to `captureAuthoredStep.afterPositions`. Restored spans
keep `origin` and `offset`, while `birth`/`placement` identify the fresh revert
contribution. This preserves saved-history recovery without text matching,
overlapping live origins or a new codec field. Public revert remains a fresh
contribution with `inverseOf: null`; local history compensation keeps its
existing stricter law.

Resolve in the requested projection. If no owned content survives, `nearest`
returns one collapsed native position while retaining serialized birth identity
for undo, revert and reload; Comments reports unavailable. `drop` detaches.
Original direction and endpoint association remain stable. Cross-root movement
selects the root containing live owned postings; neighbor endpoints are only a
collapse fallback.

The [accepted native design](artifacts/comments-attachment-discovery/canonical-design.json)
records owners, cuts, complexity and prototype limitations. The fresh
experiment was explicitly authorized by the user's “model switched. try
again”; it is materially different from the three closed per-read/per-binding
trials. Those failures remain useful counterexamples and are not reclassified.

Ordinary anchors use the same operation-local replacement law in their existing
change-map owner. Keep the proved one-run extraction and binary range lookup
from the final ordinary prototype. Its contended fragmented timing is an
implementation rerun gate; it does not justify moving ordinary anchors into
the authored index.

### Conversation and attachment matrix

| Event/state | Native location | Conversation and UI |
| --- | --- | --- |
| Partial target deletion | Surviving covered content | Same thread; current coverage and blocks only. |
| Complete deletion | Collapsed/unavailable | Keep messages/excerpt; no block badge; discover in All comments. |
| Unrelated typing after deletion | Remains unavailable | Never highlight the later text. |
| Intentional atomic replacement | Inserted successor, preserving direction | Same thread covers replacement; no new conversation. |
| Interior insertion, then deletion of original characters | Surviving inherited interior content | Remains attached until that inherited content also disappears. |
| Undo/redo document edits | Restore/remove exact target identity | Replies, message edits and resolution stay unchanged. |
| Resolve/reopen | Target identity unchanged | Resolution controls open-thread paint; All/Resolved filters stay reachable. |
| Suggested deletion/decision | Read each view's actual native coverage | Accepted/proposed/markup views may differ; a suggestion decision is not comment resolution. |
| Save/reload | Restore opaque target with the exact saved document revision | Same published conversation; fresh local undo stack. |
| Historical preview | Historical target in that preview plus selected current records | Navigation stays inside that preview; missing target remains discoverable. |
| Missing change/root or projection-hidden target | Unavailable in this view | Neutral label; never infer “deleted” or choose the nearest block. |
| Explicit final-message/thread deletion | Release target and remove record | No discovery row; document undo does not resurrect the conversation. |

Change-bound conversations retain stable change IDs. Their visible ranges
come from the optional installed Authored owner; do not convert them into
range anchors. All comments includes published conversations on changes, not
bare suggestions without a conversation. AI/local draft threads remain in
their existing provisional workflow until publication.

### Copied UI contract

Add `AllCommentsButton` beside `CommentToolbarButton` in the existing
`comment-toolbar-button.tsx` item. It opens a lazy Dialog and stays available
without selection and in read-only documents. Without Comments installed it
renders nothing. Keep the Comment creation action and its existing selection
requirements. Generic `editor.tsx` remains independent.

The dialog defaults to **All**, with **Open** and **Resolved** filters. These
filter published conversation records, independently of target availability.
Use reverse insertion order, 20 cards per page, Previous/Next controls and
explicit empty states. No global attachment count or Unavailable filter:
either would require interpreting the entire target corpus on document edits.

Subscribe to the stable existing `CommentsSnapshot` for membership. Read
`threadIds`; `visibleThreadIds` means unresolved, not attached. Keyed cards
observe their own records. Only the mounted page resolves target status in its
originating editor view. Closed discovery has no list/card/target work.
The pure projection probe checks this proposed calculation; mounted React
subscription behavior still requires execution proof.

A private `AllCommentsRow` displays the excerpt, lifecycle and target status
around the existing rich conversation card. **Show in document** re-resolves
the target at activation, closes discovery, selects/focuses the exact view and
scrolls its live range. If the target disappeared, retain the dialog with an
unavailable label. Never navigate from stored coordinates. Ordinary open/close
does not change document selection; close returns focus to the trigger.

Preserve input through asynchronous mutations. The copied card/composer sends
one optional `onInteractionChange(blocked: boolean)` signal for dirty input,
editing or a pending action. The dialog holds displayed IDs while blocked;
records remain live. Disable page/filter changes, destructive close/navigation
and thread deletion until success or explicit Cancel. Rejected/thrown writes
retain rich input and expose Cancel; pending requests cannot be canceled by
discarding their UI. Do not unmount a pending composer just because its thread
became resolved. On release, reconcile the current page and restore useful
focus. No package draft store or general dialog controller is introduced.

Document read-only does not imply comment read-only. Existing actor checks and
the application's `mutate` authorization govern replies and resolution.
Read-only prevents new range capture/document editing. Keep target navigation
and permitted conversation actions available. A viewer without an actor sees
conversation content without ineffective submit controls.

The complete callsite, focus/dismissal details, exact ownership and adoption
inventory are in the [UI design artifact](artifacts/comments-attachment-discovery/ui-design.md).
The implementation evidence below proves the selected controls.

## Execution sequence

All acceptance slices are implemented. Each row records its final owner and
the evidence used to close it.

| Slice | Files/owner | Completion evidence |
| --- | --- | --- |
| 0. Canonical authored lineage | `authored/state.ts`, `positions.ts`, `decisions.ts`, `authored.ts`, `steps.ts`, `anchors.ts` | `AuthoredIndex` owns successor facts; exact-projection postings and weak caches resolve retained content. Semantic revert positions preserve restored origins while revert contributions stay fresh. Focused authored/history tests and source-first partitions pass. |
| 1. Ordinary replacement mapping | `core/change/document-change.ts`, `core/anchor.ts`, `core/anchor-state.ts` | Operation-local replacement runs and binary range lookup serve live and saved-history recovery without authored coupling. The isolated production fragmented cohort passes its frozen budget. |
| 2. Comments integration | Existing Comments APIs and package/React tests | Published records survive location changes; replies and resolution remain outside document undo; mounted views resolve their own attachment. No new Comments package primitive was needed. |
| 3. Live placement plus discovery | `discussion.tsx`, `comment.tsx`, `comment-toolbar-button.tsx`, `fixed-toolbar.tsx` | Remembered/clamped placement and the unavailable spill are removed. The lazy 20-row All comments dialog covers filters, current-view navigation, dirty/pending guards, read-only use and unavailable targets. Focused component tests pass. |
| 4. Adoption and copy/install contract | Explicit comment/suggestion demos, persistence/history previews, proof route, registry source/dependencies and public docs | Every comment-capable composition has one discovery entry point. EditorKit consumers inherit it once; Comments remains independent of Suggestions and generic Editor. Base and Radix clean installs build. |
| 5. Integrated proof | Home playground, `/blocks/discussion-proof`, comment/suggestion/persistence routes and editor-ai | The complete comment browser file passes 31 tests with two declared skips. Fresh-server key flows show no render-phase React warning. Source-first types, registry/docs gates and isolated production timings pass. |

The UI artifact lists every explicit-toolbar consumer. EditorKit consumers
receive discovery through FixedToolbarKit; do not mount duplicate buttons in
`rich-text-editor.tsx`. Add the Dialog dependency to the existing registry item.
Remove obsolete imports and helpers as their callers move; no compatibility
alias, legacy presentation branch or feature flag remains in the final target.

Public copied changes require Best API's doctrine-repair pass: update affected
source teaching, append the appropriate immutable Plate Next doctrine entry,
regenerate and prove mirrors. Update the smallest Vision owner only if durable
law changed. Preserve the completed persistence plan and its old receipts.
Public docs describe the final API without migration/changelog language;
the registry changelog separately records the copied component change.

## Required implementation proof

Tests are selected for these demonstrated expensive regressions. Reuse
existing contracts instead of cloning every case into every layer.

- Native range cases: full/partial/multi-block/whole-block deletion, later
  insertion at both boundaries, exact and boundary-crossing atomic replacement,
  original versus inherited content, reversed selection, all association
  policies, repeated undo/redo, default grouped history versus one operation,
  and saved-target reload. Run with and without Authored. Include pending
  deletion/replacement accept/reject and exact independent projections.
- Comments cases: immutable conversation survives those document transitions;
  replies/resolution stay unchanged across undo. Save threads and target data
  with the exact document revision, reload without replaying local undo, and
  verify current-record/historical-target joining.
- UI cases: removed target vanishes from live badge and stays in All comments;
  All/Open/Resolved membership, local drafts excluded, final-message deletion,
  last-page clamp, at most 20 cards, no closed-dialog work and no whole-corpus
  target pass on typing. Opening and ordinary close preserve selection.
- Async cases: pending duplicate suppression, rejected/thrown rich reply/edit,
  Cancel, dirty/pending page/filter/dismiss guard, resolution while reply is
  pending, and page reconciliation/focus after applied success.
- Actual browser: delete all commented text in the supplied playground flow,
  type unrelated text, find preserved discussion in All comments, undo/redo
  using keyboard, navigate a live target, resolve/reopen and reload. Repeat in
  the independent reviewer/historical view and with no Suggestion plugin.
  Test modal/Floating coexistence and Base/Radix focus behavior. Source-only
  range results cannot close this reporter interaction.

Affected execution entry points:

```sh
bun test ./packages/plitejs/test/authored-anchor-contract.test.ts ./packages/plitejs/test/authored-history-contract.test.ts ./packages/plitejs/test/authored-retained-edit-contract.test.ts ./packages/plitejs/test/architecture-contracts.test.ts
bun test ./packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts ./apps/www/src/registry/components/editor/discussion.spec.tsx ./apps/www/src/registry/components/editor/comment.spec.tsx
pnpm --filter plitejs typecheck
pnpm --filter platejs typecheck
pnpm --filter www typecheck
pnpm --filter www test:www-browser:chromium tests/browser/comment.spec.ts
pnpm --filter www build:registry
```

Use the source-alias runner setup and Verify Plate's current command recipes.
Add the toolbar's focused test to the selected invocation when implemented.
Confirm the ordinary anchor-history contract is collected by its real runner;
an unexecuted helper file is not proof. Before browser claims record the
serving checkout/port/source identity: Playwright currently reuses an existing
server, which is not sufficient identity by itself. Preserve failures and
skips by exact scope. Registry output is generated on `next`; do not edit
generated output or CI-controlled templates manually. Run `pnpm brl` only if
the actual implementation changes its owned export/file conditions.

Performance acceptance reuses the frozen probe contracts and the existing
Comments serialization budget. Measure cold creation/resolution, changed-state
resolution and warm reads separately; history width, fragmented origins and
replacement lineage vary independently of anchor count. The browser separately
proves input-to-paint and dialog open/page costs. A fast ID filter does not
establish mounted-card, native mapping or keyboard performance.

## Implementation closure

Work Checklist:

- [x] Reconcile the current review, completed persistence work and explicit
  floating-only product constraint.
- [x] Exercise native candidate semantics, history and persistence; reject the
  read-time algorithm with retained correctness and scale evidence.
- [x] Select and prove the shared authored-index runtime plus semantic revert
  handoff; preserve rejected candidates as counterevidence.
- [x] Specify one document-level discovery interaction, normal install shape,
  lifecycle and optional-plugin boundaries.
- [x] Freeze and execute matched native and UI architecture probes.
- [x] Record vertical adoption slices, exact regression oracles, source-first
  checks, browser gates, docs/registry adoption and risks.
- [x] Reconcile research history and inspect the final plan.
- [x] Pass the frozen canonical readiness checker.
- [x] Implement native authored lineage and ordinary atomic replacement mapping
  in their existing owners, including undo, redo and saved-history recovery.
- [x] Remove stale discussion placement and add bounded All comments discovery
  without coupling generic Editor or Comments to Suggestions.
- [x] Adopt the copied UI in every comment-capable example and generate the
  registry, public docs and changelog from source.
- [x] Prove focused native, Comments and copied UI contracts, complete browser
  behavior, clean Base/Radix installation and isolated production scale.

Verification evidence:

The [September 18 source reproduction](artifacts/comments-history-api/deleted-target-retyping-2026-09-18.json)
demonstrates that a comment on `lph` in `Alpha Beta` becomes attached to a later
`NEW` insertion only when Authored is installed. The ordinary owner remains
unavailable. Both edits use separate transactions in the default edit/accepted
view. No browser or Google Docs parity follows from that source probe.

The [frozen UI projection contract](artifacts/comments-attachment-discovery/ui-probe-contract.json)
and [source-extracted probe](artifacts/comments-attachment-discovery/ui-projection-probe.mjs)
passed all 12 count/distribution rows. At 10,000 records, a full first page
reads 21 eligible records (24 visits in the mixed corpus); an empty filter
scans 10,000 records with p95 0.159 ms. The modeled open-document update reads
at most 20 visible attachments; the proposed closed branch does none. These
are algorithm/subscription-design simulations, not mounted React evidence.
[Raw result](artifacts/comments-attachment-discovery/ui-projection-result.json)
records runtime, source hashes, all samples and exact limitations.

The [native result](artifacts/comments-attachment-discovery/native-results.json)
preserves two rejected algorithm trials. Trial 2 passes 30/30 correctness
cases against 11/30 on source. Its scale experiment has six interleaved fresh
process packets, 38 cohorts each, five warmups and 30 samples per cohort.
The 10,000-anchor ordinary bulk scenarios materially regress; some complete
baseline operations also already exceed their absolute budget. Neither fact
waives the candidate's regression.

The additional combined lineage stress has five diagnostic samples per arm,
so use ranges and deterministic work rather than a statistically strong tail
claim: 1,000 anchors × 100 replacements take **63.8–65.3 ms**, versus
**8.9–11.9 ms** on source; 10,000 take **627.7–706.1 ms**, versus
**90.2–96.1 ms**. A single 10,000-anchor read performs 1,030,000 identity
checks. The same operation is indexed once; repeated ancestry traversal per
binding is the causal problem. This is native programmatic work, not a browser
keystroke measurement.

The accepted [canonical experiment contract](artifacts/comments-attachment-discovery/canonical-contract.json)
freezes one materially different retry: immutable successor facts in the
existing authored index, exact-projection live postings and semantic revert
positions carried into capture. The candidate passes **54/54** selected cases:
**30/30** native behavior, **21/21** saved-history/adversarial cases and
**3/3** additional substring/public-revert history cases. The source transform
records loaded source hashes and changes no product file.

The final 38-row packet passes the frozen absolute and relative budgets. At
10,000 shared handles, unchanged, later-typing, atomic-replacement and
changed-state p95 are **60.18 ms**, **89.73 ms**, **72.30 ms** and
**75.84 ms**. Depth-10,000 unrelated history costs **37.24 ms** on the first
shared index build and **0.02 ms** p95 afterward. A depth-1,000 replacement
lineage costs **6.72 ms** cold and **0.01 ms** warm. Deterministic counters show
one authored-edge build, one live-span build and zero repeated history work on
warm reads.

The distinct-target packet resolves 10,000 distinct targets in **93.35 ms**
cold and **64.39 ms** p95. Ten thousand shared handles at depth 100 take
**69.28 ms** cold and **62.93 ms** p95. One hundred distinct targets, each
depth 100, take **235.27 ms** for the first 10,000-edge build and **1.33 ms**
p95 afterward, within the frozen 250 ms cold-build ceiling. The
[readiness result](artifacts/comments-attachment-discovery/canonical-readiness.json)
passes correctness, absolute, relative, creation and cold-build checks. These
are architecture-selection measurements; production and browser gates remain.

The independent [ordinary-owner challenge](artifacts/comments-attachment-discovery/ordinary-design.json)
finds the same replacement law at three mapping sites: ordinary range updates,
deferred history recovery and stored history recovery. Its disposable helper
uses canonical replacement sections, excludes property-only changes, and adds
no persistent store or public API. It passes **12/12** selected cases versus
**4/12** on source. Preserving unchanged point identity improves 10,000-anchor
replacement/publication/resolve p95 from 41.18 to **34.50 ms**, but source is
**28.59 ms** and the frozen relative limit is **34.31 ms**. The narrow miss and
unmeasured fragmented-map cost kept that row gated.

The [third and final ordinary candidate](artifacts/comments-attachment-discovery/ordinary-final-design.json)
derives replacement runs once per transaction, uses binary intersection lookup,
and chooses a range successor before mapping its endpoints. It passes **27/27**
focused cases and **36/36** existing history cases. Seven of eight measured
cohorts pass: 10,000-target replacement p95 is **39.26 ms** against **47.25 ms**;
typing is **26.88 ms** against **32.18 ms**. The 100-target, 100-replacement-run
cohort remains red: **109.17 ms** against **65.31 ms**, exceeding the **78.38 ms**
limit. The baseline loses all 100 targets while the candidate retains them,
and unrelated host CPU contention limits timing attribution. Neither fact
waives the frozen gate. Deterministic counters establish one run extraction
per change and logarithmic target queries. There was no unchanged retiming to
obtain a pass; the bounded ordinary trial sequence is finished. Source hashes
and all earlier evidence remain unchanged.

The rejected probes establish why per-read ancestry and per-binding frontiers
must not return. The canonical probe selects the production architecture; it
does not constitute final native, UI/browser, installed-package or production
performance proof.

The [third native design receipt](artifacts/comments-attachment-discovery/prepared-design.json)
records the prepared candidate's correctness failures, bounded diagnostics,
source identities and unexecuted gates. Its failed result ends the original
three-trial sequence. The fresh accepted design supersedes that runtime
recommendation without rewriting its evidence. The prior
[partial design outcome](../research/review-records/2026-09-18-comments-attachment-design-partial.json)
remains historical; the final review record owns the implementation-ready
verdict.

The [immutable design review](../research/review-records/2026-09-18-comments-attachment-design-gate.json)
records the earlier deferred verdict and prior-decision reconciliation. The
current decision summary adds a new execution without rewriting old
implementation receipts. Plan/UI artifact links and recorded UI source hashes
pass. The native
[provenance receipt](artifacts/comments-attachment-discovery/native-provenance.json)
verifies ten final packets against 316–322 runtime files each with no mismatch.
The earlier [planning checks](artifacts/comments-attachment-discovery/planning-checks.json)
preserve their then-valid failures. Final checks rerun links, source identities,
canonical readiness and research history after this plan update.

Implementation evidence:

- The selected authored, revert and ordinary anchor contracts pass 56 focused
  source tests. The authored and core source-first TypeScript partitions pass.
  Plate Comments passes 55 package and React tests without a new public package
  primitive.
- The copied toolbar, card and Discussion surface pass 31 focused component
  tests. These cover optional Comments installation, All/Open/Resolved
  membership, unavailable targets, read-only discovery, 20-row pagination,
  dirty reply dismissal/paging guards, selection preservation and live filter
  movement after reopening.
- The complete Chromium comment specification passes 31 tests with two declared
  skips on a fresh server. It covers complete target deletion, unrelated later
  typing, repeated keyboard undo/redo, exact navigation, suggestion decisions,
  resolved persistence, historical review without Suggestions and current-view
  discovery. A fresh-server rerun of the four highest-risk flows produced no
  render-phase React warning.
- `pnpm --filter www typecheck` passes the editor, package integration, API
  references, docs, registry freshness/parity/source and route TypeScript gates.
  The generated `editor-ai` registry item installs and production-builds from
  clean Base Nova and Radix Luma consumers.
- The isolated [production benchmark](artifacts/comments-attachment-discovery/production-benchmark-result.json)
  passes every frozen budget: ordinary 10,000-target atomic replacement p95 is
  34.75 ms; the 100-target × 100-run cohort is 37.19 ms; authored 10,000-target
  atomic replacement and delete-then-type p95 are 49.03 ms and 54.30 ms;
  depth-10,000 warm reads are 0.018 ms p95; worst cold creation is 95.96 ms.
  One contended parallel run remains diagnostic only; the unchanged isolated
  rerun is the accepted complete-operation measurement.
- The aggregate `pnpm check:plite:dev` entrypoint and Plite application checks
  pass. Its low-memory `www-typecheck` wrapper reaches an unrelated existing
  `TS2589` in `packages/platejs/src/lib/plugins/HistoryPlugin.ts`; the full 8 GB
  `www` typecheck passes the same package-integration configuration.

Remaining limits:

- Twenty threads bounds mounted cards, not messages within one very large
  conversation. That pre-existing per-thread rendering limit is not a new
  whole-conversation scalability claim.
- Changed-baseline Yjs transport, persisted local undo and non-text targets
  remain outside this task.
- Prior Google Docs evidence is an existing all-comments panel with deleted
  suggestion targets. It does not establish complete regular-comment deletion,
  boundary replacement, pending-deletion or history parity. This plan states
  its own deterministic contract without claiming external parity.

Next action:

No local implementation work remains. Publication was not requested, so this
checkout is ready for the repository's normal authorized delivery path.
