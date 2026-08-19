import { createBaseEditor, defineBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';

import { BaseImagePlugin } from './BaseImagePlugin';

const TestBoldPlugin = defineBasePlugin('bold', {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});

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
      plugins: [BaseImagePlugin, TestBoldPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });

  it('accepts positive intrinsic dimensions and rejects fractional values', () => {
    const editor = createEditor();
    const document = (naturalWidth: number) => ({
      children: [
        {
          children: [{ text: '' }],
          naturalHeight: 480,
          naturalWidth,
          type: 'image',
          url: 'https://platejs.org/image.png',
        },
      ],
    });

    expect(() =>
      editor.read.schema.assertDocument(document(640))
    ).not.toThrow();
    expect(() => editor.read.schema.assertDocument(document(640.5))).toThrow(
      /naturalWidth.*validation/i
    );
  });

  it('inserts at an exact explicit target through the flat scoped update', () => {
    const editor = createEditor();

    editor
      .plugin(BaseImagePlugin)
      .update.insert({ url: 'https://platejs.org/image.png' }, { at: [0] });

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: '' }],
        type: 'image',
        url: 'https://platejs.org/image.png',
      },
      { children: [{ text: 'test' }], type: 'paragraph' },
    ]);
  });

  it('normalizes direct insertion through the configured URL transform', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseImagePlugin.configure({
          initialState: {
            transformUrl: (url) => `${url}?normalized=image`,
          },
        }),
      ],
      initialValue: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });

    editor
      .plugin(BaseImagePlugin)
      .update.insert({ url: 'https://platejs.org/image.png' }, { at: [0] });

    expect(editor.read.children()[0]).toMatchObject({
      type: 'image',
      url: 'https://platejs.org/image.png?normalized=image',
    });
  });

  it('stores caption construction input as canonical child content', () => {
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin],
      initialValue: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });

    editor.plugin(BaseImagePlugin).update.insert(
      {
        caption: 'A rich caption',
        url: 'https://platejs.org/image.png',
      },
      { at: [0] }
    );

    const image = editor.read.children()[0];

    expect(image).toMatchObject({
      children: [{ text: 'A rich caption' }],
      type: 'image',
      url: 'https://platejs.org/image.png',
    });
    expect(image).not.toHaveProperty('caption');
    expect(editor.read.value()).not.toHaveProperty('roots');
  });

  it('uses one plain empty text child for an empty caption input', () => {
    const editor = createEditor();

    editor.plugin(BaseImagePlugin).update.insert(
      {
        caption: [],
        url: 'https://platejs.org/image.png',
      },
      { at: [0] }
    );

    expect(editor.read.children()[0]).toEqual({
      children: [{ text: '' }],
      type: 'image',
      url: 'https://platejs.org/image.png',
    });
  });

  it('inserts an image from a pasted URL', () => {
    const editor = createEditor();
    const data = {
      files: [],
      getData: () => 'https://i.imgur.com/removed.png',
    };

    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer);

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'test' }], type: 'paragraph' },
      {
        children: [{ text: '' }],
        type: 'image',
        url: 'https://i.imgur.com/removed.png',
      },
    ]);
  });

  it('accepts an uppercase image extension', () => {
    const editor = createEditor();
    const data = {
      files: [],
      getData: () => 'https://example.com/photo.PNG',
    };

    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer);

    expect(editor.read.children().at(1)).toMatchObject({
      type: 'image',
      url: 'https://example.com/photo.PNG',
    });
  });

  it('leaves image URLs rejected by the configured policy to text insertion', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseImagePlugin.configure({
          initialState: { isUrl: () => false },
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });
    const text = 'https://example.com/rejected.png';
    const data = {
      files: [],
      getData: () => text,
    };

    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer);

    expect(editor.read.children()).toEqual([
      { children: [{ text: `test${text}` }], type: 'paragraph' },
    ]);
  });

  it.each([
    '//google.com',
    'hello',
  ])('leaves non-image text to the next clipboard handler: %s', (text) => {
    const editor = createEditor();
    const data = {
      files: [],
      getData: () => text,
    };

    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer);

    expect(editor.read.children()).toEqual([
      { children: [{ text: `test${text}` }], type: 'paragraph' },
    ]);
  });

  it('leaves non-image files to the next clipboard handler', () => {
    suppressInsertDataOverrideWarning();

    const editor = createEditor();
    const data = {
      files: [new File(['test'], 'not-an-image')],
      getData: () => '',
    };

    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer);

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'test' }], type: 'paragraph' },
    ]);
  });

  it('leaves clipboard data without files to the next handler', () => {
    suppressInsertDataOverrideWarning();

    const editor = createEditor();
    const data = {
      files: [],
      getData: () => '',
    };

    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer);

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'test' }], type: 'paragraph' },
    ]);
  });

  it('uploads a pasted image after its original block', async () => {
    let resolveUpload = (_url: string) => {};
    let uploadStarted = () => {};
    const started = new Promise<void>((resolve) => {
      uploadStarted = resolve;
    });
    const uploadImage = mock(() => {
      uploadStarted();

      return new Promise<string>((resolve) => {
        resolveUpload = resolve;
      });
    });
    const editor = createBaseEditor({
      plugins: [
        BaseImagePlugin.configure({
          initialState: { uploadImage },
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: 'test' }], type: 'paragraph' },
        { children: [{ text: 'later' }], type: 'paragraph' },
      ],
    });
    const data = {
      files: [new File(['image'], 'image.png', { type: 'image/png' })],
      getData: () => '',
    };

    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer);
    await started;
    editor.update.selection.set({
      anchor: { offset: 5, path: [1, 0] },
      focus: { offset: 5, path: [1, 0] },
    });
    resolveUpload('https://platejs.org/uploaded-image.png');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(uploadImage).toHaveBeenCalledWith(
      expect.stringMatching(/^data:image\/png;base64,/)
    );
    expect(editor.read.children().at(1)).toEqual({
      children: [{ text: '' }],
      type: 'image',
      url: 'https://platejs.org/uploaded-image.png',
    });
    expect(editor.read.children().at(2)).toEqual({
      children: [{ text: 'later' }],
      type: 'paragraph',
    });
  });

  it('respects disabled URL embedding', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseImagePlugin.configure({
          initialState: { disableEmbedInsert: true },
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });
    const data = {
      files: [],
      getData: () => 'https://i.imgur.com/removed.png',
    };

    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer);

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'testhttps://i.imgur.com/removed.png' }],
        type: 'paragraph',
      },
    ]);
  });
});
