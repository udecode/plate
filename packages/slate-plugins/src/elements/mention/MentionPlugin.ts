import { SlatePlugin } from '@udecode/slate-plugins-core';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_MENTION } from './defaults';
import { deserializeMention } from './deserializeMention';
import { renderElementMention } from './renderElementMention';
import { MentionPluginOptions } from './types';

/**
 * Enables support for autocompleting @mentions and #tags.
 * When typing a configurable marker, such as @ or #, a select
 * component appears with autocompleted suggestions.
 */
export const MentionPlugin = (options?: MentionPluginOptions): SlatePlugin => {
  const { mention } = setDefaults(options, DEFAULTS_MENTION);

  return {
    renderElement: renderElementMention(options),
    deserialize: deserializeMention(options),
    inlineTypes: [mention.type],
    voidTypes: [mention.type],
  };
};
