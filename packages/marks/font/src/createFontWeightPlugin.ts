import { createPlugin } from '@udecode/plate-core';
import { MARK_FONT_WEIGHT } from './defaults';
import { getFontWeightDeserialize } from './getFontDeserialize';

export const createFontWeightPlugin = createPlugin({
  key: MARK_FONT_WEIGHT,
  deserialize: getFontWeightDeserialize(),
  overrideProps: {
    nodeKey: MARK_FONT_WEIGHT,
  },
});
