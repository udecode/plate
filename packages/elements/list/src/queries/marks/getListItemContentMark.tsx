import { getNode } from '@udecode/plate-common';
import { TEditor, TNode } from '@udecode/plate-core';
import { ListItemMarkerSelection } from '../../types';

export const getListItemContentMark = (
  editor: TEditor,
  licSelection: ListItemMarkerSelection,
  key: string
): unknown => {
  const node = getNode(editor, licSelection.path) as TNode;

  return node[key];
};
