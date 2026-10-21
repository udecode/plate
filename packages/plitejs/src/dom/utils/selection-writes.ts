import { type DOMPoint, getSelection } from './dom';
import { isWebKitDOMHost } from './environment';

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
};

export const forgetDOMSelectionRecord = (tree: Document | ShadowRoot) => {
  RECORDS.delete(tree);
};

export const forgetDOMSelectionRecordWithin = (
  tree: Document | ShadowRoot,
  container: Node
) => {
  const points = RECORDS.get(tree)?.points;

  if (
    points &&
    (container.contains(points.anchor[0]) ||
      container.contains(points.focus[0]))
  ) {
    RECORDS.delete(tree);
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

const readsSelectionAsHost = (tree: Document | ShadowRoot) =>
  tree.nodeType === tree.DOCUMENT_FRAGMENT_NODE && isWebKitDOMHost(tree);

/**
 * Write `points` as `tree`'s selection, keeping their direction, or clear its
 * ranges for null, and record what the tree then shows, or the points written
 * where the tree reads its selection as its host. A selection that already
 * shows them is left alone, and so is the record.
 */
export const writeDOMSelection = (
  tree: Document | ShadowRoot,
  points: DOMSelectionPoints | null
) => {
  const selection = getSelection(tree);

  if (
    !selection ||
    sameDOMSelectionPoints(readDOMSelectionPoints(selection), points)
  ) {
    return;
  }
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
