# Wordgard architecture lane

This report is the Wordgard input to the multi-editor audit. It is not a
cross-editor verdict and does not promote any Plite or Plate change by itself.
The parent audit must compare each pressure point against live Plite, Plate,
Lexical, and ProseMirror before assigning P0-P3.

## Authority and provenance

| Field              | Verified value                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| Checkout           | clean local `../wordgard`                                                                            |
| Commit             | `8fd8880d1a16bc6306b1e59f8649b1d9021e3d1e`                                                           |
| Branch             | `main`                                                                                               |
| Upstream           | `origin/main`                                                                                        |
| Origin             | `https://code.haverbeke.berlin/wordgard/wordgard.git`                                                |
| License            | MIT in `../wordgard/LICENSE` and `../wordgard/package.json:31`                                       |
| Package            | `wordgard@0.3.1`; Node 22+                                                                           |
| Public entrypoints | `.`, `doc`, `types`, `schema`, `table`, `state`, `editor`, `command`, `history`, `collab`, `phrases` |

The exact commit, clean state, hashes, tracked-file list, declarations, and
semantic mappings are machine-recorded in
`wordgard-source-manifest.json`. The generator refuses a different or dirty
Wordgard checkout.

## Coverage closure

| Measure                                 | Count |
| --------------------------------------- | ----: |
| Tracked files                           |   120 |
| Mapped files                            |   114 |
| Exactly excluded files                  |     6 |
| Unmapped files                          |     0 |
| Declaration sites                       | 3,275 |
| Public declaration/member sites         | 1,928 |
| Private declaration/member sites        | 1,347 |
| Mapped declaration sites                | 3,263 |
| Excluded release-only declaration sites |    12 |
| Unmapped declaration sites              |     0 |
| Semantic concepts                       |    73 |

The six exclusions are `.gitignore`, historical `CHANGELOG.md`, `LICENSE`
after recording provenance, release automation, the build-script tsconfig, and
one binary demo image. Every runtime, package, test, browser harness, build
owner, and teaching surface is mapped.

The manifest treats each declaration/member/re-export as one immutable atomic
source concept, then maps it to the smallest practical semantic owner. This
avoids two common cheats: calling a directory a concept, and inventing a
separate architecture row for every forwarding getter or barrel export.

## Public package shape

Wordgard exposes one package with eleven subpath entrypoints. Applications
create an imperative DOM editor from nested extension arrays:

```ts
import { Wordgard } from "wordgard/editor";
import { fullSchema } from "wordgard/schema";
import { history } from "wordgard/history";

const editor = Wordgard.create({
  parent: document.body,
  doc: "<h2>Hello World</h2>",
  config: [fullSchema(), history()],
});
```

That shape is compact because the package owns the document classes, schema,
DOM codecs, browser view, product schema, menus, tables, history, central OT,
and phrases itself. It is not evidence that those owners should collapse in
Plite/Plate. The breadth difference is material: Wordgard is single-root,
imperative-DOM, class-based, and has no React or Yjs integration
(`../wordgard/package.json:1-37`, `../wordgard/README.md:1-25`).

## Complete semantic concept ledger

The 73 IDs below cover every source declaration through the manifest. Rows
group tightly coupled mechanisms; each ID remains independently queryable in
the JSON artifact.

