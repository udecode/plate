import { Editor, Transforms } from 'slate';
import { getNodesByType, isNodeTypeIn } from '../../../common/queries';
import { wrapNodes } from '../../../common/transforms/wrapNodes';
import { PARAGRAPH } from '../../paragraph';
import { ListType } from '../types';
import { unwrapList } from './unwrapList';

export const toggleList = (
  editor: Editor,
  {
    typeList,
    typeUl = ListType.UL,
    typeOl = ListType.OL,
    typeLi = ListType.LI,
    typeP = PARAGRAPH,
  }: {
    typeList: string;
    typeUl?: string;
    typeOl?: string;
    typeLi?: string;
    typeP?: string;
  }
) => {
  if (!editor.selection) return;

  const isActive = isNodeTypeIn(editor, typeList);

  unwrapList(editor, { typeUl, typeOl, typeLi });

  Transforms.setNodes(editor, {
    type: typeP,
  });

  if (!isActive) {
    const list = { type: typeList, children: [] };
    wrapNodes(editor, list);

    const nodes = [...getNodesByType(editor, typeP)];

    const listItem = { type: typeLi, children: [] };

    for (const [, path] of nodes) {
      Transforms.wrapNodes(editor, listItem, {
        at: path,
      });
    }
  }
};
