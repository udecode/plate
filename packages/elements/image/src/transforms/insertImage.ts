import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';
import { ELEMENT_IMAGE } from '../defaults';

export const insertImage = (editor: Editor, url: string | ArrayBuffer) => {
  const text = { text: '' };
  const image = {
    type: getPluginType(editor, ELEMENT_IMAGE),
    url,
    children: [text],
  };
  Transforms.insertNodes(editor, image);
};
