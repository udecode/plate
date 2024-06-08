import {
  type PlateEditor,
  type TNodeEntry,
  type Value,
  setNodes,
} from '@udecode/plate-common';

import { MARK_BG_COLOR } from '../createFontBackgroundColorPlugin';

export const setBlockBackgroundColor = (
  editor: PlateEditor<Value>,
  block: TNodeEntry,
  backgroundColor: string
) => {
  setNodes(editor, { [MARK_BG_COLOR]: backgroundColor }, { at: block[1] });
};
