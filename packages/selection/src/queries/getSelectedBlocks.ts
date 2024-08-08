import {
  type TEditor,
  type TElement,
  getNodeEntries,
} from '@udecode/plate-common/server';

import { blockSelectionSelectors } from '../blockSelectionStore';

export const getSelectedBlocks = (editor: TEditor) => {
  const selectedIds = blockSelectionSelectors.selectedIds();

  return [
    ...getNodeEntries(editor, {
      at: [],
      match: (n) => selectedIds.has((n as TElement).id),
    }),
  ];
};
