import { createSlateEditor, KEYS } from 'platejs';

import { BaseTocPlugin } from './BaseTocPlugin';

describe('BaseTocPlugin', () => {
  it('configures toc as a void element with the shipped defaults', () => {
    const editor = createSlateEditor({
      plugins: [BaseTocPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseTocPlugin);

    expect(plugin.key).toBe(KEYS.toc);
    expect(plugin.node).toMatchObject({
      isElement: true,
      isVoid: true,
    });
    expect(plugin.options).toMatchObject({
      isScroll: true,
      topOffset: 80,
    });
  });

  it('deleteForward removes the selected toc block', () => {
    const editor = createSlateEditor({
      plugins: [BaseTocPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: '' }],
          type: KEYS.toc,
        },
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    } as any);

    editor.tf.deleteForward('character');

    expect(editor.children).toMatchObject([
      {
        children: [{ text: 'after' }],
        type: KEYS.p,
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('deleteBackward from the next block selects the toc instead of deleting through it', () => {
    const editor = createSlateEditor({
      plugins: [BaseTocPlugin],
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      value: [
        {
          children: [{ text: '' }],
          type: KEYS.toc,
        },
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    } as any);

    editor.tf.deleteBackward('character');

    expect(editor.children).toHaveLength(2);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('moveLine from the next block selects the toc instead of entering its empty child', () => {
    const editor = createSlateEditor({
      plugins: [BaseTocPlugin],
      selection: {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      value: [
        {
          children: [{ text: '' }],
          type: KEYS.toc,
        },
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    } as any);

    editor.tf.move({ reverse: true, unit: 'line' });

    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('keeps Enter on the toc selection from creating text inside the toc', () => {
    const editor = createSlateEditor({
      plugins: [BaseTocPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: '' }],
          type: KEYS.toc,
        },
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    } as any);

    editor.tf.insertBreak();

    expect(editor.children).toEqual([
      {
        children: [{ text: '' }],
        type: KEYS.toc,
      },
      {
        children: [{ text: 'after' }],
        type: KEYS.p,
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('lets Tab fall through instead of tabbing into toc text', () => {
    const editor = createSlateEditor({
      plugins: [BaseTocPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: '' }],
          type: KEYS.toc,
        },
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    } as any);

    expect(editor.tf.tab({ reverse: false })).toBe(false);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });
});
