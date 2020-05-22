import { MarkPluginOptions, RenderLeafOptions } from 'mark';
import { Text } from 'slate';
import { RenderLeafProps } from 'slate-react';

export const MARK_CODE = 'code';

// Data of Text node
export interface CodeNodeData {}

// Text node
export interface CodeNode extends Text, CodeNodeData {}

// Option type
interface TypeOption {
  typeCode?: string;
}

// renderLeaf options given as props
interface CodeRenderLeafOptionsProps {}

// renderLeaf options
export interface CodeRenderLeafOptions
  extends RenderLeafOptions,
    CodeRenderLeafOptionsProps,
    TypeOption {}

// renderLeaf props
export interface CodeRenderLeafProps
  extends RenderLeafProps,
    CodeRenderLeafOptionsProps {
  leaf: CodeNode;
}

// deserialize options
export interface CodeDeserializeOptions extends TypeOption {}

// Plugin options
export interface CodePluginOptions
  extends MarkPluginOptions,
    CodeRenderLeafOptions,
    CodeDeserializeOptions {}
