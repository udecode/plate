import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHeadingPlugin,
  BaseItalicPlugin,
  BaseLinkPlugin,
  BaseListPlugin,
  BaseParagraphPlugin,
  BaseUnderlinePlugin,
  createEditor as createPlateEditor,
  definePlugin as definePlatePlugin,
  type NodeComponent,
  TrailingBlockPlugin,
} from 'platejs';
import {
  createEditor as createPliteEditor,
  defineEditorSchema,
  type PluginReference,
  property,
  schema,
  target,
  type Descendant,
} from 'plitejs';
import {
  authored,
  type AuthoredPage,
  type AuthoredQuery,
} from 'plitejs/authored';

import {
  BaseBoardArrowPlugin,
  BaseBoardFramePlugin,
  BaseBoardGeoPlugin,
  BaseBoardNotePlugin,
  BaseBoardPlugin,
  BaseBoardStrokePlugin,
} from '../../../../packages/platejs/src/features/board';

const SHAPE_TYPES = [
  'boardNote',
  'boardGeo',
  'boardArrow',
  'boardFrame',
  'boardStroke',
] as const;

const isShapeType = (type: string | undefined) =>
  (SHAPE_TYPES as ReadonlyArray<string | undefined>).includes(type);

export type BoardLayer = 'plite' | 'plate' | 'composed';

export type TypedPosition = 'first' | 'middle' | 'last';

export type PendingPlacement = 'spread' | 'head';

export type BoardIntent = 'plain' | 'suggesting';

export type BoardWorkload = Readonly<{
  shapes: number;
  boards: number;
  arrowsToTyped: number;
  pending: number;
  frameMembers: number;
  position: TypedPosition;
  placement: PendingPlacement;
  intent: BoardIntent;
  dense: boolean;
}>;

export type BoardFault =
  | 'N'
  | 'A'
  | 'S'
  | 'F'
  | 'B'
  | 'position'
  | 'placement'
  | 'intent';

export type BoardPoint = Readonly<{ x: number; y: number }>;

export type BoardCamera = Readonly<{ x: number; y: number; zoom: number }>;

export const VIEWPORT = { height: 800, width: 1280 } as const;

const PITCH = { x: 200, y: 150 } as const;
const SIZE = { height: 120, width: 160 } as const;
const LEAD_PARAGRAPHS = 10;
export const BASE62 =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const stackingKey = (index: number) => {
  let digits = '';
  let rest = index;

  for (let place = 0; place < 3; place++) {
    digits = BASE62[rest % 62] + digits;
    rest = Math.floor(rest / 62);
  }

  return `c${digits}`;
};

const text = (value: string) => [{ text: value }];
const paragraph = (value: string) => ({
  children: text(value),
  type: 'paragraph',
});

const boardRootName = (board: number) => `board:${board}`;

export type TypedTarget = Readonly<{
  board: number;
  root: string;
  shapeId: string;
  textPath: number[];
}>;

export type BoardValue = {
  children: Array<Record<string, unknown>>;
  roots?: Record<string, Array<Record<string, unknown>>>;
};

export type SeededCrossing = Readonly<{
  shapeId: string;
  view: 'typed' | 'origin';
}>;

export type BoardFixture = Readonly<{
  camera: BoardCamera;
  crossings: readonly SeededCrossing[];
  typed: TypedTarget;
  value: BoardValue;
}>;

type Kind = 'note' | 'geo' | 'arrow';

const pendingMark = (
  slot: number,
  key: string,
  before: string,
  after: string
) => {
  const hex = slot.toString(16).padStart(12, '0');

  return {
    at: 1_700_000_000_000,
    author: 'board-scale-peer',
    before,
    change: `00000000-0000-4000-8000-${hex}`,
    id: hex,
    key,
    kind: 'format',
    write: { kind: 'set', value: after },
  };
};

const shapeKinds = (
  count: number,
  typedIndex: number,
  notesFirst: number
): Kind[] => {
  const kinds = Array.from({ length: count }, (_value, index): Kind => {
    if (index < notesFirst) return 'note';

    const slot = index % 10;

    if (slot < 7) return 'note';

    return slot < 9 ? 'geo' : 'arrow';
  });

  if (typedIndex >= 0 && kinds[typedIndex] !== 'note') {
    const swap = kinds.indexOf('note');
    kinds[swap] = kinds[typedIndex];
    kinds[typedIndex] = 'note';
  }

  return kinds;
};

