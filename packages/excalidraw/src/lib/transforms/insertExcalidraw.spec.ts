import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseExcalidrawPlugin } from '../BaseExcalidrawPlugin';
import { insertExcalidraw } from './insertExcalidraw';

describe('insertExcalidraw', () => {
  it('does nothing without a selection', () => {
    const editor = createBaseEditor({
      plugins: [BaseExcalidrawPlugin],
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

    editor.update.excalidraw.insert();

    expect(editor.read.children()).toHaveLength(1);
  });

  it('inserts after an explicit block target without a selection', () => {
    const editor = createBaseEditor({
      plugins: [BaseExcalidrawPlugin],
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

    editor.update.excalidraw.insert({}, { at: [0] });

    expect(editor.read.children()).toMatchObject([
      { type: 'p' },
      { children: [{ text: '' }], type: KEYS.excalidraw },
    ]);
  });

  it('inserts after the selected block and merges custom props', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseExcalidrawPlugin.configure({
          type: 'custom-excalidraw',
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

    editor.update((tx) => {
      insertExcalidraw(
        tx,
        editor.getType(KEYS.excalidraw),
        { data: { elements: [], state: { theme: 'dark' } } },
        { select: true }
      );
    });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: '' }],
        type: 'p',
      },
      {
        children: [{ text: '' }],
        data: { elements: [], state: { theme: 'dark' } },
        type: 'custom-excalidraw',
      },
    ]);
  });
});
