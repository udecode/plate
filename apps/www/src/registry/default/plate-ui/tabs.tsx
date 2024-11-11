'use client';

import * as React from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@udecode/cn';
import { type VariantProps, cva } from 'class-variance-authority';

const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva(
  'inline-flex h-10 w-full items-center border-b border-border bg-background px-2 text-sm'
);

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
    VariantProps<typeof tabsListVariants>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants(), className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const tabsTriggerVariants = cva(
  cn(
    'relative inline-flex h-[28px] items-center justify-center whitespace-nowrap rounded-sm px-2 transition-all disabled:pointer-events-none disabled:opacity-50',
    'text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-accent-foreground',
    'data-[state=active]:text-foreground data-[state=active]:before:absolute data-[state=active]:before:bottom-[-6px] data-[state=active]:before:left-2 data-[state=active]:before:h-[2px] data-[state=active]:before:w-[calc(100%-16px)] data-[state=active]:before:bg-primary data-[state=active]:before:content-[""]'
  )
);

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
    VariantProps<typeof tabsTriggerVariants>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants(), className)}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