| Concepts              | Current Wordgard public/internal shape                                                                                                                                                                                                           | Exact source evidence                                                                                                                                                                                               | Consumer, proof, and audit pressure                                                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WG-META-001..004`    | One package, eleven entrypoints, custom SWC/Rollup declaration build, Mocha plus browser server, small demo.                                                                                                                                     | `../wordgard/package.json:1-37`; `../wordgard/bin/packages.ts:1-34`; `../wordgard/bin/build.ts:1-204`; `../wordgard/bin/test-headless.ts:1-65`                                                                      | Compact distribution is useful evidence, not a reason to collapse Plite/Plate packages. Proof breadth is much narrower than Plite’s package/browser matrix.                                                                     |
| `WG-DOC-001..002`     | `Node = Plot \| Leaf`; nodes, tags, and types are nominal objects; one privileged `Plot.Doc`; groups, roles, and flags live on type/tag objects.                                                                                                 | `../wordgard/src/doc/node.ts:13-98`; `../wordgard/src/doc/node.ts:99-323`; `../wordgard/src/doc/node.ts:325-930`                                                                                                    | Clear local semantics, but constructor identity and one root are hostile to structural JSON, duplicate package copies, multi-root documents, persistence, and Yjs. Reject the representation; preserve compiled behavior facts. |
| `WG-DOC-003`          | Ranked immutable `Mark` instances provide add/subtract/union/equality and carry render/parse shapes.                                                                                                                                             | `../wordgard/src/doc/mark.ts:11-318`                                                                                                                                                                                | The algebra is worth law-mining. Nominal values, rank-based identity, and DOM shape ownership are not.                                                                                                                          |
| `WG-DOC-004..005`     | `Schema` compiles names, identity, membership, content, mark targets, defaults, wrapping, and overrides; construction validates and joins adjacent text. A weak-ref cache compares extension arrays.                                             | `../wordgard/src/doc/schema.ts:11-392`; `../wordgard/src/doc/node.ts:929-992`                                                                                                                                       | Strong evidence for compiled relations and fitted construction. The cache and validation suppression are identity/global-state shaped; do not copy them.                                                                        |
| `WG-DOC-006..007`     | Public global token offsets resolve through `Pos`; a strong eight-document cache retains position arrays; traversal and text projection are class methods.                                                                                       | `../wordgard/src/doc/pos.ts:7-324`; `../wordgard/src/doc/node.ts:545-629`; `../wordgard/src/doc/text.ts:3-24`                                                                                                       | Useful private cursor algebra, wrong public coordinate model for root-aware Plite. Strong cache retention needs benchmark evidence before reuse.                                                                                |
| `WG-DOC-008`          | `Slice` is an immutable token stream of open tags, close tokens, and full nodes; it preserves open structural context through parse, clipboard, fit, and table paste.                                                                            | `../wordgard/src/doc/slice.ts:9-148`; `../wordgard/src/editor/clipboard.ts:5-167`; `../wordgard/src/table/tablepaste.ts:10-37`                                                                                      | High-value semantic pressure: external fragments must preserve representable openness and be fitted once. Plite should keep a structural `ContentSlice`, not expose Wordgard tokens.                                            |
| `WG-DOC-009..011`     | `ChangeSet` stores compact sections plus side data and owns apply, JSON, compose, pairwise transform, invert, mapping affinity, changed ranges, pad, and clip.                                                                                   | `../wordgard/src/doc/change.ts:121-548`; `../wordgard/src/doc/change.ts:727-900`                                                                                                                                    | One canonical immutable change algebra is excellent. Compare laws and cost, not names or compressed array representation.                                                                                                       |
| `WG-DOC-012`          | `ChangeSet.create` fits replacements/deletions against schema with `ChangeFitter`, required nodes, wrappers, defining context, and mark validity.                                                                                                | `../wordgard/src/doc/change.ts:623-726`; `../wordgard/src/doc/change.ts:914-1387`                                                                                                                                   | High-value pressure against representation-normalizer loops and invalid intermediate publication.                                                                                                                               |
| `WG-DOC-013`          | Nodes, marks, slices, and changes validate JSON through the live nominal schema.                                                                                                                                                                 | `../wordgard/src/doc/node.ts:88-95`; `../wordgard/src/doc/node.ts:621-629`; `../wordgard/src/doc/slice.ts:122-136`; `../wordgard/src/doc/change.ts:209-253`; `../wordgard/src/doc/schema.ts:299-342`                | Validation is right; live class/type identity and unversioned descriptor lookup are not durable persistence boundaries.                                                                                                         |
| `WG-DOC-014..016`     | `Elt` is a DOM/HTML shape IR; node/mark specs carry parse/render rules; schema compilation builds parser precedence; parse returns fitted open slices; serialize emits DOM or HTML.                                                              | `../wordgard/src/doc/shape.ts:18-470`; `../wordgard/src/doc/parse.ts:13-239`; `../wordgard/src/doc/parse.ts:247-557`; `../wordgard/src/doc/serialize.ts:21-200`                                                     | Steal schema-linked declarative codec claims and fitting. Reject DOM types in Plite core; Plate/Plite host packages must own HTML/clipboard codecs, while React rendering remains separate.                                     |
| `WG-DOC-017`          | Shared deep equality, array equality, validators, `SchemaError`, and `ValidationError`.                                                                                                                                                          | `../wordgard/src/doc/helper.ts:1-36`; `../wordgard/src/doc/error.ts:1-7`                                                                                                                                            | Small utilities are implementation detail. Do not add a second generic canonicalizer if compiled Plite construction already owns equality/defaults.                                                                             |
| `WG-STATE-001..002`   | `GardState` is immutable; typed fields update from transactions and optionally serialize; typed annotations and effects map through `ChangeSet`.                                                                                                 | `../wordgard/src/state/state.ts:49-293`; `../wordgard/src/state/state.ts:323-441`; `../wordgard/src/state/transaction.ts:12-370`                                                                                    | Strong state/effect semantics. Persistence should be versioned and descriptor-registered rather than tied to live identities.                                                                                                   |
| `WG-STATE-003`        | Facets combine inputs and lazily compute. `compute`/`computeN` record whichever document, selection, schema, field, or facet reads occur at runtime.                                                                                             | `../wordgard/src/state/state.ts:443-594`; `../wordgard/src/state/state.ts:904-1070`                                                                                                                                 | Ergonomic but implicit. Reject automatic dependency discovery for Plite: explicit dependencies are more deterministic, inspectable, and agent-readable.                                                                         |
| `WG-STATE-004..005`   | Nested extensions flatten into five precedence bands with identity dedupe. Compartments and root configuration reconfigure through transaction effects and publish atomically.                                                                   | `../wordgard/src/state/state.ts:596-817`; `../wordgard/src/state/state.ts:158-197`                                                                                                                                  | Atomic reconfiguration is strong pressure. Local priority numbers and identity dedupe are weaker than explicit compiled ownership/conflicts.                                                                                    |
| `WG-STATE-006..007`   | A transaction spec carries changes, selection, effects, annotations, user event, scroll, and `sequential`; extenders may rewrite/add to a transaction, and appenders may add later transactions.                                                 | `../wordgard/src/state/transaction.ts:12-214`; `../wordgard/src/state/transaction.ts:372-417`                                                                                                                       | Pure specs and atomic merge are useful. Public universal extenders/appenders expose advanced continuation and post-hoc rewrite machinery; prefer narrower typed owners.                                                         |
| `WG-STATE-008`        | Corrections register by child-list/content/marks event, scan only changed neighborhoods, emit sequential fixes, skip remote transactions, and expose a standalone collab-safe check.                                                             | `../wordgard/src/state/correction.ts:13-190`                                                                                                                                                                        | Excellent locality and proof pressure. Prefer fitted construction and schema-owned repair; keep event-scoped correction only for invariants that cannot be constructed validly.                                                 |
| `WG-STATE-009..010`   | Selection is an extensible registered class protocol with tagged JSON. Text, node, and custom selections map through changes and carry affinity, goal column, active marks, replacement ranges, and DOM selection overrides.                     | `../wordgard/src/state/selection.ts:20-433`; `../wordgard/src/table/cellselection.ts:93-240`                                                                                                                        | The behaviors are strong. Plite should retain structural tagged selection data and anchors, not class identity or global offsets.                                                                                               |
| `WG-STATE-011`        | Cached textblock projection plus grapheme, word, logical, visual, bidi, atom, and goal-column motion.                                                                                                                                            | `../wordgard/src/state/textblock.ts:23-229`; `../wordgard/src/state/selection.ts:435-576`; `../wordgard/src/state/bidi.ts:65-410`                                                                                   | Mine behavior and generated/browser cases. The custom bidi implementation is not automatically better than standards/platform-backed local owners.                                                                              |
| `WG-STATE-012`        | Typed phrase sets merge localized overrides through facets.                                                                                                                                                                                      | `../wordgard/src/phrases/phraseset.ts:3-86`; `../wordgard/src/phrases/phrases.ts:4-105`                                                                                                                             | Good product DX, wrong substrate owner for Plate’s much broader product/i18n surface. Keep app/product ownership.                                                                                                               |
| `WG-VIEW-001,016`     | `Wordgard` owns one imperative DOM view and stateful plugins. Plugin failures are caught, reported, disconnected, and permanently deactivated without taking down the editor.                                                                    | `../wordgard/src/editor/editor.ts:28-190`; `../wordgard/src/editor/editor.ts:916-1073`; `../wordgard/src/editor/editor.ts:1078-1159`                                                                                | Optional-provider fault isolation is excellent. Do not import the imperative renderer merely to obtain it.                                                                                                                      |
| `WG-VIEW-002..003`    | Dispatch publishes model state immediately and schedules DOM work. Flush performs render, writes, measure, reads, and bounded follow-up writes, warning after five restarts.                                                                     | `../wordgard/src/editor/editor.ts:176-245`; `../wordgard/src/editor/editor.ts:364-380`; `../wordgard/src/editor/viewstate.ts:1-115`                                                                                 | One bounded phase scheduler with loop diagnostics is materially valuable if local Plite React still has scattered scheduling.                                                                                                   |
| `WG-VIEW-004`         | A custom tile tree incrementally maps changed ranges, reuses tile/DOM identity, renders wrappers/widgets, and preserves live composition DOM.                                                                                                    | `../wordgard/src/editor/tile.ts:13-545`; `../wordgard/src/editor/tile.ts:670-1153`; `../wordgard/src/editor/tile.ts:1196-1220`                                                                                      | Sophisticated and locally coherent, but Wordgard avoids React/Plate/multi-root constraints. Defer a second Plite renderer until a consumer and benchmark prove durable value.                                                   |
| `WG-VIEW-005`         | Separate Widget, Point, and Range concepts use sorted immutable sets, map through changes, derive invalidation ranges, and share a heap iterator at render time.                                                                                 | `../wordgard/src/editor/decoration.ts:10-393`; `../wordgard/src/editor/decoration.ts:580-1098`; `../wordgard/src/editor/decoration.ts:1099-1429`                                                                    | Strong private substrate pressure. Wordgard still duplicates point/range storage classes; a shared private kernel with separate public concepts is cleaner.                                                                     |
| `WG-VIEW-006..008`    | DOM/model mapping, geometry, selection, MutationObserver, resize, scroll, and theme observation are imperative-view owners.                                                                                                                      | `../wordgard/src/editor/dom.ts:3-310`; `../wordgard/src/editor/coords.ts:7-64`; `../wordgard/src/editor/selection.ts:1-123`; `../wordgard/src/editor/domobserver.ts:16-258`                                         | Mine browser invariants, not global integer APIs. Shadow DOM and platform workarounds require browser proof.                                                                                                                    |
| `WG-VIEW-009`         | `beforeinput` can let native DOM mutation happen while dispatching a model command; `input` records the actual DOM delta. A lazy mapping reconciles pending model transactions with native changes and cancels duplicate effects.                | `../wordgard/src/editor/input.ts:41-224`; `../wordgard/src/editor/input.ts:649-899`; `../wordgard/test/webtest-dom-changes.ts:51-147`                                                                               | One of the strongest current donor mechanisms. Compare local native-input routing and dirty-host mapping exhaustively before changing it. Do not expose Wordgard’s integer ledger.                                              |
| `WG-VIEW-010..012`    | Composition, mouse, drag/drop, paste, keymaps, input rules, and event observers/handlers compile from precedence-ordered facets. Clipboard carries slice context and browser-specific HTML wrappers.                                             | `../wordgard/src/editor/input.ts:326-899`; `../wordgard/src/editor/clipboard.ts:5-167`; `../wordgard/src/editor/keymap.ts:1-170`; `../wordgard/src/editor/inputrule.ts:1-139`                                       | Behavior/test source is valuable. Public event precedence and one package owning product behavior are not automatically transferable.                                                                                           |
| `WG-VIEW-013..015`    | Themes, editor attributes, panels, dialogs, menus, tooltips, placeholders, drawn cursor, and drop cursor ship in the editor package.                                                                                                             | `../wordgard/src/editor/theme.ts:1-189`; `../wordgard/src/editor/panel.ts:14-206`; `../wordgard/src/editor/dialog.ts:8-172`; `../wordgard/src/editor/menubar.ts:18-563`                                             | Useful proof of extension composition; wrong ownership for Plite core. Plate/app code owns product UI.                                                                                                                          |
| `WG-CMD-001`          | A command is its function identity and default implementation. Handlers register in a facet and first truthy result wins. Calling the function directly bypasses handlers.                                                                       | `../wordgard/src/command/command.ts:4-97`                                                                                                                                                                           | Blunt verdict: concise but too magical. Reject function identity, bypassable dispatch, and mixed boolean/spec/side-effect truth.                                                                                                |
| `WG-CMD-002..003`     | Most editing commands are pure `{state} -> false \| Transaction.Spec`; DOM geometry commands accept `Wordgard`. Helpers construct structural `ChangeSet.Spec` values.                                                                            | `../wordgard/src/command/commands.ts:20-580`; `../wordgard/src/command/helper.ts:7-625`                                                                                                                             | Pure command specs are strong. Keep imperative effects at host/product boundaries and use descriptor-owned typed IDs/interception.                                                                                              |
| `WG-CMD-004`          | Menu items bind commands, predicates, labels, icons, and controls in a declarative tree.                                                                                                                                                         | `../wordgard/src/command/menu.ts:10-400`; `../wordgard/src/editor/menubar.ts:18-563`                                                                                                                                | Good product UI composition evidence, but Plate owns menus and commands should not depend on UI descriptors.                                                                                                                    |
| `WG-HIST-001..003`    | Linked done/undone branches store inverse changes, effects, and starting selection; grouping uses time/touch/user events; skipped changes accumulate lazy mappings; JSON resolves all mappings first.                                            | `../wordgard/src/history/history.ts:6-170`; `../wordgard/src/history/history.ts:171-259`; `../wordgard/src/history/history.ts:261-356`                                                                              | Lazy rebase and effect integration are strong. JSON is unversioned and resolves through live schema/selection identities; a versioned registered-codec owner is stronger.                                                       |
| `WG-COLLAB-001..002`  | Central-authority OT keeps synced doc, locked sendable update, open update, client/version acknowledgement, shared effects, transformed corrections, and remote history exclusion. `sendableUpdate` mutates field state to lock the open update. | `../wordgard/src/collab/collab.ts:4-78`; `../wordgard/src/collab/collab.ts:80-226`; `../wordgard/src/collab/collab.ts:245-274`                                                                                      | Mine transform/convergence/correction laws. Reject a second central OT protocol beside Yjs, single-root changes, and read-time mutation of published state.                                                                     |
| `WG-PRODUCT-001..004` | Standard nodes/marks include HTML shapes; feature bundles add schema, commands, menu controls, upload, dialogs, resize, colors, links, lists, and blocks.                                                                                        | `../wordgard/src/types/schema.ts:7-403`; `../wordgard/src/schema/bundle.ts:12-55`; `../wordgard/src/schema/block.ts:12-365`; `../wordgard/src/schema/image.ts:9-194`; `../wordgard/src/schema/imagedialog.ts:9-281` | Wordgard looks simple partly because substrate, host codec, and product policy share a package. Plate’s product-plugin boundary is the strength to preserve.                                                                    |
| `WG-TABLE-001..003`   | Table schema is a product bundle. A weak-map table-relative grid cache diagnoses collisions/missing cells/overlong spans; corrections rectangularize affected tables.                                                                            | `../wordgard/src/table/table.ts:9-94`; `../wordgard/src/table/tablemap.ts:15-234`; `../wordgard/src/table/correct.ts:10-45`                                                                                         | Strong product algorithm and cache locality. Keep in Plate table, not Plite substrate.                                                                                                                                          |
| `WG-TABLE-004..005`   | `CellSelection` is a registered custom selection with multiple ranges and rectangular navigation. Pure commands add/remove rows/columns, toggle headers, merge, and split cells.                                                                 | `../wordgard/src/table/cellselection.ts:93-240`; `../wordgard/src/table/tablecommands.ts:9-290`                                                                                                                     | Excellent cross-check for extensible selection protocol and table command law. Product geometry remains Plate-owned.                                                                                                            |
| `WG-TABLE-006..007`   | Table paste fits open slices into cells, normalizes rectangular input, grows/clips grids, isolates crossing spans, composes changes, and selects the result. A menu dimension picker inserts tables.                                             | `../wordgard/src/table/tablepaste.ts:10-266`; `../wordgard/src/table/menu.ts:12-153`                                                                                                                                | High-value table behavior and tests; do not promote table policy into Plite merely because generic fitting participates.                                                                                                        |
| `WG-PROOF-001..004`   | 27 source files, 6,039 lines, 24 runnable files, 644 `it(...)` call sites, 33 behavior families. Includes generated change laws and current dirty-DOM mutation stress.                                                                           | `../wordgard/test/test-change.ts:23-574`; `../wordgard/test/test-facet.ts:15-227`; `../wordgard/test/test-history.ts:41-581`; `../wordgard/test/webtest-dom-changes.ts:51-147`                                      | Initial harvest is complete under `docs/editor-test-harvester/wordgard/`. It maps portable laws separately from representation and Plate-owned policy.                                                                          |

## Ranked Wordgard pressure for the parent comparison

These are candidate leads, not accepted Plite/Plate proposals. A lead becomes
P0-P3 only if the live local audit finds a material surviving gap after
adoption cost and deletion value.

### 1. Canonical change algebra plus fitted open slices

Donor public shape:

```ts
const change = ChangeSet.create(state.doc, {
  from,
  to,
  insert: slice,
  fit: context,
});

