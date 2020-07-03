import { RenderElementOptions } from '@udecode/core';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';

const ALIGN_LEFT = 'left';
const ALIGN_CENTER = 'center';
const ALIGN_RIGHT = 'right';

export { ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT };

// Element node
export interface AlignNode extends Element {}

// Type option
interface TypeOption {
  typeAlignLeft?: string;
  typeAlignRight?: string;
  typeAlignCenter?: string;
}

// deserialize options
export interface AlignDeserializeOptions extends TypeOption {}

// renderElement options given as props
interface AlignRenderElementOptionsProps {}

// renderElement options
export interface AlignRenderElementOptions
  extends RenderElementOptions,
    AlignRenderElementOptionsProps,
    TypeOption {}

// renderElement props
export interface AlignRenderElementProps
  extends RenderElementProps,
    AlignRenderElementOptionsProps {
  element: AlignNode;
}

// Plugin options
export interface AlignPluginOptions
  extends AlignRenderElementOptions,
    AlignDeserializeOptions {}
