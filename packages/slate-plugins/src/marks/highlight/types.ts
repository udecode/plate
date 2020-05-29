import { Text } from 'slate';
import { RenderLeafProps } from 'slate-react';
import { MarkPluginOptions, RenderLeafOptions } from '../../mark';

export const MARK_HIGHLIGHT = 'highlight';

// Data of Text node
export interface HighlightNodeData {}

// Text node
export interface HighlightNode extends Text, HighlightNodeData {}

// Type option
interface TypeOption {
  typeHighlight?: string;
}

// renderLeaf options given as props
interface HighlightRenderLeafOptionsProps {}

// renderLeaf options
export interface HighlightRenderLeafOptions
  extends RenderLeafOptions,
    HighlightRenderLeafOptionsProps,
    TypeOption {
  /**
   * Background color of the highlighted ranges
   */
  bg?: string;
}

// renderLeaf props
export interface HighlightRenderLeafProps
  extends RenderLeafProps,
    HighlightRenderLeafOptionsProps {
  leaf: HighlightNode;
}

// deserialize options
export interface HighlightDeserializeOptions extends TypeOption {}

// Plugin options
export interface HighlightPluginOptions
  extends MarkPluginOptions,
    HighlightRenderLeafOptions,
    HighlightDeserializeOptions {}
