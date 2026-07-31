import {
  BaseParagraphPlugin,
  createBasePlugin,
  type DefinitionOf,
} from '@platejs/core';
import {
  type Element,
  ElementApi,
  type Location,
  NodeApi,
  type NodeEntry,
  type NodeInsertNodesOptions,
  type NodeTarget,
  PathApi,
  property,
  RangeApi,
  schema,
} from '@platejs/plite';
import type { TColumnElement, TColumnGroupElement } from '@platejs/utils';
import { KEYS, NODES } from '@platejs/utils';

export type InsertColumnOptions = NodeInsertNodesOptions<Element> & {
  width?: string;
};

export type InsertColumnGroupOptions = NodeInsertNodesOptions<Element> & {
  columns?: number;
};

export type MoveMiddleColumnOptions = {
  direction: 'left' | 'right';
};

export type SetColumnsOptions = {
  /** Column group location. */
  at?: NodeTarget<TColumnGroupElement>;
  columns?: number;
  widths?: string[];
};

export type ToggleColumnGroupOptions = {
  at?: Location;
  columns?: number;
  widths?: string[];
};

export const BaseColumnItemPlugin = createBasePlugin({
  name: KEYS.column,
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: { type: plugins.elementType(BaseParagraphPlugin) },
        min: 1,
      }),
      properties: { width: property.string() },
      blockContent: false,
    },
  }),
  corrections: [
    {
      event: 'content',
      correct({ editor, entry: [node, path], tx }) {
        const columnGroup = editor.plugin(KEYS.columnGroup);
        const columnGroupType = columnGroup.installed
          ? columnGroup.type
          : KEYS.columnGroup;

        if (
          !ElementApi.isElementType<TColumnGroupElement>(node, columnGroupType)
        ) {
          return;
        }

        const widths = node.children.map((column) => {
          const parsed = Number.parseFloat(column.width);

          return Number.isNaN(parsed) ? 0 : parsed;
        });
        const sum = widths.reduce((total, width) => total + width, 0);

        if (sum === 100) return;

        const adjustment = (100 - sum) / node.children.length;

        widths.forEach((width, index) => {
          tx.nodes.set<TColumnElement>(
            { width: `${width + adjustment}%` },
            { at: path.concat([index]) }
          );
        });
      },
    },
  ],
  update: ({ editor, tx, type }) => {
    const columnType = type;
    const columnGroup = editor.plugin(KEYS.columnGroup);
    const columnGroupType = columnGroup.installed
      ? columnGroup.type
      : KEYS.columnGroup;
    const columnsToWidths = (columns = 2) =>
      new Array(columns).fill(null).map(() => `${100 / columns}%`);
    const set = ({ at, columns, widths }: SetColumnsOptions) => {
      if (!at) return;

      const nextWidths = widths ?? columnsToWidths(columns);

      if (nextWidths.length === 0) return;

      const columnGroup = tx.nodes.get<TColumnGroupElement>(at);

      if (!columnGroup) return;

      const [{ children }, path] = columnGroup;
      const currentCount = children.length;
      const targetCount = nextWidths.length;

      if (currentCount === targetCount) {
        nextWidths.forEach((width, index) => {
          tx.nodes.set<TColumnElement>({ width }, { at: path.concat([index]) });
        });

        return;
      }

      if (targetCount > currentCount) {
        tx.nodes.insert(
          new Array(targetCount - currentCount).fill(null).map((_, index) => ({
            children: [
              {
                children: [{ text: '' }],
                type: editor.plugin(KEYS.p).type,
              },
            ],
            type: columnType,
            width: nextWidths[currentCount + index] || `${100 / targetCount}%`,
          })),
          { at: path.concat([currentCount]) }
        );

        nextWidths.forEach((width, index) => {
          tx.nodes.set<TColumnElement>({ width }, { at: path.concat([index]) });
        });

        return;
      }

      const keepColumnIndex = targetCount - 1;
      const keepColumnPath = path.concat([keepColumnIndex]);

      if (!tx.nodes.get<TColumnElement>(keepColumnPath)) return;

      tx.nodes.replaceChildren(
        children.slice(keepColumnIndex).flatMap((column) => column.children),
        { at: keepColumnPath }
      );

      for (let index = currentCount - 1; index > keepColumnIndex; index--) {
        tx.nodes.remove({ at: path.concat([index]) });
      }

      nextWidths.forEach((width, index) => {
        tx.nodes.set<TColumnElement>({ width }, { at: path.concat([index]) });
      });
    };

    return {
      insert: ({ width = '33%', ...options }: InsertColumnOptions = {}) => {
        tx.nodes.insert(
          {
            children: [
              {
                children: [{ text: '' }],
                type: editor.plugin(KEYS.p).type,
              },
            ],
            type: columnType,
            width,
          },
          options
        );
      },
      insertGroup: ({
        columns = 2,
        select,
        ...options
      }: InsertColumnGroupOptions = {}) => {
        const width = 100 / columns;

        tx.nodes.insert(
          {
            children: new Array(columns).fill(null).map(() => ({
              children: [
                {
                  children: [{ text: '' }],
                  type: editor.plugin(KEYS.p).type,
                },
              ],
              type: columnType,
              width: `${width}%`,
            })),
            type: columnGroupType,
          },
          options
        );

        if (!select) return;

        const entry = tx.nodes.find<Element>({
          at: options.at,
          match: { type: columnType },
        });
        const point = entry && tx.points.start(entry[1]);

        if (point) tx.selection.set(point);
      },
      moveMiddle: (
        [node, path]: NodeEntry<TColumnGroupElement>,
        { direction = 'left' }: Partial<MoveMiddleColumnOptions> = {}
      ) => {
        if (direction !== 'left') return;

        const middleChildNode = NodeApi.get(node, [1]);

        if (!NodeApi.isElement(middleChildNode)) return false;

        const middleChildPath = path.concat([1]);

        if (NodeApi.string(middleChildNode) === '') {
          tx.nodes.remove({ at: middleChildPath });

          return false;
        }

        const firstNode = NodeApi.descendant(node, [0]);

        if (!NodeApi.isElement(firstNode)) return false;

        const appendOffset = firstNode.children.length;

        middleChildNode.children.forEach((_, childIndex) => {
          tx.nodes.move({
            at: middleChildPath.concat([0]),
            to: path.concat([0, appendOffset + childIndex]),
          });
        });
        tx.nodes.remove({ at: middleChildPath });
      },
      selectAll: () => {
        const selection = tx.selection();

        if (!selection) return false;

        const column = tx.nodes.above<Element>({
          at: selection,
          match: { type: columnType },
        });

        if (!column) return false;

        let targetPath = column[1];
        const [start, end] = RangeApi.edges(selection);

        if (
          tx.points.isStart(start, targetPath) &&
          tx.points.isEnd(end, targetPath)
        ) {
          targetPath = PathApi.parent(targetPath);
        }

        if (targetPath.length === 0) return false;

        tx.selection.set(targetPath);

        return true;
      },
      set,
      toggle: ({ at, columns = 2, widths }: ToggleColumnGroupOptions = {}) => {
        const entry = tx.nodes.block<Element>({ at });
        const columnGroupEntry = tx.nodes.above<Element>({
          at,
          match: { type: columnGroupType },
        });

        if (!entry) return;

        if (columnGroupEntry) {
          set({ at: columnGroupEntry[1], columns, widths });

          return;
        }

        const [node, path] = entry;
        const columnWidths = widths ?? columnsToWidths(columns);
        const columnGroup = {
          children: new Array(columns).fill(null).map((_, index) => ({
            children: [
              index === 0
                ? node
                : {
                    children: [{ text: '' }],
                    type: editor.plugin(KEYS.p).type,
                  },
            ],
            type: columnType,
            width: columnWidths[index],
          })),
          type: columnGroupType,
        };
        const parentPath = PathApi.parent(path);
        const index = path.at(-1);

        if (index === undefined) return;

        tx.nodes.replaceChildren([columnGroup], {
          at: parentPath,
          count: 1,
          index,
        });

        const point = tx.points.start(path.concat([0]));

        if (point) tx.selection.set(point);
      },
    };
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/markdown': {
        from: 'column',
        kind: 'node',
        decode: ({ decode, decoration, node, parseAttributes, type }) => ({
          children: decode(node.children, decoration),
          type,
          ...parseAttributes(node.attributes),
        }),
        encode: ({ encodeFlow, node, propsToAttributes }) => {
          const { children, id: _, type, ...rest } = node;

          return {
            attributes: propsToAttributes(rest),
            children: encodeFlow(children),
            name: type,
            type: 'mdxJsxFlowElement',
          };
        },
      },
    }),
  shortcuts: { selectAll: { keys: 'mod+a' } },
});

