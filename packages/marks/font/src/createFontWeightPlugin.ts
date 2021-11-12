import { createPlugin } from '@udecode/plate-core';
import { getFontWeightDeserialize } from './getFontDeserialize';

export const MARK_FONT_WEIGHT = 'fontWeight';

export const createFontWeightPlugin = createPlugin({
  key: MARK_FONT_WEIGHT,
  deserialize: getFontWeightDeserialize(),
  overrideProps: {
    nodeKey: MARK_FONT_WEIGHT,
  },
});
