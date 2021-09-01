import { getRenderLeaf, PlatePlugin } from '@udecode/plate-core';
import { MARK_COLOR } from './defaults';
import { getFontColorDeserialize } from './getFontDeserialize';

export const createFontColorPlugin = (): PlatePlugin => ({
  pluginKeys: MARK_COLOR,
  renderLeaf: getRenderLeaf(MARK_COLOR),
  deserialize: getFontColorDeserialize(),
});
