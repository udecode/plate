import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import { Transforms } from 'slate';
import { ELEMENT_IMAGE } from '../defaults';

export const insertImage = (editor: SPEditor, url: string | ArrayBuffer) => {
  const text = { text: '' };
  const image = {
    type: getSlatePluginType(editor, ELEMENT_IMAGE),
    url,
    children: [text],
  };
  Transforms.insertNodes(editor, image);
};
