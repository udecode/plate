import { getElementOverrideProps } from '@udecode/plate-common';
import { getPlatePluginOptions, OverrideProps } from '@udecode/plate-core';
import { KEY_ALIGN } from './defaults';
import { AlignPluginOptions } from './types';

export const getAlignOverrideProps = (): OverrideProps => (editor) => {
  const {
    alignments,
    classNames,
    defaultAlignment,
    types,
  } = getPlatePluginOptions<Required<AlignPluginOptions>>(editor, KEY_ALIGN);

  return getElementOverrideProps(editor, {
    type: KEY_ALIGN,
    defaultOption: defaultAlignment,
    options: alignments,
    types,
    classNames,
  });
};
