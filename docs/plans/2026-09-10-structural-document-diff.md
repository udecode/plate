# Structural document comparison after native authored changes

**Final implementation specification.** The design and bounded planning probes are complete. Implementation follows the prerequisite and S0-S6 below; production acceptance requires all 43 families. This handoff does not mark any implementation slice complete.

## Execution contract

Build one structural comparison engine for saved revisions, imported drafts, Suggestions and three-way review. Preserve exact document content, meaningful continuity and every branch contribution. The accepted target is ordinary schema-valid JSON plus immutable comparison results, composable effects, canonical DocumentChange operations and the existing native authored/position owners.

The first dependency is [native authored changes and Suggestions](2026-09-10-native-authored-changes-and-suggestions.md). Its current status is a completed plan with product implementation not started. Complete its S1-S8 and all 32 production families before this plan's S0. A planning checklist, prototype receipt or plan-checker pass cannot satisfy that prerequisite. If execution begins after another task completes it, verify the final source and production receipts instead of repeating its implementation.

The implementation boundaries are fixed:

- Plite diff owns immutable comparison, bounded inference, semantic groups, diagnostics and detached resolution. The Plate facade reexports that implementation.
- Native authored/change/schema owners supply retained identity, ranges, valid materialization, live-baseline checks, proposal publication, decisions and transport semantics.
- Plate owns comparison/review presentation and the existing Suggestions, AI, version-history and Discussion consumers. Comments retains conversations and durable anchors.
- Delete the annotated-node diff protocol and redundant managers. Comparison never becomes a second document store, review engine, position system or required service.

No product or Git publication is performed by this planning handoff. Once execution is authorized, work in the current checkout through the complete local implementation and proof sequence. Record source fingerprints and actual evidence at every slice exit. A failed native invariant reopens its owning decision; no compatibility layer or suppressed proof may substitute for the required behavior.

Objective:

Design structural document comparison, its Plite model/API, Suggestions integration and adoption after native authored changes. Complete a source-backed design and executable planning probes without changing production code.

Flow mode:

Agent-led design and plan hardening. Best API owns the contract; Plite Plan owns model, adoption and proof. Architect's distinct candidates are considered sequentially under the user's tool mapping. Native Autogoal tracks this design task only.

Goal plan:

docs/plans/2026-09-10-structural-document-diff.md

Template:

docs/plans/templates/plite-plan.md, adapted to a follow-on design whose production prerequisite is owned separately.

Completion threshold:

- Source-grounded current/prerequisite boundary, distinct model alternatives, one justified target, concrete proposed APIs, structural behavior specification, dependent ownership, bounded planning probes, source identities, adoption/proof sequence, explicit limits and checked handoff.
- Design completion does not certify production behavior or the separately owned prerequisite. Execution must wait for the completed native authored-changes plan and revalidate its actual APIs.

Verification surface:

Current Plite diff/change/schema/identity owners; version-history and AI consumers; the native authored-changes plan; disposable fixtures and executable model/cost probes in this plan's artifact directory; local link/source verification and the existing goal-plan checker.

Constraints:

- The user authorizes designing an independent implementation, including changing the Plite JSON model if the requirements justify it.
- Complete `docs/plans/2026-09-10-native-authored-changes-and-suggestions.md` before this plan's production implementation. Treat its target APIs as prerequisites, not existing implementation.
- Preserve exact content/properties, valid materialized document schemas, native position/selection laws, atomic changes, author/dependency truth and collaborative convergence.
- No production mutation, publication, dependency installation or external messages is authorized by this design. No compatibility framework, mandatory new storage backend, or hypothetical dependent creates its own public owner.

Boundaries:

- In scope: snapshot comparison, recorded-change use, moves with internal edits, splits/merges, formatting/inline atoms/tables, identity/lineage, ambiguity, review grouping, canonical application, Suggestions/AI/version-history integration, explicit three-way extension, scale and adoption.
- Source owners: `packages/plitejs/src/diff`, `packages/plitejs/src/core/change`, schema/identity/anchors, and affected Plate diff/Suggestion/AI/example consumers.
- Non-goals: implementing the prerequisite, a general source-control product, legal/licensing analysis, or a whole-editor replacement without a demonstrated model law.

Blocked condition:

A decision-changing model or correctness question with no remaining executable local investigation prevents target acceptance. An unavailable completed prerequisite prevents production acceptance but does not prevent this requested follow-on specification. Any unmeasured runtime candidate remains explicitly provisional.

Output budget strategy:

Read named owners in bounded slices. The initial combined method read exceeded its output budget; subsequent reads use one owner or stored slices. Keep source inventories and raw measurements in artifacts.

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Authority and order | yes | User asks for independent design, permits Plite model changes, and requires native authored changes first; branch read is `next` |
| First-principles design | yes | Best API plus common/Plite doctrine; compare whole models before implementation convenience |
| Runtime scale | yes | Cross-document matching, repeated spans, identity maps and dependent reads require an embedded Benchmark probe |
| Current and prerequisite owners | yes | Current source/prerequisite table and matching final source fingerprints |

Work Checklist:

- [x] U1: Capture independent specification and prerequisite sequencing; user request and Task workflow.
- [x] U2: Challenge the JSON model, change algebra, identity and ownership above/below diff; Best API hard-cut and first-principles method.
- [x] U3: Specify moves with nested edits, splitting/merging and richer structures with truthful ambiguity; user requirement.
- [x] U4: Design actual Suggestions/AI/version-history consumers and bounded future dependents; one canonical mutation/decision authority.
- [x] A1: Trace live owner/types/exports/consumers and distinguish prerequisite targets; Best API Required Inputs.
- [x] A2: Compare at least two structurally different candidate models and screen interface depth, hidden coordination and information leakage; Architect.
- [x] A3: Show normal/custom/advanced proposed call sites, typed outputs and add/change/remove ownership; Best API Output Contract.
- [x] P1: Freeze and run the smallest decisive baseline/target correctness and scale probes; Benchmark embedded architecture contract.
- [x] P2: Record limits, pathological input behavior and exact final-production rerun requirements; Plite Plan.
- [x] P3: Specify adoption slices, all public breaks, affected native/collaboration/format proof and three realistic failure scenarios; Plite Plan.
- [x] C1: Reconcile obligations, verify source identities and links, run plan checker and prepare a concise self-contained handoff; Autogoal checklist retention.
- [x] E1: Consolidate the accepted target and explicit prerequisite into one final execution contract; user request and Plite Plan readiness.
- [x] E2: Specify exact owner/route/command handoff and assign all 43 production families to non-circular completion slices; Plite Plan execution and root package scripts.
- [x] E3: Refresh artifact fingerprints, source checks, links and the existing plan checker after final consolidation; Task and Autogoal.

Phase / pass table:

| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Current owners and prerequisite traced | Four model alternatives |
| Sketch and decide | complete | Four alternatives, proposed API and 43 behavior families after OSS validation | Bounded model probes |
| Prove and hand off | complete | Model/interval receipts and source/link validation; full runtime remains provisional | Complete prerequisite before S0 |

Decisions and evidence:

The first review's four current-engine probes show move, move-plus-edit, split and merge represented as insertions/deletions. `DiffIntent` has only insert/delete/update, `elementsAreRelated` is scoped to adjacent replacement chunks, and `platejs/diff` reexports the Plite owner. This establishes a comparison-model gap; it does not establish that the public JSON tree itself is inadequate.

Error attempts:

| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Combined method output was truncated | 1 | Bounded owner reads and stored slices | Relevant omitted obligations recovered |
| Initial model guard omitted whitespace correspondence | 1 | Align whole bounded components and assert complete unchanged-token pairing | Initial receipt retained with correction; final 12 cases and four cost cohorts pass |
| Patch wrapper could not parse Markdown backticks | 2 | Construct the patch from exact file text | No partial writes; final artifact validation remains required |

Verification evidence:

Final evidence: model-probe.json passes 12 bounded structural cases and four frozen cost cohorts with nine matching source fingerprints. interval-probe.json passes eight supplied-span/freshness witnesses with a matching script fingerprint. Both scripts pass node --check. The initial verification.json confirms that revision's local links, source identities and 34 production acceptance rows. The linked OSS research verification supersedes its plan-count check for the amended 43-row specification. The existing plan checker validates recorded design completion; no complete-runtime or native claim is transferred from these witnesses.

## Decision

**Keep ordinary schema-valid JSON as the public document. Replace diff-marked documents with immutable span correspondence and composable effects. Use the same comparison operation for two revisions and branch-preserving three-way review; create native proposals only through an explicit action.**

The unit of continuity is a content span, not necessarily a node. One source span may continue across several target nodes; several source spans may become one target node. The same relationship can move and contain text/property edits. Node shape, occurrence identity, content continuity, historical authorship and presentation grouping are separate facts.

The largest justified cut is the competing product mutation protocol. Native authored changes owns retained review state, DocumentChange owns mutations, and Comments owns conversations. A comparison is an immutable answer about fixed revisions, with no editor-global store or subscriptions.

The [OSS review](../plite/research/2026-09-10-structural-diff-oss/README.md) keeps this architecture and strengthens its public shape. Replace the merge-first result with a complete three-way comparison and pure resolution: a merged result alone drops review information that must survive even when changes do not conflict. A moved span can also split and change formatting, so one exclusive change-kind tag cannot be the full relationship model.

The complete runtime target remains **provisional until the prerequisite and production gates pass**. The planning probe establishes a bounded representation/cost fact. It neither selects a complete matching algorithm nor proves the future native integration.

## Current owners and prerequisite

| Owner | Observed fact | Consequence |
| --- | --- | --- |
| [computeDiff](../../packages/plitejs/src/diff/lib/computeDiff.ts) | DiffIntent contains insert/delete/update; elementsAreRelated participates inside adjacent replacement chunks; output is annotated Descendant arrays. | General moves and many-to-many correspondence require a different contract. |
| [Plate diff facade](../../packages/platejs/src/diff/index.ts) | Reexports plitejs/diff. | Keep one lower implementation and exact facade identity. |
| [Version history](../../apps/www/src/registry/examples/version-history-demo.tsx) | Clones Values, computes an annotated value and mounts a read-only editor with a copied DiffPlugin. | Preserve snapshot comparison, replace its annotation protocol. |
| [AIChatPlugin](../../packages/platejs/src/ai/react/AIChatPlugin.ts) and [Suggestion](../../packages/platejs/src/features/suggestion/lib/BaseSuggestionPlugin.ts) | AI invokes Suggestion.api.diff; one path overlays existing properties by index and ignores id. Suggestion writes review metadata into nodes. | AI/import needs validated correspondence and atomic native proposal creation. Index position is not identity. The prerequisite owns deleting the old Suggestion engine. |
| [JSON model](../../packages/plitejs/src/core/change/tokens.ts) | Elements contain children; text leaves contain strings/properties; documents support named roots. | Required visible target structures fit ordinary JSON without public tombstones. |
| [NodeKey and snapshots](../../packages/plitejs/src/interfaces/editor.ts) | NodeKey is runtime-owned; SnapshotIndex maps keys and paths. | A key/path or coincident imported id cannot prove cross-revision identity. |
| [DocumentChange](../../packages/plitejs/src/core/change/document-change.ts) and [root alignment](../../packages/plitejs/src/core/change/root-change.ts) | Apply/invert/compose/serialize/transform exist. Snapshot alignment caps sibling matrices at 4,096 cells and can fall back to replacement. | Reuse the algebra; keep expensive human-facing comparison off native editing paths. |
| [Relocation derivation](../../packages/plitejs/src/core/change/mapping.ts) and [tests](../../packages/plitejs/test/document-change-relocation.test.ts) | Detects a single exact move and multiple unique unchanged subtree moves. General derived matches require equal content. | Plite already supports some moves. Edited movement, span continuity and provenance are the comparison gap. |
| [Schema reads](../../packages/plitejs/src/core/editor-schema.ts) and [contracts](../../packages/plitejs/src/interfaces/schema.ts) | Compiled facts include inline/atom/isolating behavior, properties, grammar, roots and schema identity. | Reuse schema facts instead of per-consumer isInline/ignoreProps callbacks. |
| [Heading](../../packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts), [List](../../packages/platejs/src/features/list/lib/BaseListPlugin.ts), [Table](../../packages/platejs/src/features/table/lib/BaseTablePlugin.ts) | Heading depth and flat-list indentation are properties; tables have rows/cells and span properties. | Physical nesting alone does not capture outline, list or logical grid structure. |

The [native authored-changes plan](2026-09-10-native-authored-changes-and-suggestions.md) is an external execution prerequisite, not a child deliverable of this design. Its target supplies retained content, serialized ranges, provenance, atomic capture, dependency-aware decisions, native projections and coherent persistence. Those APIs remain proposed until implemented.

After it completes, inspect its final API and replay native continuity before implementing this plan. Reuse sufficient facilities. Repair the native owner if move-plus-edit, split/merge, composition, serialization, rebasing or reload loses continuity. Diff must not grow a duplicate position/identity protocol.

Current flow: saved Value or parsed AI output → computeDiff → annotated nodes → renderer or Suggestion mutation policy.

Target flow: retained history or detached snapshots → native content correspondence and comparison groups → canonical changes/native review projections → Plate presentation. A comparison becomes authored state only through explicit native proposal creation.

## First-principles alternatives

The current jobs are structural comparison, editable/selective review, preserved positions and conversations, and imports without shared history. Hard laws are exact content, valid editable projections, truthful evidence, bounded deterministic work, atomic decisions and preservation of independent contributions.

| Candidate and normal usage | Interface depth and retained cost | Verdict |
| --- | --- | --- |
| A. Enrich annotated AST: computeDiff(before, after, callbacks), then teach consumers move/split tags. | Exposes synthetic nodes and callback-driven mutation policy. Many-to-many correspondence becomes another property protocol. | Cut; repeats the authority the prerequisite removes. |
| B. Public persistent graph: document.nodes[id], ordering edges, character/run IDs and visibility-aware reads. | Makes recorded identity intrinsic, but schema, selection, serializers and ordinary callers must interpret graph/visibility semantics. Imported snapshots still require inference. | Reject as a required public model. Retained identity already has a private native owner. |
| C. Accepted JSON plus native retained identity and span correspondence: compare({ before, after, schema }) returns Comparison. | Hides matching, positional bookkeeping and patch preparation. Exposes changes, evidence and uncertainty; native owners retain editable state. | Selected direction; runtime gates remain explicit. |
| D. Return only DocumentChange and infer review meaning from token replacements. | Small type, but consumers rediscover movements, split/merge relationships, grouping and ambiguity from an executable script. | Keep the mutation algebra; reject it as the entire comparison result. |

C is the base. B contributes retained occurrence/interval identity through the authored owner; D contributes the single mutation algebra. A contributes no retained protocol. Comparison earns a separate immutable value because explaining uncertain correspondence is a different current job from executing a mutation.

