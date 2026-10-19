---
review_scopes: [drawing]
verdict: pursue
review_basis: [2026-10-04-drawing-audit]
work_kind: implementation
review_commit: b1e70bb257d7a33c3a2f6160759a8ecb79e44500
review_inputs: [packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts, apps/www/src/registry/components/editor/code-block.tsx, apps/www/src/registry/components/editor/code-block-codemirror.tsx, apps/www/src/registry/components/editor/plugins-static.ts, packages/platejs/src/migrations/migratePlateV54.ts, packages/platejs/src/migrations/migratePlateV54CodeBlocks.internal.ts, packages/platejs/src/migrations/migratePlateV54CodeBlocks.spec.ts, packages/platejs/src/migrations/migratePlateV54Profile.internal.ts, packages/platejs/src/migrations/migratePlateV54Ast.internal.ts, packages/platejs/src/migrations/v53-manifest.internal.ts, packages/platejs/src/markdown/lib/markdownConformance.spec.ts, packages/plitejs/src/testing/jsx.ts, packages/plitejs/src/react/components/editable-text-blocks.tsx, tooling/entrypoints/entrypoint-dag.mjs, 'content/docs/(plugins)/(elements)/code-drawing.mdx', 'content/docs/(plugins)/(elements)/code-block.mdx', .changeset/code-drawing-block-insert.md, docs/research/decisions/registry-ui-ownership.md, VISION.md, docs/vision/common.md, docs/vision/plate.md]
review_upstreams: ['../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../milkdown@6a4db480b00db8dd0322b517117dfa2154f3e2e2', '../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../quill@539cbffd0a13b18e9c65eb84dd35e6596e403158', '../editor.js@5f45dabbe5690b7033b2f9047d3985add5045fdd', '../codemirror@c010426d06689a7115aa9df08425126b6d3ead2f']
---

# Drawing: make diagrams code blocks that preview

Status: partial: landed uncommitted in the checkout; waits on suggested task t_e0e8d398's timings, then your commit
Playbook: plan

**Pursue, reaffirming `2026-10-04-drawing-audit` and picking its merge lane.** A diagram is source text in a diagram language, and Plate already has a block for that, the code block. Today `codeDrawing` is a second representation of the same thing. A Mermaid fence pasted from GitHub parses to a code block and never previews, a drawing exports to Markdown as a `<codeDrawing … />` tag no other tool reads, its source reads as empty text, and the package entrypoint carries four renderer peers and resets the app's Mermaid theme. This plan makes a diagram a code block in a diagram language, adds a copied `code-block-diagram` item that draws the picture with engines the app lists, converts saved v53 drawings into code blocks, and deletes `platejs/code-drawing`.

## Brief

### What will change?

Diagrams are code blocks marked Mermaid, Graphviz, PlantUML or Flowchart, and your copied code block draws them. Saved drawings upgrade to code blocks, the old block is gone, and all of it waits uncommitted in your checkout.

### What could go wrong?

Typing speed and picture timing are still unmeasured on a quiet machine, so this stays partial. Apps on the old block must switch, and PlantUML needs your server. On upgrade, a caret near a legacy Toggle can move.

## Teach

A diagram here is text that a library turns into a picture, such as a Mermaid flowchart. Today Plate keeps it in its own block. The text hides in the block's settings, and a separate text box edits it.

Plate already has a block for text in a language, the code block. It saves as a standard Markdown fence that GitHub and other tools read. A diagram pasted from GitHub lands in a code block today and shows no picture.

After this change a diagram is just a code block in a diagram language. A copied add-on for the code block draws the picture with the engines your app lists, and each reader picks code, picture or both. The old block goes away, and saved drawings become code blocks.

## Public API

Today the demo adds the drawing plugin and its copied element. After the change it swaps the kit's code-block plugin for one that draws diagrams, the same way the CodeMirror version does.

```tsx before
// apps/www/src/registry/examples/code-drawing-demo.tsx
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

```tsx after
// apps/www/src/registry/examples/code-block-diagram-demo.tsx (planned)
import { CodeBlockPlugin } from 'platejs/react';

import {
  CodeBlockElement,
  createCodeBlockPlugin,
} from '@/registry/components/editor/code-block';
import { withDiagrams } from '@/registry/components/editor/code-block-diagram';
import { flowchartRenderer } from '@/registry/components/editor/code-block-diagram-flowchart';
import { graphvizRenderer } from '@/registry/components/editor/code-block-diagram-graphviz';
import { mermaidRenderer } from '@/registry/components/editor/code-block-diagram-mermaid';

const diagramCodeBlockPlugin = createCodeBlockPlugin(
  withDiagrams(CodeBlockElement, {
    renderers: [mermaidRenderer, graphvizRenderer, flowchartRenderer],
  })
);

const editor = useCreateEditor({
  plugins: EditorKit.map((plugin) =>
    plugin.name === CodeBlockPlugin.name ? diagramCodeBlockPlugin : plugin
  ),
  initialValue: codeBlockDiagramValue,
});
```

Today the insert menu adds an empty drawing when the drawing plugin is installed. After the change the shared menus drop that entry, and the Diagrams docs show the one entry an app that draws diagrams adds to its own menu, using the code block's existing insert.

```tsx before
// apps/www/src/registry/components/editor/insert-toolbar-button.tsx
import { BaseCodeDrawingPlugin } from 'platejs/code-drawing';

editor.update((tx) => {
  tx.plugin(BaseCodeDrawingPlugin).insert({}, { select: true });
});
```

```tsx after
// an app's copy of insert-toolbar-button.tsx (planned, from the Diagrams docs section)
import { BaseCodeBlockPlugin } from 'platejs';

editor.update((tx) => {
  tx.plugin(BaseCodeBlockPlugin).insert({ language: 'mermaid' }, { select: true });
});
```

Today the drawing element uses Plate's renderer and sends PlantUML text to the public PlantUML server. After the change PlantUML draws only through a renderer your app builds with its own server.

```tsx before
// apps/www/src/registry/components/editor/code-drawing.tsx
import { renderCodeDrawing } from 'platejs/code-drawing';

export function CodeDrawingElement({
  plantUmlServer = 'https://www.plantuml.com/plantuml',
  ...props
}: EditorElementProps<typeof CodeDrawingPlugin> & { plantUmlServer?: string }) {
  // ...
  const imageData = await renderCodeDrawing(language, code, { plantUmlServer });
}
```

```tsx after
// an app's editor kit (planned)
import { createPlantUmlRenderer } from '@/components/editor/code-block-diagram-plantuml';

withDiagrams(CodeBlockElement, {
  renderers: [
    mermaidRenderer,
    createPlantUmlRenderer({ server: 'https://plantuml.example.com' }),
  ],
});
```

## Document shape

The editor, Markdown, HTML and collaborators all read this node. The source moves from a hidden property into the block's text, so Markdown writes a `mermaid` fence and Find, copy and collaboration see it.

```json before
{
  "type": "codeDrawing",
  "code": "graph TD;\n  A-->B",
  "language": "mermaid",
  "view": "split",
  "children": [{ "text": "" }]
}
```

```json after
{
  "type": "codeBlock",
  "language": "mermaid",
  "children": [{ "text": "graph TD;\n  A-->B" }]
}
```

`migrateV54` reads a saved v53 drawing, `{ "type": "code_drawing", "data": { "code": "graph TD;\n  A-->B", "drawingType": "Mermaid", "drawingMode": "Image" }, "children": [{ "text": "" }] }`, and writes the node below. It drops the saved view, because views are no longer saved.

```json before
{
  "type": "codeDrawing",
  "code": "graph TD;\n  A-->B",
  "language": "mermaid",
  "view": "preview",
  "children": [{ "text": "" }]
}
```

```json after
{
  "type": "codeBlock",
  "language": "mermaid",
  "children": [{ "text": "graph TD;\n  A-->B" }]
}
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Draw diagrams, choose the view, export PNG | Plate | copied registry item `code-block-diagram` (`apps/www/src/registry/components/editor/code-block-diagram.tsx`) | Presentation of a mounted view and app policy; no package plugin, store or kit |
| Diagram engines | Plate | copied registry items `code-block-diagram-mermaid`, `-graphviz`, `-flowchart`, `-plantuml` | Each item's imports derive its registry dependencies, so a code-block install pulls no engine |
| Add-on input on the copied code block | Plate | copied `code-block` and `code-block-codemirror` items | The one place a variant shows a toolbar button, extra languages and a wrapped source body |
| Hide the source behind the picture | Plite primitive, used by Plate copied UI | `plitejs` `slots.contentBoundary`, unchanged | The existing coverage boundary keeps hidden text selectable and copyable by model. Dropped in the build: the Picture view is quarantined (Close) |
| Convert saved v53 drawings | Plate | `platejs/migrations` (inputs stage of `migrateV54`) | Serialized-data law; the stage already replaces legacy nodes and maps every point inside one to a fixed point, and every later stage then upgrades the drawing as a code block |
| Map saved selection outside converted code blocks | Plate | `platejs/migrations` (`migrateV54` composition) | A defect on `next` that the conversion depends on; `migrateV54` has not shipped |
| Delete the drawing element and renderer | Plate | `platejs/code-drawing`, `platejs/code-drawing/react`, `PLUGINS.codeDrawing` | Second representation of a code block |
| Delete the drawing hyperscript tag | Plite testing | `plitejs` testing `jsx.ts` | A Plate feature inside Plite's helpers |

The plan adds no entrypoint, so the entrypoint graph only shrinks. `entrypoint-dag.mjs` loses `code-drawing` and `code-drawing/react` with their four peers.

## Hard cuts and app migration

Deleted:

- `platejs/code-drawing` and `platejs/code-drawing/react`: `BaseCodeDrawingPlugin`, `CodeDrawingPlugin`, `renderCodeDrawing`, the drawing language and view types and constants, and the four optional peers `mermaid`, `viz.js`, `flowchart.js` and `plantuml-encoder`.
- `PLUGINS.codeDrawing` and the plitejs testing hyperscript tag for drawings.
- The copied `code-drawing` and `code-drawing-static` items, `BaseCodeDrawingKit` in the static kit, the drawing targets in both indent kits, the Code Drawing menu entries (no Diagram entry replaces them in the shared menus), the `code-drawing-demo` example and its value.
- Static and export output keep printing diagram source only, as the drawing's static element did: `renderStaticHtml`, DOCX and AI Markdown get a `mermaid` fence or `pre > code`, never a picture.
- `content/docs/(plugins)/(elements)/code-drawing.mdx`; `/docs/code-drawing` redirects to the code-block page's Diagrams section.

Callers that break, from `pstack:blast-radius` (`docs/plans/artifacts/2026-10-15-drawing-review/blast-radius.md`) and the consumer inventory:

