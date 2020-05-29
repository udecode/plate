import { Editor } from 'slate';
import { unwrapNodesByType } from '../../../common/transforms';
import { ListType } from '../types';

export const unwrapList = (
  editor: Editor,
  {
    typeUl = ListType.UL,
    typeOl = ListType.OL,
    typeLi = ListType.LI,
  }: { typeUl?: string; typeOl?: string; typeLi?: string } = {}
) => {
  unwrapNodesByType(editor, typeLi);
  unwrapNodesByType(editor, [typeUl, typeOl], { split: true });
};
