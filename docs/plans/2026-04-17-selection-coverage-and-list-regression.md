# Selection Coverage And List Regression

## Goal

Expand rule regression coverage around selection placement after autoformat-style transforms, and fix the live list regression where typing `- ` keeps the dash instead of promoting to a list item.

## Phases

- [completed] Search existing learnings and test coverage for selection-sensitive rule behavior and list autoformat.
- [completed] Reproduce the live `- ` regression on the standalone block route.
- [completed] Add focused regression tests for selection placement on relevant rule families.
- [completed] Fix the root cause of the list regression.
- [completed] Verify with targeted tests, build/typecheck/lint, and browser proof.
- [in_progress] Reproduce the nested `> ` regression, add coverage, and fix it.
- [pending] Record or refresh learnings if the nested blockquote root cause is non-obvious.

## Findings

- Existing link/list/blockquote/code-block tests mostly locked structure and
  skipped caret assertions.
- The live `/blocks/list-demo` regression was real: typing `- ` produced a
  paragraph with list props but left the `-` text behind.
- Root cause: modern list markdown rules used custom `blockStart` `apply`
  handlers, and those handlers did not delete `match.range`. `list-classic`
  already handled this manually.
- Markdown link completion also had a real bug on `/blocks/link-demo`: it
  inserted the link node but left selection before it.

## Progress

- Loaded `testing`, `tdd`, `learnings-researcher`, `debug`, `planning-with-files`, and `dev-browser`.
- Started a batch pass instead of treating link selection and list autoformat as isolated one-offs.
- Added selection assertions across the current rule coverage that can be
  modeled honestly: list, markdown link, blockquote, code block, and the broad
  playground rule suite.
- Fixed modern list markdown rules to delete matched marker text before toggling
  list props.
- Fixed markdown link automd to move selection after the inserted link.
- Added a shipped-surface regression for `ListKit` and verified the live route
  on `3001`.
- Documented the non-obvious root cause in
  `docs/solutions/logic-errors/2026-04-17-custom-block-start-list-rules-must-delete-matched-marker-text.md`.
- Documented the link caret fix in
  `docs/solutions/logic-errors/2026-04-17-markdown-link-automd-must-move-selection-after-inserted-link.md`.

## Errors

- None yet.
