import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';
import { RenderElementOptions } from '../../element';

export const BLOCKQUOTE = 'blockquote';

// Data of Element node
export interface BlockquoteNodeData {}

// Element node
export interface BlockquoteNode extends Element, BlockquoteNodeData {}

// Type option
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
