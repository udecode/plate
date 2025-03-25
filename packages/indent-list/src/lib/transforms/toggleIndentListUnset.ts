import type { Editor, NodeEntry } from '@udecode/plate';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';
import { ListStyleType } from '../types';
import { outdentList } from './outdentList';

/** Unset list style type if already set. */
export const toggleIndentListUnset = (
  editor: Editor,
  [node, path]: NodeEntry,
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  if (
    listStyleType === INDENT_LIST_KEYS.todo &&
    node.hasOwnProperty(INDENT_LIST_KEYS.checked)
  ) {
    editor.tf.unsetNodes(INDENT_LIST_KEYS.checked, { at: path });
    outdentList(editor as any, { listStyleType });

    return true;
  }

  if (listStyleType === node[BaseIndentListPlugin.key]) {
    editor.tf.unsetNodes([BaseIndentListPlugin.key], {
      at: path,
    });

    // N.B. outdentList only unsets list node props (including our custom seal ones) when
    // the indentation goes to zero. So we need to unset the other nodes manually here too.
    if (listStyleType === ListStyleType.Decimal) {
      editor.tf.unsetNodes(
        [
          "hierListRestart",
          "listParentIndex",
          INDENT_LIST_KEYS.listRestart,
          INDENT_LIST_KEYS.listStart,
        ],
        {
          at: path,
        }
      );
    }

    outdentList(editor as any, { listStyleType });

    return true;
  }
};
