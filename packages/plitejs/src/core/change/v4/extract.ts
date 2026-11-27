import { getDefined } from '../../../internal/get-defined';
import {
  getRecordSetVersion,
  getValueRecords,
  hasValueRecords,
  readRecord,
  recordSetIds,
} from '../../record-store';
import type { DocumentIndex } from '../document-index';
import { cloneJson, isRecord, jsonEqual, type JsonRecord } from '../json';
import { lazyRootOf, visitRootNames } from '../lazy-root';
import type {
  DocumentPropertyContext,
  DocumentSetPropertyResolver,
} from '../root-change';
import {
  isElementNode,
  isTextNode,
  type JsonEditorValue,
  type JsonElementNode,
  type JsonNode,
  nodeProps,
} from '../tokens';
import {
  applyV4StepToState,
  createMutableV4State,
  isTextBearingElement,
  type MutableV4State,
  toV4TextStream,
  type V4TextUnit,
} from './apply';
import {
  isEmptyPropDelta,
  normalizeV4SetValues,
  subtractV4SetValues,
  V4_REGISTER_SET,
  type V4Place,
  type V4PropDelta,
  type V4Step,
} from './types';

export type ExtractV4Options = Readonly<{
  indexedAfter?: ReadonlyMap<string, DocumentIndex>;
  indexedBefore?: ReadonlyMap<string, DocumentIndex>;
  isSetValued?: DocumentSetPropertyResolver;
}>;

const elementIdOf = (node: JsonNode): string | null =>
  isElementNode(node) && typeof node.id === 'string' && node.id.length > 0
    ? node.id
    : null;

const ancestorTypesOfElement = (
  state: MutableV4State,
  elementId: string
): string[] => {
  const ancestors: string[] = [];
  let cursor = state.idMap.get(elementId)?.parent ?? null;

  while (cursor) {
    ancestors.push(typeof cursor.type === 'string' ? cursor.type : 'element');
    const cursorId = elementIdOf(cursor);

    cursor = cursorId ? (state.idMap.get(cursorId)?.parent ?? null) : null;
  }

  return ancestors;
};

const buildV4PropertyContext = (
  state: MutableV4State,
  elementId: string,
  rootName: string,
  path: readonly number[],
  placement: 'element' | 'text'
): DocumentPropertyContext => {
  const element = state.idMap.get(elementId)?.node;
  const elementType =
    element && typeof element.type === 'string' ? element.type : 'element';
  const elementAncestors = ancestorTypesOfElement(state, elementId);
  const root = rootName === 'main' ? null : rootName;

  if (placement === 'text') {
    return Object.freeze({
      ancestors: elementAncestors,
      parent: elementType,
      path,
      placement: 'text',
      root,
      type: elementType,
    });
  }

  return Object.freeze({
    ancestors: elementAncestors,
    parent: elementAncestors[0] ?? null,
    path,
    placement: 'element',
    root,
    type: elementType,
  });
};

export const propDeltaBetween = (
  before: Readonly<JsonRecord>,
  after: Readonly<JsonRecord>,
  isSetValuedKey?: (key: string) => boolean
): V4PropDelta => {
  const set: JsonRecord = {};
  const unset: string[] = [];
  const add: Record<string, unknown[]> = {};
  const remove: Record<string, unknown[]> = {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of [...keys].sort()) {
    if (key === 'children' || key === 'text' || key === 'id') continue;

    const hadBefore = Object.hasOwn(before, key);
    const hasAfter = Object.hasOwn(after, key);
    const beforeVal = before[key];
    const afterVal = after[key];

    if (hadBefore && hasAfter && jsonEqual(beforeVal, afterVal)) continue;

    if (
      isSetValuedKey?.(key) &&
      (beforeVal === undefined || Array.isArray(beforeVal)) &&
      (afterVal === undefined || Array.isArray(afterVal))
    ) {
      const beforeArr = Array.isArray(beforeVal) ? beforeVal : [];
      const afterArr = Array.isArray(afterVal) ? afterVal : [];
      const added = subtractV4SetValues(afterArr, beforeArr);
      const removed = subtractV4SetValues(beforeArr, afterArr);

      if (added.length > 0) add[key] = normalizeV4SetValues(added);
      if (removed.length > 0) remove[key] = normalizeV4SetValues(removed);
      continue;
    }

    if (!hasAfter) {
      unset.push(key);
    } else {
      set[key] = cloneJson(afterVal);
    }
  }

  return {
    ...(Object.keys(add).length > 0 ? { add } : {}),
    ...(Object.keys(remove).length > 0 ? { remove } : {}),
    ...(Object.keys(set).length > 0 ? { set } : {}),
    ...(unset.length > 0 ? { unset } : {}),
  };
};

