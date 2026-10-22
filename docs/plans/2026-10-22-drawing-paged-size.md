---
review_scopes: [drawing]
verdict: stop
review_basis: [2026-10-18-drawing-pele-review]
review_commit: 89a3a795f43b072441fc6947f14c2767c7005f20
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, docs/plans/topics/pagination.md, docs/plans/2026-10-19-plite-feature-specs-intake.md, 'content/docs/(guides)/pagination.mdx', 'content/docs/(plugins)/(elements)/code-block.mdx', packages/plitejs/src/pagination/index.ts, packages/plitejs/src/pagination/react.tsx, apps/www/src/registry/examples/pagination-demo.tsx, apps/www/src/registry/components/editor/code-block-static.tsx]
review_upstreams: ['../pele@458322a5b8abb1ae57ddf127c32017ab9fb14a92']
---

# Drawing: who sizes a diagram on a page

Status: closed: Stop verdict
Topic: drawing
Playbook: verdict

**Stop. A diagram's size in paged layout stays with the app, and static pages keep showing diagram source.** No kit, demo or doc puts a diagram code block in a paged editor, so the proposal would add a size contract to the copied renderer item for a composition nobody ships. Only Mermaid could meet it synchronously, through Pele. Graphviz, flowchart.js and PlantUML would need a second path that reports each size after the picture draws. Page layout would then depend on which pictures have drawn, and the wrapper draws only near the viewport, on mounted pages. Pagination already takes every non-text size from the app's `fragmentation` provider. Pele's synchronous `render` returns a width and height once its diagram type has loaded, so an app that pages Mermaid diagrams can size them in its own provider today. The case for static pictures is the one the 2026-10-18 review already weighed, that Pele needs no browser, and Pele would still draw only Mermaid.

## Brief

### What will change?

Nothing changes in code. Your app still sets how tall a diagram is on a page, like it does for tables and images. Static pages still show the diagram's code. No editor kit puts diagrams on pages yet.

### What could go wrong?

If an app puts diagrams in a paged editor and doesn't set their height, the picture will likely spill into the next block. Nobody has tried it yet. Once a kit puts diagrams on pages, this comes back up.

## Teach

A paged editor works out the pages before it draws them. It measures text on its own, but for anything else, such as a table or an image, the app tells it how tall the block is.

A diagram is a code block with a picture drawn under its source by an add-on. The picture shows up later, once the browser is idle and the block is close to the screen, and how tall it gets depends on the drawing engine. So the page layout can't know its height by itself.

The proposal had the Mermaid add-on measure each diagram up front, the other engines report their size once drawn, and static pages draw pictures too. This review keeps sizes with the app and keeps static pages as source, because no app puts diagrams on pages yet and only Mermaid could measure up front.

## Public API

The proposal adds a size to what each diagram engine provides. This review keeps the before. The after is this review's sketch of the proposal from the intake page's summary, since the spec itself could not be found.

```ts before
// apps/www/src/registry/components/editor/code-block-diagram.tsx
export type DiagramRenderer = Readonly<{
  languages: readonly [string, ...string[]];
  label: string;
  render: (source: string, options: { signal: AbortSignal }) => Promise<string>;
}>;
```

```ts after
// a sketch of the proposal; no source holds it
export type DiagramRenderer = Readonly<{
  languages: readonly [string, ...string[]];
  label: string;
  measure?: (source: string) => { height: number; width: number } | undefined;
  render: (source: string, options: { signal: AbortSignal }) => Promise<string>;
}>;
```

The app keeps the size in its own provider, as the pagination guide teaches for any block that is not plain text.

