import { ReactNode } from 'react';
import { StyledProps } from '@udecode/plate-styled-components';
import { ToolbarProps } from '../Toolbar/Toolbar.types';

export interface BalloonToolbarStyleProps extends BalloonToolbarProps {
  hidden?: boolean;
}

export interface BalloonToolbarProps extends StyledProps<ToolbarProps> {
  children: ReactNode;

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

  /**
   * Parent scroll container element of the editor,
   * if no scroll container provided, it will take document.documentElement as scrolling container
   */
  scrollContainer?: HTMLElement;
}
