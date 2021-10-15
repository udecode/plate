import { PlatePlugin } from '@udecode/plate-core';
import { getAlignOverrideProps } from './getAlignOverrideProps';
import { AlignPluginOptions } from './types';

/**
 * Enables support for text alignment, useful to align your content
 * to left, right, center or justify.
 */
export const createAlignPlugin = (
  options?: AlignPluginOptions
): PlatePlugin => ({
  overrideProps: getAlignOverrideProps(options),
});