const typedIndexOf = (
  count: number,
  workload: Pick<BoardWorkload, 'pending' | 'placement' | 'position'>
) => {
  if (workload.pending > 0 && workload.placement === 'head') {
    return workload.pending;
  }

  const { position } = workload;

  if (position === 'first') return 0;

  return position === 'last' ? count - 1 : Math.floor(count / 2);
};

type Grid = Readonly<{ columns: number; pitch: BoardPoint }>;

const DENSE_PITCH = { x: SIZE.width + 10, y: SIZE.height + 10 } as const;

const gridOf = (count: number, dense: boolean): Grid =>
  dense
    ? {
        columns: Math.ceil(
          Math.sqrt(
            (count * VIEWPORT.width * DENSE_PITCH.y) /
              (VIEWPORT.height * DENSE_PITCH.x)
          )
        ),
        pitch: DENSE_PITCH,
      }
    : { columns: Math.max(8, Math.ceil(Math.sqrt(count))), pitch: PITCH };

const gridPlace = (index: number, { columns, pitch }: Grid) => ({
  x: (index % columns) * pitch.x,
  y: Math.floor(index / columns) * pitch.y,
});

const spanOf = (start: BoardPoint, end: BoardPoint) => ({
  place: { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y) },
  size: {
    height: Math.max(2, Math.abs(end.y - start.y)),
    width: Math.max(2, Math.abs(end.x - start.x)),
  },
});

const crossingPlaces = (rowCenters: readonly number[], grid: Grid) =>
  rowCenters.flatMap((center) => {
    const y = center - SIZE.height / 2;
    const width = grid.columns * grid.pitch.x;

    return [
      { x: -width - SIZE.width, y },
      { x: 2 * width, y },
    ];
  });

