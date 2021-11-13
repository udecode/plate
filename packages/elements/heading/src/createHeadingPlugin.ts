import { getToggleElementOnKeyDown } from '@udecode/plate-common';
import { createPluginFactory, PlatePlugin } from '@udecode/plate-core';
import { KEYS_HEADING } from './constants';
import { getHeadingDeserialize } from './getHeadingDeserialize';
import { HeadingPlugin, HeadingsPlugin } from './types';

/**
 * Enables support for headings with configurable levels
 * (from 1 to 6).
 */
export const createHeadingPlugin = createPluginFactory<HeadingsPlugin>({
  key: 'heading',
  levels: 6,
  then: (editor, { levels }) => {
    const plugins: PlatePlugin<{}, HeadingPlugin>[] = [];

    for (let level = 1; level <= levels!; level++) {
      const key = KEYS_HEADING[level - 1];

      const plugin: PlatePlugin<{}, HeadingPlugin> = {
        key,
        isElement: true,
        deserialize: getHeadingDeserialize(),
        onKeyDown: getToggleElementOnKeyDown(),
      };

      if (level < 4) {
        plugin.hotkey = ['mod+opt+1', 'mod+shift+1'];
      }

      plugins.push(plugin);
    }

    return {
      plugins,
    };
  },
});
