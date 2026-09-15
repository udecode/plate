# Directly loadable authored state

Status: Complete — design and disposable probes; production representation gated

Objective:
Execute the user's “go” on the Best API design recommendation: choose the smallest loading/saving contract and compare compact checkpoints with retained-content representations before accepting runtime machinery. The preceding review and both completed reload benchmarks remain evidence, not approval of a physical representation.

Completion threshold:
Show ordinary and retention-customized call sites, one authority and lifetimes, the maximum justified deletion, versioned-format/validation implications, and a source-backed alternatives decision. Run a bounded embedded Benchmark probe of disputed reconstruction work against the optimized current path. Preserve comparator limitations and leave an unproved target gated. Record the outcome in the existing authored review history and name one next owner.

Verification surface:
Headless serialized document loading, current accepted/proposed reads, first edit/decision, corruption rejection, bytes/save work, and source identity for the disposable subset. Existing tests establish the baseline contract. A subset prototype cannot certify full native editor or collaboration behavior.

Constraints:
Design and disposable probes only; no product edits or publication. The three prior optimization trials remain recorded and are not reset. This user-authorized design comparison does not start a fourth production optimization trial. Root owns timing and canonical artifacts; bounded workers own only assigned probe files. Use current checkout and existing native authored, document-codec and shared-effect owners.

Boundaries:
No full editor/CRDT replacement, new public loading controller, trusted-input flag, background replay, or speculative archive service. Compare stronger representation changes without presuming the existing operation log or duplicated snapshots are correct. Final runtime acceptance requires equivalent semantics and a passing scale probe.

Blocked condition:
An unimplemented representation or incomplete semantic oracle leaves that target provisional; it does not justify an invented pass. Complete this design's evidence/decision rather than silently widening into production implementation.

Source obligations:
User go; Best API's ideal-first, maximum-cut, scale and output gates; Benchmark embedded-probe methodology; docs/research/decisions/authored-change-ownership.md; current codec, restoreProjection, anchors, retention and collaboration consumers. Preserve the 2026-09-12 authored scalability review.

## Frozen probe contract

- Baseline: current complete source-built authored editor and original 100/1,000/10,000 paragraph saved fixtures, plus the retained source bundle from the preceding comparison when identical.
- Candidates: (A) directly saved live checkpoint/control testing consistency obligations; (B) current retained-content representation for the explicitly admitted independent text-insertion subset. Unsupported structural/dependency cases must reject, never silently pass.
- Repeated units: decoded operations, reduction/mapping calls, live records/content, stored bytes, retained identity references. Document size, live changes and closed history are distinct variables.
- Materiality: at 10,000, at least 50% and 1 second reduction from matched optimized baseline, with three fresh-process nonoverlapping ranges in each claimed runtime. Smaller 100/1,000 cohorts are diagnostic; no percentiles from tiny samples.
- Correctness gate: identical accepted/proposed text and attribution, preserved IDs and baseline anchors within the admitted subset, first insertion and accept/reject parity, rejecting inconsistent content/identity/order/length. Generic runtime acceptance additionally requires dependencies, moves, deletes, properties, roots, conflicts, delayed peers and complete checkpoint validation; absent coverage means gated.
- No displacement: include full load/read work; record save size/time and first operation separately. No claim that saving two projections or omitting history is parity.
- Sampling: root runs serial, paired/interleaved fresh processes, no worker timing overlap; preserve raw failures and source manifests.

Work Checklist:

- [x] Reconcile earlier review, prior trial tally and current source owners.
- [x] Settle normal/customized public call sites and authority/lifetime constraints.
- [x] Build and run bounded comparable probes with frozen budgets and correctness limits.
- [x] Resolve strongest representation decision or exact remaining gate; identify breaking/adoption scope.
- [x] Persist current decision and immutable review, validate evidence links and completion.

Verification evidence:
Fresh source-built probes pass their declared guards; the retained subset clears the cost threshold in both runtimes. Full runtime acceptance remains gated. The earlier 337 authored/Yjs tests, types and lint belong to their original snapshot. Twelve of its 193 loaded Plite files and additional Yjs/UI consumers have since changed; use this packet's fresh baseline for timing and do not claim that earlier full suite as current proof.

Open risks:
Direct checkpoints may duplicate authority or bypass causal validation. A text-only retained-content prototype does not prove structural review, offline convergence or native input. Loading complete live content is at least proportional to its size; no constant-time or universal superiority claim.

