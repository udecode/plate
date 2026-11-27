import { getDefined } from '../../../internal/get-defined';
import {
  getRecordSetVersion,
  getValueRecords,
  readRecord,
} from '../../record-store';
import { cloneJson, isRecord, jsonEqual, type JsonRecord } from '../json';
import { visitRootNames } from '../lazy-root';
import {
  isElementNode,
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
} from './apply';
import {
  isTextStep,
  stripFixedPropsFromDelta,
  stripOverriddenPropDelta,
  transformInlineInsertWithText,
  transformSameTargetTextPair,
  transformUnwrapInlineWithText,
  transformWrapInlineWithText,
  type V4EscalationReason,
  type V4PairTransform,
  type V4StepOutcome,
} from './text-ot';
import {
  isEmptyPropDelta,
  type V4Place,
  type V4PropDelta,
  type V4Step,
} from './types';

type ElementInfo = Readonly<{
  ancestors: ReadonlySet<string>;
  index: number;
  inlineOffset: number | null;
  node: JsonElementNode;
  parentId: string | null;
  parentTextBearing: boolean;
  root: string;
}>;

type DocSnapshotIndex = Readonly<{
  elements: ReadonlyMap<string, ElementInfo>;
  roots: ReadonlyMap<string, readonly JsonNode[]>;
  value: JsonEditorValue;
}>;

type ContainerKey = string;

const containerKeyOfRoot = (root: string): ContainerKey => `r:${root}`;
const containerKeyOfElement = (id: string): ContainerKey => `e:${id}`;

const containerKeyOfPlace = (place: V4Place): ContainerKey =>
  'root' in place
    ? containerKeyOfRoot(place.root)
    : containerKeyOfElement(place.id);

const containerKeyOfElementInfo = (info: ElementInfo): ContainerKey =>
  info.parentId === null
    ? containerKeyOfRoot(info.root)
    : containerKeyOfElement(info.parentId);

const placesEqual = (left: V4Place, right: V4Place): boolean => {
  if ('root' in left && 'root' in right) {
    return left.root === right.root && left.index === right.index;
  }
  if ('index' in left && 'index' in right && 'id' in left && 'id' in right) {
    return left.id === right.id && left.index === right.index;
  }
  if ('offset' in left && 'offset' in right) {
    return left.id === right.id && left.offset === right.offset;
  }

  return false;
};

const indexDoc = (value: JsonEditorValue): DocSnapshotIndex => {
  const elements = new Map<string, ElementInfo>();
  const roots = new Map<string, readonly JsonNode[]>();

  const walk = (
    root: string,
    parentId: string | null,
    parentTextBearing: boolean,
    nodes: readonly JsonNode[],
    ancestors: readonly string[]
  ) => {
    let textOffset = 0;

    for (let index = 0; index < nodes.length; index += 1) {
      const node = getDefined(nodes[index]);

      if (!isElementNode(node)) {
        textOffset += node.text.length;
        continue;
      }

      const inlineOffset = parentTextBearing ? textOffset : null;

      if (parentTextBearing) textOffset += 1;

      const id =
        typeof node.id === 'string' && node.id.length > 0 ? node.id : null;
      const nextAncestors = id ? [...ancestors, id] : ancestors;

      if (id) {
        elements.set(id, {
          ancestors: new Set(ancestors),
          index,
          inlineOffset,
          node,
          parentId,
          parentTextBearing,
          root,
        });
      }

      walk(root, id, isTextBearingElement(node), node.children, nextAncestors);
    }
  };

  roots.set('main', value.children);
  walk('main', null, false, value.children, []);

  if (value.roots) {
    for (const root of visitRootNames(value.roots)) {
      const nodes = value.roots[root];

      if (!nodes) continue;
      roots.set(root, nodes);
      walk(root, null, false, nodes, []);
    }
  }

  return { elements, roots, value };
};

const containerChildIds = (
  doc: DocSnapshotIndex,
  container: ContainerKey
): string[] => {
  const list = container.startsWith('r:')
    ? (doc.roots.get(container.slice(2)) ?? [])
    : (doc.elements.get(container.slice(2))?.node.children ?? []);
  const ids: string[] = [];

  for (const child of list) {
    if (isElementNode(child) && typeof child.id === 'string') {
      ids.push(child.id);
    }
  }

  return ids;
};

const isInSubtree = (
  doc: DocSnapshotIndex,
  candidateId: string,
  ancestorId: string
): boolean => {
  if (candidateId === ancestorId) return true;

  return doc.elements.get(candidateId)?.ancestors.has(ancestorId) ?? false;
};

