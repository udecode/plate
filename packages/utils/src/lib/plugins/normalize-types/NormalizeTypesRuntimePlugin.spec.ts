import { ParagraphPlugin } from '@platejs/core/react';
import { createPlateEditor } from 'platejs/react';

import { NormalizeTypesPlugin } from './NormalizeTypesPlugin';

describe('NormalizeTypesPlugin Plite runtime', () => {
  it('inserts missing configured nodes', () => {
    const editor = createPlateEditor({
      plugins: [
        NormalizeTypesPlugin.configure({
          options: {
            rules: [
              { path: [0, 0], strictType: 'h1' },
              { path: [0, 1], type: ParagraphPlugin.key },
            ],
          },
        }),
      ],
      value: [{ children: [], type: 'element' }],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { children: [{ text: '' }], type: 'h1' },
          { children: [{ text: '' }], type: 'p' },
        ],
        type: 'element',
      },
    ]);
  });

  it('rewrites strict types while preserving children', () => {
    const editor = createPlateEditor({
      plugins: [
        NormalizeTypesPlugin.configure({
          options: {
            rules: [{ path: [0], strictType: 'h1' }],
          },
        }),
      ],
      value: [{ children: [{ text: 'title' }], type: 'h2' }],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'title' }], type: 'h1' },
    ]);
  });

  it('calls onError and keeps content when insertion fails', () => {
    const errors: unknown[] = [];
    const onError = (error: unknown) => {
      errors.push(error);
    };
    const editor = createPlateEditor({
      plugins: [
        NormalizeTypesPlugin.configure({
          options: {
            onError,
            rules: [{ path: [3], type: 'h1' }],
          },
        }),
      ],
      value: [{ children: [{ text: 'x' }], type: 'p' }],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(errors).toHaveLength(1);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'x' }], type: 'p' },
    ]);
  });
});
