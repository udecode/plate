---
review_scopes: [html, exports]
review_basis: [2026-10-04-html-audit-2]
work_kind: implementation
review_commit: 795d0bc49133d7262d00125b35d7558d47b9ba63
review_inputs:
  - docs/plans/artifacts/html-static-repair-2026-10-09/browser-base-errors.json
  - docs/plans/artifacts/html-static-repair-2026-10-09/capture-base-a1.log
  - docs/plans/artifacts/html-static-repair-2026-10-09/review-all-elements-a3.log
---

# HTML and Word export fixes

Status: superseded by docs/plans/2026-10-09-html-static-repair-redo.md, which redid this plan at a higher level
Playbook: build

## Brief

### What will change?

Fix two export bugs. HTML and Word export crash on tables, callouts, columns, code blocks and other interactive elements, not only tables. Style options can also swap out the exported document.

### What could go wrong?

A table-only fix leaves the other elements broken. The quick fix, giving each plugin two components, breaks the rule that editing and export code stay apart. Ziad should agree on the direction first.

## Teach

Export takes a snapshot of the document and renders it with each plugin's installed component. Word export reuses that same render.

Today that component is the editing one. The editing ones need a live editor around them, and export has none, so they throw. Paragraphs, headings, dates and links don't need it, so simple documents export fine.

Almost every element already has a plain export twin in the static kit. The proposed direction takes the document from the live editor, then draws it with the static kit. It also stops style options from replacing the snapshot.

## At a glance

| Bug | Current result | Proposed fix |
| --- | --- | --- |
| Export a document with an interactive element | HTML throws for 11 of the 15 element types with a clear result; Word throws for 5 of them. | Take the snapshot from the live editor and render it with the static kit. To be agreed with Ziad. |
| Pass content through appearance props | Output switches to another document, but diagnostics still describe the source. | Reserve content inputs for the export API; appearance props only control presentation. |

## 1. Interactive elements crash export

### How it regressed

Before `3e0ab4dd7d` (2026-09-27), the export toolbar built a separate editor from `BaseEditorKit` in `plugins-static.ts`, whose plugins carry the `*-static.tsx` components. That commit removed it. The toolbar now passes the live editor to `renderStaticHtml`. Static dispatch then renders the installed `plugin.component`, which is the editing component (`packages/platejs/src/static/pluginRenderElementStatic.internal.tsx`). Word export renders through the same path and replaces only the components in `DOCX_STATIC_COMPONENTS`.

### Measured scope

The probe renders one document per element type with the live element kits from `apps/www/src/registry/components/editor/`, once through plain static HTML and once with the Word overrides. Log: `docs/plans/artifacts/html-static-repair-2026-10-09/review-all-elements-a3.log`.

| Element | HTML | Word | Failing hook |
| --- | --- | --- | --- |
| paragraph, heading, date, link | ok | ok | none |
| table | throws | throws | `useEditor()` |
| details | throws | throws | `useEditor()` |
| codeBlock, toc, callout, columnGroup | throws | ok | `useEditor()`; Word has an override |
| equation, inlineEquation | throws | ok | Plite `useEditorContext`; Word has an override |
| horizontalRule, mention, footnote | throws | throws | Plite `useEditorContext` |
| blockquote | inconclusive | inconclusive | the probe failed with `React is not defined`, likely a probe runtime artifact |

The probe did not measure image, media embed, video, audio or file, because `react-tweet` is not installed in this checkout. `ImageElement` calls selection hooks, so treat media as affected until a probe measures it. The browser log in `browser-base-errors.json` confirms the table case through the real toolbar.

### Reproduce in the browser

Use the source-backed app at baseline `795d0bc49133d7262d00125b35d7558d47b9ba63`, with workspace dependencies installed. From the repository root, start it with:

```sh
cd apps/www
PLATE_WWW_DYNAMIC_DOCS=1 PLATE_WWW_DEV_SOURCE=1 \
PLATE_WWW_DIST_DIR=.next-html-repro pnpm exec next dev --port 3311
```

1. Open `http://localhost:3311/blocks/docx-demo`.
2. Open **Export**, then choose **Export as HTML**. The initial paragraph document downloads successfully. This is the control case.
3. Click inside the editor. Open **Table**, then **Table**, then **Insert 2 by 2 table**.
4. Open **Export** and choose **Export as HTML** again.
5. Keep the table in the editor. Open **Export** and choose **Export as Word**.
6. Inspect the browser console for each failed action.

