# Basic document blocks

Page: https://claude.ai/artifact/999An1DBHuhfsBJDZKSaBG

Paragraph, heading, blockquote and horizontal rule are the blocks every Plate editor starts from. The ledger question is which basic block identities every editing and conversion consumer should share. One descriptor per block has landed: heading is one capability with a required level from 1 to 6, blockquote is a container whose default child is the paragraph, and the paragraph is a core plugin every editor installs unless the app gives the document its own root. Since the 2026-10-13 review, list, TOC and indent ask the installed heading and blockquote plugins, and both format registries resolve a descriptor the way `editor.plugin` does. Markdown lands each loose paragraph in the block the schema puts at that position. The code block keeps every input rule out through one veto. The divider shortcut and Enter on a divider read one owner for the block that follows. Copied UI and DOCX export reach these blocks through their nominal descriptors.

## Public API

Copied UI toggles a heading through the nominal descriptor.

```tsx
// apps/www/src/registry/components/editor/basic-blocks.tsx
editor.plugin(HeadingPlugin).update.toggle({ level: 1 });
```

Copied menus check that heading is installed, then insert one.

```tsx
// apps/www/src/registry/components/editor/slash.tsx
isAvailable: (editor) => editor.plugin(BaseHeadingPlugin).installed,
// ...
tx.plugin(BaseHeadingPlugin).upsert({ level: 1 }, { select: true });
```

The code block contributes its type to `inputRuleVeto` beside the review-mark veto, so no input rule runs inside it. A custom block that holds literal text contributes the same point.

```ts
// packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts
contributions: [
  authoredVeto.of((element) =>
    element.type === context.schema.type ? 'code-block' : null
  ),
  inputRuleVeto.of(context.schema.type),
],
```

The copied autoformat kit calls the substitution rule directly, with no code-block guard of its own.

```ts
// apps/www/src/registry/components/editor/autoformat.tsx
const arrowsRule = createTextSubstitutionInputRule({
  patterns: [
    { format: '→', match: '->' },
    { format: '←', match: '<-' },
    { format: '⇒', match: '=>' },
    { format: '⇐', match: ['<=', '≤='] },
  ],
});
```

Inside the packages, list finds the heading through its real plugin; TOC, indent and Details do the same.

```ts
// packages/platejs/src/features/list/lib/listIndex.internal.ts
const heading = editor.plugin(BaseHeadingPlugin);

return heading.installed ? heading.schema.type : undefined;
```

## Main changes

- `packages/platejs/src/features/basic-nodes/lib/BaseBlockPlugins.ts` owns blockquote, horizontal rule and their input rules; `BaseHeadingPlugins.ts` owns heading with its level property and rules.
- `packages/platejs/src/lib/plugins/paragraph/BaseParagraphPlugin.ts` owns the paragraph, which `getCorePlugins.internal.ts` installs in every editor.
- Plite's derived schema names `paragraph` as the document root's default block (`packages/plitejs/src/core/schema-compiler.ts`); an application `schema.root` replaces it.
- The input-rule executor (`packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts`) runs no rule while the selection sits in an element whose type a plugin contributed to `inputRuleVeto`, and none when `insertText` names an explicit location other than the selection. The seven copied code-block checks are gone.
- One resolver in `packages/platejs/src/internal/plugin/pluginFormatOperation.ts` answers both format registries' `has` and `type` for a descriptor with the `editor.plugin` identity test, remembered per format operation.
- Plite's `breakAtSelectedBlockVoid` (`packages/plitejs/src/editor/block-void-break.ts`) builds the void's immediate parent's default for the next index, through a helper it shares with `blocks.reset`, and changes nothing when `canPlaceAt` refuses. The divider shortcut ends with `tx.break.insert()` on that owner.
- Markdown builds its paragraph with the installed paragraph's type, else a reserved internal type (`packages/platejs/src/internal/plugin/markdownParagraph.ts`). Without a paragraph, a document landing pass replaces each top-level internal paragraph with the root's default for its position, and the serializer writes that block back as a Markdown paragraph.
- The code block's `insertData` inserts any non-empty plain-text paste inside itself as typed, before the fragment path and every decoder.

## What other editors do

Read at prosemirror-model `6264de0`, prosemirror-markdown `221ec60`, prosemirror-inputrules `ea304c0`, Lexical `dd5c41b`, Tiptap `91c51be` and Slate `945a484`, by source only; none was run. ProseMirror and Tiptap name blocks by schema string, derive the default block from the content model and skip input rules inside code blocks centrally. Lexical uses node classes and a built-in paragraph.

