import { getRenderLeaf, PlatePlugin } from '@udecode/plate-core';
import { MARK_FONT_SIZE } from './defaults';
import { getFontSizeDeserialize } from './getFontDeserialize';

export const createFontSizePlugin = (): PlatePlugin => ({
  pluginKeys: MARK_FONT_SIZE,
  renderLeaf: getRenderLeaf(MARK_FONT_SIZE),
  deserialize: getFontSizeDeserialize(),
});
