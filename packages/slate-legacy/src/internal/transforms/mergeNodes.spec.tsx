/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';
import type { Editor, LegacyEditorMethods } from '../../interfaces';
import { TextApi } from '../../interfaces';
import { syncLegacyMethods } from '../../utils/assignLegacyTransforms';

jsxt;

describe('mergeNodes', () => {
  it('returns early without a selection or explicit location', () => {
    const editor = createEditor({
      children: [
        { type: 'p', children: [{ text: 'one' }] },
        { type: 'p', children: [{ text: 'two' }] },
      ] as any,
    });

    editor.selection = null;
    editor.tf.mergeNodes();

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: 'one' }] },
      { type: 'p', children: [{ text: 'two' }] },
    ]);
  });

  it('merges block siblings by default when the selection is inside the second block', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>one</hp>
          <hp>
            <cursor />
            two
          </hp>
        </editor>
      ) as any
    );

    editor.tf.mergeNodes();

    const output = (
      <editor>
        <hp>
          one
          <cursor />
          two
        </hp>
      </editor>
    ) as any;

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('deletes an expanded selection before merging and reselects the merged point', () => {
    const editor = createEditor({
      children: [
        { type: 'p', children: [{ text: 'one' }] },
        { type: 'p', children: [{ text: 'two' }] },
      ] as any,
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 3, path: [1, 0] },
      },
    });

    editor.tf.mergeNodes();

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: 'one' }] },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('merges adjacent text nodes', () => {
    const editor = createEditor({
      children: [
        { type: 'p', children: [{ text: 'one' }, { text: 'two' }] },
      ] as any,
      selection: {
        anchor: { offset: 0, path: [0, 1] },
        focus: { offset: 0, path: [0, 1] },
      },
    });

    editor.tf.mergeNodes({ at: [0, 1] });

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: 'onetwo' }] },
    ]);
  });

  it('moves cross-parent text nodes together before merging them', () => {
    const editor = createEditor({
      children: [
        { type: 'p', children: [{ text: 'one' }] },
        { type: 'p', children: [{ text: 'two' }] },
      ] as any,
    });

    editor.tf.mergeNodes({ at: [1, 0], match: TextApi.isText });

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: 'onetwo' }] },
    ]);
  });

  it('merges sibling blocks and removes the emptied ancestor', () => {
    const editor = createEditor({
      children: [
        {
          type: 'blockquote',
          children: [{ type: 'p', children: [{ text: 'one' }] }],
        },
        {
          type: 'blockquote',
          children: [{ type: 'p', children: [{ text: 'two' }] }],
        },
      ] as any,
      selection: {
        anchor: { offset: 0, path: [1, 0, 0] },
        focus: { offset: 0, path: [1, 0, 0] },
      },
    });

    editor.tf.mergeNodes({ at: [1] });

    expect(editor.children).toEqual([
      {
        type: 'blockquote',
        children: [
          { type: 'p', children: [{ text: 'one' }] },
          { type: 'p', children: [{ text: 'two' }] },
        ],
      },
    ]);
  });

  it('returns early when there is no previous matching node', () => {
    const editor = createEditor({
      children: [
        { type: 'p', children: [{ text: 'one' }] },
        { type: 'p', children: [{ text: 'two' }] },
      ] as any,
    });

    editor.tf.mergeNodes({ at: [0] });

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: 'one' }] },
      { type: 'p', children: [{ text: 'two' }] },
    ]);
  });

  it('merges text inside a void element when voids is true', () => {
    const editor = createEditor({
      children: [
        {
          children: [{ text: 'one' }, { text: 'two' }],
          type: 'tag',
        },
      ] as any,
    }) as Editor & LegacyEditorMethods;

    editor.isVoid = (element) => element.type === 'tag';
    syncLegacyMethods(editor);

    editor.tf.mergeNodes({ at: [0, 1], voids: true });

    expect(editor.children).toEqual([
      {
        children: [{ text: 'onetwo' }],
        type: 'tag',
      },
    ]);
  });

  it('respects shouldMergeNodes when it rejects the merge', () => {
    const editor = createEditor({
      children: [
        { type: 'p', children: [{ text: 'one' }] },
        { type: 'p', children: [{ text: 'two' }] },
      ] as any,
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
    });

    editor.api.shouldMergeNodes = () => false;

    editor.tf.mergeNodes({ at: [1] });

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: 'one' }] },
      { type: 'p', children: [{ text: 'two' }] },
    ]);
  });

  it('throws when the current and previous nodes are different kinds', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            one
            <ha>two</ha>
          </hp>
        </editor>
      ) as any
    ) as Editor & LegacyEditorMethods;
    const { isInline } = editor;

    editor.isInline = (element) => element.type === 'a' || isInline(element);
    syncLegacyMethods(editor);

    expect(() =>
      editor.tf.mergeNodes({
        at: [0, 1],
        match: (node: any) =>
          node?.type === 'a' || typeof node?.text === 'string',
        mode: 'highest',
      })
    ).toThrow(TypeError);
  });
});
