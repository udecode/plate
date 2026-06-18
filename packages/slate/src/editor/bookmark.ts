import { getEditorOperationRoot } from '../core/public-state';
import type {
  Bookmark,
  BookmarkAffinity,
  BookmarkOptions,
} from '../interfaces/bookmark';
import type { Editor } from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import { NodeApi } from '../interfaces/node';
import type { Operation } from '../interfaces/operation';
import type { Path } from '../interfaces/path';
import { PathApi } from '../interfaces/path';
import { type Point, PointApi } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import {
  getOperationRoot,
  getRangeRoot,
  type RangeRootMeta,
  stripImplicitRangeRoots,
  withImplicitRangeRoot,
} from '../internal/root-location';

type InternalBookmark = {
  affinity: BookmarkAffinity;
  current: Range | null;
  rootMeta: RangeRootMeta;
};

const BOOKMARKS = new WeakMap<Editor, Set<InternalBookmark>>();

const getBookmarks = (editor: Editor) => {
  let bookmarks = BOOKMARKS.get(editor);

  if (!bookmarks) {
    bookmarks = new Set();
    BOOKMARKS.set(editor, bookmarks);
  }

  return bookmarks;
};

const clonePoint = (point: Point): Point => {
  const clone = {
    path: [...point.path],
    offset: point.offset,
  };

  return point.root === undefined ? clone : { ...clone, root: point.root };
};

const cloneRange = (range: Range | null) =>
  range
    ? {
        anchor: clonePoint(range.anchor),
        focus: clonePoint(range.focus),
      }
    : null;

type TextLeafEntry = {
  path: Path;
  text: string;
};

const collectTextLeaves = (
  children: readonly Descendant[],
  pathPrefix: Path = []
): TextLeafEntry[] =>
  Array.from(NodeApi.texts({ children } as never), ([node, path]) => ({
    path: pathPrefix.concat(path),
    text: node.text,
  }));

const getReplaceChildrenPointRelativePath = (
  op: Extract<Operation, { type: 'replace_children' }>,
  point: Point
) => {
  if (!PathApi.isAncestor(op.path, point.path)) {
    return null;
  }

  const childIndex = point.path[op.path.length];

  if (
    childIndex == null ||
    childIndex < op.index ||
    childIndex >= op.index + op.children.length
  ) {
    return null;
  }

  return [childIndex - op.index, ...point.path.slice(op.path.length + 1)];
};

const mapPointBySurvivingText = (
  op: Extract<Operation, { type: 'replace_children' }>,
  relativePath: Path,
  offset: number
): Point | null => {
  const oldNode = NodeApi.getIf(
    { children: op.children } as never,
    relativePath
  );

  if (!oldNode || !NodeApi.isText(oldNode) || oldNode.text.length === 0) {
    return null;
  }

  const matches: Point[] = [];

  collectTextLeaves(op.newChildren).forEach((leaf) => {
    const [relativeChildIndex = 0, ...childPath] = leaf.path;
    const path = op.path.concat(op.index + relativeChildIndex, childPath);

    let searchFrom = 0;

    while (searchFrom <= leaf.text.length) {
      const index = leaf.text.indexOf(oldNode.text, searchFrom);

      if (index === -1) {
        break;
      }

      matches.push({
        path,
        offset: index + offset,
      });
      searchFrom = index + Math.max(oldNode.text.length, 1);
    }
  });

  return matches.length === 1 ? matches[0]! : null;
};

const mapPointBySameRelativePosition = (
  op: Extract<Operation, { type: 'replace_children' }>,
  relativePath: Path,
  offset: number
): Point | null => {
  const newNode = NodeApi.getIf(
    { children: op.newChildren } as never,
    relativePath
  );

  if (!newNode || !NodeApi.isText(newNode) || offset > newNode.text.length) {
    return null;
  }

  const [relativeChildIndex = 0, ...childPath] = relativePath;

  return {
    path: op.path.concat(op.index + relativeChildIndex, childPath),
    offset,
  };
};

