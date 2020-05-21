import { getElementComponent, getRenderElement } from 'element';
import { PARAGRAPH, ParagraphRenderElementOptions } from './types';

export const renderElementParagraph = ({
  typeP = PARAGRAPH,
  component = getElementComponent('div'),
}: ParagraphRenderElementOptions = {}) =>
  getRenderElement({
    type: typeP,
    component,
  });
