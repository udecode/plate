# Code-generated diagrams

Page: https://claude.ai/artifact/6WdMHkLGCrdyZHK3qChH48

The ledger asks which source and rendering contract generated diagrams should use, and which remote or embedded renderer policy belongs to the application. Today a diagram is a `codeDrawing` void element from `platejs/code-drawing`. It stores its source, language and view as string properties, and the same entrypoint ships `renderCodeDrawing`, which loads Mermaid, Graphviz, flowchart.js or a PlantUML server. The copied `CodeDrawingElement` edits the source in a textarea, previews it and exports a PNG. Landed and proven: the flat v54 node shape, insertion through the plugin's `insert` and `upsert` updates, the Markdown `codeDrawing` tag, and the single Graphviz engine name, each with its package spec, plus the copied controls' browser spec. The [2026-10-04 audit](../../research/review-records/2026-10-04-drawing-audit.json) gave a Pursue verdict that no plan has adopted. The scope's history prints with `node tooling/scripts/review-ledger.mjs show drawing`.

## Public API

The demo installs the plugin with the copied element.

```tsx
// e184158398:apps/www/src/registry/examples/code-drawing-demo.tsx
import { CodeDrawingPlugin } from 'platejs/code-drawing/react';

import { CodeDrawingElement } from '@/registry/components/editor/code-drawing';

const editor = useCreateEditor({
  plugins: [
    ...EditorKit,
    CodeDrawingPlugin.configure({ component: CodeDrawingElement }),
  ],
  initialValue: codeDrawingValue,
});
```

The copied insert menu inserts an empty drawing through the plugin's update.

```tsx
// apps/www/src/registry/components/editor/insert-toolbar-button.tsx
import { BaseCodeDrawingPlugin } from 'platejs/code-drawing';

editor.update((tx) => {
  tx.plugin(BaseCodeDrawingPlugin).insert({}, { select: true });
});
```

The copied element renders through the package renderer and defaults PlantUML to the public server.

```tsx
// e184158398:apps/www/src/registry/components/editor/code-drawing.tsx
import { renderCodeDrawing } from 'platejs/code-drawing';

export function CodeDrawingElement({
  plantUmlServer = 'https://www.plantuml.com/plantuml',
  ...props
}: EditorElementProps<typeof CodeDrawingPlugin> & { plantUmlServer?: string }) {
  // ...
  const imageData = await renderCodeDrawing(language, code, { plantUmlServer });
}
```

## Main changes

- `e184158398:packages/platejs/src/code-drawing/lib/BaseCodeDrawingPlugin.ts` owns the `codeDrawing` void element with `code`, `language` (flowchart, graphviz, mermaid or plantuml) and `view` (code, preview or split), and maps it to a Markdown `codeDrawing` tag.
- `e184158398:packages/platejs/src/code-drawing/lib/renderers.ts` owns `renderCodeDrawing`, which dynamically imports `mermaid`, `viz.js`, `flowchart.js` or `plantuml-encoder`, calls `mermaid.initialize` once, and returns an SVG data URL.
- The copied `code-drawing.tsx` writes the source on every textarea change with `editor.update.nodes.set`, renders the preview when the view is not `code`, and exports a PNG. The copied `code-drawing-static.tsx` prints the source and no image.
- `packages/platejs/src/migrations/migratePlateV54Ast.internal.ts` moves a v53 `code_drawing` element's `data.code`, `data.drawingType` and `data.drawingMode` into the flat properties.

## What other editors do

A Codex seat searched ten editor checkouts at the commits below on 2026-10-15 and read product docs on the web; nothing was run in a browser. Every product that exchanges diagrams uses a `mermaid` code fence, and most keep the source as editable text. Only CKEditor 5 stores a chosen view, and its export drops it.

| Editor | Where the source lives | View stored in the document | Markdown or HTML | Who owns the renderer | Remote server by default |
| --- | --- | --- | --- | --- | --- |
| BlockNote | A `diagram` block with plain text content | No; the source popup is UI state | `mermaid` fence; `pre > code.language-mermaid` | Optional `@blocknote/diagram-block`, which calls `mermaid.initialize` | None |
| CKEditor 5 | An object node with an opaque `source` attribute | Yes, `displayMode` in the model; export omits it | `pre > code.language-mermaid` | Experimental optional plugin, which calls `mermaid.initialize` | None |
| Tiptap | No diagram node; `codeBlock` text plus `language` | No | Language fence | The app's own extension | None found |
| Lexical | No diagram node | No | None | None (its docs site uses Docusaurus Mermaid) | None |
| ProseMirror, Slate, Quill, Editor.js, CodeMirror | No diagram code | No | None | None | None |
| Milkdown | Its diagram package was removed | Unknown | Unknown | Removed | Unknown |
| Notion | A code block with `language: "mermaid"` and rich-text source | Code, Preview and Split exist; storage undocumented | Undocumented | Built in | Undocumented |
| GitHub | Markdown `mermaid` fence text | No | `mermaid` fence | Built in | Undocumented |
| GitLab | Markdown fence text for Mermaid, PlantUML and Kroki languages | No | Language fences | Built in, plus admin-configured PlantUML and Kroki servers | Configurable, off unless set |
| Obsidian | Markdown `mermaid` fence text | No; source, live preview and reading are UI modes | `mermaid` fence | Built in | Undocumented |
| Typora | Markdown `mermaid` and `flow` fence text | Undocumented | `mermaid`, `flow` fences | Built in | Undocumented |

Sources: `TypeCellOS/BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163:packages/diagram-block/src/block/createReactDiagramBlockSpec.tsx`, `ckeditor/ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da:docs/features/mermaid.md`, `ueberdosis/tiptap@91c51be53c4655ef07e29ec489471524debfa0ca:packages/extension-code-block/src/code-block.ts`, `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988`, `Milkdown/milkdown@6a4db480b00db8dd0322b517117dfa2154f3e2e2:packages/core/CHANGELOG.md`, and the Notion block API, GitHub, GitLab, Obsidian and Typora docs read on 2026-10-15. The full answer is in the run directory as `editors-answer.md`.
