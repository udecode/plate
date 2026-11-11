import { nanoid } from 'nanoid';

import { ContentSlice, type Descendant, type Element } from '../../../core';
import {
  type BoardPlace,
  isBoardPlace,
  isStackingKey,
  stackingKeysBetween,
} from './boardShape.internal';

export const BOARD_COPY_OFFSET = 24;

const placeOf = (node: Element): BoardPlace =>
  isBoardPlace(node.place) ? node.place : { x: 0, y: 0 };

const zIndexOf = (node: Element) =>
  isStackingKey(node.zIndex) ? node.zIndex : '';

export const shapeIdOf = (node: Element) =>
  typeof node.shapeId === 'string' ? node.shapeId : '';

const compare = (a: string, b: string) => (a === b ? 0 : a < b ? -1 : 1);

type PaintKey = Readonly<{ id: string; zIndex: string }>;

export const paintOrder = (a: PaintKey, b: PaintKey) =>
  compare(a.zIndex, b.zIndex) || compare(a.id, b.id);

const paintKeyOf = (node: Element): PaintKey => ({
  id: shapeIdOf(node),
  zIndex: zIndexOf(node),
});

const byPaint = (a: Element, b: Element) =>
  paintOrder(paintKeyOf(a), paintKeyOf(b));

export const withSourcePaintOrder = (
  slice: ContentSlice,
  sources: readonly Element[]
) =>
  ContentSlice.withContent(
    slice,
    sources
      .map((source, index) => ({ index, source }))
      .sort((a, b) => byPaint(a.source, b.source))
      .map(({ index }) => slice.content[index]),
    { open: 'preserve' }
  );

export const withFreshShapeIds = (shapes: readonly Element[]): Element[] =>
  shapes.map((shape) => ({ ...shape, shapeId: nanoid() }));

export const moveShapesTo = (
  shapes: readonly Element[],
  place: BoardPlace
): Element[] => {
  const places = shapes.map(placeOf);
  const dx = place.x - Math.min(...places.map(({ x }) => x));
  const dy = place.y - Math.min(...places.map(({ y }) => y));

  return shapes.map((shape, index) => ({
    ...shape,
    place: { x: places[index].x + dx, y: places[index].y + dy },
  }));
};

export const placeShapeCopies = (
  shapes: readonly Element[],
  board: readonly Element[]
): Element[] => {
  const places = shapes.map(placeOf);
  const taken = new Set(board.map((node) => JSON.stringify(placeOf(node))));
  let step = 0;

  while (
    places.some(({ x, y }) =>
      taken.has(
        JSON.stringify({
          x: x + step * BOARD_COPY_OFFSET,
          y: y + step * BOARD_COPY_OFFSET,
        })
      )
    )
  ) {
    step += 1;
  }

  const delta = { x: step * BOARD_COPY_OFFSET, y: step * BOARD_COPY_OFFSET };

  const top = board.reduce<Element | null>(
    (highest, node) =>
      !highest || byPaint(highest, node) < 0 ? node : highest,
    null
  );
  const painted = shapes
    .map((shape, index) => ({ index, shape }))
    .sort((a, b) => byPaint(a.shape, b.shape));
  const keys = stackingKeysBetween(
    top ? zIndexOf(top) || null : null,
    null,
    shapes.length
  );
  const zIndexes: string[] = [];

  painted.forEach(({ index }, rank) => {
    zIndexes[index] = keys[rank];
  });

  return withFreshShapeIds(shapes).map((shape, index) => ({
    ...shape,
    place: { x: places[index].x + delta.x, y: places[index].y + delta.y },
    zIndex: zIndexes[index],
  }));
};

export const withFreshRootShapeIds = (
  slice: ContentSlice,
  isShape: (node: Descendant) => node is Element
): ContentSlice => {
  if (!slice.roots) return slice;

  let changed = false;
  const roots = Object.fromEntries(
    Object.entries(slice.roots).map(([name, children]) => {
      if (children.length === 0 || !children.every(isShape)) {
        return [name, children];
      }

      changed = true;

      return [name, withFreshShapeIds(children)];
    })
  );

  return changed ? ContentSlice.fromJSON({ ...slice, roots }) : slice;
};
