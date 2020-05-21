import { RenderElementOptions } from 'element';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';

export const IMAGE = 'img';

export interface ImageNodeData {
  url: string;
  [key: string]: unknown;
}

// Node
export interface ImageNode extends Element, ImageNodeData {}

// Option type
interface TypeOption {
  typeImg?: string;
}

// deserialize options
export interface ImageDeserializeOptions extends TypeOption {}

// renderElement options given as props
interface ImageRenderElementOptionsProps {}

// renderElement options
export interface ImageRenderElementOptions
  extends RenderElementOptions,
    ImageRenderElementOptionsProps,
    TypeOption {}

// renderElement props
export interface ImageRenderElementProps
  extends RenderElementProps,
    ImageRenderElementOptionsProps {
  element: ImageNode;
}

// Plugin options
export interface ImagePluginOptions
  extends ImageRenderElementOptions,
    ImageDeserializeOptions {}

export interface WithImageOptions extends TypeOption {}
