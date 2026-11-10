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
} from 'platejs';
import {
  createEditor as createPliteEditor,
  defineEditorSchema,
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

/**
 * The Scale gate's stub board: a disposable forecast of the board's stored
 * shape, built from stubs so the A, S and F cohorts run before any board code
 * ships. The Bun and Node model lanes and the apps/plite browser lanes import
 * it, so every lane types into the same document.
 */

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

/**
 * Where the S pending shapes sit: `spread` keeps no two adjacent, and `head`
 * is one run from the board's first child that ends right before the typed
 * note, which then sits at index S.
 */
export type PendingPlacement = 'spread' | 'head';

/** How the lane types: Plain writes as written, Suggesting records a suggestion. */
export type BoardIntent = 'plain' | 'suggesting';

/** One cohort's workload, as its name claims it. */
export type BoardWorkload = Readonly<{
  /** Shapes per board, N. */
  shapes: number;
  /** Boards in the document, B. Each holds `shapes`. */
  boards: number;
  /** Arrows bound to the typed note, A. */
  arrowsToTyped: number;
  /** Shapes holding one pending authored suggestion each, S. */
  pending: number;
  /** Members of the typed note's frame, the typed note included, F. */
  frameMembers: number;
  position: TypedPosition;
  placement: PendingPlacement;
  intent: BoardIntent;
  /** All shapes in view at the smallest zoom, instead of about 40. */
  dense: boolean;
}>;

/** The parameter a known-bad cohort breaks while keeping its name. */
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

/** A valid fractional-indexing key whose bytewise order follows `index`. */
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
  /** Top-level index of the board block that owns the typed note's root. */
  board: number;
  /** The root that holds the typed note. */
  root: string;
  shapeId: string;
  /** Path of the typed note's first paragraph's text, inside `root`. */
  textPath: number[];
}>;

/** A document as the editor loads it: the main root and each board's root. */
export type BoardValue = {
  children: Array<Record<string, unknown>>;
  roots?: Record<string, Array<Record<string, unknown>>>;
};

/** An arrow the typed note's board seeds to cross one view with both ends off screen. */
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

/**
 * A pending property suggestion as the authored layer stores it, so a load
 * holds S open suggestions without S separate proposal commits.
 */
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

/**
 * 70% notes, 20% geo shapes and 10% arrows, the typed index a note. A head
 * run makes its first `notesFirst` shapes notes, so the run is unbroken.
 */
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

const gridColumns = (count: number) => Math.max(8, Math.ceil(Math.sqrt(count)));

const gridPlace = (index: number, columns: number) => ({
  x: (index % columns) * PITCH.x,
  y: Math.floor(index / columns) * PITCH.y,
});

type ShapePlace = BoardPoint &
  Readonly<{ frame?: string; frameOrigin?: BoardPoint }>;

/** A shape's top-left corner in board coordinates; a frame member's place is relative to its frame. */
const boardOrigin = (place: ShapePlace | undefined) => ({
  x: (place?.x ?? 0) + (place?.frame ? (place.frameOrigin?.x ?? 0) : 0),
  y: (place?.y ?? 0) + (place?.frame ? (place.frameOrigin?.y ?? 0) : 0),
});

/**
 * The places of the arrows that cross a view with both ends off screen, one
 * pair of end shapes per row: the typed note's row, which the typed view
 * centers, and the origin view's middle row. Each pair sits one board width
 * left of the grid and one board width right of it, past the dense view too.
 */
const crossingPlaces = (rowCenters: readonly number[], columns: number) =>
  rowCenters.flatMap((center) => {
    const y = center - SIZE.height / 2;
    const width = columns * PITCH.x;

    return [
      { x: -width - SIZE.width, y },
      { x: 2 * width, y },
    ];
  });

