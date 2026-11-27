import { getDefined } from '../../../internal/get-defined';
import {
  classifyRootChange,
  type DocumentChangeRootClassification,
} from '../classification';
import { DocumentIndex, rootIndexOf } from '../document-index';
import { cloneJson, jsonEqual, type JsonRecord } from '../json';
import { lazyRootOf, visitRootNames } from '../lazy-root';
import {
  insertNodeChange,
  mergeNodeChange,
  moveNodeChange,
  removeNodeChange,
  replaceChildrenChange,
  RootChange,
  setNodeChange,
  splitNodeChange,
} from '../root-change';
import {
  isElementNode,
  type JsonEditorValue,
  type JsonElementNode,
  type JsonNode,
  nodeProps,
  PreparedTokenSlice,
} from '../tokens';
import {
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
      const stream = toV4TextStream(beforeChildren);
      let afterChildren: JsonNode[];

      if (step.op === 'insert_text') {
        const marks = step.marks ? cloneJson(step.marks) : {};

        stream.units.splice(
          step.offset,
          0,
          ...Array.from({ length: step.text.length }, (_, i) => ({
            ch: step.text[i],
            kind: 'char' as const,
            marks: cloneJson(marks),
          }))
        );
        afterChildren = fromV4TextStream(stream.units, stream.emptyLeafMarks);
      } else if (step.op === 'delete_text') {
        stream.units.splice(step.offset, step.length);
        afterChildren = fromV4TextStream(
          stream.units,
          stream.units.length === 0 ? null : stream.emptyLeafMarks
        );
      } else if (step.op === 'format_text') {
        if (step.length === 0) {
          if (step.offset !== 0 || stream.units.length > 0) {
            return {
              change: RootChange.empty(docIndex.length),
              root: loc.root,
            };
          }
          afterChildren = [
            {
              ...applyPropDeltaToRecord(stream.emptyLeafMarks ?? {}, step),
              text: '',
            },
          ];
        } else {
          for (let i = step.offset; i < step.offset + step.length; i += 1) {
            const u = stream.units[i];

            if (u.kind !== 'char') continue;
            stream.units[i] = {
              ch: u.ch,
              kind: 'char',
              marks: applyPropDeltaToRecord(u.marks, step),
            };
          }
          afterChildren = fromV4TextStream(stream.units, stream.emptyLeafMarks);
        }
      } else {
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

      const stream = toV4TextStream(node.children);
      const left = fromV4TextStream(
        stream.units.slice(0, step.at),
        step.at === 0 ? stream.emptyLeafMarks : null
      );
      const right = fromV4TextStream(
        stream.units.slice(step.at),
        step.at === stream.units.length ? stream.emptyLeafMarks : null
      );
      const { id: _oldId, ...inherited } = cloneJson(nodeProps(node));
      const rightProps: JsonRecord = { ...inherited };

      if (step.props) {
        for (const [key, value] of Object.entries(step.props)) {
          if (key === 'id') continue;
          if (value === undefined) delete rightProps[key];
          else rightProps[key] = cloneJson(value);
        }
      }

      const leftNode: JsonElementNode = { ...node, children: left };
      const rightNode: JsonElementNode = {
        ...rightProps,
        children: right,
        id: step.newId,
      };
      const range = docIndex.nodeRange(loc.path);

      return {
        change: RootChange.create(docIndex, {
          from: range.from,
          insert: PreparedTokenSlice.fromNodes([leftNode, rightNode]),
          to: range.to,
        }),
        root: loc.root,
      };
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

      const left = toV4TextStream(targetNode.children);
      const right = toV4TextStream(sourceNode.children);
      const combined = [...left.units, ...right.units];
      const mergedNode: JsonElementNode = {
        ...targetNode,
        children: fromV4TextStream(
          combined,
          combined.length === 0
            ? (left.emptyLeafMarks ?? right.emptyLeafMarks)
            : null
        ),
      };
      const targetRange = docIndex.nodeRange(targetLoc.path);
      const sourceRange = docIndex.nodeRange(sourceLoc.path);

      return {
        change: RootChange.create(docIndex, {
          from: targetRange.from,
          insert: PreparedTokenSlice.fromNodes([mergedNode]),
          to: sourceRange.to,
        }),
        root: targetLoc.root,
      };
    }

    case 'create_root': {
      return { change: RootChange.empty(0), root: step.root };
    }

    case 'delete_root': {
      const docIndex = getIndex(step.root);

      return {
        change: replaceChildrenChange(
          docIndex,
          [],
          0,
          docIndex.value.length,
          []
        ),
        root: step.root,
      };
    }

    case 'set_register': {
      return { change: RootChange.empty(0), root: '' };
    }
  }
  return null;
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

    for (const step of nonRegisterSteps) {
      const lowered = lowerSingleStepSparselyOnIndex(
        getWorkingIndex,
        lookup,
        step
      );

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
