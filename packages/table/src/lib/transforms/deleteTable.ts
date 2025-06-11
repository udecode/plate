import { type SlateEditor, KEYS } from '@udecode/plate';

export const deleteTable = (editor: SlateEditor) => {
  if (
    editor.api.some({
      match: { type: editor.getType(KEYS.table) },
    })
  ) {
    const tableItem = editor.api.above({
      match: { type: editor.getType(KEYS.table) },
    });

    if (tableItem) {
      editor.tf.removeNodes({
        at: tableItem[1],
      });
    }
  }
};
