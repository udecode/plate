import {
  type EditorCommit,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  type RootKey,
  type Selection,
  SelectionApi,
} from '..';
import { getEditorCommitSnapshot, getEditorCommitValue } from '../core/commit';
import { toInternalRoot } from '../core/public-root';
import { mapSelectionThroughChange } from '../core/selection-protocol';
import {
  type AnyEditor,
  getNodeKey as editorGetNodeKey,
} from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import { findMountedDOMNodeByPath } from './plugin/dom-node-path';
import {
  drawsUnownedHostText,
  getKeyHosts,
  getTextRoot,
} from './plugin/dom-text-freshness';
import { isDOMTextPainted } from './plugin/dom-text-proofs';
import {
  type DOMPoint,
  getSelection,
  isDOMElement,
  isDOMText,
} from './utils/dom';
import { readDOMSelectionPoints } from './utils/selection-writes';

/**
 * The slice attribute a paged layout sets on the run that ends a measured
 * line whose text wraps on, not at an authored newline.
 */
export const SOFT_LINE_FLAG = 'data-pagination-native-flow-break';

/** The `data-editor-render-only` value of an editable view's soft line end. */
export const SOFT_LINE_END = 'soft-line-end';

export const SOFT_LINE_END_SELECTOR = `[data-editor-render-only="${SOFT_LINE_END}"]`;

/**
 * Marks a non-editable inset, such as the non-breaking space Plate renders at
 * an inline edge, that a soft line end's walk crosses.
 */
export const INSET_ATTRIBUTE = 'data-editor-inset';

const SHELL_SELECTOR = '[data-editor-render-only="container"]';

export type SoftLineSide = 'lower' | 'upper';

export type SoftLineEndDOMPoint = Readonly<{
  /** The string boundary the point maps to. */
  point: DOMPoint;
  /** Which line of a soft line end the point sits on, when it sits at one. */
  side?: SoftLineSide;
  /** The lower string's start at that soft line end. */
  lower?: DOMPoint;
  /** The upper string's end at that soft line end. */
  upper?: DOMPoint;
}>;

type Stop = Element | Text;

const isMarker = (node: Node): node is Element =>
  isDOMElement(node) && node.matches(SOFT_LINE_END_SELECTOR);

const authoredString = (node: Node) => {
  if (!isDOMText(node) || node.data === '') return null;
  const string = node.parentElement?.closest('[data-editor-string]');

  return string && !string.hasAttribute('data-editor-zero-width')
    ? string
    : null;
};

const isStop = (node: Node): node is Stop =>
  isMarker(node) || authoredString(node) !== null;

const isBarrier = (node: Node): boolean =>
  isDOMElement(node) &&
  node.matches('[contenteditable="false"], [data-editor-void]') &&
  !node.hasAttribute(INSET_ATTRIBUTE) &&
  !isMarker(node);

const isVoid = (node: Node) =>
  isDOMElement(node) && node.hasAttribute('data-editor-void');

const isZeroWidthText = (node: Node): node is Text =>
  isDOMText(node) &&
  node.parentElement?.closest('[data-editor-zero-width]') != null;

const textEnd = (text: Text): DOMPoint => {
  const length = authoredString(text)?.getAttribute('data-editor-length');

  return [
    text,
    length == null
      ? text.data.length
      : Math.min(text.data.length, Number(length)),
  ];
};

const afterSubtree = (node: Node, scope: Node): Node | null => {
  for (let current: Node | null = node; current && current !== scope;) {
    if (current.nextSibling) return current.nextSibling;
    current = current.parentNode;
  }
  return null;
};

const firstStopFrom = (node: Node | null, scope: Node): Stop | null => {
  for (let current = node; current;) {
    if (isBarrier(current)) return null;
    if (isStop(current)) return current;
    current = current.firstChild ?? afterSubtree(current, scope);
  }
  return null;
};

const lastDescendant = (node: Node) => {
  let last = node;

  while (last.lastChild && !isBarrier(last)) last = last.lastChild;
  return last;
};

