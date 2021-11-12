import { createPlugin } from '@udecode/plate-core';
import { getIndentListInjectComponent } from './getIndentListInjectComponent';
import { withIndentList } from './withIndentList';

export const KEY_LIST_STYLE_TYPE = 'listStyleType';
export const KEY_LIST_START = 'listStart';

export const createIndentListPlugin = createPlugin({
  key: KEY_LIST_STYLE_TYPE,
  injectChildComponent: getIndentListInjectComponent(),
  withOverrides: withIndentList(),
});
