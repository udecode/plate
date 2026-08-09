# Runtime node identity and persisted element IDs

Objective:
Make Plite runtime identity at least as strong as Lexical's private-key law for
every descendant, and make persisted element identity an intrinsic Plate editor
policy rather than a plugin, with direct lookup, exact generated types, atomic
materialization, history continuity, and bounded large-document cost.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-08-07-runtime-element-identity.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- editor-audit: current Plite and Plate versus Lexical, ProseMirror, and Wordgard.
- best-api: public runtime-target and persistence-policy shape.
- plite-plan: runtime, schema, change, history, collaboration, and proof ownership.
- plate-plan: Plate policy, generated-contract, package, registry, and docs adoption.

Mode:
- deep: the decision changes editor identity, schema construction, history,
  collaboration, generated types, React consumers, and hot-path lookup.

Completion threshold:
- Binary readiness: every current claim cites live source, every responsibility
  has one owner, every decision has one verdict, every public break has an
  adoption and proof path, execution slices are ordered, quantitative gates are
  concrete, and check-complete passes.
- The plan fixes identity laws for initialization, immutable replacement, move,
  split, merge, copy, paste, import, reattachment, deletion, undo, redo,
  collaboration, named roots, persistence opt-out, and generated construction
  and canonical Value types.
- The external audit records explicit steal, keep, and reject decisions for
  Lexical, ProseMirror, and Wordgard at exact local commits.
- NodeIdPlugin is deleted without an ElementIdPlugin replacement; every former
  responsibility has one explicit Plite, Plate editor-policy, schema, codec,
  collaboration, static-rendering, or consumer owner.
- Plite matches or improves Lexical on mandatory identity, clone versus copy,
  direct lookup, nonserialization, and same-editor undo revival.

Verification surface:
- Plite RuntimeId allocation, public node targets, identity continuity,
  snapshot indexes, schema properties, document fitting, canonical changes,
  roots, history, collaboration, and plite-react bindings.
- Plate Core NodeIdPlugin, implicit core plugin assembly, editor definition
  generation, HTML and static rendering, and direct AI, selection, DnD, and
  Table consumers.
- Focused types and tests, generated-contract checks, Plite handoff checks,
  registry Browser proof, Yjs convergence proof, and 1k, 10k, and 50k identity
  benchmarks.

Constraints:
- Planning only until the user accepts this exact plan and invokes plite-plan.
- Every published Plite descendant, including text, has a private RuntimeId.
- Plate users may disable JSON persistence of element IDs, never runtime identity.
- Runtime IDs and persisted IDs are different types with different lifetimes.
  Neither is an alias or fallback for the other.
- JSON without persisted IDs becomes fully runtime-identifiable before the
  first observable editor state.
- Paths remain snapshot-relative structural addresses. Runtime IDs remain
  logical node identities inside one editor arena and resolve only in the
  calling root view.
- No compatibility aliases, dual signatures, renamed plugin, or legacy option
  shims survive.
- Persisted element ID configuration belongs to the closed editor definition or
  raw Plate editor constructor, never the plugin graph.

Boundaries:
- In scope: runtime allocation and lookup, NodeTarget, explicit continuity,
  history identity, root scoping, generated and unique schema properties,
  persisted element IDs, import and copy laws, collaboration, incremental
  indexes, generated types, direct package adoption, docs, browser, and perf.
- Plite owns private runtime identity, generic targeting, continuity deltas,
  history substrate, generated and unique property laws, canonical publication,
  roots, and snapshots. Plite React owns DOM bindings to RuntimeIds.
- Plate Core owns default persisted element identity as an editor policy. AI,
  selection, DnD, Table, static and HTML, CLI generation, registry, and docs own
  adoption of the correct identity kind.
- Yjs preserves persisted IDs carried by canonical content while keeping
  RuntimeIds peer-local.
- Non-goals: persisted IDs on text leaves, plugin schema name/type/key redesign,
  cross-root transactions, globally usable handles across processes, Lexical
  node classes, whole-state history, and implementation before acceptance.

Output budget strategy:
- Read named owners first and expand through direct consumers only. Reuse prior
  exhaustive editor audits while refreshing every decision-changing source.

Blocked condition:
- Block execution only if an invertible private identity delta cannot compose
  with DocumentChange without entering serialized content, or if the identity
  arena misses the concrete memory and latency gates after the current nested
  WeakMaps are removed. Both failures have explicit prototype exits below.

