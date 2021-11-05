import { PlatePluginEditor } from '@udecode/plate-core';
import { getIndentListInjectComponent } from './getIndentListInjectComponent';
import { IndentListPluginOptions } from './types';
import { withIndentList } from './withIndentList';

export const createIndentListPlugin = (
  options?: IndentListPluginOptions
): PlatePluginEditor => ({
  injectChildComponent: getIndentListInjectComponent(),
  withOverrides: withIndentList(options),
});
