import { Editor, Transforms } from 'slate';
import { unwrapNodesByType } from '../../../common/transforms';
import { ALIGN_CENTER, ALIGN_LEFT, ALIGN_RIGHT } from '../types';

export const wrapAlign = (editor: Editor, { typeAlign }: any) => {
  unwrapNodesByType(editor, ALIGN_LEFT);
  unwrapNodesByType(editor, ALIGN_RIGHT);
  unwrapNodesByType(editor, ALIGN_CENTER);

  const align = {
    type: typeAlign,
    children: [],
  };
  Transforms.wrapNodes(editor, align, { mode: 'lowest' });
};
