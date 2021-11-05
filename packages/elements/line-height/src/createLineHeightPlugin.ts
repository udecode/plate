import { ELEMENT_DEFAULT, getOverrideProps } from '@udecode/plate-common';
import { getPlatePluginType, PlatePlugin } from '@udecode/plate-core';
import { defaults } from 'lodash';
import {
  DEFAULT_LINE_HEIGHT,
  DEFAULT_LINE_HEIGHTS,
  KEY_LINE_HEIGHT,
} from './defaults';
import { LineHeightPluginOptions } from './types';

/**
 * Enables support for text alignment, useful to align your content
 * to left, right and center it.
 */
export const createLineHeightPlugin = (
  options?: LineHeightPluginOptions
): PlatePlugin => ({
  overrideProps: getOverrideProps(KEY_LINE_HEIGHT),
  withOverrides: (editor) => {
    // TODO: extend plate-core to register options
    editor.options[KEY_LINE_HEIGHT] = defaults(options, {
      nodeKey: KEY_LINE_HEIGHT,
      defaultNodeValue: DEFAULT_LINE_HEIGHT,
      validTypes: [getPlatePluginType(editor, ELEMENT_DEFAULT)],
      validNodeValues: DEFAULT_LINE_HEIGHTS,
    } as LineHeightPluginOptions);

    return editor;
  },
});