Plite Plan state:
- status: ready
- phase: handoff
- next: user acceptance, then plite-plan execution in slice order
- handoff: complete; no product source changed during planning

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Mandatory runtime element IDs, persistence-only opt-out, efficient retrieval, Lexical-grade identity, full NodeIdPlugin deletion, and possible Plite rearchitecture are explicit. |
| Active goal and plan verified | yes | The active goal names this plan and its binary readiness and checker threshold. |
| Current owners read | yes | Live Plite runtime, index, root, schema, change and history code; Plate NodeId, editor and generator owners; React, Yjs, AI, selection, DnD and Table consumers were inspected at commit a146a3e7bbc8976da01437eb7636ab84814ce0cd. |
| External source verified | yes | Local Lexical, ProseMirror, and Wordgard checkouts were read at the exact commits recorded below. |
| Best API target resolved | yes | Runtime identity is state.nodes.runtimeId plus generic NodeTarget; persisted lookup is state.nodes.getById; persistence is an editor policy, never a plugin. |
| Mode and execution boundary resolved | yes | Deep planning is complete; product source waits for explicit acceptance. |

Work Checklist:
- [x] Capture Lexical-grade identity and full NodeIdPlugin deletion.
- [x] Audit allocation, lookup, clone, copy, deletion, roots, history,
  collaboration, serialization, and memory laws.
- [x] Assign every NodeIdPlugin responsibility to a non-plugin owner or delete it.
- [x] Resolve the final public call shape through best-api.
- [x] Resolve arena storage, continuity ownership, history revival, generated
  schema properties, persisted uniqueness, and collaboration.
- [x] Write ordered execution slices and a focused proof matrix.
- [x] Close conditional risks, prepare the handoff, and pass the plan checker.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every identity, ownership, adoption, and proof decision | The lifecycle, responsibility, decision, execution, and proof tables cover every requested law. |
| Fresh source evidence | yes | Recheck every decision-changing claim | Live Plite, Plite History, Plate Core, direct consumers, and Lexical source were inspected. |
| Best API review | yes | Resolve P0 and P1 call-shape findings | One runtime target path, one persisted lookup, and one editor policy remain; the replacement-plugin design is rejected. |
| Conditional risk and adoption | yes | Resolve history, collaboration, browser, generated-type, and benchmark gates | Each material risk has a named owner, failure test, and quantitative exit. |
| Verification recorded | yes | Record planning proof and exact execution gates | Source receipts and exact commands and routes are recorded below. |
| Handoff prepared | yes | State ownership, breaks, risks, and execution order | The handoff names all public cuts, owners, order, and execution risks. |
| P2 autoreview | no | Apply during accepted-plan implementation | Planning changed only this plan; accepted execution ends with P2 autoreview. |
| Goal plan complete | yes | Run node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-07-runtime-element-identity.md | The passing receipt is recorded in Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Current and external identity owners were inspected. | Decision closed |
| Decide | complete | Arena, continuity delta, history, editor policy, and public API are locked. | Proof closed |
| Prove and hand off | ready | Failure cases, slices, commands, routes, and benchmarks are explicit. | User acceptance |

Harsh verdict:
- Yes, rearchitect. The current system has good ingredients but a weaker law.
  Calling it equivalent to Lexical would be bullshit: IDs can alias by string
  across editors, reverse lookup may traverse, continuity has several owners,
  and undo gives restored nodes fresh runtime identities.
- Renaming NodeIdPlugin to ElementIdPlugin would preserve the architectural
  mistake. Runtime identity is editor substrate. Persisted IDs are editor and
  schema policy. Neither is a plugin capability.
- Copy Lexical's guarantees, not its representation. Plite should keep immutable
  nested JSON, canonical DocumentChange, and mapped paths instead of adopting
  mutable node classes or whole-state history.

Decision brief:
- Outcome: replace scattered global runtime-ID maps and transfer heuristics with
  one editor-owned RuntimeIdentityArena, one direct live lookup, and one private
  invertible identity delta beside each canonical change.
- Chosen shape: every published descendant gets a branded RuntimeId before
  observation. Immutable replacements, moves, and same-editor undo and redo
  retain it. Copies, paste, external import, reload, and remote peers get fresh
  runtime identities. Plate separately persists string id on every element by
  default through an intrinsic editor and schema policy.
