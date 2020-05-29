import { SlatePlugin } from '../../common';
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
});
