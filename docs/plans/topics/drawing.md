# Code-generated diagrams

Page: https://claude.ai/artifact/2n3uS1vjX5CpFWM1BMp15E

The ledger asks which source and rendering contract generated diagrams should use, and which remote or embedded renderer policy belongs to the application. A diagram is a code block whose language a copied renderer claims, so the document stores only the code block's text and language. The copied `withDiagrams` wraps the code block element and draws the picture below the source through one copied renderer item per engine: Mermaid through Pele, Graphviz through viz.js, flowchart.js, and PlantUML through a server the app names. Its Code and Both views live in the component, and it exports a PNG. Static rendering and Markdown export print the source. The [2026-10-15 review](../2026-10-15-drawing-review.md) moved diagrams from their own element into code blocks, the [2026-10-18 review](../2026-10-18-drawing-pele-review.md) moved Mermaid to Pele, and the [2026-10-22 review](../2026-10-22-drawing-paged-size.md) kept diagram sizes in paged layout with the app. The scope's history prints with `node tooling/scripts/review-ledger.mjs show drawing`.

## Public API

An app wraps the copied code block element with the renderers it draws and swaps the kit's code block plugin.

```tsx
// content/docs/(plugins)/(elements)/code-block.mdx
import { CodeBlockPlugin } from 'platejs/react';

import {
  CodeBlockElement,
  createCodeBlockPlugin,
} from '@/components/editor/code-block';
import { withDiagrams } from '@/components/editor/code-block-diagram';
import { graphvizRenderer } from '@/components/editor/code-block-diagram-graphviz';
import { mermaidRenderer } from '@/components/editor/code-block-diagram-mermaid';
import { EditorKit } from '@/components/editor/plugins';

const diagramCodeBlockPlugin = createCodeBlockPlugin(
  withDiagrams(CodeBlockElement, {
    renderers: [mermaidRenderer, graphvizRenderer],
  })
);

export const DiagramEditorKit = EditorKit.map((plugin) =>
  plugin.name === CodeBlockPlugin.name ? diagramCodeBlockPlugin : plugin
);
```

The copied Mermaid renderer item draws with Pele and returns its SVG. Each copied renderer item installs the exact engine version the site runs, such as `pele@1.6.0`. The site's `apps/www/package.json` pins the same versions.

```ts
// apps/www/src/registry/components/editor/code-block-diagram-mermaid.ts
export const mermaidRenderer: DiagramRenderer = {
  label: 'Mermaid',
  languages: ['mermaid'],
  render: async (source) => {
    const { renderAsync } = await import('pele/lazy');

    const { svg } = await renderAsync(source);

    return svg;
  },
};
```

PlantUML draws through a server the app runs and names.

```tsx
// content/docs/(plugins)/(elements)/code-block.mdx
import { createPlantUmlRenderer } from '@/components/editor/code-block-diagram-plantuml';

const plantUmlRenderer = createPlantUmlRenderer({
  server: 'https://plantuml.example.com',
});
```

## Main changes

- `apps/www/src/registry/components/editor/code-block-diagram.tsx` owns `withDiagrams` and the `DiagramRenderer` contract. It refuses two renderers that claim one language, draws in the Both view once the block is near the viewport and the browser is idle, runs one render per block at a time, shows the SVG as an image and exports a PNG scaled within the browser's canvas limits.
- Each `code-block-diagram-<engine>.ts` item owns one engine and its dependency.
- `packages/platejs/src/migrations/migratePlateV54Inputs.internal.ts` turns a saved v53 `code_drawing` element into a code block whose language is its drawing type, Mermaid by default.
- `apps/www/src/registry/components/editor/code-block-static.tsx` prints a diagram block's source as an ordinary code block.

## Rules

These rules bind this feature alone, so they live here instead of in `docs/vision/`.

- The engine is app policy in copied source. Each engine has one renderer item, and Mermaid has one, which draws with Pele.
- A diagram's size in paged layout belongs to the app's `fragmentation` provider, as every non-text block's does. The renderer contract carries no size, and no engine reports sizes to pages. An app that pages Mermaid diagrams can size them in its provider with Pele's synchronous `render` once the diagram type has loaded.
- Static rendering and Markdown export print the diagram source, and Markdown writes a fence in the diagram's language.

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| A size on the renderer contract, measured up front through Pele for Mermaid, with the other engines reporting sizes once drawn | Only Mermaid measures synchronously. Reports tie page layout to which pictures have been drawn, and the wrapper draws only near the viewport while the virtualized paged view never mounts far pages. No kit pages diagrams (2026-10-22 review). |
| A fixed picture frame that a paged kit sizes and the wrapper draws into | Works for every engine but has no consumer. It is the target once a paged kit draws diagrams (2026-10-22 review). |
| Pictures in static pages through Pele | Draws Mermaid alone, while Graphviz, flowchart.js and PlantUML would still print source, and nobody asked for it (2026-10-18 and 2026-10-22 reviews). |
| Keeping mermaid.js for Mermaid | Each redraw cost 29 to 44 ms of main thread on the probe's flowcharts, and the first diagram loaded 225 kB gzip (2026-10-18 review). |
| A Pele item beside a mermaid.js item | Both claim `mermaid`, so an app installs one; Plate would ship two ways to draw one language (2026-10-18 review). |

## What other editors do

A Codex seat searched ten editor checkouts at the commits below on 2026-10-15 and read product docs on the web; nothing was run in a browser. Every product that exchanges diagrams uses a `mermaid` code fence, and most keep the source as editable text. Only CKEditor 5 stores a chosen view, and its export drops it. Obsidian announced on 2026-10-17 that Pele replaces mermaid.js as its Mermaid renderer in its next version.

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
| Obsidian | Markdown `mermaid` fence text | No; source, live preview and reading are UI modes | `mermaid` fence | Built in; Pele from its next version | Undocumented |
| Typora | Markdown `mermaid` and `flow` fence text | Undocumented | `mermaid`, `flow` fences | Built in | Undocumented |

Sources: `TypeCellOS/BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163:packages/diagram-block/src/block/createReactDiagramBlockSpec.tsx`, `ckeditor/ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da:docs/features/mermaid.md`, `ueberdosis/tiptap@91c51be53c4655ef07e29ec489471524debfa0ca:packages/extension-code-block/src/code-block.ts`, `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988`, `Milkdown/milkdown@6a4db480b00db8dd0322b517117dfa2154f3e2e2:packages/core/CHANGELOG.md`, and the Notion block API, GitHub, GitLab, Obsidian and Typora docs read on 2026-10-15. The full answer is in the run directory as `editors-answer.md`.

## Open work

- The timing lines T1 and T2 stay gates, because step 6 of the 2026-10-18 review ran while the host's load was 15.36, above the frozen limit of 9. Owner: suggested task `t_e0e8d398`, which now also reruns step 6 on a quiet host. Stop: a conclusive miss sends the engine choice back to `architect`.