Architect/Arena questions were evaluated sequentially under the user's tool mapping. There was no independent-agent or independent-model-family review. Interface-depth screening rejects caller-managed token graphs, mutable Comparison managers, scoring-stage callbacks, vendor adapters and wrappers around existing native decisions.

### What changes in Plite

1. Keep the ordinary tree and named-root envelope. Each materialized projection is a valid document; the public AST need not encode every historical version.
2. Reuse native durable content/occurrence identity. A split does not force all content to inherit one node identity; a merge retains each contributing interval.
3. Preserve actual correspondence when native operations are constructed. The change/retained-position owner must carry it through composition and serialization instead of rediscovering it from final equality.
4. Inferred snapshot correspondence proposes operations; it never rewrites prior provenance. Once chosen, operations receive native identities/mappings under the importing actor.
5. Add only missing structural facts to schema compilation. No mandatory per-character JSON IDs, public tombstones, second document store or required CRDT.

Reopen the JSON choice only when a concrete valid projection or continuity law cannot be expressed without repeated feature-specific mutation logic. The span witness below demonstrates several difficult cases within the current tree; it is not a universal optimality proof.

## Proposed API

All added signatures/imports in this section are target designs, not existing or compiled implementations. Preserve exact schema/value inference. Callers do not annotate callback parameters, choose an algorithm or manage an engine lifetime.

### Saved-version comparison

~~~tsx
import { compare } from 'platejs/diff';
import { Diff } from '@/components/editor/diff';

const comparison = await compare({
  before: saved.document,
  after: editor.read.value(),
  schema: editor.read.schema,
  signal,
});

<Diff comparison={comparison} />;
~~~

The raw form imports compare from plitejs/diff. The operation captures immutable schema facts and endpoints once, runs bounded asynchronous work and returns one immutable result. It installs no plugin. Both sides default to accepted content. Cancellation publishes no partial Comparison. An old result remains a description of its fixed endpoints but cannot mutate a newer baseline.

The copied Diff component owns layout/style and reuses static rendering plus the prerequisite's retained-fragment projection mechanics. It creates no persisted proposals merely to display markup. Editing review content uses the normal native authored view after proposal creation.

### Import as Suggestions

~~~ts
const comparison = await compare({
  before: editor.read.value(),
  after: imported.document,
  schema: editor.read.schema,
  projection: { before: 'proposed', after: 'accepted' },
});

const result = editor.update.authored.propose({ comparison });

if (result.status === 'stale') {
  // Recompare against the current native view before proposing.
}
~~~

The new command belongs to the existing authored owner. It validates document identity, schema, projection, exact source content and the relevant authored frontier, compiles comparison groups into native operations and publishes one atomic proposal batch. Return a mapping from comparison-group IDs to durable authored change IDs.

The prerequisite's transaction-only tx.authored.propose({ changeId? }) remains the low-level control for ordinary edits and streams. Snapshot import is a complete command because callers must not coordinate baseline validation, group creation and canonical mutation themselves.

Use the authenticated current actor. Inferred source matches carry no historical author; AI source/model metadata remains separate. Repeating the same prepared import while its matching proposals remain active returns existing IDs. Changed/closed frontiers require a fresh comparison; the native owner manages retry identity.

Default import includes all actionable groups. An optional exact group selection binds the Comparison identity and validates the whole dependency batch. Ambiguity produces a complete replacement, or requires explicit resolution when selective application is unsafe. No implicit acceptance or dependency cascade.

Results distinguish applied, unchanged, stale, blocked, invalid and unavailable. They carry IDs and machine-readable reasons. Every non-applied outcome preserves content, proposals, comments, undo and transport state.

### Custom schemas and presentation

~~~ts
const comparison = await compare({
  before: oldContract,
  after: newContract,
  schema: contractEditor.read.schema,
  projection: { before: 'accepted', after: 'accepted' },
  signal: controller.signal,
});
~~~

The custom schema owns clause/heading identity, atom boundaries, property meaning and logical structure. Section, logical-line, word and grapheme/character highlighting are presentation over the same correspondence. Changing granularity does not rematch the document, alter canonical effects or change review-group identity. Eliminate global ignoreProps lists and pair-scoring callbacks.

### Two-way result contract

~~~ts
type TwoWayComparison<V> = Readonly<{
  kind: 'two-way';
  id: ComparisonId;
  before: ComparisonSnapshot<V>;
  after: ComparisonSnapshot<V>;
  change: DocumentChange;
  changes: readonly ComparedChange[];
  diagnostics: readonly ComparisonDiagnostic[];
}>;

type Comparison<V> = TwoWayComparison<V> | ThreeWayComparison<V>;
~~~

ComparisonSnapshot contains the resolved readonly projection and native/schema identity. Reuse the prerequisite's native serialized document ranges for before/after addresses; no parallel persisted Range type. Retain exact endpoint witnesses privately for validation.

The compared document is its materialized children and named-root content. Comparison does not copy an imported file's authored graph, local view state, authentication metadata or thread store into the destination. Those envelope fields can constrain freshness/provenance without becoming target content. Exact patch roundtrip applies to these prepared content endpoints; proposal publication separately preserves and updates the destination's coherent native envelope.

Proposed generic boundary:

~~~ts
declare function compare<V extends Value>(input: Readonly<{
  before: unknown;
  after: unknown;
  schema: EditorStateSchemaApi<V>;
  projection?: Readonly<{
    before: 'accepted' | 'proposed';
    after: 'accepted' | 'proposed';
  }>;
  signal?: AbortSignal;
}>): Promise<TwoWayComparison<V>>;
~~~

The schema infers the output document type; imported endpoints are validated unknown data. Invalid schema/data rejects with the owning native validation error, cancellation uses AbortError, and precision limits produce a complete result with diagnostics. Markup is a rendered projection and is not a comparison input. Type proof must reject malformed options and foreign schema/value assumptions without requiring callback annotations.

ComparedChange is a semantic group over content correspondence. Each group has a comparison-local ID, endpoint range sets, an effects array, nested detail IDs, required group IDs and recorded or inferred evidence. Every effect has a stable comparison-local ID and exactly one owning group; parent groups reference child groups without duplicating their effects. Its effects are individually typed: text/property changes, insertion/deletion, placement, split/join, wrapper or node-type change, and root lifecycle. Effects compose: one interval may move, split, acquire a wrapper and receive a text edit in the same comparison. One-to-many and many-to-many relationships must be representable directly, including when no whole source node survives unchanged.

A presentation may summarize such a group as a move or split, but that label is derived and cannot discard other effects. Parent movement subsumes inherited descendant movement; an independent descendant relocation or edit remains addressable. Unresolved correspondence remains a truthful replacement. Candidate matchings, many-to-many correspondence, canonical effects, review groups and visible highlight fragments are distinct data; do not expose the matcher's private search graph as a public manager.

Recorded evidence references validated retained operations/frontiers. Inferred evidence names its basis, such as unique content plus context. Diagnostics distinguish ambiguity, expired lineage, exhausted work, unsupported structure and incompatible schema. Numeric confidence does not establish identity.

Comparison/row IDs are deterministic for canonical endpoints, schema/interpretation version and matching policy. They are not durable authored IDs. Comments uses the authored IDs after import. Recomputed display grouping cannot silently rebind a persistent conversation.

The exposed DocumentChange is for detached patch inspection and canonical application/inversion on its bound content baseline. Normal live application uses the validated authored command. A raw change is not evidence that a same-length live document matches that baseline. If native baseline-bound application is still missing after the prerequisite, repair that owner before exposing live comparison application.

