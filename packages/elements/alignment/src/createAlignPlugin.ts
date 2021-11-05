import { ELEMENT_DEFAULT, getOverrideProps } from '@udecode/plate-common';
import { getPlatePluginType, PlatePlugin } from '@udecode/plate-core';
import { defaults } from 'lodash';
import { DEFAULT_ALIGNMENT, DEFAULT_ALIGNMENTS, KEY_ALIGN } from './defaults';
import { AlignPluginOptions } from './types';

/**
 * Enables support for text alignment, useful to align your content
 * to left, right, center or justify.
 */
export const createAlignPlugin = (
  options?: AlignPluginOptions
): PlatePlugin => ({
  overrideProps: getOverrideProps(KEY_ALIGN),
  withOverrides: (editor) => {
    // TODO: extend plate-core to register options
    editor.options[KEY_ALIGN] = defaults(options, {
      nodeKey: KEY_ALIGN,
      defaultNodeValue: DEFAULT_ALIGNMENT,
      styleKey: 'textAlign',
      validNodeValues: DEFAULT_ALIGNMENTS,
      validTypes: [getPlatePluginType(editor, ELEMENT_DEFAULT)],
    } as AlignPluginOptions);

    return editor;
  },
});