export const buildBoardFixture = (
  workload: BoardWorkload,
  fault?: BoardFault
): BoardFixture => {
  const typedBoard = Math.floor(workload.boards / 2);
  const typedId = `b${typedBoard}-typed`;
  const frameId = `b${typedBoard}-frame`;
  const seededCrossings: SeededCrossing[] = [];
  const boards = Array.from({ length: workload.boards }, (_board, board) => {
    const count =
      fault === 'B'
        ? board === 0
          ? workload.shapes * workload.boards
          : 0
        : fault === 'N' && board === typedBoard
          ? Math.min(50, workload.shapes)
          : workload.shapes;
    const holdsTyped =
      count > 0 && (fault === 'B' ? board === 0 : board === typedBoard);
    const position =
      fault === 'position'
        ? workload.position === 'middle'
          ? 'last'
          : 'middle'
        : workload.position;
    const typedIndex = holdsTyped
      ? typedIndexOf(count, { ...workload, position })
      : -1;
    const placement =
      fault === 'placement'
        ? workload.placement === 'head'
          ? 'spread'
          : 'head'
        : workload.placement;
    const kinds = shapeKinds(
      count,
      typedIndex,
      holdsTyped && placement === 'head' ? workload.pending : 0
    );
    const grid = gridOf(count, workload.dense);
    const ids = kinds.map((_kind, index) =>
      index === typedIndex ? typedId : `b${board}-s${index}`
    );
    const frameSlot =
      holdsTyped && workload.frameMembers > 0 ? (typedIndex === 0 ? 1 : 0) : -1;
    const idAt = (slot: number) => (slot === frameSlot ? frameId : ids[slot]);
    const otherSlot = (slot: number) =>
      slot % count === typedIndex ? (slot + 1) % count : slot % count;
    const suggesting = new Set<number>();

    if (holdsTyped && workload.pending > 0) {
      const eligible = kinds.flatMap((kind, index) =>
        kind === 'arrow' || index === frameSlot || index === typedIndex
          ? []
          : [index]
      );
      const stride =
        placement === 'head'
          ? 1
          : Math.max(2, Math.floor(eligible.length / workload.pending));

      for (const index of eligible.filter((_index, at) => at % stride === 0)) {
        if (suggesting.size < workload.pending) suggesting.add(index);
      }
    }

    const arrowSlots = kinds.flatMap((kind, index) =>
      kind === 'arrow' ? [index] : []
    );
    const spareSlots = kinds.flatMap((kind, index) =>
      kind === 'geo' &&
      index !== typedIndex &&
      index !== frameSlot &&
      !suggesting.has(index)
        ? [index]
        : []
    );
    const crossingRows = [
      {
        center:
          gridPlace(holdsTyped ? typedIndex : Math.floor(count / 2), grid).y +
          SIZE.height / 2,
        view: 'typed',
      },
      { center: VIEWPORT.height / 2, view: 'origin' },
    ] as const;
    const rowCenters = crossingRows.map((row) => row.center);
    const crossings =
      arrowSlots.length >= workload.arrowsToTyped + rowCenters.length &&
      spareSlots.length >= 2 * rowCenters.length
        ? arrowSlots.slice(-rowCenters.length).map((arrow, row) => ({
            arrow,
            left: spareSlots.at(-2 * row - 2) ?? -1,
            right: spareSlots.at(-2 * row - 1) ?? -1,
          }))
        : [];
    if (holdsTyped) {
      for (const [row, { arrow }] of crossings.entries()) {
        seededCrossings.push({
          shapeId: idAt(arrow),
          view: crossingRows[row].view,
        });
      }
    }
    const moved = new Map<number, BoardPoint>();

    crossingPlaces(rowCenters, grid).forEach((place, at) => {
      const crossing = crossings[Math.floor(at / 2)];

      if (crossing) {
        moved.set(at % 2 === 0 ? crossing.left : crossing.right, place);
      }
    });

    const frameOrigin = frameSlot >= 0 ? gridPlace(frameSlot, grid) : null;
    const frameOf = new Map<number, string>();
    const places = kinds.map((kind, index): BoardPoint => {
      const place = moved.get(index) ?? gridPlace(index, grid);

      if (index === frameSlot || kind === 'arrow' || !frameOrigin) return place;
      const joinsFrame =
        holdsTyped &&
        !moved.has(index) &&
        (index === typedIndex || frameOf.size < workload.frameMembers - 1) &&
        frameOf.size < workload.frameMembers;

      if (!joinsFrame) return place;
      frameOf.set(index, fault === 'F' ? `${frameId}-gone` : frameId);

      return { x: place.x + frameOrigin.x, y: place.y + frameOrigin.y };
    });
    const frameSize = { height: PITCH.y * 4, width: PITCH.x * 4 };
    const anchored = (slot: number, anchor: readonly [number, number]) => {
      const origin = places[slot];
      const size =
        slot === frameSlot ? frameSize : kinds[slot] === 'arrow' ? null : SIZE;

      return {
        x: origin.x + (size?.width ?? 0) * anchor[0],
        y: origin.y + (size?.height ?? 0) * anchor[1],
      };
    };
    const end = (slot: number, shape = idAt(slot)) => ({
      anchor: [0, 0.5],
      shape,
      ...anchored(slot, [0, 0.5]),
    });
    const start = (slot: number, shape = idAt(slot)) => ({
      anchor: [1, 0.5],
      shape,
      ...anchored(slot, [1, 0.5]),
    });
    let boundArrows = 0;

    return kinds.map((kind, index) => {
      const shapeId = idAt(index);
      const zIndex = stackingKey(index);
      const place = places[index];
      const frame = frameOf.get(index);
      const member = frame ? { frame } : {};

      if (index === frameSlot) {
        return {
          children: text(''),
          name: 'Frame',
          place,
          shapeId,
          size: frameSize,
          type: 'boardFrame',
          zIndex,
        };
      }
      if (kind === 'arrow') {
        const crossing = crossings.find((each) => each.arrow === index);
        const bindTyped =
          !crossing && holdsTyped && boundArrows < workload.arrowsToTyped;
        boundArrows += bindTyped ? 1 : 0;
        const head = end(crossing ? crossing.right : otherSlot(index + 3));
        const tail = crossing
          ? start(crossing.left)
          : bindTyped
            ? start(typedIndex, fault === 'A' ? `missing-${index}` : typedId)
            : start(otherSlot(index + 1));

        return {
          children: [paragraph('')],
          end: head,
          ...spanOf(tail, head),
          shapeId,
          start: tail,
          type: 'boardArrow',
          zIndex,
        };
      }

      const suggests = suggesting.has(index);
      const suggest = (key: string, before: string, after: string) =>
        suggests && fault !== 'S'
          ? {
              [key]: after,
              authored: [
                pendingMark(board * 100_000 + index, key, before, after),
              ],
            }
          : { [key]: before };

      if (kind === 'geo') {
        return {
          children: [paragraph(`Label ${index}`)],
          ...member,
          geo: 'rectangle',
          place,
          shapeId,
          size: SIZE,
          type: 'boardGeo',
          zIndex,
          ...suggest('fill', 'blue', 'red'),
        };
      }

      return {
        ...suggest('fill', 'yellow', 'blue'),
        children: [
          { children: text(`Note ${index}`), level: 2, type: 'heading' },
          {
            children: text('First item'),
            indent: 1,
            listType: 'bulleted',
            type: 'paragraph',
          },
          {
            children: text('Second item'),
            indent: 1,
            listType: 'bulleted',
            type: 'paragraph',
          },
        ],
        ...member,
        place,
        shapeId,
        size: SIZE,
        type: 'boardNote',
        zIndex,
      };
    });
  });
  const typedBoardIndex = fault === 'B' ? 0 : typedBoard;
  const typedShapes = boards[typedBoardIndex];
  const typedIndex = typedShapes.findIndex(
    (shape) => shape.shapeId === typedId
  );
  const grid = gridOf(typedShapes.length, workload.dense);
  const rows = Math.ceil(typedShapes.length / grid.columns);
  const camera = workload.dense
    ? {
        x: 0,
        y: 0,
        zoom: Math.min(
          VIEWPORT.width / (grid.columns * grid.pitch.x),
          VIEWPORT.height / (rows * grid.pitch.y)
        ),
      }
    : { x: 0, y: 0, zoom: 1 };

  return {
    camera,
    crossings: seededCrossings,
    typed: {
      board: LEAD_PARAGRAPHS + typedBoardIndex,
      root: boardRootName(typedBoardIndex),
      shapeId: typedId,
      textPath: [typedIndex, 1, 0],
    },
    value: {
      children: [
        ...Array.from({ length: LEAD_PARAGRAPHS }, (_v, index) =>
          paragraph(`Before ${index}`)
        ),
        ...boards.map((_shapes, board) => ({
          childRoots: { shapes: boardRootName(board) },
          children: text(''),
          height: VIEWPORT.height,
          type: 'board',
        })),
        ...Array.from({ length: LEAD_PARAGRAPHS }, (_v, index) =>
          paragraph(`After ${index}`)
        ),
      ],
      roots: Object.fromEntries(
        boards.map((shapes, board) => [boardRootName(board), shapes])
      ),
    },
  };
};

