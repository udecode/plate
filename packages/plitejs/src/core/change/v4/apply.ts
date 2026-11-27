import {
  applyRecordOps,
  canonicalRecordJson,
  getRecordSetVersion,
  getValueRecords,
  hasValueRecords,
  readRecord,
  recordDrop,
  type RecordStore,
  showValueRecords,
  withValueRecords,
} from '../../record-store';
import { cloneJson, isRecord, jsonEqual, type JsonRecord } from '../json';
import { visitRootNames } from '../lazy-root';
import {
  isElementNode,
  isTextNode,
  type JsonEditorValue,
  type JsonElementNode,
  type JsonNode,
  nodeProps,
} from '../tokens';
import {
  applyPropDeltaToRecord,
  assertV4Step,
  type V4Place,
  type V4Step,
} from './types';

export type V4TextUnit =
  | Readonly<{ ch: string; kind: 'char'; marks: JsonRecord }>
  | Readonly<{ kind: 'inline'; node: JsonElementNode }>;

export type V4TextStream = Readonly<{
  emptyLeafMarks: JsonRecord | null;
  hasInlines: boolean;
  units: V4TextUnit[];
}>;

export const isTextBearingElement = (node: JsonElementNode): boolean =>
  node.children.length === 0 || node.children.some(isTextNode);

export const toV4TextStream = (children: readonly JsonNode[]): V4TextStream => {
  const units: V4TextUnit[] = [];
  let hasInlines = false;
  let emptyLeafMarks: JsonRecord | null = null;

  for (const child of children) {
    if (isElementNode(child)) {
      hasInlines = true;
      units.push({ kind: 'inline', node: cloneJson(child) });
    } else {
      const { text, ...rawMarks } = child;
      const marks = cloneJson(rawMarks);

      if (text.length === 0 && children.length === 1) {
        emptyLeafMarks = marks;
      }
      for (let i = 0; i < text.length; i += 1) {
        units.push({
          ch: text.charAt(i),
          kind: 'char',
          marks: cloneJson(marks),
        });
      }
    }
  }

  return { emptyLeafMarks, hasInlines, units };
};

export const fromV4TextStream = (
  units: readonly V4TextUnit[],
  emptyLeafMarks: JsonRecord | null = null
): JsonNode[] => {
  if (units.length === 0) {
    return [{ ...(emptyLeafMarks ? cloneJson(emptyLeafMarks) : {}), text: '' }];
  }

  const out: JsonNode[] = [];
  let hasInlines = false;

  for (const unit of units) {
    if (unit.kind === 'inline') {
      hasInlines = true;
      const last = out.at(-1);

      if (!last || isElementNode(last)) {
        out.push({ text: '' });
      }
      out.push(cloneJson(unit.node));
    } else {
      const prev = out.at(-1);

      if (prev && isTextNode(prev)) {
        const { text: prevText, ...prevMarks } = prev;

        if (jsonEqual(prevMarks, unit.marks)) {
          (prev as { text: string }).text = prevText + unit.ch;
          continue;
        }
      }
      out.push({ ...cloneJson(unit.marks), text: unit.ch });
    }
  }

  const tail = out.at(-1);

  if (hasInlines && tail && isElementNode(tail)) {
    out.push({ text: '' });
  }

  return out;
};

export const elementStreamLength = (node: JsonElementNode): number => {
  let length = 0;

  for (const child of node.children) {
    length += isElementNode(child) ? 1 : child.text.length;
  }

  return length;
};

export const textOffsetAtChildPath = (
  parent: JsonElementNode,
  childIndex: number,
  innerOffset = 0
): number => {
  let offset = 0;

  for (let i = 0; i < childIndex; i += 1) {
    const child = parent.children[i];

    if (!child) break;
    offset += isElementNode(child) ? 1 : child.text.length;
  }

  return offset + innerOffset;
};

type LocatedElement = Readonly<{
  ancestors: readonly string[];
  index: number;
  node: JsonElementNode;
  parent: JsonElementNode | null;
  path: readonly number[];
  root: string;
}>;

