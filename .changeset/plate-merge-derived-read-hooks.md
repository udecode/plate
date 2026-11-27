---
'platejs': patch
---

Merge derived-read React hooks (`useEditorState`, `useEditorRuntimeState`, `useRuntimeState`, `useRootState`, and `useEditorViewState`) into `useEditorSelector` with both context and explicit-editor overloads plus view-state `dependsOn` tokens (`'authored'`, `'composing'`, `'focused'`, `'readOnly'`, and `'view'`).
