---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Autocomplete queries are ordinary editor text. Typing a feature's trigger opens its popup over the text after the trigger; completion replaces the trigger and query in one undo step, and Escape keeps the typed text.

- Add `useCombobox({ editableRef, plugin })` in `platejs/combobox/react` for popups mounted in `slots.afterEditable`; it returns the open `match`, `complete(match, callback)` and `dismiss()`
- Return `false` from a completion callback to refuse an option and keep the query; a thrown or async callback rolls back
- Keep trigger policy in plugin state as `ComboboxState`, including `queryPattern` and `maxQueryLength`
- Remove the mention, slash, emoji and footnote input plugins and elements, `BaseComboboxPlugin`, `triggerCombobox` and `TriggerComboboxPluginState`

**Migration:** Mount each feature's popup with `Plugin.configure({ slots: { afterEditable: FeatureCombobox } })` instead of configuring an input plugin's `component`, and replace `TriggerComboboxPluginState` with `ComboboxState`. Run stored documents through `migrateV54`, which turns saved input nodes back into their typed text.
