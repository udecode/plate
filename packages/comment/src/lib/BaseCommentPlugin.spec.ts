import type { Value } from '@platejs/slate';

import { type TCommentText, createSlateEditor } from 'platejs';

import { BaseCommentPlugin } from './BaseCommentPlugin';

const createCommentEditor = (value: Value) =>
  createSlateEditor({
    plugins: [BaseCommentPlugin],
    value,
  });

const getCommentText = (
  editor: ReturnType<typeof createCommentEditor>,
  index: number
) => editor.children[0].children[index] as TCommentText;

describe('BaseCommentPlugin', () => {
  it('finds comment nodes across the document when searched with at: []', () => {
    const editor = createCommentEditor([
      {
        children: [
          { comment: true, comment_one: true, text: 'a' },
          {
            comment: true,
            commentTransient: true,
            comment_draft: true,
            comment_two: true,
            text: 'b',
          },
        ],
        type: 'p',
      },
    ]);

    expect(editor.api.comment.has({ id: 'one' })).toBe(true);
    expect(editor.api.comment.node({ id: 'one', at: [] })?.[1]).toEqual([0, 0]);
    expect(editor.api.comment.nodes({ id: 'two', at: [] })).toHaveLength(1);
    expect(editor.api.comment.nodes({ isDraft: true, at: [] })).toHaveLength(1);
    expect(editor.api.comment.nodes({ transient: true, at: [] })).toHaveLength(
      1
    );
  });

  it('returns the last comment id for normal leaves and undefined for draft leaves', () => {
    const editor = createCommentEditor([
      {
        children: [
          {
            comment: true,
            comment_one: true,
            comment_two: true,
            text: 'a',
          },
          {
            comment: true,
            comment_draft: true,
            comment_three: true,
            text: 'b',
          },
        ],
        type: 'p',
      },
    ]);

    expect(editor.api.comment.nodeId(getCommentText(editor, 0))).toBe('two');
    expect(
      editor.api.comment.nodeId(getCommentText(editor, 1))
    ).toBeUndefined();
  });

  it('marks the selected text as a draft comment', () => {
    const editor = createCommentEditor([
      {
        children: [{ text: 'ab' }],
        type: 'p',
      },
    ]);

    editor.selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    };

    editor.update((tx) => tx.comment.setDraft());

    expect(editor.children[0].children[0]).toMatchObject({
      comment: true,
      comment_draft: true,
      text: 'ab',
    });
  });

  it('keeps the base comment flag when removing one overlapping comment id', () => {
    const editor = createCommentEditor([
      {
        children: [
          {
            comment: true,
            comment_one: true,
            comment_two: true,
            text: 'a',
          },
        ],
        type: 'p',
      },
    ]);

    editor.update((tx) => tx.comment.unsetMark({ id: 'one' }));

    expect(editor.children[0].children[0]).toMatchObject({
      comment: true,
      comment_two: true,
      text: 'a',
    });
    expect(editor.children[0].children[0]).not.toHaveProperty('comment_one');
  });

  it('removes the base comment flag when the last comment id is removed', () => {
    const editor = createCommentEditor([
      {
        children: [
          {
            comment: true,
            comment_one: true,
            text: 'a',
          },
        ],
        type: 'p',
      },
    ]);

    editor.update((tx) => tx.comment.unsetMark({ id: 'one' }));

    expect(editor.children[0].children[0]).toEqual({ text: 'a' });
  });

});
