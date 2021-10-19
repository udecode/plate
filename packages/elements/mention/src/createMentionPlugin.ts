import {
  getPlatePluginTypes,
  getRenderElement,
  PlatePlugin,
} from '@udecode/plate-core';
import {
  COMBOBOX_TRIGGER_MENTION,
  ELEMENT_MENTION,
  ELEMENT_MENTION_PROPOSAL,
} from './defaults';
import { getMentionDeserialize } from './getMentionDeserialize';
import { moveSelectionViaOffset } from './moveSelectionViaOffset';
import { isSelectionInMentionProposal } from './queries';
import { MentionPluginOptions } from './types';
import { withMention } from './withMention';

/**
 * Enables support for autocompleting @mentions.
 */
export const createMentionPlugin = ({
  pluginKey = ELEMENT_MENTION,
  trigger = COMBOBOX_TRIGGER_MENTION,
}: MentionPluginOptions = {}): PlatePlugin => ({
  pluginKeys: [pluginKey, ELEMENT_MENTION_PROPOSAL],
  renderElement: getRenderElement([pluginKey, ELEMENT_MENTION_PROPOSAL]),
  deserialize: getMentionDeserialize(pluginKey),
  inlineTypes: getPlatePluginTypes([pluginKey, ELEMENT_MENTION_PROPOSAL]),
  voidTypes: getPlatePluginTypes(pluginKey),
  withOverrides: withMention({ id: pluginKey, trigger }),
  onKeyDown: (editor) =>
    moveSelectionViaOffset(editor, { when: isSelectionInMentionProposal }),
});
