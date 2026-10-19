# Add a page number option to DOCX export

Status: in review, waiting on the maintainer's review; trust the plate folder in Claude Code so the next panel runs its own seats
Page: https://claude.ai/artifact/6zhBpWr6zaQbsNnFnzzj7o
Playbook: babysit
Plans: 2026-10-19-docx-io-footer-page-number.md

## Brief

### What will change?

Word exports get an option that puts page numbers in a footer. This redo, run with the current review tools, rewrote the new test to check how the file is built instead of matching raw text.

### What could go wrong?

We only checked Word for Mac and never saw a printed page. The file puts the footer link in an order the Word format doesn't expect, so LibreOffice, Google Docs or Word for Windows might miss it.

## Teach

Exporting to Word turns the editor's content into HTML, then hands that HTML and a few page settings to a converter that writes the Word file. The converter could already write a footer holding a page number field, which Word fills in on each page.

The export only passed on the font, margins, orientation and page size, so there was no way to ask for page numbers.

The first run added one switch that turns on both the footer and the number. This redo kept that, ran the review and writing checks the first run couldn't, and rewrote the new test to follow the footer's links through the file.

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

## Redo

| Unit | Producer | Level | Verdict |
| --- | --- | --- | --- |
| Plan, design picks and Defaults | First run's lead | claude-opus-5-5 @xhigh | reuse, at the current level |
| Code, tests, docs and changeset in the two commits | First run's lead | claude-opus-5-5 @xhigh | reuse, at the current level; the panel and the code quality review below read it again |
| Writing passes | Not run, pstack was missing | none | redo |
| Review of the diff | One fresh Claude subagent in place of a panel | level not logged | redo, as a panel and a code quality review |
| Printed page numbers in Word | Not run, Word refused to save a PDF | none | redo |
| Red and green test runs, footer byte check, Word reading the footer from main | Deterministic proofs | not a model judgment | reuse; recheck any a fix touches |
| Full repository check, package typecheck, barrels and docs parity | Deterministic proofs | not a model judgment | recheck after any code change |
| Push to the fork | First run's lead | claude-opus-5-5 @xhigh | reuse, the PR head already matches the branch |
| PR body and Close | First run's lead | claude-opus-5-5 @xhigh | redo from this plan |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Review findings outside the ask | Left for later, since you asked for few changes (look) | Fix the converter, option passing and docs in this PR | fix now | small |
| Shared test setup | Both tests share one helper that runs the export | Keep the copied setup in each test | keep copy | detail |
| Where the redo lives | A new plan that carries the first one | Rewrite the first plan in place | in place | detail |
| Review seats | Four reviewers, all on this session's Claude model (look) | Trust the folder, then rerun with the usual reviewer mix | rerun seats | small |
| Missing model sheet | Use the review's default four models | Write a model sheet first | model sheet | detail |
| PR state | Mark it ready once the redo is pushed (look) | Keep it a draft | keep draft | small |
| Printed page check | Try one PDF render, and log a gap if it fails | Skip it, since the footer matches the one Word read | skip print | detail |

## Open questions

### Reply to the maintainer

Should I post a short reply to the maintainer once the redo is pushed?

Why it needs you: It is a public comment on a repository outside the team.

- The maintainer asked for this redo in a fresh session.

- **Post the reply** (recommended): I post a two-line note saying the redo ran and what changed. Cost: One more comment on the PR.
- **Stay silent**: The updated PR body speaks for itself. Cost: The maintainer may not notice the redo.

Why I pick it: The maintainer asked for this, so a short note closes the loop.

Attention: look

## Steps

- [x] Write the redo ledger. Proof: `docs/plans/artifacts/docx-io-page-number-redo/levels-a1.log` marks every lead stretch of the first run at claude-opus-5-5 @xhigh, and the Redo table lists each unit.
- [x] Run deslop, no-comments and unslop over the diff and its prose. Proof: `docs/plans/artifacts/docx-io-page-number-redo/comment-sicko/reply.md` keeps both added comments, and the decision log's writing rows record the four plan sentences unslop rewrote.
- [x] Run the review panel and a code quality review on the diff. Proof: `docs/plans/artifacts/docx-io-page-number-redo/panel-1/prompt.md`, the four answers beside it, and `docs/plans/artifacts/docx-io-page-number-redo/thermo/summary.md`; the rewritten test fails on main in `docs/plans/artifacts/docx-io-page-number-redo/red-base-rewrite-a1.log`.
- [x] Try a printed render of the page numbers. Proof: Word refused the PDF save, logged as a gap; Word read the branch export's footer in `docs/plans/artifacts/docx-io-page-number-redo/word-branch-footer-a1.log`.
- [x] Recheck each proof the fixes touch, then run the lint fix. Proof: `docs/plans/artifacts/docx-io-page-number-redo/green-final-a1.log`, `docs/plans/artifacts/docx-io-page-number-redo/typecheck-a1.log`, `docs/plans/artifacts/docx-io-page-number-redo/lint-fix-a1.log`, `docs/plans/artifacts/docx-io-page-number-redo/pnpm-check-a1.log`.
- [ ] Commit, push to the fork and update the PR body.
- [ ] Run the decision-trail review.

## Verification

- The new test fails on `main` at the missing footer reference and passes on the branch. It also fails when the export drops either the footer or the page number flag.
- Word for Mac 16.114 opens a seven-page A4 export from the branch and reads a left-aligned footer holding a page number field. Word refused to save a PDF, so no printed page was seen.
- `pnpm check`, the docx-io typecheck and both docx-io slow specs pass on the final tree.

## Open work

- Word for Windows, LibreOffice and Google Docs were not checked. The footer link sits after the page margins and the section settings sit at the head of the body, both outside the Word format's order, and the page field has no stored result. owner: vincent69001, stop: a report from one of those readers, or dropped.
- Calling the converter directly with the page number alone writes nothing, since it also needs its footer switch. owner: vincent69001, stop: a caller reports it, or dropped.
- The export forwards each option by hand and still drops the title. owner: vincent69001, stop: the title branch lands, or is dropped.
- The docs say the default font is Calibri while the code falls back to Times New Roman, the features line claims headers, and the page size option is missing from the tables. owner: vincent69001, stop: a docx-io docs fix lands, or dropped.
- The Chinese docs page lacks the new option until the docs translation job runs. owner: vincent69001, stop: the translation job runs, or dropped.
