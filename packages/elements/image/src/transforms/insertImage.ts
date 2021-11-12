import { insertNodes } from '@udecode/plate-common';
import { getPluginType, PlateEditor, TElement } from '@udecode/plate-core';
import { ELEMENT_IMAGE } from '../defaults';

export const insertImage = (editor: PlateEditor, url: string | ArrayBuffer) => {
  const text = { text: '' };
  const image = {
    type: getPluginType(editor, ELEMENT_IMAGE),
    url,
    children: [text],
  };
  insertNodes<TElement>(editor, image);
};
