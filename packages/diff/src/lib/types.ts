export type DiffDeletion = {
  type: 'delete';
};

export type DiffInsertion = {
  type: 'insert';
};

export type DiffIntent = DiffDeletion | DiffInsertion | DiffUpdate;

export type DiffProps = {
  diff: true;
  diffIntent: DiffIntent;
};

export type DiffUpdate = {
  newProperties: Record<string, unknown>;
  properties: Record<string, unknown>;
  type: 'update';
};