- An app that installs `CodeDrawingPlugin` or renders `CodeDrawingElement` stops compiling. It installs `code-block-diagram` and one renderer item per engine, then wraps its code-block element as Public API shows.
- An app that calls `renderCodeDrawing` copies the renderer item for that engine instead.
- A saved v53 document upgrades through `migrateV54` once the app installs the code-block plugin. Without it the upgrade fails on the unknown `code_drawing` type, as it does for any element whose owner is missing.
- Flat `codeDrawing` nodes exist only in apps built from unreleased `next` source; no published release wrote them. `platejs@54.0.0-beta.1` has no drawing entrypoint, and `@platejs/code-drawing@54.0.0-beta.0` still stores the v53 `code_drawing` shape that `migrateV54` converts. Such an app converts each node to `{ type: 'codeBlock', language, children: [{ text: code }] }` before loading.
- `pnpm --filter www build:registry` regenerates `apps/www/public/r/**` from the registry, and this change keeps the regenerated files. `.github/workflows/sync-templates.yml` refreshes `templates/**` from the registry on a push to `main` or when run by hand; until then the playground template keeps its copied drawing block on the published v53 packages, and nothing here edits it.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| ArrowDown into a picture-only diagram | The source mounts before the caret moves in and the caret lands on its first line; leaving the block hides it again | quarantined: on both variants the caret skips the hidden source to the paragraph below (`docs/plans/artifacts/2026-10-15-drawing-review/picture-view/p2-5-first-a1.log`), and Plite's own hidden-content example skips its closed accordion the same way; suggested task `t_228be4ba` |
| ArrowUp into a picture-only diagram | The source mounts and the caret lands on its last line | quarantined, same cause and log |
| Shift+ArrowDown and Shift+ArrowUp across a picture-only diagram | The selection extends into the mounted source with the exact model range, and the next plain vertical move stays native | quarantined: four presses stop inside the block (same log) |
| Click on the picture | The source mounts with the caret at its start | passed in Chromium before the quarantine (same log); gone with the view |
| Choosing Picture while the caret is in the source | The toggle's mousedown keeps focus in the editor, the editor selection clears, then the source hides | passed in Chromium before the quarantine (same log); gone with the view |
| Choosing Code | Code stays Code through focus, typing and an empty source, and no render starts | step 2.5 "Code stays Code" row counts zero renderer calls |
| Select-all and copy across a picture-only diagram | Select-all covers the hidden source by model; copy writes the source as text, HTML and fragment | the source always shows now, so select-all and native copy go through it; step 2.5 copy row on both variants, Chromium only |
| Deleting a diagram | Ordinary block deletion removes a picture-only diagram | passed in Chromium before the quarantine (same log); a shown diagram deletes like any code block |
| Export PNG | Writes a PNG of the current picture at the size its SVG states; a Mermaid SVG that states only width 100% takes the browser's default size, as the drawing block's did (`t_f7cbb3b1`) | step 2.5 row, every browser: a Graphviz PNG with painted pixels |
| Browser Find | Cannot see a hidden source; editing shows the source by default | the source always shows, so Find sees it |
| IME | Composition runs only on a mounted source; a Picture pick made while a composition is open waits for it to end before it clears the selection and hides the source | the source is always mounted, so composition runs as in any code block; a render that finished during an open CDP composition kept the composed text on both variants in Chromium (`docs/plans/artifacts/2026-10-15-drawing-review/panel-d1/red-browser-a2.log`), and no row keeps that case because the typing row already fails on the source remount that would break it (`panel-d1/mutant-source-remount-typing-a1.log`); the Picture-pick wait passed its CDP row before the quarantine (same log as above) and went with the view |
| Read-only | Shows the picture, or the source when the render fails; a selection crosses the hidden source by model | shows the source and the picture, or the source and the error when the render fails; step 2.5 row on both variants |
| CodeMirror variant | Arrow entry and exit, copy, read-only and composition through `externalText` inside the boundary | ArrowDown out past the picture, copy and read-only pass; arrow keys do not enter CodeMirror from the paragraphs around it on this tree's plain CodeMirror demo either (`probe-cm-arrow-down-a1.log`, `probe-cm-arrow-up-a1.log`), so the entry rows run on the native variant only; suggested task `t_a5661f4b` |
| Arrow keys across the picture in Both | The caret crosses the picture area between the source and the paragraph below | step 2.5 rows: ArrowDown out on both variants, ArrowDown in and ArrowUp in on the native variant |
| Typing in Both | The picture redraws from the new source once the editor goes idle | step 2.5 row "typing in Both redraws the picture" on both variants reads the new node label in the drawn SVG |
| Undo | Unchanged: switching views writes nothing to the document | step 2.5 asserts the value is unchanged after each switch |

## Main changes

- `migrateV54` converts a v53 `code_drawing` in its inputs stage, which maps every point inside a node it replaces to one point, so a caret inside a saved drawing lands at the start of its source. The profile and AST stages then upgrade the drawing's block properties as they do a code block's, and the AST stage has no drawing branch. Their diffs keep that caret when they change only the drawing's properties. When they restructure the blocks around it, as when a legacy Toggle groups the drawing under it, the caret moves like any other caret. The new source text carries the insertion or deletion that all the drawing's texts share, as a flattened code block's text now does. A drawing with saved code carries its own instead, because v53 never showed its texts. The upgrade drops a formatting suggestion on code text along with the formatting, because code text keeps none. It refuses code whose texts carry any other review marks one text cannot hold, and a suggested change to a drawing's `data`.
- `migrateV54` maps a saved selection stage by stage instead of through one diff of the whole step, and the code-block stage keeps every point outside the blocks it converts, as the URL stage already does. On `next`, the whole-step diff moves a caret beside a legacy code block, or before a legacy Toggle, to offset 0. The profile and AST stages still map through their own diffs, so a caret beside a legacy media caption, or between two legacy Toggles, can still move; a suggested task owns that. `migrateV54` has not shipped, so this needs no release note.
- Diagram rendering moves out of `platejs` into copied registry items. Each engine's registry dependency derives from its own item, so installing `code-block` installs no engine.
- `apps/www` declares the four engine libraries that `platejs` drops.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Diagram node | `codeDrawing` void with `code`, `language`, `view` | Code block in a diagram language | `platejs` code block, unchanged | One representation; fences preview; text visible | Menus, demos, values, docs | Markdown round trip, browser spec | Apps on the old block | cut |
| Renderer function | `renderCodeDrawing` in `platejs/code-drawing` | One copied renderer item per engine | Registry | Engines and servers are app policy (plate.md provider paragraph) | Demo, docs | Registry dependency read-back, Mermaid config probe | An app that called it copies an item | cut |
| Stored view | `view` property | None; local per viewer | Copied `code-block-diagram` | A presentation the view owns (VISION.md Boundary Law); no Markdown form under `lossPolicy: 'reject'` | Docs drop "persisted views" | Browser spec | Viewers lose a saved pick on reload | cut |
| PlantUML server | Defaults to plantuml.com | Required `server` on `createPlantUmlRenderer` | App kit | No hidden backend | Docs | Step 2.3's stubbed-`fetch` spec: one request to the configured server, none to any other host | None | rearchitect |
| Mermaid configuration | Package resets it on first render | Copied renderer never initializes Mermaid | Copied Mermaid item | Do not mutate a caller's configuration | Docs | Probe rerun against the copied renderer | An app that relied on the reset sets its own config | rearchitect |
| Add-on input | None | `addon` on the copied code-block variants | Copied `code-block` | One composition point for both variants and app copies | CodeMirror variant forwards it | Existing code-block browser specs before and after | A custom copy that ignores it shows no picture | keep (new) |
| Render scheduling | Every drawing renders 500 ms after its last change | Render near the viewport after the editor commits and goes idle, never in Code view, at most one render in flight per block with only the latest source pending | Copied `code-block-diagram` | Repeated-unit work; no timer debounce (VISION.md) | None | Step 2.6 pre-acceptance probe | Mermaid and Viz run on the main thread, so typing in Both may cost a render per pause; a miss sends it back to `architect` | gate |
| v53 upgrade | Lifts `data` into flat drawing properties | Code block | `platejs/migrations` inputs stage | Serialized-data law; the inputs stage maps every point inside the drawing to the start of its source, and the later stages upgrade it as a code block | Changeset | Migration specs, real-pipeline probe | Present but malformed `data` now refuses | rearchitect |
| Selection outside converted blocks | Whole-step diff moves a neighbor caret | Stage-by-stage mapping; the code-block stage keeps points it does not move | `platejs/migrations` | A defect on `next` that the conversion inherits | None | Red-then-green spec | Other stages' mappers | rearchitect |
| Drawing entrypoints, peers, key, hyperscript tag | Present | Deleted | `platejs`, `plitejs`, tooling | Hard cut | Regenerated outputs | Typecheck, entrypoint graph, live grep | Generated output drift | cut |

## Design

`architect` ran three runners, `gpt-6.1-sol @xhigh`, `claude-opus-5-5 @high` and `gpt-6-astra @xhigh`, and one blind cross-judge, `claude-opus-5-5 @high`. All three converged on the same representation. The judge scored the Opus candidate 26, Sol 23 and Astra 21; the lead scored them 25, 23 and 21. The base is the Opus candidate. Adding an engine is one renderer file plus one array entry, and the app's renderer list is the only list of diagram languages, because each renderer declares its own languages.

The copied contract:

```ts
// apps/www/src/registry/components/editor/code-block-diagram.tsx (planned)
export type DiagramRenderer = Readonly<{
  /** Fence languages this engine draws, canonical first, such as ['graphviz', 'dot']. */
  languages: readonly [string, ...string[]];
  label: string;
  /**
   * Resolves SVG markup, or rejects with a message the block shows. `signal` aborts work that has not
   * started, such as a queued Mermaid render or a PlantUML request; work already running finishes and
   * its result is dropped.
   */
  render: (source: string, options: { signal: AbortSignal }) => Promise<string>;
}>;

export function withDiagrams(
  Element: CodeBlockComponent,
  options: { renderers: readonly DiagramRenderer[] }
): CodeBlockComponent;

// apps/www/src/registry/components/editor/code-block.tsx (planned)
export type CodeBlockAddon = Readonly<{
  languageOptions?: ReadonlyArray<{ label: string; value: string }>;
  toolbar?: React.ReactNode;
  wrapSource?: (source: React.ReactNode) => React.ReactNode;
}>;

/** What `createCodeBlockPlugin` takes: `CodeBlockElement`, `CodeBlockCodeMirrorElement` or a wrapped one. */
export type CodeBlockComponent = (props: CodeBlockElementProps) => React.ReactElement;
```

`withDiagrams` builds a language map once and throws when two renderers claim one language. A block whose language no renderer claims renders the wrapped element with only the extra language options. A diagram block puts a Code, Picture and Both toggle and an Export PNG button in `toolbar`.

`wrapSource` puts the whole source body inside one `slots.contentBoundary`. That body is the native `<pre><code>` or the CodeMirror `externalText`. The boundary covers `scope: { type: 'children', from: 0, to: 0 }` with `copyPolicy: 'model'`, and its `selectionPolicy` is `'materialize'` while editable and `'model'` while read-only. In Both the picture sits below the source, and in Picture it is the boundary's placeholder.

The component stores only the reader's explicit pick. Without one, the view is Both while editable and Picture while read-only, so the default follows the editor when it turns read-only at runtime. Code stays Code through focus, typing and an empty source, and renders nothing. Only Picture changes on its own. An editable Picture block shows Both while its source is empty or the editor selection intersects the source, so a range that crosses the block mounts it too. It never hides its source while an IME composition is open. The native source composes in the editor's own editable host, so the block reads `useEditorComposing()`; CodeMirror composes in its own content element inside the block, so the block also listens for `compositionstart` and `compositionend` on its container. A Picture pick made during a composition waits until both report it over and `editor.api.react.settleInput()` returns true, so the composed text has reached the model before the selection clears. When a render fails, a read-only reader sees the source and the error instead of an empty picture.

