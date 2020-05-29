import { Text } from 'slate';
import { RenderLeafProps } from 'slate-react';
import { MarkPluginOptions, RenderLeafOptions } from '../../mark';

export const MARK_ITALIC = 'italic';

// Data of Text node
export interface ItalicNodeData {}

// Text node
export interface ItalicNode extends Text, ItalicNodeData {}

// Type option
interface TypeOption {
  typeItalic?: string;
}

// renderLeaf options given as props
interface ItalicRenderLeafOptionsProps {}

// renderLeaf options
export interface ItalicRenderLeafOptions
  extends RenderLeafOptions,
    ItalicRenderLeafOptionsProps,
    TypeOption {}

// renderLeaf props
export interface ItalicRenderLeafProps
  extends RenderLeafProps,
    ItalicRenderLeafOptionsProps {
  leaf: ItalicNode;
}

// deserialize options
export interface ItalicDeserializeOptions extends TypeOption {}

// Plugin options
export interface ItalicPluginOptions
  extends MarkPluginOptions,
    ItalicRenderLeafOptions,
    ItalicDeserializeOptions {}