const collectAllIds = (
  nodes: readonly JsonNode[],
  out = new Set<string>()
): Set<string> => {
  for (const node of nodes) {
    const id = elementIdOf(node);

    if (id !== null) out.add(id);
    if (isElementNode(node)) collectAllIds(node.children, out);
  }

  return out;
};

const collectAllIdsInValue = (value: JsonEditorValue): Set<string> => {
  const out = collectAllIds(value.children);

  if (value.roots) {
    for (const root of visitRootNames(value.roots)) {
      collectAllIds(value.roots[root], out);
    }
  }

  return out;
};

/**
 * Strip descendants whose ids already exist in `liveIds` so an `insert_node`
 * does not collide with surviving elements that will subsequently move in.
 */
const stripLiveDescendants = (
  node: JsonElementNode,
  liveIds: Readonly<{ has: (id: string) => boolean }>
): JsonElementNode => {
  const children: JsonNode[] = [];

  for (const child of node.children) {
    if (!isElementNode(child)) {
      children.push(cloneJson(child));
      continue;
    }

    const childId = elementIdOf(child);

    if (childId !== null && liveIds.has(childId)) continue;
    children.push(stripLiveDescendants(child, liveIds));
  }

  return {
    ...cloneJson(nodeProps(node)),
    children,
  };
};

