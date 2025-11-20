import type { TElement } from 'platejs';
import type { PlateEditor } from 'platejs/react';

import { KEYS } from 'platejs';

const historyMarks = new WeakMap<PlateEditor, boolean>();

export const withHistoryMark = (editor: PlateEditor, fn: () => void) => {
  const prev = isHistoryMarking(editor);
  historyMarks.set(editor, true);
  fn();
  historyMarks.set(editor, prev);
};

export const isHistoryMarking = (editor: PlateEditor): boolean =>
  historyMarks.get(editor) ?? false;

export const updateUploadHistory = (editor: PlateEditor, node: TElement) => {
  const index = editor.history.undos.findLastIndex(
    (batch: any) =>
      batch[KEYS.placeholder] &&
      batch.operations.some(
        (operation: any) =>
          operation.type === 'insert_node' &&
          operation.node.id === node.placeholderId
      )
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
    operations: newOperations,
  };

  editor.history.undos[index] = newBatch;
};
