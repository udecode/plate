import { Editor, Transforms } from 'slate';
import {
  getSelectionNodesArrayByType,
  isNodeInSelection,
} from '../../../common/queries';
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
  const isActive = isNodeInSelection(editor, typeList);

  unwrapList(editor, { typeUl, typeOl, typeLi });

  Transforms.setNodes(editor, {
    type: typeP,
  });

  if (!isActive) {
    const list = { type: typeList, children: [] };
    Transforms.wrapNodes(editor, list);

    const nodes = getSelectionNodesArrayByType(editor, typeP);

    const listItem = { type: typeLi, children: [] };

    for (const [, path] of nodes) {
      Transforms.wrapNodes(editor, listItem, {
        at: path,
      });
    }
  }
};
