'use client';

import {
  BulletedListRules,
  OrderedListRules,
  TaskListRules,
} from '@platejs/list-classic';
import {
  BulletedListPlugin,
  ListItemContentPlugin,
  ListItemPlugin,
  ListPlugin,
  NumberedListPlugin,
  TaskListPlugin,
} from '@platejs/list-classic/react';

import {
  BulletedListElement,
  ListItemElement,
  NumberedListElement,
  TaskListElement,
} from '@/registry/ui/list-classic-node';

export const ListKit = [
  ListPlugin.configure({
    inputRules: [
      BulletedListRules.markdown({ variant: '-' }),
      BulletedListRules.markdown({ variant: '*' }),
      OrderedListRules.markdown({ variant: '.' }),
      OrderedListRules.markdown({ variant: ')' }),
      TaskListRules.markdown({ checked: false }),
      TaskListRules.markdown({ checked: true }),
    ],
    shortcuts: {
      toggleBulleted: {
        handler: ({ editor }) =>
          editor.plugin(ListPlugin).update.toggle({
            type: editor.getType(BulletedListPlugin.key),
          }),
        keys: 'mod+alt+5',
      },
      toggleNumbered: {
        handler: ({ editor }) =>
          editor.plugin(ListPlugin).update.toggle({
            type: editor.getType(NumberedListPlugin.key),
          }),
        keys: 'mod+alt+6',
      },
      toggleTask: {
        handler: ({ editor }) =>
          editor.plugin(ListPlugin).update.toggle({
            type: editor.getType(TaskListPlugin.key),
          }),
        keys: 'mod+alt+7',
      },
    },
  }),
  ListItemContentPlugin,
  BulletedListPlugin.configure({ component: BulletedListElement }),
  NumberedListPlugin.configure({ component: NumberedListElement }),
  TaskListPlugin.configure({ component: TaskListElement }),
  ListItemPlugin.configure({ component: ListItemElement }),
];
