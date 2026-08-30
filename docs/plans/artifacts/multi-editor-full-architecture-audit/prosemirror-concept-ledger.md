# ProseMirror full architecture concept ledger

## Verdict

ProseMirror remains an exceptional behavior oracle and a disciplined
contenteditable implementation. It is not the architecture Plite should copy.
Its public model is mostly the wrong direction for Plite: class instances, flat
integer positions, one root, global registries, open spec bags, order-sensitive
plugins, mutable transaction builders, optional dispatch commands, and DOM
codecs embedded in schema types.

Two mechanisms are nevertheless materially stronger than the live Plite
baseline:

1. ProseMirror schemas describe an **ordered regular language** for each
   parent's children and compile it to a state machine. Live Plite compiles one
   unordered allowed-child set plus one global cardinality.
2. ProseMirror schemas own mark exclusion. Live Plite makes each command and
   toolbar caller pass `{ clear }`, so external values and non-command writes
   can still construct conflicting text properties.

The blunt result is therefore **two justified schema/API rewrites**, plus four
high-value proof packets. Plite should steal the semantics, not ProseMirror's
string grammar, mark classes, schema rank, or asymmetric raw-name exclusions.
Its JSON-native, multi-root, `DocumentChange`, typed-command, host-codec, and
phased-DOM architecture remains the stronger foundation.

This is the ProseMirror evidence lane, not the final cross-editor score. The
parent audit must reconcile these rows with the live Plite/Plate baseline and
the Wordgard/Lexical ledgers before ranking work.

## Mechanical completeness

The source manifest covers the meta repository and all 19 modules declared by
`../prosemirror/bin/pm.js:9-13`.

| Metric                          | Count |
| ------------------------------- | ----: |
| Tracked files                   |   330 |
| Implementation files            |    74 |
| Test/support files              |    47 |
| Parsed declarations and members | 2,180 |
| Named tests                     | 1,369 |
| Atomic concepts                 |    64 |
| Unexplained files               |     0 |

Every declaration inherits the concept IDs assigned to its file in
`prosemirror-source-manifest.json`. That manifest is the zero-unmapped closure
artifact; this document explains the concepts and architectural judgment.

## Comparison classification index

Each row classifies the live Plite/Plate stack against ProseMirror for that
exact concept. `Inferior` means the local semantics or proof are weaker; it
does not endorse ProseMirror's public representation.

| ID     | Classification     | Blunt reason                                                                                                       |
| ------ | ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| PM-C01 | equivalent         | Both graphs enforce useful package boundaries; ProseMirror's meta-checkout launcher is not product architecture.   |
| PM-C02 | superior           | Plite keeps immutable structural sharing without class identity in public JSON.                                    |
| PM-C03 | superior           | Plite canonicalizes adjacent text during representation construction while retaining plain objects.                |
| PM-C04 | superior           | Paths, roots, and anchors express structural and live identity without exposing one flat integer space.            |
| PM-C05 | equivalent         | `ContentSlice` carries the same open-edge semantics without PM node classes.                                       |
| PM-C06 | inferior           | Plite's allowed set and global cardinality cannot express ordered child languages.                                 |
| PM-C07 | different tradeoff | Both compile schemas; PM binds live classes while Plite publishes immutable structural facts.                      |
| PM-C08 | equivalent         | PM attribute validators and Plite property codecs both derive requiredness/default validation at compilation.      |
| PM-C09 | equivalent         | Both provide schema-aware checked/fitted construction; their value and failure representations differ.             |
| PM-C10 | inferior           | Plite's JSON properties are cleaner, but callers—not schema—still own mutually exclusive mark conflicts.           |
| PM-C11 | superior           | Canonical `DocumentChange` and structural snapshots avoid deriving impact from a second document diff.             |
| PM-C12 | superior           | Explicit facet dependencies and revision-bound caches beat PM's untyped schema cache bag.                          |
| PM-C13 | superior           | Versioned structural codecs beat live-schema classes and global polymorphic registries.                            |
| PM-C14 | different tradeoff | PM has broader declarative DOM rules; Plite has the better DOM-free core and host-codec owner.                     |
| PM-C15 | equivalent         | Both parse into context-bearing slices and use compiled fitting to obtain valid document content.                  |
| PM-C16 | different tradeoff | PM has mature DOM-output safety checks; Plite keeps the stronger host boundary but needs equivalent proof.         |
| PM-C17 | superior           | Structural `DocumentChange` values beat class-based steps and a global JSON type registry.                         |
| PM-C18 | different tradeoff | PM's compact integer maps are proven; Plite's structural mapping is safer for roots but must match its scale.      |
| PM-C19 | superior           | Immutable `TransactionSpec` and canonical changes beat a mutable transform/operation accumulator.                  |
| PM-C20 | equivalent         | Both model invertible atomic structural/property edits; Plite avoids the subclass taxonomy.                        |
| PM-C21 | different tradeoff | PM's fitter is older and broader; Plite's compiled JSON-native fitter has the stronger ownership target.           |
| PM-C22 | equivalent         | Both centralize split/join/lift/wrap behavior above shared structural primitives.                                  |
| PM-C23 | superior           | Typed tags/effects and immutable specs beat string metadata on a mutable transaction.                              |
| PM-C24 | different tradeoff | PM has mature multi-range subclasses; Plite has roots, anchors, affinity, and structural descriptors.              |
| PM-C25 | superior           | Explicit facet dependencies and atomic configuration revisions beat ordered partial-state reduction.               |
| PM-C26 | superior           | Typed contribution namespaces and isolated lifecycle failures beat one unlimited plugin bag.                       |
| PM-C27 | superior           | Structural descriptor identity and configuration-owned precedence beat array order plus auto-numbered keys.        |
| PM-C28 | superior           | Typed pure command handlers returning specs beat optional-dispatch commands.                                       |
| PM-C29 | different tradeoff | PM has a deep key-normalization corpus; Plate has stronger descriptor-owned commands and configuration ordering.   |
| PM-C30 | different tradeoff | PM input rules have mature timing cases; Plite has the cleaner typed-spec and phase-scheduler ownership.           |
| PM-C31 | different tradeoff | PM history has exceptional rebase/compression proof; Plite has canonical changes and versioned persistence.        |
| PM-C32 | superior           | Yjs CRDT collaboration is the correct decentralized owner; PM collab is a central-version rebase protocol.         |
| PM-C33 | different tradeoff | PM's imperative view is cohesive; Plite deliberately splits model, DOM, React, and scheduler ownership.            |
| PM-C34 | superior           | Typed extension namespaces beat open view-prop precedence and arbitrary event-hook bags.                           |
| PM-C35 | different tradeoff | PM's mutable view tree has excellent locality; Plite's React/runtime-ID projection has safer host composition.     |
| PM-C36 | different tradeoff | PM exposes low-level node views; Plate offers React product authoring while Plite keeps lifecycle substrate.       |
| PM-C37 | different tradeoff | PM's decoration tree is highly proven; Plite keeps distinct public view concepts over a shared mapped substrate.   |
| PM-C38 | different tradeoff | PM has mature mutation batching; Plite has the better single-phase scheduler target and loop diagnostics.          |
| PM-C39 | different tradeoff | PM's DOM diff path covers more browser history; Plite's explicit model-input/repair ownership is clearer.          |
| PM-C40 | different tradeoff | PM owns more browser scars; Plite avoids its distributed timers through explicit composition and scheduler state.  |
| PM-C41 | different tradeoff | PM selection import/export is battle-tested; Plite's structural coordinates and root ownership are stronger.       |
| PM-C42 | equivalent         | Both preserve slice context and fit clipboard data; Plite keeps codecs outside core.                               |
| PM-C43 | different tradeoff | PM has broader geometry/bidi proof; Plite has the cleaner host boundary and needs the same browser rows.           |
| PM-C44 | different tradeoff | PM covers more platform quirks but scatters UA branches and timers that Plite should not copy.                     |
| PM-C45 | different tradeoff | Both support non-text selections; Plite separates substrate capability from Plate activation/rendering.            |
| PM-C46 | superior           | Drop-cursor geometry and presentation stay in Plate instead of entering the editor substrate.                      |
| PM-C47 | superior           | Product rich-text schemas and HTML policy stay in Plate rather than defining Plite core.                           |
| PM-C48 | different tradeoff | PM has one compact list shape; Plate owns a broader list product surface over Plite primitives.                    |
| PM-C49 | superior           | Accessible React UI belongs in Plate/registry, not an imperative editor-core menu package.                         |
| PM-C50 | superior           | Explicit typed presets beat probing conventional schema names and assembling behavior by convention.               |
| PM-C51 | different tradeoff | PM Markdown parsing is mature; Plate host codecs have the better schema/DOM-free ownership direction.              |
| PM-C52 | different tradeoff | PM Markdown serialization is mature; Plate owns product mappings without binding codec classes into core.          |
| PM-C53 | different tradeoff | PM ships a review-specific change set; Plite correctly keeps `DocumentChange` canonical and defers product review. |
| PM-C54 | different tradeoff | PM ships search state and decorations; Plate should own search only when a product consumer justifies it.          |
| PM-C55 | different tradeoff | PM's tagged fixtures are concise; Plite should gain the ergonomics without mutating runtime nodes.                 |
| PM-C56 | inferior           | ProseMirror's 1,369-test graph still contains portable behavior and browser pressure absent from local proof.      |
| PM-C57 | superior           | Plate/registry owns presentation; raw Plite does not require package-global visual CSS.                            |
| PM-C58 | equivalent         | Both ecosystems have editor examples and benchmark shells; only the reusable scenarios matter.                     |
| PM-C59 | superior           | Plite's JSON-native multi-root model is materially broader than PM's one-root class graph.                         |
| PM-C60 | superior           | Versioned validated persistence beats live plugin/schema identity and unversioned polymorphic JSON.                |
| PM-C61 | superior           | Host-owned, atomically compiled codecs beat DOM/Markdown mappings bound directly to schema classes.                |
| PM-C62 | superior           | Transactional configuration publication beats ordered immediate mutation and append-transaction correction.        |
| PM-C63 | equivalent         | Both preserve acyclic package ownership and explicit public entry points.                                          |
| PM-C64 | different tradeoff | PM proves decades of locality tricks; Plite has stronger indexes/change facts but still needs comparative numbers. |

