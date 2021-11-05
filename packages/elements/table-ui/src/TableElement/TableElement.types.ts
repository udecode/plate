import { RenderFunction } from '@udecode/plate-core';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { TableNodeData } from '@udecode/plate-table';
import { PopoverProps } from '@udecode/plate-ui-popover';
import { CSSProp } from 'styled-components';

export interface TableElementStyleProps extends TableElementProps {}

export interface TableElementStyles {
  tbody: CSSProp;
}

export interface TableElementProps
  extends StyledElementProps<TableNodeData, TableElementStyles> {
  /**
   * Transform node column sizes
   */
  popoverProps?: PopoverProps;

  transformColSizes?: (colSizes: number[]) => number[];

  /**
   * An override to render the table container.
   * @default TablePopover
   */
  onRenderContainer?: RenderFunction<TableElementProps>;
}
