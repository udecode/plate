import { useRenderElements } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { KEYS_ALIGN } from './defaults';
import { useDeserializeAlign } from './useDeserializeAlign';

/**
 * Enables support for text alignment, useful to align your content
 * to left, right and center it.
 */
export const AlignPlugin = (): SlatePlugin => ({
  elementKeys: KEYS_ALIGN,
  renderElement: useRenderElements(KEYS_ALIGN),
  deserialize: useDeserializeAlign(),
});