const extractTextElementDiff = (
  targetId: string,
  beforeNode: JsonElementNode,
  afterNode: JsonElementNode,
  steps: V4Step[],
  isSetValuedForText?: (key: string) => boolean
) => {
  const beforeStream = toV4TextStream(beforeNode.children);
  const afterStream = toV4TextStream(afterNode.children);

  if (beforeStream.units.length === 0 && afterStream.units.length === 0) {
    const delta = propDeltaBetween(
      beforeStream.emptyLeafMarks ?? {},
      afterStream.emptyLeafMarks ?? {},
      isSetValuedForText
    );

    if (!isEmptyPropDelta(delta)) {
      steps.push({
        ...delta,
        length: 0,
        offset: 0,
        op: 'format_text',
        target: targetId,
      });
    }
    return;
  }

  const sameUnitExact = (left: V4TextUnit, right: V4TextUnit): boolean => {
    if (left.kind !== right.kind) return false;
    if (left.kind === 'inline' && right.kind === 'inline') {
      return left.node.id === right.node.id;
    }
    if (left.kind === 'char' && right.kind === 'char') {
      return left.ch === right.ch && jsonEqual(left.marks, right.marks);
    }
    return false;
  };

  const sameUnitChar = (left: V4TextUnit, right: V4TextUnit): boolean => {
    if (left.kind !== right.kind) return false;
    if (left.kind === 'inline' && right.kind === 'inline') {
      return left.node.id === right.node.id;
    }
    if (left.kind === 'char' && right.kind === 'char') {
      return left.ch === right.ch;
    }
    return false;
  };

  if (
    beforeStream.units.length === afterStream.units.length &&
    beforeStream.units.every((u, i) => sameUnitChar(u, afterStream.units[i]))
  ) {
    let i = 0;

    while (i < beforeStream.units.length) {
      const left = beforeStream.units[i];
      const right = afterStream.units[i];

      if (left.kind !== 'char' || right.kind !== 'char') {
        i += 1;
        continue;
      }

      const delta = propDeltaBetween(
        left.marks,
        right.marks,
        isSetValuedForText
      );

      if (isEmptyPropDelta(delta)) {
        i += 1;
        continue;
      }

      const start = i;

      i += 1;
      while (i < beforeStream.units.length) {
        const nl = beforeStream.units[i];
        const nr = afterStream.units[i];

        if (
          nl.kind !== 'char' ||
          nr.kind !== 'char' ||
          !jsonEqual(
            propDeltaBetween(nl.marks, nr.marks, isSetValuedForText),
            delta
          )
        ) {
          break;
        }
        i += 1;
      }

      steps.push({
        ...delta,
        length: i - start,
        offset: start,
        op: 'format_text',
        target: targetId,
      });
    }
    return;
  }

  let prefix = 0;
  const minLen = Math.min(beforeStream.units.length, afterStream.units.length);

  while (
    prefix < minLen &&
    sameUnitExact(beforeStream.units[prefix], afterStream.units[prefix])
  ) {
    prefix += 1;
  }

  let suffix = 0;

  while (
    suffix < minLen - prefix &&
    sameUnitExact(
      beforeStream.units[beforeStream.units.length - 1 - suffix],
      afterStream.units[afterStream.units.length - 1 - suffix]
    )
  ) {
    suffix += 1;
  }

  const deleteLen = beforeStream.units.length - prefix - suffix;

  if (deleteLen > 0) {
    steps.push({
      length: deleteLen,
      offset: prefix,
      op: 'delete_text',
      target: targetId,
    });
  }

  const insertSlice = afterStream.units.slice(
    prefix,
    afterStream.units.length - suffix
  );
  let cursor = prefix;
  let i = 0;

  while (i < insertSlice.length) {
    const unit = getDefined(insertSlice[i]);

    if (unit.kind === 'inline') {
      steps.push({
        node: cloneJson(unit.node),
        op: 'insert_node',
        to: { id: targetId, offset: cursor },
      });
      cursor += 1;
      i += 1;
      continue;
    }

    let text = unit.ch;
    const { marks } = unit;

    i += 1;
    while (i < insertSlice.length) {
      const next = getDefined(insertSlice[i]);

      if (next.kind !== 'char' || !jsonEqual(next.marks, marks)) break;
      text += next.ch;
      i += 1;
    }

    steps.push({
      ...(Object.keys(marks).length > 0 ? { marks: cloneJson(marks) } : {}),
      offset: cursor,
      op: 'insert_text',
      target: targetId,
      text,
    });
    cursor += text.length;
  }
};

const indexForRootIfIndexed = (
  value: JsonEditorValue,
  root: string,
  provided?: ReadonlyMap<string, DocumentIndex>
): DocumentIndex | undefined => {
  const direct = provided?.get(root);

  if (direct) return direct;
  if (root === 'main') return lazyRootOf(value, 'children');
  if (value.roots && Object.hasOwn(value.roots, root)) {
    return lazyRootOf(value.roots, root);
  }

  return undefined;
};

const shiftTopLevelPlace = (
  place: V4Place,
  offsets: ReadonlyMap<string, number>
): V4Place => {
  if (!('root' in place)) return place;
  const offset = offsets.get(place.root) ?? 0;

  return offset === 0
    ? place
    : { index: place.index + offset, root: place.root };
};

const shiftTopLevelSteps = (
  steps: readonly V4Step[],
  offsets: ReadonlyMap<string, number>
): V4Step[] => {
  if (offsets.size === 0) return [...steps];

  return steps.map((step) => {
    if (step.op === 'insert_node' || step.op === 'move_node') {
      const shifted = shiftTopLevelPlace(step.to, offsets);

      return shifted === step.to ? step : { ...step, to: shifted };
    }

    return step;
  });
};

