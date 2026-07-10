/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';
import { jsxt } from '@platejs/test-utils';
import { KEYS } from '@platejs/utils';

import { BaseDatePlugin } from './BaseDatePlugin';

jsxt;

describe('BaseDatePlugin', () => {
  it('configure date as void inline element', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
    });

    const plugin = editor.getPlugin(BaseDatePlugin);

    expect(plugin.node.isVoid).toBe(true);
    expect(plugin.node.isInline).toBe(true);
    expect(plugin.node.isElement).toBe(true);
  });

  it('does not force date elements to opt out of keyboard entry', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
    });

    const plugin = editor.getPlugin(BaseDatePlugin);

    expect(plugin.node.isSelectable).toBeUndefined();
  });

  it('provides the date.insert transaction', () => {
    const editor = createBaseEditor({
      plugins: [BaseDatePlugin],
    });

    expect(editor.update.date.insert).toBeDefined();
    expect(typeof editor.update.date.insert).toBe('function');
  });

  it('deleteBackward removes the adjacent date atom', () => {
    const editor = createBaseEditor({
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
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: KEYS.p,
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('deleteForward removes the next date atom', () => {
    const editor = createBaseEditor({
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
    });

    editor.update.text.deleteForward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: KEYS.p,
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('moves right into the date child so the inline void stays keyboard-accessible', () => {
    const editor = createBaseEditor({
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
    });

    editor.update.selection.move({ distance: 1, unit: 'character' });

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });

  it('moves left into the date child so the inline void stays keyboard-accessible', () => {
    const editor = createBaseEditor({
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
    });

    editor.update.selection.move({
      distance: 1,
      reverse: true,
      unit: 'character',
    });

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });
});
