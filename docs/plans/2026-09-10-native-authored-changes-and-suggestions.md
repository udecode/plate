# Native authored changes and Suggestions

**Build native authored changes in Plite and delete Suggestion's independent mutation engine.** Keep an accepted document plus retained proposed changes, and edit those changes through native editor views. Plate supplies the suggesting workflow. Comments retains conversations. Local undo and retained author history remain separate jobs.

Status: full execution authorized; S1 in progress. Target APIs below remain proposed until their implementation and proof are recorded.

Objective:

Implement the complete native authored-change and Suggestions architecture, its public API, adoption and production proof contract. Cover editable proposals, author-selected decisions, Discussions, collaboration and retained per-author history. Complete S1-S8 and the applicable F01-F32 proofs in this checkout.

Completion threshold:

All eight execution slices are complete with current package, type, browser, collaboration, format, registry, documentation and performance evidence for all applicable F01-F32 families. Planning probes remain scoped design evidence. Reconcile the selected Plite Plan template, performance pack and loaded implementation methods, then run the goal-plan checker.

Verification surface:

Current source and 205 inventoried files; current Plite and Suggestion contracts; atomic-capture, canonical-review, abstract-decision, edit/read scale, and incremental-checkpoint probes under `docs/plans/artifacts/native-authored-changes/`. Execution uses the existing package, Benchmark, managed browser, registry, and docs owners named below.

Constraints:

The user authorized full local execution on 2026-09-10. Product edits and required generated output are in scope. No branch changes, commits, push, PR, release, or new checkout. Current branch at execution intake: `next`. No Autoreview on `next`. The user's tool mapping requires sequential work; this is not an independent multi-agent review.

Boundaries:

- In scope: all authored document mutations; accepted and proposed content; native views; review grouping; author, replica, operation and decision identities; dependencies; local undo; retained history and selective revert; persistence, compaction and collaboration; Comments, Discussions, AI, formats, copied UI, current docs, and schema adoption.
- Applications own authentication, authorization, storage, transport configuration, and retention policy. Packages own document semantics, serializable feature data, binding, mapping, subscriptions, and disposal.
- This plan does not add a general version-control product, branch management, a server product, a second editor framework, or a required CRDT dependency for non-collaborative editors.
- Importing historical data is a specified execution capability. This task does not rewrite saved user documents. Release publication and an application rollout need their own authority.

Blocked condition:

A failed decision-changing planning probe or an unresolved representation/call-shape question keeps planning active. An execution gate is not evidence that the proposed feature works. Reopen the relevant decision if implementation contradicts its law; do not hide the contradiction behind a compatibility path.

Flow mode:

Full accepted-plan execution under Task and Plite Plan, continuing through Plate adoption and proof. The settled Best API/Architect comparison and pinned research remain applicable. One native execution goal and this plan own closure.

Primary template:

docs/plans/templates/plite-plan.md

Applied packs:

- performance-observability: `docs/plans/templates/packs/performance-observability.md`.

Decision brief:

- **Chosen shape:** accepted JSON plus a versioned authored-change graph in the canonical persistence envelope; native, incrementally materialized proposed/markup views over that state. Ordinary transforms remain `DocumentChange` operations. Retained slices and stable positions belong to Plite.
- **Largest cut:** delete Suggestion's serialized marks as review authority, command replacements, per-node identity reconstruction, independent accept/reject transforms, and editor-global suggesting state.
- **Strongest alternative:** one woven revision-aware content tree containing accepted, inserted and deleted versions. It makes provenance intrinsic, but exposes invalid intermediate structures to schema, selection, serializers, and ordinary consumers unless every read becomes visibility-aware. Keep that machinery private to retained slices and position mapping; do not make it the public AST.
- **Consequence:** this is a native runtime change. Splitting `BaseSuggestionPlugin.ts`, adding a Comments-like record map, or adopting a new CRDT alone cannot deliver editable proposals safely.

Current evidence:

The completed [research assessment](../plite/research/2026-09-10-authored-changes/assessment.md) and [follow-up audit](../plite/research/2026-09-10-authored-changes/skill-audit.md) retain the external evidence: 14 registered repositories plus Google Docs; nine focused deep reads, four bounded screenings, one metadata screening; five issue bodies and no PR bodies. Their upstream source refs remain pinned. No external runtime or Google Docs internal-storage claim is transferred to this plan.

The Comments motivation remains valid: wrong ownership, duplicate truth, and mismatched lifetime made conversations fragile. The current [package-data plan](2026-09-09-comments-package-data.md) gives Comments its records, mapped anchors, actions, subscriptions, and disposal. Applications fetch and save. A reply to a suggestion does not own the suggestion decision.

| Current owner | Source-backed fact | Design consequence |
| --- | --- | --- |
| `packages/platejs/src/features/suggestion/lib/BaseSuggestionPlugin.ts` | Schema metadata, command interception, review reconstruction, and accept/reject mutation share this owner. | Replace the mutation model, not its file layout. |
| Retained current-owner probe, freshly rerun | Direct `tx.changes.apply` under suggesting mode changes content and creates zero reviews. Rejecting Alice on the overlapping two-ID fixture also removes Bob's review. | Capture must cover the canonical mutation boundary; dependent decisions must report their scope. These are model observations, not native typing replays. |
| `packages/plitejs/src/core/public-state.ts`, `interfaces/editor.ts` | `transactionChange` runs inside the active transaction. Publication and observer notification are later boundaries. | Reuse native capture and rollback. Do not add a public second commit pipeline. |
| Fresh `capture-probe.mjs` | Normal text insertion and direct canonical application both publish captured metadata; a thrown transaction and a missing author roll back metadata and content. Reload retains the captured data. | Atomic local capture is feasible with existing facilities. The probe's local field is not a concurrent proposal collection. |
| `core/change/document-change.ts`, `builder.ts`, `document-index.ts` | Canonical changes have application, inversion, composition, serialization and pairwise transformation; indexed construction already exists. | Keep the algebra and incremental tree owner. Pairwise transformation does not decide author dependencies. |
| Fresh `canonical-review-probe.mjs` | One real Plite editor captures Alice's inserted block, derives Bob's dependency, and uses inverse/rebase projection to preserve Carol's independent accepted edit. | The algebra can represent the central review family. The slow snapshot/diff oracle is excluded from the production hot path. |
| `editor-runtime-view.ts` | Native views already scope root, read-only state, selection and extension APIs to one shared editor owner. | Extend this owner to review projections. Do not create a hidden second editor or a public replay controller. |
| `core/state-field.ts`, `core/public-state.ts:createEditorDocumentValue`, `core/clone.ts` | Whole-field writes clone values; persistence serializes fields and clones the metadata envelope. | A large authored collection needs incremental owned checkpoint publication, not repeated whole-list `setField`. |
| Prior shared-field counterexample | Two peers replacing a shared record list can converge in Yjs data while retaining different active field values. | Review records need per-record causal operations and deterministic reduction. An array field is not a merge protocol. |
| `history/history-extension.ts`, `yjs/core/shared-effect-log.ts` | Existing history/effect and transport owners provide facilities, including inverse changes and checkpoint handling. | Extend those owners; do not infer selective review semantics from facility tests. |
| `PlateContent.spec.tsx` | Existing value-change coverage includes persisted `meta` changes. | Preserve the existing full-envelope persistence notification. A pending proposal must remain saveable when accepted children do not change. |

Current source fingerprints and the reproducible discovery query are in [source-fingerprints.json](artifacts/native-authored-changes/source-fingerprints.json). The [consumer inventory](artifacts/native-authored-changes/consumer-inventory.tsv) includes generated and incidental mentions with separate dispositions. It is an adoption inventory, not 205 verified product behaviors.

