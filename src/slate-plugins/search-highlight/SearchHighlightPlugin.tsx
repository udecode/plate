import { HighlightPlugin } from 'slate-plugins/marks/highlight';
import { SlatePlugin } from 'slate-react';
import { decorateSearchHighlight } from './decorateSearchHighlight';
import { SearchHighlightPluginOptions } from './types';

export const SearchHighlightPlugin = ({
  search,
  style,
}: SearchHighlightPluginOptions): SlatePlugin => ({
  ...HighlightPlugin({ style }),
  decorate: decorateSearchHighlight({ search }),
});
