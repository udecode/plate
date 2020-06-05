import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';
import { RenderElementOptions } from '../../element';

export const MEDIA_EMBED = 'media_embed';

// Data of Element node
export interface MediaEmbedNodeData {
  url: string;
}

// Element node
export interface MediaEmbedNode extends Element, MediaEmbedNodeData {}

// Type option
interface TypeOption {
  typeMediaEmbed?: string;
}

// deserialize options
export interface MediaEmbedDeserializeOptions extends TypeOption {}

// renderElement options given as props
interface MediaEmbedRenderElementOptionsProps {}

// renderElement options
export interface MediaEmbedRenderElementOptions
  extends RenderElementOptions,
    MediaEmbedRenderElementOptionsProps,
    TypeOption {}

// renderElement props
export interface MediaEmbedRenderElementProps
  extends RenderElementProps,
    MediaEmbedRenderElementOptionsProps {
  element: MediaEmbedNode;
}

// Plugin options
export interface MediaEmbedPluginOptions
  extends MediaEmbedRenderElementOptions,
    MediaEmbedDeserializeOptions {
  inlineTypes?: string[];
}
