import {
  type EditorStateNodesApi,
  type EditorStateSchemaApi,
  type EditorStateUniqueApi,
  type EditorUniqueHolder,
  type Element,
  ElementApi,
  type SchemaPropertyHandle,
} from '../../../core';
import {
  arrowEndsOf,
  type BoardArrowEnd,
  type BoardArrowEnds,
  boardTargetsOn,
  resolveBoardArrow,
} from './boardArrow.internal';
import {
  BOARD_FRAME_TYPE,
  boardFrameOf,
  type BoardFramePlace,
  boardPointOf,
  type BoardShapePlace,
  isFrameable,
} from './boardFrame.internal';
import type { BoardPlace, BoardSize } from './boardShape.internal';

/**
 * A board shape that a frame can hold, as the board reads it. `place` is its
 * top-left corner in board coordinates, and `frame` the id of the frame that
 * holds it, when one does.
 */
export type BoardShapeEntry = EditorUniqueHolder &
  Readonly<{
    frame?: string;
    id: string;
    kind: 'shape';
    node: Element;
    place: BoardPlace;
    size: BoardSize;
    zIndex: string;
  }>;

/**
 * A board frame, as the board reads it: its top-left corner `place` in board
 * coordinates, its size, and the `origin` its members measure from.
 */
export type BoardFrameEntry = EditorUniqueHolder &
  Readonly<{
    id: string;
    kind: 'frame';
    node: Element;
    origin: BoardPlace;
    place: BoardPlace;
    size: BoardSize;
    zIndex: string;
  }>;

/** A board arrow, with its stored ends, as the board reads it. */
export type BoardArrowEntry = EditorUniqueHolder &
  Readonly<{
    end: BoardArrowEnd;
    id: string;
    kind: 'arrow';
    node: Element;
    start: BoardArrowEnd;
    zIndex: string;
  }>;

/** Any member of a board, as the board reads it. */
export type BoardMemberEntry =
  | BoardArrowEntry
  | BoardFrameEntry
  | BoardShapeEntry;

/**
 * The board's member property handles. `framePlace` is absent on a board
 * whose plugins hold no frame.
 */
export type BoardMemberProperties = Readonly<{
  framePlace?: SchemaPropertyHandle<string, BoardFramePlace>;
  place: SchemaPropertyHandle<string, BoardShapePlace>;
  shapeId: SchemaPropertyHandle<string, string>;
  size: SchemaPropertyHandle<string, BoardSize>;
  zIndex: SchemaPropertyHandle<string, string>;
}>;

type BoardReader = Readonly<{
  nodes: Pick<EditorStateNodesApi, 'get'>;
  root: (root: string) => readonly Element[];
  schema: Pick<EditorStateSchemaApi, 'getProperty'>;
  unique: EditorStateUniqueApi;
}>;

const holderNodeOf =
  ({ nodes, unique }: Pick<BoardReader, 'nodes' | 'unique'>) =>
  (id: string) => {
    const holder = unique.holder('shapeId', id);
    const node = holder && nodes.get(holder.key)?.[0];

    return holder && node && ElementApi.isElement(node)
      ? ([holder, node] as const)
      : undefined;
  };

/**
 * The board's member reader over one state. It reads each property through
 * the board's schema handles.
 */
