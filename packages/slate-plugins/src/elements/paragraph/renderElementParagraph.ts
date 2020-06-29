import { getElementComponent, getRenderElement } from '@udecode/core';
import { PARAGRAPH, ParagraphRenderElementOptions } from './types';

export const renderElementParagraph = ({
  typeP = PARAGRAPH,
  component = getElementComponent('p'),
}: ParagraphRenderElementOptions = {}) =>
  getRenderElement({
    type: typeP,
    component,
  });
