import { getElementOverrideProps } from '@udecode/plate-common';
import { getPlatePluginOptions, OverrideProps } from '@udecode/plate-core';
import { KEY_LIST_TYPE } from './defaults';
import { IndentListPluginOptions } from './types';

export const getIndentListOverrideProps = (): OverrideProps => (editor) => {
  const { types, classNames } = getPlatePluginOptions<
    Required<IndentListPluginOptions>
  >(editor, KEY_LIST_TYPE);

  // TODO: indentType

  const a = getElementOverrideProps(editor, {
    type: KEY_LIST_TYPE,
    classNames,
    types,
  });

  return a;
};
