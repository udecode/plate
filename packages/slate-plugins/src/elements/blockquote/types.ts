import { RenderElementOptions } from 'element';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';

export const BLOCKQUOTE = 'blockquote';

export interface BlockquoteNodeData {
  [key: string]: unknown;
}

// Node
export interface BlockquoteNode extends Element, BlockquoteNodeData {}

// Option type
interface TypeOption {
  typeBlockquote?: string;
}

// deserialize options
export interface BlockquoteDeserializeOptions extends TypeOption {}

// renderElement options given as props
interface BlockquoteRenderElementOptionsProps {}

// renderElement options
export interface BlockquoteRenderElementOptions
  extends RenderElementOptions,
    BlockquoteRenderElementOptionsProps,
    TypeOption {}

// renderElement props
export interface BlockquoteRenderElementProps
  extends RenderElementProps,
    BlockquoteRenderElementOptionsProps {
  element: BlockquoteNode;
}

// Plugin options
export interface BlockquotePluginOptions
  extends BlockquoteRenderElementOptions,
    BlockquoteDeserializeOptions {}
