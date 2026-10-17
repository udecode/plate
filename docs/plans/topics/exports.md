# Exports

Page: https://claude.ai/artifact/9XTHDuJEHCwuuACmXUS8Wt

Which document, projection, schema, format and presentation contracts should own every export, and which editing-runtime needs can go? That is the ledger's question for the `exports` scope. Today each format owns its own export. Semantic HTML, Markdown and plain text take one complete document and the plugins, compile them without starting an editor, and return the data with diagnostics. Styled static HTML and DOCX draw a live editor's document through the app's static kit. An HTML, Markdown, plain-text or static HTML export of a document with authored metadata, which every document from an editor with the authored plugin carries, throws one error unless `projection` is `accepted` or `proposed`, so the caller decides whether unapproved changes ship. One shared projection step owns that rule for both the installed editor methods and the standalone functions. DOCX requires its own projection on every call, which also offers `review`. The format specs and the DOCX artifact receipts of the [exports review](../2026-10-12-exports-review.md) and the [document-first contract](../2026-09-24-document-first-export-contracts.md) prove the per-format output. The copied export menu in `export-toolbar-button.tsx` asks the user which projection to export when suggestions are pending.

## Public API

The copied export menu passes the chosen projection to every format and downloads `document.html`, `document.md` or `document.docx`.

```tsx
// apps/www/src/registry/components/editor/export-toolbar-button.tsx
const result = await renderStaticHtml(model, {
  component: EditorStatic,
  presentation: BaseEditorKit,
  projection,
  props: { style: { padding: '0 calc(50% - 350px)', paddingBottom: '' } },
});

const markdown = model.plugin(MarkdownPlugin).api.serialize({ projection });

const docx = await exportDocx(model, {
  comments: docxComments,
  component: EditorStatic,
  lossPolicy: 'allow',
  presentation: BaseEditorKit,
  projection: wordProjection,
  source: docxSource?.source,
  stylesheet: DOCX_EXPORT_STYLES,
});
```

Detached conversion takes a document and the plugins, with no editor.

```ts
// content/docs/(guides)/serializing.mdx
import { serializeHtml } from 'platejs/html';
import { serializeMarkdown } from 'platejs/markdown';
import { serializePlainText } from 'platejs';

const html = serializeHtml(document, {
  plugins: EditorKit,
  projection: 'accepted',
});
const markdown = serializeMarkdown(document, {
  plugins: EditorKit,
  projection: 'proposed',
});
const text = serializePlainText(editor, { projection: 'accepted' });
```

A document from an editor with the authored plugin needs a projection even before any suggestion exists.

```ts
// packages/platejs/src/export-compilation.spec.ts
expect(() => serializeHtml(editor.read.value(), { plugins })).toThrow(
  projectionRequired
);
```

Each `projection` option documents the rule where callers read it.

```ts
// packages/platejs/src/lib/plugins/html/htmlTypes.ts
export type HtmlSerializeOptions = Readonly<{
  lossPolicy?: 'allow' | 'reject';
  plugins: readonly RuntimePluginReference[];
  /**
   * Version of an authored document to export. `accepted` drops pending changes
   * and `proposed` applies them as plain content. Either choice adds an
   * `authored-lossy-projection` warning while changes are pending. Required
   * when the document has authored metadata, which every document from an
   * editor with the authored plugin carries, even with no pending change.
   * Omitting it or passing any other value then throws, and so does a valid
   * value when `plugins` lacks the authored plugin. A document without authored
   * metadata ignores it.
   */
  projection?: 'accepted' | 'proposed';
  schema?: EditorApplicationSchema;
}>;
```

A server page serializes a clean document, so it passes no projection.

```tsx
// apps/www/src/app/(app)/docs/examples/server-side/page.tsx
const markdown = serializeMarkdown(
  { children: [...basicBlocksValue, ...basicMarksValue, ...detailsValue] },
  { plugins: BaseEditorKit }
);
```

## What other editors do

Read from source at `../ckeditor5` `14e73cc31b`, `../tiptap` `91c51be53c`, `../lexical` `dd5c41b131`, `../prosemirror-changeset` `e215757276`, `../BlockNote` `1e26f1c5e1` and `../slate` `945a484df2`; none was run. No open-source editor here asks which version of pending changes to export. Each serializes whatever its document holds. Plate's explicit projection has no direct prior art in these checkouts.

