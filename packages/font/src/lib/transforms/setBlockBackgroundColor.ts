import type { NodeEntry, SlateEditor } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

export const setBlockBackgroundColor = (
  editor: SlateEditor,
  block: NodeEntry,
  backgroundColor: string
) => {
  editor.tf.setNodes(
    { [KEYS.backgroundColor]: backgroundColor },
    { at: block[1] }
  );
};
