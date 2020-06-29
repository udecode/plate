import { getElementComponent } from '../../common/utils/getElementComponent';
import { getRenderElement } from '../../common/utils/getRenderElement';
import { PARAGRAPH, ParagraphRenderElementOptions } from './types';

export const renderElementParagraph = ({
  typeP = PARAGRAPH,
  component = getElementComponent('p'),
}: ParagraphRenderElementOptions = {}) =>
  getRenderElement({
    type: typeP,
    component,
  });
