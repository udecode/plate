import { BaseListPlugin, PLUGINS } from 'platejs';

import {
  BlockListStatic,
  drawsBulletOnRoot,
} from '@/registry/components/editor/block-list-static';
import { BaseIndentKit } from '@/registry/components/editor/indent-static';

export const BaseListKit = [
  ...BaseIndentKit,
  BaseListPlugin.configure({
    inject: {
      isElement: true,
      nodeProps: {
        nodeKey: 'listType',
        query: ({ editor, nodeProps }) =>
          !!nodeProps.element && drawsBulletOnRoot(editor, nodeProps.element),
        transformProps: ({ element, props }) => ({
          ...props,
          role: 'listitem',
          style: {
            ...props.style,
            display: 'list-item',
            listStyleType: element?.listStyle,
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
      PLUGINS.image,
    ],
  }),
];
