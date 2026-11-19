import {
  definePluginPoint,
  getPluginContributions,
  type Editor,
  type Element,
} from '../../facade';

export const imageLink =
  definePluginPoint<(text: string) => Element | undefined>('image-link');

export const readImageLink = (editor: Editor, text: string) => {
  for (const link of getPluginContributions(editor, imageLink)) {
    const image = link(text);

    if (image) return image;
  }

  return undefined;
};
