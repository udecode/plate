import { createPlugin } from '@udecode/plate-core';
import { MARK_FONT_FAMILY } from './defaults';
import { getFontFamilyDeserialize } from './getFontDeserialize';

export const createFontFamilyPlugin = createPlugin({
  key: MARK_FONT_FAMILY,
  deserialize: getFontFamilyDeserialize(),
  overrideProps: {
    nodeKey: MARK_FONT_FAMILY,
  },
});
