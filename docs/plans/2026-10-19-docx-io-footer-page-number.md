# Number the pages of a DOCX export

Status: building, waiting on the owner's push and PR
Playbook: bug-fix

## Brief

### What will change?

A document exported to Word can number its pages in a footer, and that footer can carry its own text and alignment. The converter already knew how; the export never passed the options on.

### What could go wrong?

A direct converter call that asks for page numbers now gets a footer without asking for one too. Only the current page number is written, never the page count.

## Teach

DOCX export renders the editor value to HTML, then hands that HTML and a few page settings to a converter that writes the Word package. That converter can write a footer, link it from the page settings and put a page number field in it.

The export only forwarded the font, margins, orientation and page size, so none of this was reachable from it. Calling the converter directly also needed a separate footer switch, or the page number was silently dropped.

Now the export forwards the footer content and the page number switch, and the converter writes the footer whenever one of them is set.

## Public API

A new export call numbers the pages, right-aligned after a label.

```ts before
```

```ts after
// content/docs/(plugins)/(serializing)/docx-io.mdx
const blob = await exportToDocx(editor.children, {
  footerHtml: '<p style="text-align: right">Page </p>',
  pageNumber: true,
});
```

A direct converter call no longer needs the footer switch next to the page number.

```ts before
```

```ts after
// packages/docx-io/src/lib/internal/html-to-docx.slow.ts
const result = await htmlToDocxBlob('<p>Body</p>', { pageNumber: true });
```

## Main changes

- `exportToDocxInternal` passes `footerHtml` and `pageNumber` to `htmlToDocxBlob`, which hands `footerHtml` to the converter as its footer HTML.
- `htmlToDocxBlob` sets `footer` to true when `footerHtml` or `pageNumber` is set and `footer` is not given.
- `htmlToDocxBlob` trims `footerHtml`: the converter turns the whitespace around it into empty paragraphs, and the page number would land in the first one.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Footer switch on the export | None: a footer is written when it has content or a page number | A separate on and off option, as the converter has | footer switch | small |
| Footer styling | Inline styles in the footer HTML | Run the footer through the export stylesheet too | footer styles | small |
| Page header | Left out; nothing asked for it | Accept header HTML the same way | header | small |
| Page count | Left out; the converter writes no page count field | Add a page count field to the converter | page count | small |
| Page number style | Documented: the number takes the document font, not the footer's inline styles | Copy the footer text's style onto the number in the converter | number style | small |
| Section settings order | Kept as written; Word reads the footer link | Move the footer link and section settings to the schema order | schema order | detail |
| Release note bump | Patch, as the request said | Minor, as the earlier page size option got | minor | detail |
| Chinese docs | Left to the docs translation job | Translate the two new option entries by hand | translate cn | detail |

## Steps

- [x] Reproduce on `main`. Proof: `docs/plans/artifacts/docx-io-footer-page-number/red-base-a3.log`, the final tests run on `upstream/main` `7937212aab` in a detached worktree: the three new tests fail, the existing export test passes.
- [x] Check that Word reads the converter's footer layout before building on it. Proof: `docs/plans/artifacts/docx-io-footer-page-number/word-main-footer-a3.log`, Word for Mac 16.114 on a seven-page A4 export from `main`.
- [x] Forward the options and turn the footer on in `htmlToDocxBlob`. Proof: `docs/plans/artifacts/docx-io-footer-page-number/green-a2.log`, 56 pass in the two docx-io slow specs.
- [x] Check the branch's footer in Word. Proof: `docs/plans/artifacts/docx-io-footer-page-number/word-branch-footer-a2.log`, a right-aligned "Page" footer with a PAGE field on a seven-page export.
- [x] Package typecheck, barrels and docs parity. Proof: `docs/plans/artifacts/docx-io-footer-page-number/typecheck-a2.log`, `docs/plans/artifacts/docx-io-footer-page-number/brl-a1.log`, `docs/plans/artifacts/docx-io-footer-page-number/check-docs-a1.log`.
- [x] Independent review of the diff and its fixes. Proof: a fresh Claude subagent's read-only review, logged in the decision log; the whitespace fix failed first in `docs/plans/artifacts/docx-io-footer-page-number/red-whitespace-a1.log` and passes in `docs/plans/artifacts/docx-io-footer-page-number/green-a3.log`, 57 pass with the updated mock spec.
- [x] `pnpm lint:fix`, then `pnpm check` on the final tree. Proof: `docs/plans/artifacts/docx-io-footer-page-number/pnpm-check-a2.log`, every lane passes; the first run, `docs/plans/artifacts/docx-io-footer-page-number/pnpm-check-a1.log`, caught the mock spec fixed above.
- [ ] The owner pushes `fix/docx-io-footer-page-number` to the fork and opens the PR.

## Open work

- A total page count ("3 / 12") needs a page count field the converter does not write. owner: vincent69001, stop: a request for it, or dropped.
- The page number field carries no run style, so it takes the document font while the footer text keeps its inline size and color. Inferred from the written XML, not seen in Word. owner: vincent69001, stop: a report of a mismatched number, or dropped.
- The converter writes the section settings at the head of the body and the footer link after the margins, outside the schema order. Word for Mac reads it; Word for Windows, LibreOffice and Google Docs were not checked. owner: vincent69001, stop: a report from one of them, or dropped.
