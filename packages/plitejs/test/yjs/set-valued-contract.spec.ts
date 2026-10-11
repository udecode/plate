import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { history } from '../../src/history';
import {
  createEditor,
  defineEditorSchema,
  property,
  schema,
} from '../../src/index';
import {
  createSeededYjsHistoryPeers,
  paragraph,
  syncConnectedPeers,
} from './support/collaboration';

const Comments = defineEditorSchema('schema:yjs-set-valued', {
  elements: { paragraph: { content: schema.content.text() } },
  properties: [
    schema.textProperty('commentIds', property.set(property.string())),
  ],
  root: schema.content.not(schema.content.text()),
});

describe('plitejs/yjs set-valued property contract', () => {
  it('converges concurrent members whose locale and code-unit orders differ', () => {
    const children = [paragraph('ab')];
    const peers = createSeededYjsHistoryPeers({
      children,
      clientIds: ['a', 'b'],
      createEditor: () =>
        createEditor({
          initialValue: children,
          plugins: [Comments, history()],
        }),
    });
    const [a, b] = peers;

    a.editor.update.nodes.set({ commentIds: ['b'] }, { at: [0, 0] });
    b.editor.update.nodes.set({ commentIds: ['B'] }, { at: [0, 0] });
    syncConnectedPeers(peers);

    for (const peer of [a, b]) {
      assert.deepEqual(peer.editor.read.children(), [
        {
          children: [{ commentIds: ['B', 'b'], text: 'ab' }],
          type: 'paragraph',
        },
      ]);
    }
  });
});
