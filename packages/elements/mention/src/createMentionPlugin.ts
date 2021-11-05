import {
  getPlatePluginTypes,
  getRenderElement,
  PlatePlugin,
} from '@udecode/plate-core';
import { ELEMENT_MENTION, ELEMENT_MENTION_INPUT } from './defaults';
import { getMentionDeserialize } from './getMentionDeserialize';
import { moveSelectionByOffset } from './moveSelectionByOffset';
import { isSelectionInMentionInput } from './queries';
import { MentionPluginOptions } from './types';
import { withMention } from './withMention';

/**
 * Enables support for autocompleting @mentions.
 */
export const createMentionPlugin = (
  options?: MentionPluginOptions
): PlatePlugin => {
  const { pluginKey = ELEMENT_MENTION } = options ?? {};

  return {
    pluginKeys: [pluginKey, ELEMENT_MENTION_INPUT],
    renderElement: getRenderElement([pluginKey, ELEMENT_MENTION_INPUT]),
    deserialize: getMentionDeserialize(pluginKey),
    inlineTypes: getPlatePluginTypes([pluginKey, ELEMENT_MENTION_INPUT]),
    voidTypes: getPlatePluginTypes(pluginKey),
    withOverrides: withMention(options),
    onKeyDown: (editor) =>
      moveSelectionByOffset(editor, { query: isSelectionInMentionInput }),
  };
};
