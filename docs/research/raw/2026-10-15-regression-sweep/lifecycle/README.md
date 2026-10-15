# Bookkeeping trial

The second skill trial for `docs/plans/2026-10-15-regression-sweep.md`, run on 2026-10-15. It asked whether the sweep prototype's `round 2` mode prepares the next hand-testing round better than `verify` alone.

- `key-writer.md` is the brief a separate `gpt-6.1-sol @high` agent answered with a round 1 record, a test index, the pages in scope and the key, in one reply. `split.mjs` split that reply into `fixture/` and `key.md` without printing either.
- `keep-rule.md`, `grader.md`, `arm-base.md`, `arm-methods.md`, `section.md` and `proto/` were frozen by hash in `freeze.sha256` before any arm ran. `freeze.run1.sha256` is the first freeze; only the arm prompts' paths differ.
- The arm prompts name a scratch folder outside the repository: `snap-<arm>/round-data/` is `fixture/`, `snap-P/qa-rounds/` is `proto/`, and `snap-S/qa-notes/next-round.md` is `section.md`. `snapshots.sh` built each arm's snapshot from a `git archive` of `b1e70bb257`.
- `arm-*-out.run1-no-read.md` are the first runs, which could not open their inputs. `arm-*-out.md` are the reruns, and `arm-reads.txt` lists what each rerun read.
- `blind/` holds the copies the grader saw, `grade-out.md` its answer, and `arm-map.txt` the label map, opened after grading.

Result: P, V and S each scored 18 of 18, so `verify` alone stays.