const extractRegisterSteps = (
  before: JsonEditorValue,
  after: JsonEditorValue
): V4Step[] => {
  if (!hasValueRecords(after)) return [];

  const beforeStore = getValueRecords(before);
  const afterStore = getValueRecords(after);
  const beforeVer = getRecordSetVersion(beforeStore, V4_REGISTER_SET);
  const afterVer = getRecordSetVersion(afterStore, V4_REGISTER_SET);

  if (beforeVer === afterVer) return [];

  const steps: V4Step[] = [];
  const regKeys = new Set([
    ...recordSetIds(beforeVer),
    ...recordSetIds(afterVer),
  ]);

  for (const key of [...regKeys].sort()) {
    const bEntry = readRecord(beforeVer, key);
    const aEntry = readRecord(afterVer, key);

    if (jsonEqual(bEntry, aEntry)) continue;
    if (aEntry === undefined) {
      const bWriteId =
        isRecord(bEntry) && typeof bEntry.writeId === 'string'
          ? bEntry.writeId
          : 'extract';

      steps.push({
        after: null,
        id: key,
        op: 'set_register',
        set: V4_REGISTER_SET,
        writeId: `${bWriteId}:drop`,
      });
    } else if (
      isRecord(aEntry) &&
      typeof aEntry.encoded === 'string' &&
      typeof aEntry.writeId === 'string'
    ) {
      steps.push({
        after: aEntry.encoded,
        id: key,
        op: 'set_register',
        set: V4_REGISTER_SET,
        writeId: aEntry.writeId,
      });
    }
  }

  return steps;
};