## Document, schema, fitting, and codecs

| ID     | Mechanism and exact evidence                                                                                                                                                                                                                                                                                                                    | Judgment and target consequence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PM-C02 | `Node` is an immutable class with `NodeType`, attrs, `Fragment`, and marks; `nodeSize` defines one flat token coordinate system (`model/src/node.ts:20-54`). Copies preserve unchanged subtrees (`model/src/node.ts:117-166`).                                                                                                                  | **Reject public shape; keep behavior.** Persistent snapshots and structural sharing are excellent. Class identity and methods on document values are worse than Plite's plain JSON nodes. No Plite API should be replaced.                                                                                                                                                                                                                                                                                                                                                   |
| PM-C03 | `Fragment` owns child storage, append/cut/equality/JSON, and merges adjacent compatible text nodes during construction (`model/src/fragment.ts:10-29`, `73-137`, `214-248`).                                                                                                                                                                    | **Steal invariant, not representation.** Canonical adjacent text and structural sharing belong in fitted construction. Delete any later normalization pass that exists only to merge representationally equivalent leaves once construction proves the invariant.                                                                                                                                                                                                                                                                                                            |
| PM-C04 | Every location is a flat integer. `ResolvedPos` materializes an ancestor path and contextual offsets (`model/src/resolvedpos.ts:12-27`, `45-123`); each document caches a small ring of resolutions (`model/src/resolvedpos.ts:218-247`).                                                                                                       | **Reject public coordinates.** Plite's paths for snapshot queries and anchors for live identity are more intelligible and safer for multi-root documents. Keep the locality lesson: compiled snapshot indexes should make repeated path/point queries cheap.                                                                                                                                                                                                                                                                                                                 |
| PM-C05 | `Slice` carries `openStart`/`openEnd`; strict replacement checks open-depth and parent compatibility (`model/src/replace.ts:24-120`, `122-171`). `Node.slice` and `Node.replace` expose it directly (`model/src/node.ts:157-176`).                                                                                                              | **Keep Plite's `ContentSlice`; steal laws.** This is the right semantic pressure for partial copy/paste and structural replacement. Do not import integer positions or PM classes.                                                                                                                                                                                                                                                                                                                                                                                           |
| PM-C06 | String content expressions compile through a parser, NFA, and DFA into `ContentMatch`; compiled matches support per-prefix acceptance, default fillers, and wrapper search (`model/src/content.ts:10-166`, `190-278`, `290-421`). List items can require `"paragraph (ordered_list \| bullet_list)*"` (`schema-list/src/schema-list.ts:48-59`). | **Inferior in live Plite; steal semantics, reject strings.** Plite currently reduces content to one unordered allowed-child set and global `min`/`max` (`packages/plite/src/interfaces/schema.ts:174-199`; `packages/plite/src/core/schema-compiler.ts:1526-1781`). It cannot express “body first, nested lists afterward,” so validation and fitting accept wrong order and repetition. Add a typed regular content pattern compiled to an immutable automaton.                                                                                                             |
| PM-C07 | `Schema` compiles ordered node/mark maps into live `NodeType` and `MarkType` instances (`model/src/schema.ts:60-218`, `281-345`, `572-638`).                                                                                                                                                                                                    | **Different tradeoff, target remains Plite.** Compilation is correct; class allocation and identity coupling are not. Keep immutable compiled schema revisions and structural descriptors.                                                                                                                                                                                                                                                                                                                                                                                   |
| PM-C08 | Attribute declarations encode defaults and validators; required attrs are inferred from absent defaults and values are checked during explicit validation (`model/src/schema.ts:15-57`, `172-206`, `684-716`).                                                                                                                                  | **Steal validation discipline.** External values and persisted state must validate through compiled property codecs. Avoid permissive `Attrs = {[key: string]: any}` as a public authoring surface.                                                                                                                                                                                                                                                                                                                                                                          |
| PM-C09 | Types expose `create`, `createChecked`, `createAndFill`, `validContent`, and `checkContent`; filling relies on compiled matches (`model/src/schema.ts:139-218`).                                                                                                                                                                                | **Steal construction semantics.** Ideal Plite construction returns a fitted canonical value or explicit failure, not malformed JSON followed by repair loops. Current fitted-slice/document APIs should be judged against these laws.                                                                                                                                                                                                                                                                                                                                        |
| PM-C10 | Marks are ordered sets with exclusion, replacement, removal, inclusivity, and equality rules (`model/src/mark.ts:10-109`; `model/src/schema.ts:281-345`, `493-524`, `622-625`).                                                                                                                                                                 | **Inferior in live Plite on conflict ownership; superior representation.** Plite's descriptor-backed JSON text properties are cleaner than mark objects, but conflicts remain caller-supplied `{ clear }` (`packages/plite/src/interfaces/editor.ts:539-546`; `packages/plite/src/editor/toggle-mark.ts:14-55`; `packages/basic-nodes/src/lib/BaseSubscriptPlugin.ts:20-28`). Compile symmetric descriptor-backed exclusion groups into schema and make every write path preserve the invariant. Reject ProseMirror's raw strings, asymmetric exclusions, and rank ordering. |
| PM-C11 | Equality first exploits object identity, then structural equality; fragments expose minimal diff starts/ends (`model/src/node.ts:117-134`; `model/src/diff.ts:3-50`).                                                                                                                                                                           | **Keep/verify.** Plite should retain structural-sharing fast paths and canonical `DocumentChange` ranges. Do not add a second diff truth if changes already know their impact.                                                                                                                                                                                                                                                                                                                                                                                               |
| PM-C12 | Schema owns an untyped `cached` object used by DOM codecs and downstream packages (`model/src/schema.ts:640`; `model/src/from_dom.ts:308-314`; `changeset/src/diff.ts:26-39`).                                                                                                                                                                  | **Reject public cache bag.** Use declared facet/cache dependencies tied to immutable schema/configuration revisions. Delete string-key cache coordination if any survives in Plite/Plate.                                                                                                                                                                                                                                                                                                                                                                                    |
| PM-C13 | Nodes, marks, fragments, slices, steps, selections, and state expose JSON, but polymorphic values depend on live schema classes or global string registries (`model/src/node.ts:314-355`; `transform/src/step.ts:42-65`; `state/src/selection.ts:153-170`).                                                                                     | **Reject registry-dependent persistence.** Plite's versioned codecs and structural descriptors are the correct target. Persistence must validate without importing a class solely to rehydrate identity.                                                                                                                                                                                                                                                                                                                                                                     |
| PM-C14 | DOM parser rules support tags, styles, priority, consumption, context, attrs, content overrides, mark clearing, and whitespace policy (`model/src/from_dom.ts:56-174`). Rules are gathered from schema specs and sorted by numeric priority (`model/src/from_dom.ts:278-313`).                                                                  | **Steal declarative coverage, rearchitect ownership.** Host codecs should compile atomically with schema contributions. Do not put DOM types in Plite core or accept arbitrary local priorities when extension configuration already orders contributors.                                                                                                                                                                                                                                                                                                                    |
| PM-C15 | DOM parsing tracks open context, finds wrappers, inserts only schema-valid content, resolves requested DOM positions, and emits open slices (`model/src/from_dom.ts:182-236`, `340-807`).                                                                                                                                                       | **Steal fitting behavior.** Plite DOM/clipboard parsing should produce a `ContentSlice` and let the schema fitter own validity. Delete parser-specific structural repair that duplicates the fitter.                                                                                                                                                                                                                                                                                                                                                                         |
| PM-C16 | `DOMOutputSpec` is a compact declarative tree with one content hole; serializer instances are derived and cached from schema. Rendering rejects an attribute-originated array reused as DOM structure to block injection (`model/src/to_dom.ts:7-40`, `112-158`, `164-229`).                                                                    | **Steal safety and codec laws, not schema coupling.** Keep host-owned codecs and explicit DOM-free core boundaries. Add an injection regression row if Plite's host renderer lacks one.                                                                                                                                                                                                                                                                                                                                                                                      |
| PM-C59 | The model assumes one root `doc`, one flat coordinate space, and types bound to one live `Schema` instance (`model/src/node.ts:49-54`; `model/src/resolvedpos.ts:42-47`; `model/src/schema.ts:572-638`).                                                                                                                                        | **Reject.** Plite's multi-root JSON model is materially stronger. No compatibility layer should emulate PM's one-root position space.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| PM-C60 | State deserialization requires a caller-provided schema and live plugin instances mapped to JSON property names (`state/src/state.ts:212-265`); step and selection decoding use global registries. There is no format version or migration contract.                                                                                            | **Reject.** Keep versioned state/effect/history codecs and validated migration. Delete any persistence path that accepts live plugin identity as the decoding schema.                                                                                                                                                                                                                                                                                                                                                                                                        |
| PM-C61 | HTML and Markdown rules are attached to or keyed by schema type names; DOM serializers are cached on live schema and Markdown codecs directly instantiate schema nodes (`model/src/schema.ts:372-570`; `markdown/src/from_markdown.ts:155-236`; `markdown/src/to_markdown.ts:32-70`).                                                           | **Rearchitect at host boundary.** Compile schema classification and codec bindings atomically, but keep DOM/Markdown machinery out of Plite core.                                                                                                                                                                                                                                                                                                                                                                                                                            |

