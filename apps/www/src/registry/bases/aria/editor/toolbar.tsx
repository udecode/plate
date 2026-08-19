'use client';

import * as React from 'react';

import {
  Button as ToolbarButtonPrimitive,
  Toolbar as ToolbarPrimitive,
  Tooltip,
  TooltipTrigger,
} from 'react-aria-components';

import { type VariantProps, cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

export function Toolbar({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive>) {
  return (
    <ToolbarPrimitive
      className={cn('relative flex select-none items-center', className)}
      {...props}
    />
  );
}

// From toggleVariants
const toolbarButtonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-[color,box-shadow] hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-checked:bg-accent aria-checked:text-accent-foreground aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 min-w-9 px-2',
        lg: 'h-10 min-w-10 px-2.5',
        sm: 'h-8 min-w-8 px-1.5',
      },
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground',
      },
    },
  }
);

const dropdownArrowVariants = cva(
  cn(
    'inline-flex items-center justify-center rounded-r-md font-medium text-foreground text-sm transition-colors disabled:pointer-events-none disabled:opacity-50'
  ),
  {
    defaultVariants: {
      size: 'sm',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 w-6',
        lg: 'h-10 w-8',
        sm: 'h-8 w-4',
      },
      variant: {
        default:
          'bg-transparent hover:bg-muted hover:text-muted-foreground aria-checked:bg-accent aria-checked:text-accent-foreground',
        outline:
          'border border-input border-l-0 bg-transparent hover:bg-accent hover:text-accent-foreground',
      },
    },
  }
);

type ToolbarButtonProps = {
  children?: React.ReactNode;
  isDropdown?: boolean;
  pressed?: boolean;
  tooltip?: React.ReactNode;
  tooltipContentProps?: Omit<React.ComponentProps<typeof Tooltip>, 'children'>;
  tooltipProps?: Omit<React.ComponentProps<typeof TooltipTrigger>, 'children'>;
  tooltipTriggerProps?: Omit<
    React.ComponentProps<typeof TooltipTrigger>,
    'children'
  >;
} & Omit<
  React.ComponentPropsWithoutRef<typeof ToolbarButtonPrimitive>,
  'asChild' | 'children'
> &
  VariantProps<typeof toolbarButtonVariants>;

export function ToolbarButton({
  children,
  className,
  isDropdown,
  pressed,
  size = 'sm',
  tooltip,
  tooltipContentProps,
  tooltipProps,
  tooltipTriggerProps,
  variant,
  ...props
}: ToolbarButtonProps) {
  const button = (
    <ToolbarButtonPrimitive
      className={cn(
        toolbarButtonVariants({ size, variant }),
        isDropdown && 'justify-between gap-1 pr-1',
        className
      )}
      aria-pressed={pressed}
      data-state={pressed === undefined ? undefined : pressed ? 'on' : 'off'}
      {...props}
    >
      {isDropdown ? (
        <>
          <div className="flex flex-1 items-center gap-2 whitespace-nowrap">
            {children}
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground" data-icon />
        </>
      ) : (
        children
      )}
    </ToolbarButtonPrimitive>
  );

  if (!tooltip) return button;

  return (
    <TooltipTrigger {...tooltipProps} {...tooltipTriggerProps}>
      {button}
      <Tooltip
        {...tooltipContentProps}
        className={cn(
          'z-50 w-fit text-balance rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-xs',
          tooltipContentProps?.className
        )}
      >
        {tooltip}
      </Tooltip>
    </TooltipTrigger>
  );
}

export function ToolbarSplitButton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToolbarButton>) {
  return (
    <ToolbarButton
      className={cn('group flex gap-0 px-0 hover:bg-transparent', className)}
      {...props}
    />
  );
}

type ToolbarSplitButtonPrimaryProps = Omit<
  React.ComponentPropsWithoutRef<'span'>,
  'size'
> &
  VariantProps<typeof toolbarButtonVariants>;

export function ToolbarSplitButtonPrimary({
  children,
  className,
  size = 'sm',
  variant,
  ...props
}: ToolbarSplitButtonPrimaryProps) {
  return (
    <span
      className={cn(
        toolbarButtonVariants({
          size,
          variant,
        }),
        'rounded-r-none',
        'group-data-[pressed=true]:bg-accent group-data-[pressed=true]:text-accent-foreground',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function ToolbarSplitButtonSecondary({
  className,
  size,
  variant,
  ...props
}: React.ComponentPropsWithoutRef<'span'> &
  VariantProps<typeof dropdownArrowVariants>) {
  return (
    <span
      className={cn(
        dropdownArrowVariants({
          size,
          variant,
        }),
        'group-data-[pressed=true]:bg-accent group-data-[pressed=true]:text-accent-foreground',
        className
      )}
      onClick={(e) => e.stopPropagation()}
      role="button"
      {...props}
    >
      <ChevronDown className="size-3.5 text-muted-foreground" data-icon />
    </span>
  );
}

export function ToolbarGroup({
  children,
  className,
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'group/toolbar-group',
        'relative hidden has-[button]:flex',
        className
      )}
    >
      <div className="flex items-center">{children}</div>

      <div
        className="group-last/toolbar-group:hidden! mx-1.5 h-6 w-px bg-border"
        aria-hidden="true"
      />
    </div>
  );
}

export function ToolbarMenuGroup({
  children,
  className,
  label,
  ...props
}: React.ComponentProps<'div'> & { label?: string }) {
  return (
    <>
      <hr
        className={cn(
          'hidden',
          'mb-0 shrink-0 peer-has-[[role=gridcell]]/menu-group:block peer-has-[[role=menuitem]]/menu-group:block peer-has-[[role=menuitemradio]]/menu-group:block peer-has-[[role=option]]/menu-group:block'
        )}
      />

      <div
        role="group"
        {...props}
        className={cn(
          'hidden',
          'peer/menu-group group/menu-group my-1.5 has-[[role=gridcell]]:block has-[[role=menuitem]]:block has-[[role=menuitemradio]]:block has-[[role=option]]:block',
          className
        )}
      >
        {label && (
          <div className="select-none px-2 py-1.5 font-semibold text-muted-foreground text-xs">
            {label}
          </div>
        )}
        {children}
      </div>
    </>
  );
}
