import {
  type HotkeyPluginOptions,
  type PlatePlugin,
  type PluginConfig,
  createPlugin,
  createTPlugin,
} from '@udecode/plate-common';
import { onKeyDownToggleElement } from '@udecode/plate-common/react';

import { HEADING_LEVELS } from './constants';

export type HeadingPluginConfig = PluginConfig<any, HotkeyPluginOptions>;

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingConfig = PluginConfig<
  'heading',
  {
    /** Heading levels supported from 1 to `levels` */
    levels?: HeadingLevel | HeadingLevel[];
  }
>;

/** Enables support for headings with configurable levels (from 1 to 6). */
export const HeadingPlugin = createTPlugin<HeadingConfig>({
  key: 'heading',
  options: {
    levels: [1, 2, 3, 4, 5, 6],
  },
}).extend(({ plugin }) => {
  const {
    options: { levels },
  } = plugin;

  const plugins: PlatePlugin<HeadingPluginConfig>[] = [];

  const headingLevels = Array.isArray(levels)
    ? levels
    : Array.from({ length: levels || 6 }, (_, i) => i + 1);

  headingLevels.forEach((level) => {
    const key = HEADING_LEVELS[level - 1];

    const plugin: PlatePlugin<HeadingPluginConfig> = createPlugin({
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
