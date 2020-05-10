import { unwrapNodesByType } from 'common/transforms';
import { ListType } from 'elements/list/types';
import { Editor } from 'slate';

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