const next = state.update({
  changes: change,
  selection: (context, mapping) =>
    GardSelection.near(context, mapping.mapPos(from), 1),
});
```

Donor internal shape:

```ts
class ChangeSet {
  readonly sections: readonly number[];
  readonly data: readonly SectionData[];

  apply(doc: Plot.Doc): Plot.Doc;
  compose(other: ChangeSet): ChangeSet;
  invert(doc: Plot.Doc): ChangeSet;
  transform(doc: Plot.Doc, other: ChangeSet, before?: boolean): ChangeSet;
}
```

Evidence:
`../wordgard/src/doc/change.ts:121-548`,
`../wordgard/src/doc/change.ts:623-900`,
`../wordgard/src/doc/change.ts:914-1387`,
`../wordgard/src/doc/slice.ts:9-148`.

Local comparison question: does every Plite write, external slice insertion,
history entry, and collaboration delta already converge on one canonical
`DocumentChange` plus one fit at construction? If yes, Wordgard is a test
donor only. If no, the local owner should delete duplicate operation builders,
representation repair loops, or fragment arrays rather than add a bridge.

Conditional routing: `plite-plan`; `plate-plan` only for codec/product
adoption; `best-api` if public slice/change construction remains unresolved.

### 2. Compiled schema-linked codecs without DOM in core

Donor public shape:

```ts
const Paragraph = Plot.define("Paragraph", {
  inlineContent: true,
  group: Node.Group.Content,
  shape: { element: "p" },
});

