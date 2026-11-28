import { getDefined } from '../../../internal/get-defined';
import { cloneJson, jsonEqual, type JsonRecord } from '../json';
import { lazyRootOf, visitRootNames } from '../lazy-root';
import type {
  DocumentPropertyContext,
  DocumentSetPropertyResolver,
} from '../root-change';
import type { CanContain } from '../schema-containment';
import {
  isElementNode,
  isTextNode,
  type JsonEditorValue,
  type JsonElementNode,
  type JsonNode,
  nodeProps,
} from '../tokens';
import {
  applyV4Steps,
  elementStreamLength,
  isTextBearingElement,
  toV4TextStream,
  type V4TextUnit,
} from './apply';
import { extractV4Between, propDeltaBetween } from './extract';
import { getValueIdLookup } from './lower';
import { rebaseV4Changes } from './rebase';
import {
  applyPropDeltaToRecord,
  isEmptyPropDelta,
  type V4Place,
  type V4PropDelta,
  type V4Step,
} from './types';

export type ValidateReplayChildren = (
  children: readonly JsonNode[],
  root: string,
  ancestors: readonly JsonNode[]
) => boolean;

export type ReplayPieceProps = (
  element: JsonNode,
  parent: readonly number[],
  root: string,
  nodes: readonly JsonNode[]
) => JsonRecord;

export type V4ReplayRebaseOptions = Readonly<{
  aStepsAuthoritative?: boolean;
  canContain?: CanContain;
  hasIdInDoc?: (id: string) => boolean;
  isSetValued?: DocumentSetPropertyResolver;
  pieceProps?: ReplayPieceProps;
  validateChildren?: ValidateReplayChildren;
}>;

export type V4ReplayRebaseResult =
  | Readonly<{ kind: 'drop-all' }>
  | Readonly<{
      droppedBSteps: readonly V4Step[];
      kind: 'filter-b';
      survivingBSteps: readonly V4Step[];
    }>
  | Readonly<{
      aPrime: readonly V4Step[];
      bPrime: readonly V4Step[];
      kind: 'steps';
    }>;

type ElementMeta = Readonly<{
  ancestors: readonly string[];
  index: number;
  node: JsonElementNode;
  parentId: string | null;
  path: readonly number[];
  root: string;
}>;

type FormatTextStep = Extract<V4Step, { op: 'format_text' }>;
type InsertTextStep = Extract<V4Step, { op: 'insert_text' }>;
type DeleteTextStep = Extract<V4Step, { op: 'delete_text' }>;
type WrapInlineStep = Extract<V4Step, { op: 'wrap_inline' }>;
type UnwrapInlineStep = Extract<V4Step, { op: 'unwrap_inline' }>;

const elementIdOf = (node: JsonNode): string | null =>
  isElementNode(node) && typeof node.id === 'string' && node.id.length > 0
    ? node.id
    : null;

const addSubtreeElementIds = (node: JsonNode, out: Set<string>): void => {
  if (!isElementNode(node)) return;
  const id = elementIdOf(node);

  if (id) out.add(id);
  for (const child of node.children) addSubtreeElementIds(child, out);
};

const rootNodesIn = (
  value: JsonEditorValue,
  root: string
): readonly JsonNode[] => {
  if (root === 'main') {
    const lazy = lazyRootOf(value, 'children');

    return lazy ? lazy.value : value.children;
  }

  const { roots } = value;

  if (!roots || !Object.hasOwn(roots, root)) return [];
  const lazy = lazyRootOf(roots, root);

  return lazy ? lazy.value : roots[root];
};

const indexRootElements = (
  value: JsonEditorValue,
  root: string
): Map<string, ElementMeta> => {
  const map = new Map<string, ElementMeta>();
  const walk = (
    nodes: readonly JsonNode[],
    parentId: string | null,
    ancestors: readonly string[],
    prefix: readonly number[]
  ) => {
    for (let index = 0; index < nodes.length; index += 1) {
      const node = getDefined(nodes[index]);

      if (!isElementNode(node)) continue;
      const path = [...prefix, index];
      const id = elementIdOf(node);

      if (id) {
        map.set(id, { ancestors, index, node, parentId, path, root });
      }
      walk(node.children, id, id ? [...ancestors, id] : ancestors, path);
    }
  };

  walk(rootNodesIn(value, root), null, [], []);

  return map;
};

const indexAllElements = (
  value: JsonEditorValue,
  roots: ReadonlySet<string>
): Map<string, ElementMeta> => {
  const map = new Map<string, ElementMeta>();

  for (const root of roots) {
    for (const [id, meta] of indexRootElements(value, root)) {
      map.set(id, meta);
    }
  }

  return map;
};

const rootScopeValue = (
  value: JsonEditorValue,
  roots: ReadonlySet<string>
): JsonEditorValue => {
  const children = roots.has('main') ? rootNodesIn(value, 'main') : [];
  const namedRoots: Record<string, readonly JsonNode[]> = {};
  let hasNamed = false;

  for (const root of roots) {
    if (root === 'main') continue;
    if (value.roots && Object.hasOwn(value.roots, root)) {
      namedRoots[root] = rootNodesIn(value, root);
      hasNamed = true;
    }
  }

  return hasNamed ? { children, roots: namedRoots } : { children };
};

const subtreeContainsAnyId = (
  node: JsonNode,
  remaining: Set<string>
): boolean => {
  if (!isElementNode(node)) return false;
  let hit = false;
  const id = elementIdOf(node);

  if (id && remaining.delete(id)) hit = true;
  for (const child of node.children) {
    if (subtreeContainsAnyId(child, remaining)) hit = true;
  }

  return hit;
};

const hasRootIndexPlace = (steps: readonly V4Step[]): boolean =>
  steps.some(
    (step) =>
      (step.op === 'insert_node' || step.op === 'move_node') &&
      'root' in step.to
  );

const stepCreatedIds = (step: V4Step, out: Set<string>): void => {
  if (step.op === 'split_node') {
    out.add(step.newId);
    return;
  }
  if (step.op === 'insert_node' || step.op === 'wrap_inline') {
    addSubtreeElementIds(step.node, out);
  }
};

const stepReferencedIds = (step: V4Step): readonly string[] => {
  switch (step.op) {
    case 'insert_text':
    case 'delete_text':
    case 'format_text':
    case 'wrap_inline': {
      return [step.target];
    }
    case 'unwrap_inline': {
      return [step.id, step.parent];
    }
    case 'set_props':
    case 'remove_node':
    case 'split_node': {
      return [step.id];
    }
    case 'join_nodes': {
      return [step.target, step.source];
    }
    case 'insert_node': {
      return 'id' in step.to ? [step.to.id] : [];
    }
    case 'move_node': {
      return 'id' in step.to ? [step.id, step.to.id] : [step.id];
    }
    default: {
      return [];
    }
  }
};

const baseReferencedIdsOf = (
  ...stepLists: ReadonlyArray<readonly V4Step[]>
): Set<string> => {
  const needed = new Set<string>();

  for (const steps of stepLists) {
    const created = new Set<string>();

    for (const step of steps) {
      for (const id of stepReferencedIds(step)) {
        if (!created.has(id)) needed.add(id);
      }
      stepCreatedIds(step, created);
    }
  }

  return needed;
};

const scopedByIdsValue = (
  value: JsonEditorValue,
  touchedRoots: ReadonlySet<string>,
  neededIds: ReadonlySet<string>
): JsonEditorValue => {
  if (neededIds.size === 0) return rootScopeValue(value, touchedRoots);

  const topIndicesByRoot = new Map<string, Set<number>>();
  const lookup = getValueIdLookup(value);

  if (lookup) {
    for (const id of neededIds) {
      const loc = lookup(id);

      if (!loc || !touchedRoots.has(loc.root) || loc.path.length === 0) {
        return rootScopeValue(value, touchedRoots);
      }
      let set = topIndicesByRoot.get(loc.root);

      if (!set) {
        set = new Set<number>();
        topIndicesByRoot.set(loc.root, set);
      }
      set.add(getDefined(loc.path[0]));
    }
  } else {
    const remaining = new Set(neededIds);

    for (const root of touchedRoots) {
      const nodes = rootNodesIn(value, root);

      for (let i = 0; i < nodes.length && remaining.size > 0; i += 1) {
        const node = getDefined(nodes[i]);

        if (subtreeContainsAnyId(node, remaining)) {
          let set = topIndicesByRoot.get(root);

          if (!set) {
            set = new Set<number>();
            topIndicesByRoot.set(root, set);
          }
          set.add(i);
        }
      }
    }
    if (remaining.size > 0) return rootScopeValue(value, touchedRoots);
  }

  const buildRoot = (root: string): readonly JsonNode[] => {
    const indices = topIndicesByRoot.get(root);

    if (!indices || indices.size === 0) return [];
    const nodes = rootNodesIn(value, root);

    return [...indices]
      .sort((left, right) => left - right)
      .map((idx) => getDefined(nodes[idx]));
  };

  const children = touchedRoots.has('main') ? buildRoot('main') : [];
  const namedRoots: Record<string, readonly JsonNode[]> = {};
  let hasNamed = false;

  for (const root of touchedRoots) {
    if (root === 'main') continue;
    if (value.roots && Object.hasOwn(value.roots, root)) {
      namedRoots[root] = buildRoot(root);
      hasNamed = true;
    }
  }

  return hasNamed ? { children, roots: namedRoots } : { children };
};

const scopedValueForSteps = (
  value: JsonEditorValue,
  aSteps: readonly V4Step[],
  bSteps: readonly V4Step[],
  touchedRoots: ReadonlySet<string>
): JsonEditorValue => {
  if (hasRootIndexPlace(aSteps) || hasRootIndexPlace(bSteps)) {
    return rootScopeValue(value, touchedRoots);
  }

  return scopedByIdsValue(
    value,
    touchedRoots,
    baseReferencedIdsOf(aSteps, bSteps)
  );
};

const allRootNamesOf = (value: JsonEditorValue): Set<string> =>
  new Set<string>(['main', ...visitRootNames(value.roots)]);

const findElementInValue = (
  value: JsonEditorValue,
  id: string,
  roots: ReadonlySet<string>
): ElementMeta | null => {
  for (const root of roots) {
    const found = indexRootElements(value, root).get(id);

    if (found) return found;
  }

  return null;
};

const ancestorsNodesOf = (
  elements: ReadonlyMap<string, ElementMeta>,
  meta: ElementMeta
): JsonElementNode[] =>
  meta.ancestors
    .map((ancId) => elements.get(ancId)?.node)
    .filter((node): node is JsonElementNode => node !== undefined);

const validateContainersInValue = (
  value: JsonEditorValue,
  roots: ReadonlySet<string>,
  changedContainerIds: ReadonlySet<string>,
  changedRoots: ReadonlySet<string>,
  options: V4ReplayRebaseOptions
): boolean => {
  const { canContain, validateChildren } = options;

  if (!canContain && !validateChildren) return true;

  for (const root of roots) {
    const elements = indexRootElements(value, root);
    const rootChildren = rootNodesIn(value, root);

    if (
      changedRoots.has(root) &&
      validateChildren &&
      !validateChildren(rootChildren, root, [])
    ) {
      return false;
    }

    for (const id of changedContainerIds) {
      const meta = elements.get(id);

      if (!meta) continue;
      if (canContain) {
        for (const child of meta.node.children) {
          if (!canContain(meta.node, child)) return false;
        }
      }
      if (validateChildren) {
        const ancestors = ancestorsNodesOf(elements, meta).reverse();

        if (!validateChildren([meta.node], root, ancestors)) {
          return false;
        }
      }
    }
  }

  return true;
};

const childCountAtPlace = (value: JsonEditorValue, place: V4Place): number => {
  if ('root' in place) {
    return rootNodesIn(value, place.root).length;
  }

  const found = findElementInValue(value, place.id, allRootNamesOf(value));

  return found ? found.node.children.length : 0;
};

const clampPlace = (value: JsonEditorValue, place: V4Place): V4Place => {
  if (!('index' in place)) return place;
  const max = childCountAtPlace(value, place);
  const index = Math.max(0, Math.min(place.index, max));

  return index === place.index ? place : { ...place, index };
};

const rewriteJoinEditOverRemoval = (
  afterRemoval: JsonEditorValue,
  editSteps: readonly V4Step[],
  removedIds: ReadonlySet<string>,
  touchedRoots: ReadonlySet<string>
): Readonly<{ kept: V4Step[]; skippedMoveIntoRemoved: boolean }> | null => {
  const editRemovedIds = new Set<string>();

  for (const step of editSteps) {
    if (step.op === 'remove_node') editRemovedIds.add(step.id);
  }

  const removedJoinPartnerIds = new Set<string>();

  for (const step of editSteps) {
    if (step.op !== 'join_nodes') continue;
    if (
      (removedIds.has(step.target) || removedIds.has(step.source)) &&
      editRemovedIds.has(step.target)
    ) {
      return null;
    }
    if (removedIds.has(step.target) && !removedIds.has(step.source)) {
      removedJoinPartnerIds.add(step.source);
    } else if (removedIds.has(step.source) && !removedIds.has(step.target)) {
      removedJoinPartnerIds.add(step.target);
    }
  }

  if (removedJoinPartnerIds.size === 0) return null;

  const afterRemovalElements = indexAllElements(afterRemoval, touchedRoots);
  const survivorOf = new Map<string, string>();
  const movedIds = new Set<string>();
  const protectedContainerIds = new Set<string>();
  const kept: V4Step[] = [];
  let skippedMoveIntoRemoved = false;
  let current = afterRemoval;

  for (const step of editSteps) {
    switch (step.op) {
      case 'join_nodes': {
        const source = survivorOf.get(step.source) ?? step.source;
        const target = survivorOf.get(step.target) ?? step.target;

        if (removedIds.has(target) && !removedIds.has(source)) {
          survivorOf.set(target, source);
          continue;
        }
        if (removedIds.has(source) && !removedIds.has(target)) {
          survivorOf.set(source, target);
          continue;
        }
        if (removedIds.has(source) && removedIds.has(target)) {
          continue;
        }
        const next: V4Step = { ...step, source, target };

        current = applyV4Steps(current, [next]);
        kept.push(next);
        continue;
      }

      case 'insert_node': {
        if ('id' in step.to && removedIds.has(step.to.id)) return null;
        const next: V4Step = { ...step, to: clampPlace(current, step.to) };

        current = applyV4Steps(current, [next]);
        kept.push(next);
        continue;
      }

      case 'move_node': {
        if ('id' in step.to && removedIds.has(step.to.id)) {
          if (removedJoinPartnerIds.has(step.id)) {
            skippedMoveIntoRemoved = true;
            const partnerMeta = afterRemovalElements.get(step.id);

            if (partnerMeta) {
              for (const ancId of partnerMeta.ancestors) {
                protectedContainerIds.add(ancId);
              }
            }
            continue;
          }

          return null;
        }
        if (removedIds.has(step.id)) {
          const survivor = survivorOf.get(step.id);

          if (!survivor || movedIds.has(survivor)) continue;
          const next: V4Step = {
            ...step,
            id: survivor,
            to: clampPlace(current, step.to),
          };

          current = applyV4Steps(current, [next]);
          movedIds.add(survivor);
          kept.push(next);
          continue;
        }
        const next: V4Step = { ...step, to: clampPlace(current, step.to) };

        current = applyV4Steps(current, [next]);
        movedIds.add(step.id);
        kept.push(next);
        continue;
      }

      case 'remove_node': {
        if (removedIds.has(step.id) || protectedContainerIds.has(step.id)) {
          continue;
        }
        current = applyV4Steps(current, [step]);
        kept.push(step);
        continue;
      }

      case 'insert_text':
      case 'delete_text':
      case 'format_text':
      case 'wrap_inline': {
        if (removedIds.has(step.target)) continue;
        current = applyV4Steps(current, [step]);
        kept.push(step);
        continue;
      }

      case 'unwrap_inline': {
        if (removedIds.has(step.id) || removedIds.has(step.parent)) continue;
        current = applyV4Steps(current, [step]);
        kept.push(step);
        continue;
      }

      case 'set_props':
      case 'split_node': {
        if (removedIds.has(step.id)) continue;
        current = applyV4Steps(current, [step]);
        kept.push(step);
        continue;
      }

      case 'set_register':
      case 'create_root':
      case 'delete_root': {
        current = applyV4Steps(current, [step]);
        kept.push(step);
        continue;
      }
    }
  }

  return { kept, skippedMoveIntoRemoved };
};