Public usage:

The normal Plate setup keeps the existing constructor and extension composition. Add the `platejs/authored` facade for the native capability; do not add an `AuthoredPlugin` wrapper whose only job is forwarding the same API.

```tsx
// Target API. Saved document and thread data come from the application.
import { authored } from 'platejs/authored';
import { CommentsPlugin } from 'platejs/comments/react';
import { Plate, useCreateEditor } from 'platejs/react';
import { SuggestionPlugin } from 'platejs/suggestion/react';
import { BasicBlocksKit } from '@/components/editor/basic-blocks';
import { Editor } from '@/components/editor/editor';

const editor = useCreateEditor({
  extensions: [authored({ authorId: user.id })],
  plugins: [
    ...BasicBlocksKit,
    SuggestionPlugin,
    CommentsPlugin.configure({
      initialState: { currentUserId: user.id, initialThreads: saved.threads },
    }),
  ],
  initialValue: saved.document,
});

<Plate editor={editor}>
  <Editor />
</Plate>;
```

The copied mode toolbar calls `editor.api.authored.setView({ intent: 'propose', projection: 'markup' })` on its mounted view. It reads the same view through `editor.read.authored.view()`. Switching one view cannot change another view's input policy. A plain base editor defaults to accepted-content editing; requesting proposal intent is explicit for headless writes.

The raw Plite form is the same capability without Plate product policy:

```ts
// Target API; createEditor and createEditorView are existing public owners.
import { createEditor, createEditorView } from 'plitejs';
import { authored } from 'plitejs/authored';

const editor = createEditor({
  extensions: [authored({ authorId: 'alice', retainHistory: true })],
  initialValue: savedDocument,
});
const proposalView = createEditorView(editor, {
  authored: { intent: 'propose', projection: 'markup' },
});
proposalView.update.text.insert('Suggested wording');
const documentToSave = editor.read.value();
```

Author-selected decisions are one atomic native command. The selected IDs and their current heads are fixed when selected; an edit arriving later cannot silently join an earlier 'all' action.

```ts
const selection = editor.read.authored.select({
  status: 'pending',
  authorId: 'alice',
});
const result = editor.update.authored.decide({
  selection,
  action: 'reject',
});

if (result.status === 'blocked') {
  // Present result.dependencies; let the reviewer choose the complete scope.
}
```

Advanced callers use the active transaction without annotations or nested updates. The returned change ID is useful for an AI stream that later amends the same proposal.

```ts
let changeId;
editor.update((tx) => {
  changeId = tx.authored.propose();
  tx.text.insert('Draft');
});
editor.update((tx) => {
  tx.authored.propose({ changeId });
  tx.text.insert(' continuation');
});
```

`propose` is a transaction-only control set before the first mutation. An existing change must be pending and owned by the current author. A foreign author's edit creates a new change with a dependency. Ordinary callers never manufacture operation IDs, normalized steps, transport origins, or trusted authorship annotations.

Retained history is available without the Suggestion plugin:

```ts
const page = editor.read.authored.changes({
  authorId: 'alice',
  status: 'accepted',
  limit: 50,
});
const selection = editor.read.authored.select({ ids: page.items.map(x => x.id) });
const result = editor.update.authored.revert({ selection });
```

`revert` writes a new authored change. It does not change the original author, rewrite history, or treat the local undo stack as an archive. The default retention mode keeps pending data and the compact causal/decision information needed for correctness. `retainHistory: true` also retains closed authored content for history reads and revert. Expired history produces a typed retention result, not an empty successful revert.

Target contracts:

| Public surface | Contract and owner |
| --- | --- |
| `authored({ authorId, retainHistory? })` | Native opt-in extension, exported from `plitejs/authored` and re-exported by the exact `platejs/authored` facade. Identity is captured once per transaction. Missing identity rejects authored writes. Server authentication remains authoritative. |
| `read.authored.changes(query)` | Stable, paged immutable records; default limit 50, maximum 200. Filter by author, state and time. Cursor identifies a stable ordering/frontier; it never promises an unbounded materialized list. |
| `read.authored.change(id)` | One immutable record or null. The result includes its stable ID, author, kind, status, dependency IDs and display ranges in the calling view. It does not expose mutable nodes or transport payloads. |
| `read.authored.select(query)` | Immutable decision selection: exact IDs plus relevant revision/decision heads and dependency frontier. Selecting by author can cover all matching changes without truncating to a page. Explicit empty selection is a no-op. |
| `read.authored.preview({ selection, action })` | Same validation as `decide`, without mutation. Return exact prerequisites, dependants, conflicts and affected IDs. Do not return an approximate count that conceals other authors. |
| `update.authored.decide({ selection, action })` | Atomic accept or reject. Results distinguish applied, unchanged, stale, blocked, invalid and unavailable. Failed validation changes nothing. The internal command has a durable operation ID for duplicate delivery. |
| `update.authored.resolve({ selection, action })` | Resolve the complete observed concurrent-decision component; the selection binds the superseded decision heads. Missing members or new heads require a new preview. This is an explicit reviewer action. |
| `update.authored.revert({ selection })` | Selective historical compensation in the current transaction intent. Preserve independent later work; return dependencies/conflicts when compensation would overwrite another contribution. |
| `tx.authored.propose({ changeId? })` | Set proposal intent for this active transaction; return its logical change ID. Preserve inference and require no callback annotations. |
| `read.authored.view()`, `api.authored.setView(...)` | Exact-view input intent and projection. These are view state, not document state or a second global plugin store. Invalid combinations fail before an edit. |
| Existing `editor.read.value()` and initial-value codec | One coherent persistence envelope. Accepted children, pending changes, identity information and decision frontier are saved together. A mounted view does not serialize its rendered projection as the document. |
| Existing native anchors | Add a serializable document-range form and restore support to the anchor owner. Runtime handles still require disposal. Comments stores only the serialized range, never `NodeKey`, DOM nodes or live handles. |

Results use discriminated unions; a caller must handle `blocked`, `stale`, `conflicted` record state and retention limits. Failures include stable IDs and machine-readable reasons, not only message strings. There is no `force`, implicit dependency cascade, public untracked callback, per-command opt-in, whole-store setter, or second accept/reject implementation in Plate.

The public type work must prove conditional installation, facade identity, exact value/root inference, callback inference, transaction-only controls, readonly results and malformed argument rejection. The target signatures above are a specification; they have not been compiled as a new package implementation.

Representation and transaction flow:

