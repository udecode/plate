import {
  Deserialize,
  ElementWithAttributes,
  NodeToProps,
  RenderNodeOptions,
} from '@udecode/slate-plugins-common';

export const TableHotKey = {
  TAB: 'Tab',
};

// Data of Element node
export interface TableNodeData {}
// Element node
export interface TableNode extends ElementWithAttributes, TableNodeData {}

export type TableKeyOption = 'table' | 'th' | 'tr' | 'td';

// Plugin options
export type TablePluginOptionsValues = RenderNodeOptions &
  NodeToProps<TableNode> &
  Deserialize;
export type TablePluginOptionsKeys = keyof TablePluginOptionsValues;
export type TablePluginOptions<
  Value extends TablePluginOptionsKeys = TablePluginOptionsKeys
> = Partial<Record<TableKeyOption, Pick<TablePluginOptionsValues, Value>>>;

// renderElement options
export type TableRenderElementOptionsKeys = TablePluginOptionsKeys;
export interface TableRenderElementOptions
  extends TablePluginOptions<TableRenderElementOptionsKeys> {}

// deserialize options
export interface TableDeserializeOptions
  extends TablePluginOptions<'type' | 'rootProps' | 'deserialize'> {}

export interface TableOnKeyDownOptions extends TablePluginOptions<'type'> {}
export interface TableOptions extends TablePluginOptions<'type'> {}
export interface WithTableOptions extends TablePluginOptions<'type'> {}
