import assert from 'node:assert/strict';
import { it } from 'node:test';

import { BaseParagraphPlugin, createEditor } from 'platejs';
import { authored } from 'platejs/authored';
import { authored as nativeAuthored } from 'plitejs/authored';

it('composes the exact native authored capability with Plate plugins', () => {
  assert.equal(authored, nativeAuthored);
  const editor = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    plugins: [BaseParagraphPlugin],
    initialValue: [{ type: 'paragraph', children: [{ text: 'Base' }] }],
  });
  let identity = '';
  editor.update((tx) => {
    identity = tx.authored.propose();
    tx.text.insert(' draft', { at: { path: [0, 0], offset: 4 } });
  });
  assert.deepEqual(editor.read.children(), [
    { type: 'paragraph', children: [{ text: 'Base' }] },
  ]);
  assert.equal(
    editor.update.authored.decide({
      action: 'accept',
      selection: editor.read.authored.select({ ids: [identity] }),
    }).status,
    'applied'
  );
  assert.deepEqual(editor.read.children(), [
    { type: 'paragraph', children: [{ text: 'Base draft' }] },
  ]);
});
