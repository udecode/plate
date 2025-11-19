export type DiffDeletion = {
  type: 'delete';
};

export type DiffInsertion = {
  type: 'insert';
};

export type DiffOperation = DiffDeletion | DiffInsertion | DiffUpdate;

export type DiffProps = {
  diff: true;
  diffOperation: DiffOperation;
};

export type DiffUpdate = {
  newProperties: Record<string, any>;
  properties: Record<string, any>;
  type: 'update';
};
