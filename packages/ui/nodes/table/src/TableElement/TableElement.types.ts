import { RenderFunction, Value } from '@udecode/plate-core';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { TTableElement } from '@udecode/plate-table';
import { PopoverProps } from '@udecode/plate-ui-popover';
import { CSSProp } from 'styled-components';

export interface TableElementStyleProps<V extends Value>
  extends TableElementProps<V> {}

export interface TableElementStyles {
  tbody: CSSProp;
}

export interface TableElementProps<V extends Value>
  extends StyledElementProps<V, TTableElement, TableElementStyles> {
  /**
   * Transform node column sizes
   */
  popoverProps?: PopoverProps;

  transformColSizes?: (colSizes: number[]) => number[];

  /**
   * An override to render the table container.
   * @default TablePopover
   */
  onRenderContainer?: RenderFunction<TableElementProps<V>>;
}
