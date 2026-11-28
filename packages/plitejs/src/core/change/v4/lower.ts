import { getDefined } from '../../../internal/get-defined';
import {
  classifyRootChange,
  type DocumentChangeRootClassification,
} from '../classification';
import { DocumentIndex, rootIndexOf } from '../document-index';
import { unwrapNodeChange, wrapChildrenChange } from '../enclosure';
import { cloneJson, jsonEqual, type JsonRecord } from '../json';
import { lazyRootOf, visitRootNames } from '../lazy-root';
import {
  insertNodeChange,
  insertTextChange,
  mergeNodeChange,
  moveNodeChange,
  removeNodeChange,
  removeTextChange,
  RootChange,
  type RootChangeJson,
  setNodeChange,
  splitNodeChange,
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
  applyDeleteTextToChildren,
  applyFormatTextToChildren,
  applyInsertTextToChildren,
  applyV4Steps,
  fromV4TextStream,
  isTextBearingElement,
  toV4TextStream,
} from './apply';
import { applyPropDeltaToRecord, v4RootLifecycle, type V4Step } from './types';

export type ValueElementLocation = Readonly<{
  path: readonly number[];
  root: string;
}>;

export type ValueIdLookup = (id: string) => ValueElementLocation | null;

const VALUE_ID_LOOKUPS = new WeakMap<JsonEditorValue, ValueIdLookup>();
const COLD_ID_MAPS = new WeakMap<
  JsonEditorValue,
  Map<string, ValueElementLocation>
>();

/**
 * Attach an O(log N) element ID lookup to an indexed snapshot value so sparse
 * v4 lowering never scans unchanged blocks.
 */
export const registerValueIdLookup = (
  value: JsonEditorValue,
  lookup: ValueIdLookup
) => {
  VALUE_ID_LOOKUPS.set(value, lookup);
};

export const getValueIdLookup = (
  value: JsonEditorValue
): ValueIdLookup | undefined => VALUE_ID_LOOKUPS.get(value);

const coldLookupFor = (value: JsonEditorValue): ValueIdLookup => {
  let map = COLD_ID_MAPS.get(value);

  if (!map) {
    const built = new Map<string, ValueElementLocation>();
    const walk = (
      root: string,
      nodes: readonly JsonNode[],
      prefix: readonly number[]
    ) => {
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];

        if (!isElementNode(node)) continue;
        const path = [...prefix, i];

        if (typeof node.id === 'string' && node.id.length > 0) {
          built.set(node.id, { path, root });
        }
        walk(root, node.children, path);
      }
    };

    walk('main', value.children, []);
    if (value.roots) {
      for (const root of visitRootNames(value.roots)) {
        walk(root, value.roots[root], []);
      }
    }
    COLD_ID_MAPS.set(value, built);
    map = built;
  }

  return (id: string) => map.get(id) ?? null;
};

export type LoweredV4Result = Readonly<{
  classifications: ReadonlyMap<string, DocumentChangeRootClassification>;
  createRoots: ReadonlySet<string>;
  deleteRoots: ReadonlySet<string>;
  roots: ReadonlyMap<string, RootChange>;
}>;

const LOWERED_CACHE = new WeakMap<
  object,
  WeakMap<JsonEditorValue, LoweredV4Result>
>();

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

/**
 * Compute a sparse `RootChange` for a single v4 step directly on a
 * `DocumentIndex`, touching ONLY the target element/parent in O(log N) without
 * scanning unchanged sibling blocks. Returns `null` when a multi-root move or
 * complex structural case should fall back to general lowering.
 */
