import { PlatePlugin } from '@udecode/plate-core';
import { defaults } from 'lodash';
import { MARK_FONT_WEIGHT } from './defaults';
import { getFontWeightDeserialize } from './getFontDeserialize';
import { getFontWeightOverrideProps } from './getFontOverrideProps';
import { FontWeightPluginOptions } from './types';

export const createFontWeightPlugin = (
  options: FontWeightPluginOptions = {}
): PlatePlugin => ({
  overrideProps: getFontWeightOverrideProps(),
  deserialize: getFontWeightDeserialize(),
  withOverrides: (editor) => {
    // TODO: extend plate-core to register options
    editor.options[MARK_FONT_WEIGHT] = defaults(options, {
      type: MARK_FONT_WEIGHT,
    });

    return editor;
  },
});
