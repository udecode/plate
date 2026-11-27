import { getDefined } from '../../../internal/get-defined';
import type { DocumentIndex } from '../document-index';
import { cloneJson, jsonEqual, type JsonRecord } from '../json';
import {
  type DocumentSetPropertyResolver,
  getDocumentPropertyContext,
} from '../root-change';
import {
  isElementNode,
  isTextNode,
  type JsonElementNode,
  type JsonNode,
  nodeProps,
} from '../tokens';
import {
  elementStreamLength,
  isTextBearingElement,
  textOffsetAtChildPath,
  toV4TextStream,
} from './apply';
import { propDeltaBetween } from './extract';
import { isEmptyPropDelta, type V4Place, type V4Step } from './types';

type PendingNodeId = Readonly<{
  kind: 'insert_node' | 'split_node' | 'wrap_inline';
  path: readonly number[];
  root: string;
  stepIndex: number;
}>;

const idOf = (node: JsonNode | undefined): string | null =>
  node &&
  isElementNode(node) &&
  typeof node.id === 'string' &&
  node.id.length > 0
    ? node.id
    : null;

const parentElementOf = (
  document: DocumentIndex,
  path: readonly number[]
): Readonly<{
  childIndex: number;
  parent: JsonElementNode;
  parentId: string;
}> | null => {
  if (path.length < 2) return null;
  const parent = document.node(path.slice(0, -1));
  const parentId = idOf(parent);

  if (!parentId || !isElementNode(parent)) return null;

  return {
    childIndex: getDefined(path.at(-1)),
    parent,
    parentId,
  };
};

const placeForPath = (
  document: DocumentIndex,
  root: string,
  path: readonly number[]
): V4Place | null => {
  if (path.length === 0) return null;
  if (path.length === 1) {
    return { index: path[0], root };
  }
  const info = parentElementOf(document, path);

  if (!info) return null;
  if (isTextBearingElement(info.parent)) {
    return {
      id: info.parentId,
      offset: textOffsetAtChildPath(info.parent, info.childIndex),
    };
  }

  return { id: info.parentId, index: info.childIndex };
};

export type V4RecorderSnapshot = Readonly<{
  deletedRoots: readonly string[];
  pending: readonly PendingNodeId[];
  steps: readonly V4Step[] | null;
}>;

export class V4BuilderRecorder {
  private steps: V4Step[] | null = [];
  private pending: PendingNodeId[] = [];
  private deletedRoots = new Set<string>();

  get active(): boolean {
    return this.steps !== null;
  }

  get recorded(): readonly V4Step[] | null {
    if (this.steps === null || this.pending.length > 0) return null;

    return this.steps;
  }

  snapshot(): V4RecorderSnapshot {
    return {
      deletedRoots: [...this.deletedRoots],
      pending: [...this.pending],
      steps: this.steps ? [...this.steps] : null,
    };
  }

  restore(snap: V4RecorderSnapshot) {
    this.steps = snap.steps ? [...snap.steps] : null;
    this.pending = [...snap.pending];
    this.deletedRoots = new Set(snap.deletedRoots);
  }

  invalidate() {
    this.steps = null;
    this.pending = [];
    this.deletedRoots.clear();
  }

  resetTo(steps: readonly V4Step[]) {
    this.steps = [...steps];
    this.pending = [];
    this.deletedRoots.clear();
  }

  appendRaw(steps: readonly V4Step[]) {
    if (this.steps === null) return;
    for (const step of steps) {
      if (step.op === 'delete_root') this.deletedRoots.add(step.root);
      else if (step.op === 'create_root') this.deletedRoots.delete(step.root);
    }
    this.steps.push(...steps);
  }

  private ensureRootExists(root: string) {
    if (this.steps === null || root === 'main') return;
    if (this.deletedRoots.has(root)) {
      this.deletedRoots.delete(root);
      this.steps.push({ op: 'create_root', root });
    }
  }

  recordCreateRoot(root: string, children: readonly JsonNode[]) {
    if (this.steps === null) return;
    this.deletedRoots.delete(root);
    this.steps.push({ op: 'create_root', root });
    for (const [index, child] of children.entries()) {
      if (this.steps === null) return;
      if (!isElementNode(child)) {
        this.invalidate();
        return;
      }
      const stepIndex = this.steps.length;
      const cloned = cloneJson(child);

      this.steps.push({
        node: cloned,
        op: 'insert_node',
        to: { index, root },
      });
      if (!idOf(cloned)) {
        this.pending.push({
          kind: 'insert_node',
          path: [index],
          root,
          stepIndex,
        });
      }
    }
  }

