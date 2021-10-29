import { getOverrideProps } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { defaults } from 'lodash';
import { MARK_FONT_WEIGHT } from './defaults';
import { getFontWeightDeserialize } from './getFontDeserialize';
import { FontWeightPluginOptions } from './types';

export const createFontWeightPlugin = (
  options: FontWeightPluginOptions = {}
): PlatePlugin => ({
  overrideProps: getOverrideProps(MARK_FONT_WEIGHT),
  deserialize: getFontWeightDeserialize(),
  withOverrides: (editor) => {
    // TODO: extend plate-core to register options
    editor.options[MARK_FONT_WEIGHT] = defaults(options, {
      nodeKey: MARK_FONT_WEIGHT,
    } as FontWeightPluginOptions);

    return editor;
  },
});
