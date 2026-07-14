import { KEYS } from '@platejs/utils';

import * as mediaModule from '../..';
import { insertMedia } from './insertMedia';

describe('insertMedia', () => {
  let restoreInsertImage: (() => void) | undefined;
  let restoreInsertMediaEmbed: (() => void) | undefined;
  let restorePrompt: (() => void) | undefined;

  afterEach(() => {
    restoreInsertImage?.();
    restoreInsertMediaEmbed?.();
    restorePrompt?.();
  });

  it('inserts an image when getUrl resolves and the target type is image', async () => {
    const insertImageSpy = spyOn(mediaModule, 'insertImage').mockImplementation(
      () => {}
    );
    const insertMediaEmbedSpy = spyOn(
      mediaModule,
      'insertMediaEmbed'
    ).mockImplementation(() => {});
    restoreInsertImage = () => insertImageSpy.mockRestore();
    restoreInsertMediaEmbed = () => insertMediaEmbedSpy.mockRestore();
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
    const insertImageSpy = spyOn(mediaModule, 'insertImage').mockImplementation(
      () => {}
    );
    const insertMediaEmbedSpy = spyOn(
      mediaModule,
      'insertMediaEmbed'
    ).mockImplementation(() => {});
    restoreInsertImage = () => insertImageSpy.mockRestore();
    restoreInsertMediaEmbed = () => insertMediaEmbedSpy.mockRestore();
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
    const insertImageSpy = spyOn(mediaModule, 'insertImage').mockImplementation(
      () => {}
    );
    const promptSpy = spyOn(window, 'prompt').mockReturnValue('');
    restoreInsertImage = () => insertImageSpy.mockRestore();
    restorePrompt = () => promptSpy.mockRestore();
    const editor = {
      getType: (key: string) => key,
    } as any;

    await insertMedia(editor);

    expect(promptSpy).toHaveBeenCalledWith('Enter the URL of the img');
    expect(insertImageSpy).not.toHaveBeenCalled();
  });
});
