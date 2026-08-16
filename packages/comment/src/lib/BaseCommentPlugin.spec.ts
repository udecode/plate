import {
  BaseParagraphPlugin,
  type BaseEditor,
  createBaseEditor,
  defineBasePlugin,
} from '@platejs/core';
import { schema, type Selection, type ValueOf } from '@platejs/plite';

import { BaseCommentPlugin } from './BaseCommentPlugin';

const CommentTargetPlugin = defineBasePlugin('commentTarget', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});

const commentPlugins = [
  BaseParagraphPlugin,
  CommentTargetPlugin,
  BaseCommentPlugin,
] as const;

type CommentValue = ValueOf<BaseEditor<typeof commentPlugins>>;

const createCommentEditor = (
  value: CommentValue,
  selection: Selection = null
) =>
  createBaseEditor({
    plugins: commentPlugins,
    selection,
    initialValue: value,
  });

describe('BaseCommentPlugin', () => {
  it('canonicalizes false base comment marks to the absent default', () => {
    const editor = createCommentEditor([
      { children: [{ text: 'plain' }], type: 'paragraph' },
    ]);

    expect(
      editor.read.schema.fitDocument({
        children: [
          { children: [{ comment: false, text: 'plain' }], type: 'paragraph' },
        ],
      })
    ).toEqual({
      children: [{ children: [{ text: 'plain' }], type: 'paragraph' }],
    });
  });

  it('compiles exact and namespaced comment lifecycle laws', () => {
    const text = {
      comment: true,
      commentTransient: true,
      comment_one: false,
      text: 'a',
    };
    const editor = createCommentEditor([
      { children: [text], type: 'paragraph' },
    ]);
    const paragraph = { children: [{ text: '' }], type: 'paragraph' };

    expect(
      editor.read.schema.property({
        key: 'comment',
        placement: 'text',
        type: 'paragraph',
      })
    ).toMatchObject({
      lifecycle: {
        split: 'preserve',
        typeChange: 'preserve-if-allowed',
      },
      merge: 'replace',
      value: { kind: 'boolean' },
    });
    expect(
      editor.read.schema.property({
        key: 'comment_one',
        placement: 'text',
        type: 'paragraph',
      })
    ).toMatchObject({
      lifecycle: {
        split: 'preserve',
        typeChange: 'preserve-if-allowed',
      },
      merge: 'replace',
      value: { kind: 'boolean' },
    });
    expect(
      editor.read.schema.property({
        key: 'commentTransient',
        placement: 'text',
        type: 'paragraph',
      })
    ).toMatchObject({ value: { kind: 'boolean' } });
    expect(
      editor.read.schema.property({
        key: 'comment_one',
        placement: 'text',
        type: paragraph.type,
      })
    ).not.toBeNull();
    expect(
      editor.read.schema.property({
        key: 'comment_one',
        placement: 'text',
        type: 'missing',
      })
    ).toBeNull();

    editor.update.nodes.set({ type: 'commentTarget' }, { at: [0] });

    expect(editor.read.nodes.get([0, 0])?.[0]).toMatchObject(text);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
    editor.update.marks.add('comment_one', true);

    expect(editor.read.nodes.get([0, 0])?.[0]).toMatchObject({
      ...text,
      comment_one: true,
    });
  });

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
        type: 'paragraph',
      },
    ]);

    const commentRead = editor.plugin(BaseCommentPlugin).read;

    expect(commentRead.has({ id: 'one' })).toBe(true);
    expect(commentRead.has({ id: 'missing' })).toBe(false);
    expect(commentRead.node({ id: 'one', at: [] })?.[1]).toEqual([0, 0]);
    expect(commentRead.nodes({ id: 'two', at: [] })).toHaveLength(1);
    expect(commentRead.nodes({ isDraft: true, at: [] })).toHaveLength(1);
    expect(commentRead.nodes({ transient: true, at: [] })).toHaveLength(1);
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
        type: 'paragraph',
      },
    ]);
    const comment = editor.plugin(BaseCommentPlugin);
    const normal = comment.read.node({ at: [], id: 'two' });
    const draft = comment.read.node({ at: [], isDraft: true });

    if (!normal || !draft) {
      throw new TypeError('Expected normal and draft comment leaves');
    }

    expect(comment.api.id(normal[0])).toBe('two');
    expect(comment.api.id(draft[0])).toBeUndefined();
  });

  it('marks the selected text as a draft comment', () => {
    const editor = createCommentEditor(
      [{ children: [{ text: 'ab' }], type: 'paragraph' }],
      {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      }
    );

    editor.update.comment.setDraft();

    expect(editor.read.nodes.get([0, 0])?.[0]).toMatchObject({
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
          type: 'paragraph',
        },
      ],
      {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      }
    );

    editor.update.comment.removeMark();

    expect(editor.read.nodes.get([0, 0])?.[0]).toEqual({
      text: 'a',
    });
  });

  it('does nothing when removeMark has no active comment node', () => {
    const editor = createCommentEditor([
      { children: [{ text: 'a' }], type: 'paragraph' },
    ]);

    editor.update.comment.removeMark();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'a' }], type: 'paragraph' },
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
        type: 'paragraph',
      },
    ]);

    editor.update.comment.unsetMark({ id: 'one' });

    expect(editor.read.nodes.get([0, 0])?.[0]).toEqual({
      comment: true,
      comment_two: true,
      text: 'a',
    });
  });

  it('removes the base flag with the last comment id', () => {
    const editor = createCommentEditor([
      {
        children: [{ comment: true, comment_one: true, text: 'a' }],
        type: 'paragraph',
      },
    ]);

    editor.update.comment.unsetMark({ id: 'one' });

    expect(editor.read.nodes.get([0, 0])?.[0]).toEqual({
      text: 'a',
    });
  });

  it('removes a transient comment without inventing an id key', () => {
    const editor = createCommentEditor([
      {
        children: [{ comment: true, commentTransient: true, text: 'a' }],
        type: 'paragraph',
      },
    ]);

    editor.update.comment.unsetMark({ transient: true });

    expect(editor.read.nodes.get([0, 0])?.[0]).toEqual({
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
        type: 'paragraph',
      },
    ]);

    editor.update.value.repair();

    expect(editor.read.children()).toEqual([
      {
        children: [
          { text: 'a' },
          { comment: true, comment_draft: true, text: 'b' },
        ],
        type: 'paragraph',
      },
    ]);
  });
});
