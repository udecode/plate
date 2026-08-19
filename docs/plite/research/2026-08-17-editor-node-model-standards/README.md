# Editor node model standards

Status: complete

Question:
Should Plate copy MDAST or another editor node standard, and which current node
identities or additional fields are materially worse than established editor
practice?

Scope:
- Current Plate/Plite persisted node model.
- MDAST/UNIST, ProseMirror/Tiptap, Lexical, Slate, BlockNote, Portable Text,
  Editor.js, and Quill.
- Atomic decisions: discriminator, property placement, text/marks, headings,
  lists, code, media, tables, and document roots/versioning.

Stop rule:
- Eight authoritative source owners read.
- Every atomic decision has current evidence, reference evidence, verdict,
  priority, rejected alternatives, and next owner.
- Stop without implementation.

Expected promotion owner:
- `best-api` for public node shapes.
- `plate-plan` for accepted schema/migration adoption.
- `plite-plan` only if the broad substrate shape changes.

Current local evidence gap:
- Current code proves the Plate model and MDAST bridge, but not whether names
  such as `h1`/`lang` or flat list properties are the best cross-editor API.

Exclusions:
- Full editor architecture, operations, DOM, selection, history, React, and
  performance.
- Issue/test corpus harvesting.
- Overall editor superiority claims.
- Product implementation.

## Current verdict

Plate has the best base for Plate's actual job. Do not copy MDAST, ProseMirror,
Lexical, Portable Text, BlockNote, Editor.js, or Quill wholesale.

