import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';
import { RenderElementOptions } from '../../element';

export const CODE_BLOCK = 'code_block';

// Data of Element node
export interface CodeBlockNodeData {}

// Element node
export interface CodeBlockNode extends Element, CodeBlockNodeData {}

// Type option
interface TypeOption {
  typeCodeBlock?: string;
}

// deserialize options
export interface CodeBlockDeserializeOptions extends TypeOption {}

// renderElement options given as props
interface CodeBlockRenderElementOptionsProps {}

// renderElement options
export interface CodeBlockRenderElementOptions
  extends RenderElementOptions,
    CodeBlockRenderElementOptionsProps,
    TypeOption {}

// renderElement props
export interface CodeBlockRenderElementProps
  extends RenderElementProps,
    CodeBlockRenderElementOptionsProps {
  element: CodeBlockNode;
}

// Plugin options
export interface CodeBlockPluginOptions
  extends CodeBlockRenderElementOptions,
    CodeBlockDeserializeOptions {}
