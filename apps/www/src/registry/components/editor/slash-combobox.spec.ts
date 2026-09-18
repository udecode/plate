import { describe, expect, it } from 'bun:test';

import { BaseHeadingPlugin, BaseParagraphPlugin, type Value } from 'platejs';
import { BaseComboboxPlugin } from 'platejs/combobox';
import { createEditor } from 'platejs/react';
import { BaseSlashPlugin } from 'platejs/slash-command';

import { BaseBasicBlocksKit } from './basic-blocks-static';

const createSlashEditor = () =>
  createEditor({
    plugins: [...BaseBasicBlocksKit, BaseSlashPlugin],
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }] as Value,
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

describe('slash insertion transaction', () => {
  it('composes input removal and typed insertion into one undo step', () => {
    const editor = createSlashEditor();

    editor.update.text.insert('/');

    const input = editor.key(editor.read.children()[0].children[1]);
    const before = editor.read.value();
    const version = editor.read.lastCommit()?.version ?? 0;

    expect(
      editor.plugin(BaseComboboxPlugin).api.commit(input, (tx) => {
        tx.plugin(BaseHeadingPlugin).upsert({ level: 2 }, { select: true });
      })
    ).toBe(true);
    expect(editor.read.children()[0]).toMatchObject({
      children: [{ text: '' }],
      level: 2,
      type: 'heading',
    });
    expect(editor.read.nodes.get(input)).toBeUndefined();
    expect(editor.read.lastCommit()?.version).toBe(version + 1);

    editor.api.history.undo();
    expect(editor.read.value()).toEqual(before);
  });

  it('removes only the input when upserting the matching empty block', () => {
    const editor = createSlashEditor();

    editor.update.text.insert('/');

    const input = editor.key(editor.read.children()[0].children[1]);
    const version = editor.read.lastCommit()?.version ?? 0;

    expect(
      editor.plugin(BaseComboboxPlugin).api.commit(input, (tx) => {
        tx.plugin(BaseParagraphPlugin).upsert({}, { select: true });
      })
    ).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
    expect(editor.read.nodes.get(input)).toBeUndefined();
    expect(editor.read.lastCommit()?.version).toBe(version + 1);
  });
});