1. **One authoritative envelope.** `children` and named roots remain the accepted JSON document. `meta.authored` uses a versioned native codec for pending/retained content, logical changes, operation identities, dependencies and decision heads. A proposed view is derived runtime state and is never independently saved.
2. **Native changes remain the edit language.** A transaction on a proposal view constructs ordinary `DocumentChange` against that view's draft, using the existing schema constructor and corrections. Capture the complete semantic transaction, including required corrections, before publication. The existing `transactionChange` hook supplies the observed low-level steps; the transaction owner groups and finalizes them once.
3. **Retain the content needed by decisions.** Keep inserted slices, deleted counterparts, scalar-property versions and structural placement dependencies. Link them to canonical change sections and durable positions. Do not keep a complete before/after document snapshot for every keystroke. Live immutable base/proposed snapshots share unchanged subtrees.
4. **Stable positions have native ownership.** Persist positions relative to a checkpoint and stable content/operation identity, with offset, root and affinity. Inserted content receives identity from its creating operation and ordinal. Runtime `NodeKey` remains editor-local. Moves retain content identity; split/merge preserve mappings. Compaction rewrites the position index and checkpoint together while preserving externally referenced IDs.
5. **Propose before publishing accepted content.** A proposing transaction updates the authored graph and the affected projected snapshot. The accepted root delta is empty. An editing transaction updates accepted content and rebases affected pending content. If it targets content that exists only in a proposal, return a proposal-required/dependency result rather than accepting that content implicitly.
6. **One publication boundary.** Stage accepted changes, authored effects, indexes, anchors and view deltas; validate them; publish one version; notify observers afterward. A failure restores every staged owner. Source-editor commits describe accepted coordinates; view subscribers receive the corresponding projected snapshots and canonical `DocumentChange` in that view's coordinates, sharing the same publication version. Keep the projection adapter private.
7. **Incremental checkpoints.** Store records/content in a private persistent page/index structure. A changed record replaces its pages and envelope references, not the whole collection. Extend the existing codec/publication owner to reuse already validated, internally owned immutable subtrees. Untrusted imported JSON still receives complete validation and detachment. The disposable binary tree is an experiment, not a public format or a prescribed branching factor.
8. **Per-record collaboration operations.** Transport immutable operation IDs, causal prerequisites, content changes and decision records through the existing Yjs adapter/effect transport. Reduce by identity and causality; do not transport a last-writer whole-array replacement. A content update and its authored metadata share one transport transaction and one checkpoint frontier.
9. **Two separate indexes.** DocumentIndex owns content/position materialization. The authored owner indexes change IDs, authors, pending status and dependency edges. They serve different queries. There is one authored index per document and one derived cache per distinct active projection, not one canonical store or global listener per card/view.
10. **Explicit expensive operations.** Full export, save encoding, archive reads, compaction and whole-document review can be proportional to their requested output. Ordinary localized edits cannot trigger full-document diff, whole-history replay, full proposal serialization or scans of unrelated proposals. The slow reference oracle remains a test oracle only.

Concurrent edits use the existing collaboration order and canonical transformation where applicable. Dependencies carry content existence and non-commuting structural/property decisions; spatial overlap alone is not a dependency. A change that deletes or relocates a container records the affected structural relationship. Concurrent root lifecycle changes and schema conflicts cannot be hidden behind `DocumentChange.transform`, which currently rejects some such combinations. Retain both payloads as an explicit conflict and prevent an invalid accepted projection; do not delete a peer's content merely to obtain schema validity.

This representation combines the useful part of retained/woven content—durable identity and old slices—with a valid accepted AST. It avoids a mandatory Yjs 14, Automerge or Loro storage replacement. Yjs 14's base/proposal renderer is pinned prior art, not a runtime dependency or an upstream test receipt.

Review behavior:

| Situation | Required outcome |
| --- | --- |
| Alice types, formats, pastes or restructures while suggesting | The proposal changes; accepted content remains unchanged; the action's normalization belongs to the same change. |
| Alice edits her own pending insertion later | Amend that logical change with another immutable operation. Keep its ID so replies and selection remain attached. |
| Alice types next to her earlier insertion | Plate can group adjacent compatible typing from the same view/author within 500 ms. A selection jump, semantic command, mode switch, composition boundary or foreign contribution ends automatic grouping. Grouping never merges authors. |
| Bob edits content introduced by Alice | Create Bob's change with an existence dependency on Alice. Preserve both authors and both review identities. |
| Accept Alice's parent change | Commit Alice's content; keep Bob's edit pending. |
| Accept Bob before Alice | Return Alice as a prerequisite. Do not accept Alice implicitly. |
| Reject Alice while Bob depends on her | Refuse the whole requested batch. Return the complete dependency closure, including Bob. The UI offers an explicit expanded decision or lets the reviewer choose independent changes. |
| Reject all changes by an author | Freeze every matching pending ID and relevant heads. Validate the entire batch. Apply all selected decisions or none. No newly arriving change joins the batch. |
| Same decision is delivered twice | Same identity and payload is idempotent; the second delivery creates no new history or notifications. Identity reuse with a different payload is rejected. |
| Two reviewers concurrently choose the same outcome | Converge to that outcome while retaining both reviewer records where history policy requires them. |
| Concurrent decisions disagree | Mark the entire connected set of overlapping atomic decision batches conflicted. Preserve content and decision records; do not choose a winner by wall-clock time or silently keep only part of a batch. |
| Resolve concurrent decisions | Require the full conflict component and the observed heads. A new concurrent head reopens the conflict. The resolution is a new attributed decision record. |
| An offline decision later conflicts | Its local projection was provisional. Recompute the affected accepted/proposed region from retained data and show the conflict; retain later dependent edits as blocked contributions. Local commit does not mean server acknowledgement or durable save. |
| Local undo after proposing | Undo the local authored operation and its mapped selection. It does not reject every change in the review group or act on another author's history. |
| Undo a review decision | Issue the corresponding attributed compensation against current heads; a stale/foreign dependent decision may require conflict handling. Do not erase the original decision record. |
| Revert Alice's retained history | Create a new change attributed to the reverting actor. Preserve Bob's independent later edits. Non-commuting dependent work requires explicit resolution. |
| Required history has expired | Return unavailable with the retained frontier; never pretend a partial or empty revert succeeded. |

The conflict policy favors retained intent over silent loss. It deliberately accepts explicit blocked/conflicted states. Product copy should say which other changes are involved, not expose CRDT terminology.

Native view and input contract:

- `accepted` shows accepted content; `proposed` shows the result of pending proposals; `markup` also displays removed content and formatting/structural changes. The primary root stays implicit; named-root identity is preserved.
- Proposed insertions are ordinary editable native content. Removed counterparts are retained review content with mapped positions and explicit editing restrictions. They are not inserted back into the accepted AST to fake a decoration.
- Markup for invalid intermediate structures, especially deleted table rows, uses the native retained-fragment projection. Schema validation applies to each materialized editable document. Decorative badges and review-card excerpts do not become hidden canonical text.
- Selection and clipboard operate in an explicit view coordinate space, mapping through the native durable position index. A range crossing accepted, inserted and removed content preserves direction and affinity. Clicking removed content can select/review it; typing there requires an explicit restore/proposal action.
- The same owner handles keyboard input, beforeinput, composition, DOM reconciliation, paste, cut, drag/drop, commands, external text views and programmatic canonical changes. No feature can opt into correctness by remembering a Suggestion transform.
- Defer a mode/projection change until an active composition commits or is explicitly cancelled. Switching views maps the selection without stealing focus or publishing content. Native scheduler ownership and final navigation scroll order remain unchanged.
- Copied UI owns visual style, review cards and menus. Plite owns editable projection, positions, native selection, input and retained-fragment behavior. An unavailable operation fails before accepted mutation and leaves an actionable reason.

Comments and Discussions:

Preserve `BaseCommentsPlugin` as the owner of thread records, bodies, mapped anchors, actions, subscriptions and disposal. Keep `initialThreads`, live `api.setThreads`, and `api.getThreads`. Applications continue to fetch/save coherent document-plus-thread data.

Use stable authored change IDs for suggestion replies. Rename the stored target discriminator from `suggestion` to `change` during the approved data migration. A range comment stores a native serialized document range, which can address accepted, pending or retained content. The Comments adapter owns binding and rehydration; copied UI and the application do not manage live handles.

Accept/reject updates change status and range resolution. It does not delete messages, move them into a second store, implicitly resolve a discussion, or synthesize a duplicate range thread. A removed range becomes explicitly detached with its excerpt and target history retained. Accept/reject/undo/reload must preserve replies and explicit resolved state.

Discussion is the combined presentation and navigation layer. Replace its mirrored review payloads with stable IDs and keyed native reads. Retain only layout, visibility, navigation and active-card state that has a current UI job. Deleting the Discussion UI would lose the combined review/conversation workflow; keeping a separate Discussion mutation or persistence authority earns no such job.