const slice = parse.slice(schema, dom, options);
const html = serialize.toHTML(doc);
```

Donor internal shape:

```ts
class Schema {
  readonly nodesByName: Record<string, Node.Type>;
  readonly marksByName: Record<string, Mark.Type>;
  readonly wrappingCache: Record<string, readonly Plot.Tag[] | null>;
}

// Parser rules and render shapes compile from schema elements.
```

Evidence:
`../wordgard/src/doc/schema.ts:11-297`,
`../wordgard/src/doc/parse.ts:66-239`,
`../wordgard/src/doc/serialize.ts:21-200`.

Local comparison question: do Plite host packages and Plate product plugins
compile schema, parser classification, codec claims, conflicts, and fitting in
one atomic configuration revision? If not, fix that owner and delete parallel
parser/serializer registries. Do not copy `Element`, `DocumentFragment`, or
`Elt` into Plite core.

Conditional routing: joint `plite-plan`/`plate-plan`; `best-api` owns the
plugin-author declaration shape.

### 3. Transactional reconfiguration with explicit dependencies

Donor public shape:

```ts
const compartment = new GardState.Compartment();
const extension = compartment.of(initial);

state.update({
  effects: compartment.reconfigure(next),
});
```

Donor internal shape:

```ts
class Configuration {
  readonly dynamicSlots: readonly DynamicSlot[];
  readonly compartments: Map<Compartment, Extension>;
}

