# Preserve Details editing and selection navigation

Status: executed, scoped implementation and acceptance complete
Playbook: opening-a-pr

## Brief

### What will change?

Details stays expanded when you press Enter in a document with suggested changes. Closing a block moves a writable editor's caret to its title, also when a read-only view closes it.

### What could go wrong?

A removed Details keeps its open key, so undo restores it open. Tests cover undo and both close paths. Browser proof covers Chromium with its default locale. The separate Chinese date hydration error remains outside this fix.

## Teach

An editor can show different views of the same document. Each view gives its displayed blocks temporary keys. Details previously looked up a displayed key in another view and treated a missing match as deletion.

Details no longer prunes open keys after document changes, so a key from another view is never mistaken for a deleted block, and undo restores a removed block open. A read-only view closes a block through the writable editor, which moves its selection out of the hidden body.

## Main changes

- Stop pruning open Details keys on document commits.
- Use the calling editable view for caret relocation, and the writable editor when a read-only view closes a block.
- Add authored-document, read-only and undo regression tests.

## Verification

- Original regression failed before the fix. The focused Details partition now passes 24 tests with 54 assertions.
- Final Chromium run passes 40 Enter cases with five repetitions and zero retries across `/blocks/playground` and `/blocks/details-demo`: outer and nested blocks, each at the middle and end of body text. Both blocks stay open, a paragraph is created, focus remains, and follow-up typing succeeds.
- Scoped lint, Details source partition types, and the changed spec typecheck pass. Full repository CI and other browser engines were not run.
- Two independent review rounds used three same-family fallback reviewers each because the Claude executable was unavailable. The first round found the read-only close exception. Its regression failed before the correction and passed afterward. The second round returned no findings.

## Demo

1. Start the local www app and open `http://localhost:3000/blocks/playground`. Expand the outer and nested Details under Callouts and Details. Press Enter in either body. Both blocks should remain expanded and accept more text.
2. Open `http://localhost:3000/blocks/details-demo` and repeat the same interaction in the standalone example.

## Scope

The public API and persisted document shape do not change. Date formatting, browser locale hydration, dependencies, and agent instructions are outside this change. Follow-up fixes also update the registry changelog.

## Close

The code and focused acceptance checks are complete. Final trail review required a five-repeat browser run, which now passes all 40 cases. Exact model and effort identifiers for inherited review seats were not exposed by the runtime; review diversity is limited to one family. Browser observations do not establish behavior in other engines or with the user's extensions. No agent instruction files were edited.


## Follow-up fixes

The same PR also covers Details body selection and keyboard selection behavior.

- Enter creates a body paragraph after drag-and-drop leaves a Details block empty.
- Marquee selection targets the intended body row. Selecting a Details header still selects its container.
- Arrow keys retain block selection, Shift extends it, and context menus preserve an existing multi-selection.
- Equation popovers use the visible collapsed-selection state, so text expansion does not open them.

Mouse-edge drag autoscrolling and drag-handle menu expansion remain separate work.

### Follow-up verification

- Details partition: 25 tests passed.
- Chromium: Details body block navigation and context-menu cases passed.
- Targeted typechecks, scoped source lint, generated changelog checks, and whitespace checks passed. Full repository CI and other browser engines have not been rerun for this update.

## Babysit repair

The PR babysit replaced the view map with no pruning, restored the selection move for read-only closes, limited block arrow keys to mounted sibling blocks they can move between, and moved keyboard text-selection scrolling out of this PR.
