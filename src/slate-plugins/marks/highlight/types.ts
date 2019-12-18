import { CSSProperties } from 'styled-components';

export interface RenderLeafHighlightOptions {
  /**
   * Style of the highlighted ranges
   */
  style?: CSSProperties;
}

export interface HighlightPluginOptions extends RenderLeafHighlightOptions {}
