# Regression sweep evidence

Date: 2026-10-15
Status: Frozen evidence for `docs/plans/2026-10-15-regression-sweep.md`

These are the inputs the sweep plan reads, so a fresh checkout can read them. Nothing here is law. The probe and its reruns live in this folder. The lane outputs, marked raw below, live in `docs/research/raw/2026-10-15-regression-sweep/`, because they cite paths as they stood at each commit. The plan's keep or drop rows cite their own proofs, never these numbers.

## What is here

| Path | What it is | How it was made |
| --- | --- | --- |
| `census/census-a.tsv`, `census/census-b.tsv` (raw) | One row per non-merge `fix` commit on `next` that touched product code or tests, 2026-08-15 to 2026-10-15: area, symptom, surface, found-by, tests changed, model-reproducible, miss class, evidence | Two read-only Codex `gpt-6.1-sol @medium` lanes, one per window, from `census/prompt-census-a.md` and `prompt-census-b.md` |
| `census/*-summary.md`, `census/*-coverage.*` (raw) | Each lane's counts, its miss-class table and what it read per commit | Same lanes |
| `census/tally.py` (raw) | Counts census rows whose changed tests include an `apps/www/tests/browser` spec, by test layer | `python3 census/tally.py census/census-a.tsv census/census-b.tsv` |
| `records/` (raw) | What the regression plans, plate notes and `udecode/plate` issues opened since 2026-08-01 say about misses | A read-only lane from `records/prompt-records.md` |
| `test-layers/test-layers.md` (raw) | Every test layer, its runner, its engines and whether CI runs it | A read-only lane from `test-layers/prompt-harness.md` |
| `probe/differential-v2.mjs`, `probe/sweep.sh` | One keyboard journey on each of the 22 visible upstream Slate examples and its beta twin, comparing text, selected text, focus and page errors | The lead, headless Chromium against the live sites |
| `probe/sweep-chromium-a1.txt`, `probe/sweep-summary-chromium.txt` | The full sweep output and one line per page | `zsh probe/sweep.sh`, then `node probe/summarize.mjs` |
| `probe/forced-layout-differential-chromium.json` | The forced-layout page's steps and the page error beta logged | Same sweep |
| `controls/kb-gaps-a1.txt`, `controls/check-knowledge-a1.txt` | 93 locked rules with no tagged test a gate runs, 89 with no tag and 4 tagged only on ungated specs; `kb check` failing on 118 K7 findings in the working tree that day | `pnpm -s kb gaps` and `pnpm -s kb check`, run by the lead |
| `confirm/candidates.mjs`, `confirm/candidates-*-a1.txt` | Targeted reruns of the forced-layout and hovering-toolbar journeys in Chromium, WebKit and Firefox | The lead, headless, against the live sites |

## Findings

**Census.** 93 of the 105 commits are behavioral fixes. The lanes judged 62 catchable without a real browser, 17 not and 14 unclear. 65 commits do not say who or what found the bug. 44 changed an `apps/www/tests/browser` spec, which no CI job runs; for 10 of them that spec was the only changed test. The one row of the 44 that the lane marked as adding no coverage is the revert `b74bca3a52`, which dropped a feature and its spec (`census/tally.py`). Counts are per commit, and five omnibus commits bundle several fixes each. A changed test file is not proof that it covers the fix.

**Probe coverage.** The journey ran on both sites for 17 of the 22 pairs in Chromium. Embeds, huge-document, iframe, read-only and shadow-dom failed on one side or both, because their editors sit in a frame or shadow root, load slowly or are not editable. Most pairs differ in text and offsets because the two sites ship different starting content, so only a difference a person judges counts as a find.

**Forced-layout Enter.** At the end of the title, Enter adds no line on beta and the next typed letter joins the title. Slate adds an empty line. Both Chromium and WebKit show this (`confirm/candidates-chromium-a1.txt`, `candidates-webkit-a1.txt`). Beta logged `Editor primary root cannot contain "title".` during the Chromium sweep (`probe/forced-layout-differential-chromium.json`). The probe collects errors per page, so the error is not tied to the Enter step, and the reruns did not listen for page errors. The schema in `apps/www/src/app/(app)/examples/plite/_examples/forced-layout.tsx:15-31` allows one title at the root's start, so a split title is the likely cause (inferred).

**Hovering-toolbar undo.** After typing a letter on a new line and deleting it with Alt+Backspace, Cmd+Z restores nothing on beta. In WebKit, where both sites ran the same steps, Slate restores the letter. In Chromium, Slate's End key stopped inside the block, so that pair is not like for like. Beta's example creates its editor with no history plugin (`hovering-toolbar.tsx:44-46`), while Slate's uses `withHistory`.

**Not run.** Firefox failed to launch in the sandbox (`confirm/candidates-firefox-a1.txt`). The donor tests for both pages exist under `apps/plite/tests/plite-browser/donor/examples/`, and this run did not execute them.

## Limits

- The scripts send `Meta+z`, so their undo steps run only on a Mac. `probe/sweep.sh` runs from this folder; the other scripts take their output folder as an argument. The plan does not port them, because agent-run comparison is later work.
- The live sites change. A rerun may differ for reasons outside Plate.
- Surfaces, miss classes and model-reproducible are the lanes' judgment, labeled inferred in their summaries.