export type MutableV4State = {
  children: JsonNode[];
  idMap: Map<string, LocatedElement>;
  meta?: unknown;
  records: RecordStore;
  roots: Record<string, JsonNode[]>;
  showRecords: boolean;
  sourceRecords: RecordStore;
};

const indexSubtree = (
  idMap: Map<string, LocatedElement>,
  root: string,
  parent: JsonElementNode | null,
  nodes: readonly JsonNode[],
  prefix: readonly number[],
  ancestors: readonly string[]
) => {
  for (let i = 0; i < nodes.length; i += 1) {
    const child = nodes[i];

    if (!isElementNode(child)) continue;

    const path = [...prefix, i];

    if (typeof child.id === 'string' && child.id.length > 0) {
      if (idMap.has(child.id)) {
        throw new Error(`Duplicate element id "${child.id}" in v4 state.`);
      }
      idMap.set(child.id, {
        ancestors,
        index: i,
        node: child,
        parent,
        path,
        root,
      });
    }

    const nextAncestors =
      typeof child.id === 'string' && child.id.length > 0
        ? [...ancestors, child.id]
        : ancestors;

    indexSubtree(idMap, root, child, child.children, path, nextAncestors);
  }
};

const rebuildRootIndex = (state: MutableV4State, root: string) => {
  for (const [id, loc] of state.idMap) {
    if (loc.root === root) state.idMap.delete(id);
  }

  const list = root === 'main' ? state.children : state.roots[root];

  if (list) {
    indexSubtree(state.idMap, root, null, list, [], []);
  }
};

const collectSubtreeIds = (
  node: JsonElementNode,
  out = new Set<string>()
): Set<string> => {
  if (typeof node.id === 'string' && node.id.length > 0) {
    if (out.has(node.id)) {
      throw new Error(
        `Duplicate element id "${node.id}" inside inserted subtree.`
      );
    }
    out.add(node.id);
  }
  for (const child of node.children) {
    if (isElementNode(child)) collectSubtreeIds(child, out);
  }

  return out;
};

export const createMutableV4State = (
  value: JsonEditorValue
): MutableV4State => {
  const children = cloneJson(value.children) as JsonNode[];
  const roots: Record<string, JsonNode[]> = {};

  if (value.roots) {
    for (const root of visitRootNames(value.roots)) {
      roots[root] = cloneJson(value.roots[root]) as JsonNode[];
    }
  }

  const sourceRecords = getValueRecords(value);
  const idMap = new Map<string, LocatedElement>();

  indexSubtree(idMap, 'main', null, children, [], []);
  for (const root of Object.keys(roots)) {
    indexSubtree(idMap, root, null, roots[root], [], []);
  }

  return {
    children,
    idMap,
    ...(Object.hasOwn(value, 'meta') ? { meta: value.meta } : {}),
    records: sourceRecords,
    roots,
    showRecords: Object.hasOwn(value, 'records') || !hasValueRecords(value),
    sourceRecords,
  };
};

export const finalizeMutableV4State = (
  state: MutableV4State,
  source: JsonEditorValue
): JsonEditorValue => {
  const rootNames = Object.keys(state.roots);
  const out: Record<string, unknown> = {
    children: state.children,
    ...(rootNames.length > 0 ? { roots: state.roots } : {}),
    ...(Object.hasOwn(state, 'meta') ? { meta: state.meta } : {}),
  };

  if (state.records === state.sourceRecords) {
    withValueRecords(out, state.sourceRecords);
    if (Object.hasOwn(source, 'records') && source.records !== undefined) {
      out.records = source.records;
    }
  } else {
    withValueRecords(out, state.records);
    if (state.showRecords) {
      showValueRecords(out, state.records);
    }
  }

  return out as JsonEditorValue;
};

