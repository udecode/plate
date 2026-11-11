import {
  type BoardPlace,
  type BoardSize,
  isBoardPlace,
  isBoardSize,
  isStackingKey,
} from './boardShape.internal';

const readJson = (
  element: Readonly<HTMLElement>,
  attribute: string
): unknown => {
  const value = element.getAttribute(attribute);

  if (value === null) return undefined;

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

export const encodeBoardShapeAttributes = (
  node: Readonly<{
    place?: unknown;
    shapeId?: unknown;
    size?: unknown;
    zIndex?: unknown;
  }>
) => ({
  'data-board-place': JSON.stringify(node.place),
  'data-board-shape-id':
    typeof node.shapeId === 'string' ? node.shapeId : undefined,
  'data-board-size': JSON.stringify(node.size),
  'data-board-z-index':
    typeof node.zIndex === 'string' ? node.zIndex : undefined,
});

export const decodeBoardShapeAttributes = (
  element: Readonly<HTMLElement>
):
  | Readonly<{
      place: BoardPlace;
      shapeId?: string;
      size: BoardSize;
      zIndex: string;
    }>
  | undefined => {
  const place = readJson(element, 'data-board-place');
  const size = readJson(element, 'data-board-size');
  const zIndex = element.getAttribute('data-board-z-index');
  const shapeId = element.getAttribute('data-board-shape-id');

  if (!isBoardPlace(place) || !isBoardSize(size) || !isStackingKey(zIndex)) {
    return undefined;
  }

  return { place, ...(shapeId ? { shapeId } : {}), size, zIndex };
};

export const BOARD_SHAPE_ATTRIBUTES = [
  'data-board-place',
  'data-board',
  'data-board-shape-id',
  'data-board-size',
  'data-board-z-index',
] as const;
