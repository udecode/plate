import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, definePlugin, type Element } from 'plitejs';

import { history } from '../../src/history';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const RecordsPlugin = definePlugin('records', {
  schema: { records: { contexts: { history: 'retain' }, verdicts: {} } },
});

describe('history with a retained record set', () => {
  it('undoes the content and the undoable records a commit wrote and keeps its retained ones', () => {
    const editor = createEditor({
      initialValue: [paragraph('Body')],
      plugins: [RecordsPlugin, history()],
    });

    editor.update((tx) => {
      tx.text.insert('!', { at: { offset: 4, path: [0, 0] } });
      tx.records.put('contexts', 'c:a', { at: 1 });
      tx.records.put('verdicts', 'v:a', { at: 1 });
    });
    editor.api.history.undo();

    assert.deepEqual(editor.read.value(), {
      children: [paragraph('Body')],
      records: { contexts: { 'c:a': { at: 1 } } },
    });
  });

  it('merges typing that also writes a record into one undo step', () => {
    const editor = createEditor({
      initialValue: [paragraph('Body')],
      plugins: [RecordsPlugin, history()],
    });
    const type = (offset: number, text: string) => {
      editor.update({ tags: 'native-text-input' }, (tx) => {
        tx.text.insert(text, { at: { offset, path: [0, 0] } });
        tx.selection.set({ offset: offset + 1, path: [0, 0] });
        if (offset === 5) tx.records.put('contexts', 'c:a', { at: 1 });
      });
    };

    type(4, 'a');
    type(5, 'b');
    editor.api.history.undo();

    assert.deepEqual(editor.read.value(), {
      children: [paragraph('Body')],
      records: { contexts: { 'c:a': { at: 1 } } },
    });
  });
});