## Change, transaction, selection, state, and extension runtime

| ID     | Mechanism and exact evidence                                                                                                                                                                                                                                                              | Judgment and target consequence                                                                                                                                                                                                                                                |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| PM-C17 | `Step` is an abstract class requiring apply/invert/map/merge/JSON and a globally registered string ID (`transform/src/step.ts:5-66`).                                                                                                                                                     | **Reject as public execution truth.** Plite's canonical `DocumentChange` algebra is structurally typed, serializable, and does not need operation subclasses. Keep PM's laws for inversion/mapping/merge.                                                                      |
| PM-C18 | `StepMap` stores triples `[start, oldSize, newSize]`; `MapResult` records deletion sides; `Mapping` carries inverse mirrors and recovery tokens (`transform/src/map.ts:19-164`, `166-283`).                                                                                               | **Steal algorithmic pressure, benchmark before stealing storage.** It is compact and battle-tested, especially for history rebase. Plite should not expose integers, but its internal anchor/index mapping must match these affinity/deletion laws and scale at least as well. |
| PM-C19 | `Transform` is a mutable step accumulator holding every pre-step document and map; it derives one changed range from accumulated mappings (`transform/src/transform.ts:23-93`).                                                                                                           | **Reject public builder shape.** Immutable `TransactionSpec` plus canonical changes is stronger. Do not retain duplicate operation/impact builders merely because PM does.                                                                                                     |
| PM-C20 | Replace, replace-around, mark, node-mark, and attribute changes are concrete `Step` subclasses with apply/invert/map/merge/JSON (`transform/src/replace_step.ts:5-178`; `transform/src/mark_step.ts:1-244`; `transform/src/attr_step.ts:8-154`).                                          | **Steal laws only.** Generated Plite laws should cover the equivalent structural/property changes. Do not recreate the subclass taxonomy.                                                                                                                                      |
| PM-C21 | `replaceStep` invokes a dedicated `Fitter` that walks slice frontiers, opens/drops nodes, inserts wrappers/fillers, respects isolating/defining boundaries, and closes both frontiers (`transform/src/replace.ts:1-241`, `282-594`).                                                      | **High-value algorithm reference.** Compare current Plite fitting exhaustively. If a behavioral gap exists, repair the compiled fitter itself; never add command-level paste/insert special cases.                                                                             |
| PM-C22 | Lift, wrap, split, join, set type, insertion point, and drop point share schema-aware structural helpers (`transform/src/structure.ts:1-440`; `transform/src/mark.ts:8-166`).                                                                                                             | **Steal behavior inventory.** The shared abstraction is good. Plite commands should emit canonical changes through shared structural primitives, not duplicate local path surgery.                                                                                             |
| PM-C23 | `Transaction` subclasses `Transform` and additionally mutates selection, stored marks, metadata, timestamp, composition, and scroll intent (`state/src/transaction.ts:18-213`). Metadata accepts strings, plugins, or plugin keys with `any` values (`state/src/transaction.ts:184-199`). | **Reject.** Typed effects/tags and immutable specs are cleaner. Scroll/history/collab policy must not hide in string metadata.                                                                                                                                                 |
| PM-C24 | Selections are extensible classes with multiple ranges, mapping, replacement, JSON, and map-only bookmarks (`state/src/selection.ts:5-180`). Text, node, all, and gap selections subclass it.                                                                                             | **Mixed.** Multi-range/extensible semantics and bookmarks are valuable. Class identity/global registration/numeric positions are not. Keep Plite's structural selection descriptors, anchors, affinity, goal column, and roots.                                                |
| PM-C25 | `EditorState` is immutable, but configured fields are installed dynamically and reduced in declaration order; each field sees a partially constructed next state (`state/src/state.ts:45-82`, `93-177`; `state/src/plugin.ts:91-115`).                                                    | **Reject order-sensitive partial-state API.** Plite facets/effects/configuration revisions should use explicit dependencies and atomic publication.                                                                                                                            |
| PM-C26 | One plugin spec may own state, props, DOM view lifecycle, transaction filtering, and append transactions, plus arbitrary extra properties (`state/src/plugin.ts:5-55`).                                                                                                                   | **Reject the mega-bag.** Separate typed extension contributions by owner while preserving one coherent descriptor. Optional provider failures need isolation, not one plugin object with unlimited authority.                                                                  |
| PM-C27 | Plugin identity uses process-global counters and strings; prop precedence is direct props, direct plugins, then state plugins in array order (`state/src/plugin.ts:117-141`; `view/src/index.ts:288-314`).                                                                                | **Reject implicit precedence.** Extension configuration must determine order, conflicts, and replacement transactionally. Descriptor identity must be stable and structural.                                                                                                   |
| PM-C28 | `Command = (state, dispatch?, view?) => boolean`; absence of dispatch means applicability query. Commands can capture downstream dispatch to wrap behavior (`state/src/transaction.ts:18`; `commands/src/commands.ts:1-760`).                                                             | **Reject API; steal behavior.** Pure typed `state -> false                                                                                                                                                                                                                     | TransactionSpec` commands are clearer. Keep a rare explicit around-handler lane instead of exposing continuation/dispatch tricks to every command. |
| PM-C29 | Key names normalize modifiers/platform aliases; keymap plugins run handlers in extension order and first success wins (`keymap/src/keymap.ts:1-104`).                                                                                                                                     | **Steal normalization cases and conflict tests.** Keep descriptor-owned typed commands and configuration-owned ordering. Do not make raw key strings the command identity.                                                                                                     |
| PM-C30 | Input rules scan bounded preceding text, return transactions, store an invertible undo record in plugin state, and schedule post-composition matching (`inputrules/src/inputrules.ts:1-167`; `inputrules/src/rulebuilders.ts:1-111`).                                                     | **Steal laws; keep host ownership.** Rules should build typed specs and composition timing should use the DOM phase scheduler. Delete ad hoc plugin metadata/timers if Plite already has scheduler phases.                                                                     |
| PM-C31 | History uses persistent rope branches of map/step/bookmark items, groups by time and adjacency, records map-only remote changes, rebases selections, and compresses accumulated empty maps (`history/src/history.ts:5-206`, `220-360`).                                                   | **High-value proof oracle.** Plite history should match grouping/rebase/compression behavior while persisting versioned canonical changes, not live steps. Add stress/benchmark rows before changing architecture.                                                             |
| PM-C32 | Collaboration assumes a central authority/version, stores unconfirmed steps, then undoes locals, applies remote steps, maps locals, and reapplies them (`collab/src/collab.ts:14-31`, `34-183`).                                                                                          | **Reject as Plite collaboration owner.** Yjs remains the transport/CRDT. Keep PM rebase cases as adversarial transform laws and history integration pressure.                                                                                                                  |
| PM-C62 | Plugin arrays determine initialization, state reduction, prop precedence, filtering, append loops, and reconfiguration; appenders may repeatedly add transactions until quiescence (`state/src/state.ts:93-177`, `193-209`).                                                              | **Reject.** Configuration revisions should compile and publish atomically. Corrections belong in fitted construction or bounded typed post-processing, not unconstrained normalization-style append loops.                                                                     |

