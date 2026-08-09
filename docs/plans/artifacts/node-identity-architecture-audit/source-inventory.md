# Node identity source inventory

This inventory is bounded to runtime node identity, structural positions,
live anchors, persisted document identity, lookup, and lifecycle behavior. It
does not compare the editors overall.

## Provenance

| Reference             | Branch / upstream          | Audited commit                             | Working tree |
| --------------------- | -------------------------- | ------------------------------------------ | ------------ |
| Lexical               | `main` / `origin/main`     | `dd5c41b13193efa9ab1574234d8593d2c9e4f988` | clean        |
| ProseMirror wrapper   | `master` / `origin/master` | `c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc` | clean        |
| prosemirror-model     | `main` / `origin/main`     | `bc912ea0ff8ac935c7f1dc3cf029cd0b6ecdda97` | clean        |
| prosemirror-state     | `main` / `origin/main`     | `57d4a96286ca972125a18a56ecd6d2b00927de30` | clean        |
| prosemirror-transform | `main` / `origin/main`     | `8fecfa62dc8c816ef3ddd54427e6585418720f63` | clean        |
| prosemirror-view      | `main` / `origin/main`     | `c752c6ef7225199f73cb433dd3179e7d69b840d8` | clean        |
| Wordgard              | `main` / `origin/main`     | `c715d4ded8fc780f52c13206e589ea31e4148dd4` | clean        |

The commits and clean-state checks were read from each local checkout before
the comparison. They must be checked again before closeout.

## Current Plite contract

### Runtime identity

- `packages/plite/src/utils/runtime-ids.ts:4-18` owns editor-scoped opaque IDs
  with weak node ownership and a per-editor counter.
- `packages/plite/src/utils/runtime-ids.ts:97-158` creates, reuses, and inherits
  identity across immutable node copies.
- `packages/plite/src/utils/runtime-ids.ts:186-197` seeds every descendant. It
  includes elements, inline elements, and text nodes.
- `packages/plite/src/core/public-state.ts:7188-7217` seeds the primary value and
  every named root at editor initialization.
- `packages/plite/src/interfaces/editor.ts:1496-1505` exposes the lazy
  bidirectional `RuntimeId` / `Path` snapshot index. `RuntimeId` is currently an
  unbranded `string`.

### Lookup and lifecycle

- `packages/plite/src/core/snapshot-index.ts:107-252` builds a lazy, injective
  `RuntimeId` to `Path` index. A point lookup need not enumerate the whole tree.
- `packages/plite/src/core/snapshot-index.ts:856-1095` maps identities through
  canonical document changes, rejects invalid candidates, preserves semantic
  continuations, and assigns fresh IDs to new nodes.
- `packages/plite/src/core/snapshot-index.ts:1207-1627` keeps mapped indexes
  sparse, binds prepared slices lazily, and makes removed identities resolve to
  `null`.
- `packages/plite/src/core/public-state.ts:947-976` resolves a stale live node
  object through its runtime ID. `packages/plite/src/interfaces/editor.ts:239-240`
  already includes live descendants in `NodeTarget`.
- `packages/plite/test/transforms-contract.ts:127-151` proves descendant
  identity survives immutable replacement and movement.
- `packages/plite/test/transforms-contract.ts:735-755` proves stale node objects
  remain valid mutation targets.
- `packages/plite/test/document-change.test.ts:892-934` proves a 10,000-block
  index stays sparse until enumeration.
- `packages/plite/test/snapshot-contract.ts:2907-3012` proves move preservation
  and index injectivity. `packages/plite/test/snapshot-contract.ts:3280-3311`
  proves merge survival and removal behavior.
- `packages/plite/test/accessor-transaction.test.ts:469-482` proves IDs are
  unique across roots owned by one editor and rejected by the wrong root view.
  Separate editor instances remain separate identity domains, just as their
  paths do. A public `RuntimeId` target must therefore stay editor-scoped.

### Paths, points, and ranges

- `packages/plite/src/interfaces/editor.ts:1353-1374` exposes `editor.anchor` as
  a first-class live-location API.
- `packages/plite/src/core/anchor.ts:36-65` defines path, point, and range
  anchors with explicit association and deletion policy.
- `packages/plite/src/core/anchor.ts:162-176` captures both canonical position
  and runtime identity. `packages/plite/src/core/anchor.ts:274-330` reconciles
  canonical mapping with the live runtime path.
- `packages/plite/test/anchor-contract.ts:76-161` proves text split affinity.
  `packages/plite/test/anchor-contract.ts:195-206` proves drop-on-delete, and
  `packages/plite/test/anchor-contract.ts:250-275` proves path/range movement.

### Text identity consequence

- `packages/plite/src/interfaces/text.ts:136-149` treats every property other
  than `text` as part of a text leaf's merge identity.
- `packages/plite/test/snapshot-contract.ts:1097-1139` and
  `packages/plite/test/snapshot-contract.ts:3015-3043` prove adjacent compatible
  text leaves merge.

A unique persisted `id` on each text leaf would make otherwise compatible
leaves unequal. It would turn split/merge implementation fragments into durable
application entities. Runtime IDs and anchors already cover the legitimate
session and range-identity jobs without corrupting text normalization.

