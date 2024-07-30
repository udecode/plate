import {
  type PlatePlugin,
  createPlugin,
  onKeyDownToggleElement,
} from '@udecode/plate-common/server';

import type { HeadingPluginOptions, HeadingsPluginOptions } from './types';

import { KEYS_HEADING } from './constants';

export const KEY_HEADING = 'heading';

/** Enables support for headings with configurable levels (from 1 to 6). */
export const HeadingPlugin = createPlugin<HeadingsPluginOptions>({
  key: KEY_HEADING,
  options: {
    levels: [1, 2, 3, 4, 5, 6],
  },
}).extend((_, { options: { levels } = {} }) => {
  const plugins: PlatePlugin<HeadingPluginOptions>[] = [];

  const headingLevels = Array.isArray(levels)
    ? levels
    : Array.from({ length: levels || 6 }, (_, i) => i + 1);

  headingLevels.forEach((level) => {
    const key = KEYS_HEADING[level - 1];

    const plugin: PlatePlugin<HeadingPluginOptions> = createPlugin({
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
      isElement: true,
      key,
      options: {},
    });

    if (level < 4) {
      plugin.options!.hotkey = [`mod+opt+${level}`, `mod+shift+${level}`];
    }

    plugins.push(plugin);
  });

  return {
    plugins,
  };
});
