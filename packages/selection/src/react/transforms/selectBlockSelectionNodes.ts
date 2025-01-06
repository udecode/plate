import { type SlateEditor, selectNodes } from '@udecode/plate';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const selectBlockSelectionNodes = (editor: SlateEditor) => {
  selectNodes(
    editor,
    editor.getApi(BlockSelectionPlugin).blockSelection.getNodes()
  );
  editor.getApi(BlockSelectionPlugin).blockSelection.resetSelectedIds();
};
