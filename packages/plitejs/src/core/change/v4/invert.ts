import { getDefined } from '../../../internal/get-defined';
import {
  getRecordSetVersion,
  getValueRecords,
  readRecord,
} from '../../record-store';
import { DocumentIndex, rootIndexOf } from '../document-index';
import { cloneJson, isRecord, jsonEqual, type JsonRecord } from '../json';
import { lazyRootOf } from '../lazy-root';
import {
  isElementNode,
  type JsonEditorValue,
  type JsonElementNode,
  nodeProps,
} from '../tokens';
import {
  applyV4StepToState,
  createMutableV4State,
  elementStreamLength,
  indexSubtree,
  isTextBearingElement,
  type MutableV4State,
  toV4TextStream,
  type V4TextUnit,
} from './apply';
import { getValueIdLookup, type ValueIdLookup } from './lower';
import {
  invertPropDelta,
  isEmptyPropDelta,
  type V4Place,
  type V4Step,
} from './types';

const inlineOffsetInParent = (
  parent: JsonElementNode,
  childId: string
): number => {
  const stream = toV4TextStream(parent.children);
  const index = stream.units.findIndex(
    (unit) => unit.kind === 'inline' && unit.node.id === childId
  );

  if (index === -1) {
    throw new Error(`Missing inline child "${childId}" in parent.`);
  }

  return index;
};

const placeOfLocated = (state: MutableV4State, id: string): V4Place => {
  const loc = state.idMap.get(id);

  if (!loc) {
    throw new Error(`Missing element "${id}" while inverting v4 step.`);
  }
  if (loc.parent === null) {
    return { index: loc.index, root: loc.root };
  }
  if (isTextBearingElement(loc.parent)) {
    return {
      id: loc.parent.id as string,
      offset: inlineOffsetInParent(loc.parent, id),
    };
  }

  return { id: loc.parent.id as string, index: loc.index };
};

const emitRestoreUnits = (
  target: string,
  baseOffset: number,
  units: readonly V4TextUnit[]
): V4Step[] => {
  const steps: V4Step[] = [];
  let cursor = baseOffset;
  let i = 0;

  while (i < units.length) {
    const unit = getDefined(units[i]);

    if (unit.kind === 'inline') {
      steps.push({
        node: cloneJson(unit.node),
        op: 'insert_node',
        to: { id: target, offset: cursor },
      });
      cursor += 1;
      i += 1;
      continue;
    }

    let text = unit.ch;
    const { marks } = unit;

    i += 1;
    while (i < units.length) {
      const next = getDefined(units[i]);

      if (next.kind !== 'char' || !jsonEqual(next.marks, marks)) break;
      text += next.ch;
      i += 1;
    }

    steps.push({
      ...(Object.keys(marks).length > 0 ? { marks: cloneJson(marks) } : {}),
      offset: cursor,
      op: 'insert_text',
      target,
      text,
    });
    cursor += text.length;
  }

  return steps;
};

