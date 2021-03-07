import { getOnHotkeyToggleNodeTypeDefault } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { DEFAULTS_PARAGRAPH, ELEMENT_PARAGRAPH } from './defaults';
import { deserializeParagraph } from './deserializeParagraph';
import { renderElementParagraph } from './renderElementParagraph';
import { ParagraphPluginOptions } from './types';

/**
 * Enables support for paragraphs.
 */
export const ParagraphPlugin = (
  options?: ParagraphPluginOptions
): SlatePlugin => ({
  renderElement: renderElementParagraph(options),
  deserialize: deserializeParagraph(options),
  onKeyDown: getOnHotkeyToggleNodeTypeDefault({
    key: 'p',
    defaultOptions: DEFAULTS_PARAGRAPH,
    options,
  }),
  elementKeys: ELEMENT_PARAGRAPH,
});
