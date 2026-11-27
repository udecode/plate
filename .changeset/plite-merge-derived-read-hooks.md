---
'plitejs': patch
---

Merge derived-read React hooks (`useEditorState`, `useEditorRuntimeState`, `useRuntimeState`, `useRootState`, and `useEditorViewState`) into `useEditorSelector`, add view-state `dependsOn` tokens (`'authored'`, `'composing'`, `'focused'`, `'readOnly'`, and `'view'`), export `useModelEditor` from `plitejs/react`, and fix stale-view `readOnly` locking for absent roots.
