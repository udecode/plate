---
date: 2026-05-04
topic: clawsweeper-batch-5-gitcrawl
status: done
skill: clawsweeper
---

# ClawSweeper Batch 5 With Gitcrawl

## Goal

Process a five-issue batch using the fresh gitcrawl mirror. This is a triage and
claim-routing pass, not a fix pass unless a narrow, proven code path drops out.

## Batch

- `#6051` Firefox Android Samsung Keyboard insertion failure
- `#6053` `useSelected` error when removing self
- `#3478` Redux integration crash
- `#4001` keyboard input / focus issue from weak cluster 3
- `#3497` Firefox accented input issue from weak cluster 3

## Rules

- Start with gitcrawl.
- Use live GitHub only to confirm status, comments, and details needed for the
  decision.
- Do not claim exact fixes without repro proof.
- Split weak cluster 3 instead of forcing one taxonomy.
- Update docs only; no GitHub comments, labels, closes, commits, pushes, or PRs.

## Phases

| Phase             | Status   | Output                                                          |
| ----------------- | -------- | --------------------------------------------------------------- |
| 1. Evidence fetch | complete | Gitcrawl threads/neighbors/search plus live GitHub issue reads. |
| 2. Classification | complete | Five issue decisions with bucket/confidence.                    |
| 3. Dossier write  | complete | Batch dossier under `docs/slate-v2/ledgers/`.                   |
| 4. Ledger sync    | complete | Update live ledger rows only if status/bucket changes.          |
| 5. Verification   | complete | Prettier and completion check.                                  |

## Current Findings

- `#6051` is a valid new live input-runtime issue. Gitcrawl neighbors place it
  near Android / Firefox / IME / DOM point import failures, but no exact
  duplicate was found.
- `#6053` is a likely-valid React hook stale-path issue. Current v2
  `useElementSelected` guards `Editor.range` with `Editor.hasPath`, so this is
  `improves-claimed`, not `fixes-claimed`.
- Gitcrawl cluster 3 is mixed, not a duplicate family:
  - `#3478`: external-store controlled-value feedback
  - `#3497`: parent-rerender focus loss
  - `#4001`: placeholder/IME DOM point desync
  - `#3777`: still pending
- No issue in this batch earned exact closure text.
