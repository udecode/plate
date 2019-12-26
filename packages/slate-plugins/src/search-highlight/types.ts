import { HighlightPluginOptions } from 'marks';

export interface DecorateSearchHighlightOptions {
  /**
   * Searching text to highlight
   */
  search: string;
}

export interface SearchHighlightPluginOptions extends HighlightPluginOptions {}
