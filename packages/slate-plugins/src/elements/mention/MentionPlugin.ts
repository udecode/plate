import { SlatePlugin } from 'common/types';
import { deserializeMention } from 'elements/mention/deserializeMention';
import { renderElementMention } from 'elements/mention/renderElementMention';
import { MentionPluginOptions } from 'elements/mention/types';

/**
 * Enables support for autocompleting @mentions and #tags.
 * When typing a configurable marker, such as @ or #, a select
 * component appears with autocompleted suggestions.
 */
export const MentionPlugin = (options?: MentionPluginOptions): SlatePlugin => ({
  renderElement: renderElementMention(options),
  deserialize: deserializeMention(options),
});
