import { getRenderLeaf, PlatePlugin } from '@udecode/plate-core';
import { MARK_FONT_WEIGHT } from './defaults';
import { getFontWeightDeserialize } from './getFontDeserialize';

export const createFontWeightPlugin = (): PlatePlugin => ({
  pluginKeys: MARK_FONT_WEIGHT,
  renderLeaf: getRenderLeaf(MARK_FONT_WEIGHT),
  deserialize: getFontWeightDeserialize(),
});
