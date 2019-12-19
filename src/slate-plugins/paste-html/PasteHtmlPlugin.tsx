import { SlatePlugin } from 'slate-react';
import { withPasteHtml } from './withPasteHtml';

export const PasteHtmlPlugin = (): SlatePlugin => ({
  editor: withPasteHtml,
});
