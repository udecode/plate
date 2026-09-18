import assert from 'node:assert/strict';
import { it } from 'node:test';

import { createEditor, createEditorView, NodeApi } from 'plitejs';
import { authored } from 'plitejs/authored';

import { getEditorNodeKeyForNode } from '../src/core/public-state';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

it('publishes a replacement key unchanged into an existing authored view', () => {
  const editor = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('before')],
  });
  const view = createEditorView(editor);
  const originalKey = view.key([0]);
  let replacementKey = originalKey;

  view.update((tx) => {
    tx.authored.propose();
    tx.nodes.replace(paragraph('after'), { at: [0], select: true });
    replacementKey = tx.key([0]);
  });
  view.api.authored.setView({ intent: 'propose', projection: 'markup' });

  assert.notEqual(replacementKey, originalKey);
  assert.equal(view.key([0]), replacementKey);
  assert.equal(view.read.nodes.get(originalKey!), undefined);
  assert.equal(
    NodeApi.string(view.read.nodes.get(replacementKey!)![0]),
    'after'
  );
});

it('resolves live nodes through an existing view after writes in either root', () => {
  const editor = createEditor({
    initialValue: {
      children: [paragraph('main')],
      roots: { notes: [paragraph('notes')] },
    },
  });
  const main = createEditorView(editor);
  const notes = createEditorView(editor, { root: 'notes' });

  for (const view of [main, notes]) {
    view.update((tx) => {
      tx.nodes.insert(paragraph('inserted'), { at: [1] });
      const node = tx.nodes.get([1, 0])?.[0];

      assert.ok(node && NodeApi.isDescendant(node));
      assert.equal(
        getEditorNodeKeyForNode(view, node),
        getEditorNodeKeyForNode(editor, node)
      );
    });

    const node = view.read.nodes.get([1, 0])?.[0];

    assert.ok(node && NodeApi.isDescendant(node));
    assert.equal(
      getEditorNodeKeyForNode(view, node),
      getEditorNodeKeyForNode(editor, node)
    );
  }

  assert.throws(
    () => getEditorNodeKeyForNode(main, { text: 'detached' }),
    /requires a live node/
  );
});
