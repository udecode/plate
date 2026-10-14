import { nanoid } from 'nanoid';

import {
  ElementApi,
  PathApi,
  type Descendant,
  type EditorCoreStateView,
  type EditorUpdateTransaction,
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
  type ListLevel,
  type ListLevels,
} from './listIndex.internal';

export type NodeReader = {
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
  headingType: string | undefined,
  matchStyle = true
) =>
  candidate.listType === listType &&
  (!matchStyle || getElementListStyle(candidate) === style) &&
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

type ListJoinTarget = Readonly<{
  depth: number;
  heading: boolean;
  headingType: string | undefined;
  listType: ListType;
  matchStyle?: boolean;
  style: string | undefined;
}>;

const findJoiningListItem = (
  state: NodeReader,
  path: Path,
  next: ListJoinTarget,
  walk: 'both' | 'previous' = 'both'
): Element | undefined => {
  const { depth, heading, headingType, listType, matchStyle, style } = next;
  let parent: Element | undefined;
  const sameDepth = (sibling: Element) => {
    const siblingDepth = getListIndent(sibling);

    if (siblingDepth > depth) return 'skip' as const;
    if (siblingDepth < depth) {
      parent ??= isListItem(sibling) ? sibling : undefined;

      return 'stop' as const;
    }

    return isListItem(sibling) &&
      compatible(sibling, listType, style, heading, headingType, matchStyle)
      ? sibling
      : ('stop' as const);
  };

  const previous = walkSiblings(state, path, 'previous', sameDepth);

  if (previous) return previous;
  if (parent) return parent;
  if (walk === 'previous') return undefined;

  const following = walkSiblings(state, path, 'next', sameDepth);

  return following;
};

const newListIdentity = (): ListIdentity => ({
  listId: createListId(),
  listLevels: undefined,
});

export const resolveListIdentity = (
  state: NodeReader,
  path: Path,
  next: ListJoinTarget
): ListIdentity => {
  const joined = findJoiningListItem(state, path, next);

  return joined ? identityOf(joined) : newListIdentity();
};

export const joinInsertedListItem = (
  tx: Pick<EditorUpdateTransaction, 'nodes'>,
  [node, path]: NodeEntry<Element>,
  headingType: string | undefined
) => {
  const { listId, listLevels } = resolveListIdentity(tx, path, {
    depth: getListIndent(node),
    heading: headingType !== undefined && node.type === headingType,
    headingType,
    listType: node.listType as ListType,
    style: getElementListStyle(node),
  });

  if (listId !== undefined) {
    tx.nodes.set(
      { listId, ...(listLevels === undefined ? {} : { listLevels }) },
      { at: path }
    );
  }
};

export type ListLanding =
  | Readonly<{
      /** The block where the content lands, which stays (`kept`) or which the content replaces (`replaced`). */
      block: Element | undefined;
      kind: 'kept' | 'replaced';
    }>
  | Readonly<{
      /** An empty line the content replaces; the content's first list may join a list above it. */
      kind: 'line';
      line: NodeEntry<Element>;
    }>;

/**
 * Give inserted content's lists their identities. Each source list gets one
 * fresh id across the content, tables included, and items without an id count
 * as one list. Only the first top-level list may join the landing's list.
 * Joining requires matching kind and heading role; `land` also requires
 * matching style. On an empty line, a shallower list item above it can supply
 * the identity without those matches. Every other list keeps its fresh id.
 *
 * `paste` lands the copied list forest at the target depth and joins without
 * matching styles. Joined roots take the joined list's style only when their
 * kinds match. The paste middleware gives the inserted head an empty target's
 * own start and restart when present. `land`
 * also shifts top-level content by the landing's depth, and the joined head
 * takes a replaced landing's start and restart, or drops its own start to
 * continue the list of a kept block or an empty line.
 */
