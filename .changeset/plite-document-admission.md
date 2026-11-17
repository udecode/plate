---
'plitejs': patch
---

Refuse a top-level document field other than `children`, `meta` and `roots` instead of dropping or accepting it. `createEditor({ initialValue })`, `editor.read.schema.assertDocument`, `fitDocument`, persisted envelopes and `createEditorView(editor, { document })` all refuse it. `value.replace` also admits `selection`; a root-bound view's `value.replace` admits only `children` and `selection`; and a `plugins.reconfigure` or `install` `migrate` callback returns only `children` and `roots`. Store application data in `meta`. A record that holds `children` reads as a document even when it also holds `document`, so its error names `document`. `fitDocument` reports `undefined`, `NaN` or a function as a value that does not encode to JSON.

A document view reads a frozen copy of a document the caller built, so a later change to that object does not reach the view, and it validates the document again only after it changes.
