import { getOverrideProps } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { defaults } from 'lodash';
import { MARK_BG_COLOR } from './defaults';
import { getFontBackgroundColorDeserialize } from './getFontDeserialize';
import { FontColorPluginOptions } from './types';

export const createFontBackgroundColorPlugin = (
  options: FontColorPluginOptions = {}
): PlatePlugin => ({
  overrideProps: getOverrideProps(MARK_BG_COLOR),
  deserialize: getFontBackgroundColorDeserialize(),
  withOverrides: (editor) => {
    // TODO: extend plate-core to register options
    editor.options[MARK_BG_COLOR] = defaults(options, {
      nodeKey: MARK_BG_COLOR,
    } as FontColorPluginOptions);

    return editor;
  },
});