  recordDeleteRoot(
    root: string,
    deletedChildren?: readonly JsonNode[] | (() => readonly JsonNode[])
  ) {
    if (this.steps === null) return;
    if (
      deletedChildren &&
      this.steps.some((step) => step.op === 'insert_node')
    ) {
      const resolvedChildren =
        typeof deletedChildren === 'function'
          ? deletedChildren()
          : deletedChildren;

      if (resolvedChildren.length > 0) {
        const deletedIds = new Map<string, JsonElementNode>();
        const collect = (nodes: readonly JsonNode[]) => {
          for (const node of nodes) {
            if (!isElementNode(node)) continue;
            const id = idOf(node);

            if (id) deletedIds.set(id, node);
            collect(node.children);
          }
        };

        collect(resolvedChildren);
        for (let i = 0; i < this.steps.length; i += 1) {
          const step = this.steps[i];

          if (step.op !== 'insert_node') continue;
          const insertedId = idOf(step.node);

          if (!insertedId || !deletedIds.has(insertedId)) continue;
          const deletedNode = deletedIds.get(insertedId);

          if (deletedNode && jsonEqual(deletedNode, step.node)) {
            this.steps[i] = { id: insertedId, op: 'move_node', to: step.to };
          } else {
            this.invalidate();
            return;
          }
        }
      }
    }
    this.deletedRoots.add(root);
    this.steps.push({ op: 'delete_root', root });
  }

  recordInsertText(
    document: DocumentIndex,
    path: readonly number[],
    offset: number,
    text: string
  ) {
    if (this.steps === null || text.length === 0) return;
    const info = parentElementOf(document, path);
    const leaf = document.node(path);

    if (!info || !isTextNode(leaf)) {
      this.invalidate();
      return;
    }

    const { text: _t, ...marks } = leaf;
    const streamOffset = textOffsetAtChildPath(
      info.parent,
      info.childIndex,
      offset
    );

    this.steps.push({
      ...(Object.keys(marks).length > 0 ? { marks: cloneJson(marks) } : {}),
      offset: streamOffset,
      op: 'insert_text',
      target: info.parentId,
      text,
    });
  }

  recordRemoveText(
    document: DocumentIndex,
    path: readonly number[],
    offset: number,
    text: string
  ) {
    if (this.steps === null || text.length === 0) return;
    const info = parentElementOf(document, path);

    if (!info) {
      this.invalidate();
      return;
    }

    this.steps.push({
      length: text.length,
      offset: textOffsetAtChildPath(info.parent, info.childIndex, offset),
      op: 'delete_text',
      target: info.parentId,
    });
  }

  recordInsertNode(
    document: DocumentIndex,
    root: string,
    path: readonly number[],
    node: JsonNode
  ) {
    if (this.steps === null) return;
    if (path.length === 1) this.ensureRootExists(root);
    if (isTextNode(node)) {
      if (node.text.length === 0) return;
      const info = parentElementOf(document, path);

      if (!info) {
        this.invalidate();
        return;
      }

      const { text, ...marks } = node;

      this.steps.push({
        ...(Object.keys(marks).length > 0 ? { marks: cloneJson(marks) } : {}),
        offset: textOffsetAtChildPath(info.parent, info.childIndex),
        op: 'insert_text',
        target: info.parentId,
        text,
      });
      return;
    }

    const to = placeForPath(document, root, path);

    if (!to) {
      this.invalidate();
      return;
    }

    const cloned = cloneJson(node);
    const stepIndex = this.steps.length;

    this.steps.push({ node: cloned, op: 'insert_node', to });
    if (!idOf(cloned)) {
      this.pending.push({
        kind: 'insert_node',
        path: [...path],
        root,
        stepIndex,
      });
    }
  }

  recordRemoveNode(document: DocumentIndex, path: readonly number[]) {
    if (this.steps === null) return;
    const target = document.node(path);

    if (isTextNode(target)) {
      if (target.text.length === 0) return;
      const info = parentElementOf(document, path);

      if (!info) {
        this.invalidate();
        return;
      }
      this.steps.push({
        length: target.text.length,
        offset: textOffsetAtChildPath(info.parent, info.childIndex),
        op: 'delete_text',
        target: info.parentId,
      });
      return;
    }

    const targetId = idOf(target);

    if (!targetId) {
      this.invalidate();
      return;
    }
    this.steps.push({ id: targetId, op: 'remove_node' });
  }

