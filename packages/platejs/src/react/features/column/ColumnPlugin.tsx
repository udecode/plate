import {
  BaseColumnGroupPlugin,
  BaseColumnItemPlugin,
} from '../../../features/column/lib';
import { toReactPlugin } from '../../core';

/** React adapter for individual columns inside a column group. */
export const ColumnItemPlugin = toReactPlugin(BaseColumnItemPlugin);

/** React adapter for multi-column groups. */
export const ColumnGroupPlugin = toReactPlugin(BaseColumnGroupPlugin, {
  dependencies: [ColumnItemPlugin],
});
