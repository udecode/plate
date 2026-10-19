# Table of contents

Page: https://claude.ai/artifact/GEowDNGZd98ZLyrgX7vdB3

The ledger asks how heading reads and navigation feed a table of contents. A TOC is a void block that `BaseTocPlugin` owns. It holds no text and draws one entry per heading in the document. `read.headings()` calls the exported `readTocHeadings`, which walks the document for nodes the installed `BaseHeadingPlugin` gives a level, leveled Details titles included, and returns each heading's editor-scoped `NodeKey`, level and text, so no id is saved in the document. An app changes the list by overriding the read and filtering that finder. Copied UI owns scrolling to a heading, opening a closed Details that holds it, the arrival flash and an indent for each of the six levels. The owner removed the active-heading highlight on 2026-10-15. The 2026-09-07 extraction moved interaction into copied UI, the 2026-09-29 static rendering work made static TOC reads match the rendered document, and the [2026-10-19 review](../2026-10-19-toc-review.md) renamed `depth` to `level`, cut `type` and `queryHeading`, and indented all six levels in copied UI and Word. `node tooling/scripts/review-ledger.mjs show toc` prints the full history.

## Public API

The copied live TOC reads the heading list and rerenders when the document changes.

```tsx
// apps/www/src/registry/components/editor/toc.tsx
const headingList = useEditorSelector(
  (innerEditor) => innerEditor.plugin(TocPlugin).read.headings(),
  { shouldUpdate: (change) => !change || change.changed.hasAny('document') }
);
```

An entry carries the heading's key, level and text.

```ts
// packages/platejs/src/features/toc/lib/BaseTocPlugin.ts
export type Heading = {
  key: NodeKey;
  level: HeadingLevel;
  title: string;
};

export const readTocHeadings: (
  context: Readonly<{ editor: Editor; state: EditorStateView }>
) => Heading[];
```

The copied TOC indents by the heading's own level, all six of them.

```tsx
// apps/www/src/registry/components/editor/toc.tsx
className={headingItemVariants({
  level: item.level,
})}
```

To list fewer headings, an app overrides the plugin's read and filters the exported finder. The finder is the plugin's own walk, so an override filters it instead of copying it. The finder walks `state` but reads each level through `editor`'s heading plugin, so an override passes the `editor` and `state` of one read.

```ts
// content/docs/(plugins)/(elements)/toc.mdx
export const AppTocPlugin = BaseTocPlugin.extend({
  read: ({ editor, state }) => ({
    headings: () =>
      readTocHeadings({ editor, state }).filter((heading) => heading.level <= 3),
  }),
});
```

One app plugin, kept in a module that imports only `platejs/toc`, serves the live kit in the client `toc` file, the static kit in `toc-static` and Word export, because the copied live TOC's `TocPlugin` handle still finds a converted plugin.

```tsx
// content/docs/(plugins)/(elements)/toc.mdx
export const TocKit = [
  toReactPlugin(AppTocPlugin).configure({ component: TocElement }),
];
export const BaseTocKit = [
  AppTocPlugin.configure({ component: TocElementStatic }),
];
```

The standard element update inserts the block.

```ts
// content/docs/(plugins)/(elements)/toc.mdx
editor.plugin(BaseTocPlugin).update.insert();
```

## Main changes

- `BaseTocPlugin` owns the `toc` void block, its Markdown tag, `read.headings()` and the exported `readTocHeadings` finder that the default read calls. The finder reads levels through the installed heading plugin instead of a plugin that only shares its name.
- Copied `toc.tsx` owns click scrolling, opening a closed Details that holds the heading, the NavigationFeedback flash and a six-row indent table keyed by level. Copied `toc-static.tsx` draws the static list with its own six-row table.
- The package DOCX components draw the Word TOC as one row per heading, indented `(level - 1) × 24px` through `margin-left`, 360 twips per level, the step the indent plugin uses. Each row links to its heading's key, which names a bookmark for every heading Word export bookmarks. A Details title and a heading inside a quote get no bookmark, so their rows link nowhere, as Open work says.

## What other editors do

Read at Lexical `dd5c41b131`, Tiptap `91c51be53c`, ProseMirror `c7f2f1d7bd`, CKEditor 5 `14e73cc31b` and Slate `945a484df2`, source only. Lexical and Tiptap ship a TOC; the other three do not.

| Editor | Where the list comes from | Heading identity | How the list updates | Level field |
| --- | --- | --- | --- | --- |
| Plate | Plugin read over the document, headings and leveled Details titles, through an exported finder an override can filter | Editor-scoped `NodeKey`, never saved | Rebuilt on each document change while a TOC renders | `level` |
| Lexical | `TableOfContentsPlugin` in `@lexical/react` | Runtime node key | Kept up to date by mutation listeners on heading and text nodes | `tag` (`h1` to `h6`) |
| Tiptap | `extension-table-of-contents`, configurable `anchorTypes`, `getLevelFn`, `getIndexFn` | `data-toc-id` saved on each heading | Rebuilt by walking the document on each transaction | `level` |
| ProseMirror | No TOC package | None | None | None |
| Slate | No TOC example or package | None | None | None |
| CKEditor 5 | No TOC in the open-source packages | None | None | None |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Heading finder and entry shape | Plate | `platejs/toc` | The TOC plugin owns heading discovery, and an override filters its exported walk. |
| Word TOC indent | Plate | `platejs/docx/export` | Word export owns its margins. The converter sets a paragraph's left `w:ind` only from `margin-left`. |
| Six-level indent and the entry compare | Plate copied UI | registry `toc` and `toc-static` | Copied UI owns every visual choice. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Delete `BaseTocPlugin` and let copied UI walk headings | The `toc` node needs a schema, a Markdown tag and an insert update in the package, and Word export renders the TOC without copied UI. |
| Move the outline read onto `BaseHeadingPlugin` | Only TOC renderers read the outline, so the heading plugin would carry a read for one consumer. |
| Keep the list in plugin state through `queryHeading` | A read override through `.extend()` already changes the list for every handle and renderer. |
| Cache entries per top-level block | The heading plugin's level read receives the whole document, and swapping the heading plugin changes levels without changing a block, so a block cache serves stale entries. |
| Draw Details titles in the package Word export | It replaces an app's own Details title drawing and can split a title of two text runs into two Word paragraphs. |

## Open work

- Word export registers a bookmark for a heading inside a quote but never writes it, and writes a link to a Details title that names no bookmark. The smallest fix is one branch at `xml-builder.ts:1809-1810`, which writes the label without `w:hyperlink` when `getBookmark` misses, but it changes every internal `#` link in an export. owner: suggested task t_7ac4ead9. stop: none.
- The full walk measured 21 ms per read at 5,000 blocks on a loaded host. A quiet-host measurement, and a contract that a heading's level depends on that heading alone, would decide whether an incremental list earns its place. owner: suggested task t_c91e91d7. stop: none.
- Letting a read override call the read it replaces is a plugin-system change. owner: suggested task t_76b1739e. stop: none.
- A plugin that declares no state accepts any state object in `configure`, so an app that still sets `queryHeading` compiles. owner: suggested task t_d9d2239e. stop: none.
- `readTocHeadings` walks `state` but reads each level through `editor`'s heading plugin. A finder that takes only `state` needs a typed plugin read on a read's state, which the plugin system lacks. owner: suggested task t_62dcb29c. stop: none.
- Nothing rebuilds or checks `apps/www/public/tailwind.css`, which the HTML export block loads. owner: suggested task t_20ac8bbb. stop: none.
