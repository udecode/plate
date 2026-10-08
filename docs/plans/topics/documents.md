# Documents: DOCX import, export and Word paste

Page: https://claude.ai/artifact/W8q2wJUFCojpcaJeSzhJQb

DOCX file import, DOCX file export and Word clipboard paste in `platejs`. The ledger asks which document conversion laws the three share, and where fidelity limits must be explicit (`docs/research/review-scopes/documents.json`). `importDocx` returns one document or a failure, `exportDocx` captures one editor snapshot under an explicit authored projection, every loss is a structured diagnostic, an opt-in `DocxSource` gives exact or safely overlaid re-export, output passes a safety gate, and `WordPastePlugin` owns paste. A Word file carries only what Word displays: text, comments and tracked revisions. Exact review state persists as canonical authored JSON beside the file. An edited source-aware export keeps custom properties and one-section headers and footers from the source, and reports every other source part it leaves out. The 2026-10-06 build's acceptance and benchmark receipts are in `docs/plans/2026-10-06-documents-review.md`'s Close; the decision page, `docs/research/decisions/documents-conversion-fidelity.md`, holds the older September receipts, which this page did not rerun.

## Public API

A Plate app installs Word paste as a plugin.

```tsx
// content/docs/(plugins)/(serializing)/docx.mdx
import { WordPastePlugin } from "platejs/docx/paste";
import { createEditor } from "platejs/react";

const editor = createEditor({
  plugins: [WordPastePlugin],
});
```

File import is detached and returns one document or a failure.

```tsx
// content/docs/(plugins)/(serializing)/docx.mdx
const result = await importDocx(file, {
  plugins: BaseEditorKit,
});

if (!result.ok) {
  return { diagnostics: result.diagnostics };
}

editor.update.value.replace(result.document);
```

The same editor can keep the source for exact or overlaid re-export.

```tsx
// content/docs/(plugins)/(serializing)/docx.mdx
const imported = await importDocx(file, {
  plugins: BaseEditorKit,
  retainSource: true,
});

if (!imported.ok) return imported.diagnostics;

editor.update.value.replace(imported.document);

const exported = await exportDocx(editor, {
  projection: "review",
  source: imported.source,
  stylesheet,
});

imported.source?.dispose();
```

A review export writes Word revisions and comments only.

```ts
// packages/platejs/src/docx/export/lib/authoredDocx.spec.ts
const result = await exportDocx(editor, {
  projection: 'review',
});
```

Import always derives the document from the Word-visible package.

```ts
// packages/platejs/src/docx/export/lib/authoredDocx.spec.ts
const reimported = await importDocx(await result.blob.arrayBuffer(), {
  plugins,
});
```

Exact review state keeps its one canonical path: `projectAuthoredReview(editor.read.value()).review` serialized as JSON and read back with `parseAuthoredDocument` (`content/docs/(guides)/serializing.mdx:43-47`).

## What other editors do

From the 2026-09-14 source comparison, `docs/research/sources/docx-interoperability-oss.md`, which read six upstream families at pinned revisions without building or running any of them, and a 2026-10-06 research shard, `docs/plite/research/2026-10-06-docx-native-state/`, which read 15 local clones at their checked-out revisions, also without building or running them. In the source they read, each family does one of semantic import, Word generation, package retention or preview. None writes whole-document editor state into the package, and none binds stored data to package bytes. The closest tools store per-record caller data in Word's customXml parts and let a visible content control decide whether each record still applies; SuperDoc carries exact application data beside the .docx, not inside it. ProseMirror, Lexical, Slate and Tiptap ship no DOCX code in their public trees.

