import { createPluginFactory } from '@udecode/plate-core';
import { getFontFamilyDeserialize } from './getFontDeserialize';

export const MARK_FONT_FAMILY = 'fontFamily';

export const createFontFamilyPlugin = createPluginFactory({
  key: MARK_FONT_FAMILY,
  deserialize: getFontFamilyDeserialize(),
  overrideProps: {
    nodeKey: MARK_FONT_FAMILY,
  },
});
