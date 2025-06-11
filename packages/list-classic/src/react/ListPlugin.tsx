import { toPlatePlugin } from '@udecode/plate/react';

import {
  BaseBulletedListPlugin,
  BaseListItemContentPlugin,
  BaseListItemPlugin,
  BaseListPlugin,
  BaseNumberedListPlugin,
} from '../lib';

export const BulletedListPlugin = toPlatePlugin(BaseBulletedListPlugin);

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
    NumberedListPlugin,
    ListItemPlugin,
    ListItemContentPlugin,
  ],
});
