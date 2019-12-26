import { getRenderElement } from '../utils';
import { VideoElement } from './components';
import { VIDEO } from './types';

export const renderElementVideo = getRenderElement({
  type: VIDEO,
  component: VideoElement,
});
