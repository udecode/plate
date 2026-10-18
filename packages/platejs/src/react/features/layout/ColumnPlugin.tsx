import {
  BaseColumnItemPlugin,
  BaseColumnGroupPlugin,
} from '../../../features/layout/lib';
import { toReactPlugin } from '../../core';

export const ColumnItemPlugin = toReactPlugin(BaseColumnItemPlugin);

/** Enables support for columns with React-specific features. */
export const ColumnGroupPlugin = toReactPlugin(BaseColumnGroupPlugin, {
  dependencies: [ColumnItemPlugin],
});
