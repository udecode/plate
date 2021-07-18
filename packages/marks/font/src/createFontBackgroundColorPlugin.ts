import { getRenderLeaf, SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_BG_COLOR } from './defaults';
import { getFontBackgroundColorDeserialize } from './getColorDeserialize';

export const createFontBackgroundColorPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_BG_COLOR,
  renderLeaf: getRenderLeaf(MARK_BG_COLOR),
  deserialize: getFontBackgroundColorDeserialize(),
});
