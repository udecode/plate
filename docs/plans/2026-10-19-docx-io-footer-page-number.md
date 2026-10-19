# Number the pages of a DOCX export

Status: in review, waiting on the draft PR's review
Playbook: bug-fix

## Brief

### What will change?

A document exported to Word can number its pages in a footer, with one switch. The converter already knew how; the export never passed the switch on.

### What could go wrong?

The number sits alone on the left, in the document font. Its alignment, a label such as "Page" and the page count cannot be set.

## Teach

DOCX export renders the editor value to HTML, then hands that HTML and a few page settings to a converter that writes the Word package. That converter can write a footer, link it from the page settings and put a page number field in it, but only when it is asked for a footer and a page number.

The export only forwarded the font, margins, orientation and page size, so the page number was out of reach.

Now the export takes a page number switch and asks the converter for both the footer and the number when it is on. The converter is unchanged.

## Public API

A new export option numbers the pages.

```ts before
```

```ts after
// packages/docx-io/src/lib/docx-export-plugin.slow.tsx
const blob = await exportToDocx([{ type: 'p', children: [{ text: 'Body' }] }], {
  pageNumber: true,
});
```

## Main changes

- `exportToDocxInternal` passes `footer: pageNumber` and `pageNumber` to `htmlToDocxBlob`.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Footer content and alignment | Left out, as the owner asked: only the page number | Accept footer HTML, as a first version of this change did | footer html | big |
| Page count | Left out; the converter writes no page count field | Add a page count field to the converter | page count | small |
| Section settings order | Kept as written; Word reads the footer link | Move the footer link and section settings to the schema order | schema order | detail |
| Release note bump | Patch, as the request said | Minor, as the earlier page size option got | minor | detail |
| Chinese docs | Left to the docs translation job | Translate the new option entries by hand | translate cn | detail |

## Steps

- [x] Check that Word reads the converter's footer and page number before building on it. Proof: `docs/plans/artifacts/docx-io-footer-page-number/word-main-footer-a3.log`, Word for Mac 16.114 on a seven-page A4 export from `main` with the converter's footer and page number switches.
- [x] Reproduce on `main`. Proof: `docs/plans/artifacts/docx-io-footer-page-number/red-base-pagenumber-a1.log`, the new export test run on `upstream/main` `7937212aab` in a detached worktree: it fails with no footer link, and the existing export test passes.
- [x] Forward the switch. Proof: `docs/plans/artifacts/docx-io-footer-page-number/green-pagenumber-a1.log`, 55 pass in the docx-io export and converter specs.
- [x] Check the branch writes the footer Word read. Proof: `docs/plans/artifacts/docx-io-footer-page-number/same-footer-a1.log`, the footer part is byte-identical to the Word-checked one and the section links it the same way.
- [x] `pnpm lint:fix`, package typecheck, barrels, docs parity and `pnpm check` on the final tree. Proof: `docs/plans/artifacts/docx-io-footer-page-number/typecheck-a4.log`, `docs/plans/artifacts/docx-io-footer-page-number/brl-a2.log`, `docs/plans/artifacts/docx-io-footer-page-number/check-docs-a3.log`, `docs/plans/artifacts/docx-io-footer-page-number/pnpm-check-a3.log`.
- [ ] Push to the fork and update the draft PR's title and body.

## Close

Reversal first: the first version of this change also added footer HTML, trimmed it, and made the direct converter call write the footer for either option. The owner asked for the page number alone on 2026-10-19, so those parts, their tests and their docs are reverted, and the converter files match `main` again. That version's Word check of a right-aligned "Page 1" footer no longer applies.

## Open work

- A total page count ("3 / 12"), a label or another alignment needs footer content the export does not take. owner: vincent69001, stop: a client asks for it, or dropped.
- The converter writes the section settings at the head of the body and the footer link after the margins, outside the schema order. Word for Mac reads it; Word for Windows, LibreOffice and Google Docs were not checked. owner: vincent69001, stop: a report from one of them, or dropped.
