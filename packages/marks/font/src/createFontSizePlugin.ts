import { getOverrideProps } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { defaults } from 'lodash';
import { MARK_FONT_SIZE } from './defaults';
import { getFontSizeDeserialize } from './getFontDeserialize';
import { FontSizePluginOptions } from './types';

export const createFontSizePlugin = (
  options: FontSizePluginOptions = {}
): PlatePlugin => ({
  overrideProps: getOverrideProps(MARK_FONT_SIZE),
  deserialize: getFontSizeDeserialize(),
  withOverrides: (editor) => {
    // TODO: extend plate-core to register options
    editor.options[MARK_FONT_SIZE] = defaults(options, {
      nodeKey: MARK_FONT_SIZE,
    } as FontSizePluginOptions);

    return editor;
  },
});
