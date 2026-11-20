---
'platejs': patch
---

Add a `caret` plugin slot, rendered after the Editable. Inside it, `useEditor()` and the `editableRef` prop answer for the view that holds the caret while that view is the editing area's own view or a view mounted inside it, such as a board note. Otherwise they answer for the editing area's own view. A floating toolbar in this slot follows the caret into a note, where one in `afterEditable` stays on its editing area.