## DOM, view, browser, and performance runtime

| ID     | Mechanism and exact evidence                                                                                                                                                                                                                                                                                                                           | Judgment and target consequence                                                                                                                                                                                   |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PM-C33 | `EditorView` imperatively owns one contenteditable DOM tree, observer, input state, state/prop updates, plugin views, selection, and scrolling (`view/src/index.ts:27-93`, `123-273`).                                                                                                                                                                 | **Keep behavior, reject ownership shape for React Plite.** Plite's substrate/React/DOM packages can split ownership cleanly while preserving one phase scheduler.                                                 |
| PM-C34 | `EditorProps` is a large callback bag for DOM events, paste, node views, decorations, editability, attrs, and scrolling; `someProp` short-circuits by implicit precedence (`view/src/index.ts:288-314`, `585-824`).                                                                                                                                    | **Reject.** Typed extension namespaces and contribution slots are more discoverable and inferable. Product/plugin hooks belong in Plate; raw DOM hooks stay in Plite host packages.                               |
| PM-C35 | A mutable doubly linked `ViewDesc` tree is attached to DOM nodes through `pmViewDesc`; `ViewTreeUpdater` reuses compatible descendants and rewrites only dirty regions (`view/src/viewdesc.ts:12-182`, `1167-1330`).                                                                                                                                   | **Steal locality, not public mutation model.** React/runtime IDs may be the better renderer identity, but benchmarks must prove similarly bounded updates. No second renderer without a consumer.                 |
| PM-C36 | NodeView/MarkView expose `dom`, `contentDOM`, update, selection, mutation filtering, event filtering, position callbacks, and destroy (`view/src/viewdesc.ts:31-134`).                                                                                                                                                                                 | **Move product authoring to Plate; reject raw clone.** Useful lifecycle laws should split into Plite projection/widget/surface invariants and Plate renderer/plugin contracts.                                    |
| PM-C37 | Widgets, inline decorations, and node decorations map through changes in a persistent tree aligned with document structure; only touched children rebuild and removal can invoke cleanup (`view/src/decoration.ts:108-284`, `286-492`, `575-735`).                                                                                                     | **Steal performance/lifecycle laws.** Plite should keep Decoration, Annotation, and Widget distinct publicly while sharing a private mapped-store kernel if the live source does so.                              |
| PM-C38 | `DOMObserver` batches `MutationObserver` records and selection changes, tracks a bounded changed range, and uses browser-specific delayed flushes (`view/src/domobserver.ts:39-229`).                                                                                                                                                                  | **Steal browser cases, not scattered scheduling.** One bounded Plite phase scheduler should own reads/writes/selection repair and expose loop diagnostics.                                                        |
| PM-C39 | DOM changes parse only the changed context, diff against the model, recognize native enter/backspace/type-over patterns, and dispatch a transaction (`view/src/domchange.ts:81-250`, `353-387`).                                                                                                                                                       | **Steal reconciliation laws.** Plite should preserve explicit model-input strategy and repair ownership, with real browser proof for ambiguous native edits.                                                      |
| PM-C40 | Input routing covers keyboard, pointer, composition, paste, drag/drop, focus, and selection origin. It contains many timers and browser-specific branches (`view/src/input.ts:100-160`, `439-525`, `583-817`).                                                                                                                                         | **Steal the gauntlet; reject distributed timer architecture.** Feed these cases into Plite's scheduler and composition state machine.                                                                             |
| PM-C41 | Dedicated logic maps DOM selections to model selections and back, handles hidden node selections, ownership, composition, and browser quirks (`view/src/selection.ts:1-246`).                                                                                                                                                                          | **Steal browser proof.** Keep Plite anchors/paths and runtime IDs; do not adopt numeric position APIs.                                                                                                            |
| PM-C42 | Clipboard export records slice openness and parent context in `data-pm-slice`; import chooses text/HTML codecs, restores context, normalizes siblings, closes slices, fits wrappers, and handles Trusted Types (`view/src/clipboard.ts:5-110`, `112-260`).                                                                                             | **High-value behavior oracle.** Keep `ContentSlice` and host codecs. Add missing context-wrapper, comments, table wrapper, text fallback, and injection rows; avoid a second clipboard-specific fitter.           |
| PM-C43 | Coordinates, scroll restoration, caret geometry, bidi, line edges, atom navigation, and captured keys are dedicated low-level modules (`view/src/domcoords.ts:1-607`; `view/src/capturekeys.ts:1-274`).                                                                                                                                                | **Steal browser-only laws.** Geometry cannot be adequately proven in jsdom. Keep it out of Plite core and test across Chromium, Firefox, WebKit, and mobile viewport.                                             |
| PM-C44 | Browser flags and targeted workarounds cover Chrome, Safari, Firefox, iOS, Android, WebKit versions, composition races, clipboard spaces, and selection bugs (`view/src/browser.ts:1-65`; `view/src/input.ts:106-136`, `439-525`).                                                                                                                     | **Steal cases, never wholesale UA folklore.** Each Plite workaround needs a focused failing browser row and bounded owner.                                                                                        |
| PM-C45 | GapCursor is a custom selection subclass with mapping/JSON, schema opt-outs, keyboard/mouse handlers, and a decoration (`gapcursor/src/gapcursor.ts:7-136`; `gapcursor/src/index.ts:15-102`).                                                                                                                                                          | **Different ownership.** Preserve extensible selection capability in Plite, but Plate should own product activation and rendering policy. Reject class/global registry shape.                                     |
| PM-C46 | Drop cursor is a `PluginView` with DOM listeners, geometry, overlay lifecycle, and a module-augmented node-spec opt-out (`dropcursor/src/dropcursor.ts:5-174`).                                                                                                                                                                                        | **Move to Plate.** It demonstrates cleanup/geometry contracts but is product UI. Do not add cursor-overlay policy to Plite core.                                                                                  |
| PM-C57 | View extensions ship package-owned global CSS class contracts (`view/style/prosemirror.css`; `gapcursor/style/gapcursor.css`; `menu/style/menu.css`; `search/style/search.css`).                                                                                                                                                                       | **Reject for raw Plite substrate.** Plate/registry components own presentation. Plite host packages may expose semantic state/attributes, not visual policy.                                                      |
| PM-C64 | Performance relies on immutable identity, tiny resolved-position caches, compact maps, schema caches, document-aligned decoration trees, weak text caches, bounded search windows, and a 5,000-edit diff cutoff (`model/src/resolvedpos.ts:218-247`; `view/src/decoration.ts:575-735`; `changeset/src/diff.ts:67-139`; `search/src/query.ts:266-280`). | **Steal measurable locality.** Benchmark Plite equivalents on large documents before changing representation. A benchmark failure should repair the owning index/store, not justify PM's public integers/classes. |

