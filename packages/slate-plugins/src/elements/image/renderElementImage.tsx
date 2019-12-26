import { getRenderElement } from '../utils';
import { ImageElement } from './components';
import { IMAGE } from './types';

export const renderElementImage = getRenderElement({
  type: IMAGE,
  component: ImageElement,
});
