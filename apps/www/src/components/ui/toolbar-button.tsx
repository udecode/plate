import * as React from 'react';
import { ReactNode } from 'react';
import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import { isDefined } from '@udecode/plate-common';
import { VariantProps } from 'class-variance-authority';
import { ToggleProps, toggleVariants } from './toggle';
import { ToolbarToggleGroup } from './toolbar';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

// PLATE:

export interface ToolbarButtonProps
  extends React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button>,
    VariantProps<typeof toggleVariants>,
    Omit<ToggleProps, 'type'> {
  buttonType?: 'button' | 'toggle';
  pressed?: boolean;
  tooltip?: ReactNode;
  isDropdown?: boolean;
}

const ToolbarButton = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.Button>,
  ToolbarButtonProps
>(
  (
    {
      className,
      variant,
      size = 'sm',
      isDropdown,
      children,
      pressed,
      value,
      tooltip,
      ...props
    },
    ref
  ) => {
    let content: JSX.Element;

    if (!isDefined(pressed)) {
      content = (
        <ToolbarPrimitive.Button
          ref={ref}
          className={cn(
            toggleVariants({
              variant,
              size,
            }),
            isDropdown && 'pr-1',
            className
          )}
          {...props}
        >
          {children}
        </ToolbarPrimitive.Button>
      );
    } else {
      content = (
        <ToolbarToggleGroup
          type="single"
          value={pressed ? 'single' : undefined}
        >
          <ToolbarToggleItem
            ref={ref}
            className={cn(
              toggleVariants({
                variant,
                size,
              }),
              isDropdown && 'pr-1',
              className
            )}
            value="single"
            {...props}
          >
            {children}
            {isDropdown && <Icons.arrowDown className="ml-0.5 h-3 w-3" />}
          </ToolbarToggleItem>
        </ToolbarToggleGroup>
      );
    }

    return tooltip ? (
      <Tooltip>
        <TooltipTrigger>{content}</TooltipTrigger>

        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    ) : (
      <>{content}</>
    );
  }
);
ToolbarButton.displayName = ToolbarPrimitive.Button.displayName;

const ToolbarToggleItem = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.ToggleItem>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.ToggleItem> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <ToolbarPrimitive.ToggleItem
    ref={ref}
    className={cn(toggleVariants({ variant, size }), className)}
    {...props}
  />
));
ToolbarToggleItem.displayName = ToolbarPrimitive.ToggleItem.displayName;

export { ToolbarButton, ToolbarToggleItem };