// Publication rebuilds fields/facets/schema as one transaction.
```

Evidence:
`../wordgard/src/state/state.ts:158-197`,
`../wordgard/src/state/state.ts:596-817`,
`../wordgard/src/state/state.ts:904-1100`.

Local comparison question: are schema/config/plugin revisions atomic and are
their caches invalidated once? Preserve Plite’s explicit dependency lists even
if Wordgard’s runtime access tracking looks shorter. Delete immediate mutable
reconfigure hooks if any survive.

Conditional routing: `plite-plan` for substrate lifecycle, `plate-plan` for
plugin compilation.

### 4. One bounded DOM phase scheduler and optional-provider isolation

Donor public shape:

```ts
editor.scheduleDOMRead((editor) => {
  const rect = editor.coordsAtPos(pos);
  editor.scheduleDOMWrite(() => positionOverlay(rect));
});
```

Donor internal shape:

```ts
dispatch(transaction); // model state publishes immediately
requestAnimationFrame(flush);

flush:
  render -> writes -> measure -> reads -> follow-up writes
  stop after five restarts and diagnose the loop

PluginInstance:
  catch -> report -> disconnect/remove -> deactivate only that plugin
```

Evidence:
`../wordgard/src/editor/editor.ts:176-245`,
`../wordgard/src/editor/editor.ts:364-380`,
`../wordgard/src/editor/editor.ts:1078-1159`.

Local comparison question: do Plite React selection export, repair, scroll,
drag, and input controllers already share one phase scheduler and error sink?
If not, this is high-value substrate pressure and should delete scattered
animation-frame/microtask queues.

Conditional routing: `plite-plan`; React adoption remains in Plite React, not
Plate product packages.

### 5. Native DOM change reconciliation

Donor public shape: none. The valuable machinery is intentionally internal.

Donor internal shape:

```ts
class InputState {
  domDoc: Plot.Doc;
  domChanges: ChangeSet | null;
  private _domMapping: ChangeSet;
  domMappingIndex: number;

