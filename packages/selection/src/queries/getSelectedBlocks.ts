import {
  type TEditor,
  type TElement,
  type Value,
  getNodeEntries,
} from '@udecode/plate-common/server';

import { blockSelectionSelectors } from '../blockSelectionStore';

export const getSelectedBlocks = <V extends Value>(editor: TEditor<V>) => {
  const selectedIds = blockSelectionSelectors.selectedIds();

  return [
    ...getNodeEntries(editor, {
      at: [],
      match: (n) => selectedIds.has((n as TElement).id),
    }),
  ];
};

export const isBlockSelected = (node: TElement) => {
  const selectedIds = blockSelectionSelectors.selectedIds();

  return node.id && selectedIds.has(node.id);
};