const lowerStopAfter = (marker: Element, scope: Node): Stop | null => {
  const previous =
    marker.previousSibling && lastDescendant(marker.previousSibling);
  let zeroWidthBeforeVoid =
    previous && isZeroWidthText(previous) ? previous : null;

  for (let current = afterSubtree(marker, scope); current;) {
    if (isBarrier(current)) return isVoid(current) ? zeroWidthBeforeVoid : null;
    if (isStop(current)) return current;
    if (isZeroWidthText(current)) zeroWidthBeforeVoid = current;
    current = current.firstChild ?? afterSubtree(current, scope);
  }
  return null;
};

const lastStopBefore = (node: Node, scope: Node): Stop | null => {
  for (let current: Node | null = node; current && current !== scope;) {
    const previous: Node | null = current.previousSibling;

    if (previous) {
      current = lastDescendant(previous);
    } else {
      current = current.parentNode;
      if (current === scope) return null;
    }
    if (current && isBarrier(current)) return null;
    if (current && isStop(current)) return current;
  }
  return null;
};

const lastStopThrough = (node: Node, scope: Node) => {
  const last = lastDescendant(node);

  if (last !== node && isBarrier(last)) return null;
  return isStop(last) ? last : lastStopBefore(last, scope);
};

const insideBarrier = (element: Element, scope: Element) => {
  for (
    let current: Element | null = element;
    current && current !== scope;
    current = current.parentElement
  ) {
    if (isBarrier(current)) return true;
  }
  return false;
};

const softLineBlockOf = (element: Element) => {
  let block = element.closest('[data-editor-node="element"]');

  while (block?.getAttribute('data-editor-inline') === 'true') {
    block =
      block.parentElement?.closest('[data-editor-node="element"]') ?? null;
  }
  return block ?? element.closest('[data-editor="true"]');
};

const isPagedHostOrShell = (element: Element) =>
  element.matches(SHELL_SELECTOR) ||
  (element.matches('[data-editor-node="text"]') &&
    element.querySelector(`:scope > ${SHELL_SELECTOR}`) !== null);

/**
 * Maps a DOM point beside a soft line end, or on a paged text host or shell,
 * to the adjacent string boundary. A point after a soft line end, also inside
 * an inset or at an element edge with no authored character between, maps to
 * the next string's start on the lower line; one before it maps to the upper
 * string's end. Returns null for every other point, so views without soft
 * line ends keep their mapping.
 */
export const resolveSoftLineEndDOMPoint = ([
  node,
  offset,
]: DOMPoint): SoftLineEndDOMPoint | null => {
  const element = isDOMElement(node) ? node : node.parentElement;

  if (!element) return null;
  const authored = authoredString(node) !== null;

  if (authored && offset > 0 && offset < textEnd(node as Text)[1]) {
    return null;
  }
  const scope = softLineBlockOf(element);

  if (!scope || insideBarrier(element, scope)) return null;
  const hostOrShell = isDOMElement(node) && isPagedHostOrShell(node);

  if (!hostOrShell && !scope.querySelector(SOFT_LINE_END_SELECTOR)) {
    return null;
  }
  let before: Stop | null;
  let after: Stop | null;

  if (isMarker(node)) {
    before = lastStopBefore(node, scope);
    after = node;
  } else if (isDOMText(node)) {
    before = authored && offset > 0 ? node : lastStopBefore(node, scope);
    after =
      authored && offset === 0
        ? node
        : firstStopFrom(afterSubtree(node, scope), scope);
  } else {
    const child = node.childNodes[offset];

    before = child
      ? lastStopBefore(child, scope)
      : lastStopThrough(node, scope);
    after = firstStopFrom(child ?? afterSubtree(node, scope), scope);
  }

  const marker =
    before && isMarker(before)
      ? before
      : after && isMarker(after)
        ? after
        : null;

  if (marker) {
    const upper = lastStopBefore(marker, scope);
    const lower = lowerStopAfter(marker, scope);

    if (!upper || !lower || isMarker(upper) || isMarker(lower)) return null;
    const ends = {
      lower: [lower, 0] as DOMPoint,
      upper: textEnd(upper),
    };

    return marker === before
      ? { ...ends, point: ends.lower, side: 'lower' }
      : { ...ends, point: ends.upper, side: 'upper' };
  }
  if (!hostOrShell) return null;
  const host = element.closest('[data-editor-node="text"]');
  const inHost = (stop: Stop | null): stop is Text =>
    !!stop && isDOMText(stop) && host?.contains(stop) === true;

  if (inHost(after)) return { point: [after, 0] };
  if (inHost(before)) return { point: textEnd(before) };
  return null;
};

