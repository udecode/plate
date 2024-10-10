import { type TEditor, type TNodeEntry, setSelection } from '@udecode/slate';

import { getNodesRange } from '../queries';

export const selectNodes = (editor: TEditor, nodes: TNodeEntry[]) => {
  const range = getNodesRange(editor, nodes);

  if (!range) return;

  setSelection(editor, range);
};
