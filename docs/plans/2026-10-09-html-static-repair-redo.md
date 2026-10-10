---
review_scopes: [html, exports]
review_basis: []
work_kind: implementation
review_commit: 666f02406e936864cc61e5ccb6824321df4d9a42
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, packages/platejs/src/static/renderStaticHtml.tsx, packages/platejs/src/static/internal/renderStaticHtmlWithOverrides.tsx, packages/platejs/src/static/internal/staticComponentOverrides.ts, packages/platejs/src/static/internal/staticDocumentView.ts, packages/platejs/src/static/pluginRenderElementStatic.internal.tsx, packages/platejs/src/static/pluginRenderLeafStatic.internal.tsx, packages/platejs/src/static/pluginRenderTextStatic.internal.tsx, packages/platejs/src/internal/plugin/pluginStore.ts, packages/platejs/src/docx/export/lib/exportDocx.tsx, packages/platejs/src/docx/export/lib/docxStaticComponents.tsx, packages/platejs/src/docx/export/lib/internal/render-document-file.ts, apps/www/src/registry/components/editor/export-toolbar-button.tsx, apps/www/src/registry/components/editor/plugins.ts, apps/www/src/registry/components/editor/plugins-static.ts, apps/www/src/registry/components/editor/block-list-static.tsx, apps/www/src/registry/components/editor/ai.tsx, apps/www/src/registry/components/editor/dnd.tsx, tooling/entrypoints/entrypoint-dag.mjs]
---

# Export draws with the app's static kit

Status: awaiting: phase 1 is committed on branch `export-static-presentation`, not pushed; two critical panel findings wait for a new plan iteration
Playbook: plan

This iteration redoes `docs/plans/2026-10-09-html-static-repair.md` at claude-opus-5-5 @xhigh. That draft ran on gpt-6-astra @medium and claude-opus-5-5 @medium and is now superseded. The plan fixes the two export defects. Exporting a document with a table, an image, a task list or other interactive content crashes, because export draws each block with its editing component. Eighteen kinds of content crash the HTML render, and twelve crash the render step Word export runs. Style props passed to export can also swap out the exported document. The live editor keeps deciding what each block means and how it is configured, and export asks the app's static kit only how to draw each block, by plugin name. An `architect` arena with three runners from two model families converged on this shape, and a blind judge picked it over the draft's second export editor (`docs/plans/artifacts/html-static-repair-redo/architect/synthesis.md`). A three-model panel then reviewed the plan three times, and this revision settles every finding.

## Brief

### What will change?

Export will draw each block with its read-only version. Tables, images, task lists and everything else that crashes today will export to HTML and Word. Word keeps nested list levels, and style settings can't swap in another document.

### What could go wrong?

Exported files change a little. Editing leftovers disappear, and lists indent once. A block with no read-only version comes out plain with a warning, or stops a strict Word export. Ziad's suggestion rework also changes Word export.

## Teach

Export turns a document into a file. Plate draws every block as HTML and saves it. Word export converts that same HTML into a Word file.

Every block has two versions in the app. The editing version has toolbars and menus, and it only works inside a running editor. The read-only version is plain HTML, kept in a separate set for servers and previews. Export uses the editing version today, so blocks with toolbars or menus crash. Plain text, headings, links and dates have none, so simple documents export fine.

The fix keeps the live editor in charge of what each block is and how it is set up. Export borrows only the read-only look, matched by block type. A block with no read-only version comes out plain, with a warning.

## Reproduce today

Both defects reproduce on `next` at 666f02406e, and the export code has not changed since the draft's baseline 795d0bc491.

### Bug 1: interactive blocks crash export

Start the app from source. From the repository root, run:

```sh
cd apps/www
PLATE_WWW_DYNAMIC_DOCS=1 PLATE_WWW_DEV_SOURCE=1 \
PLATE_WWW_DIST_DIR=.next-html-repro pnpm exec next dev --port 3311
```

1. Open `http://localhost:3311/blocks/docx-demo`.
2. Open **Export**, then choose **Export as HTML**. The starting document downloads. This is the control.
3. Click inside the editor. Open **Table**, then **Table**, then **Insert 2 by 2 table**.
4. Open **Export** and choose **Export as HTML**, then **Export as Word**.
5. Read the browser console.

| | Result |
| --- | --- |
| Actual | Both exports throw `useEditor() requires an active Plate editor`, and the stack names `TableElement` inside the static renderer. Nothing downloads. |
| Expected | Both downloads contain the table, drawn without editing controls. |

An image, a task list, a callout, columns, a code block, a mention or a footnote fails the same way; the full list is in `element-probe/probe-a4.log`.

### Bug 2: style props swap the exported document

Save this file as `packages/platejs/repro-props.ts`:

```ts
import { createEditor } from './src/core';
import { BaseParagraphPlugin } from './src/lib';
import { renderStaticHtml } from './src/static/renderStaticHtml';

const make = (text: string) =>
  createEditor({
    plugins: [BaseParagraphPlugin],
    initialValue: [{ type: 'paragraph', children: [{ text }] }],
  });
const source = make('SOURCE');
const foreign = make('FOREIGN');

for (const [name, props] of Object.entries({
  control: {},
  editorProp: { editor: foreign },
  documentProp: { document: foreign.read.value() },
})) {
  const { data } = await renderStaticHtml(source, { props });
  console.log(name, data.includes('SOURCE'), data.includes('FOREIGN'));
}
```

Run it from the repository root, then delete the file:

```sh
pnpm --dir packages/platejs exec bun \
  --preload ../../config/plite-source-aliases.ts ./repro-props.ts
```

| Case | Actual | Expected after the fix |
| --- | --- | --- |
| No props | `control true false` | `control true false` |
| `props.editor` | `editorProp false true` | TypeScript rejects the call; at runtime it throws a TypeError naming `props.editor` |
| `props.document` | `documentProp false true` | TypeScript rejects the call; at runtime it throws a TypeError naming `props.document` |

The export's warnings still describe SOURCE while the file holds FOREIGN (`docs/plans/artifacts/html-static-repair-2026-10-09/capture-base-a1.log`).

## Target

Exporting a live editor reads one snapshot taken when the export starts: the document, the projection, and every plugin setting the drawing reads. It draws that snapshot with the app's static kit, picked per plugin, and never runs an editing component. A server render or an AI preview has no live editor, so it builds an editor from the same policy the live editor uses, plus the static kit. The Word converter owns what Word needs, such as list levels, and the app's copied stylesheet owns the look. The `presentation` option stays in the end state, because the live editor's components remain editing components. Phase 1 builds the drawing part for the export toolbar. Taking every setting with the document needs its own plan, because the panel showed that the code highlighter keeps shared state no simple snapshot can freeze. Phases 2 and 3 finish editor-less renders and Word.

## Fit with the authored redesign

Ziad's `docs/plans/2026-10-08-authored-review.md` moves suggestions into the document itself. Its Phase 1 is built and kept, and its Phase 2 switches the code over. After that cutover, `editor.read.value()` holds the review tree, with struck and inserted text in place and an `authored` mark on each suggested leaf or element; `meta.authored` is gone. `projectAuthoredDocument(document, { projection })` stays as the one pure read for accepted and proposed content. `projectAuthoredRange`, `projectAuthoredReview`, `isAuthoredEditor` and the `projection` view input are deleted. Those claims come from that plan's Document shape, Main changes and Hard cuts; this checkout does not hold its Phase 1 code, so nothing here ran against it.

The two plans meet in three places, all inside Word export and the export toolbar:

| Today | Why it changes | Who changes it |
| --- | --- | --- |
| Word's review output renders a merged review document, then `applyReviewProjection` finds each rendered block by its path and wraps it in `<ins>` or `<del>` | Its input, `projectAuthoredReview`, is deleted; the review tree already carries the marks | The authored plan's Phase 2 step "Adopt serializer projections", which this plan asks to draw `authored` marks as Word revisions through Word's private map during the same render |
| `exportDocx` maps comment ranges into the accepted output with `projectAuthoredRange` | Deleted; ranges become review-tree positions | The same step, which this plan asks to map ranges inside `exportDocx` from the resolver |
| The toolbar collects comment ranges from a projected view built with `isAuthoredEditor` and `createEditorView(model, { authored })` | Both are deleted | The same step; the toolbar then passes review-tree ranges as they are |

