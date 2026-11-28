---
'platejs': patch
---

Move combobox trigger policy (`trigger`, `triggerPreviousCharPattern`, `triggerQuery`, `maxQueryLength`, `queryPattern`, `label`) and `syncPopup` onto `useCombobox` in `platejs/combobox/react`, export `ComboboxCompletion` and `ComboboxPopupState`, and remove the headless `platejs/combobox` entrypoint (`ComboboxState`, `ComboboxEditor`, `filterWords`, `FilterWordsOptions`, `FootnotePluginState`).