## Current Plate contract

### Persisted NodeId plugin

- `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts:31-45` declares a
  persisted `id: string | number` property for elements only.
- `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts:47-101` exposes seven
  policy knobs: insert override behavior, inline filtering, text filtering,
  initial-value mode, duplicate-scan reporting, paste reuse, generator, and a
  matcher.
- `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts:124-143` can target text
  nodes when `filterText` is false even though the schema declares only an
  element property. That is a schema/runtime contradiction.
- `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts:167-230` scans the
  document for duplicate inserted IDs and recognizes the hidden `_id` escape
  property.
- `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts:687-695` defaults to
  block-only IDs through `filterInline: true`, excludes text, and uses
  `nanoid(10)`.
- `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts:772-868` rewrites
  inserted and split nodes after structural transactions.
- `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts:870-926` mutates initial
  document data according to an `if-needed` boundary heuristic.
- `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts:929-930` exports a
  required-presence `IdElement`, but
  `packages/core/src/lib/plugins/node-id/NodeIdPlugin.spec.tsx:308-357` proves
  legal values can contain elements without IDs. The alias overstates runtime
  presence.
- `packages/core/src/lib/plugins/getCorePlugins.ts:20-62` installs the plugin in
  every Base editor unless explicitly disabled.

### Consumer inventory

The direct feature scan found the following distinct jobs:

| Job                            | Representative source                                                   | Identity that actually fits                             |
| ------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| Block selection set and lookup | `packages/selection/src/react/BlockSelectionPlugin.tsx:139-159`         | Runtime ID                                              |
| Drag source/drop target        | `packages/dnd/src/useDndNode.ts:433-450`                                | Runtime ID plus owning editor for cross-editor transfer |
| Toggle open/closed UI state    | `packages/toggle/src/react/TogglePlugin.tsx:148-153`                    | Runtime ID                                              |
| AI temporary replacement set   | `packages/ai/src/react/AIChatPlugin.ts:1327-1339`                       | Runtime ID or live node target                          |
| Image preview selection        | `packages/media/src/react/image/useImage.ts:44-77`                      | Runtime ID                                              |
| Table memo/index key           | `packages/table/src/lib/internal/grid.ts:68-80`                         | Node object or Runtime ID                               |
| React/DOM reconciliation       | `packages/plite-react/src/components/plite-element.tsx:67-85`           | Runtime ID, already implemented                         |
| Markdown block-ID interchange  | `packages/markdown/src/lib/serializer/convertNodesSerialize.ts:116-123` | Persisted application ID                                |
| Heading/TOC link target        | `packages/toc/src/lib/BaseTocPlugin.ts:62-79`                           | Persisted application ID                                |

`packages/plite-react/src/components/plite-element.tsx:67-85` already writes
`data-plite-runtime-id`. The additional `data-block-id` projection in
`packages/core/src/react/components/plate-nodes.tsx:134-150` is therefore not
needed for editor reconciliation. It is an optional persisted application
projection and should not make NodeId a Core dependency.

### Schema lifecycle gaps exposed by identity

- `packages/plite/src/interfaces/schema.ts:166-185` lets properties declare
  split and type-change behavior, but no copy behavior. The NodeId plugin
  consequently deep-clones inserted trees and owns paste/duplicate policy.
- `packages/plite/src/interfaces/schema.ts:37-75` distinguishes required and
  defaulted values, and `packages/plite/src/interfaces/schema.ts:1290-1338`
  already distinguishes canonical output from construction input. It has no
  declaration for a generated nondeterministic default such as an ID.
- `packages/plite/src/interfaces/schema.ts:484-503` permits a closed
  application override to change only a property's target, not its persisted
  key. A semantic property portal therefore cannot yet support an
  application-owned physical key such as `blockId` without redefining the
  plugin.

These are generic schema gaps. Solving them once is smaller than retaining a
large identity-specific clone, scan, and raw-key implementation in Plate.

## Lexical

- `../lexical/packages/lexical/src/LexicalUtils.ts:150-158` allocates realm-local
  counter keys.
- `../lexical/packages/lexical/src/LexicalUtils.ts:377-408` assigns every node a
  key and inserts it into the active state's node map.
- `../lexical/packages/lexical/src/LexicalUtils.ts:639-653` provides O(1)
  `$getNodeByKey` lookup.
- `../lexical/packages/lexical/src/LexicalNode.ts:714-731` stores key-linked
  parent and sibling identity on every node. `LexicalNode.ts:1005-1011` states
  that the key is stable across copies, and `LexicalNode.ts:1384-1402` resolves
  stale objects to the latest copy.
- `../lexical/packages/lexical/src/LexicalEditorState.ts:133-179` makes the node
  map part of each immutable editor state.
- `../lexical/packages/lexical/src/LexicalGC.ts:115-145` removes detached keys.
- `../lexical/packages/lexical/src/LexicalNode.ts:88-110` excludes runtime keys
  from serialized nodes. `../lexical/packages/lexical-yjs/src/Utils.ts:65-79`
  also excludes `__key` from collaborative properties, while
  `Utils.ts:450-488` allocates a local Lexical node/key for remote shared
  content.

