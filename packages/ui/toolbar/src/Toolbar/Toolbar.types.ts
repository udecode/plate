import { HTMLAttributes } from 'react';
import { StyledProps } from '@udecode/slate-plugins-styled-components';

export interface ToolbarProps
  extends StyledProps,
    HTMLAttributes<HTMLDivElement> {
  children?: any;
}
