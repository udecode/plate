import { PlatePlugin } from '@udecode/plate-core';
import { defaults } from 'lodash';
import { MARK_FONT_SIZE } from './defaults';
import { getFontSizeDeserialize } from './getFontDeserialize';
import { getFontSizeOverrideProps } from './getFontOverrideProps';
import { FontSizePluginOptions } from './types';

export const createFontSizePlugin = (
  options: FontSizePluginOptions = {}
): PlatePlugin => ({
  overrideProps: getFontSizeOverrideProps(),
  deserialize: getFontSizeDeserialize(),
  withOverrides: (editor) => {
    // TODO: extend plate-core to register options
    editor.options[MARK_FONT_SIZE] = defaults(options, {
      type: MARK_FONT_SIZE,
    });

    return editor;
  },
});