| Editor | How features find another block | Default block for loose inline content | When the paragraph is missing | Input rules inside a code block |
| --- | --- | --- | --- | --- |
| ProseMirror | Schema name, `schema.nodeType('paragraph')` in the Markdown parser | `ContentMatch.defaultType` of the content model, used by DOM parse wrapping | The Markdown parser throws at construction for an unknown node name | Skipped centrally unless the rule sets `inCode` (`prosemirror-inputrules` `inputrules.ts:120`) |
| Tiptap | Extension name strings, such as the TOC's `anchorTypes: ['heading']` | `defaultBlockAt(match)`, the first text block without required attributes | Its Markdown manager writes a literal `'paragraph'` node | Skipped centrally when the parent's spec sets `code` (`core/src/InputRule.ts:103`) |
| Lexical | Node classes, such as `$isHeadingNode` and `dependencies: [HeadingNode]` | `$createParagraphNode()`, a core node every editor has | Cannot happen; paragraph is built in | Each Markdown transformer decides |
| Slate | Application strings; core elements have only `children` | The application decides | Not a core concept | The application decides |
| Plate | Nominal descriptors in list, TOC, indent and both format registries; by-name lookups for optional image and table peers, and direct paragraph type reads in about twenty editing paths | The installed paragraph, else the schema's default for each top-level position | Markdown lands loose paragraphs in the schema's default; HTML import does the same | Skipped centrally for any element that contributes `inputRuleVeto`, as ProseMirror skips `spec.code` |

## Document shape

Typing `---` in an empty paragraph stores an empty divider and puts the caret in the block after it.

```json
[
  { "type": "horizontalRule", "children": [{ "text": "" }] },
  { "type": "paragraph", "children": [{ "text": "" }] }
]
```

Inside a blockquote in an app whose root default is `title`, Enter on a divider and `---` both land the quote's declared paragraph.

```json
[
  {
    "type": "blockquote",
    "children": [
      { "type": "horizontalRule", "children": [{ "text": "" }] },
      { "type": "paragraph", "children": [{ "text": "" }] }
    ]
  }
]
```

With Markdown and bold installed, plain text pasted into a code block keeps every character.

```json
[{ "type": "codeBlock", "children": [{ "text": "a **b** c" }] }]
```

Markdown import of `hello` in an app whose root default is a `title` block returns the app's own block, and serializing it gives `hello` back.

```json
[{ "type": "title", "children": [{ "text": "hello" }] }]
```

## Layer and owner

| Owner | Layer | Package | Why |
| --- | --- | --- | --- |
| `inputRuleVeto` point and its check in the input-rule executor | Plate | `core` (`packages/platejs/src/lib/plugins/input-rules/`) | Core runs every input rule and cannot import a feature, so the feature contributes and core reads |
| Code block's contribution to `inputRuleVeto` and its plain-text paste | Plate | `standard/code-block` | The code block owns literal editing inside itself, as the editing spec says |
| Heading and blockquote identity in list, TOC and indent | Plate | `standard/list`, `toc`, `standard/indent` | Edges `standard/list -> standard/basic-nodes`, `standard/indent -> standard/basic-nodes` and `toc -> standard/basic-nodes`; list's code-block Tab check stays a by-name lookup of an optional peer |
| Nominal format registry resolver | Plate | `core` (`packages/platejs/src/internal/plugin/pluginFormatOperation.ts`), reused by `markdown` | Same schema-family, identity and lineage test as `editor.plugin`, against the candidate configuration's plugin of that name |
| Markdown landing | Plate | `markdown` | Markdown owns its paragraph syntax; a document landing pass asks the schema for each position's default |
| The block after a divider | Plite | `plitejs` (`packages/plitejs/src/editor/block-void-break.ts`) | Enter, Shift+Enter and the divider shortcut read one owner, which builds the immediate parent's default and admits it with `canPlaceAt` |
| Horizontal-rule shortcut | Plate rule, Plite owner | `standard/basic-nodes` calls `tx.break.insert()` | Declines when that owner places no block |

## Open work

