import {
  BaseParagraphPlugin,
  definePlugin,
  type DefinitionOf,
  editorReads,
  type Element,
  ElementApi,
  type ElementOf,
  type Location,
  type Node,
  NodeApi,
  type NodeEntry,
  type NodeTarget,
  PathApi,
  type BlockInsertOptions,
  type BlockUpsertOptions,
  PLUGINS,
  property,
  RangeApi,
  schema,
  transferVeto,
} from '../../../core';
import { applyBlockInsertion } from '../../../internal/plugin/blockInsertion';

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

export const BaseColumnItemPlugin = definePlugin(PLUGINS.column, {
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
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      plainText: {
        encode: ({ children }) => children,
      },
      markdown: { tag: type },
    }),
})
  .extend(({ plugin }) => ({
    update: ({ tx }) => ({
      moveMiddle: (
        [node, path]: NodeEntry<Element>,
        { direction = 'left' }: Partial<MoveMiddleColumnOptions> = {}
      ) => {
        if (direction !== 'left') return undefined;

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

        return undefined;
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
  .extend({ shortcuts: { selectAll: { keys: 'mod+a' } } })
  .extend(({ schema: { type } }) => {
    const isColumn = (node: Node) =>
      ElementApi.isElement(node) && node.type === type;

    return {
      contributions: [
        // The schema admits a column in any group; a column lands only beside
        // the columns of its own group in one document.
        transferVeto.of(({ payload, relation, target: [node, path] }, view) => {
          if (payload.kind !== 'nodes' || !payload.nodes.some(isColumn)) {
            return false;
          }
          if (relation !== 'document' || !isColumn(node)) return true;

          const group = view.key(PathApi.parent(path));

          return !payload.nodes.every(
            (column, index) =>
              isColumn(column) && payload.parentKeys[index] === group
          );
        }),
      ],
    };
  });

export type ColumnElement = ElementOf<typeof BaseColumnItemPlugin>;

const widthsOf = (group: Element, columnType: string) => {
  const columns = group.children.filter(
    (column): column is ColumnElement =>
      ElementApi.isElementType(column, columnType) &&
      typeof column.width === 'string'
  );

  return columns.length === group.children.length
    ? columns.map((column) => {
        const parsed = Number.parseFloat(column.width);

        return Number.isNaN(parsed) ? 0 : parsed;
      })
    : null;
};

export const BaseColumnPlugin = definePlugin(PLUGINS.columnGroup, {
  dependencies: [BaseColumnItemPlugin],
  schema: {
    element: {
      content: schema.content.element(BaseColumnItemPlugin, { min: 2 }),
    },
  },
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      plainText: {
        encode: ({ children }) => children,
      },
      markdown: { tag: type },
    }),
}).extend(({ editor, plugin, schema: { type } }) => ({
  corrections: [
    {
      event: 'content',
      query: { type: plugin },
      correct({ editor: innerEditor, entry: [node, path], tx }) {
        if (!ElementApi.isElement(node)) return;

        const widths = widthsOf(
          node,
          innerEditor.plugin(BaseColumnItemPlugin).schema.type
        );

        if (!widths) return;

        const sum = widths.reduce((total, width) => total + width, 0);

        if (Math.abs(sum - 100) < 1e-6) return;

        // An inserted column makes a group over-full; scaling keeps every
        // column's share, where the additive repair can push one below zero.
        const resize = (width: number) =>
          sum > 100 ? (width * 100) / sum : width + (100 - sum) / widths.length;

        widths.forEach((width, index) => {
          tx.nodes.set(
            { width: `${resize(width)}%` },
            {
              at: path.concat([index]),
            }
          );
        });
      },
    },
  ],
  readMiddleware: ({ around }) => [
    around(editorReads.transfer.side, ({ input, next, state }) => {
      const {
        payload,
        side,
        target: [target, path],
      } = input;
      const columnType = editor.plugin(BaseColumnItemPlugin).schema.type;

      if (
        payload.kind !== 'nodes' ||
        payload.nodes.some(
          (node) =>
            ElementApi.isElementType(node, columnType) ||
            ElementApi.isElementType(node, type)
        )
      ) {
        return next();
      }

      const end = side === 'end';
      const column = (width: string) => ({
        children: [],
        type: columnType,
        width,
      });

      if (path.length === 1) {
        if (ElementApi.isElementType(target, type)) return next();

        return {
          payload: [end ? 1 : 0],
          shell: { children: [column('50%'), column('50%')], type },
          target: [end ? 0 : 1],
        };
      }

      const columnPath = PathApi.parent(path);
      const group = state.nodes.get(PathApi.parent(columnPath))?.[0];

      if (
        !ElementApi.isElementType(group, type) ||
        !ElementApi.isElementType(
          state.nodes.get(columnPath)?.[0],
          columnType
        ) ||
        group.children.length >= 5
      ) {
        return next();
      }

      const index = columnPath.at(-1) as number;
      const facing = group.children[end ? index + 1 : index - 1];
      const onlyTradesPlaces =
        ElementApi.isElement(facing) &&
        facing.children.length === payload.nodes.length &&
        facing.children.every((child, i) => child === payload.nodes[i]);

      if (onlyTradesPlaces) return next();

      const widths = widthsOf(group, columnType);

      if (!widths?.every((width) => width > 0)) return next();

      return {
        ancestor: 1,
        edge: end ? ('after' as const) : ('before' as const),
        payload: [],
        shell: column(
          `${widths.reduce((total, width) => total + width, 0) / widths.length}%`
        ),
      };
    }),
  ],
  update: ({ tx }) => {
    const columnType = editor.plugin(BaseColumnItemPlugin).schema.type;
    const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;
    const columnsToWidths = (columns = 2) =>
      Array.from({ length: columns }, () => `${100 / columns}%`);
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
          Array.from({ length: targetCount - currentCount }, (_, index) => ({
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
    const insertColumnGroup = (
      { columns = 2 }: { columns?: number } = {},
      { select, ...options }: BlockInsertOptions = {}
    ) => {
      const width = 100 / columns;

      const element = {
        children: Array.from({ length: columns }, () => ({
          children: [{ children: [{ text: '' }], type: paragraphType }],
          type: columnType,
          width: `${width}%`,
        })),
        type,
      };
      if (options.at === undefined || options.after !== undefined) {
        tx.blocks.insertAfter(element, { ...options, at: options.after });
      } else {
        tx.nodes.insert(element, options);
      }

      if (!select) return;

      const path = tx.nodes.path(element);
      const point = path && tx.points.start(path.concat(0));

      if (point) tx.selection.set(point);
    };
    const applyColumnInsertion = (
      mode: 'insert' | 'upsert',
      input: { columns?: number } = {},
      options: BlockInsertOptions | BlockUpsertOptions = {}
    ) =>
      applyBlockInsertion({
        insert: (insertOptions) => insertColumnGroup(input, insertOptions),
        matches: (block) => block.type === type,
        mode,
        options,
        tx,
      });

    return {
      insert: (
        input: { columns?: number } = {},
        options: BlockInsertOptions = {}
      ) => applyColumnInsertion('insert', input, options),
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
          children: Array.from({ length: columns }, (_, index) => ({
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
      upsert: (
        input: { columns?: number } = {},
        options: BlockUpsertOptions = {}
      ) => applyColumnInsertion('upsert', input, options),
    };
  },
}));

export type ColumnGroupElement = ElementOf<typeof BaseColumnPlugin>;

export type ColumnDefinition = DefinitionOf<typeof BaseColumnItemPlugin>;