### Three-way comparison and explicit proposal creation

~~~tsx
const comparison = await compare({
  base: sharedVersion.document,
  local: editor.read.value(),
  remote: incomingVersion.document,
  schema: editor.read.schema,
  signal,
});

<Diff comparison={comparison} />;

const result = editor.update.authored.propose({
  comparison,
  baseline: 'local',
  resolutions,
});
~~~

Proposed overload and result:

~~~ts
declare function compare<V extends Value>(input: Readonly<{
  base: unknown;
  local: unknown;
  remote: unknown;
  schema: EditorStateSchemaApi<V>;
  signal?: AbortSignal;
}>): Promise<ThreeWayComparison<V>>;

type ThreeWayComparison<V> = Readonly<{
  kind: 'three-way';
  id: ComparisonId;
  base: ComparisonSnapshot<V>;
  local: ComparisonSnapshot<V>;
  remote: ComparisonSnapshot<V>;
  changes: readonly ComparedChange[];
  conflicts: readonly ComparisonConflict[];
  diagnostics: readonly ComparisonDiagnostic[];
}>;
~~~

Three-way endpoints default to accepted content, preserving the same lossless envelope validation as two-way comparison. Add per-endpoint proposed projections only through the same explicit projection vocabulary when that current job is implemented; never compare rendered markup as input.

Keep the base-to-local and base-to-remote contributions, including unilateral deletion, identical edits made on both branches, non-conflicting formatting, and moved-and-edited content. Every contribution retains its endpoint ranges and branch origin (local, remote or both). All three exact endpoints remain reconstructible. No merged document or automatically accepted target replaces that evidence. Branch origin is not authenticated authorship; validated native lineage may establish authors, while detached imports receive only source labels.

Conflict components carry the base and both branch alternatives, affected effects and prerequisites. They are readable and navigable before resolution. Divergent moves, edit/delete, incompatible split/join, root/schema changes, conflicting order and incompatible grid topology require explicit choices. Choosing an alternative or a custom schema-valid target binds the comparison and exact conflict IDs. Choices are consumer draft state until submitted; comparison results remain immutable. Native authored preview and proposal creation share the same validation/preparation owner.

The native three-way proposal command requires baseline: base, local or remote. It verifies that exact endpoint, projection, schema and relevant authored frontier against the current editor. The normal incoming-draft job uses local. Reviewing both branches as pending proposals from the common version uses base on an editor actually holding that version. Groups already satisfied by the selected baseline are reported as such; do not fabricate new authored IDs or retroactive authorship. Omitted group selection means all actionable changes relative to that baseline; unresolved conflicts in that batch block the entire command without writes. A deliberate subset must pass the complete dependency and schema checks.

The native owner compiles the selected effects and resolutions into a valid target and canonical operations, then creates proposals under the importing actor with separate branch/source metadata. No imported change becomes accepted merely because its branches merge cleanly. Unselected or unresolved alternatives remain in the immutable comparison. Editing an imported proposal uses the prerequisite's native editable views; changed comparison endpoints require a fresh comparison before another import.

Detached automatic merging remains a supported current job. The proposed pure resolveComparison operation consumes an existing three-way comparison; it does not rematch the inputs or create an editor. It returns a resolved two-way comparison from the chosen baseline to the materialized target, or explicit unresolved/invalid components without a partial target. With no conflicts, the default combines both branches. With conflicts, revision-bound choices or a custom valid target are required.

~~~ts
import { resolveComparison } from 'platejs/diff';

const resolved = await resolveComparison({
  comparison,
  baseline: 'base',
  resolutions,
  signal,
});

if (resolved.status === 'resolved') {
  const mergedSnapshot = resolved.comparison.after;
  const patch = resolved.comparison.change;
}
~~~

Native preview/proposal creation reuses that same resolver internally and then performs live-baseline, authored-frontier, actor and atomic-publication checks. The source three-way comparison remains immutable and retains branch evidence after resolution. Remove the proposed merge function that accepts and recomputes three raw inputs. Comparison and resolution are separate pure jobs with one matching result and one canonical mutation algebra; neither gains a manager, branch store or transport.

The proposed resolver boundary makes every completion state explicit:

~~~ts
declare function resolveComparison<V extends Value>(input: Readonly<{
  comparison: ThreeWayComparison<V>;
  baseline: 'base' | 'local' | 'remote';
  resolutions?: readonly ComparisonResolution[];
  signal?: AbortSignal;
}>): Promise<
  | Readonly<{
      status: 'resolved';
      comparison: TwoWayComparison<V>;
    }>
  | Readonly<{
      status: 'unresolved';
      conflicts: readonly ComparisonConflict[];
    }>
  | Readonly<{
      status: 'invalid';
      diagnostics: readonly ComparisonDiagnostic[];
    }>
>;
~~~

ComparisonResolution binds the comparison ID and exact conflict IDs to a branch choice or explicit custom target. The resolver validates the complete target with the captured schema. Unknown, duplicate or inconsistent choices return invalid; missing required choices return unresolved. Both states omit a target and patch. Cancellation rejects with AbortError. The native command uses these same choices and preparation rules, then checks the current editor before publishing.

## Matching laws

### Recorded and inferred routes

- Complete validated native history derives actual continuity. Compose it to explain the net difference and retain historical references. Insert-then-delete can produce no net diff while remaining in retained history.
- Missing/expired lineage selects content inference with a diagnostic. Equal IDs from independently imported files remain hints until their identity domain and uniqueness are validated. Absence of history never proves an author, move or copy.
- Comparison is an explicit whole-document operation. Suggestions remains incremental; do not rediff recorded native edits on each keystroke.

### Content, structure and formatting

Build a private comparison index over native DocumentIndex/retained-position facilities. It describes structural boundaries, exact content intervals/atoms and schema-resolved properties. Span correspondence supports discontiguous source/target ranges and is independent of leaf partitioning.

Equivalent adjacent text runs may compare equal despite different leaf partitions. That presentation equivalence does not permit trimming whitespace, normalizing Unicode, changing line endings, dropping properties or removing meaningful empty blocks. Preserve original coordinate correspondence on both sides.

The native importer performs existing lossless canonical preparation before generating an actionable target, and reports that target and diagnostics. Lossy import/schema repair must occur explicitly before comparison. Two separate assertions govern correctness: canonical apply/inverse reproduces both prepared endpoints, and visible comparison suppresses only proven representation differences. Every content/property change appears in a row or an explicit opaque-region diagnostic.

### Logical structure

The physical tree does not fully describe heading sections, indented lists or table columns. Add a small declarative structure facet to the existing feature/schema contribution and compile it with the same schema identity. First reuse equivalent facets added by the prerequisite.

Initial forms cover outline depth, list membership/depth and logical grid topology using installed type/property identities. Proposed heading shape:

~~~ts
schema: {
  element: {
    ...schema.element.textBlock(),
    properties: { level: headingLevelProperty },
    structure: { kind: 'outline', level: 'level' },
  },
}
~~~

The property reference must infer from and validate against that exact element. List traits live with existing membership/indentation contributions. Table traits reference the existing row/cell grammar and span properties; they do not create another table model. Native compilation validates and fingerprints semantics. Private comparison regions consume those facts.

No raw Plite checks for Plate's literal node names, StructureManager, per-document schema mirror or matcher callbacks. A custom feature without logical traits still gets exact tree/atom/property comparison, with an honest limitation on higher-level grouping. New trait variants require a concrete feature and fixture.

### Bounded inference pipeline

