import { Editor, Transforms } from 'slate';
import { unwrapNodesByType } from '../../../common/transforms';
import { CENTER, LEFT, RIGHT } from '../types';

export const wrapAlign = (editor: Editor, { typeAlign }: any) => {
  unwrapNodesByType(editor, LEFT);
  unwrapNodesByType(editor, RIGHT);
  unwrapNodesByType(editor, CENTER);

  const align = {
    type: typeAlign,
    children: [],
  };
  Transforms.wrapNodes(editor, align, { mode: 'lowest' });
};
