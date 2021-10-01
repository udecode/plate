import {
  getPlatePluginTypes,
  getRenderElement,
  PlatePlugin,
} from '@udecode/plate-core';
import { ELEMENT_MENTION } from './defaults';
import { getMentionDeserialize } from './getMentionDeserialize';
import { MentionPluginOptions } from './types';

/**
 * Enables support for autocompleting @mentions.
 */
export const createMentionPlugin = ({
  pluginKey = ELEMENT_MENTION,
}: MentionPluginOptions = {}): PlatePlugin => {
  return {
    pluginKeys: pluginKey,
    renderElement: getRenderElement(pluginKey),
    deserialize: getMentionDeserialize(pluginKey),
    inlineTypes: getPlatePluginTypes(pluginKey),
    voidTypes: getPlatePluginTypes(pluginKey),
  };
};
