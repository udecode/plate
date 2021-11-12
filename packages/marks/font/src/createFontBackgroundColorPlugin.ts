import { createPlugin } from '@udecode/plate-core';
import { getFontBackgroundColorDeserialize } from './getFontDeserialize';

export const MARK_BG_COLOR = 'backgroundColor';

export const createFontBackgroundColorPlugin = createPlugin({
  key: MARK_BG_COLOR,
  deserialize: getFontBackgroundColorDeserialize(),
  overrideProps: {
    nodeKey: MARK_BG_COLOR,
  },
});