export const shiftBoardFixture = (
  fixture: BoardFixture,
  by: BoardPoint
): BoardFixture => {
  const shift = <P extends BoardPoint>(point: P): P => ({
    ...point,
    x: point.x - by.x,
    y: point.y - by.y,
  });
  const roots = Object.fromEntries(
    Object.entries(fixture.value.roots ?? {}).map(([name, shapes]) => [
      name,
      shapes.map((shape) => {
        const { end, place, start } = shape as {
          end?: BoardPoint;
          place?: BoardPoint;
          start?: BoardPoint;
        };

        return {
          ...shape,
          ...(place ? { place: shift(place) } : {}),
          ...(start ? { start: shift(start) } : {}),
          ...(end ? { end: shift(end) } : {}),
        };
      }),
    ])
  );

  return { ...fixture, value: { ...fixture.value, roots } };
};

const mapRoots = (
  value: BoardValue,
  map: (
    shapes: ReadonlyArray<Record<string, unknown>>
  ) => Array<Record<string, unknown>>
): BoardValue => ({
  ...value,
  roots: Object.fromEntries(
    Object.entries(value.roots ?? {}).map(([name, shapes]) => [
      name,
      map(shapes),
    ])
  ),
});

const BOARD_ORIGIN: BoardPoint = { x: 0, y: 0 };

