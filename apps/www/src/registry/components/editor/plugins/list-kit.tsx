'use client';

import { KEYS } from '@udecode/plate';
import { ListPlugin } from '@udecode/plate-list/react';

import { IndentKit } from '@/registry/components/editor/plugins/indent-kit';
import { TodoLi, TodoMarker } from '@/registry/ui/list-todo';

export const ListKit = [
  ...IndentKit,
  ListPlugin.extend({
    inject: {
      targetPlugins: [
        KEYS.p,
        ...KEYS.heading,
        KEYS.blockquote,
        KEYS.codeBlock,
        KEYS.toggle,
      ],
    },
    options: {
      listStyleTypes: {
        todo: {
          liComponent: TodoLi,
          markerComponent: TodoMarker,
          type: 'todo',
        },
      },
    },
  }),
];
