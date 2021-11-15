import { createPluginFactory } from '@udecode/plate-core';
import { injectIndentListComponent } from './injectIndentListComponent';
import { withIndentList } from './withIndentList';

export const KEY_LIST_STYLE_TYPE = 'listStyleType';
export const KEY_LIST_START = 'listStart';

export const createIndentListPlugin = createPluginFactory({
  key: KEY_LIST_STYLE_TYPE,
  inject: {
    belowComponent: injectIndentListComponent,
  },
  withOverrides: withIndentList,
});
