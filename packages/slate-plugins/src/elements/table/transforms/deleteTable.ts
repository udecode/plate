import { isNodeInSelection } from 'common/queries';
import { defaultTableTypes } from 'elements/table/types';
import { Editor, Transforms } from 'slate';
import { isTable } from '../queries';

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