| | Result |
| --- | --- |
| Actual | Both table exports throw `useEditor() requires an active Plate editor`. The stack includes `TableElement` and the static renderer. |
| Expected | Both downloads contain the table. Export does not require mounting an editing interface. |

Repeat steps 3 to 6 with a callout, a column group and a code block to cover the HTML-only failures.

### Reproduce without a browser

From `apps/www`:

```sh
pnpm exec bun --preload ../../config/plite-source-aliases.ts \
  ../../docs/plans/artifacts/html-static-repair-2026-10-09/review-all-elements-probe.tsx
```

Each row prints the element, the HTML result and the Word result.

### Repair direction

The fix belongs in how export is put together, not in the table feature. Today one editor plays two roles in `renderStaticHtml(editor)` and `exportDocx(editor)`. It is the data source: the document, its authored changes and the projection. It also picks the components that draw the output. Only the live editor can be the data source. Only the static kit has components that are safe to draw with. `3e0ab4dd7d` gave both roles to the live editor, so export crashes. The code before it gave both roles to a static editor, so projection and diagnostics could not come from the live state.

The proposed direction splits the two roles:

1. **Capture.** Compute the projected document, the review data and the diagnostics once, on the live editor, as one value. `captureExport` in `exportDocx.tsx` already does this for Word; HTML, Word and Markdown would share it.
2. **Render.** The renderer takes the projected document and a static composition. It runs no projection, so the static kit needs no suggestion or comment plugins.
3. **Three kit layers.** A shared policy kit holds plugin descriptors and options. `plugins.ts` adds the editing components to it, and `plugins-static.ts` adds the `*-static` components. Both read the same options, so they cannot drift, as `docs/vision/plate.md` asks for peer kits.
4. **Word** is the static composition plus the package's Word mappings. Whether `DOCX_STATIC_COMPONENTS` becomes part of the composition instead of a private override map is still unchecked.
5. **Bug 2 cannot happen.** The render input accepts only a document and appearance options, so its type has no `editor` or `document` prop.

A sketch of the call shape, not validated:

```ts
// apps/www/src/registry/components/editor/export-toolbar-button.tsx, today
await renderStaticHtml(model, { projection, props: { style } });

// proposed
const capture = captureExport(model, { projection }); // document + diagnostics
await renderStaticHtml(staticEditor, { document: capture.document, style });
```

| Option | Why it is not the pick |
| --- | --- |
| Keep the live editor and wrap export in a provider | Hides the hook error and still draws editing controls into the output. |
| Each plugin carries both an editing and a static component | Live install items would import static code, against `docs/vision/plate.md` on separate `foo` and `foo-static` items, and plugins would gain a second component field, which the same file rejects. |
| One component with a live and a static mode | Ships both environments' code in one component, so editing code reaches the server. It breaks the same rule. This was the withdrawn implementation. |
| Plain rollback: build a `BaseEditorKit` editor and project there | Works, but the static kit must then carry the authored-change plugins, and options still live in two places. |

This changes public inputs of `renderStaticHtml` and `exportDocx` and adds a capture entry. Under this repository's review list, that makes it an API plan: `architect` picks the target, then a panel reviews the plan, and `best-api repair` runs before close.

#### Earlier recommendation, withdrawn

The first revision of this plan recommended that each plugin carry its static component next to the editing one, with a plain static-kit rollback as the alternative. The second review found that the recommended option breaks the separate live and static item rule in `docs/vision/plate.md`. The split above replaces it.

### Questions for Ziad

1. Does the export menu's goal, one captured projection with shared diagnostics, still hold if rendering moves to the static kit while capture stays on the live editor?
2. Was rendering the live editor's components on purpose, for example to keep runtime-set plugin options in the output? If so, which options matter for export?
3. Should capture become a public entry that HTML, Word and Markdown share, or stay internal to each exporter?
4. Does the Word review projection still work when capture projects first and the renderer only draws?
5. Should the Word component overrides stay a private map in `platejs/docx/export`, or become part of the static composition?

## 2. Appearance props replace the document

### Reproduce through the API

This is a library API defect, not a toolbar setting. With workspace dependencies installed, save this temporary file as `packages/platejs/repro-html-capture.ts`:

