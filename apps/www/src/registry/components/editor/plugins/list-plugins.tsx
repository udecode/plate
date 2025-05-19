'use client';

import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { HEADING_LEVELS } from '@udecode/plate-heading';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { ListPlugin } from '@udecode/plate-list/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { createPlatePlugins, ParagraphPlugin } from '@udecode/plate/react';

import { TodoLi, TodoMarker } from '@/registry/ui/list-todo';

export const ListKit = createPlatePlugins([
  IndentPlugin.extend({
    inject: {
      targetPlugins: [
        ParagraphPlugin.key,
        ...HEADING_LEVELS,
        BlockquotePlugin.key,
        CodeBlockPlugin.key,
        TogglePlugin.key,
      ],
    },
  }),
  ListPlugin.extend({
    inject: {
      targetPlugins: [
        ParagraphPlugin.key,
        ...HEADING_LEVELS,
        BlockquotePlugin.key,
        CodeBlockPlugin.key,
        TogglePlugin.key,
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
]);
