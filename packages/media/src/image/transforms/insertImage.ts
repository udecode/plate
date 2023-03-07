import {
  getPluginType,
  insertNodes,
  PlateEditor,
  Value,
} from '@udecode/plate-common';
import { ELEMENT_IMAGE } from '../createImagePlugin';
import { TImageElement } from '../types';

export const insertImage = <V extends Value>(
  editor: PlateEditor<V>,
  url: string | ArrayBuffer
) => {
  const text = { text: '' };
  const image: TImageElement = {
    type: getPluginType(editor, ELEMENT_IMAGE),
    url: url as any,
    children: [text],
  };
  insertNodes<TImageElement>(editor, image);
};