const toShippedValue = (value: BoardValue): BoardValue =>
  mapRoots(value, (shapes) => {
    const origins = new Map(
      shapes.flatMap((shape) =>
        shape.type === 'boardFrame'
          ? [[shape.shapeId, (shape as StoredNode).place] as const]
          : []
      )
    );

    return shapes.map((shape) => {
      const { place } = shape as StoredNode;

      if (shape.type === 'boardArrow') {
        const { place: _place, size: _size, ...ends } = shape;

        return ends;
      }
      if (shape.type === 'boardFrame' && place) {
        return {
          ...shape,
          place: { origin: { x: place.x, y: place.y }, x: place.x, y: place.y },
        };
      }
      const { frame, ...rest } = shape;

      if (typeof frame !== 'string' || !place) return shape;

      const origin = origins.get(frame) ?? BOARD_ORIGIN;

      return {
        ...rest,
        place: {
          frame,
          frameOrigin: { x: origin.x, y: origin.y },
          x: place.x - origin.x,
          y: place.y - origin.y,
        },
      };
    });
  });

export const toShippedStorage = (fixture: BoardFixture): BoardFixture => ({
  ...fixture,
  value: toShippedValue(fixture.value),
});

export const toStubLayout = (value: StoredValue): StoredValue =>
  mapRoots(value as BoardValue, (shapes) => {
    const origins = new Map(
      shapes.flatMap((shape) => {
        const { place } = shape as StoredNode;

        return shape.type === 'boardFrame' && place?.origin
          ? [[shape.shapeId, place.origin] as const]
          : [];
      })
    );

    return shapes.map((shape) => {
      const { place } = shape as StoredNode;

      if (!place?.frame || !place.frameOrigin) return shape;

      const origin = origins.get(place.frame) ?? place.frameOrigin;

      return {
        ...shape,
        frame: place.frame,
        place: { x: origin.x + place.x, y: origin.y + place.y },
      };
    });
  });

export const buildFlatFixture = (blocks: number) => ({
  textPath: [Math.floor(blocks / 2), 0],
  value: {
    children: Array.from({ length: blocks }, (_value, index) =>
      paragraph(`Line ${index}`)
    ),
  } satisfies BoardValue,
});

type BoundEnd = Readonly<{
  anchor: readonly [number, number];
  shape: string;
  x: number;
  y: number;
}>;

export type StoredNode = Readonly<{
  childRoots?: Readonly<{ shapes?: string }>;
  children?: readonly StoredNode[];
  frame?: string;
  place?: BoardPoint &
    Readonly<{ frame?: string; frameOrigin?: BoardPoint; origin?: BoardPoint }>;
  shapeId?: string;
  size?: { height: number; width: number };
  start?: BoundEnd;
  end?: BoundEnd;
  text?: string;
  type?: string;
}>;

export type StoredValue = Readonly<{
  children: readonly StoredNode[];
  roots?: Readonly<Record<string, readonly StoredNode[]>>;
}>;

const shapesOfBoard = (value: StoredValue, board: StoredNode) =>
  value.roots?.[board.childRoots?.shapes ?? ''] ?? [];

export type BoardReadback = Readonly<{
  arrowsToTyped: number;
  blockCount: number;
  boards: number;
  collaboration: boolean;
  roots: number;
  typedRoot: string | null;
  frameMembers: number;
  pending: number;
  placement: PendingPlacement | 'none' | 'other';
  shapesInView: number;
  shapesPerBoard: number[];
  typedIndex: number;
  typedPosition: TypedPosition | 'other' | 'missing';
}>;

const countTextBlocks = (nodes: readonly StoredNode[]): number =>
  nodes.reduce((sum, node) => {
    if (!node.children || node.type === 'board') return sum;
    if (node.children.every((child) => typeof child.text === 'string')) {
      return sum + 1;
    }

    return sum + countTextBlocks(node.children);
  }, 0);

