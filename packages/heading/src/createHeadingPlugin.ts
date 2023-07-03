import {
  PlatePlugin,
  createPluginFactory,
  onKeyDownToggleElement,
} from '@udecode/plate-common';

import { KEYS_HEADING } from './constants';
import { HeadingPlugin, HeadingsPlugin } from './types';

/**
 * Enables support for headings with configurable levels
 * (from 1 to 6).
 */
export const createHeadingPlugin = createPluginFactory<HeadingsPlugin>({
  key: 'heading',
  options: {
    levels: 6,
  },
  then: (editor, { options: { levels } = {} }) => {
    const plugins: PlatePlugin<HeadingPlugin>[] = [];

    for (let level = 1; level <= levels!; level++) {
      const key = KEYS_HEADING[level - 1];

      const plugin: PlatePlugin<HeadingPlugin> = {
        key,
        isElement: true,
        deserializeHtml: {
          rules: [
            {
              validNodeName: `H${level}`,
            },
          ],
        },
        handlers: {
          onKeyDown: onKeyDownToggleElement,
        },
        options: {},
      };

      if (level < 4) {
        plugin.options!.hotkey = [`mod+opt+${level}`, `mod+shift+${level}`];
      }

      plugins.push(plugin);
    }

    return {
      plugins,
    };
  },
});