Next owner: Task owns the remaining coupled Plite format/runtime/proof job. The public call shape is settled; the physical runtime is not accepted. No downstream execution starts in this design-only turn.

## Recommendation and maximum cut

**Delete full operation replay as the means of opening current authored state.** Pursue a directly validated representation of current content, contribution identities and required causal facts. Keep the existing loading/saving API. The retained-content cost probe supports that direction, while its missing editor and collaboration semantics prevent production acceptance.

The largest justified deletion is the whole reconstruction chain: rebuilding every change record from the operation log, then mapping every pending edit to rediscover the proposed document. It also removes any reason for application-managed caches, special loaders, trusted-input flags, separately saved proposed documents, or a history service introduced just to make opening fast. This does not justify removing canonical `DocumentChange`, native authored behavior, schema validation, origin identities or the existing collaboration owner.

## Public call sites

These are existing call shapes to retain. `serialized` is the application's saved document JSON; `session` is its authenticated identity owner.

```ts
import { createEditor, createEditorView } from 'plitejs';
import { authored } from 'plitejs/authored';

const editor = createEditor({
  extensions: [authored({ authorId: 'alice' })],
  initialValue: JSON.parse(serialized),
});

const review = createEditorView(editor, {
  authored: { intent: 'propose', projection: 'proposed' },
});

const saved = JSON.stringify(editor.read.value());
```

Retaining closed content for historical reads and selective compensation is a real independent job. Keep that choice on the existing capability:

```ts
import { createEditor } from 'plitejs';
import { authored } from 'plitejs/authored';

const editor = createEditor({
  extensions: [
    authored({
      authorId: () => session.userId,
      retainHistory: true,
    }),
  ],
  initialValue: JSON.parse(serialized),
});

const result = editor.update.authored.decide({
  action: 'accept',
  selection: editor.read.authored.select({ ids: [changeId] }),
});
```

Plate uses `createEditor` from `platejs` and the same `authored` capability from `platejs/authored`. The [existing composition contract](../../packages/platejs/src/authored/authored.api.spec.ts) proves those are the same capability. The [raw example](../../apps/www/src/app/(app)/examples/plite/_examples/authored-changes.tsx:504) supplies changing author identity and retention; [Discussion](../../apps/www/src/registry/components/editor/discussion.tsx:400) and [AI cancellation](../../packages/platejs/src/ai/react/AIChatPlugin.ts:678) consume IDs and atomic decisions. No new public persistence type or namespace earns a place.

## What owns the state

| Surviving concept | Current job and lifetime | Owning layer |
| --- | --- | --- |
| Accepted document roots and `DocumentChange` | Ordinary document content and atomic mutation remain valid without authored mode. | Plite model/transaction owner |
| Optional `authored` capability | Retains contribution identity, review decisions, dependencies and hidden content for editable review. | Existing native Plite authored owner; Plate reexports it |
| Authenticated `authorId` | Attributes each admitted write; resolving an application identity is separate from storing the contribution. | Application supplies identity; authored records it |
| `retainHistory` | Controls closed content kept for historical reads and compensation. Pending dependencies and required identities outlive this policy when needed. | Authored retention owner |
| Exact editor view | Supplies proposed/accepted/markup projection, selection and input intent for one consumer. | Existing editor view and native input owners |
| Document codec | Validates and publishes one coherent document value; owns serialized version dispatch. | Existing value codec plus authored codec |
| Causal frontier and retained identity facts | Admit unseen operations, reject collisions and preserve references across delayed delivery. | Authored state, published with existing shared-effect checkpoint owner |
| Local undo | Records local interaction history and generates correct compensation. It is not the saved authored operation log. | Existing local history owner |
| Review UI and discussions | Choose which changes to show or decide, and retain conversations. | Plate UI and Comments respectively |

The preferred format family keeps accepted roots canonical and stores current authored facts alongside them. Pending inserts/deletes and structural/property facts carry stable identities and placement/visibility information directly. A proposed view reads those facts without executing the historical edit sequence. Derived positional/query indexes belong to the runtime and are rebuilt in bulk from current facts.

