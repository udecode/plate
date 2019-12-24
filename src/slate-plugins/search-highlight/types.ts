import { HighlightPluginOptions } from 'slate-plugins';

export interface DecorateSearchHighlightOptions {
  /**
   * Searching text to highlight
   */
  search: string;
}

export interface SearchHighlightPluginOptions extends HighlightPluginOptions {}
