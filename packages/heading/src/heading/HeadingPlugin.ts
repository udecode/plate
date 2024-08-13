import { type PlatePlugin, createPlugin } from '@udecode/plate-common';
import { onKeyDownToggleElement } from '@udecode/plate-common/react';

import type { HeadingPluginOptions, HeadingsPluginOptions } from './types';

import { KEYS_HEADING } from './constants';

/** Enables support for headings with configurable levels (from 1 to 6). */
export const HeadingPlugin = createPlugin<'heading', HeadingsPluginOptions>({
  key: 'heading',
  options: {
    levels: [1, 2, 3, 4, 5, 6],
  },
}).extend(({ plugin }) => {
  const {
    options: { levels },
  } = plugin;

  const plugins: PlatePlugin<string, HeadingPluginOptions>[] = [];

  const headingLevels = Array.isArray(levels)
    ? levels
    : Array.from({ length: levels || 6 }, (_, i) => i + 1);

  headingLevels.forEach((level) => {
    const key = KEYS_HEADING[level - 1];

    const plugin: PlatePlugin<string, HeadingPluginOptions> = createPlugin({
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
