import { MarkPluginOptions, RenderLeafOptions } from 'mark';
import { Text } from 'slate';
import { RenderLeafProps } from 'slate-react';

export const MARK_UNDERLINE = 'underline';

// Data of Text node
export interface UnderlineNodeData {}

// Text node
export interface UnderlineNode extends Text, UnderlineNodeData {}

// Option type
interface TypeOption {
  typeUnderline?: string;
}

// renderLeaf options given as props
interface UnderlineRenderLeafOptionsProps {}

// renderLeaf options
export interface UnderlineRenderLeafOptions
  extends RenderLeafOptions,
    UnderlineRenderLeafOptionsProps,
    TypeOption {}

// renderLeaf props
export interface UnderlineRenderLeafProps
  extends RenderLeafProps,
    UnderlineRenderLeafOptionsProps {
  leaf: UnderlineNode;
}

// deserialize options
export interface UnderlineDeserializeOptions extends TypeOption {}

// Plugin options
export interface UnderlinePluginOptions
  extends MarkPluginOptions,
    UnderlineRenderLeafOptions,
    UnderlineDeserializeOptions {}
