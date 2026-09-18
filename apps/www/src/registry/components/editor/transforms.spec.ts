import { describe, expect, it, mock } from 'bun:test';

import { BaseHeadingPlugin, type Selection, type Value } from 'platejs';
import { createEditor } from 'platejs/react';

import { BaseBasicBlocksKit } from './basic-blocks-static';
import { insertBlock } from './transforms';

const createTestEditor = ({
  selection = {
    kind: 'text',
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 0, path: [0, 0] },
  },
  initialValue = [{ children: [{ text: '' }], type: 'paragraph' }],
}: Partial<{
  initialValue: Value;
  selection: Selection;
}> = {}) =>
  createEditor({
    plugins: BaseBasicBlocksKit,
    selection,
    initialValue,
  });

describe('transaction block insertion policy', () => {
  it('skips a matching empty block for upsert after evaluating the predicate once', () => {
    const editor = createTestEditor();
    const matches = mock(() => true);
    const insert = mock(() => undefined);
    const before = editor.read.lastCommit();

    editor.update((tx) => {
      insertBlock(tx, { insert, matches }, { upsert: true });
    });

    expect(matches).toHaveBeenCalledTimes(1);
    expect(insert).not.toHaveBeenCalled();
    expect(editor.read.lastCommit()).toBe(before);
  });

  it('passes exact replacement policy to one typed insertion callback', () => {
    const editor = createTestEditor();
    const matches = mock(() => false);
    const insert = mock(() => undefined);

    editor.update((tx) => {
      insertBlock(tx, { insert, matches });
    });

    expect(matches).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith({
      replaceEmpty: true,
      select: true,
    });
  });

  it('replaces an empty block through one commit and one undo step', () => {
    const editor = createTestEditor();
    const before = editor.read.value();
    const version = editor.read.lastCommit()?.version ?? 0;

    editor.update((tx) => {
      const heading = editor.plugin(BaseHeadingPlugin);

      insertBlock(tx, {
        matches: (block) =>
          !block.listType &&
          block.type === heading.schema.type &&
          block.level === 2,
        insert: (options) => {
          tx.plugin(BaseHeadingPlugin).insert({ level: 2 }, options);
        },
      });
    });

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: '' }], level: 2, type: 'heading' },
    ]);
    expect(editor.read.lastCommit()?.version).toBe(version + 1);

    editor.api.history.undo();
    expect(editor.read.value()).toEqual(before);
  });

  it('preserves a nonempty source and selects the inserted block', () => {
    const editor = createTestEditor({
      initialValue: [{ children: [{ text: 'source' }], type: 'paragraph' }],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
    });

    editor.update((tx) => {
      const heading = editor.plugin(BaseHeadingPlugin);

      insertBlock(tx, {
        matches: (block) =>
          !block.listType &&
          block.type === heading.schema.type &&
          block.level === 1,
        insert: (options) => {
          tx.plugin(BaseHeadingPlugin).insert({ level: 1 }, options);
        },
      });
    });

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'source' }], type: 'paragraph' },
      { children: [{ text: '' }], level: 1, type: 'heading' },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });
});
