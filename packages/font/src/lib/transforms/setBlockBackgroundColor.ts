import type { NodeEntry, SlateEditor } from '@udecode/plate';

import { BaseFontBackgroundColorPlugin } from '../BaseFontBackgroundColorPlugin';

export const setBlockBackgroundColor = (
  editor: SlateEditor,
  block: NodeEntry,
  backgroundColor: string
) => {
  editor.tf.setNodes(
    { [BaseFontBackgroundColorPlugin.key]: backgroundColor },
    { at: block[1] }
  );
};
