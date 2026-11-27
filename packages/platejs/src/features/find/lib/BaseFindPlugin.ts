import {
  definePlugin,
  ElementApi,
  NodeApi,
  PathApi,
  PointApi,
  RangeApi,
  SelectionApi,
  TextApi,
  type Anchor,
  type Decoration,
  type DecorationRefresh,
  type Descendant,
  type Editor,
  type EditorSchemaIdentity,
  type NamedRootKey,
  type NodeKey,
  type Path,
  type Point,
  type Range,
  type RootKey,
  txSelection,
} from '../../../core';
import {
  getActiveEditorTransaction,
  getTextSearchScope,
  MAIN_ROOT_KEY,
  withEditorUpdateRootScope,
  withTransactionSpecDraftRead,
} from '../../../facade';
import { snapshotPluginState } from '../../../internal/plugin/pluginStore';

export type FindMatch = Readonly<{ id: string; range: Range }>;

export type FindPluginState = Readonly<{
  query: string;
  matches: readonly FindMatch[];
  activeIndex: number;
  error: Error | null;
}>;

const initialState: FindPluginState = {
  query: '',
  matches: [],
  activeIndex: -1,
  error: null,
};

const MAX_WINDOW_BLOCKS = 16;
const MAX_PENDING_SHIFTS = 32;

const rootOfPoint = (point: Point): RootKey => point.root ?? MAIN_ROOT_KEY;
const rootOfRange = (range: Range): RootKey =>
  SelectionApi.root(range) ?? MAIN_ROOT_KEY;
const rootOfMatch = (match: FindMatch): RootKey => rootOfRange(match.range);

const stampRoot = (range: Range, root: RootKey): Range =>
  root === MAIN_ROOT_KEY
    ? range
    : {
        anchor: { ...range.anchor, root },
        focus: { ...range.focus, root },
      };

const shiftPathTop = (path: Path, delta: number): Path =>
  delta === 0 ? path : [path[0] + delta, ...path.slice(1)];

const shiftMatchTop = (match: FindMatch, delta: number): FindMatch => {
  if (delta === 0) return match;
  const { anchor, focus } = match.range;
  return snapshotPluginState(
    {
      id: match.id,
      range: {
        anchor: { ...anchor, path: shiftPathTop(anchor.path, delta) },
        focus: { ...focus, path: shiftPathTop(focus.path, delta) },
      },
    },
    true
  );
};

const firstNotBefore = (
  matches: readonly FindMatch[],
  isBefore: (match: FindMatch) => boolean
) => {
  let low = 0;
  let high = matches.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (isBefore(matches[middle])) low = middle + 1;
    else high = middle;
  }
  return low;
};

const sameOffsets = (a: Range, b: Range) =>
  a.anchor.offset === b.anchor.offset &&
  a.focus.offset === b.focus.offset &&
  PathApi.equals(a.anchor.path, a.focus.path) &&
  PathApi.equals(b.anchor.path, b.focus.path);

const sameMatch = (a: FindMatch | undefined, b: FindMatch | undefined) =>
  a === b ||
  (a !== undefined &&
    b !== undefined &&
    a.id === b.id &&
    RangeApi.equals(a.range, b.range));

const reuseMatchesIfEqual = (
  previous: readonly FindMatch[],
  next: readonly FindMatch[]
): readonly FindMatch[] =>
  next === previous ||
  (next.length === previous.length &&
    next.every((match, index) => sameMatch(match, previous[index])))
    ? previous
    : next;

const compareOwnerPaths = (a: Path, b: Path): number => {
  const cmp = PathApi.compare(a, b);
  return cmp !== 0 ? cmp : b.length - a.length;
};

const isRootTextRun = (
  schemaApi: Editor['read']['schema'],
  children: readonly Descendant[]
): boolean => {
  if (children.length === 0) return false;
  const first = children[0];
  return TextApi.isText(first) || schemaApi.isInline(first);
};

const hasOwnContentRoots = (
  schemaApi: Editor['read']['schema'],
  node: Descendant
): boolean => {
  if (!ElementApi.isElement(node)) return false;
  const contentRoots = schemaApi.element(node.type)?.contentRoots;
  return contentRoots !== undefined && Object.keys(contentRoots).length > 0;
};

const hasContentRootOwner = (
  schemaApi: Editor['read']['schema'],
  node: Descendant
): boolean => {
  if (!ElementApi.isElement(node)) return false;
  if (hasOwnContentRoots(schemaApi, node)) return true;
  for (const child of node.children) {
    if (hasContentRootOwner(schemaApi, child)) return true;
  }
  return false;
};

const sameOwnElementProps = (a: Descendant, b: Descendant): boolean => {
  if (a === b) return true;
  if (!ElementApi.isElement(a) || !ElementApi.isElement(b)) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (key === 'children') continue;
    if (!Object.hasOwn(b, key) || a[key] !== b[key]) return false;
  }
  return true;
};

const scopeTouchedOwners = (
  schemaApi: Editor['read']['schema'],
  prevChildren: readonly Descendant[],
  nextChildren: readonly Descendant[],
  scope: Path
): boolean => {
  let prevList = prevChildren;
  let nextList = nextChildren;
  for (let depth = 0; depth < scope.length; depth += 1) {
    const index = scope[depth];
    const prevNode = prevList[index];
    const nextNode = nextList[index];
    if (depth === scope.length - 1) {
      return (
        (prevNode !== undefined && hasContentRootOwner(schemaApi, prevNode)) ||
        (nextNode !== undefined && hasContentRootOwner(schemaApi, nextNode))
      );
    }
    if (
      prevNode !== nextNode &&
      prevNode !== undefined &&
      nextNode !== undefined &&
      (hasOwnContentRoots(schemaApi, prevNode) ||
        hasOwnContentRoots(schemaApi, nextNode)) &&
      !sameOwnElementProps(prevNode, nextNode)
    ) {
      return true;
    }
    if (!ElementApi.isElement(prevNode) || !ElementApi.isElement(nextNode)) {
      return true;
    }
    prevList = prevNode.children;
    nextList = nextNode.children;
  }
  return false;
};

const isValidRangeInChildren = (
  children: readonly Descendant[],
  range: Range
): boolean => {
  for (const point of [range.anchor, range.focus]) {
    if (point.path.length === 0 || point.offset < 0) return false;
    let current: readonly Descendant[] = children;
    for (let i = 0; i < point.path.length; i += 1) {
      const node = current[point.path[i]];
      if (!node) return false;
      if (i === point.path.length - 1) {
        if (!TextApi.isText(node) || point.offset > node.text.length) {
          return false;
        }
      } else {
        if (!ElementApi.isElement(node)) return false;
        current = node.children;
      }
    }
  }
  return true;
};

