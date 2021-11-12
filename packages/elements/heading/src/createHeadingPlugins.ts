import { getToggleElementOnKeyDown } from '@udecode/plate-common';
import { createPlugin, PlatePlugin } from '@udecode/plate-core';
import { DEFAULT_HEADING_LEVEL, KEYS_HEADING } from './defaults';
import { getHeadingDeserialize } from './getHeadingDeserialize';
import { HeadingPlugin, HeadingsPlugin } from './types';

/**
 * Enables support for headings with configurable levels
 * (from 1 to 6).
 */
export const createHeadingPlugin = createPlugin<HeadingsPlugin>({
  levels: DEFAULT_HEADING_LEVEL,
  withEditor: (editor, { levels }) => {
    const plugins: PlatePlugin<{}, HeadingPlugin>[] = [];

    for (let level = 1; level <= levels; level++) {
      const key = KEYS_HEADING[level - 1];

      const plugin: PlatePlugin<{}, HeadingPlugin> = {
        key,
        isElement: true,
        deserialize: getHeadingDeserialize(key),
        onKeyDown: getToggleElementOnKeyDown(key),
      };

      if (level < 4) {
        plugin.hotkey = ['mod+opt+1', 'mod+shift+1'];
      }

      plugins.push(plugin);
    }

    return plugins;
  },
});
