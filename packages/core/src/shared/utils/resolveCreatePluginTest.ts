import { createTEditor } from '@udecode/slate';

import type { PlatePlugin } from '../types/plugin/PlatePlugin';

import { createPlugin } from './createPlugin';
import { resolvePlugin } from './resolvePlugin';

export const resolvePluginTest = <
  K extends string = '',
  O = {},
  A = {},
  T = {},
  S = {},
>(
  plugin: PlatePlugin<K, O, A, T, S>
): PlatePlugin<K, O, A, T, S> => {
  return resolvePlugin(createTEditor() as any, plugin);
};

export const resolveCreatePluginTest: typeof createPlugin = (plugin) => {
  return resolvePlugin(createTEditor() as any, createPlugin(plugin));
};
