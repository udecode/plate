import { MarkPluginOptions, RenderLeafOptions } from 'mark';
import { Text } from 'slate';
import { RenderLeafProps } from 'slate-react';

// Data of Text node
export interface TemplateNodeData {}

// Text node
export interface TemplateNode extends Text, TemplateNodeData {}

// Type option
interface TypeOption {
  typeTemplate?: string;
}

// renderLeaf options given as props
interface TemplateRenderLeafOptionsProps {}

// renderLeaf options
export interface TemplateRenderLeafOptions
  extends RenderLeafOptions,
    TemplateRenderLeafOptionsProps,
    TypeOption {}

// renderLeaf props
export interface TemplateRenderLeafProps
  extends RenderLeafProps,
    TemplateRenderLeafOptionsProps {
  leaf: TemplateNode;
}

// deserialize options
export interface TemplateDeserializeOptions extends TypeOption {}

// Plugin options
export interface TemplatePluginOptions
  extends MarkPluginOptions,
    TemplateRenderLeafOptions,
    TemplateDeserializeOptions {}
