---
'platejs': patch
---

Add `BaseSuggestionPlugin` at `platejs/suggestion` and `SuggestionPlugin`, `useSuggestionChanges`, `useSuggestionGroups`, and `useActiveSuggestion` at `platejs/suggestion/react` for reusable suggestion behavior.

Configure each mounted editor's suggestion view with `EditorRoot authored`, while loading saved proposals through the complete document value. Switch a mounted view between suggesting and editing with `editor.plugin(AuthoredPlugin).api.setView({ intent: 'propose' })` or `{ intent: 'edit' }`, and read it with `read.view()`.

While suggesting, record list edits, such as typing in a list item, Enter, indenting, joining two items or turning a paragraph into a list. A numbered item that a pending suggestion deletes takes no number. The items after it take the numbers that accepting the deletion gives them. Inside a table cell, record typing, deleting, Enter, formatting and pasted text. Record adding or deleting a whole table. Refuse a change to its rows, columns, cells or sizes, adding or deleting a block that holds a table, such as a column layout or a table that holds another table, and any change to a table that holds a code block. Refuse every edit inside a code block, formatting included.

Keep pending suggestions and review controls visible when a view switches subsequent input between suggesting and editing.

Suggest as the editor's `userId`, or as the local user, `'local'`, when the editor has none.
