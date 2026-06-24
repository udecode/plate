import type { TMediaElement } from 'platejs';
import type { PlateEditor } from 'platejs/react';

import { KEYS } from 'platejs';

type UploadHistoryOperation = {
  node?: { id?: string };
  type?: string;
};

type UploadHistoryBatch = {
  operations: UploadHistoryOperation[];
  [KEYS.placeholder]?: boolean;
};

const isPlaceholderInsertOperation = (
  operation: UploadHistoryOperation,
  placeholderId: string | undefined
) => operation.type === 'insert_node' && operation.node?.id === placeholderId;

export const updateUploadHistory = (
  editor: PlateEditor,
  node: TMediaElement
) => {
  const history = editor.history as { undos?: UploadHistoryBatch[] };
  const undos = history.undos;

  if (!undos) return;

  const index = undos.findLastIndex((batch) =>
    batch.operations.some((operation) =>
      isPlaceholderInsertOperation(operation, node.placeholderId)
    )
  );

  if (index < 0) return;

  const batch = undos[index];

  const newOperations: UploadHistoryOperation[] = [];

  for (const operation of batch.operations) {
    if (isPlaceholderInsertOperation(operation, node.placeholderId)) {
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

  undos[index] = newBatch;
};
