import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { RenderElementProps } from 'slate-react';
import {
  Deserialize,
  ElementWithAttributes,
  HtmlAttributesProps,
  NodeToProps,
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
} from '../../common/types/PluginOptions.types';

export const TableHotKey = {
  TAB: 'Tab',
};

// Data of Element node
export interface TableNodeData {}
// Element node
export interface TableNode extends ElementWithAttributes, TableNodeData {}

// renderElement options given as props
export interface TableRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<TableElementStyleProps, TableElementStyles>;
}

// renderElement props
export interface TableElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    TableRenderElementPropsOptions {
  element: TableNode;
}

export type TableKeyOption = 'table' | 'th' | 'tr' | 'td';

// Plugin options
export type TablePluginOptionsValues = RenderNodeOptions &
  RootProps<TableRenderElementPropsOptions> &
  NodeToProps<TableNode, TableRenderElementPropsOptions> &
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

export interface TableElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert TableElement classNames below
}

export interface TableElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert TableElement style props below
}
