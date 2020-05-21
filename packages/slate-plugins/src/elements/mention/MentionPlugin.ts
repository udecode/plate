import { SlatePlugin } from 'common/types';
import { deserializeMention } from 'elements/mention/deserializeMention';
import { renderElementMention } from 'elements/mention/renderElementMention';
import { MentionRenderElementOptions } from './types';

export const MentionPlugin = (
  options?: Partial<MentionRenderElementOptions> & { typeMention: string }
): SlatePlugin => ({
  renderElement: renderElementMention(options),
  deserialize: deserializeMention(options),
});
