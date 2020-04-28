import { SlatePlugin } from 'types';
import { RenderElementOptions } from '../types';
import { deserializeParagraph } from './deserializeParagraph';
import { renderElementParagraph } from './renderElementParagraph';

export const ParagraphPlugin = (
  options?: RenderElementOptions & { typeP?: string }
): SlatePlugin => ({
  renderElement: renderElementParagraph(options),
  deserialize: deserializeParagraph(options),
});