- Strongest rejected alternative: one ID that sometimes lives in JSON and
  sometimes only in a WeakMap. That lets untrusted content impersonate an
  internal handle and makes copy, reload, collaboration, and deletion laws
  depend on configuration.
- Consequence: local package code stops using IdElement and persisted strings
  for runtime work. Persistence can be disabled without disabling editing,
  retrieval, subscriptions, DnD, selection, or Table behavior.

Target public shape:

~~~ts
declare const runtimeIdBrand: unique symbol;

export type RuntimeId = string & {
  readonly [runtimeIdBrand]: true;
};

export type NodeTarget<N extends Descendant = Descendant> =
  | Location
  | N
  | RuntimeId;

editor.read((state) => {
  const runtimeId = state.nodes.runtimeId(element); // RuntimeId | null
  const entry = runtimeId ? state.nodes.get(runtimeId) : null;
  const path = runtimeId ? state.nodes.path(runtimeId) : null;

  // The only cross-session persisted-ID lookup.
  const serverEntry = state.nodes.getById('server-element-id');
});

editor.update((tx) => {
  const runtimeId = tx.nodes.runtimeId(element);
  if (runtimeId) tx.nodes.set({ align: 'center' }, { at: runtimeId });
});
~~~

nodes.runtimeId accepts a descendant or location. It never allocates for a
detached foreign node and returns null when absent. Existing generic node reads
and writes accept RuntimeId through NodeTarget. There is no ID-specific mutation
API. getById accepts the persisted string and returns a rooted element entry or
null; it also returns null when persistence is disabled.

The live read.runtime.idAt and read.runtime.pathOf alternatives are cut.
Historical snapshot inspection keeps snapshot.index.idAt and pathOf, while
read.runtime.snapshot remains the advanced snapshot boundary.

Plate editor policy:

~~~ts
// Default: every canonical element has a persisted string id.
const App = defineEditor('app', {
  plugins: EditorKit,
});

// Runtime identity remains mandatory. Persisted ids disappear from JSON.
const Ephemeral = defineEditor('ephemeral', {
  elementIds: { persist: false },
  plugins: EditorKit,
});

type ElementIdPolicy =
  | Readonly<{ persist: false }>
  | Readonly<{
      create?: () => string;
      persist?: true;
    }>;
~~~

The same elementIds option exists on createPlateEditor for raw editors. A
generated definition owns it permanently; instances cannot override it.
Persistence defaults to true. create is the only customization kept. It is
runtime data and does not enter the structural schema fingerprint. When
persistence is false, ingress strips id from every element before canonical
publication and document serializers never emit it.

Runtime identity arena:

~~~ts
type RuntimeIdentityArena = {
  readonly liveById: Map<
    RuntimeId,
    Readonly<{ node: Descendant; root: RootKey }>
  >;
  readonly nodeToId: WeakMap<object, RuntimeId>;
};
~~~

One arena belongs to the owning editor and all named-root views. Runtime ID
encoding includes an opaque realm-unique arena nonce and a monotonic ordinal,
so two live editors cannot both produce an interchangeable n0. nodeToId keeps
immutable snapshots and exact reattachment cheap. liveById gives O(1)
membership and node lookup. The compact mapped snapshot index remains the path
owner, so a move does not eagerly rewrite every shifted sibling path.

The arena replaces NODE_OWNERS, the WeakMap per node, per-editor n0 allocation,
and lazy allocation for arbitrary detached objects. Nested JSON remains the
canonical document; the direct map is an index, not a second document model.

Schema materialization primitive:

~~~ts
const persistedElementId = property.string({
  generate: () => nanoid(10),
  unique: true,
});

schema.elementProperty(persistedElementId, {
  role: 'metadata',
  split: 'drop',
  target: target.group('element'),
});
~~~

generate means construction input may omit the property but published canonical
output cannot. unique true means unique across primary and named roots in one
document. Generation and duplicate repair run at trusted external ingress or
transaction finalization before validation and publication. They become part of
the originating canonical change. Reads, history replay, and remote application
never generate.

Plate injects id as a framework-owned schema contribution outside the plugin
graph and reserves the key against plugin redefinition. The ingress walker
covers every actual element, including open-world accepted elements. Generated
closed Value types describe known elements exactly.

