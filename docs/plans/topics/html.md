# HTML export and static rendering

Page: https://claude.ai/artifact/CFQVQVVGsubdWz73SVhR9C

Plate turns a document into styled HTML by rendering it with React, on the server or in the browser, and Word export reuses that HTML. `renderStaticHtml` in `platejs/static` reads the editor's document, applies the chosen suggestion projection, and draws each node with the component its plugin installs, or, when the caller passes `presentation`, with the static plugin of the same name. `exportDocx` in `platejs/docx/export` takes the same option and swaps eight elements for Word-only drawings that keep structure and leave the look to the stylesheet. The app's export toolbar passes its live editor with the registry's static kit as `presentation`, so the static kit draws the file while meaning and settings come from the live editor. The server HTML block, the AI preview and the AI command route build an editor from the static kit itself. Server code creates that editor with the root `createEditor`, React previews create theirs with `useCreateEditor`, and `platejs/static` holds only renderers. The scope's review history prints with `node tooling/scripts/review-ledger.mjs show html`.

## Public API

The export toolbar renders HTML from the live editor's model and draws it with the static kit.

```tsx
// apps/www/src/registry/components/editor/export-toolbar-button.tsx
const result = await renderStaticHtml(model, {
  component: EditorStatic,
  presentation: BaseEditorKit,
  projection,
  props: { style: { padding: '0 calc(50% - 350px)', paddingBottom: '' } },
});
```

The same toolbar exports Word from that model with the same kit.

```tsx
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

The server HTML block creates an editor from the static kit with the root maker and renders it.

```tsx
// apps/www/src/registry/blocks/html-export/page.tsx
import { createEditor } from 'platejs';
import { renderStaticHtml } from 'platejs/static';

const editor = createEditor({
  plugins: HtmlExportKit,
  initialValue: createValue(),
});

