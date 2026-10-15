You are scoring two hands-on QA checklists, labelled X and Y, against a list of real editor bugs. Read only. Never post, comment, push or change anything outside your own scratch folder.

Inputs, all files on disk:

- The bug list: `{{KEY}}`. Each entry K1 to K12 names a page, what the user saw, the actions that show it and what a person must notice.
- Checklist X: `{{X}}`. Checklist Y: `{{Y}}`.

The checklists were written for a hands-on pass over 16 beta docs pages at https://beta.platejs.org/docs/<name>, checked against https://platejs.org/docs/<name>, within 150 minutes of hands-on time. Do not guess how each checklist was made, and do not reward length.

For each bug and each checklist, decide whether a person who does exactly that checklist's checks, in order, would see the bug. It counts as caught only when one check:

1. runs on the bug's page, or on another page where the same actions show the same bug;
2. includes the bug's triggering actions, or actions that necessarily include them, in a browser or device where the bug shows; and
3. tells the person to look for something the bug visibly breaks.

Count a check only within its checklist's first 150 minutes, by the checklist's own estimates in order. A check with no estimate counts as 5 minutes.

Answer in this exact shape:

1. A table with one row per bug: the bug id, then for X and Y either the caught check's id or "no", each with a reason of at most 15 words.
2. One line per checklist: bugs caught, total estimated minutes, minutes counted, and the number of checks that lack a page, steps or an expected result.
3. Nothing else.
