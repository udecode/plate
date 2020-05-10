import { SlatePlugin } from 'common/types';
import { RenderElementOptions } from 'element';
import { renderElementMention } from 'elements/mention/renderElementMention';

export const MentionPlugin = (options?: RenderElementOptions): SlatePlugin => ({
  renderElement: renderElementMention(options),
});
