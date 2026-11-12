import { nanoid } from 'nanoid';

import {
  type BlockInsertOptions,
  ContentSlice,
  definePlugin,
  type DefinitionOf,
  editorCommands,
  editorReads,
  type Element,
  ElementApi,
  type ElementOf,
  locateAt,
  type Node,
  type NodeKey,
  nodeWriteVeto,
  type Path,
  property,
  RangeApi,
  schema,
  SelectionApi,
  target,
  transferVeto,
  type TransferVetoInput,
  txLocate,
} from '../../../core';
import { withEditorUpdateRootScope } from '../../../facade';
import { applyBlockInsertion } from '../../../internal/plugin/blockInsertion';
import { getResolvedPluginTargetBinding } from '../../../internal/plugin/compilePlateModel';
import { BaseBoardArrowPlugin } from './BaseBoardArrowPlugin';
import { BaseBoardFramePlugin } from './BaseBoardFramePlugin';
import { BaseBoardGeoPlugin } from './BaseBoardGeoPlugin';
import { BaseBoardNotePlugin } from './BaseBoardNotePlugin';
import {
  ARROW_SIDES,
  BOARD_ARROW_TYPE,
  boardTargetsOn,
  isBoundArrowEnd,
} from './boardArrow.internal';
import {
  moveShapesTo,
  paintKeyOf,
  paintOrder,
  placeShapeCopies,
  shapeIdOf,
  withCarriedRootSlots,
  withFreshRootShapeIds,
  withSourcePaintOrder,
} from './boardCopy.internal';
import {
  BOARD_FRAME_TYPE,
  boxesOverlap,
  isBoardFramePlace,
  isBoardShapePlace,
  placeAmong,
} from './boardFrame.internal';
import {
  BOARD_ARROW_ATTRIBUTES,
  BOARD_SHAPE_ATTRIBUTES,
  decodeBoardArrowAttributes,
  decodeBoardShapeAttributes,
  encodeBoardArrowAttributes,
  encodeBoardShapeAttributes,
} from './boardHtml.internal';
import {
  type BoardFrameEntry,
  type BoardMemberEntry,
  boardMembersOf,
  type BoardShapeEntry,
} from './boardMember.internal';
import {
  BOARD_SHAPES_SLOT,
  type BoardPlace,
  type BoardRestackDirection,
  boardShapesRootOf,
  type BoardSize,
  isBoardSize,
  isStackingKey,
  restackKeys,
  shapeSelectionMode,
} from './boardShape.internal';

export type { BoardFramePlace, BoardShapePlace } from './boardFrame.internal';
export type {
  BoardArrowEntry,
  BoardFrameEntry,
  BoardMemberEntry,
  BoardShapeEntry,
} from './boardMember.internal';
export type {
  BoardPlace,
  BoardRestackDirection,
  BoardSize,
} from './boardShape.internal';
export { defineBoardShape } from './boardShape.internal';

/**
 * A board: a void block that owns one content root, whose top-level blocks
 * are its shapes. Each shape is one of `targetPlugins`, holds a document-wide
 * unique `shapeId`, and paints by its `zIndex`, a fractional key.
 */
