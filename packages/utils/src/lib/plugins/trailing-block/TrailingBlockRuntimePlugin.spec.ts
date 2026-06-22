import type { SlateEditor } from '@platejs/core';
import { createPlateEditor } from 'platejs/react';

import {
  TrailingBlockPlugin,
  type TrailingBlockInsertOptions,
} from './TrailingBlockPlugin';

describe('TrailingBlockPlugin Slate v2 runtime', () => {
  it('appends a trailing block at the root when the last node is invalid', () => {
    const editor = createPlateEditor({
      plugins: [
        TrailingBlockPlugin.configure({
          options: { level: 0, type: 'p' },
        }),
      ],
      runtime: 'slate-v2',
      value: [
        { children: [{ text: 'one' }], type: 'h1' },
        { children: [{ text: 'two' }], type: 'h1' },
      ],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'one' }], type: 'h1' },
      { children: [{ text: 'two' }], type: 'h1' },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('appends the trailing block at the configured depth', () => {
    const editor = createPlateEditor({
      plugins: [
        TrailingBlockPlugin.configure({
          options: { level: 1, type: 'p' },
        }),
      ],
      runtime: 'slate-v2',
      value: [
        {
          children: [
            { children: [{ text: 'one' }], type: 'h1' },
            { children: [{ text: 'two' }], type: 'h1' },
          ],
          type: 'element',
        },
      ],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { children: [{ text: 'one' }], type: 'h1' },
          { children: [{ text: 'two' }], type: 'h1' },
          { children: [{ text: '' }], type: 'p' },
        ],
        type: 'element',
      },
    ]);
  });

  it('skips insertion when the last node is excluded by the query', () => {
    const editor = createPlateEditor({
      plugins: [
        TrailingBlockPlugin.configure({
          options: { exclude: ['h1'], level: 0, type: 'p' },
        }),
      ],
      runtime: 'slate-v2',
      value: [{ children: [{ text: 'one' }], type: 'h1' }],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'one' }], type: 'h1' },
    ]);
  });

  it('allows wrapping the provided trailing-block insert boundary', () => {
    const calls: Array<{ at: number[]; type: string }> = [];
    const insert = (
      _editor: SlateEditor,
      { at, insert: runInsert, type }: TrailingBlockInsertOptions
    ) => {
      calls.push({ at, type });
      runInsert();
    };
    const editor = createPlateEditor({
      plugins: [
        TrailingBlockPlugin.configure({
          options: { insert, level: 0, type: 'p' },
        }),
      ],
      runtime: 'slate-v2',
      value: [{ children: [{ text: 'one' }], type: 'h1' }],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(calls).toEqual([{ at: [1], type: 'p' }]);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'one' }], type: 'h1' },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });
});
