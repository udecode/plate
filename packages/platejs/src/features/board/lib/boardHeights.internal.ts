import type { Element, NodeKey } from '../../../core';
import type { ViewPresentation } from '../../../facade';
import type { BoardFrameEntry, BoardShapeEntry } from './boardMember.internal';

export type BoardNoteHeightStamp = Readonly<{
  children: readonly unknown[];
  key: NodeKey;
  sizeHeight: number;
  sizeWidth: number;
  textSize: unknown;
  type: string;
}>;

export type BoardLentHeight = Readonly<{
  height: number;
  stamp: BoardNoteHeightStamp;
}>;

export type BoardHeightLender = (id: string) => BoardLentHeight | undefined;

type LenderRegistry = WeakMap<
  ViewPresentation,
  Map<string, BoardHeightLender[]>
>;

const MOUNTED_HEIGHTS: LenderRegistry = new WeakMap();
const FALLBACK_HEIGHTS: LenderRegistry = new WeakMap();

export const boardNoteStampMatches = (
  stamp: BoardNoteHeightStamp,
  entry: BoardFrameEntry | BoardShapeEntry,
  node: Element = entry.node
) =>
  stamp.key === entry.key &&
  stamp.type === node.type &&
  stamp.sizeWidth === entry.size.width &&
  stamp.sizeHeight === entry.size.height &&
  stamp.textSize === node.textSize &&
  stamp.children === node.children;

export const lendBoardHeights = (
  presentation: ViewPresentation,
  root: string,
  lender: BoardHeightLender,
  fallback = false
): (() => void) => {
  const registry = fallback ? FALLBACK_HEIGHTS : MOUNTED_HEIGHTS;
  let roots = registry.get(presentation);

  if (!roots) {
    roots = new Map();
    registry.set(presentation, roots);
  }

  let lenders = roots.get(root);

  if (!lenders) {
    lenders = [];
    roots.set(root, lenders);
  }
  lenders.push(lender);

  return () => {
    const held = registry.get(presentation);
    const list = held?.get(root);

    if (!list) return;

    const at = list.lastIndexOf(lender);

    if (at === -1) return;
    list.splice(at, 1);
    if (list.length === 0) held?.delete(root);
    if (held?.size === 0) registry.delete(presentation);
  };
};

export const lentBoardHeightFor = (
  presentation: ViewPresentation,
  root: string,
  entry: BoardFrameEntry | BoardShapeEntry
): number => {
  const lender =
    MOUNTED_HEIGHTS.get(presentation)?.get(root)?.at(-1) ??
    FALLBACK_HEIGHTS.get(presentation)?.get(root)?.at(-1);
  const lent = lender?.(entry.id);

  if (!lent) return entry.size.height;

  return boardNoteStampMatches(lent.stamp, entry)
    ? Math.max(entry.size.height, lent.height)
    : entry.size.height;
};

const PICTURE_HEIGHTS = new WeakMap<object, ReadonlyMap<string, number>>();

export const bindBoardPictureHeights = (
  view: object,
  heights: ReadonlyMap<string, number>
) => {
  if (PICTURE_HEIGHTS.has(view)) {
    throw new Error('Board picture heights are already bound to this view.');
  }
  PICTURE_HEIGHTS.set(view, heights);
};

export const pictureBoardHeightsOf = (
  view: object
): ReadonlyMap<string, number> | undefined => PICTURE_HEIGHTS.get(view);