const lowerSingleStepSparselyOnIndex = (
  getIndex: (root: string) => DocumentIndex,
  lookup: ValueIdLookup,
  step: V4Step
): Readonly<{
  afterNode?: JsonElementNode;
  change: RootChange;
  nodePath?: readonly number[];
  root: string;
}> | null => {
  switch (step.op) {
    case 'insert_text':
    case 'delete_text':
    case 'format_text':
    case 'wrap_inline': {
      const loc = lookup(step.target);

      if (!loc) return null;

      const docIndex = getIndex(loc.root);
      const node = docIndex.node(loc.path);

      if (!isElementNode(node)) return null;

      const beforeChildren = node.children;
      let afterChildren: JsonNode[];

      if (step.op === 'insert_text') {
        if (step.text.length === 0) {
          return { change: RootChange.empty(docIndex.length), root: loc.root };
        }
        if (beforeChildren.length === 1 && isTextNode(beforeChildren[0])) {
          const leaf = beforeChildren[0];
          const { text: leafText, ...leafMarks } = leaf;
          const stepMarks = step.marks ?? {};

          if (
            step.offset >= 0 &&
            step.offset <= leafText.length &&
            jsonEqual(leafMarks, stepMarks)
          ) {
            const nextLeaf = {
              ...leaf,
              text:
                leafText.slice(0, step.offset) +
                step.text +
                leafText.slice(step.offset),
            };

            return {
              afterNode: { ...node, children: [nextLeaf] },
              change: insertTextChange(
                docIndex,
                [...loc.path, 0],
                step.offset,
                step.text
              ),
              nodePath: loc.path,
              root: loc.root,
            };
          }
        }
        afterChildren = applyInsertTextToChildren(
          beforeChildren,
          step.offset,
          step.text,
          step.marks,
          step.target
        ).children;
      } else if (step.op === 'delete_text') {
        if (step.length === 0) {
          return { change: RootChange.empty(docIndex.length), root: loc.root };
        }
        if (beforeChildren.length === 1 && isTextNode(beforeChildren[0])) {
          const leaf = beforeChildren[0];

          if (
            step.offset >= 0 &&
            step.offset + step.length <= leaf.text.length &&
            step.length < leaf.text.length
          ) {
            const removed = leaf.text.slice(
              step.offset,
              step.offset + step.length
            );
            const nextLeaf = {
              ...leaf,
              text:
                leaf.text.slice(0, step.offset) +
                leaf.text.slice(step.offset + step.length),
            };

            return {
              afterNode: { ...node, children: [nextLeaf] },
              change: removeTextChange(
                docIndex,
                [...loc.path, 0],
                step.offset,
                removed
              ),
              nodePath: loc.path,
              root: loc.root,
            };
          }
        }
        afterChildren = applyDeleteTextToChildren(
          beforeChildren,
          step.offset,
          step.length,
          step.target
        ).children;
      } else if (step.op === 'format_text') {
        const formatted = applyFormatTextToChildren(
          beforeChildren,
          step.offset,
          step.length,
          step,
          step.target
        );

        if (formatted.noop) {
          return {
            change: RootChange.empty(docIndex.length),
            root: loc.root,
          };
        }
        afterChildren = formatted.children;

        let cursor = 0;
        let aligned = step.length > 0;
        const touchedLeaves: number[] = [];

        for (let index = 0; index < beforeChildren.length; index += 1) {
          const child = beforeChildren[index];
          const childLen = isTextNode(child) ? child.text.length : 1;
          const childStart = cursor;
          const childEnd = cursor + childLen;

          cursor = childEnd;
          if (
            childEnd <= step.offset ||
            childStart >= step.offset + step.length
          ) {
            continue;
          }
          if (
            !isTextNode(child) ||
            childStart < step.offset ||
            childEnd > step.offset + step.length
          ) {
            aligned = false;
            break;
          }
          touchedLeaves.push(index);
        }

        if (aligned && touchedLeaves.length > 0) {
          let propChange: RootChange | null = null;
          const intermediate = [...beforeChildren];

          for (const index of touchedLeaves) {
            const beforeChild = beforeChildren[index];

            if (!isTextNode(beforeChild)) continue;
            const beforeProps = nodeProps(beforeChild);
            const afterProps = applyPropDeltaToRecord(beforeProps, step);
            const newProps: JsonRecord = {};
            const oldProps: JsonRecord = {};
            const keys = new Set([
              ...Object.keys(beforeProps),
              ...Object.keys(afterProps),
            ]);

            for (const key of keys) {
              if (jsonEqual(beforeProps[key], afterProps[key])) continue;
              if (Object.hasOwn(beforeProps, key)) {
                oldProps[key] = beforeProps[key];
              }
              if (Object.hasOwn(afterProps, key)) {
                newProps[key] = afterProps[key];
              }
            }
            if (
              Object.keys(newProps).length === 0 &&
              Object.keys(oldProps).length === 0
            ) {
              continue;
            }
            intermediate[index] = { ...afterProps, text: beforeChild.text };
            const patch = setNodeChange(
              docIndex,
              [...loc.path, index],
              newProps,
              oldProps
            );

            propChange = propChange ? propChange.compose(patch) : patch;
          }

          if (propChange) {
            let finalChange = propChange;
            const coalesceRanges: Array<readonly [number, number]> = [];
            let pos = docIndex.nodeRange(loc.path).from + 1;

            for (let index = 0; index < intermediate.length; index += 1) {
              const child = intermediate[index];
              const childRange = docIndex.nodeRange([...loc.path, index]);
              const childTokenLen = childRange.to - childRange.from;

              if (
                index + 1 < intermediate.length &&
                isTextNode(child) &&
                isTextNode(intermediate[index + 1]) &&
                jsonEqual(nodeProps(child), nodeProps(intermediate[index + 1]))
              ) {
                coalesceRanges.push([
                  pos + childTokenLen - 1,
                  pos + childTokenLen + 1,
                ]);
              }
              pos += childTokenLen;
            }

            if (coalesceRanges.length > 0) {
              const sections: Array<RootChangeJson[number]> = [];
              let at = 0;

              for (const [delFrom, delTo] of coalesceRanges) {
                if (delFrom > at) sections.push({ length: delFrom - at });
                sections.push({ length: delTo - delFrom, replacement: [] });
                at = delTo;
              }
              if (docIndex.length > at) {
                sections.push({ length: docIndex.length - at });
              }
              finalChange = finalChange.compose(RootChange.fromJSON(sections));
            }

            return {
              afterNode: { ...node, children: afterChildren },
              change: finalChange,
              nodePath: loc.path,
              root: loc.root,
            };
          }
        }
      } else {
        const stream = toV4TextStream(beforeChildren);
        const wrapped = stream.units.splice(step.offset, step.length);
        const wrapper: JsonElementNode = {
          ...cloneJson(step.node),
          children: fromV4TextStream(wrapped),
        };

        stream.units.splice(step.offset, 0, { kind: 'inline', node: wrapper });
        afterChildren = fromV4TextStream(stream.units, stream.emptyLeafMarks);
      }

      if (jsonEqual(beforeChildren, afterChildren)) {
        return { change: RootChange.empty(docIndex.length), root: loc.root };
      }

      const range = docIndex.nodeRange(loc.path);
      const beforeInner = DocumentIndex.fromValue(beforeChildren);
      const afterInner = DocumentIndex.fromValue(afterChildren);
      const local = RootChange.betweenWhole(beforeInner, afterInner);

      return {
        afterNode: { ...node, children: afterChildren },
        change: local.embed(docIndex.length, range.from + 1),
        nodePath: loc.path,
        root: loc.root,
      };
    }

    case 'unwrap_inline': {
      const parentLoc = lookup(step.parent);

      if (!parentLoc) return null;

      const docIndex = getIndex(parentLoc.root);
      const parentNode = docIndex.node(parentLoc.path);

      if (!isElementNode(parentNode)) return null;

      const parentStream = toV4TextStream(parentNode.children);
      const inlineIndex = parentStream.units.findIndex(
        (u) => u.kind === 'inline' && u.node.id === step.id
      );

      if (inlineIndex === -1) return null;

      const inlineUnit = parentStream.units[inlineIndex];

      if (inlineUnit.kind !== 'inline') return null;

      const innerStream = toV4TextStream(inlineUnit.node.children);

      parentStream.units.splice(inlineIndex, 1, ...innerStream.units);

      const afterChildren = fromV4TextStream(
        parentStream.units,
        parentStream.units.length === 0
          ? (innerStream.emptyLeafMarks ?? parentStream.emptyLeafMarks)
          : null
      );
      const range = docIndex.nodeRange(parentLoc.path);
      const local = RootChange.betweenWhole(
        DocumentIndex.fromValue(parentNode.children),
        DocumentIndex.fromValue(afterChildren)
      );

      return {
        afterNode: { ...parentNode, children: afterChildren },
        change: local.embed(docIndex.length, range.from + 1),
        nodePath: parentLoc.path,
        root: parentLoc.root,
      };
    }

    case 'set_props': {
      const loc = lookup(step.id);

      if (!loc) return null;

      const docIndex = getIndex(loc.root);
      const node = docIndex.node(loc.path);

      if (!isElementNode(node)) return null;

      const beforeProps = nodeProps(node);
      const afterProps = applyPropDeltaToRecord(beforeProps, step, {
        forbidIdMutation: true,
      });
      const newProps: JsonRecord = {};
      const oldProps: JsonRecord = {};
      const keys = new Set([
        ...Object.keys(beforeProps),
        ...Object.keys(afterProps),
      ]);

      for (const key of keys) {
        if (jsonEqual(beforeProps[key], afterProps[key])) continue;
        if (Object.hasOwn(beforeProps, key)) oldProps[key] = beforeProps[key];
        if (Object.hasOwn(afterProps, key)) newProps[key] = afterProps[key];
      }

      if (
        Object.keys(newProps).length === 0 &&
        Object.keys(oldProps).length === 0
      ) {
        return { change: RootChange.empty(docIndex.length), root: loc.root };
      }

      return {
        afterNode: { ...afterProps, children: node.children },
        change: setNodeChange(docIndex, loc.path, newProps, oldProps),
        nodePath: loc.path,
        root: loc.root,
      };
    }

    case 'insert_node': {
      if ('root' in step.to) {
        const docIndex = getIndex(step.to.root);

        return {
          change: insertNodeChange(docIndex, [step.to.index], step.node),
          root: step.to.root,
        };
      }
      if ('index' in step.to) {
        const parentLoc = lookup(step.to.id);

        if (!parentLoc) return null;

        const docIndex = getIndex(parentLoc.root);

        return {
          change: insertNodeChange(
            docIndex,
            [...parentLoc.path, step.to.index],
            step.node
          ),
          root: parentLoc.root,
        };
      }

      const parentLoc = lookup(step.to.id);

      if (!parentLoc) return null;

      const docIndex = getIndex(parentLoc.root);
      const parentNode = docIndex.node(parentLoc.path);

      if (!isElementNode(parentNode)) return null;

      const stream = toV4TextStream(parentNode.children);

      stream.units.splice(step.to.offset, 0, {
        kind: 'inline',
        node: cloneJson(step.node),
      });

      const afterChildren = fromV4TextStream(
        stream.units,
        stream.emptyLeafMarks
      );
      const range = docIndex.nodeRange(parentLoc.path);
      const local = RootChange.betweenWhole(
        DocumentIndex.fromValue(parentNode.children),
        DocumentIndex.fromValue(afterChildren)
      );

      return {
        change: local.embed(docIndex.length, range.from + 1),
        root: parentLoc.root,
      };
    }

    case 'remove_node': {
      const loc = lookup(step.id);

      if (!loc) return null;

      const docIndex = getIndex(loc.root);

      if (loc.path.length > 1) {
        const parentPath = loc.path.slice(0, -1);
        const parentNode = docIndex.node(parentPath);

        if (isElementNode(parentNode) && isTextBearingElement(parentNode)) {
          const stream = toV4TextStream(parentNode.children);
          const inlineIndex = stream.units.findIndex(
            (u) => u.kind === 'inline' && u.node.id === step.id
          );

          if (inlineIndex !== -1) {
            stream.units.splice(inlineIndex, 1);
            const afterChildren = fromV4TextStream(
              stream.units,
              stream.emptyLeafMarks
            );
            const range = docIndex.nodeRange(parentPath);
            const local = RootChange.betweenWhole(
              DocumentIndex.fromValue(parentNode.children),
              DocumentIndex.fromValue(afterChildren)
            );

            return {
              change: local.embed(docIndex.length, range.from + 1),
              root: loc.root,
            };
          }
        }
      }

      return {
        change: removeNodeChange(docIndex, loc.path),
        root: loc.root,
      };
    }

    case 'move_node': {
      const loc = lookup(step.id);

      if (!loc) return null;

      if ('root' in step.to && step.to.root === loc.root) {
        const docIndex = getIndex(loc.root);

        return {
          change: moveNodeChange(docIndex, loc.path, [step.to.index]),
          root: loc.root,
        };
      }
      if ('id' in step.to && 'index' in step.to) {
        const destLoc = lookup(step.to.id);

        if (!destLoc || destLoc.root !== loc.root) return null;

        const docIndex = getIndex(loc.root);

        return {
          change: moveNodeChange(docIndex, loc.path, [
            ...destLoc.path,
            step.to.index,
          ]),
          root: loc.root,
        };
      }

      return null;
    }

    case 'split_node': {
      const loc = lookup(step.id);

      if (!loc) return null;

      const docIndex = getIndex(loc.root);
      const node = docIndex.node(loc.path);

      if (!isElementNode(node)) return null;

      if (!isTextBearingElement(node)) {
        const inherited = {
          ...nodeProps(node),
          ...step.props,
          id: step.newId,
        };

        return {
          change: splitNodeChange(docIndex, loc.path, step.at, inherited),
          root: loc.root,
        };
      }

      const { id: _oldId, ...inherited } = cloneJson(nodeProps(node));
      const rightProps: JsonRecord = { ...inherited };

      if (step.props) {
        for (const [key, value] of Object.entries(step.props)) {
          if (key === 'id') continue;
          if (value === undefined) delete rightProps[key];
          else rightProps[key] = cloneJson(value);
        }
      }
      rightProps.id = step.newId;

      const totalLen = node.children.reduce(
        (sum, child) => sum + (isElementNode(child) ? 1 : child.text.length),
        0
      );
      const emptyLeafOf = (): JsonNode => {
        const only = node.children[0];

        if (
          node.children.length === 1 &&
          only &&
          !isElementNode(only) &&
          only.text.length === 0
        ) {
          const { text: _t, ...marks } = only;

          return { ...cloneJson(marks), text: '' };
        }

        return { text: '' };
      };

      if (step.at === 0) {
        const ins = insertNodeChange(docIndex, [...loc.path, 0], emptyLeafOf());
        const doc1 = ins.apply(docIndex);
        const spl = splitNodeChange(doc1, loc.path, 1, rightProps);

        return { change: ins.compose(spl), root: loc.root };
      }

      if (step.at === totalLen) {
        const ins = insertNodeChange(
          docIndex,
          [...loc.path, node.children.length],
          emptyLeafOf()
        );
        const doc1 = ins.apply(docIndex);
        const spl = splitNodeChange(
          doc1,
          loc.path,
          node.children.length,
          rightProps
        );

        return { change: ins.compose(spl), root: loc.root };
      }

      let cursor = 0;
      let splitChildIndex = -1;
      let innerOffset = 0;

      for (let ci = 0; ci < node.children.length; ci += 1) {
        const child = getDefined(node.children[ci]);
        const len = isElementNode(child) ? 1 : child.text.length;

        if (step.at < cursor + len) {
          splitChildIndex = ci;
          innerOffset = step.at - cursor;
          break;
        }
        cursor += len;
        if (step.at === cursor) {
          splitChildIndex = ci + 1;
          innerOffset = 0;
          break;
        }
      }

      if (splitChildIndex !== -1) {
        let curDoc = docIndex;
        let composed: RootChange | null = null;
        let elemSplitIndex = splitChildIndex;

        if (innerOffset > 0) {
          const leaf = getDefined(node.children[splitChildIndex]);

          if (!isElementNode(leaf)) {
            const { text: _t, ...leafMarks } = leaf;
            const leafSplit = splitNodeChange(
              curDoc,
              [...loc.path, splitChildIndex],
              innerOffset,
              leafMarks
            );

            curDoc = leafSplit.apply(curDoc);
            composed = leafSplit;
            elemSplitIndex = splitChildIndex + 1;
          }
        }

        const refreshedParent = curDoc.node(loc.path);

        if (isElementNode(refreshedParent)) {
          const leftLast = refreshedParent.children[elemSplitIndex - 1];
          const rightFirst = refreshedParent.children[elemSplitIndex];

          if (leftLast && isElementNode(leftLast)) {
            const padLeft = insertNodeChange(
              curDoc,
              [...loc.path, elemSplitIndex],
              { text: '' }
            );

            curDoc = padLeft.apply(curDoc);
            composed = composed ? composed.compose(padLeft) : padLeft;
            elemSplitIndex += 1;
          }
          if (rightFirst && isElementNode(rightFirst)) {
            const padRight = insertNodeChange(
              curDoc,
              [...loc.path, elemSplitIndex],
              { text: '' }
            );

            curDoc = padRight.apply(curDoc);
            composed = composed ? composed.compose(padRight) : padRight;
          }
        }

        const elemSplit = splitNodeChange(
          curDoc,
          loc.path,
          elemSplitIndex,
          rightProps
        );

        return {
          change: composed ? composed.compose(elemSplit) : elemSplit,
          root: loc.root,
        };
      }

      return null;
    }

    case 'join_nodes': {
      const targetLoc = lookup(step.target);
      const sourceLoc = lookup(step.source);

      if (
        !targetLoc ||
        !sourceLoc ||
        targetLoc.root !== sourceLoc.root ||
        sourceLoc.path.length !== targetLoc.path.length ||
        sourceLoc.path.at(-1) !== (targetLoc.path.at(-1) ?? -1) + 1
      ) {
        return null;
      }

      const docIndex = getIndex(targetLoc.root);
      const targetNode = docIndex.node(targetLoc.path);
      const sourceNode = docIndex.node(sourceLoc.path);

      if (!isElementNode(targetNode) || !isElementNode(sourceNode)) return null;

      if (
        !isTextBearingElement(targetNode) &&
        !isTextBearingElement(sourceNode)
      ) {
        return {
          change: mergeNodeChange(docIndex, sourceLoc.path),
          root: targetLoc.root,
        };
      }

      const merged = mergeNodeChange(docIndex, sourceLoc.path);
      const curDoc = merged.apply(docIndex);
      let composed = merged;
      const boundaryIdx = targetNode.children.length;
      const leftLast = targetNode.children.at(-1);
      const rightFirst = sourceNode.children[0];

      if (
        leftLast &&
        rightFirst &&
        !isElementNode(leftLast) &&
        !isElementNode(rightFirst)
      ) {
        const leftLen = targetNode.children.length;
        const rightLen = sourceNode.children.length;
        const { text: lText, ...lMarks } = leftLast;
        const { text: rText, ...rMarks } = rightFirst;

        if (
          lText.length === 0 &&
          leftLen === 1 &&
          (rightLen > 1 || rText.length > 0)
        ) {
          composed = composed.compose(
            removeNodeChange(curDoc, [...targetLoc.path, 0])
          );
        } else if (
          rText.length === 0 &&
          rightLen === 1 &&
          (leftLen > 1 || lText.length > 0)
        ) {
          composed = composed.compose(
            removeNodeChange(curDoc, [...targetLoc.path, boundaryIdx])
          );
        } else if (jsonEqual(lMarks, rMarks)) {
          composed = composed.compose(
            mergeNodeChange(curDoc, [...targetLoc.path, boundaryIdx])
          );
        }
      }

      return { change: composed, root: targetLoc.root };
    }

    case 'create_root': {
      return { change: RootChange.empty(0), root: step.root };
    }

    case 'delete_root': {
      return { change: RootChange.empty(0), root: '' };
    }

    case 'set_register': {
      return { change: RootChange.empty(0), root: '' };
    }
  }
  return null;
};