export const landListContent = <N extends Descendant>(
  state: NodeReader,
  content: readonly N[],
  landing: ListLanding,
  {
    headingType,
    placement,
  }: Readonly<{
    headingType: string | undefined;
    placement: 'land' | 'paste';
  }>
): ReadonlyArray<Element | N> => {
  const sourceOf = (node: Element) =>
    typeof node.listId === 'string' ? node.listId : '';
  const heads = new Map<string, Element>();
  let first: Element | undefined;
  const scan = (nodes: readonly Descendant[], top: boolean) => {
    for (const node of nodes) {
      if (!ElementApi.isElement(node)) continue;
      if (isListItem(node)) {
        const source = sourceOf(node);

        if (!heads.has(source)) heads.set(source, node);
        if (top) first ??= node;
      }
      scan(node.children, false);
    }
  };

  scan(content, true);

  const into = landing.kind === 'line' ? landing.line[0] : landing.block;
  const land = placement === 'land';
  const paste = placement === 'paste';
  const shift = land && into ? getListIndent(into) - 1 : 0;

  if (heads.size === 0 && shift === 0) return content;

  const joinedSource = first && sourceOf(first);
  let anchor: Element | undefined;

  if (first) {
    const listType = first.listType as ListType;
    const style = getElementListStyle(first);
    const heading = headingType !== undefined && first.type === headingType;

    anchor =
      landing.kind === 'line'
        ? findJoiningListItem(
            state,
            landing.line[1],
            {
              depth: paste ? 1 : getListIndent(landing.line[0]),
              matchStyle: !paste,
              heading,
              headingType,
              listType,
              style,
            },
            'previous'
          )
        : into &&
            isListItem(into) &&
            compatible(into, listType, style, heading, headingType, !paste)
          ? into
          : undefined;
  }

  const joined = anchor && identityOf(anchor);
  const landingDepth = into && isListItem(into) ? getListIndent(into) : 1;
  const depths = new Map<Element, number>();
  const ancestors: Array<{ source: number; landed: number }> = [];

  if (paste) {
    for (const node of content) {
      if (!ElementApi.isElement(node) || !isListItem(node)) {
        ancestors.length = 0;
        continue;
      }

      const source = getListIndent(node);

      let parent = ancestors.at(-1);

      while (parent && parent.source >= source) {
        ancestors.pop();
        parent = ancestors.at(-1);
      }

      const landed = parent
        ? parent.landed + source - parent.source
        : landingDepth;

      depths.set(node, landed);
      ancestors.push({ source, landed });
    }
  }

  const fresh = new Map(
    [...heads.keys()].map((source) => [source, createListId()])
  );
  const joinedHead =
    joined && joinedSource !== undefined ? heads.get(joinedSource) : undefined;
  const landElement = (node: Element, top: boolean): Element => {
    const children = node.children.map((child) =>
      ElementApi.isElement(child) ? landElement(child, false) : child
    );
    const pastedDepth = depths.get(node);
    const depth =
      pastedDepth !== undefined
        ? { indent: pastedDepth }
        : top &&
            shift !== 0 &&
            (isListItem(node) || typeof node.indent === 'number')
          ? { indent: getListIndent(node) + shift }
          : {};

    if (!isListItem(node)) return { ...node, ...depth, children };

    const {
      listId: _listId,
      listStyle,
      listLevels,
      listRestart,
      listStart,
      ...rest
    } = node;
    const source = sourceOf(node);
    const { listId, listLevels: levels } =
      joined && source === joinedSource
        ? joined
        : { listId: fresh.get(source), listLevels };
    const levelOffset =
      depth.indent === undefined ? 0 : depth.indent - getListIndent(node);
    let landedLevels = levels;

    if (
      !(joined && source === joinedSource) &&
      levelOffset !== 0 &&
      isListLevels(levels)
    ) {
      const rebased: Record<string, ListLevel> = {};

      for (const [level, rule] of Object.entries(levels)) {
        const landed = Number(level) + levelOffset;

        if (landed < 1) continue;
        rebased[landed] = {
          ...rule,
          ...(rule.restartAfter
            ? { restartAfter: Math.max(0, rule.restartAfter + levelOffset) }
            : {}),
        };
      }
      landedLevels = rebased;
    }
    const style =
      paste &&
      joined &&
      source === joinedSource &&
      pastedDepth === landingDepth &&
      node.listType === anchor?.listType
        ? anchor?.listStyle
        : listStyle;
    const starts =
      land && node === joinedHead
        ? landing.kind === 'replaced'
          ? {
              listRestart: landing.block?.listRestart,
              listStart: landing.block?.listStart,
            }
          : { listRestart, listStart: undefined }
        : { listRestart, listStart };

    return {
      ...rest,
      ...depth,
      children,
      ...(listId === undefined ? {} : { listId }),
      ...(style === undefined ? {} : { listStyle: style }),
      ...(landedLevels === undefined ? {} : { listLevels: landedLevels }),
      ...(starts.listRestart === undefined
        ? {}
        : { listRestart: starts.listRestart }),
      ...(starts.listStart === undefined
        ? {}
        : { listStart: starts.listStart }),
    };
  };

  return content.map((node) =>
    ElementApi.isElement(node) ? landElement(node, true) : node
  );
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
