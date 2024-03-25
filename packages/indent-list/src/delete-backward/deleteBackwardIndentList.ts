import {
  getAboveNode,
  getNodeString,
  isCollapsed,
  isDefined,
  PlateEditor,
  Value,
} from '@udecode/plate-common';
import { TextUnit } from 'slate';

import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
import { outdentList } from '../transforms';

export const deleteBackwardIndentList = <V extends Value>(
  editor: PlateEditor<V>
) => {
  const { deleteBackward } = editor;

  return function (unit: TextUnit) {
    deleteBackwardHelper(editor);
    deleteBackward(unit);
  };
};

function deleteBackwardHelper<V extends Value>(editor: PlateEditor<V>) {
  if (isCollapsed(editor.selection)) {
    const str = getNodeString(editor);
    if (str) return;
    const entry = getAboveNode(editor);
    if (!entry) return;
    const node = entry[0];
    if (isDefined(node[KEY_LIST_STYLE_TYPE])) {
      outdentList(editor);
    }
  }
}