export const BaseBoardPlugin = definePlugin('board', {
  schema: ({ targetElementTypes }) => ({
    element: {
      blockContent: true,
      contentRoots: {
        [BOARD_SHAPES_SLOT]: {
          content: schema.content.types(targetElementTypes, { min: 0 }),
          ownership: 'exclusive',
          structure: { kind: 'set' },
        },
      },
      properties: {
        height: property.number({ default: 480 }),
      },
      void: 'block',
    },
    properties: {
      place: schema.elementProperty(
        property.json({
          required: true,
          validate: isBoardShapePlace,
          validationVersion: 2,
        }),
        {
          target: target.types(
            targetElementTypes.filter(
              (type) => type !== BOARD_ARROW_TYPE && type !== BOARD_FRAME_TYPE
            )
          ),
          typeChange: 'preserve-if-allowed',
        }
      ),
      shapeId: schema.elementProperty(property.string({ generate: nanoid }), {
        landing: 'preserve',
        role: 'metadata',
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
        unique: true,
      }),
      size: schema.elementProperty(
        property.json({
          required: true,
          validate: isBoardSize,
          validationVersion: 1,
        }),
        {
          target: target.types(
            targetElementTypes.filter((type) => type !== BOARD_ARROW_TYPE)
          ),
          typeChange: 'preserve-if-allowed',
        }
      ),
      zIndex: schema.elementProperty(
        property.string({
          required: true,
          validate: isStackingKey,
          validationVersion: 1,
        }),
        {
          target: target.types(targetElementTypes),
          typeChange: 'preserve-if-allowed',
        }
      ),
      ...(targetElementTypes.includes(BOARD_FRAME_TYPE)
        ? {
            framePlace: schema.elementProperty(
              'place',
              property.json({
                required: true,
                validate: isBoardFramePlace,
                validationVersion: 1,
              }),
              {
                target: target.types([BOARD_FRAME_TYPE]),
                typeChange: 'preserve-if-allowed',
              }
            ),
          }
        : {}),
    },
  }),
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        decode: ({ element, preserve }) => {
          const height = Number(element.getAttribute('data-board-height'));

          preserve('data-board', 'data-board-height');

          return {
            contentRoots: { [BOARD_SHAPES_SLOT]: element },
            ...(height > 0 ? { height } : {}),
          };
        },
        encode: ({ content, contentRoot, node, preserve }) => {
          preserve('height');

          return {
            attributes: {
              'data-board': 'board',
              'data-board-height': node.height,
            },
            children: [content, contentRoot(BOARD_SHAPES_SLOT)],
            tag: 'div',
          };
        },
        match: [{ attributes: { 'data-board': 'board' }, tag: 'div' }],
      },
      markdown: {
        encode: ({ contentRoot, encodeFlow, report }) =>
          contentRoot(BOARD_SHAPES_SLOT).flatMap((shape) => {
            if (!ElementApi.isElement(shape)) return [];

            const dropped = Object.keys(shape).filter(
              (key) => key !== 'children' && key !== 'type'
            );

            report({
              action: 'dropped',
              kind: 'property',
              message: `Board Markdown omitted ${dropped
                .map((key) => `"${key}"`)
                .join(', ')} of a "${shape.type}" shape.`,
              nodeType: shape.type,
            });

            return encodeFlow(shape.children);
          }),
      },
    }),
  targetPlugins: [
    BaseBoardNotePlugin,
    BaseBoardGeoPlugin,
    BaseBoardArrowPlugin,
    BaseBoardFramePlugin,
  ],
})
  .extend(({ defineFormats, editor, plugin, schema: { properties, type } }) => {
    const isShape = (node: Node) =>
      ElementApi.isElement(node) &&
      getResolvedPluginTargetBinding(editor, plugin).types.includes(node.type);
    const holdsShape = (
      view: TransferVetoInput['from'],
      path: Path | undefined
    ) => {
      const top = path && view.read.nodes.get([path[0]])?.[0];

      return !!top && isShape(top);
    };
    const moveTouchesShape = (
      { from, intent, payload, target: [, targetPath] }: TransferVetoInput,
      view: TransferVetoInput['from']
    ) =>
      intent === 'move' &&
      payload.kind === 'nodes' &&
      (holdsShape(view, targetPath) ||
        payload.nodes.some(isShape) ||
        payload.parentKeys.some(
          (key) => key !== null && holdsShape(from, from.read.nodes.path(key))
        ));

    return {
      formats: defineFormats(BaseBoardNotePlugin, {
        html: {
          decode: ({ element, preserve }) => {
            const shape = decodeBoardShapeAttributes(element);

            if (!shape) return undefined;
            preserve(...BOARD_SHAPE_ATTRIBUTES, 'data-board-color');

            const color = element.getAttribute('data-board-color');

            return { ...shape, ...(color === null ? {} : { color }) };
          },
          encode: ({ node, preserve }) => {
            preserve('color', 'place', 'size', 'zIndex');

            return {
              attributes: {
                ...encodeBoardShapeAttributes(node),
                'data-board-color': node.color,
                'data-board': 'note',
              },
              tag: 'div',
            };
          },
          match: [{ attributes: { 'data-board': 'note' }, tag: 'div' }],
        },
      }),
      contributions: [
        transferVeto.of(moveTouchesShape),
        nodeWriteVeto.of(
          (write) =>
            write.node.type === type ||
            (write.kind === 'retype' &&
              isShape(write.node) &&
              !isShape({ ...write.node, type: write.type }))
        ),
      ],
      read: ({ state }) => {
        const members = boardMembersOf(state, properties);

        return {
          /**
           * Where the arrow `id` draws its two ends, or null when `id` names
           * no arrow.
           */
          arrowEnds: members.arrowEnds,
          /** The member whose `shapeId` is `id`, in any board. */
          shape: members.member,
          /**
           * The slice a copy of shapes `ids` carries, as the clipboard exports
           * it, or null when no id names a shape or they sit in two boards.
           */
          slice: (ids: readonly string[]): ContentSlice | null => {
            const holders = ids.flatMap((id) => {
              const holder = state.unique.holder('shapeId', id);

              return holder ? [holder] : [];
            });
            const [first, ...rest] = holders.map(({ path }) => path);
            const root = holders[0]?.root;

            if (
              !first ||
              root === undefined ||
              holders.some((holder) => holder.root !== root)
            ) {
              return null;
            }

            return state.slice.export({
              at: SelectionApi.nodes([first, ...rest], {
                mode: 'block',
                ...(root === 'main' ? {} : { root }),
              }),
            });
          },
          /** The members of the board block `board`, in stored order. */
          shapes: (board: NodeKey): BoardMemberEntry[] => {
            const root = boardShapesRootOf(state, board);

            return root ? members.membersIn(root) : [];
          },
        };
      },
    };
  })
  .extend(({ defineFormats, editor, plugin, schema: { properties, type } }) => {
    const isShape = (node: Node | undefined): node is Element =>
      !!node &&
      ElementApi.isElement(node) &&
      getResolvedPluginTargetBinding(editor, plugin).types.includes(node.type);
    const isBoard = (node: Node | undefined): node is Element =>
      !!node && ElementApi.isElement(node) && node.type === type;
    const isClosed = (slice: ContentSlice) =>
      slice.openStart === 0 && slice.openEnd === 0;
    const shapesOf = (slice: ContentSlice): Element[] | null =>
      isClosed(slice) &&
      slice.content.length > 0 &&
      slice.content.every(isShape)
        ? [...slice.content]
        : null;

    return {
      formats: defineFormats(BaseBoardGeoPlugin, {
        html: {
          decode: ({ element, preserve }) => {
            const shape = decodeBoardShapeAttributes(element);

            if (!shape) return undefined;
            preserve(
              ...BOARD_SHAPE_ATTRIBUTES,
              'data-board-fill',
              'data-board-geo'
            );

            const fill = element.getAttribute('data-board-fill');
            const geo = element.getAttribute('data-board-geo');

            return {
              ...shape,
              ...(fill === null ? {} : { fill }),
              ...(geo === 'diamond' ||
              geo === 'ellipse' ||
              geo === 'rectangle' ||
              geo === 'triangle'
                ? { geo }
                : {}),
            };
          },
          encode: ({ node, preserve }) => {
            preserve('fill', 'geo', 'place', 'size', 'zIndex');

            return {
              attributes: {
                ...encodeBoardShapeAttributes(node),
                'data-board-fill': node.fill,
                'data-board-geo': node.geo,
                'data-board': 'geo',
              },
              tag: 'div',
            };
          },
          match: [{ attributes: { 'data-board': 'geo' }, tag: 'div' }],
        },
      }),
      commands: ({ around }) => [
        around(editorCommands.replaceSlice, ({ input, next, state }) => {
          const shapesRootOf = (board: Element) =>
            state.schema.getElementContentRoots(board)[BOARD_SHAPES_SLOT];
          const landingRoot = (): string | undefined => {
            const at = input.options?.at ?? state.selection();

            if (typeof at === 'string') {
              const node = state.nodes.get(at)?.[0];

              if (isBoard(node)) return shapesRootOf(node);

              return isShape(node)
                ? state.unique.holder('shapeId', shapeIdOf(node))?.root
                : undefined;
            }
            if (!at || !(SelectionApi.isNode(at) || RangeApi.isRange(at))) {
              return undefined;
            }

            const named = SelectionApi.root(at);
            const path = SelectionApi.isNode(at) ? at.paths[0] : at.anchor.path;

            if (named) {
              return isShape(state.root(named)[path[0]]) ? named : undefined;
            }

            const node = state.nodes.get(path)?.[0];
            const owner = isBoard(node)
              ? node
              : state.nodes.above({ at: path, match: isBoard })?.[0];

            return owner && shapesRootOf(owner);
          };
          const root = shapesOf(input.slice) ? landingRoot() : undefined;

          if (!root) return next();

          const landing = root;
          const count = state.root(landing).length;
          const result = withEditorUpdateRootScope(editor, landing, () =>
            next({ ...input, options: { ...input.options, at: [count] } })
          );

          if (result === false) return false;

          return state.transaction.extend(result, (tx) => {
            const copies = tx.root(landing).slice(count);

            tx.selection.setNodes(
              copies.map((node) => tx.key(node)),
              { mode: shapeSelectionMode(tx.schema, copies) }
            );
          });
        }),
      ],
      readMiddleware: ({ around }) => [
        around(editorReads.slice.export, ({ input, next, state }) => {
          const members = boardMembersOf(state, properties);
          const pickedNodes = (): ReadonlyArray<Node | undefined> => {
            const { at } = input.options;

            if (at === undefined) {
              return state.selection.nodeMode()
                ? state.selection.nodes().map(([node]) => node)
                : [];
            }

            const root = SelectionApi.isNode(at) && SelectionApi.root(at);

            return root
              ? at.paths.map((path) =>
                  path.length === 1 ? state.root(root)[path[0]] : undefined
                )
              : [];
          };
          const nodes = input.source === 'selection' ? pickedNodes() : [];
          const picked = nodes.flatMap((node) =>
            isShape(node) ? (members.member(shapeIdOf(node)) ?? []) : []
          );
          const root = picked[0]?.root;
          const together =
            root !== undefined &&
            picked.length === nodes.length &&
            picked.every((member) => member.root === root);
          const frames = new Set(
            together
              ? picked.flatMap((member) =>
                  member.kind === 'frame' ? [member.id] : []
                )
              : []
          );
          const pickedIds = new Set(picked.map(({ id }) => id));
          const held =
            frames.size > 0 && root !== undefined
              ? members
                  .membersIn(root)
                  .filter(
                    (member) =>
                      member.kind === 'shape' &&
                      member.frame !== undefined &&
                      frames.has(member.frame) &&
                      !pickedIds.has(member.id)
                  )
              : [];
          const sources =
            held.length > 0
              ? [...picked, ...held].toSorted((a, b) => a.path[0] - b.path[0])
              : picked;
          const [first, ...rest] = sources.map(({ path }) => path);
          const widened =
            held.length > 0 && first && root !== undefined
              ? SelectionApi.nodes([first, ...rest], { mode: 'block', root })
              : undefined;
          const exported = widened
            ? next({
                ...input,
                options: { ...input.options, at: widened },
                slice: state.slice.get({ at: widened }),
              })
            : next();
          const slice = withCarriedRootSlots(
            exported,
            isShape,
            members.membersIn,
            members.arrowEnds
          );
          const shapes = shapesOf(slice);

          return together && shapes && sources.length === shapes.length
            ? withSourcePaintOrder(slice, shapes, sources, members.arrowEnds)
            : slice;
        }),
        around(editorReads.slice.landing, ({ input, next, state }) => {
          const landed = next();
          const { root } = input.target;
          const shapes = shapesOf(landed.slice);
          const members = boardMembersOf(state, properties);
          const slice =
            root !== undefined && shapes
              ? ContentSlice.withContent(
                  landed.slice,
                  placeShapeCopies(
                    shapes,
                    members.membersIn(root),
                    members.arrowEnds
                  ),
                  { open: 'preserve' }
                )
              : withFreshRootShapeIds(landed.slice, isShape);

          return {
            ...landed,
            slice,
            ...(landed.replaceEmpty
              ? {
                  replaceEmpty: {
                    ...landed.replaceEmpty,
                    slice: withFreshRootShapeIds(
                      landed.replaceEmpty.slice,
                      isShape
                    ),
                  },
                }
              : {}),
          };
        }),
      ],
      update: ({ tx }) => {
        const members = boardMembersOf(tx, properties);
        const entriesOf = (ids: readonly string[]) =>
          ids.flatMap((id) => members.member(id) ?? []);
        const membersOf = (frame: BoardFrameEntry) =>
          members
            .membersIn(frame.root)
            .filter(
              (member): member is BoardShapeEntry =>
                member.kind === 'shape' && member.frame === frame.id
            );
        const removeEntries = (removed: readonly BoardMemberEntry[]) => {
          const gone = new Set(removed.map(({ id }) => id));

          for (const root of new Set(removed.map((entry) => entry.root))) {
            for (const arrow of members.membersIn(root)) {
              if (arrow.kind !== 'arrow' || gone.has(arrow.id)) continue;

              const loose = ARROW_SIDES.filter((side) => {
                const end = arrow[side];

                return isBoundArrowEnd(end) && gone.has(end.shape);
              });
              const drawn =
                loose.length > 0 ? members.arrowEnds(arrow.id) : null;

              if (!drawn) continue;
              tx.nodes.set(
                Object.fromEntries(
                  loose.map((side) => [
                    side,
                    { ...arrow[side], ...drawn[side] },
                  ])
                ),
                { at: arrow.key }
              );
            }
          }
          for (const { key } of removed) tx.nodes.remove({ at: key });
        };

        return {
          /**
           * Paste a copy of the shapes `slice` holds into the board block
           * `board`, as one change: fresh ids, above every shape of that board,
           * with their top-left corner at `place` when given, and stepped off
           * any shape already at the places they land on. Return the copies'
           * ids, or undefined when `board` is no board, `slice` holds anything
           * but shapes, or the paste is refused.
           */
          insertCopy: txLocate(
            locateAt(1, 'board'),
            (
              slice: ContentSlice,
              { board, place }: Readonly<{ board: NodeKey; place?: BoardPlace }>
            ): string[] | undefined => {
              const root = boardShapesRootOf(tx, board);
              const shapes = shapesOf(slice);

              if (!root || !shapes) return undefined;

              const count = tx.root(root).length;
              const landed = withEditorUpdateRootScope(editor, root, () =>
                tx.command(editorCommands.replaceSlice, {
                  options: { at: [count] },
                  slice: place
                    ? ContentSlice.withContent(
                        slice,
                        moveShapesTo(shapes, place),
                        { open: 'preserve' }
                      )
                    : slice,
                })
              );

              return landed
                ? tx
                    .root(root)
                    .slice(count)
                    .flatMap((node) => (isShape(node) ? [shapeIdOf(node)] : []))
                : undefined;
            }
          ),
          /**
           * Add a board with an empty root under a fresh name, and return the
           * board's key.
           */
          insert: txLocate(
            locateAt(1, 'at', 'after', 'before'),
            (
              { height }: Readonly<{ height?: number }> = {},
              options: BlockInsertOptions = {}
            ) => {
              const root = `${type}:${nanoid()}`;
              let board: NodeKey | undefined;

              applyBlockInsertion({
                editor,
                insert: (insertOptions) => {
                  board = tx.blocks.insert(
                    {
                      ...tx.schema.create(
                        type,
                        height === undefined ? {} : { height }
                      ),
                      childRoots: { [BOARD_SHAPES_SLOT]: root },
                    },
                    insertOptions
                  )?.[0];

                  return board !== undefined;
                },
                matches: (block) => block.type === type,
                mode: 'insert',
                options,
                tx,
              });

              if (board) tx.roots.create(root, []);

              return board;
            }
          ),
          /**
           * Move shapes by `delta`. A frame moves its origin with it, so its
           * members follow it and are skipped when moved with it. Any other
           * shape that is not an arrow then joins the frontmost frame under
           * its middle, or leaves its frame. An arrow moves each end that
           * draws free, one whose shape is gone included, and leaves its
           * other ends to their shapes.
           */
          move: txLocate(false, (ids: readonly string[], delta: BoardPlace) => {
            const shift = ({ x, y }: BoardPlace) => ({
              x: x + delta.x,
              y: y + delta.y,
            });
            const entries = entriesOf(ids);
            const moved = new Set(
              entries.flatMap((entry) =>
                entry.kind === 'frame' ? [entry.id] : []
              )
            );
            const framesAfter = new Map(
              [...new Set(entries.map(({ root }) => root))].map((root) => [
                root,
                members.framesIn(root).map((frame) =>
                  moved.has(frame.id)
                    ? {
                        ...frame,
                        origin: shift(frame.origin),
                        place: shift(frame.place),
                      }
                    : frame
                ),
              ])
            );

            for (const entry of entries) {
              if (entry.kind === 'frame') {
                tx.nodes.set(
                  {
                    place: {
                      ...shift(entry.place),
                      origin: shift(entry.origin),
                    },
                  },
                  { at: entry.key }
                );
              } else if (entry.kind === 'shape') {
                if (entry.frame !== undefined && moved.has(entry.frame)) {
                  continue;
                }
                tx.nodes.set(
                  {
                    place: placeAmong(
                      framesAfter.get(entry.root) ?? [],
                      { place: shift(entry.place), size: entry.size },
                      {
                        current: tx.schema.getProperty(
                          entry.node,
                          properties.place
                        ),
                      }
                    ),
                  },
                  { at: entry.key }
                );
              } else {
                const targetOnBoard = boardTargetsOn(
                  members.member,
                  entry.root
                );
                const ends = Object.fromEntries(
                  ARROW_SIDES.flatMap((side) => {
                    const end = entry[side];

                    return isBoundArrowEnd(end) && targetOnBoard(end.shape)
                      ? []
                      : [[side, { ...end, ...shift(end) }]];
                  })
                );

                if (Object.keys(ends).length > 0) {
                  tx.nodes.set(ends, { at: entry.key });
                }
              }
            }
          }),
          /**
           * Remove shapes, each frame with the shapes it holds. Each arrow
           * left on the board first saves, for each end bound to a removed
           * shape, the point it draws at, keeping the binding so that undo
           * binds it again.
           */
          remove: txLocate(false, (ids: readonly string[]) => {
            const removed = entriesOf(ids);
            const held = removed.flatMap((entry) =>
              entry.kind === 'frame' ? membersOf(entry) : []
            );

            removeEntries([
              ...new Map(
                [...removed, ...held].map((entry) => [entry.id, entry])
              ).values(),
            ]);
          }),
          /**
           * Remove the frame `id` and keep the shapes it holds where they
           * are, each at its board point in no frame.
           */
          removeFrame: txLocate(false, (id: string) => {
            const [frame] = entriesOf([id]);

            if (frame?.kind !== 'frame') return;
            for (const member of membersOf(frame)) {
              tx.nodes.set({ place: member.place }, { at: member.key });
            }
            removeEntries([frame]);
          }),
          /**
           * Set a shape's place and size together, as a resize from any edge.
           * A frame keeps its origin, so its members stay put, and lets go of
           * each member it no longer overlaps. Any other shape joins the
           * frontmost frame under its middle, or leaves its frame.
           */
          resize: txLocate(
            false,
            (id: string, rect: BoardPlace & BoardSize) => {
              const [entry] = entriesOf([id]);
              const box = {
                place: { x: rect.x, y: rect.y },
                size: { height: rect.height, width: rect.width },
              };

              if (entry?.kind === 'shape') {
                tx.nodes.set(
                  {
                    place: placeAmong(members.framesIn(entry.root), box, {
                      current: tx.schema.getProperty(
                        entry.node,
                        properties.place
                      ),
                    }),
                    size: box.size,
                  },
                  { at: entry.key }
                );
              } else if (entry?.kind === 'frame') {
                tx.nodes.set(
                  {
                    place: { ...box.place, origin: entry.origin },
                    size: box.size,
                  },
                  { at: entry.key }
                );
                for (const member of membersOf(entry)) {
                  if (!boxesOverlap(box, member)) {
                    tx.nodes.set({ place: member.place }, { at: member.key });
                  }
                }
              }
            }
          ),
          /**
           * Move shapes in paint order, keeping their order among themselves:
           * above or below every other shape of their board, or past the next
           * shape above or below them. Frames paint behind every other shape,
           * so a frame moves among frames and any other shape among the rest.
           */
          restack: txLocate(
            false,
            (ids: readonly string[], direction: BoardRestackDirection) => {
              const [first] = entriesOf(ids);

              if (!first) return;

              const order = members
                .membersIn(first.root)
                .map((member) => ({ ...paintKeyOf(member), key: member.key }))
                .sort(paintOrder);

              for (const layer of [0, 1] as const) {
                for (const [{ key }, zIndex] of restackKeys(
                  order.filter((member) => member.layer === layer),
                  new Set(ids),
                  direction
                )) {
                  tx.nodes.set({ zIndex }, { at: key });
                }
              }
            }
          ),
        };
      },
    };
  })
  .extend(({ defineFormats }) => ({
    formats: defineFormats(BaseBoardArrowPlugin, {
      html: {
        decode: ({ element, preserve }) => {
          const arrow = decodeBoardArrowAttributes(element);

          if (!arrow) return undefined;
          preserve(...BOARD_ARROW_ATTRIBUTES);

          return arrow;
        },
        encode: ({ node, preserve }) => {
          preserve('end', 'start', 'zIndex');

          return {
            attributes: {
              ...encodeBoardArrowAttributes(node),
              'data-board': 'arrow',
            },
            tag: 'div',
          };
        },
        match: [{ attributes: { 'data-board': 'arrow' }, tag: 'div' }],
      },
    }),
  }));

export type BoardDefinition = DefinitionOf<typeof BaseBoardPlugin>;

export type BoardElement = ElementOf<typeof BaseBoardPlugin>;
