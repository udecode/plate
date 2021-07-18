import { getRenderLeaf, SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_COLOR } from './defaults';
import { getFontColorDeserialize } from './getColorDeserialize';

export const createFontColorPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_COLOR,
  renderLeaf: getRenderLeaf(MARK_COLOR),
  deserialize: getFontColorDeserialize(),
});
