'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import * as BaseToolbar from '@/registry/bases/base/toolbar';
import * as RadixToolbar from '@/registry/bases/radix/toolbar';
import { PLATE_PREVIEW_STYLE_CLASSES } from '@/registry/styles/preview-style-classes';

import { useSiteRegistryProvider } from './provider';

type ToolbarModule = typeof RadixToolbar;

const styleClasses = PLATE_PREVIEW_STYLE_CLASSES.nova;

function useToolbarModule(): ToolbarModule {
  return useSiteRegistryProvider() === 'base' ? BaseToolbar : RadixToolbar;
}

function getButtonClasses(
  size: 'default' | 'lg' | 'sm' | null | undefined,
  variant: 'default' | 'outline' | null | undefined
) {
  return cn(
    styleClasses['cn-toggle'],
    styleClasses[`cn-toggle-size-${size ?? 'sm'}`],
    styleClasses[`cn-toggle-variant-${variant ?? 'default'}`]
  );
}

export function Toolbar(props: React.ComponentProps<ToolbarModule['Toolbar']>) {
  const Component = useToolbarModule().Toolbar;

  return <Component {...props} />;
}

export function ToolbarButton(
  props: React.ComponentProps<ToolbarModule['ToolbarButton']>
) {
  const Component = useToolbarModule().ToolbarButton;

  return (
    <Component
      {...props}
      className={cn(
        getButtonClasses(props.size, props.variant),
        props.className
      )}
      tooltipContentProps={{
        ...props.tooltipContentProps,
        className: cn(
          styleClasses['cn-tooltip-content'],
          styleClasses['cn-tooltip-content-logical'],
          props.tooltipContentProps?.className
        ),
      }}
    />
  );
}

export function ToolbarSplitButton(
  props: React.ComponentProps<ToolbarModule['ToolbarSplitButton']>
) {
  const Component = useToolbarModule().ToolbarSplitButton;

  return <Component {...props} />;
}

export function ToolbarSplitButtonPrimary(
  props: React.ComponentProps<ToolbarModule['ToolbarSplitButtonPrimary']>
) {
  const Component = useToolbarModule().ToolbarSplitButtonPrimary;

  return (
    <Component
      {...props}
      className={cn(
        getButtonClasses(props.size, props.variant),
        props.className
      )}
    />
  );
}

export function ToolbarSplitButtonSecondary(
  props: React.ComponentProps<ToolbarModule['ToolbarSplitButtonSecondary']>
) {
  const Component = useToolbarModule().ToolbarSplitButtonSecondary;

  return (
    <Component
      {...props}
      className={cn(
        styleClasses['cn-toggle'],
        styleClasses[`cn-toggle-variant-${props.variant ?? 'default'}`],
        props.className
      )}
    />
  );
}

export function ToolbarGroup(
  props: React.ComponentProps<ToolbarModule['ToolbarGroup']>
) {
  const Component = useToolbarModule().ToolbarGroup;

  return <Component {...props} />;
}

export function ToolbarMenuGroup(
  props: React.ComponentProps<ToolbarModule['ToolbarMenuGroup']>
) {
  const Component = useToolbarModule().ToolbarMenuGroup;

  return <Component {...props} />;
}
