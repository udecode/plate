import {
  BaseParagraphPlugin,
  type PluginConfig,
  createBasePlugin,
} from '@platejs/core';
import { property, schema, type NodeEntry } from '@platejs/plite';
import type { TColumnGroupElement } from '@platejs/utils';
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
import { selectColumnAll, withColumn } from './withColumn';

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
})
  .extendTx(({ editor, type }) => (tx) => ({
    insert: insertColumn.bind(null, editor, tx),
    insertGroup: insertColumnGroup.bind(null, editor, tx),
    moveMiddle: moveMiddleColumn.bind(null, tx),
    selectAll: () => selectColumnAll(tx, type),
    set: setColumns.bind(null, editor, tx),
    toggle: toggleColumnGroup.bind(null, editor, tx),
  }))
  .extend({ shortcuts: { selectAll: { keys: 'mod+a' } } })
  .extendExtension(withColumn);

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
