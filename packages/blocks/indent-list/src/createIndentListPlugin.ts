import { createPlugin } from '@udecode/plate-core';
import { KEY_INDENT } from '@udecode/plate-indent';
import { getIndentListInjectComponent } from './getIndentListInjectComponent';
import { withIndentList } from './withIndentList';

export const createIndentListPlugin = createPlugin({
  key: KEY_INDENT,
  injectChildComponent: getIndentListInjectComponent(),
  withOverrides: withIndentList(),
});
