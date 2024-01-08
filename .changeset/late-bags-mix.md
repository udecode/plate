---
"@udecode/plate-core": minor
---

- Introduce `PlateController` as a way of accessing the active editor from an ancestor or sibling of `Plate` (see [Accessing the Editor](https://platejs.org/docs/accessing-editor#from-a-sibling-or-ancestor-of-plate)).
- Add `primary` prop to `Plate` (default true)
- Add `isFallback` to `editor` instance (default false)
- The following hooks now throw a runtime error when used outside of either a `Plate` or `PlateController`, and accept a `debugHookName` option to customize this error message:
  - `useIncrementVersion`
  - `useRedecorate`
  - `useReplaceEditor`
  - `useEditorMounted` (new)
  - `useEditorReadOnly`
  - `useEditorRef`
  - `useEdtiorSelection`
  - `useEditorSelector`
  - `useEditorState`
  - `useEditorVersion`
  - `useSelectionVersion`
- Change the default `id` of a `Plate` editor from `'plate'` to a random value generated with `nanoid/non-secure`
