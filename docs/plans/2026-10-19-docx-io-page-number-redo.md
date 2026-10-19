# Add a page number option to DOCX export

Status: in review, waiting on the maintainer's review and on your answer about replying to the maintainer
Page: https://claude.ai/artifact/6zhBpWr6zaQbsNnFnzzj7o
Playbook: babysit
Plans: 2026-10-19-docx-io-footer-page-number.md

## Brief

### What will change?

Word exports get an option that puts page numbers in a footer. This redo, run with the current review tools, rewrote the new test to check how the file is built instead of matching raw text.

### What could go wrong?

We only checked Word for Mac and never saw a printed page. The file puts the footer link in an order the Word format doesn't expect, so LibreOffice, Google Docs or Word for Windows might miss it.

## Teach

Exporting to Word turns the editor's content into HTML, then hands that HTML and a few page settings to a converter that writes the Word file. The converter could already write a footer holding a page number field.

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

## API review

Best API review, at the current level: keep `pageNumber?: boolean` on the export options. No part of it can be cut. A caller who wants numbered pages has only the export options to ask through, because the lower `htmlToDocxBlob` takes HTML the export builds itself. The converter's two switches have one useful combination, since a footer without a number is empty, so one boolean is the truthful shape. The name matches the converter's own option. Alignment, a "Page N of M" format or footer content can widen it later to `boolean | { ... }` or sit beside it without breaking a caller. The change adds no editor runtime work, so no benchmark applies.

Findings, on the P0 to P3 scale: no P0 or P1. P2: `htmlToDocxBlob(html, { pageNumber: true })` in the same package writes nothing unless `footer` is also set, so one name means two things; it is in Open work. P3: the docs' `fontFamily` entry names Calibri as the default while the code falls back to Times New Roman, which makes "the document font" in the new entry harder to read; it is in Open work too.

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
| Follow-ups | In this plan and as session cards, not the project's task list, since this PR goes to the public repository (look) | Add them to the task list on this branch | use ledger | small |
| Review seats | Four reviewers, all on this session's Claude model (look) | Trust the folder, then rerun with the usual reviewer mix | rerun seats | small |
| Shared test setup | Keep the copied setup, so the existing test stays as it is | Share one helper, which rewrites the existing test | share helper | detail |
| Where the redo lives | A new plan that carries the first one | Rewrite the first plan in place | in place | detail |
| Missing model sheet | Use the review's default four models | Write a model sheet first | model sheet | detail |
| Printed page check | Try one PDF render, and log a gap if it fails | Skip it, since the footer matches the one Word read | skip print | detail |

## Open questions

### Reply to the maintainer

Should I post a short reply to the maintainer about the redo?

Why it needs you: It is a public comment on a repository outside the team.

- The maintainer asked for this redo in a fresh session.

- **Post the reply** (recommended): I post a two-line note saying the redo ran and what changed. Cost: One more comment on the PR.
- **Stay silent**: The updated PR body speaks for itself. Cost: The maintainer may not notice the redo.

Why I pick it: The maintainer asked for this, so a short note closes the loop.

Attention: look

## Steps

- [x] Write the redo ledger. Proof: `docs/plans/artifacts/docx-io-page-number-redo/levels-a1.log` marks every lead stretch of the first run at claude-opus-5-5 @xhigh, and the Redo table lists each unit.
- [x] Run deslop, no-comments and unslop over the diff and its prose. Proof: `docs/plans/artifacts/docx-io-page-number-redo/comment-sicko/reply.md` keeps both added comments, and the decision log's writing rows record the four plan sentences unslop rewrote.
- [x] Run the review panel and a code quality review on the diff. Proof: `docs/plans/artifacts/docx-io-page-number-redo/panel-1/prompt.md`, the four answers beside it, and `docs/plans/artifacts/docx-io-page-number-redo/thermo/summary.md`.
- [x] Try a printed render of the page numbers. skip: Word for Mac answered both save attempts with error -1708, so the printed check moves to Open work.
- [x] Recheck each proof the fixes touch, then run the lint fix. Proof: `docs/plans/artifacts/docx-io-page-number-redo/green-final-a2.log`, `docs/plans/artifacts/docx-io-page-number-redo/typecheck-a2.log`, `docs/plans/artifacts/docx-io-page-number-redo/lint-fix-a2.log`, `docs/plans/artifacts/docx-io-page-number-redo/pnpm-check-a2.log`.
- [x] Commit, push to the fork and update the PR body. Proof: commits 78338a57e7 and 3703eb0809 on the fork, and the body at `docs/plans/artifacts/docx-io-page-number-redo/body.md`.
- [x] Run the decision-trail review. Proof: `docs/plans/artifacts/docx-io-page-number-redo/trail-review/answer.md`.
- [x] Act on the trail review: return the PR to draft, undo the shared test helper and reopen the release bump as a question. Proof: `docs/plans/artifacts/docx-io-page-number-redo/red-base-rewrite-a2.log`, `docs/plans/artifacts/docx-io-page-number-redo/mutant-footer-a2.log`, `docs/plans/artifacts/docx-io-page-number-redo/mutant-pagenumber-a2.log`.

