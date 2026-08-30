import {
  BaseColumnItemPlugin,
  BaseColumnPlugin,
} from '../../../features/layout/lib';
import { toPlatePlugin } from '../../core';

export const ColumnItemPlugin = toPlatePlugin(BaseColumnItemPlugin);

/** Enables support for columns with React-specific features. */
export const ColumnPlugin = toPlatePlugin(BaseColumnPlugin, {
  dependencies: [ColumnItemPlugin],
});
