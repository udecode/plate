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
  type EditorUniqueHolder,
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
import { BaseBoardGeoPlugin } from './BaseBoardGeoPlugin';
import { BaseBoardNotePlugin } from './BaseBoardNotePlugin';
import {
  ARROW_SIDES,
  arrowEndsOf,
  BOARD_ARROW_TYPE,
  type BoardArrowEnd,
  type BoardArrowEnds,
  boardTargetsOn,
  isBoundArrowEnd,
  resolveBoardArrow,
} from './boardArrow.internal';
import {
  type DrawnEndsOf,
  moveShapesTo,
  placeShapeCopies,
  shapeIdOf,
  withCarriedRootSlots,
  withFreshRootShapeIds,
  withSourcePaintOrder,
} from './boardCopy.internal';
import {
  BOARD_ARROW_ATTRIBUTES,
  BOARD_SHAPE_ATTRIBUTES,
  decodeBoardArrowAttributes,
  decodeBoardShapeAttributes,
  encodeBoardArrowAttributes,
  encodeBoardShapeAttributes,
} from './boardHtml.internal';
import {
  BOARD_SHAPES_SLOT,
  type BoardPlace,
  type BoardSize,
  isBoardPlace,
  isBoardSize,
  isStackingKey,
  shapeSelectionMode,
  stackingKeysBetween,
} from './boardShape.internal';

export type { BoardPlace, BoardSize } from './boardShape.internal';
export { defineBoardShape } from './boardShape.internal';