Runtime identity lifecycle:
| Event | RuntimeId law | Persisted id law |
| --- | --- | --- |
| Initial value or newly published node | Allocate before first observation | Preserve first valid unique string; generate missing, invalid, and later duplicates |
| Immutable property or content replacement | Retain | Retain |
| Move, reorder, wrap, lift, type-preserving correction | Retain through explicit continuation | Retain |
| Split | One declared survivor retains; every new branch is fresh | Source retains; new branches generate |
| Merge | Declared survivor retains; consumed identities retire | Survivor retains; consumed IDs retire |
| Copy, duplicate, paste, copied generic insert | Fresh for the copied forest | Fresh for the copied forest |
| Exact same-arena reattachment after deletion | Retain when no live node owns it | Retain when still unique |
| Delete | Lookup is null while absent; referenced old node still reveals its retired ID | Value disappears with the element |
| Same-editor in-memory undo and redo | Revive the exact RuntimeId | Restore exact persisted value |
| Serialized history, reload, or a new editor | Fresh | Preserve valid persisted values |
| Remote peer application | Fresh and peer-local | Preserve origin canonical value |
| Named-root view | Same arena ID, but access succeeds only from owning root view | Unique document-wide; lookup returns rooted entry |
| Schema reconfiguration | Surviving logical nodes retain; created nodes are fresh before publication | Materialize under immutable editor policy before publication |

Private continuity target:

~~~ts
type RuntimeIdentityDelta = Readonly<{
  assignments: readonly RuntimeIdentityAssignment[];
  retirements: readonly RuntimeId[];
}>;
~~~

The transaction or change builder emits this nonserialized, invertible,
composable delta beside each DocumentChange. Publication applies both atomically.
History retains and inverts the delta in memory, including batch merging, undo,
redo, and branch movement. History.toJSON and History.fromJSON exclude it, so
decoded history restores content and persisted IDs with fresh RuntimeIds.

Explicit operation lineage replaces content equality, persisted-ID matching,
text-concatenation guesses, inheritRuntimeId calls, runtimeIdTransfers, and
transform-owned seeding. Ambiguous external DocumentChange replacements receive
fresh identities rather than guessed continuity.

NodeIdPlugin responsibility disposition:
| Current responsibility | Final owner | Final action |
| --- | --- | --- |
| Local node identity and retrieval | Plite RuntimeIdentityArena | Replace scattered maps and expose RuntimeId through generic node APIs |
| id schema property | Plate editor compiler | Inject a reserved generated and unique string property when persistence is enabled |
| Initial-value fill and deduplication | Plite canonicalization invoked by Plate policy | Run once before first publication across all roots |
| Insert, move, split, merge, duplicate, and paste rules | Canonical operation plus property lifecycle | Enforce the lifecycle table without event-shape inference |
| Uniqueness scans | Compiled document unique-property index | Maintain incrementally from changed ranges; remove plugin full scans |
| idCreator | elementIds.create editor policy | Keep the only legitimate customization; retry within a fixed bound then throw |
| filterInline, filterText, match | none | Delete; persisted identity covers every element and never text |
| initialValueIds, reuseId, disableInsertOverrides, onDuplicateIdScan | none | Delete; trust boundaries and instrumentation are framework laws |
| editor.update.nodeId.normalize | none | Delete; published state cannot be noncanonical |
| normalizeNodeId | none | Delete; editor canonicalization owns ingress |
| normalizeStaticValue | Plate editor utility | Rehome outside the plugin; keep deterministic IDs and timestamps; cut ID filters and reuse options |
| Core plugin registration and Copilot dependency | none | Delete from CorePlugins, capability definitions, dependencies, KEYS and PLUGINS |
| IdElement | Generated editor Value | Delete; enabled canonical known elements carry id string, disabled values omit it |
| Persisted ID lookup | state.nodes.getById | Back with the compiled unique-property index |

