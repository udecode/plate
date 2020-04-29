import { RenderElementOptions } from 'elements/types';
import { getRenderElement } from '../utils';
import { VideoElement } from './components';
import { VIDEO } from './types';

export const renderElementVideo = ({
  typeVideo = VIDEO,
  component = VideoElement,
}: RenderElementOptions = {}) =>
  getRenderElement({
    type: typeVideo,
    component,
  });