What this plan's phase 1 changes does not depend on how suggestions are stored: which components draw, the props rejection, Word list levels and the static list indent. So phase 1 can land before the cutover, and the cutover keeps the `presentation` option, the missing-drawing diagnostic and the diagnostic collection in `exportDocx`. If the cutover lands first, phase 1 builds on the review tree instead, and the same steps apply.

## What other editors do

Every editor read here keeps export drawing apart from the interactive view, and none exports through the interactive view. ProseMirror and BlockNote were read at the commits below during this run. Tiptap and Lexical come from the repository's research pages, which read them at the named commits. Slate was not read this run.

| Editor | Export drawing | Interactive drawing | Where both live | What export uses |
| --- | --- | --- | --- | --- |
| ProseMirror (`prosemirror-view@ca4c78e`) | Schema `toDOM`, run by `DOMSerializer` | Node views passed to the view | `toDOM` on the schema, node views on the view | Clipboard serializes with `DOMSerializer.fromSchema` and never calls a node view (`src/clipboard.ts:17`, `:60`) |
| Tiptap (`ueberdosis/tiptap@91c51be53c`) | `renderHTML`, which becomes `toDOM` | `addNodeView`, React node views | Both on one extension | `getHTML`, `generateHTML` and `@tiptap/static-renderer` use `renderHTML` or explicit node and mark mappings (`docs/research/sources/tiptap/conversion-and-export.md`) |
| Lexical (`facebook/lexical@dd5c41b1`) | `exportDOM`, defaulting to `createDOM` | `decorate()` React decorators | Both on one node class | `$generateHtmlFromNodes` uses `exportDOM` (`docs/research/sources/lexical/conversion-and-export.md`) |
| BlockNote (`BlockNote@be20d8b`) | `toExternalHTML`, falling back to `render` | `render` | Both on one block spec (`packages/core/src/schema/blocks/types.ts:215-240`) | External HTML uses `toExternalHTML` (`packages/core/src/api/exporters/html/util/serializeBlocksExternalHTML.ts:100`); the Word exporter takes the schema plus per-block mappings (`packages/xl-docx-exporter/src/docx/docxExporter.ts:55-87`) |
| Slate | None; apps write their own serializer | `renderElement` in `slate-react` | App code | Not read this run |
| Plate today | `foo-static.tsx` components in `BaseEditorKit` | `foo.tsx` components in `EditorKit` | Separate install items and kits, by law | The live editor's editing components, which is the bug |

Plate's law keeps the two drawings in separate install items, while Tiptap, Lexical and BlockNote put both on one node definition. The target keeps Plate's separation and borrows what all four share. Export picks the export drawing for a node by its type, and the node's meaning stays in one place.

## Public API

The export toolbar's HTML call passes the app's static kit as the drawing source.

```tsx before
// apps/www/src/registry/components/editor/export-toolbar-button.tsx
const result = await renderStaticHtml(model, {
  component: EditorStatic,
  projection,
  props: { style: { padding: '0 calc(50% - 350px)', paddingBottom: '' } },
});
```

```tsx after
// apps/www/src/registry/components/editor/export-toolbar-button.tsx
const result = await renderStaticHtml(model, {
  component: EditorStatic,
  presentation: BaseEditorKit,
  projection,
  props: { style: { padding: '0 calc(50% - 350px)', paddingBottom: '' } },
});
```

The Word call passes the same kit.

```tsx before
// apps/www/src/registry/components/editor/export-toolbar-button.tsx
const result = await exportDocx(model, {
  comments: docxComments,
  component: EditorStatic,
  lossPolicy: 'allow',
  projection: wordProjection,
  source: docxSource?.source,
  stylesheet: DOCX_EXPORT_STYLES,
});
```

```tsx after
// apps/www/src/registry/components/editor/export-toolbar-button.tsx
const result = await exportDocx(model, {
  comments: docxComments,
  component: EditorStatic,
  lossPolicy: 'allow',
  presentation: BaseEditorKit,
  projection: wordProjection,
  source: docxSource?.source,
  stylesheet: DOCX_EXPORT_STYLES,
});
```

The option types change as below. The server HTML block and the AI preview call nothing new, because a static editor draws with its own plugins.

| Option | Today | Target |
| --- | --- | --- |
| `renderStaticHtml` `presentation` | none | optional static plugin array; for each plugin key, its element component, mark component (leaf or text placement) and wrapper slots draw the export, and nothing else of it is read |
| `exportDocx` `presentation` | none | the same option, used for the body and every comment body |
| `renderStaticHtml` `props` | `Partial<T>`, spread over the captured editor | appearance props only; `editor` and `document` are typed `never` and throw a TypeError at runtime |
| Diagnostics of both functions | authored projection and Word losses | also `missing-static-presentation`, naming each plugin whose block, mark or function wrapper had no static drawing; Word counts every one as lost content, so `lossPolicy: 'reject'`, the default, refuses the file and `'allow'` keeps it with the warning |

## Layer and owner

| Delta | Job | Owner |
| --- | --- | --- |
| changed | Read the document, project suggestions, render, return HTML and diagnostics | `renderStaticHtml` in `platejs/static`, with one presentation binding per render that every view the render creates inherits |
| changed | Pick the component that draws a node | Static dispatch in `platejs/static`. With `presentation`, the static plugin of the same key supplies the element component, both mark placements and the wrapper slots written as functions; Word's private map wins over it for its eight types. A plugin that draws but has no static peer draws the structural default and adds a `missing-static-presentation` warning. Edit-only parts stay out, and wrapper slots written as objects with a `match` stay undrawn, as today. Without `presentation`, the editor's own components draw. |
| changed | Word body, comments, review markup and exact source reuse | `exportDocx` in `platejs/docx/export`; its HTML converter takes a list's level from the list's host block indent when the list has none |
| changed | Static presentation and its kit | Copied registry `foo-static.tsx` items, composed in `plugins-static.ts` as `BaseEditorKit`, which export also receives as `presentation` |

Every owner is in an existing entrypoint. `static` depends on `authored`, `core` and `dom`, and `docx/export` already depends on `static` (`tooling/entrypoints/entrypoint-dag.mjs`). No new edge.

## Hard cuts and app migration

| What breaks | Callers | Migration |
| --- | --- | --- |
| `renderStaticHtml` `props` stops accepting `editor` and `document` | None in the repository; the toolbar, the server HTML block and Word export pass only `style` | Pass another document through the top-level `document` option |
| A live editor exported without `presentation` | The registry toolbar, changed in the same step | Pass the app's static kit; without it, rendering keeps today's behavior |

## Main changes

- One presentation binding per render. Every view the render creates reads it, including named roots and Word comment bodies, and the private element-only override map folds into it. Plugin settings are read when the drawing runs, as today, so a setting changed while an export waits for the renderer can still reach that export (`capture-law-probe/probe-a1.log`); a separate plan owns that gap.
- Static dispatch draws elements, both mark placements and the wrapper slots written as functions (`wrapNode`, `wrapNodeChildren`, `afterNodeChildren`) from the presentation. It already honors `editOnly`, and it keeps dropping slots written as an object with a `match`, as it does today (`pluginRenderElementStatic.internal.tsx:47-120`). In the registry those are drag handles, AI chat and the discussion wrapper, all editing UI.
- Word's HTML converter passes each host block down its recursive conversion as an argument, through the parent fallback `getIndentLevel` already has (`render-document-file.ts:636-656`), so a list with no margin takes its nearest host block's indent. The host indent adds no module state; the converter's existing list-numbering state is still module-wide, which Open work tracks. The static list wrapper drops its own per-level margin. HTML then indents lists once, and Word keeps nested levels, which today's toolbar export flattens to level 0 (`list-probe/probe-a3.log`). The measured prototype used a module variable instead (`list-probe/converter-prototype.patch`); it proves the result, not the shape.

## Redo

The draft is `docs/plans/2026-10-09-html-static-repair.md`. Its lead ran on gpt-6-astra @medium in Codex, its later revisions on claude-opus-5-5 @medium in Claude Code, and its seats recorded no effort. This run's lead is claude-opus-5-5 @xhigh, so every judgment in the draft is redone and deterministic proof on unchanged export source is reused. `git diff --stat 795d0bc491 666f02406e` touches no export source, only the emoji picker.

