import { HTMLAttributes } from 'react';
import { StyledProps } from '@udecode/slate-plugins-ui';

export interface ToolbarProps
  extends StyledProps,
    HTMLAttributes<HTMLDivElement> {
  children?: any;
}
