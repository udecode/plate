import { describe, expect, it } from 'bun:test';

import { BaseHeadingPlugin, BaseParagraphPlugin, type Value } from 'platejs';
import { BaseComboboxPlugin } from 'platejs/combobox';
import { createEditor } from 'platejs/react';
import { BaseSlashPlugin } from 'platejs/slash-command';

import { BaseBasicBlocksKit } from './basic-blocks-static';
import { insertBlock } from './transforms';

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
        const heading = editor.plugin(BaseHeadingPlugin);

        insertBlock(
          tx,
          {
            matches: (block) =>
              !block.listType &&
              block.type === heading.schema.type &&
              block.level === 2,
            insert: (options) => {
              tx.plugin(BaseHeadingPlugin).insert({ level: 2 }, options);
            },
          },
          { upsert: true }
        );
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
        const paragraph = editor.plugin(BaseParagraphPlugin);

        insertBlock(
          tx,
          {
            matches: (block) =>
              !block.listType && block.type === paragraph.schema.type,
            insert: (options) => {
              tx.plugin(BaseParagraphPlugin).insert({}, options);
            },
          },
          { upsert: true }
        );
      })
    ).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
    expect(editor.read.nodes.get(input)).toBeUndefined();
    expect(editor.read.lastCommit()?.version).toBe(version + 1);
  });
});
