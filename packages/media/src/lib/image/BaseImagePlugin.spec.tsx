import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseImagePlugin } from './BaseImagePlugin';

const TestBoldPlugin = createBasePlugin({
  key: 'bold',
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
      initialValue: [{ children: [{ text: 'test' }], type: KEYS.p }],
    });

  it('inserts at an exact explicit target through the flat scoped update', () => {
    const editor = createEditor();

    editor
      .plugin(BaseImagePlugin)
      .update.insert({ url: 'https://platejs.org/image.png' }, { at: [0] });

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: '' }],
        type: KEYS.img,
        url: 'https://platejs.org/image.png',
      },
      { children: [{ text: 'test' }], type: KEYS.p },
    ]);
  });

  it('normalizes direct insertion through the configured URL transform', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseImagePlugin.configure({
          options: {
            transformUrl: (url) => `${url}?normalized=image`,
          },
        }),
      ],
      initialValue: [{ children: [{ text: 'test' }], type: KEYS.p }],
    });

    editor
      .plugin(BaseImagePlugin)
      .update.insert({ url: 'https://platejs.org/image.png' }, { at: [0] });

    expect(editor.read.children()[0]).toMatchObject({
      type: KEYS.img,
      url: 'https://platejs.org/image.png?normalized=image',
    });
  });

  it('stores caption construction input as canonical child content', () => {
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin],
      initialValue: [{ children: [{ text: 'test' }], type: KEYS.p }],
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
      type: KEYS.img,
      url: 'https://platejs.org/image.png',
    });
    expect(image).not.toHaveProperty('caption');
    expect(editor.read.value()).not.toHaveProperty('roots');
  });

  it('automatically normalizes legacy persisted captions on load', () => {
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin, TestBoldPlugin],
      initialValue: [
        {
          caption: [{ bold: true, text: 'Legacy caption' }],
          children: [{ text: '' }],
          type: KEYS.img,
          url: 'https://platejs.org/legacy.png',
        },
      ],
    });

    expect(editor.read.children()).toEqual([
      {
        children: [{ bold: true, text: 'Legacy caption' }],
        type: KEYS.img,
        url: 'https://platejs.org/legacy.png',
      },
    ]);
  });

  it('rejects ambiguous mixed legacy and canonical caption content', () => {
    expect(() =>
      createBaseEditor({
        plugins: [BaseImagePlugin],
        initialValue: [
          {
            caption: [{ text: 'Legacy caption' }],
            children: [{ text: 'Canonical caption' }],
            type: KEYS.img,
            url: 'https://platejs.org/conflict.png',
          },
        ],
      })
    ).toThrow(/multiple non-empty caption sources/);
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
      type: KEYS.img,
      url: 'https://platejs.org/image.png',
    });
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

  it('accepts an uppercase image extension', () => {
    const editor = createEditor();
    const data = {
      files: [],
      getData: () => 'https://example.com/photo.PNG',
    };

    editor.api.clipboard.insertData(data as unknown as DataTransfer);

    expect(editor.read.children().at(1)).toMatchObject({
      type: KEYS.img,
      url: 'https://example.com/photo.PNG',
    });
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

    editor.api.clipboard.insertData(data as unknown as DataTransfer);

    expect(editor.read.children()).toEqual([
      { children: [{ text: `test${text}` }], type: KEYS.p },
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
          options: { uploadImage },
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: 'test' }], type: KEYS.p },
        { children: [{ text: 'later' }], type: KEYS.p },
      ],
    });
    const data = {
      files: [new File(['image'], 'image.png', { type: 'image/png' })],
      getData: () => '',
    };

    editor.api.clipboard.insertData(data as unknown as DataTransfer);
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
      type: KEYS.img,
      url: 'https://platejs.org/uploaded-image.png',
    });
    expect(editor.read.children().at(2)).toEqual({
      children: [{ text: 'later' }],
      type: KEYS.p,
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
