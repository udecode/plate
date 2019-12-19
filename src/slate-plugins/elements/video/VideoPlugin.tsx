import { SlatePlugin } from 'slate-react';
import { renderElementVideo } from './renderElementVideo';

export const VideoPlugin = (): SlatePlugin => ({
  renderElement: renderElementVideo(),
});
