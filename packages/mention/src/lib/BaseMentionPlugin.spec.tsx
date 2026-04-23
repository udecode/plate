import { createSlateEditor, KEYS } from 'platejs';

import { BaseMentionInputPlugin, BaseMentionPlugin } from './BaseMentionPlugin';

describe('BaseMentionPlugin', () => {
  it('configures mention defaults and inserts markable void mention nodes', () => {
    const editor = createSlateEditor({
      plugins: [BaseMentionPlugin],
      selection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [{ children: [{ text: 'hello' }], type: 'p' }],
    } as any);
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

    (editor.tf as any).insert.mention({ key: 'u1', value: 'Ada' } as any);

    const children = (editor.children[0] as any).children;

    expect(children[0]).toEqual({ text: 'he' });
    expect(children[1]).toMatchObject({
      children: [{ text: '' }],
      key: 'u1',
      type: KEYS.mention,
      value: 'Ada',
    });
    expect(children[2]).toEqual({ text: 'llo' });
  });

  it('deleteBackward removes the adjacent mention atom', () => {
    const editor = createSlateEditor({
      plugins: [BaseMentionPlugin],
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
    } as any);

    editor.tf.deleteBackward('character');

    expect(editor.children).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'p',
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('deleteForward removes the next mention atom', () => {
    const editor = createSlateEditor({
      plugins: [BaseMentionPlugin],
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
    } as any);

    editor.tf.deleteForward('character');

    expect(editor.children).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'p',
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('moves right into the mention child so the inline void stays keyboard-accessible', () => {
    const editor = createSlateEditor({
      plugins: [BaseMentionPlugin],
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
    } as any);

    editor.tf.move({ distance: 1, unit: 'character' });

    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });

  it('moves left into the mention child so the inline void stays keyboard-accessible', () => {
    const editor = createSlateEditor({
      plugins: [BaseMentionPlugin],
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
    } as any);

    editor.tf.move({ distance: 1, reverse: true, unit: 'character' });

    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });
});
