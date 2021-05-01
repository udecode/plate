import { insertNodes } from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  SPEditor,
  TElement,
} from '@udecode/slate-plugins-core';
import { ELEMENT_IMAGE } from '../defaults';

export const insertImage = (editor: SPEditor, url: string | ArrayBuffer) => {
  const text = { text: '' };
  const image = {
    type: getSlatePluginType(editor, ELEMENT_IMAGE),
    url,
    children: [text],
  };
  insertNodes<TElement>(editor, image);
};
