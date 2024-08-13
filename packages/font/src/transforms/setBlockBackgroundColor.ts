import {
  type PlateEditor,
  type TNodeEntry,
  setNodes,
} from '@udecode/plate-common';

import { FontBackgroundColorPlugin } from '../FontBackgroundColorPlugin';

export const setBlockBackgroundColor = (
  editor: PlateEditor,
  block: TNodeEntry,
  backgroundColor: string
) => {
  setNodes(
    editor,
    { [FontBackgroundColorPlugin.key]: backgroundColor },
    { at: block[1] }
  );
};