const rebaseJoinOverSiblingRemoval = (
  base: JsonEditorValue,
  aSteps: readonly V4Step[],
  bSteps: readonly V4Step[],
  touchedRoots: ReadonlySet<string>,
  options: V4ReplayRebaseOptions
): V4ReplayRebaseResult | null => {
  const aAllRemove =
    aSteps.length > 0 && aSteps.every((step) => step.op === 'remove_node');
  const bAllRemove =
    bSteps.length > 0 && bSteps.every((step) => step.op === 'remove_node');
  const aHasJoin = aSteps.some((step) => step.op === 'join_nodes');
  const bHasJoin = bSteps.some((step) => step.op === 'join_nodes');

  if (!((aAllRemove && bHasJoin) || (bAllRemove && aHasJoin))) return null;

  const scoped = scopedValueForSteps(base, aSteps, bSteps, touchedRoots);
  let baseElements: Map<string, ElementMeta> | null = null;

  for (const [removalSteps, editSteps, side] of [
    [aSteps, bSteps, 'a'],
    [bSteps, aSteps, 'b'],
  ] as const) {
    if (
      removalSteps.length === 0 ||
      !removalSteps.every((step) => step.op === 'remove_node') ||
      !editSteps.some((step) => step.op === 'join_nodes')
    ) {
      continue;
    }

    baseElements ??= indexAllElements(scoped, touchedRoots);
    const removedIds = new Set<string>();

    for (const step of removalSteps) {
      removedIds.add(step.id);
      const meta = baseElements.get(step.id);

      if (meta) addSubtreeElementIds(meta.node, removedIds);
    }

    let afterRemoval: JsonEditorValue;

    try {
      afterRemoval = applyV4Steps(scoped, removalSteps);
    } catch {
      continue;
    }

    let rewritten: Readonly<{
      kept: V4Step[];
      skippedMoveIntoRemoved: boolean;
    }> | null;

    try {
      rewritten = rewriteJoinEditOverRemoval(
        afterRemoval,
        editSteps,
        removedIds,
        touchedRoots
      );
    } catch {
      continue;
    }

    if (rewritten === null) continue;

    const { kept, skippedMoveIntoRemoved } = rewritten;

    if (kept.length === 0) {
      if (side === 'a' && skippedMoveIntoRemoved) {
        return { kind: 'drop-all' };
      }

      continue;
    }

    let merged: JsonEditorValue;
    let afterEdit: JsonEditorValue;

    try {
      merged = applyV4Steps(afterRemoval, kept);
      afterEdit = applyV4Steps(scoped, editSteps);
    } catch {
      continue;
    }

    const changedContainers = new Set<string>();

    for (const step of kept) {
      if (step.op === 'insert_node') {
        if ('id' in step.to) changedContainers.add(step.to.id);
      } else if (step.op === 'move_node') {
        if ('id' in step.to) changedContainers.add(step.to.id);
        const srcMeta = baseElements.get(step.id);

        if (srcMeta?.parentId) changedContainers.add(srcMeta.parentId);
      } else if (step.op === 'join_nodes') {
        changedContainers.add(step.target);
      }
    }
    if (
      !validateContainersInValue(
        merged,
        touchedRoots,
        changedContainers,
        touchedRoots,
        options
      )
    ) {
      continue;
    }

    const removalPrime = extractV4Between(afterEdit, merged, {
      isSetValued: options.isSetValued,
    });

    return side === 'a'
      ? { aPrime: removalPrime, bPrime: kept, kind: 'steps' }
      : { aPrime: kept, bPrime: removalPrime, kind: 'steps' };
  }

  return null;
};

const textContentOfNode = (node: JsonElementNode): string => {
  let out = '';

  for (const child of node.children) {
    if (isTextNode(child)) out += child.text;
    else out += textContentOfNode(child);
  }

  return out;
};

const collectDeletedIds = (
  scopedBase: JsonEditorValue,
  aSteps: readonly V4Step[],
  touchedRoots: ReadonlySet<string>,
  aStepsAuthoritative: boolean
): ReadonlySet<string> | null => {
  if (!aSteps.some((step) => step.op === 'remove_node')) return null;

  const baseElements = indexAllElements(scopedBase, touchedRoots);
  const childrenOf = new Map<string, Set<string>>();
  const orderedChildrenOf = new Map<string, string[]>();
  const parentOf = new Map<string, string | null>();

  for (const [id, meta] of baseElements) {
    parentOf.set(id, meta.parentId);
    const childIds: string[] = [];

    for (const child of meta.node.children) {
      const childId = elementIdOf(child);

      if (childId) childIds.push(childId);
    }
    orderedChildrenOf.set(id, childIds);
    if (meta.parentId !== null) {
      let kids = childrenOf.get(meta.parentId);

      if (!kids) {
        kids = new Set<string>();
        childrenOf.set(meta.parentId, kids);
      }
      kids.add(id);
    }
  }

  const movedOutFrom = new Set<string>();
  const splitTargetToNewIds = new Map<string, Set<string>>();
  const rawDeleted = new Set<string>();
  const unwrappedIds = new Set<string>();
  const reinsertedIds = new Set<string>();
  const insertedTextByTarget = new Map<string, string[]>();
  const insertedNodes: JsonNode[] = [];
  const insertedStrippedNodes: unknown[] = [];

  const stripNodeIds = (node: JsonNode): unknown => {
    if (!isElementNode(node)) return node;

    const out: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(node)) {
      if (key === 'id') continue;
      out[key] =
        key === 'children'
          ? node.children.map((child) => stripNodeIds(child))
          : val;
    }

    return out;
  };

  const collectTreeIds = (id: string, out: Set<string>) => {
    out.add(id);
    const kids = childrenOf.get(id);

    if (!kids) return;
    for (const childId of kids) {
      collectTreeIds(childId, out);
    }
  };

  for (const step of aSteps) {
    if (step.op === 'insert_text') {
      if (!aStepsAuthoritative) {
        const list = insertedTextByTarget.get(step.target) ?? [];

        list.push(step.text);
        insertedTextByTarget.set(step.target, list);
      }
      continue;
    }
    if (step.op === 'insert_node') {
      if (!aStepsAuthoritative) {
        insertedNodes.push(step.node);
        insertedStrippedNodes.push(stripNodeIds(step.node));
      }
      const collectInserted = (node: JsonNode, parent: string | null) => {
        if (!isElementNode(node)) return;
        const id = elementIdOf(node);

        if (id) {
          reinsertedIds.add(id);
          rawDeleted.delete(id);
          parentOf.set(id, parent);
          if (parent !== null) {
            let kids = childrenOf.get(parent);

            if (!kids) {
              kids = new Set<string>();
              childrenOf.set(parent, kids);
            }
            kids.add(id);
          }
        }
        for (const child of node.children) collectInserted(child, id);
      };

      collectInserted(step.node, 'id' in step.to ? step.to.id : null);
      continue;
    }
    if (step.op === 'move_node') {
      const oldParent = parentOf.get(step.id) ?? null;
      const newParent = 'id' in step.to ? step.to.id : null;

      if (oldParent !== null && oldParent !== newParent) {
        movedOutFrom.add(oldParent);
        childrenOf.get(oldParent)?.delete(step.id);
      }
      parentOf.set(step.id, newParent);
      if (newParent !== null) {
        let kids = childrenOf.get(newParent);

        if (!kids) {
          kids = new Set<string>();
          childrenOf.set(newParent, kids);
        }
        kids.add(step.id);
      }
      continue;
    }
    if (step.op === 'split_node') {
      let splitIds = splitTargetToNewIds.get(step.id);

      if (!splitIds) {
        splitIds = new Set<string>();
        splitTargetToNewIds.set(step.id, splitIds);
      }
      splitIds.add(step.newId);
      const splitParent = parentOf.get(step.id) ?? null;

      parentOf.set(step.newId, splitParent);
      if (splitParent !== null) {
        let kids = childrenOf.get(splitParent);

        if (!kids) {
          kids = new Set<string>();
          childrenOf.set(splitParent, kids);
        }
        kids.add(step.newId);
      }

      const splitMeta = baseElements.get(step.id);
      const existingOrder = orderedChildrenOf.get(step.id);

      if (
        existingOrder &&
        (!splitMeta || !isTextBearingElement(splitMeta.node))
      ) {
        const movedRight = existingOrder.splice(step.at);
        const rightSet = new Set<string>(movedRight);

        orderedChildrenOf.set(step.newId, movedRight);
        childrenOf.set(step.newId, rightSet);
        const leftSet = childrenOf.get(step.id);

        for (const childId of movedRight) {
          leftSet?.delete(childId);
          parentOf.set(childId, step.newId);
        }
      }
      continue;
    }
    if (step.op === 'remove_node') {
      const oldParent = parentOf.get(step.id) ?? null;

      if (oldParent !== null) {
        childrenOf.get(oldParent)?.delete(step.id);
      }

      if (movedOutFrom.has(step.id)) {
        unwrappedIds.add(step.id);
      }

      const subtree = new Set<string>();

      collectTreeIds(step.id, subtree);
      for (const id of subtree) {
        if (!reinsertedIds.has(id)) rawDeleted.add(id);
      }
    }
  }

  const deletedIds = new Set<string>();

  for (const id of rawDeleted) {
    if (unwrappedIds.has(id)) continue;
    const splitChildren = splitTargetToNewIds.get(id);

    if (
      splitChildren &&
      [...splitChildren].some((childId) => !rawDeleted.has(childId))
    ) {
      continue;
    }
    if (!aStepsAuthoritative) {
      const baseMeta = baseElements.get(id);

      if (baseMeta && insertedStrippedNodes.length > 0) {
        const strippedBase = stripNodeIds(baseMeta.node);

        if (
          insertedStrippedNodes.some((candidate) =>
            jsonEqual(candidate, strippedBase)
          )
        ) {
          continue;
        }
      }

      if (baseMeta && isTextBearingElement(baseMeta.node)) {
        const text = textContentOfNode(baseMeta.node);

        if (
          text.length > 0 &&
          insertedNodes.some((inserted) => {
            if (!isElementNode(inserted) || !isTextBearingElement(inserted)) {
              return false;
            }
            const insertedText = textContentOfNode(inserted);

            return (
              insertedText.length > 0 &&
              (insertedText.includes(text) || text.includes(insertedText))
            );
          })
        ) {
          continue;
        }

        if (text.length > 0 && insertedTextByTarget.size > 0) {
          let absorbedBySibling = false;

          for (const [targetId, texts] of insertedTextByTarget) {
            if (rawDeleted.has(targetId)) continue;
            const targetMeta = baseElements.get(targetId);

            if (
              targetMeta &&
              targetMeta.parentId === baseMeta.parentId &&
              texts.some((chunk) => chunk.includes(text))
            ) {
              absorbedBySibling = true;
              break;
            }
          }
          if (absorbedBySibling) continue;
        }
      }
    }
    deletedIds.add(id);
  }

  return deletedIds.size > 0 ? deletedIds : null;
};

const stepNewIdOf = (step: V4Step): string | null => {
  if (step.op === 'split_node') return step.newId;
  if (step.op === 'insert_node' || step.op === 'wrap_inline') {
    return elementIdOf(step.node);
  }

  return null;
};

const isFilterableReplayStep = (step: V4Step): boolean =>
  step.op !== 'join_nodes' &&
  step.op !== 'move_node' &&
  step.op !== 'split_node';

const rebaseOverDeletedTarget = (
  base: JsonEditorValue,
  aSteps: readonly V4Step[],
  bSteps: readonly V4Step[],
  touchedRoots: ReadonlySet<string>,
  options: V4ReplayRebaseOptions
): V4ReplayRebaseResult | null => {
  if (bSteps.length === 0 || !bSteps.every(isFilterableReplayStep)) return null;
  if (!aSteps.some((step) => step.op === 'remove_node')) return null;

  const scoped = scopedByIdsValue(
    base,
    touchedRoots,
    baseReferencedIdsOf(aSteps)
  );
  const deletedIds = collectDeletedIds(
    scoped,
    aSteps,
    touchedRoots,
    options.aStepsAuthoritative ?? false
  );

  if (!deletedIds) return null;

  const scopedElements = indexAllElements(scoped, touchedRoots);
  const deadIds = new Set<string>(deletedIds);
  const droppedBSteps: V4Step[] = [];
  const survivingBSteps: V4Step[] = [];
  const droppedDeleteParents = new Set<string | null>();
  const droppedUnwrapParents = new Set<string>();

  for (const step of bSteps) {
    if (
      step.op === 'insert_text' ||
      step.op === 'delete_text' ||
      step.op === 'format_text' ||
      step.op === 'wrap_inline'
    ) {
      if (deadIds.has(step.target)) {
        const newId = stepNewIdOf(step);

        if (newId) deadIds.add(newId);
        if (step.op === 'delete_text') {
          const targetMeta = scopedElements.get(step.target);

          droppedDeleteParents.add(targetMeta ? targetMeta.parentId : null);
        }
        droppedBSteps.push(step);
      } else {
        survivingBSteps.push(step);
      }
      continue;
    }

    if (step.op === 'insert_node') {
      const insertParent = 'id' in step.to ? step.to.id : null;

      if (
        (insertParent !== null && deadIds.has(insertParent)) ||
        droppedDeleteParents.has(insertParent)
      ) {
        addSubtreeElementIds(step.node, deadIds);
        droppedBSteps.push(step);
      } else {
        survivingBSteps.push(step);
      }
      continue;
    }

    if (step.op === 'remove_node') {
      if (deadIds.has(step.id)) return null;
      const meta = scopedElements.get(step.id);

      if (meta) {
        const subtree = new Set<string>();

        addSubtreeElementIds(meta.node, subtree);
        for (const id of subtree) {
          if (deadIds.has(id)) return null;
        }
      }
      survivingBSteps.push(step);
      continue;
    }

    if (step.op === 'unwrap_inline') {
      if (deadIds.has(step.id) || deadIds.has(step.parent)) {
        droppedUnwrapParents.add(step.parent);
        droppedBSteps.push(step);
      } else {
        survivingBSteps.push(step);
      }
      continue;
    }

    if (step.op === 'set_props') {
      if (deadIds.has(step.id)) {
        droppedBSteps.push(step);
      } else {
        survivingBSteps.push(step);
      }
      continue;
    }

    survivingBSteps.push(step);
  }

  if (droppedBSteps.length === 0) return null;

  if (
    droppedUnwrapParents.size > 0 &&
    survivingBSteps.some(
      (step) =>
        step.op === 'wrap_inline' && droppedUnwrapParents.has(step.target)
    )
  ) {
    return null;
  }

  if (survivingBSteps.length === 0) {
    return { kind: 'drop-all' };
  }

  for (const step of survivingBSteps) {
    if (step.op === 'remove_node') {
      const remMeta = scopedElements.get(step.id);
      const remParent = remMeta ? remMeta.parentId : null;

      if (droppedDeleteParents.has(remParent)) return null;
    }
    for (const refId of stepReferencedIds(step)) {
      if (deadIds.has(refId)) return null;
    }
  }

  return {
    droppedBSteps,
    kind: 'filter-b',
    survivingBSteps,
  };
};

const childUnderParent = (
  elements: ReadonlyMap<string, ElementMeta>,
  id: string,
  parentId: string | null
): ElementMeta | null => {
  let cursor = elements.get(id) ?? null;

  while (cursor && cursor.parentId !== parentId) {
    cursor = cursor.parentId ? (elements.get(cursor.parentId) ?? null) : null;
  }

  return cursor;
};

const isPureLeafOrInlineStep = (step: V4Step): boolean =>
  step.op === 'insert_text' ||
  step.op === 'delete_text' ||
  step.op === 'format_text' ||
  step.op === 'set_props' ||
  step.op === 'wrap_inline' ||
  step.op === 'unwrap_inline' ||
  (step.op === 'insert_node' && 'offset' in step.to);

