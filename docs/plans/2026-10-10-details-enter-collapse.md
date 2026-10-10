# Preserve Details editing and selection navigation

Status: executed, scoped implementation and acceptance complete
Playbook: opening-a-pr

## Brief

### What will change?

Details stays expanded when you press Enter in a document with suggested changes. Closing a block moves the caret to its title in editable views and leaves selection unchanged in read-only views.

### What could go wrong?

Disclosure cleanup must still remove deleted blocks. Tests cover cleanup and both close paths. Browser proof covers Chromium with its default locale. The separate Chinese date hydration error remains outside this fix.

## Teach

An editor can show different views of the same document. Each view gives its displayed blocks temporary keys. Details previously looked up a displayed key in another view and treated a missing match as deletion.

The plugin now remembers which view opened each block and uses that view to check whether the block still exists. Read-only views can close blocks without attempting to move the shared selection.

## Main changes

- Resolve open Details keys through their originating editor views.
- Use the calling editable view for caret relocation, and skip selection writes for read-only views.
- Clear view records when blocks close, disappear, or the plugin is cleaned up.
- Add authored-document and read-only regression tests. Amend the existing unreleased Details changeset.

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
- Text navigation retains visual-line affinity and writes resolved positions through the native-input selection path. Document-edge scrolling includes editor padding.
- DOM coverage selection exports also scroll the actual focus. This fixes middle-paragraph selections that extend beyond closed Details while the viewport stops.
- Equation popovers use the visible collapsed-selection state, so text expansion does not open them.

The navigation path reuses existing selection state and scroll callbacks. Absolute selection commands retain their table policy. Mouse-edge drag autoscrolling and drag-handle menu expansion remain separate work.

### Follow-up verification

- Details partition: 25 tests passed.
- Focused selection controller, reconciler, DOM coverage, and external-text contracts: 150 tests passed.
- Chromium: held-arrow and individual-keypress middle-paragraph cases each passed five repetitions, with focus visibility checked after every downward step. Reverse navigation reached the document start.
- Eight regression cases passed for ordinary text scrolling, authored and column starting points, Details body block navigation, and context menus.
- Earlier document-boundary checks passed five repetitions for each of three normal-viewport starting points, plus a separate short-viewport edge-stability case.
- Targeted typechecks, scoped source lint, generated changelog checks, and whitespace checks passed. Full repository CI and other browser engines have not been rerun for this update.
