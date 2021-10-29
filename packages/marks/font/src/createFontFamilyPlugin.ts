import { getOverrideProps } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { defaults } from 'lodash';
import { MARK_FONT_FAMILY } from './defaults';
import { getFontFamilyDeserialize } from './getFontDeserialize';
import { FontFamilyPluginOptions } from './types';

export const createFontFamilyPlugin = (
  options: FontFamilyPluginOptions = {}
): PlatePlugin => ({
  overrideProps: getOverrideProps(MARK_FONT_FAMILY),
  deserialize: getFontFamilyDeserialize(),
  withOverrides: (editor) => {
    // TODO: extend plate-core to register options
    editor.options[MARK_FONT_FAMILY] = defaults(options, {
      nodeKey: MARK_FONT_FAMILY,
    } as FontFamilyPluginOptions);

    return editor;
  },
});