## Product packages, codecs, search, test infrastructure, and ownership

| ID     | Mechanism and exact evidence                                                                                                                                                                                                                                                                                                         | Judgment and target consequence                                                                                                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PM-C01 | The meta launcher names 12 core and 7 ancillary modules and operates build/test/release across them (`../prosemirror/bin/pm.js:9-13`, `28-80`, `136-154`).                                                                                                                                                                           | **Equivalent modular instinct, different package graph.** Preserve Plite/Plate dependency direction; do not reproduce a meta checkout manager.                                                                                            |
| PM-C47 | `schema-basic` defines paragraphs, blockquotes, code, headings, rules, images, breaks, and marks together with HTML parse/render policy (`schema-basic/src/schema-basic.ts:7-327`).                                                                                                                                                  | **Move/reject as core.** Product schemas and rich-text node policy belong to Plate. Plite owns schema substrate only.                                                                                                                     |
| PM-C48 | `schema-list` couples list node specs, expected structural shape, and wrap/split/lift/sink commands (`schema-list/src/schema-list.ts:6-60`, `62-266`).                                                                                                                                                                               | **Plate-owned behavior.** Use its exhaustive list tests as pressure, but keep list structure and commands in `packages/list`.                                                                                                             |
| PM-C49 | `menu` provides imperative DOM menu items, dropdowns, roving focus, grouped rendering, icons, command state, and a floating toolbar plugin (`menu/src/menu.ts:13-626`; `menu/src/menubar.ts:17-208`).                                                                                                                                | **Reject as editor substrate.** Plate UI/registry owns accessible React components and floating policy. Only reusable focus/geometry laws may influence host tests.                                                                       |
| PM-C50 | `example-setup` discovers conventional type names in a schema and assembles history, keymaps, input rules, gap cursor, drop cursor, menus, prompts, and CSS (`example-setup/src/index.ts:19-89`; sibling source files).                                                                                                              | **Reject convention bundle as architecture.** Plate presets/configuration can compose explicit descriptors. Name probing and imperative prompts are product shortcuts, not substrate.                                                     |
| PM-C51 | Markdown parser maps markdown-it tokens to schema type names and builds nodes through a stack plus `createAndFill` (`markdown/src/from_markdown.ts:13-152`, `155-274`).                                                                                                                                                              | **Steal declarative codec shape at host boundary.** Parser output must be a fitted slice/document. Avoid type-name strings without descriptor ownership/versioning.                                                                       |
| PM-C52 | Markdown serializer maps node/mark names to stateful output functions, handling mark mixing, escaping, tight lists, fences, and autolinks (`markdown/src/to_markdown.ts:3-170`, `172-580`).                                                                                                                                          | **Steal behavior corpus; host-owned.** Plate/codec packages should expose schema-linked declarative bindings with deterministic escaping.                                                                                                 |
| PM-C53 | `ChangeSet` composes mapped replacement spans with metadata, re-diffs touched ranges, bounds Myers work, computes changed ranges, and simplifies human-facing changes to word boundaries (`changeset/src/change.ts:2-196`; `changeset/src/changeset.ts:13-211`; `changeset/src/diff.ts:12-147`; `changeset/src/simplify.ts:50-144`). | **Evidence-backed defer.** This is useful for track-changes/review UI, not canonical transaction truth. Build it in Plate only when a consumer exists, lowering from `DocumentChange`; never introduce a competing change model in Plite. |
| PM-C54 | Search caches flattened text per immutable node, scans textblocks, supports regex/case/whole-word/replacement groups, maps range state, highlights with decorations, and exposes commands (`search/src/query.ts:4-323`; `search/src/search.ts:7-205`).                                                                               | **Move to Plate; retain performance pattern.** Search is a product feature. A future Plate search package can use Plite snapshots/anchors and mapped decorations without entering Plite core.                                             |
| PM-C55 | `test-builder` generates node/mark builders from schema and embeds named cursor tags in strings by mutating a test-only property on nodes (`test-builder/src/build.ts:3-125`).                                                                                                                                                       | **Steal ergonomic fixture idea, not mutation hack.** Plite's test DSL should make paths/ranges obvious and typed; never ship tag metadata in runtime nodes.                                                                               |
| PM-C56 | The graph contains 47 test/support files and 1,369 named tests, including real browser suites for composition, DOM changes, drawing, selection, clipboard, and geometry. The launcher gathers package and browser tests (`../prosemirror/bin/pm.js:143-154`).                                                                        | **Steal aggressively.** This is ProseMirror's largest contribution to Plite: portable laws and browser scenarios, translated into Plite concepts and ownership.                                                                           |
| PM-C58 | The meta repository contains a demo and synthetic editing/benchmark scripts (`../prosemirror/demo/demo.ts`; `../prosemirror/demo/bench/example.js`; `../prosemirror/demo/bench/mutate.js`; `../prosemirror/demo/bench/type.js`).                                                                                                     | **Steal benchmark scenarios selectively.** Current Plite benchmarks and app examples remain the owners; no second demo tree.                                                                                                              |
| PM-C63 | Each mechanism is a separately published MIT package with explicit entry points, docs, tests, and mostly one direction of dependencies; index files re-export public owners.                                                                                                                                                         | **Keep Plite/Plate boundary discipline.** Do not split merely to mirror PM, but preserve acyclic ownership and delete package-local glue when substrate functionality legitimately owns it.                                               |

## Material ProseMirror-derived candidates

These are the only changes this lane can justify without inventing work. The
first two are real architecture gaps. The remaining four are proof packets; if
the parent audit finds equivalent current proof, close those packets as covered
instead of manufacturing implementation.

### PM-P1-1 — Typed ordered content patterns compiled to an automaton

**Value:** P1. This is not grammar vanity. The live schema cannot state that a
list-item body must precede zero or more nested lists. Its compiled program only
checks that each child belongs to one global set and that the total count is in
one range (`packages/plite/src/core/slice-fit/compiled-slice-fitter.ts:282-309`,
`488-555`; `packages/plite/src/core/editor-schema.ts:2188-2230`). The live
legacy-list-model declaration consequently accepts a nested list before the body,
multiple bodies, and arbitrary interleaving
(`packages/platejs/src/features/list/src/lib/BaseListPlugin.ts:68-108`).

