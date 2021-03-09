import { getOnHotkeyToggleNodeTypeDefault } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import {
  DEFAULTS_PARAGRAPH,
  ELEMENT_PARAGRAPH,
  KEY_PARAGRAPH,
} from './defaults';
import { deserializeParagraph } from './deserializeParagraph';
import { ParagraphPluginOptions } from './types';
import { useRenderElementParagraph } from './useRenderElementParagraph';

/**
 * Enables support for paragraphs.
 */
export const ParagraphPlugin = (
  options?: ParagraphPluginOptions
): SlatePlugin => {
  return {
    renderElement: useRenderElementParagraph(options),
    deserialize: deserializeParagraph(options),
    onKeyDown: getOnHotkeyToggleNodeTypeDefault({
      key: 'p',
      defaultOptions: DEFAULTS_PARAGRAPH,
      options,
    }),
    elementKeys: [ELEMENT_PARAGRAPH],
  };
};