Make authored review optional in Discussion. The current copied Comment UI installs Suggestion through Discussion; that dependency must disappear for comment-only editors. An absent authored capability contributes no review items and never requires a fake author or empty native history store. Test Comments only, authored only, both, and explicitly configured combinations.

AI and format behavior:

AI writes through proposal intent when offering a reviewable change. Streaming chunks amend one authored change owned by the authenticated initiating actor, with AI source metadata identifying the tool/model separately. Cancellation withdraws only that operation's pending work and reports dependencies if another author has built on it. Network failure retains a truthful failed/incomplete stream state and recoverable content. Accepting AI output uses the same native decision command.

Inline autocomplete stays a separate transient interaction until committed; it is not automatically a durable review proposal. Remove `suggestionTransient`, property-based diff output and AI-specific accept/reject mutation loops for tracked changes. AI streaming, Markdown parsing and external service success retain their own existing contracts.

Every serializer chooses a projection explicitly: accepted, proposed, or markup/review-preserving where that format supports it. Default ordinary export is accepted content. Preserve review data in the canonical JSON envelope. Markdown/HTML review-preserving adapters carry supported semantics and stable IDs; unsupported semantics return diagnostics and require a deliberate projection export. Plain copy/paste across documents creates new authored identities; source document credentials and identities are never trusted as the target author's identity.

Current DOCX import source extracts comments through Mammoth and a detached snapshot; it does not establish complete DOCX tracked-revision roundtrip support. S7 must support reading/writing the tracked insert/delete/format/structural revision forms in the promised review-preserving DOCX lane, preserve supported IDs/author metadata, and report unsupported constructs. If this requires additional parser work, it is part of that slice, not evidence of existing parity. Never silently flatten a requested review-preserving import/export.

Alternatives and synthesis:

| Candidate | What it hides / exposes | Verdict |
| --- | --- | --- |
| A: accepted document plus indexed retained changes and native views | Hides rebase, retained content and coordinate mapping in Plite. Exposes an ordinary editor, explicit projection and dependency results. | Selected. The canonical-review/capture probes establish the minimum model path; edit/read and checkpoint experiments justify incremental ownership. |
| B: woven revision-aware public AST | Makes provenance intrinsic but requires schema, ordinary reads, selection and every serializer to interpret visibility/tombstones. | Reject as the public model. Retain its useful content identity and old-version mechanics privately. |
| C: marks plus increasingly complete command rewriting | Leaves input coverage, node-property protocols, normalization and review scans in a product plugin. | Cut. The current canonical bypass and collateral-rejection observations contradict the required boundary. |
| D: a plain Comments-style proposal map | Gives easy IDs and subscriptions but cannot make absent content editable or define concurrent merge/decision semantics. | Reject as a complete architecture. Keep keyed record access as one internal query facility. |
| E: mandatory Yjs 14/Automerge/Loro core | Supplies useful identity/history/merge machinery but couples every editor to another storage model and still leaves schema, projection and review dependencies unsolved. | Reject as a mandatory dependency. Keep the existing Yjs adapter; pinned external source remains comparison material. |
| F: whole history replay or whole-document diff after each edit | Makes an oracle easy but makes unrelated history/proposals part of every keystroke. | Keep only the disposable reference oracle; prohibit on the live localized path. |
| G: one public Revisions manager plus providers/controllers | Adds an application lifecycle around jobs already owned by the editor, native views and Comments. | Cut. `authored` is an opt-in editor capability, not a host-managed framework. |

Architect's distinct candidate questions were run sequentially under the user's tool mapping. There was no independent-agent or independent-model-family review. The synthesis keeps A's external shape and the necessary retained-identity mechanics from B. Implementation must be scrapped/replanned if repeated feature-specific mutation wrappers, full replay on input, or unbounded view stores become necessary.

Decision ledger:

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Edit algebra | Canonical DocumentChange | Same mutation language with native authored capture | Plite change/transaction | Exact inversion, mapping and schema construction already have an owner | S1, S2; native and Plate facades | Capture, canonical-review, current algebra contracts | Confusing view and accepted coordinates | keep |
| Authored records | Suggestion metadata in nodes | Retained graph with stable operation/change/decision identities | Plite authored | Editable absent content and per-author history are independent native jobs | S1, S2, S4; new entrypoints and docs | Decision/capture/canonical probes; F01-F12 | Incomplete dependency derivation | rearchitect |
| Persistence | Whole-field clone/serialize facilities | Coherent incremental checkpoint and explicit full encoding | Plite value codec/publication | Avoid whole-collection work during localized updates | S1, S4; persistence callbacks and migration | Checkpoint experiment; F11-F12, F30 | Untrusted frozen objects bypassing validation | rearchitect |
| View state | Global isSuggesting plus native read-only view state | Exact-view intent/projection in native view owner | Plite views; Plate toolbar | Two views can have different user intent | S3, S5; mode docs and copied controls | Existing view contracts; F08, F21-F27, F32 | IME/caret mapping | rearchitect |
| Suggestion plugin | Independent mutation, schema metadata, scan reads | Product grouping/descriptions/shortcuts and native presentation adapter | Plate Suggestion | Product workflow remains, mutation duplication does not | S5; all nine suggestion-owner files and consumers | Current observations, indexed-read experiment; F01-F07, F31 | Incomplete caller cut | cut |
| Comments | Package-owned data and live ranges | Same data owner with durable native range/change targets | Plate Comments + native anchors | Retain replies across decisions, views and reload | S5, S7; comment docs and fixtures | F12-F14, F31 | Detached/expired ranges | rearchitect |
| Discussion | Combined UI plus derived review payloads | Combined keyed presentation/navigation | Registry Discussion | Independent UI job; no independent decision truth | S5; discussion demo/proof/docs | F14, F26, F30-F32 | Stale status or duplicate replies | cut |
| Local undo | History owner records changes/effects | Same owner, authored-operation inverses and mapped selection | Plite History | Undo has a local interaction lifetime | S2, S4; history docs and tests | Current facility contracts; F09 | Undo masquerading as rejection | keep |
| Retained author history | No complete native authored archive contract | Optional retained authored records, paged reads and compensating revert | Plite authored; app retention | Explicit user job distinct from local undo and pending review | S4; history example and docs | Decision-model revert; F10-F11, F28, F30 | Missing retained payload | rearchitect |
| Collaboration | Yjs document/effect transport | Same adapter with per-record causal authored operations | Plite Yjs | Convergence needs deterministic meaning, not whole-array replacement | S4; collab docs and transport tests | Prior shared-field counterexample; F05-F07, F11, F28 | Conflicting decisions/checkpoint races | rearchitect |
| AI tracking | Transient node props and private decision loops | Native propose/amend/decide | Plate AI | One review authority across human and AI input | S6; AI docs/registry/tests | F25, F31 | Stream cancellation loses foreign work | cut |
| Formats and saved data | Mark-based review fixtures and codecs | Explicit projection export; versioned review envelope and migration | Format owners + v54 migration | Serialized data is a hard law | S7, S8 | F12, F23-F24, F31 | Ambiguous legacy overlap | rearchitect |
| Generic controller/provider/second editor | Proposed possible wrappers | None | Existing editor and view lifetimes | No independent job | No bridge or app replay adoption | Owner tracing and candidate comparison | Hidden duplicated state | cut |

Execution slices:

No slice below is implemented by this planning task. Order is by dependency. Architectural value ranks the native mutation boundary first, safe decisions/identity second, and deletion of product duplication third.

| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| S1 — native state and capture | Plite Plan; core transaction/value/anchor owners | Add authored entrypoint, stable IDs, causal records, local capture, incremental checkpoint and serialization. Preserve accepted AST and current value notification. Add exact Plate facade. | Accepted plan and execution authority; fresh source fingerprints | A failed transaction changes neither content nor authored state; pending edits persist without accepted mutation; unknown data/identity fails closed; no whole-collection serialization on input | F01, F06-F07, F11-F12, F29-F31; rerun both frozen scale contracts on installed native path |
| S2 — decisions and authored undo | Plite authored + History | Dependency derivation for native sections; atomic author/ID decisions, conflict components, compensation, grouping and local undo | S1 coherent local state | Text, format, structural and root decisions preserve independent contributors; no silent cascade; local undo and decisions remain distinct | F02-F06, F09-F10, F15-F20; compare installed behavior with retained decision/canonical oracles; same scale cohorts for individual and bulk decisions |
| S3 — native editable views | Plite DOM/React/views | Accepted/proposed/markup projection, retained fragments, durable selection, input and clipboard mapping, exact-view policy | S1; S2 decision laws | Two views and two editors retain correct intent, content, focus, selection, IME and undo; all scoped native paths pass before Plate adoption | F08, F13, F18-F23, F26-F27, F30, F32; managed native-view cases and actual browser controls; production event-to-paint rerun |
| S4 — collaboration and archive | Plite Yjs + authored/history codec | Per-record causal transport; duplicate/stale/concurrent decisions; checkpoint plus tail; reload/offline/reconnect; retained history/revert/retention | S1-S3 local correctness | Two/three peers converge in accepted content, pending state and decisions; all payloads recover after compaction; stale peers cannot resurrect discarded state; archive failures are explicit | F05-F07, F09-F12, F20, F28-F30; real Yjs peers and transport checkpoint tests; history-size and view-count cohorts |
| S5 — Suggestion, Comments and Discussion cut | Plate Plan, Plugin Creator, Plate UI | Remove old Suggestion schema/mutations/scans and global intent. Adopt native reads/decisions/rendering. Preserve Comments data and replies. Migrate copied features and primary demos | Native package/view/collab gates green | One decision authority; no legacy property protocol in live producers/consumers; discussion and mode controls work on real routes | All applicable F01-F23, F26, F30-F32; 205-file inventory dispositions; discussion/comment/suggestion integration and browser proof |
| S6 — AI adoption | Plate AI and streaming owners | Native streamed proposals and atomic decisions; cancellation/failure/dependency behavior; preserve uncommitted autocomplete job | S5 APIs stable | Human and AI tracked edits use the same native records; failed/cancelled stream cannot erase a foreign edit | F25 plus native input/undo cases; AI package and registry integration proofs |
| S7 — saved data and formats | Existing migration, Markdown, HTML and DOCX owners | Approved v54 conversion and native envelope/anchor codecs; projection-aware serializers; review-preserving formats with diagnostics | S1-S6 target schema/types fixed | Historical fingerprints preserved; ambiguous legacy data rejected without loss; import/export roundtrips and explicit lossy choices proven | F12-F14, F23-F24, F31; golden fixtures and runtime/CLI migration parity |
| S8 — adoption and handoff | Task, Verify Plate, Docs, Plate Next | Public types/entrypoints, current docs, examples, registry outputs, source doctrine, final package/browser/performance proof | S1-S7 feature proof green | Complete source/caller/generated cut; final installed path passes frozen contracts and all 32 applicable proof families; no unsupported release claim | Strict Plite lane, scoped Plate partitions, docs/registry/install proof, browser matrix, doctrine mirror checks |

Before each slice, recheck its live owners and the saved benchmark input identities. During S1-S4, the old Suggestion engine may remain only in the unadopted current product; installing both tracking engines on one editor is rejected. S5 removes that old engine and its live exports. This sequencing creates no public compatibility aliases or permanent dual runtime.

Adoption inventory:

The generated inventory records each path, owner, disposition, slice, first matched source line and SHA-256. Rerun `node docs/plans/artifacts/native-authored-changes/inventory.mjs` at execution intake. The fixed discovery roots cover current package source/type tests, www source/tests, public docs and tooling; named Plite native owners are added explicitly. New files that appear during execution join the same inventory.

| Consumer family | Required adoption and deletion |
| --- | --- |
| Base/React Suggestion and barrels | Replace all nine inventoried owner files' current shape; delete mark/element property declarations, `SuggestionData`/`InlineSuggestionData` producers, skip/transient tags, per-command insert/delete/set/accept/reject implementations and node scans. Keep focused tests by behavior, not deletion assertions. |
| Core/facade/entrypoints | Native authored subpath, exact Plate proxy, exports/manifests/DAG, creation inference, declarations and SSR/headless import proof. Existing transforms inherit capture through the native boundary, not per-feature adapters. |
| Native transaction, values, anchors and views | Core owner paths are enumerated separately from Suggestion string matches. Adopt commit coordinates, persisted envelope sharing, native ranges, History and Yjs together. Preserve all unaffected runtime laws through existing focused tests and the strict handoff lane. |
| Copied suggestion/discussion/mode UI | `suggestion.tsx`, static rendering, toolbar buttons, `discussion.tsx`, mode controls, editor-ai shell, and their tests. Replace read-all review arrays with membership plus keyed records. Keep active-card/layout state view-local. |
| Feature rendering and styles | Date, link, mention, math, media and inline-void consumers use native change attributes/ranges and retained-fragment rendering. Remove direct Suggestion node-property inspection. Shared styling alone does not justify another runtime owner. |
| Fixtures and examples | Discussion demo/proof, playground EN/CN, suggestion/AI values, Markdown serializer fixtures and AI consumers must use the native saved envelope. Do not hand-annotate proposed text with legacy properties. |
| AI | `BaseAIPlugin`, `AIChatPlugin`, tracked diff helpers, `inline-suggestion.ts`, menus and lifecycle tests. Preserve autocomplete-only matches. |
| Comments | Preserve package record lifecycle; migrate serialized targets and native anchor binding. Comment-only editors must continue to work without authored review installation. |
| Public docs | Suggestion, Discussion, Comment, AI and affected editing/serialization guides in EN/CN. Add authored native/facade reference and retained author-history recipes; update existing Plite history/Yjs docs and version-history example. Public pages describe implemented current state after adoption. |
| Registry/generated artifacts | Source registries, dependency metadata, `plugins.ts`, generated plugin/schema files, API reference manifest, `src/__registry__` variants and `public/r` outputs. Use generators, never hand edits. Match copied install variants to their real consumer. |
| Historical and incidental mentions | Preserve v48/v53 historical migration inputs and changelog history. Preserve search/completion suggestion wording and unrelated autocomplete behavior. These are explicit dispositions, not missing edits. |
| Migration/tooling | Update schema adoption gates and entrypoint consumers. Fold this unreleased data break into the approved v54 target. Preserve immutable historical fingerprints and package attestations. |

The native serialized range, history/Yjs docs and generated `public/r` outputs are transitive adoption obligations even when their source does not contain the word 'suggestion'. Templates remain CI-controlled outputs. Do not edit templates manually or retain verification-generated template changes.

Proof matrix:

There are **32 target contract families**. A family may require several cases and platforms. This is the implementation denominator; the planning probes below do not mark the 32 families passed.

