import {
  type Editor,
  type EditorUpdateTransaction,
  type Operation,
  type Range,
  RangeApi,
  type Value,
} from '@platejs/slate';
import {
  getEditorOperationRoot,
  getOperationRoot,
  getRangeRoot as getRangeRootMeta,
  MAIN_ROOT_KEY,
} from '@platejs/slate/internal';
import type { Batch } from './history';

export const clonePoint = (
  point: Range['anchor'],
  root?: string
): Range['anchor'] => {
  const nextRoot = point.root ?? root;

  return {
    offset: point.offset,
    path: [...point.path],
    ...(nextRoot && nextRoot !== MAIN_ROOT_KEY ? { root: nextRoot } : {}),
  };
};

export const cloneRange = (range: Range | null, root?: string): Range | null =>
  range
    ? {
        anchor: clonePoint(range.anchor, root),
        focus: clonePoint(range.focus, root),
      }
    : null;

export const getRangeRoot = (range: Range | null): string | undefined =>
  range ? (getRangeRootMeta(range).root ?? undefined) : undefined;

export const getRangeRootOrMain = (range: Range | null): string =>
  getRangeRoot(range) ?? MAIN_ROOT_KEY;

export const getOperationRootOrMain = (operation: Operation): string =>
  getOperationRoot(operation);

const getBatchOperationRoot = <V extends Value>(
  batch: Batch<V>
): string | undefined => {
  let root: string | undefined;

  for (const operation of batch.operations) {
    const operationRoot = getOperationRootOrMain(operation);

    if (root === undefined) {
      root = operationRoot;
      continue;
    }

    if (root !== operationRoot) {
      return;
    }
  }

  return root;
};

export const getHistoricSelectionRoot = <V extends Value>(
  batch: Batch<V>
): string | undefined => {
  const selectionRoot = getRangeRoot(batch.selectionBefore);

  if (selectionRoot) {
    return selectionRoot;
  }

  if (batch.selectionBefore == null) {
    return getBatchOperationRoot(batch);
  }

  return batch.selectionBeforeRoot ?? MAIN_ROOT_KEY;
};

const batchHasOperationRoot = <V extends Value>(
  batch: Batch<V>,
  root: string
) =>
  batch.operations.some(
    (operation) => getOperationRootOrMain(operation) === root
  );

export const filterHistoricSelectionOperations = <V extends Value>(
  operations: readonly Operation<V>[],
  root: string
) =>
  operations.filter(
    (operation) =>
      operation.type !== 'set_selection' ||
      getOperationRootOrMain(operation) === root
  );

export const filterHistoricUndoOperations = <V extends Value>(
  operations: readonly Operation<V>[],
  root: string
) =>
  filterHistoricSelectionOperations(operations, root).filter(
    (operation) => operation.type !== 'set_selection'
  );

export const shouldPreserveHistoricDOMSelection = <V extends Value>(
  editor: Editor<V>,
  batch: Batch<V>
) =>
  batch.operations.length > 0 &&
  !batchHasOperationRoot(batch, getEditorOperationRoot(editor));

export const shouldRestoreHistoricSelection = <V extends Value>(
  root: string,
  batch: Batch<V>
) => {
  const selectionRoot = getHistoricSelectionRoot(batch);

  return (
    batch.operations.length > 0 &&
    selectionRoot === root &&
    batchHasOperationRoot(batch, root)
  );
};

const createHistoricSelectionOperation = <V extends Value>(
  previous: Range | null,
  next: Range | null,
  root: string
): Extract<Operation<V>, { type: 'set_selection' }> | null => {
  if (previous == null && next == null) {
    return null;
  }

  if (previous == null) {
    return {
      newProperties: cloneRange(next)!,
      properties: null,
      root,
      type: 'set_selection',
    };
  }

  if (next == null) {
    return {
      newProperties: null,
      properties: cloneRange(previous)!,
      root,
      type: 'set_selection',
    };
  }

  if (RangeApi.equals(previous, next)) {
    return null;
  }

  return {
    newProperties: cloneRange(next)!,
    properties: cloneRange(previous)!,
    root,
    type: 'set_selection',
  };
};

export const restoreHistoricSelection = <V extends Value>(
  tx: EditorUpdateTransaction<V>,
  batch: Batch<V>,
  viewRoot: string
) => {
  const selection = batch.selectionBefore;
  const root = getHistoricSelectionRoot(batch) ?? getRangeRootOrMain(selection);

  if (root === viewRoot && !getRangeRoot(selection)) {
    tx.selection.set(selection);
    return;
  }

  const operation = createHistoricSelectionOperation<V>(
    tx.selection.get(),
    selection,
    root
  );

  if (operation) {
    tx.operations.replay([operation]);
  }
};

export const applySelectionPatch = (
  selection: Range | null,
  newProperties: Partial<Range> | null,
  root?: string
): Range | null => {
  if (newProperties == null) {
    return null;
  }

  if (selection == null) {
    if (!(newProperties.anchor && newProperties.focus)) {
      throw new Error(
        `set_selection patch requires an existing selection or a full range. Received: ${JSON.stringify(
          newProperties
        )}`
      );
    }

    return cloneRange(newProperties as Range, root);
  }

  const next = cloneRange(selection)!;

  if (Object.hasOwn(newProperties, 'anchor')) {
    if (!newProperties.anchor) {
      throw new Error('Cannot remove the "anchor" selection property');
    }

    next.anchor = clonePoint(newProperties.anchor, root);
  }

  if (Object.hasOwn(newProperties, 'focus')) {
    if (!newProperties.focus) {
      throw new Error('Cannot remove the "focus" selection property');
    }

    next.focus = clonePoint(newProperties.focus, root);
  }

  return next;
};
