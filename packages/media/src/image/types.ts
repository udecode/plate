import type { MediaPlugin, TMediaElement } from '../media/index';

export interface TImageElement extends TMediaElement {}

export interface ImagePlugin extends MediaPlugin {
  /** Disable url embed on insert data. */
  disableEmbedInsert?: boolean;

  /** Disable file upload on insert data. */
  disableUploadInsert?: boolean;

  /**
   * An optional method that will upload the image to a server. The method
   * receives the base64 dataUrl of the uploaded image, and should return the
   * URL of the uploaded image.
   */
  uploadImage?: (
    dataUrl: ArrayBuffer | string
  ) => ArrayBuffer | Promise<ArrayBuffer | string> | string;
}
