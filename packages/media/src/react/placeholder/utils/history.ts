import { ElementApi, type Element } from '@platejs/plite';
import type { PlateEditor } from 'platejs/react';

export const updateUploadHistory = (editor: PlateEditor, node: Element) => {
  const undos = editor.read.history.undos();
  const index = undos.findLastIndex((batch) =>
    batch.operations.some(
      (operation) =>
        operation.type === 'insert_node' &&
        ElementApi.isElement(operation.node) &&
        operation.node.id === node.placeholderId
    )
  );

  if (index < 0) return;

  const batch = undos[index];

  if (!batch) return;

  const newOperations = batch.operations.map((operation) => {
    if (
      operation.type === 'insert_node' &&
      ElementApi.isElement(operation.node) &&
      operation.node.id === node.placeholderId
    ) {
      return {
        ...operation,
        node,
      };
    }

    return operation;
  });

  const newBatch = {
    ...batch,
    operations: newOperations,
  };

  batch.operations.splice(0, batch.operations.length, ...newBatch.operations);
};
