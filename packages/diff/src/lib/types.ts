export interface DiffDeletion {
  type: 'delete';
}

export interface DiffInsertion {
  type: 'insert';
}

export type DiffOperation = DiffDeletion | DiffInsertion | DiffUpdate;

export interface DiffProps {
  diff: true;
  diffOperation: DiffOperation;
}

export interface DiffUpdate {
  newProperties: Record<string, any>;
  properties: Record<string, any>;
  type: 'update';
}