export const readBoardWorkload = (
  value: StoredValue,
  typedShapeId: string,
  pendingShapes: readonly string[],
  camera: BoardCamera,
  collaboration: boolean
): BoardReadback => {
  const boards = value.children.filter((node) => node.type === 'board');
  const typedBoard = boards.find((board) =>
    shapesOfBoard(value, board).some((shape) => shape.shapeId === typedShapeId)
  );
  const shapes = typedBoard ? shapesOfBoard(value, typedBoard) : [];
  const typedIndex = shapes.findIndex(
    (shape) => shape.shapeId === typedShapeId
  );
  const typed = shapes[typedIndex];
  const ids = new Set(shapes.map((shape) => shape.shapeId));
  const frame = shapes.find(
    (shape) => shape.type === 'boardFrame' && shape.shapeId === typed?.frame
  );
  const view = {
    bottom: camera.y + VIEWPORT.height / camera.zoom,
    left: camera.x,
    right: camera.x + VIEWPORT.width / camera.zoom,
    top: camera.y,
  };
  const inView = (shape: StoredNode) => {
    const start = shape.start ?? shape.place ?? { x: 0, y: 0 };
    const end = shape.end ?? {
      x: start.x + (shape.size?.width ?? 0),
      y: start.y + (shape.size?.height ?? 0),
    };

    return (
      Math.max(start.x, end.x) >= view.left &&
      Math.min(start.x, end.x) <= view.right &&
      Math.max(start.y, end.y) >= view.top &&
      Math.min(start.y, end.y) <= view.bottom
    );
  };
  const last = shapes.length - 1;
  const pendingIds = new Set(pendingShapes);
  const pendingIndexes = shapes.flatMap((shape, index) =>
    shape.shapeId && pendingIds.has(shape.shapeId) ? [index] : []
  );
  const placement =
    pendingIndexes.length === 0
      ? 'none'
      : pendingIndexes.every((index, at) => index === at) &&
          typedIndex === pendingIndexes.length
        ? 'head'
        : pendingIndexes.every(
              (index, at) => at === 0 || index - pendingIndexes[at - 1] > 1
            )
          ? 'spread'
          : 'other';

  return {
    arrowsToTyped: shapes.filter(
      (shape) =>
        shape.type === 'boardArrow' &&
        ids.has(typedShapeId) &&
        (shape.start?.shape === typedShapeId ||
          shape.end?.shape === typedShapeId)
    ).length,
    blockCount: [value.children, ...Object.values(value.roots ?? {})].reduce(
      (sum, nodes) => sum + countTextBlocks(nodes),
      0
    ),
    boards: boards.length,
    collaboration,
    roots: Object.keys(value.roots ?? {}).length,
    typedRoot: typedBoard?.childRoots?.shapes ?? null,
    frameMembers: frame
      ? shapes.filter((shape) => shape.frame === frame.shapeId).length
      : 0,
    pending: new Set(pendingShapes.filter((id) => ids.has(id))).size,
    placement,
    shapesInView: shapes.filter(inView).length,
    shapesPerBoard: boards.map(
      (board) =>
        shapesOfBoard(value, board).filter((child) => isShapeType(child.type))
          .length
    ),
    typedIndex,
    typedPosition:
      typedIndex === -1
        ? 'missing'
        : typedIndex === 0
          ? 'first'
          : typedIndex === last
            ? 'last'
            : typedIndex === Math.floor(shapes.length / 2)
              ? 'middle'
              : 'other',
  };
};

export const expectedReadback = (workload: BoardWorkload) => ({
  arrowsToTyped: workload.arrowsToTyped,
  boards: workload.boards,
  collaboration: false,
  frameMembers: workload.frameMembers,
  pending: workload.pending,
  placement: workload.pending === 0 ? 'none' : workload.placement,
  roots: workload.boards,
  typedRoot: boardRootName(Math.floor(workload.boards / 2)),
  shapesPerBoard: Array.from(
    { length: workload.boards },
    () => workload.shapes
  ),
  typedPosition:
    workload.pending > 0 && workload.placement === 'head'
      ? 'other'
      : workload.position,
  typedIndex: typedIndexOf(workload.shapes, workload),
});

export const readIntent = (
  pendingBefore: number,
  pendingAfter: number
): BoardIntent => (pendingAfter > pendingBefore ? 'suggesting' : 'plain');

let shapeIdCount = 0;
const nextShapeId = () => `gen-${(shapeIdCount += 1)}`;

const shapeContent = (types: readonly string[]) =>
  schema.content.types([...types], {
    default: { type: 'paragraph' },
    min: 1,
  });

