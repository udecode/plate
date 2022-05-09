import { createPluginFactory, TElement, Value } from '@udecode/plate-core';
import { GetSiblingIndentListOptions } from './queries/getSiblingIndentList';
import { injectIndentListComponent } from './injectIndentListComponent';
import { withIndentList } from './withIndentList';

export const KEY_LIST_STYLE_TYPE = 'listStyleType';
export const KEY_LIST_START = 'listStart';

export interface IndentListPlugin {
  getSiblingIndentListOptions?: GetSiblingIndentListOptions<TElement, Value>;
}

export const createIndentListPlugin = createPluginFactory<IndentListPlugin>({
  key: KEY_LIST_STYLE_TYPE,
  inject: {
    belowComponent: injectIndentListComponent,
  },
  withOverrides: withIndentList,
});