const getRootChildren = (state: MutableV4State, root: string): JsonNode[] => {
  if (root === 'main') return state.children;
  if (!Object.hasOwn(state.roots, root)) {
    throw new Error(`Missing v4 root "${root}".`);
  }

  return state.roots[root];
};

const insertAtPlace = (
  state: MutableV4State,
  place: V4Place,
  node: JsonElementNode
): string => {
  if ('root' in place) {
    const list = getRootChildren(state, place.root);

    if (place.index < 0 || place.index > list.length) {
      throw new RangeError(
        `Invalid v4 insert index ${place.index} in root "${place.root}" (length ${list.length}).`
      );
    }
    list.splice(place.index, 0, node);
    return place.root;
  }

  const parentLoc = state.idMap.get(place.id);

  if (!parentLoc) {
    throw new Error(`Missing v4 destination element "${place.id}".`);
  }

  if ('offset' in place) {
    const stream = toV4TextStream(parentLoc.node.children);

    if (place.offset < 0 || place.offset > stream.units.length) {
      throw new RangeError(
        `Invalid v4 inline insert offset ${place.offset} in "${place.id}" (length ${stream.units.length}).`
      );
    }
    stream.units.splice(place.offset, 0, { kind: 'inline', node });
    (parentLoc.node as { children: JsonNode[] }).children = fromV4TextStream(
      stream.units,
      stream.emptyLeafMarks
    );
    return parentLoc.root;
  }

  const list = parentLoc.node.children as JsonNode[];

  if (place.index < 0 || place.index > list.length) {
    throw new RangeError(
      `Invalid v4 insert index ${place.index} in element "${place.id}" (length ${list.length}).`
    );
  }
  list.splice(place.index, 0, node);
  return parentLoc.root;
};

const removeLocated = (state: MutableV4State, loc: LocatedElement) => {
  if (loc.parent === null) {
    getRootChildren(state, loc.root).splice(loc.index, 1);
    return;
  }

  if (isTextBearingElement(loc.parent)) {
    const stream = toV4TextStream(loc.parent.children);
    const unitIndex = stream.units.findIndex(
      (unit) => unit.kind === 'inline' && unit.node.id === loc.node.id
    );

    if (unitIndex !== -1) {
      stream.units.splice(unitIndex, 1);
      (loc.parent as { children: JsonNode[] }).children = fromV4TextStream(
        stream.units,
        stream.emptyLeafMarks
      );
      return;
    }
  }

  (loc.parent.children as JsonNode[]).splice(loc.index, 1);
};

