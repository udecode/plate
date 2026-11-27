import type { Element, NodeKey } from '../../../core';
import type { ViewPresentation } from '../../../facade';
import type { BoardFrameEntry, BoardShapeEntry } from './boardMember.internal';
import type { BoardSize } from './boardShape.internal';

export type BoardNoteHeightStamp = Readonly<{
  autoSize: unknown;
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
  width?: number;
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
  stamp.autoSize === node.autoSize &&
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

export const isAutoSizeBoardText = (
  node: Element,
  textType: string | undefined
) =>
  textType !== undefined && node.type === textType && node.autoSize !== false;

export const lentBoardSizeFor = (
  presentation: ViewPresentation,
  root: string,
  entry: BoardFrameEntry | BoardShapeEntry,
  textType: string | undefined
): BoardSize => {
  const lender =
    MOUNTED_HEIGHTS.get(presentation)?.get(root)?.at(-1) ??
    FALLBACK_HEIGHTS.get(presentation)?.get(root)?.at(-1);
  const lent = lender?.(entry.id);

  if (!lent || !boardNoteStampMatches(lent.stamp, entry)) return entry.size;

  const height = Math.max(entry.size.height, lent.height);
  const width =
    isAutoSizeBoardText(entry.node, textType) && lent.width !== undefined
      ? Math.max(entry.size.width, lent.width)
      : entry.size.width;

  return width === entry.size.width && height === entry.size.height
    ? entry.size
    : { height, width };
};

export type BoardPictureMeasuredSize = number | Partial<BoardSize>;

const PICTURE_SIZES = new WeakMap<
  object,
  ReadonlyMap<string, BoardPictureMeasuredSize>
>();

export const bindBoardPictureHeights = (
  view: object,
  sizes: ReadonlyMap<string, BoardPictureMeasuredSize>
) => {
  if (PICTURE_SIZES.has(view)) {
    throw new Error('Board picture heights are already bound to this view.');
  }
  PICTURE_SIZES.set(view, sizes);
};

export const pictureBoardHeightsOf = (
  view: object
): ReadonlyMap<string, BoardPictureMeasuredSize> | undefined =>
  PICTURE_SIZES.get(view);

export const resolvePictureBoardSize = (
  entry: BoardFrameEntry | BoardShapeEntry,
  sizes: ReadonlyMap<string, BoardPictureMeasuredSize> | undefined,
  textType: string | undefined
): BoardSize => {
  const measured = sizes?.get(entry.id);

  if (measured === undefined) return entry.size;

  const nextHeight =
    typeof measured === 'number'
      ? Math.max(entry.size.height, measured)
      : measured.height !== undefined
        ? Math.max(entry.size.height, measured.height)
        : entry.size.height;
  const nextWidth =
    typeof measured !== 'number' &&
    measured.width !== undefined &&
    isAutoSizeBoardText(entry.node, textType)
      ? Math.max(entry.size.width, measured.width)
      : entry.size.width;

  return nextWidth === entry.size.width && nextHeight === entry.size.height
    ? entry.size
    : { height: nextHeight, width: nextWidth };
};
