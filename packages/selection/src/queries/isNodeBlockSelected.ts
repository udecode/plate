import type { TElement } from '@udecode/plate-common';

import { blockSelectionSelectors } from '../blockSelectionStore';

export const isNodeBlockSelected = (node: TElement) => {
  const selectedIds = blockSelectionSelectors.selectedIds();

  return node.id && selectedIds.has(node.id);
};