type RootSearchCache = Readonly<{
  children: readonly Descendant[];
  matches: readonly FindMatch[];
}>;

type RootOwnerEdge = Readonly<{
  ownerPath: Path;
  parentRoot: RootKey;
}>;

type TopLevelShift = {
  delta: number;
  from: number;
};

type OwnerGraph = Readonly<{
  edgeByRoot: Map<RootKey, RootOwnerEdge>;
  order: readonly NamedRootKey[];
  orderIndex: ReadonlyMap<RootKey, number>;
  parentsWithChildren: ReadonlySet<RootKey>;
  shiftsByParent: Map<RootKey, TopLevelShift[]>;
}>;

type FindSearch = Readonly<{
  activeRoots: Set<RootKey>;
  byRoot: Map<RootKey, RootSearchCache>;
  failed: boolean;
  fromDraft: boolean;
  matches: readonly FindMatch[];
  owners: OwnerGraph;
  query: string;
  schema: EditorSchemaIdentity;
}>;

type FoundRanges = Readonly<{
  keys: ReadonlyArray<NodeKey | null>;
  ranges: readonly Range[];
}>;

type HeldRootRefresh = Readonly<{
  children: readonly Descendant[];
  keys: Set<NodeKey> | 'all';
}>;

type ActiveAnchor = Readonly<{
  anchor: Anchor<Range>;
  fallbacks: ReadonlyArray<Anchor<Point>>;
  match: FindMatch;
  rootOrder: number | null;
}>;

const matchId = (key: NodeKey | null, order: number) => `${key ?? ''}:${order}`;
const keyOf = (match: FindMatch | undefined) => {
  if (!match) return null;
  const end = match.id.lastIndexOf(':');
  return end > 0 ? (match.id.slice(0, end) as NodeKey) : null;
};

const addRootKey = (
  byRoot: Map<RootKey, Set<NodeKey>>,
  root: RootKey,
  key: NodeKey | null
) => {
  if (!key) return;
  let keys = byRoot.get(root);
  if (!keys) {
    keys = new Set();
    byRoot.set(root, keys);
  }
  keys.add(key);
};

const addMatchKey = (
  byRoot: Map<RootKey, Set<NodeKey>>,
  match: FindMatch | undefined
) => {
  if (!match) return;
  addRootKey(byRoot, rootOfMatch(match), keyOf(match));
};

const resolveOwnerPath = (owners: OwnerGraph, edge: RootOwnerEdge): Path => {
  const shifts = owners.shiftsByParent.get(edge.parentRoot);
  if (!shifts || shifts.length === 0) return edge.ownerPath;
  let top = edge.ownerPath[0];
  for (const shift of shifts) {
    if (top >= shift.from) top += shift.delta;
  }
  return top === edge.ownerPath[0]
    ? edge.ownerPath
    : [top, ...edge.ownerPath.slice(1)];
};

const recordParentShift = (
  owners: OwnerGraph,
  parentRoot: RootKey,
  from: number,
  delta: number
) => {
  if (delta === 0 || !owners.parentsWithChildren.has(parentRoot)) return;
  let shifts = owners.shiftsByParent.get(parentRoot);
  if (!shifts) {
    shifts = [];
    owners.shiftsByParent.set(parentRoot, shifts);
  }
  const last = shifts.at(-1);
  if (last && last.from === from && last.delta > 0 && delta > 0) {
    last.delta += delta;
    return;
  }
  shifts.push({ delta, from });
  if (shifts.length >= MAX_PENDING_SHIFTS) {
    for (const [childRoot, edge] of owners.edgeByRoot) {
      if (edge.parentRoot !== parentRoot) continue;
      owners.edgeByRoot.set(childRoot, {
        ownerPath: resolveOwnerPath(owners, edge),
        parentRoot,
      });
    }
    shifts.length = 0;
  }
};

type ChainStep = Readonly<{
  ownerPath: Path | null;
  root: RootKey;
}>;

const buildRootChain = (root: RootKey, owners: OwnerGraph): ChainStep[] => {
  const reversed: ChainStep[] = [];
  let current: RootKey = root;
  const seen = new Set<RootKey>([current]);

  while (current !== MAIN_ROOT_KEY) {
    const edge = owners.edgeByRoot.get(current);
    if (!edge || seen.has(edge.parentRoot)) break;
    reversed.push({ ownerPath: resolveOwnerPath(owners, edge), root: current });
    seen.add(edge.parentRoot);
    current = edge.parentRoot;
  }
  reversed.push({ ownerPath: null, root: current });
  reversed.reverse();
  return reversed;
};

const compareReadingOrderPoint = (
  a: Point,
  b: Point,
  owners: OwnerGraph
): number => {
  const rootA = rootOfPoint(a);
  const rootB = rootOfPoint(b);
  if (rootA === rootB) return PointApi.compare(a, b);

  const chainA = buildRootChain(rootA, owners);
  const chainB = buildRootChain(rootB, owners);
  const topA = chainA[0].root;
  const topB = chainB[0].root;
  if (topA !== topB) {
    if (topA === MAIN_ROOT_KEY) return -1;
    if (topB === MAIN_ROOT_KEY) return 1;
    return (
      (owners.orderIndex.get(topA) ?? Number.MAX_SAFE_INTEGER) -
      (owners.orderIndex.get(topB) ?? Number.MAX_SAFE_INTEGER)
    );
  }

  let depth = 1;
  while (
    depth < chainA.length &&
    depth < chainB.length &&
    chainA[depth].root === chainB[depth].root
  ) {
    depth += 1;
  }

  if (depth === chainA.length) {
    const ownerPathB = chainB[depth].ownerPath;
    if (!ownerPathB) return -1;
    return PathApi.compare(a.path, ownerPathB) <= 0 ||
      PathApi.isAncestor(ownerPathB, a.path)
      ? -1
      : 1;
  }
  if (depth === chainB.length) {
    const ownerPathA = chainA[depth].ownerPath;
    if (!ownerPathA) return 1;
    return PathApi.compare(b.path, ownerPathA) <= 0 ||
      PathApi.isAncestor(ownerPathA, b.path)
      ? 1
      : -1;
  }

  const stepA = chainA[depth];
  const stepB = chainB[depth];
  if (stepA.ownerPath && stepB.ownerPath) {
    const cmp = compareOwnerPaths(stepA.ownerPath, stepB.ownerPath);
    if (cmp !== 0) return cmp;
  }
  return (
    (owners.orderIndex.get(stepA.root) ?? Number.MAX_SAFE_INTEGER) -
    (owners.orderIndex.get(stepB.root) ?? Number.MAX_SAFE_INTEGER)
  );
};

