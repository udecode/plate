'use client';

import { TogglePlugin } from '@platejs/toggle/react';

import { IndentKit } from '@/registry/components/editor/plugins/indent-kit';
import { ToggleElement } from '@/registry/ui/toggle-node';

export const ToggleKit = [
  ...IndentKit,
  TogglePlugin.withComponent(ToggleElement),
];
