'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { withCn, withProps } from '@/lib/utils';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipPortal = TooltipPrimitive.Portal;

export const TooltipContent = withCn(
  withProps(TooltipPrimitive.Content, {
    sideOffset: 4,
  }),
  'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md'
);