Decision ledger:
| Surface | Current | Target | Owner | Adoption | Proof | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| Runtime coverage | Seeded initially but partly lazy for later arbitrary nodes | Eager for every published element and text; detached nodes have none | Plite arena and publication | Route initialization, prepared slices, commits, roots and React through arena | Before-observation and detached-node tests | rearchitect |
| Runtime type and allocation | Plain string; each editor emits n0, n1 | Branded arena-nonce plus ordinal; no public constructor | Plite interfaces and arena | Make DOM conversion an explicit string boundary | Type rejection and cross-editor collision tests | rearchitect |
| Generic targeting | Location or node; separate runtime route | Add RuntimeId, nodes.runtimeId, and generic read and update support | Plite node API | Widen only real node-target options | Get, path, set, remove, move and split by ID | rearchitect |
| Live lookup | Uncached reverse lookup may materialize a snapshot index | Direct liveById lookup plus compact mapped paths | Plite arena and snapshot index | Remove nested WeakMaps and update direct map atomically | Zero traversal at 1k, 10k and 50k | rearchitect |
| Continuity | Several helpers and heuristics can claim identity | One explicit RuntimeIdentityDelta | Plite change and publication | Delete transfer calls and semantic-content guesses | Lifecycle matrix and one-owner source sweep | rearchitect |
| History | Change-only undo restores deleted content with fresh IDs | Memory-only sidecar revives exact IDs; serialized history does not | Plite History | Compose and invert sidecars with merged batches | Undo, redo, merge, cap, schema and JSON tests | rearchitect |
| Serialization and collaboration | Runtime IDs are local | Keep absent from document, change, history and Yjs JSON | Plite and Yjs | Add negative codec assertions | Peers share persisted IDs but differ in RuntimeIds | keep |
| Persisted identity | Optional plugin, number or string, filters and repairs | Reserved string id on every Plate element by default | Plate editor compiler | Add immutable elementIds policy and remove plugin | On and off canonical and JSON tests | rearchitect |
| Schema law | Defaults exist; generated and unique property laws do not | Generic generate, unique true, construction/canonical split and index | Plite schema and change | Compile Plate built-in property through generic law | Compiler, fingerprint, ingress and TS depth tests | add |
| Copy and import | Flags and event inference decide reuse | Fixed lifecycle and explicit import versus copy boundary | Plite operations and Plate policy | Delete every reuse and filter switch | Import, copy, paste, split, move and reattach tests | cut |
| Generated typing | IdElement manually asserts optional presence | Closed generated Value owns required or absent id; construction may omit generated id | Plate CLI and schema inference | Keep runtime capabilities lightweight | Large EditorKit depth guard and on/off fixtures | rearchitect |
| Consumers | Local and persisted jobs are mixed | RuntimeId locally; persisted string only across session boundaries | Owning packages and apps | Classify each field by lifetime | Both persistence modes plus browser proof | rearchitect |
| Public legacy | NodeId plugin, state, update, option, helper and alias | Delete all; no renamed plugin or compatibility signature | Plate Core and release | Barrels, docs, changeset and hard-cut sweep | Import/type smoke and source scan | cut |

