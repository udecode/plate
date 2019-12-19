import { SlatePlugin } from 'slate-react';
import { renderElementVideo } from './renderElementVideo';
import { withVideo } from './withVideo';

export const VideoPlugin = (): SlatePlugin => ({
  editor: withVideo,
  renderElement: renderElementVideo(),
});