| Editor | Pending suggestions in the model | What an export writes | Projection choice on export |
| --- | --- | --- | --- |
| BlockNote | Yjs attribution marks and AI insertion and deletion marks on the blocks | The blocks it is given, marks included; `blocksToHTMLLossy` and `blocksToMarkdownLossy` have no suggestion branch | None |
| CKEditor 5 | Track changes is a commercial plugin, not in this checkout | `getData()` writes the model with data markers; not read for suggestions | Not read |
| Tiptap | No suggestion model in the open-source packages | `getHTML()` and `getJSON()` write the current document | None |
| Lexical | No suggestion model | `$generateHtmlFromNodes` writes the current editor state | None |
| ProseMirror | `prosemirror-changeset` computes changes beside the document and never stores them in it | `DOMSerializer` writes the current document | None |
| Slate | No suggestion model | The app serializes `editor.children` itself | None |

## Layer and owner

Exports are document-first: format adapters consume canonical document data and configured feature mappings, editor methods capture once and delegate, and server callers construct no editor.

| Responsibility | Decision |
| --- | --- |
| Plite | `EditorDocumentValue`, `ContentSlice`, schema meaning, pure authored projection and structural plain-text defaults. `NodeApi.string` keeps its separator-free offsets and is not the plain-text serializer. |
| Plate | Feature mapping compilation and semantic HTML; detached conversion consumes frozen schema and conversion configuration. Video and audio export as figures with native controls and a `<figcaption>`. |
| Clipboard writes | The same format order as paste, each MIME type once: the first encoder that returns a string wins, `null` defers, and a throw goes to the lifecycle error sink. |
| Markdown | Its format compiler, mappings, remark settings and AI and selection consumers; see the `markdown` subject. |
| Styled React rendering | Captures before async work and uses one private projected view per document; semantic HTML owns clean interchange, so no class or data stripping flags exist. |
| DOCX | A lazy standalone entrypoint with comments, diagnostics, source artifact and Word revisions; required Word semantics live in package and feature mappings, optional themes in the registry. |
| Copied UI | Projection choice, CSS and document shell, assets, filenames, toasts and delivery. Inline CSS does not make an offline HTML file. |
| Review state | Exact Plate review state is canonical authored JSON; Word review is DOCX revisions and comments. No format carries a hidden authored document. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| An editing runtime to serialize a captured document | The strongest cut; adapters read documents. |
| A universal `ExportPlugin`, format dispatcher, public AST or all-formats-in-Plite package | No shared job. |
| A JSON conversion engine | Persistence already projects, stringifies and validates. |
| HTML and Markdown hidden envelopes and `review` projections | Duplicated persistence and created competing file authorities. |
| Rebuilding `BaseEditorKit` or temporary editors per export | One compiled runtime and one projected view beat it in every cohort. |

## Main changes

- `projectFormatDocument` in `packages/platejs/src/lib/editor/withPlite.ts` owns the rule. It returns a document without authored metadata unchanged, throws the shared `TypeError` unless `projection` is `accepted` or `proposed`, then requires the authored plugin and calls its document capability, `project(document, 'accepted' | 'proposed')`.
- The editor methods reach it through `projectPlateFormatDocument`, and detached conversion through `withPlateFormatCompilation`'s `readDocument(document, projection, read)`, which hands `read` the projected document and its diagnostics. No format keeps its own check or `proposed` fallback.
- A detached serializer cannot read an authored document without the rule. An editor-side export, such as HTML, plain text or static HTML, calls `projectPlateFormatDocument` before it builds a view by convention.
- `exportDocx` projects on its own, because its `review` projection writes Word revisions from the stored document's review marks through `createReviewProjection` (`packages/platejs/src/docx/export/lib/reviewProjection.tsx`); `accepted` and `proposed` go through `projectAuthoredDocument`. It requires `projection` on every call.

## Open work

- Plite's public `projectAuthoredDocument` still returns the proposed version for any value other than `accepted`. owner: zbeyens, through the `authored` ledger scope's next review. stop: that review rules whether it refuses other values.
- Three editor-side exports project, then build a view with an `as unknown as Editor` cast, so the rule is structural only for detached reads. owner: zbeyens, through the `exports` ledger scope's next review. stop: the next editor-side export method lands, or the cast sample in `docs/plans/topics/correct.md` settles the type `createEditorView` returns.
- A new open-source PDF backend waits until text and vector output, pagination, fonts, assets and native output can be compared; browser print and screenshots are app jobs, and raster PDF and image items stay removed. owner: the next exports review. stop: a PDF comparison.
- Microsoft Word itself is untested; LibreOffice reopen and resave is the native proof. owner: the next exports review. stop: a Word run.
- The AI chat plugin's whole-editor Markdown context drops `meta`, so it never meets the rule. owner: zbeyens, through the `ai` ledger scope's next review. stop: that review rules on the projection AI prompt context reads.