| Library | What it does with DOCX | Limit the comparison recorded |
| --- | --- | --- |
| Mammoth `71fe5daa50f8` | Converts DOCX to semantic HTML; unwraps insertions, drops deletions and comment range bounds | A warning-free result is not a lossless document |
| TurboDocx html-to-docx `571d2e471f00` | Generates a package from HTML; maps `ins` and `del` to underline and strike | Keeps no revision identity and no original package |
| docx `fda088d1da37` | Writes OOXML directly, with comment markers and insertion and deletion identity; a separate template patcher | A generator, not an editor import contract |
| docx-preview `191d3e0db009` | Keeps the ZIP and renders a parsed model to HTML | No save path writes editor edits |
| SuperDoc `3bad86724392` | Stores per-record caller data in customXml parts tied to hidden content controls, and returns exact application data beside the .docx in an outer archive | Its DOCX engine is closed; this pass read `cabf6fae6816`, which is older than the 2026-09-14 revision |
| Pandoc `bde8c297ee68` | Reads with accept, reject or all, regenerates parts from its AST, and writes its metadata to custom properties that its reader never reads back | Moves become insert and delete, and IDs can change |
| eigenpal docx-editor `84c46227d4ce` | Edits the OOXML tree itself, and stores a caller's JSON per inline node in a customXml part bound to a visible content control | A payload whose control is gone is swept on open; it stores no whole-document state |
| BlockNote `1e26f1c5e1cd` | Exports Word content | No DOCX import, and no BlockNote JSON in the file |
| opendoc `7a408cf034f3` | Carries the parts it does not model through unchanged | Drops digital signatures when the document is edited, for the same reason a digest-bound part goes stale |

Word keeps customXml data parts, per Microsoft's add-in documentation. ISO 29500 lets a conforming producer drop a part reached through an unknown relationship, so a private part hidden that way does not survive every producer. What Word and LibreOffice Writer do to such a part on save is an evidence gap.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Exact review state persists only as canonical authored JSON | Plite owner, Plate facade | `platejs/authored` (`packages/plitejs/src/authored/format.ts`) | The documented path (`content/docs/(guides)/serializing.mdx:43-47`) |
| Word files carry no hidden Plate state, and import trusts only the visible package | Plate | `platejs/docx/export`, `platejs/docx/import` and the private `docx-internal` partition | No job for a second authority, a forgeable trust check and a confirmed leak |
| One root-part table owns admission and what a regenerated export does with each root part | Plate | private `docx-internal` (`internal/sourceEligibility.ts`), read by `export/lib/sourcePreservation.ts` | `sourcePreservation.ts` and `outputSafety.ts` already import it, so no new edge in `tooling/entrypoints/entrypoint-dag.mjs` |

## Main changes

- `packages/platejs/src/docx/import/lib/importDocx.ts` owns detached import: package limits, revisions, comments, cancellation and the one-pass Plate codec. It reads no Plate state from the package.
- `packages/platejs/src/docx/export/lib/exportDocx.tsx` owns snapshot export, the authored projection and the loss policy, and calls the output safety gate in `outputSafety.ts`. One resolver acquires a retained source and returns a discriminated `SourceExportResolution`: the exact arm returns the admitted lease bytes with the named-root and metadata warnings, and the render arm carries the rewrite and comment-omission diagnostics.
- `packages/platejs/src/docx/export/lib/sourcePreservation.ts` owns the edited overlay from a `DocxSource`. It copies only `carry` root parts and one-section header and footer graphs, and its final sweep reports every source part the output does not carry.
- `packages/platejs/src/docx/internal/` holds the shared package model: `source.ts` and `sourceEligibility.ts` for `DocxSource`, where `ROOT_PARTS` gives each admitted root relationship one disposition (`regenerate` for the main document, `carry` for custom properties, `drop` for the thumbnail and the core and extended properties) and `PACKAGE_VOCABULARY` derives from it, and `packageParts.ts`, `docxPackage.ts`, `types.ts` and `abort.ts`.
- `packages/platejs/src/docx/paste/lib/WordPastePlugin.ts` owns Word clipboard fitting, with `packages/platejs/src/docx/html/` cleaning Word HTML.
- `packages/plitejs/src/authored/format.ts` owns canonical authored JSON, `projectAuthoredReview` and `parseAuthoredDocument`.
- The registry owns presentation and app wiring: `apps/www/src/registry/components/editor/docx.tsx`, `docx-export.tsx` and `docx-source.tsx`, and the import and export toolbar buttons.

## Open work

