import {
  getPlatePluginTypes,
  getRenderElement,
  PlatePlugin,
} from '@udecode/plate-core';
import {
  COMBOBOX_TRIGGER_MENTION,
  ELEMENT_MENTION,
  ELEMENT_MENTION_INPUT,
} from './defaults';
import { getMentionDeserialize } from './getMentionDeserialize';
import { moveSelectionByOffset } from './moveSelectionByOffset';
import { isSelectionInMentionInput } from './queries';
import { MentionPluginOptions } from './types';
import { withMention } from './withMention';

/**
 * Enables support for autocompleting @mentions.
 */
export const createMentionPlugin = ({
  pluginKey = ELEMENT_MENTION,
  trigger = COMBOBOX_TRIGGER_MENTION,
}: MentionPluginOptions = {}): PlatePlugin => ({
  pluginKeys: [pluginKey, ELEMENT_MENTION_INPUT],
  renderElement: getRenderElement([pluginKey, ELEMENT_MENTION_INPUT]),
  deserialize: getMentionDeserialize(pluginKey),
  inlineTypes: getPlatePluginTypes([pluginKey, ELEMENT_MENTION_INPUT]),
  voidTypes: getPlatePluginTypes(pluginKey),
  withOverrides: withMention({ id: pluginKey, trigger }),
  onKeyDown: (editor) =>
    moveSelectionByOffset(editor, { query: isSelectionInMentionInput }),
});
