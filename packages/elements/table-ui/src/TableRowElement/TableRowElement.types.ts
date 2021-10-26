import { StyledElementProps } from '@udecode/plate-styled-components';

export interface TableRowElementStyleProps extends TableRowElementProps {
  // hovered: boolean;
}

export interface TableRowElementStyles {
  // content: CSSProp;
  // resizableWrapper: CSSProp;
  // resizable: CSSProp;
  // handle: CSSProp;
}

export interface TableRowElementProps
  extends StyledElementProps<{}, TableRowElementStyles> {
  hideBorder?: boolean;
  // resizableProps?: ResizableProps;
}
