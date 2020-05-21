import { TemplateDeserializeOptions } from '__templates__/types-element.template';
import { RenderElementOptions } from 'element';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';

export const CODE = 'code';

export interface CodeNodeData {
  [key: string]: unknown;
}

// Node
export interface CodeNode extends Element, CodeNodeData {}

// Option type
interface TypeOption {
  typeCode?: string;
}

// deserialize options
export interface CodeDeserializeOptions extends TypeOption {}

// renderElement options given as props
interface CodeRenderElementOptionsProps {}

// renderElement options
export interface CodeRenderElementOptions
  extends RenderElementOptions,
    CodeRenderElementOptionsProps,
    TypeOption {}

// renderElement props
export interface CodeRenderElementProps
  extends RenderElementProps,
    CodeRenderElementOptionsProps {
  element: CodeNode;
}

// Plugin options
export interface CodePluginOptions
  extends CodeRenderElementOptions,
    CodeDeserializeOptions {}
