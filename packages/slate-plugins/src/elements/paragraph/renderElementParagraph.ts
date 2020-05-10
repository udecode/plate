import {
  getElementComponent,
  getRenderElement,
  RenderElementOptions,
} from 'element';
import { PARAGRAPH } from './types';

export const renderElementParagraph = ({
  typeP = PARAGRAPH,
  component = getElementComponent('div'),
}: RenderElementOptions = {}) =>
  getRenderElement({
    type: typeP,
    component,
  });
