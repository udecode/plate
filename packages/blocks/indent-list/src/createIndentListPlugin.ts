import { getOverrideProps } from '@udecode/plate-common';
import { PlatePluginEditor } from '@udecode/plate-core';
import { KEY_LIST_STYLE_TYPE } from './defaults';
import { IndentListPluginOptions } from './types';
import { withIndentList } from './withIndentList';

export const createIndentListPlugin = (
  options?: IndentListPluginOptions
): PlatePluginEditor => ({
  overrideProps: getOverrideProps(KEY_LIST_STYLE_TYPE),
  withOverrides: withIndentList(options),
});
