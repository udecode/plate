import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import { getPlatePluginType, PlatePlugin } from '@udecode/plate-core';
import { defaults } from 'lodash';
import {
  DEFAULT_LINE_HEIGHT,
  DEFAULT_LINE_HEIGHTS,
  KEY_LINE_HEIGHT,
} from './defaults';
import { getLineHeightOverrideProps } from './getLineHeightOverrideProps';
import { LineHeightPluginOptions } from './types';

/**
 * Enables support for text alignment, useful to align your content
 * to left, right and center it.
 */
export const createLineHeightPlugin = (
  options: LineHeightPluginOptions = {}
): PlatePlugin => ({
  overrideProps: getLineHeightOverrideProps(),
  withOverrides: (editor) => {
    // TODO: extend plate-core to register options
    editor.options[KEY_LINE_HEIGHT] = defaults(options, {
      type: KEY_LINE_HEIGHT,
      types: [getPlatePluginType(editor, ELEMENT_DEFAULT)],
      lineHeights: DEFAULT_LINE_HEIGHTS,
      defaultLineHeight: DEFAULT_LINE_HEIGHT,
    } as LineHeightPluginOptions) as any;

    return editor;
  },
});
