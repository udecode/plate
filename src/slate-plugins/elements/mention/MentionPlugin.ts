import { SlatePlugin } from 'slate-plugins/types';
import { RenderElementOptions } from '../types';
import { renderElementMention } from './renderElementMention';

export const MentionPlugin = (options?: RenderElementOptions): SlatePlugin => ({
  renderElement: renderElementMention(options),
});
