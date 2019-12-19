import { Editor, Transforms } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';

export const insertImage = (editor: Editor, url: string | ArrayBuffer) => {
  const text = { text: '' };
  const image = { type: ElementType.IMAGE, url, children: [text] };
  Transforms.insertNodes(editor, image);
};
