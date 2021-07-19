import { HTMLAttributes } from 'react';
import { StyledProps } from '@udecode/plate-styled-components';

export interface ToolbarProps
  extends StyledProps,
    HTMLAttributes<HTMLDivElement> {
  children?: any;
}
