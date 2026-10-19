---
review_scopes: [styles]
verdict: pursue
review_basis: [2026-10-04-styles-audit]
work_kind: implementation
review_commit: 369805908e9f8a2d6b54008e6a7965d2fb5fe967
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, docs/vision/plite.md, .agents/playbooks/references/architecture.md, docs/plans/2026-07-07-plate-next-basic-styles-package-review.md, docs/plans/2026-10-04-ledger-triage-audit.md, docs/plans/2026-10-18-layout-review.md, docs/research/sources/lexical/clipboard-and-paste.md, docs/research/sources/tiptap/conversion-and-export.md, docs/editor-behavior/markdown-editing-spec.md, packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.ts, packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.spec.ts, packages/platejs/src/features/basic-nodes/lib/BaseMarkPlugins.ts, packages/platejs/src/features/basic-nodes/lib/BaseMarkPlugins.spec.tsx, packages/platejs/src/features/basic-nodes/lib/index.ts, packages/platejs/src/react/features/basic-styles/BasicStylePlugins.tsx, packages/platejs/src/utils/plate-keys.ts, packages/platejs/src/utils/index.ts, packages/platejs/src/root.tsx, packages/platejs/src/internal/plugin/markdownParagraph.ts, packages/platejs/src/utils/plugins/ExitBreakPlugin.ts, packages/platejs/src/lib/plugins/html/HtmlPlugin.ts, packages/platejs/src/lib/plugins/html/htmlDom.ts, packages/platejs/src/lib/plugin/MarkdownNodeMapping.ts, packages/platejs/src/markdown/lib/internal/markdownMappings.ts, packages/platejs/src/docx/html/cleanWordHtml.internal.ts, packages/platejs/src/migrations/documentMigrations.ts, packages/platejs/src/migrations/documentMigrationTarget.internal.ts, packages/platejs/src/migrations/migratePlateV54.ts, packages/platejs/src/migrations/migratePlateV54.spec.ts, packages/platejs/src/migrations/migratePlateV54BuiltIns.internal.ts, packages/platejs/src/migrations/migratePlateV54Ownership.internal.ts, packages/platejs/src/migrations/migratePlateV54Profile.internal.ts, packages/platejs/src/migrations/migratePlateV54Suggestions.internal.ts, packages/platejs/src/migrations/migratePlateV54Suggestions.spec.ts, packages/platejs/src/migrations/v53-manifest.internal.ts, packages/plitejs/src/core/schema-compiler.ts, packages/plitejs/src/core/editor-schema.ts, packages/plitejs/src/core/selection-protocol.ts, packages/platejs/src/html/htmlConformance.spec.ts, packages/platejs/src/markdown/lib/markdownConformance.spec.ts, packages/platejs/src/markdown/lib/mdxMarks.spec.tsx, packages/platejs/src/markdown/lib/__tests__/createTestEditor.tsx, packages/platejs/src/docx/paste/lib/WordPastePlugin.spec.ts, apps/www/src/registry/components/editor/font.tsx, apps/www/src/registry/components/editor/basic-marks.tsx, apps/www/src/registry/components/editor/basic-nodes.tsx, apps/www/src/registry/components/editor/heading.tsx, apps/www/src/registry/components/editor/font-size-toolbar-button.tsx, apps/www/src/registry/components/editor/mark-toolbar-button.spec.tsx, apps/www/src/registry/examples/pagination-demo.tsx, apps/www/src/__tests__/package-integration/docx/font.slow.tsx, apps/www/src/__tests__/package-integration/docx/headers.slow.tsx, apps/www/src/__tests__/package-integration/docx/testDocxDeserializer.tsx, apps/www/api-reference.config.json, content/docs/(plugins)/(styles)/font.mdx, content/docs/(plugins)/(marks)/bold.mdx, content/docs/(guides)/document-model.mdx, apps/www/src/app/(app)/examples/plite/_examples/mark-utils.ts, apps/www/src/app/(app)/examples/plite/_examples/paste-html-import.ts, apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx, apps/www/src/app/(app)/examples/plite/_examples/iframe.tsx, apps/www/src/app/(app)/examples/plite/_examples/hovering-toolbar.tsx, apps/www/src/app/(app)/examples/plite/[example]/page.tsx, apps/www/src/app/(app)/examples/plite/plite-example-client.tsx]
review_upstreams: ['../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da', '../prosemirror-schema-basic@6daea265c3983a04f272f510b99493868919d374', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163']
---

# Styles: make bold the one owner of font weight

Status: executed, landed on next for your review
Topic: styles
Playbook: plan

**Pursue: delete `FontWeightPlugin` and let bold own weight.** `review-ledger.mjs next` returned `styles`, a Pursue from the 2026-10-04 audit that no plan adopted. Most of the split between semantic marks and presentation values holds. Weight is the exception, and the probe measured it. A pasted `font-weight: 700` stores `bold` and `fontWeight` together, turning bold off leaves the text bold, and the default kits, which never install the weight plugin, drop 800 and `bolder`. No reference editor ships a weight mark, and every one reads heavy weights as bold. `toUnitLess` has one user, the copied font-size control, so it moves there. The architect arena kept that target. The plan panel's first round then cut its migration rule, because v53 drew a saved weight on top of bold, so no saved weight turns into bold exactly. The v54 step converts none. The second round and the pre-acceptance probe reshaped the paste rule. Bold reads each element's stated weight, resolves only relative weights against the parent, and turns bold off only inside bold text. The probe also found that a paste that turns bold off many times costs time that grows with the square of its size in Plite's change composer, so the plan fixes that composer first. The third round found that the speed test timed a copy of the decoder, not the code that ships. Rebuilt, the test showed nested weight spans costing two to seven times base in Plate's HTML decode, and resets inside bold costing 1.6 to 1.8 times the same document without them. The plan fixes both in the decode, in its mutation check and in how it handles turned-off marks.

## Brief

### What will change?

Bold is now the only mark for font weight. Heavy weights paste bold, a light word inside bold pastes plain, and pastes that unbold many words do far less work, though the speed check never got a quiet machine.

### What could go wrong?

Apps that added the weight plugin break, and their saved weights stop the upgrade until kept or stripped. Server paste still misses weights in shorthands, capitals or comments. Old suggestions the new schema cannot undo also stop the upgrade.

## Teach

Text in Plate carries marks. Bold is on or off, while color, font, size and weight hold any CSS value. Today bold and weight overlap. A pasted bold word saves both, so turning bold off leaves it bold, and very heavy weights paste plain in the default setup.

The change deletes the weight plugin. On paste, bold reads each element's own weight, and 600 or more is bold. Relative weights, such as bolder, count from the parent. A light weight turns bold off only inside bold text. Three paste costs grew with the square of the paste or its nesting. Each one now does its work once.

Old documents keep their saved weights. The upgrade converts none, because v53 drew the weight on top of bold. An app with weights declares its own weight property or strips them first. The size box gets its own parser for pixels and points.

## Public API

The weight plugin is gone, so the Word import test installs only the style marks.

```tsx before
// apps/www/src/__tests__/package-integration/docx/font.slow.tsx
plugins: [
  FontBackgroundColorPlugin,
  FontFamilyPlugin,
  FontColorPlugin,
  FontSizePlugin,
  FontWeightPlugin,
],
```

```tsx after
// apps/www/src/__tests__/package-integration/docx/font.slow.tsx
plugins: [
  FontBackgroundColorPlugin,
  FontFamilyPlugin,
  FontColorPlugin,
  FontSizePlugin,
],
```

A bold Word run imports as one bold flag.

```tsx before
// apps/www/src/__tests__/package-integration/docx/font.slow.tsx
<htext
  fontFamily="Cambria, serif"
  fontSize="12pt"
  fontWeight="bold"
  bold
>
  Definition Term
</htext>
```

```tsx after
// apps/www/src/__tests__/package-integration/docx/font.slow.tsx
<htext fontFamily="Cambria, serif" fontSize="12pt" bold>
  Definition Term
</htext>
```

The weight commands go with the plugin.

```ts before
// packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.spec.ts
editor.update.fontWeight.set('bold');
```

```ts after
```

The copied size box has its own parser, so a saved `12pt` shows as 16. Any unit other than px and pt shows as saved, and the plus and minus buttons leave it alone.

```tsx before
// apps/www/src/registry/components/editor/font-size-toolbar-button.tsx
import { toUnitLess } from 'platejs';

if (fontSize) {
  return toUnitLess(fontSize);
}
```

```tsx after
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

## What other editors do

The comparison in the subject file holds, read at the commits its History lists. One row changes. ProseMirror and Tiptap read `<b>` and `<strong>` as bold, `bold`, `bolder` and 500 and up as bold, and a 400 as a reset (`../prosemirror-schema-basic/src/schema-basic.ts`, lines 143 to 146; `../tiptap/packages/extension-bold/src/bold.tsx`, lines 65 to 83). Plate keeps 600 as its line, as the Plite paste example does (`paste-html-import.ts`, lines 132 to 185). Like those editors, it reads each element's own weight. It differs in three places: `bolder`, `lighter`, `inherit` and `unset` count from the parent's weight, a light weight turns bold off only inside bold text, and a bold tag whose weight it cannot read stays bold.

| Delta | Editor | Bold from a CSS weight | A separate weight mark | Source |
| --- | --- | --- | --- | --- |
| changed | Plate | `bold` reads each pasted element's stated weight, 600 and up is bold, `bolder`, `lighter`, `inherit` and `unset` count from the parent's weight, and a light weight turns bold off only inside bold text; `<b>` and `<strong>` are bold unless they state a readable weight | none | `BaseMarkPlugins.ts` |

## Document shape

The guide's pre-pass sets bold from the saved weight, because v53 drew the weight on top of bold. A heavy weight becomes bold.

```json before
{ "fontWeight": "800", "text": "Term" }
```

```json after
{ "bold": true, "text": "Term" }
```

A light weight beside bold drew plain in v53, so the pre-pass drops both.

```json before
{ "bold": true, "fontWeight": "400", "text": "Term" }
```

```json after
{ "text": "Term" }
```

Without a pre-pass, any saved `fontWeight` stops the upgrade with Plate's closed-schema error, `Unknown text property "fontWeight" in closed editor schema.` That covers a leaf, a saved selection's insertion marks and a weight suggestion's marks. A v53 suggestion that removed a weight loaded anyway and could then never be rejected (`weight-remove-reject-a2.log`). The v54 step now also fits the document with every pending change rejected, and refuses when the target cannot hold it. An app that declares a `fontWeight` text property keeps every value unchanged.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| A fit that strips many default values copies each token once | Plite | `plitejs` (`core/change/root-change.ts`) | The composer owns how sections join; its join is the quadratic cost |
| Bold reads a pasted CSS weight | Plate | `platejs` (`features/basic-nodes`) | Bold is the one owner of boldness |
| The decode's mutation check reads the element's own attributes and children | Plate | `platejs` (`lib/plugins/html/HtmlPlugin.ts`) | The check serialized each matched element's subtree twice, which costs the square of nesting depth |
| Turned-off text values drop once after decode | Plate | `platejs` (`lib/plugins/html/HtmlPlugin.ts`) | The decode owns the values it writes; a fit change per leaf and slices that keep `false` both come from leaving them |
| Word cleanup stops copying a block's weight onto an inner span | Plate | `platejs` (`docx/html`) | Bold reads the block's own weight, and a copied relative weight counts twice |
| The weight plugin, its key and its portal go | Plate | `platejs`, `platejs/react` | Hard cut of the duplicate owner |
| Saved weights | Plate | none; the closed schema refuses them, as it does today in every kit without the plugin | Release steps keep stored intent (`plate.md` lines 607 to 609), and no weight converts exactly |
| A legacy suggestion whose rejected document would not fit refuses | Plate | `platejs` (`migrations`) | The v54 step owns legacy suggestions, and it loaded one that could never be rejected |
| The font-size parser | Plate registry | copied `font-size-toolbar-button.tsx` | One consumer (`plate.md` lines 96 to 97) |

The entrypoint graph allows each placement, because `basic-nodes` depends only on core (`tooling/entrypoints/entrypoint-dag.mjs`).

## Hard cuts and app migration

Deleted: `BaseFontWeightPlugin`, `FontWeightPlugin`, `PLUGINS.fontWeight`, the `editor.update.fontWeight` and `editor.read.fontWeight` portal, the root `toUnitLess` export and its private `digitRegex`.

Callers that break, from the blast radius: the DOCX font and headers tests, `htmlConformance.spec.ts`, the Markdown `createTestEditor.tsx`, `markdownConformance.spec.ts`, `mdxMarks.spec.tsx`, `BaseStylePlugins.spec.ts`, the `toUnitLess` mock in `mark-toolbar-button.spec.tsx`, the copied `font-size-toolbar-button.tsx`, `font.mdx` and `font.cn.mdx`, the Tiptap research source's line 15, `apps/www/api-reference.config.json`, the generated API manifest and the generated registry JSON. `templates/plate-playground-template` still imports `toUnitLess`. CI regenerates templates and this repository never edits them by hand, so the build leaves it. The dated research probe under `docs/research/probes/2026-09-28-conversion-boundary` records a past measurement and stays as history. No v53 registry kit or template installed the weight plugin (`git grep FontWeightPlugin 2f87593f95 -- apps/www/src/registry templates` finds nothing), so every app that breaks installed it by hand.

An app that installed the plugin drops it from its plugin list:

```tsx before
import { FontWeightPlugin } from 'platejs/react';

const plugins = [BoldPlugin, FontSizePlugin, FontWeightPlugin];
```

```tsx after
const plugins = [BoldPlugin, FontSizePlugin];
```

Its saved v53 documents still go through `migrateV54`, which converts no weight. Each saved `fontWeight` stops the upgrade, and the app picks one of two ways out. It can declare its own `fontWeight` text property, which keeps every value and makes the app the owner of that second truth. Or it can strip the weights before it calls `migrateDocument`. The guide's pre-pass touches only text leaves, inside `children` and v53 media `caption` arrays. It keeps whether v53 drew each leaf bold. It refuses a weight it cannot read, such as `inherit` or `0x2bc`. In a raw v53 value it refuses a light weight inside a heading or table header cell, which v53 drew lighter than the block's bold. It also refuses a weighted leaf that has a pending format change, and any pending change of the weight itself, because either change, once converted, would erase the bold the weight drew when someone rejects it. The rule reads v53's `suggestion_*` updates and the `authored` format marks a v54 envelope keeps. The code lives in the guide's Saved font weights section, and a raw v53 value runs it as `migrateDocument(value.map(stripNode), { migrations, source: 53 })`.

A raw v53 value takes `source: 53`, as the guide's other v53 examples do. The guide's envelope form, `stripEnvelope`, maps `document.children`, each array in `document.roots` and the saved selection's `marks`, keeps `document.meta` and every other field as stored, and omits `source`. It refuses every light weight, the saved selection's insertion weight included, because an app built from v2 source names its own block types, so the pre-pass cannot tell which of them draw bold (diff panel round 3). It returns plain JSON, so its call casts the result to `PersistedDocumentInput`, because `migrateDocument` asks a value it cannot read as an envelope for a `source`. A weighted leaf inside a pending insertion or removal converts, because accepting or rejecting it keeps what v53 drew. The build compiles and runs each form in `migratePlateV54.spec.ts` before the guide copies it. `prepass-a3-a1.log` runs this pre-pass on the seats' cases. `prepass-a2-control-a2.log` shows round 2's version losing the drawn bold on reject and failing on a weighted caption.

Documents saved by published releases, the v54 betas included, are v53-shaped, so `migrateV54` runs on them and these two ways out apply (`2026-10-18-layout-review.md`, lines 288 and 289). An app built from unreleased v2 source with the weight plugin gets a new schema fingerprint once it drops the plugin, so every saved document refuses to load. That app bumps `EditorSchema.version` and lists the fingerprint its stored envelopes carry under `sourceFingerprints`, as the layout plan's recipe does for line heights (lines 543 to 549). It runs the envelope form of the pre-pass before `migrateDocument`, because the runner checks the saved selection against the target before any step's own selection mapper runs (`documentMigrations.ts` line 736; `selection-marks-a2.log`). The same leaf rule refuses its pending `authored` format marks on weighted text and any keyed `fontWeight`. No changeset says this, because no release carries the old fingerprint.

Markdown is the other stored form. The weight plugin wrote one `<span style="font-weight: bold;">` per weighted run into MDX (`mdxMarks.spec.tsx` line 56). After the cut, no decoder claims those spans. In an editor with a style plugin, a span that holds only a weight refuses the parse, and a weight beside another style drops without a report (`mdx-weight-a2.log`, with bold and font size installed). The guide names this and gives the same two ways out: keep an app weight plugin with its Markdown mapping, or rewrite the spans before parsing. The silent drop of an unclaimed span style is older than this plan and stays in Open work.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| HTML paste of a weight | Bold reads each element's stated weight, 600 and up is bold, `bolder`, `lighter`, `inherit` and `unset` count from the parent's weight, and a light weight turns bold off only inside text drawn bold; `<b>` and `<strong>` are bold unless they state a readable weight. Inside a heading or table header a light weight stores nothing, so it draws as bold as its block, as at base. A parsed slice keeps no turned-off value whose key one property owns. On the server, linkedom keeps style text as written. A repeated property reads its last declaration, and the server ignores a weight in a `font` shorthand, under a capitalized property or beside a comment, so `<strong>` stays bold there, as at base. A weight CSS rejects, such as `0x258`, reads as no weight | happy-dom package tests through `editor.api.dom.clipboard.insertData` and `editor.api.html.parseSlice`; `platejs/html/server` cases for `!important` and a weight CSS rejects; round 3's ten server cases, which match base except the spaced `! important` weight bold now reads (`r3-server-base-a1.log`, `r3-server-final-a1.log`); a native Chromium paste case in `apps/www/tests/browser/clipboard.spec.ts`, which fails at base (`r3-native-base-a1.log`) and passes five runs on this build |
| Word paste | A bold run stores `bold` only. Cleanup no longer copies a block's weight onto the span it wraps the block's content in, so a relative block weight counts once | a `WordPastePlugin.spec.ts` case and the DOCX slow tests |
| Markdown and MDX | Bold reads `**` as today. A span the weight plugin wrote refuses or drops its weight, as Hard cuts says | the two weight-span cases in `mdxMarks.spec.tsx` |
| Paste speed | A paste that turns bold off on many leaves copies each token once in Plite's composer, and the HTML decode's mutation check and weight walk stay linear in nesting depth | a plitejs work-count test, a platejs DOM work-count test and the frozen paired-timing protocol |
| Undo, selection, focus | unchanged | not touched |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Stored boldness | `bold` and `fontWeight` both written | `bold` only | `BaseBoldPlugin` | `duplicate-truth` (`architecture.md` line 112), measured by the probe | delete the weight plugin, its callers and docs | step 4's suites and typecheck | apps that installed the plugin break | cut |
| Plite's change composer | each joined section concatenates the run so far, so stripping N default values copies about 13 N² tokens | joined slices concatenate once per section | `plitejs` `composeSections` | measured: 13,010,995 tokens at 1,000 leaves, 13,000 with the fix, same document (`concat-work-a1.log`) | none; internal | step 1's work-count test fails at base | every edit composes changes, so the 4,268 Plite bun tests and the Plite slow files gate it | fix |
| Bold's HTML rule | 600, 700, `bold`; `normal` anywhere inside vetoes the whole element | each element's stated weight, bold at 600 and up; `bolder`, `lighter`, `inherit` and `unset` from the parent's weight; light turns bold off only inside text drawn bold; `<b>` and `<strong>` bold unless they state a readable weight | `BaseBoldPlugin` | `EDIT-CLIPBOARD-HTML-MARK-001`; CSS relative weights; ProseMirror and Tiptap read the tags as bold | none | step 2 regressions fail at base | `<strong style="font-weight: 500">` pastes plain, where base and ProseMirror read it bold | rearchitect |
| The decode's mutation check | serializes each matched element's subtree before and after its decoder | compares the element's own attributes and child list | `HtmlPlugin.ts` `invokeDecode` | 200 nested `font-weight: 400` spans took 2 to 5 times base, all of it the check (`nested-light-split-a1-a1.log`) | none | the mutation case and the DOM work-count test | a decoder that edits a deeper descendant no longer trips the check | fix |
| Turned-off text values | a decoded `false` reaches the fit, which strips it with one composed change per leaf; `parseSlice` keeps it | dropped once after decode, for a key that one property owns everywhere, since a slice does not know where it lands | `HtmlPlugin.ts` `decodeCompiledHtml` | 2,000 resets inside bold took 1.6 to 1.8 times the same document from HTML without them, and 1.1 after the drop (`mixed-predrop-a1.log`) | none | the `parseSlice` case fails without the drop | a key two properties own keeps its decoded value for the fit to settle | fix |
| Legacy suggestions | a format suggestion loads when its leaf fits, whatever its key | refuses when the document with every pending change rejected does not fit the target | `migrateV54` | a loaded removal of `fontWeight` returns `invalid` on reject and stays pending (`weight-remove-reject-a2.log`); a check by key would refuse a declared element property's suggestion and miss changed value laws (plan panel round 3) | apps settle it in v53 | step 4 cases: the weight removal fails at base, and a declared `textAlign` update still loads | a pending change whose rejection brings back a key v54 renamed also refuses | fix |
| The v53 weight | no rule; the closed schema refuses `fontWeight` | unchanged; the guide gives the app two ways out | the app | v53 drew the weight on top of bold, so no value converts exactly; release steps keep stored intent (`plate.md` lines 607 to 609) | apps strip or declare before upgrading | step 4 guard case | upgrades stop for apps with weights | keep |
| `toUnitLess` | root export, integer only, `pt` read as px | private `toPixels` in the copied control, px and pt only | copied registry control | one consumer; `12pt` stepped to `13px` | registry users get the new copy | step 5 cases fail at base | other units show raw and the buttons do nothing | move |

## Design

The architect arena ran three runners on the brief in the run directory, `architect-brief.md`, which the lead restarted after the closed-schema probe disproved one of its facts. A read-only judge scored them blind on six criteria. Its totals were 26 for Sol's design, 22 for Opus's and 13 for Astra's. The lead's own blind scores, written before the judge answered, ranked them the same way.

- **Base: bold alone owns weight** (Sol), with a conservative v54 rule that the plan panel later cut.
- **Grafts from Opus.** The beta-save limit is named, `EDIT-CLIPBOARD-HTML-MARK-001` is reconciled for bold, and the tests come first.
- **Rejected.**
  - Astra's structured `weight` mark. It renames `BoldPlugin`, rewrites every bold leaf in every app and stores bold three ways.
  - Opus's conversion of 600, 800 and 900 to bold. It changes the drawn degree, and no law line permits that.
  - Sol's separate preflight pass and its MDX `<b>` and `<strong>` tag mappings, which no probe or ask needs.

Challenge delta, plan panel round 1 (Opus, Astra and Sol at xhigh). Six critical findings, all applied:

1. Turning `bold`, `700` or `bolder` into bold is not exact (Astra, Sol). v53 put the weight on the `<strong>` itself, so `{ "bold": true, "fontWeight": "700" }` drew 700, and a lone `bolder` drew relative to its block (`pipeRenderLeaf.tsx` lines 56 and 64 and `pluginRenderLeaf.tsx` line 116 at `2f87593f95`). Once v54 draws bold as `bolder`, bold text in a `font-semibold` heading draws 900 (`heading.tsx` lines 14 to 19). The step now converts no weight.
2. Renaming a weight suggestion's marks to bold erases existing bold when the suggestion is rejected (Astra, Sol). No rename. Weight suggestions refuse, and the guide already says to settle format suggestions in v53 (`document-model.mdx` line 53; `weight-suggestion-a1.log`).
3. The nearest stated weight misreads `lighter`, `initial` and `inherit` (Astra, Sol). Bold now works out the weight each element draws at with CSS's relative-weight table. The seats' cases pass in a prototype (`computed-weight-a2.log`).
4. Reading `em` and `rem` at 16px makes up a size the control cannot know (Astra, Sol). `toPixels` reads px, pt and bare numbers, and shows any other value as saved.
5. A saved selection's weight marks refuse in the generic selection mapping, before any step rule runs (Sol; `selection-marks-a2.log`, `selection-protocol.ts` line 688). Covered, because no weight converts and the guide's pre-pass strips them.
6. Bold's Markdown span rule makes an editor with only bold refuse every `<span>` (Opus; `span-register-a1.log`). Bold keeps its `strong` node only.

Challenge delta, plan panel round 2 (the same seats). Seven critical findings, all applied, each checked by a probe:

1. The pre-pass rewrote every `fontWeight` key in the envelope, so it turned `meta.theme.fontWeight` into bold and dropped a root named `fontWeight` (Astra, Sol; `prepass-a1.log`). It now touches text leaves only.
2. The pre-pass renamed a suggestion's weight snapshot to bold, which brings back round 1's lost bold on reject (Astra, Opus, Sol; `prepass-a1.log` shows the rename). It now refuses a leaf whose pending suggestion holds a weight.
3. Carrying an ancestor's 900 through an `<h1>` made `lighter` inside a heading bold (Sol). Headings and table headers now count as 700 when a relative weight looks up (`resolved-weight-a1.log`).
4. A source-built app's own step cannot reach the saved selection, because the runner checks it first (Sol; `selection-marks-a2.log`). That app runs the pre-pass before `migrateDocument`.
5. A loaded v53 weight removal can never be rejected (Astra; `weight-remove-reject-a2.log`). The v54 step refuses a legacy suggestion whose key the target does not declare.
6. Word cleanup copies a block's weight onto an inner span, so a relative weight counts twice (Astra; `resolved-weight-a1.log` shows the Word case bold and the same HTML without Word plain). Cleanup stops copying the weight, since bold reads the block's own.
7. `revert` and `revert-layer` fell back to the parent's weight, so a bold tag with them pasted plain (Astra; `resolved-weight-a1.log` shows the computed reader reading `revert` plain). They now count as no stated weight.

The pre-acceptance probe found one more. A paste that turns bold off on N leaves writes N `bold: false` values, the fitter strips each one, and Plite's composer then copies about 13 N² tokens. At 1,000 leaves it copies 13,010,995, against 13,000 with a join buffer and the same document (`concat-work-a1.log`). Two changes answer it. The composer buffers joined slices, which also speeds up any load of such a document today. And bold writes `false` only inside bold text, which Opus asked for so that public slices stay clean, so a Google Docs paste writes none.

Challenge delta, plan panel round 3 (the same seats), the cap. Five critical findings, all applied, each fix checked against the version it replaces:

1. The composer's join buffer dropped a prepared slice's identity when only one joined slice held tokens, so a composed replacement lost its prepared nodes and node keys (Opus critical, Astra warning). The flush now drops empty slices and keeps a lone filled one unchanged. A new `document-change.test.ts` case fails on round 2's patch and passes at base and with the fix (`round3-controls-a2.log`).
2. The pre-pass merged a pending bold suggestion on a weighted leaf, so rejecting it erased the bold the weight drew, and it never saw a v54 envelope's `authored` marks (Astra, Sol, Opus). It now refuses a weighted leaf with any pending format change, in both shapes (`prepass-a3-a1.log`; `prepass-a2-control-a2.log` shows round 2's version losing the bold).
3. The speed test timed a copy of the decoder defined in the bench, so the shipped code could never fail it (Opus critical; Astra, Sol warnings). The v3 bench loads `BaseBoldPlugin` from each arm's tree, so the arms differ only in `--tree`. The planted arm parses base twice.
4. A refusal by key would refuse a declared element property's suggestion and miss changed value laws (Astra, Sol; Opus warning). The step fits the document with every pending change rejected instead. Its weight case fails at base, and a declared `textAlign` update still loads (`round3-controls-a2.log`).
5. `<h1><strong style="font-weight: inherit">` pasted plain (Astra, Sol). `inherit` and `unset` now resolve through the parent, with a guard case that fails on round 2's reader (`round3-controls-a2.log`).

Warnings, applied unless noted. A weighted v53 caption could not migrate, so the pre-pass walks `caption` arrays (Astra). Two seats asked for a light nested cohort, and Opus for weighted wrappers around a large subtree. Measured, 200 nested light spans cost 2 to 7 times base (`nested-light-a1-a1.log`). The mutation check caused all of it for plain weights and the parent walk added more for relative chains (`nested-light-split-a1-a1.log`). The check now reads the element only, the walk caches each element, and both land near base (`nested-light-fixed-a1-a1.log`). The v3 bench also gave the mixed cohort identical HTML, which showed resets inside bold at 1.6 to 1.8 times the same document from HTML without them, most of it the fit stripping `false`. The decode now drops those values once, which brings them to 1.1, and a `parseSlice` case pins it (`mixed-predrop-a1.log`). That made Opus's alternative, writing `false` everywhere, cost-free in the fit. But a decoded mark is copied onto its whole subtree, so light spans outside bold would cost the square of their depth, 4.6 to 6.2 times as long at 250 spans (`false-everywhere-a1.log`). The rule stays, now with that reason, and the DOM work-count test covers the walk and the check. Base reads the reset HTML wrongly, so only the mixed cohort gives base the equivalent HTML. The gate's baseline is the phase-1 tree, so it times the paste changes alone (Opus). `cleanWordHtml.spec.ts` lines 63 to 75 pin the weight copy, so step 3 rewrites that case (Opus). Opus objected that the work-count test wraps an internal. The Benchmark rule requires counting the operation's work, so it stays, its message now says positions, and the identity test covers what it cannot. Of the nits, the server `<strong>` half of step 2's case is now a guard. Opus's other nit, `addSection`'s optional buffer, stays for the diff panel to judge, because the other callers keep their behavior.

Must-answer answers, each from a probe in the run directory or a cited line:

1. The weight plugin's style reaches the leaf through `inject.nodeProps.styleKey`, so text stays bold after bold is off (source trace by all three runners; `probe-font-weight-a1.log` shows the copied HTML).
2. An MDX weight span stays out of bold's Markdown rule, because a span rule on bold refuses every span in a bold-only editor (`span-register-a1.log`).
3. Bold alone imports Word's bold run (`docx-without-weight-base-a1.log`).
4. A `false` decode resets inheritance without persisting (`false-reset-a2.log`, `false-insert-a1.log`), and the decode now drops it before any fit or slice sees it. The stated weight decides each element, and the seats' 25 cases read as planned except the Word case, which the cleanup change answers (`resolved-weight-a1.log`).
5. The v54 step converts no weight. A target that declares `fontWeight` keeps every value, and one that doesn't refuses (`migrate-unowned-weight-a1.log`, `weight-suggestion-a1.log`, `selection-marks-a2.log`). A weight removal suggestion now refuses there too, instead of loading as a mark that can never be rejected (`weight-remove-reject-a2.log`).
6. No other first-party reader of a text `fontWeight` exists. `editable-text-flow.tsx`'s list is React's unitless CSS properties.
7. The parser is fixed in the copy, for px and pt.
8. Hard cuts and steps 6 and 7 list the docs, config, generated output and the changeset. No open plan besides this one cites the removed names.

## Failure modes

1. An app with saved weights runs `migrateV54`, and it stops with the closed-schema error. Blast radius: apps that installed the plugin by hand. Answer: the guide names both ways out and shows the pre-pass. The error names no node path, which a suggested task covers. Proof: the step 4 guard case.
2. A v53 weight suggestion or a saved selection's weight mark refuses the same way, and so does a weight removal now. Answer: the pre-pass strips the selection's marks and refuses a pending weight suggestion with a message that says to settle it in v53, which the guide already asks. Proof: `weight-suggestion-a1.log`, `selection-marks-a2.log`, `weight-remove-reject-a2.log`, and step 4's guard cases.
3. A pasted weight the reader cannot read, such as `var(--w, 600)` or `calc()`, decides nothing on a `<span>`, and a bold tag stays bold. Answer: as at base. Proof: step 2's cases.
4. Matching every weighted element meets three costs that grow with nesting depth: the mutation check's subtree serialization, the parent walk of relative weights and the copy of each decoded mark onto its subtree. Answer: the check reads the element only, the walk caches each element, and a light weight answers only inside text drawn bold. The DOM work-count test fails when the first two return, and the frozen protocol times 200 nested light, relative and bold spans and ten weighted wrappers around 500 paragraphs.
5. A decoder that edits a descendant of its element, not the element, no longer trips the mutation check. Answer: the check's message promises only the element, and every platejs spec passed under the old subtree check, so no first-party decoder the tests reach edits a descendant.

Rollback: revert the one landed commit.

## Steps

The owner's `/verdict next`, then "verdict is meant as one shot", authorize the build in this session, in worktree `styles-verdict`. Its packet is the nine files of `round3-candidate.patch` in the run directory, which the panel's round 3 checked, plus the edits steps 2 to 8 name beyond them.

Phase 1, Plite's composer. Keep or revert after step 1.

- [x] 1. Add a work-count test to `packages/plitejs/test/document-fit-contract.test.ts`: fit 100 and 400 paragraphs through `editor.read.schema.fitDocument`, each with a middle leaf whose default value the fit strips, and assert that the slice positions the composer concatenates grow at most five times. Add a case to `document-change.test.ts` that composes a removal with a prepared replacement and asserts the replacement's nodes and token-free slice survive. Then make `composeSections` buffer joined slices, drop empty ones, keep a lone filled slice unchanged and concatenate the rest once per section. Proof: the work-count test fails at base, where 400 paragraphs copy 2,084,395 positions against 131,095 for 100 (`fit-work-base-a3.log`); the composed-replacement case fails on round 2's patch and passes at base (`round3-controls-a2.log`); both pass with the fix; the Plite bun suite and the Plite slow files pass.

Phase 2, bold owns weight. Keep, revert or quarantine after step 4.

- [x] 2. Add bold paste cases to `BaseMarkPlugins.spec.tsx`, one `platejs/html/server` case in `html/server/index.spec.ts`, and one case in `WordPastePlugin.spec.ts`. Regressions, which fail at base: 800, 900 and `bolder` are bold, and `bolder` inside `bolder` is bold; `<b>a<span style="font-weight: 400">b</span>c</b>`, and the same with `initial`, give bold, plain, bold; `lighter` on `<strong>` is plain; `<b style="font-weight: 400">` and `<strong style="font-weight: 500">` are plain; `inherit` on a `<strong>` inside 400 text is plain; on the server, `700 !important` on a `<span>` is bold; `parseSlice` of `<p><b>a<span style="font-weight: 400">b</span></b></p>` gives a bold `a` and a plain `b` with no stored `false`. Guards, which pass at base and must keep passing: on the server, `bold !important` on a `<strong>` is bold; `inherit` on a `<strong>` inside an `<h1>` is bold; `lighter` on a `<strong>` inside 900 text is bold; `lighter` inside an `<h1>` inside 900 text, and inside an `<h2>`, is plain; the Google Docs wrapper keeps its 700 span bold and the rest plain; a `<b>` inside 300 text is bold; `revert`, `revert-layer` and `var(--w, 600)` on a `<strong>` keep it bold; `inherit` and `unset` inside `<b>` stay bold; `bolder` inside 300 text is plain; the Word case, a `MsoNormal` paragraph with `bolder` inside 300 text, is plain; the bold row of the descendant-veto test stays plain. Two more guards pin step 3's cost fixes. A DOM work-count test in `BaseMarkPlugins.spec.tsx` pastes 50 and 200 nested spans of `400`, `lighter` and `inherit` and counts style reads plus serialized `outerHTML` characters, at most five times apart. A case in `HtmlPlugin.mapping.spec.ts` reports a decoder that removes its element's attribute or child. Proof: `proof-worktree.mjs --expect-fail` shows each regression failing at base and each guard passing there. On the final tree, the work-count test fails without the walk cache and with the subtree check, and the mutation case fails without the attribute comparison (`round3-controls-a2.log`, on `round3-candidate.patch`).
- [x] 3. Rewrite bold's HTML decode in `BaseMarkPlugins.ts` with a private stated-weight reader, and match any `font-weight`. It reads only CSS keywords and CSS numbers, so `revert` or `0x258` is no weight, resolves `bolder`, `lighter`, `inherit` and `unset` against the parent's weight, counts headings and table headers as 700 when it looks up, caches each element's drawn weight, and returns `false` only when the parent's weight is 600 or more. In `HtmlPlugin.ts`, compare the decoded element's own attributes and child list in the mutation check, and drop text values equal to an omitted default once after decode, for keys one property owns. In `cleanWordHtml.internal.ts`, stop copying a block's `fontWeight` onto the span it wraps the block's content in, and rewrite the copy case in `cleanWordHtml.spec.ts`. Proof: step 2 passes; `BaseMarkPlugins.spec.tsx`, the HTML plugin specs, `WordPastePlugin.spec.ts`, `cleanWordHtml.spec.ts`, `htmlConformance.spec.ts`, `html/server/index.spec.ts` and the DOCX slow tests pass; the frozen v3 protocol passes on the final tree against the phase-1 tree, or the design goes to `architect`.
- [x] 4. Delete the weight plugin, its React adapter, `PLUGINS.fontWeight` and the portal, with their tests, and update every caller Hard cuts lists. In `migratePlateV54.ts`, fit the document with every pending change rejected, and refuse when that fit throws. Add cases to `migratePlateV54.spec.ts` and `migratePlateV54Suggestions.spec.ts`: a v53 weight refuses in a bold-only target; a target that declares `fontWeight` keeps it; a v53 weight removal suggestion refuses in a bold-only target, which fails at base; a declared `textAlign` update suggestion still loads and rejects to its old value; the guide's raw and envelope pre-pass forms compile and run on the round 3 cases. Proof: the full platejs suite; the CLI's `run-migration.test.ts`, which runs `migrateV54` end to end; every slow file that installs bold, which is every DOCX slow file through `testDocxDeserializer.tsx`, plus `ListPlugin.slow.tsx`, `HtmlPlugin.slow.tsx`, `playground-rules.slow.tsx`, `plite-contracts.slow.tsx`, `importDocx.slow.tsx`, `listIndex.internal.slow.ts`, `withPlite.slow.ts`, `AffinityPlugin.slow.tsx` and `Plate.slow.tsx`; `pnpm --filter platejs typecheck`; and the platejs spec typecheck against base's 247 errors at `eabe8a1300`.

Phase 3, the size box. Keep or revert after step 5.

- [x] 5. Give the copied control its private `toPixels`, delete the root `toUnitLess` and `digitRegex`, and drop the spec's mock. Add cases: a saved `12pt` shows 16 and the plus button writes `17px`; a saved `1.5em` or `0x10` shows as saved and neither button writes; and choosing 16 over a saved `0x10` writes `16px`. Proof: both fail on the base control with no mock; `mark-toolbar-button.spec.tsx` passes.

Phase 4, docs and release. Keep or revert after step 8.

- [x] 6. Through `plate-docs`, update `font.mdx`, `font.cn.mdx`, `bold.mdx`, `bold.cn.mdx`, `document-model.mdx` and `document-model.cn.mdx`, the last two with the refusal, both ways out, the pre-pass forms, saved selections and stored Markdown weight spans. `document-model.mdx` line 53 also changes, because v54 does convert format suggestions and refuses those the target could not reject. The Tiptap research source's line 15 changes too. Proof: the removed-API teaching check and the docs checks pass, and the preview renders each page.
- [x] 7. Run `pnpm brl` and `pnpm --filter www build:registry`, regenerate the API manifest in a `proof-worktree.mjs --install` worktree, and write the changesets for `platejs` and `@platejs/plite` and the registry changelog entry. Proof: the `pnpm check` steps for barrels, registry and API reference pass.
- [x] 8. Reconcile `EDIT-CLIPBOARD-HTML-MARK-001` for bold, tag the step 2 test, and run `best-api repair`. Proof: the editor-behavior checks pass, and `teaching-sweep.mjs` finds no live hit.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Blast radius before code | `blast-radius.md` in the run directory: the omitted-default drop changes no fitted document across 41 HTML fixtures (`drop-differential-a1.log`), the weight plugin has no caller outside its own files and the census, and the CLI's `run-migration.test.ts` joins step 4's proof |
| `verify` loaded before proof | this build's invocation, after the session's last compaction and before step 1's base control |
| Each step's base control | step 1 fails at base in `fit-work-base-a3.log` and `step1-base-control-v2-a1.log`, and its composed-replacement case in `round3-controls-a2.log`; step 2's regressions fail and its guards pass at base in `step2-base-control-a1.log`; steps 3 and 4's mutants fail on the final tree in `final-controls-a1.log`; step 5's cases fail on the base control in `step5-base-control-a1.log`; round 3's fixes fail before them in `r3-astra-leaf-before-a1.log`, `r3-astra-selection-before-a1.log`, `r3-spaced-before-a1.log` and `r3-native-base-a1.log` |
| Hard-cut sweep of callers, exports, tests, docs and examples | `git grep` for the removed names outside `docs/plans` and `templates` finds only generated output that step 7 rebuilds (`apps/www/public/r`, `api-reference-manifest.json`), the 2026-10-04 review record and a 2026-09-28 research probe, both kept as history; `basic-marks.mdx` now gives bold's 600 rule too |
| `plate-docs` on every changed docs page | this build's `plate-docs` invocation before step 6's first edit; `check-docs-a1.log` stopped at a missing packed declaration, so the docs checks ran one by one (row 88), and `r3-drive-check-a1.log` covers each changed page's render |
| Playtest scope | skip: `playtest.mjs scope` says no scenario catalog covers these files, and the build adds no feature |
| `thermos` per shared slice | skip: the `api-build` and `push` rows owe a panel on the diff, and every seat applies both lenses |
| `review-ledger.mjs check` | `review-ledger.mjs check docs/plans/2026-10-19-styles-review.md` returns ok |
| Benchmark pre-acceptance probe | gate: the v2 run was inconclusive at load 58 and timed a copy of the decoder (`paste-weight-paired-a1.log`); step 3's v3 run on the final tree against the phase-1 tree was inconclusive at load 159, with every candidate median pair 0.44 to 1.14 against the 1.5 budget and every planted arm past it (`paste-weight-v3-final-a1.log`), and the known-bad workload fails with the bench's mismatch text (`paste-weight-v3-known-bad-a1.log`); the quiet-host rerun is `t_15c1b9b9` |
| `deslop` and `no-comments` | rows 85 and 86 on the build, 101 on round 1's fixes, 107 on round 2's and 115 on round 3's, where `no-comments` skipped because no comment line changed |
| `oxlint --type-aware` on the task's files | `lint-task-a2.log` on the build's 26 task files and `r3-lint-final-a1.log` on round 3's five code files; `land.mjs` runs `pnpm lint:task` again on every changed file |
| Panel on the diff (`api-build`, `push`) | three rounds, the cap: rows 94 to 101, 102 to 107 and 108 to 115; every critical finding is applied except rows 96, 99 and 111, each the same at base, with an owner and no stop |
| Hand drive | `r3-drive-check-a1.log`: `hand-drive.mjs check` over the change's 58 files reports 37 cells covered and done |
| `pnpm check` steps the edits reach | `api-manifest-a1.log` passes the API reference check, `r3-removed-api-teaching-base2-a1.log` passes against base, `kb-check-a1.log` matches base's 74 findings (row 90), and `land.mjs` runs `pnpm check --affected` |
| Changeset and registry changelog | `.changeset/basic-styles-v54-runtime.md` for `platejs`, `.changeset/plite-fit-join-once.md` for `plitejs` and the registry entry `2026-10-19-font-size-saved-units`, which `r1-changelog-check2-a1.log` checks |
| `best-api repair` | this build's `best-api` invocation; the subject fold, `r3-teaching-sweep-a1.log`, `r3-removed-api-teaching-base2-a1.log` and the forward test in `r3-forward-test.md` |
| Land through `land.mjs`, with `pnpm check --affected` | `land.mjs --check 'pnpm check --affected'` squashes the branch and pushes it to next; its first run stopped on a type error that round 1's fix made (`land-a1.log`), fixed and typechecked in `land-fix-typecheck-a1.log`; its second run stopped on 5 of 25 steps (`land2-a1.log`), fixed and rerun in the `land-fix-*` and `land-cli-30s-a2.log` logs |

## Close

Reversals and deviations come first.

- Diff panel round 1 made the server rewrite each style so a repeated weight read its winning declaration. Round 2 reverted the rewrite, because browser paste runs the same code and lost quoted values (`r2-cases-before-a1.log`, `r2-cases-after-a1.log`).
- Round 2 taught the guide's envelope pre-pass to look up v53 heading types. A source-built app names its own types, so round 3 replaced the lookup with a refusal of every light weight in that form (`r3-mutant-leaf-a1.log`, `r3-mutant-selection-a1.log`).
- The native Chromium paste that the Native behavior row promised ran as a case in `apps/www/tests/browser/clipboard.spec.ts`, because Claude in Chrome did not connect on two tries.
- Step 3's speed gate stayed inconclusive, because the host's one-minute load reached 159 against a limit of 6 (`paste-weight-v3-final-a1.log`). Suggested task `t_15c1b9b9` reruns it on a quiet host.
- `check-docs-a1.log` stopped at a missing packed declaration, so step 6 ran the docs checks one by one (row 88).
- The first `land.mjs` run stopped at the typecheck (`land-a1.log`). Diff panel round 1's fix passed an element's read-only children to a helper typed for a mutable array, and no later round ran `tsc`. The helper now takes and returns a read-only array, both typechecks pass (`land-fix-typecheck-a1.log`, `land-fix-plite-typecheck-a1.log`), and the HTML and bold specs pass 168 (`land-fix-html-specs-a1.log`).
- The second `land.mjs` run stopped on 5 of 25 check steps (`land2-a1.log`). The portal removal had left platejs's generated `turbo.json` stale, which failed the test and entrypoint-graph steps, and regenerating it fixed both (`land-fix-turbo-check-a1.log`). The schema audit keeps a reviewed count of raw schema queries per file. The style plugins' spec lost one query with its weight cases, and the decode's omitted-default lookup added one to `HtmlPlugin.ts`, so the counts moved from 8 to 7 and from 4 to 5 (`land-fix-core-audits-a1.log`, `land-fix-schema-audit-test-a1.log`). The www step could not find the `plate` command, because this worktree installed before the CLI was built, and a second install linked it. The CLI step timed out 9 cases at Bun's default 5 s while the host's load stayed between 34 and 70 on 18 threads. All 90 CLI cases pass at a 30 s limit (`land-cli-30s-a2.log`), so `pnpm check` now gives the CLI suite the same limit as the other Bun runners, 30 s locally and 5 s in CI (`land-fix-ci-workflow-test-a1.log`).

What landed. `land.mjs` squashes the branch into one commit and pushes it to next, which the v54 beta pull request carries to main. Before the squash the branch held b23a5d0746, 32da2ae6fd, 7bd2545889, 1bda793a9d, 57dcd2a8fa and c14d545aa9, then the fixes of three diff panel rounds.

- `plitejs` concatenates each section's joined slices once (step 1).
- `platejs` removes `FontWeightPlugin`, `BaseFontWeightPlugin`, `PLUGINS.fontWeight`, the weight portal and the root `toUnitLess` (step 4).
- Bold's HTML decode reads each element's stated weight. 600 and up is bold, relative weights count from the parent, and a light weight turns bold off only inside drawn bold (steps 2 and 3).
- Plate's HTML decode checks only the decoded element's own attributes and children for edits, and drops turned-off text values once after decode (step 3).
- Word cleanup stops copying a block's weight onto the span inside it (step 3).
- `migrateV54` refuses a v53 weight that a bold-only target cannot hold, and a legacy suggestion whose rejection does not fit the target (step 4).
- The copied size box parses px and pt itself (step 5).
- The docs, both changesets, the registry changelog entry, the registry output, the API manifest and `EDIT-CLIPBOARD-HTML-MARK-001` match the change (steps 6 to 8).

Proof, from each decision-log row's scope:

- Step 1. The work-count test fails at base, where 400 paragraphs copy 2,084,395 positions against 131,095 for 100 (`fit-work-base-a3.log`). It passes on the build with the Plite bun suite and slow files (row 73).
- Step 2. The nine regressions fail at base and every guard passes there (`step2-base-control-a1.log`, row 76).
- Steps 3 and 4. The correctness proofs pass on the final tree (row 81), and each mutant control fails on it (`final-controls-a1.log`, row 82). After round 3 the platejs suites pass 1130 (`r3-platejs-suites-final-a1.log`) and the migrations suite passes 150 (`r3-migrations-after-a1.log`).
- Step 5. `mark-toolbar-button.spec.tsx` passes, and its new cases fail on the base control (`step5-base-control-a1.log`, row 83).
- Native paste. The clipboard case fails at base (`r3-native-base-a1.log`) and passes five runs of five on Chromium (row 113).
- Hand drive. `hand-drive.mjs check` over the change's 58 files reports 37 cells covered and done (`r3-drive-check-a1.log`, row 114).
- Teaching. The removed-API check against base passes (`r3-removed-api-teaching-base2-a1.log`). A fresh agent answered three weight questions from the docs and source without naming a removed export (`r3-forward-test.md`).

Limits:

- Nobody timed the paste on a quiet host yet, as above.
- Native paste ran on Chromium only, with hand-written HTML on the clipboard, so it does not show what Word or Google Docs write there. Firefox and WebKit ran no clipboard case for this change.
- On the server, linkedom keeps style text as written, as at base. The server ignores a weight in a `font` shorthand, under `FONT-WEIGHT` or beside a comment, and other styles keep `!important` in their values (row 111).
- Four problems stay open, each the same at base: a legacy suggestion whose rejection the fit repairs (row 96), a normal weight inside a heading (row 99), the structural decision law under fast-check seed 1483563249 (row 75) and `pnpm kb check`'s 74 findings (row 90).

Counts. The owner sent four messages: `/verdict next`, the correction to run the whole verdict in this session, a question about repairing the skill and where a verdict session should start, and "c" to continue after the session restarted. The verdict ran, built and lands in this session, the question got its answer before the build, and the run continued from the stopped landing. None is open.

Open work. Each item under Open work below names its owner and stop, and the subject file's Open work carries them forward. This run offered them as ten suggested tasks, t_533fa7cd to t_80996704, and the Reflect section's lessons as eleven more.

Review inputs. The review read `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, `docs/vision/plite.md`, `.agents/playbooks/references/architecture.md`, `docs/plans/2026-07-07-plate-next-basic-styles-package-review.md`, `docs/plans/2026-10-04-ledger-triage-audit.md`, `docs/plans/2026-10-18-layout-review.md`, `docs/research/sources/lexical/clipboard-and-paste.md`, `docs/research/sources/tiptap/conversion-and-export.md`, `docs/editor-behavior/markdown-editing-spec.md`, `packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.ts`, `packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.spec.ts`, `packages/platejs/src/features/basic-nodes/lib/BaseMarkPlugins.ts`, `packages/platejs/src/features/basic-nodes/lib/BaseMarkPlugins.spec.tsx`, `packages/platejs/src/features/basic-nodes/lib/index.ts`, `packages/platejs/src/react/features/basic-styles/BasicStylePlugins.tsx`, `packages/platejs/src/utils/plate-keys.ts`, `packages/platejs/src/utils/index.ts`, `packages/platejs/src/root.tsx`, `packages/platejs/src/internal/plugin/markdownParagraph.ts`, `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts`, `packages/platejs/src/lib/plugins/html/HtmlPlugin.ts`, `packages/platejs/src/lib/plugins/html/htmlDom.ts`, `packages/platejs/src/lib/plugin/MarkdownNodeMapping.ts`, `packages/platejs/src/markdown/lib/internal/markdownMappings.ts`, `packages/platejs/src/docx/html/cleanWordHtml.internal.ts`, `packages/platejs/src/migrations/documentMigrations.ts`, `packages/platejs/src/migrations/documentMigrationTarget.internal.ts`, `packages/platejs/src/migrations/migratePlateV54.ts`, `packages/platejs/src/migrations/migratePlateV54.spec.ts`, `packages/platejs/src/migrations/migratePlateV54BuiltIns.internal.ts`, `packages/platejs/src/migrations/migratePlateV54Ownership.internal.ts`, `packages/platejs/src/migrations/migratePlateV54Profile.internal.ts`, `packages/platejs/src/migrations/migratePlateV54Suggestions.internal.ts`, `packages/platejs/src/migrations/migratePlateV54Suggestions.spec.ts`, `packages/platejs/src/migrations/v53-manifest.internal.ts`, `packages/plitejs/src/core/schema-compiler.ts`, `packages/plitejs/src/core/editor-schema.ts`, `packages/plitejs/src/core/selection-protocol.ts`, `packages/platejs/src/html/htmlConformance.spec.ts`, `packages/platejs/src/markdown/lib/markdownConformance.spec.ts`, `packages/platejs/src/markdown/lib/mdxMarks.spec.tsx`, `packages/platejs/src/markdown/lib/__tests__/createTestEditor.tsx`, `packages/platejs/src/docx/paste/lib/WordPastePlugin.spec.ts`, `apps/www/src/registry/components/editor/font.tsx`, `apps/www/src/registry/components/editor/basic-marks.tsx`, `apps/www/src/registry/components/editor/basic-nodes.tsx`, `apps/www/src/registry/components/editor/heading.tsx`, `apps/www/src/registry/components/editor/font-size-toolbar-button.tsx`, `apps/www/src/registry/components/editor/mark-toolbar-button.spec.tsx`, `apps/www/src/registry/examples/pagination-demo.tsx`, `apps/www/src/__tests__/package-integration/docx/font.slow.tsx`, `apps/www/src/__tests__/package-integration/docx/headers.slow.tsx`, `apps/www/src/__tests__/package-integration/docx/testDocxDeserializer.tsx`, `apps/www/api-reference.config.json`, `content/docs/(plugins)/(styles)/font.mdx`, `content/docs/(plugins)/(marks)/bold.mdx`, `content/docs/(guides)/document-model.mdx`, `apps/www/src/app/(app)/examples/plite/_examples/mark-utils.ts`, `apps/www/src/app/(app)/examples/plite/_examples/paste-html-import.ts`, `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx`, `apps/www/src/app/(app)/examples/plite/_examples/iframe.tsx`, `apps/www/src/app/(app)/examples/plite/_examples/hovering-toolbar.tsx`, `apps/www/src/app/(app)/examples/plite/[example]/page.tsx`, `apps/www/src/app/(app)/examples/plite/plite-example-client.tsx`.

## Reflect

One Opus reviewer read the run's transcript through the judgment, tooling and divergent lenses, and its answer is `reflect/reviewer.md` in the run directory. The lead sorted its 26 findings into 11 accepted lessons, one of which joins the two compaction findings, and 14 rejections. None is a script that refuses a case its own rule allows, or a pure rewording, so this run applies none. Each accepted lesson waits as a suggested task for the owner to take or drop.

Accepted, each now a suggested task:

- The removed-API teaching check compares HEAD with itself under `pnpm check --affected`, so a landing cannot catch a doc that still names a removed export. `check.mjs` should pass it the merge base (t_8b6a4ae4).
- The hand-drive reference starts the drive server with `preview_start`, which serves the main checkout in a worktree session. It should start the server from the worktree and confirm its folder (t_ba86aa21).
- The lint auto-fix renamed a catch binding from `cause` to `error`, which turned `{ cause }` into `{ error }` and dropped the error's cause (t_dd220d41).
- `proof.mjs --name x-a1` writes `x-a1-a1.log`, so a later search for the log misses it (t_d820ace0).
- The editor-behavior tag reader skips a tag inside an `it.each` title, so tagged cases need literal titles (t_ca1d9d79).
- `review-ledger.mjs next` picked an item that had landed, because its page lacked `work_kind`, and no check refuses that page (t_c77dfb5b).
- After a compaction the lead had to search its own transcript to learn what "the row-42 class" meant. A deferred item should carry its full description (t_c6a0cb5a).
- The inline-script hook refused eight commands in this run, and repeated hook refusals never count as a correction, so no correct pass runs on them (t_e71c60db).
- When a busy host blocks timing, a work-count test that fails at base carries the scale proof, as it did here. The benchmark rule should say so (t_e710015a).
- A mutant control made with sed failed for a missing function instead of its own assertion. A control counts only when it fails with its own message (t_895aae2a).
- The native clipboard spec proves Chromium's paste with hand-written HTML, not what Word or Google Docs write. This plan's Limits now say so, and the browser rule should too (t_496f5292).

Rejected:

- Run a verdict item in one session, not by card. The verdict playbook already says so after this run's fix.
- Check a design brief's premises before the runners start. The blast-radius skill already triggers on such a brief.
- Time the prototype before the plan locks. The pre-acceptance probe already ran on the prototype.
- Reproduce each panel finding on base and on the build. `decisions-check` already refuses an open row without a base.
- Prototype in a scratch worktree while seats review. The freeze rule already keeps edits out of the reviewed tree.
- Make the forward test a named step of an API repair. `best-api` repair already lists it.
- Move a session into the worktree it creates. Starting the session in the app's own worktree avoids the problem.
- Draft decision rows against `decisions-check`'s shapes. The check already refuses each bad row before it is written.
- Reread a recipe before each step it covers. The recipes exist, so the miss was execution.
- Add a replacement helper for inline scripts. The hook already blocks them and the Edit tool does the job, and the hook-refusal task covers the repeat.
- Record linkedom's style-text quirks. The server CSS parser task owns them.
- Escalate a fix that churns across panel rounds to an owner decision. The replacement-loop rule already does that.
- Keep code that users paste in one tested source. The pre-pass copy check task owns it.
- Load a skill before its work starts. Each skill's description already says so.

## Changed since the verdict

- The verdict said the migration keeps weights other than bold ones. Plate refuses a property no plugin declares, and the plan panel showed that no saved weight turns into bold exactly, so the v54 step converts none and the app keeps or strips its weights.
- The verdict moved `toUnitLess` unchanged. The arena found that it reads `12pt` as 12, so the copy gets a parser for px and pt.
- The verdict widened bold to 800, 900 and `bolder` only. The plan makes bold read each pasted element's stated weight, which also fixes the nested reset for bold.
- The verdict changed only `platejs`. The pre-acceptance probe found that the new paste rule hits a quadratic in Plite's change composer, so the plan fixes `plitejs` first.
- The verdict left the v54 step alone. The plan panel showed that a v53 weight removal loads as a mark nobody can reject, so the step now refuses a document that would not fit the target with every pending change rejected.
- The verdict left Plate's HTML decode alone. The third round measured nested weight spans at two to seven times base and resets inside bold at 1.6 to 1.8 times the same document without them, so the plan changes the decode's mutation check and drops turned-off values once after decode.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Who owns font weight | Bold alone, and the weight plugin goes (look) | Keep a plugin for light and medium weights | keep light weights | big |
| Saved documents with a weight | The upgrade converts none. Each weight stops it until the app declares a weight property or strips its weights, and the guide shows both. Paste reads how the source drew, while the upgrade keeps what the author saved (look) | Turn bold-looking weights into bold | convert bold weights | big |
| Heavy pasted weights | Bold reads each element's own weight; 600 and up is bold, and relative weights count from the parent | Keep the old 600, 700 and bold list | keep the bold list | small |
| A normal word inside bold text | Turns plain by itself | Keep the old rule that makes the whole run plain | keep the old veto | small |
| Where paste turns bold off | Only inside bold text, headings included. Paste copies each decoded mark onto all the text under its element, so a "not bold" on every light element makes nested light spans cost the square of their depth, 4.6 to 6.2 times as long at 250 spans. A Google Docs paste would also write one per word | Every light element writes "not bold" | false everywhere | small |
| Paste's mutation check | Checks only the element's own attributes and children, because copying out its whole subtree made nested matches cost the square of their depth (look) | Keep serializing the subtree, which also catches a decoder that edits a grandchild | keep subtree check | small |
| Turned-off values | Dropped once after decode, so neither the fit nor a pasted slice sees a stored "not bold". A key that two properties own keeps its value, because a slice does not know where it lands | Keep them and let the fit strip each one | keep false values | small |
| Legacy suggestions whose rejection does not fit | The upgrade refuses them. It checks that the document still fits with every pending change rejected, so a suggestion whose rejection brings back a renamed key, such as superscript, refuses too (look) | Refuse only keys the target does not declare | key only refusal | small |
| Rejections the fit repairs | Still load, as at base, and reject then reports invalid, such as a paragraph suggested from a quote that held bare text. The migration has no editor to fill emptied blocks the way reject does, and checking without that fill refused a legitimate case (look) | Give the migration the editor's fill and refuse them | refuse repaired rejects | small |
| A light weight inside a heading | Stores nothing, so it draws as bold as the heading, as at base. Bold cannot say "lighter than the block" (look) | Store a weight reset, a second weight record beside bold | store weight resets | small |
| Style text on the server | The server reads style text as linkedom keeps it, as at base. A repeated property reads its last declaration, so an earlier important weight loses, and the server ignores a weight in a font shorthand, under a capitalized property or beside a comment, so a light strong stays bold there. Rewriting the style text before the DOM parsed it broke browser paste and quoted values (look) | Give the server a CSS parser | server css parser | small |
| Speed gate baseline | The phase-1 tree, so the gate times only the paste change and not the composer fix | Base | gate against base | detail |
| A bold tag inside light text | Stays bold, as ProseMirror and Tiptap read it | Read it as CSS draws it, at 400 | b draws as css | small |
| A bold tag set to 500 | Pastes plain, as CSS draws it (look) | Read it bold, as base, ProseMirror and Tiptap do | strong 500 bold | small |
| Word cleanup | Stops copying a block's weight onto the span inside it, so a relative weight counts once | Keep the copy and let bold count it twice | keep word weight copy | small |
| Plite's composer | Fixed in this run, because the new paste rule hits it (look) | A separate task, with paste writing no "not bold" values meanwhile | split composer fix | small |
| Paste speed gate | The frozen v3 timing test runs on the finished code in step 3, because the v2 run timed a copy of the decoder on a busy machine | Wait for a quiet host before building | wait for quiet host | detail |
| MDX weight spans | Stay out of bold, as in the default editor today | Add a span rule, which makes a bold-only editor refuse every span | read weight spans | small |
| Apps built from unreleased source | Follow the plan's recipe, as for line heights; released betas use the guide's two ways out (look) | Plate ships a step for source-built apps | beta weight step | small |
| The size parser | Moves into the copied size box, reads px and pt, and shows other units as saved | Move it unchanged | keep the old parser | small |
| Next move | Review the plan, then build | Stop at the plan | hold | detail |

## Open work

- Italic, underline and strikethrough keep the subtree veto that `EDIT-CLIPBOARD-HTML-MARK-001` names. Owner: a suggested task after this lands. Stop: none.
- The closed-schema error names no node path, so the weight refusal says what but not where. Owner: a suggested task. Stop: none.
- The Markdown runtime drops a span style that no plugin claims, such as a weight beside a size, without a report. Owner: a suggested task. Stop: none.
- MDX `<b>` and `<strong>` stay plain text, as today. Owner: none until an ask needs them.
- A pending v53 superscript add migrates to a `superscript` format change on a leaf that stores `script: 'sup'`, so rejecting it leaves the superscript, at base too (`superscript-add-a1-a1.log`). Owner: a suggested task. Stop: none.
- Plate's HTML decode copies each marked element's decoded value onto every text below it, so nested marks of any kind cost the square of their depth. Bold avoids it by answering only where it changes the drawn weight, though nested heavy weights still repeat it. The fix passes inherited values top-down and gives decoders one computed-style reader per parse, which retires bold's own weight cascade (diff panel round 1). Owner: a suggested task. Stop: none.
- The paste decode's mutation check sees only the decoded element's own attributes and child list, so a decoder that edits a descendant or a child's text passes. A `MutationObserver` on the root per decode would catch every edit at the cost of the mutations made. Owner: a suggested task. Stop: none.
- `migrateV54` loads a legacy suggestion whose rejected document the fit repairs, and the editor's reject then reports invalid, as at base. Owner: a suggested task to give the migration the fill the editor's reject runs. Stop: none.
- On the server, linkedom keeps style text as written, as at base. A repeated style property reads its last declaration, so `font-weight: 400 !important; font-weight: 800` pastes bold where a browser draws 400. The server ignores a weight in a `font` shorthand, under `FONT-WEIGHT` or beside a comment, so `<strong>` with such a light weight pastes bold. Other styles keep `!important` in their value, so a stored color reads `red !important`, and italic, alignment and line height with the flag drop (`r3-server-base-a1.log`, `r3-server-final-a1.log`). A text rewrite of the style broke browser paste and quoted values (diff panel round 2). Owner: a suggested task to give `platejs/html/server` a CSS parser that honors priority, case and shorthands. Stop: none.
- The guide's pre-pass lives in three copies, the English and Chinese guides and the copy `migratePlateV54.spec.ts` tests, and nothing checks that they match. Owner: a suggested task for a check script. Stop: none.
- `t_15c1b9b9` Time bold's pasted-weight decode on a quiet host, phase-1 tree against the styles build. Step 3's frozen v3 run on the final tree was inconclusive only because the host's one-minute load reached 159 against the limit 6 (`paste-weight-v3-final-a1.log`). Owner: the owner, who starts it from its card once this lands. Stop: that task landing or being dropped. Tracked in the suggested-task ledger.
- `t_6e758b7d` Make the structural decision law give one document for every decision order. Fast-check seed 1483563249 fails the law at `eabe8a1300` as on this build (`replay-structural-base-v2-a1.log`). Owner: the owner. Stop: that task landing or being dropped. Tracked in the suggested-task ledger.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

Prior work. `node tooling/scripts/review-ledger.mjs lookup styles` names the [2026-10-04 audit](../research/review-records/2026-10-04-styles-audit.json) as the head, a Pursue that no plan adopted, from the [ledger triage audit](2026-10-04-ledger-triage-audit.md). It reads stale because `BaseStylePlugins.ts`, its spec and `font.tsx` changed since, and `VISION.md` and `docs/vision/common.md` moved. Since the audit's commit `fe0e9599a6`, `aa2f91c342` stored line height as a validated number and `font.tsx` dropped its black default color. Neither touched weight or `toUnitLess` (`git diff fe0e9599a6 HEAD`, filtered on weight, `toUnitLess` and the font kit). Its one plan is the [2026-07-07 basic-styles package review](2026-07-07-plate-next-basic-styles-package-review.md), which moved the package into `platejs`. A `git grep` over `docs/plans` and `docs/research` for weight and `toUnitLess` finds that audit, the triage page, two research notes on Google Docs and Tiptap paste and older plans that mention the package, and no plan that changed weight. The search covers committed and untracked files only.

### Requirements

- Semantic marks persist as flat booleans with semantic HTML tags and Markdown nodes (`BaseMarkPlugins.ts`).
- Feature properties stay flat and schema-owned ([plate.md](../vision/plate.md), lines 601 to 602).
- Two independently writable truths for one domain fact cost 2.0 and block a score ([architecture.md](../../.agents/playbooks/references/architecture.md), line 112).
- HTML, DOCX and Markdown import and export map each fact once.
- One-owner helpers stay in their entrypoint or copied registry item ([plate.md](../vision/plate.md), lines 96 to 97).
- Plugin-owned property keys and value laws are immutable, so a persisted rename is a new field plus a migration ([plate.md](../vision/plate.md), lines 805 to 807), and a migration keeps inactive author intent ([plate.md](../vision/plate.md), lines 607 to 609).
- A Google Docs paste wraps its HTML in `<b style="font-weight: normal">`, and that wrapper is not bold (`BaseMarkPlugins.spec.tsx`, line 125).
- A Plate editor's schema is closed. A stored property no plugin declares fails on load, at migration completion and in a saved selection's marks (`unowned-weight-load-a2.log`, `migrate-unowned-weight-a1.log`, `selection-marks-a2.log`). Plite's derived default keeps it (`schema-compiler.ts`, line 74), but Plate lowers a closed policy.
- v53 drew a saved weight on the bold element itself, so a weight beside bold drew at that weight (`pipeRenderLeaf.tsx` and `pluginRenderLeaf.tsx` at `2f87593f95`).
- Pasted HTML with a normal weight nested inside bold unbolds only its own text (`EDIT-CLIPBOARD-HTML-MARK-001`, `markdown-editing-spec.md`, line 2602, proposed).
- Hard cuts beat compatibility during the beta ([VISION.md](../../VISION.md), Invariants 1).

### Lanes

1. **Keep `FontWeightPlugin`. Loses.** The probe shows two writers for one fact. A pasted `font-weight: 700` stores `{ bold: true, fontWeight: '700' }`. After `editor.update.bold.toggle()` the leaf is `{ fontWeight: '700' }`, and copied HTML is `<span style="font-weight: 700">`, so the text stays bold. The view draws the same inline style through the plugin's `styleKey` injection, which the probe did not render.
2. **Strongest deletion: delete `BaseFontWeightPlugin`, `FontWeightPlugin`, `PLUGINS.fontWeight` and the docs that teach them, and let bold read every heavy weight. Wins.** No registry kit installs the plugin; only the DOCX font and headers tests, the HTML and Markdown conformance specs and the docs do. Bold already reads 600, 700 and `bold`, and reading the weight each element draws at closes the gap the probe measured in the default kit. The v54 step converts no saved weight, because v53 drew it on top of bold.
3. **Keep a plugin only for weights bold does not own. Loses.** It keeps 300 and 500 through paste, but one CSS property then splits across two plugins with a boundary rule, and no reference editor does this. An app that wants light weights declares its own string mark with the same `definePlugin` call the package uses today.
4. **Store theme tokens instead of raw CSS values. Loses.** HTML and DOCX interchange need literal CSS values, and palettes are product policy.
5. **Merge the presentation marks into one object, as Tiptap's `TextStyle` does, or one style string, as Lexical does. Loses.** Plate law keeps feature properties flat and schema-owned.
6. **Move color, background, family and size out of the package into copied UI. Loses.** Their HTML and DOCX mappings run headless on paste and import, with no UI installed.
7. **Move `toUnitLess` into the copied font-size control. Wins, with lane 2.** It is the only consumer, and `mark-toolbar-button.spec.tsx` mocks the root export only because that control imports it.
8. **The rule is wrong. Not a lane.** No subject decision or Vision rule blocks the target.

Benchmark's pre-acceptance probe ran, because bold now decodes every pasted element with a weight, so the change can scale with paste size. The first protocol, `bench/paired-config.json` over `bench/paste-weight-v2.frozen.bench.ts`, timed five cohorts against a budget of 1.5 times base, with a planted arm and a same-code arm. Its run was inconclusive, because the one-minute load reached 58 against a limit of 6 (`paste-weight-paired-a1.log`). The plan panel's third round then found that its candidate arm ran a copy of the decoder written inside the bench, so no v2 number timed the code that ships.

The frozen v3 protocol replaces it. `bench/paste-weight-v3.frozen.bench.ts` loads `BaseBoldPlugin` from the tree each arm names, so the arms differ only in `--tree`, and `bench/write-config-v3.mjs` writes the config. Base and the planted arm run on the phase-1 tree, the planted arm parsing twice per sample; the candidate and the same-code arm run on the final tree. The budget stays 1.5 times base on the median microseconds per parse, over eight cohorts: Google Docs pastes of 50 and 2,000 paragraphs, 500 paragraphs inside 40 `div`s, 500 paragraphs inside 10 `div`s set to 400, and 200 nested spans alternating 700 and `bold`, all 400, or alternating `lighter` and `inherit`, plus 2,000 mixed paragraphs. Only the mixed cohort's arms parse different HTML, because base reads a reset inside bold literally, so its arm parses the HTML that gives the same document. Each run checks its block and bold-leaf counts, and a known-bad run that drops one paragraph fails with its own message (`round3-measure-a1.log`).

A five-sample smoke of v3, two rounds against base at load 9 to 17, is one run and no verdict (`round3-measure-a1.log`). The candidate tree, base plus round 3's patch, scored 1.0 to 1.16 times base on the large, deep, wrapped and mixed cohorts and 0.56 to 0.66 on the nested one. The cohorts that take 4 to 12 ms moved by a millisecond or two between rounds, once to 2.0 times base, which the smoke's millisecond output cannot resolve. The planted arm scored 1.7 to 3.5 times base. Before round 3's fixes, nested light spans cost 2 to 7 times base at depths 100 to 250 (`nested-light-a1-a1.log`). The element-local mutation check alone brought 400 spans back to base, while `lighter` and `inherit` stayed at 3 to 6 times (`nested-light-split-a1-a1.log`), and the walk cache brought every kind to 1.0 to 1.3 times (`nested-light-fixed-a1-a1.log`). On one tree, 2,000 resets inside bold cost 1.61 to 1.76 times the equivalent HTML before the drop of turned-off values and about 1.1 after (`mixed-predrop-a1.log`, `round3-measure-a1.log`).

The decision is a gate. Step 3 runs the frozen v3 protocol on the final tree against the phase-1 tree, and a miss sends the design to `architect`. The composer's work count is deterministic, so it needs no quiet host (`concat-work-a1.log`). The rest of the change deletes code.

Proof limits. The probes ran in happy-dom through `bun test`, not a browser, so the view's inline style is read from source. Every timing ran on a host whose one-minute load stayed between 9 and 58, so no timing in this plan is a verdict; the token and DOM work counts are exact. happy-dom drops a decimal weight such as `650.5`, so the package tests cover integers and keywords only. The census is in-repository, so external apps that install `FontWeightPlugin` or store `fontWeight` are unknown. The lead read the reference editors and ran none of them.

### Probe

The run directory, `docs/plans/artifacts/2026-10-19-styles-review/`, holds every probe as a scratch spec run from the worktree:

- `fontWeight.probe.spec.ts` passes 3 of 3 (`probe-font-weight-a1.log`). It shows the double store on paste, the bold weight that survives turning bold off, and that with only bold installed `font-weight: 800` and `bolder` paste as plain text while 600 pastes as bold. The DOCX font test passes at the base and expects `fontWeight="bold"` beside `bold` (`docx-font-duplicate-a3.log`).
- `unowned-weight-load.probe.spec.ts` and `migrate-unowned-weight.probe.spec.ts` show the closed schema refusing an undeclared `fontWeight` on load and at migration.
- `mdx-weight.probe.spec.ts` and `bold-guard.probe.spec.ts` show today's Markdown and paste rules for weight.
- `false-reset.probe.spec.ts` and `false-insert.probe.spec.ts` show a `false` decode resetting inherited bold through paste insertion and Markdown.
- `computed-weight.probe.spec.ts` ran round 1's computed-weight decode on that round's cases (`computed-weight-a2.log`). `resolved-weight.probe.spec.ts` runs the planned stated-weight decode on round 2's 25 cases, through paste, Word paste and `platejs/html/server`, beside base and the computed reader. 24 read as planned, and the Word case reads bold until the cleanup change (`resolved-weight-a1.log`).
- `prepass.probe.spec.ts` shows round 2's pre-pass rewriting `meta.theme.fontWeight`, dropping a root named `fontWeight` and renaming a suggestion's snapshot, and the new pre-pass keeping metadata, refusing the suggestion and migrating a raw v53 value (`prepass-a1.log`, 7 pass).
- `weight-remove-reject.probe.spec.ts` shows a loaded v53 weight removal returning `invalid` on reject and staying pending (`weight-remove-reject-a2.log`).
- `bench/concat-work.bench.ts` counts the tokens Plite's composer copies while loading N paragraphs that each hold one `bold: false`, at base and with the join buffer (`concat-work-a1.log`). The patched `root-change.ts` passes the Plite bun suite, 4,268 tests (`compose-fix-plite-bun-a1.log`).
- `weight-suggestion.probe.spec.ts`, `selection-marks.probe.spec.ts` and `weight-remove.probe.spec.ts` show v53 weight suggestions and saved selection marks refusing in a bold-only target and loading where the target declares `fontWeight`, and one removal suggestion that loads anyway.
- `span-register.probe.spec.ts` shows a bold span rule refusing every `<span>` in a bold-only editor.
- `prepass-a3.probe.spec.ts` runs round 3's pre-pass on 7 cases, pending format changes and captions included (`prepass-a3-a1.log`, 7 pass). `prepass-a2-control.probe.spec.ts` runs round 2's pre-pass on two of them: a rejected weight comes back as `{"text":"x"}`, and a weighted caption throws on `fontWeight` (`prepass-a2-control-a2.log`).
- `superscript-removal-probe.spec.ts` shows a v53 superscript removal refusing under the fit with every change rejected (`round3-measure-a1.log`). `superscript-probe.spec.ts` shows a pending superscript add whose rejection keeps the superscript, on base and on the candidate (`superscript-add-a1-a1.log`).
- `bench/nested-light.bench.ts` times nested spans by kind and depth (`nested-light-a1-a1.log`, `nested-light-split-a1-a1.log`, `nested-light-fixed-a1-a1.log`), and `bench/false-everywhere.sh` times them with bold turned off on every light element (`false-everywhere-a1.log`). `bench/mixed-split.bench.ts` times resets inside bold against the equivalent HTML on one tree (`mixed-predrop-a1.log`).
- `round3-controls-messages.sh` runs round 3's new tests on the candidate, on one mutant per fix that `round3-mutants.mjs` writes, and on base (`round3-controls-a2.log`). `round3-candidate.patch` is the scratch diff round 3's probes and timings ran on, 9 files with 562 lines added and 31 removed, probe specs excluded.

### Predicted benefits

- A pasted or imported bold run stores one property, `bold: true`.
- Turning bold off leaves no bold weight in the view or in copied HTML.
- 800, 900 and `bolder` paste as bold in the default kit, and a normal word inside bold text unbolds alone.
- Loading or pasting a document whose leaves hold many stripped default values copies each token once. The token counts drop from 13,010,995 to 13,000 at 1,000 leaves (`concat-work-a1.log`). One 2,000-leaf load took 28.0 seconds at base and 0.44 seconds with the fix, with the same document digest, in one run per tree on a host at load 20 to 33 (`fit-false-a1.log`).
- `platejs` and `platejs/react` lose four names, `BaseFontWeightPlugin`, `FontWeightPlugin`, `PLUGINS.fontWeight` and `toUnitLess`, plus the `fontWeight` portal.

### Dependents

- `basic`: affected. `packages/platejs/src/features/basic-nodes/lib/index.ts` re-exports `BaseMarkPlugins.ts`, whose bold rule changes. `apps/www/src/registry/components/editor/basic-nodes.tsx` installs `BasicMarksKit`, which does not change.
- `distribution`: affected. `packages/platejs/src/root.tsx` re-exports basic styles, so the weight plugin and `toUnitLess` leave the root, and `packages/platejs/src/utils/index.ts` re-exports `PLUGINS`, which loses `fontWeight`. `packages/platejs/src/internal/plugin/markdownParagraph.ts` reads `PLUGINS` but never `fontWeight`.
- `editing`: unaffected. `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts` and its siblings read `PLUGINS` and never `fontWeight`.
- `pagination`, `runtime` and `ui`: unaffected. `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx`, `iframe.tsx` and `hovering-toolbar.tsx` import the Plite example `mark-utils.ts`, and `[example]/page.tsx` and `plite-example-client.tsx` import the example registry. None reads weight.
- `persistence`: affected. `packages/platejs/src/migrations/migratePlateV54.ts` fits the document with every pending change rejected and refuses a legacy suggestion the target could not reject. `migratePlateV54BuiltIns.internal.ts` resolves the step's built-in plugins and does not change.
- `react`: affected. `packages/platejs/src/react/features/basic-styles/BasicStylePlugins.tsx` loses `FontWeightPlugin`.

### History

- This review supersedes the [2026-10-04 audit](../research/review-records/2026-10-04-styles-audit.json). It keeps the audit's target and rejected lanes, settles its open choice between the cut and a light-weight plugin for the cut, and adds the probe's measurements and the heavy-weight paste gap.
- It retains the [2026-07-07 basic-styles package review](2026-07-07-plate-next-basic-styles-package-review.md) as history. Its proof predates the current plugins.
- External checkouts read on 2026-10-19: `../tiptap` at `91c51be53c`, `../lexical` at `dd5c41b131`, `../ckeditor5` at `14e73cc31b`, `../prosemirror-schema-basic` at `6daea265c3` and `../BlockNote` at `1e26f1c5e1`.
