import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';

export const insertImage = (
  editor: Editor,
  url: string | ArrayBuffer,
  { img }: SlatePluginsOptions
) => {
  const text = { text: '' };
  const image = { type: img.type, url, children: [text] };
  Transforms.insertNodes(editor, image);
};
