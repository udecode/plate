import { RenderElementOptions } from 'elements/types';
import { getRenderElement } from '../utils';
import { ImageElement } from './components';
import { IMAGE } from './types';

export const renderElementImage = ({
  typeImg = IMAGE,
  component = ImageElement,
}: RenderElementOptions = {}) =>
  getRenderElement({
    type: typeImg,
    component,
  });