  recordMoveNode(
    document: DocumentIndex,
    root: string,
    path: readonly number[],
    newPath: readonly number[]
  ) {
    if (this.steps === null) return;
    if (
      path.length === newPath.length &&
      path.every((segment, index) => segment === newPath[index])
    ) {
      return;
    }

    const moved = document.node(path);
    const movedId = idOf(moved);

    if (!movedId) {
      this.invalidate();
      return;
    }

    const targetIndex = newPath.at(-1);

    if (targetIndex === undefined) {
      this.invalidate();
      return;
    }

    let to: V4Place;

    if (newPath.length === 1) {
      to = { index: targetIndex, root };
    } else {
      const targetParentPath = newPath.slice(0, -1);
      const targetParent = document.node(targetParentPath);
      const targetParentId = idOf(targetParent);

      if (!targetParentId || !isElementNode(targetParent)) {
        this.invalidate();
        return;
      }

      if (isTextBearingElement(targetParent)) {
        const sourceParentPath = path.slice(0, -1);
        const sameParent =
          sourceParentPath.length === targetParentPath.length &&
          sourceParentPath.every(
            (segment, index) => segment === targetParentPath[index]
          );
        const sourceIndex = path.at(-1);
        const childrenAfterRemove =
          sameParent && sourceIndex !== undefined
            ? targetParent.children.filter((_, idx) => idx !== sourceIndex)
            : targetParent.children;
        const parentAfterRemove: JsonElementNode = {
          ...targetParent,
          children: childrenAfterRemove,
        };

        to = {
          id: targetParentId,
          offset: textOffsetAtChildPath(parentAfterRemove, targetIndex),
        };
      } else {
        to = { id: targetParentId, index: targetIndex };
      }
    }

    this.steps.push({ id: movedId, op: 'move_node', to });
  }

  recordSplitNode(
    document: DocumentIndex,
    root: string,
    path: readonly number[],
    position: number,
    properties: JsonRecord
  ) {
    if (this.steps === null) return;
    const node = document.node(path);

    if (isTextNode(node)) {
      // Splitting a text leaf into two identically marked text leaves is a
      // no-op in the canonical 1D UTF-16 stream.
      return;
    }

    const nodeId = idOf(node);

    if (!nodeId || !isElementNode(node)) {
      this.invalidate();
      return;
    }

    const at = isTextBearingElement(node)
      ? textOffsetAtChildPath(node, position)
      : position;
    const baseProps = nodeProps(node);
    const propsDiff: JsonRecord = {};

    for (const [key, value] of Object.entries(properties)) {
      if (key === 'id' || key === 'children') continue;
      if (!jsonEqual(baseProps[key], value)) {
        propsDiff[key] = cloneJson(value);
      }
    }

    const newId =
      typeof properties.id === 'string' && properties.id.length > 0
        ? properties.id
        : '';
    const stepIndex = this.steps.length;

    this.steps.push({
      at,
      id: nodeId,
      newId,
      op: 'split_node',
      ...(Object.keys(propsDiff).length > 0 ? { props: propsDiff } : {}),
    });

    if (newId.length === 0) {
      const siblingPath = [...path.slice(0, -1), getDefined(path.at(-1)) + 1];

      this.pending.push({
        kind: 'split_node',
        path: siblingPath,
        root,
        stepIndex,
      });
    }
  }

  recordMergeNode(document: DocumentIndex, path: readonly number[]) {
    if (this.steps === null) return;
    const node = document.node(path);

    if (isTextNode(node)) {
      // Merging two text leaves is canonicalized in the 1D stream.
      return;
    }

    const prevPath = [...path.slice(0, -1), getDefined(path.at(-1)) - 1];
    const targetId = idOf(document.node(prevPath));
    const sourceId = idOf(node);

    if (!targetId || !sourceId) {
      this.invalidate();
      return;
    }
    this.steps.push({ op: 'join_nodes', source: sourceId, target: targetId });
  }

