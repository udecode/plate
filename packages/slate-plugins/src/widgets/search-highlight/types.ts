export const MARK_SEARCH_HIGHLIGHT = 'search_highlight';

interface TypeOption {
  typeSearchHighlight?: string;
}

export interface SearchHighlightDecorateOptions extends TypeOption {
  /**
   * Searching text to highlight
   */
  search: string;
}

export interface SearchHighlightPluginOptions extends TypeOption {
  bg?: string;
}
