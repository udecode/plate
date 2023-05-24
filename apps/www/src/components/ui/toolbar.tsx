'use client';

import * as React from 'react';
import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import { VariantProps } from '@udecode/plate-tailwind';
import { cva } from 'class-variance-authority';
import { toggleVariants } from './toggle';

import { cn } from '@/lib/utils';

// PLATE:

const toolbarVariants = cva(
  'relative flex min-h-[40px] w-full min-w-max select-none items-stretch gap-1 bg-background p-1'
);

export const linkVariants = cva('font-medium underline underline-offset-4');

const ToolbarToggleGroup = ToolbarPrimitive.ToggleGroup;

export interface ToolbarProps
  extends React.ComponentPropsWithoutRef<typeof Toolbar> {}

const Toolbar = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Root> &
    VariantProps<typeof toolbarVariants>
>(({ className, ...props }, ref) => (
  <ToolbarPrimitive.Root
    ref={ref}
    className={toolbarVariants({ className })}
    {...props}
  />
));
Toolbar.displayName = ToolbarPrimitive.Root.displayName;

const ToolbarLink = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.Link>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Link> &
    VariantProps<typeof linkVariants>
>(({ className, ...props }, ref) => (
  <ToolbarPrimitive.Link
    ref={ref}
    className={linkVariants({ className })}
    {...props}
  />
));
ToolbarLink.displayName = ToolbarPrimitive.Link.displayName;

const ToolbarButton = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.Button>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size = 'sm', ...props }, ref) => (
  <ToolbarPrimitive.Button
    ref={ref}
    className={cn(
      toggleVariants({
        variant,
        size,
        className,
      })
    )}
    {...props}
  />
));
ToolbarButton.displayName = ToolbarPrimitive.Button.displayName;

const ToolbarToggleItem = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.ToggleItem>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.ToggleItem> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <ToolbarPrimitive.ToggleItem
    ref={ref}
    className={toggleVariants({ variant, size, className })}
    {...props}
  />
));
ToolbarToggleItem.displayName = ToolbarPrimitive.ToggleItem.displayName;

const ToolbarSeparator = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ToolbarPrimitive.Separator
    ref={ref}
    className={cn('shrink-0 bg-border', 'my-1 w-[1px]', className)}
    {...props}
  />
));
ToolbarSeparator.displayName = ToolbarPrimitive.Separator.displayName;

export {
  Toolbar,
  ToolbarToggleGroup,
  ToolbarButton,
  ToolbarToggleItem,
  ToolbarSeparator,
};
