import { HighlightPlugin } from 'slate-plugins/marks/highlight';
import { SlatePlugin } from 'slate-react';
import { decorateSearchHighlight } from './decorateSearchHighlight';
import { SearchHighlightPluginOptions } from './types';

export const SearchHighlightPlugin = ({
  search,
  bg,
}: SearchHighlightPluginOptions): SlatePlugin => ({
  ...HighlightPlugin({ bg }),
  decorate: decorateSearchHighlight({ search }),
});
