import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, type Element } from 'plitejs';

import { readCoreWork } from '../../src/core/work';
import { history } from '../../src/history';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const redoDeleteAllOverSkippedEdit = (blocks: number) => {
  const editor = createEditor({
    initialValue: Array.from({ length: blocks }, (_, index) =>
      paragraph(`block ${index}`)
    ),
    plugins: [history()],
  });

  editor.update((tx) => {
    tx.text.delete({
      at: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: `block ${blocks - 1}`.length, path: [blocks - 1, 0] },
      },
    });
  });
  editor.api.history.undo();
  editor.update({ history: 'skip' }, (tx) => {
    tx.text.insert('!', { at: { offset: 0, path: [0, 0] } });
  });

  const before = readCoreWork().walkedSlots;
  const { status } = editor.api.history.redo();

  return { status, walkedSlots: readCoreWork().walkedSlots - before };
};

describe('history replay work', () => {
  it('redoes a whole-document delete over a skipped edit with work linear in the document', () => {
    const small = redoDeleteAllOverSkippedEdit(100);
    const large = redoDeleteAllOverSkippedEdit(400);

    assert.deepEqual(
      {
        statuses: [small.status, large.status],
        linear: large.walkedSlots < small.walkedSlots * 8,
      },
      { statuses: ['applied', 'applied'], linear: true },
      `walked ${large.walkedSlots} slots at 400 blocks and ${small.walkedSlots} at 100`
    );
  });
});
