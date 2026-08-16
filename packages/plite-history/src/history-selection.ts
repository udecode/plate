import {
  type EditorUpdateTransaction,
  type Point,
  type Selection,
  SelectionApi,
  type Value,
} from '@platejs/plite';
import {
  getInternalDocumentChangeRootKeys,
  getRangeRoot as getRangeRootMeta,
  MAIN_ROOT_KEY,
} from '@platejs/plite/internal';
import type { Batch } from './history';

export const clonePoint = (point: Point, root?: string): Point => {
  const nextRoot = point.root ?? root;

  return {
    offset: point.offset,
    path: [...point.path],
    ...(nextRoot && nextRoot !== MAIN_ROOT_KEY ? { root: nextRoot } : {}),
  };
};

export const cloneRange = (range: Selection, root?: string): Selection =>
  range
    ? {
        ...range,
        anchor: clonePoint(range.anchor, root),
        focus: clonePoint(range.focus, root),
      }
    : null;

export const getRangeRoot = (range: Selection): string | undefined => {
  if (!range) return;

  const meta = getRangeRootMeta(range);

  return meta.anchor.visibility === 'implicit' &&
    meta.focus.visibility === 'implicit'
    ? undefined
    : (meta.root ?? undefined);
};

export const getRangeRootOrMain = (range: Selection): string =>
  getRangeRoot(range) ?? MAIN_ROOT_KEY;

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
  const explicitRoot = getRangeRoot(selection);

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
    getHistoricSelectionRoot(batch, target) ?? getRangeRootOrMain(selection);

  if (root === viewRoot && !SelectionApi.equals(tx.selection(), selection)) {
    (tx.selection.set as (selection: Selection) => void)(selection);
  }
};