This is the production contract, not a claim that the prototype implements the entire matcher:

1. Pin endpoints, schema, interpretation policy and evidence route. Validate/detach untrusted JSON through the existing codec before matching.
2. Lock verified native identity and unique exact structural/content matches. Hashes only choose buckets; equality verifies payloads, including forced-collision tests.
3. Use rare content anchors and structural context to discover bounded candidate sets across sibling order and allowed parent/root changes. Never build a whole-document Cartesian matrix or use array-index IDs as identity.
4. Refine unmatched regions with bounded sequence/span alignment allowing one-to-many and many-to-many correspondence. Mid-word splits and text without spaces remain representable.
5. Recognize movement from corresponding ancestry and relative order. An insertion before a paragraph is not a move. A moved parent subsumes descendant movement unless a descendant independently reorders.
6. Derive nested content/property edits, compile a canonical change and validate coverage, source/target consumption and schema-valid materialization.
7. At the deterministic work ceiling, emit a complete coarse replacement for the affected region plus a precision diagnostic. Partial work never masquerades as a complete patch. Cancellation returns no result.

Prioritize lexicographically: exactness/hard constraints; verified identity; preserved content correspondence; minimal misleading insert/delete noise; compact structural grouping; deterministic display order. Do not claim a universal minimum edit distance or reconstruction of unknowable user intent.

Primary correspondence consumes each source and target interval at most once. Copy is a secondary explanatory link to inserted content with a new occurrence identity. It cannot transfer the source's anchors, author history or Comments. Indistinguishable duplicate matches remain ambiguous; a display tie-break does not establish historical intent.

Native offsets remain UTF-16. Display ranges respect grapheme boundaries while preserving exact code units, combining sequences and line endings. Version segmentation policy/locale when it affects output. No external model/service judges canonical matches.

### Review presentation and counting

Section grouping follows the compiled outline; a line means a logical text line or block break, not a browser soft-wrap. Character presentation preserves UTF-16 coordinates and expands visual boundaries to valid grapheme clusters. Word segmentation is locale-aware and versioned; whitespace, punctuation and no-space text remain exactly recoverable. A resized viewport may change visual wrapping but cannot change comparison IDs, effect counts or selected proposals.

Count semantic review groups and leaf effects separately. A parent move with two interior edits is one top-level movement group with two interior edit details; its inherited descendant positions are not extra moves. Moving and splitting the same content may expose multiple effect facets without counting the same source content twice. Counts always declare the unit and the filtered/total denominator.

Filtering by effect kind, branch/source or review status affects navigation and display only. Keep parent context and move source/destination navigation available for visible children. A bulk action sends exact group/effect IDs to native validation; it cannot silently include hidden dependent groups. Native preview reports those prerequisites or blocks the selection. Renderers derive these views from immutable rows and existing authored records; no mutable DiffManager, per-filter rematching or additional subscription protocol is introduced.

## Dependents and lifetime

| Dependent | Uses | Retains ownership of | Must not own |
| --- | --- | --- | --- |
| Version history | Comparison plus saved endpoint envelopes | Version storage, picker, layout and explicit restore | Matching or another document history |
| Suggestions | Native comparison import, authored records and projections | Product review controls/presentation | Separate mutations, decisions, identity or rebase |
| AI replacement/import | Prepared target and native proposal command | Network/stream lifetime, scope and source/failure metadata | Index-based identity or bespoke accept/reject |
| Incremental AI stream | Existing native pending change ID | Streaming and cancellation | Whole-document diff per token/keystroke |
| Comments/Discussions | Durable authored IDs and native ranges | Conversation truth and combined navigation | Comparison-local IDs as persistent targets |
| Markdown/HTML/DOCX | Explicit native accepted/proposed/markup projection | Format semantics and limitations | Another change algebra |
| Undo/History/Yjs | Actual canonical authored operations | Local undo, causality and transport convergence | Rerunning inference independently on peers |
| Three-way review | Base/local/remote contributions, alternatives and conflicts | View choices and explicit native proposal action | Dropping clean branch changes, hidden winner policy or a second branch store |
| Future summaries/export/audit | Immutable rows and evidence | Their concrete presentation/export job when implemented | Speculative stores/plugins reserved today |

Results belong to their requesting consumer. No cache outlives its endpoints without an existing owner and measured need. Virtualized rows share one immutable result; native review uses existing keyed records. Replacement cancels or ignores obsolete work and releases retained snapshots. There is no subscriber per row or full-history scan per visible card.

## Application laws

- Validate schema/document identity, projection, exact source payload and relevant authored frontier. Same length, a foreign runtime version or a caller-supplied trust flag is insufficient.
- Imported IDs/envelopes are untrusted data. Authentication/authorization remains application-owned; native import uses the current actor and validates identity domains.
- Partial application chooses semantic groups. A move and its edits may be decided separately only when native dependencies and schema prove both outcomes. Inseparable table/split changes remain one group.
- Native operation construction preserves real correspondence through composition/serialization/rebase. Reuse completed prerequisite facilities; extend them only where the actual invariant fails.
- Saved comparison artifacts contain no editor pointers, NodeKeys or DOM nodes. A codec binds canonical endpoints, schema and policy version; decoding does not bypass application validation.
- Stale, blocked, invalid, unavailable or cancelled work changes no document/proposal/comment/history/transport state.

## Decision ledger

| Surface | Target and owner | Adoption/proof | Principal risk | Verdict |
| --- | --- | --- | --- | --- |
| Public document | Valid JSON plus completed authored envelope; Plite model/schema | Roundtrip witness and post-prerequisite continuity | Confusing visible state and history | Keep |
| Public persistent graph/tombstones | Native retained internals only where justified | Plain serializers and ordinary editors remain direct | Global visibility-dependent consumers | Cut as public model |
| Comparison | Immutable endpoints/change/groups/diagnostics; plitejs/diff and exact Plate facade | Inference/endpoint and type contracts | Mistaking inferred match for identity | Add; full runtime provisional |
| Annotated-node authority | Derived presentation; native projection + copied UI | Migrate real consumers before deleting old exports | Hidden metadata/copy paths | Cut |
| Mutation/position truth | Existing authored, DocumentChange and anchors | Apply/invert/compose/serialize/rebase/native proof | Edited move loses continuity | Reuse; prerequisite gate |
| Logical structure | Feature facts in existing schema compiler | Outline/list/grid fixtures and typed references | Duplicate grammar or concrete type checks | Add narrowly; runtime provisional |
| Snapshot proposal creation | One native authored command | Freshness/dependency/rollback/ID/reply proof | Stale writes and false attribution | Add to existing owner |
| Core snapshot fallback | Bounded canonical synthesis with shared native mapping | Existing core callers preserve correctness/locality | Full diff cost entering native edits | Keep its job; consolidate duplicated mechanics during adoption |
| Three-way comparison and resolution | Same compare operation plus pure resolveComparison; native proposal owner reuses resolution | Three-revision structural/review corpus, detached merging and clean deletions | Losing provenance before review or guessing conflict winners | Add after two-way/native proof; replace merge-first result |
| Diff plugin/manager/backend API | Copied rendering/private computation as needed | Import graph/lifetime proof | Another state owner or mandatory service | Cut |

## Execution sequence

These gates belong to implementation. Current execution status: the prerequisite and S0-S6 are not complete. Each slice must carry its passing source-bound exit evidence before the next dependent slice starts. Foundation and matcher stages prove their owned behavior; UI/native consumer families close only after those consumers exist. The acceptance matrix assigns every family a completion slice, so later browser work cannot block an earlier matcher stage.