  recordSetNode(
    document: DocumentIndex,
    root: string,
    path: readonly number[],
    newProperties: JsonRecord,
    properties: JsonRecord,
    isSetValued: DocumentSetPropertyResolver
  ) {
    if (this.steps === null) return;
    const node = document.node(path);
    const beforeProps = isElementNode(node)
      ? nodeProps(node)
      : (() => {
          const { text: _t, ...rest } = node;

          return rest as JsonRecord;
        })();
    const afterProps: JsonRecord = { ...beforeProps };

    for (const key of Object.keys(properties)) {
      if (!Object.hasOwn(newProperties, key)) delete afterProps[key];
    }
    for (const [key, value] of Object.entries(newProperties)) {
      if (value === undefined) delete afterProps[key];
      else afterProps[key] = value;
    }

    const context = getDocumentPropertyContext(
      document,
      path,
      root === 'main' ? null : root
    );
    const delta = propDeltaBetween(beforeProps, afterProps, (key) =>
      isSetValued(node, key, context)
    );

    if (isEmptyPropDelta(delta)) return;

    if (isElementNode(node)) {
      const targetId = idOf(node);

      if (!targetId) {
        this.invalidate();
        return;
      }
      this.steps.push({ ...delta, id: targetId, op: 'set_props' });
      return;
    }

    const info = parentElementOf(document, path);

    if (!info) {
      this.invalidate();
      return;
    }

    if (node.text.length === 0) {
      if (info.parent.children.length === 1) {
        this.steps.push({
          ...delta,
          length: 0,
          offset: 0,
          op: 'format_text',
          target: info.parentId,
        });
      }
      return;
    }

    this.steps.push({
      ...delta,
      length: node.text.length,
      offset: textOffsetAtChildPath(info.parent, info.childIndex),
      op: 'format_text',
      target: info.parentId,
    });
  }

  recordReplaceChildren(
    document: DocumentIndex,
    root: string,
    path: readonly number[],
    index: number,
    removeCount: number,
    children: readonly JsonNode[]
  ) {
    if (this.steps === null) return;
    if (removeCount === 0 && children.length === 0) return;
    if (path.length === 0 && children.length > 0) this.ensureRootExists(root);

    if (path.length > 0) {
      const parent = document.node(path);
      const parentId = idOf(parent);

      if (!parentId || !isElementNode(parent)) {
        this.invalidate();
        return;
      }

      if (isTextBearingElement(parent)) {
        const offset = textOffsetAtChildPath(parent, index);
        let removeLength = 0;

        for (let i = index; i < index + removeCount; i += 1) {
          const child = parent.children[i];

          if (!child) continue;
          removeLength += isElementNode(child) ? 1 : child.text.length;
        }
        if (removeLength > 0) {
          this.steps.push({
            length: removeLength,
            offset,
            op: 'delete_text',
            target: parentId,
          });
        }

        const stream = toV4TextStream(children);
        let cursor = offset;
        let i = 0;

        while (i < stream.units.length) {
          const unit = getDefined(stream.units[i]);

          if (unit.kind === 'inline') {
            if (!idOf(unit.node)) {
              this.invalidate();
              return;
            }
            this.steps.push({
              node: cloneJson(unit.node),
              op: 'insert_node',
              to: { id: parentId, index: cursor },
            });
            cursor += 1;
            i += 1;
          } else {
            const { marks } = unit;
            let text = unit.ch;
            let j = i + 1;

            while (j < stream.units.length) {
              const next = getDefined(stream.units[j]);

              if (next.kind === 'char' && jsonEqual(next.marks, marks)) {
                text += next.ch;
                j += 1;
              } else {
                break;
              }
            }
            this.steps.push({
              ...(Object.keys(marks).length > 0
                ? { marks: cloneJson(marks) }
                : {}),
              offset: cursor,
              op: 'insert_text',
              target: parentId,
              text,
            });
            cursor += text.length;
            i = j;
          }
        }
        return;
      }
    }

    const parentNode = path.length === 0 ? null : document.node(path);
    const parentId = parentNode === null ? null : idOf(parentNode);

    if (
      path.length > 0 &&
      (!parentId || !parentNode || !isElementNode(parentNode))
    ) {
      this.invalidate();
      return;
    }

    for (let i = 0; i < removeCount; i += 1) {
      const removed =
        parentNode === null
          ? document.node([index + i])
          : isElementNode(parentNode)
            ? parentNode.children[index + i]
            : undefined;
      const removedId = idOf(removed);

      if (!removedId) {
        this.invalidate();
        return;
      }
      this.steps.push({ id: removedId, op: 'remove_node' });
    }

    for (let k = 0; k < children.length; k += 1) {
      const child = getDefined(children[k]);

      if (!isElementNode(child)) {
        this.invalidate();
        return;
      }

      const to: V4Place =
        parentId === null
          ? { index: index + k, root }
          : { id: parentId, index: index + k };
      const stepIndex = this.steps.length;

      this.steps.push({ node: cloneJson(child), op: 'insert_node', to });
      if (!idOf(child)) {
        this.pending.push({
          kind: 'insert_node',
          path: [...path, index + k],
          root,
          stepIndex,
        });
      }
    }
  }

