import { type DOMPoint, getSelection } from './dom';
import { hasDOMHostQuirk, isWebKitDOMHost } from './environment';

/** A selection's anchor and focus as DOM points, in selection direction. */
export type DOMSelectionPoints = Readonly<{
  anchor: DOMPoint;
  focus: DOMPoint;
}>;

export type DOMSelectionRecord = Readonly<{
  points: DOMSelectionPoints | null;
  source: 'judged' | 'moved' | 'write';
}>;

const RECORDS = new WeakMap<Document | ShadowRoot, DOMSelectionRecord>();

// WebKit keeps a caret written into content with no layout box, such as a
// hidden caption, but never places it, so typing there does nothing until the
// same points are written again after that content renders.
const UNPLACED_WRITES = new WeakMap<
  Document | ShadowRoot,
  DOMSelectionPoints
>();

const hasLayoutBox = ([node]: DOMPoint) => {
  const element = node.nodeType === 1 ? (node as Element) : node.parentElement;

  return !!element && element.getClientRects().length > 0;
};

export const readDOMSelectionPoints = (
  selection: Selection
): DOMSelectionPoints | null => {
  const { anchorNode, focusNode } = selection;

  return selection.rangeCount > 0 && anchorNode && focusNode
    ? {
        anchor: [anchorNode, selection.anchorOffset],
        focus: [focusNode, selection.focusOffset],
      }
    : null;
};

const sameDOMPoint = (
  [node, offset]: DOMPoint,
  [otherNode, otherOffset]: DOMPoint
) => node === otherNode && offset === otherOffset;

export const sameDOMSelectionPoints = (
  points: DOMSelectionPoints | null,
  other: DOMSelectionPoints | null
) =>
  points === null || other === null
    ? points === other
    : sameDOMPoint(points.anchor, other.anchor) &&
      sameDOMPoint(points.focus, other.focus);

export const readDOMSelectionRecord = (tree: Document | ShadowRoot) =>
  RECORDS.get(tree) ?? null;

export const recordDOMSelection = (
  tree: Document | ShadowRoot,
  points: DOMSelectionPoints,
  source: 'judged' | 'moved'
) => {
  RECORDS.set(tree, { points, source });
  UNPLACED_WRITES.delete(tree);
};

export const forgetDOMSelectionRecord = (tree: Document | ShadowRoot) => {
  RECORDS.delete(tree);
  UNPLACED_WRITES.delete(tree);
};

const touches = (container: Node, points?: DOMSelectionPoints | null) =>
  !!points &&
  (container.contains(points.anchor[0]) || container.contains(points.focus[0]));

export const forgetDOMSelectionRecordWithin = (
  tree: Document | ShadowRoot,
  container: Node
) => {
  if (touches(container, RECORDS.get(tree)?.points)) RECORDS.delete(tree);
  if (touches(container, UNPLACED_WRITES.get(tree))) {
    UNPLACED_WRITES.delete(tree);
  }
};

export const getDOMRangeSelectionPoints = (
  range: AbstractRange,
  backward = false
): DOMSelectionPoints => {
  const start: DOMPoint = [range.startContainer, range.startOffset];
  const end: DOMPoint = [range.endContainer, range.endOffset];

  return backward
    ? { anchor: end, focus: start }
    : { anchor: start, focus: end };
};

export const readsSelectionAsHost = (tree: Document | ShadowRoot) =>
  tree.nodeType === tree.DOCUMENT_FRAGMENT_NODE && isWebKitDOMHost(tree);

/**
 * Write `points` as `tree`'s selection, keeping their direction, or clear its
 * ranges for null, and record what the tree then shows, or the points written
 * where the tree reads its selection as its host. A selection that already
 * shows them is left alone, and so is the record, unless WebKit got them from
 * a write while their anchor had no layout box, neither the user nor a write
 * of other points has come since, and the anchor has one now.
 */
export const writeDOMSelection = (
  tree: Document | ShadowRoot,
  points: DOMSelectionPoints | null
) => {
  changeDOMSelection(tree, points);
};

export const changeDOMSelection = (
  tree: Document | ShadowRoot,
  points: DOMSelectionPoints | null,
  beforeChange?: () => void
) => {
  const selection = getSelection(tree);

  if (!selection) return;

  const rewritesUnplaced =
    points !== null &&
    sameDOMSelectionPoints(UNPLACED_WRITES.get(tree) ?? null, points);

  if (!rewritesUnplaced) UNPLACED_WRITES.delete(tree);
  if (
    sameDOMSelectionPoints(readDOMSelectionPoints(selection), points) &&
    !(rewritesUnplaced && hasLayoutBox(points.anchor))
  ) {
    return;
  }
  beforeChange?.();
  if (points) {
    selection.setBaseAndExtent(
      points.anchor[0],
      points.anchor[1],
      points.focus[0],
      points.focus[1]
    );
  } else {
    selection.removeAllRanges();
  }

  if (
    points &&
    hasDOMHostQuirk(tree, 'unrendered-caret-needs-rewrite') &&
    !hasLayoutBox(points.anchor)
  ) {
    UNPLACED_WRITES.set(tree, points);
  } else {
    UNPLACED_WRITES.delete(tree);
  }

  RECORDS.set(tree, {
    points: readsSelectionAsHost(tree)
      ? points
      : readDOMSelectionPoints(selection),
    source: 'write',
  });
};

/** A copy of `selection`'s range at `index`, safe to keep or change. */
export const readDOMSelectionRange = (selection: Selection, index = 0) =>
  selection.getRangeAt(index).cloneRange();
