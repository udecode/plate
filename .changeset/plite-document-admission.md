---
'plitejs': patch
---

Refuse a top-level document field other than `children`, `meta` and `roots` instead of dropping or accepting it. `createEditor({ initialValue })`, `editor.read.schema.assertDocument`, `fitDocument`, persisted envelopes and `createEditorView(editor, { document })` all refuse it. `value.replace` also admits `selection`; a root-bound view's `value.replace` admits only `children` and `selection`; and a `plugins.reconfigure` or `install` `migrate` callback returns only `children` and `roots`. Store application data in `meta`.

A document view validates a caller's document on every `createEditorView` call and a document returned by `editor.read.value()` once.