| Unit | Producer | Level | Verdict | What happened |
| --- | --- | --- | --- | --- |
| Plan, scope and Defaults | Draft lead and review session | gpt-6-astra @medium; claude-opus-5-5 @medium | redo | Rewritten from the owner's typed asks and the measurements below. |
| Bug 1 scope probe (`review-all-elements-a3.log`) | Review session | claude-opus-5-5 @medium | redo | The draft logged it partial, with blockquote inconclusive and media and task lists unmeasured. Rerun over 170 real blocks, blockquote works, while media and the task-list marker fail. |
| Browser repro of the table crash (`browser-base-errors.json`) | Draft lead | gpt-6-astra @medium | reuse | Deterministic, on export source unchanged since 795d0bc491. |
| Bug 2 API probe (`capture-base-a1.log`, `documented-reproduction.log`) | Draft lead | gpt-6-astra @medium | reuse | Deterministic, same source. |
| Static base controls (`static-base-a2.log`, 31 tests) | Draft lead | gpt-6-astra @medium | recheck | Reused for the plan; the build reruns them, because it changes their inputs. |
| Architect arena (opus and astra answered, sol timed out) and its cross-judge | Draft lead's seats | no effort recorded; sol missing | redo | Rerun with all three runners at the models sheet's levels and the draft's design as a fourth candidate. |
| Mode, cost and type prototypes (`mode-prototype-*`, `cost-*`, `table-mode-*`) | Draft lead | gpt-6-astra @medium | reuse | Evidence for the withdrawn per-component mode only. The new target reuses the frozen cost contract `performance-contract.json` and cites nothing else. |
| Plan panel on the mode design (three seats, no critical) | Draft lead's seats | no effort recorded | redo | It reviewed a withdrawn design. This plan gets its own panel. |
| Owner's withdrawal of the 27-file implementation | Owner | n/a | reuse | The ruling stands; the saved patch is not restored. |
| Bug 2 regression run (`capture-red-a1.log`) | Draft lead | gpt-6-astra @medium | reuse | Deterministic evidence that both props cases fail at base; its test lived in the withdrawn patch, and phase 1 writes test e afresh. |
| Table width and named-root probes (`table-owner-a2.log`, `named-root-base-a1.log`) | Draft lead | gpt-6-astra @medium | reuse | Deterministic, on unchanged source. The named-root probe backs the presentation binding that derived views inherit; the table probe shows the static cell reads the configured width. |
| Repair direction and Questions for Ziad | Review session | claude-opus-5-5 @medium | redo | Redone through the arena; the questions evidence settles are answered in Settled decisions. |
| Writing passes | Draft lead and review session | as above | redo | The prose is new. |

## What changed from the draft

| Draft pick | Now | Why |
| --- | --- | --- |
| Capture on the live editor, render through a second editor built from the static kit | Keep the live editor for meaning and settings; borrow only drawing from the static kit | A second editor makes the static kit's options the export's meaning. That is the second plugin list the owner ruled out, and the 2026-09-24 plan deleted that export editor on purpose (`docs/plans/2026-09-24-document-first-export-contracts.md:367-368`). |
| A new public capture entry shared by HTML, Word and Markdown | Dropped; the capture stays inside each export function | The live editor already projects suggestions, reports diagnostics and builds Word review correctly (`capture-probe/probe-a5.log`). |
| Three kit layers in phase 1 | Phase 2, for the editor-less server block and AI preview | Live export reads no static option, so drift cannot reach it. |
| Eleven failing element types, media unmeasured | 17 element types plus the task-list marker in HTML; 11 plus the marker in the render step Word runs | Remeasured over 170 real blocks (`element-probe/probe-a4.log`). |
| Bug 2: reorder the spread and clear `document` | Reject `props.editor` and `props.document` at runtime and type them `never` | A silent reorder hides the caller's mistake. |
| Style option fix can land alone first | Both fixes land in phase 1 | Each is small, and the owner asked to fix both. |

## Panel round 1

Three seats reviewed the plan frozen at `900e00d20a`: claude-opus-5-5 @high, gpt-6-astra @xhigh and gpt-6.1-sol @xhigh. The challenge delta is improved. The lead applied all five critical findings and dismissed none.

| Finding | Seats | Change |
| --- | --- | --- |
| The plan had no repro steps and did not answer whether the fix contradicts Ziad's refactor | opus critical; astra, sol warning | Reproduce today now holds both repros, and the bug 2 script ran with the documented output (`repro/repro-props-a1.log`). Settled decisions answers the question directly. |
| Text-placement marks have their own dispatch path, which the plan left out | astra, sol critical; opus warning | Presentation now covers both mark placements. The census, rerun by compiled binding, shows the AI mark is a text-placement mark (`presentation-probe/coverage-v2-a3.log`). |
| A wrapper whose plugin the static kit omits was skipped silently, which would drop list numbering if the whole list peer went missing | astra, sol critical; opus warning | A missing static peer never authorizes a skip. Export draws the structural default and warns by name. Listing a static peer is the explicit choice of what to draw, and edit-only parts and slot `match` rules apply because the render is read-only. |
| Removing the static list margin would flatten Word list levels, including a numbered code block | astra, sol critical; opus warning | The lead measured it before picking. Today's toolbar already flattens nested lists in Word, and the static margin fixes Word but doubles the HTML indent. A converter that takes a list's level from its host block fixes both, numbered code block included (`list-probe/probe-a3.log`, `list-probe/converter-prototype-a2.log`). |
| Settings read after the first await break the one-capture law | astra, sol critical; opus nit | It reproduces at HEAD. A table width changed right after export starts reaches the file, 450 px instead of 300 px (`capture-law-probe/probe-a1.log`). Phase 1 now takes plugin state into the export frame. |
| The Word census rows never build a Word file | astra warning | Relabeled as the render step Word runs; phase 1 adds real Word files for rich content. |
| Phase 1 had four missing-peer rules and a redundant runtime scan | opus warning | One rule, a structural default with a warning; the runtime scan is gone. Leaf and text swaps stay, because live leaves leak editing markup (`element-probe/output-diff-summary.txt`). |
| "No second list" hid the cost that the static kit's membership now matters | opus warning | Stated in Settled decisions, with why this is not the rejected component map. |
| No end state; phase 3 mixed two jobs; audit-2 not named | opus warning | Target section added; the policy kit and Word lowering are separate phases; audit-2 is named. |
| The cost gate missed bundle size and had a cohort with no passing baseline | opus warning | Bundle size is a gate line; the crashing corpus stays a correctness check only. |
| `children` and `dangerouslySetInnerHTML` cannot replace the document | opus nit | Only `editor` and `document` are reserved. |
| The binding mechanism was unnamed | opus nit | The export frame is that mechanism. |

## Panel round 2

The same three seats reviewed only the revision, frozen at `6fa05e28b8`. The challenge delta is improved again. The lead applied three critical findings, applied the rest of a fourth and dismissed its crash claim.

| Finding | Seats | Change |
| --- | --- | --- |
| The converter prototype keeps the host indent in a module variable across awaits, so concurrent exports can swap list levels | astra, sol critical; opus warning | The build passes the host block down as an argument through `getIndentLevel`'s existing parent fallback; test i runs two exports at once. This replaces the prototype's approach. |
| Keeping frozen state references misses stores that compiled callbacks closed over, such as code highlighting, and non-plain values inside state | astra, sol critical; opus warning | The frame answers every plugin store read and configuration read while the synchronous render runs, so closures read it too; test h covers code highlighting. The claim narrows. A non-plain value inside state stays shared, listed under Open work. |
| Word drops render diagnostics and its loss check does not know the new code, so `lossPolicy: 'reject'` would not refuse a missing image | sol critical; astra warning | `exportDocx` collects the diagnostic from the body and every comment body, and a missing block drawing counts as lost content; test j covers both policies. |
| Static AI peers in the shared kit would crash the AI preview with a duplicate `ai` plugin, and AI chat has no base plugin | opus critical | The crash did not reproduce. A static `ai` peer and the preview's `ai` plugin share a lineage and compose, while an unrelated `ai` plugin throws the duplicate error the seat described (`ai-peer-probe/probe-a2.log`). The rest holds, so the plan adds no AI peers. |
| The corpus guard misses drawings no demo block uses | astra warning; opus nit | The spec also compares compiled drawing bindings, with a named list of three allowed absences, and its mutation removes the unused upload peer. |
| The answer about Ziad's refactor left out that `editorPlugins` was removed | opus warning | The talk section now says this plan adds back a plugin-array option of that kind and why it differs. |
| The frame's owners and its per-read cost were understated | opus warning | The plugin store read and the view configuration read are named owners, and the cost probe adds a typing burst. |
| Static dispatch drops object-form slots today, and `afterNodeChildren` was not in the contract | opus nit | Phase 1 evaluates `match` for object-form slots, and all three slots are in the contract. |

