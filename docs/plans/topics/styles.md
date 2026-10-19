# Text marks and presentation

Page: https://claude.ai/artifact/1B9JEa2wYM9HLsa6ncHkxH

The ledger asks which mark and style values belong to document semantics and which belong to view presentation. Semantic marks, such as bold, italic, underline, strikethrough, code, kbd, script and highlight, are flat booleans from `platejs` with semantic HTML tags and Markdown nodes. Bold is the one owner of font weight: no plugin stores a separate weight, and a pasted CSS weight decodes into bold or nothing. Author-chosen presentation values persist flat on the node they style: color, background color, font family and font size as raw CSS strings on text, line height as a validated number, text align as an enum, and text indent as a level whose pixel offset and unit stay in plugin state. The [2026-10-04 audit](../../research/review-records/2026-10-04-styles-audit.json) found the split sound except for weight and one misplaced root helper, and the [2026-10-19 plan](../2026-10-19-styles-review.md) deleted the weight plugin and moved the helper into the copied size control.

## Public API

The copied font kit installs the four presentation marks.

```tsx
// apps/www/src/registry/components/editor/font.tsx
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontFamilyPlugin,
  FontSizePlugin,
} from 'platejs/react';

export const FontKit = [
  FontColorPlugin,
  FontBackgroundColorPlugin,
  FontSizePlugin,
  FontFamilyPlugin,
];
```

Bold is a boolean mark with Markdown input rules in the copied marks kit.

```tsx
// apps/www/src/registry/components/editor/basic-marks.tsx
import { BoldRules, MarkComboRules } from 'platejs';
import { BoldPlugin } from 'platejs/react';

export const BasicMarksKit = [
  BoldPlugin.configure({
    inputRules: [
      BoldRules.markdown({ variant: '*' }),
      BoldRules.markdown({ variant: '_' }),
      MarkComboRules.markdown({ variant: 'boldItalic' }),
    ],
  }),
];
```

The DOCX font test installs only the style marks.

```tsx
// apps/www/src/__tests__/package-integration/docx/font.slow.tsx
plugins: [
  FontBackgroundColorPlugin,
  FontFamilyPlugin,
  FontColorPlugin,
  FontSizePlugin,
],
```

A bold Word run imports as one bold flag.

```tsx
// apps/www/src/__tests__/package-integration/docx/font.slow.tsx
<htext fontFamily="Cambria, serif" fontSize="12pt" bold>
  Definition Term
</htext>
```

The copied size box has its own parser, so a saved `12pt` shows as 16. Any unit other than px and pt shows as saved, and the plus and minus buttons leave it alone.

```tsx
// apps/www/src/registry/components/editor/font-size-toolbar-button.tsx
const toPixels = (value: string) => {
  const match = /^(\d+(?:\.\d+)?)(px|pt)?$/.exec(value.trim());

  if (!match) return undefined;

  const size = Number(match[1]);

  return Math.round((match[2] === 'pt' ? (size * 4) / 3 : size) * 10) / 10;
};

if (fontSize) {
  return String(toPixels(fontSize) ?? fontSize);
}
```

## Main changes

- `packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.ts` owns the presentation plugins and their HTML and Markdown mappings.
- `packages/platejs/src/features/basic-nodes/lib/BaseMarkPlugins.ts` owns bold. Its HTML rule reads each pasted element's own `font-weight`: 600 and up is bold, `bolder`, `lighter`, `inherit` and `unset` count from the parent's drawn weight, headings and table headers draw at 700, and a lighter weight turns bold off only inside text drawn bold. `<b>` and `<strong>` stay bold unless they state a weight the rule can read.
- `packages/platejs/src/lib/plugins/html/HtmlPlugin.ts` checks a decoder's mutations against its element's own attributes and child list. Once after decode, it drops a text value equal to its omitted default when one property owns that key everywhere, so neither the fit nor a parsed slice sees a stored `bold: false`.
- `packages/platejs/src/docx/html/cleanWordHtml.internal.ts` leaves a block's weight on the block instead of copying it onto each run, so bold reads it once.
- `packages/plitejs/src/core/change/root-change.ts` buffers the slices a section joins and concatenates them once, so a fit that strips a default from every block costs time linear in the blocks.
- `packages/platejs/src/migrations/migratePlateV54.ts` refuses a document that would not fit the target schema with every pending v53 suggestion rejected.

