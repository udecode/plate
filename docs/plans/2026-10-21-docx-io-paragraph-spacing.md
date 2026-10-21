# Add paragraph and heading spacing options to DOCX export

Status: in review, draft PR waiting on the maintainers' review
Playbook: plan

## Brief

### What will change?

Word exports get two opt-in settings: the gap between paragraphs, and the gap above and below headings. A call that leaves them out writes the same file as today.

### What could go wrong?

Word for Mac read the new gaps as intended. Windows Word, LibreOffice and print were not tried, and the full panel review did not run. One heading setting flattens all six levels, and line spacing is not offered.

## Teach

Word keeps one default gap under every paragraph, written once in the file's default style. It keeps a separate gap above and below each heading level, written in the heading styles. The export writes all of these from fixed numbers: six points under a paragraph, and eighteen points above a level 2 heading.

A caller could not change them. The converter reads only left and right margins from the page's styling, so the default stylesheet's paragraph margins never reach the file, and teaching it to read top and bottom margins would change every existing export.

Now the export takes two optional settings, one for paragraphs and one for headings. Each takes a gap before and a gap after, in twentieths of a point. Anything left out keeps today's value, so a call without them writes the same file as before.

## Public API

Two new export options set the spacing Word applies by default.

```ts before
```

```ts after
// packages/docx-io/src/lib/docx-export-plugin.slow.tsx
const blob = await exportToDocx(value, {
  headingSpacing: { after: 0, before: 0 },
  paragraphSpacing: { after: 0 },
});
```

## Main changes

- `htmlToDocxBlob` takes the same two options, because the export forwards its options to it and the converter owns the styles part.
- `generateStylesXML` builds the default paragraph spacing and the six heading spacings from a table of today's numbers, merged with the caller's.
- The converter rejects a spacing that is not a non-negative number, because a `NaN` would write a file Word calls corrupt.

## What other editors do

The `docx` library takes spacing as `before` and `after` in twips and `line` in 240ths of a line, and sets heading spacing by redefining each heading style whole, with its font, size and colour (docs fetched 2026-10-21 from `dolanmiu/docx` `docs/usage/styling-with-js.md`). This package's converter has no spacing option today (read in `internal/types.ts`). The vocabulary `before` and `after` in twips is the shared one, and a style-by-style override is more surface than this ask needs.

## API review

Best API, `design` mode, in the lead's own comparison. The ask is a gap before and after for paragraphs and for headings, with today's output kept when the option is absent. Nothing existing can be deleted for this, and the new surface is two options and one type.

| Shape | Verdict |
| --- | --- |
| Two sibling options, `paragraphSpacing` and `headingSpacing`, each `{ after?, before? }` in twips | Chosen. Matches how `margins` and `pageSize` are flat objects in twips, covers both gaps the ask names, and each option stays independently optional. |
| One `spacing: { paragraph, heading }` | Cut. Same power, one more level of nesting, and a third area would sit as a sibling key just as cleanly as a third option. |
| `paragraphSpacing` only, on the default style | Cut. Level 2 headings keep an eighteen point gap above, which is the largest remaining gap. |
| Read CSS `margin-top` and `margin-bottom` in the converter | Cut by the owner. It changes the default output of every existing export. |
| `headingSpacing` keyed by level, or a whole style override | Cut. No caller needs it, and a later release can add level keys beside `before` and `after` without breaking a call. |
| `line` in `paragraphSpacing` | Cut. A caller already sets line height per paragraph with CSS `line-height`, which the converter reads (`xml-builder.ts`, the `line-height` branch), and the default needs a line rule to be truthful. Added later as one optional key. |
| A `compact` boolean | Cut. It hard-codes one answer and cannot say "tighter, not zero". |
| Raw styles XML | Cut. It is unsafe and the whole styles part becomes public surface. |

Layers: `exportToDocx` forwards by hand, so each option is destructured in `exportToDocxInternal`. The converter's `DocumentOptions` is public through `htmlToDocxBlob`, so the options live there and the export is an adapter. The new work adds one string build per export and no editor runtime work, so no benchmark applies (source: `generateStylesXML` runs once per file).

