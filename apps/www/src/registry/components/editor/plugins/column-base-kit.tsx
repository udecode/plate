import { BaseColumnItemPlugin, BaseColumnPlugin } from '@udecode/plate-layout';

import {
  ColumnElementStatic,
  ColumnGroupElementStatic,
} from '@/registry/ui/column-node-static';

export const BaseColumnKit = [
  BaseColumnPlugin.withComponent(ColumnGroupElementStatic),
  BaseColumnItemPlugin.withComponent(ColumnElementStatic),
];