const toMatches = (
  root: RootKey,
  found: FoundRanges,
  previous: readonly FindMatch[],
  changedKeys: Map<RootKey, Set<NodeKey>>
) => {
  const unmatched = new Map(previous.map((match) => [match.id, match]));
  const orders = new Map<NodeKey | null, number>();
  let reused = found.ranges.length === previous.length;
  const matches = found.ranges.map((rawRange, index): FindMatch => {
    const range = stampRoot(rawRange, root);
    const key = found.keys[index];
    const order = orders.get(key) ?? 0;
    orders.set(key, order + 1);
    const id = matchId(key, order);
    const old = unmatched.get(id);
    unmatched.delete(id);
    if (old && RangeApi.equals(old.range, range)) {
      if (old !== previous[index]) reused = false;
      return old;
    }
    reused = false;
    if (key && (!old || !sameOffsets(old.range, range))) {
      addRootKey(changedKeys, root, key);
    }
    // Pre-snapshot each new match so per-root caches and store state share object identity.
    return snapshotPluginState({ id, range }, true);
  });
  for (const match of unmatched.values()) addMatchKey(changedKeys, match);
  return reused ? previous : matches;
};

/** Current literal text search across every document root without document or history changes. */
export const BaseFindPlugin = definePlugin('find', {
  initialState,
}).extend(({ editor, store }) => {
  const refreshers = new Map<
    RootKey,
    Set<(input: DecorationRefresh) => void>
  >();
  let search: FindSearch | null = null;
  let anchored: ActiveAnchor | null = null;
  const heldByRoot = new Map<RootKey, HeldRootRefresh>();
  let heldAllRoots = false;
  let showsForeignList = false;
  const sortedForeignByRoot = new WeakMap<
    readonly FindMatch[],
    Map<RootKey, readonly FindMatch[]>
  >();

  const readCommittedChildren = (root: RootKey): readonly Descendant[] =>
    root === MAIN_ROOT_KEY ? editor.read.children() : editor.read.root(root);

  const readDraftChildren = (root: RootKey): readonly Descendant[] =>
    withTransactionSpecDraftRead(editor, () => readCommittedChildren(root));

  const inRoot = <T>(root: RootKey, fn: () => T) =>
    withEditorUpdateRootScope(editor, root, fn);

  const foreignMatchesInRoot = (
    matches: readonly FindMatch[],
    root: RootKey
  ): readonly FindMatch[] => {
    let byRoot = sortedForeignByRoot.get(matches);
    if (!byRoot) {
      byRoot = new Map();
      const grouped = new Map<RootKey, FindMatch[]>();
      for (const match of matches) {
        const matchRoot = rootOfMatch(match);
        let list = grouped.get(matchRoot);
        if (!list) {
          list = [];
          grouped.set(matchRoot, list);
        }
        list.push(match);
      }
      for (const [matchRoot, list] of grouped) {
        list.sort((a, b) =>
          PathApi.compare(a.range.anchor.path, b.range.anchor.path)
        );
        byRoot.set(matchRoot, list);
      }
      sortedForeignByRoot.set(matches, byRoot);
    }
    return byRoot.get(root) ?? [];
  };

  const sendToRoot = (
    root: RootKey,
    nodeKeys: DecorationRefresh['nodeKeys']
  ) => {
    const set = refreshers.get(root);
    if (!set || set.size === 0) return;
    const input = { nodeKeys };
    for (const refresher of set) refresher(input);
  };

  const sendAllRoots = () => {
    const input: DecorationRefresh = { nodeKeys: 'all' };
    for (const set of refreshers.values()) {
      for (const refresher of set) refresher(input);
    }
  };

  const queueHeld = (
    root: RootKey,
    children: readonly Descendant[],
    nodeKeys: ReadonlySet<NodeKey> | 'all'
  ) => {
    if (heldAllRoots) return;
    const existing = heldByRoot.get(root);
    if (
      nodeKeys === 'all' ||
      (existing && existing.children === children && existing.keys === 'all')
    ) {
      heldByRoot.set(root, { children, keys: 'all' });
      return;
    }
    const target =
      existing && existing.children === children && existing.keys !== 'all'
        ? existing.keys
        : new Set<NodeKey>();
    for (const key of nodeKeys) target.add(key);
    heldByRoot.set(root, { children, keys: target });
  };

  const refreshRoots = (changedByRoot: ReadonlyMap<RootKey, Set<NodeKey>>) => {
    for (const [root, keys] of changedByRoot) {
      if (keys.size === 0) continue;
      const cached = search?.byRoot.get(root);
      if (cached && cached.children !== readCommittedChildren(root)) {
        queueHeld(root, cached.children, keys);
      } else {
        sendToRoot(root, [...keys]);
      }
    }
  };

  const refreshAll = () => {
    if (search?.fromDraft) {
      heldAllRoots = true;
      heldByRoot.clear();
    } else {
      sendAllRoots();
    }
  };

  const releaseAnchored = () => {
    if (!anchored) return;
    anchored.anchor.release();
    for (const fallback of anchored.fallbacks) fallback.release();
    anchored = null;
  };

  const anchorTo = (
    match: FindMatch | undefined,
    owners: OwnerGraph | undefined = search?.owners
  ) => {
    releaseAnchored();
    if (!match) return;
    const matchRoot = rootOfMatch(match);
    const primary = inRoot(matchRoot, () =>
      editor.anchor(match.range, {
        association: 'inward',
        deletion: 'nearest',
      })
    );
    const fallbacks: Array<Anchor<Point>> = [];
    if (owners && matchRoot !== MAIN_ROOT_KEY) {
      let current: RootKey = matchRoot;
      const seen = new Set<RootKey>([current]);
      while (current !== MAIN_ROOT_KEY) {
        const edge = owners.edgeByRoot.get(current);
        if (!edge || seen.has(edge.parentRoot)) break;
        const ownerPath = resolveOwnerPath(owners, edge);
        const ownerPoint = withTransactionSpecDraftRead(editor, () => {
          const parentChildren = readCommittedChildren(edge.parentRoot);
          if (ownerPath.length === 0) return null;
          let nodes = parentChildren;
          let node: Descendant | undefined;
          for (const index of ownerPath) {
            node = nodes[index];
            if (!node) return null;
            if (ElementApi.isElement(node)) nodes = node.children;
          }
          const textPath = [...ownerPath];
          while (node && ElementApi.isElement(node)) {
            if (node.children.length === 0) return null;
            textPath.push(0);
            node = node.children[0];
          }
          if (!node || !TextApi.isText(node)) return null;
          return edge.parentRoot === MAIN_ROOT_KEY
            ? { offset: 0, path: textPath }
            : { offset: 0, path: textPath, root: edge.parentRoot };
        });
        if (ownerPoint) {
          fallbacks.push(
            inRoot(edge.parentRoot, () =>
              editor.anchor(ownerPoint, {
                association: 'forward',
                deletion: 'nearest',
              })
            )
          );
        }
        seen.add(edge.parentRoot);
        current = edge.parentRoot;
      }
    }
    const rootOrder =
      owners && matchRoot !== MAIN_ROOT_KEY && !owners.edgeByRoot.has(matchRoot)
        ? (owners.orderIndex.get(matchRoot) ?? null)
        : null;
    anchored = { anchor: primary, fallbacks, match, rootOrder };
  };

  const resolveActiveStart = (): Point | null => {
    if (!anchored) return null;
    const primaryRange = anchored.anchor.resolve();
    if (primaryRange) return RangeApi.start(primaryRange);
    for (const fallback of anchored.fallbacks) {
      const point = fallback.resolve();
      if (point) return point;
    }
    return null;
  };

  const readOwnerGraph = (): OwnerGraph =>
    withTransactionSpecDraftRead(editor, () => {
      const entries = editor.read.roots();
      const edgeByRoot = new Map<RootKey, RootOwnerEdge>();
      const order: NamedRootKey[] = [];
      const orderIndex = new Map<RootKey, number>();

      entries.forEach((entry, index) => {
        order.push(entry.root);
        orderIndex.set(entry.root, index);
        const firstOwner = entry.owners[0];
        if (!firstOwner) return;
        edgeByRoot.set(entry.root, {
          ownerPath: firstOwner.path,
          parentRoot: firstOwner.root ?? MAIN_ROOT_KEY,
        });
      });

      // Break each detached cycle at its earliest root in order so merge and binary search share one acyclic forest.
      const state = new Map<RootKey, 'done' | 'visiting'>();
      for (const startRoot of order) {
        if (state.has(startRoot)) continue;
        const chain: RootKey[] = [];
        const chainIndex = new Map<RootKey, number>();
        let current: RootKey = startRoot;

        while (current !== MAIN_ROOT_KEY) {
          const mark = state.get(current);
          if (mark === 'done') break;
          if (mark === 'visiting') {
            const cycleStart = chainIndex.get(current) ?? 0;
            let canonical = chain[cycleStart];
            let bestOrder =
              orderIndex.get(canonical) ?? Number.MAX_SAFE_INTEGER;
            for (let i = cycleStart + 1; i < chain.length; i += 1) {
              const candidate = chain[i];
              const candidateOrder =
                orderIndex.get(candidate) ?? Number.MAX_SAFE_INTEGER;
              if (candidateOrder < bestOrder) {
                canonical = candidate;
                bestOrder = candidateOrder;
              }
            }
            edgeByRoot.delete(canonical);
            break;
          }
          state.set(current, 'visiting');
          chainIndex.set(current, chain.length);
          chain.push(current);
          const edge = edgeByRoot.get(current);
          if (!edge) break;
          current = edge.parentRoot;
        }
        for (const node of chain) state.set(node, 'done');
      }

      const parentsWithChildren = new Set<RootKey>();
      for (const edge of edgeByRoot.values()) {
        parentsWithChildren.add(edge.parentRoot);
      }

      return {
        edgeByRoot,
        order,
        orderIndex,
        parentsWithChildren,
        shiftsByParent: new Map(),
      };
    });

  const findIn = (
    root: RootKey,
    children: readonly Descendant[],
    query: string,
    at?: Path
  ): FoundRanges =>
    withTransactionSpecDraftRead(editor, () => {
      const ranges = NodeApi.findTextRanges(
        {
          children: () => children,
          nodes: editor.read.nodes,
          schema: editor.read.schema,
        },
        query,
        { at, caseSensitive: false }
      );
      if (ranges.length === 0) return { keys: [], ranges };

      return {
        keys: ranges.map((range) =>
          editor.key(
            root === MAIN_ROOT_KEY
              ? range.anchor.path
              : { offset: 0, path: range.anchor.path, root }
          )
        ),
        ranges,
      };
    });

  const mergeMatches = (
    byRoot: ReadonlyMap<RootKey, RootSearchCache>,
    activeRoots: ReadonlySet<RootKey>,
    owners: OwnerGraph
  ): readonly FindMatch[] => {
    if (activeRoots.size === 0) return [];
    if (activeRoots.size === 1 && activeRoots.has(MAIN_ROOT_KEY)) {
      return byRoot.get(MAIN_ROOT_KEY)?.matches ?? [];
    }

    const childrenByParent = new Map<
      RootKey,
      Array<{ childRoot: RootKey; ownerPath: Path }>
    >();
    const attached = new Set<RootKey>();
    const detachedTops = new Set<RootKey>();

    for (const root of activeRoots) {
      let current: RootKey = root;
      while (current !== MAIN_ROOT_KEY) {
        if (attached.has(current)) break;
        const edge = owners.edgeByRoot.get(current);
        if (!edge) {
          detachedTops.add(current);
          break;
        }
        attached.add(current);
        let list = childrenByParent.get(edge.parentRoot);
        if (!list) {
          list = [];
          childrenByParent.set(edge.parentRoot, list);
        }
        list.push({
          childRoot: current,
          ownerPath: resolveOwnerPath(owners, edge),
        });
        current = edge.parentRoot;
      }
    }

    for (const list of childrenByParent.values()) {
      list.sort((a, b) => {
        const cmp = compareOwnerPaths(a.ownerPath, b.ownerPath);
        if (cmp !== 0) return cmp;
        return (
          (owners.orderIndex.get(a.childRoot) ?? Number.MAX_SAFE_INTEGER) -
          (owners.orderIndex.get(b.childRoot) ?? Number.MAX_SAFE_INTEGER)
        );
      });
    }

    const visited = new Set<RootKey>();
    const out: FindMatch[] = [];

    const visit = (root: RootKey) => {
      if (visited.has(root)) return;
      visited.add(root);
      const rootMatches = byRoot.get(root)?.matches ?? [];
      const childEntries = childrenByParent.get(root) ?? [];
      let matchIndex = 0;
      let childIndex = 0;

      while (
        matchIndex < rootMatches.length &&
        childIndex < childEntries.length
      ) {
        const matchPath = rootMatches[matchIndex].range.anchor.path;
        const { childRoot, ownerPath } = childEntries[childIndex];
        const cmp = PathApi.compare(matchPath, ownerPath);
        if (cmp <= 0 || PathApi.isAncestor(ownerPath, matchPath)) {
          out.push(rootMatches[matchIndex]);
          matchIndex += 1;
        } else {
          visit(childRoot);
          childIndex += 1;
        }
      }
      while (matchIndex < rootMatches.length) {
        out.push(rootMatches[matchIndex]);
        matchIndex += 1;
      }
      while (childIndex < childEntries.length) {
        visit(childEntries[childIndex].childRoot);
        childIndex += 1;
      }
    };

    visit(MAIN_ROOT_KEY);
    if (detachedTops.size > 0) {
      const orderedDetached = [...detachedTops].sort(
        (a, b) =>
          (owners.orderIndex.get(a) ?? Number.MAX_SAFE_INTEGER) -
          (owners.orderIndex.get(b) ?? Number.MAX_SAFE_INTEGER)
      );
      for (const root of orderedDetached) visit(root);
    }

    return out;
  };

  const resolveActiveIndex = (
    matches: readonly FindMatch[],
    owners: OwnerGraph,
    start: Point
  ): number => {
    const startRoot = rootOfPoint(start);
    const index = firstNotBefore(matches, (match) =>
      rootOfMatch(match) === startRoot
        ? PointApi.compare(RangeApi.end(match.range), start) <= 0
        : compareReadingOrderPoint(
            RangeApi.start(match.range),
            start,
            owners
          ) <= 0
    );
    return index === matches.length ? 0 : index;
  };

  const resolveDeletedUnownedIndex = (
    matches: readonly FindMatch[],
    owners: OwnerGraph,
    previousOrder: number
  ): number => {
    const index = matches.findIndex((match) => {
      const top = buildRootChain(rootOfMatch(match), owners)[0].root;
      if (top === MAIN_ROOT_KEY) return false;
      const order = owners.orderIndex.get(top);
      return order !== undefined && order >= previousOrder;
    });
    return index === -1 ? 0 : index;
  };

  const settle = (
    next: FindSearch,
    {
      changedKeys,
      error,
      followActive,
    }: Readonly<{
      changedKeys: Map<RootKey, Set<NodeKey>>;
      error: Error | null;
      followActive: boolean;
    }>
  ) => {
    const previous = store.get();
    const previousOwners = search?.owners;
    const { matches } = next;
    const unchanged = matches === previous.matches;
    const stored = previous.matches[previous.activeIndex];
    const activeAnchor =
      matches.length > 0 &&
      followActive &&
      anchored !== null &&
      sameMatch(stored, anchored.match)
        ? anchored
        : null;
    const primaryRange = activeAnchor ? activeAnchor.anchor.resolve() : null;
    const activeStart =
      primaryRange !== null
        ? RangeApi.start(primaryRange)
        : activeAnchor
          ? resolveActiveStart()
          : null;

    let activeIndex = -1;
    if (
      unchanged &&
      primaryRange !== null &&
      stored !== undefined &&
      RangeApi.equals(primaryRange, stored.range)
    ) {
      ({ activeIndex } = previous);
    } else if (activeStart) {
      activeIndex = resolveActiveIndex(matches, next.owners, activeStart);
    } else if (activeAnchor && activeAnchor.rootOrder !== null) {
      activeIndex = resolveDeletedUnownedIndex(
        matches,
        next.owners,
        activeAnchor.rootOrder
      );
    } else if (matches.length > 0) {
      activeIndex = followActive
        ? Math.max(0, previous.activeIndex) % matches.length
        : 0;
    }
    const active = matches[activeIndex];
    const published = unchanged ? matches : snapshotPluginState(matches, true);

    search = { ...next, matches: published };
    const ownerGraphChanged =
      active !== undefined &&
      rootOfMatch(active) !== MAIN_ROOT_KEY &&
      next.owners !== previousOwners;
    if (
      !sameMatch(active, anchored?.match) ||
      ownerGraphChanged ||
      (primaryRange && !RangeApi.equals(primaryRange, active.range))
    ) {
      anchorTo(active, next.owners);
    }
    if (
      followActive &&
      unchanged &&
      error === previous.error &&
      activeIndex === previous.activeIndex
    ) {
      return;
    }
    if (
      active?.id !== stored?.id ||
      (active && stored && rootOfMatch(active) !== rootOfMatch(stored))
    ) {
      addMatchKey(changedKeys, stored);
      addMatchKey(changedKeys, active);
    }
    store.set(
      followActive
        ? { matches: published, error, activeIndex }
        : { query: next.query, matches: published, error, activeIndex }
    );
    refreshRoots(changedKeys);
  };

  const hasDraftRootDelta = (owners: OwnerGraph): boolean => {
    if (!getActiveEditorTransaction(editor)) return false;
    const committedRoots = editor.read.roots();
    if (committedRoots.length !== owners.order.length) return true;
    for (let i = 0; i < committedRoots.length; i += 1) {
      if (committedRoots[i].root !== owners.order[i]) return true;
    }
    return false;
  };

  const publish = (query: string, followActive: boolean) => {
    const previous = store.get();
    const previousByRoot = new Map<RootKey, FindMatch[]>();
    for (const match of previous.matches) {
      const root = rootOfMatch(match);
      let list = previousByRoot.get(root);
      if (!list) {
        list = [];
        previousByRoot.set(root, list);
      }
      list.push(match);
    }

    const owners = readOwnerGraph();
    const allRoots: RootKey[] = [MAIN_ROOT_KEY, ...owners.order];
    const byRoot = new Map<RootKey, RootSearchCache>();
    const activeRoots = new Set<RootKey>();
    const changedKeys = new Map<RootKey, Set<NodeKey>>();
    let fromDraft = hasDraftRootDelta(owners);
    let searchError: Error | null = null;

    for (const root of allRoots) {
      const children = readDraftChildren(root);
      if (!fromDraft && children !== readCommittedChildren(root)) {
        fromDraft = true;
      }
      let found: FoundRanges = { keys: [], ranges: [] };
      if (query && !searchError) {
        try {
          found = findIn(root, children, query);
        } catch (error) {
          searchError =
            error instanceof Error ? error : new Error(String(error));
        }
      }
      const prevMatches = previousByRoot.get(root) ?? [];
      const rootMatches = searchError
        ? []
        : toMatches(root, found, prevMatches, changedKeys);
      if (rootMatches.length > 0) activeRoots.add(root);
      byRoot.set(root, { children, matches: rootMatches });
    }

    if (searchError) {
      activeRoots.clear();
      for (const [root, cache] of byRoot) {
        if (cache.matches.length > 0) {
          byRoot.set(root, { children: cache.children, matches: [] });
        }
      }
      for (const prevMatches of previousByRoot.values()) {
        for (const match of prevMatches) addMatchKey(changedKeys, match);
      }
    } else {
      for (const [root, prevMatches] of previousByRoot) {
        if (byRoot.has(root)) continue;
        for (const match of prevMatches) addMatchKey(changedKeys, match);
      }
    }

    const merged = searchError ? [] : mergeMatches(byRoot, activeRoots, owners);
    const matches = searchError
      ? merged
      : reuseMatchesIfEqual(previous.matches, merged);

    if (search?.fromDraft && !fromDraft && heldByRoot.size > 0) {
      for (const [root, entry] of heldByRoot) {
        if (entry.children === readCommittedChildren(root)) continue;
        if (entry.keys === 'all') continue;
        const keys = changedKeys.get(root);
        if (!keys) continue;
        for (const heldKey of entry.keys) keys.delete(heldKey);
      }
    }

    settle(
      {
        activeRoots,
        byRoot,
        failed: searchError !== null,
        fromDraft,
        matches,
        owners,
        query,
        schema: editor.read.schema.identity(),
      },
      { changedKeys, error: searchError, followActive }
    );
  };

  const computeChangedSlice = (
    prevChildren: readonly Descendant[],
    nextChildren: readonly Descendant[],
    hintRange: readonly [number, number] | null
  ): Readonly<{ nextEnd: number; prefix: number; prevEnd: number }> => {
    if (hintRange) {
      const [rawStart, rawEnd] = hintRange;
      const delta = nextChildren.length - prevChildren.length;
      let prefix = rawStart;
      let nextEnd = rawEnd + 1;
      let prevEnd = nextEnd - delta;
      if (
        prefix >= 0 &&
        prevEnd >= prefix &&
        prevEnd <= prevChildren.length &&
        nextEnd <= nextChildren.length
      ) {
        while (
          prefix > 0 &&
          prevChildren[prefix - 1] !== nextChildren[prefix - 1]
        ) {
          prefix -= 1;
        }
        while (
          prevEnd < prevChildren.length &&
          nextEnd < nextChildren.length &&
          prevChildren[prevEnd] !== nextChildren[nextEnd]
        ) {
          prevEnd += 1;
          nextEnd += 1;
        }
        while (
          prefix < prevEnd &&
          prefix < nextEnd &&
          prevChildren[prefix] === nextChildren[prefix]
        ) {
          prefix += 1;
        }
        while (
          prevEnd > prefix &&
          nextEnd > prefix &&
          prevChildren[prevEnd - 1] === nextChildren[nextEnd - 1]
        ) {
          prevEnd -= 1;
          nextEnd -= 1;
        }
        return { nextEnd, prefix, prevEnd };
      }
    }

    const minLength = Math.min(prevChildren.length, nextChildren.length);
    let prefix = 0;
    while (
      prefix < minLength &&
      prevChildren[prefix] === nextChildren[prefix]
    ) {
      prefix += 1;
    }
    let prevEnd = prevChildren.length;
    let nextEnd = nextChildren.length;
    while (
      prevEnd > prefix &&
      nextEnd > prefix &&
      prevChildren[prevEnd - 1] === nextChildren[nextEnd - 1]
    ) {
      prevEnd -= 1;
      nextEnd -= 1;
    }
    return { nextEnd, prefix, prevEnd };
  };

  const sliceTouchedOwners = (
    prevChildren: readonly Descendant[],
    nextChildren: readonly Descendant[],
    prefix: number,
    prevEnd: number,
    nextEnd: number
  ): boolean => {
    for (let i = prefix; i < prevEnd; i += 1) {
      if (hasContentRootOwner(editor.read.schema, prevChildren[i])) return true;
    }
    for (let i = prefix; i < nextEnd; i += 1) {
      if (hasContentRootOwner(editor.read.schema, nextChildren[i])) return true;
    }
    return false;
  };

  const updateRootCache = (
    root: RootKey,
    prevCache: RootSearchCache | undefined,
    nextChildren: readonly Descendant[],
    query: string,
    changedKeys: Map<RootKey, Set<NodeKey>>,
    hintRange: readonly [number, number] | null
  ): Readonly<{
    cache: RootSearchCache;
    matchesChanged: boolean;
    shift: Readonly<{ delta: number; from: number }> | null;
    touchedOwners: boolean;
  }> | null => {
    let fallbackTouchedOwners = true;

    if (prevCache) {
      const prevChildren = prevCache.children;
      const textRunRoot =
        isRootTextRun(editor.read.schema, prevChildren) ||
        isRootTextRun(editor.read.schema, nextChildren);
      const { nextEnd, prefix, prevEnd } = computeChangedSlice(
        prevChildren,
        nextChildren,
        hintRange
      );

      if (!textRunRoot && prevEnd === prefix + 1 && nextEnd === prefix + 1) {
        const subScope = getTextSearchScope(
          editor.read.schema,
          [prevChildren[prefix]],
          [nextChildren[prefix]]
        );
        const scope = subScope ? [prefix, ...subScope.slice(1)] : null;
        if (scope) {
          let found: FoundRanges;
          try {
            found = findIn(root, nextChildren, query, scope);
          } catch {
            return null;
          }
          const start = firstNotBefore(prevCache.matches, (match) =>
            PathApi.isBefore(match.range.anchor.path, scope)
          );
          const end = firstNotBefore(
            prevCache.matches,
            (match) => !PathApi.isAfter(match.range.anchor.path, scope)
          );
          const before = prevCache.matches.slice(start, end);
          const keyless =
            found.keys.includes(null) || before.some((match) => !keyOf(match));
          if (!keyless) {
            const scoped = toMatches(root, found, before, changedKeys);
            const matchesChanged = scoped !== before;
            const matches = matchesChanged
              ? [
                  ...prevCache.matches.slice(0, start),
                  ...scoped,
                  ...prevCache.matches.slice(end),
                ]
              : prevCache.matches;
            return {
              cache: { children: nextChildren, matches },
              matchesChanged,
              shift: null,
              touchedOwners: scopeTouchedOwners(
                editor.read.schema,
                prevChildren,
                nextChildren,
                scope
              ),
            };
          }
        }
      }

      const windowSize = nextEnd - prefix;
      if (
        !textRunRoot &&
        windowSize <= MAX_WINDOW_BLOCKS &&
        (nextChildren.length === 0 || windowSize * 2 <= nextChildren.length)
      ) {
        const windowRanges: Range[] = [];
        const windowKeys: Array<NodeKey | null> = [];
        let windowFailed = false;
        for (let blockIndex = prefix; blockIndex < nextEnd; blockIndex += 1) {
          try {
            const found = findIn(root, nextChildren, query, [blockIndex]);
            windowRanges.push(...found.ranges);
            windowKeys.push(...found.keys);
          } catch {
            windowFailed = true;
            break;
          }
        }

        if (!windowFailed) {
          const matchStart = firstNotBefore(
            prevCache.matches,
            (match) => match.range.anchor.path[0] < prefix
          );
          const matchEnd = firstNotBefore(
            prevCache.matches,
            (match) => match.range.anchor.path[0] < prevEnd
          );
          const before = prevCache.matches.slice(matchStart, matchEnd);
          const keyless =
            windowKeys.includes(null) || before.some((match) => !keyOf(match));

          if (!keyless) {
            const delta = nextChildren.length - prevChildren.length;
            const scoped = toMatches(
              root,
              { keys: windowKeys, ranges: windowRanges },
              before,
              changedKeys
            );
            const tail =
              delta === 0
                ? prevCache.matches.slice(matchEnd)
                : prevCache.matches
                    .slice(matchEnd)
                    .map((match) => shiftMatchTop(match, delta));
            const matchesChanged =
              scoped !== before ||
              (delta !== 0 && matchEnd < prevCache.matches.length);
            const matches = matchesChanged
              ? [...prevCache.matches.slice(0, matchStart), ...scoped, ...tail]
              : prevCache.matches;
            const touchedOwners = sliceTouchedOwners(
              prevChildren,
              nextChildren,
              prefix,
              prevEnd,
              nextEnd
            );

            return {
              cache: { children: nextChildren, matches },
              matchesChanged,
              shift:
                !touchedOwners && delta !== 0 ? { delta, from: prevEnd } : null,
              touchedOwners,
            };
          }
        }
      }

      fallbackTouchedOwners = sliceTouchedOwners(
        prevChildren,
        nextChildren,
        prefix,
        prevEnd,
        nextEnd
      );
    }

    let found: FoundRanges;
    try {
      found = findIn(root, nextChildren, query);
    } catch {
      return null;
    }
    const prevMatches = prevCache?.matches ?? [];
    const matches = toMatches(root, found, prevMatches, changedKeys);
    return {
      cache: { children: nextChildren, matches },
      matchesChanged: matches !== prevMatches,
      shift: null,
      touchedOwners: fallbackTouchedOwners,
    };
  };

  const onStoreWrite = (state: FindPluginState, previous: FindPluginState) => {
    const showedForeignList = showsForeignList;
    showsForeignList = search !== null && state.matches !== search.matches;
    const foreign = showedForeignList || showsForeignList;
    const foreignActiveOnly =
      showsForeignList &&
      showedForeignList &&
      state.matches === previous.matches &&
      state.activeIndex !== previous.activeIndex;
    if (
      foreign &&
      !foreignActiveOnly &&
      (state.matches !== previous.matches ||
        state.activeIndex !== previous.activeIndex)
    ) {
      refreshAll();
    }
    const match = state.matches[state.activeIndex];
    if (sameMatch(match, anchored?.match)) return;
    if (match && !showsForeignList) {
      const matchRoot = rootOfMatch(match);
      const cached = search?.byRoot.get(matchRoot);
      anchorTo(
        cached &&
          readDraftChildren(matchRoot) === cached.children &&
          isValidRangeInChildren(cached.children, match.range)
          ? match
          : undefined
      );
    } else {
      anchorTo(undefined);
    }
    if (foreign && !foreignActiveOnly) return;
    const changedKeys = new Map<RootKey, Set<NodeKey>>();
    addMatchKey(changedKeys, previous.matches[previous.activeIndex]);
    addMatchKey(changedKeys, match);
    refreshRoots(changedKeys);
  };

  return {
    activate: ({ onCleanup }) => {
      const stop = store.subscribe(onStoreWrite);
      onCleanup(() => {
        stop();
        releaseAnchored();
        refreshers.clear();
        heldByRoot.clear();
        heldAllRoots = false;
      });
    },
    api: () => ({
      /** Apply a case-insensitive literal query across every root; an empty query clears results. */
      search: (query: string) => {
        if (
          query !== (search?.query ?? '') ||
          query !== store.get('query') ||
          search?.failed ||
          search?.fromDraft ||
          getActiveEditorTransaction(editor) !== null
        ) {
          publish(query, false);
        }
      },
      /** Move through current matches, wrapping at either end. */
      move: (delta: -1 | 1) => {
        const { matches, activeIndex } = store.get();
        if (matches.length === 0) return;
        store.set({
          activeIndex: (activeIndex + delta + matches.length) % matches.length,
        });
      },
    }),
    selectors: {
      activeMatch: (state) => state.matches[state.activeIndex] ?? null,
      count: (state) => state.matches.length,
    },
    update: ({ tx }) => ({
      /**
       * Select the current result in its document root from any view; returns
       * false without an active match. Focus remains owned by the caller's view.
       */
      select: txSelection(() => {
        let state = store.get();
        const owned = search !== null && state.matches === search.matches;
        if (owned && search?.query) {
          const currentMatch = state.matches[state.activeIndex];
          const currentRoot = currentMatch ? rootOfMatch(currentMatch) : null;
          const cached = currentRoot ? search.byRoot.get(currentRoot) : null;
          if (
            search.fromDraft ||
            (currentRoot !== null &&
              (!cached || readDraftChildren(currentRoot) !== cached.children))
          ) {
            publish(search.query, true);
            state = store.get();
          }
        }
        const match = state.matches[state.activeIndex];
        if (!match) return false;
        const matchRoot = rootOfMatch(match);
        const targetChildren = readDraftChildren(matchRoot);
        if (!isValidRangeInChildren(targetChildren, match.range)) return false;
        const activeTx = getActiveEditorTransaction(editor) ?? tx;
        inRoot(matchRoot, () => {
          activeTx.selection.set(match.range);
        });
        return true;
      }),
    }),
    decorate: {
      observe: ({ editor: view, refresh: refresher }) => {
        const viewRoot = view.read.view.root() ?? MAIN_ROOT_KEY;
        let set = refreshers.get(viewRoot);
        if (!set) {
          set = new Set();
          refreshers.set(viewRoot, set);
        }
        set.add(refresher);
        return () => {
          const current = refreshers.get(viewRoot);
          if (!current) return;
          current.delete(refresher);
          if (current.size === 0) refreshers.delete(viewRoot);
        };
      },
      read: ({ editor: view, entry: [node, path] }) => {
        if (!TextApi.isText(node) || !search || search.failed) return [];
        const viewRoot = view.read.view.root() ?? MAIN_ROOT_KEY;
        const rootCache = search.byRoot.get(viewRoot);
        if (!rootCache || view.read.children() !== rootCache.children) {
          return [];
        }
        const { matches: stored, activeIndex } = store.get();
        const active = stored[activeIndex];
        const matches =
          stored === search.matches
            ? rootCache.matches
            : foreignMatchesInRoot(stored, viewRoot);
        const decorations: Decoration[] = [];
        for (
          let index = firstNotBefore(matches, (match) =>
            PathApi.isBefore(match.range.anchor.path, path)
          );
          index < matches.length &&
          PathApi.equals(matches[index].range.anchor.path, path);
          index += 1
        ) {
          const match = matches[index];
          decorations.push({
            attributes: {
              'data-find-active': sameMatch(match, active) ? '' : undefined,
              'data-find-id': match.id,
              'data-find-match': '',
            },
            key: match.id,
            range: match.range,
          });
        }
        return decorations;
      },
    },
    on: {
      commit: ({ commit }) => {
        if (search && !search.query) {
          for (const root of commit.changes.deleteRoots) {
            search.byRoot.delete(root);
            search.activeRoots.delete(root);
          }
        }

        if (search?.query) {
          const owned = store.get().matches === search.matches;
          const schemaCurrent = search.schema === editor.read.schema.identity();

          if (!owned || !schemaCurrent || search.failed || search.fromDraft) {
            publish(search.query, true);
          } else {
            const changedRangeCount = new Map<RootKey, number>();
            commit.changes.iterChangedRanges((root) => {
              const key = root ?? MAIN_ROOT_KEY;
              changedRangeCount.set(key, (changedRangeCount.get(key) ?? 0) + 1);
            });
            const changedRoots = new Set<RootKey>(changedRangeCount.keys());
            for (const root of commit.changes.createRoots) {
              changedRoots.add(root);
            }
            for (const root of commit.changes.deleteRoots) {
              changedRoots.add(root);
            }

            if (changedRoots.size > 0) {
              const pendingUpdates: Array<
                readonly [RootKey, RootSearchCache | null]
              > = [];
              const pendingShifts: Array<
                readonly [RootKey, Readonly<{ delta: number; from: number }>]
              > = [];
              const changedKeys = new Map<RootKey, Set<NodeKey>>();
              let anyMatchesChanged = false;
              let needsOwnerRefresh =
                commit.changes.createRoots.size > 0 ||
                commit.changes.deleteRoots.size > 0;
              let failed = false;

              for (const root of changedRoots) {
                if (
                  root !== MAIN_ROOT_KEY &&
                  commit.changes.deleteRoots.has(root)
                ) {
                  const prev = search.byRoot.get(root);
                  if (prev) {
                    if (prev.matches.length > 0) {
                      anyMatchesChanged = true;
                      for (const match of prev.matches) {
                        addMatchKey(changedKeys, match);
                      }
                    }
                    pendingUpdates.push([root, null]);
                  }
                  continue;
                }

                const prevCache = search.byRoot.get(root);
                const nextChildren = readDraftChildren(root);
                if (prevCache && nextChildren === prevCache.children) continue;

                let hintRange: readonly [number, number] | null = null;
                if (
                  prevCache &&
                  (root !== MAIN_ROOT_KEY ||
                    commit.before.children === prevCache.children) &&
                  changedRangeCount.get(root) === 1
                ) {
                  const topRanges = commit.changed.topLevelRanges(
                    root === MAIN_ROOT_KEY ? undefined : root
                  );
                  if (topRanges.length === 1) {
                    [hintRange] = topRanges;
                  }
                }

                const updated = updateRootCache(
                  root,
                  prevCache,
                  nextChildren,
                  search.query,
                  changedKeys,
                  hintRange
                );
                if (!updated) {
                  failed = true;
                  break;
                }
                pendingUpdates.push([root, updated.cache]);
                if (updated.shift) pendingShifts.push([root, updated.shift]);
                if (updated.matchesChanged) anyMatchesChanged = true;
                if (updated.touchedOwners) needsOwnerRefresh = true;
              }

              if (failed) {
                publish(search.query, true);
              } else {
                const nextOwners = needsOwnerRefresh
                  ? readOwnerGraph()
                  : search.owners;
                const { activeRoots, byRoot } = search;
                for (const [root, cache] of pendingUpdates) {
                  if (cache === null) {
                    byRoot.delete(root);
                    activeRoots.delete(root);
                  } else {
                    byRoot.set(root, cache);
                    if (cache.matches.length > 0) activeRoots.add(root);
                    else activeRoots.delete(root);
                  }
                }
                if (!needsOwnerRefresh) {
                  for (const [parentRoot, shift] of pendingShifts) {
                    recordParentShift(
                      nextOwners,
                      parentRoot,
                      shift.from,
                      shift.delta
                    );
                  }
                }
                const previousMatches = search.matches;
                const merged =
                  !anyMatchesChanged && !needsOwnerRefresh
                    ? previousMatches
                    : mergeMatches(byRoot, activeRoots, nextOwners);
                const matches = reuseMatchesIfEqual(previousMatches, merged);
                settle(
                  {
                    ...search,
                    activeRoots,
                    byRoot,
                    fromDraft: false,
                    matches,
                    owners: nextOwners,
                  },
                  { changedKeys, error: null, followActive: true }
                );
              }
            }
          }
        }

        if (heldAllRoots) {
          heldAllRoots = false;
          heldByRoot.clear();
          sendAllRoots();
        } else if (heldByRoot.size > 0) {
          const entries = [...heldByRoot];
          heldByRoot.clear();
          for (const [root, entry] of entries) {
            if (entry.children === readCommittedChildren(root)) {
              sendToRoot(root, entry.keys === 'all' ? 'all' : [...entry.keys]);
            } else if (!search?.query) {
              sendToRoot(root, 'all');
            }
          }
        }
      },
    },
  };
});
