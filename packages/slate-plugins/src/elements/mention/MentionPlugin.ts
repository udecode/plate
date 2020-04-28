import { renderElementMention } from 'elements/mention/renderElementMention';
import { SlatePlugin } from 'types';
import { RenderElementOptions } from '../types';

export const MentionPlugin = (options?: RenderElementOptions): SlatePlugin => ({
  renderElement: renderElementMention(options),
});
