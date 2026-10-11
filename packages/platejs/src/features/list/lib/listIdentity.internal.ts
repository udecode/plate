import { nanoid } from 'nanoid';

import {
  ElementApi,
  PathApi,
  type Descendant,
  type EditorCoreStateView,
  type Element,
  type NodeEntry,
  type Path,
} from '../../../core';
import type { ListType } from './BaseListPlugin';
import {
  getElementListStyle,
  getListIndent,
  isListItem,
  isListLevels,
  type ListLevels,
} from './listIndex.internal';

type NodeReader = {
  nodes: Pick<EditorCoreStateView['nodes'], 'get'>;
};

// Joining looks at nearby blocks only, so a command never walks a long run.
const JOIN_SCAN_LIMIT = 64;

/** The identity an item takes: an existing list's, or a fresh one. */
export type ListIdentity = Readonly<{
  /** `undefined` keeps the item in its root's default list. */
  listId: string | undefined;
  listLevels: ListLevels | undefined;
}>;

const identityOf = (element: Element): ListIdentity => ({
  listId: typeof element.listId === 'string' ? element.listId : undefined,
  listLevels: isListLevels(element.listLevels) ? element.listLevels : undefined,
});

export const createListId = () => nanoid(10);

const compatible = (
  candidate: Element,
  listType: ListType,
  style: string | undefined,
  heading: boolean,
  headingType: string | undefined
) =>
  candidate.listType === listType &&
  getElementListStyle(candidate) === style &&
  (headingType !== undefined && candidate.type === headingType) === heading;

const walkSiblings = (
  state: NodeReader,
  path: Path,
  direction: 'next' | 'previous',
  visit: (sibling: Element) => 'skip' | 'stop' | Element
): Element | undefined => {
  let siblingPath = path;

  for (let visited = 0; visited < JOIN_SCAN_LIMIT; visited += 1) {
    if (direction === 'previous' && !PathApi.hasPrevious(siblingPath)) {
      return undefined;
    }
    siblingPath =
      direction === 'next'
        ? PathApi.next(siblingPath)
        : PathApi.previous(siblingPath);

    const sibling = state.nodes.get(siblingPath, {
      match: ElementApi.isElement,
    })?.[0];

    if (!sibling) return undefined;

    const result = visit(sibling);

    if (result === 'stop') return undefined;
    if (result !== 'skip') return result;
  }

  return undefined;
};

const joinListIdentity = (
  state: NodeReader,
  path: Path,
  next: Readonly<{
    depth: number;
    heading: boolean;
    headingType: string | undefined;
    listType: ListType;
    style: string | undefined;
  }>
): ListIdentity | undefined => {
  const { depth, heading, headingType, listType, style } = next;
  let parent: Element | undefined;
  const sameDepth = (sibling: Element) => {
    const siblingDepth = getListIndent(sibling);

    if (siblingDepth > depth) return 'skip' as const;
    if (siblingDepth < depth) {
      parent ??= isListItem(sibling) ? sibling : undefined;

      return 'stop' as const;
    }

    return isListItem(sibling) &&
      compatible(sibling, listType, style, heading, headingType)
      ? sibling
      : ('stop' as const);
  };

  const previous = walkSiblings(state, path, 'previous', sameDepth);

  if (previous) return identityOf(previous);
  if (parent) return identityOf(parent);

  const following = walkSiblings(state, path, 'next', sameDepth);

  return following && identityOf(following);
};

export const resolveListIdentity = (
  state: NodeReader,
  path: Path,
  next: Parameters<typeof joinListIdentity>[2]
): ListIdentity =>
  joinListIdentity(state, path, next) ?? {
    listId: createListId(),
    listLevels: undefined,
  };

export const readMissingListIdentity = (
  state: NodeReader,
  [node, path]: NodeEntry<Element>,
  headingType: string | undefined
) => {
  if (!isListItem(node) || Object.hasOwn(node, 'listId')) return undefined;

  const identity = resolveListIdentity(state, path, {
    depth: getListIndent(node),
    heading: headingType !== undefined && node.type === headingType,
    headingType,
    listType: node.listType as ListType,
    style: getElementListStyle(node),
  });

  return identity.listId === undefined
    ? undefined
    : {
        listId: identity.listId,
        ...(identity.listLevels === undefined
          ? {}
          : { listLevels: identity.listLevels }),
      };
};

