import type { Editor } from '../../../core';
import {
  ElementApi,
  PathApi,
  type Descendant,
  type EditorCoreStateView,
  type EditorUpdateTransaction,
  type Element,
  type NamedRootKey,
  type NodeEntry,
  type NodeKey,
  type Path,
} from '../../../facade';
import { inRoot } from '../../../internal/utils/inRoot';
import { BaseIndentPlugin } from '../../indent';
import { listItemDepth, isListItem } from './listIndex.internal';

/** A block's list depth: an omitted indent reads as 1 on a list item and 0 elsewhere. */
export const listDepth = (node: Element) =>
  isListItem(node) ? listItemDepth(node) : Number(node.indent ?? 0);

// Per sibling array and depth, the index of the last sibling deeper than the
// depth in the unbroken run starting at each asked sibling, or -1 when that
// sibling starts no run. A lookup walks a run once and records every sibling
// in it, so hovers and keyboard steps never walk a family twice and read at
// most one sibling past the run they ask about.
const RUN_ENDS = new WeakMap<
  readonly Descendant[],
  Map<number, Map<number, number>>
>();

export const deeperRunEnd = (
  siblings: readonly Descendant[],
  depth: number,
  start: number
) => {
  let byDepth = RUN_ENDS.get(siblings);

  if (!byDepth) {
    byDepth = new Map();
    RUN_ENDS.set(siblings, byDepth);
  }

  let ends = byDepth.get(depth);

  if (!ends) {
    ends = new Map();
    byDepth.set(depth, ends);
  }

  const known = ends.get(start);

  if (known !== undefined) return known;

  let index = start;

  while (index < siblings.length && !ends.has(index)) {
    const node = siblings[index];

    if (!ElementApi.isElement(node) || listDepth(node) <= depth) break;
    index += 1;
  }

  if (index === start) {
    ends.set(start, -1);

    return -1;
  }

  const joined = ends.get(index);
  const last = joined !== undefined && joined >= 0 ? joined : index - 1;

  for (let visited = start; visited < index; visited += 1) {
    ends.set(visited, last);
  }

  return last;
};

/**
 * The index of the last member of the family `siblings[index]` heads. A list
 * item heads itself and every following sibling deeper than it, list or not;
 * any other block is a family of one.
 */
export const listFamilyEnd = (
  siblings: readonly Descendant[],
  index: number
) => {
  const node = siblings[index];

  if (!ElementApi.isElement(node) || !isListItem(node)) return index;

  return Math.max(index, deeperRunEnd(siblings, listDepth(node), index + 1));
};

type FamilyMember = Readonly<{ key: NodeKey; node: Element; path: Path }>;

/**
 * The families `entries` head, in document order, read before any write. An
 * entry inside an earlier entry's family moves with that family and heads
 * none of its own.
 */
export const getListFamilies = (
  state: Pick<EditorCoreStateView, 'children' | 'key' | 'nodes' | 'root'>,
  entries: ReadonlyArray<NodeEntry<Element>>,
  root?: NamedRootKey
) => {
  const families: FamilyMember[][] = [];
  const seen = new Set<Descendant>();

  for (const [node, path] of entries) {
    if (seen.has(node)) continue;

    const parentPath = PathApi.parent(path);
    const index = path.at(-1) ?? 0;
    const parent =
      parentPath.length > 0
        ? state.nodes.get(inRoot(parentPath, root), {
            match: ElementApi.isElement,
          })?.[0]
        : undefined;
    const siblings = parent
      ? parent.children
      : root === undefined
        ? state.children()
        : state.root(root);
    const end = listFamilyEnd(siblings, index);
    const family: FamilyMember[] = [];

    for (let member = index; member <= end; member += 1) {
      const sibling = siblings[member];
      const memberPath = [...parentPath, member];
      const key = state.key(inRoot(memberPath, root));

      if (!ElementApi.isElement(sibling) || !key) continue;
      seen.add(sibling);
      family.push({ key, node: sibling, path: memberPath });
    }
    families.push(family);
  }

  return families;
};

export const shiftListFamilyMember = (
  tx: EditorUpdateTransaction,
  { key, node }: FamilyMember,
  offset: 1 | -1
) => {
  const depth = listDepth(node) + offset;

  if (depth > 0) {
    tx.nodes.set({ indent: depth }, { at: key });
  } else {
    tx.nodes.unset('indent', { at: key });
  }
};

/**
 * Moves each family `entries` head one level deeper or shallower, so a list
 * item keeps its nested blocks under it. A deeper move skips a family whose
 * deepest member would pass Indent's `indentMax`.
 */
export const moveListFamilies = (
  editor: Editor,
  tx: EditorUpdateTransaction,
  entries: ReadonlyArray<NodeEntry<Element>>,
  { offset, root }: Readonly<{ offset: 1 | -1; root?: NamedRootKey }>
) => {
  const { indentMax } = editor.plugin(BaseIndentPlugin).store.get();

  for (const family of getListFamilies(tx, entries, root)) {
    if (
      offset > 0 &&
      typeof indentMax === 'number' &&
      family.some(({ node }) => listDepth(node) + 1 > indentMax)
    ) {
      continue;
    }
    for (const member of family) {
      shiftListFamilyMember(tx, member, offset);
    }
  }
};
