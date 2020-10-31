import { ImageElement } from './components/ImageElement';
import { ImageKeyOption, ImagePluginOptionsValues } from './types';

export const ELEMENT_IMAGE = 'img';

export const DEFAULTS_IMAGE: Record<
  ImageKeyOption,
  ImagePluginOptionsValues
> = {
  img: {
    component: ImageElement,
    type: ELEMENT_IMAGE,
    rootProps: {
      className: 'slate-img',
    },
  },
};
