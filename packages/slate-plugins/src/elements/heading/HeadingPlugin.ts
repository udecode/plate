import { useOnKeyDownElements } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { DEFAULT_HEADING_LEVEL, KEYS_HEADING } from './defaults';
import { HeadingPluginOptions } from './types';
import { useDeserializeHeading } from './useDeserializeHeading';
import { useRenderElementHeading } from './useRenderElementHeading';

/**
 * Enables support for headings with configurable levels
 * (from 1 to 6).
 */
export const HeadingPlugin = ({
  levels = DEFAULT_HEADING_LEVEL,
}: HeadingPluginOptions = {}): SlatePlugin => ({
  elementKeys: KEYS_HEADING,
  renderElement: useRenderElementHeading({ levels }),
  deserialize: useDeserializeHeading({ levels }),
  onKeyDown: useOnKeyDownElements(KEYS_HEADING),
});
