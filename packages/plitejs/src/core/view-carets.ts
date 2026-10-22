import { getOwnViewPresentation } from '../editor-runtime-view';
import type {
  AnyEditor as Editor,
  EditorCommit,
  EditorDocumentValue,
  EditorSelectionTarget,
  NamedRootKey,
  NodeKey,
} from '../interfaces/editor';
import { type Descendant, NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import {
  type NodeSelectionMode,
  type Selection,
  type SelectionAssociation,
  SelectionApi,
  type SelectionValue,
} from '../interfaces/selection';
import { getDefined } from '../internal/get-defined';
import { toStoredTarget, withAuthoredUpdateView } from './authored-runtime';
import type { DocumentIndex } from './change/document-index';
import type { RootChange } from './change/root-change';
import {
  type EditorRuntimeCarrier,
  getEditorRuntime,
  getEditorRuntimeOwner,
} from './editor-runtime';
import { MAIN_ROOT_KEY, toInternalRoot, toPublicRoot } from './public-root';
import {
  getActiveEditorTransaction,
  getCurrentSelection,
  getCurrentSelectionRoot,
  getEditorDocumentValue,
  getTransactionSnapshot,
  getTransactionSpecContext,
  invalidateEditorTransactionSpecs,
  retainTransactionSnapshotIndex,
  setDraftCaret,
  withEditorRootChildren,
  withEditorUpdateRootScope,
} from './public-state';
import {
  isViewPresentationRetained,
  onPresentationRelease,
  type ViewPresentation,
} from './view-presentation';
import { countCoreWork } from './work';

export type CaretOwner = Readonly<{
  presentation: ViewPresentation;
  root: NamedRootKey | undefined;
}>;

export type CaretPair = Readonly<{
  presentation: ViewPresentation;
  root: string;
}>;

export type Placement = ViewPresentation | 'base';

type KeyedPoint = Readonly<{ key: NodeKey; offset: number }>;

/**
 * A parked selection held by the keys of the nodes it sits in, so it keeps its
 * place through every step that touches none of them.
 */
type KeyedSelection =
  | Readonly<{
      affinity?: SelectionAssociation;
      anchor: KeyedPoint;
      focus: KeyedPoint;
      kind: 'text';
    }>
  | Readonly<{
      anchor: NodeKey;
      fallback: KeyedPoint;
      focus: NodeKey;
      kind: 'node';
      mode: NodeSelectionMode;
      nodes: readonly NodeKey[];
    }>;

export type Bookmark = Readonly<{
  /** The placement generation of the caret it parks. */
  generation: number;
  root: string;
  selection: KeyedSelection;
}>;

/**
 * Every view's bookmarks, persistent: an operation that changes nothing returns
 * the same book, so drafts and commits share it.
 */
export type CaretBook = Readonly<{
  marks: ReadonlyMap<ViewPresentation, ReadonlyMap<string, Bookmark>>;
  nodes: ReadonlyMap<
    string,
    ReadonlyMap<NodeKey, ReadonlySet<ViewPresentation>>
  >;
}>;

export type Carets = Readonly<{
  book: CaretBook;
  generation: number;
  owner: CaretPair | null;
}>;

/** The live selection and the bookmarks, which every mapping moves together. */
export type CaretState = Carets &
  Readonly<{
    root: string;
    selection: Selection;
  }>;

export type KeyLens = Readonly<{
  keyAt: (path: Path) => NodeKey | null;
  pathOf: (key: NodeKey) => Path | null | undefined;
}>;

/** A bookmark in path form, to cross into a document with other node keys. */
export type MovedBookmark = Readonly<{
  generation: number;
  presentation: ViewPresentation;
  root: string;
  selection: SelectionValue | null;
}>;

export type CarriedCarets = Readonly<{
  generation: number;
  moved: readonly MovedBookmark[];
  owner: CaretPair | null;
}>;

/** One view's caret at an edge of a history batch, in that edge's document. */
export type EdgeCaret = Readonly<{
  generation: number;
  /** `null` when no mapping could keep it. */
  selection: Selection;
}>;

/** A view whose caret a history batch changed, at both edges; `null` where it had none. */
export type HistoryCaretView = Readonly<{
  after: EdgeCaret | null;
  before: EdgeCaret | null;
  presentation: ViewPresentation;
  root: string;
}>;

const EMPTY_BOOK: CaretBook = Object.freeze({
  marks: new Map(),
  nodes: new Map(),
});

const NO_CARETS: Carets = Object.freeze({
  book: EMPTY_BOOK,
  generation: 0,
  owner: null,
});

const COMMITTED = new WeakMap<Editor, Carets>();
const COMMIT_CARETS = new WeakMap<
  EditorCommit,
  Readonly<{ after: Carets; before: Carets }>
>();
const WATCHED = new WeakMap<Editor, Map<ViewPresentation, () => void>>();
const CARET_OWNER_LISTENERS = new WeakMap<Editor, Set<() => void>>();
const HIGHEST_MINTED = new WeakMap<Editor, number>();
const SCOPED_PLACEMENTS = new WeakMap<
  Editor,
  Readonly<{ context: object | undefined; placement: Placement | null }>
>();

const samePair = (left: CaretPair | null, right: CaretPair | null) =>
  left === right ||
  (!!left &&
    !!right &&
    left.presentation === right.presentation &&
    left.root === right.root);

const setCommittedCarets = (owner: Editor, carets: Carets) => {
  const before = getCommittedCarets(owner).owner;

  COMMITTED.set(owner, carets);
  if (samePair(before, carets.owner)) return;
  for (const listener of CARET_OWNER_LISTENERS.get(owner) ?? []) listener();
};

export const subscribeCaretOwner = (editor: Editor, listener: () => void) => {
  const owner = getEditorRuntimeOwner(editor);
  const listeners = CARET_OWNER_LISTENERS.get(owner) ?? new Set();

  listeners.add(listener);
  CARET_OWNER_LISTENERS.set(owner, listeners);

  return () => {
    listeners.delete(listener);
  };
};

const keysOf = ({ selection }: Bookmark): NodeKey[] =>
  selection.kind === 'text'
    ? [selection.anchor.key, selection.focus.key]
    : [...selection.nodes, selection.fallback.key];

type BookmarkWrite = readonly [
  presentation: ViewPresentation,
  root: string,
  bookmark: Bookmark | null,
];

const setBookmarks = (
  book: CaretBook,
  writes: Iterable<BookmarkWrite>
): CaretBook => {
  const copies = new Set<unknown>();
  const own = <K, V>(map: ReadonlyMap<K, V> | undefined) => {
    if (map && copies.has(map)) return map as Map<K, V>;

    const copy = new Map(map);

    copies.add(copy);
    return copy;
  };
  const ownSet = <T>(set: ReadonlySet<T> | undefined) => {
    if (set && copies.has(set)) return set as Set<T>;

    const copy = new Set(set);

    copies.add(copy);
    return copy;
  };
  const indexKeys = (
    nodes: Map<string, ReadonlyMap<NodeKey, ReadonlySet<ViewPresentation>>>,
    presentation: ViewPresentation,
    bookmark: Bookmark,
    add: boolean
  ) => {
    const byKey = own(nodes.get(bookmark.root));

    for (const key of keysOf(bookmark)) {
      const holders = ownSet(byKey.get(key));

      if (add) holders.add(presentation);
      else holders.delete(presentation);
      if (holders.size === 0) byKey.delete(key);
      else byKey.set(key, holders);
    }
    if (byKey.size === 0) nodes.delete(bookmark.root);
    else nodes.set(bookmark.root, byKey);
  };
  let { marks, nodes } = book;

  for (const [presentation, root, bookmark] of writes) {
    const previous = marks.get(presentation)?.get(root);

    if (previous === bookmark || (!previous && !bookmark)) continue;

    const nextMarks = own(marks);
    const nextNodes = own(nodes);
    const byRoot = own(nextMarks.get(presentation));

    if (previous) indexKeys(nextNodes, presentation, previous, false);
    if (bookmark) {
      indexKeys(nextNodes, presentation, bookmark, true);
      byRoot.set(root, bookmark);
    } else {
      byRoot.delete(root);
    }
    if (byRoot.size === 0) nextMarks.delete(presentation);
    else nextMarks.set(presentation, byRoot);
    marks = nextMarks;
    nodes = nextNodes;
  }
  if (marks === book.marks) return book;
  countCoreWork('bookCopies');

  return { marks, nodes };
};

export const getBookmark = (
  book: CaretBook,
  presentation: ViewPresentation,
  root: string
) => book.marks.get(presentation)?.get(root);

export const hasBookmarksIn = (book: CaretBook, root: string) =>
  book.nodes.has(root);

export const bookmarksOn = (
  book: CaretBook,
  root: string,
  keys: Iterable<NodeKey>
): Array<readonly [ViewPresentation, Bookmark]> => {
  const byKey = book.nodes.get(root);
  const found = new Map<ViewPresentation, Bookmark>();

  if (!byKey) return [];
  for (const key of keys) {
    for (const presentation of byKey.get(key) ?? []) {
      const bookmark = getBookmark(book, presentation, root);

      if (bookmark) found.set(presentation, bookmark);
    }
  }

  return [...found];
};

const rootDrops = (book: CaretBook, root: string): BookmarkWrite[] =>
  [...book.marks.keys()].map((presentation) => [presentation, root, null]);

export const changedBookmarks = (book: CaretBook, base: CaretBook) => {
  const changed: Array<
    readonly [ViewPresentation, string, Bookmark | undefined]
  > = [];

  if (book === base) return changed;
  for (const presentation of new Set([
    ...book.marks.keys(),
    ...base.marks.keys(),
  ])) {
    const mine = book.marks.get(presentation);
    const theirs = base.marks.get(presentation);

    if (mine === theirs) continue;
    for (const root of new Set([
      ...(mine?.keys() ?? []),
      ...(theirs?.keys() ?? []),
    ])) {
      const bookmark = mine?.get(root);

      if (bookmark !== theirs?.get(root)) {
        changed.push([presentation, root, bookmark]);
      }
    }
  }

  return changed;
};

export const forEachBookmark = (
  book: CaretBook,
  visit: (presentation: ViewPresentation, bookmark: Bookmark) => void
) => {
  for (const [presentation, byRoot] of book.marks) {
    for (const bookmark of byRoot.values()) visit(presentation, bookmark);
  }
};

const firstTextPath = (children: readonly Descendant[], path: Path) => {
  let nodes = children;
  let node: Descendant | undefined;

  for (const at of path) {
    node = nodes[at];
    nodes = node && !NodeApi.isText(node) ? node.children : [];
  }

  const textPath = [...path];

  while (node && !NodeApi.isText(node)) {
    node = node.children[0];
    textPath.push(0);
  }

  return textPath;
};

const keyPoint = (lens: KeyLens, point: Point): KeyedPoint | null => {
  const key = lens.keyAt(point.path);

  return key === null ? null : { key, offset: point.offset };
};

/**
 * Keys a selection on the document `lens` reads. A node selection keeps
 * `fallback` as the point it becomes once every node it selects is removed.
 */
export const keyBookmark = (
  selection: SelectionValue,
  root: string,
  generation: number,
  lens: KeyLens,
  fallback?: () => Point
): Bookmark | null => {
  if (selection.kind === 'text') {
    const anchor = keyPoint(lens, selection.anchor);
    const focus = keyPoint(lens, selection.focus);

    return anchor && focus
      ? {
          generation,
          root,
          selection: {
            ...(selection.affinity ? { affinity: selection.affinity } : {}),
            anchor,
            focus,
            kind: 'text',
          },
        }
      : null;
  }

  const fallbackPoint = fallback && keyPoint(lens, fallback());
  const anchor = lens.keyAt(selection.anchorPath);
  const focus = lens.keyAt(selection.focusPath);

  if (!fallbackPoint) return null;

  return {
    generation,
    root,
    selection: {
      anchor: anchor ?? fallbackPoint.key,
      fallback: fallbackPoint,
      focus: focus ?? fallbackPoint.key,
      kind: 'node',
      mode: selection.mode,
      nodes: selection.paths.flatMap((path) => lens.keyAt(path) ?? []),
    },
  };
};

export const nodeFallbackPoint =
  (children: () => readonly Descendant[], selection: SelectionValue) =>
  (): Point => ({
    offset: 0,
    path:
      selection.kind === 'node'
        ? firstTextPath(children(), selection.anchorPath)
        : [...selection.anchor.path],
  });

const resolvePoint = (lens: KeyLens, point: KeyedPoint): Point | null => {
  const path = lens.pathOf(point.key);

  return path ? { offset: point.offset, path: [...path] } : null;
};

export const resolveBookmarkFallback = (lens: KeyLens, bookmark: Bookmark) =>
  bookmark.selection.kind === 'node'
    ? resolvePoint(lens, bookmark.selection.fallback)
    : null;

export const resolveBookmark = (
  lens: KeyLens,
  { selection }: Bookmark
): SelectionValue | null => {
  if (selection.kind === 'text') {
    const anchor = resolvePoint(lens, selection.anchor);
    const focus = resolvePoint(lens, selection.focus);

    if (!anchor || !focus) return null;

    return SelectionApi.text(
      { anchor, focus },
      selection.affinity && RangeApi.isCollapsed({ anchor, focus })
        ? { affinity: selection.affinity }
        : {}
    );
  }

  const paths: Path[] = [];

  for (const key of selection.nodes) {
    const path = lens.pathOf(key);

    if (path) paths.push([...path]);
  }

  const [first] = paths;

  if (first) {
    const pathOf = (key: NodeKey) => {
      const path = lens.pathOf(key);

      return path && paths.some((kept) => PathApi.equals(kept, path))
        ? [...path]
        : null;
    };

    return SelectionApi.nodes([first, ...paths.slice(1)], {
      anchorPath: pathOf(selection.anchor) ?? first,
      focusPath: pathOf(selection.focus) ?? paths.at(-1) ?? first,
      mode: paths.length === 1 ? selection.mode : 'block',
    });
  }

  const point = resolvePoint(lens, selection.fallback);

  return point && SelectionApi.text({ anchor: point, focus: point });
};

export type BookStep = Readonly<{
  /** Bookmarks the caller installs after the step, which it does not map. */
  carried?: CarriedCarets;
  /** The document before the step in one root. */
  before: (root: string) => DocumentIndex;
  deletedRoots: Iterable<string>;
  keys: (root: string) => Readonly<{ after: KeyLens; before: KeyLens }>;
  /** Maps a selection in `root` as the step maps the live selection. */
  map: (selection: SelectionValue, root: string) => Selection;
  roots: Iterable<readonly [root: string, change: RootChange]>;
}>;

const collapsed = (point: Point | null) =>
  point && SelectionApi.text({ anchor: point, focus: point });

const mapBookmark = (
  bookmark: Bookmark,
  root: string,
  keys: Readonly<{ after: KeyLens; before: KeyLens }>,
  map: BookStep['map']
): Bookmark | null => {
  const mapOrNull = (selection: SelectionValue | null) =>
    selection && map(selection, root);
  const selection = resolveBookmark(keys.before, bookmark);

  if (!selection) return null;
  if (bookmark.selection.kind === 'text') {
    const mapped =
      mapOrNull(selection) ??
      (selection.kind === 'text'
        ? mapOrNull(collapsed(RangeApi.start(selection)))
        : null);

    return mapped && keyBookmark(mapped, root, bookmark.generation, keys.after);
  }

  const fallback = mapOrNull(
    collapsed(resolveBookmarkFallback(keys.before, bookmark))
  );
  const fallbackPoint = fallback?.kind === 'text' ? fallback.anchor : null;

  if (!fallbackPoint) return null;

  const mapped = selection.kind === 'node' ? mapOrNull(selection) : null;

  return keyBookmark(
    mapped?.kind === 'node'
      ? mapped
      : SelectionApi.text({ anchor: fallbackPoint, focus: fallbackPoint }),
    root,
    bookmark.generation,
    keys.after,
    () => fallbackPoint
  );
};

export const mapBookThroughStep = (
  book: CaretBook,
  step: BookStep
): CaretBook => {
  const writes: BookmarkWrite[] = [];
  const carried = new Set(
    step.carried?.moved.map(({ presentation, root }) =>
      getBookmark(book, presentation, root)
    )
  );

  for (const [root, change] of step.roots) {
    if (!book.nodes.has(root)) continue;

    const before = step.before(root);
    const keys = step.keys(root);
    const touched = new Set<NodeKey>();

    change.iterChangedRanges((fromA, toA) => {
      for (const entry of before.nodeRangesTouching(fromA, toA)) {
        const key = keys.before.keyAt(entry.path);

        if (key !== null) touched.add(key);
      }
    });
    for (const [presentation, bookmark] of bookmarksOn(book, root, touched)) {
      if (carried.has(bookmark)) continue;
      countCoreWork('mappedBookmarks');
      writes.push([
        presentation,
        root,
        mapBookmark(bookmark, root, keys, step.map),
      ]);
    }
  }
  for (const root of step.deletedRoots) writes.push(...rootDrops(book, root));

  return setBookmarks(book, writes);
};

export const settlePlacement = (
  before: CaretState,
  after: CaretState,
  placement: Placement,
  generation: number,
  capture: (
    selection: SelectionValue,
    root: string,
    generation: number
  ) => Bookmark | null
): CaretState => {
  const presentation =
    placement !== 'base' && isViewPresentationRetained(placement)
      ? placement
      : 'base';
  const selected = after.selection !== null;
  const next: CaretPair | null = !selected
    ? null
    : presentation !== 'base'
      ? samePair(before.owner, { presentation, root: after.root })
        ? before.owner
        : { presentation, root: after.root }
      : before.owner?.root === after.root
        ? before.owner
        : null;
  const departing =
    before.owner && !samePair(before.owner, next) ? before.owner : null;
  const writes: BookmarkWrite[] = [];

  if (departing && before.selection && before.root === departing.root) {
    writes.push([
      departing.presentation,
      departing.root,
      capture(before.selection, before.root, before.generation),
    ]);
  }
  if (presentation === 'base' && selected && !next) {
    writes.push(...rootDrops(after.book, after.root));
  }
  if (next) writes.push([next.presentation, next.root, null]);

  return {
    ...after,
    book: setBookmarks(after.book, writes),
    generation,
    owner: next,
  };
};

export const getCommittedCarets = (editor: Editor): Carets =>
  COMMITTED.get(getEditorRuntimeOwner(editor)) ?? NO_CARETS;

const forgetPresentation = (owner: Editor, presentation: ViewPresentation) => {
  const carets = getCommittedCarets(owner);
  const book = setBookmarks(
    carets.book,
    [...(carets.book.marks.get(presentation)?.keys() ?? [])].map(
      (root): BookmarkWrite => [presentation, root, null]
    )
  );

  setCommittedCarets(owner, {
    ...carets,
    book,
    owner: carets.owner?.presentation === presentation ? null : carets.owner,
  });
  WATCHED.get(owner)?.delete(presentation);
};

const watch = (owner: Editor, presentation: ViewPresentation) => {
  let watched = WATCHED.get(owner);

  if (!watched) {
    watched = new Map();
    WATCHED.set(owner, watched);
  }
  if (watched.has(presentation)) return;
  watched.set(
    presentation,
    onPresentationRelease(presentation, () =>
      forgetPresentation(owner, presentation)
    )
  );
};

export const commitCarets = (editor: Editor, carets: Carets) => {
  const owner = getEditorRuntimeOwner(editor);
  const previous = getCommittedCarets(owner);

  if (sameCarets(previous, carets)) return;

  const released: BookmarkWrite[] = [];

  for (const [presentation, root] of changedBookmarks(
    carets.book,
    previous.book
  )) {
    if (isViewPresentationRetained(presentation)) watch(owner, presentation);
    else released.push([presentation, root, null]);
  }

  const book = setBookmarks(carets.book, released);

  const pair =
    carets.owner && isViewPresentationRetained(carets.owner.presentation)
      ? carets.owner
      : null;

  if (pair) watch(owner, pair.presentation);
  setCommittedCarets(owner, {
    book,
    generation: carets.generation,
    owner: pair,
  });
};

export const sameCarets = (left: Carets, right: Carets) =>
  left.book === right.book &&
  left.generation === right.generation &&
  samePair(left.owner, right.owner);

const caretsOf = ({ book, generation, owner }: Carets): Carets => ({
  book,
  generation,
  owner,
});

export const recordCommitCarets = (
  commit: EditorCommit,
  before: Carets,
  after: Carets
) => {
  COMMIT_CARETS.set(commit, {
    after: caretsOf(after),
    before: caretsOf(before),
  });
};

export const consumeCommitCarets = (commit: EditorCommit) => {
  const carets = COMMIT_CARETS.get(commit);

  COMMIT_CARETS.delete(commit);

  return carets &&
    (carets.before.owner ||
      carets.after.owner ||
      carets.before.book.marks.size > 0 ||
      carets.after.book.marks.size > 0)
    ? carets
    : undefined;
};

/**
 * After a history replay, gives each view the caret it had at the edge the
 * replay returns to, unless it placed one since the edge the replay leaves,
 * which its generation shows. The view holding the live caret keeps it.
 */
export const restoreHistoryCarets = (
  editor: Editor,
  views: readonly HistoryCaretView[],
  target: 'after' | 'before'
) => {
  const owner = getEditorRuntimeOwner(editor);
  const { caret } = getDefined(getTransactionSpecContext(owner));
  const value = () => getEditorDocumentValue(owner);
  const writes: BookmarkWrite[] = [];

  for (const view of views) {
    const { presentation, root } = view;
    const left = target === 'before' ? view.after : view.before;
    const to = view[target];

    if (
      !isViewPresentationRetained(presentation) ||
      samePair(caret.owner, { presentation, root }) ||
      (getBookmark(caret.book, presentation, root)?.generation ?? null) !==
        (left?.generation ?? null)
    ) {
      continue;
    }

    const bookmark =
      to?.selection &&
      keyInDraft(owner, value, to.selection, root, to.generation);

    if (to && !bookmark) continue;
    writes.push([presentation, root, bookmark ?? null]);
  }

  const book = setBookmarks(caret.book, writes);

  if (book !== caret.book) setDraftCaret(owner, { ...caret, book });
};

/**
 * Runs `fn` with the selection writes of the current draft credited to
 * `placement`, as a view's own writes are wherever they run. With `null` they
 * place nothing, as a repair restoring a selection must not, and a view's
 * write inside a repair places nothing either.
 */
export const withPlacement = <T>(
  editor: Editor,
  placement: Placement | null,
  fn: () => T
): T => {
  const owner = getEditorRuntimeOwner(editor);
  const previous = SCOPED_PLACEMENTS.get(owner);

  SCOPED_PLACEMENTS.set(owner, {
    context: getTransactionSpecContext(owner),
    placement: currentPlacement(owner) === null ? null : placement,
  });
  try {
    return fn();
  } finally {
    if (previous === undefined) SCOPED_PLACEMENTS.delete(owner);
    else SCOPED_PLACEMENTS.set(owner, previous);
  }
};

export const withViewPlacement = <T>(view: Editor, fn: () => T): T =>
  withPlacement(view, getOwnViewPresentation(view) ?? 'base', fn);

export const withoutPlacement = <T>(editor: Editor, fn: () => T): T =>
  withPlacement(editor, null, fn);

export const currentPlacement = (editor: Editor): Placement | null => {
  const owner = getEditorRuntimeOwner(editor);
  const context = getTransactionSpecContext(owner);
  const scoped = SCOPED_PLACEMENTS.get(owner);

  return scoped && scoped.context === context
    ? scoped.placement
    : context
      ? context.placement
      : 'base';
};

const draftLens = (editor: Editor, root: string): KeyLens =>
  retainTransactionSnapshotIndex(
    editor,
    getDefined(getTransactionSnapshot(editor)),
    root
  );

const keyInDraft = (
  editor: Editor,
  value: () => EditorDocumentValue,
  selection: SelectionValue,
  root: string,
  generation: number
) =>
  keyBookmark(
    selection,
    root,
    generation,
    draftLens(editor, root),
    nodeFallbackPoint(rootChildrenOf(value, root), selection)
  );

/**
 * Settles one selection write in the current draft, from `before` to `after`,
 * with the departing caret keyed in `value`, the document it sits in. A write
 * that places nothing returns `null`.
 */
export const placeInDraft = (
  editor: Editor,
  before: CaretState,
  after: CaretState,
  value: () => EditorDocumentValue
): CaretState | null => {
  const placement = currentPlacement(editor);

  if (placement === null) return null;

  const owner = getEditorRuntimeOwner(editor);
  const generation = nextMintedGeneration(owner);

  HIGHEST_MINTED.set(owner, generation);

  return settlePlacement(
    before,
    after,
    placement,
    generation,
    (selection, root, departed) =>
      keyInDraft(editor, value, selection, root, departed)
  );
};

export const carryCarets = (
  editor: Editor,
  base: Carets,
  carets: Carets,
  lens: (root: string) => KeyLens = (root) => draftLens(editor, root)
): CarriedCarets | null =>
  sameCarets(base, carets)
    ? null
    : {
        generation: carets.generation,
        moved: changedBookmarks(carets.book, base.book).map(
          ([presentation, root, bookmark]) => ({
            generation: bookmark?.generation ?? 0,
            presentation,
            root,
            selection: bookmark ? resolveBookmark(lens(root), bookmark) : null,
          })
        ),
        owner: carets.owner,
      };

export const landCarets = (
  editor: Editor,
  caret: CaretState,
  carried: CarriedCarets
): CaretState => {
  const value = () => getEditorDocumentValue(editor);
  const book = setBookmarks(
    caret.book,
    carried.moved.map(
      ({ generation, presentation, root, selection }): BookmarkWrite => [
        presentation,
        root,
        selection && keyInDraft(editor, value, selection, root, generation),
      ]
    )
  );

  return {
    ...caret,
    book,
    generation: carried.generation,
    owner: carried.owner,
  };
};

const toOwner = (pair: CaretPair | null): CaretOwner | null =>
  pair && { presentation: pair.presentation, root: toPublicRoot(pair.root) };

export const getCaretOwner = (editor: Editor): CaretOwner | null => {
  const owner = getEditorRuntimeOwner(editor);
  const context = getTransactionSpecContext(owner);

  return toOwner(
    context ? context.caret.owner : getCommittedCarets(owner).owner
  );
};

export const holdsCaretAt = (view: Editor, target: Range) => {
  const owner = getCaretOwner(view);
  const live = resolveLiveCaret(view);
  const same = (left: Point, right: Point) =>
    left.offset === right.offset && PathApi.equals(left.path, right.path);

  return (
    !!owner &&
    owner.presentation === getOwnViewPresentation(view) &&
    toInternalRoot(owner.root) ===
      toInternalRoot(SelectionApi.root(target) ?? view.read.view.root()) &&
    RangeApi.isRange(live) &&
    same(live.anchor, target.anchor) &&
    same(live.focus, target.focus)
  );
};

export const draftCreditsOwner = (editor: Editor) => {
  const context = getTransactionSpecContext(getEditorRuntimeOwner(editor));
  const owner = context?.caret.owner;

  return (
    !!owner &&
    owner.presentation === currentPlacement(editor) &&
    owner.root === context.caret.root
  );
};

export const holdsCaret = (view: Editor) => {
  const owner = getCaretOwner(view);

  return (
    !!owner &&
    owner.presentation === getOwnViewPresentation(view) &&
    toInternalRoot(owner.root) === toInternalRoot(view.read.view.root())
  );
};

export const mayClearCaret = (view: Editor) =>
  !getCaretOwner(view) || holdsCaret(view);

const committedLens = (owner: Editor, root: string): KeyLens => ({
  keyAt: (path) =>
    withEditorRootChildren(owner, root, () =>
      getEditorRuntime(owner).getNodeKey(path)
    ),
  pathOf: (key) =>
    withEditorRootChildren(owner, root, () =>
      getEditorRuntime(owner).getPathByNodeKey(key)
    ),
});

export const rootChildrenOf =
  (value: () => EditorDocumentValue, root: string) =>
  (): readonly Descendant[] =>
    root === MAIN_ROOT_KEY ? value().children : (value().roots?.[root] ?? []);

const rooted = (selection: Selection, root: string): Selection => {
  const named = toPublicRoot(root);

  if (!named || !selection) return selection;
  if (SelectionApi.isNode(selection)) return { ...selection, root: named };

  return {
    ...selection,
    anchor: { ...selection.anchor, root: named },
    focus: { ...selection.focus, root: named },
  };
};

export const resolveParkedCaret = (view: Editor): Selection => {
  const owner = getEditorRuntimeOwner(view);
  const presentation = getOwnViewPresentation(view);
  const root = toInternalRoot(view.read.view.root());
  const bookmark =
    presentation &&
    getBookmark(getCommittedCarets(owner).book, presentation, root);

  if (!bookmark) return null;

  return rooted(resolveBookmark(committedLens(owner, root), bookmark), root);
};

export const keepBookmark = (
  view: Editor,
  selection: SelectionValue,
  receipt: number,
  gestureLastKeep: number | null
) => {
  const owner = getEditorRuntimeOwner(view);
  const presentation = getOwnViewPresentation(view);

  if (
    !presentation ||
    !isViewPresentationRetained(presentation) ||
    getActiveEditorTransaction(owner) ||
    holdsCaret(view)
  ) {
    return null;
  }

  const root = toInternalRoot(view.read.view.root());
  const carets = getCommittedCarets(owner);
  const current = getBookmark(carets.book, presentation, root);

  if (
    current &&
    current.generation > receipt &&
    (gestureLastKeep === null || current.generation > gestureLastKeep)
  ) {
    return null;
  }

  const bookmark = keyBookmark(
    selection,
    root,
    carets.generation,
    committedLens(owner, root)
  );

  if (!bookmark) return null;
  commitCarets(owner, {
    ...carets,
    book: setBookmarks(carets.book, [[presentation, root, bookmark]]),
  });
  invalidateEditorTransactionSpecs(owner);

  return carets.generation;
};

export const resolveLiveCaret = (view: Editor): Selection => {
  const owner = getEditorRuntimeOwner(view);

  return rooted(getCurrentSelection(owner), getCurrentSelectionRoot(owner));
};

export const getPlacementGeneration = (editor: EditorRuntimeCarrier) => {
  const owner = getEditorRuntimeOwner(editor);

  return (
    getTransactionSpecContext(owner)?.caret.generation ??
    getCommittedCarets(owner).generation
  );
};

export const nextMintedGeneration = (editor: EditorRuntimeCarrier) =>
  (HIGHEST_MINTED.get(getEditorRuntimeOwner(editor)) ?? 0) + 1;

export const placedSince = (editor: EditorRuntimeCarrier, receipt: number) =>
  getPlacementGeneration(editor) > receipt;

/**
 * Places `target` as `view`'s own selection: rootless points resolve in the
 * view's root, the view's authored scope applies, and the write credits the
 * view, inside another view's update too.
 */
export const setSelectionAsView = (
  view: Editor,
  target: EditorSelectionTarget | null
) => {
  const owner = getEditorRuntimeOwner(view);
  const transaction = getActiveEditorTransaction(owner);

  if (!transaction && !view.read.view.isReadOnly()) {
    view.update((tx) => {
      tx.selection.set(target);
    });
    return;
  }
  withAuthoredUpdateView(owner, view, () =>
    withEditorUpdateRootScope(owner, view.read.view.root(), () => {
      if (transaction) {
        withViewPlacement(view, () => transaction.selection.set(target));
        return;
      }
      getEditorRuntime(owner).update(
        (tx) => {
          tx.selection.set(target);
        },
        { placement: getOwnViewPresentation(view) }
      );
    })
  );
};

export const setShownSelectionAsView = (
  view: Editor,
  shown: EditorSelectionTarget | null
) => {
  const lifted = shown && toStoredTarget(view, shown);

  setSelectionAsView(view, lifted?.kind === 'stored' ? lifted.target : null);
};

export const clearCaretUnlessHeldElsewhere = (view: Editor) => {
  if (mayClearCaret(view)) setSelectionAsView(view, null);
};
