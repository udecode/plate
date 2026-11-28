import {
  ElementApi,
  PathApi,
  type Descendant,
  type EditorCoreStateView,
  type EditorUpdateTransaction,
  type Element,
  type NodeEntry,
  type NodeKey,
  type Path,
} from '../../../facade';
import {
  hasNonWritableBlock,
  type IndentShiftContext,
  type IndentShiftPlan,
} from '../../../internal/plugin/indentShift';
import { planMovedListStyles, type NodeReader } from './listIdentity.internal';
import { isListItem, LIST_FIELDS, listDepth } from './listIndex.internal';

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

const familyMembersBySiblings = new WeakMap<
  readonly Descendant[],
  readonly boolean[]
>();

export const isListFamilyMember = (
  siblings: readonly Descendant[],
  index: number
) => {
  let members = familyMembersBySiblings.get(siblings);

  if (!members) {
    const heads: number[] = [];

    members = siblings.map((node) => {
      if (!ElementApi.isElement(node)) {
        heads.length = 0;

        return false;
      }

      const depth = listDepth(node);

      while (heads.length > 0 && (heads.at(-1) ?? 0) >= depth) heads.pop();

      const member = isListItem(node) || heads.length > 0;

      if (isListItem(node)) heads.push(depth);

      return member;
    });
    familyMembersBySiblings.set(siblings, members);
  }

  return members[index] ?? false;
};

type FamilyMember = Readonly<{ key: NodeKey; node: Element; path: Path }>;

export const getSiblingsAtPath = (
  rootChildren: readonly Descendant[],
  parentPath: Path
): readonly Descendant[] => {
  let current = rootChildren;

  for (const step of parentPath) {
    const next = current[step];

    if (!ElementApi.isElement(next)) return [];
    current = next.children;
  }

  return current;
};

export const rootedNodeReader = (
  tx: Pick<EditorCoreStateView, 'children' | 'nodes' | 'root'>,
  root: string | undefined
): NodeReader => {
  if (!root) return tx;

  return {
    nodes: {
      children: (parentPath: Path) =>
        getSiblingsAtPath(tx.root(root), parentPath),
      get: (target, options) => {
        if (target.length === 0) return undefined;

        const siblings = getSiblingsAtPath(
          tx.root(root),
          PathApi.parent(target)
        );
        const node = siblings[target.at(-1) ?? -1];

        if (!node || !options.match(node)) return undefined;

        return [node, target];
      },
    },
  };
};

/**
 * The families `entries` head, in document order, read before any write. An
 * entry inside an earlier entry's family moves with that family and heads
 * none of its own.
 */
export const getListFamilies = (
  state: Pick<EditorCoreStateView, 'children' | 'key' | 'root' | 'view'>,
  entries: ReadonlyArray<NodeEntry<Element>>,
  root: string | undefined = state.view.root()
) => {
  const families: FamilyMember[][] = [];
  const seen = new Set<Descendant>();
  const rootChildren = root ? state.root(root) : state.children();

  for (const [node, path] of entries) {
    if (seen.has(node)) continue;

    const parentPath = PathApi.parent(path);
    const index = path.at(-1) ?? 0;
    const siblings = getSiblingsAtPath(rootChildren, parentPath);
    const end = listFamilyEnd(siblings, index);
    const family: FamilyMember[] = [];

    for (let member = index; member <= end; member += 1) {
      const sibling = siblings[member];

      if (!ElementApi.isElement(sibling)) continue;

      const key = state.key(sibling);

      if (!key) continue;
      seen.add(sibling);
      family.push({ key, node: sibling, path: [...parentPath, member] });
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
 * Plans one-pass family shifts for every list head in `entries`. Claimed keys
 * include blocked families so generic indent never touches their children;
 * non-list entries outside any claimed family stay unclaimed for generic
 * indent. Decreasing a root list item to depth 0 clears `LIST_FIELDS`.
 */
export const planListIndentShift = ({
  editor,
  entries,
  indentMax,
  offset,
  root,
  tx,
}: IndentShiftContext): IndentShiftPlan | null => {
  const claimed = new Set<NodeKey>();
  const movable: FamilyMember[][] = [];

  for (const entry of entries) {
    const [node] = entry;
    const entryKey = tx.key(node);

    if (!entryKey || claimed.has(entryKey) || !isListItem(node)) continue;

    const [family] = getListFamilies(tx, [entry], root);

    if (!family || family.length === 0) continue;

    for (const member of family) claimed.add(member.key);

    if (
      family.some(({ path: memberPath }) =>
        hasNonWritableBlock(editor, memberPath, root)
      )
    ) {
      continue;
    }
    if (
      offset > 0 &&
      typeof indentMax === 'number' &&
      family.some(
        ({ node: memberNode }) => listDepth(memberNode) + 1 > indentMax
      )
    ) {
      continue;
    }

    movable.push(family);
  }

  if (claimed.size === 0) return null;

  const moved = movable.flat();

  return {
    claimed,
    apply: (applyTx) => {
      if (moved.length === 0) return false;

      const styles = planMovedListStyles(
        rootedNodeReader(applyTx, root),
        moved,
        offset
      );

      for (const member of moved) {
        shiftListFamilyMember(applyTx, member, offset);

        if (
          offset < 0 &&
          isListItem(member.node) &&
          listDepth(member.node) + offset <= 0
        ) {
          applyTx.nodes.unset([...LIST_FIELDS], { at: member.key });
          continue;
        }

        const level = styles.get(member.node);

        if (!level) continue;
        if (level.style === undefined) {
          applyTx.nodes.unset('listStyle', { at: member.key });
        } else {
          applyTx.nodes.set({ listStyle: level.style }, { at: member.key });
        }
      }

      return true;
    },
  };
};
