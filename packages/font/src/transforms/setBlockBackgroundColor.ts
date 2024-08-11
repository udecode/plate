import {
  type PlateEditor,
  type TNodeEntry,
  setNodes,
} from '@udecode/plate-common';

import { MARK_BG_COLOR } from '../FontBackgroundColorPlugin';

export const setBlockBackgroundColor = (
  editor: PlateEditor,
  block: TNodeEntry,
  backgroundColor: string
) => {
  setNodes(editor, { [MARK_BG_COLOR]: backgroundColor }, { at: block[1] });
};
