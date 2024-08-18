import { createTEditor } from '@udecode/slate';

import type { AnyPluginConfig } from '../plugin/BasePlugin';

import { createSlatePlugin } from '../plugin/createSlatePlugin';
import { resolvePlugin } from './resolvePlugin';

export const resolvePluginTest = <P extends AnyPluginConfig>(plugin: P) => {
  return resolvePlugin(createTEditor() as any, plugin as any) as P;
};

export const resolveCreatePluginTest = ((plugin) => {
  return resolvePlugin(
    createTEditor() as any,
    createSlatePlugin(plugin) as any
  );
}) as typeof createSlatePlugin;
