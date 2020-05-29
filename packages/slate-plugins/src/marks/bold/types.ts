import { Text } from 'slate';
import { RenderLeafProps } from 'slate-react';
import { MarkPluginOptions, RenderLeafOptions } from '../../mark';

export const MARK_BOLD = 'bold';

// Data of Text node
export interface BoldNodeData {}

// Text node
export interface BoldNode extends Text, BoldNodeData {}

// Type option
interface TypeOption {
  typeBold?: string;
}

// renderLeaf options given as props
interface BoldRenderLeafOptionsProps {}

// renderLeaf options
export interface BoldRenderLeafOptions
  extends RenderLeafOptions,
    BoldRenderLeafOptionsProps,
    TypeOption {}

// renderLeaf props
export interface BoldRenderLeafProps
  extends RenderLeafProps,
    BoldRenderLeafOptionsProps {
  leaf: BoldNode;
}

// deserialize options
export interface BoldDeserializeOptions extends TypeOption {}

// Plugin options
export interface BoldPluginOptions
  extends MarkPluginOptions,
    BoldRenderLeafOptions,
    BoldDeserializeOptions {}
