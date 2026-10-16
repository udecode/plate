You are writing a reference list of real editor bugs from the Plate project's history. Read only. Never post, comment, push or change anything outside your own scratch folder.

Plate is cloned at /Users/zbeyens/git/plate-2. Its stable branch is `origin/main`.

The pages, each a beta docs page at `https://beta.platejs.org/docs/<name>` beside `https://platejs.org/docs/<name>`: basic-blocks, basic-marks, list, details, table, code-block, link, mention, comment, suggestion, media, dnd, autoformat, slash-command, toc, callout.

1. List the fix commits with `git -C /Users/zbeyens/git/plate-2 log origin/main --format='%h %ad %s' --date=short --no-merges -i -E --grep='^fix' --since=2025-06-01 --until=2026-08-14 -- packages apps/www/src/registry`. Read each commit you consider with `git show --stat <sha>` and its message, and open the diff and any issue number its message names.
2. Pick 12 commits. Each must fix a bug that a person could see on one of the pages above with a mouse, keyboard, touch or paste, in Chrome, Safari or Firefox on a Mac or in Safari on an iPhone, in under two minutes of actions. Skip bugs that need Android, an input method editor, a collaboration server, an AI or upload service, or server rendering. Skip fixes to types, builds, lint, docs or tests only. Skip any bug whose symptom also appears in `docs/research/raw/2026-10-15-regression-sweep/census/census-a.tsv` or `census-b.tsv`.
3. Spread the 12 across kinds: caret or selection, selection paint, focus and toolbar or popup clicks, typing and deletion, Enter and line breaks, undo, paste, drag and drop, layout while scrolling, and features used together such as a list inside a toggle. No more than three of one kind and no more than three on one page.
4. For each pick, write one entry: an id K1 to K12, the page, the commit sha and date, what the user saw in one sentence, the exact actions that show it, the browser or device when the commit or issue names one, and what a person doing those actions must notice.

Your answer is the list itself, as Markdown, and nothing else: no preamble and no summary.
