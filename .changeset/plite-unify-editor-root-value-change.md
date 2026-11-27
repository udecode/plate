---
'plitejs': patch
---

Unify `EditorRoot` `onValueChange` to emit the full `EditorDocumentValue` on document or persisted-state changes, align `CommitContext`, `SelectionChangeContext`, and `ValueChangeContext` to take `<E>`, drop unused `authorId` and `document` props from `EditorRootProps`, and recreate `useCreateEditor` when `options.id` changes

**Migration:** Read `value.children` (or `value.roots`) in `onValueChange` handlers, and pass the editor type (for example `ValueChangeContext<typeof editor>`) instead of a value array type to commit context generics.
