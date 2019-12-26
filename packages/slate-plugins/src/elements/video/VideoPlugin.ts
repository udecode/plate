import { SlatePlugin } from 'types';
import { RenderElementOptions } from '../types';
import { renderElementVideo } from './renderElementVideo';

export const VideoPlugin = (options?: RenderElementOptions): SlatePlugin => ({
  renderElement: renderElementVideo(options),
});
