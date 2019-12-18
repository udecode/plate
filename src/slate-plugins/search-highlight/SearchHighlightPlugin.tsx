import { HighlightPlugin } from 'slate-plugins/marks/highlight';
import { Plugin } from 'slate-react';
import { decorateSearchHighlight } from './decorateSearchHighlight';
import { SearchHighlightPluginOptions } from './types';

export const SearchHighlightPlugin = ({
  search,
  style,
}: SearchHighlightPluginOptions): Plugin => ({
  ...HighlightPlugin({ style }),
  decorate: decorateSearchHighlight({ search }),
});
