import { RenderElementOptions } from 'element';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';

export interface TemplateNodeData {
  [key: string]: unknown;
}

// Node
export interface TemplateNode extends Element, TemplateNodeData {}

// Option type
interface TypeOption {
  typeTemplate?: string;
}

// deserialize options
export interface TemplateDeserializeOptions extends TypeOption {}

// renderElement options given as props
interface TemplateRenderElementOptionsProps {}

// renderElement options
export interface TemplateRenderElementOptions
  extends RenderElementOptions,
    TemplateRenderElementOptionsProps,
    TypeOption {}

// renderElement props
export interface TemplateRenderElementProps
  extends RenderElementProps,
    TemplateRenderElementOptionsProps {
  element: TemplateNode;
}

// Plugin options
export interface TemplatePluginOptions
  extends TemplateRenderElementOptions,
    TemplateDeserializeOptions {}
