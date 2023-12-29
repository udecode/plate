'use client';

import * as React from 'react';
import { ComponentPropsWithoutRef, ReactNode } from 'react';
import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import { cn, withCn, withRef, withVariants } from '@udecode/cn';

import { Icons } from '@/components/icons';

import { Separator } from './separator';
import { Toggle, toggleVariants } from './toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from './tooltip';

export const Toolbar = withCn(
  ToolbarPrimitive.Root,
  'relative flex select-none items-stretch gap-1 bg-background'
);

export const ToolbarToggleGroup = withCn(
  ToolbarPrimitive.ToolbarToggleGroup,
  'flex items-center'
);

export const ToolbarLink = withCn(
  ToolbarPrimitive.Link,
  'font-medium underline underline-offset-4'
);

export const ToolbarSeparator = withCn(
  ToolbarPrimitive.Separator,
  'my-1 w-[1px] shrink-0 bg-border'
);

export const ToolbarButton = withRef<
  typeof ToolbarPrimitive.Button,
  Omit<ComponentPropsWithoutRef<typeof Toggle>, 'type'> & {
    buttonType?: 'button' | 'toggle';
    pressed?: boolean;
    tooltip?: ReactNode;
    isDropdown?: boolean;
  }
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
    const [isLoaded, setIsLoaded] = React.useState(false);

    React.useEffect(() => {
      setIsLoaded(true);
    }, []);

    const content =
      typeof pressed === 'boolean' ? (
        <ToolbarToggleGroup type="single" value="single">
          <ToolbarToggleItem
            ref={ref}
            className={cn(
              toggleVariants({
                variant,
                size,
              }),
              isDropdown && 'my-1 justify-between pr-1',
              className
            )}
            value={pressed ? 'single' : ''}
            {...props}
          >
            <div className="flex flex-1">{children}</div>
            <div>
              {isDropdown && (
                <Icons.arrowDown className="ml-0.5 h-4 w-4" data-icon />
              )}
            </div>
          </ToolbarToggleItem>
        </ToolbarToggleGroup>
      ) : (
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

    return isLoaded && tooltip ? (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>

        <TooltipPortal>
          <TooltipContent>{tooltip}</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    ) : (
      <>{content}</>
    );
  }
);

export const ToolbarToggleItem = withVariants(
  ToolbarPrimitive.ToggleItem,
  toggleVariants,
  ['variant', 'size']
);

export const ToolbarGroup = withRef<
  'div',
  {
    noSeparator?: boolean;
  }
>(({ className, children, noSeparator }, ref) => {
  const childArr = React.Children.map(children, (c) => c);
  if (!childArr || childArr.length === 0) return null;

  return (
    <div ref={ref} className={cn('flex', className)}>
      {!noSeparator && (
        <div className="h-full py-1">
          <Separator orientation="vertical" />
        </div>
      )}

      <div className="mx-1 flex items-center gap-1">{children}</div>
    </div>
  );
});
