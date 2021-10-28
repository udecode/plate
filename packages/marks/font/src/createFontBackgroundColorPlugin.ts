import { PlatePlugin } from '@udecode/plate-core';
import { defaults } from 'lodash';
import { MARK_BG_COLOR } from './defaults';
import { getFontBackgroundColorDeserialize } from './getFontDeserialize';
import { getFontBackgroundColorOverrideProps } from './getFontOverrideProps';
import { FontColorPluginOptions } from './types';

export const createFontBackgroundColorPlugin = (
  options: FontColorPluginOptions = {}
): PlatePlugin => ({
  overrideProps: getFontBackgroundColorOverrideProps(),
  deserialize: getFontBackgroundColorDeserialize(),
  withOverrides: (editor) => {
    // TODO: extend plate-core to register options
    editor.options[MARK_BG_COLOR] = defaults(options, {
      type: MARK_BG_COLOR,
    });

    return editor;
  },
});