A minimal format must earn every stored copy. Existing record-tree and position-tree implementation nodes need not become the wire contract. The disposable retained format still duplicates base text in segments as a conservation check; it is not the final compact encoding. An identity-bearing unified content tree is a stronger challenger if it removes more duplication, but promoting it to sole document authority would change the accepted-root doctrine and needs structural/schema proof. This design does not silently accept that larger replacement.

## Measured comparison

Raw evidence and reproducible runners are in [the probe packet](artifacts/authored-loadable-state/summary.json). Apple M5 Max; Bun 1.3.12 and Node 22.22.1. At 10,000 paragraphs / 10,055 pending changes, each decisive runtime has three fresh-process, serial interleaved pairs. Values below are observed ranges, not percentiles.

| Representation | Bun load/read | Node load/read | Serialized bytes | Verdict |
| --- | ---: | ---: | ---: | --- |
| Current native editor | 2,513–2,528 ms | 2,472–2,538 ms | 17,124,373 | Fresh baseline, complete editor |
| Retained independent text subset | 67.8–70.0 ms | 71.6–73.9 ms | 5,191,115 | Cost hypothesis passes; editor acceptance fails |
| Log + live-state/projection mirrors, replay-validated | 2,640 ms | 2,636 ms | 44,249,552 | One diagnostic each; no useful improvement |
| Same mirrors with consistency validation skipped | 2,774 ms | 3,363 ms | 44,249,552 | Unsafe and slower; rejected |

The retained subset reduces measured decoding cost by about 97%, with nonoverlapping ranges and more than 2.4 seconds saved. It matches the exact original accepted/proposed text and author/ID/status oracle, strictly detaches caller data, and rejects ten malformed cases. This is a comparison of representation cost against a complete editor, **not a feature-equivalent 97% editor speedup**. The candidate has no native transactions, saved-range restoration, causal admission, undo or collaboration.

The source-built baseline still performs 10,055 `authored-reduce` calls and 10,055 `authored-map` calls. Bun restoration takes about 1.24–1.25 seconds, including mapping. The [codec](../../packages/plitejs/src/authored/state.ts:545) and [restoration function](../../packages/plitejs/src/authored/authored.ts:668) explain both passes. JSON parsing is a small fraction. Nested profile times must not be added.

Small cohorts support the direct-scan hypothesis: Bun subset decoding takes 1.9 ms for 100 paragraphs and 7.9 ms for 1,000, versus 76 ms and 302 ms for native loading. These are single diagnostics; they do not establish asymptotic behavior across all document shapes.

The unchecked mirror accepts deliberately inconsistent `FORGED` projected text; replay validation rejects the same corruption. Its first native insertion also stalls for 1.28 seconds Bun / 15.15 seconds Node in those single diagnostics. Saving existing live objects therefore neither proves safe ingress nor guarantees that construction paid all editing costs. Replay validation was the tested consistency control, not a proof that every possible compact checkpoint validator must replay.

The retained subset's detached commands revalidate all content: insertion takes 33–36 ms Bun / 12–14 ms Node; rejection takes 58–60 ms Bun / 15–20 ms Node. Native first insertion takes 40–42 ms / 20–22 ms, and native first rejection 8.6–9.1 ms / 2.6–5.1 ms. Rejection selects different independent IDs in the two diagnostics, so those numbers are not matched latency ratios. The full scans alone disqualify the prototype as an incremental editing design.

Subset saving after its detached edit takes 11.0–11.1 ms Bun / 4.6 ms Node, versus 64.8–65.8 ms / 20.3–21.0 ms for the native format after editing and rejection. The payloads have different semantics. Converting the old 10,000-paragraph native fixture costs 2.71 seconds once; excluding conversion is valid only for a future representation maintained by normal edits. A writer that rebuilds this checkpoint from history on every save would merely move the problem.

## Alternatives and validation obligations

| Alternative | Decision |
| --- | --- |
| Continue bulk decoding/snapshot optimization | Keep existing wins and use this as the smaller comparator. It leaves the two reconstruction passes; no fourth production trial was started. |
| Persist the current runtime as redundant snapshots | Reject the tested control: larger payload, no speed benefit, corruption admitted if consistency checks are omitted, and deferred edit cost. This does not reject all compact canonical checkpoints. |
| Direct current facts over accepted roots | Preferred bounded family for the next semantic prototype. It preserves the current document authority and can remove historical replay. Exact structural/property representation remains gated. |
| Unified retained-content tree for the whole document | Strongest larger challenger. The text probe supports its cost premise, but accepted-root authority, schema, moves and native input remain unproved. Do not select the tree topology from this text-only result. |
| Archive closed history | Useful retention policy, irrelevant to the all-pending fixture. Retain identities and bodies still required by current jobs. |
| Marks/ranges as the complete model | Reject: deleted structure, dependencies, durable origins and compensation are required. Presentation marks alone do not supply them. |
| New public loader/cache/trust/background controller | Delete from the proposal. Existing codecs and runtime own complete readiness and error handling. |
| Replace Plite, mandate a CRDT or merge authored into every editor | No evidence earns those cuts. Canonical document editing and optional authored review have independent current jobs. |