export const boardMembersOf = (
  reader: BoardReader,
  properties: BoardMemberProperties
) => {
  const { schema, unique } = reader;
  const nodeOf = holderNodeOf(reader);
  const frameOf = (
    holder: EditorUniqueHolder,
    node: Element
  ): BoardFrameEntry | undefined => {
    if (node.type !== BOARD_FRAME_TYPE || !properties.framePlace) {
      return undefined;
    }

    const place = schema.getProperty(node, properties.framePlace);
    const size = schema.getProperty(node, properties.size);
    const id = schema.getProperty(node, properties.shapeId);
    const zIndex = schema.getProperty(node, properties.zIndex);

    return place && size && id && zIndex
      ? {
          ...holder,
          id,
          kind: 'frame',
          node,
          origin: place.origin,
          place: { x: place.x, y: place.y },
          size,
          zIndex,
        }
      : undefined;
  };
  const entryOf = (
    holder: EditorUniqueHolder,
    node: Element,
    frameOn: (id: string) => BoardFrameEntry | undefined
  ): BoardMemberEntry | null => {
    if (node.type === BOARD_FRAME_TYPE) return frameOf(holder, node) ?? null;

    const id = schema.getProperty(node, properties.shapeId);
    const zIndex = schema.getProperty(node, properties.zIndex);
    const arrow = arrowEndsOf(node);

    if (!id || !zIndex) return null;
    if (arrow) return { ...holder, ...arrow, id, kind: 'arrow', node, zIndex };

    const stored = schema.getProperty(node, properties.place);
    const size = schema.getProperty(node, properties.size);

    if (!stored || !size) return null;

    const { frame: inFrame, point } = boardPointOf(stored, frameOn);

    return {
      ...holder,
      ...(inFrame === undefined ? {} : { frame: inFrame }),
      id,
      kind: 'shape',
      node,
      place: point,
      size,
      zIndex,
    };
  };
  const frameIn = (root: string) => (id: string) => {
    const found = nodeOf(id);

    return found?.[0].root === root ? frameOf(...found) : undefined;
  };
  const heldIn = (root: string) =>
    reader.root(root).flatMap((node) => {
      const id = schema.getProperty(node, properties.shapeId);
      const holder = id && unique.holder('shapeId', id);

      return holder ? [[holder, node] as const] : [];
    });
  const framesIn = (root: string) =>
    heldIn(root).flatMap(([holder, node]) => frameOf(holder, node) ?? []);

  const member = (id: string) => {
    const found = nodeOf(id);

    return found ? entryOf(...found, frameIn(found[0].root)) : null;
  };

  return {
    /**
     * Where the arrow `id` draws its two ends, or null when `id` names no
     * arrow.
     */
    arrowEnds: (id: string): BoardArrowEnds | null => {
      const arrow = member(id);

      return arrow?.kind === 'arrow'
        ? resolveBoardArrow(arrow, boardTargetsOn(member, arrow.root))
        : null;
    },
    /** The member whose `shapeId` is `id`, in any board. */
    member,
    /** The frames of the board root `root`, in stored order. */
    framesIn,
    /** The members of the board root `root`, in stored order. */
    membersIn: (root: string): BoardMemberEntry[] => {
      const held = heldIn(root);
      const frames = new Map(
        held.flatMap(([holder, node]) => {
          const frame = frameOf(holder, node);

          return frame ? [[frame.id, frame] as const] : [];
        })
      );

      return held.flatMap(([holder, node]) => {
        const entry = entryOf(holder, node, (id) => frames.get(id));

        return entry ? [entry] : [];
      });
    },
  };
};

export type BoardMembers = ReturnType<typeof boardMembersOf>;

/**
 * The frames and frameable shapes of a board, read from raw nodes, for the
 * board's member plugins: a target plugin holds no handle for a property its
 * board declares, so it cannot read through `boardMembersOf`.
 */
export const boardNodeMembersOf = (
  reader: Pick<BoardReader, 'nodes' | 'unique'>
) => {
  const nodeOf = holderNodeOf(reader);

  return {
    member: (id: string): BoardFrameEntry | BoardShapeEntry | null => {
      const found = nodeOf(id);

      if (!found) return null;

      const [holder, node] = found;
      const frame = boardFrameOf(node);

      if (frame) return { ...holder, ...frame, kind: 'frame', node };
      if (!isFrameable(node) || typeof node.zIndex !== 'string') return null;

      const { frame: inFrame, point } = boardPointOf(node.place, (shape) => {
        const framed = nodeOf(shape);

        return framed?.[0].root === holder.root
          ? boardFrameOf(framed[1])
          : undefined;
      });

      return {
        ...holder,
        ...(inFrame === undefined ? {} : { frame: inFrame }),
        id,
        kind: 'shape',
        node,
        place: point,
        size: node.size,
        zIndex: node.zIndex,
      };
    },
  };
};