const extractV4BetweenSparse = (
  before: JsonEditorValue,
  after: JsonEditorValue,
  options: ExtractV4Options
): readonly V4Step[] | null => {
  const beforeRoots = new Set(visitRootNames(before.roots));
  const afterRoots = new Set(visitRootNames(after.roots));
  const allRoots = new Set<string>(['main', ...beforeRoots, ...afterRoots]);

  // Only engage the sparse path when at least one root is indexed lazily or
  // explicitly via options, avoiding extra DocumentIndex work on tiny raw JSON
  // values.
  let hasIndexedRoot = false;
  const rootEntries = new Map<
    string,
    Readonly<{
      afterIndex?: DocumentIndex;
      beforeIndex?: DocumentIndex;
      inAfter: boolean;
      inBefore: boolean;
    }>
  >();

  for (const root of allRoots) {
    const inBefore = root === 'main' || beforeRoots.has(root);
    const inAfter = root === 'main' || afterRoots.has(root);
    const beforeIndex = inBefore
      ? indexForRootIfIndexed(before, root, options.indexedBefore)
      : undefined;
    const afterIndex = inAfter
      ? indexForRootIfIndexed(after, root, options.indexedAfter)
      : undefined;

    if (beforeIndex || afterIndex) hasIndexedRoot = true;
    rootEntries.set(root, { afterIndex, beforeIndex, inAfter, inBefore });
  }

  if (!hasIndexedRoot) return null;

  const changedRoots: Array<
    Readonly<{
      afterSlices: ReadonlyArray<readonly JsonNode[]>;
      beforeSlices: ReadonlyArray<readonly JsonNode[]>;
      offsets: readonly number[];
      root: string;
    }>
  > = [];
  const createdRoots: string[] = [];
  const deletedRoots: string[] = [];

  for (const root of [...allRoots].sort()) {
    const entry = getDefined(rootEntries.get(root));

    if (!entry.inBefore && entry.inAfter) {
      createdRoots.push(root);
      continue;
    }
    if (entry.inBefore && !entry.inAfter) {
      deletedRoots.push(root);
      continue;
    }
    if (!entry.beforeIndex || !entry.afterIndex) {
      // Plain array root alongside indexed roots: skip cheaply if identical by
      // reference, otherwise fall back to full extraction.
      const beforeArr =
        root === 'main' ? before.children : before.roots?.[root];
      const afterArr = root === 'main' ? after.children : after.roots?.[root];

      if (beforeArr === afterArr) continue;
      if (beforeArr && afterArr) {
        changedRoots.push({
          afterSlices: [afterArr],
          beforeSlices: [beforeArr],
          offsets: [0],
          root,
        });
        continue;
      }

      return null;
    }

    if (entry.beforeIndex === entry.afterIndex) continue;

    const ranges = entry.beforeIndex.changedChildren(entry.afterIndex);

    if (ranges.length === 0) continue;

    const beforeSlices: Array<readonly JsonNode[]> = [];
    const afterSlices: Array<readonly JsonNode[]> = [];
    const offsets: number[] = [];

    for (const [fromBefore, toBefore, fromAfter, toAfter] of ranges) {
      const wholeBefore =
        fromBefore === 0 && toBefore === entry.beforeIndex.size;
      const wholeAfter = fromAfter === 0 && toAfter === entry.afterIndex.size;

      beforeSlices.push(
        wholeBefore
          ? entry.beforeIndex.value
          : entry.beforeIndex.nodes.slice(fromBefore, toBefore)
      );
      afterSlices.push(
        wholeAfter
          ? entry.afterIndex.value
          : entry.afterIndex.nodes.slice(fromAfter, toAfter)
      );
      offsets.push(fromAfter);
    }

    changedRoots.push({ afterSlices, beforeSlices, offsets, root });
  }

  // Fast path: nothing in any tree changed (only records or no-op).
  if (
    changedRoots.length === 0 &&
    createdRoots.length === 0 &&
    deletedRoots.length === 0
  ) {
    return extractRegisterSteps(before, after);
  }

  // If every changed root has at most 1 range (the 99.9% case, including
  // cross-root moves between two changed slices), build one mini before/after
  // value with ONLY the changed slices and run the exact core extractor.
  const singleRangeAll = changedRoots.every((r) => r.beforeSlices.length === 1);

  if (singleRangeAll) {
    const offsets = new Map<string, number>();
    let beforeMain: readonly JsonNode[] = [];
    let afterMain: readonly JsonNode[] = [];
    const miniBeforeRoots: Record<string, readonly JsonNode[]> = {};
    const miniAfterRoots: Record<string, readonly JsonNode[]> = {};

    for (const item of changedRoots) {
      const offset = getDefined(item.offsets[0]);

      if (offset !== 0) offsets.set(item.root, offset);
      if (item.root === 'main') {
        beforeMain = getDefined(item.beforeSlices[0]);
        afterMain = getDefined(item.afterSlices[0]);
      } else {
        miniBeforeRoots[item.root] = getDefined(item.beforeSlices[0]);
        miniAfterRoots[item.root] = getDefined(item.afterSlices[0]);
      }
    }

    for (const root of createdRoots) {
      const entry = getDefined(rootEntries.get(root));
      const nodes = entry.afterIndex
        ? entry.afterIndex.value
        : (after.roots?.[root] ?? []);

      miniAfterRoots[root] = nodes;
    }

    for (const root of deletedRoots) {
      const entry = getDefined(rootEntries.get(root));
      const nodes = entry.beforeIndex
        ? entry.beforeIndex.value
        : (before.roots?.[root] ?? []);

      miniBeforeRoots[root] = nodes;
    }

    const miniBefore: JsonEditorValue = {
      children: beforeMain,
      ...(Object.keys(miniBeforeRoots).length > 0
        ? { roots: miniBeforeRoots }
        : {}),
    };
    const miniAfter: JsonEditorValue = {
      children: afterMain,
      ...(Object.keys(miniAfterRoots).length > 0
        ? { roots: miniAfterRoots }
        : {}),
    };

    const treeSteps = extractV4BetweenCore(miniBefore, miniAfter, {
      isSetValued: options.isSetValued,
      rootOffsets: offsets,
    });

    return [
      ...shiftTopLevelSteps(treeSteps, offsets),
      ...extractRegisterSteps(before, after),
    ];
  }

  // Multi-range case (e.g. two disjoint blocks updated in one root): if no
  // element ID crosses between ranges or roots, diff each range independently
  // without reading untouched blocks between them.
  if (createdRoots.length === 0 && deletedRoots.length === 0) {
    const allBeforeSets: Array<Set<string>> = [];
    const allAfterSets: Array<Set<string>> = [];
    let crossSliceOverlap = false;

    for (const item of changedRoots) {
      for (let k = 0; k < item.beforeSlices.length; k += 1) {
        allBeforeSets.push(collectAllIds(getDefined(item.beforeSlices[k])));
        allAfterSets.push(collectAllIds(getDefined(item.afterSlices[k])));
      }
    }

    for (let i = 0; i < allBeforeSets.length && !crossSliceOverlap; i += 1) {
      const bIds = getDefined(allBeforeSets[i]);

      for (let j = 0; j < allAfterSets.length; j += 1) {
        if (i === j) continue;
        const aIds = getDefined(allAfterSets[j]);

        for (const id of bIds) {
          if (aIds.has(id)) {
            crossSliceOverlap = true;
            break;
          }
        }
        if (crossSliceOverlap) break;
      }
    }

    if (!crossSliceOverlap) {
      const steps: V4Step[] = [];

      for (const item of changedRoots) {
        for (let k = 0; k < item.beforeSlices.length; k += 1) {
          const offset = getDefined(item.offsets[k]);
          const offsets = new Map<string, number>();

          if (offset !== 0) offsets.set(item.root, offset);
          const sliceBefore = getDefined(item.beforeSlices[k]);
          const sliceAfter = getDefined(item.afterSlices[k]);
          const miniBefore: JsonEditorValue =
            item.root === 'main'
              ? { children: sliceBefore }
              : { children: [], roots: { [item.root]: sliceBefore } };
          const miniAfter: JsonEditorValue =
            item.root === 'main'
              ? { children: sliceAfter }
              : { children: [], roots: { [item.root]: sliceAfter } };
          const rangeSteps = extractV4BetweenCore(miniBefore, miniAfter, {
            isSetValued: options.isSetValued,
            rootOffsets: offsets,
          });

          steps.push(...shiftTopLevelSteps(rangeSteps, offsets));
        }
      }

      steps.push(...extractRegisterSteps(before, after));

      return steps;
    }
  }

  return null;
};

