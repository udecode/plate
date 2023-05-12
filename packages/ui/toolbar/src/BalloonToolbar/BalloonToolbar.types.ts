import { ReactNode } from 'react';
import { UseVirtualFloatingOptions } from '@udecode/plate-floating';
import { StyledProps } from '@udecode/plate-styled-components';
import { ToolbarProps } from '../Toolbar/Toolbar.types';

export interface BalloonToolbarStyleProps extends BalloonToolbarProps {
  placement?: string;
}

export interface BalloonToolbarProps extends StyledProps<ToolbarProps> {
  children: ReactNode;

  /**
   * Color theme for the background/foreground.
   */
  theme?: 'dark' | 'light';

  /**
   * Show an arrow pointing to up or down depending on the direction.
   */
  arrow?: boolean;

  portalElement?: Element;

  floatingOptions?: UseVirtualFloatingOptions;

  ignoreReadOnly?: boolean;

  hideToolbar?: boolean;
}
