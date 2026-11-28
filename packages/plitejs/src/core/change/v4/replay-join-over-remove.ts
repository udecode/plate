import {
  isElementNode,
  type JsonEditorValue,
  type JsonElementNode,
  type JsonNode,
} from '../tokens';
import { applyV4Steps } from './apply';
import { extractV4Between } from './extract';
import type { V4Place, V4Step } from './types';

const findElementById = (
  nodes: readonly JsonNode[],
  id: string
): JsonElementNode | null => {
  for (const node of nodes) {
    if (!isElementNode(node)) continue;
    if (node.id === id) return node;
    const nested = findElementById(node.children, id);

    if (nested) return nested;
  }

  return null;
};

const childCountAtPlace = (value: JsonEditorValue, place: V4Place): number => {
  if ('root' in place) {
    const rootChildren =
      place.root === 'main' ? value.children : value.roots?.[place.root];

    return rootChildren?.length ?? 0;
  }

  const parent = findElementById(value.children, place.id);

  if (parent) return parent.children.length;

  for (const rootChildren of Object.values(value.roots ?? {})) {
    const inRoot = findElementById(rootChildren, place.id);

    if (inRoot) return inRoot.children.length;
  }

  return 0;
};

const clampPlace = (value: JsonEditorValue, place: V4Place): V4Place => {
  if (!('index' in place)) return place;
  const max = childCountAtPlace(value, place);
  const index = Math.max(0, Math.min(place.index, max));

  return index === place.index ? place : { ...place, index };
};

const rewriteJoinEditOverRemoval = (
  base: JsonEditorValue,
  afterRemoval: JsonEditorValue,
  editSteps: readonly V4Step[],
  removedIds: ReadonlySet<string>
): V4Step[] | null => {
  const touchesRemovedJoin = editSteps.some(
    (step) =>
      step.op === 'join_nodes' &&
      ((removedIds.has(step.target) && !removedIds.has(step.source)) ||
        (removedIds.has(step.source) && !removedIds.has(step.target)))
  );

  if (!touchesRemovedJoin) return null;

  const survivorOf = new Map<string, string>();
  const movedIds = new Set<string>();
  const kept: V4Step[] = [];
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
        if ('id' in step.to && removedIds.has(step.to.id)) return null;
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
        if (removedIds.has(step.id)) continue;
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

  return kept.length > 0 && current !== base ? kept : null;
};

export const rebaseV4JoinOverSiblingRemoval = (
  base: JsonEditorValue,
  aSteps: readonly V4Step[],
  bSteps: readonly V4Step[]
): Readonly<{
  aPrime: readonly V4Step[];
  bPrime: readonly V4Step[];
}> | null => {
  for (const [removalSteps, editSteps, side] of [
    [aSteps, bSteps, 'a'],
    [bSteps, aSteps, 'b'],
  ] as const) {
    if (
      removalSteps.length === 0 ||
      !removalSteps.every((step) => step.op === 'remove_node')
    ) {
      continue;
    }

    const removedIds = new Set(removalSteps.map((step) => step.id));
    const afterRemoval = applyV4Steps(base, removalSteps);
    let kept: V4Step[] | null;

    try {
      kept = rewriteJoinEditOverRemoval(
        base,
        afterRemoval,
        editSteps,
        removedIds
      );
    } catch {
      continue;
    }

    if (!kept) continue;

    const merged = applyV4Steps(afterRemoval, kept);
    const afterEdit = applyV4Steps(base, editSteps);
    const removalPrime = extractV4Between(afterEdit, merged);

    return side === 'a'
      ? { aPrime: removalPrime, bPrime: kept }
      : { aPrime: kept, bPrime: removalPrime };
  }

  return null;
};
