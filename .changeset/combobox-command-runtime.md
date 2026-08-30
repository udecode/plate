---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Remove the React combobox-input controller, `cursorState`, and `useHTMLInputCursorState`. Copy `inline-combobox` for input focus, cancellation, keyboard navigation, and undo/redo forwarding.

- Handle trigger-combobox insertion through the typed `insertText` command
- Keep transient collaboration metadata on inserted combobox inputs
- Rename `TriggerComboboxPluginOptions` to `TriggerComboboxPluginState`

**Migration:** Replace `withTriggerCombobox` with `BaseTriggerComboboxPlugin`, which declares the command behavior directly.
