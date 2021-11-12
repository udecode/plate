import { createPlugin } from '@udecode/plate-core';
import { getFontColorDeserialize } from './getFontDeserialize';

export const MARK_COLOR = 'color';

export const createFontColorPlugin = createPlugin({
  key: MARK_COLOR,
  deserialize: getFontColorDeserialize(),
  overrideProps: {
    nodeKey: MARK_COLOR,
  },
});