| ID | Required contract | Execution owner and oracle |
| --- | --- | --- |
| F01 | Insert/delete/replace proposes without changing accepted content | Native package; exact accepted, proposed and saved values |
| F02 | Own proposal amendments retain ID, grouping and replies | Native + Suggestion; separate operations, stable logical ID |
| F03 | Foreign edits derive complete dependencies | Native; container/text/property provenance, independent edits retained |
| F04 | All-by-author and explicit-ID batches are atomic and snapshot-bound | Native; full selected denominator, stale arrival and empty selection |
| F05 | Concurrent overlapping decisions resolve as whole atomic components | Native + Yjs; opposite order, duplicates, explicit resolution and new concurrent head |
| F06 | Identity, decoding and idempotence reject collisions/malformed input | Native codec; duplicate identical operations no-op, changed payload rejected |
| F07 | Every ingress captures original intent before publication | Core + adapters; typing, commands, canonical changes, remote delivery, imports, corrections |
| F08 | Two views over one owner and two independent editors preserve coordinates | Native views; accepted/proposed/markup, roots, direction and collapsed/expanded selection |
| F09 | Local undo/redo retains author, proposal identity and selection | History; local/remote interleaving and view-scoped actions |
| F10 | Selective author-history revert preserves independent later work | Authored history; text, properties, structure, dependency refusal and new actor attribution |
| F11 | Checkpoint, tail, compaction and retention preserve required history | Native + Yjs; active pending records, decision IDs, pinned anchors, stale peer and expired history |
| F12 | Save/reload is coherent across document, proposals and comments | Native codec + Comments; failure between writes, persisted metadata notification and schema version |
| F13 | Comments inside inserted/deleted/moved content retain or detach correctly | Anchors + Comments; selection range, excerpt and reload |
| F14 | Replies and explicit resolution survive accept/reject/undo/history | Comments + Discussion; no deletion, duplicate thread or mirrored status |
| F15 | Concurrent formatting and property review preserves each contribution | Native schema; marks, scalar conflicts, set-valued props, removal and mixed authors |
| F16 | Split/merge/wrap/list normalization is one attributable semantic action | Native + List; both decision directions and follow-up typing |
| F17 | Table row/column/cell/span edits remain valid in every view | Native + Table; overlapping authors, delete/edit conflicts and clipboard |
| F18 | Move/drag/drop preserves content identity and anchors | Native + DnD; same/cross-root and pending-container moves |
| F19 | Links, mentions, dates, math and media survive review | Native + feature owners; inline/void behavior, static output and deletion |
| F20 | Named roots/footnotes have explicit lifecycle conflict semantics | Native + Yjs; create/delete/concurrent edits, ownership and stale references |
| F21 | Keyboard deletion respects graphemes, words, lines and direction | DOM/browser; Unicode, emoji, RTL, boundaries and follow-up input |
| F22 | Composition commits/cancels atomically and survives view changes | DOM/browser plus real IME when claiming it; composition proxies labelled separately |
| F23 | Copy/cut/paste maps view positions and creates safe target identities | Native clipboard and format owners; trusted native event and result, internal/external documents |
| F24 | Explicit format projections and review-preserving roundtrips are truthful | JSON/Markdown/HTML/DOCX; golden fixtures and unsupported-feature diagnostics |
| F25 | AI streams amend one proposal and fail/cancel without foreign loss | AI package + real registry consumer; service success distinguished from demo fallback |
| F26 | Mode/focus/selection changes affect only the originating view | Native views + toolbar; composition deferral, remount, readonly and navigation |
| F27 | External text editors use the same authored boundary | External-text runtime/CodeMirror consumer; typing, undo, paste and projected decorations |
| F28 | Two/three peers converge in content and review meaning | Real Yjs; offline/reconnect, six three-peer delivery orders, duplicate/out-of-order operations |
| F29 | Unknown feature/identity/permission cannot silently mutate accepted content | Core + app boundary; atomic failure and actionable capability/error results |
| F30 | Localized work and complete visible operations meet frozen budgets | Benchmark; normal/large/stress/overlap/zero/history/view cohorts, counters, percentiles and heap |
| F31 | Public types, docs, migration and copied installs teach one shape | Package type lanes, docs source/render proof, migration goldens and registry install cases |
| F32 | Disposal, SSR, inactive/unmounted views and stale callbacks are safe | Native React/Comments/Suggestion; no retained listeners or cross-editor data |

Execution commands:

Create the new native contract files in the existing package proof owner before running their paths:

```sh
bun test --preload ./config/plite-source-test-setup.ts packages/plitejs/test/authored-changes-contract.test.ts
bun test --preload ./config/plite-source-test-setup.ts packages/plitejs/test/authored-changes-collaboration.test.ts
bun test --preload ./config/plite-source-test-setup.ts packages/plitejs/test/authored-changes-history.test.ts
pnpm turbo typecheck --filter=./packages/plitejs --filter=./packages/platejs
pnpm check:plite:dev
```

Run affected Plate partitions through `tooling/scripts/run-entrypoint-task.mjs` for `suggestion`, `suggestion-react`, `comments`, `comments-react`, `ai`, `ai-react`, `markdown`, and the affected format owners. Reuse behavior specs after changing their expected contract; do not retain old implementation-shape tests as API requirements.

Add the raw authored example to `apps/www` and the existing canonical Plite example registry; `apps/plite` imports that source. Add its cases under `apps/plite/tests/plite-browser/donor/examples/authored-changes.test.ts`. Then use:

```sh
pnpm --filter plite test:plite-browser:chromium authored-changes.test.ts
```

Plate product proof must exercise the actual `/blocks/discussion-demo`, the existing discussion proof route and the Suggestion/Comment docs previews. Run the existing www browser runner against the exact source-serving instance and added authored cases; use available Browser/Chrome controls for native profile, clipboard and OS input claims. Before a full architecture completion claim, run `pnpm check:plite` and `pnpm check:plite:browser-matrix` plus affected Plate proof. Browser viewport emulation does not certify physical devices. Raw device proof is required only for an explicit device/release claim, using the existing fail-closed raw runner.

After export/registry/doctrine adoption, run `pnpm brl`, `pnpm --filter www build:registry`, `pnpm --filter www check:docs`, applicable copied-install checks, and `pnpm lint:fix`; include generated outputs. Run `pnpm install` when required by source-rule/dependency changes. Do not build packages merely to typecheck a source graph. No product generator is run by this planning task.

Scale contract:

The frozen [edit/read contract](artifacts/native-authored-changes/probe-contract.json) predates its measurements. Its six cohorts are zero (1,000 blocks/no pending reviews), normal (100/100), large (1,000/1,000), stress (10,000/10,000), eight reader fan-out (1,000/1,000), and overlap (one block/1,000 IDs). It uses 20 warmups, 100 measured actions and three passes, reversing arm order. The complete measured operation is synchronous insertion, capture and current-card reading, not event-to-paint.

All 18 rows passed the frozen model budget. Across all passes, current/target p95 ranges were:

| Cohort | Current p95 ms | Disposable target p95 ms |
| --- | ---: | ---: |
| Zero | 1.39–2.04 | 1.50–1.72 |
| Normal | 2.92–5.30 | 0.77–1.12 |
| Large | 10.87–15.40 | 1.12–1.51 |
| Stress | 101.49–138.11 | 8.21–12.55 |
| Eight readers | 11.22–14.79 | 1.20–1.47 |
| Overlap | 61.17–198.18 | 0.64–0.96 |

These figures support keyed review ownership and avoiding mark-rewrite/read-all work. The candidate captures through a post-commit observer, seeds its index, and updates one current card. It is not a complete native proposal implementation. Reader fan-out is modeled as reads, not eight mounted views. The wide overlap baseline spread is retained; there is no stable product speedup claim. Serialized byte sizes are recorded; they are not heap measurements.

The separate [checkpoint contract](artifacts/native-authored-changes/checkpoint-contract.json) freezes 100/1,000/10,000 records, 10 warmups, 30 samples and three passes before measurement. All nine rows passed. At 10,000 records, current update/read p95 was 221.06–338.34 ms; the disposable page checkpoint was 0.14–0.24 ms. It compares current persisted whole-field update/read with an immutable page update plus a real scalar native commit. Correctness decodes every record, preserves previous snapshots and checks untouched subtree identity. Full JSON serialization is timed separately because producing the complete output necessarily visits it. The large difference identifies whole-field cloning/encoding as unsuitable; it is not an installed native-proposal speedup. The [receipt](artifacts/native-authored-changes/checkpoint-receipt.json) retains the noise and that limitation.