const invertOneStep = (state: MutableV4State, step: V4Step): V4Step[] => {
  switch (step.op) {
    case 'insert_text': {
      return step.text.length === 0
        ? []
        : [
            {
              length: step.text.length,
              offset: step.offset,
              op: 'delete_text',
              target: step.target,
            },
          ];
    }

    case 'delete_text': {
      const loc = state.idMap.get(step.target);

      if (!loc) {
        throw new Error(`Missing v4 delete_text target "${step.target}".`);
      }

      const stream = toV4TextStream(loc.node.children);
      const deleted = stream.units.slice(
        step.offset,
        step.offset + step.length
      );

      return emitRestoreUnits(step.target, step.offset, deleted);
    }

    case 'format_text': {
      const loc = state.idMap.get(step.target);

      if (!loc) {
        throw new Error(`Missing v4 format_text target "${step.target}".`);
      }

      const stream = toV4TextStream(loc.node.children);

      if (step.length === 0) {
        if (step.offset !== 0 || stream.units.length > 0) return [];
        const inv = invertPropDelta(stream.emptyLeafMarks ?? {}, step);

        return isEmptyPropDelta(inv)
          ? []
          : [
              {
                ...inv,
                length: 0,
                offset: 0,
                op: 'format_text',
                target: step.target,
              },
            ];
      }

      const inverseSteps: V4Step[] = [];
      let i = step.offset;
      const end = step.offset + step.length;

      while (i < end) {
        const unit = stream.units[i];

        if (!unit || unit.kind !== 'char') {
          i += 1;
          continue;
        }

        const runStart = i;
        const inv = invertPropDelta(unit.marks, step);

        i += 1;
        while (i < end) {
          const next = stream.units[i];

          if (
            !next ||
            next.kind !== 'char' ||
            !jsonEqual(invertPropDelta(next.marks, step), inv)
          ) {
            break;
          }
          i += 1;
        }

        if (!isEmptyPropDelta(inv)) {
          inverseSteps.push({
            ...inv,
            length: i - runStart,
            offset: runStart,
            op: 'format_text',
            target: step.target,
          });
        }
      }

      return inverseSteps;
    }

    case 'insert_node': {
      return [{ id: step.node.id as string, op: 'remove_node' }];
    }

    case 'remove_node': {
      const loc = state.idMap.get(step.id);

      if (!loc) {
        throw new Error(`Missing v4 remove_node target "${step.id}".`);
      }

      return [
        {
          node: cloneJson(loc.node),
          op: 'insert_node',
          to: placeOfLocated(state, step.id),
        },
      ];
    }

    case 'move_node': {
      const oldPlace = placeOfLocated(state, step.id);

      return [{ id: step.id, op: 'move_node', to: oldPlace }];
    }

    case 'split_node': {
      return [{ op: 'join_nodes', source: step.newId, target: step.id }];
    }

    case 'join_nodes': {
      const targetLoc = state.idMap.get(step.target);
      const sourceLoc = state.idMap.get(step.source);

      if (!targetLoc || !sourceLoc) {
        throw new Error(
          `Missing v4 join_nodes target "${step.target}" or source "${step.source}".`
        );
      }

      const at = isTextBearingElement(targetLoc.node)
        ? elementStreamLength(targetLoc.node)
        : targetLoc.node.children.length;
      const sourceProps = nodeProps(sourceLoc.node);
      const targetProps = nodeProps(targetLoc.node);
      const propsDiff: JsonRecord = {};

      for (const [key, value] of Object.entries(sourceProps)) {
        if (key === 'id') continue;
        if (!jsonEqual(targetProps[key], value)) {
          propsDiff[key] = cloneJson(value);
        }
      }

      const steps: V4Step[] = [
        {
          at,
          id: step.target,
          newId: step.source,
          op: 'split_node',
          ...(Object.keys(propsDiff).length > 0 ? { props: propsDiff } : {}),
        },
      ];
      const extraKeysOnTarget = Object.keys(targetProps).filter(
        (key) => key !== 'id' && !Object.hasOwn(sourceProps, key)
      );

      if (extraKeysOnTarget.length > 0) {
        steps.push({
          id: step.source,
          op: 'set_props',
          unset: extraKeysOnTarget.sort(),
        });
      }

      return steps;
    }

    case 'set_props': {
      const loc = state.idMap.get(step.id);

      if (!loc) {
        throw new Error(`Missing v4 set_props target "${step.id}".`);
      }

      const inv = invertPropDelta(nodeProps(loc.node), step);

      return isEmptyPropDelta(inv)
        ? []
        : [{ ...inv, id: step.id, op: 'set_props' }];
    }

    case 'wrap_inline': {
      return [
        {
          id: step.node.id as string,
          op: 'unwrap_inline',
          parent: step.target,
        },
      ];
    }

    case 'unwrap_inline': {
      const loc = state.idMap.get(step.id);
      const parentLoc = state.idMap.get(step.parent);

      if (!loc || !parentLoc) {
        throw new Error(
          `Missing v4 unwrap_inline "${step.id}" or parent "${step.parent}".`
        );
      }

      const offset = inlineOffsetInParent(parentLoc.node, step.id);
      const length = elementStreamLength(loc.node);
      const shell: JsonElementNode = {
        ...cloneJson(nodeProps(loc.node)),
        children: [],
      };

      return [
        {
          length,
          node: shell,
          offset,
          op: 'wrap_inline',
          target: step.parent,
        },
      ];
    }

    case 'create_root': {
      return [{ op: 'delete_root', root: step.root }];
    }

    case 'delete_root': {
      const nodes = state.roots[step.root];

      if (!nodes) {
        throw new Error(`Missing v4 delete_root "${step.root}".`);
      }

      const steps: V4Step[] = [{ op: 'create_root', root: step.root }];

      nodes.forEach((node, index) => {
        if (!isElementNode(node)) {
          throw new Error(
            `Cannot invert delete_root "${step.root}" containing non-element top-level node.`
          );
        }
        steps.push({
          node: cloneJson(node),
          op: 'insert_node',
          to: { index, root: step.root },
        });
      });

      return steps;
    }

    case 'set_register': {
      const current = readRecord(
        getRecordSetVersion(state.records, step.set),
        step.id
      );
      const prevEncoded =
        isRecord(current) && typeof current.encoded === 'string'
          ? current.encoded
          : null;
      const prevWriteId =
        isRecord(current) && typeof current.writeId === 'string'
          ? current.writeId
          : `${step.writeId}:inv`;

      return [
        {
          after: prevEncoded,
          id: step.id,
          op: 'set_register',
          set: step.set,
          writeId: prevWriteId,
        },
      ];
    }
  }
  return [];
};

