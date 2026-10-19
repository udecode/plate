# Picking trial keep rule

Frozen before any arm runs. Arm B is the incumbent, the project's `verify` skill alone. Arm C is the candidate the first trial left, `verify` plus the Human pass section in `section.md`, whose only change from the first trial is that it no longer calls the census fixes bugs that reached beta with passing tests. The grader sees the arms only as labels; the label map is sealed outside the repository and opened only after the grader answers.

- The key is a separate agent's list of 12 Plate bugs fixed on `origin/main` from 2025-06-01 to 2026-08-14 on the 16 named pages, leaving out any bug the census records. The lead never reads it before grading ends.
- Each arm is credited with the bugs its checks catch within 150 minutes of estimated hands-on time, by the first trial's grading rule.
- The key is inconclusive when it holds fewer than 8 usable entries; then `verify` alone stays.
- Adopt C when it catches at least two more key bugs than B.
- Otherwise `verify` alone stays, and the plan says no tested way of aiming cards at past bugs beat it.
- Each arm runs once, in a fresh session at the repository snapshot, on `claude-opus-5-5 @high`, so the arms differ only in their instructions.
