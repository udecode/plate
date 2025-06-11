'use client';

import { BlockMenuPlugin } from '@udecode/plate-selection/react';

import { BlockContextMenu } from '@/registry/ui/block-context-menu';

import { BlockSelectionKit } from './block-selection-kit';

export const BlockMenuKit = [
  ...BlockSelectionKit,
  BlockMenuPlugin.configure({
    render: { aboveEditable: BlockContextMenu },
  }),
];
