import { RenderElementOptions } from 'element';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';

export const LINK = 'a';

// Data of Element node
export interface LinkNodeData {
  url: string;
}

// Element node
export interface LinkNode extends Element, LinkNodeData {}

// Option type
interface TypeOption {
  typeLink?: string;
}

// deserialize options
export interface LinkDeserializeOptions extends TypeOption {}

// renderElement options given as props
interface LinkRenderElementOptionsProps {}

// renderElement options
export interface LinkRenderElementOptions
  extends RenderElementOptions,
    LinkRenderElementOptionsProps,
    TypeOption {}

// renderElement props
export interface LinkRenderElementProps
  extends RenderElementProps,
    LinkRenderElementOptionsProps {
  element: LinkNode;
}

// Plugin options
export interface LinkPluginOptions
  extends LinkRenderElementOptions,
    LinkDeserializeOptions {}

export interface WithLinkOptions extends TypeOption {}
