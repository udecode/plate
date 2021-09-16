import { ReactNode } from 'react';
import { StyledProps } from '@udecode/plate-styled-components';
import { ToolbarProps } from '../Toolbar/Toolbar.types';

export interface BalloonToolbarStyleProps extends BalloonToolbarProps {
  hidden?: boolean;
}

export interface BalloonToolbarProps extends StyledProps<ToolbarProps> {
  children: ReactNode;

  /**
   * When selecting characters, the balloon is hidden for a delay.
   * If 0, the balloon is never hidden.
   */
  hiddenDelay?: number;

  /**
   * Below of above the selection.
   */
  direction?: 'top' | 'bottom';

  /**
   * Color theme for the background/foreground.
   */
  theme?: 'dark' | 'light';

  /**
   * Show an arrow pointing to up or down depending on the direction.
   */
  arrow?: boolean;

  portalElement?: Element;
}