const shiftStepPastJoin = (
  step: V4Step,
  targetId: string,
  sourceId: string,
  leftLen: number
): V4Step | null => {
  switch (step.op) {
    case 'insert_text':
    case 'delete_text':
    case 'format_text':
    case 'wrap_inline': {
      if (step.target === sourceId) {
        return { ...step, offset: step.offset + leftLen, target: targetId };
      }

      return step;
    }
    case 'unwrap_inline': {
      if (step.parent === sourceId) {
        return { ...step, parent: targetId };
      }

      return step;
    }
    case 'insert_node': {
      if ('offset' in step.to && step.to.id === sourceId) {
        return {
          ...step,
          to: { id: targetId, offset: step.to.offset + leftLen },
        };
      }

      return step;
    }
    case 'set_props': {
      if (step.id === sourceId) return null;

      return step;
    }
    default: {
      return step;
    }
  }
};

const advanceTargetStreamLength = (
  step: V4Step,
  targetId: string,
  baseElements: ReadonlyMap<string, ElementMeta>,
  leftLen: number
): number | null => {
  if (step.op === 'insert_text' && step.target === targetId) {
    return leftLen + step.text.length;
  }
  if (step.op === 'delete_text' && step.target === targetId) {
    return leftLen - step.length;
  }
  if (step.op === 'wrap_inline' && step.target === targetId) {
    return leftLen + 1 - step.length;
  }
  if (
    step.op === 'insert_node' &&
    'offset' in step.to &&
    step.to.id === targetId
  ) {
    return leftLen + 1;
  }
  if (step.op === 'unwrap_inline' && step.parent === targetId) {
    const inlineMeta = baseElements.get(step.id);

    if (!inlineMeta) return null;

    return leftLen + elementStreamLength(inlineMeta.node) - 1;
  }

  return leftLen;
};

type StreamDelta =
  | Readonly<{ kind: 'delete'; length: number; offset: number }>
  | Readonly<{ kind: 'insert'; length: number; offset: number }>;

const shiftRangePastStreamDeltas = (
  offset: number,
  length: number,
  deltas: readonly StreamDelta[]
): number | null => {
  let start = offset;
  let end = offset + length;

  for (const delta of deltas) {
    if (delta.kind === 'insert') {
      if (delta.offset <= start) {
        start += delta.length;
        end += delta.length;
      } else if (delta.offset < end) {
        return null;
      }
    } else {
      const delEnd = delta.offset + delta.length;

      if (delEnd <= start) {
        start -= delta.length;
        end -= delta.length;
      } else if (delta.offset < end) {
        return null;
      }
    }
  }

  return start;
};

const shiftPointPastDeletes = (
  offset: number,
  deletes: ReadonlyArray<Readonly<{ length: number; offset: number }>>
): number | null => {
  let pos = offset;

  for (const del of deletes) {
    const delEnd = del.offset + del.length;

    if (pos <= del.offset) continue;
    if (pos >= delEnd) {
      pos -= del.length;
    } else {
      return null;
    }
  }

  return pos;
};

const shiftJoinedStepPastBDeletes = (
  step: V4Step,
  targetId: string,
  bAfterDeletes: ReadonlyArray<Readonly<{ length: number; offset: number }>>
): V4Step | null => {
  if (bAfterDeletes.length === 0) return step;

  if (step.op === 'insert_text' && step.target === targetId) {
    const nextOffset = shiftPointPastDeletes(step.offset, bAfterDeletes);

    return nextOffset === null ? null : { ...step, offset: nextOffset };
  }

  if (
    (step.op === 'delete_text' ||
      step.op === 'format_text' ||
      step.op === 'wrap_inline') &&
    step.target === targetId
  ) {
    const nextOffset = shiftRangePastStreamDeltas(
      step.offset,
      step.length,
      bAfterDeletes.map((d) => ({
        kind: 'delete',
        length: d.length,
        offset: d.offset,
      }))
    );

    return nextOffset === null ? null : { ...step, offset: nextOffset };
  }

  if (
    step.op === 'insert_node' &&
    'offset' in step.to &&
    step.to.id === targetId
  ) {
    const nextOffset = shiftPointPastDeletes(step.to.offset, bAfterDeletes);

    return nextOffset === null
      ? null
      : { ...step, to: { id: targetId, offset: nextOffset } };
  }

  return step;
};

const collectJoinedStreamDeltas = (
  aSteps: readonly V4Step[],
  targetId: string,
  sourceId: string,
  baseLeftLen: number,
  baseElements: ReadonlyMap<string, ElementMeta>
): StreamDelta[] | null => {
  const deltas: StreamDelta[] = [];
  let leftLen = baseLeftLen;

  for (const step of aSteps) {
    const mapped = shiftStepPastJoin(step, targetId, sourceId, leftLen);

    if (!mapped) return null;
    if (mapped.op === 'insert_text' && mapped.target === targetId) {
      deltas.push({
        kind: 'insert',
        length: mapped.text.length,
        offset: mapped.offset,
      });
    } else if (mapped.op === 'delete_text' && mapped.target === targetId) {
      deltas.push({
        kind: 'delete',
        length: mapped.length,
        offset: mapped.offset,
      });
    } else if (mapped.op === 'wrap_inline' && mapped.target === targetId) {
      deltas.push(
        { kind: 'delete', length: mapped.length, offset: mapped.offset },
        { kind: 'insert', length: 1, offset: mapped.offset }
      );
    } else if (
      mapped.op === 'insert_node' &&
      'offset' in mapped.to &&
      mapped.to.id === targetId
    ) {
      deltas.push({ kind: 'insert', length: 1, offset: mapped.to.offset });
    } else if (mapped.op === 'unwrap_inline' && mapped.parent === targetId) {
      return null;
    }

    const nextLen = advanceTargetStreamLength(
      step,
      targetId,
      baseElements,
      leftLen
    );

    if (nextLen === null) return null;
    leftLen = nextLen;
  }

  return deltas;
};

const shiftBAfterSteps = (
  bAfter: readonly V4Step[],
  targetId: string,
  aJoinedDeltas: readonly StreamDelta[],
  aSteps: readonly V4Step[]
): Readonly<{
  bAfterDeletes: ReadonlyArray<Readonly<{ length: number; offset: number }>>;
  shifted: readonly V4Step[];
}> | null => {
  const shifted: V4Step[] = [];
  const bAfterDeletes: Array<Readonly<{ length: number; offset: number }>> = [];
  const currentDeltas: Array<{
    kind: 'delete' | 'insert';
    length: number;
    offset: number;
  }> = aJoinedDeltas.map((delta) => ({ ...delta }));

  for (const step of bAfter) {
    if (step.op === 'remove_node') {
      shifted.push(step);
      continue;
    }
    if (step.op === 'set_props') {
      if (aSteps.some((a) => a.op === 'set_props' && a.id === step.id)) {
        return null;
      }
      shifted.push(step);
      continue;
    }
    if (step.op === 'delete_text' || step.op === 'format_text') {
      if (step.target === targetId) {
        const nextOffset = shiftRangePastStreamDeltas(
          step.offset,
          step.length,
          currentDeltas
        );

        if (nextOffset === null) return null;
        if (step.op === 'delete_text') {
          bAfterDeletes.push({ length: step.length, offset: step.offset });
          const delEnd = step.offset + step.length;

          for (const delta of currentDeltas) {
            if (delta.offset >= delEnd) {
              delta.offset -= step.length;
            } else if (delta.offset > step.offset) {
              return null;
            }
          }
        }
        shifted.push({ ...step, offset: nextOffset });
      } else {
        if (
          aSteps.some(
            (a) =>
              ('target' in a && a.target === step.target) ||
              ('id' in a && a.id === step.target)
          )
        ) {
          return null;
        }
        shifted.push(step);
      }
      continue;
    }

    return null;
  }

  return { bAfterDeletes, shifted };
};

const rebaseFollowUpOverMovedJoin = (
  base: JsonEditorValue,
  aSteps: readonly V4Step[],
  bSteps: readonly V4Step[],
  touchedRoots: ReadonlySet<string>,
  options: V4ReplayRebaseOptions
): V4ReplayRebaseResult | null => {
  if (bSteps.length < 2 || aSteps.length === 0) return null;
  if (!aSteps.every(isPureLeafOrInlineStep)) return null;

  const joinIdx = bSteps.findIndex((step) => step.op === 'join_nodes');

  if (joinIdx < 1) return null;
  const moveStep = getDefined(bSteps[joinIdx - 1]);
  const joinStep = getDefined(bSteps[joinIdx]);

  if (moveStep.op !== 'move_node' || joinStep.op !== 'join_nodes') return null;
  if (moveStep.id !== joinStep.target && moveStep.id !== joinStep.source) {
    return null;
  }

  const bBefore = bSteps.slice(0, joinIdx - 1);
  const bAfter = bSteps.slice(joinIdx + 1);

  if (
    !bBefore.every(
      (step) =>
        step.op === 'delete_text' ||
        step.op === 'format_text' ||
        step.op === 'set_props'
    ) ||
    !bAfter.every(
      (step) =>
        step.op === 'remove_node' ||
        step.op === 'set_props' ||
        step.op === 'delete_text' ||
        step.op === 'format_text'
    )
  ) {
    return null;
  }

  for (const step of bBefore) {
    const stepTarget = 'target' in step ? step.target : step.id;

    if (
      aSteps.some(
        (aStep) =>
          ('target' in aStep && aStep.target === stepTarget) ||
          ('id' in aStep && aStep.id === stepTarget && aStep.op === 'set_props')
      )
    ) {
      return null;
    }
  }

  const scoped = scopedValueForSteps(base, aSteps, bSteps, touchedRoots);
  const baseElements = indexAllElements(scoped, touchedRoots);
  const targetMeta = baseElements.get(joinStep.target);
  const sourceMeta = baseElements.get(joinStep.source);

  if (
    !targetMeta ||
    !sourceMeta ||
    !isTextBearingElement(targetMeta.node) ||
    !isTextBearingElement(sourceMeta.node)
  ) {
    return null;
  }

  let baseLeftLen = elementStreamLength(targetMeta.node);

  for (const step of bBefore) {
    if (step.op === 'delete_text' && step.target === joinStep.target) {
      baseLeftLen -= step.length;
    }
  }

  const aJoinedDeltas = bAfter.some(
    (step) =>
      (step.op === 'delete_text' || step.op === 'format_text') &&
      step.target === joinStep.target
  )
    ? collectJoinedStreamDeltas(
        aSteps,
        joinStep.target,
        joinStep.source,
        baseLeftLen,
        baseElements
      )
    : [];

  if (aJoinedDeltas === null) return null;

  const shiftedAfter = shiftBAfterSteps(
    bAfter,
    joinStep.target,
    aJoinedDeltas,
    aSteps
  );

  if (!shiftedAfter) return null;

  let leftLen = baseLeftLen;
  const aPrime: V4Step[] = [];

  for (const step of aSteps) {
    const shifted = shiftStepPastJoin(
      step,
      joinStep.target,
      joinStep.source,
      leftLen
    );

    if (!shifted) return null;
    const afterDeletes = shiftJoinedStepPastBDeletes(
      shifted,
      joinStep.target,
      shiftedAfter.bAfterDeletes
    );

    if (!afterDeletes) return null;
    aPrime.push(afterDeletes);

    const nextLen = advanceTargetStreamLength(
      step,
      joinStep.target,
      baseElements,
      leftLen
    );

    if (nextLen === null) return null;
    leftLen = nextLen;
  }

  const bPrime: V4Step[] = [
    ...bBefore,
    moveStep,
    joinStep,
    ...shiftedAfter.shifted,
  ];

  try {
    const afterA = applyV4Steps(scoped, aSteps);
    const afterB = applyV4Steps(scoped, bSteps);
    const mergedA = applyV4Steps(afterA, bPrime);
    const mergedB = applyV4Steps(afterB, aPrime);

    if (!jsonEqual(mergedA, mergedB)) return null;
    if (
      !validateContainersInValue(
        mergedA,
        touchedRoots,
        new Set([joinStep.target]),
        new Set(),
        options
      )
    ) {
      return null;
    }

    return { aPrime, bPrime, kind: 'steps' };
  } catch {
    return null;
  }
};

const shiftRootIndicesInSteps = (
  steps: readonly V4Step[],
  root: string,
  delta: number
): V4Step[] => {
  if (delta === 0) return [...steps];

  return steps.map((step) => {
    if (
      (step.op === 'insert_node' || step.op === 'move_node') &&
      'root' in step.to &&
      step.to.root === root
    ) {
      return {
        ...step,
        to: { index: step.to.index + delta, root },
      };
    }

    return step;
  });
};

const tryWindowScopeForRoot = (
  base: JsonEditorValue,
  aSteps: readonly V4Step[],
  bSteps: readonly V4Step[],
  touchedRoots: ReadonlySet<string>
): Readonly<{
  root: string;
  scoped: JsonEditorValue;
  shift: number;
}> | null => {
  if (touchedRoots.size !== 1) return null;
  const root = [...touchedRoots][0];

  if (!root) return null;
  const neededIds = baseReferencedIdsOf(aSteps, bSteps);

  if (neededIds.size === 0) return null;

  const lookup = getValueIdLookup(base);
  const topIndices = new Set<number>();

  if (lookup) {
    for (const id of neededIds) {
      const loc = lookup(id);

      if (!loc || loc.root !== root || loc.path.length === 0) return null;
      topIndices.add(getDefined(loc.path[0]));
    }
  } else {
    const remaining = new Set(neededIds);
    const nodes = rootNodesIn(base, root);

    for (let i = 0; i < nodes.length && remaining.size > 0; i += 1) {
      if (subtreeContainsAnyId(getDefined(nodes[i]), remaining)) {
        topIndices.add(i);
      }
    }
    if (remaining.size > 0) return null;
  }

  for (const steps of [aSteps, bSteps]) {
    for (const step of steps) {
      if (
        (step.op === 'insert_node' || step.op === 'move_node') &&
        'root' in step.to
      ) {
        if (step.to.root !== root) return null;
        topIndices.add(step.to.index);
      }
    }
  }

  let minIdx = Number.POSITIVE_INFINITY;
  let maxIdx = Number.NEGATIVE_INFINITY;

  for (const idx of topIndices) {
    if (idx < minIdx) minIdx = idx;
    if (idx > maxIdx) maxIdx = idx;
  }

  if (minIdx < 0 || maxIdx - minIdx > 8) return null;

  const fullNodes = rootNodesIn(base, root);
  const endExclusive = Math.min(maxIdx + 1, fullNodes.length);
  const slice: JsonNode[] = [];

  for (let i = minIdx; i < endExclusive; i += 1) {
    slice.push(getDefined(fullNodes[i]));
  }

  const scoped: JsonEditorValue =
    root === 'main'
      ? { children: slice }
      : { children: [], roots: { [root]: slice } };

  return { root, scoped, shift: minIdx };
};