export const applyV4StepToState = (state: MutableV4State, step: V4Step) => {
  assertV4Step(step);

  switch (step.op) {
    case 'insert_text': {
      const loc = state.idMap.get(step.target);

      if (!loc) {
        throw new Error(`Missing v4 insert_text target "${step.target}".`);
      }

      const stream = toV4TextStream(loc.node.children);

      if (step.offset > stream.units.length) {
        throw new RangeError(
          `v4 insert_text offset ${step.offset} exceeds length ${stream.units.length} in "${step.target}".`
        );
      }

      const marks = step.marks ? cloneJson(step.marks) : {};
      const inserted: V4TextUnit[] = [];

      for (let i = 0; i < step.text.length; i += 1) {
        inserted.push({
          ch: step.text.charAt(i),
          kind: 'char',
          marks: cloneJson(marks),
        });
      }
      stream.units.splice(step.offset, 0, ...inserted);
      (loc.node as { children: JsonNode[] }).children = fromV4TextStream(
        stream.units,
        stream.emptyLeafMarks
      );
      if (stream.hasInlines) rebuildRootIndex(state, loc.root);
      return;
    }

    case 'delete_text': {
      const loc = state.idMap.get(step.target);

      if (!loc) {
        throw new Error(`Missing v4 delete_text target "${step.target}".`);
      }

      const stream = toV4TextStream(loc.node.children);

      if (step.offset + step.length > stream.units.length) {
        throw new RangeError(
          `v4 delete_text range [${step.offset}, ${step.offset + step.length}] exceeds length ${stream.units.length} in "${step.target}".`
        );
      }

      const removed = stream.units.splice(step.offset, step.length);

      (loc.node as { children: JsonNode[] }).children = fromV4TextStream(
        stream.units,
        stream.units.length === 0 ? null : stream.emptyLeafMarks
      );
      if (stream.hasInlines || removed.some((u) => u.kind === 'inline')) {
        rebuildRootIndex(state, loc.root);
      }
      return;
    }

    case 'format_text': {
      const loc = state.idMap.get(step.target);

      if (!loc) {
        throw new Error(`Missing v4 format_text target "${step.target}".`);
      }

      const stream = toV4TextStream(loc.node.children);

      if (step.length === 0) {
        if (step.offset !== 0 || stream.units.length > 0) {
          if (step.offset > stream.units.length) {
            throw new RangeError(
              `v4 format_text offset ${step.offset} exceeds length ${stream.units.length} in "${step.target}".`
            );
          }
          return;
        }
        const nextMarks = applyPropDeltaToRecord(
          stream.emptyLeafMarks ?? {},
          step
        );

        (loc.node as { children: JsonNode[] }).children = [
          { ...nextMarks, text: '' },
        ];
        return;
      }

      if (step.offset + step.length > stream.units.length) {
        throw new RangeError(
          `v4 format_text range [${step.offset}, ${step.offset + step.length}] exceeds length ${stream.units.length} in "${step.target}".`
        );
      }

      for (let i = step.offset; i < step.offset + step.length; i += 1) {
        const unit = stream.units[i];

        if (unit.kind !== 'char') continue;
        stream.units[i] = {
          ch: unit.ch,
          kind: 'char',
          marks: applyPropDeltaToRecord(unit.marks, step),
        };
      }

      (loc.node as { children: JsonNode[] }).children = fromV4TextStream(
        stream.units,
        stream.emptyLeafMarks
      );
      if (stream.hasInlines) rebuildRootIndex(state, loc.root);
      return;
    }

    case 'insert_node': {
      const node = cloneJson(step.node);
      const ids = collectSubtreeIds(node);

      for (const id of ids) {
        if (state.idMap.has(id)) {
          throw new Error(
            `Cannot insert v4 node with existing live element id "${id}".`
          );
        }
      }

      const targetRoot = insertAtPlace(state, step.to, node);

      rebuildRootIndex(state, targetRoot);
      return;
    }

    case 'remove_node': {
      const loc = state.idMap.get(step.id);

      if (!loc) {
        throw new Error(`Missing v4 remove_node target "${step.id}".`);
      }
      removeLocated(state, loc);
      rebuildRootIndex(state, loc.root);
      return;
    }

    case 'move_node': {
      const loc = state.idMap.get(step.id);

      if (!loc) {
        throw new Error(`Missing v4 move_node target "${step.id}".`);
      }

      if ('id' in step.to) {
        if (step.to.id === step.id) {
          throw new Error(
            `Cycle: cannot move element "${step.id}" into itself.`
          );
        }
        const dest = state.idMap.get(step.to.id);

        if (!dest) {
          throw new Error(`Missing v4 move_node destination "${step.to.id}".`);
        }
        if (dest.ancestors.includes(step.id)) {
          throw new Error(
            `Cycle: cannot move element "${step.id}" into its descendant "${step.to.id}".`
          );
        }
      }

      const sourceRoot = loc.root;
      const moved = loc.node;

      removeLocated(state, loc);
      rebuildRootIndex(state, sourceRoot);

      const destRoot = insertAtPlace(state, step.to, moved);

      rebuildRootIndex(state, destRoot);
      return;
    }

    case 'split_node': {
      const loc = state.idMap.get(step.id);

      if (!loc) {
        throw new Error(`Missing v4 split_node target "${step.id}".`);
      }
      if (state.idMap.has(step.newId)) {
        throw new Error(
          `Cannot split v4 node with existing live id "${step.newId}".`
        );
      }

      const baseProps = nodeProps(loc.node);
      const { id: _oldId, ...inherited } = cloneJson(baseProps);
      const nextProps: JsonRecord = { ...inherited };

      if (step.props) {
        for (const [key, value] of Object.entries(step.props)) {
          if (key === 'id') continue;
          if (value === undefined) delete nextProps[key];
          else nextProps[key] = cloneJson(value);
        }
      }

      let rightChildren: JsonNode[];

      if (isTextBearingElement(loc.node)) {
        const stream = toV4TextStream(loc.node.children);

        if (step.at > stream.units.length) {
          throw new RangeError(
            `v4 split_node offset ${step.at} exceeds length ${stream.units.length} in "${step.id}".`
          );
        }

        const leftUnits = stream.units.slice(0, step.at);
        const rightUnits = stream.units.slice(step.at);

        (loc.node as { children: JsonNode[] }).children = fromV4TextStream(
          leftUnits,
          leftUnits.length === 0 ? stream.emptyLeafMarks : null
        );
        rightChildren = fromV4TextStream(
          rightUnits,
          rightUnits.length === 0 ? stream.emptyLeafMarks : null
        );
      } else {
        const children = loc.node.children as JsonNode[];

        if (step.at > children.length) {
          throw new RangeError(
            `v4 split_node child index ${step.at} exceeds length ${children.length} in "${step.id}".`
          );
        }
        rightChildren = children.splice(step.at);
      }

      const sibling: JsonElementNode = {
        ...nextProps,
        children: rightChildren,
        id: step.newId,
      };

      if (loc.parent === null) {
        getRootChildren(state, loc.root).splice(loc.index + 1, 0, sibling);
      } else {
        (loc.parent.children as JsonNode[]).splice(loc.index + 1, 0, sibling);
      }

      rebuildRootIndex(state, loc.root);
      return;
    }

    case 'join_nodes': {
      const targetLoc = state.idMap.get(step.target);
      const sourceLoc = state.idMap.get(step.source);

      if (!targetLoc || !sourceLoc) {
        throw new Error(
          `Missing v4 join_nodes target "${step.target}" or source "${step.source}".`
        );
      }
      if (
        targetLoc.root !== sourceLoc.root ||
        targetLoc.parent !== sourceLoc.parent ||
        sourceLoc.index !== targetLoc.index + 1
      ) {
        throw new Error(
          `v4 join_nodes requires "${step.source}" to immediately follow "${step.target}".`
        );
      }

      if (
        isTextBearingElement(targetLoc.node) &&
        isTextBearingElement(sourceLoc.node)
      ) {
        const left = toV4TextStream(targetLoc.node.children);
        const right = toV4TextStream(sourceLoc.node.children);
        const combined = [...left.units, ...right.units];

        (targetLoc.node as { children: JsonNode[] }).children =
          fromV4TextStream(
            combined,
            combined.length === 0
              ? (left.emptyLeafMarks ?? right.emptyLeafMarks)
              : null
          );
      } else {
        (targetLoc.node as { children: JsonNode[] }).children = [
          ...targetLoc.node.children,
          ...sourceLoc.node.children,
        ];
      }

      removeLocated(state, sourceLoc);
      rebuildRootIndex(state, targetLoc.root);
      return;
    }

    case 'set_props': {
      const loc = state.idMap.get(step.id);

      if (!loc) {
        throw new Error(`Missing v4 set_props target "${step.id}".`);
      }

      const currentProps = nodeProps(loc.node);
      const nextProps = applyPropDeltaToRecord(currentProps, step, {
        forbidIdMutation: true,
      });
      const target = loc.node as Record<string, unknown>;

      for (const key of Object.keys(target)) {
        if (key === 'children') continue;
        if (!Object.hasOwn(nextProps, key)) delete target[key];
      }
      for (const [key, value] of Object.entries(nextProps)) {
        target[key] = value;
      }
      return;
    }

    case 'wrap_inline': {
      const loc = state.idMap.get(step.target);

      if (!loc) {
        throw new Error(`Missing v4 wrap_inline target "${step.target}".`);
      }

      const wrapperShell = cloneJson(step.node);
      const wrapperId = wrapperShell.id as string;

      if (state.idMap.has(wrapperId)) {
        throw new Error(
          `Cannot wrap_inline with existing live element id "${wrapperId}".`
        );
      }

      const stream = toV4TextStream(loc.node.children);

      if (step.offset + step.length > stream.units.length) {
        throw new RangeError(
          `v4 wrap_inline range [${step.offset}, ${step.offset + step.length}] exceeds length ${stream.units.length} in "${step.target}".`
        );
      }

      const wrappedUnits = stream.units.splice(step.offset, step.length);
      const wrappedNode: JsonElementNode = {
        ...wrapperShell,
        children: fromV4TextStream(wrappedUnits),
      };

      stream.units.splice(step.offset, 0, {
        kind: 'inline',
        node: wrappedNode,
      });
      (loc.node as { children: JsonNode[] }).children = fromV4TextStream(
        stream.units,
        stream.emptyLeafMarks
      );
      rebuildRootIndex(state, loc.root);
      return;
    }

    case 'unwrap_inline': {
      const loc = state.idMap.get(step.id);
      const parentLoc = state.idMap.get(step.parent);

      if (!loc || !parentLoc || loc.parent !== parentLoc.node) {
        throw new Error(
          `Invalid v4 unwrap_inline: "${step.id}" is not a direct child of "${step.parent}".`
        );
      }

      const parentStream = toV4TextStream(parentLoc.node.children);
      const inlineIndex = parentStream.units.findIndex(
        (unit) => unit.kind === 'inline' && unit.node.id === step.id
      );

      if (inlineIndex === -1) {
        throw new Error(
          `Missing inline child "${step.id}" in parent "${step.parent}".`
        );
      }

      const innerStream = toV4TextStream(loc.node.children);

      parentStream.units.splice(inlineIndex, 1, ...innerStream.units);
      (parentLoc.node as { children: JsonNode[] }).children = fromV4TextStream(
        parentStream.units,
        parentStream.units.length === 0
          ? (innerStream.emptyLeafMarks ?? parentStream.emptyLeafMarks)
          : null
      );
      rebuildRootIndex(state, parentLoc.root);
      return;
    }

    case 'create_root': {
      if (Object.hasOwn(state.roots, step.root)) {
        throw new Error(`Root "${step.root}" already exists.`);
      }
      state.roots[step.root] = [];
      return;
    }

    case 'delete_root': {
      if (!Object.hasOwn(state.roots, step.root)) {
        throw new Error(`Missing v4 root "${step.root}".`);
      }
      delete state.roots[step.root];
      rebuildRootIndex(state, step.root);
      return;
    }

    case 'set_register': {
      const current = readRecord(
        getRecordSetVersion(state.records, step.set),
        step.id
      );
      const currentWriteId =
        isRecord(current) && typeof current.writeId === 'string'
          ? current.writeId
          : null;

      if (
        step.expectedWriteId !== undefined &&
        currentWriteId !== step.expectedWriteId
      ) {
        return;
      }

      state.records =
        step.after === null
          ? applyRecordOps(state.records, recordDrop(step.set, step.id))
          : applyRecordOps(
              applyRecordOps(state.records, recordDrop(step.set, step.id)),
              new Map([
                [
                  step.set,
                  new Map([
                    [
                      step.id,
                      canonicalRecordJson({
                        encoded: step.after,
                        writeId: step.writeId,
                      }),
                    ],
                  ]),
                ],
              ])
            );
    }
  }
};

export const applyV4Steps = <T extends JsonEditorValue>(
  value: T,
  steps: readonly V4Step[]
): T => {
  if (steps.length === 0) return value;

  const state = createMutableV4State(value);

  for (const step of steps) {
    applyV4StepToState(state, step);
  }

  return finalizeMutableV4State(state, value) as T;
};
