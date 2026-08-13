import { BaseListPlugin, isOrderedList } from '@platejs/list';
import { PLUGINS } from 'platejs';

import { BaseIndentKit } from '@/registry/components/editor/plugins/indent-base-kit';
import { BlockListStatic } from '@/registry/ui/block-list-static';

export const BaseListKit = [
  ...BaseIndentKit,
  BaseListPlugin.configure({
    inject: {
      nodeProps: {
        nodeKey: 'listStyleType',
        query: ({ nodeProps }) => {
          const element = nodeProps.element;

          return !!element?.listStyleType && !isOrderedList(element);
        },
        transformProps: ({ props }) => ({
          ...props,
          role: 'listitem',
          style: {
            ...props.style,
            display: 'list-item',
          },
        }),
      },
    },
    render: {
      belowNodes: BlockListStatic,
    },
    targetPlugins: [
      PLUGINS.paragraph,
      PLUGINS.h1,
      PLUGINS.h2,
      PLUGINS.h3,
      PLUGINS.h4,
      PLUGINS.h5,
      PLUGINS.h6,
      PLUGINS.blockquote,
      PLUGINS.codeBlock,
      PLUGINS.toggle,
    ],
  }),
];
