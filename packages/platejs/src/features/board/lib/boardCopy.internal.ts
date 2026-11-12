import { nanoid } from 'nanoid';

import { ContentSlice, type Descendant, type Element } from '../../../core';
import {
  arrowEndsOf,
  type BoardArrowEnd,
  type BoardArrowEnds,
  type BoardArrowSide,
  isBoundArrowEnd,
} from './boardArrow.internal';
import {
  boardFrameOf,
  type BoardFrameBox,
  boardLayerOf,
  boardPointOf,
  type BoardShapePlace,
  framedPlace,
  isFrameable,
  placeAmong,
  savedPointOf,
} from './boardFrame.internal';
import type { BoardMemberEntry } from './boardMember.internal';
import {
  type BoardPlace,
  type BoardSize,
  isStackingKey,
  stackingKeysBetween,
} from './boardShape.internal';

export const BOARD_COPY_OFFSET = 24;

const slotOf = (index: number) => `#${index}`;

const slotIndexOf = (link: string) =>
  link.startsWith('#') ? Number(link.slice(1)) : undefined;

export const shapeIdOf = (node: Element) =>
  typeof node.shapeId === 'string' ? node.shapeId : '';

type Copied =
  | Readonly<{
      end: BoardArrowEnd;
      kind: 'arrow';
      node: Element;
      start: BoardArrowEnd;
    }>
  | Readonly<{ frame: BoardFrameBox; kind: 'frame'; node: Element }>
  | Readonly<{
      kind: 'shape';
      link?: string;
      node: Element;
      point: BoardPlace;
      size: BoardSize;
    }>
  | Readonly<{ kind: 'other'; node: Element }>;

const linkedFrameIn =
  <T>(nodes: readonly T[], frameOf: (node: T) => BoardFrameBox | undefined) =>
  (link: string) => {
    const slot = slotIndexOf(link);

    if (slot !== undefined) {
      const node = nodes[slot];

      return node === undefined ? undefined : frameOf(node);
    }
    for (const node of nodes) {
      const frame = frameOf(node);

      if (frame?.id === link) return frame;
    }

    return undefined;
  };

const copiedOf = (shapes: readonly Element[]): Copied[] => {
  const frameAt = linkedFrameIn(shapes, boardFrameOf);

  return shapes.map((node) => {
    const arrow = arrowEndsOf(node);

    if (arrow) return { ...arrow, kind: 'arrow', node };

    const frame = boardFrameOf(node);

    if (frame) return { frame, kind: 'frame', node };
    if (!isFrameable(node)) return { kind: 'other', node };

    const { frame: framed, point } = boardPointOf(node.place, frameAt);

    return {
      kind: 'shape',
      ...(framed !== undefined && 'frame' in node.place
        ? { link: node.place.frame }
        : {}),
      node,
      point,
      size: node.size,
    };
  });
};

const pointsOf = (copied: Copied): BoardPlace[] => {
  if (copied.kind === 'arrow') return [copied.start, copied.end];
  if (copied.kind === 'frame') return [copied.frame.place];

  return copied.kind === 'shape' ? [copied.point] : [];
};

const shifted = (copied: Copied, delta: BoardPlace): Copied => {
  const shift = ({ x, y }: BoardPlace) => ({ x: x + delta.x, y: y + delta.y });

  if (copied.kind === 'arrow') {
    return {
      ...copied,
      end: { ...copied.end, ...shift(copied.end) },
      start: { ...copied.start, ...shift(copied.start) },
    };
  }
  if (copied.kind === 'frame') {
    return {
      ...copied,
      frame: {
        ...copied.frame,
        origin: shift(copied.frame.origin),
        place: shift(copied.frame.place),
      },
    };
  }

  return copied.kind === 'shape'
    ? { ...copied, point: shift(copied.point) }
    : copied;
};

const nodeOf = (
  copied: Copied,
  placeOf: (shape: Extract<Copied, { kind: 'shape' }>) => BoardShapePlace
): Element => {
  if (copied.kind === 'arrow') {
    return { ...copied.node, end: copied.end, start: copied.start };
  }
  if (copied.kind === 'frame') {
    const { origin, place } = copied.frame;

    return { ...copied.node, place: { ...place, origin } };
  }

  return copied.kind === 'shape'
    ? { ...copied.node, place: placeOf(copied) }
    : copied.node;
};

const frameOfCopied = (copied: Copied) =>
  copied.kind === 'frame' ? copied.frame : undefined;

const compare = (a: string, b: string) => (a === b ? 0 : a < b ? -1 : 1);

type PaintKey = Readonly<{ id: string; layer: 0 | 1; zIndex: string }>;

export const paintOrder = (a: PaintKey, b: PaintKey) =>
  a.layer - b.layer || compare(a.zIndex, b.zIndex) || compare(a.id, b.id);

/** The paint key of a board member, or of a node in slice content. */
export const paintKeyOf = (
  member: Readonly<{ id: string; node: Element; zIndex: string }>
): PaintKey => ({
  id: member.id,
  layer: boardLayerOf(member.node.type),
  zIndex: member.zIndex,
});

const nodePaintKey = (node: Element) =>
  paintKeyOf({
    id: shapeIdOf(node),
    node,
    zIndex: isStackingKey(node.zIndex) ? node.zIndex : '',
  });

/** Where an arrow of the board draws, by its id. */
export type DrawnEndsOf = (id: string) => BoardArrowEnds | null;