/**
 * Whether a selection may land on `node` though it is not editable: a soft
 * line end, or an inset beside one with no authored character between.
 */
export const isSoftLineEndTarget = (node: Node) => {
  const element = isDOMElement(node) ? node : node.parentElement;

  if (!element) return false;
  if (element.closest(SOFT_LINE_END_SELECTOR)) return true;
  return resolveSoftLineEndDOMPoint([node, 0])?.side !== undefined;
};

/**
 * Whether a soft line end lies between two DOM points, in either order.
 * `within` limits the soft line ends counted to one element's.
 */
export const isSoftLineEndBetween = (
  from: DOMPoint,
  to: DOMPoint,
  within?: Element
) => {
  const range = from[0].ownerDocument?.createRange();

  if (!range) return false;
  try {
    range.setStart(from[0], from[1]);
    if (range.comparePoint(to[0], to[1]) < 0) {
      range.setStart(to[0], to[1]);
      range.setEnd(from[0], from[1]);
    } else {
      range.setEnd(to[0], to[1]);
    }
  } catch {
    return false;
  }
  const common = range.commonAncestorContainer;
  const scope =
    within ?? (isDOMElement(common) ? common : common.parentElement);

  return (
    !!scope &&
    [...scope.querySelectorAll(SOFT_LINE_END_SELECTOR)].some((marker) =>
      range.intersectsNode(marker)
    )
  );
};

const samePoint = ([node, offset]: DOMPoint, [other, otherOffset]: DOMPoint) =>
  node === other && offset === otherOffset;

/**
 * At a soft line end inside one text, `upper` and `lower` are the two DOM
 * spots of one model point. Returns the spot the root's live selection shows
 * there, its focus first, or null when neither end sits at that soft line end.
 */
export const readLiveSoftLineSide = (
  upper: DOMPoint,
  lower: DOMPoint
): DOMPoint | null => {
  const selection = getSelection(
    upper[0].getRootNode() as Document | ShadowRoot
  );
  const live = selection ? readDOMSelectionPoints(selection) : null;

  if (!live) return null;
  for (const end of [live.focus, live.anchor]) {
    const mapped = resolveSoftLineEndDOMPoint(end);

    if (
      mapped?.side &&
      mapped.upper &&
      mapped.lower &&
      samePoint(mapped.upper, upper) &&
      samePoint(mapped.lower, lower)
    ) {
      return mapped.point;
    }
  }
  return null;
};

// A script can strip a soft line end's attribute and change its content in a
// later microtask, which the integrity observer receives as a separate batch,
// so it reads identity from here.
const SOFT_LINE_ENDS = new WeakSet<Element>();

/** The ref an editable view passes to each soft line end it renders. */
export const recordSoftLineEnd = (element: Element | null) => {
  if (element) SOFT_LINE_ENDS.add(element);
};

/** Whether the runtime rendered this node as a soft line end. */
export const isSoftLineEnd = (node: Node) =>
  isDOMElement(node) && SOFT_LINE_ENDS.has(node);

type AfterInsertCaret = Readonly<{ point: Point; root: RootKey }>;

const AFTER_INSERT_CARETS = new WeakMap<object, AfterInsertCaret>();

const isCaretAt = (
  selection: Range | Selection,
  root: RootKey | undefined,
  caret: AfterInsertCaret
) =>
  RangeApi.isRange(selection) &&
  RangeApi.isCollapsed(selection) &&
  toInternalRoot(SelectionApi.root(selection) ?? root) === caret.root &&
  PointApi.equals(selection.anchor, caret.point);

