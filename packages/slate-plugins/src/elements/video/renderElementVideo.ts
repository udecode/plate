import { getRenderElement } from 'element';
import { VideoElement } from './components';
import { VIDEO, VideoRenderElementOptions } from './types';

export const renderElementVideo = ({
  typeVideo = VIDEO,
  component = VideoElement,
}: VideoRenderElementOptions = {}) =>
  getRenderElement({
    type: typeVideo,
    component,
  });