const indexForRoot = (value: JsonEditorValue, root: string): DocumentIndex => {
  if (root === 'main') {
    return lazyRootOf(value, 'children') ?? rootIndexOf(value, 'children');
  }

  const { roots } = value;

  if (!roots || !Object.hasOwn(roots, root)) {
    return DocumentIndex.fromValue([]);
  }

  return lazyRootOf(roots, root) ?? rootIndexOf(roots, root);
};

const isContextFreeStep = (step: V4Step): boolean =>
  step.op === 'insert_text' ||
  step.op === 'insert_node' ||
  step.op === 'split_node' ||
  step.op === 'wrap_inline' ||
  step.op === 'create_root';

const invertContextFreeStep = (step: V4Step): V4Step[] => {
  switch (step.op) {
    case 'insert_text': {
      return step.text.length === 0
        ? []
        : [
            {
              length: step.text.length,
              offset: step.offset,
              op: 'delete_text',
              target: step.target,
            },
          ];
    }
    case 'insert_node': {
      return [{ id: step.node.id as string, op: 'remove_node' }];
    }
    case 'split_node': {
      return [{ op: 'join_nodes', source: step.newId, target: step.id }];
    }
    case 'wrap_inline': {
      return [
        {
          id: step.node.id as string,
          op: 'unwrap_inline',
          parent: step.target,
        },
      ];
    }
    case 'create_root': {
      return [{ op: 'delete_root', root: step.root }];
    }
    default: {
      return [];
    }
  }
};

const referencedIdsOfStep = (step: V4Step): readonly string[] => {
  switch (step.op) {
    case 'insert_text':
    case 'delete_text':
    case 'format_text':
    case 'wrap_inline': {
      return [step.target];
    }
    case 'insert_node': {
      return 'id' in step.to ? [step.to.id] : [];
    }
    case 'remove_node':
    case 'split_node':
    case 'set_props': {
      return [step.id];
    }
    case 'move_node': {
      return 'id' in step.to ? [step.id, step.to.id] : [step.id];
    }
    case 'join_nodes': {
      return [step.target, step.source];
    }
    case 'unwrap_inline': {
      return [step.id, step.parent];
    }
    case 'create_root':
    case 'delete_root':
    case 'set_register': {
      return [];
    }
  }
  return [];
};