export const extractV4Between = (
  before: JsonEditorValue,
  after: JsonEditorValue,
  options: ExtractV4Options = {}
): readonly V4Step[] => {
  const sparse = extractV4BetweenSparse(before, after, options);

  if (sparse !== null) return sparse;

  return [
    ...extractV4BetweenCore(before, after, {
      isSetValued: options.isSetValued,
    }),
    ...extractRegisterSteps(before, after),
  ];
};

const extractV4BetweenCore = (
  before: JsonEditorValue,
  after: JsonEditorValue,
  options: Readonly<{
    isSetValued?: DocumentSetPropertyResolver;
    rootOffsets?: ReadonlyMap<string, number>;
  }> = {}
): readonly V4Step[] => {
  const steps: V4Step[] = [];
  const state: MutableV4State = createMutableV4State(before);
  const emit = (step: V4Step) => {
    applyV4StepToState(state, step);
    steps.push(step);
  };

  const beforeRoots = new Set(visitRootNames(before.roots));
  const afterRoots = new Set(visitRootNames(after.roots));

  for (const root of [...afterRoots].sort()) {
    if (!beforeRoots.has(root)) {
      emit({ op: 'create_root', root });
    }
  }

  const afterIds = collectAllIdsInValue(after);

  // 1. Remove elements in `before` that do not exist in `after` (top-down so
  //    removing a dead container drops its dead descendants in one step, while
  //    preserving any surviving descendants by skipping dead containers that
  //    still hold live descendants until those descendants move out).
  const hasSurvivingDescendant = (node: JsonElementNode): boolean => {
    for (const child of node.children) {
      if (!isElementNode(child)) continue;
      const cid = elementIdOf(child);

      if (
        (cid !== null && afterIds.has(cid)) ||
        hasSurvivingDescendant(child)
      ) {
        return true;
      }
    }
    return false;
  };

  const pruneDead = (nodes: readonly JsonNode[]) => {
    for (const node of [...nodes]) {
      if (!isElementNode(node)) continue;
      const id = elementIdOf(node);

      if (id !== null && !afterIds.has(id) && !hasSurvivingDescendant(node)) {
        if (state.idMap.has(id)) {
          emit({ id, op: 'remove_node' });
        }
        continue;
      }
      pruneDead(node.children);
    }
  };

  pruneDead(state.children);
  for (const root of Object.keys(state.roots)) {
    pruneDead(state.roots[root]);
  }

  // 2. Reconcile each root and element top-down to match `after`.
  const reconcileElementList = (
    containerPlace: (index: number) => V4Place,
    parentId: string | null,
    targetNodes: readonly JsonNode[],
    rootName: string,
    parentPath: readonly number[]
  ) => {
    for (
      let targetIndex = 0;
      targetIndex < targetNodes.length;
      targetIndex += 1
    ) {
      const targetNode = getDefined(targetNodes[targetIndex]);

      if (!isElementNode(targetNode)) continue;

      const targetId = elementIdOf(targetNode);

      if (targetId === null) {
        throw new Error('Cannot extract v4 steps for element without id.');
      }

      const existing = state.idMap.get(targetId);

      if (!existing) {
        const stripped = stripLiveDescendants(targetNode, state.idMap);

        emit({
          node: stripped,
          op: 'insert_node',
          to: containerPlace(targetIndex),
        });
      } else {
        const sameParent =
          existing.root === rootName &&
          (existing.parent === null
            ? parentId === null
            : existing.parent.id === parentId);

        if (!sameParent || existing.index !== targetIndex) {
          emit({
            id: targetId,
            op: 'move_node',
            to: containerPlace(targetIndex),
          });
        }
      }

      const currentLoc = getDefined(state.idMap.get(targetId));
      const rootOffset =
        parentPath.length === 0 ? (options.rootOffsets?.get(rootName) ?? 0) : 0;
      const path = [...parentPath, targetIndex + rootOffset];
      const { isSetValued } = options;
      const elementPropContext = isSetValued
        ? buildV4PropertyContext(state, targetId, rootName, path, 'element')
        : null;
      const propDelta = propDeltaBetween(
        nodeProps(currentLoc.node),
        nodeProps(targetNode),
        isSetValued && elementPropContext
          ? (key) => isSetValued(currentLoc.node, key, elementPropContext)
          : undefined
      );

      if (!isEmptyPropDelta(propDelta)) {
        emit({ ...propDelta, id: targetId, op: 'set_props' });
      }

      if (isTextBearingElement(targetNode)) {
        // First ensure any surviving inline elements that belong inside
        // `targetNode` are present, and any dead inline children are removed.
        const currentNode = getDefined(state.idMap.get(targetId)).node;

        if (!jsonEqual(currentNode.children, targetNode.children)) {
          const textSteps: V4Step[] = [];
          const sampleTextNode = currentNode.children.find(isTextNode);
          const textPropContext =
            isSetValued && sampleTextNode
              ? buildV4PropertyContext(
                  state,
                  targetId,
                  rootName,
                  [...path, 0],
                  'text'
                )
              : null;

          extractTextElementDiff(
            targetId,
            currentNode,
            targetNode,
            textSteps,
            isSetValued && sampleTextNode && textPropContext
              ? (key) => isSetValued(sampleTextNode, key, textPropContext)
              : undefined
          );
          for (const textStep of textSteps) {
            emit(textStep);
          }
        }

        // Reconcile inline elements inside `targetNode` (props + text).
        const inlineAfter = targetNode.children.filter(isElementNode);

        for (const inlineTarget of inlineAfter) {
          const inlineId = elementIdOf(inlineTarget);

          if (!inlineId) continue;
          const inlineLoc = state.idMap.get(inlineId);

          if (!inlineLoc) continue;

          const inlinePath = [...path, inlineLoc.index];
          const inlinePropContext = isSetValued
            ? buildV4PropertyContext(
                state,
                inlineId,
                rootName,
                inlinePath,
                'element'
              )
            : null;
          const inlinePropDelta = propDeltaBetween(
            nodeProps(inlineLoc.node),
            nodeProps(inlineTarget),
            isSetValued && inlinePropContext
              ? (key) => isSetValued(inlineLoc.node, key, inlinePropContext)
              : undefined
          );

          if (!isEmptyPropDelta(inlinePropDelta)) {
            emit({ ...inlinePropDelta, id: inlineId, op: 'set_props' });
          }

          const refreshedInline = getDefined(state.idMap.get(inlineId)).node;

          if (!jsonEqual(refreshedInline.children, inlineTarget.children)) {
            const innerSteps: V4Step[] = [];
            const inlineSampleText = refreshedInline.children.find(isTextNode);
            const inlineTextContext =
              isSetValued && inlineSampleText
                ? buildV4PropertyContext(
                    state,
                    inlineId,
                    rootName,
                    [...inlinePath, 0],
                    'text'
                  )
                : null;

            extractTextElementDiff(
              inlineId,
              refreshedInline,
              inlineTarget,
              innerSteps,
              isSetValued && inlineSampleText && inlineTextContext
                ? (key) => isSetValued(inlineSampleText, key, inlineTextContext)
                : undefined
            );
            for (const innerStep of innerSteps) emit(innerStep);
          }
        }
      } else {
        reconcileElementList(
          (index) => ({ id: targetId, index }),
          targetId,
          targetNode.children,
          rootName,
          path
        );
      }
    }

    // Remove any trailing dead elements left in this container.
    const containerList =
      parentId === null
        ? rootName === 'main'
          ? state.children
          : state.roots[rootName]
        : getDefined(state.idMap.get(parentId)).node.children;
    const targetIds = new Set(
      targetNodes
        .map((n) => elementIdOf(n))
        .filter((id): id is string => id !== null)
    );

    for (const leftover of [...containerList]) {
      const lid = elementIdOf(leftover);

      if (
        lid !== null &&
        !targetIds.has(lid) &&
        !afterIds.has(lid) &&
        state.idMap.has(lid)
      ) {
        emit({ id: lid, op: 'remove_node' });
      }
    }
  };

  reconcileElementList(
    (index) => ({ index, root: 'main' }),
    null,
    after.children,
    'main',
    []
  );

  for (const root of [...afterRoots].sort()) {
    const rootNodes = after.roots?.[root];

    if (rootNodes) {
      reconcileElementList(
        (index) => ({ index, root }),
        null,
        rootNodes,
        root,
        []
      );
    }
  }

  // 3. Remove any remaining dead containers whose live descendants have moved out.
  for (const [id] of [...state.idMap]) {
    if (!afterIds.has(id) && state.idMap.has(id)) {
      emit({ id, op: 'remove_node' });
    }
  }

  // 4. Delete roots removed in `after`.
  for (const root of [...beforeRoots].sort()) {
    if (!afterRoots.has(root)) {
      emit({ op: 'delete_root', root });
    }
  }

  return steps;
};
