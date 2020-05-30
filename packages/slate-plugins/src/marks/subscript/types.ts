import { Text } from 'slate';
import { RenderLeafProps } from 'slate-react';
import { MarkPluginOptions, RenderLeafOptions } from '../../mark';

export const MARK_SUBSCRIPT = 'subscript';

// Data of Text node
export interface SubscriptNodeData {}

// Text node
export interface SubscriptNode extends Text, SubscriptNodeData {}

// Type option
interface TypeOption {
  typeSubscript?: string;
  typeSuperscript?: string;
}

// renderLeaf options given as props
interface SubscriptRenderLeafOptionsProps {}

// renderLeaf options
export interface SubscriptRenderLeafOptions
  extends RenderLeafOptions,
    SubscriptRenderLeafOptionsProps,
    TypeOption {}

// renderLeaf props
export interface SubscriptRenderLeafProps
  extends RenderLeafProps,
    SubscriptRenderLeafOptionsProps {
  leaf: SubscriptNode;
}

// deserialize options
export interface SubscriptDeserializeOptions extends TypeOption {}

// Plugin options
export interface SubscriptPluginOptions
  extends MarkPluginOptions,
    SubscriptRenderLeafOptions,
    SubscriptDeserializeOptions {}
