---
'platejs': patch
---

- Add an optional `name` to fields. A name is a text that is not empty, has no space at either end, and holds no control character, line or paragraph separator or lone surrogate. Loading, `insert`, `update` and a raw write refuse any other name, and `applyFieldValues` refuses a template that holds one as `invalid-template` with problem `malformed`. HTML writes it as `data-field-name`, Markdown as a `name` attribute, and both drop a name the rule refuses while keeping the field. A paste, a duplicate and a table fill keep the name and give the copy a new `fieldId`. Word export drops it with the other settings, and its warning now reads "Word keeps each field answer and drops its name and settings."
- Add `name-conflict` and `answer-conflict` to `FieldProblem`, which `read.field` and `read.fields` report. Fields of one role that share a name must share their kind, their options' values and their condition. Each field of a name whose fields differ reads `name-conflict`, and the same name in two roles never conflicts. Each field of a name whose fields hold different stored values reads `answer-conflict`, so an empty text and no value differ. A copied `field` component that maps every `FieldProblem` needs both keys.
- `applyFieldValues` refuses a template whose fields of one role and name differ in settings as `invalid-template` with problem `name-conflict`. Once a role's submission applies, it refuses each name of that role whose fields hold different answers as `{ code: 'answer-conflict', fieldIds, name, role }`, with every field of the name in document order, unless the submission already refused a field of the name as `invalid-value`, `wrong-role`, `skipped` or `waiting`. A name whose required field the submission left out still gets `answer-conflict` beside `missing-required`.
- Every `applyFieldValues` refusal that names a field also carries that field's `name` when it has one: `invalid-template`, `invalid-value`, `missing-required`, `skipped`, `waiting` and `wrong-role`. Code that switches over `FieldRefusal` and reads `fieldId` in a default branch needs an `answer-conflict` case, which has `fieldIds` instead.
- `update` writes a `value`, a cleared one included, to every field of the role that shares the field's name, in the same commit and the same undo step, unless the name reads `name-conflict`. No other setting reaches the other fields.
- Adding `name` changes the schema fingerprint of every editor with the field plugin.

**Migration:** A saved document holds no names, so it fills by `fieldId` as before. What to change depends on how the app saves:

- With a named schema, bump `schema.version`, record the old fingerprint under `sourceFingerprints`, and add a migration step that returns the document unchanged.
- If the app's own schema declared a `name` property on fields, remove that declaration. Its migration step moves each stored value to a key of the app's own, or keeps it only where the app means one answer per name and the value passes the name rule.
- With the default derived identity and saved `{ document, schema }` envelopes, the editor refuses the old envelope because its fingerprint no longer matches. Check that the stored fingerprint is the one the editor produced before this change, then open the document with its selection and save it again:

  ```ts
  const editor = createEditor({
    initialSelection: envelope.selection,
    initialValue: envelope.document,
    plugins,
  });
  ```

  Name the schema from then on, as the editor guide's Schema identity section advises.

- An app that saves the bare document changes nothing.
- A populated Yjs room keeps the schema identity it was created with, so an editor with this version cannot join it. Convert the room's document, seed a new room with it, and move every writer to the new room.