Findings, on the P0 to P3 scale. No P0 or P1. P2: `htmlToDocxBlob` normalises margins with `normalizeUnits`, which turns a `0` into the default, so the spacing must not reuse it, because zero is the main use. P3: the existing `buildSpacing` skips a falsy `0` too, which is why CSS can never write a zero gap; it is outside this change.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Option shape | Two sibling options, each with a gap before and a gap after (look) | One nested spacing option | nested | big |
| Heading levels | One setting for all six levels | A setting for each level | per level | small |
| Line spacing | Left out; CSS line height already does it (look) | Add a line key to the paragraph setting | add line | small |
| Unit | Twentieths of a point, like margins | Points | points | small |
| Bad value | Throw on a negative or non-numeric gap | Ignore it quietly | ignore | detail |
| Review of the plan | The lead's own comparison above, as the request asked (look) | Run architect and a panel on the plan | panel now | small |
| Review of the diff | One fresh Claude review of the frozen diff, because the multi-seat runner cannot start in this workspace; the full panel is still owed before a PR opens (look) | Wait for a trusted workspace and run the full panel first | full panel | small |
| Invalid and huge gaps | Throw on a negative, non-numeric or unsafe-integer gap, and round fractions to whole twips | Ignore bad values quietly | ignore | detail |
| Registry rebuild | Skipped; the docs check passes and the edit touches no registry source | Run the registry build anyway | build registry | detail |
| Page publish | Local render and check only; nothing goes to claude.ai | Publish the page | publish | detail |
| Chinese docs | Left to the docs translation job | Translate the new entries by hand | translate cn | detail |
| Where it stops | Commit, push to the fork and open a draft PR on the owner's word, "fais une draft" (look) | Keep the work in the tree | hold | big |
| PR before the panel and a green check | Open it as a draft anyway: the panel cannot start here and the first check step is red at the base (look) | Wait for a trusted workspace and a green base | wait | small |

## Steps

- [x] Capture the before: the existing slow specs, the package typecheck and a real-file probe of the converter at the base. Proof: `docs/plans/artifacts/docx-io-paragraph-spacing/before-spec-a1.log`, `docs/plans/artifacts/docx-io-paragraph-spacing/before-typecheck-a1.log` and `docs/plans/artifacts/docx-io-paragraph-spacing/before-probe-a1.log`.
- [x] Write the new converter and export tests and run them red at the base. Proof: `docs/plans/artifacts/docx-io-paragraph-spacing/red-base-a1.log` and `docs/plans/artifacts/docx-io-paragraph-spacing/red-base-export-a1.log` fail at the ignored option, not at a crash.
- [x] Build the converter option: types, normalising, defaults, document and styles. Proof: `docs/plans/artifacts/docx-io-paragraph-spacing/green-converter-a1.log`.
- [x] Forward the options from `exportToDocxInternal` and document them in the types. Proof: `docs/plans/artifacts/docx-io-paragraph-spacing/green-export-a1.log`.
- [x] Show the default output is byte for byte unchanged without the options. Proof: `docs/plans/artifacts/docx-io-paragraph-spacing/same-default-a4.log` compares all 11 package parts of the base probe with the branch.
- [x] Probe the real file with the options and report the XML. Proof: `docs/plans/artifacts/docx-io-paragraph-spacing/after-probe-a4.log`.
- [x] Have Word read the result. Proof: `docs/plans/artifacts/docx-io-paragraph-spacing/word-read-a1.log`, Word for Mac 16.114.
- [x] Prove each guard fails when removed. Proof: `docs/plans/artifacts/docx-io-paragraph-spacing/mutants-a1.log` and `docs/plans/artifacts/docx-io-paragraph-spacing/mutants-export-a1.log`.
- [x] Through `plate-docs`, add the two options to both option tables and a usage step on the docx-io page. Proof: `content/docs/(plugins)/(serializing)/docx-io.mdx` and `docs/plans/artifacts/docx-io-paragraph-spacing/check-docs-a2.log`.
- [x] Through `changeset`, write one minor note for `@platejs/docx-io`. Proof: `.changeset/docx-io-paragraph-spacing.md`.
- [x] Run deslop, no-comments and unslop over the diff and the plan. Proof: the writing rows of `docs/plans/2026-10-21-docx-io-paragraph-spacing.decisions.tsv`.
- [x] Review the diff. Proof: `docs/plans/artifacts/docx-io-paragraph-spacing/review-1/answer.md`, from the brief in `docs/plans/artifacts/docx-io-paragraph-spacing/review-1/prompt.md`.
- [x] Run the biome fix on the task files, the package typecheck and the rest of the check chain. Proof: `docs/plans/artifacts/docx-io-paragraph-spacing/lint-fix-a1.log`, `docs/plans/artifacts/docx-io-paragraph-spacing/typecheck-a2.log`, `docs/plans/artifacts/docx-io-paragraph-spacing/check-rest-a2.log`.
- [x] Reproduce the one red step of `pnpm check` at the base. Proof: `docs/plans/artifacts/docx-io-paragraph-spacing/pnpm-check-a1.log` and `docs/plans/artifacts/docx-io-paragraph-spacing/base-check-workflow-a1.log`.
- [x] Hand back at the stop before commit, push and PR. Proof: the Close section of `docs/plans/2026-10-21-docx-io-paragraph-spacing.md`.

