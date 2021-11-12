import { createPlugin } from '@udecode/plate-core';
import { MARK_FONT_SIZE } from './defaults';
import { getFontSizeDeserialize } from './getFontDeserialize';

export const createFontSizePlugin = createPlugin({
  key: MARK_FONT_SIZE,
  deserialize: getFontSizeDeserialize(),
  overrideProps: {
    nodeKey: MARK_FONT_SIZE,
  },
});