External editor audit:
| Editor and cursor | Source fact | Disposition |
| --- | --- | --- |
| Lexical dd5c41b13193efa9ab1574234d8593d2c9e4f988 | Every node has a key; allocation inserts into EditorState nodeMap; lookup is direct; writable clones preserve the key; copy forces a fresh key; JSON excludes it; history restores key-bearing EditorStates. Sources: LexicalNode.ts 653, 896-907, 1393-1436; LexicalUtils.ts 150-158, 377-408, 629-652, 1818-1844, 2912-2940; lexical-history index.ts 58-72, 379-448, 504-564. | Steal mandatory private identity, direct lookup, explicit continuation versus copy, and same-editor history revival. Reject mutable linked classes and whole-state history. |
| ProseMirror model 6264de069d8439131e88f8ba06973551916184e4 and state ffad5d9450a0b93438be53a801deee1a223a81bf | Nodes use integer positions and selections and bookmarks survive transactions through mappings. Sources: node.ts 180-214 and selection.ts 241-389. | Keep position mapping for paths and anchors. Reject positions as universal node identity. |
| Wordgard c715d4ded8fc780f52c13206e589ea31e4148dd4 | Document access is position-based and ChangeSet maps positions and decorations. Sources: doc/node.ts 566-577, 896-897 and doc/change.ts 330-332. | Keep compact mapped-position ideas. Reject it for direct durable node retrieval. |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Identity arena and public target | Plite runtime and public state | Add arena, branded non-aliasing IDs, eager publication, direct live lookup, nodes.runtimeId, RuntimeId NodeTarget, and live API cut; remove global owner and nested WeakMaps | Accepted plan | Every descendant is targetable through one API; known and foreign lookup is traversal-free; roots stay isolated | Type and import contracts; initialization, detached, cross-editor and root tests; 1k, 10k and 50k arena benchmark; pnpm check:plite:dev |
| 2. Explicit continuity and history | Plite change, publication and Plite History | Add invertible and composable private deltas; route transforms and prepared slices through them; remove heuristics; retain deltas in memory-only history | Slice 1 stable | One continuity owner; undo and redo revive IDs; codecs stay identity-free | Lifecycle table, history merge, cap and schema tests, codec negatives, source sweep and retained-history benchmark |
| 3. Generated and unique properties | Plite schema, change and index | Add generate and unique true, canonical and construction inference, universal element materialization, incremental unique index, replay guard and fingerprinting | Slice 2 stable | Generated values exist before publication and uniqueness needs no repair commit | Compiler, generator, ingress and transaction tests; unknown-element row; 10k and 50k index benchmark |
| 4. Plate policy and plugin deletion | Plate Core and CLI | Add immutable elementIds policy; inject reserved id; rehome static normalization; remove NodeId folder, CorePlugins entry, capability, dependency, options, exports, aliases and old tests | Slice 3 available | Default Plate elements have unique strings; disabled documents have none; no replacement plugin exists | Core, editor, CLI, generated-contract and static RSC tests; pnpm brl; public import and hard-cut scans |
| 5. Consumer and collaboration adoption | AI, selection, DnD, Table, media, suggestion, markdown, comment, Core React and static, Yjs | Classify local versus external identity; use RuntimeId locally and persisted id across boundaries; validate origin-canonical collaboration | Slice 4 stable | Editing works identically with persistence on and off; peers converge without shared RuntimeIds or repair transactions | Affected package tests in both modes; two-peer Yjs laws; static and HTML tests; www typecheck |
| 6. Docs, browser, performance and release | Docs, registry, benchmark and release owners | Teach one API, add major changeset, run registry demos, compare baselines, run full gates and finish P2 autoreview | Source slices green | One architecture, accepted cost, clean browser behavior and zero accepted P0 to P2 findings | Block selection, Table and AI demo routes; pnpm check:plite; package and www checks; lint, benchmark receipts and autoreview |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| IDs exist before observation | initializePublicState seeds primary and named roots before returning; public-state.ts 7214-7252 | Read and subscribe during creation, deferred initialization, schema publication and first commit; every descendant has an ID | designed |
| Detached data has no identity | getOrCreateRuntimeId can currently allocate when given an owner; runtime-ids.ts 97-118 | Detached and foreign nodes return null until insertion publication | designed |
| Lookup is direct | Current reverse lookup can materialize; snapshot-index.ts 107-245, 1540-1571 | Known and unknown RuntimeId lookup touches liveById once and traverses zero descendants at all sizes | designed |
| Continuity has one owner | Current calls span runtime-ids, modify, representation, public-state, insert-nodes and snapshot-index | All lifecycle rows use one delta and source scan finds no product transfer helpers | designed |
| Undo matches Lexical identity | Plite History Batch contains changes, effects and selections only; history.ts 24-65 | Delete, undo and redo revive exact RuntimeId in memory; History JSON round-trip receives fresh IDs | designed |
| Runtime IDs never serialize | Current collaboration contracts omit RuntimeIds | Document, change, history, clipboard, HTML, Markdown, debug codec and Yjs negative assertions | designed |
| Long histories stay bounded | Current 1,000-map and 50k laws compact mapped indexes | Add identity-targeted edits and sidecar cap and GC reachability receipts | designed |
| Named roots stay safe | Main and header reject each other's IDs; accessor-transaction.test.ts 464-495 | Runtime get and update reject wrong view; persisted getById returns rooted entry | designed |
| Persistence-off keeps features | Current IdElement and node.id assumptions show adoption pressure | AI, block selection, DnD, Table, DOM and React tests run in both modes | designed |
| Generated typing is exact | Schema already separates canonical and construction property maps; schema.ts 1290-1335 | On and off generated fixtures, construction omission, no IdElement, no EditorKit TS2589 | designed |
| Collaboration converges | Runtime IDs are already local and Yjs transports canonical content | Two peers insert, move, delete and reload; persisted IDs agree, RuntimeIds differ, hostile duplicate fails consistently | designed |
| Static rendering remains deterministic | normalizeStaticValue currently supplies deterministic IDs and timestamps | RSC, SSR hydration and repeated static-normalization equality tests after rehome | designed |

