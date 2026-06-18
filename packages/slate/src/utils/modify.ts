import { setChildren as setEditorChildren } from '../core/public-state';
import {
  type Ancestor,
  type Descendant,
  type Element,
  NodeApi,
  type Path,
  type Text,
} from '../interfaces';
import { Editor } from '../interfaces/editor';
import { formatDebugValue } from './format-debug-value';
import { inheritRuntimeId } from './runtime-ids';

const setChildren = (root: Ancestor, children: Descendant[]) => {
  if (NodeApi.isEditor(root)) {
    setEditorChildren(root, children);
    return;
  }

  (root as { children: Descendant[] }).children = children;
};

const getChildren = (root: Ancestor): Descendant[] =>
  NodeApi.isEditor(root) ? Editor.getChildren(root) : root.children;

export const insertChildren = <T>(xs: T[], index: number, ...newValues: T[]) =>
  insertChildRange(xs, index, newValues);

export const insertChildRange = <T>(
  xs: T[],
  index: number,
  newValues: readonly T[]
) => xs.slice(0, index).concat(newValues, xs.slice(index));

export const replaceChildren = <T>(
  xs: T[],
  index: number,
  removeCount: number,
  ...newValues: T[]
) => replaceChildRange(xs, index, removeCount, newValues);

export const replaceChildRange = <T>(
  xs: T[],
  index: number,
  removeCount: number,
  newValues: readonly T[]
) => xs.slice(0, index).concat(newValues, xs.slice(index + removeCount));

export const removeChildren = <T>(
  xs: T[],
  index: number,
  removeCount: number
) => replaceChildRange(xs, index, removeCount, []);

/**
 * Replace a descendant with a new node, replacing all ancestors
 */
export const modifyDescendant = <N extends Descendant>(
  root: Ancestor,
  path: Path,
  f: (node: N) => N
) => {
  const owner = NodeApi.isEditor(root) ? root : undefined;

  if (path.length === 0) {
    throw new Error('Cannot modify the editor');
  }

  const node = NodeApi.get(root, path) as N;
  const slicedPath = path.slice();
  let modifiedNode: Descendant = f(node);
  inheritRuntimeId(modifiedNode, node, owner);

  while (slicedPath.length > 1) {
    const index = slicedPath.pop()!;
    const ancestorNode = NodeApi.get(root, slicedPath) as Ancestor;
    if (NodeApi.isEditor(ancestorNode)) {
      throw new Error('Cannot modify the editor as a descendant');
    }

    modifiedNode = {
      ...ancestorNode,
      children: replaceChildren(
        getChildren(ancestorNode),
        index,
        1,
        modifiedNode
      ),
    };
    inheritRuntimeId(modifiedNode, ancestorNode, owner);
  }

  const index = slicedPath.pop()!;
  setChildren(root, replaceChildren(getChildren(root), index, 1, modifiedNode));
};

/**
 * Replace the children of a node, replacing all ancestors
 */
export const modifyChildren = (
  root: Ancestor,
  path: Path,
  f: (children: Descendant[]) => Descendant[]
) => {
  if (path.length === 0) {
    setChildren(root, f(getChildren(root)));
  } else {
    modifyDescendant<Element>(root, path, (node) => {
      if (NodeApi.isText(node)) {
        throw new Error(
          `Cannot get the element at path [${path}] because it refers to a leaf node: ${formatDebugValue(
            node
          )}`
        );
      }

      return { ...node, children: f(node.children) };
    });
  }
};

/**
 * Replace a leaf, replacing all ancestors
 */
export const modifyLeaf = (
  root: Ancestor,
  path: Path,
  f: (leaf: Text) => Text
) =>
  modifyDescendant(root, path, (node) => {
    if (!NodeApi.isText(node)) {
      throw new Error(
        `Cannot get the leaf node at path [${path}] because it refers to a non-leaf node: ${formatDebugValue(
          node
        )}`
      );
    }

    return f(node);
  });