/** A board member with a place and a size, as the board reads it. */
export type BoardShapeEntry = EditorUniqueHolder &
  Readonly<{
    id: string;
    kind: 'shape';
    node: Element;
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
export type BoardMemberEntry = BoardArrowEntry | BoardShapeEntry;

/** Where `restack` moves shapes in paint order. */
export type BoardRestackDirection = 'back' | 'backward' | 'forward' | 'front';

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
          validate: isBoardPlace,
          validationVersion: 1,
        }),
        {
          target: target.types(
            targetElementTypes.filter((type) => type !== BOARD_ARROW_TYPE)
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
        const entryOf = (
          holder: EditorUniqueHolder,
          node: Element
        ): BoardMemberEntry | null => {
          const id = state.schema.getProperty(node, properties.shapeId) ?? '';
          const zIndex = state.schema.getProperty(node, properties.zIndex);
          const arrow = arrowEndsOf(node);

          if (!zIndex) return null;
          if (arrow) {
            return { ...holder, ...arrow, id, kind: 'arrow', node, zIndex };
          }

          const place = state.schema.getProperty(node, properties.place);
          const size = state.schema.getProperty(node, properties.size);

          return place && size
            ? { ...holder, id, kind: 'shape', node, place, size, zIndex }
            : null;
        };
        const memberOf = (id: string) => {
          const holder = state.unique.holder('shapeId', id);
          const node = holder && state.nodes.get(holder.key)?.[0];

          return holder && node && ElementApi.isElement(node)
            ? entryOf(holder, node)
            : null;
        };

        return {
          /**
           * Where the arrow `id` draws its two ends, or null when `id` names
           * no arrow.
           */
          arrowEnds: (id: string): BoardArrowEnds | null => {
            const arrow = memberOf(id);

            return arrow?.kind === 'arrow'
              ? resolveBoardArrow(arrow, boardTargetsOn(state, arrow.root))
              : null;
          },
          /** The member whose `shapeId` is `id`, in any board. */
          shape: memberOf,
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
            const owner = state.nodes.get(board)?.[0];
            const root =
              owner && ElementApi.isElement(owner)
                ? state.schema.getElementContentRoots(owner)[BOARD_SHAPES_SLOT]
                : undefined;

            if (!root) return [];

            return state.root(root).flatMap((node, index) => {
              const entry = entryOf(
                { key: state.key(node), path: [index], root },
                node
              );

              return entry ? [entry] : [];
            });
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
            const copies = tx
              .root(landing)
              .slice(count)
              .map((node) => tx.key(node));

            tx.selection.setNodes(copies, {
              mode: shapeSelectionMode(copies.length),
            });
          });
        }),
      ],
      readMiddleware: ({ around }) => [
        around(editorReads.slice.export, ({ input, next, state }) => {
          const drawnOf: DrawnEndsOf = (source) => {
            const arrow = arrowEndsOf(source);
            const holder =
              arrow && state.unique.holder('shapeId', shapeIdOf(source));

            return holder
              ? resolveBoardArrow(arrow, boardTargetsOn(state, holder.root))
              : undefined;
          };
          const slice = withCarriedRootSlots(
            next(),
            isShape,
            (root) => state.root(root),
            drawnOf
          );
          const sourcesOf = (): Array<Node | undefined> => {
            const { at } = input.options;

            if (input.source !== 'selection') return [];
            if (at === undefined) {
              return state.selection.nodes().map(([node]) => node);
            }

            if (!SelectionApi.isNode(at)) return [];

            const root = SelectionApi.root(at);

            return root
              ? at.paths.map((path) =>
                  path.length === 1 ? state.root(root)[path[0]] : undefined
                )
              : [];
          };
          const sources = sourcesOf();
          const shapes = shapesOf(slice);

          if (
            !shapes ||
            sources.length !== shapes.length ||
            !sources.every(isShape)
          ) {
            return slice;
          }

          return withSourcePaintOrder(slice, shapes, sources, drawnOf);
        }),
        around(editorReads.slice.landing, ({ input, next, state }) => {
          const landed = next();
          const { root } = input.target;
          const shapes = shapesOf(landed.slice);
          const slice =
            root !== undefined && shapes
              ? ContentSlice.withContent(
                  landed.slice,
                  placeShapeCopies(shapes, state.root(root), (node) => {
                    const arrow = arrowEndsOf(node);

                    return arrow
                      ? resolveBoardArrow(arrow, boardTargetsOn(state, root))
                      : undefined;
                  }),
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
        const entriesOf = (ids: readonly string[]) =>
          ids.flatMap((id) => {
            const entry = tx.plugin(plugin.name).shape(id);

            return entry ? [entry] : [];
          });

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
              const owner = tx.nodes.get(board)?.[0];
              const root = isBoard(owner)
                ? tx.schema.getElementContentRoots(owner)[BOARD_SHAPES_SLOT]
                : undefined;
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
           * Move shapes by `delta`. An arrow moves each end that draws free,
           * one whose shape is gone included, and leaves its other ends to
           * their shapes.
           */
          move: txLocate(false, (ids: readonly string[], delta: BoardPlace) => {
            const shift = ({ x, y }: BoardPlace) => ({
              x: x + delta.x,
              y: y + delta.y,
            });

            for (const entry of entriesOf(ids)) {
              const targetOnBoard = boardTargetsOn(tx, entry.root);
              const moved =
                entry.kind === 'shape'
                  ? { place: shift(entry.place) }
                  : Object.fromEntries(
                      ARROW_SIDES.flatMap((side) => {
                        const end = entry[side];

                        return isBoundArrowEnd(end) && targetOnBoard(end.shape)
                          ? []
                          : [[side, { ...end, ...shift(end) }]];
                      })
                    );

              if (Object.keys(moved).length > 0) {
                tx.nodes.set(moved, { at: entry.key });
              }
            }
          }),
          /**
           * Remove shapes. Each arrow left on the board first saves, for each
           * end bound to a removed shape, the point it draws at, keeping the
           * binding so that undo binds it again.
           */
          remove: txLocate(false, (ids: readonly string[]) => {
            const removed = entriesOf(ids);
            const gone = new Set(removed.map(({ id }) => id));

            for (const root of new Set(removed.map((entry) => entry.root))) {
              for (const node of tx.root(root)) {
                const arrow = arrowEndsOf(node);
                const id = shapeIdOf(node);
                const loose = ARROW_SIDES.filter((side) => {
                  const end = arrow?.[side];

                  return end && isBoundArrowEnd(end) && gone.has(end.shape);
                });
                const drawn =
                  arrow && !gone.has(id) && loose.length > 0
                    ? tx.plugin(plugin.name).arrowEnds(id)
                    : null;

                if (!arrow || !drawn) continue;

                tx.nodes.set(
                  Object.fromEntries(
                    loose.map((side) => [
                      side,
                      { ...arrow[side], ...drawn[side] },
                    ])
                  ),
                  { at: tx.key(node) }
                );
              }
            }
            for (const { key } of removed) tx.nodes.remove({ at: key });
          }),
          /** Set a shape's place and size together, as a resize from any edge. */
          resize: txLocate(
            false,
            (id: string, rect: BoardPlace & BoardSize) => {
              const [shape] = entriesOf([id]);

              if (shape?.kind !== 'shape') return;

              tx.nodes.set(
                {
                  place: { x: rect.x, y: rect.y },
                  size: { height: rect.height, width: rect.width },
                },
                { at: shape.key }
              );
            }
          ),
          /**
           * Move shapes in paint order, keeping their order among themselves:
           * above or below every other shape of their board, or past the next
           * shape above or below them.
           */
          restack: txLocate(
            false,
            (ids: readonly string[], direction: BoardRestackDirection) => {
              const [first] = entriesOf(ids);

              if (!first) return;

              const moving = new Set(ids);
              const order = tx
                .root(first.root)
                .map((node) => ({
                  id: tx.schema.getProperty(node, properties.shapeId) ?? '',
                  key: tx.key(node),
                  zIndex: tx.schema.getProperty(node, properties.zIndex) ?? '',
                }))
                .sort((a, b) =>
                  a.zIndex === b.zIndex
                    ? a.id < b.id
                      ? -1
                      : 1
                    : a.zIndex < b.zIndex
                      ? -1
                      : 1
                );
              const stacked = order.filter(({ id }) => moving.has(id));
              const others = order.filter(({ id }) => !moving.has(id));
              const lowest = others[0];
              const highest = others.at(-1);

              if (!lowest || !highest) return;

              let bounds: readonly [string | null, string | null] | null = null;

              if (direction === 'front') {
                bounds = [highest.zIndex, null];
              } else if (direction === 'back') {
                bounds = [null, lowest.zIndex];
              } else if (direction === 'forward') {
                const top = order.findLastIndex(({ id }) => moving.has(id));
                const next = order
                  .slice(top + 1)
                  .find(({ id }) => !moving.has(id));

                if (next) {
                  bounds = [
                    next.zIndex,
                    others.find(({ zIndex }) => zIndex > next.zIndex)?.zIndex ??
                      null,
                  ];
                }
              } else {
                const bottom = order.findIndex(({ id }) => moving.has(id));
                const previous = order
                  .slice(0, bottom)
                  .findLast(({ id }) => !moving.has(id));

                if (previous) {
                  bounds = [
                    others.findLast(({ zIndex }) => zIndex < previous.zIndex)
                      ?.zIndex ?? null,
                    previous.zIndex,
                  ];
                }
              }

              if (!bounds) return;

              const keys = stackingKeysBetween(...bounds, stacked.length);

              stacked.forEach(({ key }, index) => {
                tx.nodes.set({ zIndex: keys[index] }, { at: key });
              });
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
