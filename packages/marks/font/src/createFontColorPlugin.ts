import { createPluginFactory } from '@udecode/plate-core';
import { getFontColorDeserialize } from './getFontDeserialize';

export const MARK_COLOR = 'color';

export const createFontColorPlugin = createPluginFactory({
  key: MARK_COLOR,
  deserialize: getFontColorDeserialize(),
  inject: {
    props: {
      nodeKey: MARK_COLOR,
    },
  },
});
