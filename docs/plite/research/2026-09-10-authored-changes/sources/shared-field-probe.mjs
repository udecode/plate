import assert from 'node:assert/strict';
import * as Y from '../../../../../packages/plitejs/node_modules/yjs/dist/yjs.mjs';

import {
  createEditor,
  defineStateField,
  defineValueCodec,
} from '../../../../../packages/plitejs/src/index.ts';
import { yjs } from '../../../../../packages/plitejs/src/yjs/core/extension.ts';

const records = defineStateField({
  collab: 'shared',
  initial: () => [],
  key: 'research.record-ids',
  persist: defineValueCodec({
    decode(value) {
      assert.ok(Array.isArray(value) && value.every((id) => typeof id === 'string'));
      return [...value];
    },
    encode: (value) => value,
    version: 1,
  }),
});

const sync = (source, target) => {
  Y.applyUpdate(target, Y.encodeStateAsUpdate(source, Y.encodeStateVector(target)));
};
const peer = (doc) => {
  const editor = createEditor({
    extensions: [records],
    initialValue: [{ type: 'paragraph', children: [{ text: 'accepted' }] }],
  });
  const cleanup = editor.install(yjs({ doc, rootName: 'research-shared-field' }));
  return { cleanup, doc, editor };
};

const a = peer(new Y.Doc());
const bDoc = new Y.Doc();
sync(a.doc, bDoc);
const b = peer(bDoc);
sync(b.doc, a.doc);

try {
  a.editor.update((tx) => tx.setField(records, ['alice-record']));
  b.editor.update((tx) => tx.setField(records, ['bob-record']));
  sync(a.doc, b.doc);
  sync(b.doc, a.doc);
  await new Promise((resolve) => setTimeout(resolve, 0));
  sync(a.doc, b.doc);
  sync(b.doc, a.doc);
  const first = a.editor.read.getField(records);
  const second = b.editor.read.getField(records);
  const stateVectorsEqual = Buffer.from(Y.encodeStateVector(a.doc)).equals(
    Buffer.from(Y.encodeStateVector(b.doc))
  );
  assert.deepEqual(a.doc.toJSON(), b.doc.toJSON());
  console.log(JSON.stringify({
    case: 'concurrent-shared-field-replacements',
    first,
    second,
    stateVectorsEqual,
    sharedDocumentJsonEqual: true,
    acceptedText: a.editor.read.text.string([]),
    expected: 'Matching active shared-field values after full synchronization.',
    observation: 'Concurrent absolute replacements are not a merge contract for independent records.',
  }));
  assert.equal(stateVectorsEqual, true);
  assert.deepEqual(first, second);
  assert.equal(a.editor.read.text.string([]), 'accepted');
  assert.equal(b.editor.read.text.string([]), 'accepted');
} finally {
  a.cleanup();
  b.cleanup();
  a.doc.destroy();
  b.doc.destroy();
}
