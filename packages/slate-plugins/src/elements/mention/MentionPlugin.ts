import { SlatePlugin } from '../../common';
import { deserializeMention } from './deserializeMention';
import { renderElementMention } from './renderElementMention';
import { MENTION, MentionPluginOptions } from './types';

/**
 * Enables support for autocompleting @mentions and #tags.
 * When typing a configurable marker, such as @ or #, a select
 * component appears with autocompleted suggestions.
 */
export const MentionPlugin = (options?: MentionPluginOptions): SlatePlugin => ({
  renderElement: renderElementMention(options),
  deserialize: deserializeMention(options),
  inlineTypes: [options?.typeMention || MENTION],
  voidTypes: [options?.typeMention || MENTION],
});