The picture renders as an `<img>` of an SVG data URL with the language as its alt text, never as live HTML. It keeps the size the renderer's SVG states. Mermaid states only width 100% for most diagram types, so its picture scales to fit the column and its PNG takes the browser's default size for such an image, as the drawing block's did; suggested task `t_f7cbb3b1` sizes them from what Mermaid draws. Output that is not SVG, such as Mermaid's iframe under `securityLevel: 'sandbox'`, shows as the block's error. Mermaid first builds its drawing in a page node under the app's own `securityLevel`, so an app that sets `'loose'` lets label HTML run there. After a failed render the renderer removes the nodes Mermaid names after the render's id; a node one of Mermaid's own helpers leaves when its own text measurement fails stays, as it does after any direct `mermaid.render` call. A render starts for a block near the viewport from an effect after the editor commits, inside `requestIdleCallback`, or a zero-delay task where the browser has none. At most one render runs per block, an aborted one included until it settles, and only the latest source waits behind it; a waiting source drops when the block leaves Both or the viewport, and no timer delays them. When the block unmounts, as when React Activity hides a kept route, a render still running is aborted and its source draws again once the block shows; a source already drawn does not. The language picker labels an added language from `addon.languageOptions`, so Graphviz reads "Graphviz", not "graphviz".

**The build quarantined the Picture view.** The three paragraphs above are the approved design; the build ships less. A collapsed ArrowDown or ArrowUp skips a boundary's non-editable placeholder, and Plite asks a `'materialize'` boundary to mount only when Shift+Arrow extends a selection into it, so the caret jumped past a picture-only diagram on both variants. Phase 2's rule then applied: `wrapSource` keeps no boundary, the toggle offers Code and Both, read-only shows Both, and the composition wait and selection subscription went with the view. The Picture version is saved under `docs/plans/artifacts/2026-10-15-drawing-review/picture-view/`, and suggested task `t_228be4ba` restores it once collapsed vertical moves reveal a boundary. The picture area also stays mounted and toggles `hidden` instead of unmounting: the editor puts back a child node that the wrapper's own state removes beside the source, because only the plugin element's render claims a React commit inside the editable and `platejs/react` does not export that claim to copied UI. Suggested task `t_83b43c4a` owns that choice.

Grafts taken:

1. Composition without slot patching, from Sol and Astra, reshaped: the container wraps its body through `addon.wrapSource` instead of the wrapper swapping `children` and `slots.externalText`.
2. No `createCodeBlockKit`: `createCodeBlockPlugin` plus the replace-in-kit pattern already composes variants (`code-block.tsx:468`, `code-block-codemirror-demo.tsx:21-28`).
3. No `flow` alias, from Sol: `code-block.tsx:62` already lists Flow as a code language.
4. An abort signal on every render, from Sol, with the cancellation each engine can give: it skips work that has not started and drops a stale result.
5. Three engines are constant renderers; only PlantUML, which needs input, is a factory. The Graphviz renderer builds a new Viz instance for every render, as `next` does today, because a failed render leaves its instance unable to draw, and another block's render can start on it before any replacement runs (`docs/plans/artifacts/2026-10-15-drawing-review/probe-viz-a1.log`, `probe-viz-concurrent-a1.log`).
6. The upgrade reads a saved drawing the way v53's element read it, and refuses none for its values, from Astra and reworked in review. v53 read `element.data?.code ?? ''` and `element.data?.drawingType ?? 'Mermaid'`, and `next`'s AST stage already reads a `data` that is not a plain object as empty (`migratePlateV54Ast.internal.ts:493-497`). So a null `code` becomes an empty source and a missing or null `drawingType` becomes `mermaid`. A drawing with no `code` at all takes its own text. v53's Turn into left a paragraph's text there, hidden, and a drawing inserted from the menu holds one empty text. Any other value becomes a string with `String()`, the way v53's textarea and select showed it, so a `code` of `42` stays `42` and `["graph TD; A-->B"]` stays `graph TD; A-->B`. The `drawingType` string is lowercased into the language, so `PlantUml` becomes `plantuml` and an unusual label stays a plain code block until a renderer claims it.
7. Choosing Picture with the caret inside clears the editor selection, then hides the source, from Astra. While a composition is open, the pick waits for the composition to end and the input to settle before it does either, from Sol.

The losing candidates handled three cases that this plan leaves as named limits. A diagram language with no renderer is an ordinary code block with no "preview unavailable" note, because such a note needs a second language list. Deleting a diagram uses ordinary block deletion, with no Delete button. The typed fence goes to Open work.

Three more limits stay unmeasured. WebKit has no `requestIdleCallback`, so there the render starts in a zero-delay task after each commit, and step 2.6 runs in Chromium only. A Graphviz block builds a new Viz instance on every pause in typing, where `next` builds one per 500 ms burst, and step 2.6 times only Mermaid. The upgrade's profile and AST stages still map a saved caret through their own diffs, so a caret beside a legacy media caption or between two legacy Toggles can move to offset 0, as it does on `next` today.

**This plan changes the picked base's upgrade after the verdict.** The Opus candidate and the judge said the upgrade needs no selection mapping, because `migrateV54` maps stages by diffing. When run, that premise failed (`docs/plans/artifacts/2026-10-15-drawing-review/probe-selection-a2.log`): filling the drawing's text in the stage that also renames its neighbor paragraphs moves a caret inside the drawing into the previous paragraph and moves a point inside the renamed neighbor to offset 0. With an empty text, or with neighbors already renamed, the neighbor holds (`probe-selection-empty-a1.log`, `probe-selection-neighbors-a1.log`). So the drawing converts in the code-block stage, where its neighbors no longer change and which keeps every point outside the blocks it flattens. The profile stage leaves `code_drawing` unrenamed, as it maps `code_line` to the intermediate `codeLine` instead of a schema type, and both stages skip a `code_drawing` type that the app's own schema declares (`migratePlateV54Profile.internal.ts:110`). A v53 drawing holds one empty text, so the kept caret sits at offset 0, the start of its source. The stage's plain diff would put it at the end (`drawing-caret-diff-mutant-a1.log`), and a mapping of the drawing's own points adds nothing (`drawing-caret-mutant-a1.log`). A probe of the real pipeline (`probe-selection-codeline-a1.log`) shows that the fallback for points outside a converted block already moves a caret in the paragraph before a legacy code block to offset 0 on `next`, so Phase 1 fixes that first. `migrateV54` has not shipped, so the fix needs no release note.

The plan rejects these parts of the candidates:

- Sol's language props threaded through three copied menus, and its Turn Into diagram entry, which reverses `docs/plans/2026-09-18-ui-composition-installation-design.md`.
- A language catalog in the diagram item beside the app's renderer list.
- Astra's usage, which replaces the whole language picker with diagram languages.
- A module-wide render cache. A block keeps its own picture while mounted, and a cache would need its own measured cost to earn a place.
- A Diagram entry in the shared insert and slash menus. The default editor kit installs no diagrams, so the entry would insert a block that never draws; the docs show the entry an app adds.
- A stored view in fence meta, which no tool reads.

This plan reverses two claims from the verdict page. The renderer map lives in its own item, not in the copied `code-block.tsx`. No beta-document recipe ships, because no published release wrote flat `codeDrawing` nodes.

Challenge delta: improved. Round 1 of the plan's panel kept the target and changed these:

- Graphviz replaces its Viz instance after a failed render.
- The upgrade keeps drawings with no `data` or an unusual type, and skips a `code_drawing` type the app's schema owns.
- Code stays Code; only Picture reveals its source.
- Step 2.6 adds typing inside a diagram, documents full of diagram blocks and a deadline for the latest picture.
- Phase 3 starts only after Phase 2 is kept.
- The shared menus get no Diagram entry.
- The renderer items carry their type packages, and the wrapper and the plugin factory share one component type.
- Step 2.5 adds ArrowUp, Shift+Arrow, Code view, deletion, PNG export, composition and CodeMirror copy and read-only rows, and any failed Picture row quarantines Picture. A PlantUML spec proves the renderer contacts only its configured server.
- Phase 1 is a fix on `next`, not a shipped defect.

Round 2 kept the target and changed these:

- Graphviz builds a new Viz instance for every render, and its spec overlaps an invalid and a valid render.
- The upgrade refuses no drawing; null and non-string fields take v53's defaults.
- A Picture pick made during an open composition waits for it to end, and a row proves it by failing without the guard.
- Step 2.6 gives operation C fixed budgets, a typing pace, an incumbent arm and planted arms, and gives A2 a latency line.
- Phase 1 maps every stage through its own diff and adds a Toggle case, because a document with a legacy Toggle and no code block loses its caret the same way.

Round 3, the last plan round, kept the target and changed these:

- The code-block stage keeps every point outside the blocks it converts, because its own diff also loses a caret between two converted blocks. The profile and AST stages' remaining cases become a named limit and a suggested task.
- The native source's composition is read from `useEditorComposing()`, and a deferred Picture pick waits for the input to settle.
- A non-string drawing value becomes text the way v53 showed it, instead of an empty source.
- Every step 2.6 latency line measures input to paint from the `beforeinput` timestamp, and each planted arm sits on that path; a slowed-renderer cohort makes keystrokes overlap a render.
- A Picture quarantine removes the boundary and reruns the Code and Both rows, and A2 has an all-Both form.

## Feature Manifest

Flow mode: registry-only

