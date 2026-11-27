import { getDefined } from '../../../internal/get-defined';
import {
  getRecordSetVersion,
  getValueRecords,
  hasValueRecords,
  readRecord,
  recordSetIds,
} from '../../record-store';
import { cloneJson, isRecord, jsonEqual, type JsonRecord } from '../json';
import { visitRootNames } from '../lazy-root';
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
  liveIds: ReadonlySet<string>
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

export const extractV4Between = (
  before: JsonEditorValue,
  after: JsonEditorValue,
  options: ExtractV4Options = {}
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
        const liveIds = new Set(state.idMap.keys());
        const stripped = stripLiveDescendants(targetNode, liveIds);

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
      const path = [...parentPath, targetIndex];
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

  // 5. Extract `plite:state` register diffs as `set_register` steps.
  if (hasValueRecords(after)) {
    const beforeStore = getValueRecords(before);
    const afterStore = getValueRecords(after);
    const regKeys = new Set([
      ...recordSetIds(getRecordSetVersion(beforeStore, V4_REGISTER_SET)),
      ...recordSetIds(getRecordSetVersion(afterStore, V4_REGISTER_SET)),
    ]);

    for (const key of [...regKeys].sort()) {
      const bEntry = readRecord(
        getRecordSetVersion(beforeStore, V4_REGISTER_SET),
        key
      );
      const aEntry = readRecord(
        getRecordSetVersion(afterStore, V4_REGISTER_SET),
        key
      );

      if (jsonEqual(bEntry, aEntry)) continue;
      if (aEntry === undefined) {
        const bWriteId =
          isRecord(bEntry) && typeof bEntry.writeId === 'string'
            ? bEntry.writeId
            : 'extract';

        emit({
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
        emit({
          after: aEntry.encoded,
          id: key,
          op: 'set_register',
          set: V4_REGISTER_SET,
          writeId: aEntry.writeId,
        });
      }
    }
  }

  return steps;
};
