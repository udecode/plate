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
  type NodeTarget,
  PathApi,
  type BlockInsertOptions,
  type BlockUpsertOptions,
  PLUGINS,
  property,
  RangeApi,
  schema,
  transferVeto,
  txLocate,
  locateAt,
} from '../../../core';
import { canPlaceBlocksAtPath } from '../../../facade';
import { applyBlockInsertion } from '../../../internal/plugin/blockInsertion';
import { rootOf } from '../../../internal/utils/inRoot';

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

/**
 * A group's content columns with their real indexes and parsed widths, or null
 * when a content child is not a sized column. A column a pending suggestion
 * deletes is not content, so it keeps its width out of every sum.
 */
const columnsOf = (
  group: Element,
  columnType: string,
  isContent: (node: Node) => boolean
) => {
  const columns: Array<{ index: number; width: number }> = [];

  for (const [index, column] of group.children.entries()) {
    if (!isContent(column)) continue;
    if (
      !ElementApi.isElementType(column, columnType) ||
      typeof column.width !== 'string'
    ) {
      return null;
    }
    const parsed = Number.parseFloat(column.width);

    columns.push({ index, width: Number.isNaN(parsed) ? 0 : parsed });
  }

  return columns;
};

export const BaseColumnGroupPlugin = definePlugin(PLUGINS.columnGroup, {
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

        const columns = columnsOf(
          node,
          innerEditor.plugin(BaseColumnItemPlugin).schema.type,
          tx.nodes.isContent
        );

        if (!columns?.length) return;

        const sum = columns.reduce((total, { width }) => total + width, 0);

        if (Math.abs(sum - 100) < 1e-6) return;

        // An inserted column makes a group over-full; scaling keeps every
        // column's share, where the additive repair can push one below zero.
        const resize = (width: number) =>
          sum > 100
            ? (width * 100) / sum
            : width + (100 - sum) / columns.length;

        for (const { index, width } of columns) {
          tx.nodes.set(
            { width: `${resize(width)}%` },
            {
              at: path.concat([index]),
            }
          );
        }
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
        group.children.filter(state.nodes.isContent).length >= 5
      ) {
        return next();
      }

      const index = columnPath.at(-1) as number;
      const facing = (
        end
          ? group.children.slice(index + 1)
          : group.children.slice(0, index).reverse()
      ).find(state.nodes.isContent);
      const onlyTradesPlaces =
        ElementApi.isElement(facing) &&
        facing.children.length === payload.nodes.length &&
        facing.children.every((child, i) => child === payload.nodes[i]);

      if (onlyTradesPlaces) return next();

      const columns = columnsOf(group, columnType, state.nodes.isContent);

      if (!columns?.length || !columns.every(({ width }) => width > 0)) {
        return next();
      }

      return {
        ancestor: 1,
        edge: end ? ('after' as const) : ('before' as const),
        payload: [],
        shell: column(
          `${columns.reduce((total, { width }) => total + width, 0) / columns.length}%`
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

      if (!children.every((child) => ElementApi.isElement(child))) return;

      // A column a pending suggestion deletes keeps its place and its width.
      const live = children.flatMap((column, index) =>
        ElementApi.isElement(column) && tx.nodes.isContent(column)
          ? [{ column, index }]
          : []
      );
      const setWidths = (indexes: readonly number[]) => {
        indexes.forEach((index, position) => {
          tx.nodes.set(
            { width: nextWidths[position] },
            { at: path.concat([index]) }
          );
        });
      };
      const currentCount = live.length;
      const targetCount = nextWidths.length;

      if (currentCount === targetCount) {
        setWidths(live.map(({ index }) => index));

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
          { at: path.concat([children.length]) }
        );

        setWidths([
          ...live.map(({ index }) => index),
          ...Array.from(
            { length: targetCount - currentCount },
            (_, offset) => children.length + offset
          ),
        ]);

        return;
      }

      const kept = live.slice(0, targetCount);
      const keepColumnPath = path.concat([kept[targetCount - 1].index]);

      tx.nodes.replaceChildren(
        live.slice(targetCount - 1).flatMap(({ column }) => column.children),
        { at: keepColumnPath }
      );

      for (const { index } of live.slice(targetCount).reverse()) {
        tx.nodes.remove({ at: path.concat([index]) });
      }

      setWidths(kept.map(({ index }) => index));
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
      const inserted = tx.blocks.insert(element, options);

      if (!inserted) return false;
      if (select) {
        const point = tx.points.start(inserted[0]);

        if (point) tx.selection.set(point);
      }

      return true;
    };
    const applyColumnInsertion = (
      mode: 'insert' | 'upsert',
      input: { columns?: number } = {},
      options: BlockInsertOptions | BlockUpsertOptions = {}
    ) =>
      applyBlockInsertion({
        editor,
        insert: (insertOptions) => insertColumnGroup(input, insertOptions),
        matches: (block) => block.type === type,
        mode,
        options,
        tx,
      });

    return {
      insert: txLocate(
        locateAt(1, 'at', 'after', 'before'),
        (input: { columns?: number } = {}, options: BlockInsertOptions = {}) =>
          applyColumnInsertion('insert', input, options)
      ),
      setColumns: txLocate(locateAt(0), setColumns),
      toggle: txLocate(
        locateAt(0),
        ({ at, columns = 2, widths }: ToggleColumnGroupOptions = {}) => {
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

          if (
            index === undefined ||
            !canPlaceBlocksAtPath(tx.schema, path, [columnGroup], {
              removing: [index],
              root: rootOf(tx, at),
            })
          ) {
            return;
          }

          tx.nodes.replaceChildren([columnGroup], {
            at: parentPath,
            count: 1,
            index,
          });

          const point = tx.points.start(path.concat([0]));

          if (point) tx.selection.set(point);
        }
      ),
      upsert: txLocate(
        locateAt(1, 'after', 'before'),
        (input: { columns?: number } = {}, options: BlockUpsertOptions = {}) =>
          applyColumnInsertion('upsert', input, options)
      ),
    };
  },
}));

export type ColumnGroupElement = ElementOf<typeof BaseColumnGroupPlugin>;

export type ColumnDefinition = DefinitionOf<typeof BaseColumnItemPlugin>;