const invertV4StepsSparsely = (
  before: JsonEditorValue,
  steps: readonly V4Step[],
  explicitLookup?: ValueIdLookup
): readonly V4Step[] | null => {
  if (steps.every(isContextFreeStep)) {
    const result: V4Step[] = [];

    for (let i = steps.length - 1; i >= 0; i -= 1) {
      result.push(...invertContextFreeStep(getDefined(steps[i])));
    }

    return result;
  }

  if (steps.some((step) => step.op === 'delete_root')) return null;

  const valueLookup = getValueIdLookup(before);
  const lookup: ValueIdLookup | undefined =
    explicitLookup && valueLookup
      ? (id) => explicitLookup(id) ?? valueLookup(id)
      : (explicitLookup ?? valueLookup);

  if (!lookup) return null;

  const baseRecords = getValueRecords(before);
  const state: MutableV4State = {
    children: [],
    idMap: new Map(),
    records: baseRecords,
    roots: {},
    showRecords: false,
    sourceRecords: baseRecords,
  };
  const loadedTopBlocks = new Set<string>();
  const originalTopIndex = new Map<string, number>();
  const rootShifted = new Set<string>();

  const ensureRootList = (root: string) => {
    if (root === 'main') return state.children;
    let list = state.roots[root];

    if (!list) {
      list = [];
      state.roots[root] = list;
    }

    return list;
  };

  const loadById = (id: string): boolean => {
    if (state.idMap.has(id)) return true;

    const loc = lookup(id);

    if (!loc || loc.path.length === 0) return false;

    const topIndex = getDefined(loc.path[0]);
    const blockKey = `${loc.root}:${topIndex}`;

    if (!loadedTopBlocks.has(blockKey)) {
      loadedTopBlocks.add(blockKey);
      const topNode = cloneJson(
        indexForRoot(before, loc.root).node([topIndex])
      );
      const list = ensureRootList(loc.root);
      const slot = list.length;

      list.push(topNode);
      if (isElementNode(topNode)) {
        const topId =
          typeof topNode.id === 'string' && topNode.id.length > 0
            ? topNode.id
            : null;

        if (topId) {
          originalTopIndex.set(topId, topIndex);
          state.idMap.set(topId, {
            ancestors: [],
            index: slot,
            node: topNode,
            parent: null,
            path: [slot],
            root: loc.root,
          });
        }
        indexSubtree(
          state.idMap,
          loc.root,
          topNode,
          topNode.children,
          [slot],
          topId ? [topId] : []
        );
      }
    }

    return state.idMap.has(id);
  };

  const perStepInverses: V4Step[][] = [];

  for (const step of steps) {
    for (const id of referencedIdsOfStep(step)) {
      if (!loadById(id)) return null;
    }

    let inverse: V4Step[];

    if (step.op === 'remove_node' || step.op === 'move_node') {
      const loc = state.idMap.get(step.id);

      if (!loc) return null;
      if (loc.parent === null) {
        if (rootShifted.has(loc.root)) return null;
        const origIdx = originalTopIndex.get(step.id);

        if (origIdx === undefined) return null;
        inverse =
          step.op === 'remove_node'
            ? [
                {
                  node: cloneJson(loc.node),
                  op: 'insert_node',
                  to: { index: origIdx, root: loc.root },
                },
              ]
            : [
                {
                  id: step.id,
                  op: 'move_node',
                  to: { index: origIdx, root: loc.root },
                },
              ];
      } else {
        inverse = invertOneStep(state, step);
      }
    } else {
      inverse = invertOneStep(state, step);
    }

    perStepInverses.push(inverse);

    if (steps.length === 1) break;

    if (step.op === 'insert_node' && 'root' in step.to) {
      rootShifted.add(step.to.root);
      const list = ensureRootList(step.to.root);

      applyV4StepToState(state, {
        ...step,
        to: {
          index: Math.min(step.to.index, list.length),
          root: step.to.root,
        },
      });
    } else if (step.op === 'move_node' && 'root' in step.to) {
      const srcLoc = state.idMap.get(step.id);

      if (srcLoc?.parent === null) rootShifted.add(srcLoc.root);
      rootShifted.add(step.to.root);
      const list = ensureRootList(step.to.root);
      const sameRoot = srcLoc?.parent === null && srcLoc.root === step.to.root;
      const maxIndex = sameRoot ? Math.max(0, list.length - 1) : list.length;

      applyV4StepToState(state, {
        ...step,
        to: {
          index: Math.min(step.to.index, maxIndex),
          root: step.to.root,
        },
      });
    } else {
      if (step.op === 'remove_node' || step.op === 'split_node') {
        const loc = state.idMap.get(step.id);

        if (loc?.parent === null) rootShifted.add(loc.root);
      } else if (step.op === 'join_nodes') {
        const loc = state.idMap.get(step.source);

        if (loc?.parent === null) rootShifted.add(loc.root);
      }
      applyV4StepToState(state, step);
    }
  }

  const result: V4Step[] = [];

  for (let i = perStepInverses.length - 1; i >= 0; i -= 1) {
    result.push(...getDefined(perStepInverses[i]));
  }

  return result;
};

export const invertV4Steps = (
  before: JsonEditorValue,
  steps: readonly V4Step[],
  options?: Readonly<{ lookup?: ValueIdLookup }>
): readonly V4Step[] => {
  if (steps.length === 0) return [];

  const sparse = invertV4StepsSparsely(before, steps, options?.lookup);

  if (sparse !== null) return sparse;

  const state = createMutableV4State(before);
  const perStepInverses: V4Step[][] = [];

  for (const step of steps) {
    const inverse = invertOneStep(state, step);

    applyV4StepToState(state, step);
    perStepInverses.push(inverse);
  }

  const result: V4Step[] = [];

  for (let i = perStepInverses.length - 1; i >= 0; i -= 1) {
    result.push(...getDefined(perStepInverses[i]));
  }

  return result;
};
