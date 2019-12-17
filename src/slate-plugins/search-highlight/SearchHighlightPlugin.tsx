import {
  HighlightPlugin,
  HighlightPluginOptions,
} from 'slate-plugins/marks/highlight';
import { Plugin } from 'slate-react';
import {
  decorateSearchHighlight,
  DecorateSearchHighlightOptions,
} from './decorateSearchHighlight';

export interface SearchHighlightPluginOptions
  extends HighlightPluginOptions,
    DecorateSearchHighlightOptions {
  hello?: string;
}

export const SearchHighlightPlugin = ({
  search,
  style,
}: SearchHighlightPluginOptions): Plugin => ({
  ...HighlightPlugin({ style }),
  decorate: decorateSearchHighlight({ search }),
});
