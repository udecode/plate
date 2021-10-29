import { getOverrideProps } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { defaults } from 'lodash';
import { MARK_COLOR } from './defaults';
import { getFontColorDeserialize } from './getFontDeserialize';
import { FontWeightPluginOptions } from './types';

export const createFontColorPlugin = (
  options?: FontWeightPluginOptions
): PlatePlugin => ({
  overrideProps: getOverrideProps(MARK_COLOR),
  deserialize: getFontColorDeserialize(),
  withOverrides: (editor) => {
    // TODO: extend plate-core to register options
    editor.options[MARK_COLOR] = defaults(options, {
      nodeKey: MARK_COLOR,
    } as FontWeightPluginOptions);

    return editor;
  },
});
