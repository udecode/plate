import { SlatePlugin } from 'common/types';
import { renderElementParagraph } from 'elements/paragraph/renderElementParagraph';
import { ParagraphPluginOptions } from 'elements/paragraph/types';
import { deserializeParagraph } from './deserializeParagraph';

export const ParagraphPlugin = (
  options?: ParagraphPluginOptions
): SlatePlugin => ({
  renderElement: renderElementParagraph(options),
  deserialize: deserializeParagraph(options),
});
