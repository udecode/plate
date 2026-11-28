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
  type EditorCanonicalUpdateTag,
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
  hasNonWritableAt,
  MAIN_ROOT_KEY,
  txStored,
  withEditorUpdateRootScope,
  withTransactionSpecDraftRead,
} from '../../../facade';
import { snapshotPluginState } from '../../../internal/plugin/pluginStore';

/** Query matching options for literal, whole-word, or regular-expression search. */
export type FindOptions = Readonly<{
  /** Match exact letter casing. Defaults to false. */
  caseSensitive?: boolean;
  /** Treat the query string as a JavaScript regular expression. Defaults to false. */
  regexp?: boolean;
  /** Require Unicode word boundaries around each match. Defaults to false. */
  wholeWord?: boolean;
}>;

/** A single search match with an opaque non-renumbering ID and its document range. */
export type FindMatch = Readonly<{
  /** Opaque stable identifier preserved across unrelated edits and block shifts. */
  id: string;
  /** Document range of the match (rootless for the main root, rooted for named roots). */
  range: Range;
}>;

/** Match and its global reading-order index returned by point lookup. */
export type FindMatchLocation = Readonly<{
  /** Zero-based global reading-order index across all roots. */
  index: number;
  /** Matched entry at that index. */
  match: FindMatch;
}>;

/** Reactive scalar search status; per-root match lists stay private inside BaseFindPlugin. */
export type FindPluginState = Readonly<{
  /** Zero-based index of the active match across all roots, or -1 when none is active. */
  activeIndex: number;
  /** Whether the active search matches exact letter casing. */
  caseSensitive: boolean;
  /** Last search error (such as an invalid regular expression), or null. */
  error: Error | null;
  /** Current search query string. */
  query: string;
  /** Whether the active search compiles the query as a regular expression. */
  regexp: boolean;
  /** Increments whenever the match list or any match range changes. */
  version: number;
  /** Whether the active search requires Unicode word boundaries. */
  wholeWord: boolean;
}>;

type NormalizedFindOptions = Readonly<{
  caseSensitive: boolean;
  regexp: boolean;
  wholeWord: boolean;
}>;

const DEFAULT_OPTIONS: NormalizedFindOptions = Object.freeze({
  caseSensitive: false,
  regexp: false,
  wholeWord: false,
});

const initialState: FindPluginState = {
  activeIndex: -1,
  caseSensitive: false,
  error: null,
  query: '',
  regexp: false,
  version: 0,
  wholeWord: false,
};

const EMPTY_MATCHES: readonly FindMatch[] = Object.freeze([]);
const HISTORY_TAGS = [
  'history-merge',
  'history-push',
  'history-skip',
] as const satisfies readonly EditorCanonicalUpdateTag[];
const MAX_WINDOW_BLOCKS = 16;
const MAX_PENDING_SHIFTS = 32;
const ESCAPE_REGEXP = /[.*+?^${}()|[\]\\]/g;
const WORD_CHAR_RE = /[\p{L}\p{N}\p{M}_]/u;
const WHOLE_WORD_CLASS = '[\\p{L}\\p{N}\\p{M}_]';

const normalizeOptions = (options?: FindOptions): NormalizedFindOptions =>
  !options
    ? DEFAULT_OPTIONS
    : {
        caseSensitive: Boolean(options.caseSensitive),
        regexp: Boolean(options.regexp),
        wholeWord: Boolean(options.wholeWord),
      };

const sameOptions = (a: NormalizedFindOptions, b: NormalizedFindOptions) =>
  a.caseSensitive === b.caseSensitive &&
  a.regexp === b.regexp &&
  a.wholeWord === b.wholeWord;

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

const firstNotBefore = <T>(
  items: readonly T[],
  isBefore: (item: T) => boolean
) => {
  let low = 0;
  let high = items.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (isBefore(items[middle])) low = middle + 1;
    else high = middle;
  }
  return low;
};

const sameMatch = (a: FindMatch | undefined, b: FindMatch | undefined) =>
  a === b ||
  (a !== undefined &&
    b !== undefined &&
    a.id === b.id &&
    RangeApi.equals(a.range, b.range));