const relinked = (
  shapes: readonly Element[],
  link: (shape: string) => string | undefined,
  sourceOf: (index: number) => BoardMemberEntry | undefined = () => undefined,
  drawnOf: DrawnEndsOf = () => null
) =>
  shapes.map((shape, index) => {
    const arrow = arrowEndsOf(shape);
    const source = sourceOf(index);

    if (!arrow) {
      if (!isFrameable(shape) || !('frame' in shape.place)) return shape;

      const { place } = shape;
      const frame = link(place.frame);

      return frame
        ? { ...shape, place: { ...place, frame } }
        : {
            ...shape,
            place:
              source?.kind === 'shape' ? source.place : savedPointOf(place),
          };
    }

    const drawn = source ? drawnOf(source.id) : null;
    const relink = (side: BoardArrowSide): BoardArrowEnd => {
      const end = arrow[side];
      const point = drawn?.[side] ?? { x: end.x, y: end.y };

      if (!isBoundArrowEnd(end)) return point;

      const linked = link(end.shape);

      return linked ? { ...end, ...point, shape: linked } : point;
    };

    return { ...shape, end: relink('end'), start: relink('start') };
  });

/**
 * Order a copy of board members by paint order and link each binding and
 * frame among them by slot. A shape whose frame is left out reads at its
 * board point, and an arrow end bound to a member left out keeps where it
 * draws.
 */
export const withSourcePaintOrder = (
  slice: ContentSlice,
  shapes: readonly Element[],
  sources: readonly BoardMemberEntry[],
  drawnOf: DrawnEndsOf
) => {
  const order = sources
    .map((source, index) => ({ index, source }))
    .sort((a, b) => paintOrder(paintKeyOf(a.source), paintKeyOf(b.source)));
  const slots = new Map(
    order.map(({ source }, slot) => [source.id, slotOf(slot)])
  );

  return ContentSlice.withContent(
    slice,
    relinked(
      order.map(({ index }) => shapes[index]),
      (shape) => slots.get(shape),
      (at) => order[at].source,
      drawnOf
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

const offsetTo = (copies: readonly Copied[], place: BoardPlace) => {
  const points = copies.flatMap(pointsOf);

  return {
    x: place.x - Math.min(...points.map(({ x }) => x)),
    y: place.y - Math.min(...points.map(({ y }) => y)),
  };
};

/** Move copied shapes so that their top-left corner lands at `place`. */
export const moveShapesTo = (
  shapes: readonly Element[],
  place: BoardPlace
): Element[] => {
  const copies = copiedOf(shapes);
  const delta = offsetTo(copies, place);
  const moved = copies.map((copied) => shifted(copied, delta));
  const frameAt = linkedFrameIn(moved, frameOfCopied);

  return moved.map((copied) =>
    nodeOf(copied, ({ link, point }) => {
      const frame = link === undefined ? undefined : frameAt(link);

      return frame && link !== undefined
        ? framedPlace({ id: link, origin: frame.origin }, point)
        : point;
    })
  );
};

/**
 * Land copied shapes on a board with fresh ids: stepped off any member
 * already at the places they land on, each layer above that layer of the
 * board, and each shape in the frame it overlaps among the copied frames and
 * the board's, its copied frame first.
 */
export const placeShapeCopies = (
  shapes: readonly Element[],
  board: readonly BoardMemberEntry[],
  drawnOf: DrawnEndsOf
): Element[] => {
  const copies = copiedOf(withFreshShapeIds(shapes));
  const taken = new Set(
    board.map((member) => {
      const { x, y } =
        member.kind === 'arrow'
          ? (drawnOf(member.id)?.start ?? member.start)
          : member.place;

      return JSON.stringify({ x, y });
    })
  );
  const firsts = copies.flatMap((copied) => pointsOf(copied).slice(0, 1));
  let step = 0;

  while (
    firsts.some(({ x, y }) =>
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
  const zIndexes: string[] = [];

  for (const layer of [0, 1] as const) {
    const top = board
      .map(paintKeyOf)
      .filter((key) => key.layer === layer)
      .reduce<PaintKey | null>(
        (highest, key) =>
          !highest || paintOrder(highest, key) < 0 ? key : highest,
        null
      );
    const sourceOrder = shapes
      .map((node, index) => ({ index, key: nodePaintKey(node) }))
      .filter(({ key }) => key.layer === layer)
      .sort((a, b) => paintOrder(a.key, b.key));
    const keys = stackingKeysBetween(
      top?.zIndex || null,
      null,
      sourceOrder.length
    );

    sourceOrder.forEach(({ index }, rank) => {
      zIndexes[index] = keys[rank];
    });
  }

  const moved = copies.map((copied) => shifted(copied, delta));
  const frames = [
    ...moved.flatMap((copied, index) =>
      copied.kind === 'frame'
        ? [{ ...copied.frame, zIndex: zIndexes[index] }]
        : []
    ),
    ...board.flatMap((member) => (member.kind === 'frame' ? [member] : [])),
  ];

  return moved.map((copied, index) => ({
    ...nodeOf(copied, ({ link, point, size }) =>
      placeAmong(frames, { place: point, size }, { requested: link })
    ),
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
  sourcesIn: (root: string) => readonly BoardMemberEntry[],
  drawnOf: DrawnEndsOf
) =>
  withShapeRoots(slice, isShape, (shapes, root) => {
    const sources = sourcesIn(root);

    if (sources.length !== shapes.length) return undefined;

    const slots = new Map(
      sources.map((source, index) => [source.id, slotOf(index)])
    );

    return relinked(
      shapes,
      (shape) => slots.get(shape),
      (index) => sources[index],
      drawnOf
    );
  });