Conditional evidence:
- Generated IDs must appear in the originating canonical commit, with one
  history step and no correction transaction for initial load, insert, split,
  paste, schema publication, or value replacement.
- Copy, duplicate, local paste, cross-editor paste, split, move, full import,
  and exact same-object reattachment each get their own row. No event heuristic
  may collapse these distinct laws.
- Origin peers canonicalize persisted IDs before Yjs emission. Remote valid
  content never generates. A hostile remote duplicate fails validation instead
  of triggering peer-local random repair.
- RuntimeId branding and arena-nonce allocation must reject raw persisted
  strings, foreign editor IDs, and wrong-root mutation at compile time or
  runtime as appropriate.
- Arena benchmarks compare against today's nested WeakMaps at 1k, 10k, and 50k.
  Release requires no more than 10 percent retained-heap regression at 50k, no
  more than 5 percent median initialization regression, no more than 10 percent
  p95 edit regression, and zero descendant scans for known or unknown IDs.
  If heap misses, prototype a compact arena-owned ordinal table; never retreat
  to scan-based lookup.
- History tests cover batch merge, cap eviction, redo clearing, shared history,
  schema publication, and GC reachability. Sidecars cannot outlive their batch.
- Browser proof is required on /blocks/block-selection-demo,
  /blocks/table-demo, and /blocks/ai-demo. Physical device proof does not apply
  to this identity claim.
- Current-state docs and one major changeset teach only the final API. Generated
  templates and apps/www public registry output remain CI-owned.

Findings:
- Plite has most ingredients, not the finished law. IDs cover text and elements
  and stay out of JSON, but allocation is partly lazy, strings alias across
  editors, reverse lookup can traverse, continuity has several owners, and
  change-only history does not revive deleted identities.
- Plate NodeIdPlugin solves persisted JSON identity while pretending to be a
  plugin capability. It mixes schema presence, initial repair, copy policy,
  split inference, duplicate scanning, local normalization, and configuration.
- Lexical has the best identity law: mandatory private key, same key for the
  same logical node, fresh key for copy, direct lookup, no key in JSON, and
  identity revival through in-memory undo.
- ProseMirror and Wordgard confirm that mapped positions remain valuable for
  structural addresses and selections. Neither replaces private identity.
- RuntimeId and persisted id cannot be one type. Persisted IDs are untrusted,
  cross-session, optional, and peer-shared. RuntimeIds are mandatory,
  nonserialized, arena-local, and absent while a node is deleted.
- The missing generic Plite schema primitive is generated and unique property
  materialization that distinguishes optional construction from required
  published output and embeds generation in the originating change.

Decisions and tradeoffs:
- Keep RuntimeIds on all descendants, not just elements. Text subscriptions
  already benefit, and one invariant is cheaper than two identity systems.
- Keep view-scoped access. Named roots share one arena but retain independent
  transaction and selection spaces.
- Keep paths and anchors. RuntimeId answers which logical live node, path
  answers where in this snapshot, and anchor answers how a position maps.
- Copy Lexical's direct lookup guarantee, not its storage model. The live map is
  justified because retrieval is the core identity job; nested JSON remains
  canonical and mapped indexes own paths.
- Default Plate persistence to true, but make persist false exact. Runtime
  behavior must be identical in both modes.
- Persist IDs on every element, including inline and open-world elements.
- Accept one O(n) ingress pass for persisted validation and materialization.
  Reject repeated full-document scans after publication.
- A RuntimeId is absent while deleted, but same-editor in-memory undo, redo, or
  exact reattachment revives it. Reload, serialized history, peers, and copies
  receive fresh IDs.

Review fixes:
- Routed the work from Plate-primary to Plite-primary because private identity
  belongs below the plugin system.
- Rejected the earlier sparse-reverse-lookup-is-enough claim. Direct live lookup
  is required to match Lexical; mapped paths remain for structural location.
- Rejected the earlier fresh-ID-on-undo law. In-memory history now owns a private
  identity sidecar and revives exact identity.