```tsx
// content/docs/(guides)/pagination.mdx
const fragmentation: NodeFragmentationProvider = ({ content, element }) => {
  if (element.type === 'image') {
    return { type: 'atomic', size: { height: 320, width: 480 } };
  }

  if (element.type === 'codeBlock') {
    return { type: 'text', keepTogether: true };
  }
};
```

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Diagram height on pages | Your app sets it, like it does for tables and images | The Mermaid add-on measures each diagram up front, and the other engines send their size after drawing | pursue paged diagrams | big |
| Pictures in static pages | Show the diagram's code, as today | Draw Mermaid pictures in static pages | static pictures | small |
| More work on this question | Hold | Review again, or have other models challenge it | again, interrogate | small |
| Old text on the diagram page | Update it to describe today's diagram code blocks | Leave the old text about the removed drawing block | keep subject | detail |

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata through the session tool.

### Requirements

- Page layout composes every page before it paints, live and headless through `measurePages`, so it needs each non-text block's size synchronously from the app's `fragmentation` provider (`packages/plitejs/src/pagination/index.ts:170-175`, `:466-481`; the pagination guide `content/docs/(guides)/pagination.mdx`, "The app owns these sizes").
- Plate and app renderers own schema-specific fragmentation sizes and visual policy. Pagination rejected a store plugin or provider stack, and a preselected cache, skeleton, worker or timer ([pagination subject](topics/pagination.md), Layer and owner).
- Engines, their settings and any backend are app policy in copied source ([plate.md](../vision/plate.md), the copied-feature provider paragraph).
- A public API offers one way per common operation, and a target with more concepts than the current design names the job that pays for each ([common.md](../vision/common.md), Taste and Redesign from First Principles).
- A view-local presentation choice never becomes editor-global state ([VISION.md](../../VISION.md), Boundary Law). A diagram's Code or Both view lives in the component.
- Static rendering and Markdown export draw no picture, and Markdown writes a `mermaid` fence (the code block docs `content/docs/(plugins)/(elements)/code-block.mdx`, Static and export output). Serialization packages own format semantics, and copied source owns optional export presentation ([plate.md](../vision/plate.md)).

### What the code does

- The wrapper draws a picture only in the Both view, once the block is near the viewport and the browser is idle (`apps/www/src/registry/components/editor/code-block-diagram.tsx:97-104`, `:294-304`). Until then the block shows a "Drawing…" line, and a failed render shows its error text (`:123-145`). The picture is capped at the block's width and 384 pixels tall (`:133`).
- The paged view measures again on each document commit, each font load and each new `fragmentation` function (`packages/plitejs/src/pagination/react.tsx:1015-1052`). Its virtualized mode mounts only the window's items, so a block on a far page is not in the DOM (`:1163-1166`, `:1315`).
- Pele's `pele/lazy` loads a diagram type asynchronously, and its `render` is synchronous only once that type is registered (`../pele@458322a5b8:src/lazy.ts:47-81`, `src/core.ts:117-137`).
- `PagedEditorContent` and `PagedEditable` appear in `apps/www/src` only in `pagination-demo.tsx` and the Plite pagination example, and neither installs `withDiagrams` (`git grep` at `89a3a795f4`).

### Lanes