| Slice | Owner | Entry | Work and exit |
| --- | --- | --- | --- |
| S0: prerequisite reconciliation | Plite Plan | Native authored plan and its production gates completed | Fingerprint final APIs; replay move-plus-edit/split/merge continuity. Reopen this design on a conflicting native result. |
| S1: native contract | Plite change/authored/schema | S0 | Implement the specified span/effect contracts, typed schema facts, retained ranges and native baseline binding. Pass focused type, codec, transaction, mapping and schema tests for these foundations. Preserve completed prerequisite laws and measure changes to native work. Full matcher/import/UI families close in later slices. |
| S2: two-way matcher | plitejs/diff | S1 | Implement bounded matching, composable effects, grouping, diagnostics and canonical compilation. Close the S2 families below, produce semantic fixtures for later UI proof, and rerun the frozen cohorts using production compare. Validate pure cancellation and bounded work here; complete browser, memory and event-to-paint coverage at S4/S5. |
| S3: proposal integration | Native authored + Plate Suggestions/AI | S2 and completed native projections | Implement atomic import, freshness, group-to-authored IDs, dependencies and current-actor/source metadata. Close the S3 families with actual native accept/reject/undo/reload/remote-edit and stream behavior. Use the prerequisite's existing editable views; the standalone comparison renderer is S4. |
| S4: comparison UI/formats | Version-history/Discussion/format/copy owners | S2-S3 | Implement the copied Diff renderer, retained markup, evidence labels, granularity, navigation/counts/filters and explicit format projections. Close the S4 families on real routes, including all 14 structural quality scenarios and event-to-paint/memory/cancellation proof. |
| S5: three-way review | Diff + native authored/change owner | S2-S4 | Implement branch contributions/alternatives, baseline selection, pure resolution and native proposal creation through that resolver. Extend the S4 UI for branch review, and close the S5 families including branch permutations, topology, dependencies and full three-way cost. Rerun affected earlier families after shared-owner changes. |
| S6: hard cut and closure | Task + technical owners | Promised behavior proven | Remove computeDiff tag/callback protocol, excludeDiffFragment and old DiffPlugin wiring; migrate all callers/docs, generate barrels/registry, repair doctrine and run final source-bound handoff. |

No document/codec migration version is allocated here. Use the data/release owner's approved version after the prerequisite and preserve historical fingerprints/attestations.

### Execution commands and proof ownership

At S0, read the completed prerequisite's final API and proof, the current diff owner and its consumers. Reconcile names and already-completed native work in this plan before editing. Keep the accepted ownership and behavior unless a concrete source or proof result contradicts them.

Use the existing package lanes during S1-S5:

~~~sh
pnpm check:plite:dev
pnpm turbo typecheck --filter=./packages/plitejs --filter=./packages/platejs
bun test packages/plitejs/src/diff
pnpm lint:fix
~~~

Run the source-first checks for the packages actually changed and the focused behavior tests for each slice. Add the new native/authored cases to the prerequisite's final test owners and the comparison cases to the diff owner. A command with no matching cases cannot satisfy a family. Install dependencies only when the task or dependency state requires it; no build solely to typecheck source.

Use the current registry routes for interactive proof: /blocks/version-history-demo, /blocks/discussion-demo and /blocks/ai-demo. The route is owned by the [block page](../../apps/www/src/app/%28blocks%29/blocks/%5Bname%5D/page.tsx), and the examples are registered in [registry-examples.ts](../../apps/www/src/registry/registry-examples.ts). Exercise actual saved-version selection, both sides of a move, nested edits, counts/filters, imported proposals, accept/reject, undo and reload. Add three-way controls to the existing comparison/review consumer. Record the exact serving checkout and distinguish real AI service output from a fallback. Follow Verify Plate for browser/native selection; a source scan cannot replace the interaction proof.

At S2-S4, substitute production compare in the frozen model harness, preserve its fixtures/cohorts/ceilings and rerun it. Add the native, cancellation, retained-memory and event-to-paint rows through Benchmark. The current model and interval probes remain planning evidence until the production substitution and native cases exist. S5 adds branch permutation and resolution cases to those same owners.

After the full caller/export/doc cut at S6:

~~~sh
pnpm brl
pnpm --filter www build:registry
pnpm check:plite
pnpm check:plite:browser-matrix
~~~

Include generated barrels and registry output. Run the affected Plate/AI/Comments/Discussion partitions, source-first package types and owned docs/install checks, plus the final production performance contract. Preserve existing historical fixtures and doctrine attestations; update the affected source teaching and append the required Plate Next doctrine version. Structured Autoreview remains prohibited on next. Commit, push, PR and release require their own authority; they are separate from local implementation completion.

Final implementation completion requires S0-S6, all 43 acceptance families, all 14 structural quality scenarios, exact canonical apply/inverse, native proposal/decision/reload/collaboration proof, complete consumer/doc/generated adoption and the final installed-path cost/browser checks. Record the applicable proof per family and the final source identity in this plan's existing artifacts. Planning probes and successful source checks cannot mark unexecuted production families passed.

## Production acceptance matrix

The completion slice is the deadline for the full family, including its consumer proof. Earlier slices establish supporting contracts without claiming the whole family passed. S6 binds every result to the final installed source and reruns invalidated proof.

Denominator: **43 required behavior families**. F01-F34 are the initial specification; F35-F43 incorporate the external-source review. The planning probe demonstrates bounded examples within some families; none of these rows is marked production-passed.

