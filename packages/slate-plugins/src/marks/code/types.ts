import { Text } from 'slate';
import { RenderLeafProps } from 'slate-react';
import { MarkPluginOptions, RenderLeafOptions } from '../../mark';

export const MARK_CODE = 'code';

// Data of Text node
export interface CodeNodeData {}

// Text node
export interface CodeNode extends Text, CodeNodeData {}

// Type option
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