const sameRelativePath = (a: Path, b: Path) => {
  if (a.length !== b.length) return false;
  for (let i = 1; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const sameSingleLeafOffsets = (a: Range, b: Range) =>
  a.anchor.offset === b.anchor.offset &&
  a.focus.offset === b.focus.offset &&
  PathApi.equals(a.anchor.path, a.focus.path) &&
  PathApi.equals(b.anchor.path, b.focus.path);

const isPureTopShiftOfUnchangedBlock = (
  prevChildren: readonly Descendant[] | undefined,
  nextChildren: readonly Descendant[],
  oldRange: Range,
  nextRange: Range
) => {
  if (!prevChildren) return false;
  const oldTop = oldRange.anchor.path[0];
  const nextTop = nextRange.anchor.path[0];
  if (
    oldTop === undefined ||
    nextTop === undefined ||
    oldTop !== oldRange.focus.path[0] ||
    nextTop !== nextRange.focus.path[0]
  ) {
    return false;
  }
  return (
    prevChildren[oldTop] === nextChildren[nextTop] &&
    oldRange.anchor.offset === nextRange.anchor.offset &&
    oldRange.focus.offset === nextRange.focus.offset &&
    sameRelativePath(oldRange.anchor.path, nextRange.anchor.path) &&
    sameRelativePath(oldRange.focus.path, nextRange.focus.path)
  );
};

const getTextAtPath = (
  children: readonly Descendant[] | undefined,
  path: Path
): string | null => {
  if (!children || path.length === 0) return null;
  let current: readonly Descendant[] = children;
  for (let i = 0; i < path.length; i += 1) {
    const node = current[path[i]];
    if (!node) return null;
    if (i === path.length - 1) {
      return TextApi.isText(node) ? node.text : null;
    }
    if (!ElementApi.isElement(node)) return null;
    current = node.children;
  }
  return null;
};

const getMinimalTextEditWindow = (
  prevText: string,
  nextText: string
): Readonly<{ delta: number; editStart: number; prevEditEnd: number }> => {
  const minLength = Math.min(prevText.length, nextText.length);
  let editStart = 0;
  while (
    editStart < minLength &&
    prevText.charCodeAt(editStart) === nextText.charCodeAt(editStart)
  ) {
    editStart += 1;
  }
  let prevEditEnd = prevText.length;
  let nextEditEnd = nextText.length;
  while (
    prevEditEnd > editStart &&
    nextEditEnd > editStart &&
    prevText.charCodeAt(prevEditEnd - 1) ===
      nextText.charCodeAt(nextEditEnd - 1)
  ) {
    prevEditEnd -= 1;
    nextEditEnd -= 1;
  }
  return {
    delta: nextText.length - prevText.length,
    editStart,
    prevEditEnd,
  };
};

const codePointAtStart = (text: string, index: number): string => {
  const cp = text.codePointAt(index);
  return cp === undefined ? '' : String.fromCodePoint(cp);
};

const codePointBefore = (text: string, index: number): string => {
  if (index <= 0) return '';
  const lo = text.charCodeAt(index - 1);
  if (lo >= 0xdc_00 && lo <= 0xdf_ff && index >= 2) {
    const hi = text.charCodeAt(index - 2);
    if (hi >= 0xd8_00 && hi <= 0xdb_ff) {
      return text.slice(index - 2, index);
    }
  }
  return text.charAt(index - 1);
};

const isWholeWordMatch = (
  text: string,
  start: number,
  end: number
): boolean => {
  if (start >= end) return false;
  const first = codePointAtStart(text, start);
  const last = codePointBefore(text, end);
  if (
    WORD_CHAR_RE.test(first) &&
    start > 0 &&
    WORD_CHAR_RE.test(codePointBefore(text, start))
  ) {
    return false;
  }
  if (
    WORD_CHAR_RE.test(last) &&
    end < text.length &&
    WORD_CHAR_RE.test(codePointAtStart(text, end))
  ) {
    return false;
  }
  return true;
};

type CompiledFindQuery =
  | string
  | RegExp
  | ((text: string) => ReadonlyArray<Readonly<{ end: number; start: number }>>);

const compileFindQuery = (
  query: string,
  options: NormalizedFindOptions
): CompiledFindQuery | null => {
  if (!query) return null;

  const baseFlags = options.caseSensitive ? 'g' : 'gi';

  if (!options.regexp) {
    if (!options.wholeWord) return query;
    const escaped = new RegExp(query.replace(ESCAPE_REGEXP, '\\$&'), baseFlags);
    return (text: string) => {
      escaped.lastIndex = 0;
      const hits: Array<Readonly<{ end: number; start: number }>> = [];
      for (const match of text.matchAll(escaped)) {
        const start = match.index;
        const end = start + match[0].length;
        if (end > start && isWholeWordMatch(text, start, end)) {
          hits.push({ end, start });
        }
      }
      return hits;
    };
  }

  const raw = new RegExp(query, baseFlags);
  if (!options.wholeWord) return raw;

  try {
    return new RegExp(
      `(?<!${WHOLE_WORD_CLASS})(?:${query})(?!${WHOLE_WORD_CLASS})`,
      `${baseFlags}u`
    );
  } catch {
    return (text: string) => {
      raw.lastIndex = 0;
      const hits: Array<Readonly<{ end: number; start: number }>> = [];
      for (const match of text.matchAll(raw)) {
        const start = match.index;
        const end = start + match[0].length;
        if (end > start && isWholeWordMatch(text, start, end)) {
          hits.push({ end, start });
        }
      }
      return hits;
    };
  }
};

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

const isRangeContentAndNonVoid = (
  children: readonly Descendant[],
  range: Range,
  isContent: (node: Descendant) => boolean,
  isVoid: (element: Descendant) => boolean
): boolean => {
  const [start, end] = RangeApi.edges(range);
  let sawLeaf = false;

  const walk = (nodes: readonly Descendant[], parentPath: Path): boolean => {
    for (let i = 0; i < nodes.length; i += 1) {
      const path = [...parentPath, i];
      const node = nodes[i];

      if (
        PathApi.isBefore(path, start.path) &&
        !PathApi.isAncestor(path, start.path)
      ) {
        continue;
      }
      if (PathApi.isAfter(path, end.path)) {
        return true;
      }

      if (TextApi.isText(node)) {
        const atStart = PathApi.equals(path, start.path);
        const atEnd = PathApi.equals(path, end.path);
        const touchesText =
          !(atStart && start.offset === node.text.length && !atEnd) &&
          !(atEnd && end.offset === 0 && !atStart);
        if (touchesText) {
          sawLeaf = true;
          if (!isContent(node)) return false;
        }
        continue;
      }

      if (ElementApi.isElement(node)) {
        if (isVoid(node)) return false;
        if (!walk(node.children, path)) return false;
      }
    }
    return true;
  };

  return walk(children, []) && sawLeaf;
};

type RootSearchCache = Readonly<{
  anchorKeys: ReadonlyArray<NodeKey | null>;
  children: readonly Descendant[];
  matches: readonly FindMatch[];
}>;

type RootSegment = Readonly<{
  globalStart: number;
  localEnd: number;
  localStart: number;
  root: RootKey;
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

type FindSearch = {
  readonly activeRoots: Set<RootKey>;
  readonly byRoot: Map<RootKey, RootSearchCache>;
  readonly byRootSegments: ReadonlyMap<RootKey, readonly RootSegment[]>;
  readonly compiled: CompiledFindQuery | null;
  readonly count: number;
  readonly failed: boolean;
  readonly fromDraft: boolean;
  mergedMatches: readonly FindMatch[] | null;
  readonly options: NormalizedFindOptions;
  readonly owners: OwnerGraph;
  readonly query: string;
  readonly schema: EditorSchemaIdentity;
  readonly segments: readonly RootSegment[];
};

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

type PendingReplaceAfter = Readonly<{
  anchor: Anchor<Point>;
  root: RootKey;
}>;

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

const sameSegments = (a: readonly RootSegment[], b: readonly RootSegment[]) =>
  a === b ||
  (a.length === b.length &&
    a.every(
      (seg, i) =>
        seg.root === b[i].root &&
        seg.localStart === b[i].localStart &&
        seg.localEnd === b[i].localEnd &&
        seg.globalStart === b[i].globalStart
    ));

const buildSegments = (
  byRoot: ReadonlyMap<RootKey, RootSearchCache>,
  activeRoots: ReadonlySet<RootKey>,
  owners: OwnerGraph
): Readonly<{
  byRootSegments: ReadonlyMap<RootKey, readonly RootSegment[]>;
  count: number;
  segments: readonly RootSegment[];
}> => {
  const byRootSegments = new Map<RootKey, RootSegment[]>();
  const segments: RootSegment[] = [];
  let count = 0;

  if (activeRoots.size === 0) {
    return { byRootSegments, count: 0, segments };
  }

  const pushSegment = (root: RootKey, localStart: number, localEnd: number) => {
    if (localEnd <= localStart) return;
    const seg: RootSegment = {
      globalStart: count,
      localEnd,
      localStart,
      root,
    };
    segments.push(seg);
    let list = byRootSegments.get(root);
    if (!list) {
      list = [];
      byRootSegments.set(root, list);
    }
    list.push(seg);
    count += localEnd - localStart;
  };

  if (activeRoots.size === 1 && activeRoots.has(MAIN_ROOT_KEY)) {
    const mainMatches = byRoot.get(MAIN_ROOT_KEY)?.matches ?? EMPTY_MATCHES;
    pushSegment(MAIN_ROOT_KEY, 0, mainMatches.length);
    return { byRootSegments, count, segments };
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
  const visit = (root: RootKey) => {
    if (visited.has(root)) return;
    visited.add(root);
    const rootMatches = byRoot.get(root)?.matches ?? EMPTY_MATCHES;
    const childEntries = childrenByParent.get(root) ?? [];
    let matchCursor = 0;

    for (const { childRoot, ownerPath } of childEntries) {
      if (matchCursor < rootMatches.length) {
        const split =
          matchCursor +
          firstNotBefore(rootMatches.slice(matchCursor), (match) => {
            const matchPath = match.range.anchor.path;
            return (
              PathApi.compare(matchPath, ownerPath) <= 0 ||
              PathApi.isAncestor(ownerPath, matchPath)
            );
          });
        pushSegment(root, matchCursor, split);
        matchCursor = split;
      }
      visit(childRoot);
    }
    pushSegment(root, matchCursor, rootMatches.length);
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

  return { byRootSegments, count, segments };
};

const getMatchEntryAt = (
  search: FindSearch | null,
  globalIndex: number
): Readonly<{
  anchorKey: NodeKey | null;
  match: FindMatch;
  root: RootKey;
}> | null => {
  if (!search || globalIndex < 0 || globalIndex >= search.count) return null;
  const segIndex = firstNotBefore(
    search.segments,
    (seg) => seg.globalStart + (seg.localEnd - seg.localStart) <= globalIndex
  );
  const seg = search.segments[segIndex];
  if (!seg) return null;
  const cache = search.byRoot.get(seg.root);
  if (!cache) return null;
  const localIndex = seg.localStart + (globalIndex - seg.globalStart);
  const match = cache.matches[localIndex];
  if (!match) return null;
  return {
    anchorKey: cache.anchorKeys[localIndex] ?? null,
    match,
    root: seg.root,
  };
};

const getMatchAt = (
  search: FindSearch | null,
  globalIndex: number
): FindMatch | null => getMatchEntryAt(search, globalIndex)?.match ?? null;

const getGlobalIndexOf = (
  search: FindSearch,
  root: RootKey,
  localIndex: number
): number => {
  const list = search.byRootSegments.get(root);
  if (!list || list.length === 0) return -1;
  const segIndex = firstNotBefore(list, (seg) => seg.localEnd <= localIndex);
  const seg = list[segIndex];
  if (!seg || localIndex < seg.localStart || localIndex >= seg.localEnd) {
    return -1;
  }
  return seg.globalStart + (localIndex - seg.localStart);
};

const resolveActiveIndex = (
  search: FindSearch,
  start: Point,
  mode: 'after-end' | 'after-start'
): number => {
  if (search.count === 0) return -1;
  const startRoot = rootOfPoint(start);

  const isBefore = (match: FindMatch): boolean => {
    if (mode === 'after-start') {
      return rootOfMatch(match) === startRoot
        ? PointApi.compare(RangeApi.start(match.range), start) < 0
        : compareReadingOrderPoint(
            RangeApi.start(match.range),
            start,
            search.owners
          ) < 0;
    }
    return rootOfMatch(match) === startRoot
      ? PointApi.compare(RangeApi.end(match.range), start) <= 0
      : compareReadingOrderPoint(
          RangeApi.start(match.range),
          start,
          search.owners
        ) <= 0;
  };

  const segIndex = firstNotBefore(search.segments, (seg) => {
    const cache = search.byRoot.get(seg.root);
    const lastMatch = cache?.matches[seg.localEnd - 1];
    return lastMatch !== undefined && isBefore(lastMatch);
  });
  if (segIndex === search.segments.length) return 0;

  const seg = search.segments[segIndex];
  const cache = search.byRoot.get(seg.root);
  if (!cache) return 0;

  let low = seg.localStart;
  let high = seg.localEnd;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (isBefore(cache.matches[middle])) low = middle + 1;
    else high = middle;
  }
  const globalIndex = seg.globalStart + (low - seg.localStart);
  return globalIndex >= search.count ? 0 : globalIndex;
};

const resolveDeletedUnownedIndex = (
  search: FindSearch,
  previousOrder: number
): number => {
  if (search.count === 0) return -1;
  for (const seg of search.segments) {
    const top = buildRootChain(seg.root, search.owners)[0].root;
    if (top === MAIN_ROOT_KEY) continue;
    const order = search.owners.orderIndex.get(top);
    if (order !== undefined && order >= previousOrder) {
      return seg.globalStart;
    }
  }
  return 0;
};

const materializeMatches = (
  search: FindSearch | null
): readonly FindMatch[] => {
  if (!search || search.failed || search.count === 0) return EMPTY_MATCHES;
  if (search.mergedMatches) return search.mergedMatches;
  if (search.segments.length === 1) {
    const [only] = search.segments;
    const rootMatches = search.byRoot.get(only.root)?.matches ?? EMPTY_MATCHES;
    if (only.localStart === 0 && only.localEnd === rootMatches.length) {
      search.mergedMatches = rootMatches;
      return rootMatches;
    }
  }
  const out: FindMatch[] = [];
  for (const seg of search.segments) {
    const rootMatches = search.byRoot.get(seg.root)?.matches;
    if (!rootMatches) continue;
    for (let i = seg.localStart; i < seg.localEnd; i += 1) {
      out.push(rootMatches[i]);
    }
  }
  search.mergedMatches = Object.freeze(out);
  return search.mergedMatches;
};

/** Document-wide search and replacement across every root without polluting document history on search. */
export const BaseFindPlugin = definePlugin('find', {
  initialState,
}).extend(({ editor, store }) => {
  const refreshers = new Map<
    RootKey,
    Set<(input: DecorationRefresh) => void>
  >();
  let search: FindSearch | null = null;
  let currentActiveIndex = -1;
  let currentError: Error | null = null;
  let currentVersion = 0;
  let nextMatchSeq = 0;
  let anchored: ActiveAnchor | null = null;
  let pendingReplaceAfter: PendingReplaceAfter | null = null;
  const heldByRoot = new Map<RootKey, HeldRootRefresh>();
  let heldAllRoots = false;

  const allocMatchId = (key: NodeKey | null) => {
    nextMatchSeq += 1;
    return `${key ?? ''}:${nextMatchSeq}`;
  };

  const readCommittedChildren = (root: RootKey): readonly Descendant[] =>
    root === MAIN_ROOT_KEY ? editor.read.children() : editor.read.root(root);

  const readDraftChildren = (root: RootKey): readonly Descendant[] =>
    withTransactionSpecDraftRead(editor, () => readCommittedChildren(root));

  const inRoot = <T>(root: RootKey, fn: () => T) =>
    withEditorUpdateRootScope(editor, root, fn);

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

  const releaseAnchored = () => {
    if (!anchored) return;
    anchored.anchor.release();
    for (const fallback of anchored.fallbacks) fallback.release();
    anchored = null;
  };

  const releasePendingReplaceAfter = () => {
    if (!pendingReplaceAfter) return;
    pendingReplaceAfter.anchor.release();
    pendingReplaceAfter = null;
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
    compiled: CompiledFindQuery,
    options: NormalizedFindOptions,
    at?: Path
  ): FoundRanges =>
    withTransactionSpecDraftRead(editor, () => {
      const ranges = NodeApi.findTextRanges(
        {
          children: () => children,
          nodes: editor.read.nodes,
          schema: editor.read.schema,
        },
        compiled,
        { at, caseSensitive: options.caseSensitive }
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

  const toMatches = (
    root: RootKey,
    found: FoundRanges,
    previous: readonly FindMatch[],
    previousKeys: ReadonlyArray<NodeKey | null>,
    prevChildren: readonly Descendant[] | undefined,
    nextChildren: readonly Descendant[],
    changedKeys: Map<RootKey, Set<NodeKey>>
  ): Readonly<{
    anchorKeys: ReadonlyArray<NodeKey | null>;
    changed: boolean;
    matches: readonly FindMatch[];
  }> => {
    const prevByKey = new Map<
      NodeKey | null,
      Array<Readonly<{ index: number; match: FindMatch }>>
    >();
    for (let i = 0; i < previous.length; i += 1) {
      const key = previousKeys[i] ?? null;
      let list = prevByKey.get(key);
      if (!list) {
        list = [];
        prevByKey.set(key, list);
      }
      list.push({ index: i, match: previous[i] });
    }

    const nextByKey = new Map<
      NodeKey | null,
      Array<Readonly<{ index: number; range: Range }>>
    >();
    const stampedRanges: Range[] = new Array(found.ranges.length);
    for (let i = 0; i < found.ranges.length; i += 1) {
      const range = stampRoot(found.ranges[i], root);
      stampedRanges[i] = range;
      const key = found.keys[i] ?? null;
      let list = nextByKey.get(key);
      if (!list) {
        list = [];
        nextByKey.set(key, list);
      }
      list.push({ index: i, range });
    }

    const result: FindMatch[] = new Array(found.ranges.length);
    let reusedAll = found.ranges.length === previous.length;

    for (const [key, nextGroup] of nextByKey) {
      const prevGroup = prevByKey.get(key);
      prevByKey.delete(key);

      if (!prevGroup || prevGroup.length === 0) {
        reusedAll = false;
        addRootKey(changedKeys, root, key);
        for (const item of nextGroup) {
          result[item.index] = snapshotPluginState(
            { id: allocMatchId(key), range: item.range },
            true
          );
        }
        continue;
      }

      const usedPrev = new Set<number>();
      const matchedPrevForNext = new Map<number, FindMatch>();

      const allSingleLeaf =
        prevGroup.every((p) =>
          PathApi.equals(p.match.range.anchor.path, p.match.range.focus.path)
        ) &&
        nextGroup.every((n) =>
          PathApi.equals(n.range.anchor.path, n.range.focus.path)
        );

      if (allSingleLeaf) {
        const prevText = getTextAtPath(
          prevChildren,
          prevGroup[0].match.range.anchor.path
        );
        const nextText = getTextAtPath(
          nextChildren,
          nextGroup[0].range.anchor.path
        );
        if (prevText !== null && nextText !== null) {
          const { delta, editStart, prevEditEnd } = getMinimalTextEditWindow(
            prevText,
            nextText
          );
          const prevByOffset = new Map<string, number>();
          for (let i = 0; i < prevGroup.length; i += 1) {
            const r = prevGroup[i].match.range;
            if (r.focus.offset <= editStart) {
              prevByOffset.set(`${r.anchor.offset}:${r.focus.offset}`, i);
            } else if (r.anchor.offset >= prevEditEnd) {
              prevByOffset.set(
                `${r.anchor.offset + delta}:${r.focus.offset + delta}`,
                i
              );
            }
          }
          for (const item of nextGroup) {
            const prevIdx = prevByOffset.get(
              `${item.range.anchor.offset}:${item.range.focus.offset}`
            );
            if (prevIdx !== undefined && !usedPrev.has(prevIdx)) {
              usedPrev.add(prevIdx);
              matchedPrevForNext.set(item.index, prevGroup[prevIdx].match);
            }
          }
        }
      }

      // Align remaining matches by exact range equality or pure unchanged-block top shift.
      for (const item of nextGroup) {
        if (matchedPrevForNext.has(item.index)) continue;
        for (let i = 0; i < prevGroup.length; i += 1) {
          if (usedPrev.has(i)) continue;
          const oldMatch = prevGroup[i].match;
          if (
            RangeApi.equals(oldMatch.range, item.range) ||
            isPureTopShiftOfUnchangedBlock(
              prevChildren,
              nextChildren,
              oldMatch.range,
              item.range
            )
          ) {
            usedPrev.add(i);
            matchedPrevForNext.set(item.index, oldMatch);
            break;
          }
        }
      }

      let groupPaintChanged = usedPrev.size !== prevGroup.length;
      for (const item of nextGroup) {
        const old = matchedPrevForNext.get(item.index);
        if (old && RangeApi.equals(old.range, item.range)) {
          if (old !== previous[item.index]) reusedAll = false;
          if (
            !PathApi.equals(item.range.anchor.path, item.range.focus.path) &&
            (!prevChildren ||
              prevChildren[old.range.anchor.path[0]] !==
                nextChildren[item.range.anchor.path[0]])
          ) {
            groupPaintChanged = true;
          }
          result[item.index] = old;
          continue;
        }
        reusedAll = false;
        if (old) {
          if (
            !sameSingleLeafOffsets(old.range, item.range) &&
            !isPureTopShiftOfUnchangedBlock(
              prevChildren,
              nextChildren,
              old.range,
              item.range
            )
          ) {
            groupPaintChanged = true;
          }
          result[item.index] = snapshotPluginState(
            { id: old.id, range: item.range },
            true
          );
        } else {
          groupPaintChanged = true;
          result[item.index] = snapshotPluginState(
            { id: allocMatchId(key), range: item.range },
            true
          );
        }
      }

      if (groupPaintChanged) {
        addRootKey(changedKeys, root, key);
      }
    }

    for (const [removedKey, removedGroup] of prevByKey) {
      if (removedGroup.length > 0) {
        reusedAll = false;
        addRootKey(changedKeys, root, removedKey);
      }
    }

    if (reusedAll) {
      return {
        anchorKeys: previousKeys,
        changed: false,
        matches: previous,
      };
    }

    return {
      anchorKeys: found.keys,
      changed: true,
      matches: Object.freeze(result),
    };
  };

  const settle = (
    next: FindSearch,
    {
      changedKeys,
      error,
      followActive,
      matchesChanged,
      replaceAfterPoint,
    }: Readonly<{
      changedKeys: Map<RootKey, Set<NodeKey>>;
      error: Error | null;
      followActive: boolean;
      matchesChanged: boolean;
      replaceAfterPoint: Point | null;
    }>
  ) => {
    const previousSearch = search;
    const previousActiveEntry = getMatchEntryAt(
      previousSearch,
      currentActiveIndex
    );
    const previousActiveIndex = currentActiveIndex;
    const previousError = currentError;
    const previousOwners = previousSearch?.owners;
    const stored = previousActiveEntry?.match;

    const activeAnchor =
      next.count > 0 &&
      followActive &&
      anchored !== null &&
      sameMatch(stored, anchored.match)
        ? anchored
        : null;
    const primaryRange = activeAnchor ? activeAnchor.anchor.resolve() : null;
    const activeStart =
      replaceAfterPoint ??
      (primaryRange !== null
        ? RangeApi.start(primaryRange)
        : activeAnchor
          ? resolveActiveStart()
          : null);

    let nextActiveIndex = -1;
    if (replaceAfterPoint !== null) {
      nextActiveIndex =
        next.count > 0
          ? resolveActiveIndex(next, replaceAfterPoint, 'after-start')
          : -1;
    } else if (
      !matchesChanged &&
      primaryRange !== null &&
      stored !== undefined &&
      RangeApi.equals(primaryRange, stored.range) &&
      previousActiveIndex >= 0 &&
      previousActiveIndex < next.count
    ) {
      nextActiveIndex = previousActiveIndex;
    } else if (activeStart) {
      nextActiveIndex = resolveActiveIndex(next, activeStart, 'after-end');
    } else if (activeAnchor && activeAnchor.rootOrder !== null) {
      nextActiveIndex = resolveDeletedUnownedIndex(
        next,
        activeAnchor.rootOrder
      );
    } else if (next.count > 0) {
      nextActiveIndex = followActive
        ? Math.max(0, previousActiveIndex) % next.count
        : 0;
    }

    const activeEntry = getMatchEntryAt(next, nextActiveIndex);
    const active = activeEntry?.match;

    search = next;
    currentActiveIndex = nextActiveIndex;
    currentError = error;

    const ownerGraphChanged =
      active !== undefined &&
      rootOfMatch(active) !== MAIN_ROOT_KEY &&
      next.owners !== previousOwners;
    if (
      !sameMatch(active, anchored?.match) ||
      ownerGraphChanged ||
      (primaryRange && active && !RangeApi.equals(primaryRange, active.range))
    ) {
      anchorTo(active, next.owners);
    }

    const queryOrOptionsChanged =
      !previousSearch ||
      next.query !== previousSearch.query ||
      !sameOptions(next.options, previousSearch.options);

    if (
      followActive &&
      !matchesChanged &&
      !queryOrOptionsChanged &&
      error === previousError &&
      nextActiveIndex === previousActiveIndex
    ) {
      if (changedKeys.size > 0) refreshRoots(changedKeys);
      return;
    }

    if (matchesChanged) {
      currentVersion += 1;
    }

    if (
      active?.id !== stored?.id ||
      (active && stored && rootOfMatch(active) !== rootOfMatch(stored))
    ) {
      if (previousActiveEntry) {
        addRootKey(
          changedKeys,
          previousActiveEntry.root,
          previousActiveEntry.anchorKey
        );
      }
      if (activeEntry) {
        addRootKey(changedKeys, activeEntry.root, activeEntry.anchorKey);
      }
    }

    store.set({
      activeIndex: nextActiveIndex,
      caseSensitive: next.options.caseSensitive,
      error,
      query: next.query,
      regexp: next.options.regexp,
      version: currentVersion,
      wholeWord: next.options.wholeWord,
    });
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

  const publish = (
    query: string,
    options: NormalizedFindOptions,
    followActive: boolean,
    replaceAfterPoint: Point | null = null
  ) => {
    const previousByRoot = search?.byRoot;
    const owners = readOwnerGraph();
    const allRoots: RootKey[] = [MAIN_ROOT_KEY, ...owners.order];
    const byRoot = new Map<RootKey, RootSearchCache>();
    const activeRoots = new Set<RootKey>();
    const changedKeys = new Map<RootKey, Set<NodeKey>>();
    let fromDraft = hasDraftRootDelta(owners);
    let searchError: Error | null = null;
    let compiled: CompiledFindQuery | null = null;
    let anyMatchesChanged = false;

    if (query) {
      try {
        compiled = compileFindQuery(query, options);
      } catch (error) {
        searchError = error instanceof Error ? error : new Error(String(error));
      }
    }

    for (const root of allRoots) {
      const children = readDraftChildren(root);
      if (!fromDraft && children !== readCommittedChildren(root)) {
        fromDraft = true;
      }
      const prevCache = previousByRoot?.get(root);
      let found: FoundRanges = { keys: [], ranges: [] };
      if (compiled && !searchError) {
        try {
          found = findIn(root, children, compiled, options);
        } catch (error) {
          searchError =
            error instanceof Error ? error : new Error(String(error));
        }
      }
      if (searchError) {
        if (prevCache && prevCache.matches.length > 0) {
          anyMatchesChanged = true;
          for (const key of prevCache.anchorKeys) {
            addRootKey(changedKeys, root, key);
          }
        }
        byRoot.set(root, {
          anchorKeys: [],
          children,
          matches: EMPTY_MATCHES,
        });
      } else {
        const nextRoot = toMatches(
          root,
          found,
          prevCache?.matches ?? EMPTY_MATCHES,
          prevCache?.anchorKeys ?? [],
          prevCache?.children,
          children,
          changedKeys
        );
        if (nextRoot.changed) anyMatchesChanged = true;
        if (nextRoot.matches.length > 0) activeRoots.add(root);
        byRoot.set(root, {
          anchorKeys: nextRoot.anchorKeys,
          children,
          matches: nextRoot.matches,
        });
      }
    }

    if (searchError) {
      activeRoots.clear();
      for (const [root, cache] of byRoot) {
        if (cache.matches.length > 0) {
          anyMatchesChanged = true;
          for (const key of cache.anchorKeys) {
            addRootKey(changedKeys, root, key);
          }
          byRoot.set(root, {
            anchorKeys: [],
            children: cache.children,
            matches: EMPTY_MATCHES,
          });
        }
      }
      if (previousByRoot) {
        for (const [root, prevCache] of previousByRoot) {
          if (prevCache.matches.length > 0) {
            anyMatchesChanged = true;
            for (const key of prevCache.anchorKeys) {
              addRootKey(changedKeys, root, key);
            }
          }
        }
      }
    } else if (previousByRoot) {
      for (const [root, prevCache] of previousByRoot) {
        if (byRoot.has(root)) continue;
        if (prevCache.matches.length > 0) {
          anyMatchesChanged = true;
          for (const key of prevCache.anchorKeys) {
            addRootKey(changedKeys, root, key);
          }
        }
      }
    }

    const built = searchError
      ? {
          byRootSegments: new Map<RootKey, readonly RootSegment[]>(),
          count: 0,
          segments: [] as readonly RootSegment[],
        }
      : buildSegments(byRoot, activeRoots, owners);

    if (
      !anyMatchesChanged &&
      search &&
      (built.count !== search.count ||
        !sameSegments(search.segments, built.segments))
    ) {
      anyMatchesChanged = true;
    }

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
        byRootSegments: built.byRootSegments,
        compiled,
        count: built.count,
        failed: searchError !== null,
        fromDraft,
        mergedMatches: null,
        options,
        owners,
        query,
        schema: editor.read.schema.identity(),
        segments: built.segments,
      },
      {
        changedKeys,
        error: searchError,
        followActive,
        matchesChanged: anyMatchesChanged,
        replaceAfterPoint,
      }
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
    compiled: CompiledFindQuery,
    options: NormalizedFindOptions,
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
            found = findIn(root, nextChildren, compiled, options, scope);
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
          const beforeKeys = prevCache.anchorKeys.slice(start, end);
          const keyless =
            found.keys.includes(null) || beforeKeys.includes(null);
          if (!keyless) {
            const scoped = toMatches(
              root,
              found,
              before,
              beforeKeys,
              prevChildren,
              nextChildren,
              changedKeys
            );
            const matchesChanged = scoped.changed;
            const matches = matchesChanged
              ? Object.freeze([
                  ...prevCache.matches.slice(0, start),
                  ...scoped.matches,
                  ...prevCache.matches.slice(end),
                ])
              : prevCache.matches;
            const anchorKeys = matchesChanged
              ? [
                  ...prevCache.anchorKeys.slice(0, start),
                  ...scoped.anchorKeys,
                  ...prevCache.anchorKeys.slice(end),
                ]
              : prevCache.anchorKeys;
            return {
              cache: { anchorKeys, children: nextChildren, matches },
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
            const found = findIn(root, nextChildren, compiled, options, [
              blockIndex,
            ]);
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
          const beforeKeys = prevCache.anchorKeys.slice(matchStart, matchEnd);
          const keyless =
            windowKeys.includes(null) || beforeKeys.includes(null);

          if (!keyless) {
            const delta = nextChildren.length - prevChildren.length;
            const scoped = toMatches(
              root,
              { keys: windowKeys, ranges: windowRanges },
              before,
              beforeKeys,
              prevChildren,
              nextChildren,
              changedKeys
            );
            const tail =
              delta === 0
                ? prevCache.matches.slice(matchEnd)
                : prevCache.matches
                    .slice(matchEnd)
                    .map((match) => shiftMatchTop(match, delta));
            const matchesChanged =
              scoped.changed ||
              (delta !== 0 && matchEnd < prevCache.matches.length);
            const matches = matchesChanged
              ? Object.freeze([
                  ...prevCache.matches.slice(0, matchStart),
                  ...scoped.matches,
                  ...tail,
                ])
              : prevCache.matches;
            const anchorKeys = matchesChanged
              ? [
                  ...prevCache.anchorKeys.slice(0, matchStart),
                  ...scoped.anchorKeys,
                  ...prevCache.anchorKeys.slice(matchEnd),
                ]
              : prevCache.anchorKeys;
            const touchedOwners = sliceTouchedOwners(
              prevChildren,
              nextChildren,
              prefix,
              prevEnd,
              nextEnd
            );

            return {
              cache: { anchorKeys, children: nextChildren, matches },
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
      found = findIn(root, nextChildren, compiled, options);
    } catch {
      return null;
    }
    const prevMatches = prevCache?.matches ?? EMPTY_MATCHES;
    const prevKeys = prevCache?.anchorKeys ?? [];
    const nextRoot = toMatches(
      root,
      found,
      prevMatches,
      prevKeys,
      prevCache?.children,
      nextChildren,
      changedKeys
    );
    return {
      cache: {
        anchorKeys: nextRoot.anchorKeys,
        children: nextChildren,
        matches: nextRoot.matches,
      },
      matchesChanged: nextRoot.changed,
      shift: null,
      touchedOwners: fallbackTouchedOwners,
    };
  };

  const setActiveIndexInternal = (index: number): boolean => {
    if (
      !search ||
      search.failed ||
      search.count === 0 ||
      !Number.isInteger(index) ||
      index < 0 ||
      index >= search.count
    ) {
      return false;
    }
    if (index === currentActiveIndex) return true;

    const prevEntry = getMatchEntryAt(search, currentActiveIndex);
    const nextEntry = getMatchEntryAt(search, index);
    if (!nextEntry) return false;

    currentActiveIndex = index;
    const cached = search.byRoot.get(nextEntry.root);
    anchorTo(
      cached &&
        readDraftChildren(nextEntry.root) === cached.children &&
        isValidRangeInChildren(cached.children, nextEntry.match.range)
        ? nextEntry.match
        : undefined
    );

    const changedKeys = new Map<RootKey, Set<NodeKey>>();
    if (prevEntry) {
      addRootKey(changedKeys, prevEntry.root, prevEntry.anchorKey);
    }
    addRootKey(changedKeys, nextEntry.root, nextEntry.anchorKey);

    store.set({ activeIndex: index });
    refreshRoots(changedKeys);
    return true;
  };

  const ensureFreshForUpdate = (rootsToCheck?: Iterable<RootKey>): boolean => {
    if (!search || !search.query || search.failed) return false;
    let stale =
      search.fromDraft ||
      search.schema !== editor.read.schema.identity() ||
      hasDraftRootDelta(search.owners);
    if (!stale) {
      const targetRoots = rootsToCheck ?? [
        MAIN_ROOT_KEY,
        ...search.owners.order,
      ];
      for (const root of targetRoots) {
        const cached = search.byRoot.get(root);
        if (!cached || readDraftChildren(root) !== cached.children) {
          stale = true;
          break;
        }
      }
    }
    if (stale) {
      publish(search.query, search.options, true);
    }
    return Boolean(search && !search.failed && search.count > 0);
  };

  return {
    activate: ({ onCleanup }) => {
      onCleanup(() => {
        releaseAnchored();
        releasePendingReplaceAfter();
        refreshers.clear();
        heldByRoot.clear();
        heldAllRoots = false;
      });
    },
    api: () => ({
      /**
       * Apply a text query across every document root; an empty query clears results.
       * Omitted option fields default to `false`.
       */
      search: (query: string, options?: FindOptions) => {
        releasePendingReplaceAfter();
        const normalized = normalizeOptions(options);
        if (
          !search ||
          query !== search.query ||
          query !== store.get('query') ||
          !sameOptions(normalized, search.options) ||
          search.failed ||
          search.fromDraft ||
          getActiveEditorTransaction(editor) !== null
        ) {
          publish(query, normalized, false);
        }
      },
      /** Move through current matches in reading order, wrapping at either end. */
      move: (delta: -1 | 1) => {
        if (!search || search.failed || search.count === 0) return;
        const nextIndex =
          (currentActiveIndex + delta + search.count) % search.count;
        setActiveIndexInternal(nextIndex);
      },
      /**
       * Set the active match by zero-based global reading-order index.
       * Returns false without changing state when out of range or non-integer.
       */
      setActiveIndex: (index: number): boolean => setActiveIndexInternal(index),
      /**
       * Return current search matches in document reading order (or for one `root`).
       * Lazily materialized and frozen until `version` increments.
       */
      matches: (
        options?: Readonly<{ root?: RootKey }>
      ): readonly FindMatch[] => {
        if (!search || search.failed || search.count === 0) {
          return EMPTY_MATCHES;
        }
        if (options?.root !== undefined) {
          return search.byRoot.get(options.root)?.matches ?? EMPTY_MATCHES;
        }
        return materializeMatches(search);
      },
      /**
       * Find the match containing `point` (inclusive of range endpoints) along with
       * its global reading-order index, or null when no match covers `point`.
       */
      matchAt: (point: Point): FindMatchLocation | null => {
        if (!search || search.failed || search.count === 0) return null;
        const root = rootOfPoint(point);
        const cache = search.byRoot.get(root);
        if (!cache || cache.matches.length === 0) return null;

        const localIndex = firstNotBefore(
          cache.matches,
          (match) => PointApi.compare(RangeApi.end(match.range), point) < 0
        );
        const match = cache.matches[localIndex];
        if (!match) return null;
        if (
          PointApi.compare(RangeApi.start(match.range), point) > 0 ||
          PointApi.compare(point, RangeApi.end(match.range)) > 0
        ) {
          return null;
        }
        const index = getGlobalIndexOf(search, root, localIndex);
        return index === -1 ? null : { index, match };
      },
    }),
    selectors: {
      activeMatch: (state): FindMatch | null => {
        void state.version;
        void state.activeIndex;
        return getMatchAt(search, currentActiveIndex);
      },
      count: (state): number => {
        void state.version;
        return search && !search.failed ? search.count : 0;
      },
    },
    update: ({ editor: view, tx }) => {
      const isReplaceableRange = (
        matchRoot: RootKey,
        range: Range
      ): boolean => {
        const children = readDraftChildren(matchRoot);
        if (!isValidRangeInChildren(children, range)) return false;
        const nonWritable = inRoot(matchRoot, () =>
          hasNonWritableAt(editor, range)
        );
        if (nonWritable) return false;
        return inRoot(matchRoot, () =>
          isRangeContentAndNonVoid(
            children,
            range,
            (node) => tx.nodes.isContent(node),
            (node) => ElementApi.isElement(node) && tx.schema.isVoid(node)
          )
        );
      };

      const applySingleReplacement = (
        matchRoot: RootKey,
        range: Range,
        replacement: string
      ): boolean => {
        const beforeChildren = readDraftChildren(matchRoot);
        inRoot(matchRoot, () => {
          if (replacement.length === 0) {
            tx.text.delete({ at: range });
          } else {
            tx.text.insert(replacement, { at: range });
          }
        });
        return readDraftChildren(matchRoot) !== beforeChildren;
      };

      return {
        /**
         * Select the current result in its document root from any view; returns
         * false without an active match. Focus remains owned by the caller's view.
         */
        select: txSelection(() => {
          const current = getMatchEntryAt(search, currentActiveIndex);
          if (search?.query) {
            ensureFreshForUpdate(current ? [current.root] : undefined);
          }
          const entry = getMatchEntryAt(search, currentActiveIndex);
          if (!entry) return false;
          const targetChildren = readDraftChildren(entry.root);
          if (!isValidRangeInChildren(targetChildren, entry.match.range)) {
            return false;
          }
          const activeTx = getActiveEditorTransaction(editor) ?? tx;
          inRoot(entry.root, () => {
            activeTx.selection.set(entry.match.range);
          });
          return true;
        }),
        /**
         * Replace the active match with literal `replacement` text as its own undo
         * step (when no history tag is already set) and advance past the replaced
         * range. Returns false without mutating when no match is active, the view
         * is read-only, or the match touches a locked, void, or non-content leaf.
         */
        replace: txStored((replacement: string): boolean => {
          if (view.read.view.isReadOnly()) return false;
          if (!ensureFreshForUpdate()) return false;

          const entry = getMatchEntryAt(search, currentActiveIndex);
          if (!entry) return false;
          if (!isReplaceableRange(entry.root, entry.match.range)) {
            return false;
          }

          if (!HISTORY_TAGS.some((tag) => tx.tags.has(tag))) {
            tx.tags.add('history-push');
          }

          releasePendingReplaceAfter();
          const endPoint = RangeApi.end(entry.match.range);
          const afterAnchor = inRoot(entry.root, () =>
            editor.anchor(endPoint, {
              association: 'forward',
              deletion: 'nearest',
            })
          );
          pendingReplaceAfter = { anchor: afterAnchor, root: entry.root };

          try {
            const mutated = applySingleReplacement(
              entry.root,
              entry.match.range,
              replacement
            );
            if (!mutated) {
              releasePendingReplaceAfter();
            }
            return mutated;
          } catch (error) {
            releasePendingReplaceAfter();
            throw error;
          }
        }),
        /**
         * Replace every writable, content-only match in the current query with
         * literal `replacement` text in reverse document order per root as one
         * undo step (when no history tag is already set). Returns the number of
         * matches actually mutated.
         */
        replaceAll: txStored((replacement: string): number => {
          if (view.read.view.isReadOnly()) return 0;
          if (!ensureFreshForUpdate() || !search) return 0;

          const batchByRoot = new Map<RootKey, Range[]>();
          let totalEligible = 0;

          for (const seg of search.segments) {
            const cache = search.byRoot.get(seg.root);
            if (!cache) continue;
            for (let i = seg.localStart; i < seg.localEnd; i += 1) {
              const match = cache.matches[i];
              if (!isReplaceableRange(seg.root, match.range)) continue;
              let list = batchByRoot.get(seg.root);
              if (!list) {
                list = [];
                batchByRoot.set(seg.root, list);
              }
              list.push(match.range);
              totalEligible += 1;
            }
          }

          if (totalEligible === 0) return 0;

          if (!HISTORY_TAGS.some((tag) => tx.tags.has(tag))) {
            tx.tags.add('history-push');
          }

          releasePendingReplaceAfter();
          let replaced = 0;
          for (const [root, ranges] of batchByRoot) {
            for (let i = ranges.length - 1; i >= 0; i -= 1) {
              const range = ranges[i];
              if (!isReplaceableRange(root, range)) continue;
              if (applySingleReplacement(root, range, replacement)) {
                replaced += 1;
              }
            }
          }
          return replaced;
        }),
      };
    },
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
        const active = getMatchAt(search, currentActiveIndex);
        const { matches } = rootCache;
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
              'data-find-active': sameMatch(match, active ?? undefined)
                ? ''
                : undefined,
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
        const replaceAfterPoint = pendingReplaceAfter
          ? pendingReplaceAfter.anchor.resolve()
          : null;
        releasePendingReplaceAfter();

        if (search && !search.query) {
          for (const root of commit.changes.deleteRoots) {
            search.byRoot.delete(root);
            search.activeRoots.delete(root);
          }
        }

        if (search?.query) {
          const schemaCurrent = search.schema === editor.read.schema.identity();

          if (
            !schemaCurrent ||
            search.failed ||
            search.fromDraft ||
            !search.compiled
          ) {
            publish(search.query, search.options, true, replaceAfterPoint);
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
                      for (const key of prev.anchorKeys) {
                        addRootKey(changedKeys, root, key);
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
                  search.compiled,
                  search.options,
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
                publish(search.query, search.options, true, replaceAfterPoint);
              } else {
                const nextOwners = needsOwnerRefresh
                  ? readOwnerGraph()
                  : search.owners;
                const activeRoots = new Set(search.activeRoots);
                const byRoot = new Map(search.byRoot);
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
                const built =
                  !anyMatchesChanged && !needsOwnerRefresh
                    ? {
                        byRootSegments: search.byRootSegments,
                        count: search.count,
                        segments: search.segments,
                      }
                    : buildSegments(byRoot, activeRoots, nextOwners);
                const segmentsChanged = !sameSegments(
                  search.segments,
                  built.segments
                );
                const matchesChanged = anyMatchesChanged || segmentsChanged;
                settle(
                  {
                    ...search,
                    activeRoots,
                    byRoot,
                    byRootSegments: built.byRootSegments,
                    count: built.count,
                    fromDraft: false,
                    mergedMatches: matchesChanged ? null : search.mergedMatches,
                    owners: nextOwners,
                    segments: built.segments,
                  },
                  {
                    changedKeys,
                    error: null,
                    followActive: true,
                    matchesChanged,
                    replaceAfterPoint,
                  }
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
