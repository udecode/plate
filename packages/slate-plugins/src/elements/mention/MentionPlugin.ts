import { SlatePlugin } from 'common/types';
import { deserializeMention } from 'elements/mention/deserializeMention';
import { renderElementMention } from 'elements/mention/renderElementMention';
import { MentionPluginOptions } from 'elements/mention/types';

export const MentionPlugin = (options?: MentionPluginOptions): SlatePlugin => ({
  renderElement: renderElementMention(options),
  deserialize: deserializeMention(options),
});
