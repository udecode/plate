import type { TElement } from '@udecode/plate-common';
import type { PlateEditor } from '@udecode/plate-common/react';

import { PlaceholderPlugin } from '../PlaceholderPlugin';

const historyMarks = new WeakMap<PlateEditor, boolean>();

export const withHistoryMark = (editor: PlateEditor, fn: () => void) => {
  historyMarks.set(editor, true);
  fn();
  historyMarks.set(editor, false);
};

export const isHistoryMarked = (editor: PlateEditor): boolean => {
  return historyMarks.get(editor) ?? false;
};

export const updateUploadHistory = (editor: PlateEditor, node: TElement) => {
  const index = editor.history.undos.findIndex(
    (batch: any) => batch[PlaceholderPlugin.key]
  );

  const batch = editor.history.undos[index];

  const newOperations: any[] = [];

  for (const operation of batch.operations) {
    if (
      (operation.type === 'insert_node' && (operation.node as any)).id ===
      node.placeholderId
    ) {
      newOperations.push({
        ...operation,
        node,
      });

      continue;
    }

    newOperations.push(operation);
  }

  const newBatch = {
    ...batch,
    [PlaceholderPlugin.key]: false,
    operations: newOperations,
  };

  editor.history.undos[index] = newBatch;
};
