import { TEditor, TNodeEntry, Value } from '@udecode/plate-core';
import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
import { ListStyleType } from '../types';
import { indentList } from './indentList';

/**
 * Set indent list if not set.
 */
export const toggleIndentListSet = <V extends Value>(
  editor: TEditor<V>,
  [node]: TNodeEntry,
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  if (!node[KEY_LIST_STYLE_TYPE]) {
    indentList(editor as any, {
      listStyleType,
    });
    return true;
  }
};
