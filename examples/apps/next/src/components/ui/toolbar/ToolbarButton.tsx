import React, { HTMLProps } from 'react';
import Tippy, { TippyProps } from '@tippyjs/react';
import { cn } from '@udecode/plate-styled-components';

export interface ToolbarButtonProps
  extends Omit<HTMLProps<HTMLButtonElement>, 'type'> {
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

export function ToolbarButton(props: ToolbarButtonProps) {
  const {
    active: _active,
    icon,
    tooltip,
    className,
    actionHandler = 'onClick',
    onClick,
    ...buttonProps
  } = props;

  const tooltipProps: TippyProps = {
    content: '',
    offset: [0, 5],
    arrow: false,
    delay: 500,
    duration: [200, 0],
    hideOnClick: false,
    ...tooltip,
  };

  // this can replace onClick by onMouseDown
  buttonProps[actionHandler] = onClick;

  const button = (
    <button
      data-testid="ToolbarButton"
      type="button"
      aria-label={tooltipProps.content as string}
      data-state="active"
      className={cn(
        'flex cursor-pointer select-none items-center justify-center align-middle',
        'h-[32px] w-[32px]',
        'border-none bg-transparent text-current outline-none hover:bg-transparent',
        '[&_>_svg]:block [&_>_svg]:h-5 [&_>_svg]:w-5',
        className
      )}
      {...buttonProps}
    >
      {icon}
    </button>
  );

  return tooltip ? <Tippy {...tooltipProps}>{button}</Tippy> : button;
}
