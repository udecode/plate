import { StyledElementProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface HrElementStyleProps extends HrElementProps {
  selected?: boolean;
  focused?: boolean;
}

export interface HrElementStyles {
  hr: CSSProp;
}

export interface HrElementProps
  extends StyledElementProps<{}, HrElementStyles> {}
