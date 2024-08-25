import type { AnyPluginConfig } from '../plugin/BasePlugin';

import { createSlateEditor } from '../editor';
import { createSlatePlugin } from '../plugin/createSlatePlugin';
import { resolvePlugin } from './resolvePlugin';

export const resolvePluginTest = <P extends AnyPluginConfig>(plugin: P) => {
  return resolvePlugin(createSlateEditor() as any, plugin as any) as P;
};

export const resolveCreatePluginTest = ((plugin) => {
  return resolvePlugin(
    createSlateEditor() as any,
    createSlatePlugin(plugin) as any
  );
}) as typeof createSlatePlugin;
