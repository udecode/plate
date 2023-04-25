import {
  getNodeEntries,
  TEditor,
  TElement,
  Value,
} from '@udecode/plate-common';
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