- Copied lint UI compares the code block's plugin name to a stored type, so a remapped code block is linted as prose (`apps/www/src/registry/components/editor/lint.tsx:21`; inferred from source, not run). owner: zbeyens. stop: the next review of the `lint` ledger scope.
- About twenty editing paths read the paragraph's type directly and throw or misplace text without it, such as `BaseCodeBlockPlugin.ts:302` and `:723`, `TrailingBlockPlugin.ts:26`, `BaseDetailsPlugin.ts:156-390`, `BaseColumnPlugin.ts:334`, `BaseTablePlugin.ts:590`, `:2446` and `:2637`, `BaseListPlugin.ts:1044` and `CodeBlockRules.ts:7` (source reads, not run). owner: zbeyens. stop: the next review of each owning ledger scope.
- In a paragraph-less app, a Markdown slice parse and an internal paragraph inside a container refuse; HTML import refuses loose text in a paragraph-less root with a required first slot. owner: zbeyens. stop: the next `model` review.
- An image or upload plugin registered before the code block claims a pasted image URL inside a code block (`BaseImagePlugin.ts:432-451`, `BaseUploadPlugin.ts:885-905`; source read, not run). owner: zbeyens. stop: the next code-block review.
- The code block's `text/html` format only serves pastes without plain text; folding it into `insertData` would delete one of three paste paths. owner: zbeyens. stop: the next code-block review.
- `createMarkInputRule` consumes the trigger key when a mark it applies is not installed, because `apply` returns `undefined` instead of declining (`createInputRules.ts:97-103`). owner: zbeyens. stop: the next input-rules review.
- No input rule can opt back in inside a vetoing element; no current rule needs to. owner: zbeyens. stop: the first rule that asks for it.
- The open-line break after a selected void inserts a hard-coded `paragraph` (`packages/plitejs/src/react/editable/mutation-block-editing.ts:21-24` and `:67-95`), so a paragraph-less app gets a type its schema lacks; it should read the void-break owner. owner: zbeyens. stop: the next editing review.
- Clipboard Markdown serializes each copied piece as a whole application document. A fragment serializer should encode copied pieces with their owned roots, without root rules or position-based landing. In an app without a paragraph plugin, copying part of a block that no Markdown mapping claims writes no `text/markdown`, and such an app block stored as `paragraph` writes none where it wrote its text before; a block with its own mapping still writes it. owner: zbeyens. stop: the next Markdown review, as a new plan whose panel runs before any change to the encoder.
- A complete Plite schema without a `paragraph` element, beside Plate's enabled paragraph plugin, gets `paragraph` nodes from Markdown, so nothing lands and a document parse fails to fit. owner: zbeyens. stop: the next Markdown review.
- The 2026-10-13 build's paired speed probe of the veto and the resolver never ran on a quiet host; four runs were inconclusive on host load, none showing a cost beyond same-code noise (`docs/plans/2026-10-13-basic-review.md` step 15). owner: zbeyens. stop: one run on a quiet host exits 0 or 1, and exit 1 sends the veto or the resolver back to `architect`.
- After the 2026-10-13 build, the `platejs` typecheck fails its `migrations` task and the basic-nodes partition fails 11 authored-tree cases on another session's uncommitted authored-mark rewrite; both fail the same way without this build's changes (`docs/plans/2026-10-13-basic-review.md`, Package proof gate). owner: zbeyens. stop: both pass once that work lands, or a failure that names this build's files reopens the gate.
- The API reference manifest lacks `inputRuleVeto`, and `ownsExit` on `EditorElementBehavior` and `EditorSchemaElement`, because the generator throws on another session's undecided `SchemaRoot` export. owner: zbeyens. stop: the `SchemaRoot` decision lands and `pnpm --filter www api-reference` regenerates the manifest.
- At 375 px, a component page's file card clips its Copy buttons past the card's right edge. owner: zbeyens. stop: the suggested task "Fix clipped Copy buttons on component file cards".
- `restoreEditorSchemaContract` takes element behavior from the compile it checks the contract against but rebuilds every other field from the contract, so one restored element has two sources. Returning that compile with its validators rebound would delete `restoreElement` and its sibling helpers (`docs/plans/2026-10-14-exit-owner.md`, plan panel round 2). owner: zbeyens. stop: another session's uncommitted rewrite of `restoreEditorSchemaContract` lands, then a plan for restore from the compile.
- The schema compiler does not check that `ownsExit`, `object`, `atom` or any other behavior flag is a boolean, so untyped JavaScript can declare `ownsExit: 'yes'`, which compiles and writes a contract that `readEditorSchemaContract` refuses (`docs/plans/2026-10-14-exit-owner.md`, Named limits). owner: zbeyens. stop: the next schema-compiler review, as a plan that refuses non-boolean flags.
- After the 2026-10-14 exit build, `plugins.generated.ts` and `plugins.schema.json` still lack the code block's and callout's `ownsExit`, because `pnpm --filter www editor:generate` fails at HEAD on the `authored-context` element, which has no Plate plugin owner (`docs/plans/2026-10-14-exit-nearest-structure.md`, step 5). owner: zbeyens. stop: `editor:generate` passes at HEAD and regenerates both files, and `pnpm --filter www exec plate generate --check src` passes.
- `tx.break.exit` can land the caret in a container default that is a read-only text block, where typing changes nothing, because the landing helper checks that the caret path ends in text, not in editable text (a custom schema in the same diff panel, whose Sol seat found no shipped schema with a read-only default). owner: zbeyens. stop: a shipped schema declares a read-only default block, or the owner rules that a landing refuses read-only text.
