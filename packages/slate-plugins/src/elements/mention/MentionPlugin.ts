import { SlatePlugin } from 'types';
import { RenderElementOptions } from '../types';
import { renderElementMention } from './renderElementMention';

export const MentionPlugin = (options?: RenderElementOptions): SlatePlugin => ({
  renderElement: renderElementMention(options),
});
