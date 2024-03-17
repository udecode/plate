export interface DiffInsertion {
  type: 'insert';
}

export interface DiffDeletion {
  type: 'delete';
}

export interface DiffUpdate {
  type: 'update';
  properties: Record<string, any>;
  newProperties: Record<string, any>;
}

export type DiffOperation = DiffInsertion | DiffDeletion | DiffUpdate;

export interface DiffProps {
  diff: true;
  diffOperation: DiffOperation;
}
