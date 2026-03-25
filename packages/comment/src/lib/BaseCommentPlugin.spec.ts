import { createSlateEditor } from 'platejs';

import { BaseCommentPlugin } from './BaseCommentPlugin';

const createCommentEditor = (value: any) =>
  createSlateEditor({
    plugins: [BaseCommentPlugin],
    value,
  });

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

    expect(
      editor.api.comment.nodeId(editor.children[0].children[0] as any)
    ).toBe('two');
    expect(
      editor.api.comment.nodeId(editor.children[0].children[1] as any)
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

    editor.tf.comment.setDraft();

    expect(editor.children[0].children[0]).toMatchObject({
      comment: true,
      comment_draft: true,
      text: 'ab',
    });
  });

  it('removes every comment mark key from the active node', () => {
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
    editor.selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    };
    const removeMarkSpy = spyOn(editor.tf, 'removeMark');

    editor.tf.comment.removeMark();

    expect(removeMarkSpy).toHaveBeenCalledWith('comment_one');
    expect(removeMarkSpy).toHaveBeenCalledWith('comment_two');
    expect(removeMarkSpy).toHaveBeenCalledWith('comment');
  });

  it('does nothing when removeMark has no active comment node', () => {
    const editor = createCommentEditor([
      {
        children: [{ text: 'a' }],
        type: 'p',
      },
    ]);
    const removeMarkSpy = spyOn(editor.tf, 'removeMark');

    editor.tf.comment.removeMark();

    expect(removeMarkSpy).not.toHaveBeenCalled();
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

    editor.tf.comment.unsetMark({ id: 'one' });

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

    editor.tf.comment.unsetMark({ id: 'one' });

    expect(editor.children[0].children[0]).toEqual({ text: 'a' });
  });

  it('normalizes stray comment flags away but leaves draft comments alone', () => {
    const editor = createCommentEditor([
      {
        children: [
          { comment: true, text: 'a' },
          { comment: true, comment_draft: true, text: 'b' },
        ],
        type: 'p',
      },
    ]);

    (editor as any).normalizeNode([
      editor.children[0].children[0] as any,
      [0, 0],
    ]);
    (editor as any).normalizeNode([
      editor.children[0].children[1] as any,
      [0, 1],
    ]);

    expect(editor.children[0].children[0]).toEqual({ text: 'a' });
    expect(editor.children[0].children[1]).toMatchObject({
      comment: true,
      comment_draft: true,
      text: 'b',
    });
  });
});
