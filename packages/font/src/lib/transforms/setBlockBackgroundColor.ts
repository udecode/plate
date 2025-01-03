import type { SlateEditor, TNodeEntry } from '@udecode/plate-common';

import { BaseFontBackgroundColorPlugin } from '../BaseFontBackgroundColorPlugin';

export const setBlockBackgroundColor = (
  editor: SlateEditor,
  block: TNodeEntry,
  backgroundColor: string
) => {
  editor.tf.setNodes(
    { [BaseFontBackgroundColorPlugin.key]: backgroundColor },
    { at: block[1] }
  );
};
