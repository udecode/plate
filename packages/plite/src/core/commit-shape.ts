import type {
  DirtyRegion,
  EditorCommit,
  RuntimeId,
  TopLevelRuntimeRange,
} from '../interfaces/editor';
import type { Path } from '../interfaces/path';
import { cloneValue } from './clone';
import { cloneUpdateMetadata } from './update-context';

const getTopLevelRange = (
  paths: readonly Path[]
): readonly [number, number] | null => {
  const topLevelIndexes = paths
    .filter((path) => path.length > 0)
    .map((path) => path[0]!);

  if (topLevelIndexes.length === 0) {
    return null;
  }

  return [Math.min(...topLevelIndexes), Math.max(...topLevelIndexes)];
};

export const buildDirtyRegion = (change: {
  dirtyPaths: readonly Path[];
  dirtyScope: 'none' | 'paths' | 'all';
  touchedRuntimeIds: readonly RuntimeId[] | null;
}): DirtyRegion =>
  Object.freeze({
    paths: Object.freeze([...change.dirtyPaths]),
    runtimeIds: Object.freeze([...(change.touchedRuntimeIds ?? [])]),
    topLevelRange:
      change.dirtyScope === 'all' ? null : getTopLevelRange(change.dirtyPaths),
    wholeDocument: change.dirtyScope === 'all',
  });

const freezeRuntimeIds = (
  runtimeIds: readonly RuntimeId[] | null
): readonly RuntimeId[] | null =>
  runtimeIds == null ? null : Object.freeze([...runtimeIds]);

const freezeTopLevelRanges = (
  ranges: readonly TopLevelRuntimeRange[] | null
): readonly TopLevelRuntimeRange[] | null =>
  ranges == null
    ? null
    : Object.freeze(
        ranges.map((range) => Object.freeze([...range]) as TopLevelRuntimeRange)
      );

export const completeCommit = (
  change: Omit<
    EditorCommit,
    | 'dirty'
    | 'previousVersion'
    | 'snapshotChanged'
    | 'structureChanged'
    | 'textChanged'
    | 'version'
  >,
  {
    previousVersion,
    version,
  }: {
    previousVersion: number;
    version: number;
  }
): EditorCommit => {
  const textChanged = change.classes.includes('text');
  const structureChanged =
    change.classes.includes('structural') || change.classes.includes('replace');

  return Object.freeze({
    ...change,
    affectedNodeRuntimeIds: freezeRuntimeIds(change.affectedNodeRuntimeIds),
    affectedProjectionRuntimeIds: freezeRuntimeIds(
      change.affectedProjectionRuntimeIds
    ),
    affectedSelectionRuntimeIds: freezeRuntimeIds(
      change.affectedSelectionRuntimeIds
    ),
    affectedTextRuntimeIds: freezeRuntimeIds(change.affectedTextRuntimeIds),
    decorationImpactRuntimeIds:
      change.decorationImpactRuntimeIds == null
        ? null
        : Object.freeze([...change.decorationImpactRuntimeIds]),
    dirty: buildDirtyRegion(change),
    dirtyElementRuntimeIds: freezeRuntimeIds(change.dirtyElementRuntimeIds),
    dirtyTextRuntimeIds: freezeRuntimeIds(change.dirtyTextRuntimeIds),
    dirtyTopLevelRanges: freezeTopLevelRanges(change.dirtyTopLevelRanges),
    dirtyTopLevelRuntimeIds: freezeRuntimeIds(change.dirtyTopLevelRuntimeIds),
    dirtyStateKeys: Object.freeze([...change.dirtyStateKeys]),
    markDirtyRuntimeIds: freezeRuntimeIds(change.markDirtyRuntimeIds),
    metadata: cloneUpdateMetadata(change.metadata),
    nodeImpactRuntimeIds:
      change.nodeImpactRuntimeIds == null
        ? null
        : Object.freeze([...change.nodeImpactRuntimeIds]),
    previousVersion,
    snapshotChanged:
      change.childrenChanged ||
      change.selectionChanged ||
      change.marksChanged ||
      change.statePatches.length > 0,
    statePatches: Object.freeze(cloneValue([...change.statePatches])),
    structureChanged,
    selectionImpactRuntimeIds:
      change.selectionImpactRuntimeIds == null
        ? null
        : Object.freeze([...change.selectionImpactRuntimeIds]),
    structuralDirtyRuntimeIds: freezeRuntimeIds(
      change.structuralDirtyRuntimeIds
    ),
    tags: Object.freeze([...(change.tags ?? [])]),
    textChanged,
    textDirtyRuntimeIds: freezeRuntimeIds(change.textDirtyRuntimeIds),
    version,
  });
};
