import { createBaseEditor } from '@platejs/core';
import type { Selection, Value } from '@platejs/plite';
import type { TCommentText } from '@platejs/utils';

import { BaseCommentPlugin } from './BaseCommentPlugin';

const createCommentEditor = (value: Value, selection: Selection = null) =>
  createBaseEditor({
    plugins: [BaseCommentPlugin],
    selection,
    value,
  });

describe('BaseCommentPlugin', () => {
  it('finds comment nodes across the document', () => {
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
    expect(editor.api.comment.has({ id: 'missing' })).toBe(false);
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
    const normal = editor.api.comment.node({ at: [], id: 'two' });
    const draft = editor.api.comment.node({ at: [], isDraft: true });

    if (!normal || !draft) {
      throw new TypeError('Expected normal and draft comment leaves');
    }

    expect(editor.api.comment.nodeId(normal[0])).toBe('two');
    expect(editor.api.comment.nodeId(draft[0])).toBeUndefined();
  });

  it('marks the selected text as a draft comment', () => {
    const editor = createCommentEditor(
      [{ children: [{ text: 'ab' }], type: 'p' }],
      {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      }
    );

    editor.update.comment.setDraft();

    expect(editor.read.nodes.get<TCommentText>([0, 0])?.[0]).toMatchObject({
      comment: true,
      comment_draft: true,
      text: 'ab',
    });
  });

  it('removes every comment mark from selected text', () => {
    const editor = createCommentEditor(
      [
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
      ],
      {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      }
    );

    editor.update.comment.removeMark();

    expect(editor.read.nodes.get<TCommentText>([0, 0])?.[0]).toEqual({
      text: 'a',
    });
  });

  it('does nothing when removeMark has no active comment node', () => {
    const editor = createCommentEditor([
      { children: [{ text: 'a' }], type: 'p' },
    ]);

    editor.update.comment.removeMark();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'a' }], type: 'p' },
    ]);
  });

  it('keeps the base flag when removing one overlapping comment id', () => {
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

    editor.update.comment.unsetMark({ id: 'one' });

    expect(editor.read.nodes.get<TCommentText>([0, 0])?.[0]).toEqual({
      comment: true,
      comment_two: true,
      text: 'a',
    });
  });

  it('removes the base flag with the last comment id', () => {
    const editor = createCommentEditor([
      {
        children: [{ comment: true, comment_one: true, text: 'a' }],
        type: 'p',
      },
    ]);

    editor.update.comment.unsetMark({ id: 'one' });

    expect(editor.read.nodes.get<TCommentText>([0, 0])?.[0]).toEqual({
      text: 'a',
    });
  });

  it('removes a transient comment without inventing an id key', () => {
    const editor = createCommentEditor([
      {
        children: [{ comment: true, commentTransient: true, text: 'a' }],
        type: 'p',
      },
    ]);

    editor.update.comment.unsetMark({ transient: true });

    expect(editor.read.nodes.get<TCommentText>([0, 0])?.[0]).toEqual({
      text: 'a',
    });
  });

  it('normalizes stray comment flags and leaves draft comments alone', () => {
    const editor = createCommentEditor([
      {
        children: [
          { comment: true, text: 'a' },
          { comment: true, comment_draft: true, text: 'b' },
        ],
        type: 'p',
      },
    ]);

    editor.update.normalize({ force: true });

    expect(editor.read.children()).toEqual([
      {
        children: [
          { text: 'a' },
          { comment: true, comment_draft: true, text: 'b' },
        ],
        type: 'p',
      },
    ]);
  });
});
