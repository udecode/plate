# HTML export and static rendering

Page: https://claude.ai/artifact/JpnCNp8LPBuPcXoHzLT7bz

Plate turns a document into styled HTML by rendering it with React, on the server or in the browser, and Word export reuses that HTML. `renderStaticHtml` in `platejs/static` reads the editor's document, applies the chosen suggestion projection, and draws each node with the component its plugin installs. `exportDocx` in `platejs/docx/export` does the same, then swaps eight elements for Word-specific ones. The app's export toolbar passes its live editor, so the editing components draw the file. The server HTML block and the AI preview pass an editor built from the registry's static kit. The scope's review history prints with `node tooling/scripts/review-ledger.mjs show html`.

## Public API

The export toolbar renders HTML from the live editor's model.

```tsx
// apps/www/src/registry/components/editor/export-toolbar-button.tsx
const result = await renderStaticHtml(model, {
  component: EditorStatic,
  projection,
  props: { style: { padding: '0 calc(50% - 350px)', paddingBottom: '' } },
});
```

The same toolbar exports Word from that model.

```tsx
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

The server HTML block builds an editor from the static kit and renders it.

```tsx
// apps/www/src/registry/blocks/html-export/page.tsx
const editor = createStaticEditor({
  plugins: HtmlExportKit,
  initialValue: createValue(),
});

const { data: editorHtml } = await renderStaticHtml(editor, {
  component: EditorStatic,
  props: { style: { padding: '0 calc(50% - 350px)', paddingBottom: '' } },
});
```

## Layer and owner

| Job | Owner |
| --- | --- |
| Read the document, project suggestions, render, return HTML and diagnostics | `renderStaticHtml` and its private helper `renderStaticHtmlWithOverrides` in `platejs/static` |
| Pick the component that draws a node | Static dispatch in `platejs/static`. A private per-editor override by plugin name wins, else the plugin's installed `component` draws, and the installed plugins supply the wrapper slots. |
| Word body, comments, review markup and exact source reuse | `exportDocx` in `platejs/docx/export`, with the private `DOCX_STATIC_COMPONENTS` map for callout, code block, columns, equations, headings and TOC |
| Editing presentation and its kit | Copied registry `foo.tsx` items, composed in `plugins.ts` |
| Static presentation and its kit | Copied registry `foo-static.tsx` items, composed in `plugins-static.ts` as `BaseEditorKit` |
| Export menu, file shell, download and toasts | Copied `export-toolbar-button.tsx` |

## Main changes

- The export toolbar passes the live model editor, and Word export takes no plugin list of its own, so static dispatch draws the editing components when the toolbar exports. Commit `3e0ab4dd7d` made that change on 2026-09-27, when it removed the toolbar's static-kit editor.
- Rendering reads a read-only document view of the editor, made with `createEditorView(editor, { document })`, so one editor renders many documents without changing its own.
