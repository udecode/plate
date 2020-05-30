import { getElementComponent, getRenderElement } from '../../element/utils';
import { PARAGRAPH, ParagraphRenderElementOptions } from './types';

export const renderElementParagraph = ({
  typeP = PARAGRAPH,
  component = getElementComponent('p'),
}: ParagraphRenderElementOptions = {}) =>
  getRenderElement({
    type: typeP,
    component,
  });
