import { createTEditor } from '@udecode/slate';

import type { AnyPluginConfig } from '../plugin/BasePlugin';

import { createPlugin } from '../plugin/createPlugin';
import { resolvePlugin } from './resolvePlugin';

export const resolvePluginTest = <P extends AnyPluginConfig>(plugin: P) => {
  return resolvePlugin(createTEditor() as any, plugin as any) as P;
};

export const resolveCreatePluginTest = ((plugin) => {
  return resolvePlugin(createTEditor() as any, createPlugin(plugin) as any);
}) as typeof createPlugin;