Current public authoring shape:

```ts
import { createBasePlugin } from "@platejs/core";
import { schema } from "@platejs/plite";
import { KEYS } from "@platejs/utils";

export const BaseListItemPlugin = createBasePlugin({
  key: KEYS.li,
  schema: ({ options, plugins }) => {
    const contentType = plugins.elementType(BaseListItemContentPlugin);
    const nestedListTypes = plugins.elementTypesByName([
      KEYS.ulClassic,
      KEYS.olClassic,
      KEYS.taskList,
    ]);
    const validBodyTypes = plugins.elementTypesByName(
      (options.validLiChildren ?? []).map(({ key }) => key)
    );

    return {
      element: {
        content: schema.content.types(
          [contentType, ...nestedListTypes, ...validBodyTypes],
          {
            default: { type: contentType },
            min: 1,
          }
        ),
      },
    };
  },
});
```

The shape looks typed, but it means only “one or more children from this set.”
Order and per-segment cardinality do not exist.

Current public query shape:

```ts
const allowed = state.schema.allowsElementType(parent.type, child.type);
const wrappers = state.schema.findWrapping(parent, child);
```

Both answers are context-free. They cannot change after matching the first
child.

Proposed simple public shape:

```ts
import { schema } from "@platejs/plite";

const inlineContent = schema.content.choice(
  [schema.content.text(), schema.content.group("inline")],
  { min: 1 }
);
```

Proposed configured list shape:

```ts
import { createBasePlugin } from "@platejs/core";
import { schema } from "@platejs/plite";
import { KEYS } from "@platejs/utils";

export const BaseListItemPlugin = createBasePlugin({
  key: KEYS.li,
  schema: ({ options, plugins }) => {
    const contentType = plugins.elementType(BaseListItemContentPlugin);
    const validBodyTypes = plugins.elementTypesByName(
      (options.validLiChildren ?? []).map(({ key }) => key)
    );
    const nestedListTypes = plugins.elementTypesByName([
      KEYS.ulClassic,
      KEYS.olClassic,
      KEYS.taskList,
    ]);

    return {
      element: {
        content: schema.content.sequence([
          schema.content.types([contentType, ...validBodyTypes]),
          schema.content.types(nestedListTypes, { min: 0 }),
        ]),
      },
    };
  },
});
```

The quantifier contract is exact:

- no `min` or `max`: exactly one match;
- `min` without `max`: unbounded above;
- `max` without `min`: zero through `max`;
- both: the closed range;
- required concrete/ordered branches derive their filler from the first
  constructible path;
- required `group`, `open`, or set-difference branches with no unique
  constructible path must declare `fill`, or compilation fails.

Proposed advanced public shape:

```ts
const rootContent = schema.content.except(
  schema.content.group("block"),
  schema.content.type(imageType),
  {
    fill: { type: paragraphType },
    min: 1,
  }
);

const match = state.schema
  .content(parent)
  ?.match(parent.children.slice(0, insertionIndex));

if (match?.allows(child)) {
  // The child is legal at this exact prefix, not merely legal somewhere.
}

const wrappers = match?.findWrapping(child);
const completion = match?.fillToEnd();
```

`sequence`, `choice`, and `except` are typed frozen declarations, not builders
with hidden mutable state. `except` preserves the useful part of Plite's
current set algebra without forcing callers to understand regex intersection.
The public match object is structural and read-only; it does not expose DFA
state numbers.

Current internal representation:

```ts
type CompiledSchemaContentProgram = Readonly<{
  allowedElementTypes: ReadonlySet<string>;
  allowsText: boolean;
  allowsUnknownElements: boolean;
  defaultPlan: CompiledSchemaConstructionPlan | null;
  max: number | null;
  min: number;
}>;
```

Validation calls one `contentAllows` predicate for every child. Filling appends
the same `defaultPlan` until the global minimum is met. Wrapper search is keyed
only by `(programId, childType)` and orders candidates by the single default,
then lexically (`packages/plite/src/core/schema-compiler.ts:435-529`).

Proposed internal representation:

```ts
type CompiledSchemaContentTransition = Readonly<{
  elementStateByType: ReadonlyMap<string, number>;
  textState: number | null;
  unknownElementState: number | null;
}>;

type CompiledSchemaContentState = Readonly<{
  complete: boolean;
  fillToEnd: readonly CompiledSchemaConstructionPlan[] | null;
  transition: CompiledSchemaContentTransition;
}>;

type CompiledSchemaContentProgram = Readonly<{
  declaration: SchemaContentPattern;
  startState: number;
  states: readonly CompiledSchemaContentState[];
}>;

type CompiledSchemaWrapperCacheKey = Readonly<{
  childType: string | null;
  programId: string;
  state: number;
}>;
```

The compiler expands type/group predicates against the candidate schema
revision, lowers the typed pattern to an NFA, determinizes it, rejects
unconstructible required states, derives shortest filler paths in declaration
order, and freezes the result. The immutable document index caches prefix-state
checkpoints so incremental validation resumes at the first changed sibling
instead of rescanning a large parent from child zero. Fitting, construction,
wrapper search, closed-document validation, open-slice validation, and codec
insertion all consume this one program.

Invariants and lifecycle:

1. A child list is valid iff walking from `startState` consumes every child and
   ends at a `complete` state.
2. Fill and wrapper plans are state-specific and use only constructible schema
   nodes.
3. Group expansion, unknown-node policy, codec classification, pattern
   compilation, and fitter publication occur in one candidate configuration
   revision.
4. A compile failure or invalid current document aborts reconfiguration before
   publication.
5. Pattern AST and compiled structural facts participate in schema
   fingerprints, deltas, serialization validation, and cache invalidation.
6. Public JSON nodes, paths, roots, anchors, and `ContentSlice` do not change.

Hard deletions:

- `SchemaContent.allowed` plus the current `all`/`any`/`not` set-only public
  algebra; `choice`/`sequence`/`except` replace the jobs with unambiguous names.
- One global content `default`/`min`/`max` representation.
- Public `allowedElementTypes`, `allowsText`, and
  `allowsUnknownElements` as if validity were parent-wide.
- `compileContentRule`, global `contentAllows`, global count-only validation,
  `orderedCompiledAllowedTypes`, and the context-free wrapper-plan cache.
- Fitter branches or Plate guards whose only job is to reconstruct a child
  order the compiled program can express. Semantic list/table commands remain;
  this proposal does not pretend every positional transform is normalization.

Adoption:

- Plite: schema interfaces/builders/compiler, structural cache payloads,
  schema deltas, public schema reads, document/root indexes, construction,
  incremental validation, representation fitting, slice fitting, commands,
  persistence validation, and generated laws.
- Host packages: HTML/Markdown/clipboard parsers ask the same matcher/fitter;
  they do not carry a second grammar.
- Plate core: schema lowering and HTML codec classification.
- Plate packages: legacy-list-model first, then table, list, code-block, layout,
  media, callout, and every remaining `schema.content.*` declaration.
- Product/docs: schema examples and custom plugin authoring.

Proof:

- Compile-time/type tests for every constructor and invalid nesting.
- Deterministic sequence/choice/repetition/range/exclusion/filler/dead-end laws.
- Generated validation, construction, fit, invert, serialization, and
  reconfiguration laws over the same patterns.
- List/table paste, split, join, lift, wrap, open-slice, named-root, and
  unknown-node browser/package rows.
- Benchmark compilation, incremental validation after one middle-child edit,
  wrapper lookup, and fitting for large parents; no full-parent rescan on a
  local change.

Dependencies and routing:

- Primary decision owner: `best-api` for constructor names, quantifier rules,
  and the public match object.
- Primary implementation plan: `plite-plan`.
- Dependent adoption plan: `plate-plan`.
- Architectural dependencies: immutable transactional schema revisions,
  canonical construction, `ContentSlice`, host-owned codecs, and document
  indexes. No dependency on PM classes or integer positions.

