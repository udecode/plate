import { createPlateEditor, pipeHandler } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import { PlaceholderPlugin } from './PlaceholderPlugin';

const createDropEvent = () => {
  const preventDefault = mock();
  const stopPropagation = mock();

  return {
    event: {
      dataTransfer: { files: [new File(['image'], 'image.png')] },
      nativeEvent: {},
      preventDefault,
      stopPropagation,
    } as unknown as React.DragEvent,
    preventDefault,
    stopPropagation,
  };
};

const runOnDrop = (disableFileDrop: boolean) => {
  const editor = createPlateEditor({
    plugins: [PlaceholderPlugin.configure({ options: { disableFileDrop } })],
  });
  const { event, preventDefault, stopPropagation } = createDropEvent();

  pipeHandler(editor, { handlerKey: 'onDrop' })?.(event);

  return { preventDefault, stopPropagation };
};

describe('PlaceholderPlugin', () => {
  it('defers file drops to DnD by default', () => {
    const { preventDefault, stopPropagation } = runOnDrop(false);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(stopPropagation).not.toHaveBeenCalled();
  });

  it('handles file drops when DnD file dropping is disabled', () => {
    const { preventDefault, stopPropagation } = runOnDrop(true);

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('replaces an empty block with a pasted file placeholder', () => {
    const editor = createPlateEditor({
      plugins: [PlaceholderPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: KEYS.p }],
    });
    const event = {
      clipboardData: {
        files: [new File(['image'], 'image.png', { type: 'image/png' })],
        types: [],
      },
      preventDefault: mock(),
      stopPropagation: mock(),
    } as unknown as React.ClipboardEvent;

    pipeHandler(editor, { handlerKey: 'onPaste' })?.(event);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: '' }], type: KEYS.placeholder },
    ]);
  });

  it('inserts media through the plugin transaction method', () => {
    const editor = createPlateEditor({
      plugins: [PlaceholderPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor
      .plugin(PlaceholderPlugin)
      .update.insertMedia([
        new File(['image'], 'image.png', { type: 'image/png' }),
      ]);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: '' }], type: KEYS.p },
      { children: [{ text: '' }], type: KEYS.placeholder },
    ]);
  });
});
