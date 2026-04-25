/** @jsx jsxt */

import { KEYS, createSlateEditor } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { BaseDatePlugin } from './BaseDatePlugin';

jsxt;

describe('BaseDatePlugin', () => {
  it('configure date as void inline element', () => {
    const editor = createSlateEditor({
      plugins: [BaseDatePlugin],
    } as any);

    const plugin = editor.getPlugin({ key: KEYS.date });

    expect(plugin.node.isVoid).toBe(true);
    expect(plugin.node.isInline).toBe(true);
    expect(plugin.node.isElement).toBe(true);
  });

  it('does not force date elements to opt out of keyboard entry', () => {
    const editor = createSlateEditor({
      plugins: [BaseDatePlugin],
    } as any);

    const plugin = editor.getPlugin({ key: KEYS.date });

    expect(plugin.node.isSelectable).toBeUndefined();
  });

  it('provide insert.date transform', () => {
    const editor = createSlateEditor({
      plugins: [BaseDatePlugin],
    } as any);

    expect((editor.tf as any).insert.date).toBeDefined();
    expect(typeof (editor.tf as any).insert.date).toBe('function');
  });

  it('deleteBackward removes the adjacent date atom', () => {
    const editor = createSlateEditor({
      plugins: [BaseDatePlugin],
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
              date: '2024-01-01',
              type: KEYS.date,
            },
            { text: ' after' },
          ],
          type: KEYS.p,
        },
      ],
    } as any);

    editor.tf.deleteBackward('character');

    expect(editor.children).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: KEYS.p,
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('deleteForward removes the next date atom', () => {
    const editor = createSlateEditor({
      plugins: [BaseDatePlugin],
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
              date: '2024-01-01',
              type: KEYS.date,
            },
            { text: ' after' },
          ],
          type: KEYS.p,
        },
      ],
    } as any);

    editor.tf.deleteForward('character');

    expect(editor.children).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: KEYS.p,
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('moves right into the date child so the inline void stays keyboard-accessible', () => {
    const editor = createSlateEditor({
      plugins: [BaseDatePlugin],
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
              date: '2024-01-01',
              type: KEYS.date,
            },
            { text: ' after' },
          ],
          type: KEYS.p,
        },
      ],
    } as any);

    editor.tf.move({ distance: 1, unit: 'character' });

    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });

  it('moves left into the date child so the inline void stays keyboard-accessible', () => {
    const editor = createSlateEditor({
      plugins: [BaseDatePlugin],
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
              date: '2024-01-01',
              type: KEYS.date,
            },
            { text: ' after' },
          ],
          type: KEYS.p,
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