| ID | Required behavior | Owning proof | Complete by |
| --- | --- | --- | --- |
| F01 | Exact text/whitespace/line endings/properties/empty content survive apply and inverse | Pure corpus and canonical codec | S2 |
| F02 | Equivalent text-leaf partitions produce no fake visible edits; real properties persist | Schema/representation fixtures | S2 |
| F03 | Reorder preserves correspondence; numeric path shifts alone are not moves | Relative-order and ancestry fixtures | S2 |
| F04 | Moves retain internal text/property edits, including multiple components | Matcher and native range mapping | S3 |
| F05 | Reparent/named-root changes preserve ownership and references | Root/schema/anchor/authored tests | S3 |
| F06 | Flat heading sections move coherently even with renamed headings | Structure and version-history display | S4 |
| F07 | Split at every legal boundary, including mid-word, preserves spans | Span fixtures and native split | S2 |
| F08 | Merge preserves each source interval and mixed/inherited properties | Merge/property/native fixtures | S2 |
| F09 | Many-to-many restructuring accounts for all content once | Connected-region adversarial corpus | S2 |
| F10 | Copies get new identity and explanatory origin only | Copy/anchor/authorship tests | S2 |
| F11 | Duplicate content/ambiguous IDs produce truthful uncertainty | Boilerplate/reordering corpus | S2 |
| F12 | Missing/foreign/reused/conflicting IDs never establish trusted lineage | Codec/import identity tests | S2 |
| F13 | Unicode/graphemes/combining/RTL/CJK/no-space text remain exact | UTF-16 mapping and native display/input | S4 |
| F14 | Inline atoms/voids/links/empty blocks/code retain payload and boundaries | Feature/serializer corpus | S4 |
| F15 | Logical table row/column moves, cell edits and spans remain distinct | Table owner and comparison fixtures | S4 |
| F16 | Schema/type/property/root lifecycle cannot yield invalid materialization | Schema/root/property tests | S3 |
| F17 | Preparation is explicit; unsupported/lossy input is diagnostic | Import and prepared-target equality | S2 |
| F18 | Hash collisions/candidate caps cannot hide content changes | Forced-collision and work guards | S2 |
| F19 | Valid lineage outranks similarity; expired history selects inference honestly | Retention/frontier tests | S2 |
| F20 | Continuity survives apply/invert/compose/serialize/rebase/reload | Native anchors/change/transport laws | S3 |
| F21 | Same-length stale content, projection/frontier changes or schema drift reject import | Atomic native command | S3 |
| F22 | No partial writes on stale/blocked/invalid/cancelled work | Rollback/history/envelope assertions | S3 |
| F23 | Partial group choices respect full dependencies and other authors | Native authored decisions | S3 |
| F24 | Comments/replies retain durable IDs/ranges through decisions and reload | Comments/Discussion package/browser proof | S4 |
| F25 | AI/import uses current actor and distinguishes recorded/inferred evidence | Authored/source metadata tests | S3 |
| F26 | Duplicate import/delivery and interrupted streams are recoverable/idempotent | Native identity and AI tests | S3 |
| F27 | Supported format/copy projections are exact; unsupported semantics are diagnostic | JSON/Markdown/HTML/DOCX fixtures | S4 |
| F28 | Normal/large/stress/duplicate-heavy work is bounded with truthful coarse fallback | Embedded and production Benchmark | S5 |
| F29 | Cancellation, stale publication and snapshot release survive overlapping requests | Async/memory proof | S4 |
| F30 | Real comparison and review preserve focus/caret/IME/follow-up typing | Browser plus package proof | S4 |
| F31 | Detached clean merge, explicit resolution and native proposal preparation compose independent edits and move-plus-edit through one resolver | Branch permutation corpus; immutable source comparison retained | S5 |
| F32 | Divergent moves/edit-delete/split-merge/table conflicts are explicit | Native conflict/schema corpus | S5 |
| F33 | Resolutions bind all three revisions and reject newer conflicting state | Pure merge and stale importer | S5 |
| F34 | Peers consume actual operations instead of rerunning heuristic state decisions | Transport convergence tests | S5 |
| F35 | Three-way review retains both contributions, unilateral deletions, shared edits and all conflict alternatives before decisions | Branch-origin corpus; base/local/remote baseline imports; never infer authenticated authors | S5 |
| F36 | Movement, split/join, reparent/wrap and text/property edits compose on the same content | Many-to-many correspondence and effect/group type/runtime fixtures | S2 |
| F37 | Section/logical-line/word/grapheme views preserve exact effects, IDs and Unicode boundaries across locale/viewport changes | Projection masks and real diff UI | S4 |
| F38 | Group/effect counts, filters, navigation and filtered bulk actions preserve totals and explicit dependency closure | UI plus native preview/selection proof | S5 |
| F39 | Each of the 14 structural quality scenarios has an original fixture and expected readable output; normal cases cannot pass by wholesale replacement | Linked quality cases; effect/group/span goldens; production quality plus cost | S4 |
| F40 | Wrapper introduction/removal/type changes preserve unchanged inner content and independently moved descendants | Difftastic-inspired boundary corpus and native ranges | S4 |
| F41 | Every resolved or rendered branch alternative preserves schema, ancestry, order, unique ownership and grid constraints; incompatible composition remains a conflict | Canonical materialization and render/serialization roundtrip; cycles/orphans/duplicate ownership fixtures | S5 |
| F42 | Concurrent moves/edits and ancestor deletion with descendant relocation preserve declared native identity and convergence through reload | Recorded native-operation permutations; explicit review-conflict policy | S5 |
| F43 | Batching, harmless leaf repartition and scheduling cannot alter durable attribution; missing history cannot look like proven equality | Metamorphic source/lineage tests with versioned comparison-policy identities | S5 |

Coarse fallback must be lossless and visibly diagnostic. It does not satisfy a promised semantic capability such as logical table-column movement. Complete feature claims require all 43 families.

## Planning experiments and scale contract

The frozen [contract](artifacts/structural-document-diff/probe-contract.json) compares current computeDiff with a disposable span-correspondence witness. It covers normal 100, large 1,000, stress 10,000 and duplicate-heavy 10,000-block inputs. Sampling uses one warmup and seven alternating samples, raw cold observations, fixed ceilings, deterministic token/local-cell counters and exact content guards. No speedup claim is made.

The [final model receipt](artifacts/structural-document-diff/model-probe.json) passes 12 bounded structural examples and all four model cost ceilings:

| Cohort | Baseline maximum | Span witness maximum | Deterministic target work |
| --- | ---: | ---: | --- |
| 100 blocks | 1.10 ms | 1.65 ms | 1,402 token occurrences; 4,914 local cells |
| 1,000 blocks | 11.88 ms | 15.80 ms | 14,002 token occurrences; 49,014 local cells |
| 10,000 blocks | 98.17 ms | 183.62 ms | 140,002 token occurrences; 490,014 local cells |
| 10,000 duplicate blocks | 41.30 ms | 54.15 ms | 100,002 token occurrences; zero local cells; duplicate correspondence deliberately unresolved |

These are seven-sample maxima on the recorded local host, not p95/p99 estimates or native input latency. The witness does more explanatory work and is slower in this run. Its value is improved bounded correspondence in the tested cases, not demonstrated acceleration. Results near these ceilings or from other hosts need a new frozen comparison; raw measurements are retained.

The model script reconstructs both original JSON inputs from source-span recipes, verifies every primary token pair, and checks current DocumentChange application/inversion. On pure move/split/merge/restructure/format-partition cases it also requires all unchanged tokens to remain paired. Named roots and a nested table-row example are covered. Table-column/span matching, semantic section grouping and arbitrary inferred mid-word splits are not implemented by this witness.

The separate [interval receipt](artifacts/structural-document-diff/interval-probe.json) passes eight representation/freshness witnesses: supplied spans reconstruct a mid-word split and merge; copy is a secondary relation; exact baseline applies; same-length changed text, frontier, schema and projection reject without modifying the input state. These are explicit oracle spans and a pure state check, not a working inference algorithm or native importer.

The [initial raw model receipt](artifacts/structural-document-diff/model-probe-initial.json) is retained with a correction. It proved reconstruction/group cardinality but failed to assert complete whitespace pairing inside split/merge components. Its success label must not be treated as complete correspondence proof. The final script aligns whole bounded components and strengthens the guard. It also fingerprints measured source before and after the run.

The model result settles only this design question: span correspondence can describe these structural changes while ordinary JSON remains the materialized document. It does not establish universal matching quality, optimality, native identity continuity, collaborative behavior or full production cost.

### Production budget and rerun

Measure nodes, text units, candidate edges, local alignment cells, logical regions, output groups, retained bytes and simultaneous requests. Every candidate/search expansion has a deterministic work bound. Output-sized work is unavoidable; precision may degrade with an explicit diagnostic, payload correctness may not. Scheduling/cancellation must not change the completed result for identical endpoints and policy.

Account for source detachment, schema interpretation, matching, canonical construction, grouping, serialization and rendering separately and end to end. The witness times its declared comparison construction; canonical apply/inverse verification is outside that timing. It cannot certify the final engine's memory, native latency or scheduling.

Preserve the exact generated cohorts, fixtures, budgets and source identity checks when substituting production compare in the existing harness. Then add the F28-F30 cold/yield/cancel/release and native event-to-paint rows with the owning Benchmark budgets. Extend the existing benchmark target inventory at implementation; do not create another permanent benchmark registry for this plan.

Exact planning commands:

~~~sh
bun docs/plans/artifacts/structural-document-diff/model-probe.mjs
bun docs/plans/artifacts/structural-document-diff/interval-probe.mjs
~~~

