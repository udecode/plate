---
'platejs': major
---

Replace `editor.runtime` with a fixed `editor.userId`. An editor created without `userId` writes and comments as the local user, `'local'`, so solo editors and AI suggestions need no setup.

- Rebuild the `useCreateEditor` editor when `userId` changes
- Throw when `userId` contains a NUL character
- Warn once in development when an editor with a Yjs plugin writes or comments as the local user
- Install authored changes with `AuthoredPlugin` from `platejs/authored`
- Allocate its own editor in `createEditor` and `useCreateEditor`, and throw on an `editor` option

**Migration:** Read `editor.userId` instead of `editor.runtime.userId`. To switch users, create a new editor from the old editor's document and comments instead of assigning a new user. Instead of passing a prebuilt editor as `editor`, pass its document as `initialValue` and its selection as `selection`, and render an editor you already have with `EditorRoot`.
