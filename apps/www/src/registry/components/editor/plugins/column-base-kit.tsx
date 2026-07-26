import { BaseColumnItemPlugin, BaseColumnPlugin } from '@platejs/layout';

import {
  ColumnElementStatic,
  ColumnGroupElementStatic,
} from '@/registry/ui/column-node-static';

export const BaseColumnKit = [
  BaseColumnPlugin.configure({
    component: ColumnGroupElementStatic,
  }),
  BaseColumnItemPlugin.configure({
    component: ColumnElementStatic,
  }),
];