  beforeInput(event, data): void;
  addDOMChange(change): void;
  posAtDOM(node, offset, assoc?): number;
}
```

The router lets selected native edits reach the DOM, derives the actual delta,
maps intervening model commits, recognizes when the pending model change
already matches the DOM result, and prevents duplicate application
(`../wordgard/src/editor/input.ts:83-224`,
`../wordgard/src/editor/input.ts:649-899`).

Local comparison question: is Plite React equivalent under stacked native
mutations, cross-host offsets, model/native interleaving, command
reinterpretation, new text nodes, and randomized schedules? The harvested
`webtest-dom-changes.ts` cases are the closure gate. Never expose the integer
ledger as public API.

Conditional routing: `plite-plan`; browser implementation/proof in
`@platejs/plite-react`.

### 6. Shared mapped view-store substrate

Donor public shape:

```ts
const points = PointSet.of([Decoration.Point.widget(position, widget)]);

const ranges = RangeSet.of([Decoration.Range.wrapper(from, to, shape)]);
```

Donor internal shape:

```ts
PointSet.map(change);
RangeSet.map(change);
findChangedRanges(previousState, previousLayers, nextState, nextLayers);
DecoIterator; // heap-merges point and range sources for rendering
```

Evidence:
`../wordgard/src/editor/decoration.ts:10-393`,
`../wordgard/src/editor/decoration.ts:580-1098`,
`../wordgard/src/editor/decoration.ts:1099-1429`.

Local comparison question: do Decoration, Annotation, and Widget remain
separate public concepts while sharing one private mapping, invalidation,
subscription, and lifecycle kernel? If yes, local architecture surpasses
Wordgard’s duplicated `PointSet`/`RangeSet`. If no, consolidate privately and
delete duplicate stores.

Conditional routing: `plite-plan`; no Plate public API unless a product layer
actually needs it.

### 7. Lazy history rebasing with versioned persistence

Donor public shape:

```ts
const state = GardState.create({
  config: [history()],
  doc,
});

