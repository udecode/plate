---
'plitejs': patch
---

Compare selector hook results by value by default. `useEditorSelector`, `useEditorState`, `useEditorRuntimeState`, `useEditorViewState`, `useNodeSelector`, `useTextSelector`, `useRuntimeState` and `useRootState` keep the earlier result when a selector returns a new list or plain object of up to 100 values with the same contents, so the component does not render again. Document nodes, React elements and class instances compare by identity. Pass `Object.is` as a call's `equalityFn` to compare its results by reference.