- `packages/platejs/src/static/authoredHtml.spec.tsx:37` asserts a removed name, and `benchmarks/editor/benchmarks/plate-docx-revision-import-benchmark.test.ts:428-436` asserts on source text; both are `test-audit` candidates. owner: zbeyens, tracked here. stop: `test-audit` runs on them, or the owner drops them.
- An edited export drops the source core and extended properties, which loses the source file's author, title, created date, company and manager; both omissions are reported (`packages/platejs/src/docx/export/lib/sourcePreservation.ts:594`). owner: zbeyens, tracked here. stop: a `documents` review decides whether either part needs a carry rule or a writer, or the owner drops it.
- Linked custom properties keep deleted body text in an edited export, as the probe in `docs/plans/2026-10-06-documents-review.md`'s Probes section shows. Route: the Bug fix playbook, test first, fixing the custom-properties row so a property with `linkTarget` is dropped or regenerated while unlinked properties stay. owner: zbeyens, tracked here. stop: the fix lands with a regression test that fails at base on that probe's case, or the owner drops it.
- A kept header whose relationship targets the thumbnail part keeps that image as its own content, although the package thumbnail relationship is dropped; the plan panel's header-path fix waits unreviewed, as `docs/plans/2026-10-06-documents-review.md`'s Panel gate records. owner: zbeyens, tracked here. stop: a reviewed fix removes the unused relationship while keeping legitimate header content, or the owner drops it.
- The diff panel's two unreviewed fixes, named in `docs/plans/2026-10-06-documents-review.md`'s Panel gate, wait for review: the final sweep should report explicit drops before filename exemptions, and the benchmark should look for the header reference inside the section. owner: zbeyens, tracked here. stop: the owner applies them after another review round, or drops them.
- `readBoundedDocxPackage` keeps bytes the vocabulary never inspects, such as an archive comment and per-entry comments and extra fields, and exact reuse returns them (the per-entry part is inferred from zip.js source). owner: zbeyens, tracked here. stop: the reader rejects those bytes, or a review accepts the gap.
- The eligibility vocabulary admits any number of custom-properties and thumbnail root relationships, while OPC allows one of each per package. owner: zbeyens, tracked here. stop: `ROOT_PARTS` carries a cardinality, or a review accepts the gap.
- The `zipLoads` values and the overlay row's four package load counts in the retained-source benchmark's receipt are hand-written literals; `zipLoads: 0` for exact export was false while the old strip existed. owner: zbeyens, tracked here. stop: the harness counts package loads, or a review accepts literals.
- The `source-part-omitted` reason `invalidated` covers a dropped root part, including core properties that the generator replaces, and source comments omitted because `options.comments` was absent, so code that switches on `reason` cannot tell them apart. owner: zbeyens, tracked here. stop: a caller needs to tell them apart, or the owner drops it.
- The DOCX writer stamps its core-property creation and modification dates once per process (`packages/platejs/src/docx/export/lib/internal/constants.ts:124`, `:144`), so every export after the first carries stale dates, and a same-process round trip reports `docProps/core.xml` omitted although the generator wrote the same bytes. owner: zbeyens, tracked here. stop: the writer stamps a fresh date per export, or the owner drops it.
- Exact reuse compares only the main and named roots, not `meta`, so an authored change that touches only `meta.authored` could reuse stale revisions; no such operation was found, so the risk is unverified. owner: zbeyens, tracked here. stop: a `documents` review shows no authored operation changes `meta` alone, or the exact check compares it.
- The overlay's final sweep still uses `sourceOwnedPart` as a second hand-kept list beside `ROOT_PARTS`, so admitted main-document parts such as `word/people.xml` report as unreachable instead of regenerated or dropped. owner: zbeyens, tracked here. stop: main-document parts get disposition rows, or a review accepts the list.
- Exact export p95 reads 1.83 to 30.93 ms in the final measured run against 0.47 to 1.77 ms in the 2026-09-15 receipt, while overlay export matches its old receipt, so host noise does not explain the gap; the work that still runs before the exact branch returns, such as the export capture and the document comparison, is the likely cost but is not measured. owner: zbeyens, tracked here. stop: a perf-issue run explains the gap and keeps or removes it, or the owner drops it.