## Panel round 3

The same three seats reviewed only the round 2 revision, frozen at `e28da64627`. This was the last round the project allows before a build, so the lead settled every finding without another round. The challenge delta is improved, with one reversal.

| Finding | Seats | Settlement |
| --- | --- | --- |
| Answering store reads from captured state still misses shared mutable objects, such as the code highlighter's engine behind a plain object | astra, sol critical | Reversed. The frame had already changed approach in round 2, so it leaves phase 1 instead of changing again. Settings are read when the drawing runs, as today, and a separate plan owns capture. The claim narrows, and Open work names the gap. |
| A missing list wrapper drops numbering, yet the round 2 rule counted it only as a warning | astra, sol critical | Applied. Word now counts every missing drawing as lost content, replacing round 2's split by kind; test j adds a missing list peer. |
| Evaluating `match` on object-form slots pulls the discussion wrapper into every export | opus critical | Reverted round 2's change. Static dispatch keeps dropping object-form slots, as today, and Open work names the narrowed claim. |
| The loss rule flips the result for `exportDocx` callers that rely on the strict default | opus warning | Applied. The Brief, Defaults and Public API say Word's default strict mode refuses a file with a missing drawing. |
| The converter's existing list-numbering state is module-wide, so test i can pass while numbering IDs cross exports | opus, sol warning | Deferred. It predates this plan; test i checks levels only, and Open work tracks the numbering race. |
| The typing gate had no frozen number, and a second store read path exists | sol warning; opus nits | Moot. Both belonged to the store-read change, which left phase 1. |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where export gets its look | The app's read-only versions, matched to the live editor by block type (look) | A second editor built from the read-only set, as the draft proposed | second export editor | big |
| How much phase 1 fixes | Every block that crashes, images and task lists included | Tables only | tables only | big |
| Settings changed while an export runs | Read at drawing time, as today; a later plan locks them in when export starts (look) | Lock them in during phase 1 | freeze now | small |
| Anything with no read-only version | Drawn plain with a warning; Word's strict mode, its default, refuses the file (look) | Export stops with an error everywhere | strict missing | small |
| A wrapper, such as the list's, with no read-only version | Warned about on any export, even one with no list, because export never runs the editing wrapper to ask whether it would wrap (look) | Run the editing wrapper's outer function to ask, which can crash when it uses hooks | ask wrapper | small |
| Nested lists | Word takes list depth from each line's indent, and the read-only list stops adding a second indent | Keep the doubled indent in exported HTML | keep list indent | small |
| Style settings that carry a document or an editor | Rejected with an error | Quietly ignored | ignore content props | small |
| Word's own versions of eight block types | Stay internal and win over the app's for now | Move their styling into the app now | move Word styling | small |
| AI highlights and the AI chat box | No read-only versions. AI-highlighted text exports as plain text with a warning, and the chat box never appears in the file | Add read-only versions to the shared read-only set | add AI peers | detail |
| Loading the read-only set in the export button | Bundled with the button, unless the size check finds it adds too much | Loaded when the export menu opens | lazy kit | detail |
| Order with Ziad's suggestion rework | This fix can land first, because it does not touch how suggestions are stored (look) | Wait and build it on the new suggestion format | after authored | small |
| Word's tracked changes after Ziad's rework | Drawn from the suggestion tags while the file renders | Wrapped into the finished file afterwards, as today | post-process review | small |
| Proof of the browser step | The saved HTML and Word XML of each download plus the runtime-error recorder, with no screenshot; tracked changes come from the existing suggestion case (look) | Keep a screenshot of each opened download | browser screenshots | small |
| Proof of the capture and list reruns | Test d for review revisions, test i for Word list levels and the 169-block rerun (look) | Port the capture and list probes to the built code | port probes | small |
| Page for this work | A new page, because another account owns the draft's page; the new link is https://claude.ai/artifact/JpnCNp8LPBuPcXoHzLT7bz and the old one https://claude.ai/artifact/U79w5hU4y7jaEtBVpY7fRh | Keep the draft's page as this topic's page | old page | detail |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Export drawing | The editor's installed components, editing ones on a live editor | A `presentation` option of static plugins, read by key for elements, both mark placements and wrapper slots | `platejs/static`, `platejs/docx/export` | Editing components need a running editor; 18 kinds of content crash | Registry toolbar, `export.mdx`, `static.mdx`, DOCX docs | `presentation-probe/probe-a3.log` premise; phase 1 tests and browser check | A third-party live plugin with no static peer exports plain with a warning until it ships one | rearchitect |
| Missing static drawing | A crash inside a hook | Structural default plus a `missing-static-presentation` diagnostic; Word counts every one as lost content | `platejs/static`; `exportDocx` collects the diagnostic from the body and every comment body | The export loss law makes every loss a structured diagnostic, and Word's `lossPolicy: 'reject'` refuses lost content (`exportDocx.tsx:376`, `:548`); a missing list wrapper drops numbering, so placement does not tell style from content | Registry guard compares compiled drawing bindings and renders the demo corpus | Phase 1 tests g and j | A strict Word export of a document with an AI highlight fails until the app ships a static AI mark | rearchitect |
| Settings read during export | Document captured before the first await; settings read when the drawing runs | Unchanged in phase 1; a separate plan captures render dependencies at their owners | `platejs/static`, plugin owners such as code highlighting | Capture law (`docs/vision/plate.md:1159-1162`); the HEAD case reaches the file (`capture-law-probe/probe-a1.log`), and the highlighter keeps shared mutable state (panel round 3) | None in phase 1 | The separate plan's own tests | A setting or highlighter change during an export reaches it, as today | defer |
| Appearance props | `Partial<T>` spread after the captured editor | Appearance only; `editor` and `document` typed `never` and rejected | `platejs/static` | Bug 2 | No repository caller passes them | Phase 1 test e | None found | rearchitect |
| Word list depth | The converter reads only the list's own margin | It passes the host block down as an argument and falls back to its margin; the static list drops its margin | `platejs/docx/export`; registry `block-list-static.tsx` | Today's Word export flattens nested lists; the static margin doubles HTML indent | Server block, AI preview and export all change | `list-probe/converter-prototype-a2.log`; phase 1 test i | A host block that carries margin for another reason | rearchitect |
| Presentation compile and bundle | None | One compile per kit identity per process, cached; static kit in the toolbar bundle | `platejs/static`; registry toolbar | Plugin lookup needs a compiled kit | Hidden behind `presentation` | `perf-gate/evaluate-a1.log` on the prototype; the final-path rerun closes it | The first export pays 68 ms more (median of 3 fresh processes each side); the static kit is already in the editor bundle through the AI menu, so the toolbar adds 0.01 KB gzip | rearchitect |
| Word element overrides | Private map of eight elements over the editor's components | Private map over the static kit now; Word lowering plus copied stylesheet in phase 3 | `platejs/docx/export` | Plate law gives format-required defaults to the format owner and forbids a hidden theme (`docs/vision/plate.md:1155-1160`) | None in phase 1 | Phase 3 per-entry Word check | Columns, equations and TOC lose Word shapes | defer |
| Semantic options of editor-less renders | Server block and AI preview read the static kit's own options | One shared policy kit per feature | Registry kits | Table width, list and indent targets drift (`drift-probe/probe-a1.log`) | Server block and AI preview | Phase 2 drift census rerun | `.configure` and `toReactPlugin` composition in one array is unproven | defer |

## Build