const boardProperties = {
  end: schema.elementProperty(property.json(), {
    target: target.types(['boardArrow']),
  }),
  fill: schema.elementProperty(property.string(), {
    target: target.types(['boardGeo', 'boardNote']),
  }),
  frame: schema.elementProperty(property.string(), {
    target: target.types(['boardNote', 'boardGeo']),
  }),
  geo: schema.elementProperty(property.string(), {
    target: target.types(['boardGeo']),
  }),
  height: schema.elementProperty(property.number(), {
    target: target.types(['board']),
  }),
  name: schema.elementProperty(property.string(), {
    target: target.types(['boardFrame']),
  }),
  place: schema.elementProperty(property.json(), {
    target: target.types([
      'boardNote',
      'boardGeo',
      'boardArrow',
      'boardFrame',
      'boardStroke',
    ]),
  }),
  points: schema.elementProperty(property.json(), {
    target: target.types(['boardStroke']),
  }),
  shapeId: schema.elementProperty(property.string({ generate: nextShapeId }), {
    landing: 'preserve',
    role: 'metadata',
    target: target.types([...SHAPE_TYPES]),
    typeChange: 'preserve-if-allowed',
    unique: true,
  }),
  size: schema.elementProperty(property.json(), {
    target: target.types([
      'boardNote',
      'boardGeo',
      'boardArrow',
      'boardFrame',
      'boardStroke',
    ]),
  }),
  start: schema.elementProperty(property.json(), {
    target: target.types(['boardArrow']),
  }),
  zIndex: schema.elementProperty(property.string(), {
    target: target.types([...SHAPE_TYPES]),
  }),
};

const boardElements = {
  board: {
    contentRoots: {
      shapes: {
        content: schema.content.types([...SHAPE_TYPES], { min: 0 }),
        ownership: 'exclusive' as const,
        structure: { kind: 'set' as const },
      },
    },
    void: 'block' as const,
  },
  boardArrow: { content: shapeContent(['paragraph']), object: true },
  boardFrame: { void: 'block' as const },
  boardGeo: { content: shapeContent(['paragraph']), object: true },
  boardNote: { content: shapeContent(['heading', 'paragraph']), object: true },
  boardStroke: { void: 'block' as const },
};

