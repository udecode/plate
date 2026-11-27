'use client';

import * as React from 'react';

import * as BaseToolbar from '@/registry/bases/base/toolbar';
import * as RadixToolbar from '@/registry/bases/radix/toolbar';

import { useSiteRegistryProvider } from './provider';

type ToolbarModule = typeof RadixToolbar;

function useToolbarModule(): ToolbarModule {
  return useSiteRegistryProvider() === 'base' ? BaseToolbar : RadixToolbar;
}

export function Toolbar(props: React.ComponentProps<ToolbarModule['Toolbar']>) {
  const Component = useToolbarModule().Toolbar;

  return <Component {...props} />;
}

export function ToolbarButton(
  props: React.ComponentProps<ToolbarModule['ToolbarButton']>
) {
  const Component = useToolbarModule().ToolbarButton;

  return <Component {...props} />;
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

  return <Component {...props} />;
}

export function ToolbarSplitButtonSecondary(
  props: React.ComponentProps<ToolbarModule['ToolbarSplitButtonSecondary']>
) {
  const Component = useToolbarModule().ToolbarSplitButtonSecondary;

  return <Component {...props} />;
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
