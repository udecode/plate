import { createPlugin } from '@udecode/plate-core';
import { getFontSizeDeserialize } from './getFontDeserialize';

export const MARK_FONT_SIZE = 'fontSize';

export const createFontSizePlugin = createPlugin({
  key: MARK_FONT_SIZE,
  deserialize: getFontSizeDeserialize(),
  overrideProps: {
    nodeKey: MARK_FONT_SIZE,
  },
});
