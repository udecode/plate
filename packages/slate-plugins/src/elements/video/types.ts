import { RenderElementOptions } from 'element';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';

export const VIDEO = 'video';

// Data of Element node
export interface VideoNodeData {
  url: string;
}

// Element node
export interface VideoNode extends Element, VideoNodeData {}

// Option type
interface TypeOption {
  typeVideo?: string;
}

// deserialize options
export interface VideoDeserializeOptions extends TypeOption {}

// renderElement options given as props
interface VideoRenderElementOptionsProps {}

// renderElement options
export interface VideoRenderElementOptions
  extends RenderElementOptions,
    VideoRenderElementOptionsProps,
    TypeOption {}

// renderElement props
export interface VideoRenderElementProps
  extends RenderElementProps,
    VideoRenderElementOptionsProps {
  element: VideoNode;
}

// Plugin options
export interface VideoPluginOptions
  extends VideoRenderElementOptions,
    VideoDeserializeOptions {}
