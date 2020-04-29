import { RenderElementOptions } from 'elements/types';
import { getElementComponent, getRenderElement } from '../utils';
import { PARAGRAPH } from './types';

export const renderElementParagraph = ({
  typeP = PARAGRAPH,
  component = getElementComponent('div'),
}: RenderElementOptions = {}) =>
  getRenderElement({
    type: typeP,
    component,
  });
