---
feature: suggestions
reference: Google Docs suggesting mode
routes: [/docs/suggestion, /dev/authored-review]
paths: [packages/plitejs/src/authored, packages/platejs/src/authored, packages/platejs/src/features/suggestion, packages/platejs/src/react/features/suggestion, apps/www/src/registry/components/editor/suggestion.tsx, apps/www/src/registry/components/editor/suggestion-toolbar-button.tsx, apps/www/src/registry/examples/suggestion-demo.tsx, apps/www/src/app/dev/authored-review]
www-specs: [tests/browser/suggestion.spec.ts, tests/browser/suggestion-page.spec.ts, tests/browser/suggestion-refusal.spec.ts, tests/browser/suggestion-inline-void.spec.ts, tests/browser/authored-review.spec.ts]
plite-specs: [tests/plite-browser/authored-changes.spec.ts, tests/plite-browser/suggestion-first-paint.spec.ts]
---

# Suggestions scenarios

What a writer and a reviewer expect from suggestions, taken from Google Docs' suggesting mode. Where the Authored changes law in `docs/vision/plite.md` differs from Docs, the law wins and the Expected cell says `Law:`. `verify`'s playtest reference says how to drive this list.

## Read back

Read the result from the editor's DOM after every step, not from a screenshot alone. Each text leaf carries `data-editor-authored-kind` (`insert` or `delete`), `data-editor-authored-author`, `data-editor-authored-change` and `data-editor-authored-groups`; text written inside another pending change also names its context. A block's `split`, `join` and `format` kinds sit on the block element. The review cards list one card per group with its author, summary and reply count. Accept and Reject on a card show only on hover.

Drive `/docs/suggestion`'s preview as `alice` for single-author rows. `/dev/authored-review` holds pending changes by `bob` and `charlie` beside plain text, struck text and struck blocks, with an Editing and Suggesting switch.

## Scenarios

| # | Action in Suggesting mode | Expected |
| --- | --- | --- |
| S1 | Type a word mid-sentence | Colored insertion by the writer, one card naming them |
| S2 | Keep typing right after it | The same insertion grows; still one card |
| S3 | Backspace inside my own insertion | Characters are removed, not struck |
| S4 | Backspace one plain character | The character is struck, not removed; a deletion card |
| S5 | Select a word and press Delete | The word is struck; one deletion card |
| S6 | Select a word and type over it | One replacement: old struck, new inserted, one "Replace" card |
| S7 | Enter in the middle of a line | A suggested split; the second half shows on a new line with a paragraph mark |
| S8 | Backspace at the start of a line | A suggested join with the line above, shown as a struck paragraph mark |
| S9 | Bold a word, then unbold my own pending bold | A format card shows the change; unbolding my own pending bold cancels it |
| S10 | Accept one card | The change applies; its marks and card disappear |
| S11 | Reject one card | The change reverts exactly; its card disappears |
| S12 | Undo right after a suggestion, then redo | Undo removes the suggestion and nothing else; redo brings it back |
| S13 | Switch to Editing and type, then Backspace | Plain text and plain deletion, no suggestion |
| S14 | Type, then Enter, at the end of a list item | The text shows as an insertion; Enter suggests a new list item |
| S15 | Turn a paragraph into a heading with `#` and a space | A block format suggestion |
| S16 | Select from mid-line into the next line and delete | Both parts struck and the join suggested; no text lost. Law: one author's adjacent pending changes share one card |
| S17 | As a second author, type inside the first author's insertion | The text belongs to the second author, nested inside the first author's insertion |
| S18 | As a second author, delete the first author's inserted text | Law: it stays in place, struck as the second author's deletion over the insertion |
| S19 | Accept all, then reject all on a fresh set | Every card resolves; the result matches resolving each card in turn |
| S20 | Save, edit, then reload the saved snapshot | Pending suggestions and their cards come back; edits after the save do not |
| S21 | As a second author, type inside the first author's insertion, then Backspace that text | My own text disappears; the first author's insertion is whole again |
| S22 | In Editing, select across a pending join and delete | The two lines become one, as a plain editor joins them |
| S23 | Switch the view to Accepted, then Proposed | Accepted shows the document without pending changes, Proposed with all of them; both throw on a plain edit, but some other writes still change the document through them, such as an update that makes a decision, and undo and redo; t_f485ac77 (owner zbeyens) decides which of them a preview refuses. Remote collaboration changes land whatever the view |
| S24 | Reply on a card | The reply posts under the card and its count goes up |
