import { createPluginFactory } from '@udecode/plate-core';
import { getFontWeightDeserialize } from './getFontDeserialize';

export const MARK_FONT_WEIGHT = 'fontWeight';

export const createFontWeightPlugin = createPluginFactory({
  key: MARK_FONT_WEIGHT,
  deserialize: getFontWeightDeserialize(),
  inject: {
    props: {
      nodeKey: MARK_FONT_WEIGHT,
    },
  },
});
