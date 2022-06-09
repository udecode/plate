import { EElement, Value } from '@udecode/plate-core';
import { StyledElementProps } from '@udecode/plate-styled-components';

export interface TableRowElementStyleProps<V extends Value>
  extends TableRowElementProps<V> {
  // hovered: boolean;
}

export interface TableRowElementStyles {
  // content: CSSProp;
  // resizableWrapper: CSSProp;
  // resizable: CSSProp;
  // handle: CSSProp;
}

export interface TableRowElementProps<V extends Value>
  extends StyledElementProps<V, EElement<V>, TableRowElementStyles> {
  hideBorder?: boolean;
  // resizableProps?: ResizableProps;
}