Execution authority: the owner's "go" on 2026-10-09 after the plan was settled. The lead writes the code on `next` from base `666f02406e936864cc61e5ccb6824321df4d9a42`; subagents only research and review. The owner first ruled out commits and pushes. On 2026-10-10 the owner asked to cut a branch and commit: "现在你先切个分支出去吧，然后可以 commit 一下". Push still waits for the owner. The packet is phase 1 below.

| Gate | Applies | Evidence |
| --- | --- | --- |
| Blast radius before code | yes | `docs/plans/artifacts/html-static-repair-redo/blast-radius.md` |
| Pre-acceptance probe | yes | `perf-gate/evaluate-a1.log`: every frozen line passes and each known-bad arm fails |
| Red tests fail at HEAD for their defect | yes | `docs/plans/artifacts/html-static-repair-redo/red/`: tests a, b, c, d (attempt 2), e (runtime and types), f (named root and comment body), g, i (attempt 2) and j each fail alone at `666f02406e` for their named defect |
| Writing passes on product code (`deslop`, `no-comments`) | yes | `docs/plans/artifacts/html-static-repair-redo/comment-sicko/answer.md` and rounds r2 to r4; writing rows in the log |
| Lint fix and type-aware oxlint on task files | yes | `docs/plans/artifacts/html-static-repair-redo/build/lint-check-a7.log`, `docs/plans/artifacts/html-static-repair-redo/build/lint-typeaware-a7.log`: 25 of 25 files |
| `api-build` panel on the diff | yes | three rounds (cap); round 3 left two critical findings open, listed in Open work |
| Benchmark rerun on the final path | yes | `docs/plans/artifacts/html-static-repair-redo/perf-gate/final/evaluate-a2.log`: partial, every line passes except the 100-paragraph line, inconclusive in both runs |
| Browser proof through `verify` | yes | `docs/plans/artifacts/html-static-repair-redo/browser/browser-case-a4.log` (4 of 4) and a red run at 666f02406e |
| `plate-docs` on the named pages | yes | six pages plus the authored-changes and serializing guides; `check:docs`'s first link needs built package declarations |
| Registry output regenerated (`pnpm --filter www build:registry`) | yes | `docs/plans/artifacts/html-static-repair-redo/build/build-registry-check-a3.log` |
| Barrels (`pnpm brl`) | yes | `docs/plans/artifacts/html-static-repair-redo/build/brl-a1.log`: no change |
| `pnpm check` steps the edits reach | yes | test, type-tests, typecheck and lint steps run on the task's partitions and files; the full `pnpm check` is left for CI |
| Changeset and registry changelog | yes | `.changeset/platejs-static-presentation.md`; registry changelog entry `2026-10-09-export-static-presentation` |
| `best-api repair` | yes | `docs/vision/plate.md` presentation law; two guides updated |
| Fold into the subject and `review-ledger.mjs check` | yes | not yet: phases 2 and 3 and the two open findings keep the plan open, so the subject keeps showing the state before it |

## Steps

Phase 1 fixes both defects and is the next build. Phases 2 and 3 answer the owner's question about the whole direction; each gets its own plan iteration and ends with a keep, revert or quarantine call.

### Phase 1: draw export with the static kit

Against today, phase 1 makes every block export in both formats and keeps nested list levels in Word. It leaves settings read at drawing time, as today; the separate capture plan under Open work owns that. The list fix belongs here. Drawing exports with the static kit would otherwise indent HTML lists twice, a regression this phase would cause. Removing that extra indent without the converter change would flatten Word lists.

- [x] Run the pre-acceptance probe for the presentation compile and the toolbar bundle before any production edit. Frozen lines, each run on its baseline first: warm export of 100, 1,000, 5,000 and 10,000 paragraphs stays inside `docs/plans/artifacts/html-static-repair-2026-10-09/performance-contract.json` (median at most 1.5 times the baseline plus its allowance, one render per paragraph, equal bytes); presentation compiles per process equal 1 per kit identity and 0 on later exports; the first export's added time stays under 100 ms against the baseline of one `createEditor` with `BaseEditorKit`; the toolbar's client chunk grows by less than 20 KB gzip, or the kit loads when the export menu opens. A planted slowdown must fail. The 170-block demo corpus is a correctness check only, because today's export crashes on it. Proof: `proof.mjs` logs in this plan's run directory, then `pstack:benchmark-checklist` before any verified row; a loaded host leaves the row gate. (`docs/plans/artifacts/html-static-repair-redo/perf-gate/evaluate-a1.log`)
- [x] Write the red tests at public boundaries in `packages/platejs`, each run alone at `HEAD` through `node tooling/scripts/proof-worktree.mjs --expect-fail` with its own failure line. (a) An element whose component throws like an editing one draws its static peer with `presentation`. (b) A function wrapper slot does the same. (c) A text-placement mark does the same. (d) `exportDocx` with `projection: 'review'` and `presentation` returns `ok: true` with one insertion and one deletion. (e) `props.document` and `props.editor` throw a TypeError naming the key, with `@ts-expect-error` cases for a literal and a variable. (f) A named root and a Word comment body draw with the same presentation. (g) A plugin with no static peer never calls its editing component, draws the structural default and returns one `missing-static-presentation` diagnostic naming it. (i) Word keeps levels 0, 1 and 2 for a three-level numbered list and level 1 for a numbered code block at indent 2, also when two exports with different hosts run at once; the test checks levels only. (j) An image whose static peer is missing, a numbered list whose list peer is missing, and AI-highlighted text, each in the body and in a comment body, give a named warning under `lossPolicy: 'allow'` and `ok: false` under `'reject'`. Proof: one expect-fail log per test. (`docs/plans/artifacts/html-static-repair-redo/red/`)
- [x] Implement the presentation binding and dispatch for elements, both mark placements and function wrapper slots, the diagnostic and the props rejection in `platejs/static`. In `exportDocx`, pass `presentation` through, collect render diagnostics from the body and every comment body, and count each missing drawing as lost content. In the Word converter, pass the host block down as an argument. Proof: tests a to j pass; `pnpm --filter platejs typecheck`; the 31 static base controls of `static-base-a2.log` rerun green. (`docs/plans/artifacts/html-static-repair-redo/build/static-partition-a7.log`, `docs/plans/artifacts/html-static-repair-redo/build/docx-export-partition-a8.log`, `docs/plans/artifacts/html-static-repair-redo/build/platejs-typecheck-a5.log`)
- [x] In the registry, pass `presentation: BaseEditorKit` from the toolbar and remove the per-level margin in `block-list-static.tsx`. In `plugins-static.spec.ts`, compare the compiled drawing bindings that static dispatch draws (components and function slots) of `EditorKit` with `BaseEditorKit`, failing on any live drawing with no static peer except the AI text mark, which is named with its reason, and export the demo corpus with `presentation`, failing on any `missing-static-presentation` diagnostic. Proof: the spec fails with the list peer removed from `BaseEditorKit`, and fails with the upload peer removed, which no corpus block uses. (`docs/plans/artifacts/html-static-repair-redo/build/plugins-static-spec-a1.log`, `docs/plans/artifacts/html-static-repair-redo/mutate-run-a1.txt`)
- [x] Rerun the element, capture and list probes on the built code, and export rich fixtures through the real `exportDocx`: a table, a three-level list, a task list, an image and a code block, reading the package's text runs, `w:ilvl` values and diagnostics. Proof: logs at the next attempt index. (`docs/plans/artifacts/html-static-repair-redo/final-element-probe/probe-a1.log`; tests d and i stand in for the capture and list probes, see Close)
- [x] Prove it in the browser through `verify` on `/blocks/docx-demo`: insert a table, task list, callout, column group, code block and image; export HTML, Word and Word with tracked changes; open each download; then type in the table and toggle the task to show editing is unchanged. Proof: screenshots, the saved files and a console log with no new errors. (`docs/plans/artifacts/html-static-repair-redo/browser/browser-case-a4.log`, `docs/plans/artifacts/html-static-repair-redo/browser/browser-case-at-head-errors-a1.log`)
- [x] Run `plate-docs` on `content/docs/examples/export.mdx`, `content/docs/(guides)/static.mdx`, `content/docs/(plugins)/(serializing)/docx.mdx` and their Chinese twins. Proof: the docs checks and a preview of each page. (`docs/plans/artifacts/html-static-repair-redo/build/build-source-a3.log`, `docs/plans/artifacts/html-static-repair-redo/build/docs-source-parity-a3.log`, `docs/plans/artifacts/html-static-repair-redo/build/build-registry-check-a3.log`)
- [x] Write the `platejs` changeset and the registry changelog entry through `changeset`, and run `best-api repair`. Proof: the changeset file and the repair's report. (`.changeset/platejs-static-presentation.md`, `apps/www/src/registry/changelog/entries/2026-10-09-export-static-presentation.mdx`, `docs/vision/plate.md`)
- [x] Run the `api-build` panel on the diff. Proof: its decision-log rows. (`docs/plans/artifacts/html-static-repair-redo/panel-build-r1/`, `docs/plans/artifacts/html-static-repair-redo/panel-build-r2/`, `docs/plans/artifacts/html-static-repair-redo/panel-build-r3/`)

