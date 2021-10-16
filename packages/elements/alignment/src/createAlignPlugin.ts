import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import { getPlatePluginType, PlatePlugin } from '@udecode/plate-core';
import { defaults } from 'lodash';
import { DEFAULT_ALIGNMENT, DEFAULT_ALIGNMENTS, KEY_ALIGN } from './defaults';
import { getAlignOverrideProps } from './getAlignOverrideProps';
import { AlignPluginOptions } from './types';

/**
 * Enables support for text alignment, useful to align your content
 * to left, right, center or justify.
 */
export const createAlignPlugin = (
  options: AlignPluginOptions = {}
): PlatePlugin => ({
  overrideProps: getAlignOverrideProps(),
  withOverrides: (editor) => {
    // TODO: extend plate-core to register options
    editor.options[KEY_ALIGN] = defaults(options, {
      type: KEY_ALIGN,
      types: [getPlatePluginType(editor, ELEMENT_DEFAULT)],
      alignments: DEFAULT_ALIGNMENTS,
      defaultAlignment: DEFAULT_ALIGNMENT,
    });

    return editor;
  },
});
