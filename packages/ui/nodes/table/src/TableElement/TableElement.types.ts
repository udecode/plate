import { Value } from '@udecode/plate-core';
import { PopoverProps } from '@udecode/plate-floating';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { TTableElement } from '@udecode/plate-table';
import { CSSProp } from 'styled-components';

export interface TableElementStyleProps<V extends Value>
  extends TableElementProps<V> {
  isSelectingCell?: boolean;
}

export interface TableElementStyles {
  tbody: CSSProp;
}

export interface TableElementProps<V extends Value>
  extends StyledElementProps<V, TTableElement, TableElementStyles> {
  /**
   * Minimum column width.
   * @default 48
   */
  minColWidth?: number;

  popoverProps?: PopoverProps;

  /**
   * Transform node column sizes
   */
  transformColSizes?: (colSizes: number[]) => number[];
}
