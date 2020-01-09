import { getElement, getRenderElement } from '../utils';
import { PARAGRAPH } from './types';

export const renderElementParagraph = getRenderElement({
  type: PARAGRAPH,
  component: getElement('div'),
});