Feature Manifest:
| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- |
| API | yes | best-api lens in the verdict, then architect | `withDiagrams`, `DiagramRenderer`, `createPlantUmlRenderer` and the code block's `addon` prop, per Public API pairs above | App authors composing code blocks | api-build diff panel, the decision log's `seats` rows for Phases 1 and 2 and for Phase 3; `docs/plans/artifacts/2026-10-15-drawing-review/p3-7-teaching-sweep-a2.log`; `docs/plans/artifacts/2026-10-15-drawing-review/p3-7-api-reference-a1.log` | complete |
| Package | no | platejs | N/A: the feature adds no package API; the package changes here are the drawing cut and the v53 upgrade, tracked in the decision ledger | none | N/A: covered by Phase 1 and 3 steps | N/A: no package feature surface |
| React adapter | no | platejs/react | N/A: no React plugin; the code-block plugin is unchanged | none | N/A: no adapter | N/A: no adapter |
| Registry UI | yes | plate-ui | `code-block-diagram.tsx` and the four `code-block-diagram-*` renderer items | Apps that copy the code block | `docs/plans/artifacts/2026-10-15-drawing-review/p2-5-fixed-chromium-1-a1.log` to `p2-5-fixed-chromium-5-a1.log`, `p2-5-fixed-webkit-a1.log`, `p2-5-fixed-firefox-skip-a1.log`; `docs/plans/artifacts/2026-10-15-drawing-review/mutate-p2b.json` | complete |
| Composition | yes | plate-ui | the `addon` prop on the native and CodeMirror code-block variants; the playground demo's diagram code block | Native and CodeMirror code-block variants, app copies | `docs/plans/artifacts/2026-10-15-drawing-review/p2-1-after-run.txt` beside `base-cb-*.log`; `docs/plans/artifacts/2026-10-15-drawing-review/drive-check-a1.log` | complete |
| Scale proof | yes | benchmark | step 2.6's count lines, the open line's renderer calls and the overlap line's latest-source rule | users/maintainers | `docs/plans/artifacts/2026-10-15-drawing-review/perf/measurements-a1.json`, `docs/plans/artifacts/2026-10-15-drawing-review/perf/open-judged-a4.json`, `docs/plans/artifacts/2026-10-15-drawing-review/perf/overlap-c-overlap-a4-1-a1.log`; the typing lines A1, A2 and C and the open and overlap timing parts ran inconclusive on a loaded host | open: suggested task `t_e0e8d398` runs the typing lines |
| Registry metadata/examples | yes | plate-ui | the `code-block-diagram` items in `registry-features.ts`, `code-block-diagram-demo` with `values/code-block-diagram-value.tsx`, the registry changelog entry | shadcn registry installs | `docs/plans/artifacts/2026-10-15-drawing-review/p2-4-build-registry-a1.log`, `docs/plans/artifacts/2026-10-15-drawing-review/p2-4-registry-deps-a1.log`, `docs/plans/artifacts/2026-10-15-drawing-review/p3-5-registry-check-a1.log`, `docs/plans/artifacts/2026-10-15-drawing-review/p3-6-changelog-check-a1.log` | complete |
| Docs | yes | plate-docs | the Diagrams section of `content/docs/(plugins)/(elements)/code-block.mdx` and its Chinese twin | Docs readers | `docs/plans/artifacts/2026-10-15-drawing-review/p3-5-docs-parity-a1.log`, `docs/plans/artifacts/2026-10-15-drawing-review/d4-docs-parity-a1.log`, `docs/plans/artifacts/2026-10-15-drawing-review/drive-check-a1.log` | complete |
| Release artifacts | yes | changeset | `.changeset/code-drawing-block-insert.md`; `.changeset/plate-graphviz-browser-import.md` deleted | Release notes readers | `docs/plans/artifacts/2026-10-15-drawing-review/p3-6-changeset-status-a1.log` | complete |

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| A Mermaid fence parses to a code block, and a drawing writes a custom tag with empty text | yes | `docs/plans/artifacts/2026-10-15-drawing-review/probe-markdown-a3.log` |
| The package renderer resets the app's Mermaid theme | yes | `docs/plans/artifacts/2026-10-15-drawing-review/probe-mermaid-config-a2.log` |
| A v53 drawing fails the upgrade once the drawing plugin is gone | yes | `docs/plans/artifacts/2026-10-15-drawing-review/probe-migration-a2.log` |
| The drawing conversion needs a stage that keeps points itself, not a diff | yes | `docs/plans/artifacts/2026-10-15-drawing-review/probe-selection-a2.log`, with controls `probe-selection-empty-a1.log`, `probe-selection-neighbors-a1.log` and `probe-selection-real-a1.log`; `drawing-caret-diff-mutant-a1.log` (the code-block stage's diff gives offset 15) and `drawing-caret-mutant-a1.log` (no mapping of the drawing's own points still gives offset 0) |
| The upgrade on `next` moves a caret before a legacy code block | yes | `docs/plans/artifacts/2026-10-15-drawing-review/probe-selection-codeline-a1.log` |
| The whole-step diff, not a stage diff, moves that caret, and a legacy Toggle triggers it too | yes | `docs/plans/artifacts/2026-10-15-drawing-review/probe-selection-stages-a1.log` (every stage keeps `0.0@4`, the whole step gives `0.0@0`), `probe-selection-toggle-a2.log` (`0.0@0` with no code block), `probe-selection-url-a1.log` (a rejected link keeps `0.0@4`) |
| A stage's own diff also moves a point when the stage changes two places, while the code-block stage can keep it | yes | `docs/plans/artifacts/2026-10-15-drawing-review/probe-selection-two-blocks-a1.log` (a caret between two legacy code blocks: the stage diff gives `0.0@0`, keeping the point gives `1.0@3`), `probe-selection-caption-a1.log` (the profile stage's own diff gives `0.0@0` beside a captioned image) |
| A Viz instance cannot draw a valid diagram after a failed render | yes | `docs/plans/artifacts/2026-10-15-drawing-review/probe-viz-a1.log`: valid, then a syntax error, then the same valid source fails with `Error: TN`; a fresh instance draws it |
| Replacing a shared Viz instance after a failure still fails a render started beside the failing one | yes | `docs/plans/artifacts/2026-10-15-drawing-review/probe-viz-concurrent-a1.log`: with replace-after-failure the valid graph fails with `Error: pUS`; with a new instance per render it draws |
| A v53 drawing may omit `data` or hold null fields | yes | `git show 2f87593f95:packages/code-drawing/src/lib/BaseCodeDrawingPlugin.ts` declares `data?: CodeDrawingData`; `git show 2f87593f95:apps/www/src/registry/ui/code-drawing-node.tsx` reads `element.data?.code ?? ''` and `element.data?.drawingType ?? 'Mermaid'` (lines 203-204); the AST stage reads a `data` that is not a plain object as empty (`migratePlateV54Ast.internal.ts:493-497`) |
| No published release wrote flat `codeDrawing` nodes | yes | `git show @platejs/code-drawing@54.0.0-beta.0:packages/code-drawing/src/lib/BaseCodeDrawingPlugin.ts` keeps `code_drawing` with `data`; `platejs@54.0.0-beta.1` has no `packages/platejs/src/code-drawing` |
| Registry dependencies come from each item's imports, so `code-block` installs no engine today | yes | `docs/plans/artifacts/2026-10-15-drawing-review/base-registry-deps-a2.log`: the generated `code-drawing` item lists all four engines through the package peers while its authored list has only `platejs` and `lodash`; `code-block` and `code-block-codemirror` list none. The scanner collects dynamic imports (`apps/www/scripts/registry-imports.mts:269-283`); step 2.4 reads the new items back |
| The coverage boundary renders custom children and a placeholder over a children range | yes | Source read: `packages/plitejs/src/react/components/editable-text-blocks.tsx:243-301`, `dom-coverage-boundary.tsx:129-146`. Behavior over a code block's lone text child is unproven; step 2.5 gates it |
| Performance pack | yes | Gate: render scheduling is repeated-unit work, so step 2.6 runs the pre-acceptance probe with budgets frozen on the baseline first; a miss sends it back to `architect` |
| Feature Manifest complete before source writes | yes | Feature Manifest above; Flow mode registry-only |
| Public API decision owner | yes | `best-api` lens in the verdict and `architect` (decision log `architect` rows) |

## Completion Gates

| Gate | Evidence |
| --- | --- |
| `pstack:blast-radius` before code moves | `docs/plans/artifacts/2026-10-15-drawing-review/blast-radius-final.md`, decision row 111 |
| `plate-docs` on every named docs page | step 3.5; `docs/plans/artifacts/2026-10-15-drawing-review/p3-5-docs-parity-a1.log`, `docs/plans/artifacts/2026-10-15-drawing-review/d4-docs-parity-a1.log` |
| `best-api repair` | step 3.7, decision row 116; `docs/plans/artifacts/2026-10-15-drawing-review/p3-7-teaching-sweep-a2.log`, `docs/plans/artifacts/2026-10-15-drawing-review/p3-7-api-reference-a1.log` |
| `changeset` | step 3.6; `docs/plans/artifacts/2026-10-15-drawing-review/p3-6-changeset-status-a1.log`, `docs/plans/artifacts/2026-10-15-drawing-review/p3-6-changelog-check-a1.log` |
| Step 2.6 pre-acceptance probe and its rerun on the final path | open: the count lines, the open line's renderer calls and the overlap line's latest-source rule pass (decision rows 66, 108, 109); the open and overlap lines' timing parts and the typing lines A1, A2 and C ran inconclusive on a loaded host (rows 108, 109, 120, 121), and suggested task `t_e0e8d398` owns them |
| `pnpm check` steps the edits reach, before the expensive acceptance runs | on `e184158398`, `docs/plans/artifacts/2026-10-15-drawing-review/final-check-fast-a1.log`, `final-check-heavy-a1.log`, `final-check-rerun-a1.log`, `final-check-rest-a1.log` and the `final-www-*` links against base `final-check-base-a1.log`, `final-test-fails-base-a1.log`, `final-plite-yjs-base-a1.log` and `final-www-editor-check-base-a1.log`; on `83f6e5dde0`, `v2-check-steps-a1.log` and the `v2-www-*` links against `v2-base-checks-a1.log`, `v2-base-test-a1.log`, `v2-base-www-a1.log`, `v2-base-editor-check-cli-a1.log` and `v2-base-apiref-a1.log`; every failure is a base failure, and `t_54844d26`, `t_ed79a18b`, `t_3ea68f2e` and `task_b7aaefbb` own them |
| `oxlint --type-aware` on the task's lintable files before the diff panel freeze | `docs/plans/artifacts/2026-10-15-drawing-review/lint-task-d1-a2.log` before the first freeze; `docs/plans/artifacts/2026-10-15-drawing-review/lint-task-final-a1.log` on the final files, whose six errors are base errors in `playground-demo.tsx` |
| Writing passes: `deslop`, `no-comments`, `unslop` | decision rows 71, 88, 97, 102, 107, 118, 130 and 134 |
| Diff panel (reviews: api-build) | three rounds on Phases 1 and 2 (rows 90, 98, 103) and two on Phase 3 (rows 119, 131) |
| `pnpm lint:task` as the last check that edits code | `docs/plans/artifacts/2026-10-15-drawing-review/lint-task-final-a2.log` on `83f6e5dde0` plus this diff: it edits nothing and reports the six base errors in `playground-demo.tsx` that `lint-task-final-a1.log` reported |
| Hand drive `check` log | `docs/plans/artifacts/2026-10-15-drawing-review/drive-check-a1.log`: 104 of 105 cells; `/blocks/installation-next-demo` errors as it does at base, and `task_f99fb601` owns it |
| Code-quality review | skip: the build owed the `api-build` diff panel from its first slice, and every seat applied both lenses, as the Build playbook says |
| `check-plate-feature.mjs` | `docs/plans/artifacts/2026-10-15-drawing-review/check-plate-feature-a1.log`: fails only on Scale proof, which stays open on `t_e0e8d398` |
| `review-ledger.mjs check` at close | `docs/plans/artifacts/2026-10-15-drawing-review/final-review-ledger-a2.log`: fails only with lines base `83f6e5dde0` prints (`v2-base-checks-a1.log`), and `t_3ea68f2e` owns it |

## Steps

Execution playbook: Build (`.agents/playbooks/build.md`). Execution authority: the chips task `task_a1ae2979`, "verdict drawing (xhigh)", whose Pursue continues into this build under Autopilot. The packet is every file the steps below name. The build runs in worktree `beautiful-banach-499020`, detached at `next` `b1e70bb257`, commits nothing, and lands as a patch in the main checkout's working tree.

### Phase 1. Keep a saved caret near converted code blocks

Keep it when the new cases fail at base and pass on the change; revert the phase otherwise.

- [x] 1.1 Through pstack's Bug fix playbook, add three cases, one per failure mode. In `migratePlateV54CodeBlocks.spec.ts`, a v53 envelope `[p "before", code_block of two code_line, p "after"]` with a range from `before`@2 to `after`@3 keeps both ends, and `[code_block, p "middle", code_block]` with a caret at `middle`@3 keeps it. In `migratePlateV54.spec.ts`, `[p "before", toggle "Title", p "after"]` with a caret at `before`@4 keeps it. `docs/plans/artifacts/2026-10-15-drawing-review/probe-selection-stages-a1.log` traced the cause. Each stage's own diff keeps `before`@4, but the whole step's diff renames the paragraph and restructures its neighbor at once, so its common prefix ends at the first block and the point falls to offset 0. The code-block stage falls back to that whole-step selection outside the blocks it converts, and a document that no stage mapper touches, such as one with a Toggle, takes it directly (`probe-selection-toggle-a2.log`). A stage's own diff fails the same way when the stage changes two places, as `probe-selection-two-blocks-a1.log` shows for two code blocks, while keeping the point maps it exactly. Fix it at the producers. The code-block stage keeps every point outside the blocks it converts, because it changes only their children and never moves a sibling, as the URL stage's mapper already does (`migratePlateV54Urls.internal.ts:220`). `migrateV54` maps through the inputs mapper, the profile and AST stage diffs, the URL mapper and the code-block mapper, in one function both the plain and the legacy-suggestion branches call, so it always returns `mapSelection` and never reads the whole-step selection. The profile and AST stages keep their own diffs: a caret beside a legacy media caption (`probe-selection-caption-a1.log`) or between two legacy Toggles can still move, and a suggested task owns explicit mappings for those stages. A legacy-suggestion case joins the spec only if a probe shows it fails at base. No changeset, because `migrateV54` has not shipped. Proof: `node tooling/scripts/proof-worktree.mjs <path> b1e70bb257 --with <each spec> --dir docs/plans/artifacts/2026-10-15-drawing-review --name p1-red --expect-fail "<each case title>" -- bun test <both specs>`, then both specs and every `packages/platejs/src/migrations/*.spec.ts` green on the change, and `mutate.mjs` on the fix.

