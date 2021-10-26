import { PlatePlugin } from '@udecode/plate-core';
import { defaults } from 'lodash';
import { DEFAULT_COLOR, MARK_COLOR } from './defaults';
import { getFontColorDeserialize } from './getFontDeserialize';
import { getFontColorOverrideProps } from './getOverrideProps';
import { FontWeightPluginOptions } from './types';

export const createFontColorPlugin = (
  options: FontWeightPluginOptions = {}
): PlatePlugin => ({
  overrideProps: getFontColorOverrideProps(),
  deserialize: getFontColorDeserialize(),
  withOverrides: (editor) => {
    // TODO: extend plate-core to register options
    editor.options[MARK_COLOR] = defaults(options, {
      type: MARK_COLOR,
      defaultColor: DEFAULT_COLOR,
    });

    return editor;
  },
});
