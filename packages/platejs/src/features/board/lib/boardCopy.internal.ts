import { nanoid } from 'nanoid';

import { ContentSlice, type Descendant, type Element } from '../../../core';
import {
  ARROW_SIDES,
  arrowEndsOf,
  type BoardArrowEnd,
  type BoardArrowEnds,
  type BoardArrowSide,
  isBoundArrowEnd,
} from './boardArrow.internal';
import {
  type BoardPlace,
  isBoardPlace,
  isStackingKey,
  stackingKeysBetween,
} from './boardShape.internal';

export const BOARD_COPY_OFFSET = 24;

const pointsOf = (node: Element): BoardPlace[] => {
  const arrow = arrowEndsOf(node);

  if (arrow) return ARROW_SIDES.map((side) => arrow[side]);

  return [isBoardPlace(node.place) ? node.place : { x: 0, y: 0 }];
};

const placeOf = (node: Element): BoardPlace => {
  const { x, y } = pointsOf(node)[0];

  return { x, y };
};

const shifted = (node: Element, delta: BoardPlace): Element => {
  const shift = ({ x, y }: BoardPlace) => ({ x: x + delta.x, y: y + delta.y });
  const arrow = arrowEndsOf(node);

  return arrow
    ? {
        ...node,
        end: { ...arrow.end, ...shift(arrow.end) },
        start: { ...arrow.start, ...shift(arrow.start) },
      }
    : { ...node, place: shift(placeOf(node)) };
};

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

const slotOf = (index: number) => `#${index}`;

const relinked = (
  shapes: readonly Element[],
  link: (shape: string) => string | undefined,
  drawnOf: (index: number) => BoardArrowEnds | undefined = () => undefined
) =>
  shapes.map((shape, index) => {
    const arrow = arrowEndsOf(shape);

    if (!arrow) return shape;

    const drawn = drawnOf(index);
    const relink = (side: BoardArrowSide): BoardArrowEnd => {
      const end = arrow[side];
      const point = drawn?.[side] ?? { x: end.x, y: end.y };

      if (!isBoundArrowEnd(end)) return point;

      const linked = link(end.shape);

      return linked ? { ...end, ...point, shape: linked } : point;
    };

    return { ...shape, end: relink('end'), start: relink('start') };
  });

export type DrawnEndsOf = (source: Element) => BoardArrowEnds | undefined;

export const withSourcePaintOrder = (
  slice: ContentSlice,
  shapes: readonly Element[],
  sources: readonly Element[],
  drawnOf: DrawnEndsOf
) => {
  const order = sources
    .map((source, index) => ({ index, source }))
    .sort((a, b) => byPaint(a.source, b.source));
  const slots = new Map(
    order.map(({ source }, slot) => [shapeIdOf(source), slotOf(slot)])
  );

  return ContentSlice.withContent(
    slice,
    relinked(
      order.map(({ index }) => shapes[index]),
      (shape) => slots.get(shape),
      (at) => drawnOf(order[at].source)
    ),
    { open: 'preserve' }
  );
};

export const withFreshShapeIds = (shapes: readonly Element[]): Element[] => {
  const fresh = shapes.map(() => nanoid());
  const bySlot = new Map(fresh.map((id, index) => [slotOf(index), id]));
  const byId = new Map(
    shapes.flatMap((shape, index) =>
      shapeIdOf(shape) ? [[shapeIdOf(shape), fresh[index]] as const] : []
    )
  );

  return relinked(shapes, (shape) => bySlot.get(shape) ?? byId.get(shape)).map(
    (shape, index) => ({ ...shape, shapeId: fresh[index] })
  );
};

export const moveShapesTo = (
  shapes: readonly Element[],
  place: BoardPlace
): Element[] => {
  const points = shapes.flatMap(pointsOf);
  const delta = {
    x: place.x - Math.min(...points.map(({ x }) => x)),
    y: place.y - Math.min(...points.map(({ y }) => y)),
  };

  return shapes.map((shape) => shifted(shape, delta));
};

export const placeShapeCopies = (
  shapes: readonly Element[],
  board: readonly Element[],
  drawnOf: DrawnEndsOf
): Element[] => {
  const places = shapes.map(placeOf);
  const taken = new Set(
    board.map((node) => {
      const { x, y } = drawnOf(node)?.start ?? placeOf(node);

      return JSON.stringify({ x, y });
    })
  );
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
    ...shifted(shape, delta),
    zIndex: zIndexes[index],
  }));
};

type IsShape = (node: Descendant) => node is Element;

const withShapeRoots = (
  slice: ContentSlice,
  isShape: IsShape,
  map: (shapes: readonly Element[], root: string) => Element[] | undefined
): ContentSlice => {
  if (!slice.roots) return slice;

  let changed = false;
  const roots = Object.fromEntries(
    Object.entries(slice.roots).map(([name, children]) => {
      const mapped =
        children.length > 0 && children.every(isShape)
          ? map(children, name)
          : undefined;

      if (!mapped) return [name, children];
      changed = true;

      return [name, mapped];
    })
  );

  return changed ? ContentSlice.fromJSON({ ...slice, roots }) : slice;
};

export const withFreshRootShapeIds = (slice: ContentSlice, isShape: IsShape) =>
  withShapeRoots(slice, isShape, withFreshShapeIds);

export const withCarriedRootSlots = (
  slice: ContentSlice,
  isShape: IsShape,
  sourcesIn: (root: string) => readonly Descendant[],
  drawnOf: DrawnEndsOf
) =>
  withShapeRoots(slice, isShape, (shapes, root) => {
    const sources = sourcesIn(root);

    if (sources.length !== shapes.length || !sources.every(isShape)) {
      return undefined;
    }

    const slots = new Map(
      sources.map((source, index) => [shapeIdOf(source), slotOf(index)])
    );

    return relinked(
      shapes,
      (shape) => slots.get(shape),
      (index) => drawnOf(sources[index])
    );
  });