export const BaseColumnPlugin = createBasePlugin({
  name: KEYS.columnGroup,
  dependencies: [BaseColumnItemPlugin],
  schema: ({ plugins }) => {
    const columnType = plugins.elementType(BaseColumnItemPlugin);

    return {
      element: {
        content: schema.content.type(columnType, {
          default: { type: columnType },
          min: 2,
        }),
        properties: {
          layout: property.json({
            validate: (value): value is readonly number[] =>
              Array.isArray(value) &&
              value.every(
                (width) => typeof width === 'number' && Number.isFinite(width)
              ),
            validationVersion: 1,
          }),
        },
      },
    };
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/markdown': {
        from: 'column_group',
        kind: 'node',
        decode: ({ decode, decoration, node, parseAttributes, type }) => ({
          children: decode(node.children, decoration),
          type,
          ...parseAttributes(node.attributes),
        }),
        encode: ({ encodeFlow, node, propsToAttributes }) => {
          const { children, id: _, type, ...rest } = node;

          return {
            attributes: propsToAttributes(rest),
            children: encodeFlow(children),
            name: type,
            type: 'mdxJsxFlowElement',
          };
        },
      },
    }),
  type: NODES.columnGroup,
});

export type ColumnDefinition = DefinitionOf<typeof BaseColumnItemPlugin>;