### Phase 2. Preview diagrams in copied code blocks

Keep it when every Code and Both row of step 2.5 passes, the demo's composition typechecks, and every step 2.6 line is conclusive and passes. When any Picture row of 2.5 fails or cannot run, the composition rows on either variant included, quarantine the Picture view: remove `wrapSource`'s boundary, its placeholder and its materialize code, so editing offers Code and Both and read-only shows Both, then rerun every Code and Both row of 2.5 and run A2 in its all-Both form. Revert the phase when a Code or Both row fails. A conclusive 2.6 miss sends render scheduling back to `architect` before Phase 3 starts; an inconclusive line reruns when the host's load allows, and Phase 3 builds meanwhile on the owner's word, as the Defaults row "Phase 3 while the typing timings wait" says.

- [x] 2.1 Before any edit, run `code-block-views.spec.ts`, `code-block-codemirror.spec.ts`, `code-block-native-interactions.spec.ts`, `code-block-selection.spec.ts`, `code-block-demos.spec.ts` and `codeblock.spec.ts` against a doctored www instance as the pre-edit baseline. Add `CodeBlockAddon`, `CodeBlockComponent` and the `addon` prop to `CodeBlockElement` and `CodeBlockContainer` in `code-block.tsx`; the container merges `addon.languageOptions` after its own list, deduped by value, labels from the merged list, renders `addon.toolbar` in its toolbar row and wraps its body with `addon.wrapSource`. `createCodeBlockPlugin` takes a `CodeBlockComponent`. `CodeBlockCodeMirrorElement` forwards `addon`. Proof: the same six specs pass after the edit on a restarted server, each log through `proof.mjs` with `PLAYWRIGHT_BASE_URL` named, and the www typecheck passes. Result: the specs pass where base passes, and every link of the www typecheck passes apart from errors HEAD reports line for line. The 10,000-line native typing case times out on this tree with or without the element change, 3 of 3 runs each way (`docs/plans/artifacts/2026-10-15-drawing-review/control-10k/`), and suggested task `t_b9c823c5` owns the timeout.
- [ ] 2.2 Write `code-block-diagram.tsx` per Design: `DiagramRenderer`, `withDiagrams`, the view rule that stores only an explicit pick, the boundary, the toggle, Export PNG, alt text, the error and loading states, the source on a read-only failure, the IME and Picture-with-caret rules, and renders near the viewport after the editor commits and goes idle, never in Code view, at most one in flight per block with only the latest source waiting. Proof: steps 2.5 and 2.6. Step 2.5's rows pass; the scheduling half of this proof waits on step 2.6, so this step stays open with it.
- [x] 2.3 Write the renderer items: `code-block-diagram-mermaid.ts` (`mermaidRenderer`, dynamic `import('mermaid')`, a unique id per render, no `initialize` call, a queued render skipped when its signal aborts), `code-block-diagram-graphviz.ts` (`graphvizRenderer`, languages `graphviz` and `dot`, a new Viz instance for every render), `code-block-diagram-flowchart.ts` (`flowchartRenderer`, language `flowchart`, its temporary container removed in `finally`) and `code-block-diagram-plantuml.ts` (`createPlantUmlRenderer({ server })`, languages `plantuml` and `puml`, `new URL(server)` checked when built, `fetch` with the signal, a non-OK response rejects). Add the four libraries, `@types/viz.js` and `@types/plantuml-encoder` to `apps/www/package.json` and install. Proof: a run-directory copy of `probe-mermaid-config.ts` against `mermaidRenderer` reads `dark` after the first render, beside the base log that reads `default`; a `code-block-diagram-graphviz.spec.ts` case on the real `viz.js`, with no module mock, that starts an invalid and a valid render together and sees the invalid one fail and the valid one draw, red against a renderer that shares one instance and replaces it after a failure, and green on the change; a `code-block-diagram-plantuml.spec.ts` case that, with a stubbed `fetch`, sees one request to `<server>/svg/<encoded source>` and none to any other host.
- [x] 2.4 Register `code-block-diagram` and the four renderer items in `registry-features.ts` with no authored runtime dependencies; the Graphviz and PlantUML items author `@types/viz.js` and `@types/plantuml-encoder` as dev dependencies, because the scanner derives runtime imports only. Register `code-block-diagram-demo` with `values/code-block-diagram-value.tsx` (one Mermaid, one Graphviz, one Flowchart, one PlantUML block and one ordinary code block) in `registry-examples.ts`; the demo installs Mermaid, Graphviz and Flowchart only, so its PlantUML block shows source, as the docs teach. Proof: `pnpm --filter www build:registry`, then a read-back log of the generated metadata showing `code-block` with no engine, each renderer item with exactly its own engine and the two type packages, beside the base control's `code-drawing` item that lists all four engines.
- [x] 2.5 Write `apps/www/tests/browser/code-block-diagram.spec.ts` on `/blocks/code-block-diagram-demo`, replacing `code-drawing-controls.spec.ts`. Load `verify`, and read its editor-proof reference and `.agents/pstack/rules/browser.md`, first. Code and Both rows: the Mermaid block shows its picture in Both; Code stays Code through focus, typing and an emptied source, with zero renderer calls; Export PNG writes a non-empty PNG for one engine per browser; every view switch leaves the value unchanged. Picture rows: ArrowDown from the paragraph above mounts the source with the caret on its first line, and ArrowDown out hides it again; ArrowUp from the paragraph below lands on its last line; Shift+ArrowDown and Shift+ArrowUp extend across it with the exact model range, and the next plain vertical move stays native; a click on the picture mounts the source with the caret inside, and typing then edits it; choosing Picture with the caret inside clears the selection and hides the source; select-all and copy across it put the source on the native clipboard; block deletion removes it; read-only shows the picture, and the source when the render fails; with a Chromium CDP composition open in the source, a Picture pick issued by a dispatched click on the toggle, which moves no focus and stands in for any hide request during a composition, leaves the composition open, the source mounted and the selection in place; once the composition commits, the composed text is in the model, the selection clears and the source hides. CodeMirror rows: arrow entry and exit, copy, read-only and the same composition row. Proof: Chromium five warm runs without retries, then Firefox and WebKit once each, each through `proof.mjs` with `PLAYWRIGHT_BASE_URL` named; with the composition guard removed, in a `proof-worktree.mjs --install` worktree serving www, the composition row fails on both variants; the composition rows claim only end-of-text CDP composition. Result: every Code and Both row, with the typing redraw row added, passes five warm Chromium runs, Firefox and WebKit. Firefox skips the entry row, because it lands ArrowDown at the end of any multi-line code block at base too (`t_8b029a28`). The Picture and composition rows went with the quarantined view.
- [ ] 2.6 Pre-acceptance probe through `benchmark`, on the production path built in 2.2, with every line frozen on the baseline run before any target run is read and host load recorded beside each run. Every latency line is the paired ratio of trusted input to next paint from `.agents/rules/benchmark/scripts/paired-timing.mjs`, with its clock read from the `beforeinput` event's `timeStamp` in a window capture listener, so time an input waits behind a render counts. This step fixes each ratio budget before the baseline run, and each cohort has a same-code arm and a planted arm on the measured path. Input to model commit is logged as a diagnostic, because the wrapper runs after the model commit. Operation A1, typing in an ordinary code block in documents of 1, 50 and 200 code blocks, the wrapped element against the plain one: renders of other blocks per keystroke equal the baseline's, and the ratio stays at or under 1.10, with a planted 2 ms busy-wait in the wrapper's render that the line must reject. Operation A2, the same typing in documents of 50 and 200 Mermaid blocks split between Picture and Both, or all Both once Picture is quarantined, the wrapped element against the plain one on the same documents: renderer calls and React commits of untouched diagram blocks per keystroke stay at zero, and the ratio stays at or under 1.10, with a planted 0.05 ms busy-wait in every diagram block's selection subscription that the line must reject. Operation B, opening documents of 20 and 100 Mermaid blocks: every block in the viewport shows its picture within a deadline frozen from the baseline's own time, renderer calls by then stay at or under the blocks near the viewport plus 2 (the baseline, the drawing demo, renders all N), and CDP `TaskDuration` stays at or under the baseline's. Operation C, 20 keystrokes 120 ms apart in a 40-node Mermaid block, the target in Both against the incumbent drawing in Both on the same source, with the target in Code as a diagnostic arm: the ratio stays at or under 1.10, with a planted arm that renders the diagram synchronously in the commit effect instead of at idle; the renders started in each gap are logged and at most one is in flight. A second C cohort slows the renderer by a planted 300 ms, so each keystroke lands while a render is in flight: the final picture matches the final source within the frozen deadline, and a planted renderer that ignores the latest-source rule must fail it. Proof: the probe's attempt-indexed logs under `docs/plans/artifacts/2026-10-15-drawing-review/perf/` and a `benchmark-checklist` pass before any `verified` row. The count lines, the open line's renderer calls and the overlap line's latest-source rule pass. The open and overlap lines' timing parts ran at load 57 to 85, and the typing lines never ran on a quiet host, so all of them are inconclusive (`docs/plans/artifacts/2026-10-15-drawing-review/perf/paired-a1-1-q5-a1.log`, `docs/plans/artifacts/2026-10-15-drawing-review/perf/open-judge-a4-a1.log`). Render scheduling's acceptance waits on them, so this step stays open until suggested task `t_e0e8d398` times them. The Time budget rule says this of a probe a decision waits on, and the Defaults row "Typing timings that need a quiet machine" records it.

### Phase 3. Cut the drawing block, upgrade saved drawings and teach diagrams

Start it only after Phase 2 is kept, with Code working and a working picture in Both at least, so the cut never ships without a working preview. Keep it when the migration specs, Markdown round trips, regenerated outputs, docs checks and every `pnpm check` step the edits reach pass; revert the phase as one unit otherwise.