const rebaseJoinAcrossWrapInScope = (
  scoped: JsonEditorValue,
  aSteps: readonly V4Step[],
  bSteps: readonly V4Step[],
  touchedRoots: ReadonlySet<string>,
  options: V4ReplayRebaseOptions
): V4ReplayRebaseResult | null => {
  const joinIndex = bSteps.findIndex((step) => step.op === 'join_nodes');

  if (joinIndex === -1) return null;
  const joinStep = getDefined(bSteps[joinIndex]);

  if (joinStep.op !== 'join_nodes') return null;

  const prevStep = joinIndex > 0 ? getDefined(bSteps[joinIndex - 1]) : null;
  const existingMove =
    prevStep &&
    prevStep.op === 'move_node' &&
    (prevStep.id === joinStep.source || prevStep.id === joinStep.target) &&
    'id' in prevStep.to
      ? prevStep
      : null;

  const bBefore = bSteps.slice(0, existingMove ? joinIndex - 1 : joinIndex);
  const bAfter = bSteps.slice(joinIndex + 1);

  if (
    !bBefore.every(
      (step) =>
        step.op === 'delete_text' ||
        step.op === 'format_text' ||
        step.op === 'set_props'
    ) ||
    !bAfter.every(
      (step) =>
        step.op === 'set_props' ||
        step.op === 'delete_text' ||
        step.op === 'format_text' ||
        step.op === 'remove_node'
    )
  ) {
    return null;
  }

  const baseElements = indexAllElements(scoped, touchedRoots);
  const targetBase = baseElements.get(joinStep.target);
  const sourceBase = baseElements.get(joinStep.source);

  if (
    !targetBase ||
    !sourceBase ||
    targetBase.root !== sourceBase.root ||
    !isTextBearingElement(targetBase.node) ||
    !isTextBearingElement(sourceBase.node)
  ) {
    return null;
  }

  if (
    !existingMove &&
    (targetBase.parentId !== sourceBase.parentId ||
      sourceBase.index !== targetBase.index + 1)
  ) {
    return null;
  }

  const { root } = targetBase;
  const baseParentId = existingMove
    ? existingMove.id === joinStep.source
      ? sourceBase.parentId
      : targetBase.parentId
    : targetBase.parentId;
  const sourceBaseIndex = sourceBase.index;
  const insertedByA = new Set<string>();

  for (const step of aSteps) {
    if (step.op === 'insert_node') {
      const id = elementIdOf(step.node);

      if (id) insertedByA.add(id);
    }
  }
  if (insertedByA.size === 0) return null;

  let afterA: JsonEditorValue;
  let afterB: JsonEditorValue;

  try {
    afterA = applyV4Steps(scoped, aSteps);
    afterB = applyV4Steps(scoped, bSteps);
  } catch {
    return null;
  }

  const afterAElements = indexRootElements(afterA, root);
  const targetAfter = afterAElements.get(joinStep.target);
  const sourceAfter = afterAElements.get(joinStep.source);

  if (!targetAfter || !sourceAfter) return null;

  if (
    !existingMove &&
    targetAfter.parentId === sourceAfter.parentId &&
    sourceAfter.index === targetAfter.index + 1
  ) {
    return null;
  }

  const targetWrapped = targetAfter.ancestors.some((id) => insertedByA.has(id));
  const sourceWrapped = sourceAfter.ancestors.some((id) => insertedByA.has(id));

  if (!targetWrapped && !sourceWrapped) return null;
  if (
    existingMove &&
    !(
      (existingMove.id === joinStep.source &&
        sourceWrapped &&
        !targetWrapped) ||
      (existingMove.id === joinStep.target && targetWrapped && !sourceWrapped)
    )
  ) {
    return null;
  }

  if (!existingMove) {
    const targetAnc = childUnderParent(
      afterAElements,
      joinStep.target,
      baseParentId
    );
    const sourceAnc = childUnderParent(
      afterAElements,
      joinStep.source,
      baseParentId
    );

    if (
      !targetAnc ||
      !sourceAnc ||
      elementIdOf(targetAnc.node) === elementIdOf(sourceAnc.node) ||
      sourceAnc.index !== targetAnc.index + 1
    ) {
      return null;
    }
  }

  let baseLeftLen = elementStreamLength(targetBase.node);

  for (const step of bBefore) {
    if (step.op === 'delete_text' && step.target === joinStep.target) {
      baseLeftLen -= step.length;
    }
  }

  const aJoinedDeltas = bAfter.some(
    (step) =>
      (step.op === 'delete_text' || step.op === 'format_text') &&
      step.target === joinStep.target
  )
    ? collectJoinedStreamDeltas(
        aSteps,
        joinStep.target,
        joinStep.source,
        baseLeftLen,
        baseElements
      )
    : [];

  if (aJoinedDeltas === null) return null;

  const shiftedAfter = shiftBAfterSteps(
    bAfter,
    joinStep.target,
    aJoinedDeltas,
    aSteps
  );

  if (!shiftedAfter) return null;

  const bPrime: V4Step[] = [];
  const prunedWrapperIds = new Set<string>();
  const changedContainers = new Set<string>([joinStep.target]);
  const changedRoots = new Set<string>();

  if (baseParentId === null) changedRoots.add(root);
  else changedContainers.add(baseParentId);

  for (const step of bBefore) {
    const stepTarget = 'target' in step ? step.target : step.id;

    if (
      aSteps.some(
        (aStep) =>
          ('target' in aStep && aStep.target === stepTarget) ||
          ('id' in aStep && aStep.id === stepTarget && aStep.op === 'set_props')
      )
    ) {
      return null;
    }
    bPrime.push(step);
  }

  let mode: 'into-source-wrap' | 'into-target-wrap' | 'unwrap-source';

  if (existingMove) {
    if (existingMove.id === joinStep.source && targetAfter.parentId) {
      mode = 'into-target-wrap';
      const destParentId = targetAfter.parentId;
      const destParentNode = getDefined(afterAElements.get(destParentId)).node;

      if (
        options.canContain &&
        !options.canContain(destParentNode, sourceAfter.node)
      ) {
        return null;
      }
      bPrime.push(
        {
          id: joinStep.source,
          op: 'move_node',
          to: { id: destParentId, index: targetAfter.index + 1 },
        },
        joinStep
      );
      changedContainers.add(destParentId);
    } else if (existingMove.id === joinStep.target && sourceAfter.parentId) {
      mode = 'into-source-wrap';
      const destParentId = sourceAfter.parentId;
      const destParentNode = getDefined(afterAElements.get(destParentId)).node;

      if (
        options.canContain &&
        !options.canContain(destParentNode, targetAfter.node)
      ) {
        return null;
      }
      bPrime.push(
        {
          id: joinStep.target,
          op: 'move_node',
          to: { id: destParentId, index: sourceAfter.index },
        },
        joinStep
      );
      changedContainers.add(destParentId);
    } else {
      return null;
    }
  } else if (targetWrapped) {
    mode = 'into-target-wrap';
    const destParentId = getDefined(targetAfter.parentId);
    const destParentNode = getDefined(afterAElements.get(destParentId)).node;

    if (
      options.canContain &&
      !options.canContain(destParentNode, sourceAfter.node)
    ) {
      return null;
    }
    bPrime.push(
      {
        id: joinStep.source,
        op: 'move_node',
        to: { id: destParentId, index: targetAfter.index + 1 },
      },
      joinStep
    );
    changedContainers.add(destParentId);
  } else {
    const sourceParentId = getDefined(sourceAfter.parentId);
    const sourceParentNode = getDefined(
      afterAElements.get(sourceParentId)
    ).node;

    if (
      !options.canContain ||
      options.canContain(sourceParentNode, targetAfter.node)
    ) {
      mode = 'into-source-wrap';
      bPrime.push(
        {
          id: joinStep.target,
          op: 'move_node',
          to: { id: sourceParentId, index: sourceAfter.index },
        },
        joinStep
      );
      changedContainers.add(sourceParentId);
    } else {
      mode = 'unwrap-source';
      const to: V4Place =
        baseParentId === null
          ? { index: targetAfter.index + 1, root }
          : { id: baseParentId, index: targetAfter.index + 1 };

      bPrime.push({ id: joinStep.source, op: 'move_node', to }, joinStep);
    }
  }

  const pruneEmptiedAncestors = (
    startParentId: string | null,
    initialRemovedChildId: string
  ) => {
    let curParentId = startParentId;
    let removedChildId = initialRemovedChildId;

    while (curParentId && insertedByA.has(curParentId)) {
      const parentMeta = afterAElements.get(curParentId);

      if (!parentMeta) break;
      const remaining = parentMeta.node.children.filter(
        (child) => elementIdOf(child) !== removedChildId
      );

      if (remaining.length > 0) {
        changedContainers.add(curParentId);
        break;
      }
      prunedWrapperIds.add(curParentId);
      bPrime.push({ id: curParentId, op: 'remove_node' });
      removedChildId = curParentId;
      curParentId = parentMeta.parentId;
    }
  };

  if (mode !== 'into-source-wrap' && sourceWrapped) {
    pruneEmptiedAncestors(sourceAfter.parentId, joinStep.source);
  }
  if (mode === 'into-source-wrap' && targetWrapped) {
    pruneEmptiedAncestors(targetAfter.parentId, joinStep.target);
  }

  for (const step of shiftedAfter.shifted) {
    bPrime.push(step);
  }

  const targetAfterB = indexRootElements(afterB, root).get(joinStep.target);

  if (!targetAfterB) return null;

  let leftLen = baseLeftLen;

  const aPrime: V4Step[] = [];
  const shiftPlacePastSourceRemoval = (place: V4Place): V4Place => {
    if ('offset' in place) return place;
    const sameParent =
      baseParentId === null
        ? 'root' in place && place.root === root
        : 'id' in place && place.id === baseParentId;

    if (sameParent && place.index > sourceBaseIndex) {
      return 'root' in place
        ? { index: place.index - 1, root: place.root }
        : { id: place.id, index: place.index - 1 };
    }

    return place;
  };

  let targetMovedBySourceWrap = false;

  for (const step of aSteps) {
    if (step.op === 'insert_node') {
      const id = elementIdOf(step.node);

      if (id && prunedWrapperIds.has(id)) continue;
      if ('offset' in step.to) {
        const shifted = shiftStepPastJoin(
          step,
          joinStep.target,
          joinStep.source,
          leftLen
        );

        if (!shifted) return null;
        const afterDeletes = shiftJoinedStepPastBDeletes(
          shifted,
          joinStep.target,
          shiftedAfter.bAfterDeletes
        );

        if (!afterDeletes) return null;
        aPrime.push(afterDeletes);
        if (step.to.id === joinStep.target) leftLen += 1;
      } else {
        aPrime.push({ ...step, to: shiftPlacePastSourceRemoval(step.to) });
      }
      continue;
    }

    if (step.op === 'move_node') {
      if (step.id === joinStep.source) {
        if (
          mode === 'into-source-wrap' &&
          !existingMove &&
          !targetMovedBySourceWrap
        ) {
          targetMovedBySourceWrap = true;
          aPrime.push({
            id: joinStep.target,
            op: 'move_node',
            to: shiftPlacePastSourceRemoval(step.to),
          });
        }
        continue;
      }
      if ('id' in step.to && prunedWrapperIds.has(step.to.id)) continue;
      aPrime.push({ ...step, to: shiftPlacePastSourceRemoval(step.to) });
      continue;
    }

    if (step.op === 'remove_node') {
      if (prunedWrapperIds.has(step.id)) continue;
      aPrime.push(step);
      continue;
    }

    if (step.op === 'set_props' && prunedWrapperIds.has(step.id)) continue;

    const shifted = shiftStepPastJoin(
      step,
      joinStep.target,
      joinStep.source,
      leftLen
    );

    if (!shifted) return null;
    const afterDeletes = shiftJoinedStepPastBDeletes(
      shifted,
      joinStep.target,
      shiftedAfter.bAfterDeletes
    );

    if (!afterDeletes) return null;
    aPrime.push(afterDeletes);

    const nextLen = advanceTargetStreamLength(
      step,
      joinStep.target,
      baseElements,
      leftLen
    );

    if (nextLen === null) return null;
    leftLen = nextLen;
  }

  try {
    const mergedA = applyV4Steps(afterA, bPrime);
    const mergedB = applyV4Steps(afterB, aPrime);

    if (!jsonEqual(mergedA, mergedB)) return null;
    if (
      !validateContainersInValue(
        mergedA,
        touchedRoots,
        changedContainers,
        changedRoots,
        options
      )
    ) {
      return null;
    }

    return { aPrime, bPrime, kind: 'steps' };
  } catch {
    return null;
  }
};

const rebaseJoinAcrossWrap = (
  base: JsonEditorValue,
  aSteps: readonly V4Step[],
  bSteps: readonly V4Step[],
  touchedRoots: ReadonlySet<string>,
  options: V4ReplayRebaseOptions
): V4ReplayRebaseResult | null => {
  const followUp = rebaseFollowUpOverMovedJoin(
    base,
    aSteps,
    bSteps,
    touchedRoots,
    options
  );

  if (followUp) return followUp;

  if (
    !bSteps.some((step) => step.op === 'join_nodes') ||
    !aSteps.some((step) => step.op === 'insert_node') ||
    !aSteps.some((step) => step.op === 'move_node')
  ) {
    return null;
  }

  const windowed = tryWindowScopeForRoot(base, aSteps, bSteps, touchedRoots);

  if (windowed) {
    const shiftedA = shiftRootIndicesInSteps(
      aSteps,
      windowed.root,
      -windowed.shift
    );
    const shiftedB = shiftRootIndicesInSteps(
      bSteps,
      windowed.root,
      -windowed.shift
    );
    const result = rebaseJoinAcrossWrapInScope(
      windowed.scoped,
      shiftedA,
      shiftedB,
      touchedRoots,
      options
    );

    if (result && result.kind === 'steps') {
      return {
        aPrime: shiftRootIndicesInSteps(
          result.aPrime,
          windowed.root,
          windowed.shift
        ),
        bPrime: shiftRootIndicesInSteps(
          result.bPrime,
          windowed.root,
          windowed.shift
        ),
        kind: 'steps',
      };
    }
    if (windowed.shift === 0) return null;
  }

  return rebaseJoinAcrossWrapInScope(
    rootScopeValue(base, touchedRoots),
    aSteps,
    bSteps,
    touchedRoots,
    options
  );
};

type WrapPiece = Readonly<{
  formats: readonly FormatTextStep[];
  id: string;
  length: number;
  offset: number;
  shell: JsonElementNode;
}>;

type TargetWrapPlan = Readonly<{
  otherSteps: readonly V4Step[];
  preTargetInserts: readonly InsertTextStep[];
  target: string;
  unwrapIds: readonly string[];
  wraps: readonly WrapPiece[];
}>;

const nonIdPropsOf = (node: JsonElementNode): JsonRecord => {
  const props = nodeProps(node);
  const out: JsonRecord = {};

  for (const [key, val] of Object.entries(props)) {
    if (key === 'id') continue;
    out[key] = val;
  }

  return out;
};

const unitContentMatches = (
  baseUnits: readonly V4TextUnit[],
  wrappedUnits: readonly V4TextUnit[],
  wrapId: string,
  textPropertyContext: DocumentPropertyContext,
  isSetValued?: DocumentSetPropertyResolver
): FormatTextStep[] | null => {
  if (baseUnits.length !== wrappedUnits.length || baseUnits.length === 0) {
    return null;
  }

  const formats: FormatTextStep[] = [];

  for (let i = 0; i < baseUnits.length; i += 1) {
    const baseUnit = getDefined(baseUnits[i]);
    const wrappedUnit = getDefined(wrappedUnits[i]);

    if (baseUnit.kind !== wrappedUnit.kind) return null;
    if (baseUnit.kind === 'inline' && wrappedUnit.kind === 'inline') {
      if (!jsonEqual(baseUnit.node, wrappedUnit.node)) return null;
      continue;
    }
    if (baseUnit.kind === 'char' && wrappedUnit.kind === 'char') {
      if (baseUnit.ch !== wrappedUnit.ch) return null;
      if (!jsonEqual(baseUnit.marks, wrappedUnit.marks)) {
        const delta = propDeltaBetween(
          baseUnit.marks,
          wrappedUnit.marks,
          isSetValued
            ? (key) =>
                isSetValued({ text: baseUnit.ch }, key, textPropertyContext)
            : undefined
        );

        if (!isEmptyPropDelta(delta)) {
          const prev = formats.at(-1);

          if (
            prev &&
            prev.offset + prev.length === i &&
            jsonEqual(
              {
                add: prev.add,
                remove: prev.remove,
                set: prev.set,
                unset: prev.unset,
              },
              {
                add: delta.add,
                remove: delta.remove,
                set: delta.set,
                unset: delta.unset,
              }
            )
          ) {
            formats[formats.length - 1] = { ...prev, length: prev.length + 1 };
          } else {
            formats.push({
              ...delta,
              length: 1,
              offset: i,
              op: 'format_text',
              target: wrapId,
            });
          }
        }
      }
    }
  }

  return formats;
};

