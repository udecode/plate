import type { SlateEditor } from '@udecode/plate';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const selectBlockSelectionNodes = (editor: SlateEditor) => {
  editor.tf.select(
    editor.api.nodesRange(
      editor.getApi(BlockSelectionPlugin).blockSelection.getNodes()
    )
  );
  editor.getApi(BlockSelectionPlugin).blockSelection.clear();
};
