import { Text } from 'slate';
import { RenderLeafProps } from 'slate-react';
import { MarkPluginOptions, RenderLeafOptions } from '../../mark';

export const MARK_SUPERSCRIPT = 'superscript';

// Data of Text node
export interface SuperscriptNodeData {}

// Text node
export interface SuperscriptNode extends Text, SuperscriptNodeData {}

// Type option
interface TypeOption {
  typeSubscript?: string;
  typeSuperscript?: string;
}

// renderLeaf options given as props
interface SuperscriptRenderLeafOptionsProps {}

// renderLeaf options
export interface SuperscriptRenderLeafOptions
  extends RenderLeafOptions,
    SuperscriptRenderLeafOptionsProps,
    TypeOption {}

// renderLeaf props
export interface SuperscriptRenderLeafProps
  extends RenderLeafProps,
    SuperscriptRenderLeafOptionsProps {
  leaf: SuperscriptNode;
}

// deserialize options
export interface SuperscriptDeserializeOptions extends TypeOption {}

// Plugin options
export interface SuperscriptPluginOptions
  extends MarkPluginOptions,
    SuperscriptRenderLeafOptions,
    SuperscriptDeserializeOptions {}
