import type { Value } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { BaseLinkPlugin } from './BaseLinkPlugin';

describe('BaseLinkPlugin Slate v2 runtime', () => {
  it('creates and selects a text leaf after a link when the cursor reaches the link end', () => {
    const editor = createPlateEditor<Value, typeof BaseLinkPlugin>({
      plugins: [BaseLinkPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 4, path: [0, 1, 0] },
        focus: { offset: 4, path: [0, 1, 0] },
      },
      value: [
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
      ],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { text: 'Before ' },
          {
            children: [{ text: 'link' }],
            type: 'a',
            url: 'https://example.com',
          },
          { text: '' },
        ],
        type: 'p',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
  });

  it('selects the existing text leaf after a link instead of inserting another one', () => {
    const editor = createPlateEditor<Value, typeof BaseLinkPlugin>({
      plugins: [BaseLinkPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 4, path: [0, 1, 0] },
        focus: { offset: 4, path: [0, 1, 0] },
      },
      value: [
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
      ],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
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
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
  });
});