The production contract carries both fixtures and adds actual user-facing latency, retained memory and native correctness:

- Normal/large event-to-paint p95 at most 50 ms and p99 at most 100 ms. Measure the entire input/commit/render/selection operation. Record cold mount separately.
- Zero-review p95 overhead at most the larger of 10% or 1 ms; retained heap overhead at most 10%. Disabled capability performs no authored work.
- Large/stress localized edits visit no unrelated proposal/history records. Mounted cards read their own records. Shared projection work runs once per distinct projection and commit, with exact-view selection work separate.
- Compare matched semantics/schema/output, including baseline limitations. Never calculate a speedup for a behavior the baseline cannot perform. Include single and bulk decisions, dependent/conflicted cases, full save/load, compaction, one/1,000/10,000 retained-history entries, and 1/2/8 actual views as independent variables.
- For matched review fixtures, retained heap is at most 1.5 times the baseline after equivalent GC/quiescence. Archive retention is measured against the same retained payload, not an archive-free baseline. Explicit output-size work is reported separately.
- No whole-document diff, history replay or proposal serialization during a localized edit. Record touched change sections, dependency nodes, checkpoint pages, mounted views, card reads and retained bytes. Large legitimate decision/output size is reported as such, not hidden by pagination or debounce.
- Preserve every pass and source/environment fingerprint. No budget overrides have been accepted. A failed native/cohort gate stops adoption and sends the measured owner back through Benchmark under this same plan.

Extend the existing Benchmark target and runner inventory during S1/S3; do not install a parallel permanent benchmark program. The exact frozen fixture adapters must call the installed native API before S1/S3/S4 exits. Reuse current `profileCoreDuration` for opt-in capture/projection/decision/checkpoint timing, with counts and durations only. Do not log content, author IDs, credentials or document identifiers. A production detector/backend is outside this planning task; the execution detector is the existing profile/benchmark owner, not a new telemetry service.

Risks and hard-cut response:

| Risk | Concrete failure | Response and proof |
| --- | --- | --- |
| Position/projection error | Rejecting a structural insertion deletes or moves a different author's accepted text; a caret types into the wrong view position | Native durable identity and dependency closure; F03, F08, F16-F23 before copied UI adoption. Preserve the failing fixture and stop that slice. |
| Persistence/collaboration split | Pending content is lost on save, two equal Yjs documents expose different reviews, or compaction drops a referenced deleted slice | One envelope/frontier; per-record causal operations; full decode/merge and stale-peer oracles in F05-F12/F28. Never accept whole-array last-writer storage. |
| Native input mismatch | Composition, paste or CodeMirror writes bypass tracking or repair the wrong DOM selection | Canonical capture, exact-view ingress and native proof in F07/F21-F27. Unknown operation fails before publication. |
| Hidden linear work | Fast keyed UI still serializes every pending record or replays history during each keystroke | Incremental checkpoint/DocumentIndex owners; retain design receipts and rerun installed paths for F30. |
| Ambiguous historical data | One legacy span claims two authors without enough provenance to distinguish their contributions | Report ambiguity and retain the original source envelope; require an explicit import disposition. Do not silently invent authorship. |
| Feature/version drift | A custom schema or old client cannot understand the authored envelope | Version negotiation and validation before writable collaboration. Open unsupported state read-only with a diagnostic; do not strip unknown authored data. |

The rollback answer is to keep the affected unadopted consumer on its prior complete implementation until the native slice passes, then hard-cut once. Do not run both engines on the same editor or restore mark-authority aliases after the cut. A failed final replay uses the project's Regression repair rule before another product fix. Two repeated architectural workarounds reopen this plan through Best API/Plite Plan.

Doctrine and documentation repair:

During execution, repair the smallest changed durable law in `docs/vision/plite.md` and `docs/vision/plate.md`: canonical authored state, accepted/projected coordinates, local undo versus retained history, and exact-view intent. Keep root Vision changes limited to mandatory shared law.

Review affected teaching in `.agents/rules/best-api.mdc` and its ownership/identity leaves, `.agents/rules/plite-plan.mdc`, `.agents/rules/plate-plan.mdc`, `.agents/rules/plate-plugin-creator.mdc`, `.agents/rules/plate-ui.mdc`, `.agents/rules/verify-plate.mdc`, and the current Plate Docs owner. Change only teaching that is contradicted by the implemented contract. Update current public docs at the same adoption boundary. A planning proposal must not make current docs claim an unimplemented API.

Append the required Plate Next doctrine version through its version helper, preserving all historical versions and package attestations; regenerate mirrors with `pnpm install` and verify with `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`. Reusable workflow changes use Maintain Workflow and Agent Native Reviewer, with other-project syncs separately authorized. This task changes none of those sources.

Conditional evidence:

- External research is consumed from the pinned packet; no repeated broad discovery or upstream-runtime claim.
- Browser/native/IME proof is mandatory during execution because the target changes the input model. No browser was driven for this planning-only result and no screenshot claims are made.
- P1 Autoreview, public issue/PR action and release lanes are inapplicable: current branch is `next`, this is planning, and no publication was requested.
- Database transactions, SQL plans, pagination of database queries and service credentials are inapplicable to this local editor design experiment. Archive pagination and explicit storage atomicity remain in scope.
- Benchmark's embedded experiment applies; the full unrelated nine-lane optimization program does not. The production path must rerun the frozen cohorts before product acceptance.
- Prototype artifacts are retained locally as evidence and executable oracles until replaced by their owning package tests. They are not exported, imported by product code, or a production dependency.

Work Checklist:

- [x] Record full execution authority, active native goal, current branch and accepted S1-S8 packet. Sources: latest user request, Task workflow, Autogoal checklist retention, Plite Plan accepted-plan execution.
- [ ] S1: native state, capture, incremental persistence and exact facade; meet the S1 exit and its F01/F06/F07/F11/F12/F29/F30/F31 proof obligations.
- [ ] S2: safe dependency decisions, authored undo and compensation; meet the S2 exit and linked behavioral/scale proofs.
- [ ] S3: native accepted/proposed/markup views, selection, clipboard, input and composition; meet the S3 exit with actual native/browser evidence.
- [ ] S4: causal Yjs collaboration, archive, retention and compaction; meet the S4 exit with real peer and retained-history evidence.
- [ ] S5: hard-cut Suggestion mutation ownership and adopt Comments/Discussion and copied UI; meet the complete consumer inventory and route proofs.
- [ ] S6: AI proposal/stream lifecycle adoption with foreign-contribution safety and truthful failure handling.
- [ ] S7: native/legacy serialization and JSON/HTML/Markdown/DOCX projection/review-preserving formats with explicit diagnostics.
- [ ] S8: complete public types, docs, registry outputs, doctrine repair and final strict package/browser/performance gates.
- [ ] Reconcile every F01-F32 family with final source-bound evidence; run original method/checklist reconciliation and check-complete before goal closure. Sources: Task, Autogoal, Plite Plan, performance pack, Verify Plate and applicable adoption owners.
- [x] Capture the full user request, Comments motivation, planning-only authority and single goal/plan.
- [x] Trace current mutation, publication, persistence, view, history, collaboration and product owners with live source.
- [x] Compare whole-shape accepted-base, woven, mark-rewrite, plain-map and mandatory-storage-replacement candidates before adoption.
- [x] Resolve normal, customization and advanced public calls, imports, ownership, identity and inference obligations.
- [x] Specify proposal/accepted separation, editable review views, grouping, native input and canonical capture.
- [x] Specify dependencies, author-selected atomic batches, stale/duplicate/concurrent decisions and explicit conflict resolution.
- [x] Specify local undo, retained per-author history/revert, durability, coherent saves, compaction and retention.
- [x] Preserve Comments-owned data and provide complete Discussion, AI, import/export and copied-UI adoption.
- [x] Inventory current consumers, exports, types, tests, docs, generated outputs, historical inputs and transitive native owners.
- [x] Retain sequential Architect/Poteto design and prototype questions, their limits and the hard-cut synthesis; no independent-review claim.
- [x] Run the smallest executable planning probes and preserve source identities, original current limitations and scope boundaries.
- [x] Freeze scale contracts before measuring; retain all cohorts/passes, percentiles, cold work, payload sizes and deterministic work counts.
- [x] Compare matched current/prototype operations and retain correctness guards; do not transfer helper timings to native paint/heap claims.
- [x] Identify the measured read and metadata owners before selecting indexes/checkpoint work; add no pooling or scheduler.
- [x] Carry final installed-path reruns, behavior/native guards, scale and retention variables into every applicable execution slice.
- [x] Resolve conditional query/database/privacy/detector work with a scoped reason; no unexplained budget exception.
- [x] Record every decision's owner, adoption, proof, risk and verdict; reject public aliases and parallel authority.
- [x] Prepare the 32-family proof denominator, execution order, high-risk failures, doctrine repair and final handoff.
- [x] Finish fresh artifact/source validation, reconcile all template gates, and run check-complete.

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt and authority | yes | Full planning scope, native goal, no product/publication authority; Objective and Boundaries |
| Current owners and Best API | yes | Current evidence, Public usage, Target contracts and Decision ledger |
| Runtime scale applicability | yes | Mutation/read/checkpoint/view/history fan-out changes; both frozen contracts |
| Comparable baseline and target | yes | Current source plus bounded disposable probes; limitations explicitly retained |
| Correctness guard | yes | Capture, decision and canonical-review probes; current contracts; production F01-F32 |
| Performance pack | yes | Selected before design measurements; 6 edit/read cohorts and 3 checkpoint sizes |
| Detector/privacy | yes, execution contract | Existing native profiling/Benchmark owner; counts/timings only |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary planning readiness | yes | Resolve target, adoption and evidence limits | Target contracts, Decision ledger, S1-S8 and F01-F32 |
| Fresh source evidence | yes | Bind current facts and prototype inputs | Source fingerprints and final validation artifact |
| Best API review | yes | Resolve call shape and duplication before adoption | Concrete imports/calls, typed outcomes, exact-view policy and hard-cut comparison |
| Pre-acceptance scale evidence | yes | Match current/target design operations under frozen contracts | Edit/read 18-row receipt and checkpoint receipt; scope excludes unimplemented native production path |
| Production scale rerun | execution | Run identical fixtures through installed native owners plus visible/native/memory guards | S1/S3/S4 exit gates and Scale contract; no current production-pass claim |
| Warm/cold/stress/fan-out/payload | yes, design scope | Preserve every pass and supported cohort | Both contracts/receipts with percentiles, cold measurements, byte sizes and work counts |
| Correctness/native guard | design and execution separated | Run model/native-facility planning proof; require browser/native proof after implementation | Capture and canonical model artifacts; F01-F32 remain execution obligations |
| Before/after and regression harness | yes, embedded experiment | Retain executable current/prototype comparisons; move final cases to canonical test/Benchmark owners | Artifact scripts and S1-S4 proof exits |
| Conditional risk/adoption | yes | Name failure, hard-cut response and exact owner | Risks table, inventory, formats and doctrine repair |
| Detector and privacy | yes, scoped | Use existing profile owner; no new telemetry service | Scale contract; local synthetic fixtures only |
| Handoff | yes | Prepare ownership, breaks, evidence and first implementation slice | Final handoff prepared below |
| P1 Autoreview | no | No invocation on next | Planning-only request on next; no PR |
| Goal plan validation | yes | Run check-complete after final evidence | `planning-validation.json` and final `planning-validation.log` |

Phase / pass table:

| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Current owners, research reuse and inventory | Decide |
| Decide | complete | Candidate synthesis and target contracts | Prove and hand off |
| Prove and hand off | complete | Source/artifact validation passed; full handoff prepared | Execution authorization |

Verification evidence:

- Current Suggestion observations rerun successfully in `current-owner.log`.
- Current Plite source contracts: 907 passed, zero failed across six discovered test files; `current-contracts.log`. This is current facility proof, not target feature proof.
- Current Suggestion review contracts: four passed, zero failed; `suggestion-contracts.log`.
- Abstract decision/algebra probe: 22 assertions passed; `design-probe.json`. It is not a CRDT implementation.
- Canonical review family: real Plite capture, interval dependency and inverse/rebase oracle passed; `canonical-review-probe.json`.
- Atomic local capture: ordinary and canonical writes, rollback, missing identity and reload passed; `capture-probe.json`.
- Edit/read scale: 18/18 frozen rows passed; `scale-receipt.json` and `scale-progress.log`.
- Incremental checkpoint: nine of nine frozen rows passed; `checkpoint-receipt.json` and `checkpoint-progress.log`.
- Final source/artifact validation: 205 sources unchanged at validation, 32 target proof families, all probe results/contract hashes/local links valid; `planning-validation.json`.
- Plan completeness is checked with `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-10-native-authored-changes-and-suggestions.md`; final output in `planning-validation.log`.

Error attempts:

| Attempt | Count | Different next action | Resolution |
| --- | ---: | --- | --- |
| Guessed prototype import path used one excess parent directory | 1 | Correct to observed repository-relative source | Design probe executes |
| Canonical oracle treated iterChangedRanges as an iterator | 1 | Read actual callback signature and use its native arguments | Canonical review probe executes; no product source changed |
| Broad source outputs exceeded display budgets / stale docs reference path | several | Narrow to observed files and current Plate Docs owner | Current facts use actual source; no claim of full reads from truncated output |

Final handoff prepared:

Choose native authored capture and an accepted-base/retained-change model with native views. Keep DocumentChange, the native transaction/publication owner, History, Yjs transport and Comments data lifecycle. Delete Suggestion's mutation engine, schema-property authority and global view intent. Implement S1 first, then safe decisions, native views and collaboration before cutting the product consumers. The complete feature is accepted only after S1-S8 and all applicable F01-F32 production gates pass.

This planning task leaves product code unchanged. The design probes demonstrate bounded model/publication/cost facts; they do not demonstrate a finished editor, browser behavior, collaboration rollout or release. The next action after execution authorization is S1 in this same plan.

Open risks:

Native projection, structural dependency derivation, concurrent root/schema conflicts, incremental installed persistence, native IME/clipboard, retained-history compaction and format parity remain implementation risks with explicit owners and stop gates. No product or release readiness is claimed. A contradiction in those gates reopens the corresponding design decision.

Timeline:

- 2026-09-10: Task planning intake; reused completed external research and preserved planning-only authority.
- 2026-09-10: Current-owner trace, canonical/native capture probes, dependency and concurrent-batch model, edit/read and checkpoint experiments; complete adoption/proof plan drafted.

Reboot status:

| Question | Answer |
| --- | --- |
| Where am I? | Full plan prepared; planning evidence reconciled |
| Where am I going? | S1 native state/capture and persistence, followed by S2-S8 |
| What is the goal? | Full authored-changes/Suggestions implementation and proof |
| What have I learned? | Native capture exists; editable projections and incremental causal storage remain native work; independent contributions cannot be silently cascaded |
| What have I done? | Current source inventory, planning probes, target API and full execution/proof contract |
