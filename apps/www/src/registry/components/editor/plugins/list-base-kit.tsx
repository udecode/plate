import { KEYS } from '@udecode/plate';
import { BaseListPlugin } from '@udecode/plate-list';

import { BaseIndentKit } from '@/registry/components/editor/plugins/indent-base-kit';
import { TodoLiStatic, TodoMarkerStatic } from '@/registry/ui/list-todo-static';

export const BaseListKit = [
  ...BaseIndentKit,
  BaseListPlugin.extend({
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
          liComponent: TodoLiStatic,
          markerComponent: TodoMarkerStatic,
          type: 'todo',
        },
      },
    },
  }),
];
