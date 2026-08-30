import {
  type EditorUpdateTransaction,
  type Point,
  type Selection,
  SelectionApi,
  type Value,
} from '..';
import { getInternalDocumentChangeRootKeys, MAIN_ROOT_KEY } from '../internal';
import type { Batch } from './history';

export const clonePoint = (point: Point, root?: string): Point => {
  const nextRoot = point.root ?? root;

  return {
    offset: point.offset,
    path: [...point.path],
    ...(nextRoot && nextRoot !== MAIN_ROOT_KEY ? { root: nextRoot } : {}),
  };
};

export const cloneSelection = (
  selection: Selection,
  root?: string
): Selection => {
  if (!selection) return null;

  if (SelectionApi.isNode(selection)) {
    const selectionRoot = selection.root ?? root;

    return SelectionApi.nodes(
      selection.paths,
      selectionRoot && selectionRoot !== MAIN_ROOT_KEY
        ? {
            anchorPath: selection.anchorPath,
            focusPath: selection.focusPath,
            root: selectionRoot,
          }
        : {
            anchorPath: selection.anchorPath,
            focusPath: selection.focusPath,
          }
    );
  }

  return {
    ...selection,
    anchor: clonePoint(selection.anchor, root),
    focus: clonePoint(selection.focus, root),
  };
};

const getBatchRoots = <V extends Value>(batch: Batch<V>) =>
  new Set([
    ...getInternalDocumentChangeRootKeys(batch.change),
    ...batch.change.createRoots,
    ...batch.change.deleteRoots,
  ]);

const getBatchChangeRoot = <V extends Value>(
  batch: Batch<V>
): string | undefined => {
  const roots = [...getBatchRoots(batch)];

  return roots.length === 1 ? roots[0] : undefined;
};

export const getHistoricSelectionRoot = <V extends Value>(
  batch: Batch<V>,
  target: 'after' | 'before' = 'before'
): string | undefined => {
  const selection =
    target === 'before' ? batch.selectionBefore : batch.selectionAfter;
  const explicitRoot = SelectionApi.root(selection);

  if (explicitRoot) return explicitRoot;
  if (selection == null) return getBatchChangeRoot(batch);

  return target === 'before'
    ? (batch.selectionBeforeRoot ?? MAIN_ROOT_KEY)
    : (batch.selectionAfterRoot ?? MAIN_ROOT_KEY);
};

const batchHasRoot = <V extends Value>(batch: Batch<V>, root: string) =>
  getBatchRoots(batch).has(root);

export const shouldPreserveHistoricDOMSelection = <V extends Value>(
  root: string,
  batch: Batch<V>
) => !batch.change.empty && !batchHasRoot(batch, root);

export const shouldRestoreHistoricSelection = <V extends Value>(
  root: string,
  batch: Batch<V>,
  target: 'after' | 'before'
) =>
  !batch.change.empty &&
  getHistoricSelectionRoot(batch, target) === root &&
  batchHasRoot(batch, root);

export const restoreHistoricSelection = <V extends Value>(
  tx: Pick<EditorUpdateTransaction<V>, 'selection'>,
  batch: Batch<V>,
  viewRoot: string,
  target: 'after' | 'before'
) => {
  const selection =
    target === 'before' ? batch.selectionBefore : batch.selectionAfter;
  const root =
    getHistoricSelectionRoot(batch, target) ??
    SelectionApi.root(selection) ??
    MAIN_ROOT_KEY;
  const restoredSelection = cloneSelection(selection, root);

  if (root === viewRoot) {
    tx.selection.set(restoredSelection);
  }
};
