import {
  type SlateEditor,
  type TNodeEntry,
  setNodes,
} from '@udecode/plate-common';

import { BaseFontBackgroundColorPlugin } from '../BaseFontBackgroundColorPlugin';

export const setBlockBackgroundColor = (
  editor: SlateEditor,
  block: TNodeEntry,
  backgroundColor: string
) => {
  setNodes(
    editor,
    { [BaseFontBackgroundColorPlugin.key]: backgroundColor },
    { at: block[1] }
  );
};
