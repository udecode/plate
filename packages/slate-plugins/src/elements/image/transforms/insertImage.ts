import { Editor, Transforms } from 'slate';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_IMAGE } from '../defaults';
import { ImagePluginOptions } from '../types';

export const insertImage = (
  editor: Editor,
  url: string | ArrayBuffer,
  options?: ImagePluginOptions<'type'>
) => {
  const { img } = setDefaults(options, DEFAULTS_IMAGE);

  const text = { text: '' };
  const image = { type: img.type, url, children: [text] };
  Transforms.insertNodes(editor, image);
};
