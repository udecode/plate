'use client';

import { KEYS } from '@udecode/plate';
import { ListPlugin } from '@udecode/plate-list/react';

import { IndentKit } from '@/registry/components/editor/plugins/indent-kit';
import { BlockList } from '@/registry/ui/block-list';

export const ListKit = [
  ...IndentKit,
  ListPlugin.configure({
    inject: {
      targetPlugins: [
        ...KEYS.heading,
        KEYS.p,
        KEYS.blockquote,
        KEYS.codeBlock,
        KEYS.toggle,
      ],
    },
    render: {
      belowNodes: BlockList,
    },
  }),
];
