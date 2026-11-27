'use client';

import * as React from 'react';

import * as BasePopover from '@/registry/bases/base/floating-popover';
import * as RadixPopover from '@/registry/bases/radix/floating-popover';

import { useSiteRegistryProvider } from './provider';

type PopoverModule = typeof RadixPopover;

function usePopoverModule(): PopoverModule {
  return useSiteRegistryProvider() === 'base' ? BasePopover : RadixPopover;
}

export function FloatingPopover(
  props: React.ComponentProps<PopoverModule['FloatingPopover']>
) {
  const Component = usePopoverModule().FloatingPopover;

  return <Component {...props} />;
}

export function FloatingPopoverAnchor(
  props: React.ComponentProps<PopoverModule['FloatingPopoverAnchor']>
) {
  const Component = usePopoverModule().FloatingPopoverAnchor;

  return <Component {...props} />;
}

export function FloatingPopoverTrigger(
  props: React.ComponentProps<PopoverModule['FloatingPopoverTrigger']>
) {
  const Component = usePopoverModule().FloatingPopoverTrigger;

  return <Component {...props} />;
}

export function FloatingPopoverContent(
  props: React.ComponentProps<PopoverModule['FloatingPopoverContent']>
) {
  const Component = usePopoverModule().FloatingPopoverContent;

  return <Component {...props} />;
}
