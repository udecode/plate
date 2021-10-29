import { getOverrideProps } from '@udecode/plate-common';
import { PlatePluginEditor } from '@udecode/plate-core';
import { KEY_LIST_TYPE } from './defaults';
import { getIndentListOnKeyDown } from './getIndentListOnKeyDown';
import { IndentListPluginOptions } from './types';
import { withIndentList } from './withIndentList';

export const createIndentListPlugin = (
  options?: IndentListPluginOptions
): PlatePluginEditor => ({
  overrideProps: getOverrideProps(KEY_LIST_TYPE),
  withOverrides: withIndentList(options),
  onKeyDown: getIndentListOnKeyDown,
});
