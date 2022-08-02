import { Value } from '@udecode/plate-core';
import { UseFloatingProps } from '@udecode/plate-floating';
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
   * Transform node column sizes
   */
  floatingOptions?: UseFloatingProps;

  transformColSizes?: (colSizes: number[]) => number[];
}
