import { KEYS } from 'platejs';

import * as mediaModule from '../..';
import { insertMedia } from './insertMedia';

describe('insertMedia', () => {
  let insertImageSpy: ReturnType<typeof spyOn> | undefined;
  let insertMediaEmbedSpy: ReturnType<typeof spyOn> | undefined;
  let promptSpy: ReturnType<typeof spyOn> | undefined;

  afterEach(() => {
    insertImageSpy?.mockRestore();
    insertMediaEmbedSpy?.mockRestore();
    promptSpy?.mockRestore();
  });

  it('inserts an image when getUrl resolves and the target type is image', async () => {
    insertImageSpy = spyOn(mediaModule, 'insertImage').mockImplementation(
      () => {}
    );
    insertMediaEmbedSpy = spyOn(
      mediaModule,
      'insertMediaEmbed'
    ).mockImplementation(() => {});
    const editor = {
      getType: (key: string) => key,
    } as any;

    await insertMedia(editor, {
      at: [0],
      getUrl: async () => 'https://platejs.org/image.png',
    });

    expect(insertImageSpy).toHaveBeenCalledWith(
      editor,
      'https://platejs.org/image.png',
      { at: [0] }
    );
    expect(insertMediaEmbedSpy).not.toHaveBeenCalled();
  });

  it('inserts an embed when the requested type is not image', async () => {
    insertImageSpy = spyOn(mediaModule, 'insertImage').mockImplementation(
      () => {}
    );
    insertMediaEmbedSpy = spyOn(
      mediaModule,
      'insertMediaEmbed'
    ).mockImplementation(() => {});
    const editor = {
      getType: (key: string) => key,
    } as any;

    await insertMedia(editor, {
      getUrl: async () => 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      type: KEYS.mediaEmbed,
    });

    expect(insertImageSpy).not.toHaveBeenCalled();
    expect(insertMediaEmbedSpy).toHaveBeenCalledWith(
      editor,
      { url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE' },
      {}
    );
  });

  it('prompts for a url when getUrl is missing and stops when the user cancels', async () => {
    insertImageSpy = spyOn(mediaModule, 'insertImage').mockImplementation(
      () => {}
    );
    promptSpy = spyOn(window, 'prompt').mockReturnValue('');
    const editor = {
      getType: (key: string) => key,
    } as any;

    await insertMedia(editor);

    expect(promptSpy).toHaveBeenCalledWith('Enter the URL of the img');
    expect(insertImageSpy).not.toHaveBeenCalled();
  });
});
