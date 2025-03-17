import { type SlateEditor, getEditorPlugin } from '@udecode/plate';

import { type TableConfig, type TTableElement, BaseTableRowPlugin } from '..';
import { deleteRowWhenExpanded } from '../merge';
import { deleteTableMergeRow } from '../merge/deleteRow';

export const deleteRow = (editor: SlateEditor) => {
  const { getOptions, type } = getEditorPlugin<TableConfig>(editor, {
    key: 'table',
  });
  const { disableMerge } = getOptions();

  if (!disableMerge) {
    return deleteTableMergeRow(editor);
  }
  if (
    editor.api.some({
      match: { type },
    })
  ) {
    const currentTableItem = editor.api.above<TTableElement>({
      match: { type },
    });

    if (!currentTableItem) return;
    if (editor.api.isExpanded())
      return deleteRowWhenExpanded(editor, currentTableItem);

    const currentRowItem = editor.api.above({
      match: { type: editor.getType(BaseTableRowPlugin) },
    });

    if (
      currentRowItem &&
      currentTableItem &&
      // Cannot delete the last row
      currentTableItem[0].children.length > 1
    ) {
      editor.tf.removeNodes({
        at: currentRowItem[1],
      });
    }
  }
};
