import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  definePlugin,
  type Element,
  property,
  schema,
} from 'plitejs';

import { history } from '../../src/history';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const record = (ctx: string) => ({
  children: [{ text: '' }],
  ctx,
  type: 'record',
});

const RecordsPlugin = definePlugin('records', {
  schema: {
    elements: {
      record: {
        content: schema.content.text({ default: 'text', min: 1 }),
        properties: { ctx: property.string() },
      },
    },
    roots: {
      $records: { content: schema.content.type('record'), history: 'retain' },
    },
  },
});

const createRecordingEditor = () => {
  const editor = createEditor({
    initialValue: [paragraph('Body')],
    plugins: [RecordsPlugin, history()],
  });

  editor.update((tx) => {
    tx.text.insert('!', { at: { offset: 4, path: [0, 0] } });
    tx.roots.create('$records', [record('c:a')]);
  });

  return editor;
};

describe('history with a retained root', () => {
  it('undoes the content a commit wrote and keeps its records', () => {
    const editor = createRecordingEditor();

    editor.api.history.undo();

    assert.deepEqual(editor.read.value(), {
      children: [paragraph('Body')],
      roots: { $records: [record('c:a')] },
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
        if (offset === 5) tx.roots.create('$records', [record('c:a')]);
      });
    };

    type(4, 'a');
    type(5, 'b');
    editor.api.history.undo();

    assert.deepEqual(editor.read.value(), {
      children: [paragraph('Body')],
      roots: { $records: [record('c:a')] },
    });
  });

  it('redoes the content beside the records it kept', () => {
    const editor = createRecordingEditor();

    editor.api.history.undo();
    editor.api.history.redo();

    assert.deepEqual(editor.read.value(), {
      children: [paragraph('Body!')],
      roots: { $records: [record('c:a')] },
    });
  });
});
