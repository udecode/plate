import { getRenderElement } from '../../element/utils';
import { ImageElement } from './components';
import { IMAGE, ImageRenderElementOptions } from './types';

export const renderElementImage = ({
  typeImg = IMAGE,
  component = ImageElement,
}: ImageRenderElementOptions = {}) =>
  getRenderElement({
    type: typeImg,
    component,
  });
