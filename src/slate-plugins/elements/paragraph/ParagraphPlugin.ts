import { SlatePlugin } from 'slate-react';
import { deserializeParagraph } from './deserializeParagraph';
import { renderElementParagraph } from './renderElementParagraph';

export const ParagraphPlugin = (): SlatePlugin => ({
  renderElement: renderElementParagraph(),
  deserialize: deserializeParagraph(),
});
