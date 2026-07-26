import { createBaseEditor } from '@platejs/core';
import type { Value } from '@platejs/plite';

import { BaseLinkPlugin } from './BaseLinkPlugin';

const createEditor = (value: Value) =>
  createBaseEditor({
    plugins: [BaseLinkPlugin],
    selection: {
      kind: 'text',
      anchor: { offset: 4, path: [0, 1, 0] },
      focus: { offset: 4, path: [0, 1, 0] },
    },
    initialValue: value,
  });

describe('BaseLinkPlugin runtime', () => {
  it('creates and selects a text leaf after a terminal link', () => {
    const editor = createEditor([
      {
        children: [
          { text: 'Before ' },
          {
            children: [{ text: 'link' }],
            type: 'a',
            url: 'https://example.com',
          },
        ],
        type: 'p',
      },
    ]);

    editor.update.value.repair();
    editor.update.text.insert('x');

    expect(editor.read.children()).toEqual([
      {
        children: [
          { text: 'Before ' },
          {
            children: [{ text: 'link' }],
            type: 'a',
            url: 'https://example.com',
          },
          { text: 'x' },
        ],
        type: 'p',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 1, path: [0, 2] },
      focus: { offset: 1, path: [0, 2] },
    });
  });

  it('selects the existing text leaf after a link', () => {
    const editor = createEditor([
      {
        children: [
          { text: 'Before ' },
          {
            children: [{ text: 'link' }],
            type: 'a',
            url: 'https://example.com',
          },
          { text: ' after' },
        ],
        type: 'p',
      },
    ]);

    editor.update.value.repair();
    editor.update.text.insert('x');

    expect(editor.read.text.string([0])).toBe('Before linkx after');
    expect(editor.read.children()[0]).toMatchObject({
      children: [
        { text: 'Before ' },
        { children: [{ text: 'link' }], type: 'a' },
        { text: 'x after' },
      ],
    });
  });
});
