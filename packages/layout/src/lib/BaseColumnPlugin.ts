import {
  BaseParagraphPlugin,
  type PluginConfig,
  createBasePlugin,
} from '@platejs/core';
import {
  type Element,
  ElementApi,
  type NodeEntry,
  PathApi,
  property,
  RangeApi,
  schema,
} from '@platejs/plite';
import type { TColumnElement, TColumnGroupElement } from '@platejs/utils';
import { KEYS, NODES } from '@platejs/utils';

import {
  type InsertColumnGroupOptions,
  type InsertColumnOptions,
  type MoveMiddleColumnOptions,
  type SetColumnsOptions,
  type ToggleColumnGroupOptions,
  insertColumn,
  insertColumnGroup,
  moveMiddleColumn,
  setColumns,
  toggleColumnGroup,
} from './transforms';

export type ColumnConfig = PluginConfig<
  'column',
  {},
  {},
  {
    column: {
      insert: (options?: InsertColumnOptions) => void;
      insertGroup: (options?: InsertColumnGroupOptions) => void;
      moveMiddle: (
        entry: NodeEntry<TColumnGroupElement>,
        options?: MoveMiddleColumnOptions
      ) => false | undefined;
      selectAll: () => boolean;
      set: (options: SetColumnsOptions) => void;
      toggle: (options?: ToggleColumnGroupOptions) => void;
    };
  }
>;

export const BaseColumnItemPlugin = createBasePlugin({
  key: KEYS.column,
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: { type: plugins.elementType(BaseParagraphPlugin) },
        min: 1,
      }),
      properties: { width: property.string() },
      topLevel: false,
    },
  }),
  extension: ({ editor }) => ({
    corrections: [
      {
        event: 'content',
        correct({ entry: [node, path], tx }) {
          const columnGroupType = editor.getType(KEYS.columnGroup);

          if (
            ElementApi.isElementType<TColumnGroupElement>(node, columnGroupType)
          ) {
            const totalColumns = node.children.length;
            const widths = node.children.map((column) => {
              const parsed = Number.parseFloat(column.width);

              return Number.isNaN(parsed) ? 0 : parsed;
            });
            const sum = widths.reduce((total, width) => total + width, 0);

            if (sum !== 100) {
              const adjustment = (100 - sum) / totalColumns;

              widths.forEach((width, index) => {
                tx.nodes.set<TColumnElement>(
                  { width: `${width + adjustment}%` },
                  { at: path.concat([index]) }
                );
              });
            }
          }
        },
      },
    ],
  }),
  update: ({ editor, tx, type }) => ({
    insert: insertColumn.bind(null, editor, tx),
    insertGroup: insertColumnGroup.bind(null, editor, tx),
    moveMiddle: moveMiddleColumn.bind(null, tx),
    selectAll: () => {
      const selection = tx.selection();

      if (!selection) return false;

      const column = tx.nodes.above<Element>({
        at: selection,
        match: { type },
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
    set: setColumns.bind(null, editor, tx),
    toggle: toggleColumnGroup.bind(null, editor, tx),
  }),
}).extend({
  shortcuts: { selectAll: { keys: 'mod+a' } },
});

export const BaseColumnPlugin = createBasePlugin({
  key: KEYS.columnGroup,
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
  type: NODES.columnGroup,
});
