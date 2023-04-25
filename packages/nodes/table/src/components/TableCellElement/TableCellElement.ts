import { Box } from '@udecode/plate-common';
import { TableCellElementResizable } from './TableCellElementResizable';
import { TableCellElementResizableWrapper } from './TableCellElementResizableWrapper';
import { TableCellElementRoot } from './TableCellElementRoot';

export const TableCellElement = {
  Content: Box,
  Handle: Box,
  Resizable: TableCellElementResizable,
  ResizableWrapper: TableCellElementResizableWrapper,
  Root: TableCellElementRoot,
};
