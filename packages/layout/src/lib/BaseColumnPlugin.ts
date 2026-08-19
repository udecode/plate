import {
  BaseParagraphPlugin,
  defineBasePlugin,
  type DefinitionOf,
  type PlateNodeInsertOptions,
} from '@platejs/core';
import {
  type Element,
  ElementApi,
  type ElementOf,
  type Location,
  NodeApi,
  type NodeEntry,
  type NodeTarget,
  PathApi,
  property,
  RangeApi,
  schema,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

export type MoveMiddleColumnOptions = {
  direction: 'left' | 'right';
};

export type SetColumnsOptions = {
  /** Column group location. */
  at?: NodeTarget<Element>;
  columns?: number;
  widths?: string[];
};

export type ToggleColumnGroupOptions = {
  at?: Location;
  columns?: number;
  widths?: string[];
};

const getMarkdownAttributes = (element: Element) =>
  Object.fromEntries(
    Object.entries(NodeApi.extractProps(element)).filter(
      ([key]) => key !== 'id' && key !== 'type'
    )
  );

export const BaseColumnItemPlugin = defineBasePlugin(PLUGINS.column, {
  dependencies: [BaseParagraphPlugin],
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: BaseParagraphPlugin,
        min: 1,
      }),
      properties: {
        width: property.string({ default: '50%', omitDefault: false }),
      },
      blockContent: false,
    },
  }),
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/markdown': {
        from: type,
        kind: 'node',
        decode: ({ decode, decoration, node, parseAttributes }) => ({
          ...parseAttributes(node.attributes),
          children: decode(node.children, decoration),
          type,
        }),
        encode: ({ encodeFlow, node, propsToAttributes }) => ({
          attributes: propsToAttributes(getMarkdownAttributes(node)),
          children: encodeFlow(node.children),
          name: type,
          type: 'mdxJsxFlowElement',
        }),
      },
    }),
})
  .extend(({ plugin }) => ({
    update: ({ tx }) => ({
      moveMiddle: (
        [node, path]: NodeEntry<Element>,
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

        const column = tx.nodes.above({
          at: selection,
          type: plugin,
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
    }),
  }))
  .extend({ shortcuts: { selectAll: { keys: 'mod+a' } } });

export type ColumnElement = ElementOf<typeof BaseColumnItemPlugin>;

export const BaseColumnPlugin = defineBasePlugin(PLUGINS.columnGroup, {
  dependencies: [BaseColumnItemPlugin],
  schema: {
    element: {
      content: schema.content.element(BaseColumnItemPlugin, { min: 2 }),
    },
  },
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/markdown': {
        from: type,
        kind: 'node',
        decode: ({ decode, decoration, node, parseAttributes }) => ({
          ...parseAttributes(node.attributes),
          children: decode(node.children, decoration),
          type,
        }),
        encode: ({ encodeFlow, node, propsToAttributes }) => ({
          attributes: propsToAttributes(getMarkdownAttributes(node)),
          children: encodeFlow(node.children),
          name: type,
          type: 'mdxJsxFlowElement',
        }),
      },
    }),
}).extend(({ editor, plugin, schema: { type } }) => ({
  corrections: [
    {
      event: 'content',
      query: { type: plugin },
      correct({ editor, entry: [node, path], tx }) {
        if (!ElementApi.isElement(node)) return;

        const columnType = editor.plugin(BaseColumnItemPlugin).schema.type;
        const columns = node.children.filter(
          (column): column is ColumnElement =>
            ElementApi.isElementType<ColumnElement>(column, columnType) &&
            typeof column.width === 'string'
        );

        if (columns.length !== node.children.length) return;

        const widths = columns.map((column) => {
          const parsed = Number.parseFloat(column.width);

          return Number.isNaN(parsed) ? 0 : parsed;
        });
        const sum = widths.reduce((total, width) => total + width, 0);

        if (sum === 100) return;

        const adjustment = (100 - sum) / columns.length;

        widths.forEach((width, index) => {
          tx.nodes.set(
            { width: `${width + adjustment}%` },
            {
              at: path.concat([index]),
            }
          );
        });
      },
    },
  ],
  update: ({ tx }) => {
    const columnType = editor.plugin(BaseColumnItemPlugin).schema.type;
    const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;
    const columnsToWidths = (columns = 2) =>
      new Array(columns).fill(null).map(() => `${100 / columns}%`);
    const setColumns = ({ at, columns, widths }: SetColumnsOptions) => {
      if (!at) return;

      const nextWidths = widths ?? columnsToWidths(columns);

      if (nextWidths.length === 0) return;

      const columnGroup = tx.nodes.get(at, { type: plugin });

      if (!columnGroup) return;

      const [{ children }, path] = columnGroup;
      const columnChildren = children.filter((child): child is Element =>
        ElementApi.isElement(child)
      );

      if (columnChildren.length !== children.length) return;

      const currentCount = children.length;
      const targetCount = nextWidths.length;

      if (currentCount === targetCount) {
        nextWidths.forEach((width, index) => {
          tx.nodes.set({ width }, { at: path.concat([index]) });
        });

        return;
      }

      if (targetCount > currentCount) {
        tx.nodes.insert(
          new Array(targetCount - currentCount).fill(null).map((_, index) => ({
            children: [
              {
                children: [{ text: '' }],
                type: paragraphType,
              },
            ],
            type: columnType,
            width: nextWidths[currentCount + index] || `${100 / targetCount}%`,
          })),
          { at: path.concat([currentCount]) }
        );

        nextWidths.forEach((width, index) => {
          tx.nodes.set({ width }, { at: path.concat([index]) });
        });

        return;
      }

      const keepColumnIndex = targetCount - 1;
      const keepColumnPath = path.concat([keepColumnIndex]);

      if (!tx.nodes.get(keepColumnPath)) return;

      tx.nodes.replaceChildren(
        columnChildren
          .slice(keepColumnIndex)
          .flatMap((column) => column.children),
        { at: keepColumnPath }
      );

      for (let index = currentCount - 1; index > keepColumnIndex; index--) {
        tx.nodes.remove({ at: path.concat([index]) });
      }

      nextWidths.forEach((width, index) => {
        tx.nodes.set({ width }, { at: path.concat([index]) });
      });
    };

    return {
      insert: (
        { columns = 2 }: { columns?: number } = {},
        { select, ...options }: PlateNodeInsertOptions = {}
      ) => {
        const width = 100 / columns;

        tx.nodes.insert(
          {
            children: new Array(columns).fill(null).map(() => ({
              children: [
                {
                  children: [{ text: '' }],
                  type: paragraphType,
                },
              ],
              type: columnType,
              width: `${width}%`,
            })),
            type,
          },
          options
        );

        if (!select) return;

        const entry = tx.nodes.find({
          at: options.at,
          type: BaseColumnItemPlugin,
        });
        const point = entry && tx.points.start(entry[1]);

        if (point) tx.selection.set(point);
      },
      setColumns,
      toggle: ({ at, columns = 2, widths }: ToggleColumnGroupOptions = {}) => {
        const entry = tx.nodes.block({ at });
        const columnGroupEntry = tx.nodes.above({
          at,
          type: plugin,
        });

        if (!entry) return;

        if (columnGroupEntry) {
          setColumns({ at: columnGroupEntry[1], columns, widths });

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
                    type: paragraphType,
                  },
            ],
            type: columnType,
            width: columnWidths[index],
          })),
          type,
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
}));

export type ColumnGroupElement = ElementOf<typeof BaseColumnPlugin>;

export type ColumnDefinition = DefinitionOf<typeof BaseColumnItemPlugin>;