const preserveMappedPointRoot = (
  source: Point,
  mapped: Point | null
): Point | null =>
  mapped && source.root !== undefined
    ? { ...mapped, root: source.root }
    : mapped;

const transformPointThroughReplaceChildren = (
  point: Point,
  op: Extract<Operation, { type: 'replace_children' }>,
  affinity: 'forward' | 'backward' | null
): Point | null => {
  const relativePath = getReplaceChildrenPointRelativePath(op, point);

  if (!relativePath) {
    return PointApi.transform(point, op, { affinity });
  }

  return preserveMappedPointRoot(
    point,
    mapPointBySurvivingText(op, relativePath, point.offset) ??
      mapPointBySameRelativePosition(op, relativePath, point.offset)
  );
};

const transformBookmarkRange = (
  range: Range,
  op: Operation,
  affinity: BookmarkAffinity,
  rootMeta: RangeRootMeta
): Range | null => {
  const { root } = rootMeta;

  if (root && root !== getOperationRoot(op)) {
    return range;
  }

  const transformRange = root ? withImplicitRangeRoot(range, root) : range;

  if (op.type !== 'replace_children') {
    const next = RangeApi.transform(transformRange, op, { affinity });

    return next ? stripImplicitRangeRoots(next, rootMeta) : null;
  }

  let affinityAnchor: 'forward' | 'backward' | null;
  let affinityFocus: 'forward' | 'backward' | null;

  if (affinity === 'inward') {
    const isCollapsed = RangeApi.isCollapsed(transformRange);

    if (RangeApi.isForward(transformRange)) {
      affinityAnchor = 'forward';
      affinityFocus = isCollapsed ? affinityAnchor : 'backward';
    } else {
      affinityAnchor = 'backward';
      affinityFocus = isCollapsed ? affinityAnchor : 'forward';
    }
  } else {
    affinityAnchor = affinity;
    affinityFocus = affinity;
  }

  const anchor = transformPointThroughReplaceChildren(
    transformRange.anchor,
    op,
    affinityAnchor
  );
  const focus = transformPointThroughReplaceChildren(
    transformRange.focus,
    op,
    affinityFocus
  );

  const next = anchor && focus ? { anchor, focus } : null;

  return next ? stripImplicitRangeRoots(next, rootMeta) : null;
};

export const bookmark = (
  editor: Editor,
  range: Range,
  options: BookmarkOptions = {}
): Bookmark => {
  const affinity = options.affinity ?? 'inward';
  const rootMeta = getRangeRoot(range, getEditorOperationRoot(editor));

  if (!rootMeta.root) {
    throw new Error('Cannot create a Slate bookmark across multiple roots.');
  }

  const state: InternalBookmark = {
    affinity,
    current: cloneRange(range),
    rootMeta,
  };

  const bookmarkValue: Bookmark = {
    affinity,
    resolve() {
      const latest = cloneRange(state.current);

      if (latest == null) {
        getBookmarks(editor).delete(state);
      }

      return latest;
    },
    unref() {
      getBookmarks(editor).delete(state);
      const latest = cloneRange(state.current);
      state.current = null;
      return latest;
    },
  };

  getBookmarks(editor).add(state);

  return bookmarkValue;
};

export const transformBookmarks = (editor: Editor, op: Operation) => {
  const bookmarks = BOOKMARKS.get(editor);

  if (!bookmarks) {
    return;
  }

  for (const bookmarkState of bookmarks) {
    if (bookmarkState.current == null) {
      bookmarks.delete(bookmarkState);
      continue;
    }

    const next = transformBookmarkRange(
      bookmarkState.current,
      op,
      bookmarkState.affinity,
      bookmarkState.rootMeta
    );

    bookmarkState.current = next;

    if (next == null) {
      bookmarks.delete(bookmarkState);
    }
  }
};
