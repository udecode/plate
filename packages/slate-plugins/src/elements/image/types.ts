import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';
import { RenderElementOptions } from '../../element';

export const IMAGE = 'img';

// Data of Element node
export interface ImageNodeData {
  url: string;
}

// Element node
export interface ImageNode extends Element, ImageNodeData {}

// Type option
export interface ImageTypeOption {
  typeImg?: string;
}

// deserialize options
export interface ImageDeserializeOptions extends ImageTypeOption {}

// renderElement options given as props
interface ImageRenderElementOptionsProps {}

// renderElement options
export interface ImageRenderElementOptions
  extends RenderElementOptions,
    ImageRenderElementOptionsProps,
    ImageTypeOption {}

// renderElement props
export interface ImageRenderElementProps
  extends RenderElementProps,
    ImageRenderElementOptionsProps {
  element: ImageNode;
}

// Plugin options
export interface ImagePluginOptions
  extends ImageRenderElementOptions,
    ImageDeserializeOptions {
  inlineTypes?: string[];
}