  recordWrapChildren(
    document: DocumentIndex,
    root: string,
    path: readonly number[],
    index: number,
    count: number,
    wrapper: JsonRecord
  ) {
    if (this.steps === null) return;
    const shell: JsonElementNode = { ...cloneJson(wrapper), children: [] };

    if (path.length > 0) {
      const parent = document.node(path);
      const parentId = idOf(parent);

      if (!parentId || !isElementNode(parent)) {
        this.invalidate();
        return;
      }
      if (isTextBearingElement(parent)) {
        const offset = textOffsetAtChildPath(parent, index);
        let length = 0;

        for (let i = index; i < index + count; i += 1) {
          const child = parent.children[i];

          if (!child) continue;
          length += isElementNode(child) ? 1 : child.text.length;
        }

        const stepIndex = this.steps.length;

        this.steps.push({
          length,
          node: shell,
          offset,
          op: 'wrap_inline',
          target: parentId,
        });
        if (!idOf(shell)) {
          this.pending.push({
            kind: 'wrap_inline',
            path: [...path, index],
            root,
            stepIndex,
          });
        }
        return;
      }
    }

    // Block-level wrap: insert wrapper then move children into it.
    const wrapperId = idOf(shell);

    if (!wrapperId) {
      this.invalidate();
      return;
    }

    const parentNode = path.length === 0 ? null : document.node(path);
    const to: V4Place =
      parentNode === null
        ? { index, root }
        : { id: getDefined(idOf(parentNode)), index };

    this.steps.push({ node: shell, op: 'insert_node', to });
    for (let k = 0; k < count; k += 1) {
      const child =
        parentNode === null
          ? document.node([index + k])
          : isElementNode(parentNode)
            ? parentNode.children[index + k]
            : undefined;
      const childId = idOf(child);

      if (!childId) {
        this.invalidate();
        return;
      }
      this.steps.push({
        id: childId,
        op: 'move_node',
        to: { id: wrapperId, index: k },
      });
    }
  }

  recordUnwrapNode(
    document: DocumentIndex,
    root: string,
    path: readonly number[]
  ) {
    if (this.steps === null) return;
    const node = document.node(path);
    const nodeId = idOf(node);

    if (!nodeId || !isElementNode(node)) {
      this.invalidate();
      return;
    }

    if (path.length > 1) {
      const info = parentElementOf(document, path);

      if (!info) {
        this.invalidate();
        return;
      }
      if (isTextBearingElement(info.parent)) {
        this.steps.push({
          id: nodeId,
          op: 'unwrap_inline',
          parent: info.parentId,
        });
        return;
      }
      for (let k = 0; k < node.children.length; k += 1) {
        const childId = idOf(node.children[k]);

        if (!childId) {
          this.invalidate();
          return;
        }
        this.steps.push({
          id: childId,
          op: 'move_node',
          to: { id: info.parentId, index: info.childIndex + k },
        });
      }
      this.steps.push({ id: nodeId, op: 'remove_node' });
      return;
    }

    const index = path[0];

    for (let k = 0; k < node.children.length; k += 1) {
      const childId = idOf(node.children[k]);

      if (!childId) {
        this.invalidate();
        return;
      }
      this.steps.push({
        id: childId,
        op: 'move_node',
        to: { index: index + k, root },
      });
    }
    this.steps.push({ id: nodeId, op: 'remove_node' });
  }

  /**
   * Resolve element IDs minted during `finalize` (e.g. `splitNode` /
   * `insertNode` / `wrapChildren` without explicit `id`). Returns `true` if
   * every pending ID resolved cleanly without needing a fallback diff.
   */
  resolvePendingIds(getIndex: (root: string) => DocumentIndex): boolean {
    if (this.steps === null) return false;
    if (this.pending.length === 0) return true;

    for (const entry of this.pending) {
      const step = this.steps[entry.stepIndex];

      if (!step) {
        this.invalidate();
        return false;
      }

      let resolvedId: string | null = null;

      try {
        const node = getIndex(entry.root).node(entry.path);

        resolvedId = idOf(node);
      } catch {
        resolvedId = null;
      }

      if (!resolvedId) {
        this.invalidate();
        return false;
      }

      if (entry.kind === 'split_node' && step.op === 'split_node') {
        this.steps[entry.stepIndex] = { ...step, newId: resolvedId };
      } else if (entry.kind === 'insert_node' && step.op === 'insert_node') {
        this.steps[entry.stepIndex] = {
          ...step,
          node: { ...step.node, id: resolvedId },
        };
      } else if (entry.kind === 'wrap_inline' && step.op === 'wrap_inline') {
        this.steps[entry.stepIndex] = {
          ...step,
          node: { ...step.node, id: resolvedId },
        };
      }
    }

    this.pending = [];
    return true;
  }
}

export { elementStreamLength };