### PM-P1-2 — Schema-owned exclusive text-property groups

**Value:** P1. Subscript versus superscript currently works only because the
two Plate commands remember to clear each other. Generic mark APIs, toolbar
state, command specs, codecs, external JSON, direct property writes, and Yjs
must all rediscover the same invariant or can create an impossible leaf. That
is the wrong owner.

Current extension-author shape:

```ts
import { createBasePlugin } from "@platejs/core";
import { property } from "@platejs/plite";

export const BaseSubscriptPlugin = createBasePlugin({
  key: "subscript",
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  update: ({ editor, tx, type }) => ({
    toggle: () => {
      tx.marks.toggle(type, true, {
        clear: editor.plugin("superscript").type,
      });
    },
  }),
});
```

Current application shape:

```ts
import { useMarkToolbarButtonState } from "@platejs/utils/react";
import { useCreateEditor } from "platejs/react";

const editor = useCreateEditor();
const state = useMarkToolbarButtonState({
  clear: "superscript",
  nodeType: "subscript",
});

editor.update.marks.toggle("subscript", true, {
  clear: "superscript",
});
```

Proposed extension-author shape:

```ts
import { createBasePlugin } from "@platejs/core";
import { property, schema } from "@platejs/plite";

export const ScriptPositionMarks = schema.property.exclusive(
  "plate:script-position"
);

export const BaseSubscriptPlugin = createBasePlugin({
  key: "subscript",
  schema: {
    mark: {
      exclusive: [ScriptPositionMarks],
      property: property.boolean({ default: false, omitDefault: true }),
    },
  },
  update: ({ tx, type }) => ({
    toggle: () => tx.marks.toggle(type),
  }),
});

export const BaseSuperscriptPlugin = createBasePlugin({
  key: "superscript",
  schema: {
    mark: {
      exclusive: [ScriptPositionMarks],
      property: property.boolean({ default: false, omitDefault: true }),
    },
  },
  update: ({ tx, type }) => ({
    toggle: () => tx.marks.toggle(type),
  }),
});
```

`schema.property.exclusive()` returns a frozen structural descriptor keyed by a
stable namespaced ID. It is not a global registry entry or an object-identity
token. The array form deliberately supports a property participating in more
than one schema-owned exclusion group without scalar-or-array overloads.

Proposed application shape:

```ts
import { useMarkToolbarButtonState } from "@platejs/utils/react";
import { useCreateEditor } from "platejs/react";

const editor = useCreateEditor();
const state = useMarkToolbarButtonState({
  nodeType: "subscript",
});

editor.update.marks.toggle("subscript");
```

Proposed advanced substrate shape:

```ts
import { property, schema, target } from "@platejs/plite";

const mode = schema.property.exclusive("acme:review-mode");

schema.textProperty(
  "inserted",
  property.boolean({ default: false, omitDefault: true }),
  {
    exclusive: [mode],
    target: target.group("textBlock"),
  }
);
```

Current internal shape:

```ts
type EditorMarkToggleOptions = {
  clear?: string[] | string;
};

if (!isActive) {
  getClearMarks(options?.clear).forEach((mark) => {
    applyRemoveMark(editor, mark);
  });
  applyAddMark(editor, key, nextValue);
}
```

There is no compiled relation in `CompiledSchemaProperty`; validation checks
each property independently (`packages/plite/src/core/schema-compiler.ts:335-350`,
`3344-3397`).

Proposed internal shape:

```ts
type SchemaPropertyExclusiveGroup<TId extends string = string> = Readonly<{
  id: TId;
  kind: "schema-property-exclusive";
}>;

type CompiledSchemaProperty = Readonly<{
  // existing descriptor, lifecycle, owner, placement, target, and merge facts
  conflictPropertyIds: ReadonlySet<string>;
  exclusiveGroupIds: ReadonlySet<string>;
}>;

type CompiledSchemaPropertyRelations = Readonly<{
  conflictsByPropertyId: ReadonlyMap<string, ReadonlySet<string>>;
  membersByExclusiveGroup: ReadonlyMap<string, ReadonlySet<string>>;
}>;
```

One schema-owned text-property canonicalizer serves add, toggle, stored marks,
expanded selections, input rules, codecs, direct text-property patches,
history replay, and collaboration import:

```ts
const result = schema.canonicalizeTextPropertyWrite({
  context,
  incoming: { id: propertyId, value },
  previous: textProperties,
});

// Sequential explicit writes: incoming property wins and conflicts disappear
// in the same TransactionSpec.
tx.textProperties.replace(result);
```

Invariants and lifecycle:

1. Two active properties in the same exclusive group never coexist in a
   published canonical snapshot.
2. A sequential explicit write wins over its conflicts. Removing a property
   removes only itself.
3. An unordered batch or external JSON value containing multiple active group
   members is rejected with all conflicting property IDs; object-key order is
   never precedence.
4. Codec nesting may lower to ordered writes, so the innermost/latest decoded
   property wins predictably.
5. Yjs import must lower concurrent property events to one deterministic
   causal winner before publishing a canonical `DocumentChange`; schema
   declaration order is not a collaboration tiebreaker.
6. A configuration revision that introduces a conflict into the current
   document fails before atomic publication. Data migration is explicit.
7. Relations compile structurally with the schema revision and participate in
   fingerprints, deltas, validation, persistence, and cache invalidation.

Hard deletions:

- `EditorMarkToggleOptions.clear`, scalar-or-array normalization, and serialized
  command options carrying `clear`.
- `getClearMarks` and the command-owned clear loop in `toggle-mark.ts`.
- `clear` in `useMarkToolbarButtonState` and its UI/tests.
- Subscript/superscript-specific lookup and clearing logic; their ordinary
  Plate `update.toggle` methods may remain for uniform plugin DX.
- Any codec, input rule, or collaboration special case that manually clears a
  sibling property once the common canonicalizer owns the relation.

Adoption:

- Plite: schema declarations/types/compiler, schema fingerprints/deltas,
  property validation/canonicalization, add/toggle/stored marks, direct text
  property patches, command codecs, history persistence, and reconfiguration.
- Plate core: lower `schema.mark.exclusive` into
  `schema.textProperty(..., { exclusive })` with full inference.
- Plate packages: basic-nodes subscript/superscript first; audit code,
  highlight, links, comments, suggestions, font properties, and custom marks
  for real exclusivity rather than adding speculative groups.
- Host/codecs/Yjs: use the same relation at parse/import boundaries.
- Apps/docs: toolbar examples no longer mention `clear`.

Proof:

- Type inference for group descriptors and plugin `schema.mark`.
- Symmetry, incoming-wins, idempotence, removal, target-context, stored-mark,
  expanded-selection, split/merge, codec-order, and invalid-batch laws.
- External JSON and versioned persistence rejection diagnostics.
- History undo/redo and Yjs two-peer concurrent-exclusive-mark convergence.
- Atomic reconfiguration rejection and cache invalidation.
- Large expanded-selection benchmark proving conflict lookup is compiled, not a
  schema scan per leaf.

Dependencies and routing:

- Primary decision owner: `best-api`.
- Primary implementation plan: `plite-plan`.
- Dependent adoption plan: `plate-plan`.
- Architectural dependencies: descriptor-backed schema properties, atomic
  configuration revisions, canonical `DocumentChange`, versioned persistence,
  and the Yjs change bridge. It does not depend on ordered content grammar.

### PM-P2-1 — Generated structural fitting law corpus

**Value:** P2. ProseMirror's fitter is proven across hundreds of replace,
slice, structure, command, and list cases. Plite already exposes fitted slices;
the residual value is adversarial proof, not another API.

Current public shape:

```ts
import { ContentSlice } from "@platejs/plite";

const slice = ContentSlice.closed(incomingNodes);
const spec = editor.read.slice.fit(slice, options);

if (spec) editor.update(spec);
```

Proposed public shape:

