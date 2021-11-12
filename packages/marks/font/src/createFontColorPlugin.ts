import { createPlugin } from '@udecode/plate-core';
import { MARK_COLOR } from './defaults';
import { getFontColorDeserialize } from './getFontDeserialize';

export const createFontColorPlugin = createPlugin({
  key: MARK_COLOR,
  deserialize: getFontColorDeserialize(),
  overrideProps: {
    nodeKey: MARK_COLOR,
  },
});
