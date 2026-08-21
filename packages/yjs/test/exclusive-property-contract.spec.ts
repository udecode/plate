import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  property,
  schema,
  SelectionApi,
} from '@platejs/plite';
import * as Y from 'yjs';

import { createYjsPeerWithEditor, paragraph } from './support/collaboration';

const ScriptPosition = schema.property.exclusive('plate:script-position');
const ScriptSchema = defineEditorSchema('schema:yjs-script-schema', {
  elements: {
    paragraph: { content: schema.content.text() },
  },
  id: 'yjs-script-schema',
  properties: [
    schema.textProperty('subscript', property.boolean(), {
      exclusive: [ScriptPosition],
    }),
    schema.textProperty('superscript', property.boolean(), {
      exclusive: [ScriptPosition],
    }),
  ],
  root: schema.content.type('paragraph'),
  unknown: 'reject',
  version: 1,
});

const selectText = (
  editor: ReturnType<typeof createEditor>,
  key: 'subscript' | 'superscript'
) => {
  editor.update.selection.set(
    SelectionApi.text({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    })
  );
  editor.update.marks.toggle(key);
};

describe('@platejs/yjs exclusive property contract', () => {
  it('converges concurrent exclusive mark writes to one schema-valid property', () => {
    const a = createYjsPeerWithEditor(
      createEditor({ extensions: [ScriptSchema] }),
      {
        children: [paragraph('text')],
        clientId: 'a',
      }
    );
    const b = createYjsPeerWithEditor(
      createEditor({ extensions: [ScriptSchema] }),
      {
        children: [paragraph('text')],
        clientId: 'b',
        seedUpdate: Y.encodeStateAsUpdate(a.doc),
      }
    );

    selectText(a.editor, 'subscript');
    selectText(b.editor, 'superscript');
    Y.applyUpdate(a.doc, Y.encodeStateAsUpdate(b.doc));
    Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc));

    const aText = a.editor.read.children()[0].children[0];
    const bText = b.editor.read.children()[0].children[0];
    const active = (text: typeof aText) =>
      ['subscript', 'superscript'].filter((key) => Object.hasOwn(text, key));

    assert.deepEqual(aText, bText);
    assert.equal(active(aText).length, 1);
    a.editor.read.schema.assertDocument(a.editor.read.value());
    b.editor.read.schema.assertDocument(b.editor.read.value());
    a.cleanup();
    b.cleanup();
  });
});
