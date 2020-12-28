import { getRenderElement, setDefaults } from '@udecode/slate-plugins-common';
import { DEFAULTS_PARAGRAPH } from './defaults';
import { ParagraphRenderElementOptions } from './types';

export const renderElementParagraph = (
  options?: ParagraphRenderElementOptions
) => {
  const { p } = setDefaults(options, DEFAULTS_PARAGRAPH);

  return getRenderElement(p);
};