type CoalescableTextStep = Extract<
  V4Step,
  { op: 'delete_text' | 'insert_text' }
>;

const isCoalescableTextStep = (step: V4Step): step is CoalescableTextStep =>
  step.op === 'insert_text' || step.op === 'delete_text';

const collectCoalescableTextBatch = (
  steps: readonly V4Step[],
  startIndex: number,
  first: CoalescableTextStep
): readonly CoalescableTextStep[] => {
  const batch: CoalescableTextStep[] = [first];
  let sawDelete = first.op === 'delete_text';

  for (let i = startIndex + 1; i < steps.length; i += 1) {
    const next = getDefined(steps[i]);

    if (!isCoalescableTextStep(next) || next.target !== first.target) break;
    if (
      sawDelete &&
      next.op === 'insert_text' &&
      next.marks &&
      Object.keys(next.marks).length > 0
    ) {
      break;
    }
    if (next.op === 'delete_text') sawDelete = true;
    batch.push(next);
  }

  return batch;
};

const lowerCoalescedTextStepsOnIndex = (
  getIndex: (root: string) => DocumentIndex,
  lookup: ValueIdLookup,
  steps: readonly CoalescableTextStep[]
): Readonly<{
  afterNode: JsonElementNode;
  change: RootChange;
  nodePath: readonly number[];
  root: string;
}> | null => {
  const { target } = getDefined(steps[0]);
  const loc = lookup(target);

  if (!loc) return null;

  const docIndex = getIndex(loc.root);
  const node = docIndex.node(loc.path);

  if (!isElementNode(node)) return null;

  const beforeChildren = node.children;
  let afterChildren: JsonNode[] = [...beforeChildren];

  for (const step of steps) {
    if (step.op === 'insert_text') {
      afterChildren = applyInsertTextToChildren(
        afterChildren,
        step.offset,
        step.text,
        step.marks,
        step.target
      ).children;
    } else {
      afterChildren = applyDeleteTextToChildren(
        afterChildren,
        step.offset,
        step.length,
        step.target
      ).children;
    }
  }

  if (jsonEqual(beforeChildren, afterChildren)) {
    return {
      afterNode: node,
      change: RootChange.empty(docIndex.length),
      nodePath: loc.path,
      root: loc.root,
    };
  }

  const range = docIndex.nodeRange(loc.path);
  const local = RootChange.betweenWhole(
    DocumentIndex.fromValue(beforeChildren),
    DocumentIndex.fromValue(afterChildren)
  );

  return {
    afterNode: { ...node, children: afterChildren },
    change: local.embed(docIndex.length, range.from + 1),
    nodePath: loc.path,
    root: loc.root,
  };
};

