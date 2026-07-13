import { createPlateEditor, pipeHandler } from '@platejs/core/react';

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
  it('handles file drops by default', () => {
    const { preventDefault, stopPropagation } = runOnDrop(false);

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('skips file drops when disabled', () => {
    const { preventDefault, stopPropagation } = runOnDrop(true);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(stopPropagation).not.toHaveBeenCalled();
  });
});
