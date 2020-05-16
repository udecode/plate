import { SlatePlugin } from 'common/types';
import { RenderElementOptions } from 'element';
import { deserializeIframe } from 'elements/video/deserializeIframe';
import { renderElementVideo } from './renderElementVideo';

export const VideoPlugin = (
  options?: RenderElementOptions & { typeVideo: string }
): SlatePlugin => ({
  renderElement: renderElementVideo(options),
  deserialize: deserializeIframe(options),
});
