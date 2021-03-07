import { SlatePlugin } from '@udecode/slate-plugins-core';
import {
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_LEFT,
  ELEMENT_ALIGN_RIGHT,
} from './defaults';
import { deserializeAlign } from './deserializeAlign';
import { renderElementAlign } from './renderElementAlign';
import { AlignPluginOptions } from './types';

/**
 * Enables support for text alignment, useful to align your content
 * to left, right and center it.
 */
export const AlignPlugin = (options?: AlignPluginOptions): SlatePlugin => ({
  elementKeys: [
    ELEMENT_ALIGN_LEFT,
    ELEMENT_ALIGN_CENTER,
    ELEMENT_ALIGN_RIGHT,
    ELEMENT_ALIGN_JUSTIFY,
  ],
  renderElement: renderElementAlign(options),
  deserialize: deserializeAlign(options),
});
