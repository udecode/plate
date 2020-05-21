import { SlatePlugin } from 'common/types';
import { deserializeIframe } from 'elements/video/deserializeIframe';
import { VideoPluginOptions } from 'elements/video/types';
import { renderElementVideo } from './renderElementVideo';

export const VideoPlugin = (options?: VideoPluginOptions): SlatePlugin => ({
  renderElement: renderElementVideo(options),
  deserialize: deserializeIframe(options),
});
