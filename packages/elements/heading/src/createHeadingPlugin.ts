import { getToggleElementOnKeyDown } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { DEFAULT_HEADING_LEVEL, KEYS_HEADING } from './defaults';
import { getHeadingDeserialize } from './getHeadingDeserialize';
import { getHeadingRenderElement } from './getHeadingRenderElement';
import { HeadingPluginOptions } from './types';

/**
 * Enables support for headings with configurable levels
 * (from 1 to 6).
 */
export const createHeadingPlugin = ({
  levels = DEFAULT_HEADING_LEVEL,
}: HeadingPluginOptions = {}): PlatePlugin => ({
  pluginKeys: KEYS_HEADING,
  renderElement: getHeadingRenderElement({ levels }),
  deserialize: getHeadingDeserialize({ levels }),
  onKeyDown: getToggleElementOnKeyDown(KEYS_HEADING),
});