```ts
import { createEditor } from './src/core';
import { BaseParagraphPlugin } from './src/lib';
import { renderStaticHtml } from './src/static/renderStaticHtml';

const makeEditor = (text: string) => createEditor({
  plugins: [BaseParagraphPlugin],
  initialValue: [{ type: 'paragraph', children: [{ text }] }],
});
const source = makeEditor('SOURCE');
const foreign = makeEditor('FOREIGN');

const cases = {
  control: await renderStaticHtml(source),
  editorProp: await renderStaticHtml(source, {
    props: { editor: foreign },
  }),
  documentProp: await renderStaticHtml(source, {
    props: { document: foreign.read.value() },
  }),
};
for (const [name, result] of Object.entries(cases)) {
  console.log(name, result.data.includes('SOURCE'),
    result.data.includes('FOREIGN'));
}
```

From the repository root, run:

```sh
pnpm --dir packages/platejs exec bun \
  --preload ../../config/plite-source-aliases.ts ./repro-html-capture.ts
```

Each output row is the case name, whether HTML contains **SOURCE**, and whether it contains **FOREIGN**.

| Case | Actual output | Required output after repair |
| --- | --- | --- |
| No appearance override | `control true false` | `control true false` |
| Another editor in props | `editorProp false true` | `editorProp true false` for an untyped caller; TypeScript rejects this input. |
| Another document in props | `documentProp false true` | `documentProp true false` for an untyped caller; TypeScript rejects this input. |

Remove the temporary file after the check. A separate recorded authored-change probe also shows the mismatch in diagnostics: output contains **FOREIGN**, while the warning describes pending changes in **SOURCE**.

### Why it fails

The helper creates the root component with `{ editor: renderEditor, ...props }`. The later props overwrite the captured editor. `EditorStaticProps` also has a `document` field, so a document passed through props makes `EditorStatic` select different content.

### Repair direction

Apply appearance props first. Then set the captured editor and clear the appearance-level document input. Exclude `editor` and `document` from the appearance-props type. Keep the top-level `document` option as the explicit way to export a different document.

This change belongs in `renderStaticHtml.tsx` and `renderStaticHtmlWithOverrides.tsx`. It does not depend on the export component decision and can land first. No caller in the repository passes either key. The toolbar, the `html-export` block and Word export pass only `style`. This fix closes a type hole and is lower priority than bug 1. Class names and styles remain valid appearance props.

## What must pass

| Check | Pass condition |
| --- | --- |
| Every element exports | The probe reports ok for HTML and Word on every element type, media included once measured. |
| Real HTML and Word toolbar actions | A document with a table, callout, column group, code block, details, equation and footnote downloads in both formats; inspection confirms content, widths and styles. Word must regenerate content rather than return an unchanged original file. |
| Editing unchanged | Typing, selection, resizing and drag still work on the same elements. |
| Both appearance overrides | Neither changes captured content at runtime; the public type rejects both. |
| Valid export options | Styles, class names and the top-level document option still work. |
| Source consistency | Output and diagnostics use the same projection; export leaves the source document unchanged. |

The repair covers these two bugs. It does not include list indentation, drag-and-drop redesign or unrelated wrapper changes. Browser acceptance runs on the final implementation; it is not complete yet.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How much bug 1 covers | Every element that crashes export | Tables only | tables only | big |
| Where export gets its plain components | Snapshot from the live editor, drawn with the static kit | Each plugin carries its own export version | plugin export version | big |
| When code work starts | After the discussion with Ziad | Start the bug 2 fix now | start bug 2 | small |
| Order of the two fixes | Style option fix can land first on its own | Ship both together | ship together | small |

## References

- Baseline browser failures: `artifacts/html-static-repair-2026-10-09/browser-base-errors.json`.
- Authored-document capture probe: `artifacts/html-static-repair-2026-10-09/capture-base-a1.log`.
- Element coverage probe: `artifacts/html-static-repair-2026-10-09/review-all-elements-probe.tsx` and its log `review-all-elements-a3.log`.
- Regressing change: `3e0ab4dd7d`, which removed the `BaseEditorKit` export path from `export-toolbar-button.tsx`.
- Static dispatch: `packages/platejs/src/static/pluginRenderElementStatic.internal.tsx`; Word overrides: `packages/platejs/src/docx/export/lib/docxStaticComponents.tsx`.
- Export input and rendering: `packages/platejs/src/static/renderStaticHtml.tsx` and `internal/renderStaticHtmlWithOverrides.tsx`.
