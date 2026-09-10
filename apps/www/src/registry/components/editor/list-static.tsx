import { BaseListPlugin, isOrderedList, ListType, PLUGINS } from 'platejs';

import { BlockListStatic } from '@/registry/components/editor/block-list-static';
import { BaseIndentKit } from '@/registry/components/editor/indent-static';

export const BaseListKit = [
  ...BaseIndentKit,
  BaseListPlugin.configure({
    inject: {
      isElement: true,
      nodeProps: {
        nodeKey: 'listType',
        query: ({ nodeProps }) => {
          const { element } = nodeProps;

          return (
            element?.listType === ListType.Bulleted && !isOrderedList(element)
          );
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
    slots: {
      wrapNodeChildren: BlockListStatic,
    },
    targetPlugins: [
      PLUGINS.paragraph,
      PLUGINS.heading,
      PLUGINS.blockquote,
      PLUGINS.codeBlock,
      PLUGINS.details,
    ],
  }),
];