const pliteSchema = defineEditorSchema('board-scale', {
  elements: {
    ...boardElements,
    heading: schema.element.textBlock(),
    paragraph: schema.element.textBlock(),
  },
  id: 'board-scale',
  properties: [
    ...Object.entries(boardProperties).map(([key, entry]) => ({
      ...entry,
      key,
    })),
    schema.elementProperty('level', property.number(), {
      target: target.types(['heading']),
    }),
    schema.elementProperty('indent', property.number(), {
      target: target.types(['paragraph']),
    }),
    schema.elementProperty('listType', property.string(), {
      target: target.types(['paragraph']),
    }),
  ],
  root: schema.content.types(['paragraph', 'heading', 'board'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

export type BoardComponents = Partial<
  Record<keyof typeof boardElements, NodeComponent>
>;

const plateShape = (
  type: keyof typeof boardElements,
  components: BoardComponents
) => {
  const shapeSchema = {
    element: {
      ...boardElements[type],
      blockContent: type === 'board',
    },
  };
  const component = components[type];

  return component
    ? definePlatePlugin(type, { component, schema: shapeSchema })
    : definePlatePlugin(type, { schema: shapeSchema });
};

const BoardPropertiesPlugin = definePlatePlugin('boardProperties', {
  schema: { properties: boardProperties },
});

const ListPropertiesPlugin = definePlatePlugin('listProperties', {
  schema: {
    properties: {
      indent: schema.elementProperty(property.number(), {
        target: target.types(['paragraph']),
      }),
      listType: schema.elementProperty(property.string(), {
        target: target.types(['paragraph']),
      }),
    },
  },
});

export const stubBoardPlugins = (components: BoardComponents = {}) => [
  ...(Object.keys(boardElements) as Array<keyof typeof boardElements>).map(
    (type) => plateShape(type, components)
  ),
  BoardPropertiesPlugin,
];

export const NOTE_TARGETS = [BaseParagraphPlugin, BaseHeadingPlugin] as const;

const shippedBoardPlugins = () => [
  BaseBoardPlugin.configure({
    targetPlugins: [
      BaseBoardNotePlugin,
      BaseBoardGeoPlugin,
      BaseBoardArrowPlugin,
      BaseBoardFramePlugin,
      BaseBoardStrokePlugin,
    ],
  }),
  BaseBoardNotePlugin.configure({ targetPlugins: NOTE_TARGETS }),
  BaseBoardGeoPlugin,
  BaseBoardArrowPlugin,
  BaseBoardFramePlugin,
  BaseBoardStrokePlugin,
];

export const plateBoardPlugins = (
  layer: 'plate' | 'composed',
  board?: readonly PluginReference[]
) => {
  const authoredPlugin = authored({ authorId: 'board-scale' });

  return layer === 'plate'
    ? [
        BaseParagraphPlugin,
        BaseHeadingPlugin,
        ListPropertiesPlugin,
        ...stubBoardPlugins(),
        authoredPlugin,
      ]
    : [
        BaseParagraphPlugin,
        BaseHeadingPlugin,
        BaseListPlugin,
        BaseBlockquotePlugin,
        BaseBoldPlugin,
        BaseItalicPlugin,
        BaseUnderlinePlugin,
        BaseCodePlugin,
        BaseLinkPlugin,
        ...(board ?? shippedBoardPlugins()),
        TrailingBlockPlugin,
        authoredPlugin,
      ];
};

export type TextTarget = Readonly<{ path: readonly number[]; root?: string }>;

export type BoardEditor = Readonly<{
  api: {
    authored: { setView: (view: { intent: 'propose' }) => void };
  };
  install: (plugin: never) => () => void;
  read: {
    authored: { changes: AuthoredChanges };
    root: (name: string) => readonly Descendant[];
    value: () => unknown;
  };
  update: (run: (tx: never) => void) => void;
}>;

export type BoardDriver = Readonly<{
  editor: BoardEditor;
  rootChildren: (root: string) => readonly Descendant[];
  pendingShapes: () => string[];
  select: (target: TextTarget, offset?: number) => void;
  stored: () => StoredValue;
  type: (text: string) => void;
}>;

export type AuthoredChanges = (query: AuthoredQuery) => AuthoredPage;

export const pendingShapesOf = (
  stored: StoredValue,
  changes: AuthoredChanges
) => {
  const shapes: string[] = [];
  let cursor: string | undefined;

  do {
    const page = changes({ cursor, limit: 200 });

    for (const change of page.items) {
      const anchor = change.ranges[0]?.anchor as
        | { path: readonly number[]; root?: string }
        | undefined;
      const shapeId = anchor?.root
        ? stored.roots?.[anchor.root]?.[anchor.path[0]]?.shapeId
        : undefined;

      if (shapeId) shapes.push(shapeId);
    }
    cursor = page.cursor ?? undefined;
  } while (cursor);

  return shapes;
};

export const collapsedAt = (at: TextTarget, offset = 0) => {
  const point = {
    offset,
    path: [...at.path],
    ...(at.root ? { root: at.root } : {}),
  };

  return { anchor: point, focus: point };
};

const driverOf = (editor: BoardEditor): BoardDriver => {
  type Tx = {
    selection: { set: (range: ReturnType<typeof collapsedAt>) => void };
    text: { insert: (text: string) => void };
  };
  const update = editor.update as (run: (tx: Tx) => void) => void;
  const stored = (): StoredValue =>
    toStubLayout(JSON.parse(JSON.stringify(editor.read.value())));

  return {
    editor,
    pendingShapes: () =>
      pendingShapesOf(stored(), (query) => editor.read.authored.changes(query)),
    rootChildren: (root) => editor.read.root(root),
    select: (at, offset) =>
      update((tx) => tx.selection.set(collapsedAt(at, offset))),
    stored,
    type: (input) => update((tx) => tx.text.insert(input)),
  };
};

export const createBoardDriver = (
  layer: BoardLayer,
  value: BoardValue,
  intent: BoardIntent = 'plain'
): BoardDriver => {
  const editor = (layer === 'plite'
    ? createPliteEditor({
        initialValue: value as never,
        plugins: [pliteSchema, authored({ authorId: 'board-scale' })],
      })
    : createPlateEditor({
        initialValue: (layer === 'composed'
          ? toShippedValue(value)
          : value) as never,
        plugins: plateBoardPlugins(layer),
      })) as unknown as BoardEditor;

  if (intent === 'suggesting') {
    editor.api.authored.setView({ intent: 'propose' });
  }

  return driverOf(editor);
};
