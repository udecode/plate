import { Text } from 'slate';
import { RenderLeafProps } from 'slate-react';
import { MarkPluginOptions, RenderLeafOptions } from '../../mark';

export const MARK_STRIKETHROUGH = 'strikethrough';

// Data of Text node
export interface StrikethroughNodeData {}

// Text node
export interface StrikethroughNode extends Text, StrikethroughNodeData {}

// Type option
interface TypeOption {
  typeStrikethrough?: string;
}

// renderLeaf options given as props
interface StrikethroughRenderLeafOptionsProps {}

// renderLeaf options
export interface StrikethroughRenderLeafOptions
  extends RenderLeafOptions,
    StrikethroughRenderLeafOptionsProps,
    TypeOption {}

// renderLeaf props
export interface StrikethroughRenderLeafProps
  extends RenderLeafProps,
    StrikethroughRenderLeafOptionsProps {
  leaf: StrikethroughNode;
}

// deserialize options
export interface StrikethroughDeserializeOptions extends TypeOption {}

// Plugin options
export interface StrikethroughPluginOptions
  extends MarkPluginOptions,
    StrikethroughRenderLeafOptions,
    StrikethroughDeserializeOptions {}