- [x] 3.1 Run `pstack:blast-radius` on the final cut list, including open plans that cite the removed surfaces. Proof: a `build` row listing serialized documents, registry copies, docs, generated output and open plans.
- [x] 3.2 Change `v53-manifest.internal.ts` to `{ identity: 'code_drawing', kind: 'element-structural', owner: 'codeBlock' }`. In the profile stage, leave `code_drawing` unrenamed instead of mapping it to the code-block type, the way `code_line` maps to the intermediate `codeLine`. Convert it in the code-block stage per Design graft 6, which keeps a caret inside it at offset 0 of the new text, only when the target schema does not declare a `code_drawing` element itself, as the profile's existing check does. Delete the AST stage's drawing branch and helpers. Add `migratePlateV54CodeBlocks.spec.ts` cases: a v53 drawing becomes a Mermaid code block with its source and keeps a caret inside it and a range across its neighbors; a drawing with no `data` becomes an empty Mermaid code block; a drawing whose `code` and `drawingType` are `null` becomes an empty Mermaid code block; a `code` of `42` becomes the source `42`, and `["graph TD; A-->B"]` becomes `graph TD; A-->B`; a `drawingType` of `PlantUml` becomes `plantuml` and an unusual label its lowercased self. Keep, as a must-pass control, a case where an app schema that declares its own `code_drawing` text block keeps it unchanged. Drop the drawing cases from `migratePlateV54Ast.spec.ts`. Proof: the new conversion cases fail at base through `proof-worktree.mjs --with` and pass on the change; `mutate.mjs` with the converter's schema-ownership check removed fails the control; `probe-selection-real.ts` without the drawing plugin maps all three cases. Step 3.8 later moved the conversion into the inputs stage.
- [x] 3.8 Through `pstack:architect` on round 1 of Phase 3's diff panel (`docs/plans/artifacts/2026-10-15-drawing-review/architect-d4/design.md`), convert a v53 drawing in the inputs stage into the target's code-block type, mapping every point inside it to the start of its source, and delete the code-block stage's converter and the profile stage's `code_drawing` skip. A drawing with no saved `code` takes its own text. One helper in `migratePlateV54Suggestions.internal.ts` builds the text that replaces a drawing's or a legacy code block's texts and carries the insertion or deletion they all share. It drops formatting suggestions with the formatting, which code text never keeps, and refuses any other review state. A drawing with saved code takes its own insertion or deletion instead, because v53 never showed its texts. A suggested change to a drawing's `data` refuses the upgrade. Add `migratePlateV54CodeBlocks.spec.ts` cases: a turned-into drawing keeps its text and maps a caret in any of its texts to the start of its source; a caret inside a numbered drawing in a named root lands at the start of its source; suggested drawings and suggested code blocks stay out of the projection that rejects them; a format suggestion across a paragraph and a legacy code block upgrades, with the code text unmarked; a suggestion on hidden drawing text stays off the saved code; the upgrade refuses inserted text in unmarked lines, a drawing whose texts differ in their suggestions and a suggested change to a drawing's `data`; a numbered drawing upgrades like a numbered code block. Proof: round 1's cases fail on frozen `1bbb477776` and round 2's on frozen `adc8d67198`, and every case passes on the change; `mutate.mjs` reverts each piece of the fix and fails its case; and the seats' reproductions pass. Result: round 1's cases fail on `1bbb477776` and round 2's on `adc8d67198`, all 119 migration specs pass (`d5-spec-green-a1.log`), `mutate.mjs` catches 11 of 11 and then 5 of 5 (`mutate-d4-run-a1.txt`, `mutate-d5-run-a1.txt`), and the seats' probes pass on the final bytes.
- [x] 3.3 Delete `packages/platejs/src/code-drawing/**`, `PLUGINS.codeDrawing`, the `code-drawing` entries and peers in `tooling/entrypoints/entrypoint-dag.mjs`, the hand-written `exports` entries, peers, dev dependencies and peer metadata in `packages/platejs/package.json`, the two entries in `packages/platejs/tsdown.config.mts`, and the drawing lines in `packages/plitejs/src/testing/jsx.ts`, `tooling/oxlint/plate-baseline.json`, `tooling/scripts/check-plate-schema-adoption.mjs`, its test `check-plate-schema-adoption.test.mjs` and `apps/www/scripts/check-registry-source.mts`. Regenerate what the entrypoint generator owns (package scripts, `turbo.json`, `tsconfig.entrypoints` and the workspace path aliases) with `pnpm entrypoint:turbo:generate`, then `pnpm brl` and `pnpm install`. Proof: `pnpm check entrypoint-graph`, `pnpm check lint-baseline`, the platejs and plitejs typechecks, and a `teaching-sweep.mjs` run whose live set is clean apart from the frozen v53 vocabulary in the migration.
- [x] 3.4 Delete the copied `code-drawing.tsx`, `code-drawing-static.tsx`, their specs, `code-drawing-demo.tsx` and its value; drop `BaseCodeDrawingKit` from `plugins-static.ts` and the drawing targets from `indent.tsx` and `indent-static.tsx`; delete the Code Drawing entries from `insert-toolbar-button.tsx` and `slash.tsx` with no replacement; remove the `code-drawing` item and its feature entries from `registry-features.ts` and the demo entries from `registry-examples.ts`; move `playground-demo.tsx` and `playground-value.tsx` to the diagram code block; update `command-menu-dialog.tsx`, `runtime-read-performance.spec.ts`, `markdown.spec.ts`, `plugins-static.spec.ts` and `playground-value.spec.tsx`; drop the drawing case from `markdownConformance.spec.ts`. Proof: `pnpm --filter www build:registry`, the www typecheck, those specs, and `pnpm check` steps the edits reach.
- [x] 3.5 Through `plate-docs`, write a Diagrams section in `content/docs/(plugins)/(elements)/code-block.mdx` and its Chinese twin with the demo, the renderer items and their type packages, PlantUML's server, the views and their limits, the insert-menu entry an app adds, and the source-only static and export output; delete `code-drawing.mdx` and its `content/docs/meta.json` entries; add the redirect to `docs/plite/reference/public-route-map.json`; update `docs/editor-behavior/current-evidence.md`, `2e865a0bc4:docs/research/decisions/registry-ui-ownership.md` and `.agents/rules/verify/references/testing.md`, then `pnpm run prepare`. Proof: the docs source and parity checks and a hand drive of both locales. Result: the docs checks pass (`d4-docs-parity-a1.log`), and the drive covers 104 of 105 cells (`drive-check-a1.log`). `/blocks/installation-next-demo` errors with the server-render crash suggested task `task_f99fb601` owns, in a file this change leaves alone. The Chinese page's contents list mislabels the `#diagrams` entry, as four older Chinese pages do, and suggested task `t_ae89b2fd` owns that.
- [x] 3.6 Through `changeset`, rewrite `.changeset/code-drawing-block-insert.md` to the final v53-to-v54 delta: code drawings become code blocks, `migrateV54` converts saved drawings, and the React requirement line stays; delete `.changeset/plate-graphviz-browser-import.md`; add a registry changelog entry for the new diagram items and the removed drawing items. Phase 1 gets no entry, because `migrateV54` has not shipped. Proof: `pnpm changeset status` and the registry changelog check.
- [x] 3.7 Through `best-api repair`, run `node tooling/scripts/teaching-sweep.mjs codeDrawing renderCodeDrawing CodeDrawingPlugin plantUmlServer` and fix each live hit. Regenerate the API reference manifest in a `proof-worktree.mjs --install` worktree that builds `plitejs` and `platejs` first, and `runtime-entrypoint-proof.generated.ts` through its generator. Proof: the sweep log with no live hit and `pnpm --filter www api-reference --check`.

## Proof

Each step's proof is named on its box. The close adds the hand drive across every page `hand-drive.mjs scope` lists, the step 2.6 rerun on the final bytes, the diff panel and the decision-trail review.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where diagrams live | In code blocks marked with a diagram language (look) | Keep a separate diagram block that only stores its text; keep everything as it is | separate block; keep | big |
| Remove the old diagram block | Delete it now, with saved drawings upgraded (look) | Keep it beside code blocks for one more release | keep drawing block | big |
| Who draws the pictures | Your app's copied code, which picks the drawing libraries and any PlantUML server | Plate draws them, as today | plate renders | big |
| What readers see | Code and picture together, while editing and read-only, since the picture-only view failed its checks; each reader can switch to code only, and the switch is not saved (look) | Save each block's choice in the document | save view | big |
| Diagram menu entry | Left out of the shared menus; the docs show the one entry an app that draws diagrams adds | Show it wherever code blocks exist, even when nothing draws diagrams | show diagram menu | small |
| Diagram types in the demo | Mermaid, Graphviz and Flowchart; PlantUML only as an opt-in with your server | Drop Flowchart | drop flowchart | small |
| Review suggestions one code text cannot hold | Stop the upgrade and name the place: a suggestion inside part of a code line, on the line breaks between lines, or on a drawing's saved data. The upgrade drops a suggested format on code text with the format, because code text keeps none. A suggestion on text v53 hid behind a drawing's saved code stays off the code (look) | Upgrade the document and drop those suggestions | drop unholdable suggestions | small |
| Saved drawings with an unusual type or odd values | Keep an odd type as the code block's language, so it shows as plain code until something draws it. Empty fields get v53's defaults, other odd values become text the way v53 showed them, and no drawing blocks the upgrade | Stop the upgrade on values v53's own code never wrote; turn unusual types into Mermaid | refuse odd drawings; guess mermaid | small |
| If the picture-only view fails its checks | Ship Code and Both, drop picture-only, and name the loss on this page (look) | Hold the whole preview until picture-only passes | hold preview | small |
| Phase 3 while the typing timings wait | Build Phase 3 now, on your "continue", while step 2.6's typing timings wait for a quiet host; a clear miss on those timings still sends the design to a new design round, and Phase 3 work it touches gets redone | Hold Phase 3 until the timings are clear | hold phase 3 | small |
| Typing timings that need a quiet machine | Hand them to suggested task t_e0e8d398, which times a frozen tree whose diagram code is byte for byte this one's, once the machine is quiet. Step 2.6 stays open until then, and this run claims only the count lines, the open line's renderer calls and the overlap line's latest-source rule it measured. A clear miss in that task still sends the design to a new design round (look) | Keep this run waiting until the machine stays quiet | time typing now | small |
| How the speed check counts drawings when a page opens | Count the blocks near the screen when the editor first appears. The pictures then make blocks taller and push some out, which the frozen count missed (look) | Count them once the pictures show, which fails the check and sends drawing scheduling back to design | architect open renders | small |
| The saved-caret bug near old code blocks | Fix it in this run, first | Fix it separately later | separate caret fix | small |
| Typing a Markdown fence with a diagram name | A follow-up, since it changes typing for every language | Build it here | fence language now | small |
| This plan's page | A new page at https://claude.ai/artifact/6WdMHkLGCrdyZHK3qChH48, because the old one at https://claude.ai/artifact/RYXL9of1vA3gwMbXnMtvFc no longer opens | Keep no published page; the page stays a local file | drop drawing page | detail |
| Where the docs go | A Diagrams section of the code block page, and the old page redirects | Its own page | own page | detail |
| Next step | Build after the plan review | Stop at the plan | stop at plan | detail |

## Open work

