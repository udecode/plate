import { HighlightPluginOptions } from 'slate-plugins/marks';

export interface DecorateSearchHighlightOptions {
  /**
   * Searching text to highlight
   */
  search: string;
}

export interface SearchHighlightPluginOptions
  extends DecorateSearchHighlightOptions,
    HighlightPluginOptions {}
