import { StyledElementProps } from '@udecode/plate-styled-components';
import { TableNodeData } from '@udecode/plate-table';
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
  transformColSizes: (colSizes: number[]) => number[];
}