const json = state.toJSON({ history: history.field });
```

Donor internal shape:

```ts
class Branch {
  readonly changes: ChangeSet; // inverse
  readonly effects: readonly Effect[];
  readonly mapped: { change: ChangeSet; doc: Plot.Doc } | null;
  readonly startSelection: GardSelection;
  readonly next: Branch | null;
}
```

Evidence:
`../wordgard/src/history/history.ts:37-143`,
`../wordgard/src/history/history.ts:171-259`.

Local comparison question: does Plite history lazily map excluded/remote edits,
persist selections/effects/changes through registered versioned codecs, and
reject stale schema revisions? If yes, local is stronger. If not, steal lazy
rebasing and add versioned validation; do not copy Wordgard’s live-identity
JSON.

Conditional routing: `plite-plan` with `@platejs/plite-history`.

### 8. Changed-region corrections integrated with collaboration

Donor public shape:

```ts
const correction = Correction.onContent(Table, (table) => {
  return repairTable(table);
});

const corrected = Correction.check(changes, changedDoc, [correction]);
```

Donor internal shape:

```ts
scanChanges(changes.sections, doc, corrections);
// Local transactions use extenders.
// Remote transactions skip local extenders.
// Central OT explicitly runs the same ordered corrections.
```

Evidence:
`../wordgard/src/state/correction.ts:13-190`,
`../wordgard/src/collab/collab.ts:127-208`,
`../wordgard/src/collab/collab.ts:245-274`.

Local comparison question: do construction fitting, normalizers, Yjs import,
and changed-target indexes share one canonical correction law without
full-document replacement or loops? If yes, Wordgard contributes cases only.
If not, fix the generic change/schema owner and delete broad normalizer scans.
Do not add central OT.

Conditional routing: `plite-plan`; Yjs adapter adoption belongs to its package;
table correction stays under `plate-plan`.

### 9. Extensible selections and Unicode/bidi movement

Donor public shape:

```ts
const CellSelectionType = GardSelection.define(
  "cell",
  CellSelection,
  toJSON,
  fromJSON
);
```

Donor internal shape:

```ts
abstract class GardSelection {
  readonly ranges;
  readonly replacementRange;
  readonly goalColumn?;
  abstract map(change, context, assoc?): GardSelection;
}
```

Evidence:
`../wordgard/src/state/selection.ts:20-433`,
`../wordgard/src/state/selection.ts:435-576`,
`../wordgard/src/state/textblock.ts:23-229`,
`../wordgard/src/table/cellselection.ts:93-240`.

Local comparison question: can Plite register structural selection kinds,
serialize them, map every constituent range/anchor, preserve affinity and goal
column, and let Plate tables own their geometry? If yes, keep local data
representation and harvest movement/selection laws only.

Conditional routing: `plite-plan` for selection protocol; `plate-plan` for
table selection behavior.

### 10. Table map and fitted grid paste

Donor public shape:

```ts
const map = TableMap.get(table, tableStart);
const transaction = insertCells(state, map, startCol, startRow, cells, "input");
```

Donor internal shape:

```ts
WeakMap<Plot, MapData>; // table-relative geometry
fitSlice -> ensureRectangular -> grow/clip -> isolate spans
-> compose canonical changes -> select inserted rectangle
```

Evidence:
`../wordgard/src/table/tablemap.ts:15-234`,
`../wordgard/src/table/tablepaste.ts:10-266`,
`../wordgard/src/table/cellselection.ts:93-240`.

Local comparison question: does Plate table already have one compiled grid
owner, stable cell identity, deterministic rectangular correction, and the
same paste law? If not, repair Plate table and delete duplicate table-grid or
paste helpers. Generic fitting remains Plite; table policy does not move down.

Conditional routing: `plate-plan`, with `plite-plan` only if a generic fitting
capability is genuinely missing.

### 11. Imperative tile renderer

Wordgard’s custom renderer is coherent and probably efficient for its target.
It is still a poor default extraction target: adopting it would create a
second renderer beside Plite React, duplicate DOM/input/selection ownership,
and prove nothing about Plate components or multi-root views
(`../wordgard/src/editor/tile.ts:13-1220`).

Verdict pressure: evidence-backed defer. Reopen only with a real non-React
consumer, an explicit parity target, and a benchmark showing the React owner
cannot meet the requirement without larger cost. Until then, mine renderer
identity and invalidation tests instead of architecture.

## Explicit Wordgard mechanism dispositions

These are donor-side dispositions. The parent audit still decides whether an
equivalent local mechanism is complete.

### Keep or mine

- Compact immutable change algebra and its apply/compose/transform/invert/map
  laws.
- Open structural slices and schema-aware fitting at construction.
- Compiled containment, defaults, wrapping, targets, and parser precedence.
- Atomic transactional configuration.
- Typed effects/annotations and effect mapping.
- Changed-region correction scanning.
- Extensible selections, affinity, goal column, active marks, and multi-range
  replacement.
- Grapheme, word, bidi, atom, barrier, and vertical-motion behavior.
- One bounded DOM phase scheduler with restart diagnostics.
- Optional plugin/provider fault isolation.
- Native DOM/model delta reconciliation and its new randomized test family.
- Incremental invalidation, stable DOM identity, and mapped point/range
  behavior.
- Lazy history mapping and invertible effect integration.
- Collaboration transform, acknowledgement, correction, and history-exclusion
  laws.
- Table-relative grid caching, rectangular correction, cell selection, and
  fitted grid paste behavior.

### Reject

- Nominal node, mark, schema, selection, field, effect, and command identity as
  serialized/public truth.
- A privileged single document root and public global integer positions.
- DOM shapes, `Element`, or `DocumentFragment` in Plite core.
- Automatic facet dependency tracking.
- Function-identity commands, direct invocation that bypasses handlers, and
  one callable type mixing specs with arbitrary side effects.
- Universal public transaction extenders/appenders when a typed owner can
  derive the behavior.
- Read-time mutation in `collab.sendableUpdate`.
- Central-authority OT as a second collaboration protocol beside Yjs.
- Unversioned persistence tied to live schema/selection descriptors.
- Product nodes, tables, menus, dialogs, uploads, resize policy, colors, and
  phrases inside Plite.
- Decoration-driven editability or atom semantics.
- A public mega-layer that merges widgets, points, ranges, annotations, and
  product rendering.

### Defer

- A first-party imperative Plite renderer.
- Wordgard’s custom bidi implementation as an implementation transplant.
- Strong global position caches without retention benchmarks.
- Central OT server helpers without a real non-Yjs consumer.

## Test-harvester closure

The independent MIT-licensed harvest is current at the audited commit:

- `docs/editor-test-harvester/wordgard/report.md`
- `docs/editor-test-harvester/wordgard/inventory.md`
- `docs/editor-test-harvester/wordgard/test-index.md`

Counts: 27/27 files classified, 24/24 runnable files indexed, 644/644 declared
`it(...)` call sites, 33 behavior families, zero uncertain. The newly added
`test/webtest-dom-changes.ts` family covers stacked native mutations,
cross-host offset correction, model/native interleaving, command
reinterpretation, new text hosts, and randomized dirty-DOM schedules.

This was a report-only harvest. It found current Plite/Plate owners but did not
rerun those suites, so “covered” is source evidence rather than fresh runtime
proof.

## Closure statement

Every tracked Wordgard file and every extracted declaration/member/re-export is
mapped or exactly excluded. Every one of the 73 semantic concepts is represented
above. The reference remained clean at the same full commit after inventory and
test harvest. No Wordgard source or product runtime was modified.

The parent audit must now:

1. independently reconcile each pressure point with live Plite/Plate,
   Lexical, and ProseMirror;
2. discard any lead whose material value does not beat adoption cost;
3. show complete current/proposed public and internal shapes only for surviving
   P0-P3 proposals;
4. attach exact deletion, adoption, proof, dependency, and
   `best-api`/`plite-plan`/`plate-plan` ownership to each survivor.
