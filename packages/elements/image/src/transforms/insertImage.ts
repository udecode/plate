import { insertNodes } from '@udecode/plate-common';
import { getPlatePluginType, SPEditor, TElement } from '@udecode/plate-core';
import { ELEMENT_IMAGE } from '../defaults';

export const insertImage = (editor: SPEditor, url: string | ArrayBuffer) => {
  const text = { text: '' };
  const image = {
    type: getPlatePluginType(editor, ELEMENT_IMAGE),
    url,
    children: [text],
  };
  insertNodes<TElement>(editor, image);
};
