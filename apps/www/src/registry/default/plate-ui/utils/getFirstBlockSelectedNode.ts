import type { PlateEditor } from '@udecode/plate-core/react';

import { getBlockSelectedEntries } from '.';

export const getFirstBlockSelectedNode = (editor: PlateEditor) => {
  const entries = getBlockSelectedEntries(editor);

  return Array.from(entries)[0];
};