- Rejected ElementIdPlugin as a rename of the same mistake.
- Kept persisted and runtime identities distinct while making both first-class
  in their correct layers.

Error attempts:
| Error or failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| A zsh glob for nonexistent Plite collaboration files failed | 1 | Search known package roots with rg | Yjs and Plite collaboration owners were found. |
| A large contextual patch hit stale plan text | 1 | Replace the plan atomically with one coherent final artifact | Contradictory old conclusions were removed. |

Verification evidence:
- Current repo source cursor: a146a3e7bbc8976da01437eb7636ab84814ce0cd.
- Reference cursors: Lexical dd5c41b13193efa9ab1574234d8593d2c9e4f988;
  ProseMirror model 6264de069d8439131e88f8ba06973551916184e4;
  ProseMirror state ffad5d9450a0b93438be53a801deee1a223a81bf;
  Wordgard c715d4ded8fc780f52c13206e589ea31e4148dd4.
- Live source confirms per-node nested WeakMaps, per-editor n0 allocation, lazy
  reverse materialization, mapped-index compaction, root isolation, scattered
  transfer owners, change-only history, local collaboration identities, Plate
  NodeId option complexity, and canonical versus construction property types.
- Lexical source confirms direct lookup, same-key writable clones, fresh-key
  copies, identity-free serialization, and key-bearing EditorState history.
- A read-only current-runtime probe confirmed that deletion makes lookup null
  and current undo restores content with a fresh RuntimeId. This plan
  intentionally changes undo to exact in-memory identity revival.
- NodeIdPlugin.ts currently owns schema, initialization, insertion, split,
  paste, scanning, manual normalization, and eight public state fields. Direct source
  searches found assumptions across Core, AI, selection, DnD, Table, media,
  suggestion, markdown, comment, registry, and docs.
- node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-07-runtime-element-identity.md passes after this rewrite.
- Planning-only artifact: no product source, exports, docs, registry code, or
  generated templates changed.

Final handoff prepared:
- Plite owns the arena, private deltas, in-memory history continuity, branded
  RuntimeId, direct lookup, generic targeting, and generated and unique property
  substrate. Plate owns intrinsic optional persisted IDs through its compiler.
- Cut read.runtime id and path alternatives, NodeIdPlugin, NodeIdPluginState,
  IdElement, nodeId editor option, update capability, every policy flag, numeric
  IDs, normalizeNodeId, plugin dependencies, and runtime use of persisted IDs.
  No replacement plugin or compatibility alias survives.
- Keep normalizeStaticValue only as a rehomed deterministic editor utility with
  no ID-specific policy switches.
- Execution order is arena, continuity and history, generic schema law, Plate
  policy and plugin deletion, consumer and collaboration adoption, then docs,
  browser, performance, full checks, and P2 autoreview.
- User acceptance of this architecture is the only next decision.

Timeline:
- 2026-08-07T08:41:09.667Z Initial Plate-oriented identity plan created.
- 2026-08-07 Runtime and persisted owners audited; target routed to Plite with
  Plate adoption.
- 2026-08-07 Public lifecycle, generated schema, adoption, and proof designed.
- 2026-08-07 User required Lexical-grade identity and full NodeIdPlugin deletion;
  prior ElementIdPlugin replacement marked invalid.
- 2026-08-07 Lexical history and direct lookup re-audited; final target gained
  the arena, private identity delta, history revival, direct lookup, and complete
  plugin deletion.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Final planning handoff |
| Where am I going? | User acceptance, then ordered plite-plan execution |
| What is the goal? | Lexical-grade private identity plus intrinsic optional persisted IDs, with NodeIdPlugin deleted |
| What have I learned? | Plite owns the ingredients but is weaker on direct lookup, aliasing, continuity ownership, and undo revival |
| What have I done? | Audited the gaps, assigned every responsibility, locked the API and architecture, and designed execution and proof |

Open risks:
- Identity deltas must compose and invert through history merge, caps, shared
  history, named roots, and schema resets without leaking into serialized data.
- The direct live map must pay its rent. If it misses the 50k heap gate, use a
  compact arena-owned ordinal table, not scan-based lookup.
- Generated and unique materialization must remain atomic and must not make
  pure fitting, replay, or remote application generate IDs.
- AI fields mix session-local selection with server references and require
  field-by-field classification rather than mechanical renaming.
