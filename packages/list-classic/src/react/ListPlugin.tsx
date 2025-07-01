import { toPlatePlugin } from 'platejs/react';

import {
  BaseBulletedListPlugin,
  BaseCheckListPlugin,
  BaseListItemContentPlugin,
  BaseListItemPlugin,
  BaseListPlugin,
  BaseNumberedListPlugin,
} from '../lib';

export const BulletedListPlugin = toPlatePlugin(BaseBulletedListPlugin);

export const CheckListPlugin = toPlatePlugin(BaseCheckListPlugin);

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
    CheckListPlugin,
    NumberedListPlugin,
    ListItemPlugin,
    ListItemContentPlugin,
  ],
});