const textPropertyContextFor = (
  baseElements: ReadonlyMap<string, ElementMeta>,
  targetMeta: ElementMeta,
  wrapNode: JsonElementNode
): DocumentPropertyContext => {
  const wrapType =
    typeof wrapNode.type === 'string' ? wrapNode.type : 'element';
  const targetType =
    typeof targetMeta.node.type === 'string' ? targetMeta.node.type : 'element';
  const ancestors: string[] = [targetType];

  for (let i = targetMeta.ancestors.length - 1; i >= 0; i -= 1) {
    const ancMeta = baseElements.get(getDefined(targetMeta.ancestors[i]));

    if (ancMeta) {
      ancestors.push(
        typeof ancMeta.node.type === 'string' ? ancMeta.node.type : 'element'
      );
    }
  }

  return Object.freeze({
    ancestors,
    parent: wrapType,
    path: [...targetMeta.path, 0],
    placement: 'text',
    root: targetMeta.root === 'main' ? null : targetMeta.root,
    type: wrapType,
  });
};

type FlatStreamMap = Readonly<{
  flatUnits: readonly V4TextUnit[];
  preToFlat: readonly number[];
  unwrapSpans: ReadonlyMap<string, Readonly<{ length: number; start: number }>>;
}>;

const buildFlatStreamAfterUnwraps = (
  targetNode: JsonElementNode,
  unwrapIds: ReadonlySet<string>
): FlatStreamMap | null => {
  const baseUnits = toV4TextStream(targetNode.children).units;
  const flatUnits: V4TextUnit[] = [];
  const preToFlat: number[] = [];
  const unwrapSpans = new Map<
    string,
    Readonly<{ length: number; start: number }>
  >();
  let foundUnwraps = 0;

  for (const unit of baseUnits) {
    preToFlat.push(flatUnits.length);
    if (unit.kind === 'inline') {
      const id = elementIdOf(unit.node);

      if (id && unwrapIds.has(id)) {
        const innerUnits = toV4TextStream(unit.node.children).units;

        unwrapSpans.set(id, {
          length: innerUnits.length,
          start: flatUnits.length,
        });
        for (const inner of innerUnits) flatUnits.push(inner);
        foundUnwraps += 1;
        continue;
      }
    }
    flatUnits.push(unit);
  }
  preToFlat.push(flatUnits.length);

  if (foundUnwraps !== unwrapIds.size) return null;

  return { flatUnits, preToFlat, unwrapSpans };
};

const isOwnedByInlineId = (candidateId: string, ownerId: string): boolean => {
  if (candidateId === ownerId) return true;
  const prefix = `${ownerId}.split`;

  if (!candidateId.startsWith(prefix)) return false;

  return /^\d*$/.test(candidateId.slice(prefix.length));
};

const extractTargetWrapPlan = (
  steps: readonly V4Step[],
  baseElements: ReadonlyMap<string, ElementMeta>,
  isSetValued?: DocumentSetPropertyResolver,
  allowTargetInserts = false
): TargetWrapPlan | null => {
  let target: string | null = null;

  for (const step of steps) {
    if (step.op === 'wrap_inline') {
      if (target && target !== step.target) return null;
      ({ target } = step);
    } else if (step.op === 'unwrap_inline') {
      if (target && target !== step.parent) return null;
      target = step.parent;
    }
  }

  if (!target) {
    for (let i = 0; i + 1 < steps.length; i += 1) {
      const step = getDefined(steps[i]);
      const next = getDefined(steps[i + 1]);

      if (
        step.op === 'delete_text' &&
        next.op === 'insert_node' &&
        'id' in next.to &&
        next.to.id === step.target
      ) {
        if (target && target !== step.target) return null;
        ({ target } = step);
      }
    }
  }

  if (!target) return null;

  const targetMeta = baseElements.get(target);

  if (!targetMeta || !isTextBearingElement(targetMeta.node)) return null;

  const unwrapIds: string[] = [];
  const unwrapSet = new Set<string>();
  const consumed = new Set<number>();
  let seenNonUnwrapOnTarget = false;

  for (let i = 0; i < steps.length; i += 1) {
    const step = getDefined(steps[i]);

    if (step.op === 'unwrap_inline' && step.parent === target) {
      if (seenNonUnwrapOnTarget || unwrapSet.has(step.id)) return null;
      unwrapIds.push(step.id);
      unwrapSet.add(step.id);
      consumed.add(i);
      continue;
    }
    if (
      ('target' in step && step.target === target) ||
      (step.op === 'insert_node' && 'id' in step.to && step.to.id === target)
    ) {
      seenNonUnwrapOnTarget = true;
    }
  }

  const preTargetInserts: InsertTextStep[] = [];
  let effectiveTargetNode = targetMeta.node;

  if (allowTargetInserts && unwrapIds.length === 0) {
    const firstWrapIdx = steps.findIndex(
      (step) =>
        (step.op === 'wrap_inline' && step.target === target) ||
        (step.op === 'delete_text' && step.target === target)
    );

    for (let i = 0; i < steps.length; i += 1) {
      const step = getDefined(steps[i]);

      if (step.op !== 'insert_text' || step.target !== target) continue;
      if (firstWrapIdx !== -1 && i > firstWrapIdx) return null;
      preTargetInserts.push(step);
      consumed.add(i);
    }

    if (preTargetInserts.length > 0) {
      const miniBase: JsonEditorValue = { children: [targetMeta.node] };

      try {
        const afterInserts = applyV4Steps(miniBase, preTargetInserts);
        const updated = afterInserts.children[0];

        if (!updated || !isElementNode(updated)) return null;
        effectiveTargetNode = updated;
      } catch {
        return null;
      }
    }
  }

  const flatMap = buildFlatStreamAfterUnwraps(effectiveTargetNode, unwrapSet);

  if (!flatMap) return null;

  type StreamSlot =
    | Readonly<{ kind: 'flat'; pos: number }>
    | Readonly<{ kind: 'wrapped'; wrapIdx: number }>;

  const slots: StreamSlot[] = flatMap.flatUnits.map((_, pos) => ({
    kind: 'flat',
    pos,
  }));
  const wraps: Array<{
    formats: FormatTextStep[];
    id: string;
    length: number;
    offset: number;
    shell: JsonElementNode;
  }> = [];
  const wrapById = new Map<string, number>();

  for (let i = 0; i < steps.length; i += 1) {
    if (consumed.has(i)) continue;
    const step = getDefined(steps[i]);

    if (step.op === 'wrap_inline' && step.target === target) {
      const id = elementIdOf(step.node);

      if (!id || step.length <= 0 || wrapById.has(id)) return null;
      if (step.offset < 0 || step.offset + step.length > slots.length) {
        return null;
      }
      const slice = slots.slice(step.offset, step.offset + step.length);

      if (!slice.every((slot) => slot.kind === 'flat')) return null;
      const firstSlot = getDefined(slice[0]);
      const lastSlot = getDefined(slice.at(-1));

      if (firstSlot.kind !== 'flat' || lastSlot.kind !== 'flat') return null;
      if (lastSlot.pos - firstSlot.pos + 1 !== step.length) return null;

      const wrapIdx = wraps.length;

      wraps.push({
        formats: [],
        id,
        length: step.length,
        offset: firstSlot.pos,
        shell: { ...cloneJson(nodeProps(step.node)), children: [] },
      });
      wrapById.set(id, wrapIdx);
      slots.splice(step.offset, step.length, { kind: 'wrapped', wrapIdx });
      consumed.add(i);
      continue;
    }

    if (
      step.op === 'delete_text' &&
      step.target === target &&
      i + 1 < steps.length
    ) {
      const next = getDefined(steps[i + 1]);

      if (
        next.op === 'insert_node' &&
        'id' in next.to &&
        next.to.id === target
      ) {
        const insOffset = 'offset' in next.to ? next.to.offset : next.to.index;
        const id = elementIdOf(next.node);

        if (insOffset === step.offset && id && step.length > 0) {
          if (step.offset < 0 || step.offset + step.length > slots.length) {
            return null;
          }
          const slice = slots.slice(step.offset, step.offset + step.length);

          if (slice.length === 1 && getDefined(slice[0]).kind === 'wrapped') {
            const slot = getDefined(slice[0]);

            if (slot.kind !== 'wrapped') return null;
            const prevWrap = getDefined(wraps[slot.wrapIdx]);
            const baseSlice = flatMap.flatUnits.slice(
              prevWrap.offset,
              prevWrap.offset + prevWrap.length
            );
            const nextUnits = toV4TextStream(next.node.children).units;
            const nextFormats = unitContentMatches(
              baseSlice,
              nextUnits,
              id,
              textPropertyContextFor(baseElements, targetMeta, next.node),
              isSetValued
            );

            if (nextFormats !== null) {
              wrapById.delete(prevWrap.id);
              if (wrapById.has(id)) return null;
              wraps[slot.wrapIdx] = {
                formats: nextFormats,
                id,
                length: prevWrap.length,
                offset: prevWrap.offset,
                shell: { ...cloneJson(nodeProps(next.node)), children: [] },
              };
              wrapById.set(id, slot.wrapIdx);
              consumed.add(i);
              consumed.add(i + 1);
              i += 1;
              continue;
            }
          }

          if (slice.every((slot) => slot.kind === 'flat')) {
            const firstSlot = getDefined(slice[0]);
            const lastSlot = getDefined(slice.at(-1));

            if (
              firstSlot.kind === 'flat' &&
              lastSlot.kind === 'flat' &&
              lastSlot.pos - firstSlot.pos + 1 === step.length &&
              !wrapById.has(id)
            ) {
              const deletedSlice = flatMap.flatUnits.slice(
                firstSlot.pos,
                firstSlot.pos + step.length
              );
              const wrappedUnits = toV4TextStream(next.node.children).units;
              const formats = unitContentMatches(
                deletedSlice,
                wrappedUnits,
                id,
                textPropertyContextFor(baseElements, targetMeta, next.node),
                isSetValued
              );

              if (formats !== null) {
                const wrapIdx = wraps.length;

                wraps.push({
                  formats,
                  id,
                  length: step.length,
                  offset: firstSlot.pos,
                  shell: { ...cloneJson(nodeProps(next.node)), children: [] },
                });
                wrapById.set(id, wrapIdx);
                slots.splice(step.offset, step.length, {
                  kind: 'wrapped',
                  wrapIdx,
                });
                consumed.add(i);
                consumed.add(i + 1);
                i += 1;
                continue;
              }
            }
          }
        }
      }
    }
  }

  if (wraps.length === 0) return null;

  const firstWrapConsumedIdx = Math.min(
    ...[...consumed].filter((idx) => {
      const step = getDefined(steps[idx]);

      return step.op !== 'unwrap_inline' && step.op !== 'insert_text';
    })
  );
  const otherSteps: V4Step[] = [];

  for (let i = 0; i < steps.length; i += 1) {
    if (consumed.has(i)) continue;
    const step = getDefined(steps[i]);

    if (step.op === 'format_text') {
      const wrapIdx = wrapById.get(step.target);

      if (wrapIdx !== undefined) {
        getDefined(wraps[wrapIdx]).formats.push(step);
        continue;
      }

      if (step.target === target && i < firstWrapConsumedIdx) {
        const owner = wraps.find(
          (w) =>
            step.offset >= w.offset &&
            step.offset + step.length <= w.offset + w.length
        );

        if (owner) {
          owner.formats.push({
            ...step,
            offset: step.offset - owner.offset,
            target: owner.id,
          });
          continue;
        }
      }
    }

    for (const refId of stepReferencedIds(step)) {
      if (refId === target || wrapById.has(refId) || unwrapSet.has(refId)) {
        return null;
      }
    }
    otherSteps.push(step);
  }

  wraps.sort((left, right) => left.offset - right.offset);

  return {
    otherSteps,
    preTargetInserts,
    target,
    unwrapIds,
    wraps,
  };
};

const uniqueSplitId = (
  baseId: string,
  liveIds: Set<string>,
  hasIdInDoc?: (id: string) => boolean
): string => {
  const isTaken = (id: string) =>
    liveIds.has(id) || (hasIdInDoc ? hasIdInDoc(id) : false);
  let candidate = `${baseId}.split`;
  let counter = 1;

  while (isTaken(candidate)) {
    candidate = `${baseId}.split${counter}`;
    counter += 1;
  }

  liveIds.add(candidate);

  return candidate;
};

const formatDeltaKeys = (fmt: FormatTextStep): Set<string> => {
  const keys = new Set<string>();

  if (fmt.set) {
    for (const key of Object.keys(fmt.set)) keys.add(key);
  }
  if (fmt.unset) {
    for (const key of fmt.unset) keys.add(key);
  }
  if (fmt.add) {
    for (const key of Object.keys(fmt.add)) keys.add(key);
  }
  if (fmt.remove) {
    for (const key of Object.keys(fmt.remove)) keys.add(key);
  }

  return keys;
};

const stripOverriddenKeysFromDelta = (
  delta: V4PropDelta,
  overridden: ReadonlySet<string>
): V4PropDelta => {
  if (overridden.size === 0) return delta;
  const out: {
    add?: Record<string, readonly unknown[]>;
    remove?: Record<string, readonly unknown[]>;
    set?: JsonRecord;
    unset?: string[];
  } = {};

  if (delta.set) {
    const nextSet: JsonRecord = {};

    for (const [key, val] of Object.entries(delta.set)) {
      if (!overridden.has(key)) nextSet[key] = val;
    }
    if (Object.keys(nextSet).length > 0) out.set = nextSet;
  }
  if (delta.unset) {
    const nextUnset = delta.unset.filter((key) => !overridden.has(key));

    if (nextUnset.length > 0) out.unset = nextUnset;
  }
  if (delta.add) {
    const nextAdd: Record<string, readonly unknown[]> = {};

    for (const [key, val] of Object.entries(delta.add)) {
      if (!overridden.has(key)) nextAdd[key] = val;
    }
    if (Object.keys(nextAdd).length > 0) out.add = nextAdd;
  }
  if (delta.remove) {
    const nextRemove: Record<string, readonly unknown[]> = {};

    for (const [key, val] of Object.entries(delta.remove)) {
      if (!overridden.has(key)) nextRemove[key] = val;
    }
    if (Object.keys(nextRemove).length > 0) out.remove = nextRemove;
  }

  return out;
};

const clampFormatToRange = (
  fmt: FormatTextStep,
  baseStart: number,
  rangeStart: number,
  rangeEnd: number,
  destTarget: string,
  destBaseOffset: number,
  overriddenKeys?: ReadonlySet<string>
): FormatTextStep | null => {
  const fStart = baseStart + fmt.offset;
  const fEnd = fStart + fmt.length;
  const ovStart = Math.max(fStart, rangeStart);
  const ovEnd = Math.min(fEnd, rangeEnd);

  if (ovStart >= ovEnd) return null;

  const rawDelta: V4PropDelta = {
    ...(fmt.add ? { add: fmt.add } : {}),
    ...(fmt.remove ? { remove: fmt.remove } : {}),
    ...(fmt.set ? { set: fmt.set } : {}),
    ...(fmt.unset ? { unset: fmt.unset } : {}),
  };
  const delta = overriddenKeys
    ? stripOverriddenKeysFromDelta(rawDelta, overriddenKeys)
    : rawDelta;

  if (isEmptyPropDelta(delta)) return null;

  return {
    ...delta,
    length: ovEnd - ovStart,
    offset: destBaseOffset + (ovStart - rangeStart),
    op: 'format_text',
    target: destTarget,
  };
};

const clampFormatExcluding = (
  fmt: FormatTextStep,
  baseStart: number,
  rangeStart: number,
  rangeEnd: number,
  destTarget: string,
  destBaseOffset: number,
  bFormats: readonly FormatTextStep[],
  wrapStart: number
): FormatTextStep[] => {
  const fStart = baseStart + fmt.offset;
  const fEnd = fStart + fmt.length;
  const ovStart = Math.max(fStart, rangeStart);
  const ovEnd = Math.min(fEnd, rangeEnd);

  if (ovStart >= ovEnd) return [];

  const points = new Set<number>([ovStart, ovEnd]);

  for (const bFmt of bFormats) {
    const bfStart = wrapStart + bFmt.offset;
    const bfEnd = bfStart + bFmt.length;

    if (bfStart > ovStart && bfStart < ovEnd) points.add(bfStart);
    if (bfEnd > ovStart && bfEnd < ovEnd) points.add(bfEnd);
  }

  const sortedPoints = [...points].sort((left, right) => left - right);
  const out: FormatTextStep[] = [];

  for (let i = 0; i + 1 < sortedPoints.length; i += 1) {
    const segStart = getDefined(sortedPoints[i]);
    const segEnd = getDefined(sortedPoints[i + 1]);
    const overridden = new Set<string>();

    for (const bFmt of bFormats) {
      const bfStart = wrapStart + bFmt.offset;
      const bfEnd = bfStart + bFmt.length;

      if (bfStart <= segStart && segEnd <= bfEnd) {
        for (const key of formatDeltaKeys(bFmt)) overridden.add(key);
      }
    }

    const piece = clampFormatToRange(
      fmt,
      baseStart,
      segStart,
      segEnd,
      destTarget,
      destBaseOffset + (segStart - rangeStart),
      overridden
    );

    if (piece) out.push(piece);
  }

  return out;
};