## Verification

- The new tests fail at the base and pass now, and each guard's mutant fails its own test. The default output matches the base in all 11 parts of the converter's file.
- Word for Mac 16.114 reads heading 2 as 18 pt before and 4 pt after by default, and 6 pt and 3 pt with the options. Body paragraphs go from 6 pt to 0 pt after.
- Package typecheck, docs parity, lint and both test lanes pass. The first step of `pnpm check` fails the same way at the base.

## Open work

- Word for Windows, LibreOffice and a printed page were not tried. owner: vincent69001, stop: a rendered export from one of them shows the gaps, or dropped.
- A caller who needs a different gap for each heading level, or a default line spacing, has no option. owner: vincent69001, stop: a caller asks, or dropped.
- The Chinese docs page lacks the new entries until the docs translation job runs. owner: vincent69001, stop: the translation job runs, or dropped.
- The multi-seat panel, owed by the api-build row, did not run because its Claude seat refuses to start in an untrusted workspace. owner: vincent69001, stop: Claude Code accepts the trust dialog once in this folder and the panel answers, or dropped.
- `check:workflow` fails at the base commit on the installed chips skill hash, so `pnpm check` cannot pass anywhere on this base. owner: vincent69001, stop: a pstack sync restores the hash, or dropped.
- Two probe files, control.docx and spaced.docx, are still open in Word and sit in Word's container folder under Documents/plate-spacing-probe, because Word ignored every scripted close. owner: vincent69001, stop: the two windows are closed and the folder is deleted.
- The exportToDocx path was not diffed against a base build, only the converter. owner: vincent69001, stop: a base build of the export runs the same probe, or dropped.

## Close

The work was first left uncommitted, as the first brief asked. On your later word, "fais une draft", it was committed on feat/docx-io-paragraph-spacing, pushed to your fork (origin, never upstream) and opened as a draft PR into main of the public repository. It holds the option in packages/docx-io, two test blocks, one docs page, one changeset and this plan with its decision log.

Reversals and deviations first. The PR opened as a draft before the multi-seat panel the pr review row owes, and while the first step of `pnpm check` is red at the base, because you asked for the draft knowing both. The brief named a `task` skill and a `create-goal-scratchpad.mjs` script. This tree dropped both (`.agents/pstack.json` lists autogoal under dropped), so the plan follows the current plan-page shape and the pstack plan and build playbooks. The brief's panel became one fresh Claude review, because the seat runner's Claude CLI refuses to run in an untrusted workspace. My first Word reading printed identical values for both files. That was my script addressing `document 1`, not the product. It is logged as superseded, and the second reading addresses each file by name. `line` was left out although the brief said "ideally before/line", for the reasons in the API review.

What landed in the tree: `paragraphSpacing` and `headingSpacing`, each `{ before?, after? }` in twips, on `exportToDocx`, `exportEditorToDocx`, `api.docxExport.exportToBlob`, `tf.docxExport.exportAndDownload` and `htmlToDocxBlob`. The converter writes them into the default paragraph spacing and the six heading styles. Without them the converter writes the same file as the base.

Proof and its limits. Tests: 63 pass across the four docx-io spec files (58 existing, 5 new). The three behavior tests fail at the base, and the default-pin test passes at the base by design. Dropping the rounding, the safe-integer check, the negative check or either forwarded option makes a named test fail. Byte identity holds for all 11 parts of the converter's file, with no options and with empty option objects. The XML after the options is in `after-probe-a4.log`. Word for Mac read the styles part that the final code generates. The review found no critical issue, and I applied its range check, rounding test, Heading 1 note and one redundant assertion. Limits: converter-level identity only, one Word version, no printed page, no multi-seat panel, and the first step of `pnpm check` is red at the base for a reason outside this diff.

Counts: 15 steps closed, 7 open-work items, 5 mutants run and 5 killed, 1 independent review, 0 critical findings.
