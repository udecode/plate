import { MarkPluginOptions, RenderLeafOptions } from 'mark';
import { Text } from 'slate';
import { RenderLeafProps } from 'slate-react';

export const MARK_CODE = 'code';

// Data of Text node
export interface InlineCodeNodeData {}

// Text node
export interface InlineCodeNode extends Text, InlineCodeNodeData {}

// Option type
interface TypeOption {
  typeInlineCode?: string;
}

// renderLeaf options given as props
interface InlineCodeRenderLeafOptionsProps {}

// renderLeaf options
export interface InlineCodeRenderLeafOptions
  extends RenderLeafOptions,
    InlineCodeRenderLeafOptionsProps,
    TypeOption {}

// renderLeaf props
export interface InlineCodeRenderLeafProps
  extends RenderLeafProps,
    InlineCodeRenderLeafOptionsProps {
  leaf: InlineCodeNode;
}

// deserialize options
export interface InlineCodeDeserializeOptions extends TypeOption {}

// Plugin options
export interface InlineCodePluginOptions
  extends MarkPluginOptions,
    InlineCodeRenderLeafOptions,
    InlineCodeDeserializeOptions {}
