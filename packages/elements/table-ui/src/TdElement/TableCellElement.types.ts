import { StyledElementProps } from '@udecode/plate-styled-components';
import { ResizableProps } from 're-resizable';
import { CSSProp } from 'styled-components';

export interface TableCellElementStyleProps extends TableCellElementProps {
  hovered: boolean;
}

export interface TableCellElementStyles {
  content: CSSProp;
  resizableWrapper: CSSProp;
  resizable: CSSProp;
  handle: CSSProp;
}

export interface TableCellElementProps
  extends StyledElementProps<{}, TableCellElementStyles> {
  resizableProps?: ResizableProps;
}
