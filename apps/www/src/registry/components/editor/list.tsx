'use client';

import {
  BulletedListRules,
  isOrderedList,
  ListType,
  OrderedListRules,
  TaskListRules,
} from '@platejs/list';
import { ListPlugin } from '@platejs/list/react';
import { PLUGINS } from 'platejs';

import { IndentKit } from '@/registry/components/editor/indent';
import { BlockList } from '@/registry/components/editor/block-list';

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
          const element = nodeProps.element;

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
      PLUGINS.toggle,
      PLUGINS.image,
    ],
  }),
];
