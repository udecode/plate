import { createPluginFactory, TElement } from '@udecode/plate-core';
import { GetSiblingIndentListOptions } from './queries/getSiblingIndentList';
import { injectIndentListComponent } from './injectIndentListComponent';
import { onKeyDownIndentList } from './onKeyDownIndentList';
import { withIndentList } from './withIndentList';

export const KEY_LIST_STYLE_TYPE = 'listStyleType';
export const KEY_LIST_START = 'listStart';
export const KEY_LIST_RESTART = 'listRestart';

export interface IndentListPlugin {
  getSiblingIndentListOptions?: GetSiblingIndentListOptions<TElement>;
}

export const createIndentListPlugin = createPluginFactory<IndentListPlugin>({
  key: KEY_LIST_STYLE_TYPE,
  inject: {
    belowComponent: injectIndentListComponent,
  },
  withOverrides: withIndentList,
  handlers: {
    onKeyDown: onKeyDownIndentList,
  },
});
