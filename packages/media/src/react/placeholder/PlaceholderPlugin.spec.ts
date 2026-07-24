import { BaseParagraphPlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import { pipeHandler } from '@platejs/core/react/internal';
import { KEYS } from '@platejs/utils';

import { BaseImagePlugin } from '../../lib/image/BaseImagePlugin';
import { PlaceholderPlugin, UploadErrorCode } from './PlaceholderPlugin';

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
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
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

  it('inserts a pasted file after a non-empty block', () => {
    const editor = createPlateEditor({
      plugins: [PlaceholderPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
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
      { children: [{ text: 'text' }], type: KEYS.p },
      { children: [{ text: '' }], type: KEYS.placeholder },
    ]);
  });

  it('inserts media through the plugin transaction method', () => {
    const editor = createPlateEditor({
      plugins: [PlaceholderPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
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

  it('replaces a placeholder with direct media caption children', () => {
    const editor = createPlateEditor({
      plugins: [BaseParagraphPlugin, BaseImagePlugin, PlaceholderPlugin],
      initialValue: [
        {
          children: [{ text: '' }],
          mediaType: KEYS.img,
          type: KEYS.placeholder,
        },
      ],
    });

    editor.plugin(PlaceholderPlugin).update.replaceMedia(
      {
        caption: 'Uploaded image',
        type: KEYS.img,
        url: 'https://platejs.org/uploaded.png',
      },
      { at: [0] }
    );

    const image = editor.read.children()[0];

    expect(image).not.toHaveProperty('caption');
    expect(image).toMatchObject({
      children: [{ text: 'Uploaded image' }],
      type: KEYS.img,
    });
    expect(editor.read.value()).not.toHaveProperty('roots');
  });

  it('removes an uploading file without mutating the published snapshot', () => {
    const editor = createPlateEditor({ plugins: [PlaceholderPlugin] });
    const file = new File(['image'], 'image.png', { type: 'image/png' });
    const placeholder = editor.plugin(PlaceholderPlugin);

    placeholder.api.addUploadingFile('image', file);
    const publishedFiles = placeholder.getOption('uploadingFiles');

    expect(Object.isFrozen(publishedFiles)).toBe(true);

    placeholder.api.removeUploadingFile('image');

    expect(publishedFiles).toEqual({ image: file });
    expect(placeholder.getOption('uploadingFiles')).toEqual({});
    expect(placeholder.getOption('uploadingFiles')).not.toBe(publishedFiles);
  });

  it('does not publish uploading files when the document update aborts', () => {
    const editor = createPlateEditor({
      plugins: [PlaceholderPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });
    const file = new File(['image'], 'image.png', { type: 'image/png' });

    expect(() =>
      editor.update((tx) => {
        tx.placeholder.insertMedia([file]);
        throw new Error('abort');
      })
    ).toThrow('abort');
    expect(
      editor.plugin(PlaceholderPlugin).getOption('uploadingFiles')
    ).toEqual({});
    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: KEYS.p },
    ]);
  });

  it('rejects unsupported file types before inserting', () => {
    const editor = createPlateEditor({
      plugins: [
        PlaceholderPlugin.configure({
          options: {
            uploadConfig: {
              image: { mediaType: KEYS.img },
            },
          },
        }),
      ],
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor
      .plugin(PlaceholderPlugin)
      .update.insertMedia([
        new File(['text'], 'notes.txt', { type: 'text/plain' }),
      ]);

    expect(editor.plugin(PlaceholderPlugin).getOption('error')?.code).toBe(
      UploadErrorCode.INVALID_FILE_TYPE
    );
    expect(editor.read.children()).toHaveLength(1);
  });

  it('uses blob as the configured fallback', () => {
    const editor = createPlateEditor({
      plugins: [
        PlaceholderPlugin.configure({
          options: {
            uploadConfig: {
              blob: { mediaType: KEYS.file },
            },
          },
        }),
      ],
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor
      .plugin(PlaceholderPlugin)
      .update.insertMedia(
        [new File(['text'], 'notes.txt', { type: 'text/plain' })],
        { at: [1] }
      );

    expect(editor.read.children().at(1)).toMatchObject({
      mediaType: KEYS.file,
      type: KEYS.placeholder,
    });
  });

  it('looks up missing MIME types by extension', () => {
    const editor = createPlateEditor({
      plugins: [PlaceholderPlugin],
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor
      .plugin(PlaceholderPlugin)
      .update.insertMedia([new File(['image'], 'image.png')], { at: [1] });

    expect(editor.read.children().at(1)).toMatchObject({
      mediaType: KEYS.img,
      type: KEYS.placeholder,
    });
  });

  it('enforces per-type file count atomically', () => {
    const editor = createPlateEditor({
      plugins: [
        PlaceholderPlugin.configure({
          options: {
            uploadConfig: {
              image: {
                maxFileCount: 1,
                mediaType: KEYS.img,
              },
            },
          },
        }),
      ],
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor
      .plugin(PlaceholderPlugin)
      .update.insertMedia([
        new File(['one'], 'one.png', { type: 'image/png' }),
        new File(['two'], 'two.png', { type: 'image/png' }),
      ]);

    expect(editor.plugin(PlaceholderPlugin).getOption('error')?.code).toBe(
      UploadErrorCode.TOO_MANY_FILES
    );
    expect(editor.read.children()).toHaveLength(1);
  });

  it('enforces file size without requiring a size limit', () => {
    const editor = createPlateEditor({
      plugins: [
        PlaceholderPlugin.configure({
          options: {
            uploadConfig: {
              image: {
                maxFileSize: '1KB',
                mediaType: KEYS.img,
              },
            },
          },
        }),
      ],
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor
      .plugin(PlaceholderPlugin)
      .update.insertMedia([
        new File([new Uint8Array(1025)], 'large.png', { type: 'image/png' }),
      ]);

    expect(editor.plugin(PlaceholderPlugin).getOption('error')?.code).toBe(
      UploadErrorCode.TOO_LARGE
    );
    expect(editor.read.children()).toHaveLength(1);
  });

  it('enforces the global multiple-files option', () => {
    const editor = createPlateEditor({
      plugins: [
        PlaceholderPlugin.configure({
          options: { multiple: false },
        }),
      ],
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor
      .plugin(PlaceholderPlugin)
      .update.insertMedia([
        new File(['one'], 'one.png', { type: 'image/png' }),
        new File(['two'], 'two.png', { type: 'image/png' }),
      ]);

    expect(editor.plugin(PlaceholderPlugin).getOption('error')).toMatchObject({
      code: UploadErrorCode.TOO_MANY_FILES,
      data: { fileType: null, maxFileCount: 1 },
    });
    expect(editor.read.children()).toHaveLength(1);
  });
});
