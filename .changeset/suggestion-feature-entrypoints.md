---
'platejs': patch
---

Add `BaseSuggestionPlugin` at `platejs/suggestion` and `SuggestionPlugin`, `useSuggestionChanges`, `useSuggestionGroups`, and `useActiveSuggestion` at `platejs/suggestion/react` for reusable suggestion behavior.

Configure each mounted editor's suggestion view with `EditorRoot authored`, while loading saved proposals through the complete document value. Switch a mounted view between suggesting and editing with `editor.plugin(AuthoredPlugin).api.setView({ intent: 'propose' })` or `{ intent: 'edit' }`, and read it with `read.view()`.

While suggesting, record list edits, such as typing in a list item, Enter, indenting, joining two items or turning a paragraph into a list. A numbered item that a pending suggestion deletes takes no number. The items after it take the numbers that accepting the deletion gives them. Inside a table cell, record typing, deleting, Enter, formatting and pasted text, and refuse a change to the table itself, such as adding a row, merging cells or pasting across cells. Refuse every edit inside a code block, formatting included.

Keep pending suggestions and review controls visible when a view switches subsequent input between suggesting and editing.

Suggest as the editor's `userId`, or as the local user, `'local'`, when the editor has none.
