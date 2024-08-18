import {
  type HotkeyPluginOptions,
  type PluginConfig,
  type SlatePlugin,
  createSlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate-common';

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
export const HeadingPlugin = createTSlatePlugin<HeadingConfig>({
  key: 'heading',
  options: {
    levels: [1, 2, 3, 4, 5, 6],
  },
}).extend(({ plugin }) => {
  const {
    options: { levels },
  } = plugin;

  const plugins: SlatePlugin<HeadingPluginConfig>[] = [];

  const headingLevels = Array.isArray(levels)
    ? levels
    : Array.from({ length: levels || 6 }, (_, i) => i + 1);

  headingLevels.forEach((level) => {
    const key = HEADING_LEVELS[level - 1];

    const plugin: SlatePlugin<HeadingPluginConfig> = createSlatePlugin({
      deserializeHtml: {
        rules: [
          {
            validNodeName: `H${level}`,
          },
        ],
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
