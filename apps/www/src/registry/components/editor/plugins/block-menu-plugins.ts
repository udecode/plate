'use client';

import { BlockMenuPlugin } from '@udecode/plate-selection/react';
import { createPlatePlugins } from '@udecode/plate/react';

import { BlockContextMenu } from '@/registry/ui/block-context-menu';

import { blockSelectionPlugins } from './block-selection-plugins';

export const BlockMenuKit = createPlatePlugins([
  ...blockSelectionPlugins,
  BlockMenuPlugin.configure({
    render: { aboveEditable: BlockContextMenu },
  }),
]);
