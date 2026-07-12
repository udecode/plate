import { type PluginConfig, createBasePlugin } from '@platejs/core';
import type { NodeEntry } from '@platejs/plite';
import type { TColumnGroupElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

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
      ) => false | void;
      selectAll: () => boolean;
      set: (options: SetColumnsOptions) => void;
      toggle: (options?: ToggleColumnGroupOptions) => void;
    };
  }
>;

export const BaseColumnItemPlugin = createBasePlugin<ColumnConfig>({
  key: KEYS.column,
  node: { isContainer: true, isElement: true, isStrictSiblings: true },
  shortcuts: {
    selectAll: { keys: 'mod+a' },
  },
})
  .extendExtension(withColumn)
  .extendTx(({ editor, type }) => (tx) => ({
    insert: (options) => insertColumn(editor, tx, options),
    insertGroup: (options) => insertColumnGroup(editor, tx, options),
    moveMiddle: (entry, options) => moveMiddleColumn(tx, entry, options),
    selectAll: () => selectColumnAll(tx, type),
    set: (options) => setColumns(editor, tx, options),
    toggle: (options) => toggleColumnGroup(editor, tx, options),
  }));

export const BaseColumnPlugin = createBasePlugin({
  key: KEYS.columnGroup,
  node: { isContainer: true, isElement: true },
  plugins: [BaseColumnItemPlugin],
});
