# Picking trial

The third skill trial for `docs/plans/2026-10-15-regression-sweep.md`, run on 2026-10-15. It asked whether `verify` plus a short section that aims cards at the census's kinds of miss picks hand-test cards that catch more real bugs than `verify` alone, on 16 Plate docs pages.

- `key-writer.md` is the brief a separate `gpt-6.1-sol @high` agent answered with 12 bugs from `origin/main` fixes, written straight to a file outside the repository. That file is `key.md` here, read only after grading.
- `keep-rule.md`, `grader.md`, `arm-base.md`, `arm-methods.md` and `section.md` were frozen by hash in `freeze.sha256` before any arm ran. `freeze.run1.sha256` is the first freeze; only arm C's prompt paths differ.
- The arm prompts name a scratch folder outside the repository: `snap-C/qa-pass/section.md` is `section.md`. Each arm ran from a `git archive` snapshot of `b1e70bb257`. The arms' sandbox refused web fetches, so both worked from source.
- `arm-C-out.run1-killed.md` is arm C's first run, stopped because it could not open its section. `arm-reads.txt` lists what each final run read. Its refusal count includes any tool result that quotes a word such as "permission", so a file's own text can count; arm C's real refusals were its web fetches.
- `blind/` holds the copies the grader saw, `grade-out.md` its answer, and `arm-map.txt` the label map, opened after grading.

Result: B and C each caught 0 of the 12 bugs (`grade-out.md`; the map gives X as B and Y as C), so `verify` alone stays. With the first trial, five arms caught 1 of 60 held-out bugs, which sent the plan to the redesign in `../design2/`.
