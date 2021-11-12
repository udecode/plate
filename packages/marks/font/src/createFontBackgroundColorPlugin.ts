import { createPlugin } from '@udecode/plate-core';
import { MARK_BG_COLOR } from './defaults';
import { getFontBackgroundColorDeserialize } from './getFontDeserialize';

export const createFontBackgroundColorPlugin = createPlugin({
  key: MARK_BG_COLOR,
  deserialize: getFontBackgroundColorDeserialize(),
  overrideProps: {
    nodeKey: MARK_BG_COLOR,
  },
});
