import { nanoid } from 'nanoid';

import {
  type BlockInsertOptions,
  definePlugin,
  type DefinitionOf,
  type Element,
  ElementApi,
  type ElementOf,
  type EditorUniqueHolder,
  locateAt,
  type Node,
  type NodeKey,
  type Path,
  property,
  schema,
  target,
  transferVeto,
  type TransferVetoInput,
  txLocate,
} from '../../../core';
import { applyBlockInsertion } from '../../../internal/plugin/blockInsertion';
import { getResolvedPluginTargetBinding } from '../../../internal/plugin/compilePlateModel';
import { BaseBoardGeoPlugin } from './BaseBoardGeoPlugin';
import { BaseBoardNotePlugin } from './BaseBoardNotePlugin';
import {
  BOARD_SHAPES_SLOT,
  type BoardPlace,
  type BoardSize,
  isBoardPlace,
  isBoardSize,
  isStackingKey,
  stackingKeysBetween,
} from './boardShape.internal';

export type { BoardPlace, BoardSize } from './boardShape.internal';

/** A board shape as the board reads it. */
export type BoardShapeEntry = EditorUniqueHolder &
  Readonly<{
    id: string;
    node: Element;
    place: BoardPlace;
    size: BoardSize;
    zIndex: string;
  }>;

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
        { target: target.types(targetElementTypes) }
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
        { target: target.types(targetElementTypes) }
      ),
      zIndex: schema.elementProperty(
        property.string({
          required: true,
          validate: isStackingKey,
          validationVersion: 1,
        }),
        { target: target.types(targetElementTypes) }
      ),
    },
  }),
  targetPlugins: [BaseBoardNotePlugin, BaseBoardGeoPlugin],
})
  .extend(({ editor, plugin, schema: { properties } }) => {
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
      contributions: [transferVeto.of(moveTouchesShape)],
      read: ({ state }) => {
        const entryOf = (
          holder: EditorUniqueHolder,
          node: Element
        ): BoardShapeEntry | null => {
          const place = state.schema.getProperty(node, properties.place);
          const size = state.schema.getProperty(node, properties.size);
          const zIndex = state.schema.getProperty(node, properties.zIndex);

          return place && size && zIndex
            ? {
                ...holder,
                id: state.schema.getProperty(node, properties.shapeId) ?? '',
                node,
                place,
                size,
                zIndex,
              }
            : null;
        };

        return {
          /** The shape whose `shapeId` is `id`, in any board. */
          shape: (id: string): BoardShapeEntry | null => {
            const holder = state.unique.holder('shapeId', id);
            const node = holder && state.nodes.get(holder.key)?.[0];

            return holder && node && ElementApi.isElement(node)
              ? entryOf(holder, node)
              : null;
          },
          /** The shapes of the board block `board`, in stored order. */
          shapes: (board: NodeKey): BoardShapeEntry[] => {
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
  .extend(({ editor, plugin, schema: { properties, type } }) => ({
    update: ({ tx }) => {
      const entriesOf = (ids: readonly string[]) =>
        ids.flatMap((id) => {
          const entry = tx.plugin(plugin.name).shape(id);

          return entry ? [entry] : [];
        });

      return {
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
        /** Move shapes by `delta`. */
        move: txLocate(false, (ids: readonly string[], delta: BoardPlace) => {
          for (const { key, node } of entriesOf(ids)) {
            const place = tx.schema.getProperty(node, properties.place);

            if (!place) continue;

            tx.nodes.set(
              { place: { x: place.x + delta.x, y: place.y + delta.y } },
              { at: key }
            );
          }
        }),
        /** Remove shapes. */
        remove: txLocate(false, (ids: readonly string[]) => {
          for (const { key } of entriesOf(ids)) tx.nodes.remove({ at: key });
        }),
        /** Set a shape's place and size together, as a resize from any edge. */
        resize: txLocate(false, (id: string, rect: BoardPlace & BoardSize) => {
          const [shape] = entriesOf([id]);

          if (!shape) return;

          tx.nodes.set(
            {
              place: { x: rect.x, y: rect.y },
              size: { height: rect.height, width: rect.width },
            },
            { at: shape.key }
          );
        }),
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
  }));

export type BoardDefinition = DefinitionOf<typeof BaseBoardPlugin>;

export type BoardElement = ElementOf<typeof BaseBoardPlugin>;
