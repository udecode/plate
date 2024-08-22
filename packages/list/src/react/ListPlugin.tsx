import { toPlatePlugin } from '@udecode/plate-common/react';

import {
  BulletedListPlugin as BaseBulletedListPlugin,
  ListItemContentPlugin as BaseListItemContentPlugin,
  ListItemPlugin as BaseListItemPlugin,
  ListPlugin as BaseListPlugin,
  NumberedListPlugin as BaseNumberedListPlugin,
} from '../lib';
import { onKeyDownList } from './onKeyDownList';
import { withList } from './withList';

export const BulletedListPlugin = toPlatePlugin(BaseBulletedListPlugin, {
  dependencies: ['list'],
  handlers: {
    onKeyDown: onKeyDownList,
  },
});

export const NumberedListPlugin = toPlatePlugin(BaseNumberedListPlugin, {
  dependencies: ['list'],
  handlers: {
    onKeyDown: onKeyDownList,
  },
});

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
  withOverrides: withList,
});
