import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';

export enum TableType {
  TABLE = 'table',
  ROW = 'tr',
  CELL = 'td',
  HEAD = 'th',
}

export const defaultTableTypes: Required<TableTypeOption> = {
  typeTable: TableType.TABLE,
  typeTr: TableType.ROW,
  typeTd: TableType.CELL,
  typeTh: TableType.HEAD,
};

// Data of Element node
export interface TableNodeData {}

// Element node
export interface TableNode extends Element, TableNodeData {}

// Type option
export interface TableTypeOption {
  typeTable?: string;
  typeTr?: string;
  typeTd?: string;
  typeTh?: string;
}

// deserialize options
export interface TableDeserializeOptions extends TableTypeOption {}

// renderElement options given as props
interface TableRenderElementOptionsProps {}

// renderElement options
export interface TableRenderElementOptions
  extends TableRenderElementOptionsProps,
    TableTypeOption {
  Table?: any;
  Row?: any;
  Cell?: any;
}

// renderElement props
export interface TableRenderElementProps
  extends RenderElementProps,
    TableRenderElementOptionsProps {
  element: TableNode;
}

// Plugin options
export interface TablePluginOptions
  extends TableRenderElementOptions,
    TableDeserializeOptions {}

export interface WithTableOptions extends TableTypeOption {}
