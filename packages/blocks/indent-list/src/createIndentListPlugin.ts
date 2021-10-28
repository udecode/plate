import { PlatePluginEditor } from '@udecode/plate-core';
import { getIndentListOnKeyDown } from './getIndentListOnKeyDown';
import { getIndentListOverrideProps } from './getIndentListOverrideProps';
import { IndentListPluginOptions } from './types';
import { withIndentList } from './withIndentList';

export const createIndentListPlugin = (
  options?: IndentListPluginOptions
): PlatePluginEditor => ({
  overrideProps: getIndentListOverrideProps(),
  withOverrides: withIndentList(options),
  onKeyDown: getIndentListOnKeyDown,
});