const referencedElementIds = (step: V4Step): string[] => {
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

const referencedRoots = (doc: DocSnapshotIndex, step: V4Step): string[] => {
  const out = new Set<string>();

  if (step.op === 'create_root' || step.op === 'delete_root') {
    out.add(step.root);
  }
  if (
    (step.op === 'insert_node' || step.op === 'move_node') &&
    'root' in step.to
  ) {
    out.add(step.to.root);
  }
  for (const id of referencedElementIds(step)) {
    const info = doc.elements.get(id);

    if (info) out.add(info.root);
  }

  return [...out];
};

const propDeltaFromStep = (
  step: Extract<V4Step, { op: 'format_text' | 'set_props' }>
): V4PropDelta => ({
  ...(step.add ? { add: step.add } : {}),
  ...(step.remove ? { remove: step.remove } : {}),
  ...(step.set ? { set: step.set } : {}),
  ...(step.unset ? { unset: step.unset } : {}),
});

const inlineIdsInRange = (
  node: JsonElementNode,
  offset: number,
  length: number
): string[] => {
  const stream = toV4TextStream(node.children);
  const ids: string[] = [];
  const end = Math.min(offset + length, stream.units.length);

  for (let i = offset; i < end; i += 1) {
    const unit = stream.units[i];

    if (unit && unit.kind === 'inline' && typeof unit.node.id === 'string') {
      ids.push(unit.node.id);
    }
  }

  return ids;
};

const computeSplitPropsFixup = (
  beforeProps: JsonRecord,
  inheritedOverride: Readonly<JsonRecord> | undefined,
  desiredOverride: Readonly<JsonRecord> | undefined
): Readonly<{ props?: JsonRecord; unset?: readonly string[] }> => {
  const inherited: JsonRecord = {
    ...beforeProps,
    ...(inheritedOverride ? cloneJson(inheritedOverride) : {}),
  };
  const desired: JsonRecord = {
    ...beforeProps,
    ...(desiredOverride ? cloneJson(desiredOverride) : {}),
  };
  const props: JsonRecord = {};
  const unset: string[] = [];

  for (const [key, val] of Object.entries(desired)) {
    if (key === 'id') continue;
    if (!jsonEqual(inherited[key], val)) {
      props[key] = cloneJson(val);
    }
  }
  for (const key of Object.keys(inherited)) {
    if (key === 'id') continue;
    if (!Object.hasOwn(desired, key)) {
      unset.push(key);
    }
  }

  return {
    ...(Object.keys(props).length > 0 ? { props } : {}),
    ...(unset.length > 0 ? { unset: unset.sort() } : {}),
  };
};

const placeWithIndex = (place: V4Place, index: number): V4Place =>
  'root' in place
    ? { index, root: place.root }
    : 'index' in place
      ? { id: place.id, index }
      : { id: place.id, offset: index };

const countRemainingBefore = (
  childIds: readonly string[],
  excludeId: string,
  targetIndex: number,
  alsoExcludeId?: string
): number => {
  const withoutOwn = childIds.filter((id) => id !== excludeId);
  let count = 0;
  const limit = Math.min(targetIndex, withoutOwn.length);

  for (let i = 0; i < limit; i += 1) {
    if (withoutOwn[i] !== alsoExcludeId) count += 1;
  }

  return count;
};

const transformDeleteTextWithDeletedInline = (
  del: Extract<V4Step, { op: 'delete_text' }>,
  other: V4Step,
  doc: DocSnapshotIndex,
  delIsA: boolean
): V4PairTransform | null => {
  const targetInfo = doc.elements.get(del.target);

  if (!targetInfo) return null;
  const deletedInlines = inlineIdsInRange(
    targetInfo.node,
    del.offset,
    del.length
  );

  if (deletedInlines.length === 0) return null;

  for (const inlineId of deletedInlines) {
    if (other.op === 'remove_node' && other.id === inlineId) {
      const shrunk: V4Step[] =
        del.length > 1 ? [{ ...del, length: del.length - 1 }] : [];

      return delIsA
        ? { aPrime: shrunk, bOutcome: 'satisfied', bPrime: [], ok: true }
        : {
            aPrime: [],
            bOutcome: shrunk.length > 0 ? 'applied' : 'satisfied',
            bPrime: shrunk,
            ok: true,
          };
    }
    if (other.op === 'remove_node' && isInSubtree(doc, other.id, inlineId)) {
      return delIsA
        ? { aPrime: [del], bOutcome: 'satisfied', bPrime: [], ok: true }
        : { aPrime: [], bOutcome: 'applied', bPrime: [del], ok: true };
    }
    for (const refId of referencedElementIds(other)) {
      if (isInSubtree(doc, refId, inlineId)) {
        return { ok: false, reason: 'target-deleted' };
      }
    }
  }

  return null;
};

const transformSplitWithOther = (
  split: Extract<V4Step, { op: 'split_node' }>,
  other: V4Step,
  doc: DocSnapshotIndex,
  splitIsA: boolean
): V4PairTransform => {
  const splitInfo = doc.elements.get(split.id);

  if (!splitInfo) return { ok: false, reason: 'target-deleted' };

  const textBearing = isTextBearingElement(splitInfo.node);
  const splitContainer = containerKeyOfElementInfo(splitInfo);
  const splitSiblingIndex = splitInfo.index;

  const wrapResult = (
    splitPrime: readonly V4Step[],
    otherPrime: readonly V4Step[],
    otherOutcome: V4StepOutcome = 'applied'
  ): V4PairTransform =>
    splitIsA
      ? {
          aPrime: splitPrime,
          bOutcome: otherOutcome,
          bPrime: otherPrime,
          ok: true,
        }
      : {
          aPrime: otherPrime,
          bOutcome: splitPrime.length > 0 ? 'applied' : 'satisfied',
          bPrime: splitPrime,
          ok: true,
        };

  // Same-target text / inline ops on the split element
  if (
    textBearing &&
    (other.op === 'insert_text' ||
      other.op === 'delete_text' ||
      other.op === 'format_text' ||
      other.op === 'wrap_inline') &&
    other.target === split.id
  ) {
    if (other.op === 'insert_text') {
      if (other.offset <= split.at) {
        return wrapResult(
          [{ ...split, at: split.at + other.text.length }],
          [other]
        );
      }

      return wrapResult(
        [split],
        [{ ...other, offset: other.offset - split.at, target: split.newId }]
      );
    }

    if (other.op === 'delete_text') {
      const dEnd = other.offset + other.length;

      if (dEnd <= split.at) {
        return wrapResult([{ ...split, at: split.at - other.length }], [other]);
      }
      if (other.offset >= split.at) {
        return wrapResult(
          [split],
          [{ ...other, offset: other.offset - split.at, target: split.newId }]
        );
      }

      return wrapResult(
        [{ ...split, at: other.offset }],
        [
          {
            length: split.at - other.offset,
            offset: other.offset,
            op: 'delete_text',
            target: split.id,
          },
          {
            length: dEnd - split.at,
            offset: 0,
            op: 'delete_text',
            target: split.newId,
          },
        ]
      );
    }

    if (other.op === 'format_text') {
      if (other.length === 0) {
        return wrapResult([split], [other]);
      }

      const fEnd = other.offset + other.length;

      if (fEnd <= split.at) return wrapResult([split], [other]);
      if (other.offset >= split.at) {
        return wrapResult(
          [split],
          [{ ...other, offset: other.offset - split.at, target: split.newId }]
        );
      }

      return wrapResult(
        [split],
        [
          { ...other, length: split.at - other.offset, offset: other.offset },
          {
            ...other,
            length: fEnd - split.at,
            offset: 0,
            target: split.newId,
          },
        ]
      );
    }

    // wrap_inline on split element
    const wEnd = other.offset + other.length;

    if (wEnd <= split.at) {
      return wrapResult(
        [{ ...split, at: split.at + (1 - other.length) }],
        [other]
      );
    }
    if (other.offset >= split.at) {
      return wrapResult(
        [split],
        [{ ...other, offset: other.offset - split.at, target: split.newId }]
      );
    }

    return { ok: false, reason: 'inline-wrap-crossing' };
  }

  if (other.op === 'unwrap_inline' && other.parent === split.id) {
    const inlineInfo = doc.elements.get(other.id);

    if (!inlineInfo || inlineInfo.inlineOffset === null) {
      return { ok: false, reason: 'target-deleted' };
    }

    const innerLen = elementStreamLength(inlineInfo.node);

    if (inlineInfo.inlineOffset < split.at) {
      return wrapResult([{ ...split, at: split.at + (innerLen - 1) }], [other]);
    }

    return wrapResult([split], [{ ...other, parent: split.newId }]);
  }

  if (other.op === 'set_props' && other.id === split.id) {
    const delta = propDeltaFromStep(other);
    const forNewId = stripFixedPropsFromDelta(delta, split.props);
    const otherSteps: V4Step[] = [other];

    if (!isEmptyPropDelta(forNewId)) {
      otherSteps.push({ ...forNewId, id: split.newId, op: 'set_props' });
    }

    return wrapResult([split], otherSteps);
  }

  if (other.op === 'insert_node') {
    // Inline insert into text-bearing split element
    if (textBearing && 'offset' in other.to && other.to.id === split.id) {
      if (other.to.offset <= split.at) {
        return wrapResult([{ ...split, at: split.at + 1 }], [other]);
      }

      return wrapResult(
        [split],
        [
          {
            ...other,
            to: { id: split.newId, offset: other.to.offset - split.at },
          },
        ]
      );
    }

    // Child insert into block-container split element
    if (
      !textBearing &&
      'id' in other.to &&
      'index' in other.to &&
      other.to.id === split.id
    ) {
      if (other.to.index <= split.at) {
        return wrapResult([{ ...split, at: split.at + 1 }], [other]);
      }

      return wrapResult(
        [split],
        [
          {
            ...other,
            to: { id: split.newId, index: other.to.index - split.at },
          },
        ]
      );
    }

    // Sibling insert in the same parent container as the split block
    if (
      !('offset' in other.to) &&
      containerKeyOfPlace(other.to) === splitContainer
    ) {
      if (other.to.index > splitSiblingIndex) {
        return wrapResult(
          [split],
          [{ ...other, to: placeWithIndex(other.to, other.to.index + 1) }]
        );
      }

      return wrapResult([split], [other]);
    }

    return wrapResult([split], [other]);
  }

  if (other.op === 'remove_node') {
    const remInfo = doc.elements.get(other.id);

    if (!remInfo) return { ok: false, reason: 'target-deleted' };
    if (remInfo.parentId === split.id) {
      const pos = textBearing ? remInfo.inlineOffset : remInfo.index;

      if (pos !== null && pos < split.at) {
        return wrapResult([{ ...split, at: split.at - 1 }], [other]);
      }
    }

    return wrapResult([split], [other]);
  }

  if (other.op === 'move_node') {
    if (other.id === split.id) {
      return { ok: false, reason: 'move-conflict' };
    }

    const moveInfo = doc.elements.get(other.id);

    if (!moveInfo) return { ok: false, reason: 'target-deleted' };

    const fromSplit = moveInfo.parentId === split.id;
    const intoSplit = 'id' in other.to && other.to.id === split.id;

    if (fromSplit || intoSplit) {
      if (fromSplit && intoSplit) {
        return { ok: false, reason: 'move-conflict' };
      }
      if (fromSplit) {
        const oldPos = textBearing ? moveInfo.inlineOffset : moveInfo.index;
        const nextSplit: V4Step =
          oldPos !== null && oldPos < split.at
            ? { ...split, at: split.at - 1 }
            : split;
        let nextMove: V4Step = other;

        if (
          !('offset' in other.to) &&
          containerKeyOfPlace(other.to) === splitContainer
        ) {
          const children = containerChildIds(doc, splitContainer);
          const withoutMoved = children.filter((cid) => cid !== other.id);
          const splitPosAfter = withoutMoved.indexOf(split.id);

          if (splitPosAfter !== -1 && other.to.index > splitPosAfter) {
            nextMove = {
              ...other,
              to: placeWithIndex(other.to, other.to.index + 1),
            };
          }
        }

        return wrapResult([nextSplit], [nextMove]);
      }

      // Moving into the split element from outside
      if (textBearing && 'offset' in other.to) {
        if (other.to.offset <= split.at) {
          return wrapResult([{ ...split, at: split.at + 1 }], [other]);
        }

        return wrapResult(
          [split],
          [
            {
              ...other,
              to: { id: split.newId, offset: other.to.offset - split.at },
            },
          ]
        );
      }
      if (!textBearing && 'index' in other.to) {
        if (other.to.index <= split.at) {
          return wrapResult([{ ...split, at: split.at + 1 }], [other]);
        }

        return wrapResult(
          [split],
          [
            {
              ...other,
              to: { id: split.newId, index: other.to.index - split.at },
            },
          ]
        );
      }

      return { ok: false, reason: 'move-conflict' };
    }

    // Move destination is in the same parent container as the split block
    if (
      !('offset' in other.to) &&
      containerKeyOfPlace(other.to) === splitContainer
    ) {
      const children = containerChildIds(doc, splitContainer);
      const withoutMoved = children.filter((cid) => cid !== other.id);
      const splitPosAfter = withoutMoved.indexOf(split.id);

      if (splitPosAfter !== -1 && other.to.index > splitPosAfter) {
        return wrapResult(
          [split],
          [{ ...other, to: placeWithIndex(other.to, other.to.index + 1) }]
        );
      }
    }

    return wrapResult([split], [other]);
  }

  if (other.op === 'join_nodes') {
    if (other.target === split.id || other.source === split.id) {
      return { ok: false, reason: 'not-adjacent' };
    }
    const sourceInfo = doc.elements.get(other.source);

    if (sourceInfo && sourceInfo.parentId === split.id && !textBearing) {
      if (sourceInfo.index < split.at) {
        return wrapResult([{ ...split, at: split.at - 1 }], [other]);
      }
      if (sourceInfo.index === split.at) {
        // Target is at split.at - 1 and source is at split.at -> split separates them!
        return { ok: false, reason: 'not-adjacent' };
      }
    }

    return wrapResult([split], [other]);
  }

  if (other.op === 'split_node') {
    if (other.id !== split.id) {
      const otherInfo = doc.elements.get(other.id);

      if (
        otherInfo &&
        otherInfo.parentId === split.id &&
        !textBearing &&
        otherInfo.index < split.at
      ) {
        return wrapResult([{ ...split, at: split.at + 1 }], [other]);
      }
      if (
        splitInfo.parentId === other.id &&
        otherInfo &&
        !isTextBearingElement(otherInfo.node) &&
        splitInfo.index < other.at
      ) {
        return wrapResult([split], [{ ...other, at: other.at + 1 }]);
      }

      return wrapResult([split], [other]);
    }

    // Same element split by both a and b!
    if (split.newId === other.newId) {
      return { ok: false, reason: 'move-conflict' };
    }

    const sA = splitIsA ? split : other;
    const sB = splitIsA ? other : split;
    const beforeProps = nodeProps(splitInfo.node);

    if (sA.at <= sB.at) {
      const fixB = computeSplitPropsFixup(beforeProps, sA.props, sB.props);
      const bPrime: V4Step[] = [
        {
          at: sB.at - sA.at,
          id: sA.newId,
          newId: sB.newId,
          op: 'split_node',
          ...(fixB.props ? { props: fixB.props } : {}),
        },
        ...(fixB.unset
          ? [{ id: sB.newId, op: 'set_props' as const, unset: fixB.unset }]
          : []),
      ];

      return { aPrime: [sA], bOutcome: 'applied', bPrime, ok: true };
    }

    const fixA = computeSplitPropsFixup(beforeProps, sB.props, sA.props);
    const aPrime: V4Step[] = [
      {
        at: sA.at - sB.at,
        id: sB.newId,
        newId: sA.newId,
        op: 'split_node',
        ...(fixA.props ? { props: fixA.props } : {}),
      },
      ...(fixA.unset
        ? [{ id: sA.newId, op: 'set_props' as const, unset: fixA.unset }]
        : []),
    ];

    return { aPrime, bOutcome: 'applied', bPrime: [sB], ok: true };
  }

  return wrapResult([split], [other]);
};

const transformJoinWithOther = (
  join: Extract<V4Step, { op: 'join_nodes' }>,
  other: V4Step,
  doc: DocSnapshotIndex,
  joinIsA: boolean
): V4PairTransform => {
  const targetInfo = doc.elements.get(join.target);
  const sourceInfo = doc.elements.get(join.source);

  if (!targetInfo || !sourceInfo) {
    return { ok: false, reason: 'target-deleted' };
  }

  const textBearing = isTextBearingElement(targetInfo.node);
  const leftLen = textBearing
    ? elementStreamLength(targetInfo.node)
    : targetInfo.node.children.length;
  const joinContainer = containerKeyOfElementInfo(sourceInfo);
  const sourceIndex = sourceInfo.index;

  const wrapResult = (
    joinPrime: readonly V4Step[],
    otherPrime: readonly V4Step[],
    otherOutcome: V4StepOutcome = 'applied'
  ): V4PairTransform =>
    joinIsA
      ? {
          aPrime: joinPrime,
          bOutcome: otherOutcome,
          bPrime: otherPrime,
          ok: true,
        }
      : {
          aPrime: otherPrime,
          bOutcome: joinPrime.length > 0 ? 'applied' : 'satisfied',
          bPrime: joinPrime,
          ok: true,
        };

  if (other.op === 'join_nodes') {
    if (other.target === join.target && other.source === join.source) {
      return { aPrime: [], bOutcome: 'satisfied', bPrime: [], ok: true };
    }
    if (
      other.target === join.target ||
      other.source === join.source ||
      other.target === join.source ||
      other.source === join.target
    ) {
      return { ok: false, reason: 'not-adjacent' };
    }

    return wrapResult([join], [other]);
  }

  if (other.op === 'set_props') {
    if (other.id === join.source) {
      return { ok: false, reason: 'target-deleted' };
    }

    return wrapResult([join], [other]);
  }

  if (
    other.op === 'insert_text' ||
    other.op === 'delete_text' ||
    other.op === 'format_text' ||
    other.op === 'wrap_inline'
  ) {
    if (other.target === join.source) {
      if (other.op === 'format_text' && other.length === 0) {
        const sourceLen = elementStreamLength(sourceInfo.node);

        if (leftLen === 0 && sourceLen === 0) {
          return wrapResult([join], [{ ...other, target: join.target }]);
        }

        return wrapResult([join], [], 'satisfied');
      }

      return wrapResult(
        [join],
        [{ ...other, offset: other.offset + leftLen, target: join.target }]
      );
    }

    return wrapResult([join], [other]);
  }

  if (other.op === 'unwrap_inline') {
    if (other.parent === join.source) {
      return wrapResult([join], [{ ...other, parent: join.target }]);
    }

    return wrapResult([join], [other]);
  }

  if (other.op === 'insert_node') {
    if ('id' in other.to && other.to.id === join.source) {
      if ('offset' in other.to) {
        return wrapResult(
          [join],
          [
            {
              ...other,
              to: { id: join.target, offset: other.to.offset + leftLen },
            },
          ]
        );
      }

      return wrapResult(
        [join],
        [
          {
            ...other,
            to: { id: join.target, index: other.to.index + leftLen },
          },
        ]
      );
    }

    if (
      !('offset' in other.to) &&
      containerKeyOfPlace(other.to) === joinContainer
    ) {
      if (other.to.index === sourceIndex) {
        // Inserting strictly between target and source breaks adjacency!
        return { ok: false, reason: 'not-adjacent' };
      }
      if (other.to.index > sourceIndex) {
        return wrapResult(
          [join],
          [{ ...other, to: placeWithIndex(other.to, other.to.index - 1) }]
        );
      }
    }

    return wrapResult([join], [other]);
  }

  if (other.op === 'move_node') {
    if (other.id === join.target || other.id === join.source) {
      return { ok: false, reason: 'not-adjacent' };
    }
    if ('id' in other.to && other.to.id === join.source) {
      if ('offset' in other.to) {
        return wrapResult(
          [join],
          [
            {
              ...other,
              to: { id: join.target, offset: other.to.offset + leftLen },
            },
          ]
        );
      }

      return wrapResult(
        [join],
        [
          {
            ...other,
            to: { id: join.target, index: other.to.index + leftLen },
          },
        ]
      );
    }

    if (
      !('offset' in other.to) &&
      containerKeyOfPlace(other.to) === joinContainer
    ) {
      const children = containerChildIds(doc, joinContainer);
      const withoutMoved = children.filter((cid) => cid !== other.id);
      const sourcePosAfter = withoutMoved.indexOf(join.source);

      if (sourcePosAfter !== -1 && other.to.index === sourcePosAfter) {
        return { ok: false, reason: 'not-adjacent' };
      }
      if (sourcePosAfter !== -1 && other.to.index > sourcePosAfter) {
        return wrapResult(
          [join],
          [{ ...other, to: placeWithIndex(other.to, other.to.index - 1) }]
        );
      }
    }

    return wrapResult([join], [other]);
  }

  return wrapResult([join], [other]);
};

const transformInlineRemoveWithText = (
  rem: Extract<V4Step, { op: 'remove_node' }>,
  remInfo: ElementInfo,
  other: V4Step,
  remIsA: boolean
): V4PairTransform | null => {
  if (
    !remInfo.parentTextBearing ||
    remInfo.parentId === null ||
    remInfo.inlineOffset === null
  ) {
    return null;
  }

  const { inlineOffset: inlineOff, parentId } = remInfo;
  const wrapResult = (
    remPrime: readonly V4Step[],
    otherPrime: readonly V4Step[],
    otherOutcome: V4StepOutcome = 'applied'
  ): V4PairTransform =>
    remIsA
      ? {
          aPrime: remPrime,
          bOutcome: otherOutcome,
          bPrime: otherPrime,
          ok: true,
        }
      : {
          aPrime: otherPrime,
          bOutcome: remPrime.length > 0 ? 'applied' : 'satisfied',
          bPrime: remPrime,
          ok: true,
        };

  if (other.op === 'insert_text' && other.target === parentId) {
    if (other.offset > inlineOff) {
      return wrapResult([rem], [{ ...other, offset: other.offset - 1 }]);
    }

    return wrapResult([rem], [other]);
  }

  if (other.op === 'delete_text' && other.target === parentId) {
    const dEnd = other.offset + other.length;

    if (dEnd <= inlineOff) return wrapResult([rem], [other]);
    if (other.offset > inlineOff) {
      return wrapResult([rem], [{ ...other, offset: other.offset - 1 }]);
    }

    // delete_text covers the removed inline unit!
    const shrunk: V4Step[] =
      other.length > 1 ? [{ ...other, length: other.length - 1 }] : [];

    return wrapResult([], shrunk, shrunk.length > 0 ? 'applied' : 'satisfied');
  }

  if (other.op === 'format_text' && other.target === parentId) {
    if (other.length === 0) return wrapResult([rem], [other]);
    const fEnd = other.offset + other.length;

    if (fEnd <= inlineOff) return wrapResult([rem], [other]);
    if (other.offset > inlineOff) {
      return wrapResult([rem], [{ ...other, offset: other.offset - 1 }]);
    }

    const shrunk: V4Step[] =
      other.length > 1 ? [{ ...other, length: other.length - 1 }] : [];

    return wrapResult(
      [rem],
      shrunk,
      shrunk.length > 0 ? 'applied' : 'satisfied'
    );
  }

  if (other.op === 'wrap_inline' && other.target === parentId) {
    const wEnd = other.offset + other.length;

    if (wEnd <= inlineOff) return wrapResult([rem], [other]);
    if (other.offset > inlineOff) {
      return wrapResult([rem], [{ ...other, offset: other.offset - 1 }]);
    }

    return { ok: false, reason: 'inline-wrap-crossing' };
  }

  if (
    other.op === 'insert_node' &&
    'offset' in other.to &&
    other.to.id === parentId
  ) {
    if (other.to.offset > inlineOff) {
      return wrapResult(
        [rem],
        [{ ...other, to: { id: parentId, offset: other.to.offset - 1 } }]
      );
    }

    return wrapResult([rem], [other]);
  }

  return null;
};

/**
 * Complete `14 x 14` single-step pair transformer (`a` admitted before `b` on
 * exact cell document `doc`). Every pair either returns an exact TP-1
 * convergent `{ aPrime, bPrime, bOutcome }` or an explicit escalation reason.
 */
export const transformV4StepPair = (
  doc: DocSnapshotIndex,
  a: V4Step,
  b: V4Step
): V4PairTransform => {
  // 1. Register ops (set_register)
  if (a.op === 'set_register' || b.op === 'set_register') {
    if (a.op !== 'set_register' || b.op !== 'set_register') {
      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }
    if (a.set !== b.set || a.id !== b.id) {
      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }

    const current = readRecord(
      getRecordSetVersion(getValueRecords(doc.value), a.set),
      a.id
    );
    const currentWriteId =
      isRecord(current) && typeof current.writeId === 'string'
        ? current.writeId
        : null;

    const aActive =
      a.expectedWriteId === undefined || a.expectedWriteId === currentWriteId;
    const bActive =
      b.expectedWriteId === undefined || b.expectedWriteId === currentWriteId;

    if (!aActive && !bActive) {
      return { aPrime: [], bOutcome: 'satisfied', bPrime: [], ok: true };
    }
    if (!aActive) {
      return { aPrime: [], bOutcome: 'applied', bPrime: [b], ok: true };
    }
    if (!bActive) {
      return { aPrime: [a], bOutcome: 'satisfied', bPrime: [], ok: true };
    }

    // Both active: if b is a CAS undo guarded on old writeId and a changed writeId,
    // b's CAS guard fails after a, so a wins and b becomes a no-op!
    if (b.expectedWriteId !== undefined && a.writeId !== b.expectedWriteId) {
      const unconditionalA: V4Step = {
        after: a.after,
        id: a.id,
        op: 'set_register',
        set: a.set,
        writeId: a.writeId,
      };

      return {
        aPrime: [unconditionalA],
        bOutcome: 'satisfied',
        bPrime: [],
        ok: true,
      };
    }

    // Forward LWW (or b's CAS still matches a.writeId): b wins in room order.
    const unconditionalB: V4Step = {
      after: b.after,
      id: b.id,
      op: 'set_register',
      set: b.set,
      writeId: b.writeId,
    };

    return {
      aPrime: [],
      bOutcome: 'applied',
      bPrime: [unconditionalB],
      ok: true,
    };
  }

  // 2. Root lifecycle (create_root, delete_root)
  if (a.op === 'create_root' || b.op === 'create_root') {
    if (a.op === 'create_root' && b.op === 'create_root') {
      if (a.root === b.root) {
        return { aPrime: [], bOutcome: 'satisfied', bPrime: [], ok: true };
      }

      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }

    const createStep =
      a.op === 'create_root'
        ? a
        : (b as Extract<V4Step, { op: 'create_root' }>);
    const other = a.op === 'create_root' ? b : a;

    if (referencedRoots(doc, other).includes(createStep.root)) {
      return { ok: false, reason: 'root-conflict' };
    }

    return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
  }

  if (a.op === 'delete_root' || b.op === 'delete_root') {
    if (a.op === 'delete_root' && b.op === 'delete_root') {
      if (a.root === b.root) {
        return { aPrime: [], bOutcome: 'satisfied', bPrime: [], ok: true };
      }

      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }

    const delIsA = a.op === 'delete_root';
    const delStep = delIsA ? a : (b as Extract<V4Step, { op: 'delete_root' }>);
    const other = delIsA ? b : a;

    if (referencedRoots(doc, other).includes(delStep.root)) {
      if (other.op === 'remove_node') {
        return delIsA
          ? { aPrime: [delStep], bOutcome: 'satisfied', bPrime: [], ok: true }
          : { aPrime: [], bOutcome: 'applied', bPrime: [delStep], ok: true };
      }

      return { ok: false, reason: 'target-deleted' };
    }

    return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
  }

  // 3. remove_node vs everything
  if (a.op === 'remove_node' || b.op === 'remove_node') {
    if (a.op === 'remove_node' && b.op === 'remove_node') {
      if (a.id === b.id) {
        return { aPrime: [], bOutcome: 'satisfied', bPrime: [], ok: true };
      }
      if (isInSubtree(doc, b.id, a.id)) {
        return { aPrime: [a], bOutcome: 'satisfied', bPrime: [], ok: true };
      }
      if (isInSubtree(doc, a.id, b.id)) {
        return { aPrime: [], bOutcome: 'applied', bPrime: [b], ok: true };
      }

      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }

    const remIsA = a.op === 'remove_node';
    const rem = remIsA ? a : (b as Extract<V4Step, { op: 'remove_node' }>);
    const other = remIsA ? b : a;
    const remInfo = doc.elements.get(rem.id);

    if (!remInfo) return { ok: false, reason: 'target-deleted' };

    // Any op referencing rem.id or its descendants -> target-deleted
    // (includes R1-R3 remove_node(p1/p2) vs join_nodes(p1, p2)!)
    for (const refId of referencedElementIds(other)) {
      if (isInSubtree(doc, refId, rem.id)) {
        return { ok: false, reason: 'target-deleted' };
      }
    }

    // Inline remove inside a text-bearing parent
    const inlineHandled = transformInlineRemoveWithText(
      rem,
      remInfo,
      other,
      remIsA
    );

    if (inlineHandled) return inlineHandled;

    // Sibling index shifts in remInfo's container
    if (other.op === 'split_node') {
      return transformSplitWithOther(other, rem, doc, !remIsA);
    }

    const remContainer = containerKeyOfElementInfo(remInfo);

    if (other.op === 'insert_node' && !('offset' in other.to)) {
      if (
        containerKeyOfPlace(other.to) === remContainer &&
        other.to.index > remInfo.index
      ) {
        const shifted: V4Step = {
          ...other,
          to: placeWithIndex(other.to, other.to.index - 1),
        };

        return remIsA
          ? { aPrime: [rem], bOutcome: 'applied', bPrime: [shifted], ok: true }
          : { aPrime: [shifted], bOutcome: 'applied', bPrime: [rem], ok: true };
      }

      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }

    if (other.op === 'move_node') {
      if (
        !('offset' in other.to) &&
        containerKeyOfPlace(other.to) === remContainer
      ) {
        const children = containerChildIds(doc, remContainer);
        const nextIdx = countRemainingBefore(
          children,
          other.id,
          other.to.index,
          rem.id
        );
        const shifted: V4Step = {
          ...other,
          to: placeWithIndex(other.to, nextIdx),
        };

        return remIsA
          ? { aPrime: [rem], bOutcome: 'applied', bPrime: [shifted], ok: true }
          : { aPrime: [shifted], bOutcome: 'applied', bPrime: [rem], ok: true };
      }
      if (
        'offset' in other.to &&
        remInfo.parentTextBearing &&
        remInfo.parentId === other.to.id &&
        remInfo.inlineOffset !== null &&
        other.to.offset > remInfo.inlineOffset
      ) {
        const shifted: V4Step = {
          ...other,
          to: { id: other.to.id, offset: other.to.offset - 1 },
        };

        return remIsA
          ? { aPrime: [rem], bOutcome: 'applied', bPrime: [shifted], ok: true }
          : { aPrime: [shifted], bOutcome: 'applied', bPrime: [rem], ok: true };
      }

      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }

    return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
  }

  // 4. delete_text deleting an existing inline element referenced by the other step
  if (a.op === 'delete_text') {
    const hit = transformDeleteTextWithDeletedInline(a, b, doc, true);

    if (hit) return hit;
  }
  if (b.op === 'delete_text') {
    const hit = transformDeleteTextWithDeletedInline(b, a, doc, false);

    if (hit) return hit;
  }

  // 5. split_node vs everything remaining
  if (a.op === 'split_node') {
    return transformSplitWithOther(a, b, doc, true);
  }
  if (b.op === 'split_node') {
    return transformSplitWithOther(b, a, doc, false);
  }

  // 6. join_nodes vs everything remaining
  if (a.op === 'join_nodes') {
    return transformJoinWithOther(a, b, doc, true);
  }
  if (b.op === 'join_nodes') {
    return transformJoinWithOther(b, a, doc, false);
  }

  // 7. unwrap_inline vs everything remaining
  if (a.op === 'unwrap_inline' || b.op === 'unwrap_inline') {
    if (a.op === 'unwrap_inline' && b.op === 'unwrap_inline') {
      if (a.id === b.id) {
        return { aPrime: [], bOutcome: 'satisfied', bPrime: [], ok: true };
      }

      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }

    const unwrapIsA = a.op === 'unwrap_inline';
    const unwrap = unwrapIsA
      ? a
      : (b as Extract<V4Step, { op: 'unwrap_inline' }>);
    const other = unwrapIsA ? b : a;
    const inlineInfo = doc.elements.get(unwrap.id);

    if (!inlineInfo || inlineInfo.inlineOffset === null) {
      return { ok: false, reason: 'target-deleted' };
    }

    const inlineOff = inlineInfo.inlineOffset;
    const innerLen = elementStreamLength(inlineInfo.node);

    // Ops targeting the unwrapped inline itself
    if (other.op === 'set_props' && other.id === unwrap.id) {
      return { ok: false, reason: 'target-deleted' };
    }
    if (other.op === 'move_node' && other.id === unwrap.id) {
      return { ok: false, reason: 'target-deleted' };
    }
    if (
      (other.op === 'insert_text' ||
        other.op === 'delete_text' ||
        other.op === 'format_text' ||
        other.op === 'wrap_inline') &&
      other.target === unwrap.id
    ) {
      if (other.op === 'format_text' && other.length === 0) {
        return { ok: false, reason: 'inline-wrap-crossing' };
      }

      const lifted: V4Step = {
        ...other,
        offset: inlineOff + other.offset,
        target: unwrap.parent,
      };

      return unwrapIsA
        ? { aPrime: [unwrap], bOutcome: 'applied', bPrime: [lifted], ok: true }
        : { aPrime: [lifted], bOutcome: 'applied', bPrime: [unwrap], ok: true };
    }
    if (
      other.op === 'insert_node' &&
      'offset' in other.to &&
      other.to.id === unwrap.id
    ) {
      const lifted: V4Step = {
        ...other,
        to: { id: unwrap.parent, offset: inlineOff + other.to.offset },
      };

      return unwrapIsA
        ? { aPrime: [unwrap], bOutcome: 'applied', bPrime: [lifted], ok: true }
        : { aPrime: [lifted], bOutcome: 'applied', bPrime: [unwrap], ok: true };
    }
    if (
      other.op === 'move_node' &&
      'offset' in other.to &&
      other.to.id === unwrap.id
    ) {
      return { ok: false, reason: 'inline-wrap-crossing' };
    }

    // Ops targeting the parent of unwrap_inline
    if (isTextStep(other) && other.target === unwrap.parent) {
      return transformUnwrapInlineWithText(
        unwrap,
        inlineOff,
        innerLen,
        other,
        unwrapIsA
      );
    }
    if (other.op === 'wrap_inline' && other.target === unwrap.parent) {
      const wEnd = other.offset + other.length;

      if (inlineOff < other.offset) {
        const shifted: V4Step = {
          ...other,
          offset: other.offset + (innerLen - 1),
        };

        return unwrapIsA
          ? {
              aPrime: [unwrap],
              bOutcome: 'applied',
              bPrime: [shifted],
              ok: true,
            }
          : {
              aPrime: [shifted],
              bOutcome: 'applied',
              bPrime: [unwrap],
              ok: true,
            };
      }
      if (inlineOff >= wEnd) {
        return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
      }

      return { ok: false, reason: 'inline-wrap-crossing' };
    }
    if (
      other.op === 'insert_node' &&
      'offset' in other.to &&
      other.to.id === unwrap.parent
    ) {
      if (other.to.offset > inlineOff) {
        const shifted: V4Step = {
          ...other,
          to: {
            id: unwrap.parent,
            offset: other.to.offset + (innerLen - 1),
          },
        };

        return unwrapIsA
          ? {
              aPrime: [unwrap],
              bOutcome: 'applied',
              bPrime: [shifted],
              ok: true,
            }
          : {
              aPrime: [shifted],
              bOutcome: 'applied',
              bPrime: [unwrap],
              ok: true,
            };
      }

      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }
    if (
      other.op === 'move_node' &&
      'offset' in other.to &&
      other.to.id === unwrap.parent
    ) {
      return { ok: false, reason: 'inline-wrap-crossing' };
    }

    return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
  }

  // 8. wrap_inline vs everything remaining
  if (a.op === 'wrap_inline' || b.op === 'wrap_inline') {
    if (a.op === 'wrap_inline' && b.op === 'wrap_inline') {
      if (a.target !== b.target) {
        return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
      }
      if (a.node.id === b.node.id) {
        return { ok: false, reason: 'inline-wrap-crossing' };
      }

      const aEnd = a.offset + a.length;
      const bEnd = b.offset + b.length;

      if (
        aEnd <= b.offset &&
        !(a.length === 0 && b.length === 0 && a.offset === b.offset)
      ) {
        return {
          aPrime: [a],
          bOutcome: 'applied',
          bPrime: [{ ...b, offset: b.offset + (1 - a.length) }],
          ok: true,
        };
      }
      if (
        bEnd <= a.offset &&
        !(a.length === 0 && b.length === 0 && a.offset === b.offset)
      ) {
        return {
          aPrime: [{ ...a, offset: a.offset + (1 - b.length) }],
          bOutcome: 'applied',
          bPrime: [b],
          ok: true,
        };
      }

      return { ok: false, reason: 'inline-wrap-crossing' };
    }

    const wrapIsA = a.op === 'wrap_inline';
    const wrap = wrapIsA ? a : (b as Extract<V4Step, { op: 'wrap_inline' }>);
    const other = wrapIsA ? b : a;

    if (isTextStep(other) && other.target === wrap.target) {
      return transformWrapInlineWithText(wrap, other, wrapIsA);
    }
    if (
      other.op === 'insert_node' &&
      'offset' in other.to &&
      other.to.id === wrap.target
    ) {
      const wStart = wrap.offset;
      const wEnd = wrap.offset + wrap.length;
      const wrapperId = wrap.node.id;

      if (typeof wrapperId !== 'string' || wrapperId.length === 0) {
        return { ok: false, reason: 'inline-wrap-crossing' };
      }
      if (other.to.offset <= wStart) {
        const nextWrap: V4Step = { ...wrap, offset: wStart + 1 };

        return wrapIsA
          ? {
              aPrime: [nextWrap],
              bOutcome: 'applied',
              bPrime: [other],
              ok: true,
            }
          : {
              aPrime: [other],
              bOutcome: 'applied',
              bPrime: [nextWrap],
              ok: true,
            };
      }
      if (other.to.offset >= wEnd) {
        const nextIns: V4Step = {
          ...other,
          to: { id: wrap.target, offset: other.to.offset + (1 - wrap.length) },
        };

        return wrapIsA
          ? { aPrime: [wrap], bOutcome: 'applied', bPrime: [nextIns], ok: true }
          : {
              aPrime: [nextIns],
              bOutcome: 'applied',
              bPrime: [wrap],
              ok: true,
            };
      }

      return { ok: false, reason: 'inline-wrap-crossing' };
    }
    if (
      other.op === 'move_node' &&
      (('offset' in other.to && other.to.id === wrap.target) ||
        doc.elements.get(other.id)?.parentId === wrap.target)
    ) {
      return { ok: false, reason: 'inline-wrap-crossing' };
    }

    return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
  }

  // 9. set_props vs remaining (insert_text, delete_text, format_text, insert_node, move_node, set_props)
  if (a.op === 'set_props' || b.op === 'set_props') {
    if (a.op === 'set_props' && b.op === 'set_props') {
      if (a.id !== b.id) {
        return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
      }

      const rem = stripOverriddenPropDelta(
        propDeltaFromStep(a),
        propDeltaFromStep(b)
      );

      return {
        aPrime: isEmptyPropDelta(rem)
          ? []
          : [{ ...rem, id: a.id, op: 'set_props' }],
        bOutcome: 'applied',
        bPrime: [b],
        ok: true,
      };
    }

    return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
  }

  // 10. 1D text ops vs 1D text ops
  if (isTextStep(a) && isTextStep(b)) {
    if (a.target !== b.target) {
      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }

    return transformSameTargetTextPair(a, b);
  }

  // 11. move_node vs remaining (move_node, insert_node, text ops)
  if (a.op === 'move_node' || b.op === 'move_node') {
    if (a.op === 'move_node' && b.op === 'move_node') {
      if (a.id === b.id) {
        if (placesEqual(a.to, b.to)) {
          return { aPrime: [], bOutcome: 'satisfied', bPrime: [], ok: true };
        }

        return { ok: false, reason: 'move-conflict' };
      }

      // Cycle check: moving a into b's subtree and b into a's subtree
      const aDestId = 'id' in a.to ? a.to.id : null;
      const bDestId = 'id' in b.to ? b.to.id : null;

      if (
        aDestId !== null &&
        bDestId !== null &&
        isInSubtree(doc, aDestId, b.id) &&
        isInSubtree(doc, bDestId, a.id)
      ) {
        return { ok: false, reason: 'cycle' };
      }

      const infoA = doc.elements.get(a.id);
      const infoB = doc.elements.get(b.id);

      if (!infoA || !infoB) return { ok: false, reason: 'target-deleted' };

      // Inline moves into/out of text-bearing elements
      if (
        'offset' in a.to ||
        'offset' in b.to ||
        infoA.parentTextBearing ||
        infoB.parentTextBearing
      ) {
        if (
          containerKeyOfPlace(a.to) === containerKeyOfPlace(b.to) ||
          containerKeyOfElementInfo(infoA) === containerKeyOfPlace(b.to) ||
          containerKeyOfElementInfo(infoB) === containerKeyOfPlace(a.to)
        ) {
          return { ok: false, reason: 'move-conflict' };
        }

        return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
      }

      const destA = containerKeyOfPlace(a.to);
      const destB = containerKeyOfPlace(b.to);
      const childrenDestA = containerChildIds(doc, destA);
      const childrenDestB = containerChildIds(doc, destB);
      const kA = countRemainingBefore(childrenDestA, a.id, a.to.index, b.id);
      const kB = countRemainingBefore(childrenDestB, b.id, b.to.index, a.id);

      if (destA === destB) {
        if (kA <= kB) {
          return {
            aPrime: [{ ...a, to: placeWithIndex(a.to, kA) }],
            bOutcome: 'applied',
            bPrime: [{ ...b, to: placeWithIndex(b.to, kB + 1) }],
            ok: true,
          };
        }

        return {
          aPrime: [{ ...a, to: placeWithIndex(a.to, kA + 1) }],
          bOutcome: 'applied',
          bPrime: [{ ...b, to: placeWithIndex(b.to, kB) }],
          ok: true,
        };
      }

      return {
        aPrime: [{ ...a, to: placeWithIndex(a.to, kA) }],
        bOutcome: 'applied',
        bPrime: [{ ...b, to: placeWithIndex(b.to, kB) }],
        ok: true,
      };
    }

    const moveIsA = a.op === 'move_node';
    const move = moveIsA ? a : (b as Extract<V4Step, { op: 'move_node' }>);
    const other = moveIsA ? b : a;
    const moveInfo = doc.elements.get(move.id);

    if (!moveInfo) return { ok: false, reason: 'target-deleted' };

    if (other.op === 'insert_node') {
      if (
        'offset' in move.to ||
        'offset' in other.to ||
        moveInfo.parentTextBearing
      ) {
        if (
          containerKeyOfPlace(move.to) === containerKeyOfPlace(other.to) ||
          containerKeyOfElementInfo(moveInfo) === containerKeyOfPlace(other.to)
        ) {
          return { ok: false, reason: 'move-conflict' };
        }

        return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
      }

      const oldC = containerKeyOfElementInfo(moveInfo);
      const destC = containerKeyOfPlace(move.to);
      const insC = containerKeyOfPlace(other.to);

      let insIdxAfterRem = other.to.index;

      if (insC === oldC && other.to.index > moveInfo.index) {
        insIdxAfterRem -= 1;
      }

      let nextMoveIdx = move.to.index;
      let nextInsIdx = insIdxAfterRem;

      if (insC === destC) {
        if (moveIsA) {
          if (move.to.index <= insIdxAfterRem) nextInsIdx += 1;
          else nextMoveIdx += 1;
        } else if (insIdxAfterRem <= move.to.index) {
          nextMoveIdx += 1;
        } else {
          nextInsIdx += 1;
        }
      }

      const nextMove: V4Step = {
        ...move,
        to: placeWithIndex(move.to, nextMoveIdx),
      };
      const nextIns: V4Step = {
        ...other,
        to: placeWithIndex(other.to, nextInsIdx),
      };

      return moveIsA
        ? {
            aPrime: [nextMove],
            bOutcome: 'applied',
            bPrime: [nextIns],
            ok: true,
          }
        : {
            aPrime: [nextIns],
            bOutcome: 'applied',
            bPrime: [nextMove],
            ok: true,
          };
    }

    // move_node vs 1D text step
    if (isTextStep(other)) {
      const touchesMovedTextParent =
        (moveInfo.parentTextBearing && moveInfo.parentId === other.target) ||
        ('offset' in move.to && move.to.id === other.target);

      if (touchesMovedTextParent) {
        return { ok: false, reason: 'move-conflict' };
      }

      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }

    return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
  }

  // 12. insert_node vs remaining (insert_node, text ops)
  if (a.op === 'insert_node' && b.op === 'insert_node') {
    if (a.node.id !== undefined && a.node.id === b.node.id) {
      return { ok: false, reason: 'move-conflict' };
    }

    if (containerKeyOfPlace(a.to) !== containerKeyOfPlace(b.to)) {
      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }

    const posA = 'offset' in a.to ? a.to.offset : a.to.index;
    const posB = 'offset' in b.to ? b.to.offset : b.to.index;

    if (posA <= posB) {
      return {
        aPrime: [a],
        bOutcome: 'applied',
        bPrime: [{ ...b, to: placeWithIndex(b.to, posB + 1) }],
        ok: true,
      };
    }

    return {
      aPrime: [{ ...a, to: placeWithIndex(a.to, posA + 1) }],
      bOutcome: 'applied',
      bPrime: [b],
      ok: true,
    };
  }

  if (a.op === 'insert_node' && isTextStep(b)) {
    if ('offset' in a.to && a.to.id === b.target) {
      return transformInlineInsertWithText(
        a as Extract<V4Step, { op: 'insert_node' }> & {
          to: Readonly<{ id: string; offset: number }>;
        },
        b,
        true
      );
    }

    return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
  }

  if (isTextStep(a) && b.op === 'insert_node') {
    if ('offset' in b.to && b.to.id === a.target) {
      return transformInlineInsertWithText(
        b as Extract<V4Step, { op: 'insert_node' }> & {
          to: Readonly<{ id: string; offset: number }>;
        },
        a,
        false
      );
    }

    return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
  }

  return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
};

export type V4RebaseResult =
  | Readonly<{
      aPrime: readonly V4Step[];
      after: JsonEditorValue;
      bOutcomes: readonly V4StepOutcome[];
      bPrime: readonly V4Step[];
      ok: true;
    }>
  | Readonly<{
      ok: false;
      reason: V4EscalationReason;
    }>;

const transformStepArrays = (
  base: JsonEditorValue,
  aSteps: readonly V4Step[],
  bSteps: readonly V4Step[]
):
  | Readonly<{
      aPrime: readonly V4Step[];
      bPrime: readonly V4Step[];
      hadSatisfied: boolean;
      ok: true;
    }>
  | Readonly<{ ok: false; reason: V4EscalationReason }> => {
  let curA: readonly V4Step[] = aSteps;
  const bPrime: V4Step[] = [];
  let hadSatisfied = false;
  let rowBase = base;

  for (const bStep of bSteps) {
    let curB: readonly V4Step[] = [bStep];
    const nextA: V4Step[] = [];
    let colDoc = rowBase;

    for (const aStep of curA) {
      let aPieces: readonly V4Step[] = [aStep];
      const nextB: V4Step[] = [];
      let bDoc = colDoc;

      for (const bPiece of curB) {
        let curBPieces: readonly V4Step[] = [bPiece];
        const nextAPieces: V4Step[] = [];
        let aDoc = bDoc;

        for (const aPiece of aPieces) {
          const nextBPieces: V4Step[] = [];
          let cellDoc = aDoc;
          let curAPiece: readonly V4Step[] = [aPiece];

          for (const bp of curBPieces) {
            const subNextA: V4Step[] = [];
            let subDoc = cellDoc;
            let curBp: readonly V4Step[] = [bp];

            for (const ap of curAPiece) {
              const subNextB: V4Step[] = [];
              let leafDoc = subDoc;
              let leafA: readonly V4Step[] = [ap];

              for (const bAtom of curBp) {
                const pairRes = transformV4StepPair(
                  indexDoc(leafDoc),
                  getDefined(leafA[0]),
                  bAtom
                );

                if (!pairRes.ok) return pairRes;
                if (pairRes.bOutcome === 'satisfied') hadSatisfied = true;

                // If leafA had length 1 (normal case), recurse cleanly when aPrime splits
                if (leafA.length === 1) {
                  leafDoc = applyV4Steps(leafDoc, [bAtom]);
                  leafA = pairRes.aPrime;
                  subNextB.push(...pairRes.bPrime);
                } else {
                  const nested = transformStepArrays(leafDoc, leafA, [bAtom]);

                  if (!nested.ok) return nested;
                  if (nested.hadSatisfied) hadSatisfied = true;
                  leafDoc = applyV4Steps(leafDoc, [bAtom]);
                  leafA = nested.aPrime;
                  subNextB.push(...nested.bPrime);
                }

                if (leafA.length === 0) {
                  // Remaining b atoms in curBp pass untouched past empty leafA
                  const idx = curBp.indexOf(bAtom);

                  for (let rest = idx + 1; rest < curBp.length; rest += 1) {
                    subNextB.push(getDefined(curBp[rest]));
                  }
                  break;
                }
              }
              subDoc = applyV4Steps(subDoc, [ap]);
              subNextA.push(...leafA);
              curBp = subNextB;
            }

            cellDoc = applyV4Steps(cellDoc, [bp]);
            nextBPieces.push(...curBp);
            curAPiece = subNextA;
          }

          aDoc = applyV4Steps(aDoc, [aPiece]);
          nextAPieces.push(...curAPiece);
          curBPieces = nextBPieces;
        }

        bDoc = applyV4Steps(bDoc, [bPiece]);
        nextB.push(...curBPieces);
        aPieces = nextAPieces;
      }

      colDoc = applyV4Steps(colDoc, [aStep]);
      nextA.push(...aPieces);
      curB = nextB;
    }

    rowBase = applyV4Steps(rowBase, [bStep]);
    curA = nextA;
    bPrime.push(...curB);
  }

  return { aPrime: curA, bPrime, hadSatisfied, ok: true };
};

/**
 * Full 2D multi-step OT diamond tracking exact cell documents and real
 * per-original-step outcomes (`applied` | `satisfied`). Private Step 3 entry
 * point; wired into public `DocumentChange.transform` and internal
 * `rebaseDocumentChange` in Step 5.
 *
 * @internal
 */
export const rebaseV4Changes = (
  base: JsonEditorValue,
  aSteps: readonly V4Step[],
  bSteps: readonly V4Step[]
): V4RebaseResult => {
  if (aSteps.length === 0) {
    return {
      aPrime: [],
      after: applyV4Steps(base, bSteps),
      bOutcomes: bSteps.map(() => 'applied' as const),
      bPrime: bSteps,
      ok: true,
    };
  }
  if (bSteps.length === 0) {
    return {
      aPrime: aSteps,
      after: applyV4Steps(base, aSteps),
      bOutcomes: [],
      bPrime: [],
      ok: true,
    };
  }

  let curA: readonly V4Step[] = aSteps;
  const bPrime: V4Step[] = [];
  const bOutcomes: V4StepOutcome[] = [];
  let rowBase = base;

  for (const bStep of bSteps) {
    const res = transformStepArrays(rowBase, curA, [bStep]);

    if (!res.ok) return res;
    bPrime.push(...res.bPrime);
    bOutcomes.push(
      res.bPrime.length > 0
        ? 'applied'
        : res.hadSatisfied
          ? 'satisfied'
          : 'applied'
    );
    curA = res.aPrime;
    rowBase = applyV4Steps(rowBase, [bStep]);
  }

  const afterA = applyV4Steps(base, aSteps);
  const after = applyV4Steps(afterA, bPrime);

  return {
    aPrime: curA,
    after,
    bOutcomes,
    bPrime,
    ok: true,
  };
};
