import { PlatePlugin } from '@udecode/plate-core';
import { defaults } from 'lodash';
import { MARK_FONT_FAMILY } from './defaults';
import { getFontSizeDeserialize } from './getFontDeserialize';
import { getFontFamilyOverrideProps } from './getOverrideProps';
import { FontFamilyPluginOptions } from './types';

export const createFontFamilyPlugin = (
  options: FontFamilyPluginOptions = {}
): PlatePlugin => ({
  overrideProps: getFontFamilyOverrideProps(),
  deserialize: getFontSizeDeserialize(),
  withOverrides: (editor) => {
    // TODO: extend plate-core to register options
    editor.options[MARK_FONT_FAMILY] = defaults(options, {
      type: MARK_FONT_FAMILY,
    });

    return editor;
  },
});
