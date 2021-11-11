import { getToggleElementOnKeyDown } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { DEFAULT_HEADING_LEVEL, KEYS_HEADING } from './defaults';
import { getHeadingDeserialize } from './getHeadingDeserialize';
import { HeadingPluginOptions } from './types';

/**
 * Enables support for headings with configurable levels
 * (from 1 to 6).
 */
export const createHeadingPlugins = ({
  levels = DEFAULT_HEADING_LEVEL,
}: HeadingPluginOptions = {}): PlatePlugin[] => {
  const plugins: PlatePlugin[] = [];

  for (let level = 1; level <= levels; level++) {
    const key = KEYS_HEADING[level - 1];

    plugins.push({
      key,
      isElement: true,
      deserialize: getHeadingDeserialize(key),
      onKeyDown: getToggleElementOnKeyDown(key),
    });
  }

  return plugins;
};