1. **Keep the current design. Wins.** The app's provider sizes a diagram block like any non-text block, and static pages print the source. An app that pages Mermaid diagrams can call Pele's synchronous `render` in its provider once the type has loaded.
2. **The proposal: the Mermaid item measures up front, the other engines report sizes. Loses.** Only Pele measures synchronously, so Plate would teach two ways to size one block. Measuring at once needs the diagram's type loaded first. Loading every type up front costs what the 2026-10-18 probe measured for the whole library, 275 kB gzip against 69 kB for the first flowchart; otherwise the block needs a fallback size until its type loads. The provider runs on every document commit, so each keystroke anywhere would redraw every Mermaid diagram unless the app adds a cache. Size reports need each picture drawn before its page lays out, but the wrapper draws only near the viewport, and the virtualized paged view never mounts far pages. Each report also swaps the provider and measures the whole document again. An engine's size also misses the view, the "Drawing…" line and the error text, which set the block's height in the editor. The predicted benefit is tight boxes for Mermaid diagrams in a paged editor, which no kit or app asks for today.
3. **The strongest addition: a fixed picture frame on pages. Loses for now.** A paged kit's provider would give a diagram block its source lines plus one fixed frame, and the wrapper would draw the picture scaled into that frame. It works for every engine, synchronously and headless, and nothing moves when a picture arrives. It costs empty space under a small diagram, and it has no consumer. It is the target when a paged kit draws diagrams.
4. **The strongest deletion: pages show diagram source only. Loses as a Plate rule.** A paged kit installs the code block without `withDiagrams`, so pages show source, as static pages do. That is already the app's choice in copied source; Plate has nothing to delete to make it.
5. **The rule is wrong: pagination measures non-text blocks from the DOM. Loses.** The rule is "Plate and app renderers own schema-specific fragmentation sizes and visual policy." It protects headless `measurePages` and the virtualized paged view, which lay out blocks that are not mounted. Both still ship, so the job holds.
6. **Static pictures through Pele. Loses.** The 2026-10-18 review weighed this alternative on the same argument and kept source only. Pele would draw Mermaid alone. Graphviz needs viz.js, flowchart.js needs a DOM, and PlantUML needs a network call to the app's server per render. Markdown and DOCX keep the fence by format semantics either way. The probe below shows Pele's size without a browser matches Chromium's closely, so fidelity is not the blocker; partial engine coverage and no requester are.

**Probe.** This review rendered the 2026-10-18 review's three Pele cohorts in Node, where Pele has no canvas and measures labels from a table of Arial widths. The stated widths were 3661, 834 and 9672 pixels, against 3662, 834 and 9669 in Chromium, and the 40-node tree's height matched at 352 (`pele-headless-size-a1-a1.log` in the run directory). This review first relied on the claim that Pele's size depends too much on where it runs, and the probe dropped it.

**Proof limits.** No paged editor with a diagram block ran, so the spill in the brief is inferred from source. The probe used Latin labels and Pele's default font; an app font or another script was not tried. Dylan's spec text was not in reach, so this review judges the proposal as the intake page summarizes it (item 3 and its Pushback) and as the chip's finding states it.

### Dependents

- `persistence`: unaffected. `packages/platejs/src/migrations/migratePlateV54.ts` runs the v54 migration, which turns a saved v53 drawing into a code block whose language is its drawing type, Mermaid by default (`migratePlateV54Inputs.internal.ts:56-95`). A Stop changes no source.

### History

- [2026-10-18-drawing-pele-review](2026-10-18-drawing-pele-review.md), the head: this review supersedes it as the scope's head with a Stop on a question it did not judge, a diagram's size in paged layout. Its Pele engine stands, and its pick of source-only static pages holds on the same evidence.
- [2026-10-15-drawing-review](2026-10-15-drawing-review.md): this review retains it for the representation, the wrapper, the renderer contract and source-only static and export output.
- [2026-10-19-plite-feature-specs-intake](2026-10-19-plite-feature-specs-intake.md), item 3: answered here. Its Pushback noted that the spec kept diagram sizes out of Plite; this verdict keeps them out of the copied renderer item too.
- External checkout: `../pele` at `458322a5b8abb1ae57ddf127c32017ab9fb14a92`, read on 2026-10-22.

## Close

**Stop. A diagram's size in paged layout stays with the app, and static pages keep showing diagram source.** No kit or doc puts diagrams on pages, only Mermaid could measure up front, and size reports would tie page layout to which pictures have been drawn. The 2026-10-18 pick of source-only static pages stands.

This run landed this review page, its decision log and an update to the drawing subject. The update records the decision and replaces the subject's stale summary, calls and owners, which still described the deleted drawing element. No code changed. The proof is the source read above and one Node probe of Pele's sizes. The probe narrowed the case, because Pele's size without a browser matched Chromium's within 3 pixels on the cohorts tried. The run judged one question, gave one verdict, Stop, and offered no task. A kit that puts diagram blocks on pages reopens this, starting from lane 3.
