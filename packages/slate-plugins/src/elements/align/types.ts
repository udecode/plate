import { RenderElementOptions } from '@udecode/core';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';

export const ALIGN_LEFT = 'align_left';
export const ALIGN_CENTER = 'align_center';
export const ALIGN_RIGHT = 'align_right';

// Element node
export interface AlignNode extends Element {}

// Type option
export interface AlignTypeOption {
  typeAlignLeft?: string;
  typeAlignRight?: string;
  typeAlignCenter?: string;
}

// deserialize options
export interface AlignDeserializeOptions extends AlignTypeOption {}

// renderElement options given as props
interface AlignRenderElementOptionsProps extends AlignTypeOption {}

// renderElement options
export interface AlignRenderElementOptions
  extends RenderElementOptions,
    AlignRenderElementOptionsProps,
    AlignTypeOption {}

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
