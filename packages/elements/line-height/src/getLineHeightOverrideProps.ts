import { getElementOverrideProps } from '@udecode/plate-common';
import { getPlatePluginOptions, OverrideProps } from '@udecode/plate-core';
import { KEY_LINE_HEIGHT } from './defaults';
import { LineHeightPluginOptions } from './types';

export const getLineHeightOverrideProps = (): OverrideProps => (editor) => {
  const {
    lineHeights,
    classNames,
    defaultLineHeight,
    types,
  } = getPlatePluginOptions<Required<LineHeightPluginOptions>>(
    editor,
    KEY_LINE_HEIGHT
  );

  return getElementOverrideProps(editor, {
    type: KEY_LINE_HEIGHT,
    defaultOption: defaultLineHeight,
    options: lineHeights,
    types,
    classNames,
  });
};