The production entrypoint substitution and native tests are S2-S4 obligations; these commands still run witnesses until that change is made. Never run the unchanged witness and label it a production rerun.

The asynchronous public contract permits cooperative execution. Add scheduling privately in the operation owner only after measuring the complete path; no public Worker/backend constructor is required. Browser proof must demonstrate bounded event-loop occupancy and immediate stale-result suppression. Native editing cannot await a whole-document comparison.

### Interaction coverage

- First interaction: N/A for the model witness; real initial version comparison and review entry are required by F30.
- Settled interaction: N/A for the model witness; repeated comparisons, cancellation and follow-up typing are required by F29-F30.
- Route scope: no app route was driven during planning; use the existing version-history, AI and Suggestions routes during S3-S4.
- Reporter profile: no reported native/profile bug is being repaired. This design is not browser or device evidence.

## Adoption and failure boundaries

Public breaks: computeDiff's annotated result/callback vocabulary, DiffIntent/DiffProps as comparison authority, default tagging callbacks, excludeDiffFragment, copied DiffPlugin wiring and associated docs/install instructions. The predecessor should already remove Suggestion's mutation engine; S0 must reconcile the final source and remove obsolete migration rows rather than rebuild it.

Sweep Plite diff exports/tests, Plate facades, the existing version-history example/docs, AI/Suggestions, copy/static rendering and generated registry. Run pnpm brl for export/file changes and pnpm --filter www build:registry on next for registry changes. Use focused package/browser cases first; final architecture closure requires pnpm check:plite and the applicable browser matrix. Source-first typechecks and owning lint gates remain required. No package build is justified merely to typecheck source.

During execution, apply Best API doctrine repair to the smallest changed source rules and Vision owner: correspondence versus mutation, snapshot evidence versus provenance, and native proposal import. Append the required Plate Next doctrine version, preserving existing attestations, and regenerate mirrors. Planning changes no shared skill, Vision, product source or current public docs.

Three material failure scenarios:

1. Repeated boilerplate gets a plausible wrong match that transfers an anchor or hides an edit. Full content accounting, evidence labels, ambiguity handling and copy/new-identity policy must prevent that.
2. Delayed AI/import output overwrites a newer same-length document. Native baseline/frontier validation and atomic proposal publication must reject it.
3. A moved-and-edited interval becomes delete/insert after compose or reload, detaching replies or rebasing a peer into the wrong content. Native continuity and serialized-range proof is S0/S1 work, never a UI marker repair.

The [structural quality scenarios](../plite/research/2026-09-10-structural-diff-oss/quality-scenarios.md) specify 14 cases covering list and section reordering, cross-structure moves, formatting and combined table changes. They define required behavior and future proof.

The [OSS research](../plite/research/2026-09-10-structural-diff-oss/README.md) records 13 repositories inspected at pinned commits, three issue discussions and seven executable upstream semantic witnesses. It supports keeping native JSON/change ownership, strengthens span/effect and three-way review contracts, and rejects unsuitable drop-in engines. No reviewed implementation establishes complete split/merge matching quality for Plite. No source code was copied into product packages.

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Scope and sequencing | yes | Independent design, native changes permitted, completed authored plan required before S0 |
| First-principles/API decision | yes | Four models, ownership flow, proposed contracts and hard-cut adoption |
| Bounded model evidence | yes | 12 structural examples, eight supplied-span/freshness witnesses, four model cost cohorts; full runtime not accepted |
| Complete-runtime acceptance | future implementation prerequisite | Matcher, schema-facet implementation, native mapping and scheduling stay provisional until S0-S4 production evidence |
| Adoption and correctness specification | yes | S0-S6 and all 43 production families with concrete failure boundaries |
| Browser/native proof | N/A for planning artifact | No product/runtime mutation; native proof remains required by the production matrix |
| Autoreview and publication | N/A | Autoreview prohibited on next; no publication or external messages authorized |
| Artifact validation | yes | Initial model/interval script checks and receipt; linked OSS verification validates the amended plan, 43 unique rows and pinned source/probe identities |
| Final handoff and plan check | yes | Handoff below; existing check-complete.mjs command on this plan |

Bounded source inventory:

The lower diff owner has six files: two generated barrels, computeDiff and its behavior spec, and excludeDiffFragment and its behavior spec. Both executable leaves change during adoption. Migrate tests to current behavior without adding absence-of-legacy-name tests.

Replace the current exports computeDiff, ComputeDiffOptions, DiffDeletion, DiffInsertion, DiffIntent, DiffProps, DiffUpdate, DiffProperties, defaultGetInsertProps, defaultGetDeleteProps, defaultGetUpdateProps, excludeDiffFromFragment and excludeDiffFragment. Recheck the complete list after the prerequisite. Regenerate the barrels.

Runtime consumer families are version-history and Suggestion; AI enters through Suggestion. Plate has two proxy leaves. Docs/tests/generated output are adoption/proof surfaces, not additional runtime consumers. This is a bounded diff-owner inventory, not a whole-repository audit.

Final handoff prepared:

Keep ordinary accepted JSON and add immutable content correspondence. Native authored changes owns applied proposals and decisions; native change/anchor facilities retain mapping authority. Delete the annotated-node protocol and reuse or strengthen the native owner instead of building a second identity system.

The design includes moves with internal edits, split/merge/restructure, logical outlines/lists/grids, ambiguity, three-way conflicts and the named dependent boundaries. Planning evidence comprises 12 structural cases, eight supplied-span/freshness witnesses and four model cost cohorts. Full runtime remains provisional.

Finish native authored changes first. Then use Plite Plan on this document for S0 reconciliation against its actual final APIs and proof. No completed prerequisite or native/browser behavior is claimed.

Timeline:

- 2026-09-10: Current owners/prerequisite traced; four alternative models compared; model and interval witnesses run; follow-on design and initial 34-family production specification prepared.
- 2026-09-10: OSS validation inspects 13 pinned repositories and three issue discussions, specifies 14 structural quality cases, runs seven upstream semantic witnesses and revises the plan to 43 families. The merge-first result and exclusive group-kind model are replaced with branch-preserving comparison, pure resolution and composable effects.
- 2026-09-10: Final execution handoff consolidates the prerequisite, S0-S6, effect ownership, resolver outcomes, exact consumer routes and package/browser/benchmark closure. Assign every acceptance family to its full completion slice so UI proof never blocks an earlier matcher stage. Current owner fingerprints and command/route sources are rechecked; product implementation remains separate.

Open risks:

OSS validation checkpoint (research and specification complete, 2026-09-10): [research ledgers](../plite/research/2026-09-10-structural-diff-oss/README.md).

- [x] R1: Search web and GitHub, dedupe prior research, inspect selected real source/tests and pin identities; Plite Research.
- [x] R2: Reassess whole-model and public-noun alternatives against external evidence; Best API Review.
- [x] R3: Reconcile the required comparison jobs and supported OSS leads into explicit plan/proof requirements; user scope and Plite Plan.
- [x] R4: Close source/lead/packet denominators, verify artifacts and give one bounded verdict; Plite Research, Task and Autogoal.

The prerequisite may change the proposed signatures or already solve native continuity/structure facets. Production matcher quality, inferred mid-word matching, logical grid semantics, native mapping, asynchronous scheduling, memory, collaboration, formats and browser behavior remain execution gates. The target is a completed follow-on design with bounded model and source support. It is ready to resume at S0 after the prerequisite completes; production quality, native integration and superiority remain unproven.
