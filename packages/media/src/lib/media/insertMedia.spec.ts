import { createBaseEditor } from '@platejs/core';
import { KEYS, NODES } from '@platejs/utils';

import { BaseImagePlugin } from '../image/BaseImagePlugin';
import { BaseMediaEmbedPlugin } from '../media-embed/BaseMediaEmbedPlugin';
import { insertMedia } from './insertMedia';

describe('insertMedia', () => {
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
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

  it('inserts an image from the resolved URL', async () => {
    const editor = createEditor();

    await insertMedia(editor, {
      at: [0],
      getUrl: async () => 'https://platejs.org/image.png',
    });

    expect(editor.read.children().at(1)).toEqual({
      children: [{ text: '' }],
      type: KEYS.img,
      url: 'https://platejs.org/image.png',
    });
  });

  it('inserts and normalizes an embed', async () => {
    const editor = createEditor();

    await insertMedia(editor, {
      getUrl: async () => 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      type: NODES.mediaEmbed,
    });

    expect(editor.read.children().at(1)).toMatchObject({
      provider: 'youtube',
      sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      type: NODES.mediaEmbed,
      url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
    });
  });

  it('stops when the URL prompt is cancelled', async () => {
    const editor = createEditor();
    const promptSpy = spyOn(window, 'prompt').mockReturnValue('');

    restorePrompt = () => promptSpy.mockRestore();

    await insertMedia(editor);

    expect(promptSpy).toHaveBeenCalledWith('Enter the URL of the img');
    expect(editor.read.children()).toHaveLength(1);
  });
});
