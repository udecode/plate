import { SlatePlugin } from 'common/types';
import { RenderElementOptions } from 'element/types';
import { renderElementParagraph } from 'elements/paragraph/renderElementParagraph';
import { deserializeParagraph } from './deserializeParagraph';

export const ParagraphPlugin = (
  options?: RenderElementOptions & { typeP?: string }
): SlatePlugin => ({
  renderElement: renderElementParagraph(options),
  deserialize: deserializeParagraph(options),
});
