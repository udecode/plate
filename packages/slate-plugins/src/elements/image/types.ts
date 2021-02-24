import {
  Deserialize,
  ElementWithAttributes,
  NodeToProps,
  RenderNodeOptions,
} from '@udecode/slate-plugins-common';

// Data of Element node
export interface ImageNodeData {
  url: string;
}
// Element node
export interface ImageNode extends ElementWithAttributes, ImageNodeData {}

export type ImageKeyOption = 'img';

// Plugin options
export type ImagePluginOptionsValues = RenderNodeOptions &
  NodeToProps<ImageNode> &
  Deserialize & {
    /**
     * An optional method that will upload the image to a server.
     * The method receives the base64 dataUrl of the uploaded image, and should return the URL of the uploaded image.
     */
    uploadImage?: (
      dataUrl: string | ArrayBuffer
    ) => Promise<string | ArrayBuffer> | string | ArrayBuffer;
  };
export type ImagePluginOptionsKeys = keyof ImagePluginOptionsValues;
export type ImagePluginOptions<
  Value extends ImagePluginOptionsKeys = ImagePluginOptionsKeys
> = Partial<Record<ImageKeyOption, Pick<ImagePluginOptionsValues, Value>>>;

// renderElement options
export type ImageRenderElementOptionsKeys = ImagePluginOptionsKeys;
export interface ImageRenderElementOptions
  extends ImagePluginOptions<ImageRenderElementOptionsKeys> {}

// deserialize options
export interface ImageDeserializeOptions
  extends ImagePluginOptions<'type' | 'rootProps' | 'deserialize'> {}
