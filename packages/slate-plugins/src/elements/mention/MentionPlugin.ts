import { SlatePlugin } from 'common/types';
import { RenderElementOptions } from 'element';
import { deserializeMention } from 'elements/mention/deserializeMention';
import { renderElementMention } from 'elements/mention/renderElementMention';

export const MentionPlugin = (
  options?: RenderElementOptions & { typeMention: string }
): SlatePlugin => ({
  renderElement: renderElementMention(options),
  deserialize: deserializeMention(options),
});