## What other editors do

| Editor | Bold from a CSS weight | A separate weight mark | Source |
| --- | --- | --- | --- |
| ProseMirror | `strong` reads `bold`, `bolder` and 500 to 999, and `font-weight: 400` clears it | none | `../prosemirror-schema-basic/src/schema-basic.ts`, lines 137 to 146 |
| Tiptap | `Bold` reads the same pattern and clears on 400 | none; `TextStyle` ships color, background, family, size and line height | `../tiptap/packages/extension-bold/src/bold.tsx`, lines 66 to 81 |
| BlockNote | uses Tiptap's `Bold` as a boolean style | none | `../BlockNote/packages/core/src/blocks/defaultBlocks.ts`, line 136 |
| CKEditor 5 | `bold` reads `bold` or any number from 600 | none | `../ckeditor5/packages/ckeditor5-basic-styles/src/bold/boldediting.ts`, lines 57 to 67 |
| Lexical | the bold format reads 700 or `bold` | none | `../lexical/packages/lexical/src/nodes/LexicalTextNode.ts`, lines 1408 to 1411 |
| Plate | `bold` reads each pasted element's stated weight, 600 and up is bold, `bolder`, `lighter`, `inherit` and `unset` count from the parent's weight, and a light weight turns bold off only inside bold text; `<b>` and `<strong>` are bold unless they state a readable weight | none | `BaseMarkPlugins.ts` |

Plate keeps 600 as its line, as the Plite paste example does. Like ProseMirror and Tiptap, it reads each element's own weight. It differs in three places: relative weights count from the parent's weight, a light weight turns bold off only inside bold text, and a bold tag whose weight it cannot read stays bold.

## Document shape

Bold is the only stored weight. A v53 leaf with a saved `fontWeight` stops the upgrade in a schema that declares none. The document model guide's pre-pass sets bold from the saved weight, because v53 drew the weight on top of bold, so a heavy weight becomes bold.

```json
{ "bold": true, "text": "Term" }
```

A light weight beside bold drew plain in v53, so the pre-pass drops both.

```json
{ "text": "Term" }
```

An app that declares its own `fontWeight` text property keeps every saved value unchanged and owns that second truth.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| A fit that strips many default values copies each token once | Plite | `plitejs` (`core/change/root-change.ts`) | The composer owns how sections join |
| Bold reads a pasted CSS weight | Plate | `platejs` (`features/basic-nodes`) | Bold is the one owner of boldness |
| The decode's mutation check reads the element's own attributes and children | Plate | `platejs` (`lib/plugins/html/HtmlPlugin.ts`) | Serializing each matched subtree twice cost the square of nesting depth |
| Turned-off text values drop once after decode, for a key one property owns | Plate | `platejs` (`lib/plugins/html/HtmlPlugin.ts`) | The decode owns the values it writes, and a slice does not know where it lands |
| Word cleanup keeps a block's weight on the block | Plate | `platejs` (`docx/html`) | Bold reads the block's own weight, and a copied relative weight counts twice |
| Saved weights | Plate | none; the closed schema refuses them | Release steps keep stored intent (`plate.md` lines 607 to 609), and no weight converts exactly |
| A legacy suggestion whose rejected document would not fit refuses | Plate | `platejs` (`migrations`) | The v54 step owns legacy suggestions |
| The font-size parser | Plate registry | copied `font-size-toolbar-button.tsx` | One consumer (`plate.md` lines 96 to 97) |

## Hard cuts and app migration

Bold is the only plugin that stores font weight, and the copied size box parses its own units. An app lists bold and its style plugins:

```tsx
const plugins = [BoldPlugin, FontSizePlugin];
```