The next format must validate structure, IDs, references, lengths, root coverage, contribution revisions/status, dependency closure, property precedence and frontier consistency before publishing any part of the editor. Same-input checksums do not establish trust. A malformed checkpoint cannot publish a valid-looking projection while poisoning future decisions or anchors.

Current operation-body lifetime and identity lifetime are different. Pending/conflicted contributions retain sufficient content and dependency facts; historical compensation retains the selected closed bodies; saved anchors retain their required origins. Closed identities needed for collision detection or delayed peers may survive body compaction. The [existing transport checkpoint](../../packages/plitejs/src/yjs/core/shared-effect-log.ts:1290) already publishes an acknowledged prefix atomically and should own that boundary.

Do not promise total load time independent of history while serializing every old identity. Reading a complete JSON checkpoint necessarily costs at least the size of its retained facts. With live content L, required identity/dependency facts R and suffix S, the target is bulk validation/indexing of L + R plus bounded suffix application, with no historical-content replay. Bounding R further requires a proven epoch/resynchronization or retention contract; it cannot be achieved by silently forgetting an offline peer. Local edits must touch the affected content and dependency closure rather than every unrelated contribution.

## Breaking and adoption scope

The normal TypeScript calls above need no change. The authored wire payload needs a new codec version: current `meta.authored.version` is 1 and its value stores operations as reconstruction authority. Unknown versions must fail explicitly. A v1 reader/converter can pay existing replay once, then save the directly loadable format. Its scope is format conversion; it must not remain a second normal runtime.

Serialized operation/position internals, collaboration snapshot payloads and their mixed-version admission are breaking surfaces. Contribution IDs and externally saved anchors must retain their meaning. Readers should be deployed before writers switch formats; checkpoint publication and suffix replay must be atomic. Tests and codecs are then migrated together, followed by deletion of the legacy restoration path. Leaf rendering and copied review UI have no selected public redesign in this work.

No product source or durable doctrine was changed in this turn. If the direct-state target is accepted, update the smallest Plite doctrine owner describing the authored graph, bump the authored codec, repair affected persistence/retention teaching, and follow Best API's doctrine-repair/version process. If a unified content tree wins, additionally replace the accepted-root authority clause with the proved ownership rule. Do not edit that law to endorse an unmeasured representation.

## Exact remaining gate

Task is the next owner because the format, runtime, retention and adoption proof remain coupled. It should implement one bounded native semantic prototype and keep the compact current-facts representation versus unified retained-content challenger open where structural cases can decide them. No further public API brainstorming is needed.

Before production acceptance, the prototype must pass complete ready-to-edit loading plus first edit, accept/reject, save/reload and retained-memory budgets on matched operations. Cover dependent insertions/deletions, moves, properties, named roots, stale/conflicted decisions, history compensation, native saved anchors and one delayed peer. Hold live state fixed while increasing closed history. Preserve complete untrusted ingress checks. Use current native behavior as the semantic oracle and the 50%/1-second loading gate as the minimum improvement threshold; freeze additional operation/memory budgets before measuring them.

ProseMirror marked-load numbers remain a narrower earlier comparator, not a superiority claim. A candidate that loads quickly but loses review semantics or makes edits/history scale with the whole document has failed.

Verification: both frozen source bundles and all 403 manifest entries match the measured inputs at closeout; raw successful runs, expected corruption rejection and harness failures are retained. Product/package/browser tests were not rerun because no product implementation is claimed. Retained memory and the broader semantic matrix are explicit missing acceptance evidence. The existing [decision trail](../../.audit/authored-reload-prosemirror.tsv) records the consequential choices; no workspace transcript path was supplied, so its self-audit uses this conversation and the linked execution artifacts.