- [x] Switch the release note to a minor bump and mark the PR ready, as you asked. Proof: `.changeset/docx-io-footer-page-number.md` names `minor`, and `gh pr ready 5193` ran after the push.

## Verification

- The new test fails on `main` at the missing footer reference and passes on the branch. It also fails when the export drops either the footer or the page number flag.
- Word for Mac 16.114 opens a seven-page A4 export from the branch and reads a left-aligned footer holding a page number field on page 1. Word refused to save a PDF, so no printed page was seen.
- `pnpm check`, the docx-io typecheck and both docx-io slow specs pass on the final tree.

## Open work

- Word for Windows, LibreOffice and Google Docs were not checked. The footer link sits after the page margins and the section settings sit at the head of the body, both outside the Word format's order, and the page field has no stored result. owner: vincent69001, stop: a report from one of those readers, or dropped.
- Calling the converter directly with the page number alone writes nothing, since it also needs its footer switch. owner: vincent69001, stop: a caller reports it, or dropped.
- The export forwards each option by hand and still drops the title. owner: vincent69001, stop: the title branch lands, or is dropped.
- The docs say the default font is Calibri while the code falls back to Times New Roman, the features line claims headers, and the page size option is missing from the tables. owner: vincent69001, stop: a docx-io docs fix lands, or dropped.
- The Chinese docs page lacks the new option until the docs translation job runs. owner: vincent69001, stop: the translation job runs, or dropped.
- No printed or rendered page was seen, because Word for Mac refuses to save a PDF through AppleScript. owner: vincent69001, stop: a PDF of an export shows the numbers 1 to N, or dropped.
- The panel also found problems outside this change: the font name goes into the Word styles unescaped, the created and modified dates are set once when the module loads, list numbering state is shared across exports that run at the same time, the code examples import a package that does not exist, and a type suppression now sits on the page number path. owner: vincent69001, stop: each lands in its own fix, or dropped.
- The review seats could not run their own models, because Claude Code does not trust the plate folder. Opening Claude Code once in that folder and accepting the prompt fixes it. owner: vincent69001, stop: the next panel's seats answer, or dropped.
- The first commit's subject names footer HTML, which the PR no longer adds. A squash merge replaces it. owner: vincent69001, stop: the PR merges, or dropped.

## Close

The reversals come first. The run marked the PR ready on its own pick, then returned it to draft after the decision-trail review, because the first session kept it a draft and left the release bump open. The panel round's shared test helper, in commit 78338a57e7, rewrote the existing test against the lead's own code quality verdict; the final commit undoes it, so the existing test matches upstream/main again. The panel round had dismissed the patch bump by citing an agent's task brief, not your words, so the run asked you, and you chose a minor bump. The PR went ready again on your word. The run installed pstack after your "yes" to a question about whether you would install it. The install added a user-wide marketplace entry. The run also hand-edited this log three times: it inserted the lead row, deleted a duplicate row and placed the build row above the panel row. Later rows record each edit.

What landed: commit 78338a57e7, the test rewrite; commit 3703eb0809, these plans; and the commit that carries this Close, which undoes the shared helper. The package code is unchanged from the first run, at 11 lines.

The proof and its limits follow. The new test fails on upstream/main at its first assertion and passes on the branch. It also fails when the export drops the footer switch or the page number switch. The docx-io slow specs pass with 54 tests, the forced package typecheck passes and `pnpm check` exits 0 on the final tree. Word for Mac 16.114 opened a seven-page A4 export from the branch and read a left-aligned footer with a PAGE field on page 1. No other reader was tried and no printed page was seen. The panel ran four seats, all on this session's model, because the seat runner could not start in an untrusted folder and Codex is not installed. The decision-trail review ran on the same model for the same reason.

Attention, from the decision-trail review:

reviewed by claude-opus-5-5, a same-family fallback

- The PR went ready before the gates the playbook puts first and against your draft choice. It went back to draft, then ready again once you chose the bump.
- The install rested on an ambiguous "yes", and this run started before pstack loaded, so it is not the fresh-session run the maintainer asked for. A new session would load pstack from its first step.
- The patch-bump dismissal cited an agent's brief. You chose minor.
- The panel's four seats were one model with one prompt, so their agreement counts once. The printed render is still a gap.
- The shared helper reversed the lead's own verdict. It is undone, and the final test has its own code quality pass.
- The panel's side findings had no todo. They are now in Open work.
- The log's hand edits, the late page publish and a few overstated dismissals are recorded in the log's trail rows.

