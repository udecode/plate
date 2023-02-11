import { HTMLProps } from 'react';
import { TippyProps } from '@tippyjs/react';
import { PlateId } from '@udecode/plate-core';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface ToolbarButtonProps
  extends StyledProps<{ active?: CSSProp }>,
    Omit<HTMLProps<HTMLButtonElement>, 'id' | 'as' | 'type'> {
  id?: PlateId;

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

  /**
   * Handler to use to actionate the button.
   * @default onClick
   */
  actionHandler?: 'onClick' | 'onMouseDown';
}
