import { getElementOverrideProps } from '@udecode/plate-common';
import { getPlatePluginOptions, OverrideProps } from '@udecode/plate-core';
import { KEY_INDENT } from './defaults';
import { IndentPluginOptions } from './types';

export const getIndentOverrideProps = (): OverrideProps => (editor) => {
  const { types, classNames } = getPlatePluginOptions<
    Required<IndentPluginOptions>
  >(editor, KEY_INDENT);

  return getElementOverrideProps(editor, {
    type: KEY_INDENT,
    classNames,
    types,
  });
};