```ts
import { ContentSlice } from "@platejs/plite";

const slice = ContentSlice.closed(incomingNodes);
const spec = editor.read.slice.fit(slice, options);

if (spec) editor.update(spec);
```

Current internal proof shape:

```ts
it("fits one named fixture", () => {
  // hand-authored input and expected document
});
```

Proposed internal proof shape:

```ts
for (const lawCase of structuralFitCases) {
  law(`${lawCase.operation}: ${lawCase.name}`, () => {
    const result = fit(lawCase.schema, lawCase.before, lawCase.slice);

    expect(result).toSatisfySchema();
    expect(apply(invert(result.change), result.document)).toEqual(
      lawCase.before
    );
    expect(serialize(result.change)).toRoundTrip();
    expect(result).toMatchExpected(lawCase.after);
  });
}
```

- Ownership: `best-api` closes with no public change; `plite-plan` owns the
  generated schema/fitter-law harness; `plate-plan` owns list/table product
  fixtures.
- Dependencies: compiled schema and `ContentSlice` must remain canonical.
- Adoption: model, clipboard, DOM codecs, list/table packages.
- Deletions: none required; merge redundant one-off fixture helpers only when
  the generated harness fully replaces them.
- Proof: deterministic fixtures plus generated replace/split/join/wrap laws;
  benchmark large fitted slices.

### PM-P2-2 — Browser composition and DOM-change gauntlet

**Value:** P2. ProseMirror's browser suites encode years of real platform
failures. Plite's architecture is cleaner, but cleanliness does not move the
caret correctly on Firefox.

Current public shape:

```tsx
import { Editable } from "@platejs/plite-react";

<Editable />;
```

Proposed public shape:

```tsx
import { Editable } from "@platejs/plite-react";

<Editable />;
```

Current internal proof shape:

```ts
test("composition scenario", async ({ editor }) => {
  // focused case
});
```

Proposed internal proof shape:

```ts
for (const scenario of compositionGauntlet) {
  browserLaw(scenario.name, scenario.browserMatrix, async (surface) => {
    await scenario.mutateDOM(surface);
    await surface.flushPhases();

    expect(surface.model).toEqual(scenario.document);
    expect(surface.selection).toEqual(scenario.selection);
    expect(surface.scheduler).toHaveNoRepairLoop();
  });
}
```

- Ownership: `best-api` closes with no public change; `plite-plan` owns the DOM
  scheduler/input-state proof; `plate-plan` owns any plugin/browser adoption
  exposed by failures; `editor-test-harvester` owns translation and provenance.
- Dependencies: one scheduler and explicit composition state.
- Adoption: Plite React, DOM host, app browser runner.
- Deletions: browser-specific workaround branches may be deleted only after a
  scheduler-owned replacement passes the same failing rows.
- Proof: Chromium, Firefox, WebKit, mobile viewport; no retry-based success.

### PM-P2-3 — History/Yjs rebase and compression laws

**Value:** P2. PM history remains a strong adversarial model for selection
bookmarks, map-only remote changes, overlapping deletes, concurrent typing, and
bounded branch growth.

Current public shape:

```ts
editor.update(spec);
editor.update.history.undo();
```

Proposed public shape:

```ts
editor.update(spec);
editor.update.history.undo();
```

Current internal proof shape:

```ts
applyLocal();
applyRemote();
expect(peer.document).toEqual(expected);
```

Proposed internal proof shape:

```ts
modelLaw("history and collaboration commute", generatedScenario, (scenario) => {
  const peers = runYjsSchedule(scenario);

  expect(peers).toConverge();
  expect(peers).toPreserveUndoIntent();
  expect(peers).toRestoreMappedSelections();
  expect(historyFootprint(peers)).toStayBounded();
});
```

- Ownership: `best-api` closes with no public change; `plite-plan` owns
  canonical transform/history laws and the Yjs package owns transport
  adoption; `plate-plan` owns only downstream plugin adoption exposed by a
  public break.
- Dependencies: canonical `DocumentChange`, anchors/bookmarks, versioned
  history persistence.
- Adoption: history, Yjs, selection, serialization.
- Deletions: any intent/operation fallback used as collaboration or history
  truth must disappear once canonical changes cover the scenario.
- Proof: generated two/three-peer schedules, invert/compose/transform laws,
  history memory benchmark.

### PM-P3-1 — Clipboard context and codec safety corpus

**Value:** P3. The architecture already points the right way; the remaining
value is proving open context, wrappers, comments, plain-text fallbacks,
Trusted Types, and injection resistance.

Current public shape:

```ts
import { createBasePlugin } from "@platejs/core";
import { ContentSlice, schema } from "@platejs/plite";

const CardPlugin = createBasePlugin({
  key: "cardCodec",
  type: "card",
  schema: {
    element: {
      content: schema.content.text({ default: "text", min: 1 }),
    },
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      "application/x-card": {
        decode: ({ data }) => ContentSlice.fromJSON(JSON.parse(data)),
        encode: ({ slice }) => JSON.stringify(slice),
      },
    }),
});
```

Proposed public shape:

```ts
import { createBasePlugin } from "@platejs/core";
import { ContentSlice, schema } from "@platejs/plite";

const CardPlugin = createBasePlugin({
  key: "cardCodec",
  type: "card",
  schema: {
    element: {
      content: schema.content.text({ default: "text", min: 1 }),
    },
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      "application/x-card": {
        decode: ({ data }) => ContentSlice.fromJSON(JSON.parse(data)),
        encode: ({ slice }) => JSON.stringify(slice),
      },
    }),
});
```

Current internal proof shape:

```ts
import { writeHostFragmentData } from "@platejs/plite-dom";

it("round-trips one codec fixture", () => {
  const transfer = new DataTransfer();

  writeHostFragmentData(editor, transfer, slice);
  expect(editor.api.clipboard.insertData(transfer)).toBe(true);
  expect(editor.read.children()).toEqual(expected);
});
```

Proposed internal proof shape:

```ts
for (const fixture of clipboardContextCorpus) {
  codecLaw(fixture.name, fixture.browserMatrix, async (surface) => {
    await surface.paste(fixture.payload, fixture.at);

    expect(surface.decodedSlice).toEqual(fixture.slice);
    expect(surface.document).toEqual(fixture.fittedDocument);
    expect(surface.output).toSatisfy(fixture.securityPolicy);
  });
}
```

- Ownership: `best-api` closes with no public change; `plite-plan` owns
  host-codec/slice invariants; `plate-plan` owns table/list/media codec
  contributions.
- Dependencies: compiled schema and one fitter.
- Adoption: plite-dom, clipboard runtime, Plate serializers.
- Deletions: duplicated codec-specific structural repair.
- Proof: package round trips plus real browser paste/copy rows.

## Explicit non-candidates

- No PM `Node`, `Schema`, `Step`, `Transaction`, `Selection`, `Plugin`,
  `EditorView`, `NodeView`, or `Command` public clone.
- No ProseMirror content-expression strings, live `ContentMatch` classes,
  schema-bound node types, mark instances, raw mark-name exclusions, asymmetric
  conflict policy, or schema-rank precedence. The two schema pulls above use
  typed frozen declarations and immutable compiled facts.
- No flat integer position API.
- No global string registry for steps, selections, plugins, or codecs.
- No central-authority OT replacement for Yjs.
- No DOM or Markdown types in Plite core.
- No PM menu, example setup, basic schema, list schema, search, drop cursor, or
  changeset in Plite core.
- No second imperative renderer without a real consumer and parity target.
- No API break justified solely by fewer lines in ProseMirror. Its narrower
  product surface often hides costs that Plate must own explicitly.

## Closure

All 64 concepts in `prosemirror-source-manifest.json` are represented above.
Every relevant source/test declaration is mapped to one or more of them. The
worthwhile pulls are two schema rewrites and four proof/behavior packets. Every
other public mechanism is already represented more strongly in Plite,
product-owned by Plate, or rejected on JSON, typing, multi-root, persistence,
collaboration, React, or browser-scheduling grounds.
