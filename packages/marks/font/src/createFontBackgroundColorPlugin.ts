import { getRenderLeaf, PlatePlugin } from '@udecode/plate-core';
import { MARK_FONT_SIZE } from './defaults';
import { getFontBackgroundColorDeserialize } from './getFontDeserialize';

export const createFontBackgroundColorPlugin = (): PlatePlugin => ({
  pluginKeys: MARK_FONT_SIZE,
  renderLeaf: getRenderLeaf(MARK_FONT_SIZE),
  deserialize: getFontBackgroundColorDeserialize(),
});