const previousStartMapsTo = (
  editor: AnyEditor,
  commit: EditorCommit,
  root: RootKey,
  point: Point
) => {
  const previous = commit.selectionBefore;

  if (
    !RangeApi.isRange(previous) ||
    toInternalRoot(
      SelectionApi.root(previous) ?? commit.selectionBeforeRoot
    ) !== root
  ) {
    return false;
  }
  const start = RangeApi.start(previous);
  const mapped = mapSelectionThroughChange(
    editor,
    SelectionApi.text({ anchor: start, focus: start }),
    commit.changes,
    getEditorCommitValue(commit, 'before'),
    getEditorCommitValue(commit, 'after'),
    root,
    {
      association: 'backward',
      runtimeIndexes: {
        after: getEditorCommitSnapshot(commit, root, 'after').index,
        before: getEditorCommitSnapshot(commit, root, 'before').index,
      },
    }
  );

  return RangeApi.isRange(mapped) && PointApi.equals(mapped.anchor, point);
};

const readInsertedCaret = (
  editor: AnyEditor,
  commit: EditorCommit
): AfterInsertCaret | null => {
  const caret = commit.selectionAfter;

  if (!RangeApi.isRange(caret) || !RangeApi.isCollapsed(caret)) return null;
  const root = toInternalRoot(
    SelectionApi.root(caret) ?? commit.selectionAfterRoot
  );
  const point = caret.anchor;
  const after = getEditorCommitSnapshot(commit, root, 'after').index;
  const key = after.keyAt(point.path);

  if (!key || !commit.changed.hasNodeKey(key, 'text')) return null;
  return previousStartMapsTo(editor, commit, root, point)
    ? null
    : { point, root };
};

/**
 * Sets or clears `editor`'s after-insert caret from one of its commits. React
 * rewrites a paged string by assigning its text, which drops the browser's
 * selection to that string's start, and a paste or a composed replacement can
 * leave the selection where it was, so after inserted content the live
 * selection can sit on a soft line end's lower side while the caret belongs
 * right after the content.
 */
export const noteAfterInsertCaret = (
  editor: AnyEditor,
  commit: EditorCommit
) => {
  if (commit.tags.includes('collaboration')) {
    AFTER_INSERT_CARETS.delete(editor);
    return;
  }
  if (!commit.changed.hasAny('document')) {
    const record = AFTER_INSERT_CARETS.get(editor);

    if (
      record &&
      !isCaretAt(commit.selectionAfter, commit.selectionAfterRoot, record)
    ) {
      AFTER_INSERT_CARETS.delete(editor);
    }
    return;
  }
  const caret = readInsertedCaret(editor, commit);

  if (caret) {
    AFTER_INSERT_CARETS.set(editor, caret);
  } else {
    AFTER_INSERT_CARETS.delete(editor);
  }
};

export const clearAfterInsertCaret = (editor: object) => {
  AFTER_INSERT_CARETS.delete(editor);
};

/** `editor`'s after-insert caret while its selection is collapsed there. */
export const readAfterInsertCaret = (editor: AnyEditor): Point | null => {
  const caret = AFTER_INSERT_CARETS.get(editor);

  if (!caret) return null;
  const selection = editor.read((state) => state.selection());

  return isCaretAt(selection, editor.read.view.root(), caret)
    ? caret.point
    : null;
};

export const readLowerSoftLineEnd = (
  node: Node | null,
  offset: number
): SoftLineEndDOMPoint | null => {
  const softLineEnd = node ? resolveSoftLineEndDOMPoint([node, offset]) : null;

  return softLineEnd?.side === 'lower' ? softLineEnd : null;
};

/**
 * Whether `point` sits in a text that holds a soft line end while its page
 * still shows other content than the model. Its strings then map offsets of
 * the old text, so a selection writer waits for the render instead. `within`
 * is the text's host, or the editor root its hosts render in.
 */
export const isSoftLineTextStale = (
  editor: AnyEditor,
  point: Point,
  within: HTMLElement
) => {
  const entry = editor.read((state) => state.nodes.get(point.path));
  const nodeKey = editorGetNodeKey(editor, point.path);

  if (!entry || !NodeApi.isText(entry[0]) || nodeKey === null) return false;
  const host =
    within.getAttribute('data-editor-node') === 'text'
      ? within
      : findMountedDOMNodeByPath(editor, point.path, within, point);
  const root = host && getTextRoot(host);

  if (!host?.querySelector(SOFT_LINE_END_SELECTOR) || !root) return false;
  if (isDOMTextPainted(editor, host, nodeKey, entry[0])) return false;
  return !getKeyHosts(editor, root, nodeKey, host).some(drawsUnownedHostText);
};
