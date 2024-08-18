import type { WithOverride } from '@udecode/plate-common';

import { blockSelectionStore } from './blockSelectionStore';

export const withSelection: WithOverride = ({ editor }) => {
  (editor as any).blockSelectionStore = blockSelectionStore;

  return editor;
};