const { data: editorHtml } = await renderStaticHtml(editor, {
  component: EditorStatic,
  props: { style: { padding: '0 calc(50% - 350px)', paddingBottom: '' } },
});
```

A client preview creates its editor with the React creation hook.

```tsx
// apps/www/src/registry/components/editor/html-export.tsx
const editor = useCreateEditor({
  plugins: HtmlExportKit,
  initialValue: value,
});
```

A comment body keeps one preview editor per body.

```tsx
// apps/www/src/registry/components/editor/comment.tsx
const initialValue = React.useMemo(() => cloneCommentValue(body), [body]);
const commentEditor = useCreateEditor(
  {
    plugins: BaseBasicMarksKit,
    initialValue,
  },
  [initialValue]
);
```

A presentation drawing reads what it draws from its props. One built in a `configure` callback that calls the callback's context while drawing throws, because the kit compiles detached.

```tsx
// packages/platejs/src/static/renderStaticHtml.presentation.spec.tsx
const { data } = await renderStaticHtml(editor, {
  presentation: [
    BaseBlockquotePlugin.configure({
      slots: {
        afterNodeChildren: ({ element }) => <span data-type={element.type} />,
      },
    }),
  ],
});
```

| Option | Behavior |
| --- | --- |
| `renderStaticHtml` `presentation` | Optional static plugin array. For each plugin name, its element component, mark component (leaf or text placement) and function wrapper slots draw the export, and nothing else of it is read. |
| `exportDocx` `presentation` | The same option, used for the body and every comment body. |
| `renderStaticHtml` `props` | Appearance props only. `editor` and `document` are typed `never`, and a defined value throws a `TypeError`. |
| Diagnostics of both functions | Authored projection and Word losses, plus `missing-static-presentation` for each plugin whose block, mark or function wrapper had no static drawing. Word counts each as lost content, so `lossPolicy: 'reject'`, the default, refuses the file and `'allow'` keeps it with the warning. |

## What other editors do

Every editor read here keeps export drawing apart from the interactive view, and none exports through the interactive view. ProseMirror and BlockNote were read at the commits below. Tiptap and Lexical come from the repository's research pages, which read them at the named commits. Slate was not read.

| Editor | Export drawing | Interactive drawing | What export uses |
| --- | --- | --- | --- |
| ProseMirror (`prosemirror-view@ca4c78e`) | Schema `toDOM`, run by `DOMSerializer` | Node views passed to the view | Clipboard serializes with `DOMSerializer.fromSchema` and never calls a node view (`ProseMirror/prosemirror-view@ca4c78e:src/clipboard.ts:17`, `:60`) |
| Tiptap (`ueberdosis/tiptap@91c51be53c`) | `renderHTML`, which becomes `toDOM` | `addNodeView`, React node views | `getHTML`, `generateHTML` and `@tiptap/static-renderer` use `renderHTML` or explicit node and mark mappings (`docs/research/sources/tiptap/conversion-and-export.md`) |
| Lexical (`facebook/lexical@dd5c41b1`) | `exportDOM`, called with the exported editor | `decorate()` React decorators | `$generateHtmlFromNodes` uses `exportDOM` (`docs/research/sources/lexical/conversion-and-export.md`) |
| BlockNote (`BlockNote@be20d8b`) | `toExternalHTML(block, editor, context)`, falling back to `render` | `render` | External HTML uses `toExternalHTML` (`TypeCellOS/BlockNote@be20d8b:packages/core/src/api/exporters/html/util/serializeBlocksExternalHTML.ts:100`); the Word exporter takes the schema plus per-block mappings (`TypeCellOS/BlockNote@be20d8b:packages/xl-docx-exporter/src/docx/docxExporter.ts:55-87`) |
| Plate | `foo-static.tsx` components in `BaseEditorKit`, passed as `presentation` | `foo.tsx` components in `EditorKit` | The static kit, compiled detached once per array; meaning and settings stay on the live editor |

Plate keeps the two drawings in separate install items, while Tiptap, Lexical and BlockNote put both on one node definition. Like all four, export picks the export drawing for a node by its type, and the node's meaning stays in one place. None compiles a second editor whose state an export drawing closes over; a drawing gets either no editor or the exported editor.

For creating the editor a static render draws with, Lexical and BlockNote ship a separate maker, because their normal editor needs a DOM. `createHeadlessEditor` in `@lexical/headless` replaces the DOM methods with throwing stubs (`facebook/lexical@dd5c41b131:packages/lexical-headless/src/index.ts:17`), and `ServerBlockNoteEditor.create` runs conversions inside a JSDOM shim (`TypeCellOS/BlockNote@1e26f1c5e1:packages/server-util/src/context/ServerBlockNoteEditor.ts:38`). Tiptap and ProseMirror export from the schema with no editor, and Slate ships no static renderer. Plate's root editor runs without React or a DOM, so static and server code use the root `createEditor`, and `platejs/static` adds no maker of its own.

## Layer and owner

| Job | Owner |
| --- | --- |
| Create the editor a static render or a read-only preview draws with | Root `createEditor` from `platejs` on a server; `useCreateEditor` from `platejs/react` in a component |
| Read the document, project suggestions, render, return HTML and diagnostics | `renderStaticHtml` in `platejs/static`, with one presentation binding per render that every view the render creates inherits |
| Pick the component that draws a node | Static dispatch in `platejs/static`. With `presentation`, the static plugin of the same name supplies the element component, both mark placements and the function wrapper slots, also for an element no plugin renders; Word's private map wins for its eight types. The kit compiles once per array, detached, so a drawing that calls its setup callback's context while drawing throws. Values it copied earlier keep the kit's own configuration. An installed `afterNodeChildren` with no usable peer adds the missing diagnostic. Without `presentation`, the editor's own components draw. |
| Word body, comments, review markup and exact source reuse | `exportDocx` in `platejs/docx/export`; its HTML converter takes a list's level from the list's host block indent when the list has none |
| Editing presentation and its kit | Copied registry `foo.tsx` items, composed in `plugins.ts` |
| Static presentation and its kit | Copied registry `foo-static.tsx` items, composed in `plugins-static.ts` as `BaseEditorKit`, which export also receives as `presentation` |
| Export menu, file shell, download and toasts | Copied `export-toolbar-button.tsx` |
| Static content roots | The scoped editor serves render and decoration callbacks. A path carries no root and a view addresses its own root; a static root reader is replaced when the view's authored mode or read-only state changes and reused otherwise ([content-root execution](../2026-09-30-content-root-locations-execution.md)). |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| `createStaticEditor`, `StaticEditor`, `CreateStaticEditorOptions`, `useStaticEditor` | Pure aliases of `createEditor` since 2026-09-15; Vision rules out branded editor variants. Cut by the [html review](../2026-10-13-html-review.md). |
| A zustand store factory on `platejs/static` | No static job. |
| A universal codec, location carrier or new view manager | The content-root defects were view-composition and delivery bugs, not a missing API. |

## Rules

These rules bind this feature alone, so they live here instead of in `docs/vision/`.

- HTML mappings may prepare only their operation-owned inert document before
  matching. Whole-payload admission, source cleanup, RTF access, and
  post-decode repair belong to the browser `DataTransferFormat` lifecycle.
  Generic mapping hooks do not receive host payloads or live editor state.
- One plugin keeps all of its HTML matches in a single mapping, and a mapping's
  target order is membership, not construction intent. A `createsElement`
  mapping decodes bare content into the schema's default block when that block
  is one of its targets and writes its output around the HTML of its other
  targets; on parse, a matched element holding exactly one block its properties
  apply to decodes onto that block, and a text block they cannot apply to gives
  the created block its text. On paste, a throwing or schema-invalid candidate
  is reported through the lifecycle and delegates to the next candidate, while a
  direct parse call throws.

## Main changes

- The export toolbar passes the live model editor with `presentation: BaseEditorKit`, so static dispatch draws the static kit's components while projection, settings and comments come from the live editor.
- One presentation binding per render. Every view the render creates reads it, including named roots and Word comment bodies, and Word's private element override map folds into it. Plugin settings are read when the drawing runs, so a setting changed while an export waits for the renderer can still reach that export.
- With a presentation, static dispatch draws elements, both mark placements and the wrapper slots written as functions (`wrapNode`, `wrapNodeChildren`, `afterNodeChildren`) from the static plugin of the same name, also for an element no plugin renders. It leaves out drawings the installed plugin marks `editOnly`, and slots written as an object with a `match` stay undrawn, as before. In the registry those are drag handles, AI chat and the discussion wrapper, all editing UI.
- `compilePeers` compiles each presentation array once with `withPlateFormatCompilation`, which runs no activate hook and rolls its runtime back. A captured setup context therefore throws "Plate runtime is not installed." while drawing, and a plain value a callback copied out keeps the presentation's own configuration.
- Word's HTML converter passes each host block down its recursive conversion, so a list with no margin takes its nearest host block's indent, and the static list wrapper draws no per-level margin. List numbering state lives on each Word document.
- `CopilotPlugin` sets `editOnly: { on: false }`, so exports with a presentation skip its ghost text without a diagnostic.
- The registry export toolbar catches a thrown HTML or Word export, logs it and shows an error toast.
- `BaseIndentKit` and `BaseListKit` target images like `IndentKit` and `ListKit`, so an editor built from the static kit loads a document with an indented image or an image in a list.
- Rendering reads a read-only document view of the editor, made with `createEditorView(editor, { document })`, so one editor renders many documents without changing its own.
- `6fa1169c5e:packages/platejs/src/static/editor/` and `6fa1169c5e:packages/platejs/src/react/editor/useStaticEditor.ts` are gone. Every editor that draws static output, in package code, apps and tests, comes from root or React `createEditor`, and `platejs/static` no longer re-exports the zustand store or six node prop types.
- The schema adoption audit and the docs code-contract check recognize `useCreateEditor` as a constructor, so migrated preview callers stay audited.

## Open work

- A setting or highlighter change made while an export waits for the renderer reaches that export. Capturing every render dependency needs contracts at the owners, because the code highlighter keeps a shared mutable engine behind a plain object. owner: natamox. stop: a separate plan for export capture, or 2026-11-30.
- Live decoration sources, such as find highlights and active comment marks, run during export. The registry's `EditorKit` installs neither today. owner: natamox. stop: a plan that installs either in an exporting editor, or 2026-11-30.
- A wrapper written as an object with a `match` never draws in a static render. The registry's three are editing UI, but a third-party wrapper that draws content this way is lost without a diagnostic. owner: natamox. stop: the export capture plan, or a third-party report.
- The authored switchover must still redo Word revisions, comment range mapping and the toolbar's projected view, because it deletes the nouns that code calls today. owner: natamox, who adds these three items to the authored plan's Phase 2 step. stop: the authored Phase 2 lands.
- A drawing built in a setup callback draws the presentation's own configuration without an error when the callback copies a plain context value before it returns, and its `ctx.editor` reads return an empty document or throw. owner: natamox. stop: a plan that gives static drawings a typed editor argument, or 2026-11-30.
- A drawing declared as a value that closes over another editor cannot be detected; the JSDoc says so. owner: natamox. stop: a plan that gives static drawings a typed editor argument, or 2026-11-30.
- Without a presentation, the bound path never draws an installed `afterNodeChildren` written as a component object, such as `React.memo`, while the fallback draws it, and the fallback draws `afterNodeChildren` without plugin context. owner: natamox. stop: a report of a lost or wrong slot, or 2026-11-30.
- The registry guard reads drawings through the kit entries, not through the compiled plugins export consults, so a plugin installed only as a dependency is checked by the corpus render alone. owner: natamox. stop: shared policy kits, or 2026-11-30.
- The registry installs `AIPlugin.configure({ component: AILeaf })`, but no shipped code writes the `ai` mark it draws, so the guard's one allowed gap may guard dead code. owner: natamox. stop: the next AI menu review, or 2026-11-30.
- The two kits set shared options by hand, and a test catches drift only for images. owner: natamox. stop: the owner says "policy kits", or a new block joins the live indent or list targets, or 2026-11-30.
- The final-path benchmark's 100-paragraph warm line could not reject its planted slowdown, because one baseline outlier widened the allowance. owner: natamox. stop: the next change to the export perf contract, or 2026-11-30.
- Small cleanups: `paddingBottom: ''` does nothing in the export toolbar and the HTML export block; the comment above `lossPolicy` says the toasts report what was lost when they report only a count; the indent docs page leaves images out of `IndentKit`'s targets; and the pull request panel deferred one warning and six nits in `docs/plans/2026-10-09-html-static-repair-redo.decisions.tsv`. owner: natamox. stop: a cleanup round of the export work lands them, or the owner drops them.
- The Plite browser case "projects rich Plate descriptors to standalone HTML while the fragment envelope preserves exact state" in `apps/plite/tests/plite-browser/donor/examples/plate-schema-descriptors.test.ts` fails at `6fa1169c5e`. The standalone HTML still contains the YouTube embed URL the case expects it to drop (`docs/plans/artifacts/2026-10-12-plite-blur-gate/schema-descriptors-base-a1.log`). owner: zbeyens. stop: the case passes at the head of next, or 2026-11-30.
- One preview editor for a whole comment list. owner: the owner, through a later `verdict html`. stop: a list-level owner for the cards in `discussion.tsx` and `comment-toolbar-button.tsx`, with a context of its own that leaves `useEditor()` on the command editor, passes the cards1 and cards3 cohorts of `docs/plans/artifacts/2026-10-13-html-review/probe/budget.json` on the real list, or the owner drops it.
- Five Chinese docs twins lack whole sections their English pages have (`api/plate`, `feature-kits`, `basic-blocks`, `horizontal-rule`, `troubleshooting`). owner: the owner, through `plate-docs`. stop: each twin carries its English page's sections.
- The speed gate for one `useCreateEditor` editor per comment body stays open. Six final-tree attempts of `docs/plans/artifacts/2026-10-13-html-review/probe/comment-mount-final.probe.tsx` against its frozen L1 line (at most 1.20 times and 0.75 ms more per body) found no cohort conclusively over the line, but each ran with the 1-minute load past 4, so each is inconclusive; a conclusive miss sends the pick back to `architect`. owner: zbeyens. stop: one attempt on a quiet host that is conclusive either way, or a change to how comment previews create their editor, which reruns it.