const isInPlaceSparseStep = (step: V4Step): boolean =>
  step.op === 'insert_text' ||
  step.op === 'delete_text' ||
  step.op === 'format_text' ||
  step.op === 'set_props';

export const lowerV4Steps = (
  steps: readonly V4Step[],
  base: JsonEditorValue,
  cacheKey?: object
): LoweredV4Result => {
  if (cacheKey) {
    const cached = LOWERED_CACHE.get(cacheKey)?.get(base);

    if (cached) return cached;
  }

  const { createRoots, deleteRoots } = v4RootLifecycle(steps);
  const nonRegisterSteps = steps.filter((step) => step.op !== 'set_register');
  const roots = new Map<string, RootChange>();
  const classifications = new Map<string, DocumentChangeRootClassification>();

  const cacheResult = (result: LoweredV4Result) => {
    if (cacheKey) {
      let byBase = LOWERED_CACHE.get(cacheKey);

      if (!byBase) {
        byBase = new WeakMap();
        LOWERED_CACHE.set(cacheKey, byBase);
      }
      byBase.set(base, result);
    }

    return result;
  };

  if (nonRegisterSteps.length === 1) {
    const lookup = getValueIdLookup(base) ?? coldLookupFor(base);
    const single = lowerSingleStepSparselyOnIndex(
      (root) => indexForRoot(base, root),
      lookup,
      getDefined(nonRegisterSteps[0])
    );

    if (single) {
      if (single.root.length > 0 && !single.change.empty) {
        roots.set(single.root, single.change);
        const beforeIndex = indexForRoot(base, single.root);

        if (single.afterNode && single.nodePath && single.nodePath.length > 0) {
          const afterIndex = beforeIndex.withSplicedNodes(
            single.nodePath.slice(0, -1),
            getDefined(single.nodePath.at(-1)),
            1,
            [single.afterNode]
          );

          classifications.set(
            single.root,
            classifyRootChange(single.change, beforeIndex, afterIndex)
          );
        }
      }

      return cacheResult(
        Object.freeze({
          classifications,
          createRoots,
          deleteRoots,
          roots,
        })
      );
    }
  } else if (
    nonRegisterSteps.length > 1 &&
    nonRegisterSteps.every(isInPlaceSparseStep)
  ) {
    const lookup = getValueIdLookup(base) ?? coldLookupFor(base);
    const workingIndexes = new Map<string, DocumentIndex>();
    const getWorkingIndex = (root: string) => {
      let idx = workingIndexes.get(root);

      if (!idx) {
        idx = indexForRoot(base, root);
        workingIndexes.set(root, idx);
      }

      return idx;
    };
    let allSparse = true;

    for (let stepIdx = 0; stepIdx < nonRegisterSteps.length; stepIdx += 1) {
      const step = getDefined(nonRegisterSteps[stepIdx]);
      let lowered: ReturnType<typeof lowerSingleStepSparselyOnIndex>;

      if (isCoalescableTextStep(step)) {
        const batch = collectCoalescableTextBatch(
          nonRegisterSteps,
          stepIdx,
          step
        );

        stepIdx += batch.length - 1;
        lowered =
          batch.length > 1
            ? lowerCoalescedTextStepsOnIndex(getWorkingIndex, lookup, batch)
            : lowerSingleStepSparselyOnIndex(getWorkingIndex, lookup, step);
      } else {
        lowered = lowerSingleStepSparselyOnIndex(getWorkingIndex, lookup, step);
      }

      if (!lowered) {
        allSparse = false;
        break;
      }
      if (lowered.root.length > 0 && !lowered.change.empty) {
        const prev = roots.get(lowered.root);

        roots.set(
          lowered.root,
          prev ? prev.compose(lowered.change) : lowered.change
        );
        if (
          lowered.afterNode &&
          lowered.nodePath &&
          lowered.nodePath.length > 0
        ) {
          const parentPath = lowered.nodePath.slice(0, -1);
          const childIndex = getDefined(lowered.nodePath.at(-1));

          workingIndexes.set(
            lowered.root,
            getWorkingIndex(lowered.root).withSplicedNodes(
              parentPath,
              childIndex,
              1,
              [lowered.afterNode]
            )
          );
        } else {
          allSparse = false;
          break;
        }
      }
    }

    if (allSparse) {
      for (const [root, change] of roots) {
        if (change.empty) {
          roots.delete(root);
        } else {
          classifications.set(
            root,
            classifyRootChange(
              change,
              indexForRoot(base, root),
              getWorkingIndex(root)
            )
          );
        }
      }

      return cacheResult(
        Object.freeze({
          classifications,
          createRoots,
          deleteRoots,
          roots,
        })
      );
    }
    roots.clear();
    classifications.clear();
  }

  if (nonRegisterSteps.length > 1) {
    const baseLookup = getValueIdLookup(base) ?? coldLookupFor(base);
    const workingIndexes = new Map<string, DocumentIndex>();
    const rootMaps = new Map<string, Map<string, readonly number[]>>();
    const structurallyModifiedRoots = new Set<string>();
    const getWorkingIndex = (root: string) => {
      let idx = workingIndexes.get(root);

      if (!idx) {
        idx = indexForRoot(base, root);
        workingIndexes.set(root, idx);
      }

      return idx;
    };
    const buildRootMap = (root: string, idx: DocumentIndex) => {
      const map = new Map<string, readonly number[]>();
      const walk = (nodes: readonly JsonNode[], prefix: readonly number[]) => {
        for (let i = 0; i < nodes.length; i += 1) {
          const node = getDefined(nodes[i]);

          if (!isElementNode(node)) continue;
          const path = [...prefix, i];

          if (typeof node.id === 'string' && node.id.length > 0) {
            map.set(node.id, path);
          }
          walk(node.children, path);
        }
      };

      walk(idx.value, []);
      rootMaps.set(root, map);
    };
    const dynamicLookup: ValueIdLookup = (id) => {
      for (const [root, map] of rootMaps) {
        const path = map.get(id);

        if (path) return { path, root };
      }

      const loc = baseLookup(id);

      if (!loc || structurallyModifiedRoots.has(loc.root)) return null;

      return loc;
    };

    let allComposed = true;

    for (let stepIdx = 0; stepIdx < nonRegisterSteps.length; stepIdx += 1) {
      const step = getDefined(nonRegisterSteps[stepIdx]);

      if (step.op === 'create_root') {
        workingIndexes.set(step.root, DocumentIndex.fromValue([]));
        structurallyModifiedRoots.add(step.root);
        rootMaps.set(step.root, new Map());
        continue;
      }

      if (
        step.op === 'insert_node' &&
        step.node.children.length === 0 &&
        typeof step.node.id === 'string' &&
        step.node.id.length > 0 &&
        !('offset' in step.to)
      ) {
        const shellId = step.node.id;
        const parentLoc = 'id' in step.to ? dynamicLookup(step.to.id) : null;
        const wrapRoot = 'root' in step.to ? step.to.root : parentLoc?.root;
        const wrapParentPath = 'root' in step.to ? [] : parentLoc?.path;
        const wrapIndex = step.to.index;

        if (wrapRoot !== undefined && wrapParentPath !== undefined) {
          let movedCount = 0;
          let contiguous = true;

          while (stepIdx + 1 + movedCount < nonRegisterSteps.length) {
            const nextStep = getDefined(
              nonRegisterSteps[stepIdx + 1 + movedCount]
            );

            if (
              nextStep.op !== 'move_node' ||
              !('id' in nextStep.to) ||
              !('index' in nextStep.to) ||
              nextStep.to.id !== shellId ||
              nextStep.to.index !== movedCount
            ) {
              break;
            }
            const childLoc = dynamicLookup(nextStep.id);

            if (
              !childLoc ||
              childLoc.root !== wrapRoot ||
              childLoc.path.length !== wrapParentPath.length + 1 ||
              !wrapParentPath.every((seg, idx) => childLoc.path[idx] === seg) ||
              childLoc.path.at(-1) !== wrapIndex + movedCount
            ) {
              contiguous = false;
              break;
            }
            movedCount += 1;
          }

          if (contiguous && movedCount > 0) {
            const curIdx = getWorkingIndex(wrapRoot);
            const wrapChange = wrapChildrenChange(
              curIdx,
              wrapParentPath,
              wrapIndex,
              movedCount,
              nodeProps(step.node)
            );
            const prev = roots.get(wrapRoot);

            roots.set(wrapRoot, prev ? prev.compose(wrapChange) : wrapChange);
            const nextIdx = wrapChange.apply(curIdx);

            workingIndexes.set(wrapRoot, nextIdx);
            if (nextIdx.size > 256) {
              allComposed = false;
              break;
            }
            structurallyModifiedRoots.add(wrapRoot);
            buildRootMap(wrapRoot, nextIdx);
            stepIdx += movedCount;
            continue;
          }
        }
      }

      if (step.op === 'move_node' && !('offset' in step.to)) {
        const firstChildLoc = dynamicLookup(step.id);

        if (
          firstChildLoc &&
          firstChildLoc.path.length >= 2 &&
          firstChildLoc.path.at(-1) === 0
        ) {
          const wrapperPath = firstChildLoc.path.slice(0, -1);
          const unwrapRoot = firstChildLoc.root;
          const curIdx = getWorkingIndex(unwrapRoot);
          const wrapperNode = curIdx.node(wrapperPath);
          const wrapperId =
            isElementNode(wrapperNode) && typeof wrapperNode.id === 'string'
              ? wrapperNode.id
              : null;
          const childCount = isElementNode(wrapperNode)
            ? wrapperNode.children.length
            : 0;
          const wrapperParentPath = wrapperPath.slice(0, -1);
          const wrapperIndex = getDefined(wrapperPath.at(-1));
          const wrapperParentId =
            wrapperParentPath.length > 0
              ? (() => {
                  const p = curIdx.node(wrapperParentPath);

                  return isElementNode(p) && typeof p.id === 'string'
                    ? p.id
                    : null;
                })()
              : null;

          if (
            isElementNode(wrapperNode) &&
            wrapperId &&
            childCount > 0 &&
            stepIdx + childCount < nonRegisterSteps.length
          ) {
            let matchesUnwrap = true;

            for (let k = 0; k < childCount; k += 1) {
              const m = getDefined(nonRegisterSteps[stepIdx + k]);
              const childNode = wrapperNode.children[k];
              const childId =
                isElementNode(childNode) && typeof childNode.id === 'string'
                  ? childNode.id
                  : null;

              if (
                !childId ||
                m.op !== 'move_node' ||
                m.id !== childId ||
                'offset' in m.to
              ) {
                matchesUnwrap = false;
                break;
              }
              const destMatches =
                wrapperParentPath.length === 0
                  ? 'root' in m.to &&
                    m.to.root === unwrapRoot &&
                    m.to.index === wrapperIndex + k
                  : 'id' in m.to &&
                    m.to.id === wrapperParentId &&
                    m.to.index === wrapperIndex + k;

              if (!destMatches) {
                matchesUnwrap = false;
                break;
              }
            }

            const remStep = getDefined(nonRegisterSteps[stepIdx + childCount]);

            if (
              matchesUnwrap &&
              remStep.op === 'remove_node' &&
              remStep.id === wrapperId
            ) {
              const unwrapChange = unwrapNodeChange(curIdx, wrapperPath);
              const prev = roots.get(unwrapRoot);

              roots.set(
                unwrapRoot,
                prev ? prev.compose(unwrapChange) : unwrapChange
              );
              const nextIdx = unwrapChange.apply(curIdx);

              workingIndexes.set(unwrapRoot, nextIdx);
              if (nextIdx.size > 256) {
                allComposed = false;
                break;
              }
              structurallyModifiedRoots.add(unwrapRoot);
              buildRootMap(unwrapRoot, nextIdx);
              stepIdx += childCount;
              continue;
            }
          }
        }
      }

      let lowered: ReturnType<typeof lowerSingleStepSparselyOnIndex>;

      if (isCoalescableTextStep(step)) {
        const batch = collectCoalescableTextBatch(
          nonRegisterSteps,
          stepIdx,
          step
        );

        stepIdx += batch.length - 1;
        lowered =
          batch.length > 1
            ? lowerCoalescedTextStepsOnIndex(
                getWorkingIndex,
                dynamicLookup,
                batch
              )
            : lowerSingleStepSparselyOnIndex(
                getWorkingIndex,
                dynamicLookup,
                step
              );
      } else {
        lowered = lowerSingleStepSparselyOnIndex(
          getWorkingIndex,
          dynamicLookup,
          step
        );
      }

      if (!lowered) {
        allComposed = false;
        break;
      }

      if (lowered.root.length > 0 && !lowered.change.empty) {
        const prev = roots.get(lowered.root);

        roots.set(
          lowered.root,
          prev ? prev.compose(lowered.change) : lowered.change
        );
        const curIdx = getWorkingIndex(lowered.root);
        const nextIdx =
          lowered.afterNode && lowered.nodePath && lowered.nodePath.length > 0
            ? curIdx.withSplicedNodes(
                lowered.nodePath.slice(0, -1),
                getDefined(lowered.nodePath.at(-1)),
                1,
                [lowered.afterNode]
              )
            : lowered.change.apply(curIdx);

        workingIndexes.set(lowered.root, nextIdx);
        if (!isInPlaceSparseStep(step)) {
          if (nextIdx.size > 256) {
            allComposed = false;
            break;
          }
          structurallyModifiedRoots.add(lowered.root);
          buildRootMap(lowered.root, nextIdx);
        }
      }
    }

    if (allComposed) {
      for (const [root, change] of roots) {
        if (change.empty || deleteRoots.has(root)) {
          roots.delete(root);
        } else {
          classifications.set(
            root,
            classifyRootChange(
              change,
              indexForRoot(base, root),
              getWorkingIndex(root)
            )
          );
        }
      }

      return cacheResult(
        Object.freeze({
          classifications,
          createRoots,
          deleteRoots,
          roots,
        })
      );
    }
    roots.clear();
    classifications.clear();
  }

  // Multi-step or cross-root lowering: apply steps once and diff only roots
  // that actually changed, using fast sparse DocumentIndex when available.
  if (nonRegisterSteps.length > 0) {
    const after = applyV4Steps(base, nonRegisterSteps);
    const touchedRoots = new Set<string>([
      'main',
      ...visitRootNames(base.roots),
      ...visitRootNames(after.roots),
    ]);

    for (const root of touchedRoots) {
      if (deleteRoots.has(root)) continue;
      const beforeIndex = indexForRoot(base, root);
      const afterNodes =
        root === 'main' ? after.children : (after.roots?.[root] ?? []);
      const afterIndex = DocumentIndex.fromValue(afterNodes);
      const rootChange = RootChange.betweenChangedBlocks(
        beforeIndex,
        afterIndex,
        { root: root === 'main' ? null : root }
      );

      if (!rootChange.empty) {
        roots.set(root, rootChange);
        classifications.set(
          root,
          classifyRootChange(rootChange, beforeIndex, afterIndex)
        );
      }
    }
  }

  return cacheResult(
    Object.freeze({
      classifications,
      createRoots,
      deleteRoots,
      roots,
    })
  );
};