const rebaseOtherSteps = (
  aOther: readonly V4Step[],
  bOther: readonly V4Step[]
): Readonly<{
  aOtherPrime: readonly V4Step[];
  bOtherPrime: readonly V4Step[];
}> | null => {
  if (aOther.length === 0 || bOther.length === 0) {
    return { aOtherPrime: aOther, bOtherPrime: bOther };
  }

  const aIds = new Set<string>();

  for (const step of aOther) {
    if (step.op === 'insert_node' || step.op === 'move_node') return null;
    for (const id of stepReferencedIds(step)) aIds.add(id);
  }

  let hasShared = false;

  for (const step of bOther) {
    if (step.op === 'insert_node' || step.op === 'move_node') return null;
    for (const id of stepReferencedIds(step)) {
      if (aIds.has(id)) hasShared = true;
    }
  }

  if (!hasShared) {
    return { aOtherPrime: aOther, bOtherPrime: bOther };
  }

  const isInsertOrFormat = (
    step: V4Step
  ): step is FormatTextStep | InsertTextStep =>
    step.op === 'insert_text' || step.op === 'format_text';

  if (!aOther.every(isInsertOrFormat) || !bOther.every(isInsertOrFormat)) {
    return null;
  }

  const aPrime: Array<FormatTextStep | InsertTextStep> = [...aOther];
  const bPrime: Array<FormatTextStep | InsertTextStep> = [...bOther];

  for (let i = 0; i < aPrime.length; i += 1) {
    for (let j = 0; j < bPrime.length; j += 1) {
      const aStep = getDefined(aPrime[i]);
      const bStep = getDefined(bPrime[j]);

      if (aStep.target !== bStep.target) continue;
      if (aStep.op === 'insert_text' && bStep.op === 'insert_text') {
        if (bStep.offset <= aStep.offset) {
          aPrime[i] = { ...aStep, offset: aStep.offset + bStep.text.length };
        } else {
          bPrime[j] = { ...bStep, offset: bStep.offset + aStep.text.length };
        }
      } else if (aStep.op === 'format_text' && bStep.op === 'insert_text') {
        if (bStep.offset <= aStep.offset) {
          aPrime[i] = { ...aStep, offset: aStep.offset + bStep.text.length };
        } else if (bStep.offset < aStep.offset + aStep.length) {
          return null;
        }
      } else if (aStep.op === 'insert_text' && bStep.op === 'format_text') {
        if (aStep.offset <= bStep.offset) {
          bPrime[j] = { ...bStep, offset: bStep.offset + aStep.text.length };
        } else if (aStep.offset < bStep.offset + bStep.length) {
          return null;
        }
      } else if (
        aStep.op === 'format_text' &&
        bStep.op === 'format_text' &&
        Math.max(aStep.offset, bStep.offset) <
          Math.min(aStep.offset + aStep.length, bStep.offset + bStep.length)
      ) {
        const aKeys = formatDeltaKeys(aStep);

        for (const key of formatDeltaKeys(bStep)) {
          if (aKeys.has(key)) return null;
        }
      }
    }
  }

  return { aOtherPrime: aPrime, bOtherPrime: bPrime };
};

const wrapRangesRightToLeft = (
  target: string,
  specs: ReadonlyArray<
    Readonly<{ length: number; node: JsonElementNode; offset: number }>
  >
): WrapInlineStep[] =>
  [...specs]
    .sort((left, right) => right.offset - left.offset)
    .map((spec) => ({
      length: spec.length,
      node: spec.node,
      offset: spec.offset,
      op: 'wrap_inline',
      target,
    }));

const rebaseSharedUnwrapFollowUp = (
  base: JsonEditorValue,
  aSteps: readonly V4Step[],
  bSteps: readonly V4Step[],
  touchedRoots: ReadonlySet<string>,
  options: V4ReplayRebaseOptions
): V4ReplayRebaseResult | null => {
  if (bSteps.length < 2) return null;

  const bLeadingUnwraps: UnwrapInlineStep[] = [];

  for (const step of bSteps) {
    if (step.op !== 'unwrap_inline') break;
    bLeadingUnwraps.push(step);
  }
  if (bLeadingUnwraps.length === 0) return null;

  const target = getDefined(bLeadingUnwraps[0]).parent;

  if (!bLeadingUnwraps.every((step) => step.parent === target)) return null;

  const bUnwrapIds = new Set(bLeadingUnwraps.map((step) => step.id));
  const sharedUnwrapIds = new Set<string>();
  const aOnTarget: Array<DeleteTextStep | FormatTextStep | InsertTextStep> = [];
  const aOther: V4Step[] = [];

  for (const step of aSteps) {
    if (
      step.op === 'unwrap_inline' &&
      step.parent === target &&
      bUnwrapIds.has(step.id)
    ) {
      sharedUnwrapIds.add(step.id);
      continue;
    }
    if (
      (step.op === 'insert_text' ||
        step.op === 'delete_text' ||
        step.op === 'format_text') &&
      step.target === target
    ) {
      aOnTarget.push(step);
      continue;
    }
    aOther.push(step);
  }

  if (sharedUnwrapIds.size === 0) return null;

  const scoped = scopedValueForSteps(base, aSteps, bSteps, touchedRoots);
  const baseElements = indexAllElements(scoped, touchedRoots);
  const unwrappedBaseProps = new Map<string, JsonRecord>();

  for (const sharedId of sharedUnwrapIds) {
    const meta = baseElements.get(sharedId);

    if (meta) unwrappedBaseProps.set(sharedId, nonIdPropsOf(meta.node));
  }

  const remainingUnwraps: UnwrapInlineStep[] = [];
  const survivingWrapSpecs: Array<{
    formats: FormatTextStep[];
    id: string;
    length: number;
    node: JsonElementNode;
    offset: number;
  }> = [];
  const droppedRemnantIds: string[] = [];
  const droppedRemnantSet = new Set<string>();
  const bOther: V4Step[] = [];
  const bTargetWrapIds = new Set<string>();
  const bFormatsByWrapId = new Map<string, FormatTextStep[]>();

  for (const step of bSteps) {
    if (
      step.op === 'unwrap_inline' &&
      step.parent === target &&
      sharedUnwrapIds.has(step.id)
    ) {
      continue;
    }
    if (step.op === 'wrap_inline' && step.target === target) {
      const id = elementIdOf(step.node);
      const nodePropsOnly = nonIdPropsOf(step.node);
      const isPeerRemnant =
        id !== null &&
        [...sharedUnwrapIds].some((sharedId) => {
          if (!isOwnedByInlineId(id, sharedId)) return false;
          const baseProps = unwrappedBaseProps.get(sharedId);

          return baseProps ? jsonEqual(nodePropsOnly, baseProps) : true;
        });

      if (isPeerRemnant && id) {
        droppedRemnantIds.push(id);
        droppedRemnantSet.add(id);
        continue;
      }
      if (id) {
        bTargetWrapIds.add(id);
        survivingWrapSpecs.push({
          formats: [],
          id,
          length: step.length,
          node: cloneJson(step.node),
          offset: step.offset,
        });
      }
      continue;
    }
    if (step.op === 'format_text' && droppedRemnantSet.has(step.target)) {
      continue;
    }
    if (step.op === 'unwrap_inline') {
      remainingUnwraps.push(step);
      continue;
    }
    if (step.op === 'format_text' && bTargetWrapIds.has(step.target)) {
      const list = bFormatsByWrapId.get(step.target) ?? [];

      list.push(step);
      bFormatsByWrapId.set(step.target, list);
      continue;
    }
    bOther.push(step);
  }

  for (const wrap of survivingWrapSpecs) {
    wrap.formats = bFormatsByWrapId.get(wrap.id) ?? [];
  }
  survivingWrapSpecs.sort((left, right) => left.offset - right.offset);

  for (const step of aOther) {
    for (const id of stepReferencedIds(step)) {
      if (
        id === target ||
        bUnwrapIds.has(id) ||
        bTargetWrapIds.has(id) ||
        droppedRemnantSet.has(id)
      ) {
        return null;
      }
    }
  }

  const rebasedOther = rebaseOtherSteps(aOther, bOther);

  if (!rebasedOther) return null;

  const aPrimeTargetSteps: V4Step[] = [];

  if (aOnTarget.length > 0) {
    if (remainingUnwraps.length > 0) return null;

    for (const step of aOnTarget) {
      if (step.op === 'insert_text') {
        const insLen = step.text.length;
        const owner = survivingWrapSpecs.find(
          (w) => w.offset < step.offset && step.offset < w.offset + w.length
        );

        if (owner) {
          const localOff = step.offset - owner.offset;

          aPrimeTargetSteps.push({
            ...(step.marks ? { marks: step.marks } : {}),
            offset: localOff,
            op: 'insert_text',
            target: owner.id,
            text: step.text,
          });
          owner.length += insLen;
          for (const w of survivingWrapSpecs) {
            if (w !== owner && w.offset >= step.offset) w.offset += insLen;
          }
        } else {
          aPrimeTargetSteps.push({
            ...(step.marks ? { marks: step.marks } : {}),
            offset: flatOffsetToWrappedStreamOffset(
              step.offset,
              survivingWrapSpecs
            ),
            op: 'insert_text',
            target,
            text: step.text,
          });
          for (const w of survivingWrapSpecs) {
            if (w.offset >= step.offset) w.offset += insLen;
          }
        }
      } else {
        return null;
      }
    }
  }

  const bPrime: V4Step[] = [
    ...remainingUnwraps,
    ...wrapRangesRightToLeft(
      target,
      survivingWrapSpecs.map((w) => ({
        length: w.length,
        node: w.node,
        offset: w.offset,
      }))
    ),
    ...survivingWrapSpecs.flatMap((w) => w.formats),
    ...rebasedOther.bOtherPrime,
  ];

  const aPrime: V4Step[] = [
    ...droppedRemnantIds.map((id): UnwrapInlineStep => ({
      id,
      op: 'unwrap_inline',
      parent: target,
    })),
    ...aPrimeTargetSteps,
    ...rebasedOther.aOtherPrime,
  ];

  try {
    const afterA = applyV4Steps(scoped, aSteps);
    const afterB = applyV4Steps(scoped, bSteps);
    const mergedA = applyV4Steps(afterA, bPrime);
    const mergedB = applyV4Steps(afterB, aPrime);

    if (!jsonEqual(mergedA, mergedB)) return null;
    if (
      !validateContainersInValue(
        mergedA,
        touchedRoots,
        new Set([target]),
        new Set(),
        options
      )
    ) {
      return null;
    }

    return { aPrime, bPrime, kind: 'steps' };
  } catch {
    return null;
  }
};

const flatOffsetToWrappedStreamOffset = (
  flatOffset: number,
  wraps: ReadonlyArray<Readonly<{ length: number; offset: number }>>
): number => {
  let out = flatOffset;

  for (const wrap of wraps) {
    if (wrap.offset + wrap.length <= flatOffset) {
      out -= wrap.length - 1;
    }
  }

  return out;
};

