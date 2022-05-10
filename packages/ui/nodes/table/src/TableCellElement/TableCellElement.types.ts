import { TElement, Value } from '@udecode/plate-core';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { ResizableProps } from 're-resizable';
import { CSSProp } from 'styled-components';

export interface TableCellElementStyleProps<V extends Value>
  extends TableCellElementProps<V> {
  hovered: boolean;
  readOnly: boolean;
}

export interface TableCellElementStyles {
  content: CSSProp;
  resizableWrapper: CSSProp;
  resizable: CSSProp;
  handle: CSSProp;
}

export interface TableCellElementProps<V extends Value>
  extends StyledElementProps<V, TElement, TableCellElementStyles> {
  resizableProps?: ResizableProps;
  hideBorder?: boolean;

  /**
   * Ignores editable readOnly mode
   */
  ignoreReadOnly?: boolean;
}
