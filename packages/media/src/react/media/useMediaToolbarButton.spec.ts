import { createBaseEditor } from '@platejs/core';

import { BaseImagePlugin } from '../../lib/image/BaseImagePlugin';
import { BaseMediaEmbedPlugin } from '../../lib/media-embed/BaseMediaEmbedPlugin';
import { insertMediaUrl } from './useMediaToolbarButton';

describe('insertMediaUrl', () => {
  let restorePrompt: (() => void) | undefined;

  afterEach(() => {
    restorePrompt?.();
    restorePrompt = undefined;
  });

  const createEditor = () =>
    createBaseEditor({
      plugins: [BaseImagePlugin, BaseMediaEmbedPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

  it('inserts an image from the resolved URL', async () => {
    const editor = createEditor();

    await insertMediaUrl(editor, {
      getUrl: async () => 'https://platejs.org/image.png',
    });

    expect(editor.read.children().at(1)).toEqual({
      children: [{ text: '' }],
      type: 'image',
      url: 'https://platejs.org/image.png',
    });
  });

  it('inserts and normalizes an embed', async () => {
    const editor = createEditor();

    await insertMediaUrl(editor, {
      getUrl: async () => 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      type: 'mediaEmbed',
    });

    expect(editor.read.children().at(1)).toMatchObject({
      provider: 'youtube',
      sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      type: 'mediaEmbed',
      url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
    });
  });

  it('inserts an embed without requiring the image plugin', async () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    await insertMediaUrl(editor, {
      getUrl: async () => 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      type: editor.plugin(BaseMediaEmbedPlugin).schema.type,
    });

    expect(editor.read.children().at(1)).toMatchObject({
      provider: 'youtube',
      type: 'mediaEmbed',
    });
  });

  it('does nothing when no media plugin is installed', async () => {
    const editor = createBaseEditor({
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    let requestedUrl = false;

    await insertMediaUrl(editor, {
      getUrl: async () => {
        requestedUrl = true;

        return 'https://platejs.org/image.png';
      },
    });

    expect(requestedUrl).toBe(false);
    expect(editor.read.children()).toHaveLength(1);
  });

  it('does not route an unavailable image target through the embed plugin', async () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    let requestedUrl = false;

    await insertMediaUrl(editor, {
      getUrl: async () => {
        requestedUrl = true;

        return 'https://platejs.org/image.png';
      },
      type: 'image',
    });

    expect(requestedUrl).toBe(false);
    expect(editor.read.children()).toHaveLength(1);
  });

  it('keeps the selected block target while an asynchronous URL resolves', async () => {
    const editor = createEditor();
    let resolveUrl = (_url: string) => {};
    const insertion = insertMediaUrl(editor, {
      getUrl: () =>
        new Promise<string>((resolve) => {
          resolveUrl = resolve;
        }),
    });

    editor.update.selection.set(null);
    resolveUrl('https://platejs.org/image.png');
    await insertion;

    expect(editor.read.children().at(1)).toMatchObject({
      type: 'image',
      url: 'https://platejs.org/image.png',
    });
  });

  it('keeps an explicit target while the document changes', async () => {
    const editor = createEditor();
    let resolveUrl = (_url: string) => {};
    const insertion = insertMediaUrl(editor, {
      at: [1],
      getUrl: () =>
        new Promise<string>((resolve) => {
          resolveUrl = resolve;
        }),
    });

    editor.update.nodes.insert(
      { children: [{ text: 'before' }], type: 'paragraph' },
      { at: [0] }
    );
    resolveUrl('https://platejs.org/image.png');
    await insertion;

    expect(editor.read.children().at(2)).toMatchObject({
      type: 'image',
      url: 'https://platejs.org/image.png',
    });
  });

  it('stops when the URL prompt is cancelled', async () => {
    const editor = createEditor();
    const promptSpy = spyOn(window, 'prompt').mockReturnValue('');

    restorePrompt = () => promptSpy.mockRestore();

    await insertMediaUrl(editor);

    expect(promptSpy).toHaveBeenCalledWith('Enter the URL of the image');
    expect(editor.read.children()).toHaveLength(1);
  });
});