const rebaseInlineFollowUpEdit = (
  base: JsonEditorValue,
  aSteps: readonly V4Step[],
  bSteps: readonly V4Step[],
  touchedRoots: ReadonlySet<string>,
  options: V4ReplayRebaseOptions
): V4ReplayRebaseResult | null => {
  if (aSteps.length === 0 || bSteps.length < 2) return null;
  if (bSteps[0].op !== 'unwrap_inline') return null;

  const scoped = scopedValueForSteps(base, aSteps, bSteps, touchedRoots);
  const baseElements = indexAllElements(scoped, touchedRoots);
  const bPlan = extractTargetWrapPlan(
    bSteps,
    baseElements,
    options.isSetValued
  );

  if (!bPlan || bPlan.unwrapIds.length === 0) return null;

  const { target } = bPlan;
  const targetMeta = baseElements.get(target);

  if (!targetMeta || !isTextBearingElement(targetMeta.node)) return null;

  const bUnwrapSet = new Set(bPlan.unwrapIds);
  const flatMap = buildFlatStreamAfterUnwraps(targetMeta.node, bUnwrapSet);

  if (!flatMap) return null;

  const aOnTarget: Array<
    | (InsertTextStep & Readonly<{ sourceOwner: string | null }>)
    | (DeleteTextStep & Readonly<{ sourceOwner: string | null }>)
    | (FormatTextStep & Readonly<{ sourceOwner: string | null }>)
    | Extract<V4Step, { op: 'remove_node' | 'set_props' | 'split_node' }>
  > = [];
  const aOther: V4Step[] = [];

  for (const step of aSteps) {
    if (
      step.op === 'insert_text' ||
      step.op === 'delete_text' ||
      step.op === 'format_text'
    ) {
      if (bUnwrapSet.has(step.target)) {
        aOnTarget.push({ ...step, sourceOwner: step.target });
        continue;
      }
      if (step.target === target) {
        aOnTarget.push({ ...step, sourceOwner: null });
        continue;
      }
    }
    if (
      (step.op === 'set_props' || step.op === 'remove_node') &&
      bUnwrapSet.has(step.id)
    ) {
      aOnTarget.push(step);
      continue;
    }
    if (step.op === 'split_node' && step.id === target) {
      aOnTarget.push(step);
      continue;
    }
    for (const id of stepReferencedIds(step)) {
      if (id === target || bUnwrapSet.has(id)) return null;
    }
    aOther.push(step);
  }

  if (aOnTarget.length === 0) return null;

  const rebasedOther = rebaseOtherSteps(aOther, bPlan.otherSteps);

  if (!rebasedOther) return null;

  let mutableWraps = bPlan.wraps.map((wrap) => ({
    formats: wrap.formats.map((fmt) => ({ ...fmt })),
    id: wrap.id,
    length: wrap.length,
    offset: wrap.offset,
    shell: cloneJson(wrap.shell),
  }));
  const activeUnwrapIds = new Set<string>(bPlan.unwrapIds);
  const peerSpans = new Map<string, { length: number; start: number }>();

  for (const [id, span] of flatMap.unwrapSpans) {
    peerSpans.set(id, { length: span.length, start: span.start });
  }

  const preStream = toV4TextStream(targetMeta.node.children).units.map(
    (unit, idx) => ({
      flatLen:
        unit.kind === 'inline' &&
        elementIdOf(unit.node) !== null &&
        bUnwrapSet.has(getDefined(elementIdOf(unit.node)))
          ? getDefined(
              flatMap.unwrapSpans.get(getDefined(elementIdOf(unit.node)))
            ).length
          : 1,
      id: unit.kind === 'inline' ? elementIdOf(unit.node) : null,
      idx,
    })
  );

  const preToCurrentFlat = (preOffset: number): number | null => {
    if (preOffset < 0 || preOffset > preStream.length) return null;
    let sum = 0;

    for (let i = 0; i < preOffset; i += 1) {
      sum += getDefined(preStream[i]).flatLen;
    }

    return sum;
  };

  let activeTarget = target;
  const aPrime: V4Step[] = [];

  for (const step of aOnTarget) {
    if (step.op === 'set_props') {
      const delta: V4PropDelta = {
        ...(step.add ? { add: step.add } : {}),
        ...(step.remove ? { remove: step.remove } : {}),
        ...(step.set ? { set: step.set } : {}),
        ...(step.unset ? { unset: step.unset } : {}),
      };

      for (const wrap of mutableWraps) {
        if (!isOwnedByInlineId(wrap.id, step.id)) continue;
        const nextProps = applyPropDeltaToRecord(nodeProps(wrap.shell), delta);

        wrap.shell = { ...nextProps, children: [], id: wrap.id };
        aPrime.push({ ...step, id: wrap.id });
      }
      continue;
    }

    if (step.op === 'split_node') {
      if (aOnTarget.length !== 1 || activeTarget !== target) return null;
      const flatSplitAt = preToCurrentFlat(step.at);

      if (flatSplitAt === null) return null;

      let minStart = Number.POSITIVE_INFINITY;
      let maxEnd = Number.NEGATIVE_INFINITY;

      for (const wrap of mutableWraps) {
        if (wrap.offset < minStart) minStart = wrap.offset;
        if (wrap.offset + wrap.length > maxEnd) {
          maxEnd = wrap.offset + wrap.length;
        }
      }

      if (flatSplitAt <= minStart) {
        const wrappedSplitAt = flatOffsetToWrappedStreamOffset(
          flatSplitAt,
          mutableWraps
        );

        for (const wrap of mutableWraps) {
          wrap.offset -= flatSplitAt;
        }
        activeTarget = step.newId;
        aPrime.push({ ...step, at: wrappedSplitAt });
        continue;
      }

      if (flatSplitAt >= maxEnd) {
        const wrappedSplitAt = flatOffsetToWrappedStreamOffset(
          flatSplitAt,
          mutableWraps
        );

        aPrime.push({ ...step, at: wrappedSplitAt });
        continue;
      }

      return { kind: 'drop-all' };
    }

    if (step.op === 'remove_node') {
      const span = peerSpans.get(step.id);

      if (!span) return null;
      const dStart = span.start;
      const dLen = span.length;
      const dEnd = dStart + dLen;
      const nextWraps: typeof mutableWraps = [];

      for (const wrap of mutableWraps) {
        const wStart = wrap.offset;
        const wEnd = wStart + wrap.length;

        if (wEnd <= dStart) {
          nextWraps.push(wrap);
          continue;
        }
        if (wStart >= dEnd) {
          wrap.offset -= dLen;
          nextWraps.push(wrap);
          continue;
        }
        const ovStart = Math.max(wStart, dStart);
        const ovEnd = Math.min(wEnd, dEnd);
        const ovLen = ovEnd - ovStart;

        if (ovLen >= wrap.length) {
          aPrime.push({ id: wrap.id, op: 'remove_node' });
          continue;
        }
        const localStart = ovStart - wStart;

        for (let f = 0; f < wrap.formats.length; f += 1) {
          const fmt = getDefined(wrap.formats[f]);
          const fEnd = fmt.offset + fmt.length;

          if (localStart + ovLen <= fmt.offset) {
            wrap.formats[f] = { ...fmt, offset: fmt.offset - ovLen };
          } else if (localStart < fEnd) {
            return null;
          }
        }
        aPrime.push({
          length: ovLen,
          offset: localStart,
          op: 'delete_text',
          target: wrap.id,
        });
        wrap.offset = wStart < dStart ? wStart : dStart;
        wrap.length -= ovLen;
        nextWraps.push(wrap);
      }

      mutableWraps = nextWraps;
      activeUnwrapIds.delete(step.id);
      peerSpans.delete(step.id);
      for (const otherSpan of peerSpans.values()) {
        if (otherSpan.start >= dEnd) otherSpan.start -= dLen;
      }
      const preIdx = preStream.findIndex((u) => u.id === step.id);

      if (preIdx !== -1) preStream.splice(preIdx, 1);

      const hasNonPeerWrap = mutableWraps.some(
        (w) =>
          ![...bUnwrapSet].some((peerId) => isOwnedByInlineId(w.id, peerId))
      );

      if (!hasNonPeerWrap) return { kind: 'drop-all' };
      continue;
    }

    let flatOffset: number;

    if (step.sourceOwner !== null) {
      const span = peerSpans.get(step.sourceOwner);

      if (!span) return null;
      flatOffset = span.start + step.offset;
    } else {
      const mapped = preToCurrentFlat(step.offset);

      if (mapped === null) return null;
      flatOffset = mapped;
    }

    if (step.op === 'insert_text') {
      const insLen = step.text.length;
      let ownerIdx = mutableWraps.findIndex(
        (w) => w.offset < flatOffset && flatOffset < w.offset + w.length
      );

      if (ownerIdx === -1 && step.sourceOwner !== null) {
        const ownerPeer = step.sourceOwner;

        ownerIdx = mutableWraps.findIndex(
          (w) =>
            isOwnedByInlineId(w.id, ownerPeer) &&
            w.offset <= flatOffset &&
            flatOffset <= w.offset + w.length
        );
        if (ownerIdx === -1) {
          ownerIdx = mutableWraps.findIndex(
            (w) => w.offset <= flatOffset && flatOffset <= w.offset + w.length
          );
        }
      }

      if (ownerIdx !== -1) {
        const owner = getDefined(mutableWraps[ownerIdx]);
        const localOff = flatOffset - owner.offset;

        aPrime.push({
          ...(step.marks ? { marks: step.marks } : {}),
          offset: localOff,
          op: 'insert_text',
          target: owner.id,
          text: step.text,
        });
        for (let k = 0; k < owner.formats.length; k += 1) {
          const fmt = getDefined(owner.formats[k]);

          if (localOff <= fmt.offset) {
            owner.formats[k] = { ...fmt, offset: fmt.offset + insLen };
          } else if (localOff < fmt.offset + fmt.length) {
            owner.formats[k] = { ...fmt, length: fmt.length + insLen };
          }
        }
        owner.length += insLen;
        for (let k = ownerIdx + 1; k < mutableWraps.length; k += 1) {
          getDefined(mutableWraps[k]).offset += insLen;
        }
      } else {
        const wrappedOff = flatOffsetToWrappedStreamOffset(
          flatOffset,
          mutableWraps
        );

        aPrime.push({
          ...(step.marks ? { marks: step.marks } : {}),
          offset: wrappedOff,
          op: 'insert_text',
          target: activeTarget,
          text: step.text,
        });
        for (const wrap of mutableWraps) {
          if (wrap.offset >= flatOffset) wrap.offset += insLen;
        }
      }

      if (step.sourceOwner !== null) {
        for (const [peerId, span] of peerSpans) {
          if (peerId === step.sourceOwner) {
            span.length += insLen;
          } else if (span.start >= flatOffset) {
            span.start += insLen;
          }
        }
        const entry = preStream.find((u) => u.id === step.sourceOwner);

        if (entry) entry.flatLen += insLen;
      } else {
        for (const span of peerSpans.values()) {
          if (span.start >= flatOffset) span.start += insLen;
        }
        const insertedEntries = Array.from({ length: insLen }, () => ({
          flatLen: 1,
          id: null,
          idx: -1,
        }));

        preStream.splice(step.offset, 0, ...insertedEntries);
      }
      continue;
    }

    if (step.op === 'format_text') {
      const fStart = flatOffset;
      let fLen = step.length;

      if (step.sourceOwner === null) {
        const endFlat = preToCurrentFlat(step.offset + step.length);

        if (endFlat === null) return null;
        fLen = endFlat - fStart;
      }

      const fEnd = fStart + fLen;
      let cursor = fStart;

      for (const wrap of mutableWraps) {
        const wStart = wrap.offset;
        const wEnd = wrap.offset + wrap.length;

        if (wEnd <= cursor) continue;
        if (wStart >= fEnd) break;
        if (cursor < wStart) {
          const gapEnd = Math.min(wStart, fEnd);
          const gapFmt = clampFormatToRange(
            step,
            fStart - step.offset,
            cursor,
            gapEnd,
            activeTarget,
            flatOffsetToWrappedStreamOffset(cursor, mutableWraps)
          );

          if (gapFmt) aPrime.push(gapFmt);
          cursor = gapEnd;
        }

        const ovEnd = Math.min(wEnd, fEnd);
        const innerFmts = clampFormatExcluding(
          step,
          fStart - step.offset,
          cursor,
          ovEnd,
          wrap.id,
          cursor - wStart,
          wrap.formats,
          wStart
        );

        aPrime.push(...innerFmts);
        cursor = ovEnd;
      }

      if (cursor < fEnd) {
        const tailFmt = clampFormatToRange(
          step,
          fStart - step.offset,
          cursor,
          fEnd,
          activeTarget,
          flatOffsetToWrappedStreamOffset(cursor, mutableWraps)
        );

        if (tailFmt) aPrime.push(tailFmt);
      }
      continue;
    }

    if (step.op === 'delete_text') {
      const dStart = flatOffset;
      let dLen = step.length;

      if (step.sourceOwner === null) {
        for (let k = step.offset; k < step.offset + step.length; k += 1) {
          const entry = preStream[k];

          if (!entry || (entry.id && bUnwrapSet.has(entry.id))) return null;
        }
        const endFlat = preToCurrentFlat(step.offset + step.length);

        if (endFlat === null) return null;
        dLen = endFlat - dStart;
      }

      const dEnd = dStart + dLen;
      let cursor = dStart;
      let removedFromFlat = 0;
      const survivingWraps: typeof mutableWraps = [];

      for (const wrap of mutableWraps) {
        const wStart = wrap.offset;
        const wEnd = wStart + wrap.length;

        if (wEnd <= cursor) {
          survivingWraps.push(wrap);
          continue;
        }
        if (wStart >= dEnd) {
          wrap.offset -= dLen;
          survivingWraps.push(wrap);
          continue;
        }

        if (cursor < wStart) {
          const gapEnd = Math.min(wStart, dEnd);
          const gapLen = gapEnd - cursor;
          const wrappedOff = flatOffsetToWrappedStreamOffset(
            cursor - removedFromFlat,
            survivingWraps
          );

          aPrime.push({
            length: gapLen,
            offset: wrappedOff,
            op: 'delete_text',
            target: activeTarget,
          });
          removedFromFlat += gapLen;
          cursor = gapEnd;
        }

        const ovStart = Math.max(cursor, wStart);
        const ovEnd = Math.min(wEnd, dEnd);
        const ovLen = ovEnd - ovStart;

        if (ovLen >= wrap.length) {
          aPrime.push({ id: wrap.id, op: 'remove_node' });
          removedFromFlat += ovLen;
          cursor = ovEnd;
          continue;
        }

        const localStart = ovStart - wStart;

        for (let f = 0; f < wrap.formats.length; f += 1) {
          const fmt = getDefined(wrap.formats[f]);
          const fEnd = fmt.offset + fmt.length;

          if (localStart + ovLen <= fmt.offset) {
            wrap.formats[f] = { ...fmt, offset: fmt.offset - ovLen };
          } else if (localStart < fEnd) {
            return null;
          }
        }

        aPrime.push({
          length: ovLen,
          offset: localStart,
          op: 'delete_text',
          target: wrap.id,
        });
        wrap.offset = wStart - removedFromFlat;
        wrap.length -= ovLen;
        survivingWraps.push(wrap);
        removedFromFlat += ovLen;
        cursor = ovEnd;
      }

      mutableWraps = survivingWraps;

      if (cursor < dEnd) {
        const tailLen = dEnd - cursor;
        const wrappedOff = flatOffsetToWrappedStreamOffset(
          cursor - removedFromFlat,
          mutableWraps
        );

        aPrime.push({
          length: tailLen,
          offset: wrappedOff,
          op: 'delete_text',
          target: activeTarget,
        });
      }

      if (step.sourceOwner !== null) {
        for (const [peerId, span] of peerSpans) {
          if (peerId === step.sourceOwner) {
            span.length -= dLen;
          } else if (span.start >= dEnd) {
            span.start -= dLen;
          }
        }
        const entry = preStream.find((u) => u.id === step.sourceOwner);

        if (entry) entry.flatLen -= dLen;
      } else {
        for (const span of peerSpans.values()) {
          if (span.start >= dEnd) span.start -= dLen;
        }
        preStream.splice(step.offset, step.length);
      }

      const hasNonPeerWrap = mutableWraps.some(
        (w) =>
          ![...bUnwrapSet].some((peerId) => isOwnedByInlineId(w.id, peerId))
      );

      if (!hasNonPeerWrap) return { kind: 'drop-all' };
    }
  }

  aPrime.push(...rebasedOther.aOtherPrime);

  const bPrime: V4Step[] = [
    ...[...activeUnwrapIds].map((id): UnwrapInlineStep => ({
      id,
      op: 'unwrap_inline',
      parent: activeTarget,
    })),
    ...wrapRangesRightToLeft(
      activeTarget,
      mutableWraps.map((w) => ({
        length: w.length,
        node: w.shell,
        offset: w.offset,
      }))
    ),
    ...mutableWraps.flatMap((w) => w.formats),
    ...rebasedOther.bOtherPrime,
  ];

  const changedContainers = new Set<string>([
    activeTarget,
    ...mutableWraps.map((w) => w.id),
  ]);

  try {
    const afterA = applyV4Steps(scoped, aSteps);
    const afterB = applyV4Steps(scoped, bSteps);
    const mergedA = applyV4Steps(afterA, bPrime);
    const mergedB = applyV4Steps(afterB, aPrime);

    if (!jsonEqual(mergedA, mergedB)) return null;
    if (
      !validateContainersInValue(
        mergedA,
        touchedRoots,
        changedContainers,
        new Set(),
        options
      )
    ) {
      return null;
    }

    return { aPrime, bPrime, kind: 'steps' };
  } catch {
    return null;
  }
};

const subtractIntervals = (
  start: number,
  end: number,
  cutters: ReadonlyArray<Readonly<{ end: number; start: number }>>
): Array<Readonly<{ end: number; start: number }>> => {
  let pieces: Array<Readonly<{ end: number; start: number }>> = [
    { end, start },
  ];

  for (const cut of cutters) {
    const next: Array<Readonly<{ end: number; start: number }>> = [];

    for (const piece of pieces) {
      if (cut.end <= piece.start || cut.start >= piece.end) {
        next.push(piece);
        continue;
      }
      if (piece.start < cut.start) {
        next.push({ end: cut.start, start: piece.start });
      }
      if (cut.end < piece.end) {
        next.push({ end: piece.end, start: cut.end });
      }
    }
    pieces = next;
  }

  return pieces;
};

