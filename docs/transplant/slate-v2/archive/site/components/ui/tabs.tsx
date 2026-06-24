import { Tabs as TabsPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/utils/cn'

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      className={cn('flex flex-col gap-2', className)}
      data-slot="tabs"
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex h-8 w-fit items-center justify-center rounded-lg bg-muted p-0.5 text-muted-foreground',
        className
      )}
      data-slot="tabs-list"
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex h-7 items-center justify-center whitespace-nowrap rounded-md border border-transparent px-2.5 py-1 font-medium text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs',
        className
      )}
      data-slot="tabs-trigger"
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn('outline-none data-[state=inactive]:hidden', className)}
      data-slot="tabs-content"
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
