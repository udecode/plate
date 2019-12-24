import { SlatePlugin } from 'slate-plugins/types';
import { renderElementVideo } from './renderElementVideo';

export const VideoPlugin = (): SlatePlugin => ({
  renderElement: renderElementVideo(),
});
