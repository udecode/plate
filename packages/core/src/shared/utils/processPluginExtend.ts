import merge from 'lodash/merge';

import type { PlateEditor, PlatePlugin } from '../types';

import { callOrReturn } from './misc/callOrReturn';

export function processPluginExtend<O = {}, T = {}, Q = {}, S = {}>(
  editor: PlateEditor,
  plugin: PlatePlugin<O, T, Q, S>
): PlatePlugin<O, T, Q, S> {
  if (plugin.__extend) {
    const extendedConfig = callOrReturn(plugin.__extend, editor, plugin);

    return merge({}, plugin, extendedConfig);
  }

  return plugin;
}
