---
'@udecode/plate-core': major
---

- Remove `editor.setPlateState`, use `usePlateSet` instead
- Zustand stores:
  - `eventEditorSelectors` -> `EventEditorStore.get`
  - `eventEditorActions` -> `EventEditorStore.set`
  - `useEventEditorSelectors` -> `useEventEditorValue(key)`
