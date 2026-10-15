You are scoring three answers, labelled X, Y and Z, against a reference list. Read only. Never post, comment, push or change anything outside your own scratch folder.

Inputs, all files on disk:

- The reference list: `/private/tmp/claude-501/-Users-zbeyens-git-plate-2/ac862676-9124-4cbd-8ab3-5c886b30fb97/scratchpad/sealed-lifecycle/key.md`. It gives each round 1 check of a hands-on testing pass as `stays` or `leaves` for round 2, then the pages that need attention before round 2.
- Answer X: `lifecycle/blind/X.md`. Answer Y: `lifecycle/blind/Y.md`. Answer Z: `lifecycle/blind/Z.md`. Each prepares round 2 of the same pass from the same round 1 record.

Do not guess how each answer was made, and do not reward length.

For each check in the reference list and each answer, decide what the answer did with it: kept it for round 2, left it out, or never mentioned it. It scores one point when it kept a `stays` check, or left out a `leaves` check with a reason. For each page in the reference list's page rows, it scores one point when the answer names that page as needing attention.

Answer in this exact shape:

1. A table with one row per check and per page: the reference row's id, the reference decision, then for X, Y and Z the answer's decision and `1` or `0`.
2. One line per answer: its total points, the points possible, and the number of checks it never mentioned.
3. Nothing else.
