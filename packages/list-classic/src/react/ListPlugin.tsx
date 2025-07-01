import { toPlatePlugin } from 'platejs/react';

import {
  BaseBulletedListPlugin,
  BaseTaskListPlugin,
  BaseListItemContentPlugin,
  BaseListItemPlugin,
  BaseListPlugin,
  BaseNumberedListPlugin,
} from '../lib';

export const BulletedListPlugin = toPlatePlugin(BaseBulletedListPlugin);

export const TaskListPlugin = toPlatePlugin(BaseTaskListPlugin);

export const NumberedListPlugin = toPlatePlugin(BaseNumberedListPlugin);

export const ListItemContentPlugin = toPlatePlugin(BaseListItemContentPlugin);

export const ListItemPlugin = toPlatePlugin(BaseListItemPlugin);

/**
 * Enables support for bulleted, numbered and to-do lists with React-specific
 * features.
 */
export const ListPlugin = toPlatePlugin(BaseListPlugin, {
  plugins: [
    BulletedListPlugin,
    TaskListPlugin,
    NumberedListPlugin,
    ListItemPlugin,
    ListItemContentPlugin,
  ],
});
