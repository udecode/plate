import { ReactNode } from 'react';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import {
  ToolbarProps,
  ToolbarStyleProps,
  ToolbarStyles,
} from '../Toolbar.types';

export interface BalloonToolbarProps extends ToolbarProps {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<
    BalloonToolbarStyleProps,
    BalloonToolbarStyles
  >;

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
}

export interface BalloonToolbarStyleProps extends ToolbarStyleProps {
  hidden?: boolean;
  hiddenDelay?: BalloonToolbarProps['hiddenDelay'];
  direction?: BalloonToolbarProps['direction'];
  theme?: BalloonToolbarProps['theme'];
  arrow?: BalloonToolbarProps['arrow'];
}

export interface BalloonToolbarStyles extends ToolbarStyles {}