### Phase 2: one policy for editor-less renders

Against phase 1, phase 2 stops the server HTML block and the AI preview from drifting from the live editor's settings, such as table width and list targets.

- [ ] Move the semantic options both kits share into runtime-neutral policy kits, after a spike proves a base `.configure` and a `toReactPlugin` descriptor compose in one array. Proof: the drift census shows no render-relevant drift.

### Phase 3: Word owns Word

Against phase 2, phase 3 makes Word output follow the app's look and removes the package's hidden theme.

- [ ] Shrink `DOCX_STATIC_COMPONENTS` to Word-required conversion, one entry at a time, and move its colors, fonts and spacing into the copied `docx-export.tsx` stylesheet. Proof: a Word check per removed entry.

## Settled decisions

Does this contradict Ziad's refactor? Mostly no, with one point for him to judge. The 2026-09-24 document-first export plan kept export on the live editor's compiled configuration and deleted caller-built export editors (`docs/plans/2026-09-24-document-first-export-contracts.md:325`, `:367-372`). This plan keeps both choices and builds no second editor. That plan also asked for frozen configuration (`:325`), which today's code does not fully give; this plan leaves it as is, and a separate plan owns it. This plan does add back a plugin-array option to `exportDocx`, the kind `:325` and `:371` removed as `editorPlugins`. The difference is that export reads only drawing from it, never meaning, and that difference is what Ziad has to judge.

The draft asked Ziad five questions. Evidence answers four, and the owner settled the fifth.

| Draft question | Answer | Evidence |
| --- | --- | --- |
| Does one captured projection still hold if rendering moves to the static kit while capture stays live? | Yes. Capture, settings and projection stay on the live editor; only drawing moves. | `capture-probe/probe-a5.log` live rows; `presentation-probe/probe-a3.log` |
| Was drawing the live editor's components on purpose? | No source records it as a choice. Removing caller-built export editors was on purpose, but no plan, review or test the `why` lane read chose or exported the editing components; an older probe directory the plans cite is gone, so this is inferred. | `why/answer.txt` items 1 and 3 |
| Should capture become a public entry? | No. Nothing needs it. | `capture-probe/probe-a5.log` |
| Does Word review still work when capture projects first? | Projection stays where it is today, so review is unchanged; the live review output keeps one insertion and one deletion. | `capture-probe/probe-a5.log` |
| Should Word's component overrides stay private? | Yes for now; phase 3 shrinks them to Word-only rules. | Synthesis, graft 5 |

This plan expects three things of the authored redesign's switchover, listed in Fit with the authored redesign. Word draws `authored` marks as revisions during the render, comment ranges map inside `exportDocx`, and the toolbar stops building a projected view. Drawing revisions from the marks would also retire `applyReviewProjection`, which today finds rendered blocks by path after the render.

The owner settled the `presentation` option on 2026-10-09, without waiting for that talk. Its cost is real. Once export draws from the static kit, a plugin missing from that kit exports plain with a warning, so the kit's membership matters for export. The registry spec fails the build when the demo corpus warns. It is not the rejected component map. It reuses the static kit the app already ships for servers and previews, covers elements, marks and wrappers in one array, and cannot change meaning, because export ignores its options, injections and dependencies.

## Proof

| Check | Pass condition |
| --- | --- |
| Every block exports | The element probe renders every block the live editor can hold with `presentation`, and real Word files carry their text and list levels. |
| Real toolbar | `/blocks/docx-demo` exports a document with a table, task list, callout, columns, code block and image to HTML, Word and Word with tracked changes, with no new console error. |
| Editing unchanged | Typing in a table and toggling a task still work after the change. |
| Content props | Both bug 2 cases throw and fail to compile. |
| One capture | The five authored cases match today's live text, revisions and diagnostic codes. |
| Cost | The phase 1 probe passes every frozen line. |

## Open work

Each item stays here until this plan folds into the subject file, which then lists it under Open work.

- Styled Word returns the original file byte for byte when the document is unchanged, so a requested look never reaches it. owner: natamox. stop: phase 3's plan, or 2026-11-30.
- Live decoration sources, such as find highlights and active comment marks, run during export. The registry's `EditorKit` installs neither today. owner: natamox. stop: a plan that installs either in an exporting editor, or 2026-11-30.
- A component that throws while Word renders escapes `exportDocx` as a thrown error, not a diagnostic (`exportDocx.tsx:384-395`, `:571-583`). owner: natamox. stop: phase 1's panel, which decides whether the missing-presentation warning is enough.
- A setting or highlighter change made while an export waits for the renderer reaches that export, as it does today (`capture-law-probe/probe-a1.log`). Capturing every render dependency needs contracts at the owners, because the code highlighter keeps a shared mutable engine behind a plain object (panel round 3). owner: natamox. stop: a separate plan for export capture, or 2026-11-30.
- A wrapper written as an object with a `match` never draws in a static render, as today. The registry's three are editing UI, but a third-party wrapper that draws content this way is lost without a diagnostic. owner: natamox. stop: the capture plan above, or a third-party report.
- Word's converter keeps list-numbering state at module level, so two Word exports running at once can share numbering IDs (`render-document-file.ts:631`, `:720`). owner: natamox. stop: phase 3, or 2026-11-30.
- The authored switchover must still redo Word revisions, comment range mapping and the toolbar's projected view, as Fit with the authored redesign lists, because it deletes the nouns that code calls today. owner: natamox, who adds these three items to the authored plan's Phase 2 step, or builds them in this plan if that switchover lands before phase 1. stop: the authored Phase 2 lands.
- Word's equation override writes LaTeX source, while the static kit draws KaTeX. owner: natamox. stop: phase 3's equation entry.
- The static task-list marker draws a `<button>`. owner: natamox. stop: phase 3, or 2026-11-30.
- With a presentation, an element that no installed plugin renders still runs the live editor's `afterNodeChildren` slots, ignoring their static peers, `editOnly` and the missing-drawing diagnostic (api-build round 3, critical, open). No live `afterNodeChildren` exists in the package or the registry. Patch: resolve the fallback's slots through the presentation and keep today's behavior without one. owner: natamox. stop: the next plan iteration for drawing context.
- The presentation compiles through `buildEditor`, which activates its plugins without a cleanup owner, and a drawing created in a `configure((ctx) => ...)` callback reads the presentation's own state (api-build round 3, critical, open). `docs/vision/plate.md` asks compiles of supplied declarations not to activate plugins, but the detached compile tried in round 1 tore down the context such drawings read. Patch: a compile that keeps a valid drawing context without activation, or an error at bind that names a context-configured drawing. owner: natamox. stop: the next plan iteration for drawing context.
- The final-path benchmark's 100-paragraph warm line could not reject its planted slowdown in either run, because one baseline outlier widened the allowance (`docs/plans/artifacts/html-static-repair-redo/perf-gate/final/evaluate-a2.log`). owner: natamox. stop: the next change to the export perf contract, or 2026-11-30.
- A live wrapper that never draws during export but is not marked edit-only, such as `CopilotPlugin`'s ghost text, has no static peer, so every export of an editor that installs it warns, and Word's strict default refuses the file (api-build panel round 1, Opus finding 1). owner: natamox. stop: an editor that installs copilot and the export toolbar, or 2026-11-30.
- The registry guard reads drawings through the kit entries, not through the compiled plugins export consults, so a plugin installed only as a dependency is checked by the corpus render alone (api-build panel round 1, Opus finding 2). owner: natamox. stop: phase 2's policy kits, or 2026-11-30.
- The registry installs `AIPlugin.configure({ component: AILeaf })`, but no shipped code writes the `ai` mark it draws (`BaseAIPlugin.update.insertNodes` has no caller), so the guard's one allowed gap may guard dead code. owner: natamox. stop: the next AI menu review, or 2026-11-30.

