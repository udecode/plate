import type { SlateEditor } from '@udecode/plate';

import { BaseTablePlugin } from '../BaseTablePlugin';

export const deleteTable = (editor: SlateEditor) => {
  if (
    editor.api.some({
      match: { type: editor.getType(BaseTablePlugin) },
    })
  ) {
    const tableItem = editor.api.above({
      match: { type: editor.getType(BaseTablePlugin) },
    });

    if (tableItem) {
      editor.tf.removeNodes({
        at: tableItem[1],
      });
    }
  }
};