/**
 * Builds the Scale gate's document: 10 paragraphs, the boards, then 10
 * paragraphs. A fault keeps the workload's name and breaks one parameter, so
 * the read-back must catch it.
 */
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
    const columns = gridColumns(count);
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

    // The last arrows cross the views, bound to the last spare geo shapes,
    // which move off the grid; the typed note's arrows come first.
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
          gridPlace(holdsTyped ? typedIndex : Math.floor(count / 2), columns)
            .y +
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

    crossingPlaces(rowCenters, columns).forEach((place, at) => {
      const crossing = crossings[Math.floor(at / 2)];

      if (crossing) {
        moved.set(at % 2 === 0 ? crossing.left : crossing.right, place);
      }
    });

    let framed = 0;
    const places = kinds.map((kind, index): ShapePlace => {
      const place = moved.get(index) ?? gridPlace(index, columns);

      if (index === frameSlot || kind === 'arrow') return place;
      const joinsFrame =
        holdsTyped &&
        !moved.has(index) &&
        (index === typedIndex || framed < workload.frameMembers - 1) &&
        framed < workload.frameMembers;
      framed += joinsFrame ? 1 : 0;

      return joinsFrame
        ? {
            ...place,
            frame: fault === 'F' ? `${frameId}-gone` : frameId,
            frameOrigin: gridPlace(frameSlot, columns),
          }
        : place;
    });
    const frameSize = { height: PITCH.y * 4, width: PITCH.x * 4 };
    /** The board point at `anchor` on the shape in `slot`, in fractions of its width and height. */
    const anchored = (slot: number, anchor: readonly [number, number]) => {
      const origin = boardOrigin(places[slot]);
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

      if (index === frameSlot) {
        return {
          children: text(''),
          name: 'Frame',
          place: { ...place, origin: place },
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

        return {
          children: [paragraph('')],
          end: end(crossing ? crossing.right : otherSlot(index + 3)),
          shapeId,
          start: crossing
            ? start(crossing.left)
            : bindTyped
              ? start(typedIndex, fault === 'A' ? `missing-${index}` : typedId)
              : start(otherSlot(index + 1)),
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
        ...suggest('color', 'yellow', 'blue'),
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
  const columns = gridColumns(typedShapes.length);
  const rows = Math.ceil(typedShapes.length / columns);
  const camera = workload.dense
    ? {
        x: 0,
        y: 0,
        zoom: Math.min(
          VIEWPORT.width / (columns * PITCH.x),
          VIEWPORT.height / (rows * PITCH.y)
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
          height: 480,
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

/** A document of `blocks` paragraphs, typed in the middle one. */
export const buildFlatFixture = (blocks: number) => ({
  textPath: [Math.floor(blocks / 2), 0],
  value: {
    children: Array.from({ length: blocks }, (_value, index) =>
      paragraph(`Line ${index}`)
    ),
  } satisfies BoardValue,
});

export type StoredNode = Readonly<{
  childRoots?: Readonly<{ shapes?: string }>;
  children?: readonly StoredNode[];
  place?: { frame?: string; frameOrigin?: BoardPoint; x: number; y: number };
  shapeId?: string;
  size?: { height: number; width: number };
  start?: { shape: string; x: number; y: number };
  end?: { shape: string; x: number; y: number };
  text?: string;
  type?: string;
}>;

/** A document as it would persist. */
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
  /** Named roots the document holds. */
  roots: number;
  /** The root that holds the typed note, or null when no board does. */
  typedRoot: string | null;
  frameMembers: number;
  pending: number;
  placement: PendingPlacement | 'none' | 'other';
  shapesInView: number;
  shapesPerBoard: number[];
  typedIndex: number;
  typedPosition: TypedPosition | 'other' | 'missing';
}>;

// A board block is void, so its one empty text is no text block.
const countTextBlocks = (nodes: readonly StoredNode[]): number =>
  nodes.reduce((sum, node) => {
    if (!node.children || node.type === 'board') return sum;
    if (node.children.every((child) => typeof child.text === 'string')) {
      return sum + 1;
    }

    return sum + countTextBlocks(node.children);
  }, 0);

/**
 * Reads the workload back from a live document, so a cohort whose fixture
 * ignored or renamed a parameter cannot measure a default. `pendingShapes`
 * holds the shape each pending ledger suggestion touches.
 */
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
    (shape) =>
      shape.type === 'boardFrame' && shape.shapeId === typed?.place?.frame
  );
  const view = {
    bottom: camera.y + VIEWPORT.height / camera.zoom,
    left: camera.x,
    right: camera.x + VIEWPORT.width / camera.zoom,
    top: camera.y,
  };
  const inView = (shape: StoredNode) => {
    const start = shape.start ?? boardOrigin(shape.place);
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
      ? shapes.filter((shape) => shape.place?.frame === frame.shapeId).length
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

/** What the read-back must show for a workload, field by field. */
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

/**
 * The intent a lane typed in, read back from the authored ledger: Suggesting
 * adds a pending change for the typed text, and Plain adds none.
 */
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
  color: schema.elementProperty(property.string(), {
    target: target.types(['boardNote']),
  }),
  end: schema.elementProperty(property.json(), {
    target: target.types(['boardArrow']),
  }),
  fill: schema.elementProperty(property.string(), {
    target: target.types(['boardGeo']),
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

// A board is a void block that owns one root, and each shape is a top-level
// block of that root.
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

/** A renderer's component for each board element type, for the browser lanes. */
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

const boardPlatePlugins = (components: BoardComponents) => [
  ...(Object.keys(boardElements) as Array<keyof typeof boardElements>).map(
    (type) => plateShape(type, components)
  ),
  BoardPropertiesPlugin,
];

/**
 * The Plate plugins of one layer: Plate core with the board stubs and plain
 * list properties, or Plate composed with the real heading, list, quote, mark
 * and link plugins. Both install the authored plugin, so S runs on each. The
 * browser lanes pass their renderer's components; the model lanes pass none.
 */
export const plateBoardPlugins = (
  layer: 'plate' | 'composed',
  components: BoardComponents = {}
) => {
  const authoredPlugin = authored({ authorId: 'board-scale' });

  return layer === 'plate'
    ? [
        BaseParagraphPlugin,
        BaseHeadingPlugin,
        ListPropertiesPlugin,
        ...boardPlatePlugins(components),
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
        ...boardPlatePlugins(components),
        authoredPlugin,
      ];
};

/** Where the lane types: a path in the main root, or in a named root. */
export type TextTarget = Readonly<{ path: readonly number[]; root?: string }>;

/**
 * The editor a lane drives, as far as the lanes use it, the same on every
 * layer. The H1 lane installs a Yjs binding and writes through a root's view.
 */
export type BoardEditor = Readonly<{
  api: {
    authored: { setView: (view: { intent: 'propose' }) => void };
    history: { redo: () => void; undo: () => void };
  };
  install: (plugin: never) => () => void;
  read: {
    authored: { changes: AuthoredChanges };
    root: (name: string) => readonly Descendant[];
    value: () => unknown;
  };
  update: (run: (tx: never) => void) => void;
}>;

/** What a lane does to one editor, the same on every layer. */
export type BoardDriver = Readonly<{
  editor: BoardEditor;
  /** The live top-level blocks of a named root, for a plant or a read-back that runs per key. */
  rootChildren: (root: string) => readonly Descendant[];
  /** The shape each pending suggestion in the authored ledger touches. */
  pendingShapes: () => string[];
  /** Collapses the selection at the start of the text at `target`. */
  select: (target: TextTarget, offset?: number) => void;
  /**
   * A whole copy of the document as it would persist, for read-backs outside
   * the timed keys; between timed keys its garbage lands in the next key.
   */
  stored: () => StoredValue;
  /** Inserts `text` at the selection in one update, as a keystroke does. */
  type: (text: string) => void;
}>;

export type AuthoredChanges = (query: AuthoredQuery) => AuthoredPage;

/** The shape each pending suggestion's first range starts in. */
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
    JSON.parse(JSON.stringify(editor.read.value()));

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

/**
 * Builds one layer's editor over `value`: raw Plite with its own schema, or
 * Plate. A `suggesting` driver switches its view to Suggesting before typing.
 */
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
        initialValue: value as never,
        plugins: plateBoardPlugins(layer),
      })) as unknown as BoardEditor;

  if (intent === 'suggesting') {
    editor.api.authored.setView({ intent: 'propose' });
  }

  return driverOf(editor);
};
