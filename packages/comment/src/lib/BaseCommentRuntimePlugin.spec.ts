import type { NodeEntry, TCommentText, Value } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { BaseCommentPlugin } from './BaseCommentPlugin';

type CommentRuntimeApi = {
  comment: {
    has: (options: { id: string }) => boolean;
    node: (options?: {
      at?: number[];
      id?: string;
      isDraft?: boolean;
      transient?: boolean;
    }) => NodeEntry<TCommentText> | undefined;
    nodeId: (leaf: TCommentText) => string | undefined;
    nodes: (options?: {
      at?: number[];
      id?: string;
      isDraft?: boolean;
      transient?: boolean;
    }) => NodeEntry<TCommentText>[];
  };
};

const createCommentRuntimeEditor = ({
  selection,
  value,
}: {
  selection?: {
    anchor: { offset: number; path: number[] };
    focus: { offset: number; path: number[] };
  };
  value: Value;
}) =>
  createPlateEditor<Value, typeof BaseCommentPlugin>({
    plugins: [BaseCommentPlugin],
    runtime: 'plite',
    selection,
    value,
  });

describe('BaseCommentPlugin Plite runtime', () => {
  it('finds comment nodes and ids through the runtime API', () => {
    const editor = createCommentRuntimeEditor({
      value: [
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
      ],
    });
    const api: CommentRuntimeApi = editor.api;

    expect(api.comment.has({ id: 'one' })).toBe(true);
    expect(api.comment.node({ at: [], id: 'one' })?.[1]).toEqual([0, 0]);
    expect(api.comment.nodes({ at: [], id: 'two' })).toHaveLength(1);
    expect(api.comment.nodes({ at: [], isDraft: true })).toHaveLength(1);
    expect(api.comment.nodes({ at: [], transient: true })).toHaveLength(1);
    expect(
      api.comment.nodeId(api.comment.node({ at: [], id: 'one' })![0])
    ).toBe('one');
    expect(
      api.comment.nodeId(api.comment.node({ at: [], isDraft: true })![0])
    ).toBeUndefined();
  });

  it('marks the selected text as a draft comment through the tx facade', () => {
    const editor = createCommentRuntimeEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [{ children: [{ text: 'ab' }], type: 'p' }],
    });

    editor.update((tx) => tx.comment.setDraft());

    expect(editor.read((state) => state.value.root()[0])).toEqual({
      children: [{ comment: true, comment_draft: true, text: 'ab' }],
      type: 'p',
    });
  });

  it('unsets one overlapping comment id and keeps the base flag', () => {
    const editor = createCommentRuntimeEditor({
      value: [
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
    });

    editor.update((tx) => tx.comment.unsetMark({ id: 'one' }));

    expect(editor.read((state) => state.value.root()[0])).toEqual({
      children: [{ comment: true, comment_two: true, text: 'a' }],
      type: 'p',
    });
  });

  it('removes every active comment mark through the tx facade', () => {
    const editor = createCommentRuntimeEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [
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
    });

    editor.update((tx) => tx.comment.removeMark());

    expect(editor.read((state) => state.value.root()[0])).toEqual({
      children: [{ text: 'a' }],
      type: 'p',
    });
  });

  it('normalizes stray comment flags away and leaves draft comments alone', () => {
    const editor = createCommentRuntimeEditor({
      value: [
        {
          children: [
            { comment: true, text: 'a' },
            { comment: true, comment_draft: true, text: 'b' },
          ],
          type: 'p',
        },
      ],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root()[0])).toEqual({
      children: [
        { text: 'a' },
        { comment: true, comment_draft: true, text: 'b' },
      ],
      type: 'p',
    });
  });
});
