import { BaseParagraphPlugin, SelectionApi } from '../../../../core';
import { BaseImagePlugin } from '../../../../features/media/lib/image/BaseImagePlugin';
import { createEditor, pipeHandler } from '../../../core';
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
  const editor = createEditor({
    plugins: [
      PlaceholderPlugin.configure({ initialState: { disableFileDrop } }),
    ],
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
    const editor = createEditor({
      plugins: [PlaceholderPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
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
      { children: [{ text: '' }], type: 'placeholder' },
    ]);
  });

  it('inserts a pasted file after a non-empty block', () => {
    const editor = createEditor({
      plugins: [PlaceholderPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
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
      { children: [{ text: 'text' }], type: 'paragraph' },
      { children: [{ text: '' }], type: 'placeholder' },
    ]);
  });

  it('inserts media through the plugin transaction method', () => {
    const editor = createEditor({
      plugins: [PlaceholderPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor
      .plugin(PlaceholderPlugin)
      .update.insertMedia([
        new File(['image'], 'image.png', { type: 'image/png' }),
      ]);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: '' }], type: 'paragraph' },
      { children: [{ text: '' }], type: 'placeholder' },
    ]);
  });

  it('inserts after the last exact node selection member', () => {
    const editor = createEditor({
      plugins: [PlaceholderPlugin],
      selection: SelectionApi.nodes([[0], [2]]),
      initialValue: [
        { children: [{ text: 'one' }], type: 'paragraph' },
        { children: [{ text: 'middle' }], type: 'paragraph' },
        { children: [{ text: 'three' }], type: 'paragraph' },
      ],
    });

    editor
      .plugin(PlaceholderPlugin)
      .update.insertMedia([
        new File(['image'], 'image.png', { type: 'image/png' }),
      ]);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      { children: [{ text: 'middle' }], type: 'paragraph' },
      { children: [{ text: 'three' }], type: 'paragraph' },
      { children: [{ text: '' }], type: 'placeholder' },
    ]);
  });

  it('associates files with placeholders from their own transaction call', () => {
    const editor = createEditor({
      plugins: [PlaceholderPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const first = new File(['first'], 'first.png', { type: 'image/png' });
    const second = new File(['second'], 'second.png', { type: 'image/png' });

    editor.update((tx) => {
      tx.placeholder.insertMedia([first], { at: [1] });
      tx.placeholder.insertMedia([second], { at: [2] });
    });

    const uploadingFiles = editor
      .plugin(PlaceholderPlugin)
      .store.get('uploadingFiles');

    expect(uploadingFiles[editor.key([1])!]).toBe(first);
    expect(uploadingFiles[editor.key([2])!]).toBe(second);
  });

  it('replaces a placeholder with direct media caption children', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseImagePlugin, PlaceholderPlugin],
      initialValue: [
        {
          children: [{ text: '' }],
          mediaType: 'image',
          type: 'placeholder',
        },
      ],
    });

    editor.plugin(PlaceholderPlugin).update.replaceMedia(
      {
        caption: 'Uploaded image',
        plugin: 'image',
        url: 'https://platejs.org/uploaded.png',
      },
      { at: [0] }
    );

    const image = editor.read.children()[0];

    expect(image).not.toHaveProperty('caption');
    expect(image).toMatchObject({
      children: [{ text: 'Uploaded image' }],
      type: 'image',
    });
    expect(editor.read.value()).not.toHaveProperty('roots');
  });

  it('removes an uploading file without mutating the published snapshot', () => {
    const editor = createEditor({ plugins: [PlaceholderPlugin] });
    const file = new File(['image'], 'image.png', { type: 'image/png' });
    const placeholder = editor.plugin(PlaceholderPlugin);
    const nodeKey = editor.key([0])!;

    placeholder.api.addUploadingFile(nodeKey, file);
    const publishedFiles = placeholder.store.get('uploadingFiles');

    expect(Object.isFrozen(publishedFiles)).toBe(true);

    placeholder.api.removeUploadingFile(nodeKey);

    expect(publishedFiles).toEqual({ [nodeKey]: file });
    expect(placeholder.store.get('uploadingFiles')).toEqual({});
    expect(placeholder.store.get('uploadingFiles')).not.toBe(publishedFiles);
  });

  it('does not publish uploading files when the document update aborts', () => {
    const editor = createEditor({
      plugins: [PlaceholderPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const file = new File(['image'], 'image.png', { type: 'image/png' });

    expect(() =>
      editor.update((tx) => {
        tx.placeholder.insertMedia([file]);
        throw new Error('abort');
      })
    ).toThrow('abort');
    expect(
      editor.plugin(PlaceholderPlugin).store.get('uploadingFiles')
    ).toEqual({});
    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
  });

  it('rejects unsupported file types before inserting', () => {
    const editor = createEditor({
      plugins: [
        PlaceholderPlugin.configure({
          initialState: {
            uploadConfig: {
              image: { mediaType: 'image' },
            },
          },
        }),
      ],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor
      .plugin(PlaceholderPlugin)
      .update.insertMedia([
        new File(['text'], 'notes.txt', { type: 'text/plain' }),
      ]);

    expect(editor.plugin(PlaceholderPlugin).store.get('error')?.code).toBe(
      UploadErrorCode.INVALID_FILE_TYPE
    );
    expect(editor.read.children()).toHaveLength(1);
  });

  it('uses blob as the configured fallback', () => {
    const editor = createEditor({
      plugins: [
        PlaceholderPlugin.configure({
          initialState: {
            uploadConfig: {
              blob: { mediaType: 'file' },
            },
          },
        }),
      ],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor
      .plugin(PlaceholderPlugin)
      .update.insertMedia(
        [new File(['text'], 'notes.txt', { type: 'text/plain' })],
        { at: [1] }
      );

    expect(editor.read.children().at(1)).toMatchObject({
      mediaType: 'file',
      type: 'placeholder',
    });
  });

  it('looks up missing MIME types by extension', () => {
    const editor = createEditor({
      plugins: [PlaceholderPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor
      .plugin(PlaceholderPlugin)
      .update.insertMedia([new File(['image'], 'image.png')], { at: [1] });

    expect(editor.read.children().at(1)).toMatchObject({
      mediaType: 'image',
      type: 'placeholder',
    });
  });

  it('enforces per-type file count atomically', () => {
    const editor = createEditor({
      plugins: [
        PlaceholderPlugin.configure({
          initialState: {
            uploadConfig: {
              image: {
                maxFileCount: 1,
                mediaType: 'image',
              },
            },
          },
        }),
      ],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor
      .plugin(PlaceholderPlugin)
      .update.insertMedia([
        new File(['one'], 'one.png', { type: 'image/png' }),
        new File(['two'], 'two.png', { type: 'image/png' }),
      ]);

    expect(editor.plugin(PlaceholderPlugin).store.get('error')?.code).toBe(
      UploadErrorCode.TOO_MANY_FILES
    );
    expect(editor.read.children()).toHaveLength(1);
  });

  it('enforces file size without requiring a size limit', () => {
    const editor = createEditor({
      plugins: [
        PlaceholderPlugin.configure({
          initialState: {
            uploadConfig: {
              image: {
                maxFileSize: '1KB',
                mediaType: 'image',
              },
            },
          },
        }),
      ],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor
      .plugin(PlaceholderPlugin)
      .update.insertMedia([
        new File([new Uint8Array(1025)], 'large.png', { type: 'image/png' }),
      ]);

    expect(editor.plugin(PlaceholderPlugin).store.get('error')?.code).toBe(
      UploadErrorCode.TOO_LARGE
    );
    expect(editor.read.children()).toHaveLength(1);
  });

  it('enforces the global multiple-files option', () => {
    const editor = createEditor({
      plugins: [
        PlaceholderPlugin.configure({
          initialState: { multiple: false },
        }),
      ],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor
      .plugin(PlaceholderPlugin)
      .update.insertMedia([
        new File(['one'], 'one.png', { type: 'image/png' }),
        new File(['two'], 'two.png', { type: 'image/png' }),
      ]);

    expect(editor.plugin(PlaceholderPlugin).store.get('error')).toMatchObject({
      code: UploadErrorCode.TOO_MANY_FILES,
      data: { fileType: null, maxFileCount: 1 },
    });
    expect(editor.read.children()).toHaveLength(1);
  });
});
