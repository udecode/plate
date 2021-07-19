import { HTMLProps } from 'react';
import { TippyProps } from '@tippyjs/react';
import { AnyObject } from '@udecode/plate-core';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface ToolbarButtonProps
  extends StyledProps<{ active?: CSSProp }>,
    AnyObject {
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
}
