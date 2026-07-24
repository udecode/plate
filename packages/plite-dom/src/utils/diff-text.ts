import {
  type Descendant,
  type DocumentChange,
  type EditorDocumentValue,
  NodeApi,
  type Path,
  PathApi,
  type Point,
  type Range,
  RangeApi,
  type Editor as EditorType,
} from '@platejs/plite';
import {
  above as editorAbove,
  hasInternalDocumentChangeRoot,
  hasPath as editorHasPath,
  isBlock as editorIsBlock,
  MAIN_ROOT_KEY,
  mapInternalDocumentChangePoint,
  next as editorNext,
  toInternalRoot,
} from '@platejs/plite/internal';
import { EDITOR_TO_PENDING_DIFFS } from './weak-maps';

export type StringDiff = {
  start: number;
  end: number;
  text: string;
};

export type TextDiff = {
  id: number;
  path: Path;
  diff: StringDiff;
};

const getPendingDiffRoot = (editor?: EditorType<any>) =>
  editor?.read((state) => state.view.root()) ?? MAIN_ROOT_KEY;

/**
 * Check whether a text diff was applied in a way we can perform the pending action on /
 * recover the pending selection.
 */
export function verifyDiffState(
  editor: EditorType<any>,
  textDiff: TextDiff
): boolean {
  const { path, diff } = textDiff;
  if (!editorHasPath(editor, path)) {
    return false;
  }

  const node = NodeApi.get(editor, path);
  if (!NodeApi.isText(node)) {
    return false;
  }

  if (diff.start !== node.text.length || diff.text.length === 0) {
    return (
      node.text.slice(diff.start, diff.start + diff.text.length) === diff.text
    );
  }

  const nextPath = PathApi.next(path);
  if (!editorHasPath(editor, nextPath)) {
    return false;
  }

  const nextNode = NodeApi.get(editor, nextPath);
  return NodeApi.isText(nextNode) && nextNode.text.startsWith(diff.text);
}

/** Apply one or more string diffs to a text value in order. */
export function applyStringDiff(text: string, ...diffs: StringDiff[]) {
  return diffs.reduce(
    (text, diff) =>
      text.slice(0, diff.start) + diff.text + text.slice(diff.end),
    text
  );
}

function longestCommonPrefixLength(str: string, another: string) {
  const length = Math.min(str.length, another.length);

  for (let i = 0; i < length; i++) {
    if (str.charAt(i) !== another.charAt(i)) {
      return i;
    }
  }

  return length;
}

function longestCommonSuffixLength(
  str: string,
  another: string,
  max: number
): number {
  const length = Math.min(str.length, another.length, max);

  for (let i = 0; i < length; i++) {
    if (str.at(-i - 1) !== another.at(-i - 1)) {
      return i;
    }
  }

  return length;
}

/**
 * Remove redundant changes from the diff so that it spans the minimal possible range
 */
export function normalizeStringDiff(targetText: string, diff: StringDiff) {
  const { start, end, text } = diff;
  const removedText = targetText.slice(start, end);

  const prefixLength = longestCommonPrefixLength(removedText, text);
  const max = Math.min(
    removedText.length - prefixLength,
    text.length - prefixLength
  );
  const suffixLength = longestCommonSuffixLength(removedText, text, max);

  const normalized: StringDiff = {
    start: start + prefixLength,
    end: end - suffixLength,
    text: text.slice(prefixLength, text.length - suffixLength),
  };

  if (normalized.start === normalized.end && normalized.text.length === 0) {
    return null;
  }

  return normalized;
}

/**
 * Return a string diff that is equivalent to applying b after a spanning the range of
 * both changes
 */
export function mergeStringDiffs(
  targetText: string,
  a: StringDiff,
  b: StringDiff
): StringDiff | null {
  const start = Math.min(a.start, b.start);
  const overlap = Math.max(
    0,
    Math.min(a.start + a.text.length, b.end) - b.start
  );

  const applied = applyStringDiff(targetText, a, b);
  const sliceEnd = Math.max(
    b.start + b.text.length,
    a.start +
      a.text.length +
      (a.start + a.text.length > b.start ? b.text.length : 0) -
      overlap
  );

  const text = applied.slice(start, sliceEnd);
  const end = Math.max(a.end, b.end - a.text.length + (a.end - a.start));
  return normalizeStringDiff(targetText, { start, end, text });
}

/**
 * Get the Plite range the text diff spans.
 */
export function targetRange(textDiff: TextDiff): Range {
  const { path, diff } = textDiff;
  return {
    anchor: { path, offset: diff.start },
    focus: { path, offset: diff.end },
  };
}

/**
 * Normalize a 'pending point' a.k.a a point based on the dom state before applying
 * the pending diffs. Since the pending diffs might have been inserted with different
 * marks we have to 'walk' the offset from the starting position to ensure we still
 * have a valid point inside the document
 */
export function normalizePoint(
  editor: EditorType<any>,
  point: Point
): Point | null {
  let { path, offset } = point;
  if (!editorHasPath(editor, path)) {
    return null;
  }

  let leaf = NodeApi.get(editor, path);
  if (!NodeApi.isText(leaf)) {
    return null;
  }

  const parentBlock = editorAbove(editor, {
    match: (n) => NodeApi.isElement(n) && editorIsBlock(editor, n),
    at: path,
  });

  if (!parentBlock) {
    return null;
  }

  while (offset > leaf.text.length) {
    const entry = editorNext(editor, { at: path, match: NodeApi.isText });
    if (!entry || !PathApi.isDescendant(entry[1], parentBlock[1])) {
      return null;
    }

    offset -= leaf.text.length;
    leaf = entry[0];
    path = entry[1];
  }

  return { path, offset };
}