const rebaseOverlappingInlineWrap = (
  base: JsonEditorValue,
  aSteps: readonly V4Step[],
  bSteps: readonly V4Step[],
  touchedRoots: ReadonlySet<string>,
  options: V4ReplayRebaseOptions
): V4ReplayRebaseResult | null => {
  const sharedUnwrap = rebaseSharedUnwrapFollowUp(
    base,
    aSteps,
    bSteps,
    touchedRoots,
    options
  );

  if (sharedUnwrap) return sharedUnwrap;

  const inlineFollowUp = rebaseInlineFollowUpEdit(
    base,
    aSteps,
    bSteps,
    touchedRoots,
    options
  );

  if (inlineFollowUp) return inlineFollowUp;

  const { canContain, isSetValued, pieceProps } = options;

  if (!canContain) return null;

  const scoped = scopedValueForSteps(base, aSteps, bSteps, touchedRoots);
  const baseElements = indexAllElements(scoped, touchedRoots);
  const aPlan = extractTargetWrapPlan(aSteps, baseElements, isSetValued, true);
  const bPlan = extractTargetWrapPlan(bSteps, baseElements, isSetValued, false);

  if (!aPlan || !bPlan || aPlan.target !== bPlan.target) return null;
  if (aPlan.preTargetInserts.length > 0 && bPlan.unwrapIds.length > 0) {
    return null;
  }

  const { target } = aPlan;
  const targetMeta = baseElements.get(target);

  if (!targetMeta || !isTextBearingElement(targetMeta.node)) return null;

  const rebasedOther = rebaseOtherSteps(aPlan.otherSteps, bPlan.otherSteps);

  if (!rebasedOther) return null;

  const commonUnwrapIds = new Set<string>([
    ...aPlan.unwrapIds,
    ...bPlan.unwrapIds,
  ]);
  const aUnwrapSet = new Set(aPlan.unwrapIds);
  const bUnwrapSet = new Set(bPlan.unwrapIds);

  let effectiveTargetNode = targetMeta.node;
  const aPrimePreInserts: InsertTextStep[] = [];
  let shiftedBWraps: WrapPiece[] = bPlan.wraps.map((w) => ({ ...w }));

  if (aPlan.preTargetInserts.length > 0) {
    const miniBase: JsonEditorValue = { children: [targetMeta.node] };

    try {
      const afterInserts = applyV4Steps(miniBase, aPlan.preTargetInserts);
      const updated = afterInserts.children[0];

      if (!updated || !isElementNode(updated)) return null;
      effectiveTargetNode = updated;
    } catch {
      return null;
    }

    const mutableB = shiftedBWraps.map((w) => ({
      formats: [...w.formats],
      id: w.id,
      length: w.length,
      offset: w.offset,
      shell: w.shell,
    }));

    for (const ins of aPlan.preTargetInserts) {
      const owner = mutableB.find(
        (w) => w.offset < ins.offset && ins.offset < w.offset + w.length
      );

      if (owner) {
        const localOff = ins.offset - owner.offset;

        aPrimePreInserts.push({
          ...(ins.marks ? { marks: ins.marks } : {}),
          offset: localOff,
          op: 'insert_text',
          target: owner.id,
          text: ins.text,
        });
        for (let k = 0; k < owner.formats.length; k += 1) {
          const fmt = getDefined(owner.formats[k]);

          if (localOff <= fmt.offset) {
            owner.formats[k] = { ...fmt, offset: fmt.offset + ins.text.length };
          } else if (localOff < fmt.offset + fmt.length) {
            owner.formats[k] = { ...fmt, length: fmt.length + ins.text.length };
          }
        }
        owner.length += ins.text.length;
        for (const w of mutableB) {
          if (w !== owner && w.offset >= ins.offset) {
            w.offset += ins.text.length;
          }
        }
      } else {
        const wrappedOff = flatOffsetToWrappedStreamOffset(
          ins.offset,
          mutableB
        );

        aPrimePreInserts.push({
          ...(ins.marks ? { marks: ins.marks } : {}),
          offset: wrappedOff,
          op: 'insert_text',
          target,
          text: ins.text,
        });
        for (const w of mutableB) {
          if (w.offset >= ins.offset) w.offset += ins.text.length;
        }
      }
    }
    shiftedBWraps = mutableB;
  }

  const commonFlat = buildFlatStreamAfterUnwraps(
    effectiveTargetNode,
    commonUnwrapIds
  );

  if (!commonFlat) return null;

  const mapPlanWrapsToCommonFlat = (
    wraps: readonly WrapPiece[],
    sideUnwraps: ReadonlySet<string>
  ): WrapPiece[] | null => {
    if (sideUnwraps.size === commonUnwrapIds.size) {
      return [...wraps];
    }

    const sideFlat = buildFlatStreamAfterUnwraps(
      effectiveTargetNode,
      sideUnwraps
    );

    if (!sideFlat) return null;

    const sideToCommon: number[] = [];
    let commonCursor = 0;

    for (const unit of sideFlat.flatUnits) {
      sideToCommon.push(commonCursor);
      if (unit.kind === 'inline') {
        const id = elementIdOf(unit.node);

        if (id && commonUnwrapIds.has(id) && !sideUnwraps.has(id)) {
          const span = commonFlat.unwrapSpans.get(id);

          if (!span) return null;
          commonCursor += span.length;
          continue;
        }
      }
      commonCursor += 1;
    }
    sideToCommon.push(commonCursor);

    const mapped: WrapPiece[] = [];

    for (const wrap of wraps) {
      for (let pos = wrap.offset; pos < wrap.offset + wrap.length; pos += 1) {
        const unit = sideFlat.flatUnits[pos];

        if (unit?.kind === 'inline') {
          const id = elementIdOf(unit.node);

          if (id && commonUnwrapIds.has(id) && !sideUnwraps.has(id)) {
            return null;
          }
        }
      }

      const start = getDefined(sideToCommon[wrap.offset]);
      const end = getDefined(sideToCommon[wrap.offset + wrap.length]);

      if (end - start !== wrap.length) return null;
      mapped.push({ ...wrap, offset: start });
    }

    return mapped;
  };

  const aWraps = mapPlanWrapsToCommonFlat(aPlan.wraps, aUnwrapSet);
  const bWraps = mapPlanWrapsToCommonFlat(shiftedBWraps, bUnwrapSet);

  if (!aWraps || !bWraps) return null;

  const overlappingAIndices = new Set<number>();

  for (let i = 0; i < aWraps.length; i += 1) {
    const aWrap = getDefined(aWraps[i]);
    const aStart = aWrap.offset;
    const aEnd = aStart + aWrap.length;

    for (const bWrap of bWraps) {
      const bStart = bWrap.offset;
      const bEnd = bStart + bWrap.length;

      if (Math.max(aStart, bStart) < Math.min(aEnd, bEnd)) {
        if (
          canContain(aWrap.shell, bWrap.shell) ||
          canContain(bWrap.shell, aWrap.shell)
        ) {
          return null;
        }
        overlappingAIndices.add(i);
      }
    }
  }

  if (overlappingAIndices.size === 0) return null;

  let afterA: JsonEditorValue;
  let afterB: JsonEditorValue;

  try {
    afterA = applyV4Steps(scoped, aSteps);
    afterB = applyV4Steps(scoped, bSteps);
  } catch {
    return null;
  }

  const liveIds = new Set<string>([
    ...baseElements.keys(),
    ...indexAllElements(afterA, touchedRoots).keys(),
    ...indexAllElements(afterB, touchedRoots).keys(),
  ]);

  const bCutters = bWraps.map((w) => ({
    end: w.offset + w.length,
    start: w.offset,
  }));
  const untouchedAWraps: WrapPiece[] = [];
  const overlappingAWraps: WrapPiece[] = [];

  for (let i = 0; i < aWraps.length; i += 1) {
    const aWrap = getDefined(aWraps[i]);

    if (overlappingAIndices.has(i)) overlappingAWraps.push(aWrap);
    else untouchedAWraps.push(aWrap);
  }

  const changedContainers = new Set<string>([
    target,
    ...bWraps.map((w) => w.id),
  ]);
  const remnantPieces: Array<
    Readonly<{
      length: number;
      node: JsonElementNode;
      offset: number;
      sourceWrap: WrapPiece;
    }>
  > = [];

  for (const aWrap of overlappingAWraps) {
    const pieces = subtractIntervals(
      aWrap.offset,
      aWrap.offset + aWrap.length,
      bCutters
    );

    for (let idx = 0; idx < pieces.length; idx += 1) {
      const piece = getDefined(pieces[idx]);
      let node: JsonElementNode;

      if (idx === 0) {
        node = cloneJson(aWrap.shell);
        changedContainers.add(aWrap.id);
      } else {
        const splitId = uniqueSplitId(aWrap.id, liveIds, options.hasIdInDoc);
        const splitBaseProps = pieceProps
          ? pieceProps(
              aWrap.shell,
              targetMeta.path,
              targetMeta.root,
              rootNodesIn(scoped, targetMeta.root)
            )
          : nonIdPropsOf(aWrap.shell);

        node = {
          ...cloneJson(splitBaseProps),
          children: [],
          id: splitId,
        };
        changedContainers.add(splitId);
      }

      remnantPieces.push({
        length: piece.end - piece.start,
        node,
        offset: piece.start,
        sourceWrap: aWrap,
      });
    }
  }

  const bPrimeUnwraps: UnwrapInlineStep[] = [];
  const emittedUnwraps = new Set<string>();

  for (const id of bPlan.unwrapIds) {
    if (aUnwrapSet.has(id) || emittedUnwraps.has(id)) continue;
    emittedUnwraps.add(id);
    bPrimeUnwraps.push({ id, op: 'unwrap_inline', parent: target });
  }
  for (const aWrap of overlappingAWraps) {
    if (emittedUnwraps.has(aWrap.id)) continue;
    emittedUnwraps.add(aWrap.id);
    bPrimeUnwraps.push({ id: aWrap.id, op: 'unwrap_inline', parent: target });
  }

  const bPrimeWrapSpecs: Array<
    Readonly<{ length: number; node: JsonElementNode; offset: number }>
  > = [
    ...bWraps.map((w) => ({
      length: w.length,
      node: cloneJson(w.shell),
      offset: flatOffsetToWrappedStreamOffset(w.offset, untouchedAWraps),
    })),
    ...remnantPieces.map((piece) => ({
      length: piece.length,
      node: cloneJson(piece.node),
      offset: flatOffsetToWrappedStreamOffset(piece.offset, untouchedAWraps),
    })),
  ];

  const bPrime: V4Step[] = [
    ...bPrimeUnwraps,
    ...wrapRangesRightToLeft(target, bPrimeWrapSpecs),
    ...bWraps.flatMap((w) =>
      w.formats.map((fmt) => ({ ...fmt, target: w.id }))
    ),
    ...rebasedOther.bOtherPrime,
  ];

  const aPrime: V4Step[] = [];

  for (const id of aPlan.unwrapIds) {
    if (!bUnwrapSet.has(id)) {
      aPrime.push({ id, op: 'unwrap_inline', parent: target });
    }
  }
  aPrime.push(...aPrimePreInserts);

  for (const aWrap of overlappingAWraps) {
    for (const fmt of aWrap.formats) {
      for (const bWrap of bWraps) {
        const bStart = bWrap.offset;
        const bEnd = bWrap.offset + bWrap.length;
        const innerFmts = clampFormatExcluding(
          fmt,
          aWrap.offset,
          bStart,
          bEnd,
          bWrap.id,
          0,
          bWrap.formats,
          bStart
        );

        aPrime.push(...innerFmts);
      }
      for (const piece of remnantPieces) {
        if (piece.sourceWrap !== aWrap) continue;
        const onRemnant = clampFormatToRange(
          fmt,
          aWrap.offset,
          piece.offset,
          piece.offset + piece.length,
          target,
          flatOffsetToWrappedStreamOffset(piece.offset, bWraps)
        );

        if (onRemnant) aPrime.push(onRemnant);
      }
    }
  }

  const aPrimeWrapSpecs: Array<
    Readonly<{ length: number; node: JsonElementNode; offset: number }>
  > = [
    ...untouchedAWraps.map((w) => ({
      length: w.length,
      node: cloneJson(w.shell),
      offset: flatOffsetToWrappedStreamOffset(w.offset, bWraps),
    })),
    ...remnantPieces.map((piece) => ({
      length: piece.length,
      node: cloneJson(piece.node),
      offset: flatOffsetToWrappedStreamOffset(piece.offset, bWraps),
    })),
  ];

  aPrime.push(
    ...wrapRangesRightToLeft(target, aPrimeWrapSpecs),
    ...untouchedAWraps.flatMap((w) =>
      w.formats.map((fmt) => ({ ...fmt, target: w.id }))
    ),
    ...rebasedOther.aOtherPrime
  );

  try {
    const mergedA = applyV4Steps(afterA, bPrime);
    const mergedB = applyV4Steps(afterB, aPrime);

    if (!jsonEqual(mergedA, mergedB)) return null;
    if (
      !validateContainersInValue(
        mergedA,
        touchedRoots,
        changedContainers,
        new Set(),
        options
      )
    ) {
      return null;
    }

    return { aPrime, bPrime, kind: 'steps' };
  } catch {
    return null;
  }
};

export const hasV4ReplayCandidateSteps = (
  aSteps: readonly V4Step[],
  bSteps: readonly V4Step[]
): boolean => {
  let aRemove = false;
  let bRemove = false;
  let aJoin = false;
  let bJoin = false;
  let aInsert = false;
  let aMove = false;
  let bMove = false;
  let aInlineWrap = false;
  let bInlineWrap = false;
  let aUnwrap = false;
  let bUnwrap = false;
  let aFollowUpOnInline = false;

  for (const step of aSteps) {
    if (step.op === 'remove_node') aRemove = true;
    else if (step.op === 'join_nodes') aJoin = true;
    else if (step.op === 'insert_node') {
      aInsert = true;
      if ('id' in step.to) aInlineWrap = true;
    } else if (step.op === 'move_node') aMove = true;
    else if (step.op === 'wrap_inline') aInlineWrap = true;
    else if (step.op === 'unwrap_inline') aUnwrap = true;
    else if (
      step.op === 'insert_text' ||
      step.op === 'delete_text' ||
      step.op === 'format_text' ||
      step.op === 'set_props' ||
      step.op === 'split_node'
    ) {
      aFollowUpOnInline = true;
    }
  }

  for (const step of bSteps) {
    if (step.op === 'remove_node') bRemove = true;
    else if (step.op === 'join_nodes') bJoin = true;
    else if (step.op === 'move_node') bMove = true;
    else if (step.op === 'wrap_inline') bInlineWrap = true;
    else if (step.op === 'unwrap_inline') bUnwrap = true;
    else if (step.op === 'insert_node' && 'id' in step.to) bInlineWrap = true;
  }

  return (
    aRemove ||
    (bRemove && aJoin) ||
    (bJoin && ((aInsert && aMove) || bMove)) ||
    (aInlineWrap && bInlineWrap) ||
    (bUnwrap && (aUnwrap || aInlineWrap || aFollowUpOnInline))
  );
};

export const rebaseV4ForReplay = (
  base: JsonEditorValue,
  aSteps: readonly V4Step[],
  bSteps: readonly V4Step[],
  touchedRoots: ReadonlySet<string>,
  options: V4ReplayRebaseOptions = {}
): V4ReplayRebaseResult | null => {
  if (touchedRoots.size === 0) return null;
  if (!hasV4ReplayCandidateSteps(aSteps, bSteps)) return null;

  const joinedOverRemove = rebaseJoinOverSiblingRemoval(
    base,
    aSteps,
    bSteps,
    touchedRoots,
    options
  );

  if (joinedOverRemove) return joinedOverRemove;

  const deletedTarget = rebaseOverDeletedTarget(
    base,
    aSteps,
    bSteps,
    touchedRoots,
    options
  );

  if (deletedTarget) return deletedTarget;

  if (
    aSteps.some((step) => step.op === 'split_node') &&
    aSteps.some((step) => step.op === 'remove_node') &&
    !aSteps.some((step) => step.op === 'insert_text') &&
    bSteps.length > 0 &&
    bSteps.every(isFilterableReplayStep)
  ) {
    const scoped = scopedValueForSteps(base, aSteps, bSteps, touchedRoots);
    const rebased = rebaseV4Changes(scoped, aSteps, bSteps);

    if (rebased.ok) {
      if (rebased.bPrime.length === 0) return { kind: 'drop-all' };

      const changedContainers = new Set<string>();

      for (const step of rebased.bPrime) {
        for (const id of stepReferencedIds(step)) changedContainers.add(id);
      }
      if (
        validateContainersInValue(
          rebased.after,
          touchedRoots,
          changedContainers,
          new Set(),
          options
        )
      ) {
        return {
          aPrime: rebased.aPrime,
          bPrime: rebased.bPrime,
          kind: 'steps',
        };
      }
    } else if (rebased.reason === 'target-deleted') {
      return { kind: 'drop-all' };
    }
  }

  const joinedAcrossWrap = rebaseJoinAcrossWrap(
    base,
    aSteps,
    bSteps,
    touchedRoots,
    options
  );

  if (joinedAcrossWrap) return joinedAcrossWrap;

  const overlappingWrap = rebaseOverlappingInlineWrap(
    base,
    aSteps,
    bSteps,
    touchedRoots,
    options
  );

  if (overlappingWrap) return overlappingWrap;

  if (
    bSteps.length >= 2 &&
    bSteps[0].op === 'unwrap_inline' &&
    bSteps.some((step) => step.op === 'wrap_inline')
  ) {
    const unwrapIds = new Set<string>();
    const target = bSteps[0].parent;

    for (const step of bSteps) {
      if (step.op !== 'unwrap_inline') break;
      unwrapIds.add(step.id);
    }
    const touchesRewrittenInline = aSteps.some((step) => {
      if (
        step.op === 'delete_text' ||
        step.op === 'split_node' ||
        step.op === 'remove_node' ||
        step.op === 'set_props'
      ) {
        return stepReferencedIds(step).some(
          (id) => id === target || unwrapIds.has(id)
        );
      }

      return false;
    });

    if (touchesRewrittenInline) return { kind: 'drop-all' };
  }

  return null;
};
