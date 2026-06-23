import type { Range, Value } from '@platejs/slate';

import { createSlateEditor, KEYS } from 'platejs';

import { getCurrentRuntimeTransforms } from '../../../core/src/internal/currentRuntimeBridge';
import { createPlateRuntimeEditor } from '../../../core/src/react/editor/createPlateRuntimeEditor';
import { BaseMentionInputPlugin, BaseMentionPlugin } from './BaseMentionPlugin';

describe('BaseMentionPlugin', () => {
  const createMentionRuntimeEditor = ({
    selection,
    userId,
    value,
  }: {
    selection: Range;
    value: Value;
    userId?: string;
  }) =>
    createPlateRuntimeEditor({
      initialSelection: selection,
      initialValue: value,
      plugins: [BaseMentionPlugin],
      userId,
    });

  const root = (editor: ReturnType<typeof createMentionRuntimeEditor>) =>
    editor.read((state) => state.value.root());

  const selection = (editor: ReturnType<typeof createMentionRuntimeEditor>) =>
    editor.read((state) => state.selection.get());

  it('configures mention defaults and inserts markable void mention nodes', () => {
    const editor = createSlateEditor({
      plugins: [BaseMentionPlugin],
      selection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [{ children: [{ text: 'hello' }], type: 'p' }],
    });
    const plugin = editor.getPlugin(BaseMentionPlugin);
    const inputPlugin = editor.getPlugin(BaseMentionInputPlugin);

    expect(plugin.node).toMatchObject({
      isElement: true,
      isInline: true,
      isMarkableVoid: true,
      isVoid: true,
    });
    expect(plugin.options.trigger).toBe('@');
    expect(plugin.options.createComboboxInput?.('@')).toEqual({
      children: [{ text: '' }],
      trigger: '@',
      type: KEYS.mentionInput,
    });
    expect(inputPlugin.node).toMatchObject({
      isElement: true,
      isInline: true,
      isVoid: true,
    });

    editor.update((tx) => tx.mention.insert({ key: 'u1', value: 'Ada' }));

    const children = editor.children[0].children;

    expect(children[0]).toEqual({ text: 'he' });
    expect(children[1]).toMatchObject({
      children: [{ text: '' }],
      key: 'u1',
      type: KEYS.mention,
      value: 'Ada',
    });
    expect(children[2]).toEqual({ text: 'llo' });
  });

  it('routes the mention trigger through the Slate v2 runtime combobox path', () => {
    const editor = createMentionRuntimeEditor({
      selection: {
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 6, path: [0, 0] },
      },
      userId: 'user-1',
      value: [{ children: [{ text: 'hello ' }], type: 'p' }],
    });

    const handled = getCurrentRuntimeTransforms(editor).insertText(
      '@'
    ) as unknown;

    expect(handled).toBe(true);
    expect(editor.read((state) => state.value.root()) as unknown).toEqual([
      {
        children: [
          { text: 'hello ' },
          {
            children: [{ text: '' }],
            trigger: '@',
            type: KEYS.mentionInput,
            userId: 'user-1',
          },
          { text: '' },
        ],
        type: 'p',
      },
    ]);
  });

  it('deleteBackward removes the adjacent mention atom', () => {
    const editor = createMentionRuntimeEditor({
      selection: {
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      },
      value: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              key: 'u1',
              type: KEYS.mention,
              value: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'p',
        },
      ],
    });

    getCurrentRuntimeTransforms(editor).deleteBackward('character');

    expect(root(editor)).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'p',
      },
    ]);
    expect(selection(editor)).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('deleteForward removes the next mention atom', () => {
    const editor = createMentionRuntimeEditor({
      selection: {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      value: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              key: 'u1',
              type: KEYS.mention,
              value: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'p',
        },
      ],
    });

    getCurrentRuntimeTransforms(editor).deleteForward('character');

    expect(root(editor)).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'p',
      },
    ]);
    expect(selection(editor)).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('moves right into the mention child so the inline void stays keyboard-accessible', () => {
    const editor = createMentionRuntimeEditor({
      selection: {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      value: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              key: 'u1',
              type: KEYS.mention,
              value: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'p',
        },
      ],
    });

    getCurrentRuntimeTransforms(editor).move({
      distance: 1,
      unit: 'character',
    });

    expect(selection(editor)).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });

  it('moves left into the mention child so the inline void stays keyboard-accessible', () => {
    const editor = createMentionRuntimeEditor({
      selection: {
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      },
      value: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              key: 'u1',
              type: KEYS.mention,
              value: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'p',
        },
      ],
    });

    getCurrentRuntimeTransforms(editor).move({
      distance: 1,
      reverse: true,
      unit: 'character',
    });

    expect(selection(editor)).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });

  it('exposes an inferred mention transaction group', () => {
    const editor = createSlateEditor({
      plugins: [BaseMentionPlugin],
      value: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    editor.update((tx) => tx.mention.insert({ key: 'u2', value: 'Grace' }));

    expect(editor.children[0]).toMatchObject({
      children: [
        { text: 'hello' },
        {
          children: [{ text: '' }],
          key: 'u2',
          type: KEYS.mention,
          value: 'Grace',
        },
        { text: '' },
      ],
      type: 'p',
    });
  });
});
