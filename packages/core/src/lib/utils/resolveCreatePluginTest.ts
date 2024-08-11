import { createTEditor } from '@udecode/slate';

import type { AnyPlatePlugin } from '../plugin/types/PlatePlugin';

import { createPlugin } from '../plugin/createPlugin';
import { resolvePlugin } from './resolvePlugin';

export const resolvePluginTest = <P extends AnyPlatePlugin>(plugin: P) => {
  return resolvePlugin(createTEditor() as any, plugin) as P;
};

export const resolveCreatePluginTest: typeof createPlugin = (plugin) => {
  return resolvePlugin(createTEditor() as any, createPlugin(plugin));
};