The base wins because it combines Slate's direct `{ type, children }` / `{ text
}` editing shape with a schema compiler, exact generated application unions,
feature-owned codecs, named roots, and document-level schema lineage.

Three current Plate API clusters are materially worse than the comparison set:

1. Six heading types and descriptors should become one `heading` node with a
   required `level: 1 | 2 | 3 | 4 | 5 | 6`.
2. `codeBlock.lang` should be `codeBlock.language`.
3. Table's `colSizes`, `background`, and overloaded `size` vocabulary should
   become semantic `columnWidths`, `backgroundColor`, `height`, and border
   `width`; cell import widths should normalize into table column widths rather
   than persist as `TableCell.size`.

There is no P0 node-model defect. These are P1 beta cleanup packets because
they materially reduce public ontology, generated unions, codecs, and caller
guesswork.

## Standards/proposals follow-up

Deeper GitHub history found the exact Slate proposal the user remembered:
[Slate #4378](https://github.com/ianstormtaylor/slate/issues/4378), “Modify Text
interface to be compatible with universal syntax tree (unist).” It proposed
renaming `text` to `value` and typing text nodes. It remains open and never
landed; the discussion discovered that configurable text keys would infect
every helper or create editor-global hidden policy.

Related Slate history independently considered and rejected MDAST-style nested
marks ([#1486](https://github.com/ianstormtaylor/slate/issues/1486)), attempted
Portable Text as the native value but hit required-child/selection invariants
([#3482](https://github.com/ianstormtaylor/slate/issues/3482)), proposed fragment
MIME/content types ([#1024](https://github.com/ianstormtaylor/slate/issues/1024)),
and rejected core-owned migrations ([#3272](https://github.com/ianstormtaylor/slate/issues/3272)).

The likely “universal block protocol” memory is
[HASH Block Protocol](https://github.com/blockprotocol/blockprotocol). It is a
real open standard for reusable block components and embedder communication,
but its rich-text Hook RFC deliberately lets each host keep bespoke rich-text
data. It is not an AST.

Seventeen candidate families were classified in
[shard 002](./shards/002-standards-proposals.md). No standard combines syntax
trees, extensible rich-text editing, block embedding, and collaboration. The
Plate verdict is reaffirmed: keep the native schema AST and use explicit
format adapters. Do not add `type: "text"`, rename `text` to `value`, or expose
a generic `toUnist` API.

## Source coverage

| Source owner | Verified commit | Model read | Useful pressure | Wholesale verdict |
|---|---|---|---|---|
| UNIST | `8b10b6113c1463113b879f423d605547e04efd0d` | Every node has `type`; parents have `children`; literals have `value` | Stable discriminator vocabulary | Reject as canonical Plate shape: text leaves would pay a permanent type/value tax |
| MDAST | `c034ec9ddb8ca2ab16de90d668433624bdd92179` | Markdown-specific UNIST nodes, wrapper marks, heading `depth`, nested lists | Semantic codec names | Keep only as Markdown interchange |
| ProseMirror model/basic schema | `6264de069d8439131e88f8ba06973551916184e4` / `6daea265c3983a04f272f510b99493868919d374` | JSON `{ type, attrs, content, marks, text }`; schema validates content and attrs | One `heading` with `level`; strong schema behavior model | Reject JSON shape; adapt heading model |
| Lexical | `dd5c41b13193efa9ab1574234d8593d2c9e4f988` | Typed serialized nodes with flat fields, children, numeric text format, per-node version | One heading type; semantic `language`, `backgroundColor`, width/height fields | Reject per-node versions and bitmasks; adapt field clarity |
| Slate | `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3` | Open element children and text leaves | Confirms Plate's direct editing base | Plate already improves it with schema compilation |
| BlockNote | `1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163` | `{ id, type, props, content, children }`, typed block schema | `heading.level`, `codeBlock.language`, app-friendly types | Reject triple container and block-only limits; adapt names |
| Portable Text | `d17f7289b7063d805c7e39d8620f5e89029d395e` | `_type: block`, spans, marks arrays, `markDefs`, flat lists | Confirms flat lists and portable annotations are viable | Reject as canonical Plate ontology |
| Editor.js | `5f45dabbe5690b7033b2f9047d3985add5045fdd` | `{ id?, type, data, tunes? }[]` | Simple tool output | Reject: no recursive typed rich-text grammar |
| Quill | `539cbffd0a13b18e9c65eb84dd35e6596e403158` | Linear Delta insert/retain/delete operations and attributes | Strong change/OT representation | Reject as canonical tree; not a node API |

Every reference checkout was clean and its commit was captured before source
reading. Dirty pre-existing Slate and Portable Text sibling directories were
not used; clean official clones were created separately.

## Atomic decision matrix

| ID | Decision | Current Plate | External evidence | Verdict | Priority / owner |
|---|---|---|---|---|---|
| `NODE-01` | Element discriminator and children | Elements use `type` and `children`; text uses `text` | Slate matches; UNIST/MDAST/Lexical type text too | Keep Plate. Typed text adds data and authoring noise without a current job | Keep |
| `NODE-02` | Additional field placement | Schema-owned fields are flat on nodes | MDAST/Lexical/Slate are flat; ProseMirror/BlockNote/Editor.js add attrs/props/data bags | Keep flat fields. Schema handles already solve ownership and collisions | Keep |
| `NODE-03` | Text marks | Boolean/string properties live on text leaves | MDAST wrappers, ProseMirror mark arrays, Portable Text refs, Lexical bitmasks, BlockNote styles all add another representation layer | Keep leaf properties and `script: "sub" | "sup"` | Keep |
| `NODE-04` | Headings | Six types/plugins: `h1`…`h6`; six near-identical codec declarations | ProseMirror and BlockNote use `heading + level`; Slate typed examples use level; Lexical uses one heading type plus tag; only MDAST calls it depth | One `heading` type and descriptor with required numeric `level`; do not use MDAST `depth` | P1 `best-api -> plate-plan` |
| `NODE-05` | Code blocks | Editable `codeBlock -> codeLine -> Text`, property `lang` | Lexical and BlockNote keep editable element nodes and persist `language`; Portable Text also says `language`; MDAST alone says `lang` | Keep structure; rename `lang` to `language`; map to MDAST `lang` only in codec | P1 `best-api -> plate-plan` |
| `NODE-06` | Lists | Flat semantic properties on ordinary blocks: `listType`, `listStyle`, `indent`, `checked`, `listStart`, and `listRestart` | Portable Text and Quill prove flat line/block list metadata; MDAST/ProseMirror/Lexical use structural lists; BlockNote uses list block types and nested children | Keep the flat representation. Make `listStart` conditional author intent, `listRestart` a forced boundary, and derive display ordinals at runtime | Accepted `best-api -> plate-plan` |
| `NODE-07` | Media and captions | Media has `url`; editable caption is direct `children`; image persists `naturalWidth`/`naturalHeight` separately from rendered `width` | MDAST images cannot own editable captions; Lexical and BlockNote use rendered width; WHATWG and CSS Images call image-owned geometry natural dimensions | Keep direct children and `url`. Keep rendered `width` separate from source-image `naturalWidth`/`naturalHeight` | Accepted `best-api -> plate-plan` |
| `NODE-08` | Tables | Strong table/row/cell grammar; `colSizes`, `background`, cell/row/border `size`, boolean `header` | Lexical and BlockNote use explicit widths, backgroundColor, row/column header metadata; MDAST cells are too weak for rich blocks | Keep grammar and `header`; rename table-owned fields, remove canonical cell size after import normalization | P1 `best-api -> plate-plan` |
| `NODE-09` | Identity and versions | Runtime `NodeKey`; optional persisted element `id`; document-level schema id/version/fingerprint | BlockNote/Editor.js require block IDs; Lexical persists per-node versions; MDAST/Slate provide no migration lineage | Keep Plate. IDs should remain opt-in and versions belong to the complete document | Keep |
| `NODE-10` | Document/root shape | Primary children, named roots, metadata, persisted schema envelope | External formats have one root/list; none cover Plate's independently addressed roots and migration law | Keep Plate-owned document envelope; codecs translate only the primary Markdown-compatible content | Keep |

This is a narrow node-model comparison. It does not claim Plate is the best
editor architecture overall.

## Facts

- Current heading ownership spans 84 package, registry, example, and docs files.
  The core source is six nearly duplicated descriptors in
  `packages/basic-nodes/src/lib/BaseHeadingPlugins.ts`.
- Current `best-api`, `plate-plugin-creator`, and `plate-next` doctrine
  explicitly requires distinct `PLUGINS.h1` through `PLUGINS.h6`. That law is
  contradicted by the source evidence: heading rank is one capability parameter,
  not six independently substitutable capabilities.
- Current `lang` usage spans 15 Code Block and registry files. Internal variables,
  UI copy, HTML attributes, and both Lexical and BlockNote already call the
  concept `language`; only persisted Plate and external MDAST use `lang`.
- Current Table field vocabulary spans 24 package/registry files. The codec
  writes `TableCell.size` as CSS width and `TableRow.size` as CSS height;
  borders use the same `size` name for border width. `TableElement.colSizes`
  is the actively maintained column-width source.
- Image upload replacement reads DOM `naturalWidth` and `naturalHeight`.
  Persisted natural geometry is used at the HTML boundary while rendered
  `width` remains resize-owned.
- Lexical's serialized base comment explicitly says its numeric per-node
  `version` is “not generally recommended for use.” Plate's document schema
  envelope avoids that trap.

## Inferences

- The strongest external convergence is not MDAST. It is one semantic heading
  type with a level-like field. MDAST's `depth` is format vocabulary; `level`
  is the clearer editor/domain term.
- Plate's flat additional fields are not under-designed. Combined with compiled
  schema ownership, they provide better human and agent ergonomics than
  `attrs`, `props`, or `data` bags.
- Separate syntax and editor ASTs are an advantage. First-class Markdown means
  exact typed codecs and loss policy, not identical storage.
- Table's problem is vocabulary, not structure. Copying MDAST tables would
  regress rich-cell editing.
- Media's `initial*` names smell wrong, but source evidence does not yet prove
  whether the data is intrinsic size, imported HTML size, or expendable
  round-trip metadata. A confident rename today would be theater.

## Recommendation

### P1: one Heading owner

Ideal persisted shape:

```ts
type HeadingElement = {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: readonly InlineContent[];
};
```

Ideal public path:

```ts
import { BaseHeadingPlugin } from '@platejs/basic-nodes';

