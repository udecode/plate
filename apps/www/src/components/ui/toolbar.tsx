'use client';

import * as React from 'react';
import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// PLATE:

const toolbarVariants = cva(
  'relative flex select-none items-stretch gap-1 bg-background p-1'
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
    className={cn(toolbarVariants(), className)}
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
    className={cn(linkVariants(), className)}
    {...props}
  />
));
ToolbarLink.displayName = ToolbarPrimitive.Link.displayName;

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

export { Toolbar, ToolbarToggleGroup, ToolbarSeparator };
