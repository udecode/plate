import { RenderElementOptions } from 'element';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';

export const PARAGRAPH = 'p';

export interface ParagraphNodeData {
  [key: string]: unknown;
}

// Node
export interface ParagraphNode extends Element, ParagraphNodeData {}

// Option type
interface TypeOption {
  typeP?: string;
}

// deserialize options
export interface ParagraphDeserializeOptions extends TypeOption {}

// renderElement options given as props
interface ParagraphRenderElementOptionsProps {}

// renderElement options
export interface ParagraphRenderElementOptions
  extends RenderElementOptions,
    ParagraphRenderElementOptionsProps,
    TypeOption {}

// renderElement props
export interface ParagraphRenderElementProps
  extends RenderElementProps,
    ParagraphRenderElementOptionsProps {
  element: ParagraphNode;
}

// Plugin options
export interface ParagraphPluginOptions
  extends ParagraphRenderElementOptions,
    ParagraphDeserializeOptions {}