`migrateV54` converts no saved weight. Each saved `fontWeight` stops the upgrade, and the app picks one of two ways out. It declares its own `fontWeight` text property, or it strips the weights before `migrateDocument` with the pre-pass in the document model guide's Saved font weights section, which has a raw v53 form and an envelope form. The pre-pass touches only text leaves, inside `children` and v53 media `caption` arrays. It refuses a weight it cannot read, such as `inherit` or `0x2bc`. In a raw v53 value it refuses a light weight inside a heading or table header cell. The envelope form refuses every light weight, the saved selection's included, because an app built from v2 source names its own block types and the pre-pass cannot tell which of them draw bold. It also refuses a weighted leaf with a pending format change and any pending change of the weight itself. An app built from unreleased v2 source that installed the weight plugin bumps `EditorSchema.version`, lists its old fingerprint under `sourceFingerprints` and runs the envelope form first. A `<span style="font-weight: bold;">` in stored MDX has no decoder: in an editor with a style plugin, a span that holds only a weight refuses the parse, and a weight beside another style drops.

## Native behavior and proof

| Behavior | Current rule | Proof surface |
| --- | --- | --- |
| HTML paste of a weight | Bold reads each element's stated weight as Main changes says. Inside a heading or table header a light weight stores nothing, so it draws as bold as its block, as before this change. A parsed slice keeps no turned-off value whose key one property owns. On the server, linkedom keeps style text as written. A repeated property reads its last declaration, and the server ignores a weight in a `font` shorthand, under a capitalized property or beside a comment, so `<strong>` stays bold there, as before this change. A weight CSS rejects, such as `0x258`, reads as no weight | happy-dom package tests through `editor.api.dom.clipboard.insertData` and `editor.api.html.parseSlice`; `platejs/html/server` cases for `!important` and a weight CSS rejects; a native Chromium paste case in `apps/www/tests/browser/clipboard.spec.ts` |
| Word paste | A bold run stores `bold` only, and a relative block weight counts once | `WordPastePlugin.spec.ts` and the DOCX slow tests |
| Markdown and MDX | Bold reads `**`. A weight span refuses or drops its weight, as Hard cuts says | the two weight-span cases in `mdxMarks.spec.tsx` |
| Paste speed | A paste that turns bold off on many leaves copies each token once in Plite's composer, and the decode's mutation check and weight walk stay linear in nesting depth | a plitejs work-count test and a platejs DOM work-count test |

## Open work

- Italic, underline and strikethrough keep the subtree veto that `EDIT-CLIPBOARD-HTML-MARK-001` names. Owner: a suggested task. Stop: none.
- The closed-schema error names no node path, so the weight refusal says what but not where. Owner: a suggested task. Stop: none.
- The Markdown runtime drops a span style that no plugin claims, such as a weight beside a size, without a report. Owner: a suggested task. Stop: none.
- MDX `<b>` and `<strong>` stay plain text. Owner: none until an ask needs them.
- A pending v53 superscript add migrates to a `superscript` format change on a leaf that stores `script: 'sup'`, so rejecting it leaves the superscript. Owner: a suggested task. Stop: none.
- Plate's HTML decode copies each marked element's decoded value onto every text below it, so nested marks of any kind cost the square of their depth. The fix passes inherited values down the tree and gives decoders one style reader per parse, which retires bold's own weight cascade. Owner: a suggested task. Stop: none.
- Bold cannot store text lighter than its heading or table header, so such text pastes as bold as its block. Owner: the owner, through a second weight record. Stop: none.
- The paste decode's mutation check sees only the decoded element's own attributes and child list, so a decoder that edits a descendant passes. Owner: a suggested task. Stop: none.
- `migrateV54` loads a legacy suggestion whose rejected document the fit repairs, and the editor's reject then reports invalid, as before this change. Owner: a suggested task. Stop: none.
- On the server, linkedom keeps style text as written. A repeated style property reads its last declaration, so an earlier `!important` weight loses, and the server ignores a weight in a `font` shorthand, under a capitalized property or beside a comment. Other styles keep `!important` in their value. Owner: a suggested task for a server CSS parser that honors priority, case and shorthands. Stop: none.
- The guide's pre-pass lives in three copies, and nothing checks that they match. Owner: a suggested task for a check script. Stop: none.
- `t_15c1b9b9` Time bold's pasted-weight decode on a quiet host. Owner: the owner. Stop: that task landing or being dropped.
- `t_6e758b7d` Make the structural decision law give one document for every decision order. Owner: the owner. Stop: that task landing or being dropped.
