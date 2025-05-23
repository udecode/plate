'use client';

import { TogglePlugin } from '@udecode/plate-toggle/react';

import { NodeIdKit } from '@/registry/components/editor/plugins/node-id-kit';
import { ToggleElement } from '@/registry/ui/toggle-node';

export const ToggleKit = [
  ...NodeIdKit,
  TogglePlugin.withComponent(ToggleElement),
];
