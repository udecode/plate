import { getRenderLeaf, PlatePlugin } from '@udecode/plate-core';
import { MARK_BG_COLOR } from './defaults';
import { getFontBackgroundColorDeserialize } from './getFontDeserialize';

export const createFontBackgroundColorPlugin = (): PlatePlugin => ({
  pluginKeys: MARK_BG_COLOR,
  renderLeaf: getRenderLeaf(MARK_BG_COLOR),
  deserialize: getFontBackgroundColorDeserialize(),
});