/**
 * Normalize a 'pending selection' to ensure it's valid in the current document model.
 */
export function normalizeRange(
  editor: EditorType<any>,
  range: Range
): Range | null {
  const anchor = normalizePoint(editor, range.anchor);
  if (!anchor) {
    return null;
  }

  if (RangeApi.isCollapsed(range)) {
    return { anchor, focus: anchor };
  }

  const focus = normalizePoint(editor, range.focus);
  if (!focus) {
    return null;
  }

  return { anchor, focus };
}

const getPendingPointRoot = (editor: EditorType<any>, point: Point) =>
  toInternalRoot(point.root ?? editor.read((state) => state.view.root()));

const stripImplicitPendingPointRoot = (
  point: Point | null,
  original: Point
): Point | null => {
  if (!point || original.root !== undefined || point.root === undefined) {
    return point;
  }

  const { root: _root, ...pointWithoutRoot } = point;

  return pointWithoutRoot;
};

export type PendingDocumentChange = Readonly<{
  after: EditorDocumentValue;
  before: EditorDocumentValue;
  change: DocumentChange;
}>;

const rootChildren = (value: EditorDocumentValue, root: string) =>
  root === MAIN_ROOT_KEY ? value.children : (value.roots?.[root] ?? []);

const nodeAt = (
  children: readonly Descendant[],
  path: readonly number[]
): Descendant | null => {
  let descendants = children;
  let node: Descendant | undefined;

  for (const index of path) {
    node = descendants[index];
    if (!node) return null;
    descendants = NodeApi.isElement(node) ? node.children : [];
  }

  return node ?? null;
};

const mapPointThroughChange = (
  editor: EditorType<any>,
  point: Point,
  context: PendingDocumentChange,
  association: -1 | 1
): Point | null => {
  const root = getPendingPointRoot(editor, point);

  if (context.change.deleteRoots.has(root)) return null;
  if (!hasInternalDocumentChangeRoot(context.change, root)) return point;

  const next = mapInternalDocumentChangePoint(
    context.change,
    context.before,
    context.after,
    root,
    { offset: point.offset, path: point.path },
    association
  );

  if (!next) return null;

  const mappedPoint = {
    offset: next.offset,
    path: [...next.path] as Path,
  };

  return point.root === undefined && root === MAIN_ROOT_KEY
    ? mappedPoint
    : { ...mappedPoint, root };
};

export function transformPendingPoint(
  editor: EditorType<any>,
  point: Point,
  context: PendingDocumentChange
): Point | null {
  const pendingDiffs = EDITOR_TO_PENDING_DIFFS.get(editor);
  const textDiff = pendingDiffs?.find(({ path }) =>
    PathApi.equals(path, point.path)
  );

  if (!textDiff || point.offset <= textDiff.diff.start) {
    return stripImplicitPendingPointRoot(
      mapPointThroughChange(editor, point, context, -1),
      point
    );
  }

  const { diff } = textDiff;
  // Point references location inside the diff => transform the point based on the location
  // the diff will be applied to and add the offset inside the diff.
  if (point.offset <= diff.start + diff.text.length) {
    const anchor = {
      path: point.path,
      offset: diff.start,
      ...(point.root === undefined ? {} : { root: point.root }),
    };
    const transformed = mapPointThroughChange(editor, anchor, context, -1);

    if (!transformed) {
      return null;
    }

    return stripImplicitPendingPointRoot(
      {
        ...transformed,
        offset: transformed.offset + point.offset - diff.start,
      },
      point
    );
  }

  // Point references location after the diff
  const anchor = {
    path: point.path,
    offset: point.offset - diff.text.length + diff.end - diff.start,
    ...(point.root === undefined ? {} : { root: point.root }),
  };
  const transformed = mapPointThroughChange(editor, anchor, context, -1);
  if (!transformed) {
    return null;
  }

  return stripImplicitPendingPointRoot(
    {
      ...transformed,
      offset: transformed.offset + diff.text.length - diff.end + diff.start,
    },
    point
  );
}

export function transformPendingRange(
  editor: EditorType<any>,
  range: Range,
  context: PendingDocumentChange
): Range | null {
  const anchor = transformPendingPoint(editor, range.anchor, context);
  if (!anchor) {
    return null;
  }

  if (RangeApi.isCollapsed(range)) {
    return { anchor, focus: anchor };
  }

  const focus = transformPendingPoint(editor, range.focus, context);
  if (!focus) {
    return null;
  }

  return { anchor, focus };
}

export function transformTextDiff(
  textDiff: TextDiff,
  context: PendingDocumentChange,
  editor?: EditorType<any>
): TextDiff | null {
  const { path, diff, id } = textDiff;
  const root = getPendingDiffRoot(editor);

  if (!hasInternalDocumentChangeRoot(context.change, root)) {
    return textDiff;
  }
  if (!editor) return null;

  const start = mapPointThroughChange(
    editor,
    { offset: diff.start, path },
    context,
    1
  );
  const end = mapPointThroughChange(
    editor,
    { offset: diff.end, path },
    context,
    1
  );

  if (!start || !end) return null;

  if (PathApi.equals(start.path, end.path)) {
    return {
      diff: { start: start.offset, end: end.offset, text: diff.text },
      id,
      path: start.path,
    };
  }

  const startNode = nodeAt(rootChildren(context.after, root), start.path);

  if (!NodeApi.isText(startNode)) return null;

  return {
    diff: {
      start: start.offset,
      end: startNode.text.length,
      text: diff.text,
    },
    id,
    path: start.path,
  };
}