- Step 2.6's typing timings (lines A1, A2 and C) never ran on a quiet machine, and the timing parts of its open and overlap lines ran at load 57 to 85. The last attempt ran at a one-minute load of 28.33 against the limit of 9 (`docs/plans/artifacts/2026-10-15-drawing-review/perf/paired-a1-1-q5-a1.log`). Step 2.6 and render scheduling's acceptance stay open until then. owner: the owner, through suggested task `t_e0e8d398`, "Time diagram code-block typing on a quiet host". stop: that task lands its verdict or the owner drops it.
- Typing a fence with a language and pressing Enter creates a plain code block today, because the input rule matches only the bare fence (`createInputRules.ts:284`, `CodeBlockRules.ts:25`). owner: the owner, through suggested task `t_ab6fe376`, "Decide whether a typed fence keeps its language". stop: a plan for language-bearing fences lands or the owner drops the task. Tracked in `docs/plans/topics/drawing.md` Open work at the fold.
- The upgrade's profile and AST stages still map a saved caret through their own diffs, so a caret beside a legacy media caption or between two legacy Toggles can move to offset 0 (`probe-selection-caption-a1.log`), and a caret inside a code block or drawing that a legacy Toggle groups under it moves to the end of the block before the Toggle (`docs/plans/artifacts/2026-10-15-drawing-review/probe-toggle-d5-reviewed-a4.log`). owner: the owner, through suggested task `t_02081242`, "Map saved carets through migrateV54's profile and AST stages". stop: that task lands or the owner drops it. Tracked in `docs/plans/topics/drawing.md` Open work at the fold.
- The playground template still installs the legacy drawing package. owner: the CI template sync (`.github/workflows/sync-templates.yml`). stop: the next template sync after this lands. Tracked in `docs/plans/topics/drawing.md` Open work at the fold.
- The picture-only view waits for collapsed ArrowUp and ArrowDown to reveal a hidden content boundary. owner: the owner, through suggested task `t_228be4ba`, "Let a collapsed ArrowUp or ArrowDown reveal a hidden content boundary". stop: that task restores the view or the owner drops it. Tracked in `docs/plans/topics/drawing.md` Open work at the fold.
- Arrow keys do not enter a CodeMirror code block from the paragraphs around it, with or without diagrams. owner: the owner, through suggested task `t_a5661f4b`, "Let arrow keys enter a CodeMirror code block from the paragraphs around it". stop: that task lands or the owner drops it. Tracked in `docs/plans/topics/drawing.md` Open work at the fold.
- In Firefox, ArrowDown from a paragraph lands at the end of the multi-line code block below it, so the diagram spec's entry row skips Firefox. owner: the owner, through suggested task `t_8b029a28`, "Make ArrowDown from a paragraph enter a code block on its first line in Firefox". stop: that task lands and drops the skip, or the owner drops the task. Tracked in `docs/plans/topics/drawing.md` Open work at the fold.
- A copied element cannot claim the DOM changes its own state makes beside a text block's text, so the diagram's picture area stays mounted and hides. owner: the owner, through suggested task `t_83b43c4a`, "Decide how a copied element changes its own chrome beside a text block's text". stop: that decision lands or the owner drops the task. Tracked in `docs/plans/topics/drawing.md` Open work at the fold.
- The Chinese code block page's contents list shows `图表 [#diagrams]` and links to `#图表-diagrams`, which no element has, because `apps/www/src/lib/toc.ts` builds the list from the raw heading text; four older Chinese pages show the same. owner: the owner, through suggested task `t_ae89b2fd`, "Make the docs page contents honor a heading's [#id]". stop: that task lands or the owner drops it.
- Switching a block's language to a diagram language through the picker remounts the block, and on the CodeMirror variant focus drops to the page body (`docs/plans/artifacts/2026-10-15-drawing-review/panel-d1/probe-language-switch-a1.log`). owner: the owner, through suggested task `t_805fc215`, "Keep a code block mounted when its language switches to a diagram language". stop: that task lands or the owner drops it. Tracked in `docs/plans/topics/drawing.md` Open work at the fold.
- The renderer items publish their engines without a version range, where the deleted drawing item carried them through its package peers. owner: the owner, through suggested task `t_b0f60c45`, "Pin engine versions on the copied diagram renderer items". stop: that task lands or the owner drops it. Tracked in `docs/plans/topics/drawing.md` Open work at the fold.
- A Mermaid picture scales to fit the column and its PNG takes the browser's default size, as the drawing block's did, because the diff panel took the Mermaid sizing out of the build (`docs/plans/artifacts/2026-10-15-drawing-review/panel-d3/probe-mermaid-sizes-a1.log`). owner: the owner, through suggested task `t_f7cbb3b1`, "Size a Mermaid picture and its PNG from what Mermaid draws". stop: that task lands or the owner drops it. Tracked in `docs/plans/topics/drawing.md` Open work at the fold.
- On `83f6e5dde0`, at base too, the platejs build refuses a Plite name in `external-text.ts`, and the API reference check stops on `EditorDirectCommandDispatch`. So no www production build ran on the landing bytes, and no check confirmed the API reference manifest this run edited by hand. owner: the owner, through suggested task `t_54844d26`, "Make the package suites pass at HEAD". stop: that task lands, then `pnpm build:www:ci` and `pnpm --filter www api-reference:check` pass on the landed tree.
- The 10,000-line native typing case times out on this tree with or without step 2.1's change (`docs/plans/artifacts/2026-10-15-drawing-review/control-10k/`). owner: the owner, through suggested task `t_b9c823c5`, "Find why the 10,000-line native code-block typing case times out". stop: that task lands a fix, or shows the case fails the same way on a clean base.

## Close

Reversals and deviations come first.

- Reversal: this run ticked step 2.6 and logged it accepted while its typing lines were inconclusive (decision row 122). Round 2 of Phase 3's diff panel showed that the Time budget rule keeps open a measurement a decision waits on. The step is open again, render scheduling's acceptance waits on it, and the plan stays partial until suggested task `t_e0e8d398` times typing, the open line and the overlap line on a quiet host. Step 2.2, whose proof includes step 2.6, is open again too.
- Reversal: step 3.2 converted a v53 drawing in the code-block stage. Round 1 of Phase 3's diff panel showed that this skipped the profile and AST stages' property upgrades, threw on a caret inside a drawing that holds text, and dropped review marks. Step 3.8 converts the drawing in the inputs stage instead (`docs/plans/artifacts/2026-10-15-drawing-review/architect-d4/design.md`).
- Deviation: merged code text follows one review-mark rule. It drops format suggestions along with the text properties it already drops, keeps the insertion or deletion that every replaced node shares, and refuses any other mix. A drawing's saved code takes the drawing's own insertion or deletion. A format suggestion on a drawing's data refuses the upgrade and names the drawing's location.
- Deviation: the owner committed `83f6e5dde0` on `next` after this worktree's base `e184158398`, and the landing check refused nine generated files. The run moved the worktree to `83f6e5dde0` with this diff and regenerated the turbo graph and the registry output there. On `83f6e5dde0` the platejs build stops on a Plite name in `external-text.ts` and the API reference script stops on `EditorDirectCommandDispatch`, so the run removed the manifest's one drawing line, the `codeDrawing` key, by hand instead of regenerating it.
- Limit: a saved caret inside a code block or drawing that a legacy Toggle groups under it moves to the end of the block before the Toggle, because the profile and AST stages map points through their own diffs (`docs/plans/artifacts/2026-10-15-drawing-review/probe-toggle-d5-reviewed-a4.log`). Suggested task `t_02081242` owns it.
- Reversal: the Picture view is quarantined, as Phase 2's rule and the "If the picture-only view fails its checks" default say. A collapsed ArrowDown or ArrowUp skipped a picture-only diagram on both variants (`docs/plans/artifacts/2026-10-15-drawing-review/picture-view/p2-5-first-a1.log`). Editing offers Code and Both, read-only shows Both, and the Picture version is saved in the run directory's `picture-view/` for suggested task `t_228be4ba`.
- Deviation: the picture area stays mounted and toggles `hidden`, because the editor restored the node when the wrapper unmounted it (`docs/plans/artifacts/2026-10-15-drawing-review/p2-5-both-a1.log`). Suggested task `t_83b43c4a` owns the choice.
- Deviation: the CodeMirror rows test ArrowDown out of the source but not arrow entry, because arrow keys do not enter CodeMirror from the paragraphs around it on this tree's plain CodeMirror demo either (`docs/plans/artifacts/2026-10-15-drawing-review/probe-cm-arrow-down-a1.log`). Suggested task `t_a5661f4b` owns it.
- Fix found in the build: typing in Both never redrew the picture, on either variant. A text edit does not re-render its element, so the wrapper's `NodeApi.string(element)` kept the first source. The wrapper now reads its source through `useEditorSelector`, and its `shouldUpdate` re-reads it only on commits that change its own block, as `caption.tsx` does. A first version passed `nodeKey`, which `platejs/react`'s selector drops, so every diagram re-read its source on every commit; the www typecheck caught it, and step 2.6's A2 rerun measures the gated version. The spec's new typing row failed on both variants before the fix and passes after it (`docs/plans/artifacts/2026-10-15-drawing-review/p2-5-redraw-red-a1.log`, `p2-5-redraw-green-a1.log`).
- Deviation: step 2.6's A1 and C planted arms busy-wait in a subscription to their block's live source instead of in the wrapper's render, and a React `Profiler` around each block counts its commits. No element re-renders on a text edit, so a render-time plant never ran while typing. React Compiler memoizes wrapper children, so a counter inside the wrapper missed the A2 plant (`docs/plans/artifacts/2026-10-15-drawing-review/perf/frozen.md`).
- Hold: step 2.6's typing ratios are inconclusive after two runs, because the host's load reached 37.5 and then 74.8 against a limit of 9 (`docs/plans/artifacts/2026-10-15-drawing-review/perf/paired-a1.log`, `paired-a2-a1.log`). The cohorts now rerun one at a time, each in a quiet window of about five minutes. Its count lines pass. Typing does no extra work in other blocks, and untouched diagrams neither render nor commit. On the owner's "continue", Phase 3 builds while the cohorts wait for a quiet host.
- Deviation: step 2.6's open line counts the blocks near the screen when the editor first appears, not when the pictures show. The pictures make blocks taller and push three of five out before the frozen count was read (`perf/open-near-a1.log`). The Defaults row "How the speed check counts drawings when a page opens" reverses it.
- Limit: a diagram redraws on every pause in typing. One redraw of a 40-node Mermaid block costs about 45 ms of main thread, so typing costs 59 ms of task time per keystroke, against 17 ms for the old drawing, which redrew once 500 ms after typing stopped (`perf/measurements-a1.json`, cohort c). The redraws run between keystrokes here, but on a slower machine keystrokes could wait behind them. Every step 2.6 number comes from the Next dev server's React development build.
- Limit: in Firefox, ArrowDown from the paragraph above lands at the end of a multi-line code block, on `next`'s plain code-block demo too (`docs/plans/artifacts/2026-10-15-drawing-review/probe-ff-entry/base-demo-firefox-a1.log`), so the entry row skips Firefox. Suggested task `t_8b029a28` owns it. Firefox runs here with `MOZ_APP_DATA` set, as `t_8f811f2d`'s launch fix does.
- Deviation: step 2.5's browser spec drives a proof-only route, `/dev/code-block-diagram`, that serves both variants, read-only, a chosen language and source, and a render counter, because the demo has one variant and no read-only switch.
- Fix in the run's tooling: `hand-drive.mjs scope` turned a docs route that names a section into a desktop cell no visit could cover. It now drops the `#section` (decision row 136).
- Environment: this worktree's bun binary was a placeholder, because bun's postinstall never ran in its install. Every check that spawns bun failed in seconds until the run ran that postinstall.

Attention from the decision-trail review, reviewed by gpt-6.1-sol @xhigh against the transcript through line 20684 (`docs/plans/artifacts/2026-10-15-drawing-review/trail-review/answer-sol.txt`). It found one critical finding, six warnings and one nit, each answered here:

- Critical. Step 2.2 stayed done after step 2.6 reopened, although step 2.6 is part of its proof. Step 2.2 is open again, and the counts below list it as partial.
- Warning. The open and overlap lines' timing parts ran on a loaded host. They are inconclusive now, and suggested task `t_e0e8d398` times them beside the typing lines.
- Warning. Four patch paths and the run directory had no started row before their first write. A late started row names them, and a deviation row records the broken order.
- Warning. Before landing, the run wrote a chips offer and copies of its run directory into the main checkout. A deviation row records it.
- Warning. The 10,000-line native typing case timed out while typing on this diff, and both base attempts stopped earlier, so they were no control. A control with `code-block.tsx` at base bytes times out the same way in 3 of 3 runs, so step 2.1's element change is not the cause. Suggested task `t_b9c823c5` owns the timeout.
- Warning. The hand-drive helper fix had no writing passes. Both passes ran on it, and the helper tests pass after them.
- Warning. No byte comparison backed "regenerates the registry output byte for byte". The build line under Proof and its limits now claims only what ran.
- Nit. The Status line said the patch had landed before it applied. The line now says landed only in the patch, so it is true once the patch applies.

The patch `docs/plans/artifacts/chips/task_a1ae2979.patch` lands uncommitted in the main checkout's working tree, with three phases.

- Phase 1: the v54 upgrade keeps a saved caret near the code blocks it converts.
- Phase 2: copied code blocks draw Mermaid, Graphviz, Flowchart and PlantUML diagrams through `withDiagrams` and four renderer items, with a Code and Both switch, Export PNG and a demo.
- Phase 3: the drawing block, its package entry, peers and copies are gone. The v54 upgrade turns saved v53 drawings into code blocks. The code-block docs teach diagrams in English and Chinese, and the changeset and registry changelog say so.

Proof and its limits:

- Every `packages/platejs/src/migrations` spec, the PlantUML, Graphviz and static www specs, and the hand-drive helper tests pass on `83f6e5dde0` plus this diff (`docs/plans/artifacts/2026-10-15-drawing-review/v2-acceptance-specs-a1.log`). Mutation runs caught 11 of 11 round 1 fixes and 5 of 5 round 2 fixes. Saved documents ran through the upgrade in Bun only; no run upgraded a saved app document in a browser.
- The diagram spec's 21 rows pass five warm Chromium runs on `83f6e5dde0` plus this diff. Firefox passes 18 and skips its entry row (suggested task `t_8b029a28`) and the two Chromium-only clipboard rows, and WebKit passes 19 and skips the clipboard rows. All ran against the Next dev server (`docs/plans/artifacts/2026-10-15-drawing-review/v2-browser-chromium-1-a1.log` through `v2-browser-webkit-a1.log`).
- The hand drive covered 104 of 105 cells on the dev server at 1280 px in light. Pictures drew live on four pages; on the other diagram pages, only the spec checks the picture. `/blocks/installation-next-demo` errors as it does at base, and suggested task `task_f99fb601` owns it.
- Step 2.6's count lines, the open line's renderer calls and the overlap line's latest-source rule pass on the Next dev server's development build. The open and overlap lines' timing parts ran at load 57 to 85 and stay inconclusive, and the typing lines are open.
- On `83f6e5dde0` plus this diff, every failing `pnpm check` step and www link fails the same way at base `83f6e5dde0` or `e184158398` (`docs/plans/artifacts/2026-10-15-drawing-review/v2-check-steps-a1.log` against `v2-base-checks-a1.log`, `v2-base-test-a1.log`, `v2-base-www-a1.log` and `v2-base-apiref-a1.log`). Suggested tasks `t_54844d26`, `t_ed79a18b`, `t_3ea68f2e` and `task_b7aaefbb` own those failures. One slow recording-laws case failed once, then passed three reruns on each side, and suggested task `t_60fb490c` owns that flake. The registry check reports the regenerated output fresh.
- The www production build stops at `83f6e5dde0`'s platejs build, which refuses a Plite name in `external-text.ts` at base too, so no production build ran on the landing bytes. On `e184158398` the same diff built its 1,436 pages and left the git status and diff statistics unchanged; no run compared the registry output byte for byte.
- PlantUML ran only against a local stub server.

Of the 15 steps, 13 are done, 1 is partial (step 2.2, whose proof waits on step 2.6) and 1 is open (step 2.6); none is skipped or blocked.

Every item under Open work names its owner and stop. Step 2.6's typing timings, which suggested task `t_e0e8d398` owns, keep this plan partial.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

### Requirements

- Author diagram source, see it drawn, pick what shows, and export the picture as an image. Each is a current job of the copied element and the docs page, `content/docs/(plugins)/(elements)/code-drawing.mdx`.
- Persist and exchange diagram source in a format other tools read. A fenced code block with a language is that format across every editor and product the comparison read.
- Renderer engines, their settings and any remote server are application trust and product policy. Do not hide a backend in a base item ([plate.md](../vision/plate.md), the provider paragraph), and keep optional SDKs and backends out of generic editor components (the drag-and-drop paragraph).
- Syntax readers do not mutate a caller's highlighter; copied kits register their resources ([plate.md](../vision/plate.md), the code-block paragraph). A renderer that resets the app's Mermaid settings breaks the same law.
- Packages ship neutral defaults; opinionated behavior lives in copied registry source ([VISION.md](../../VISION.md), Plate essentials).
- One way per common operation and no parallel paths ([common.md](../vision/common.md), Taste). Hard cuts beat compatibility shims during beta ([VISION.md](../../VISION.md), Invariants).
- A feature page lists only the optional peers its taught entrypoints need ([plate.md](../vision/plate.md), docs paragraph).
- Saved v53 drawings must still open after the v54 upgrade (serialized-data law).

### Current source

- `BaseCodeDrawingPlugin` declares a `void: 'block'` element with `code` (string), `language` (flowchart, graphviz, mermaid or plantuml) and `view` (code, preview or split), and maps it to the Markdown tag named by its type. `renderers.ts` dynamically imports `plantuml-encoder`, `viz.js`, `flowchart.js` or `mermaid`, calls `mermaid.initialize({ startOnLoad: false })` once, and requires a PlantUML server URL.
- `tooling/entrypoints/entrypoint-dag.mjs` classifies `code-drawing` as a client entrypoint with those four peer dependencies, and `packages/platejs/package.json` lists them as optional peers. The server-safe static kit, `plugins-static.ts`, imports `BaseCodeDrawingKit` from it, and registry-ui-ownership.md (`2e865a0bc4:docs/research/decisions/registry-ui-ownership.md`) records that the static preset carries code drawing for AI serialization.
- The copied `code-drawing.tsx` defaults `plantUmlServer` to `https://www.plantuml.com/plantuml`, writes `editor.update.nodes.set({ code })` on every textarea change, and renders whenever the view is not `code`, read-only included. The copied static element prints the source and never a picture.
- `BaseCodeBlockPlugin` holds one newline-bearing text child and an optional `language` string, maps to a Markdown `code` node with `lang` and to `pre > code` with `data-language`, and exposes `insert` and `upsert` that take `{ language }`. The copied `code-block.tsx` already offers Mermaid in its language picker, and Flow as a code language.
- `migratePlateV54Ast.internal.ts` lifts a v53 `code_drawing` element's `data` into the flat properties, and `packages/plitejs/src/testing/jsx.ts` declares a code-drawing hyperscript tag, a Plate feature inside Plite's test helpers.
- Since the October 4 audit, the members changed only by the copied element's selection ring, the single Graphviz engine name and dependency bumps in `apps/www/package.json`. The doctrine moved too: VISION.md added the neutral-defaults line and the hard-cut invariant, and common.md added one way per operation. Each tightens the audit's case, and none answers it differently.

### Runtime proof

`docs/plans/artifacts/2026-10-15-drawing-review/probe-markdown-a3.log` ran Plate's Markdown API from source with `BaseCodeDrawingPlugin` installed beside the code block, exit 0:

- A Mermaid fence parses to `{ type: 'codeBlock', language: 'mermaid' }` with the source as its text, never to a drawing.
- A drawing with the same source serializes to `<codeDrawing code="graph TD;&#10;  A-->B" language="mermaid" view="split" />`, and its text reads as `""`.
- A code block with the same source serializes to a Mermaid fence, and its text is the source.

`docs/plans/artifacts/2026-10-15-drawing-review/probe-mermaid-config-a2.log` ran `renderCodeDrawing('mermaid', …)` from source under happy-dom with the installed Mermaid 11.12.3, exit 0. The app first set Mermaid's theme to `dark`; after Plate's first render the theme read `default`.

The selection probes are listed under Start Gates and Design.

### Lanes

1. **Keep everything. Loses.** It works and is tested, but it keeps a second representation that pasted fences never reach, a Markdown tag no other tool reads, source that reads as empty text, four renderer peers on a client entrypoint the static kit imports, the Mermaid reset and a public PlantUML default.
2. **Strongest deletion: delete diagrams and their preview outright. Loses.** Seeing the picture, picking the view and exporting it are current product jobs in the registry, docs and demos. Every product the comparison read that has diagrams draws them, and dropping the job gains nothing structural over lane 5.
3. **Keep `codeDrawing` headless and move the renderers into copied source. Loses.** It fixes the peers, the Mermaid reset and the hidden backend, which the audit called the minimum. It keeps the second representation, the custom tag and the empty text.
4. **A separate diagram block whose source is real text, as BlockNote does. Loses.** It fixes the empty text, but a second block of language-tagged text duplicates the code block's editing rules and competes with it to decode every Markdown fence. CKEditor 5 keeps the opaque source attribute this lane drops, and it is the only editor read that stores a view.
5. **Merge into the code block. Wins.** The code block already stores the text, the language, the fence and the HTML. Design above answers the four questions the verdict left open: the view is local, a picture-only view hides the source through the coverage boundary, the renderers ship as separate items with PlantUML opt-in, and no published release needs a beta-document conversion.

**Proof limits.** The probes ran Plate's source under Bun and happy-dom, not a browser. The editor comparison is a source read by a Codex reader plus product docs; Notion's view storage is undocumented and Milkdown's removed package was not read. No rendering cost has been measured yet; step 2.6 measures it.

### Dependents

- `distribution`: unaffected beyond one key. It reaches drawing only through `packages/platejs/src/utils/plate-keys.ts` (`packages/platejs/src/utils/index.ts`, `packages/platejs/src/internal/plugin/markdownParagraph.ts` and the utils plugins), and none reads `PLUGINS.codeDrawing`, which the merge deletes.
- `editing`: unaffected for the same reason, through `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts`, `SingleBlockPlugin.ts`, `SingleLinePlugin.ts` and `TrailingBlockPlugin.ts`.
- `persistence`: affected. It imports `packages/platejs/src/migrations/migratePlateV54.ts`, whose inputs stage now turns a saved v53 drawing into a code block, and whose code-block stage keeps a saved caret beside converted code blocks; the migration specs and `probe-selection-real-3-2-a1.log` prove both.
- `react`: unaffected. `packages/platejs/src/react/plugins/paragraph/ParagraphPlugin.tsx` reads `PLUGINS.detailsSummary` from the same key file and never `PLUGINS.codeDrawing`.
- `ui`: affected. `apps/www/src/registry/components/editor/plugins-static.ts` installs `BaseCodeDrawingKit`, and `apps/www/src/registry/components/editor/fixed-toolbar.tsx` renders the insert menu whose Code Drawing item changes. `apps/www/src/registry/components/editor/plugins.ts` does not install the drawing kit.

### History

- This review retains [2026-10-04-drawing-audit](../research/review-records/2026-10-04-drawing-audit.json), because its Pursue and its lanes still hold. It picks the audit's merge lane over its minimum lane, and adds the runtime proof of the fence parse, the custom tag, the empty text and the Mermaid reset.
- This review reopens [2026-09-07-full-plate-ui-extraction-audit](2026-09-07-full-plate-ui-extraction-audit.md), recorded as `2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit`, because it kept conversion in the package with a configurable PlantUML server, which the provider and neutral-default laws now refuse.
- This review retains [2026-08-14-remove-drawing-kits-from-editor-kit](2026-08-14-remove-drawing-kits-from-editor-kit.md): the default editor kit stays without diagrams.
- This review retains [2026-10-13-graphviz-fallback-removal](2026-10-13-graphviz-fallback-removal.md): its single engine name moves with the Graphviz renderer into copied source.
- [2026-07-10-plate-next-code-drawing-combobox-comment-package-reviews](2026-07-10-plate-next-code-drawing-combobox-comment-package-reviews.md) and [2026-03-23-code-drawing-coverage-pass](2026-03-23-code-drawing-coverage-pass.md): historical, superseded by the v54 shape.
