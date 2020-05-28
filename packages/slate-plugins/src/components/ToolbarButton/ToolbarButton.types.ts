import { HTMLProps } from 'react';
import { TippyProps } from '@tippyjs/react';
import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';

export interface ToolbarButtonProps {
  /**
   * Additional class name to provide on the root element, in addition to the slate-ToolbarButton class.
   */
  className?: string;

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<ToolbarButtonStyleProps, ToolbarButtonStyles>;

  /**
   * Is it active.
   */
  active?: boolean;

  /**
   * Icon of the button.
   */
  icon: any;

  /**
   * Tooltip props. If not provided, tooltip is disabled.
   */
  tooltip?: TippyProps;

  onMouseDown?: HTMLProps<HTMLSpanElement>['onMouseDown'];

  [key: string]: any;
}

export interface ToolbarButtonStyleProps {
  className?: string;
  active?: ToolbarButtonProps['active'];
}

export interface ToolbarButtonStyles {
  root?: IStyle;
}