/**
 * The items one toggle changes besides the item itself: its neighbors at the
 * same depth in the same list, of the same kind and heading role, walking past
 * deeper blocks. A forced restart bounds the run: it opens one and ends the
 * one before it.
 */
export const getListRunSiblings = (
  state: NodeReader,
  [node, path]: NodeEntry<Element>,
  headingType: string | undefined
): Array<NodeEntry<Element>> => {
  const depth = getListIndent(node);
  const heading = headingType !== undefined && node.type === headingType;
  const run: Array<NodeEntry<Element>> = [];
  const inRun = (sibling: Element) =>
    sibling.listType === node.listType &&
    sibling.listId === node.listId &&
    (headingType !== undefined && sibling.type === headingType) === heading;

  for (const direction of ['previous', 'next'] as const) {
    if (direction === 'previous' && Object.hasOwn(node, 'listRestart')) {
      continue;
    }

    let siblingPath = path;

    for (;;) {
      if (direction === 'previous' && !PathApi.hasPrevious(siblingPath)) break;
      siblingPath =
        direction === 'next'
          ? PathApi.next(siblingPath)
          : PathApi.previous(siblingPath);

      const sibling = state.nodes.get(siblingPath, {
        match: ElementApi.isElement,
      });

      if (!sibling) break;

      const [siblingNode] = sibling;
      const siblingDepth = getListIndent(siblingNode);

      if (siblingDepth > depth) continue;
      if (siblingDepth < depth || !inRun(siblingNode)) break;
      if (direction === 'next') {
        if (Object.hasOwn(siblingNode, 'listRestart')) break;
        run.push(sibling);
      } else {
        run.unshift(sibling);
        if (Object.hasOwn(siblingNode, 'listRestart')) break;
      }
    }
  }

  return run;
};

export const findContinuedItem = (
  state: NodeReader,
  [node, path]: NodeEntry<Element>
) => {
  const depth = getListIndent(node);
  const style = getElementListStyle(node);

  return walkSiblings(state, path, 'previous', (candidate) => {
    if (!isListItem(candidate)) return 'skip';

    const candidateDepth = getListIndent(candidate);

    if (candidateDepth < depth) return 'stop';

    return candidateDepth === depth &&
      candidate.listType === 'numbered' &&
      candidate.type === node.type &&
      getElementListStyle(candidate) === style
      ? candidate
      : 'skip';
  });
};

export const hasNeighborInList = (
  state: NodeReader,
  [node, path]: NodeEntry<Element>
) => {
  const depth = getListIndent(node);
  const listmate = (sibling: Element) =>
    isListItem(sibling) && sibling.listId === node.listId;

  return (['previous', 'next'] as const).some((direction) =>
    walkSiblings(state, path, direction, (sibling) => {
      if (listmate(sibling)) return sibling;

      return getListIndent(sibling) < depth ? 'stop' : 'skip';
    })
  );
};

type ListPosition = Readonly<{
  /** Items of the target's list, in document order. */
  items: ReadonlyArray<NodeEntry<Element>>;
  previousCompatible: NodeEntry<Element> | undefined;
  index: number;
}>;

export const readListPosition = (
  children: readonly Descendant[],
  target: Element,
  headingType: string | undefined
): ListPosition | undefined => {
  const id = target.listId;
  const depth = getListIndent(target);
  const heading = headingType !== undefined && target.type === headingType;
  const style = getElementListStyle(target);
  const items: Array<NodeEntry<Element>> = [];
  let previousCompatible: NodeEntry<Element> | undefined;
  let index = -1;
  const visit = (nodes: readonly Descendant[], parentPath: Path) => {
    nodes.forEach((node, offset) => {
      if (!ElementApi.isElement(node)) return;

      const path = [...parentPath, offset];

      if (isListItem(node)) {
        if (node.listId === id) {
          if (node === target) index = items.length;
          items.push([node, path]);
        } else if (
          index < 0 &&
          getListIndent(node) === depth &&
          compatible(node, 'numbered', style, heading, headingType)
        ) {
          previousCompatible = [node, path];
        }
      }
      visit(node.children, path);
    });
  };

  visit(children, []);

  return index < 0 ? undefined : { index, items, previousCompatible };
};
