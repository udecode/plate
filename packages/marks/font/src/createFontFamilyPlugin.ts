import { createPlugin } from '@udecode/plate-core';
import { getFontFamilyDeserialize } from './getFontDeserialize';

export const MARK_FONT_FAMILY = 'fontFamily';

export const createFontFamilyPlugin = createPlugin({
  key: MARK_FONT_FAMILY,
  deserialize: getFontFamilyDeserialize(),
  overrideProps: {
    nodeKey: MARK_FONT_FAMILY,
  },
});
