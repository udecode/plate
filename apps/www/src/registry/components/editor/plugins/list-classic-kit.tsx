'use client';

import {
  BulletedListPlugin,
  CheckListPlugin,
  ListItemPlugin,
  ListPlugin,
  NumberedListPlugin,
} from '@platejs/list-classic/react';

import {
  BulletedListElement,
  CheckListElement,
  ListItemElement,
  NumberedListElement,
} from '@/registry/ui/list-classic-node';

export const ListKit = [
  ListPlugin,
  BulletedListPlugin.configure({
    node: { component: BulletedListElement },
    shortcuts: { toggle: { keys: 'mod+alt+5' } },
  }),
  NumberedListPlugin.configure({
    node: { component: NumberedListElement },
    shortcuts: { toggle: { keys: 'mod+alt+6' } },
  }),
  CheckListPlugin.configure({
    node: { component: CheckListElement },
    shortcuts: { toggle: { keys: 'mod+alt+7' } },
  }),
  ListItemPlugin.withComponent(ListItemElement),
];
