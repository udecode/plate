import {
  type PluginConfig,
  type SlatePlugin,
  createSlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate';

import { HEADING_LEVELS } from './constants';

export type HeadingConfig = PluginConfig<
  'heading',
  {
    /** Heading levels supported from 1 to `levels` */
    levels?: HeadingLevel | HeadingLevel[];
  }
>;

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Enables support for headings with configurable levels (from 1 to 6). */
export const BaseHeadingPlugin = createTSlatePlugin<HeadingConfig>({
  key: 'heading',
  options: {
    levels: [1, 2, 3, 4, 5, 6],
  },
}).extend(({ plugin }) => {
  const {
    options: { levels },
  } = plugin;

  const plugins: SlatePlugin[] = [];

  const headingLevels = Array.isArray(levels)
    ? levels
    : Array.from({ length: levels || 6 }, (_, i) => i + 1);

  headingLevels.forEach((level) => {
    const plugin: SlatePlugin = createSlatePlugin({
      key: HEADING_LEVELS[level - 1],
      node: { isElement: true },
      parsers: {
        html: {
          deserializer: {
            rules: [
              {
                validNodeName: `H${level}`,
              },
            ],
          },
        },
      },
    });

    plugins.push(plugin);
  });

  return {
    plugins,
  };
});
