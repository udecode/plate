import {
  getPluginType,
  insertNodes,
  PlateEditor,
  TElement,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_IMAGE } from '../createImagePlugin';

export const insertImage = <V extends Value>(
  editor: PlateEditor<V>,
  url: string | ArrayBuffer
) => {
  const text = { text: '' };
  const image = {
    type: getPluginType(editor, ELEMENT_IMAGE),
    url,
    children: [text],
  };
  insertNodes<TElement>(editor, image);
};