editor.plugin(BaseHeadingPlugin).update.toggle({ level: 2 });
```

The authored `toggle` replaces the synthesized no-input text-block toggle.
One schema, HTML codec, Markdown codec, component family, and plugin portal
replace six. Canonical output requires `level`; construction may default to 1.
The v54 migration maps `h1`…`h6` to `heading` plus `level`.

### P1: code language

```ts
type CodeBlockElement = {
  type: 'codeBlock';
  language?: string;
  children: readonly CodeLineElement[];
};
```

Keep MDAST's external `lang` literal inside the codec. Do not let the Markdown
format choose the editor's public domain name.

### P1: Table vocabulary

```ts
type TableElement = {
  type: 'table';
  columnWidths?: readonly number[];
  children: readonly TableRowElement[];
};

type TableRowElement = {
  type: 'tableRow';
  height?: number;
  children: readonly TableCellElement[];
};

type TableCellElement = {
  type: 'tableCell';
  backgroundColor?: string;
  header?: boolean;
  colSpan?: number;
  rowSpan?: number;
  borders?: Partial<Record<TableSide, {
    color?: string;
    width?: number;
    style?: string;
  }>>;
  children: readonly BlockContent[];
};
```

Normalize imported per-cell widths into `TableElement.columnWidths`; do not
retain `TableCell.size` as a second width source. Preserve `header` until a real
row/column-scope user job earns more state.

### Keep without redesign

- `type` discriminator on elements.
- `{ text }` leaves without a redundant `type: 'text'`.
- `children` rather than ProseMirror `content` or BlockNote's split
  `content`/`children` model.
- Flat schema-owned properties rather than `attrs`/`props`/`data`.
- Leaf mark properties, including the mutually exclusive `script` enum.
- Editable `codeBlock`/`codeLine` structure.
- Flat list annotations.
- Direct editable media-caption children.
- Table/row/cell structural grammar and boolean header identity.
- Optional persisted element IDs and document-level schema lineage.
- MDAST/UNIST exclusively as the Markdown interchange tree.

## Rejected alternatives

- Copy MDAST: wrong runtime job; typed text/value and wrapper marks regress
  editing ergonomics and rich product nodes.
- Use MDAST `depth`: Markdown-specific word; `level` wins across editor-facing
  schemas.
- Copy ProseMirror JSON: schema discipline is excellent, but `attrs`, `content`,
  and mark objects are unnecessary public ceremony for Plate.
- Copy Lexical JSON: per-node version and numeric format fields optimize its
  class runtime, not durable human-readable data.
- Copy Portable Text: `_type`, spans, mark reference arrays, and `markDefs`
  replace direct structural ownership with indirection.
- Copy BlockNote: ergonomic at block API level, but `props`, `content`, and
  structural `children` fragment one node and narrow custom grammar.
- Copy Editor.js: tool data bags are not a rich-text tree.
- Copy Quill Delta: excellent operational representation, wrong canonical
  authoring tree.

## Promotion packets

| Packet | Verdict | Primary owner | Dependency | Required proof before acceptance |
|---|---|---|---|---|
| `NODE-P1-HEADING` | Replace six heading identities with `heading.level` | `best-api`, then `plate-plan` | Basic Nodes, Markdown, HTML, registry/docs, v54 migration | API inference, schema generation, h1-h6 migration, codec round trips, browser heading behavior |
| `NODE-P1-CODE` | Rename `lang` to `language` | `best-api`, then `plate-plan` | Code Block, Markdown, registry, v54 migration | Source audit, HTML/MDAST round trips, highlighter/react proof |
| `NODE-P1-TABLE` | Semantic Table width/height/color field cleanup | `best-api`, then `plate-plan` | Table codec/runtime/registry, v54 migration | Import normalization, resize, merge, clipboard, HTML, generated types, browser proof |
| `NODE-P2-MEDIA` | Audit and then delete or rename `initial*` dimensions | `best-api` | Media owner | Prove intrinsic/imported/runtime meaning before selecting a replacement |

No Plite substrate change is recommended. All material packets belong to Plate
feature schemas and the existing document migration chain.

Because this pass is read-only, doctrine is not edited. Accepting
`NODE-P1-HEADING` requires `best-api repair`: update the owning rule, the
smallest Plate Vision row, `plate-plugin-creator`, and `plate-next`; regenerate
mirrors; then prove zero distinct-heading teaching remains outside migration
artifacts.

## Closeout counts

- Repositories/source owners searched: 10 external plus current Plate/Plite.
- Repositories deeply read: 10 external plus 5 current Plate feature owners.
- Issues/PRs read: 0; source settled the contract.
- Atomic decisions: 10.
- Leads kept: 6.
- Leads promoted: 5 entries, including three P1 changes, one P2 evidence gate,
  and one no-code base decision.
- Duplicate leads merged: 2 convergence groups.
- Rejected wholesale models: 7 plus MDAST `depth`.
- Implementation changes: 0.
- Next research shard: none; further source sampling would not change the
  decision. Next action is user acceptance or rejection of the three P1 packets.
- Workflow slowdowns: existing dirty Slate and Portable Text checkouts required
  clean official clones; no source was blocked.
- Needs user attention: whether to reopen the completed v54 plan for the three
  P1 schema changes.
- Follow-up standards shard: 17 families, 14 exact Slate threads, 100 recent
  discussions, and 4 new source clones; Slate #4378 identified as the likely
  remembered proposal. No new API packet was promoted.