Lexical's strong idea is mandatory runtime identity and direct lookup, not
persisted UUIDs. Its linked key graph is not the right storage model for
Plite's JSON-native immutable tree.

Lexical's counter is realm-global at
`../lexical/packages/lexical/src/LexicalUtils.ts:150-158`. Plite should not copy
that detail. Plite renders runtime IDs into DOM bindings at
`packages/plite-react/src/components/plite-element.tsx:67-85`; retaining the
existing editor-scoped deterministic allocation avoids turning a local lookup
optimization into a global or persisted identity promise.

## ProseMirror

- `../prosemirror/model/src/node.ts:20-54` defines immutable nodes by type,
  attrs, content, and marks, with no intrinsic instance ID.
- `../prosemirror/model/src/node.ts:318-329` serializes only type, schema attrs,
  content, and marks. An application ID is therefore an ordinary schema attr,
  whose law is owned by `../prosemirror/model/src/schema.ts:370-400` and
  `schema.ts:546-562`.
- `../prosemirror/transform/src/map.ts:1-16` defines association and deletion
  semantics. `map.ts:68-115` maps positions through one step, and
  `map.ts:166-183` plus `map.ts:251-283` compose maps across rebase/history.
- `../prosemirror/state/src/selection.ts:241-261` maps selections and bookmarks.
  `selection.ts:382-391` degrades a deleted node bookmark to a nearby text
  selection.
- `../prosemirror/view/src/decoration.ts:32-88` maps and drops point, inline, and
  node decorations. `decoration.ts:332-358` maps whole decoration sets.
- `../prosemirror/view/src/index.ts:725-750` gives a NodeView a live `getPos`
  function rather than an intrinsic node ID.

ProseMirror's strong idea is precise position mapping for structural and text
locations. It deliberately leaves durable identity to the schema/application.

## Wordgard

- `../wordgard/src/doc/node.ts:23-25` models immutable plots and leaves without
  instance IDs. `node.ts:234-240` serializes type, parameter, marks, and content.
- `../wordgard/src/doc/pos.ts:5-25` resolves numeric positions into parent,
  index, and text-offset context. `pos.ts:127-157` resolves positions and node
  starts.
- `../wordgard/src/doc/change.ts:115-160` owns compact canonical changes.
  `change.ts:316-352` maps positions with association and deletion tracking.
- `../wordgard/src/state/selection.ts:249-264` maps text selections, while
  `selection.ts:325-353` maps node selections and falls back near deletion.
- `../wordgard/src/editor/decoration.ts:582-624` maps point sets and removes
  deleted points.
- `../wordgard/src/doc/node.ts:973-985` merges adjacent text leaves with the
  same marks, reinforcing that leaf instances are not durable entities.

Wordgard's strong idea is the same as ProseMirror's at a smaller scale: mapped
positions for ephemeral locations, with no automatic persisted node identity.

## Source scans and prior candidates

Bounded searches for built-in generated or persisted node IDs in ProseMirror
and Wordgard found no owner beyond user-defined schema attributes/parameters.
Lexical's serialized-node and Yjs exclusion lists explicitly omit its runtime
key. These absence claims are limited to the recorded source units above.

The prior Lexical matrix contains no prior candidate for `LX-CORE-NODE`. The
prior ProseMirror audit contains no durable P0-P3 candidate for node identity.
The current Wordgard audit has three relevant candidates:

- `OLD-WG-DOC-006`: reject global token offsets as Plate's public location API.
- `OLD-WG-DOC-011`: keep Plite's canonical position mapping.
- `OLD-WG-VIEW-005B`: keep Plite's mapped point/range store architecture.

They are reconciled in the Wordgard matrix rather than silently inherited.

The Lexical and Wordgard test/issue harvest commits match their audited source
commits in `docs/editor-audits/index.json`. The recorded ProseMirror wrapper and
model/state/transform/view test-harvest commits also match the current heads.
Its issue ledger was last checked on 2026-07-25, so this narrow pass cites
current source tests but makes no fresh issue-corpus completeness claim.

## Fact, inference, recommendation

- Fact: Plite already assigns private runtime IDs to every element and text
  node, keeps a lazy bidirectional index, and maps paths/points/ranges.
- Fact: Plate separately persists `id` through a default Core plugin and uses
  it for both session-only and durable jobs.
- Fact: Lexical does not serialize runtime keys; ProseMirror and Wordgard do
  not provide intrinsic node IDs.
- Inference: keeping NodeId in Core duplicates Plite identity for most current
  consumers and forces persistence cost onto users who do not need it.
- Inference: a copied or split unique property is a schema lifecycle concern,
  not a reason for one plugin to clone trees and rescan the whole document.
- Recommendation: keep and slightly harden the Plite runtime contract; remove
  automatic persisted IDs from Core; migrate session consumers to RuntimeId;
  keep durable element IDs as an explicit Plate/application capability; and
  add one generic schema copy policy so unique properties can declare that a
  copied node needs a fresh value.
