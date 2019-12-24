import { SlatePlugin } from 'slate-plugins/types';
import { RenderElementOptions } from '../types';
import { deserializeParagraph } from './deserializeParagraph';
import { renderElementParagraph } from './renderElementParagraph';

export const ParagraphPlugin = (
  options?: RenderElementOptions
): SlatePlugin => ({
  renderElement: renderElementParagraph(options),
  deserialize: deserializeParagraph(),
});