## Close

### Phase 1 build

Phase 1 is built from base `666f02406e` and committed on branch `export-static-presentation`, as the owner asked on 2026-10-10. Nothing is pushed. Phases 2 and 3 and two critical panel findings keep the plan open.

#### Reversals and deviations

- The approved Main changes said static dispatch "already honors `editOnly`". It did not. With a presentation, drawings the installed plugin marks `editOnly` are now left out without a warning; without one, rendering is unchanged.
- The panel changed two mechanisms twice. Round 1 compiled the presentation without activating its plugins and drew slots that only the presentation declares. Round 2 reverted both. The detached compile tore down the context that drawings created in `configure((ctx) => ...)` read, and the slot union reached the fallback path, which gives a slot no plugin context. The fallback element path is now the same as at `666f02406e`, and both mechanisms wait for a new plan iteration.
- The approved claim that every block exports in both formats needed one fix outside the two bugs. `juice` threw on any quoted inline style that a stylesheet rule matches, such as the Word callout's emoji font list, so `exportHtmlToDocx` now decodes style attributes before inlining.
- Test (j) uses a stand-in text mark for the AI mark and five cases, not six. A missing list wrapper is reported on every render that consults it, so a list inside a comment cannot fail apart from the body. A Defaults row records that rule.
- Tests d and i stand in for rerunning the capture and list probes, which ran on disposable prototypes. A 169-block rerun replaces the element probe in both formats.
- The browser case reads the downloaded HTML and Word XML instead of opening the files, and the export of tracked changes comes from the existing suggestion case in the same spec.
- The registry item `export-toolbar-button` drops its explicit `editor-plugins-static` dependency, because its new import now installs it.

#### What landed

- `platejs/static`: `renderStaticHtml` takes `presentation`, a static plugin array that draws each installed plugin's element component, mark component and function slots by plugin name. A missing drawing renders without it and returns a `missing-static-presentation` diagnostic. Views made during the render inherit the binding, and Word's private overrides fold into it. `props` reject `editor` and `document` with a `TypeError`, and their type forbids both.
- `platejs/docx/export`: `exportDocx` passes `presentation` to the body and to the comment bodies the projection keeps, and counts each missing drawing as lost content. The HTML converter takes a list's level from the nearest indented ancestor. `juice` decodes style attributes first.
- Registry: the export toolbar passes `presentation: BaseEditorKit`; the static list wrapper drops its per-level margin; `plugins-static.spec.ts` guards that the static kit draws everything `EditorKit` draws except the AI mark, and that the demo corpus exports with no missing drawing.
- Docs, law and notes: `export`, `static`, `docx`, `authored-changes` and `serializing` guides in English and Chinese; a presentation law in `docs/vision/plate.md`; a `platejs` changeset and a registry changelog entry.

#### Proof and its limits

- Tests a to j each fail alone at `666f02406e` for their named defect (`docs/plans/artifacts/html-static-repair-redo/red/`). Twenty-three mutation runs across four frozen trees each made their own test fail: nineteen cover fixes still in the code, and four covered fixes that later rounds reverted. One callout mutant first survived because its freeze left out the new test; the rerun on a corrected freeze caught it (`docs/plans/artifacts/html-static-repair-redo/mutate-run-a1.txt`, `docs/plans/artifacts/html-static-repair-redo/panel-build-r2/mutate-run-a1.txt`, `docs/plans/artifacts/html-static-repair-redo/panel-build-r3/mutate-run-a2.txt`, `docs/plans/artifacts/html-static-repair-redo/final-freeze/mutate-run-a1.txt`).
- All 169 demo blocks the live kit can hold export to HTML and to Word through the docx demo's kit with `presentation`, with no throw and no missing drawing (`docs/plans/artifacts/html-static-repair-redo/final-element-probe/probe-a1.log`). That rerun counts exports and diagnostics only; Word text and list levels come from test i and the browser case, and review revisions from test d.
- The docx browser spec passes 4 of 4 on `next dev` serving this checkout, and the new case fails at `666f02406e` with "The `useEditorContext` hook must be used inside the `<Plite>` component's context" (`docs/plans/artifacts/html-static-repair-redo/browser/browser-case-a4.log`, `docs/plans/artifacts/html-static-repair-redo/browser/browser-case-at-head-errors-a1.log`).
- Static (79), Word export (139), round-trip (7) and Word slow (31) tests pass; the platejs typecheck ran 90 tasks with none cached; lint covers 25 of 25 task files.
- Cost: warm export at 1,000, 5,000 and 10,000 paragraphs, compile caching, the first export (+75.8 ms) and the bundle (+0.02 KB gzip) pass their frozen lines. The warm, caching and bundle lines each reject a planted slowdown; the first-export line had no planted control. The 100-paragraph line is inconclusive in both runs, because one baseline outlier widened its allowance past the planted slowdown (`docs/plans/artifacts/html-static-repair-redo/perf-gate/final/evaluate-a2.log`).
- The changed package specs typecheck: `packages/platejs/tsconfig.test.json` reports the same 108 errors at `666f02406e` and on this tree, none in a task file (`docs/plans/artifacts/html-static-repair-redo/build/spec-typecheck-a1.log`, `docs/plans/artifacts/html-static-repair-redo/build/spec-typecheck-at-head-a1.log`). The ten edited docs pages, five in each language, return 200 from the dev server with their new text in the rendered body (`docs/plans/artifacts/html-static-repair-redo/browser/docs-preview/`).
- Not run: the full `pnpm check`; `check:docs`'s first link, which needs built package declarations; Firefox, WebKit and Safari; opening the Word files in Word; a screenshot of the passing browser case.

#### Counts

- Phase 1 has 9 steps: 9 done, 2 of them with the deviations above.
- The build's 15 gates: 11 done, 3 partial (benchmark, the full `pnpm check` and `check:docs`) and 1 open (the fold into the subject, which waits for the plan to finish).
- The `api-build` panel ran three rounds, the cap. Round 1 raised 6 critical, 3 warning and 4 nit findings; round 2 raised 4 critical, 2 warning and 3 nit; round 3 raised 2 critical, 3 warning and 2 nit. Two critical findings stay open with their patches in Open work. The other ten are applied, and one of them ended as a narrowed claim.

#### Attention

reviewed by gpt-6.1-sol @xhigh

The decision-trail review (`docs/plans/artifacts/html-static-repair-redo/trail-review-build/answer.txt`) raised seven warnings and one note, and no critical finding. Each line gives the flag and what the lead did.

- The fallback path and context-callback drawings stay unsafe for the public API, even though no shipped kit reaches them. Phase 1 fixes the toolbar's export; the broader guarantee that export never runs editing code waits for the new plan iteration in Open work.
- The context test reads a schema type both editors share, so it cannot catch stale live state, and compiling activates plugins with no cleanup. Both stay in the open compile item, beside the tension with `docs/vision/plate.md:1169-1171`.
- Tests d and i do not reproduce the capture probe's five authored comparisons, and the 169-block rerun reads no Word text. The Proof section now says so, and a `look` Defaults row accepts the narrower proof.
- The browser case reads its downloads instead of opening them, keeps no screenshot, and leaves tracked changes to the suggestion case. A `look` Defaults row accepts that proof.
- The docs step had no page preview. The ten edited pages are now fetched from the dev server and their bodies checked.
- The spec typecheck was missing. It now runs and matches `666f02406e`.
- The cost paragraph claimed a planted control for every line. It now says the first-export line had none.
- The callout mutant that survived on a freeze without its test is now in the log and the Proof section.

### Redo close

This close handed back the redone plan before the build.

### After the redo

