import { SlatePlugin } from 'common/types';
import { RenderElementOptions } from 'element';
import { renderElementVideo } from './renderElementVideo';

export const VideoPlugin = (options?: RenderElementOptions): SlatePlugin => ({
  renderElement: renderElementVideo(options),
});
