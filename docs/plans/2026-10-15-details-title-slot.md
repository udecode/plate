---
review_scopes: [callout]
review_basis: [2026-10-04-callout-audit]
verdict: pursue
work_kind: implementation
review_commit: b1e70bb257d7a33c3a2f6160759a8ecb79e44500
review_inputs: [packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts, packages/platejs/src/features/details/lib/BaseDetailsPlugin.spec.ts, packages/platejs/src/features/details/lib/BaseDetailsPlugin.authored-tree.spec.ts, packages/platejs/src/features/details/lib/BaseDetailsCommands.spec.ts, packages/platejs/src/features/details/lib/BaseDetailsConversion.spec.ts, packages/platejs/src/react/plugins/paragraph/ParagraphPlugin.tsx, packages/platejs/src/react/editor/TPlateEditorCore.spec.ts, packages/platejs/src/react/features/details/DetailsPlugin.tsx, packages/platejs/src/ai/react/aiOutputLanding.internal.ts, packages/platejs/src/ai/react/AIChatPlugin.ts, packages/platejs/src/ai/react/AIChatPlugin.details.spec.ts, packages/platejs/src/internal/plugin/resolvePlugins.ts, packages/platejs/src/lib/editor/pluginRuntimeTypes.ts, packages/platejs/src/features/basic-nodes/lib/BaseBlockPlugins.ts, packages/platejs/src/features/layout/lib/BaseColumnPlugin.ts, packages/platejs/src/migrations/migratePlateV54Ast.internal.ts, packages/platejs/type-tests/plate-editor-value-contracts.ts, packages/plitejs/src/core/editor-schema.ts, packages/plitejs/src/core/content-completion.ts, packages/plitejs/src/core/representation.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts, packages/plitejs/src/transforms-node/split-nodes.ts, packages/plitejs/src/transforms-node/set-nodes.ts, packages/plitejs/src/transforms-node/wrap-nodes.ts, packages/plitejs/src/transforms-node/unwrap-nodes.ts, packages/plitejs/src/dom/plugin/data-transfer-format.ts, packages/plitejs/src/internal/index.ts, packages/plitejs/test/slice-fit-contract.test.ts, packages/plitejs/test/transforms-contract.ts, packages/plitejs/test/dom/data-transfer-format.test.ts, apps/www/src/app/(app)/examples/plite/_examples/forced-layout.tsx, apps/www/src/registry/components/editor/block-menu.tsx, apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx, docs/vision/plite.md, docs/vision/plate.md, content/docs/(plugins)/(elements)/details.mdx, content/docs/(plugins)/(elements)/blockquote.mdx, docs/editor-behavior/markdown-editing-spec.md, docs/research/review-records/2026-10-04-callout-audit.json, docs/plans/2026-10-13-pr-5165-redo.md]
review_upstreams: ['../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../prosemirror-transform@662b7a937bafde19b7e2a83241dbc8888e257c89', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../slate@945a484df2497e4c448b33f417b0de2a49840032']
---

# Details: the schema owns the title slot

Status: executed: the patch sits uncommitted in your checkout and waits on your commit
Playbook: plan

Details keeps its title first with two corrections and a drag veto. `docs/vision/plite.md` lines 126 to 128 put that rule in the compiled content grammar, including construction and fitting, and forbid corrections that keep a second document shape. This plan moves the title slot into the grammar with `schema.content.prefix` and deletes the Plate code the grammar makes redundant. The first plan panel and the lead's probes then showed that Plite itself copies a block's type into the next position on Enter, paste and Duplicate, and that a paste ending at a title splits the Details. So the plan also teaches Plite to build each new block with the type its position admits, and fixes that paste landing. It continues the Pursue verdict this page held, after two `architect` rounds on three models. Its execution playbook is Build.

## Brief

### What will change?

It's built and waiting in your checkout. Typing three dashes, or picking Quote, Callout or Columns, on a title now does nothing, and Enter, paste, Duplicate and AI still work there. The Close says what differs from the plan and what review found.

### What could go wrong?

Saved Details whose title isn't first no longer load, but no released Plate wrote those. I couldn't click the menus, Duplicate or paste in the browser, so only tests cover them. Four smaller review issues wait as suggested tasks.

## Teach

A Details block is a collapsible section. Its first child, the Summary, is the title that stays visible. The blocks after it are the body, which hides when the section closes.

Today the schema lets any block sit anywhere, and two cleanup rules put a Summary back in front after each edit. So typing three dashes in a title turns it into a divider, the cleanup adds an empty title above it, and the divider lands in the body.

The change writes "one Summary, first" into the schema, and the editor checks each block change against it before writing, so the divider is refused. When Enter, paste or Duplicate builds a new block after the title, the editor gives it the type that position allows, a paragraph, instead of copying the title. The cleanup rules and the drag guard then have nothing left to do, so they go.

## Public API

The Details schema now says the title comes first, instead of cleanup rules fixing it after each edit.

```ts before
// packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts
schema: ({ plugins }) => ({
  element: {
    content: schema.content.any(
      [
        schema.content.type('summary').allowed,
        plugins.blockContent().allowed,
      ],
      { default: { type: 'summary' }, min: 1 }
    ),
  },
}),
```

```ts after
// packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts
schema: ({ plugins }) => ({
  element: {
    content: schema.content.prefix(
      [{ element: BaseDetailsSummaryPlugin }],
      plugins.blockContent({ default: BaseParagraphPlugin })
    ),
  },
}),
```

The paragraph shortcut stops looking for a Summary. It drops any heading level first, then asks for Paragraph, which the schema refuses on a title, so a title loses its level and stays a title.

```tsx before
// packages/platejs/src/react/plugins/paragraph/ParagraphPlugin.tsx
handler: ({ editor }) => {
  const summaryType = getCompiledPlateModelBinding(
    editor,
    PLUGINS.detailsSummary
  )?.elementType;

  if (
    editor.read.nodes.blocks().some(([node]) => node.type === summaryType)
  ) {
    editor.update.blocks.reset({ unset: 'level' });
  } else {
    editor.update.blocks.toggle({
      type: editor.plugin(BaseParagraphPlugin).schema.type,
    });
  }
},
```

```tsx after
// packages/platejs/src/react/plugins/paragraph/ParagraphPlugin.tsx
handler: ({ editor }) => {
  editor.update((tx) => {
    tx.blocks.reset({ unset: 'level' });
    tx.blocks.toggle({ type: editor.plugin(BaseParagraphPlugin).schema.type });
  });
},
```

The Quote toggle now tells its caller whether it changed anything, so a menu can skip its other edits when Quote is refused.

```tsx before
// content/docs/(plugins)/(elements)/blockquote.mdx
editor.plugin(BlockquotePlugin).update.toggle();
```

```tsx after
// content/docs/(plugins)/(elements)/blockquote.mdx
const quoted = editor.plugin(BlockquotePlugin).update.toggle();
```

## Document shape

Loading a Details with no Summary now adds an empty one in front (`probe/proto-trim-a1.log`, `load [P]`). Today it loads without a title until an edit runs the cleanup. The renderer reads the result.

```json before
{ "type": "details", "children": [
  { "type": "paragraph", "children": [{ "text": "B" }] }
] }
```

```json after
{ "type": "details", "children": [
  { "type": "summary", "children": [{ "text": "" }] },
  { "type": "paragraph", "children": [{ "text": "B" }] }
] }
```

A suggestion that deletes a title now strikes only its text and keeps the Summary. Today it marks the whole Summary deleted and adds a second struck one after it. The review UI reads this shape. Accepting gives an empty title and rejecting gives the title back, in both.

```json before
{ "type": "details", "children": [
  { "type": "summary", "authored": ["delete"], "children": [{ "text": "Title", "authored": ["delete"] }] },
  { "type": "summary", "authored": ["delete"], "children": [{ "text": "", "authored": ["delete"] }] },
  { "type": "paragraph", "children": [{ "text": "Body" }] }
] }
```

```json after
{ "type": "details", "children": [
  { "type": "summary", "children": [{ "text": "Title", "authored": ["delete"] }] },
  { "type": "paragraph", "children": [{ "text": "Body" }] }
] }
```

Pasting two paragraphs at the end of a title now keeps them in the same section. Today the paste splits the Details in two, and the second half gets an empty title (`probe/slice-title-base-a1.log`, `probe/slice-title-proto2-a3.log`).

```json before
[
  { "type": "details", "children": [
    { "type": "summary", "children": [{ "text": "TitleX" }] },
    { "type": "paragraph", "children": [{ "text": "Y" }] }
  ] },
  { "type": "details", "children": [
    { "type": "summary", "children": [{ "text": "" }] },
    { "type": "paragraph", "children": [{ "text": "Body" }] }
  ] }
]
```

```json after
[
  { "type": "details", "children": [
    { "type": "summary", "children": [{ "text": "TitleX" }] },
    { "type": "paragraph", "children": [{ "text": "Y" }] },
    { "type": "paragraph", "children": [{ "text": "Body" }] }
  ] }
]
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| The title slot, its admission and its completion | Plite grammar, declared by Plate | `platejs` (`features/details`) | `docs/vision/plite.md` lines 126 to 128 put required positions in the compiled grammar |
| The type of a block that a split, a pasted line, a duplicate or a paste over picked blocks builds for a sibling position | Plite schema, one read every producer calls | `plitejs` (`core/editor-schema`, `transforms-node/split-nodes`, `dom/plugin/data-transfer-format`, `core/public-state`) | Construction belongs to the grammar; `docs/vision/plite.md` lines 429 to 437 already build Enter-on-void and pasted lines as the landing index's default |
| The text context after an open multi-block paste | Plite slice fitter | `plitejs` (`core/slice-fit`) | A paste whose last block is another text block split its container, a Details or a blockquote |
| Title repair after an edit, the drag veto, the first-live-Summary search and the Enter split retag | removed | `platejs` (`features/details`) | The grammar refuses each shape they repaired or vetoed, and Plite's split builds the tail as a paragraph |
| Code and List title conversion, Backspace and `wrap`'s Summary insert | Plate, unchanged | `platejs` (`features/details`, `internal/plugin/blockRelease`) | Interaction laws the grammar cannot express |
| HTML title rule | Plate HTML mapping | `platejs` (`features/details`) | HTML says the first `summary` child is the label, wherever it sits |
| A split that isolates part of a range for `set`, `wrap` or `unwrap` | Plite transforms, through an internal split that keeps each element's type | `plitejs` (`transforms-node`) | That split is part of a change to the range, so the schema must still check the result, as `details.mdx` line 46 requires for a title |
| AI answer blocks | Plate, through Plite's read exported as `placeBlockAt` from `plitejs/internal`, in the chat target's root | `platejs` (`ai/react`) | AI copies the source block's type onto its answer and writes it with raw inserts, which no Plite producer types |
| Column toggle placement check | Plate, using Plite's internal placement check | `platejs` (`features/layout`) | A raw children replace on a title throws at commit |
| Quote toggle result | Plate | `platejs` (`features/basic-nodes`) | The copied menus apply Quote before they clear List |
| Paragraph shortcut | Plate | `platejs/react` (`react/plugins/paragraph`) | It no longer names the Summary type |
| Quote menus and the turn-into List command | copied UI | `apps/www` registry | Quote's refusal must leave list items alone, and the List Details branch existed only because the old default was Summary |

## Hard cuts and app migration

- Both Details content corrections, the Details transfer veto, `getDetailsTitleIndex`'s first-live-Summary search and the Enter handler's split retag go. Each one's job moves to the grammar or to Plite's split, and the Decision ledger names the proof of each.
- A Details value whose Summary is not its first child, or that holds a second Summary, no longer loads (`probe/proto-trim-a1.log`). `next` loaded both. No released Plate package carries Details: npm's v54 versions are `54.0.0-beta.0` and `54.0.0-beta.1` from June 16 and 17, `53.3.15` (October 3) was published from `main`, which has no Details source, and no tag contains `da70467c27`, the commit that added Details to `next` on 2026-08-30. The v54 migration from v53 Toggle writes the Summary first (`packages/platejs/src/migrations/migratePlateV54Ast.internal.ts` lines 210 to 220).
- A snapshot envelope saved before the change fails to load with "does not match current schema", because its schema identity holds the old Details grammar (`packages/plitejs/src/core/public-state.ts` lines 11035 to 11044). Apps built from `next` load such envelopes through a document migration, as for any schema change.
- A Markdown `<details>` whose `<summary>` is not first, or that holds two, fails the parse, where `next` repaired it.
- An app with hand-written values moves each Details' first Summary to the front and turns later Summaries into paragraphs before loading them.
- Dragging a Summary is still refused, with reason `schema` instead of `policy`.
- In every Plite editor, a split, a pasted line or a duplicate that a required position refuses now takes that position's default type, where `next` threw at commit. The forced-layout example's Enter in its title now splits into a title and a paragraph (`probe/forced-base-a2.log`, `probe/forced-proto2-a4.log`). The read types only the new block: a grammar with two fixed slots whose remainder refuses the second slot's type would still throw when a split shifts that block into the remainder. No grammar in the repository has that shape.
- `tx.nodes.set` or `tx.nodes.wrap` with `split: true` over the start or middle of a title throws at commit and changes nothing. On `next`, `set` moved the split-off text into the body as the new type, and `wrap` threw. Over the end of a title, `set` still moves that text into the body, as on `next` (`probe/r2c-base-a1.log`, `probe/r2c-proto3-a1.log`).

The copied Quote menus apply Quote first and clear List only when Quote applied.

```tsx before
// apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx
editor.update((tx) => {
  if (editor.plugin(BaseListPlugin).installed) {
    tx.plugin(BaseListPlugin).clear();
  }
  tx.plugin(BaseBlockquotePlugin).toggle();
});
```

```tsx after
// apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx
editor.update((tx) => {
  if (
    tx.plugin(BaseBlockquotePlugin).toggle() &&
    editor.plugin(BaseListPlugin).installed
  ) {
    tx.plugin(BaseListPlugin).clear();
  }
});
```

The copied turn-into List command no longer needs the Details types.

```tsx before
// apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx
editor.update.command(turnIntoList, {
  detailsType: details.installed ? details.schema.type : undefined,
  paragraphType: editor.plugin(BaseParagraphPlugin).schema.type,
  summaryType: summary.installed ? summary.schema.type : undefined,
  type,
});
```

```tsx after
// apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx
editor.update.command(turnIntoList, { type });
```

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Typing three dashes in a title | The dashes stay text; no divider, no new empty title | jsdom spec; hand drive in Chromium on `/docs/details` |
| Paragraph, Quote, Callout or Columns on a title | Nothing changes; Columns stops throwing | jsdom specs; hand drive of the turn-into menu |
| Quote on a title and a body list item | Nothing changes; the list item keeps its list | registry spec |
| Paragraph shortcut on a leveled title, alone or with a paragraph and a heading | The title loses its level and stays a title | `TPlateEditorCore.spec.ts` lines 79 to 141 and a three-block case |
| Enter mid-title or over a selection in a title, Backspace at body start, closed-title Delete | Unchanged | `BaseDetailsCommands.spec.ts`; hand drive of Enter |
| Pasting several lines or blocks in a title | The first joins the title and the rest become body paragraphs, as today; at the title's end they now stay in the section | Plite fitter and paste specs; hand drive of a paste |
| Duplicate of a selected title | The copy lands as a body paragraph, as today | Plite duplicate spec; hand drive of the block menu |
| Pasting blocks that end in a heading at the end of a quoted line | The quote stays one quote; today it splits | Plite fitter spec |
| Pasting blocks at the end of a table cell's or a column's first line | The cell or column stays one; today the rest of it moves into a new cell or column | Plite fitter spec; hand drive of a paste in a table |
| Formatting part of a title with a split, `tx.nodes.set` or `tx.nodes.wrap` with `split: true` | Refused at commit when title text would stay after the formatted part; today `set` moves that text into the body and `wrap` throws. Formatting the end of a title still moves it into the body, as today | Plite transform specs |
| HTML with a second styled `summary` | The extra summary becomes a paragraph whose text keeps its bold, color and code marks | `BaseDetailsPlugin.spec.ts` |
| AI answer that starts with a table, over a picked title, with formatting off | The title stays and the table lands after it in the body; today the title empties | `AIChatPlugin.details.spec.ts` |
| Dragging a title | Still refused | `BaseDetailsPlugin.spec.ts` transfer cases |
| AI rewrite of a selected title with formatting off, or of the title and body | The first answer block becomes the title and the rest become body paragraphs; today the title empties and the whole answer lands in the body | `AIChatPlugin.details.spec.ts` |
| AI Insert below from an open title, or a rewrite of the title's text with formatting `all` | Unchanged: the answer lands as body paragraphs after the title | `AIChatPlugin.details.spec.ts` |
| Inserting a block, such as a divider, at a caret inside a title | Unchanged: the title splits and its tail becomes a body paragraph | Plite insert spec |
| Pasting copied blocks over a selected title | The first block becomes the title; today the title empties | Plite paste spec |
| Enter in the title of the forced-layout example | Splits into a title and a paragraph; today it throws | Plite split spec; hand drive of `/examples/plite/forced-layout` |
| Undo after a refused change | No history entry, since nothing was written | unproven beyond the jsdom refusal specs |

## Main changes

- Plite builds the tail of a split, each later line of a plain-text paste, each copy of a duplicate and each block pasted over picked blocks with its source's type when the parent admits that type at the new index, and otherwise with the parent's default for that index. One internal schema read, `placeElementAt`, answers that for all four. The retyped block keeps the properties a type change preserves when the slot admits them, and takes the slot's own values otherwise. Its text keeps its properties, so one the new type does not allow makes commit reject the write. A split types only the tail that stays in an unsplit parent. When one split goes up several levels, each lower tail starts its parent's new half and keeps its type. A split that `set`, `wrap` or `unwrap` makes to isolate part of a range keeps each element's type, so the schema still checks the result.
- `insertNodes` finds the right half of the block it split by the split point's path, so a split that retypes the tail still lands the inserted block between the halves.
- Plite's slice fitter restores the target's text context when an open paste ends in another text block, so a paste at the end of a title, a quoted line, a table cell's line or a column's line no longer splits its container.
- `BaseDetailsPlugin` loses both content corrections, its transfer veto, its first-live-Summary search and its Enter split retag. A title is child 0 of a Details when that child is live content.
- `BaseDetailsPlugin`'s HTML mapping gains a `prepareDocument` that moves each `details` element's first `summary` child to the front and turns later `summary` children into paragraphs, HTML's own rule for which child is the label. Each such paragraph wraps the summary's content in a span that carries the summary's attributes, so its styles decode as marks and cannot make the paragraph match another block, such as a Consolas code block.
- AI types each answer block for its landing index in the chat target's root through the same read, exported as `placeElementAt` from `plitejs/internal` and reached through the platejs facade. That covers block replacement, Insert below, accepting a streamed answer and the blocks after the first in a text-range rewrite. In a chat action the root is the captured target's own, the main root included, and the invoking view's root only when nothing was captured. Accepting an insert-mode answer keeps the view's root, because its writes go to bare paths in that root. So the first block of an answer over a picked title becomes the title, and an answer inserted below an open title lands in the body. When the first answer block cannot be a title, such as a table, the title stays and the answer replaces the rest of the selection after it.
- The Column toggle checks placement before it replaces a block, so Columns on a title changes nothing instead of throwing.
- `rootOf`, which Column, List and Details read for a command's root, falls back to the view's root when the location names none, so a command from a named view checks placement in that view's root.
- The copied Quote menus apply Quote before they clear List, and the copied turn-into List command resets every selected block once.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Details title slot | `any` grammar plus two corrections | `prefix([Summary], blockContent)` with an optional body | Plite grammar, declared by `BaseDetailsPlugin` | `docs/vision/plite.md` lines 126 to 128 | `details.mdx` and its Chinese twin | title-refusal and load-refusal specs; wide platejs run against base | out-of-place saved values stop loading | rearchitect |
| Type of a block built for a sibling position | split, duplicate and pasted lines copy the source type | the source type when the parent admits it there, else the slot's default text block | one internal Plite read, `placeElementAt` | construction belongs to the grammar; forced-layout's Enter throws on `next` | `docs/vision/plite.md` law paragraph | Plite split, duplicate, paste and AI specs | every Plite editor with a required slot | rearchitect |
| Text context after an open paste | restored only for the same block type | restored for any text block | Plite slice fitter | a paste ending in another text block splits its container, `probe/slice-quote-base-a1.log` | none | Plite fitter specs | landings at the end of a non-last block change in every container | fix |
| Transfer veto | Details `transferVeto` | the transfer landing's schema refusal | Plite landing | every Summary drag and every drop before a title refused on the prototype, `probe/drag-proto-a1.log`, `probe/r1-proto-a2.log` | none | transfer spec expects `schema` | the refusal reason string changes | cut |
| Title lookup | first live Summary | child 0 when it is live content; `unwrap` reads child 0 | `BaseDetailsPlugin` | the grammar puts the title at 0; a whole-Details deletion still reads as no title | none | release, anchor and authored specs | none found | cut |
| Enter split retag | Plate Enter handler retags a split Summary | deleted | Plite split | the split tail now takes the body default, `probe/r1-proto2-a4.log` | none | `BaseDetailsCommands.spec.ts` | none | cut |
| Paragraph shortcut | Summary branch | reset without level, then toggle Paragraph | `ParagraphPlugin` | toggle-then-reset keeps a title's level beside a paragraph and a heading, `probe/shortcut2-proto-a1.log` | none | `TPlateEditorCore.spec.ts` lines 79 to 141 and a three-block case | none | rearchitect |
| Quote toggle result | `void` | `boolean` | `BaseBlockquotePlugin` | the copied menus clear List only when Quote applied, `probe/quote-menu-proto-a2.log` | `blockquote.mdx` and its twin | registry Quote spec | none for callers that ignore it | rearchitect |
| Generated element toggle result | `void` | unchanged | `resolvePlugins` | no caller reads it; Plite's block toggle already returns a boolean | none | none | none | keep |
| AI answer blocks | raw writes of the formatted answer | each answer block typed for its landing index in the chat target's root | `AIChatPlugin.ts`, through `placeBlockAt` from `plitejs/internal` | a format `none` answer over a title empties it on `next`, and Insert below from an open title and a format `all` text rewrite throw without typing, `probe/ai-paths-base-a1.log`, `probe/r2c-proto2-a1.log`, `probe/r2c-proto3-a1.log`, `probe/r2s-proto3-a2.log` | none | AI Details specs | none found | rearchitect |
| AI text landing route | prefix parents take the slice landing | unchanged | `aiOutputLanding.internal.ts` | the fitter change lands title and body rewrites, `probe/ai-paths-proto2-a5.log`, `probe/ai-list-body-proto2-a2.log` | none | AI Details specs | none found | keep |
| Split that isolates a range | types its tail like every split | keeps each element's type | `set-nodes.ts`, `wrap-nodes.ts`, `unwrap-nodes.ts` through an internal `splitNodesKeepingType` | `set` with `split: true` over part of a title moved its text into the body, `probe/r2c-base-a1.log`, `probe/r2c-proto2-a1.log` | none | Plite transform specs | a raw split change over part of a required slot now throws in every Plite editor | fix |
| Column toggle | raw replace throws on a title | placement check, no write when refused | `BaseColumnPlugin` | the turn-into menu offers Columns on a title, `probe/paths-base-a1.log` | none | Column spec | none | rearchitect |
| HTML title rule | correction repaired misordered HTML | `prepareDocument` applies HTML's first-summary rule | Details HTML mapping | without it one misordered `details` fails a whole parse and paste, `probe/imports-proto-a2.log`, `probe/html2-proto-a2.log` | `details.mdx` HTML paragraph | HTML decode spec | none found | move |
| Markdown misordered `<details>` | correction repaired it | refused with a parse failure | Plite admission | Plate writes the Summary first; a decoder needs a hand-written encoder too | `details.mdx` Markdown paragraph | `probe/imports-prepare-a1.log` | hand-written Markdown in this shape stops parsing | cut |
| Copied Quote menus | clear List, then toggle Quote | toggle Quote, then clear List when it applied | copied `turn-into-toolbar-button.tsx`, `block-menu.tsx` | a refused Quote stripped the list fields of a selected body item, `probe/quote-menu-base-a1.log` | registry changelog | registry specs | none | fix |
| Turn-into List Details branch | retypes body blocks to Paragraph by hand | one reset | copied `turn-into-toolbar-button.tsx` | the body default is Paragraph now | registry changelog | registry specs | none | cut |

## Design

Two `architect` rounds ran. Each had runners on `claude-opus-5-5 @high`, `gpt-6-astra @xhigh` and `gpt-6.1-sol @xhigh` and an anonymized cross-judge on `claude-opus-5-5 @high`.

Round 1 asked how the schema owns the title. All three runners picked the prefix grammar with an optional body and deleted both corrections and the title search. The judge picked the Astra design, the only one that found the Column and AI block-selection throws (round 1 synthesis, `architect/synthesis.md` in the run directory). Its Enter retag, its AI refusal guard and its toggle-then-reset shortcut did not survive the first plan panel.

Round 2 asked who types a block that lands in a Details. The panel and the lead's probes had shown that Plite's own producers copy the title type into the body, and that a paste ending at a title splits the Details. All three runners put the rule in Plite. The base is the Opus design, one internal read named `placeElementAt` beside `createDefaultChild`, as the second prototype runs it. The judge picked it too, although the Astra design scored a point higher, because the grafts fix the base's two defects and the other designs' public API buys no probed outcome (round 2 synthesis, `architect-r2/synthesis.md` in the run directory).

- The Astra design gives the AI change. AI types its answer blocks through the same read, exported as `placeBlockAt` from `plitejs/internal`, and keeps its insert and removal. It also gives the shortcut order, which resets the level and then toggles Paragraph.
- The Sol design gives the plain-text change. Plite places each later line at its own index, including the lines built by type.
- The Opus design gives the restore scope. The fitter's restore compares by shared content only at the deepest open level. Ten nested blockquote and Details landings give the same shapes with every level relaxed and with the deepest only (`probe/slice-scope-every-a3.log`, `probe/slice-scope-deepest-a3.log`), so the narrower rule wins.
- The round 2 synthesis rejects each of these with its probe: a public fitting read, a block-pick target for `tx.slice.replace`, keeping a title's key on replacement, a `liftNodes` change, a split preflight, a rewrite of the fitter's positional candidate, a forced-layout default, fitting `blocks.insertAfter`, and collapsing only when a generated toggle applied.
- One limit stays. A paste whose blocks the Details body refuses would split the Details. Stock Plate's root and Details body both take block content, so no stock paste reaches it.

Challenge delta: replaced. Round 1's target, the prefix grammar with Plate guards on Enter, Duplicate and AI, threw or refused pastes into a title (`probe/slice-title-proto-a1.log`, `probe/paste-title-proto-a1.log`) and left forced-layout's Enter throwing (`probe/forced-base-a2.log`). The new target types each new block in Plite, and every one of those cases lands (`probe/slice-title-proto2-a5.log`, `probe/paste-title-proto2-a5.log`, `probe/forced-proto2-a4.log`).

Round-2 plan panel delta: improved. The seats found five more writers that broke on the second prototype: AI Insert below from an open title, an AI rewrite of the title's text with format `all`, an AI answer in a named root, `nodes.set` and `nodes.wrap` with `split: true` over part of a title, and HTML whose extra summary carried marks. Typing every AI landing in the chat target's root, keeping types on the splits that serve `set`, `wrap` and `unwrap`, and copying the extra summary's attributes fixed each one on the third prototype, and its suites add only the three Details specs this plan rewrites (`probe/r2c-proto3-a1.log`, `probe/r2s-proto3-a2.log`, `proto3-plite-a1.log`, `proto3-platejs-a1.log`). The target did not change.

Round-3 plan panel delta: improved. The seats found that a split going up through a Details from its title typed every level's tail, so `tx.nodes.split({ type: 'details' })` threw and a `mode: 'highest'` insert built a Details with an empty title. They also found three more problems. An AI action run through a named view typed a main-root target for that view's root. A table answer over a picked title did nothing. A Consolas-styled later summary became a code block. Typing only the highest level's tail, reading the captured target's own root, keeping a title the answer cannot fill, and moving the summary's attributes to an inner span fixed each one on the fourth prototype (`probe/r3-proto4-a1.log`, `probe/r3b-proto4-a1.log`). This was the third and last plan round, so these fixes get their review in the diff panel after the build.

## Steps

Build each step in this checkout, then run the step's proof. Load `verify` before each proof and read `.agents/pstack/rules/tests.md` before each test edit. Each new test fails on `next` or on the round-1 prototype before its step, and the proof names that run.

- [x] 1. Plite fitter: `createLocalTextCandidate` restores the target's text context when the open slice ends in another text block, comparing by shared content at the deepest open level only. Tests in `packages/plitejs/test/slice-fit-contract.test.ts`: on a blockquote `[P "Title", P "Body"]`, the open slice `[P X, H Y]` at the end of "Title" gives one quote `[P TitleX, H Y, P Body]`; on a prefix-owning `card[caption "Title", P "Body"]` whose caption the remainder refuses, `[P X, P Y]` at the caption's end gives `card[caption TitleX, P Y, P Body]` and over the whole caption `card[caption X, P Y, P Body]`; at the end of a table cell's first line `[P "Cell", P "More"]`, `[P X, H Y]` gives one cell `[P CellX, H Y, P More]`, and the same in a column. Preservation coverage, passing at base: `[P X, quote[P Y]]` at the end of a cell's first line gives one cell `[P CellX, quote[P Y], P More]`, the case that would change if the deepest-level comparison matched too widely (`probe/slice-places-base-a1.log`). Proof: each new case fails at base, then passes; the plitejs bun suite, run with the fixture repair of step 2's proof, adds no failure against `basefix-plite-a1.log`.
  Built: the quote, card and cell cases fail at base (`docs/plans/artifacts/2026-10-15-details-title-slot/build/step1-base-a1.log`) and pass; the column case was cut because it fails the same way as the cell. The suite matches base (`docs/plans/artifacts/2026-10-15-details-title-slot/verify/verify-plite-r3.log`).
- [x] 2. Plite `placeElementAt(source, { at, root })` in `editor-schema.ts`, beside `createDefaultChild`, returning `source` when the parent admits it at `at`, else the slot's default text block with `source`'s children and the properties its type change keeps, or null; called by the split tail in `split-nodes.ts` (not by `elementPropertiesForSplitAt`, which the authored recorder reads for property lifecycle), by `duplicateNodes`, by `getWholeBlockReplacements` and by later plain-text lines in `data-transfer-format.ts`; exported as `placeBlockAt` through `plitejs/internal`; the prototype's Duplicate refusal goes. `set-nodes.ts`, `wrap-nodes.ts` and `unwrap-nodes.ts` split through an internal `splitNodesKeepingType`, which keeps each split element's type, and `splitNodes` types only the tail of the highest level it splits, since each lower tail starts its parent's new half. Tests in `packages/plitejs/test/transforms-contract.ts` and `packages/plitejs/test/dom/data-transfer-format.test.ts`, on the forced-layout schema and the `card` schema: Enter mid-title, at its end and over a selection give `[title Ti, P tle, P Body]`, `[title Title, P "", P Body]` and `[title T, P le, P Body]`; Duplicate of a picked caption, alone and with its body; HTML over a picked caption; plain "X\n\nY" mid-caption and at its end; inserting a void block at a caret mid-caption splits the caption with a paragraph tail, where base throws because the tail keeps the caption type. Preservation coverage, passing at base: `blocks.set({ type: 'paragraph' })` on the caption leaves it unchanged, as `slice-fit-contract.test.ts` line 135 already shows; `nodes.set` and `nodes.wrap` with `split: true` over "it" in the caption throw at commit and leave the value unchanged, which the second prototype broke on a Details title (`probe/r2c-proto2-a1.log`); `tx.nodes.split({ type: 'card' })` and inserting a void with `mode: 'highest'` at a caret mid-caption give two valid cards, which the third prototype broke on a Details title (`probe/r3-base-a1.log`, `probe/r3-proto3-a1.log`). Proof: each new case fails at base, then passes, and each preservation case fails on the prototype run it names; the plitejs suite runs with the 29 `SelectionApi.nodes` fixtures that suggested task `t_bffdfc1c` repairs (`fixture-mode.patch`), so its base failures are not fixture crashes, and adds no failure against `basefix-plite-a1.log`.
  Built with one deviation: the read is exported as `placeElementAt`, not `placeBlockAt`, and Plate reaches it through the platejs facade, because `ai/react` may not import `plitejs/internal`. The picked-block paste test was cut because the fitter passes it at base, and its HTML case moved to the Details spec. Red runs: `docs/plans/artifacts/2026-10-15-details-title-slot/build/step2-base-a1.log`, `docs/plans/artifacts/2026-10-15-details-title-slot/build/step2-paste-base-a1.log`; build: `docs/plans/artifacts/2026-10-15-details-title-slot/build/step2-plite-a1.log`.
- [x] 3. Details grammar and deletions in `BaseDetailsPlugin.ts`: the prefix declaration; both corrections; the transfer veto and its import; `getDetailsTitleIndex`; the Enter handler's split retag; `getDetailsOfTitle` reading child 0 when it is live content and `unwrap` reading child 0; the HTML `prepareDocument`. Tests in `BaseDetailsPlugin.spec.ts`: Paragraph toggle, Quote toggle and `blocks.set` on a title change nothing and the title keeps its key, and typing the third dash leaves `---` as Summary text; loading `[P, S]` or `[S, P, S]` throws the schema error, replacing "repairs Summary ordering and uniqueness"; the transfer case expects `{ reason: 'schema', status: 'refused' }`; HTML `<details><p>B</p><summary>T</summary><summary>X</summary></details>` parses to `[summary T, paragraph B, paragraph X]`, and a later `<summary><h2>X</h2></summary>` to a level-2 heading, a later `<summary style="color: red"><b>X</b></summary>` to a paragraph that keeps both marks, and a later `<summary style="font-family:Consolas"><b>X</b></summary>` to a paragraph with bold and code marks, not a code block (`probe/r3b-proto3-a1.log`, `probe/r3b-proto4-a1.log`). A title block copied through the clipboard and pasted at the end of the body gives `[summary Title, paragraph BodyTitle]`. In `BaseDetailsCommands.spec.ts`, as preservation coverage that passes at base: Enter over "it" in a title gives `[summary T, paragraph le, paragraph Body]`, and inserting a divider at a caret mid-title splits it with a paragraph tail (`probe/split-insert-base-a2.log`). In `BaseDetailsPlugin.authored-tree.spec.ts`: cut the case that loads a live Summary behind a struck one, and give the title-deletion case literal proposed, accepted and rejected values with their review marks. Quote on a title is preservation coverage; it passes at base. Proof: each red test fails at base or without the hook, then `bun test src/features/details` passes in `packages/platejs`.
  Built: `docs/plans/artifacts/2026-10-15-details-title-slot/build/step3-base-a1.log` fails at base; the color case merged into the Consolas case; `docs/plans/artifacts/2026-10-15-details-title-slot/verify/verify-platejs-r3.log` adds no failure against base.
- [x] 4. Paragraph shortcut: reset without level, then toggle Paragraph, in one update; drop the Summary binding import. Proof: `TPlateEditorCore.spec.ts` lines 79 to 141 pass, plus a new case with a leveled title, a paragraph and a body heading that fails with toggle-then-reset.
  Built: the new three-block case was cut, because the existing structural-root test already fails with toggle-then-reset (`docs/plans/artifacts/2026-10-15-details-title-slot/build/step4-toggle-first-a1.log`).
- [x] 5. Quote toggle returns `tx.blocks.toggle`'s boolean; the copied Quote handlers in `turn-into-toolbar-button.tsx` and `block-menu.tsx` toggle Quote first and clear List only when it applied. Test in the registry turn-into spec: Quote on a title and a body list item leaves the item's list fields. Proof: the test fails with the old order, then passes; the registry specs pass, one process per file.
  Built: `docs/plans/artifacts/2026-10-15-details-title-slot/build/step5-base-a1.log` fails with the old order; the registry specs pass (`docs/plans/artifacts/2026-10-15-details-title-slot/verify/verify-registry-all-r3.log`).
- [x] 6. AI types each answer block with `placeBlockAt` for its landing index in the chat target's root, through one helper used by block replacement, Insert below, accepting a streamed answer and the blocks after the first in a text-range rewrite. One read gives that root: the captured chat blocks' root, the main root included, else the chat selection's root, else the invoking view's. When the first answer block cannot take the first picked block's place, block replacement keeps that block and lands the answer after it. Tests in `AIChatPlugin.details.spec.ts`: through `replaceSelection`, a picked title with format `none` gives `[summary X, paragraph Body]`, a picked title and body gives `[summary X, paragraph Y]`, a picked title in a named root beside the main document gives `[summary X, paragraph Body]` there, a picked main-root title answered through a named view whose first block is a quote gives `[summary X, paragraph Body]` in the main root, and a GFM table answer with format `none` over a picked title gives `[summary Title, table, paragraph Body]` (`probe/r3-base-a1.log`, `probe/r3-proto4-a1.log`). Preservation coverage, passing at base: through `insertBelow` from a caret in an open title or a picked open title, `[summary Title, paragraph X, paragraph Body]`; a whole-title text selection with two paragraphs gives `[summary X, paragraph Y, paragraph Body]` with format `none` and with format `all`; a quoted answer on a picked title gives `[summary X, paragraph Body]`. The `insertBelow` and format `all` cases threw on the second prototype before this round's fix (`probe/r2c-proto2-a1.log`). Proof: the new cases fail at base, then pass; the named-view case also failed on the third prototype (`probe/r3-proto3-a1.log`); every case passes after the step; `bun test src/ai` adds no failure against base.
  Built with the step 2 deviation: answers are typed through `placeElementAt` from the platejs facade. Preservation cases that repeat others were trimmed. Red run: `docs/plans/artifacts/2026-10-15-details-title-slot/build/step6-base-a1.log`.
- [x] 7. Column toggle checks `canPlaceBlocksAtPath` before `replaceChildren` and returns without writing when refused. Test in `BaseColumnPlugin.spec.ts`: Columns on a Details title leaves the value unchanged. Proof: the test throws at base, then passes.
  Built: the Column case throws at base and passes; it reads its root through `rootOf`, which the diff panel moved to the view's root (`docs/plans/artifacts/2026-10-15-details-title-slot/verify/verify-platejs-r3.log`).
- [x] 8. Copied turn-into List command takes `{ type }` and resets every selected block once. Proof: the registry specs pass, one process per file.
  Built: the registry specs pass, one process per file (`docs/plans/artifacts/2026-10-15-details-title-slot/verify/verify-registry-all-r3.log`).
- [x] 9. Docs and law: `details.mdx` and `details.cn.mdx` say the schema refuses another block in the title's place, drop "corrections", and state the HTML and Markdown rules; `blockquote.mdx` and its twin say `toggle()` returns `false` when nothing changed; `docs/vision/plite.md` gains the law that a derived block takes its position's type, through `best-api repair`; add `EDIT-DETAILS-TITLE-TYPE-001` and `EDIT-DETAILS-TITLE-LAND-001` `proposed` to `docs/editor-behavior/markdown-editing-spec.md`; changesets for `plitejs` and `platejs` and the registry changelog entry through the `changeset` skill. Proof: the `plate-docs` checks for both pages, `pnpm kb check`, and a docs preview of `/docs/details`.
  Built: `docs/plans/artifacts/2026-10-15-details-title-slot/build/check-docs-a1.log`, `docs/plans/artifacts/2026-10-15-details-title-slot/build/kb-check-a1.log` (its findings match base) and `docs/plans/artifacts/2026-10-15-details-title-slot/build/build-registry-check-a1.log`; the docs preview ran in the hand drive.
- [x] 10. Verify: the wide platejs run adds no failure against `base-platejs-a1.log` beyond the specs this plan rewrites; the plitejs bun suite against `base-plite-a1.log`; registry specs; `pnpm --filter platejs typecheck` and `pnpm --filter plitejs typecheck`; `pnpm lint:fix` on the task's paths; a hand drive through `www-drive` of three dashes, Quote, Callout, Columns and the paragraph shortcut on a title, Enter mid-title and over a selection, a paste of two lines at a title's end, Duplicate from the block menu, and Enter in the forced-layout example. Proof: logs under the run directory and `hand-drive.mjs check`.
  Built: suites and typechecks match base (`docs/plans/artifacts/2026-10-15-details-title-slot/verify/verify-plite-r3.log`, `docs/plans/artifacts/2026-10-15-details-title-slot/verify/verify-platejs-r3.log`, `docs/plans/artifacts/2026-10-15-details-title-slot/verify/verify-typecheck-plitejs-a2.log`); lint (`docs/plans/artifacts/2026-10-15-details-title-slot/build/lint-task-final-a1.log`); hand drive (`docs/plans/artifacts/2026-10-15-details-title-slot/verify/hand-drive-check-a1.log`), accepted under the "drive again" default with its gaps.

## Completion Gates

Execution authority: suggested task `task_73c3bba9`, which session `local_18c70716-564c-4c8c-8225-ccc6e2d18d37` started from the owner's card, adopting the 2026-10-04 audit's Pursue. The build starts from `proto4.patch`, the fourth prototype's diff, on a detached `next` at `b1e70bb257`, and hands back a patch.

| Gate | Applies | Artifact |
| --- | --- | --- |
| `pstack:blast-radius` before code, because the Details schema, the Quote toggle's return and a `plitejs/internal` export change | yes | `docs/plans/artifacts/2026-10-15-details-title-slot/blast-radius-build.md` |
| `verify` loaded before the first proof gate | yes | the `verify` skill, loaded before step 1 |
| Each step's red-first and focused proof | yes | the step lines under Steps and the decision log's build rows |
| `pstack:thermos` per slice | no | skip: the `api-build` row owes a panel on this diff, and every seat applies both lenses |
| Hard cut and `best-api repair` | yes | `best-api repair` edited `docs/vision/plite.md`; the hard cuts were named in the plan the owner's card continued |
| `plate-docs` on `details.mdx`, `blockquote.mdx` and their Chinese twins | yes | `docs/plans/artifacts/2026-10-15-details-title-slot/build/check-docs-a1.log` |
| Changesets for `plitejs`, `platejs` and the registry | yes | `.changeset/plite-derived-block-type.md`, `.changeset/semantic-details.md`, `.changeset/platejs-authored-content.md`, registry entry `2026-10-15-quote-on-details-title` |
| Writing passes: `deslop` and `no-comments` on product code, `unslop` on docs and this plan | yes | the decision log's writing rows, one per build and panel round |
| `pnpm check` steps the edits reach, typechecks first | yes | `docs/plans/artifacts/2026-10-15-details-title-slot/verify/verify-typecheck-platejs-a2.log`, `docs/plans/artifacts/2026-10-15-details-title-slot/verify/verify-typecheck-plitejs-a2.log`, `docs/plans/artifacts/2026-10-15-details-title-slot/verify/verify-plite-r3.log`, `docs/plans/artifacts/2026-10-15-details-title-slot/verify/verify-platejs-r3.log`, `docs/plans/artifacts/2026-10-15-details-title-slot/build/kb-check-a1.log` |
| `api-build` panel on the diff | yes | three rounds, `docs/plans/artifacts/2026-10-15-details-title-slot/panel-diff-r1/`, `docs/plans/artifacts/2026-10-15-details-title-slot/panel-diff-r2/`, `docs/plans/artifacts/2026-10-15-details-title-slot/panel-diff-r3/` |
| Hand drive through `www-drive` and `hand-drive.mjs check` | yes | `docs/plans/artifacts/2026-10-15-details-title-slot/verify/hand-drive-check-a1.log`, accepted with its gaps under "drive again" |
| `pnpm lint:fix` on this task's files | yes | `docs/plans/artifacts/2026-10-15-details-title-slot/build/lint-task-final-a1.log` |
| `check-plate-feature.mjs` | no | skip: not a feature-delivery plan from the feature template |
| Decision-trail review | yes | `docs/plans/artifacts/2026-10-15-details-title-slot/trail-review/seat-sol.md` |
| `review-ledger.mjs check` | yes | `docs/plans/artifacts/2026-10-15-details-title-slot/verify/review-ledger-check-a2.log`: no finding on this plan; the other plans' findings fail at base and `t_3ea68f2e` owns them |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the title rule lives | The schema keeps the title first (look) | Keep the cleanup rules and guard each menu | keep corrections | big |
| A block the title cannot become, like a divider or a callout | Nothing happens and the title stays (look) | The whole section turns into that block, like Code and List | release | big |
| New blocks that Enter, paste or Duplicate build after a title | They become body paragraphs, in every Plite editor with a required slot (look) | Details fixes each case itself and other editors keep throwing | details only | big |
| Code and List on a title | Turn the title into that block, as today | Do nothing there too | refuse code | small |
| Saved values with the title out of place | Stop loading them, no migration step (look) | Ship a migration step for them | migrate | big |
| Pasted or imported web pages with the title out of place | Read the first title as the title, like browsers do | Refuse the whole page | strict html | small |
| Markdown with the title out of place | Refuse it (look) | Read it like web pages | markdown title rule | small |
| Pasting several blocks at a title's end | They stay in the same section | Split the section in two, as today | split section | small |
| Pasting several blocks into a closed title | The rest go into its hidden body, as today when pasting mid-title | Put them after the section, like an inserted block | closed paste after | small |
| Pasting a copied title at the end of a body line | Its text joins that line, as a copied paragraph's does | Add it as its own line plus an empty one, as today | copy title line | detail |
| Duplicate of a title | The copy lands as a body paragraph, as today | Refuse it | refuse duplicate | small |
| AI rewrite of a picked title with formatting off, or of the title and body | The first answer block becomes the title | Refuse it and keep the answer to insert below | refuse ai title | small |
| What a refused title change shows | Nothing on screen; Quote tells code callers it did nothing | A short message in the menus | refusal message | small |
| Columns on a title, which crashes today | Do nothing, like Quote | Leave it for its own fix | columns later | detail |
| Code that splits off part of a title to restyle or wrap it | It gets an error and the title stays whole | That part moves into the body | split title text | small |
| AI answers a selected title with a table | Keep the title and put the table just below it | Do nothing, or clear the title as today | ai table refused | small |
| A Details with only a title | Stays valid | Must hold one body block | require body | small |
| The Callout half of this review scope | Left open for its own plan | Review it here | callout | detail |
| Menus, Duplicate and paste on a title, which I couldn't test in the browser | Trust their tests (look) | Test them again in a browser you can watch | drive again | small |

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

This plan retains the [2026-10-04 callout audit](../research/review-records/2026-10-04-callout-audit.json)'s Details verdict and proposed grammar, and takes its first proof limit as answered: prefix admission refuses every drag that would take the Summary out of its slot or land before it (`probe/drag-proto-a1.log`, `probe/r1-proto-a2.log`). It leaves the audit's callout verdict as it stands. It reopens the "Details grammar and its repair stay as on `next`" pick in [the PR 5165 redo](2026-10-13-pr-5165-redo.md) (Design, Heading on a title), which that plan panel's three round-1 seats set aside for a separate design; this plan is that design, and its finding that most Summary writers throw at commit is what Plite's position typing answers. External checkouts read: Tiptap `91c51be53c`, ProseMirror transform `662b7a937b`, Lexical `dd5c41b131`, BlockNote `1e26f1c5e1` and Slate `945a484df2`.

### Requirements

- Details persists `{ type: 'details', children: [summary, ...blocks] }` with exactly one leading Summary, and its open state stays out of the document (`content/docs/(plugins)/(elements)/details.mdx` lines 12 and 28).
- Ordered required child positions belong to the compiled content grammar, including construction and fitting, and app corrections do not keep a second document shape (`docs/vision/plite.md` lines 126 to 128).
- The default block that Enter on a block void or `tx.break.exit` creates is its landing parent's default for the landing index, and pasted lines over picked blocks build line `n` at the picked slot plus `n` (`docs/vision/plite.md` lines 429 to 437).
- Formatting a title never moves its text into the body (`details.mdx` line 46, `EDIT-DETAILS-TITLE-LEVEL-001`).
- Code and List on a title release the Details (`EDIT-DETAILS-TITLE-CODE-001`, `EDIT-DETAILS-TITLE-LIST-001`).
- The locked Enter, Backspace and Delete laws `EDIT-DETAILS-ENTER-001` to `EDIT-DETAILS-BS-AFTER-CLOSED-001`, and `EDIT-DETAILS-INSERT-CLOSED-001`, keep passing.
- A suggestion that deletes a title gives Editing's result when accepted and the original when rejected (`BaseDetailsPlugin.authored-tree.spec.ts`).
- A transfer never takes the Summary or lands before it.
- Every value a released Plate package wrote still loads.
- The ask, quoted from task `task_73c3bba9`: "quote, code and other block types on a title are refused instead of breaking it; `editor.update.paragraph.toggle()` then keeps a title in place, and the paragraph shortcut drops its Summary branch." Code is the exception the requirements above keep: it releases the Details, by its own law.

### Probes

Each ran at base (`b1e70bb257`, detached worktree), on the round-1 prototype (prefix grammar, both corrections, the veto and the title search deleted, the Enter retag kept and widened, a Duplicate refusal) and, where named, on the second prototype (`placeElementAt` on the split tail, Duplicate, picked-block paste, plain-text lines and AI block replacement; the fitter's restore; no Enter retag and no Duplicate refusal). Logs sit under `docs/plans/artifacts/2026-10-15-details-title-slot/`.

- Writers (`probe/writers.spec.ts`): at base, three dashes, Paragraph and Callout toggles and `blocks.set` push the title into the body; on the prototype each is refused. Code and List release the Details on both (`probe/base-a2.log`, `probe/proto-trim-a1.log`).
- Enter: deleting the retag on the round-1 prototype makes Enter mid-title and over a selection throw (`proto-trim-details-a1.log`, `probe/r1-proto-a1.log`); on the second prototype, with no retag, every case matches base (`probe/r1-base-a1.log`, `probe/r1-proto2-a4.log`). The forced-layout example throws on Enter in its title at base and splits into title and paragraph on the second prototype (`probe/forced-base-a2.log`, `probe/forced-proto2-a4.log`).
- Paste: an open two-paragraph slice ending at a title's end, or over its tail, throws on the round-1 prototype and splits the Details in two at base; a multi-line plain-text paste in a title is refused there; HTML over a picked title empties the title at base and is refused there. The second prototype lands each in one Details, and HTML over a picked title fills the title with the first pasted block (`probe/slice-title-base-a1.log`, `probe/slice-title-proto-a1.log`, `probe/slice-title-proto2-a4.log`, `probe/paste-title-base-a1.log`, `probe/paste-title-proto-a1.log`, `probe/paste-title-proto2-a4.log`, `probe/paste-pick-base-a1.log`, `probe/paste-pick-proto-a1.log`, `probe/paste-pick-proto2-a4.log`). The same fitter defect splits a blockquote at base (`probe/slice-quote-base-a1.log`, `probe/slice-quote-proto2-a4.log`).
- Duplicate of a picked title, alone or with its body, gives body paragraph copies at base and on the second prototype, and throws on the round-1 prototype (`probe/dup-base-a1.log`, `probe/dup-proto-a1.log`, `probe/dup-proto2-a4.log`). A caret Duplicate inside any Details child throws on all three, a separate defect.
- Drags: every Summary-carrying drag, and every drop before a title, is refused on both trees (`probe/drag-base-a1.log`, `probe/drag-proto-a1.log`, `probe/r1-proto-a2.log`).
- AI through `replaceSelection`: a picked title with format `none`, or the title and body, empties the title at base, throws on the round-1 prototype and lands as the title on the second; a quoted answer on a picked title lands as summary "X" on every tree, because the commit's representation pass flattens it (`probe/ai-paths-base-a1.log`, `probe/ai-paths-proto-a1.log`, `probe/ai-paths-proto2-a5.log`, `probe/r1c-planted-a1.log`). List rewrites in a Details body number the same through either landing (`probe/ai-list-body-base-a2.log`, `probe/ai-list-body-proto2-a2.log`).
- Copies: a copied title, body or Details pasted at a text caret lands as a copied paragraph or Details does. At a body caret the title's text joins the line, where base added a paragraph and an empty one; a copied Details at its own title's end nests in the body, as it does at a body caret on both trees (`probe/copy-title-base-a2.log`, `probe/copy-title-proto2-a2.log`).
- Restore scope: ten slices ending in a blockquote or a Details body, landed in quoted lines, titles, bodies and both nestings, give the same shapes at base, with every open level relaxed and with the deepest only (`probe/slice-scope-base-a3.log`, `probe/slice-scope-every-a3.log`, `probe/slice-scope-deepest-a3.log`).
- Forced-layout's remainder admits `title`, so a block built past its Paragraph slot keeps the title type (`probe/forced-group-base-a1.log`, `probe/forced-group-proto2-a1.log`).
- Premises on the second prototype: the writer, typed-marker, drag, Column and raw AI path, Quote menu, shortcut, collaboration, `r1b` and lift probes match the round-1 prototype, except that a refused Quote toggle now returns `false` (`probe/writers-proto2-a1.log`, `probe/inputs-proto2-a1.log`, `probe/drag-proto2-a1.log`, `probe/paths-proto2-a1.log`, `probe/quote-menu-proto2-a1.log`, `probe/shortcut2-proto2-a1.log`, `probe/yjs-proto2-a1.log`, `probe/r1b-proto2-a1.log`, `probe/lift-proto2-a1.log`).
- Lift: lifting a body block out of a Details gives the same shapes on every tree (`probe/lift-base-a1.log`, `probe/lift-proto-a1.log`, `probe/lift-proto2-a1.log`).
- Paragraph shortcut options: reset then toggle passes every case, and toggle then reset keeps a title's level beside a paragraph and a heading (`probe/shortcut2-proto-a1.log`, `probe/shortcut2-proto-a2.log`).
- Quote menus: clearing List before Quote strips a body item's list fields when Quote is refused, at base too; Quote first keeps them (`probe/quote-menu-base-a1.log`, `probe/quote-menu-proto-a2.log`).
- Typed markers: quote, heading, list and code-fence markers behave the same on both trees (`probe/inputs-base-a1.log`, `probe/inputs-proto-a1.log`).
- Imports: misordered HTML fails a whole parse and paste on the prototype; the `prepareDocument` rule restores `next`'s outcomes, a later heading summary included; Markdown still fails (`probe/imports-base-a2.log`, `probe/imports-proto-a2.log`, `probe/imports-prepare-a1.log`, `probe/html2-proto-a2.log`). A stray `summary` element imports the same on both (`probe/stray-base-a1.log`, `probe/stray-proto-a1.log`).
- Collaboration: two peers that both delete the title converge on one empty title, and a deletion against typing converges on the typed title, on both trees (`probe/yjs-base-a2.log`, `probe/yjs-proto-a2.log`). Two peers that each replace the title node with a new Summary, as AI and a paste over a picked title do, converge on one title holding both texts on all three trees, ready (`probe/yjs-replace-base-a1.log`, `probe/yjs-replace-proto-a1.log`, `probe/yjs-replace-proto2-a1.log`).
- Suites on the second prototype: the plitejs bun suite fails no test that base passes, once three timeouts under load pass alone (`base-plite-a1.log`, `proto2-plite-a2.log`, `proto2-plite-a2-reruns.log`); the wide platejs run adds only the three Details specs this plan rewrites to base's failures (`base-platejs-a1.log`, `proto2-platejs-a2.log`).
- Round-2 panel probes ran at base, on the second prototype and on the third, which adds the round-2 fixes to the second. AI Insert below from an open title and a format `all` rewrite of the title's text threw on the second and match base on the third. `nodes.set` with `split: true` over "it" in a title moves that text into the body at base and on the second, and `nodes.wrap` throws at base; on the third both throw at commit and leave the value unchanged. A void block inserted at a caret mid-title splits the title with a paragraph tail at base and on the third, and threw on the round-1 prototype (`probe/r2c-base-a1.log`, `probe/r2c-proto2-a1.log`, `probe/r2c-proto3-a1.log`, `probe/split-insert-base-a2.log`, `probe/split-insert-proto-a2.log`, `probe/split-insert-proto3-a1.log`). An AI answer over a picked title in a named root empties the title at base and lands as the title on the third; an extra styled `summary` keeps its marks on the third and lost them on the second (`probe/r2s-base-a1.log`, `probe/r2s-proto2-a1.log`, `probe/r2s-proto3-a2.log`). A pending title-level suggestion, then Enter, then reject returns `invalid` at base as well (`probe/r2w-base-a1.log`, `probe/r2w-proto3-a1.log`).
- Restore places: an open slice pasted at the end of a table cell's or a column's first line moves the rest of the cell or column into a new one at base and keeps one on the third prototype; slices ending in a quote or a Details give the same shapes at a cell, a column and a non-last root block on both (`probe/slice-places-base-a1.log`, `probe/slice-places-proto3-a1.log`).
- Suites on the third prototype: the plitejs bun suite fails no test that base passes, and the wide platejs run adds only the three Details specs (`proto3-plite-a1.log`, `proto3-platejs-a1.log`, `proto3-plite-fails.txt`, `proto3-platejs-fails.txt`). Base's fixture crashes hid the paste over picked blocks from that plitejs run. The earlier probes give the same results on the third prototype as on the second (`probe/*-proto3-a1.log`).
- Suites on the fourth prototype, with `fixture-mode.patch` applied to it and to base so the 16 slice landing cases over picked blocks run: plitejs fails the same 8 tests as base, down from base's 41 without the repair, and the wide platejs run adds only the three Details specs (`basefix-plite-a1.log`, `proto4-plite-a1.log`, `basefix-plite-fails.txt`, `proto4-plite-fails.txt`, `proto4-platejs-a1.log`, `proto4-platejs-fails.txt`, `proto4.patch`).
- Round-3 panel probes ran at base, on the third prototype and on the fourth, which adds the round-3 fixes. `tx.nodes.split({ type: 'details' })` and a `mode: 'highest'` divider insert from inside a title give two valid Details at base and on the fourth, and threw or emptied the second title on the third. A picked main-root title answered through a named view gives `[summary X, paragraph Body]` on the fourth, threw on the third, and empties the title at base. A GFM table answer with format `none` over a picked title keeps the title on the fourth, did nothing on the third, and empties the title at base (`probe/r3-base-a1.log`, `probe/r3-proto3-a1.log`, `probe/r3-proto4-a1.log`). A Consolas-styled later summary decodes as a paragraph with bold and code marks at base, as on the fourth, and as a code block on the third. A `nodes.set` with `split: true` over the end of a title moves that text into the body on every tree. After a picked title in a named root is answered from the main editor, the main selection lands on the main document's first title on every tree (`probe/r3b-base-a1.log`, `probe/r3b-proto3-a1.log`, `probe/r3b-proto4-a1.log`).
- The earlier probes give the same results on the fourth prototype as on the third, or as on the round-1 prototype for those not run since, apart from ids and the random order of two peers' texts (`probe/*-proto4-a1.log`).
- Proof limits: the hand drive in the built-in browser covered typed input on titles, Enter, the turn-into heading and Text items, the paragraph shortcut and forced-layout's Enter. The Quote, Callout and Columns menu items, Duplicate and paste rest on jsdom and registry specs. No two-peer Enter or paste ran.

### Lanes

- **Keep the corrections and guard each writer.** Every writer that retypes a title needs a Details branch, as the paragraph shortcut has today, and the second document shape stays. Loses on the law and on cost.
- **Prefix grammar with Plate guards (round 1).** Plate retags Enter, refuses Duplicate and AI, and still needs a Details paste rule; forced-layout keeps throwing. Loses to position typing in Plite.
- **Prefix grammar with Plite position typing (picked).** See Design.
- **Fit at commit.** A commit-time pass that retypes a refused text block would also accept a retyped title, and it is a correction moved into Plite. Loses.
- **Delete the Summary type.** The first text block of any type would be the title, as BlockNote and Notion model a toggle heading. A prefix slot is one element type with literal properties (`docs/vision/plate.md` lines 576 to 578), and it changes every saved Details. Loses.

### Dependents

- `distribution`, `documents`, `editing`: unaffected; none writes a Summary or reads the Details grammar.
- `list` (`apps/www/src/registry/components/editor/block-list-static.tsx`): unaffected; List conversion of a title still runs through `blockRelease`.
- `react`: `packages/platejs/src/react/plugins/paragraph/ParagraphPlugin.tsx` changes as Public API shows. `packages/platejs/src/react/features/details/DetailsPlugin.tsx` and `packages/platejs/src/react/features/callout/CalloutPlugin.tsx` are unaffected, because they only wrap base plugins.
- `ui`: `apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx` and `apps/www/src/registry/components/editor/block-menu.tsx` change their Quote handlers and the List command. `apps/www/src/registry/components/editor/fixed-toolbar.tsx`, `plugins-static.ts` and `plugins.ts` are unaffected, because they only install kits.

## Open work

- The callout half of the 2026-10-04 audit: the package's `'💡'` icon default and the `variant` no copied component renders. owner: zbeyens. stop: a callout plan runs or the owner drops it.
- A message in the copied menus when a block change is refused. owner: zbeyens. stop: the owner asks for it or drops it.
- A caret Duplicate inside a Details child throws "cannot be repeated or cyclic" on `next`. owner: zbeyens. stop: its suggested task runs or the owner drops it.
- `tx.slice.replace` crashes when `at` is a block pick, and returns false for a pick outside command paths, on `next` (`probe/pick-replace-base-a1.log`, `probe/pick-replace-base-a2.log`). owner: zbeyens. stop: its suggested task runs or the owner drops it.
- Lifting a Details title throws "primary root cannot contain summary" on `next` (`probe/lift-base-a1.log`). owner: zbeyens. stop: its suggested task runs or the owner drops it.
- Rejecting a pending title-level suggestion after Enter split the title returns `invalid` on `next` (`probe/r2w-base-a1.log`). This plan moves the tail retype from the Details Enter handler into Plite's split, so the same reject turns `invalid` in every Plite editor whose Enter in a fixed slot used to throw, such as forced-layout's. owner: zbeyens. stop: its suggested task runs or the owner drops it.
- A `nodes.set` with `split: true` over the end of a title moves that text into the body on `next` and after this plan (`probe/r3b-base-a1.log`), against `details.mdx` line 46. owner: zbeyens. stop: its suggested task runs or the owner drops it.
- After AI answers a picked title in a named root from the main editor, the main selection lands on an unrelated main-root block on `next` (`probe/r3b-base-a1.log`). owner: zbeyens. stop: its suggested task runs or the owner drops it.
- Accepting an insert-mode AI answer whose target sits in a named root writes it into the main root by bare path on `next`, and replaces the main root's first block when the target is an empty paragraph (`probe/r3c-base-a1.log`). owner: zbeyens. stop: its suggested task runs or the owner drops it.
- An open slice pasted at the end of a root block that is not the last one does not join its first line into that block, on `next` (`probe/slice-places-base-a1.log`). owner: zbeyens. stop: its suggested task runs or the owner drops it.
- When a prefix slot fixes a property, placement can still return a block the slot refuses, so Enter there throws at commit and writes nothing. That happens when the fixed value is the property's omitted default. Separately, when one preserved property conflicts with the slot, every other preserved property resets to the slot's defaults. No schema in the repository has such a slot. owner: zbeyens. stop: its suggested task runs or the owner drops it.
- A node selection with no root targets the main root in core, but `rootOf` gives a named view's commands that view's root. List toggle from a named view over such a selection refuses and writes nothing, on base and on this build (`panel-diff-r3/probe/list-node-base.log`). Column and Details commands read the same helper and were not probed. owner: zbeyens. stop: its suggested task runs or the owner drops it.
- AI `show()` from a named view labels captured main-root nodes with the view's root. On this build the answer's write is then refused and changes nothing, where base empties the title. owner: zbeyens. stop: its suggested task runs or the owner drops it.
- Inserting a block at an inline boundary of the matched block lands it before that block, as on `next`. owner: zbeyens. stop: its suggested task runs or the owner drops it.

## Close

Reversals and deviations come first.

- The ask says Code on a title is refused. Code still converts the title and releases its Details, as the Code law `EDIT-DETAILS-TITLE-CODE-001` requires, so that part of the ask is not met. The Defaults row "refuse code" reverses it.

- The read is exported as `placeElementAt`, not the planned `placeBlockAt`, and Plate's AI reaches it through the platejs facade, because `ai/react` may not import `plitejs/internal` (steps 2 and 6).
- The diff panel's first round made the retyped tail drop text properties its new type refuses. The second round found that cleanup incomplete in two places, so it was reverted and the law narrowed: such a property now makes commit reject the write, as `next` does.
- The law no longer says `set`, `wrap` and `unwrap` refuse a partial restyle of a required block. Setting a type over a title's end still moves that text into the body, as on `next`, and Open work keeps it.
- Other sessions' uncommitted work in the main checkout had replaced the schema helpers and the block insert this build used. The landed patch builds the placement with main's newer slot helpers and writes AI answers through main's `tx.blocks.insert`. On that merged tree the focused suites and typechecks fail only where main already fails.
- Tests cut from the approved steps: step 1's column case, step 2's picked-block paste case, step 4's three-block case and some of step 6's repeated preservation cases. Each one duplicated a test that already fails for the same defect. Step 2's HTML case moved to the Details spec.

What landed, as a patch in the main checkout (`docs/plans/artifacts/chips/task_73c3bba9.patch`):

- Details declares its title as a prefix slot. Both corrections, the transfer veto, the title search and the Enter retag are gone.
- Plite types the blocks a split, a pasted line, a duplicate and a paste over picked blocks build for their position, and its fitter keeps a paste at the end of a title, quote or cell inside it.
- AI types its answer blocks the same way. The Column toggle checks placement first, and Quote's toggle returns whether it applied.
- The paragraph shortcut resets then toggles, and the copied menus apply Quote before they clear List.
- The docs and law changed with them: the Details and Blockquote pages and their Chinese twins, the Plite derived-block law, two editor-behavior spec rows, three changesets and a registry changelog entry.

Proof and its limits:

- Every kept new test fails at base and passes on the build. Some tests pass at base and guard prototype regressions, and the decision log's correction row names them.
- The plitejs suite fails the same 8 tests as base, and every one of the wide platejs run's 17 failures also fails at base. The registry specs and the platejs typecheck pass. The plitejs typecheck has base's 6 test-file errors. www tsc on the round-3 tree has 4 errors, all present at base (`docs/plans/artifacts/2026-10-15-details-title-slot/verify/verify-tsc-www-a1.log`). Open suggested tasks own those base failures.
- The hand drive covered typed input on titles, Enter, the turn-into heading and Text items, the paragraph shortcut, forced-layout's Enter and the Chinese Details page. The Quote, Callout and Columns menu items, Duplicate and paste rest on their specs under the "drive again" default. The one failing cell, `/blocks/installation-next-demo`, crashes on an unchanged `localStorage` read that suggested task `task_f99fb601` owns.

The review inputs, by what happened to them:

- Changed: `packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts`, `packages/platejs/src/features/details/lib/BaseDetailsPlugin.spec.ts`, `packages/platejs/src/features/details/lib/BaseDetailsPlugin.authored-tree.spec.ts`, `packages/platejs/src/features/details/lib/BaseDetailsCommands.spec.ts`, `packages/platejs/src/react/plugins/paragraph/ParagraphPlugin.tsx`, `packages/platejs/src/ai/react/AIChatPlugin.ts`, `packages/platejs/src/ai/react/AIChatPlugin.details.spec.ts`, `packages/platejs/src/features/basic-nodes/lib/BaseBlockPlugins.ts`, `packages/platejs/src/features/layout/lib/BaseColumnPlugin.ts`, `packages/plitejs/src/core/editor-schema.ts`, `packages/plitejs/src/core/public-state.ts`, `packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts`, `packages/plitejs/src/transforms-node/split-nodes.ts`, `packages/plitejs/src/transforms-node/set-nodes.ts`, `packages/plitejs/src/transforms-node/wrap-nodes.ts`, `packages/plitejs/src/transforms-node/unwrap-nodes.ts`, `packages/plitejs/src/dom/plugin/data-transfer-format.ts`, `packages/plitejs/src/internal/index.ts`, `packages/plitejs/test/slice-fit-contract.test.ts`, `packages/plitejs/test/transforms-contract.ts`, `packages/plitejs/test/dom/data-transfer-format.test.ts`, `apps/www/src/registry/components/editor/block-menu.tsx`, `apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx`, `docs/vision/plite.md`, `content/docs/(plugins)/(elements)/details.mdx`, `content/docs/(plugins)/(elements)/blockquote.mdx` and `docs/editor-behavior/markdown-editing-spec.md`.
- Read and unchanged: `packages/platejs/src/features/details/lib/BaseDetailsConversion.spec.ts`, `packages/platejs/src/react/editor/TPlateEditorCore.spec.ts` (its shortcut cases pass), `packages/platejs/src/react/features/details/DetailsPlugin.tsx`, `packages/platejs/src/ai/react/aiOutputLanding.internal.ts`, `packages/platejs/src/internal/plugin/resolvePlugins.ts`, `packages/platejs/src/lib/editor/pluginRuntimeTypes.ts`, `packages/platejs/src/migrations/migratePlateV54Ast.internal.ts`, `packages/platejs/type-tests/plate-editor-value-contracts.ts`, `packages/plitejs/src/core/content-completion.ts`, `packages/plitejs/src/core/representation.ts`, `apps/www/src/app/(app)/examples/plite/_examples/forced-layout.tsx` (its Enter now splits), `docs/vision/plate.md`, `docs/research/review-records/2026-10-04-callout-audit.json` and `docs/plans/2026-10-13-pr-5165-redo.md`.

The diff panel ran three rounds on three models.

- Round 1 applied five criticals and dismissed one, the AI capture label. Round 2 found that a named view's `show()` can still label main nodes with its own root when the text lengths match. The write that follows is refused and changes nothing, where base empties the title, and the label waits in Open work.
- Round 2 applied three criticals: the slot-literal merge, the text-property revert, and the view-root fallback in `rootOf`.
- Round 3 hit the round cap. Its one critical, an omitted-default slot literal, was dismissed as rare: the repository's 3 prefix grammars hold no slot that fixes an omitDefault property, and the seats' case throws at commit and writes nothing. Its two warnings went to Open work, and its nit was applied.

Counts: of the 10 steps, 9 are done and 1, step 10, is partial and accepted under "drive again". Of the 15 Completion Gates, 13 are done and 2 are skipped. Open work adds four items to the earlier ten.

### Attention

- Reviewed by gpt-6.1-sol at xhigh effort, as the decision-trail review. It found no critical problem and five warnings. All five are fixed in this Close: Code on a title, the www typecheck tree, the landing claim, the node-selection scope and the round-1 AI reason.
- The paragraph behavior and the Summary branch's removal are proven on the shipped bytes, and the suite comparisons hold.
- Round 3's zero count comes from the repository's own schemas. It says nothing about schemas outside the repository.
- The "drive again" default accepts the hand drive's gaps, and the decision log records the text-property revert and the export rename.
