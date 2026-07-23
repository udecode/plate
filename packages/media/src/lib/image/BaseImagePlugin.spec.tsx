import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseImagePlugin } from './BaseImagePlugin';

describe('BaseImagePlugin clipboard behavior', () => {
  let restoreWarn: (() => void) | undefined;

  afterEach(() => {
    restoreWarn?.();
    restoreWarn = undefined;
  });

  const suppressInsertDataOverrideWarning = () => {
    const originalWarn = console.warn;
    const warnSpy = spyOn(console, 'warn').mockImplementation(
      (message, ...args) => {
        if (
          typeof message === 'string' &&
          message.includes('[OVERRIDE_MISSING]') &&
          message.includes('editor.insertData()')
        ) {
          return;
        }

        originalWarn(message, ...args);
      }
    );

    restoreWarn = () => warnSpy.mockRestore();
  };

  const createEditor = () =>
    createBaseEditor({
      plugins: [BaseImagePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'test' }], type: KEYS.p }],
    });

  it('inserts an image from a pasted URL', () => {
    const editor = createEditor();
    const data = {
      files: [],
      getData: () => 'https://i.imgur.com/removed.png',
    };

    editor.api.clipboard.insertData(data as unknown as DataTransfer);

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'test' }], type: KEYS.p },
      {
        children: [{ text: '' }],
        type: KEYS.img,
        url: 'https://i.imgur.com/removed.png',
      },
    ]);
  });

  it('leaves non-image files to the next clipboard handler', () => {
    suppressInsertDataOverrideWarning();

    const editor = createEditor();
    const data = {
      files: [new File(['test'], 'not-an-image')],
      getData: () => '',
    };

    editor.api.clipboard.insertData(data as unknown as DataTransfer);

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'test' }], type: KEYS.p },
    ]);
  });

  it('leaves clipboard data without files to the next handler', () => {
    suppressInsertDataOverrideWarning();

    const editor = createEditor();
    const data = {
      files: [],
      getData: () => '',
    };

    editor.api.clipboard.insertData(data as unknown as DataTransfer);

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'test' }], type: KEYS.p },
    ]);
  });

  it('uploads pasted image files through the plugin option', async () => {
    const uploadImage = mock(
      async () => 'https://platejs.org/uploaded-image.png'
    );
    const editor = createBaseEditor({
      plugins: [
        BaseImagePlugin.configure({
          options: { uploadImage },
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'test' }], type: KEYS.p }],
    });
    const data = {
      files: [new File(['image'], 'image.png', { type: 'image/png' })],
      getData: () => '',
    };

    editor.api.clipboard.insertData(data as unknown as DataTransfer);
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(uploadImage).toHaveBeenCalledWith(
      expect.stringMatching(/^data:image\/png;base64,/)
    );
    expect(editor.read.children().at(1)).toEqual({
      children: [{ text: '' }],
      type: KEYS.img,
      url: 'https://platejs.org/uploaded-image.png',
    });
  });

  it('respects disabled URL embedding', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseImagePlugin.configure({ options: { disableEmbedInsert: true } }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'test' }], type: KEYS.p }],
    });
    const data = {
      files: [],
      getData: () => 'https://i.imgur.com/removed.png',
    };

    editor.api.clipboard.insertData(data as unknown as DataTransfer);

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'testhttps://i.imgur.com/removed.png' }],
        type: KEYS.p,
      },
    ]);
  });
});
