import { Editor, Transforms } from 'slate';
import { isNodeInSelection } from '../../../common/queries';
import { isTable } from '../queries';
import { defaultTableTypes } from '../types';

export const deleteTable = (editor: Editor, options = defaultTableTypes) => {
  if (isNodeInSelection(editor, options.typeTable)) {
    const tableItem = Editor.above(editor, {
      match: isTable(options),
    });
    if (tableItem) {
      Transforms.removeNodes(editor, {
        at: tableItem[1],
      });
    }
  }
};
