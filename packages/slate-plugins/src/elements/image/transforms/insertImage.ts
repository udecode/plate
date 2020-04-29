import { Editor, Transforms } from 'slate';
import { IMAGE } from '../types';

export const insertImage = (
  editor: Editor,
  url: string | ArrayBuffer,
  { typeImg = IMAGE } = {}
) => {
  const text = { text: '' };
  const image = { type: typeImg, url, children: [text] };
  Transforms.insertNodes(editor, image);
};
