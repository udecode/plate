import {
  RenderElementOptions,
  TRenderElementProps,
} from '@udecode/slate-plugins-core';
import { Element } from 'slate';

// Data of Element node
export interface TemplateNodeData {}

// Element node
export interface TemplateNode extends Element, TemplateNodeData {}

// Type option
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
  extends TRenderElementProps,
    TemplateRenderElementOptionsProps {
  element: TemplateNode;
}

// Plugin options
export interface TemplatePluginOptions
  extends TemplateRenderElementOptions,
    TemplateDeserializeOptions {}