The owner asked, after the hand-back: "评论，审阅这块，最近也在重构，计划文档在里面好像已经有了，ziad 起草的，里面关系到数据协议的变化，我觉得可以协同着起来看，然后来定一个最佳的实现方案" (comments and review are being refactored too, in a plan Ziad drafted that changes the data protocol; look at both together and settle the best implementation). Fit with the authored redesign now lines the two plans up. The `presentation` target stands, because the review tree changes how suggestions are stored, not which components draw. The revision parts of Word export move to the authored cutover as asks. This change came after the panel's three-round cap, so the build's diff panel reviews it; saying "another round" runs a plan panel first.

The owner then wrote: "现在你觉得最佳的实现方案是什么，不用和别人讨论了，我觉得我们现在可以定下来" (what is the best implementation now; no need to discuss it with others; we can settle it now). The plan no longer waits on a talk with Ziad. Its picks stand as the settled direction, and the build starts on the owner's go.

### Reversals and deviations

- Settings capture was added in panel round 1, changed approach in round 2 and left phase 1 in round 3. Export keeps reading settings at drawing time, as today, and a separate plan owns the capture. The Defaults row for settings changed while an export runs records the reversal, with the word that undoes it.
- Panel round 2 had phase 1 evaluate `match` on object-form wrapper slots; round 3 reverted that, because it pulled the discussion wrapper into every export.
- Panel round 2 split Word losses by kind; round 3 replaced the split with one rule, because a missing list wrapper drops numbering.

### What was redone and what changed

- The plan, its scope and its Defaults were rewritten from the owner's typed asks. The draft's second export editor is replaced by the `presentation` option, its public capture entry is dropped, and its three kit layers moved to phase 2 for editor-less renders only.
- Bug 1's scope was remeasured over 170 real blocks. It covers 17 element types and the task-list marker in HTML, media included, where the draft had eleven types and no media.
- The `architect` arena ran with all three runners and the draft as a fourth candidate. The blind judge scored the draft 20 of 48 and the base 40.
- Three panel rounds replaced the draft's single panel on the withdrawn design. They added the repro section, the text-placement path, one rule for missing drawings, the Word list-level fix and Word's loss handling.
- The redo found a defect the draft missed. Today's toolbar Word export flattens nested lists to level 0 (`list-probe/probe-a3.log`), and phase 1 fixes it.
- Four of the draft's five questions for Ziad are answered with evidence, and the owner settled the fifth, the `presentation` option.

### What was reused and why

- The browser repro of the table crash and the bug 2 API probe were reused, because `git diff --stat 795d0bc491 666f02406e` touches no export source. The bug 2 script in this plan was also rerun and printed the documented rows (`repro/repro-props-a1.log`).
- The draft's frozen cost contract, `performance-contract.json`, is reused as the warm-export line of phase 1's gate.
- The owner's withdrawal of the 27-file implementation stands; its patch is not restored.
- The 31 static base controls are reused for this plan and rerun at the build, because the build changes their inputs.

### Levels that stayed unknown

The draft's first panel seats and its architect runners recorded no effort, and its Sol runner never answered; none of their judgments is reused. The handoff's investigation lanes, which the draft took as inputs, recorded no effort either; this run's `why` lane checked each of their claims that bears on the design against primary sources (`why/answer.txt` item 6).

### Proof and its limits

- The element scope check rendered 170 top-level blocks from 21 registry demo values, each alone, through the live `EditorKit` and through `BaseEditorKit`, plain and with Word's overrides, from source with no `dist` file loaded (`element-probe/probe-a4.log`). Its Word rows cover the render step Word export runs, not a Word file.
- The target's premise held. Live settings with static element components, the static list slot and the two editing wrappers removed render 169 of 170 blocks, and the one failure is `codeDrawing`, which the live editor cannot hold (`presentation-probe/probe-a3.log`). That run swapped components through the private override map, rebuilt the list plugin by hand and left leaves live.
- The authored export check compared one pending insertion and one pending deletion by visible text, Word runs, revision counts and diagnostic codes in five cases (`capture-probe/probe-a5.log`).
- The Word list check ran three-level numbered paragraphs and a numbered code block at indent 2 through four setups. The converter change ran as a disposable prototype in a worktree that was then removed (`list-probe/probe-a3.log`, `list-probe/converter-prototype-a2.log`).
- This redo ran no browser session, no implementation, no phase 1 cost gate, no Word file for rich fixtures and no concurrent Word export. It did not read Slate.

### Environment

To load the registry kits, the probes needed `apps/www/node_modules`, which was absent at intake. The run created it from the draft's saved links and removed it at the close. The directory held only links and copied `.bin` scripts, so the removal touched no installed package.

### Counts

The redo ledger has 13 units: 12 done (6 redone, 6 reused) and 1 open (the static base controls, which rerun at the build). Redo step 6, the babysit pass over the draft's diff, is skipped because the draft's implementation was withdrawn and no diff exists. Every phase step in Steps is open, because the build waits on the talk with Ziad.

### Remaining limits at the panel cap

Panel round 3 was the last round allowed before a build, so these limits stand as stated in Open work: settings and the code highlighter can change during an export, as today; object-form wrappers never draw in exports; Word's list numbering state is shared across concurrent exports; a strict Word export fails on AI-highlighted text until the app ships a static AI mark.

### Attention

reviewed by gpt-6.1-sol @xhigh

The review (`trail-review/answer.txt`) raised eight warnings and no critical finding. Each line below gives the flag and what the lead did.

- The redo table missed two draft units, the bug 2 regression run and the table and named-root probes. Both are now reuse rows, and the counts read 13 units.
- The reviewer saw no removal of `apps/www/node_modules` and no Close writing pass, because its transcript range ended before both ran. Both ran after that range, and the log records each.
- Phase 1's value line still promised the revision the export started on after round 3 moved capture out. It now says settings are read at drawing time and names the separate capture plan.
- After round 3 reverted the object-form `match` change, the Layer and owner row still said `match` rules apply. It now says those slots stay undrawn, as today, and the diagnostic covers function wrappers only.
- The list fix widens phase 1. Steps now says why it belongs there: the static kit would otherwise indent HTML lists twice, and removing that indent without the converter change would flatten Word lists. The argument-passing shape and concurrent exports stay untested until phase 1's test i.
- The AI dismissal rests on an editor built with an empty preview extension, not a rendered AI preview. Test j now covers AI-highlighted text under both Word policies.
- "Never decided or tested" overstated the `why` lane, which found no record and called its conclusion inferred. The plan now says no source the lane read records the choice, and labels it inferred.
- The capture target is outside the numbered phases. Open work names its separate plan, with an owner and a stop.

## Evidence

- Run directory: `docs/plans/artifacts/html-static-repair-redo/`. It holds the probes, the arena, the judge, the panel, the `why` and `how` lanes and the decision queue.
- Element scope: `element-probe/probe-a4.log`, with `output-diff-summary.txt`.
- Drift census: `drift-probe/probe-a1.log`. Coverage by compiled binding: `presentation-probe/coverage-v2-a3.log`.
- Authored capture: `capture-probe/probe-a5.log`. Settings across the await: `capture-law-probe/probe-a1.log`.
- Lists in Word: `list-probe/probe-a3.log`, `list-probe/converter-prototype-a2.log`, `list-probe/converter-prototype.patch`.
- Premise of the target: `presentation-probe/probe-a3.log`, `presentation-probe/output-vs-static.txt`.
- Bug 2 repro run: `repro/repro-props-a1.log`.
- Arena: `architect/grounding.md`, `architect/runner-*.txt`, `architect/judge/verdict.txt`, `architect/synthesis.md`. Panel round 1: `panel-r1/prompt.md`, `panel-r1/seat-*.txt`. Panel round 2: `panel-r2/prompt.md`, `panel-r2/round2.diff`, `panel-r2/seat-*.txt`, `ai-peer-probe/probe-a2.log`. Panel round 3: `panel-r3/prompt.md`, `panel-r3/round3.diff`, `panel-r3/seat-*.txt`.
- History: `why/answer.txt`. Code map: `how-explorer/answer.txt`.
- Reused from the draft: `docs/plans/artifacts/html-static-repair-2026-10-09/browser-base-errors.json`, `capture-base-a1.log`, `static-base-a2.log`, `named-root-base-a1.log`, `performance-contract.json`.
