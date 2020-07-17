import { getRenderElement } from '../../common/utils/getRenderElement';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_PARAGRAPH } from './defaults';
import { ParagraphRenderElementOptions } from './types';

export const renderElementParagraph = (
  options?: ParagraphRenderElementOptions
) => {
  const { p } = setDefaults(options, DEFAULTS_PARAGRAPH);

  return getRenderElement(p);
};
