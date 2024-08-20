import type { ExtendConfig, HotkeyPluginOptions } from '@udecode/plate-common';

import { toPlatePlugin } from '@udecode/plate-common/react';

import {
  type ListConfig as BaseListConfig,
  ListItemContentPlugin as BaseListItemContentPlugin,
  ListItemPlugin as BaseListItemPlugin,
  ListOrderedPlugin as BaseListOrderedPlugin,
  ListPlugin as BaseListPlugin,
  ListUnorderedPlugin as BaseListUnorderedPlugin,
} from '../lib';
import { onKeyDownList } from './onKeyDownList';
import { withList } from './withList';

export type ListConfig = ExtendConfig<BaseListConfig, HotkeyPluginOptions>;

export const ListUnorderedPlugin = toPlatePlugin(BaseListUnorderedPlugin, {
  handlers: {
    onKeyDown: onKeyDownList,
  },
});

export const ListOrderedPlugin = toPlatePlugin(BaseListOrderedPlugin, {
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
    ListUnorderedPlugin,
    ListOrderedPlugin,
    ListItemPlugin,
    ListItemContentPlugin,
  ],
  withOverrides: withList,
});
