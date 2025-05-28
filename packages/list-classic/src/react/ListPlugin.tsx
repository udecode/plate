import { toPlatePlugin } from '@udecode/plate/react';

import {
  BaseBulletedListPlugin,
  BaseListItemContentPlugin,
  BaseListItemPlugin,
  BaseListPlugin,
  BaseNumberedListPlugin,
} from '../lib';
import { onKeyDownList } from './onKeyDownList';
import { withList } from './withList';

export const BulletedListPlugin = toPlatePlugin(BaseBulletedListPlugin);

export const NumberedListPlugin = toPlatePlugin(BaseNumberedListPlugin);

export const ListItemContentPlugin = toPlatePlugin(BaseListItemContentPlugin);

export const ListItemPlugin = toPlatePlugin(BaseListItemPlugin);

/**
 * Enables support for bulleted, numbered and to-do lists with React-specific
 * features.
 */
export const ListPlugin = toPlatePlugin(BaseListPlugin, {
  handlers: {
    onKeyDown: onKeyDownList,
  },
  plugins: [
    BulletedListPlugin,
    NumberedListPlugin,
    ListItemPlugin,
    ListItemContentPlugin,
  ],
}).overrideEditor(withList);
