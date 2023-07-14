import { TEditor, TNodeEntry, unsetNodes, Value } from '@udecode/plate-common';

import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
import { ListStyleType } from '../types';
import { outdentList } from './outdentList';

/**
 * Unset list style type if already set.
 */
export const toggleIndentListUnset = <V extends Value>(
  editor: TEditor<V>,
  [node, path]: TNodeEntry,
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  if (listStyleType === node[KEY_LIST_STYLE_TYPE]) {
    unsetNodes(editor as any, KEY_LIST_STYLE_TYPE, { at: path });
    outdentList(editor as any, { listStyleType });
    return true;
  }
};
