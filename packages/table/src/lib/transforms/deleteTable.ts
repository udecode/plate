import { type BasePlateEditor, KEYS } from 'platejs';

export const deleteTable = (editor: BasePlateEditor) => {
  if (
    editor.api.some({
      match: { type: editor.getType(KEYS.table) },
    })
  ) {
    const tableItem = editor.api.above({
      match: { type: editor.getType(KEYS.table) },
    });

    if (tableItem) {
      editor.update((tx) => {
        tx.nodes.remove({
          at: tableItem[1],
        });
      });
    }
  }
};
