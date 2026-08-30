'use client';

import {
  BulletedListRules,
  isOrderedList,
  ListType,
  OrderedListRules,
  TaskListRules,
  PLUGINS,
} from 'platejs';
import { ListPlugin } from 'platejs/react';

import { BlockList } from '@/registry/components/editor/block-list';
import { IndentKit } from '@/registry/components/editor/indent';

export const ListKit = [
  ...IndentKit,
  ListPlugin.configure({
    inputRules: [
      BulletedListRules.markdown({ variant: '-' }),
      BulletedListRules.markdown({ variant: '*' }),
      OrderedListRules.markdown({ variant: '.' }),
      OrderedListRules.markdown({ variant: ')' }),
      TaskListRules.markdown({ checked: false }),
      TaskListRules.markdown({ checked: true }),
    ],
    inject: {
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
    render: {
      belowNodes: BlockList,
    },
    targetPlugins: [
      PLUGINS.heading,
      PLUGINS.paragraph,
      PLUGINS.blockquote,
      PLUGINS.codeBlock,
      PLUGINS.details,
      PLUGINS.image,
    ],
  }),
];
